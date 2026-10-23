package com.weddingos.api.service;

import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.ForbiddenException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.AppUser;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.model.WeddingMembership;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Workspace operations: no "first wedding" / ID 1 fallbacks, identity only from the verified token,
 * and wedding access enforced through WeddingAccessService.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class WorkspaceServiceTest {

    @Mock WeddingRepository weddingRepository;
    @Mock WeddingSlugRepository slugRepository;
    @Mock AppUserRepository userRepository;
    @Mock WeddingMembershipRepository membershipRepository;
    @Mock ExpenseRepository expenseRepository;
    @Mock FamilyInvitationRepository invitationRepository;
    @Mock WeddingEventRepository eventRepository;
    @Mock PreparationTaskRepository taskRepository;
    @Mock VendorContactRepository vendorRepository;
    @Mock GalleryPhotoRepository galleryPhotoRepository;
    @Mock WeddingWebsiteRepository websiteRepository;
    @Mock CheckInLogRepository checkInLogRepository;
    @Mock JdbcTemplate jdbcTemplate;
    @Mock CurrentUserService currentUserService;

    WorkspaceService service;
    AppUser me;

    @BeforeEach
    void setUp() {
        WeddingAccessService access = new WeddingAccessService(currentUserService, weddingRepository, membershipRepository);
        service = new WorkspaceService(weddingRepository, slugRepository, userRepository, membershipRepository,
                expenseRepository, invitationRepository, eventRepository, taskRepository, vendorRepository,
                galleryPhotoRepository, websiteRepository, checkInLogRepository, jdbcTemplate, access);
        me = user(10L);
        when(currentUserService.requireCurrentUser()).thenReturn(me);
        when(expenseRepository.sumTotalRecorded(any())).thenReturn(BigDecimal.ZERO);
        when(expenseRepository.sumTotalPaid(any())).thenReturn(BigDecimal.ZERO);
        when(expenseRepository.sumTotalAdvancePaid(any())).thenReturn(BigDecimal.ZERO);
        when(expenseRepository.sumTotalPending(any())).thenReturn(BigDecimal.ZERO);
    }

    static AppUser user(long id) {
        AppUser u = new AppUser("user_" + id, "u" + id + "@example.com", "User " + id);
        u.setId(id);
        return u;
    }

    static Wedding wedding(long id, AppUser owner) {
        Wedding w = new Wedding();
        w.setId(id);
        w.setOwnerUser(owner);
        return w;
    }

    private void assertNoFallbackToOtherWeddings() {
        verify(weddingRepository, never()).findAll();
        verify(weddingRepository, never()).save(any());
        verify(weddingRepository, never()).saveAndFlush(any());
        verify(userRepository, never()).findAll();
    }

    @Test
    void summaryForUnknownWeddingIdIsNotFound() {
        when(weddingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getActiveWorkspaceSummary(999L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("999");
        assertNoFallbackToOtherWeddings();
    }

    @Test
    void summaryWithoutWeddingIdIsBadRequest() {
        assertThatThrownBy(() -> service.getActiveWorkspaceSummary(null))
                .isInstanceOf(BadRequestException.class);
        verifyNoInteractions(weddingRepository);
    }

    @Test
    void summaryOfAnotherUsersWeddingIsForbidden() {
        when(weddingRepository.findById(2L)).thenReturn(Optional.of(wedding(2L, user(20L))));
        when(membershipRepository.findByWeddingIdAndUserId(2L, 10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getActiveWorkspaceSummary(2L))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void activeWorkspaceWithoutAuthenticatedUserIsRejected() {
        when(currentUserService.requireCurrentUser()).thenThrow(new AuthenticationCredentialsNotFoundException("none"));

        assertThatThrownBy(() -> service.getWorkspaceForUser(1L))
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
        verifyNoInteractions(weddingRepository);
    }

    @Test
    void requestedWeddingIdIsIgnoredWhenUserIsNotAMember() {
        Wedding someoneElses = wedding(2L, user(20L));
        Wedding mine = wedding(5L, me);
        when(weddingRepository.findById(2L)).thenReturn(Optional.of(someoneElses));
        when(membershipRepository.findByWeddingIdAndUserId(2L, 10L)).thenReturn(Optional.empty());
        when(weddingRepository.findByOwnerUser_Id(10L)).thenReturn(List.of(mine));
        when(weddingRepository.findById(5L)).thenReturn(Optional.of(mine));

        Map<String, Object> summary = service.getWorkspaceForUser(2L);

        assertThat(summary.get("id")).isEqualTo(5L);
    }

    @Test
    void userWithoutWorkspaceGetsTheirOwnNewWeddingAsAdmin() {
        when(weddingRepository.findByOwnerUser_Id(10L)).thenReturn(List.of());
        when(membershipRepository.findByUserId(10L)).thenReturn(List.of());
        when(weddingRepository.save(any())).thenAnswer(inv -> {
            Wedding w = inv.getArgument(0);
            w.setId(77L);
            return w;
        });
        when(weddingRepository.findById(77L)).thenAnswer(inv -> Optional.of(wedding(77L, me)));

        Map<String, Object> summary = service.getWorkspaceForUser(null);

        ArgumentCaptor<Wedding> created = ArgumentCaptor.forClass(Wedding.class);
        verify(weddingRepository).save(created.capture());
        assertThat(created.getValue().getOwnerUser()).isSameAs(me);
        ArgumentCaptor<WeddingMembership> membership = ArgumentCaptor.forClass(WeddingMembership.class);
        verify(membershipRepository).save(membership.capture());
        assertThat(membership.getValue().getUser()).isSameAs(me);
        assertThat(membership.getValue().getRole()).isEqualTo(WeddingMembership.Role.ADMIN);
        assertThat(summary.get("id")).isEqualTo(77L);
        verify(weddingRepository, never()).findAll();
    }

    @Test
    void invitedMemberGetsAssignedWeddingEvenIfTheyHaveAnEmptyAutoProvisionedWedding() {
        Wedding emptyOwned = wedding(99L, me);
        Wedding invitedWedding = wedding(1L, user(50L));
        invitedWedding.setBrideName("Ananya");
        invitedWedding.setGroomName("Kabir");

        WeddingMembership mem = new WeddingMembership();
        mem.setWedding(invitedWedding);
        mem.setUser(me);
        mem.setRole(WeddingMembership.Role.ORGANIZER);

        when(membershipRepository.findByUserId(10L)).thenReturn(List.of(mem));
        when(membershipRepository.findByWeddingIdAndUserId(1L, 10L)).thenReturn(Optional.of(mem));
        when(weddingRepository.findByOwnerUser_Id(10L)).thenReturn(List.of(emptyOwned));
        when(weddingRepository.findById(1L)).thenReturn(Optional.of(invitedWedding));

        Map<String, Object> summary = service.getWorkspaceForUser(null);

        assertThat(summary.get("id")).isEqualTo(1L);
        assertThat(summary.get("brideName")).isEqualTo("Ananya");
        assertThat(summary.get("groomName")).isEqualTo("Kabir");
        assertThat(summary.get("role")).isEqualTo("ORGANIZER");
    }

    @Test
    void budgetUpdateWithoutWeddingIdIsBadRequest() {
        assertThatThrownBy(() -> service.updateBudgetTarget(null, BigDecimal.TEN))
                .isInstanceOf(BadRequestException.class);
        verify(weddingRepository, never()).save(any());
    }

    @Test
    void budgetUpdateForUnknownWeddingIsNotFound() {
        when(weddingRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateBudgetTarget(404L, BigDecimal.TEN))
                .isInstanceOf(NotFoundException.class);
        assertNoFallbackToOtherWeddings();
    }

    @Test
    void detailsUpdateForUnknownWeddingIsNotFoundAndCreatesNothing() {
        when(weddingRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateWeddingDetails(404L, "A", "B", null, "City", "Venue", "slug"))
                .isInstanceOf(NotFoundException.class);
        assertNoFallbackToOtherWeddings();
        verifyNoInteractions(slugRepository);
    }

    @Test
    void createWorkspaceOwnerIsAlwaysTheAuthenticatedUser() {
        when(weddingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Wedding created = service.createWorkspace("A", "B", null, "C", "V", null, null);

        assertThat(created.getOwnerUser()).isSameAs(me);
        verify(userRepository, never()).findById(any());
        verify(userRepository, never()).findAll();
    }

    @Test
    void createWorkspaceWithTakenSlugIsConflict() {
        when(slugRepository.existsBySlug("taken")).thenReturn(true);

        assertThatThrownBy(() -> service.createWorkspace("A", "B", null, "C", "V", null, "taken"))
                .hasMessageContaining("already taken");
        verify(weddingRepository, never()).save(any());
    }

    @Test
    void resetForUnknownWeddingDeletesNothing() {
        when(weddingRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.resetWorkspaceData(404L))
                .isInstanceOf(NotFoundException.class);
        assertNoFallbackToOtherWeddings();
        verifyNoInteractions(checkInLogRepository, taskRepository, eventRepository,
                vendorRepository, invitationRepository, galleryPhotoRepository);
    }
}
