package com.weddingos.api.service;

import com.weddingos.api.model.AppUser;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.model.WeddingMembership;
import com.weddingos.api.repository.AppUserRepository;
import com.weddingos.api.repository.WeddingMembershipRepository;
import com.weddingos.api.repository.WeddingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MemberService {

    private final WeddingMembershipRepository membershipRepository;
    private final WeddingRepository weddingRepository;
    private final AppUserRepository userRepository;

    public MemberService(WeddingMembershipRepository membershipRepository,
                         WeddingRepository weddingRepository,
                         AppUserRepository userRepository) {
        this.membershipRepository = membershipRepository;
        this.weddingRepository = weddingRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<WeddingMembership> getMembers(Long weddingId) {
        return membershipRepository.findByWeddingId(weddingId);
    }

    public WeddingMembership inviteMember(Long weddingId, String fullName, String email, WeddingMembership.Role role, String title) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new IllegalArgumentException("Wedding not found: " + weddingId));

        AppUser user = userRepository.findByEmail(email).orElseGet(() -> {
            AppUser newUser = new AppUser("clerk_invited_" + UUID.randomUUID().toString().substring(0, 8), email, fullName);
            return userRepository.save(newUser);
        });

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
        WeddingMembership existing = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found: " + membershipId));

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
        WeddingMembership existing = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found: " + membershipId));

        // Enforce FR-MEM-06: Protect last admin
        if (existing.getRole() == WeddingMembership.Role.ADMIN && newRole != WeddingMembership.Role.ADMIN) {
            long adminCount = membershipRepository.countByWeddingIdAndRole(existing.getWedding().getId(), WeddingMembership.Role.ADMIN);
            if (adminCount <= 1) {
                throw new IllegalStateException("Security invariant (FR-MEM-06): Cannot demote the last remaining ADMIN in the workspace.");
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
        WeddingMembership existing = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found: " + membershipId));

        // Enforce FR-MEM-06: Protect last admin
        if (existing.getRole() == WeddingMembership.Role.ADMIN) {
            long adminCount = membershipRepository.countByWeddingIdAndRole(existing.getWedding().getId(), WeddingMembership.Role.ADMIN);
            if (adminCount <= 1) {
                throw new IllegalStateException("Security invariant (FR-MEM-06): Cannot remove the last remaining ADMIN in the workspace.");
            }
        }

        membershipRepository.deleteById(membershipId);
    }
}
