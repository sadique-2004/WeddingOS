package com.weddingos.api.service;

import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.weddingos.api.model.AppUser;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.model.WeddingMembership;
import com.weddingos.api.repository.AppUserRepository;
import com.weddingos.api.repository.WeddingMembershipRepository;
import com.weddingos.api.security.WeddingAccessService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static com.weddingos.api.security.WeddingAccessService.weddingIdOf;

/**
 * Team membership. Any member may view the roster; only wedding ADMINs (or the owner) may invite,
 * change roles/permissions or remove members, so an organizer can never grant themselves access.
 */
@Service
@Transactional
public class MemberService {

    private final WeddingMembershipRepository membershipRepository;
    private final AppUserRepository userRepository;
    private final WeddingAccessService access;

    public MemberService(WeddingMembershipRepository membershipRepository,
                         AppUserRepository userRepository,
                         WeddingAccessService access) {
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.access = access;
    }

    @Transactional(readOnly = true)
    public List<WeddingMembership> getMembers(Long weddingId) {
        access.requireMember(weddingId);
        return membershipRepository.findByWeddingId(weddingId);
    }

    /**
     * Adds a member by email. If no user has that email yet, a placeholder user is created
     * ({@code clerk_invited_...}); it is linked to the person's Clerk account the first time they
     * sign in with that verified email.
     */
    public WeddingMembership inviteMember(Long weddingId, String fullName, String email, WeddingMembership.Role role, String title) {
        Wedding wedding = access.requireAdmin(weddingId).wedding();
        if (email == null || email.isBlank() || !email.contains("@")) {
            throw new BadRequestException("A valid email address is required.");
        }
        String normalizedEmail = email.trim().toLowerCase();
        String name = fullName != null && !fullName.isBlank() ? fullName.trim() : normalizedEmail.split("@")[0];

        List<AppUser> matches = userRepository.findAllByEmailIgnoreCase(normalizedEmail);
        AppUser user = matches.size() == 1 ? matches.get(0) : null;
        if (matches.size() > 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "More than one account uses this email. Please contact support.");
        }
        if (user == null) {
            user = userRepository.save(new AppUser("clerk_invited_" + UUID.randomUUID().toString().replace("-", ""), normalizedEmail, name));
        }
        if (membershipRepository.findByWeddingIdAndUserId(wedding.getId(), user.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This person is already a member of the wedding.");
        }

        WeddingMembership membership = new WeddingMembership();
        membership.setWedding(wedding);
        membership.setUser(user);
        membership.setRole(role);
        membership.setTitle(title);

        if (role == WeddingMembership.Role.ADMIN) {
            membership.setCanManageEvents(true);
            membership.setCanManageTasks(true);
            membership.setCanManageGuests(true);
            membership.setCanCheckInGuests(true);
            membership.setCanManageExpenses(true);
            membership.setCanManageVendors(true);
            membership.setCanManageWebsite(true);
            membership.setCanModerateGallery(true);
        }

        return membershipRepository.save(membership);
    }

    public WeddingMembership updatePermissions(Long membershipId, WeddingMembership permissions) {
        WeddingMembership existing = loadForAdmin(membershipId);

        if (permissions.getCanManageEvents() != null) existing.setCanManageEvents(permissions.getCanManageEvents());
        if (permissions.getCanManageTasks() != null) existing.setCanManageTasks(permissions.getCanManageTasks());
        if (permissions.getCanManageGuests() != null) existing.setCanManageGuests(permissions.getCanManageGuests());
        if (permissions.getCanCheckInGuests() != null) existing.setCanCheckInGuests(permissions.getCanCheckInGuests());
        if (permissions.getCanManageExpenses() != null) existing.setCanManageExpenses(permissions.getCanManageExpenses());
        if (permissions.getCanManageVendors() != null) existing.setCanManageVendors(permissions.getCanManageVendors());
        if (permissions.getCanManageWebsite() != null) existing.setCanManageWebsite(permissions.getCanManageWebsite());
        if (permissions.getCanModerateGallery() != null) existing.setCanModerateGallery(permissions.getCanModerateGallery());

        return membershipRepository.save(existing);
    }

    public WeddingMembership updateRole(Long membershipId, WeddingMembership.Role newRole) {
        WeddingMembership existing = loadForAdmin(membershipId);

        // Enforce FR-MEM-06: Protect last admin
        if (existing.getRole() == WeddingMembership.Role.ADMIN && newRole != WeddingMembership.Role.ADMIN) {
            long adminCount = membershipRepository.countByWeddingIdAndRole(existing.getWedding().getId(), WeddingMembership.Role.ADMIN);
            if (adminCount <= 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Security invariant (FR-MEM-06): Cannot demote the last remaining ADMIN in the workspace.");
            }
        }

        existing.setRole(newRole);
        if (newRole == WeddingMembership.Role.ADMIN) {
            existing.setCanManageEvents(true);
            existing.setCanManageTasks(true);
            existing.setCanManageGuests(true);
            existing.setCanCheckInGuests(true);
            existing.setCanManageExpenses(true);
            existing.setCanManageVendors(true);
            existing.setCanManageWebsite(true);
            existing.setCanModerateGallery(true);
        }

        return membershipRepository.save(existing);
    }

    public void removeMember(Long membershipId) {
        WeddingMembership existing = loadForAdmin(membershipId);

        // Enforce FR-MEM-06: Protect last admin
        if (existing.getRole() == WeddingMembership.Role.ADMIN) {
            long adminCount = membershipRepository.countByWeddingIdAndRole(existing.getWedding().getId(), WeddingMembership.Role.ADMIN);
            if (adminCount <= 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Security invariant (FR-MEM-06): Cannot remove the last remaining ADMIN in the workspace.");
            }
        }

        membershipRepository.delete(existing);
    }

    /** Loads a membership and requires the caller to be an ADMIN of the wedding it belongs to. */
    private WeddingMembership loadForAdmin(Long membershipId) {
        WeddingMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new NotFoundException("Membership not found: " + membershipId));
        access.requireAdmin(weddingIdOf(membership.getWedding()));
        return membership;
    }
}
