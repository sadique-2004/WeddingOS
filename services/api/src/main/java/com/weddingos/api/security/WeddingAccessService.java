package com.weddingos.api.security;

import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.ForbiddenException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.AppUser;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.model.WeddingMembership;
import com.weddingos.api.repository.WeddingMembershipRepository;
import com.weddingos.api.repository.WeddingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;

/**
 * Central wedding-level authorization. Every private service operation calls one of these methods
 * with the wedding that owns the data being read or changed (for ID-based routes, the wedding of the
 * loaded record — never a client-supplied wedding ID alone).
 * <ul>
 *   <li>no authenticated identity: 401</li>
 *   <li>missing wedding ID: 400; unknown wedding: 404</li>
 *   <li>not the owner and no membership: 403</li>
 *   <li>owner or ADMIN membership: full access</li>
 *   <li>ORGANIZER: only modules whose flag is enabled; never admin operations</li>
 * </ul>
 */
@Service
@Transactional
public class WeddingAccessService {

    private final CurrentUserService currentUserService;
    private final WeddingRepository weddingRepository;
    private final WeddingMembershipRepository membershipRepository;

    public WeddingAccessService(CurrentUserService currentUserService,
                                WeddingRepository weddingRepository,
                                WeddingMembershipRepository membershipRepository) {
        this.currentUserService = currentUserService;
        this.weddingRepository = weddingRepository;
        this.membershipRepository = membershipRepository;
    }

    /** Effective access of the current user to one wedding. */
    public record WeddingAccess(AppUser user, Wedding wedding, WeddingMembership membership, boolean admin) {
        public boolean can(WeddingModule module) {
            return admin || module.grantedBy(membership);
        }
    }

    public AppUser currentUser() {
        return currentUserService.requireCurrentUser();
    }

    public WeddingAccess requireMember(Long weddingId) {
        // Resolve identity first so unauthenticated callers learn nothing about wedding IDs.
        AppUser user = currentUserService.requireCurrentUser();
        if (weddingId == null) {
            throw new BadRequestException("weddingId is required.");
        }
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new NotFoundException("Wedding not found: " + weddingId));

        boolean owner = wedding.getOwnerUser() != null && Objects.equals(wedding.getOwnerUser().getId(), user.getId());
        Optional<WeddingMembership> membership = membershipRepository.findByWeddingIdAndUserId(wedding.getId(), user.getId());
        if (!owner && membership.isEmpty()) {
            throw new ForbiddenException("You do not have access to this wedding.");
        }
        boolean admin = owner || membership.get().getRole() == WeddingMembership.Role.ADMIN;
        return new WeddingAccess(user, wedding, membership.orElse(null), admin);
    }

    public WeddingAccess require(Long weddingId, WeddingModule module) {
        WeddingAccess access = requireMember(weddingId);
        if (!access.can(module)) {
            throw new ForbiddenException("You do not have permission for " + module.name().toLowerCase().replace('_', '-') + " in this wedding.");
        }
        return access;
    }

    public WeddingAccess requireAdmin(Long weddingId) {
        WeddingAccess access = requireMember(weddingId);
        if (!access.admin()) {
            throw new ForbiddenException("Only wedding admins can perform this action.");
        }
        return access;
    }

    /** ID of the wedding a loaded record belongs to (works on lazy proxies without initializing them). */
    public static Long weddingIdOf(Wedding wedding) {
        if (wedding == null || wedding.getId() == null) {
            throw new NotFoundException("Record is not attached to a wedding.");
        }
        return wedding.getId();
    }
}
