package com.weddingos.api.service;

import com.weddingos.api.model.*;
import com.weddingos.api.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class WorkspaceService {

    private final WeddingRepository weddingRepository;
    private final WeddingSlugRepository slugRepository;
    private final AppUserRepository userRepository;
    private final WeddingMembershipRepository membershipRepository;
    private final ExpenseRepository expenseRepository;
    private final FamilyInvitationRepository invitationRepository;

    public WorkspaceService(WeddingRepository weddingRepository,
                            WeddingSlugRepository slugRepository,
                            AppUserRepository userRepository,
                            WeddingMembershipRepository membershipRepository,
                            ExpenseRepository expenseRepository,
                            FamilyInvitationRepository invitationRepository) {
        this.weddingRepository = weddingRepository;
        this.slugRepository = slugRepository;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
        this.expenseRepository = expenseRepository;
        this.invitationRepository = invitationRepository;
    }

    @Transactional
    public Map<String, Object> getActiveWorkspaceSummary(Long weddingId) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseGet(() -> weddingRepository.findAll().stream().findFirst().orElseGet(() -> {
                    Wedding w = new Wedding();
                    w.setBrideName("Aisha");
                    w.setGroomName("Imran");
                    w.setWeddingDate(LocalDate.now().plusMonths(4));
                    w.setCity("Udaipur, Rajasthan");
                    w.setVenueName("The Oberoi Udaivilas");
                    w.setTotalBudgetTarget(new BigDecimal("2500000.00"));
                    Wedding savedW = weddingRepository.save(w);

                    WeddingSlug ws = new WeddingSlug();
                    ws.setWedding(savedW);
                    ws.setSlug("aisha-and-imran");
                    ws.setIsActive(true);
                    slugRepository.save(ws);

                    return savedW;
                }));

        Long activeId = wedding.getId();
        String slug = slugRepository.findByWeddingId(activeId)
                .map(WeddingSlug::getSlug)
                .orElse("aisha-and-imran");

        BigDecimal totalBudget = wedding.getTotalBudgetTarget() != null ? wedding.getTotalBudgetTarget() : new BigDecimal("2500000.00");
        BigDecimal totalSpent = expenseRepository.sumTotalRecorded(activeId);
        BigDecimal totalPaid = expenseRepository.sumTotalPaid(activeId);
        BigDecimal totalAdvancePaid = expenseRepository.sumTotalAdvancePaid(activeId);
        BigDecimal totalPendingDues = expenseRepository.sumTotalPending(activeId);
        BigDecimal remainingBudget = totalBudget.subtract(totalSpent != null ? totalSpent : BigDecimal.ZERO);

        long totalInvitations = invitationRepository.count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("id", wedding.getId());
        summary.put("brideName", wedding.getBrideName());
        summary.put("groomName", wedding.getGroomName());
        summary.put("weddingDate", wedding.getWeddingDate());
        summary.put("city", wedding.getCity());
        summary.put("venueName", wedding.getVenueName());
        summary.put("slug", slug);
        summary.put("totalBudgetTarget", totalBudget);
        summary.put("totalRecordedSpending", totalSpent != null ? totalSpent : BigDecimal.ZERO);
        summary.put("totalPaid", (totalPaid != null ? totalPaid : BigDecimal.ZERO).add(totalAdvancePaid != null ? totalAdvancePaid : BigDecimal.ZERO));
        summary.put("totalPendingDues", totalPendingDues != null ? totalPendingDues : BigDecimal.ZERO);
        summary.put("remainingRunway", remainingBudget);
        summary.put("expectedGuestCapacity", wedding.getExpectedGuestCapacity());
        summary.put("totalInvitationsCount", totalInvitations);
        summary.put("currencyCode", wedding.getCurrencyCode() != null ? wedding.getCurrencyCode() : "INR");

        return summary;
    }

    public Wedding updateBudgetTarget(Long weddingId, BigDecimal newBudgetTarget) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseGet(() -> weddingRepository.findAll().stream().findFirst().orElseThrow());
        wedding.setTotalBudgetTarget(newBudgetTarget);
        return weddingRepository.save(wedding);
    }

    public Wedding updateWeddingDetails(Long weddingId, String brideName, String groomName, LocalDate weddingDate, String city, String venueName, String slug) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseGet(() -> weddingRepository.findAll().stream().findFirst().orElseGet(() -> {
                    Wedding w = new Wedding();
                    w.setBrideName(brideName != null ? brideName : "Aisha");
                    w.setGroomName(groomName != null ? groomName : "Imran");
                    w.setWeddingDate(weddingDate != null ? weddingDate : LocalDate.now().plusMonths(4));
                    w.setCity(city != null ? city : "Udaipur, Rajasthan");
                    w.setVenueName(venueName != null ? venueName : "The Oberoi Udaivilas");
                    w.setTotalBudgetTarget(new BigDecimal("2500000.00"));
                    return weddingRepository.save(w);
                }));

        if (brideName != null && !brideName.trim().isEmpty()) wedding.setBrideName(brideName.trim());
        if (groomName != null && !groomName.trim().isEmpty()) wedding.setGroomName(groomName.trim());
        if (weddingDate != null) wedding.setWeddingDate(weddingDate);
        if (city != null) wedding.setCity(city.trim());
        if (venueName != null) wedding.setVenueName(venueName.trim());
        Wedding saved = weddingRepository.save(wedding);

        if (slug != null && !slug.trim().isEmpty()) {
            String cleanSlug = slug.trim().toLowerCase().replaceAll("[^a-z0-9-]", "-");
            WeddingSlug existingSlug = slugRepository.findByWeddingId(saved.getId()).orElse(null);
            if (existingSlug != null) {
                existingSlug.setSlug(cleanSlug);
                existingSlug.setIsActive(true);
                slugRepository.save(existingSlug);
            } else {
                WeddingSlug newSlug = new WeddingSlug();
                newSlug.setWedding(saved);
                newSlug.setSlug(cleanSlug);
                newSlug.setIsActive(true);
                slugRepository.save(newSlug);
            }
        }

        return saved;
    }

    public Wedding createWorkspace(Long ownerUserId, String brideName, String groomName, LocalDate weddingDate, String city, String venueName, BigDecimal totalBudget, String slug) {
        AppUser owner = userRepository.findById(ownerUserId != null ? ownerUserId : 1L)
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElseThrow());

        Wedding wedding = new Wedding();
        wedding.setOwnerUser(owner);
        wedding.setBrideName(brideName != null ? brideName : "Aisha");
        wedding.setGroomName(groomName != null ? groomName : "Imran");
        wedding.setWeddingDate(weddingDate != null ? weddingDate : LocalDate.now().plusMonths(6));
        wedding.setCity(city != null ? city : "Udaipur, Rajasthan");
        wedding.setVenueName(venueName != null ? venueName : "The Royal Palace");
        if (totalBudget != null) wedding.setTotalBudgetTarget(totalBudget);
        Wedding saved = weddingRepository.save(wedding);

        if (slug != null && !slug.isBlank()) {
            WeddingSlug weddingSlug = new WeddingSlug();
            weddingSlug.setWedding(saved);
            weddingSlug.setSlug(slug.trim().toLowerCase().replaceAll("[^a-z0-9-]", "-"));
            weddingSlug.setIsActive(true);
            slugRepository.save(weddingSlug);
        }

        // Auto-provision initial Admin membership
        WeddingMembership membership = new WeddingMembership();
        membership.setWedding(saved);
        membership.setUser(owner);
        membership.setRole(WeddingMembership.Role.ADMIN);
        membership.setTitle("Workspace Owner & Admin");
        membershipRepository.save(membership);

        return saved;
    }
}
