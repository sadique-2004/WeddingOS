package com.weddingos.api.service;

import com.weddingos.api.model.*;
import com.weddingos.api.repository.*;
import com.weddingos.api.security.WeddingAccessService;
import com.weddingos.api.security.WeddingAccessService.WeddingAccess;
import com.weddingos.api.security.WeddingModule;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
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
    private final JdbcTemplate jdbcTemplate;
    private final WeddingAccessService access;

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
                            JdbcTemplate jdbcTemplate,
                            WeddingAccessService access) {
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
        this.access = access;
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

    /** Workspace summary for a wedding the current user belongs to (403 otherwise). */
    @Transactional
    public Map<String, Object> getActiveWorkspaceSummary(Long weddingId) {
        return summaryFor(access.requireMember(weddingId));
    }

    private Map<String, Object> summaryFor(WeddingAccess granted) {
        Wedding wedding = granted.wedding();
        Long activeId = wedding.getId();
        String slug = slugRepository.findByWeddingId(activeId)
                .map(WeddingSlug::getSlug)
                .orElse("wedding-" + activeId);

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
        summary.put("expectedGuestCapacity", wedding.getExpectedGuestCapacity() != null ? wedding.getExpectedGuestCapacity() : 0);
        summary.put("totalInvitationsCount", totalInvitations);
        summary.put("currencyCode", wedding.getCurrencyCode() != null ? wedding.getCurrencyCode() : "INR");
        summary.put("role", granted.admin() ? WeddingMembership.Role.ADMIN.name() : WeddingMembership.Role.ORGANIZER.name());

        // Budget figures belong to the EXPENSES module: only shown to admins and organizers with that permission.
        if (granted.can(WeddingModule.EXPENSES)) {
            BigDecimal totalBudget = wedding.getTotalBudgetTarget() != null ? wedding.getTotalBudgetTarget() : BigDecimal.ZERO;
            BigDecimal totalSpent = expenseRepository.sumTotalRecorded(activeId);
            BigDecimal totalPaid = expenseRepository.sumTotalPaid(activeId);
            BigDecimal totalAdvancePaid = expenseRepository.sumTotalAdvancePaid(activeId);
            BigDecimal totalPendingDues = expenseRepository.sumTotalPending(activeId);
            BigDecimal remainingBudget = totalBudget.subtract(totalSpent != null ? totalSpent : BigDecimal.ZERO);
            summary.put("totalBudgetTarget", totalBudget);
            summary.put("totalRecordedSpending", totalSpent != null ? totalSpent : BigDecimal.ZERO);
            summary.put("totalPaid", (totalPaid != null ? totalPaid : BigDecimal.ZERO).add(totalAdvancePaid != null ? totalAdvancePaid : BigDecimal.ZERO));
            summary.put("totalPendingDues", totalPendingDues != null ? totalPendingDues : BigDecimal.ZERO);
            summary.put("remainingRunway", remainingBudget);
        }

        return summary;
    }

    /**
     * Resolves the signed-in user's workspace. The user comes only from the verified token;
     * {@code requestedWeddingId} is honoured only if the user owns it or is a member.
     * A user with no workspace gets a new, empty one that they own.
     */
    @Transactional
    public Map<String, Object> getWorkspaceForUser(Long requestedWeddingId) {
        AppUser user = access.currentUser();
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

        // Check memberships and owned weddings
        if (wedding == null) {
            List<WeddingMembership> memberships = membershipRepository.findByUserId(user.getId());
            List<Wedding> owned = weddingRepository.findByOwnerUser_Id(user.getId());

            // Check if any membership is for an active/configured wedding
            java.util.Optional<Wedding> configuredMembership = memberships.stream()
                    .map(WeddingMembership::getWedding)
                    .filter(w -> (w.getBrideName() != null && !w.getBrideName().isBlank())
                            || (w.getGroomName() != null && !w.getGroomName().isBlank()))
                    .reduce((first, second) -> second);

            // Check if any owned wedding is active/configured
            java.util.Optional<Wedding> configuredOwned = owned.stream()
                    .filter(w -> (w.getBrideName() != null && !w.getBrideName().isBlank())
                            || (w.getGroomName() != null && !w.getGroomName().isBlank()))
                    .reduce((first, second) -> second);

            if (configuredMembership.isPresent() && configuredOwned.isEmpty()) {
                // User is an invited member of an active wedding and has no configured wedding of their own
                wedding = configuredMembership.get();
            } else if (configuredOwned.isPresent()) {
                wedding = configuredOwned.get();
            } else if (!memberships.isEmpty()) {
                wedding = memberships.get(memberships.size() - 1).getWedding();
            } else if (!owned.isEmpty()) {
                wedding = owned.get(owned.size() - 1);
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

            membershipRepository.save(adminMembership(wedding, user, "Host & Primary Admin"));
        }

        return summaryFor(access.requireMember(wedding.getId()));
    }

    public Wedding updateBudgetTarget(Long weddingId, BigDecimal newBudgetTarget) {
        Wedding wedding = access.require(weddingId, WeddingModule.EXPENSES).wedding();
        wedding.setTotalBudgetTarget(newBudgetTarget != null ? newBudgetTarget : BigDecimal.ZERO);
        return weddingRepository.save(wedding);
    }

    /** Couple details and public slug: admins, or organizers with the WEBSITE permission. */
    public Wedding updateWeddingDetails(Long weddingId, String brideName, String groomName, LocalDate weddingDate, String city, String venueName, String slug) {
        Wedding wedding = access.require(weddingId, WeddingModule.WEBSITE).wedding();

        if (brideName != null) wedding.setBrideName(brideName.trim());
        if (groomName != null) wedding.setGroomName(groomName.trim());
        if (weddingDate != null) wedding.setWeddingDate(weddingDate);
        if (city != null) wedding.setCity(city.trim());
        if (venueName != null) wedding.setVenueName(venueName.trim());
        Wedding saved = weddingRepository.save(wedding);

        if (slug != null && !slug.trim().isEmpty()) {
            String cleanSlug = slug.trim().toLowerCase().replaceAll("[^a-z0-9-]", "-");
            WeddingSlug existingSlug = slugRepository.findByWeddingId(saved.getId()).orElse(null);
            boolean unchanged = existingSlug != null && cleanSlug.equals(existingSlug.getSlug());
            if (!unchanged && slugRepository.existsBySlug(cleanSlug)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "That website address is already taken.");
            }
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

    /** Creates a wedding owned by the signed-in user (never a client-supplied or default owner). */
    public Wedding createWorkspace(String brideName, String groomName, LocalDate weddingDate, String city, String venueName, BigDecimal totalBudget, String slug) {
        AppUser owner = access.currentUser();

        String cleanSlug = null;
        if (slug != null && !slug.isBlank()) {
            cleanSlug = slug.trim().toLowerCase().replaceAll("[^a-z0-9-]", "-");
            if (slugRepository.existsBySlug(cleanSlug)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "That website address is already taken.");
            }
        }

        Wedding wedding = new Wedding();
        wedding.setOwnerUser(owner);
        wedding.setBrideName(brideName != null ? brideName : "");
        wedding.setGroomName(groomName != null ? groomName : "");
        wedding.setWeddingDate(weddingDate);
        wedding.setCity(city != null ? city : "");
        wedding.setVenueName(venueName != null ? venueName : "");
        wedding.setTotalBudgetTarget(totalBudget != null ? totalBudget : BigDecimal.ZERO);
        Wedding saved = weddingRepository.save(wedding);

        if (cleanSlug != null) {
            WeddingSlug weddingSlug = new WeddingSlug();
            weddingSlug.setWedding(saved);
            weddingSlug.setSlug(cleanSlug);
            weddingSlug.setIsActive(true);
            slugRepository.save(weddingSlug);
        }

        membershipRepository.save(adminMembership(saved, owner, "Workspace Owner & Admin"));

        return saved;
    }

    private static WeddingMembership adminMembership(Wedding wedding, AppUser user, String title) {
        WeddingMembership membership = new WeddingMembership();
        membership.setWedding(wedding);
        membership.setUser(user);
        membership.setRole(WeddingMembership.Role.ADMIN);
        membership.setTitle(title);
        membership.setCanManageEvents(true);
        membership.setCanManageTasks(true);
        membership.setCanManageGuests(true);
        membership.setCanCheckInGuests(true);
        membership.setCanManageExpenses(true);
        membership.setCanManageVendors(true);
        membership.setCanManageWebsite(true);
        membership.setCanModerateGallery(true);
        return membership;
    }

    @Transactional
    public Map<String, Object> resetWorkspaceData(Long weddingId) {
        // NOTE: the HTTP reset endpoints are currently disabled (see WorkspaceController).
        Wedding wedding = access.requireAdmin(weddingId).wedding();

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
