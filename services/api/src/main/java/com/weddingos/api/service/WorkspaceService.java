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

    @Transactional(readOnly = true)
    public Map<String, Object> getActiveWorkspaceSummary(Long weddingId) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new IllegalArgumentException("Wedding workspace not found with ID: " + weddingId));

        String slug = slugRepository.findByWeddingId(weddingId)
                .map(WeddingSlug::getSlug)
                .orElse("ananya-kabir");

        BigDecimal totalBudget = wedding.getTotalBudgetTarget();
        BigDecimal totalSpent = expenseRepository.sumTotalRecorded(weddingId);
        BigDecimal totalPaid = expenseRepository.sumTotalPaid(weddingId);
        BigDecimal totalAdvancePaid = expenseRepository.sumTotalAdvancePaid(weddingId);
        BigDecimal totalPendingDues = expenseRepository.sumTotalPending(weddingId);
        BigDecimal remainingBudget = totalBudget.subtract(totalSpent);

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
        summary.put("totalRecordedSpending", totalSpent);
        summary.put("totalPaid", totalPaid.add(totalAdvancePaid));
        summary.put("totalPendingDues", totalPendingDues);
        summary.put("remainingRunway", remainingBudget);
        summary.put("expectedGuestCapacity", wedding.getExpectedGuestCapacity());
        summary.put("totalInvitationsCount", totalInvitations);
        summary.put("currencyCode", wedding.getCurrencyCode());

        return summary;
    }

    public Wedding updateBudgetTarget(Long weddingId, BigDecimal newBudgetTarget) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new IllegalArgumentException("Wedding not found: " + weddingId));
        wedding.setTotalBudgetTarget(newBudgetTarget);
        return weddingRepository.save(wedding);
    }

    public Wedding updateWeddingDetails(Long weddingId, String brideName, String groomName, LocalDate weddingDate, String city, String venueName) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new IllegalArgumentException("Wedding not found: " + weddingId));
        if (brideName != null) wedding.setBrideName(brideName);
        if (groomName != null) wedding.setGroomName(groomName);
        if (weddingDate != null) wedding.setWeddingDate(weddingDate);
        if (city != null) wedding.setCity(city);
        if (venueName != null) wedding.setVenueName(venueName);
        return weddingRepository.save(wedding);
    }
}
