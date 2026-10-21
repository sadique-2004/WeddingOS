package com.weddingos.api.service;

import com.weddingos.api.exception.ForbiddenException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.*;
import com.weddingos.api.repository.*;
import com.weddingos.api.security.CurrentUserService;
import com.weddingos.api.security.WeddingAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Cross-wedding and team-permission enforcement across the private services, using the real
 * {@link WeddingAccessService}.
 * <p>
 * Wedding 1: the current user ("me") is a member. Wedding 2: belongs to someone else.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TenantIsolationTest {

    @Mock CurrentUserService currentUserService;
    @Mock WeddingRepository weddingRepository;
    @Mock WeddingMembershipRepository membershipRepository;
    @Mock PreparationTaskRepository taskRepository;
    @Mock ExpenseRepository expenseRepository;
    @Mock FamilyInvitationRepository invitationRepository;
    @Mock GalleryPhotoRepository photoRepository;
    @Mock CheckInLogRepository logRepository;
    @Mock VendorContactRepository vendorRepository;
    @Mock WeddingEventRepository eventRepository;
    @Mock AppUserRepository userRepository;
    @Mock CloudinaryService cloudinaryService;
    @Mock WebsiteService websiteService;

    TaskService tasks;
    ExpenseService expenses;
    InvitationService invitations;
    GalleryService gallery;
    CheckInService checkIn;
    MemberService members;
    VendorService vendors;
    EventService events;

    AppUser me;
    Wedding myWedding;
    Wedding otherWedding;
    WeddingMembership myMembership;

    @BeforeEach
    void setUp() {
        WeddingAccessService access = new WeddingAccessService(currentUserService, weddingRepository, membershipRepository);
        tasks = new TaskService(taskRepository, access);
        expenses = new ExpenseService(expenseRepository, access);
        invitations = new InvitationService(invitationRepository, access);
        gallery = new GalleryService(photoRepository, access, cloudinaryService, websiteService);
        checkIn = new CheckInService(invitationRepository, logRepository, access);
        members = new MemberService(membershipRepository, userRepository, access);
        vendors = new VendorService(vendorRepository, access);
        events = new EventService(eventRepository, access);

        me = new AppUser("user_me", "me@example.com", "Me");
        me.setId(10L);
        AppUser stranger = new AppUser("user_stranger", "s@example.com", "Stranger");
        stranger.setId(20L);

        myWedding = new Wedding();
        myWedding.setId(1L);
        myWedding.setOwnerUser(stranger); // access comes from membership, not ownership
        otherWedding = new Wedding();
        otherWedding.setId(2L);
        otherWedding.setOwnerUser(stranger);

        myMembership = new WeddingMembership();
        myMembership.setId(100L);
        myMembership.setWedding(myWedding);
        myMembership.setUser(me);
        myMembership.setRole(WeddingMembership.Role.ADMIN);

        when(currentUserService.requireCurrentUser()).thenReturn(me);
        when(weddingRepository.findById(1L)).thenReturn(Optional.of(myWedding));
        when(weddingRepository.findById(2L)).thenReturn(Optional.of(otherWedding));
        when(membershipRepository.findByWeddingIdAndUserId(1L, 10L)).thenReturn(Optional.of(myMembership));
        when(membershipRepository.findByWeddingIdAndUserId(2L, 10L)).thenReturn(Optional.empty());
    }

    private void becomeOrganizer(boolean tasksAllowed, boolean expensesAllowed) {
        myMembership.setRole(WeddingMembership.Role.ORGANIZER);
        myMembership.setCanManageTasks(tasksAllowed);
        myMembership.setCanManageExpenses(expensesAllowed);
    }

    // ---------------- Cross-wedding access ----------------

    @Test
    void cannotListAnotherWeddingsTasks() {
        assertThatThrownBy(() -> tasks.getTasks(2L, null, null)).isInstanceOf(ForbiddenException.class);
        verify(taskRepository, never()).findByWeddingIdOrderByCreatedAtDesc(any());
    }

    @Test
    void cannotUpdateTaskBelongingToAnotherWedding() {
        PreparationTask foreign = new PreparationTask();
        foreign.setWedding(otherWedding);
        when(taskRepository.findById(55L)).thenReturn(Optional.of(foreign));

        PreparationTask update = new PreparationTask();
        update.setTitle("hijacked");
        assertThatThrownBy(() -> tasks.updateTask(55L, update)).isInstanceOf(ForbiddenException.class);
        verify(taskRepository, never()).save(any());
        assertThat(foreign.getTitle()).isNull();
    }

    @Test
    void cannotDeleteExpenseBelongingToAnotherWedding() {
        Expense foreign = new Expense();
        foreign.setWedding(otherWedding);
        when(expenseRepository.findById(9L)).thenReturn(Optional.of(foreign));

        assertThatThrownBy(() -> expenses.deleteExpense(9L)).isInstanceOf(ForbiddenException.class);
        verify(expenseRepository, never()).delete(any());
        verify(expenseRepository, never()).deleteById(any());
    }

    @Test
    void cannotReadAnotherWeddingsGuestList() {
        assertThatThrownBy(() -> invitations.getInvitationsWithMetrics(2L)).isInstanceOf(ForbiddenException.class);
        verify(invitationRepository, never()).findByWeddingIdOrderByDisplayNameAsc(any());
    }

    @Test
    void cannotModeratePhotoOfAnotherWedding() {
        GalleryPhoto foreign = new GalleryPhoto();
        foreign.setWedding(otherWedding);
        when(photoRepository.findById(3L)).thenReturn(Optional.of(foreign));

        assertThatThrownBy(() -> gallery.moderatePhoto(3L, GalleryPhoto.ModerationStatus.APPROVED))
                .isInstanceOf(ForbiddenException.class);
        verify(photoRepository, never()).save(any());
    }

    @Test
    void cannotEditVendorOrEventOfAnotherWedding() {
        VendorContact vendor = new VendorContact();
        vendor.setWedding(otherWedding);
        when(vendorRepository.findById(4L)).thenReturn(Optional.of(vendor));
        WeddingEvent event = new WeddingEvent();
        event.setWedding(otherWedding);
        when(eventRepository.findById(5L)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> vendors.deleteVendor(4L)).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> events.getEventById(5L)).isInstanceOf(ForbiddenException.class);
        verify(vendorRepository, never()).delete(any());
    }

    @Test
    void checkInTokenFromAnotherWeddingIsRejectedAsUnknown() {
        FamilyInvitation foreignGuest = new FamilyInvitation();
        foreignGuest.setWedding(otherWedding);
        foreignGuest.setInvitationToken("wos-foreign");
        when(invitationRepository.findByInvitationToken("wos-foreign")).thenReturn(Optional.of(foreignGuest));

        assertThatThrownBy(() -> checkIn.verifyAndCheckIn(1L, "wos-foreign", 2, null))
                .isInstanceOf(NotFoundException.class);
        verify(logRepository, never()).save(any());
        verify(invitationRepository, never()).save(any());
        assertThat(foreignGuest.getCheckedInAt()).isNull();
    }

    @Test
    void cannotInviteMembersIntoAnotherWedding() {
        assertThatThrownBy(() -> members.inviteMember(2L, "X", "x@example.com", WeddingMembership.Role.ADMIN, null))
                .isInstanceOf(ForbiddenException.class);
        verify(membershipRepository, never()).save(any());
    }

    @Test
    void createIgnoresClientSuppliedIdSoExistingRowsCannotBeOverwritten() {
        when(taskRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        PreparationTask incoming = new PreparationTask();
        incoming.setId(999L); // e.g. another wedding's task ID
        incoming.setTitle("New");

        tasks.createTask(1L, incoming);

        ArgumentCaptor<PreparationTask> saved = ArgumentCaptor.forClass(PreparationTask.class);
        verify(taskRepository).save(saved.capture());
        assertThat(saved.getValue().getId()).isNull();
        assertThat(saved.getValue().getWedding()).isSameAs(myWedding);
    }

    @Test
    void invitationTokensAreAlwaysServerGenerated() {
        when(invitationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        FamilyInvitation incoming = new FamilyInvitation();
        incoming.setInvitationToken("guessable-1");

        FamilyInvitation saved = invitations.createInvitation(1L, incoming);

        assertThat(saved.getInvitationToken()).startsWith("wos-").isNotEqualTo("guessable-1").hasSize(36);
    }

    // ---------------- Team permissions inside one wedding ----------------

    @Test
    void organizerWithTaskPermissionCanReadTasks() {
        becomeOrganizer(true, false);
        when(taskRepository.findByWeddingIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        assertThat(tasks.getTasks(1L, null, null)).isEmpty();
    }

    @Test
    void organizerWithoutExpensePermissionCannotSeeBudget() {
        becomeOrganizer(true, false);

        assertThatThrownBy(() -> expenses.getExpensesWithSummary(1L)).isInstanceOf(ForbiddenException.class);
        verify(expenseRepository, never()).sumTotalRecorded(any());
    }

    @Test
    void organizerCannotInviteMembersOrEscalateOwnPermissions() {
        becomeOrganizer(true, true);
        when(membershipRepository.findById(100L)).thenReturn(Optional.of(myMembership));

        assertThatThrownBy(() -> members.inviteMember(1L, "X", "x@example.com", WeddingMembership.Role.ADMIN, null))
                .isInstanceOf(ForbiddenException.class);

        WeddingMembership escalation = new WeddingMembership();
        escalation.setCanManageVendors(true);
        assertThatThrownBy(() -> members.updatePermissions(100L, escalation)).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> members.updateRole(100L, WeddingMembership.Role.ADMIN)).isInstanceOf(ForbiddenException.class);
        verify(membershipRepository, never()).save(any());
    }

    @Test
    void organizerCanStillListTeamRoster() {
        becomeOrganizer(false, false);
        when(membershipRepository.findByWeddingId(1L)).thenReturn(List.of(myMembership));

        assertThat(members.getMembers(1L)).hasSize(1);
    }

    @Test
    void adminCanInviteByEmailIntoOwnWedding() {
        when(userRepository.findAllByEmailIgnoreCase("planner@example.com")).thenReturn(List.of());
        when(userRepository.save(any())).thenAnswer(inv -> {
            AppUser u = inv.getArgument(0);
            u.setId(30L);
            return u;
        });
        when(membershipRepository.findByWeddingIdAndUserId(1L, 30L)).thenReturn(Optional.empty());
        when(membershipRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        WeddingMembership created = members.inviteMember(1L, "Planner", "Planner@Example.com ", WeddingMembership.Role.ORGANIZER, null);

        assertThat(created.getWedding()).isSameAs(myWedding);
        assertThat(created.getUser().getEmail()).isEqualTo("planner@example.com");
        assertThat(created.getUser().getClerkUserId()).startsWith("clerk_invited_");
    }

    @Test
    void budgetUpdateRequiresExpensePermission() {
        becomeOrganizer(true, false);
        when(expenseRepository.sumTotalRecorded(any())).thenReturn(BigDecimal.ZERO);

        assertThatThrownBy(() -> expenses.createExpense(1L, new Expense())).isInstanceOf(ForbiddenException.class);
    }
}
