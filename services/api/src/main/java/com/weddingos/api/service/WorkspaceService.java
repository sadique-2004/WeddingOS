package com.weddingos.api.service;

import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.*;
import com.weddingos.api.repository.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    private final JdbcTemplate jdbcTemplate;

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
                            CheckInLogRepository checkInLogRepository,
                            JdbcTemplate jdbcTemplate) {
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
        this.jdbcTemplate = jdbcTemplate;
    }

    @jakarta.annotation.PostConstruct
    public void ensureSchemaCompatibility() {
        if (jdbcTemplate != null) {
            try {
                jdbcTemplate.execute("ALTER TABLE weddings MODIFY COLUMN wedding_date DATE NULL");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE weddings MODIFY COLUMN bride_name VARCHAR(120) NULL");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE weddings MODIFY COLUMN groom_name VARCHAR(120) NULL");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE weddings MODIFY COLUMN city VARCHAR(120) NULL");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE preparation_tasks MODIFY COLUMN priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL'");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE preparation_tasks MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'TODO'");
            } catch (Exception ignored) {}
        }
    }

    /**
     * Loads a wedding by ID. Missing or unknown IDs are rejected; this never substitutes
     * another wedding (no "first wedding" / ID 1 fallback).
     */
    private Wedding requireWedding(Long weddingId) {
        if (weddingId == null) {
            throw new BadRequestException("weddingId is required.");
        }
        return weddingRepository.findById(weddingId)
                .orElseThrow(() -> new NotFoundException("Wedding not found: " + weddingId));
    }

    @Transactional
    public Map<String, Object> getActiveWorkspaceSummary(Long weddingId) {
        Wedding wedding = requireWedding(weddingId);

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

        long totalInvitations = invitationRepository.findByWeddingIdOrderByDisplayNameAsc(activeId).size();

        Map<String, Object> summary = new HashMap<>();
        summary.put("id", wedding.getId());
        summary.put("brideName", wedding.getBrideName() != null ? wedding.getBrideName() : "");
        summary.put("groomName", wedding.getGroomName() != null ? wedding.getGroomName() : "");
        LocalDate date = wedding.getWeddingDate();
        if (date != null && date.getYear() == 2099) {
            date = null;
        }
        summary.put("weddingDate", date);
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

    @Transactional
    public Map<String, Object> getWorkspaceForUser(String userEmail, String clerkUserId, String userName, Long requestedWeddingId) {
        if ((userEmail == null || userEmail.isBlank()) && (clerkUserId == null || clerkUserId.isBlank())) {
            throw new BadRequestException("A signed-in user identity is required to resolve the active workspace.");
        }

        AppUser user = null;
        if (clerkUserId != null && !clerkUserId.isBlank()) {
            user = userRepository.findByClerkUserId(clerkUserId.trim()).orElse(null);
        }
        if (user == null && userEmail != null && !userEmail.isBlank()) {
            user = userRepository.findByEmail(userEmail.trim().toLowerCase()).orElse(null);
        }

        if (user == null) {
            String safeEmail = (userEmail != null && !userEmail.isBlank())
                    ? userEmail.trim().toLowerCase()
                    : ("user_" + java.util.UUID.randomUUID().toString().substring(0, 8) + "@weddingos.app");
            String safeClerkId = (clerkUserId != null && !clerkUserId.isBlank())
                    ? clerkUserId.trim()
                    : ("clerk_" + java.util.UUID.randomUUID().toString().substring(0, 12));
            String safeName = (userName != null && !userName.isBlank())
                    ? userName.trim()
                    : safeEmail.split("@")[0];

            user = new AppUser(safeClerkId, safeEmail, safeName);
            user = userRepository.save(user);
        } else {
            boolean changed = false;
            if (clerkUserId != null && !clerkUserId.isBlank() && !clerkUserId.equals(user.getClerkUserId())) {
                user.setClerkUserId(clerkUserId.trim());
                changed = true;
            }
            if (userName != null && !userName.isBlank() && !userName.equals(user.getFullName())) {
                user.setFullName(userName.trim());
                changed = true;
            }
            if (changed) {
                user = userRepository.save(user);
            }
        }

        Wedding wedding = null;

        // If a specific wedding ID was requested, verify the user owns it or has membership
        if (requestedWeddingId != null && requestedWeddingId > 0) {
            var target = weddingRepository.findById(requestedWeddingId);
            if (target.isPresent()) {
                Wedding w = target.get();
                if ((w.getOwnerUser() != null && w.getOwnerUser().getId().equals(user.getId()))
                        || membershipRepository.findByWeddingIdAndUserId(w.getId(), user.getId()).isPresent()) {
                    wedding = w;
                }
            }
        }

        // Check if user owns any wedding
        if (wedding == null) {
            List<Wedding> owned = weddingRepository.findByOwnerUser_Id(user.getId());
            if (!owned.isEmpty()) {
                wedding = owned.get(owned.size() - 1);
            }
        }

        // Check if user is an invited member of a wedding
        if (wedding == null) {
            List<WeddingMembership> memberships = membershipRepository.findByUserId(user.getId());
            if (!memberships.isEmpty()) {
                wedding = memberships.get(memberships.size() - 1).getWedding();
            }
        }

        // If user has no workspace yet, provision a brand new isolated wedding workspace for them
        if (wedding == null) {
            wedding = new Wedding();
            wedding.setOwnerUser(user);
            wedding.setBrideName("");
            wedding.setGroomName("");
            wedding.setWeddingDate(null);
            wedding.setCity("");
            wedding.setVenueName("");
            wedding.setTotalBudgetTarget(BigDecimal.ZERO);
            wedding.setExpectedGuestCapacity(0);
            wedding = weddingRepository.save(wedding);

            WeddingSlug slug = new WeddingSlug();
            slug.setWedding(wedding);
            slug.setSlug("wedding-" + wedding.getId());
            slug.setIsActive(true);
            slugRepository.save(slug);

            WeddingMembership ownerMembership = new WeddingMembership();
            ownerMembership.setWedding(wedding);
            ownerMembership.setUser(user);
            ownerMembership.setRole(WeddingMembership.Role.ADMIN);
            ownerMembership.setTitle("Host & Primary Admin");
            ownerMembership.setCanManageEvents(true);
            ownerMembership.setCanManageTasks(true);
            ownerMembership.setCanManageGuests(true);
            ownerMembership.setCanCheckInGuests(true);
            ownerMembership.setCanManageExpenses(true);
            ownerMembership.setCanManageVendors(true);
            ownerMembership.setCanManageWebsite(true);
            ownerMembership.setCanModerateGallery(true);
            membershipRepository.save(ownerMembership);
        }

        return getActiveWorkspaceSummary(wedding.getId());
    }

    public Wedding updateBudgetTarget(Long weddingId, BigDecimal newBudgetTarget) {
        Wedding wedding = requireWedding(weddingId);
        wedding.setTotalBudgetTarget(newBudgetTarget != null ? newBudgetTarget : BigDecimal.ZERO);
        return weddingRepository.save(wedding);
    }

    public Wedding updateWeddingDetails(Long weddingId, String brideName, String groomName, LocalDate weddingDate, String city, String venueName, String slug) {
        Wedding wedding = requireWedding(weddingId);

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

    /**
     * Resolves the workspace owner from an explicit user ID or the caller's identity headers.
     * Never defaults to user ID 1 or "the first user".
     */
    private AppUser resolveOwner(Long ownerUserId, String ownerEmail, String ownerClerkUserId) {
        if (ownerUserId != null) {
            return userRepository.findById(ownerUserId)
                    .orElseThrow(() -> new NotFoundException("Owner user not found: " + ownerUserId));
        }
        Optional<AppUser> byIdentity = Optional.empty();
        if (ownerClerkUserId != null && !ownerClerkUserId.isBlank()) {
            byIdentity = userRepository.findByClerkUserId(ownerClerkUserId.trim());
        }
        if (byIdentity.isEmpty() && ownerEmail != null && !ownerEmail.isBlank()) {
            byIdentity = userRepository.findByEmail(ownerEmail.trim().toLowerCase());
        }
        if (byIdentity.isPresent()) {
            return byIdentity.get();
        }
        if ((ownerEmail == null || ownerEmail.isBlank()) && (ownerClerkUserId == null || ownerClerkUserId.isBlank())) {
            throw new BadRequestException("An owner is required: provide ownerUserId or a signed-in user identity.");
        }
        throw new NotFoundException("Owner user not found for the supplied identity.");
    }

    public Wedding createWorkspace(Long ownerUserId, String ownerEmail, String ownerClerkUserId, String brideName, String groomName, LocalDate weddingDate, String city, String venueName, BigDecimal totalBudget, String slug) {
        AppUser owner = resolveOwner(ownerUserId, ownerEmail, ownerClerkUserId);

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
        // NOTE: the HTTP reset endpoints are currently disabled (see WorkspaceController).
        Wedding wedding = requireWedding(weddingId);

        Long activeId = wedding.getId();

        // 1. Delete all check-in logs first (foreign key to invitations)
        var logs = checkInLogRepository.findByWeddingIdOrderByScannedAtDesc(activeId);
        checkInLogRepository.deleteAll(logs);

        // 2. Delete all expenses (foreign key to events and vendors)
        var expenses = expenseRepository.findByWeddingIdOrderByExpenseDateDesc(activeId);
        expenseRepository.deleteAll(expenses);

        // 3. Delete all tasks
        var tasks = taskRepository.findByWeddingIdOrderByCreatedAtDesc(activeId);
        taskRepository.deleteAll(tasks);

        // 4. Delete all related events (now clear to delete)
        var events = eventRepository.findByWeddingIdOrderByEventDateAscSequenceOrderAsc(activeId);
        eventRepository.deleteAll(events);

        // 5. Delete all vendors (now clear to delete)
        var vendors = vendorRepository.findByWeddingIdOrderByBusinessNameAsc(activeId);
        vendorRepository.deleteAll(vendors);

        // 6. Delete all invitations (now clear to delete)
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

        // 9. Delete all leftover memberships (clean slate)
        var memberships = membershipRepository.findByWeddingId(activeId);
        membershipRepository.deleteAll(memberships);

        wedding.setBrideName("");
        wedding.setGroomName("");
        wedding.setCity("");
        wedding.setVenueName("");
        wedding.setTotalBudgetTarget(BigDecimal.ZERO);
        wedding.setExpectedGuestCapacity(0);
        try {
            wedding.setWeddingDate(null);
            weddingRepository.saveAndFlush(wedding);
        } catch (Exception e) {
            wedding.setWeddingDate(LocalDate.of(2099, 1, 1));
            weddingRepository.saveAndFlush(wedding);
        }

        // 10. Reset slug to clean default
        slugRepository.findByWeddingId(activeId).ifPresent(ws -> {
            ws.setSlug("wedding-" + activeId);
            slugRepository.save(ws);
        });

        return getActiveWorkspaceSummary(activeId);
    }
}
