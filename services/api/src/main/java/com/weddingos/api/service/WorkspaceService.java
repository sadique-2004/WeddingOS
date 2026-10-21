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
    private final WeddingEventRepository eventRepository;
    private final PreparationTaskRepository taskRepository;
    private final VendorContactRepository vendorRepository;
    private final GalleryPhotoRepository galleryPhotoRepository;
    private final WeddingWebsiteRepository websiteRepository;
    private final CheckInLogRepository checkInLogRepository;

    public WorkspaceService(WeddingRepository weddingRepository,
                            WeddingSlugRepository slugRepository,
                            AppUserRepository userRepository,
                            WeddingMembershipRepository membershipRepository,
                            ExpenseRepository expenseRepository,
                            FamilyInvitationRepository invitationRepository,
                            WeddingEventRepository eventRepository,
                            PreparationTaskRepository taskRepository,
                            VendorContactRepository vendorRepository,
                            GalleryPhotoRepository galleryPhotoRepository,
                            WeddingWebsiteRepository websiteRepository,
                            CheckInLogRepository checkInLogRepository) {
        this.weddingRepository = weddingRepository;
        this.slugRepository = slugRepository;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
        this.expenseRepository = expenseRepository;
        this.invitationRepository = invitationRepository;
        this.eventRepository = eventRepository;
        this.taskRepository = taskRepository;
        this.vendorRepository = vendorRepository;
        this.galleryPhotoRepository = galleryPhotoRepository;
        this.websiteRepository = websiteRepository;
        this.checkInLogRepository = checkInLogRepository;
    }

    @Transactional
    public Map<String, Object> getActiveWorkspaceSummary(Long weddingId) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseGet(() -> weddingRepository.findAll().stream().findFirst().orElseGet(() -> {
                    Wedding w = new Wedding();
                    w.setBrideName("");
                    w.setGroomName("");
                    w.setWeddingDate(null);
                    w.setCity("");
                    w.setVenueName("");
                    w.setTotalBudgetTarget(BigDecimal.ZERO);
                    Wedding savedW = weddingRepository.save(w);

                    WeddingSlug ws = new WeddingSlug();
                    ws.setWedding(savedW);
                    ws.setSlug("wedding-" + savedW.getId());
                    ws.setIsActive(true);
                    slugRepository.save(ws);

                    return savedW;
                }));

        Long activeId = wedding.getId();
        String slug = slugRepository.findByWeddingId(activeId)
                .map(WeddingSlug::getSlug)
                .orElse("wedding-" + activeId);

        BigDecimal totalBudget = wedding.getTotalBudgetTarget() != null ? wedding.getTotalBudgetTarget() : BigDecimal.ZERO;
        BigDecimal totalSpent = expenseRepository.sumTotalRecorded(activeId);
        BigDecimal totalPaid = expenseRepository.sumTotalPaid(activeId);
        BigDecimal totalAdvancePaid = expenseRepository.sumTotalAdvancePaid(activeId);
        BigDecimal totalPendingDues = expenseRepository.sumTotalPending(activeId);
        BigDecimal remainingBudget = totalBudget.subtract(totalSpent != null ? totalSpent : BigDecimal.ZERO);

        long totalInvitations = invitationRepository.count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("id", wedding.getId());
        summary.put("brideName", wedding.getBrideName() != null ? wedding.getBrideName() : "");
        summary.put("groomName", wedding.getGroomName() != null ? wedding.getGroomName() : "");
        summary.put("weddingDate", wedding.getWeddingDate());
        summary.put("city", wedding.getCity() != null ? wedding.getCity() : "");
        summary.put("venueName", wedding.getVenueName() != null ? wedding.getVenueName() : "");
        summary.put("slug", slug);
        summary.put("totalBudgetTarget", totalBudget);
        summary.put("totalRecordedSpending", totalSpent != null ? totalSpent : BigDecimal.ZERO);
        summary.put("totalPaid", (totalPaid != null ? totalPaid : BigDecimal.ZERO).add(totalAdvancePaid != null ? totalAdvancePaid : BigDecimal.ZERO));
        summary.put("totalPendingDues", totalPendingDues != null ? totalPendingDues : BigDecimal.ZERO);
        summary.put("remainingRunway", remainingBudget);
        summary.put("expectedGuestCapacity", wedding.getExpectedGuestCapacity() != null ? wedding.getExpectedGuestCapacity() : 0);
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
                    w.setBrideName(brideName != null ? brideName : "");
                    w.setGroomName(groomName != null ? groomName : "");
                    w.setWeddingDate(weddingDate);
                    w.setCity(city != null ? city : "");
                    w.setVenueName(venueName != null ? venueName : "");
                    w.setTotalBudgetTarget(BigDecimal.ZERO);
                    return weddingRepository.save(w);
                }));

        if (brideName != null) wedding.setBrideName(brideName.trim());
        if (groomName != null) wedding.setGroomName(groomName.trim());
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
        wedding.setBrideName(brideName != null ? brideName : "");
        wedding.setGroomName(groomName != null ? groomName : "");
        wedding.setWeddingDate(weddingDate);
        wedding.setCity(city != null ? city : "");
        wedding.setVenueName(venueName != null ? venueName : "");
        wedding.setTotalBudgetTarget(totalBudget != null ? totalBudget : BigDecimal.ZERO);
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

    @Transactional
    public Map<String, Object> resetWorkspaceData(Long weddingId) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseGet(() -> weddingRepository.findAll().stream().findFirst().orElseGet(() -> {
                    Wedding w = new Wedding();
                    w.setBrideName("");
                    w.setGroomName("");
                    w.setCity("");
                    w.setVenueName("");
                    w.setTotalBudgetTarget(BigDecimal.ZERO);
                    return weddingRepository.save(w);
                }));

        Long activeId = wedding.getId();

        // 1. Delete all related events
        var events = eventRepository.findByWeddingIdOrderByEventDateAscSequenceOrderAsc(activeId);
        eventRepository.deleteAll(events);

        // 2. Delete all tasks
        var tasks = taskRepository.findByWeddingIdOrderByCreatedAtDesc(activeId);
        taskRepository.deleteAll(tasks);

        // 3. Delete all expenses
        var expenses = expenseRepository.findByWeddingIdOrderByExpenseDateDesc(activeId);
        expenseRepository.deleteAll(expenses);

        // 4. Delete all vendors
        var vendors = vendorRepository.findByWeddingIdOrderByBusinessNameAsc(activeId);
        vendorRepository.deleteAll(vendors);

        // 5. Delete all check-in logs
        var logs = checkInLogRepository.findByWeddingIdOrderByScannedAtDesc(activeId);
        checkInLogRepository.deleteAll(logs);

        // 6. Delete all invitations
        var invitations = invitationRepository.findByWeddingIdOrderByDisplayNameAsc(activeId);
        invitationRepository.deleteAll(invitations);

        // 7. Delete all gallery photos
        var photos = galleryPhotoRepository.findByWeddingIdOrderByUploadedAtDesc(activeId);
        galleryPhotoRepository.deleteAll(photos);

        // 8. Reset website config
        websiteRepository.findByWeddingId(activeId).ifPresent(site -> {
            site.setWelcomeHeadline("");
            site.setWelcomeMessage("");
            site.setIsPublished(false);
            websiteRepository.save(site);
        });

        // 9. Reset wedding couple details
        wedding.setBrideName("");
        wedding.setGroomName("");
        wedding.setWeddingDate(null);
        wedding.setCity("");
        wedding.setVenueName("");
        wedding.setTotalBudgetTarget(BigDecimal.ZERO);
        wedding.setExpectedGuestCapacity(0);
        weddingRepository.save(wedding);

        // 10. Reset slug to clean default
        slugRepository.findByWeddingId(activeId).ifPresent(ws -> {
            ws.setSlug("wedding-" + activeId);
            slugRepository.save(ws);
        });

        return getActiveWorkspaceSummary(activeId);
    }
}
