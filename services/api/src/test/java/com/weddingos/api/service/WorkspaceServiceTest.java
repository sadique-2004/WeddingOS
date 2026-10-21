package com.weddingos.api.service;

import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unknown or missing wedding IDs must be rejected — never resolved to "the first wedding" or wedding 1.
 */
@ExtendWith(MockitoExtension.class)
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

    @InjectMocks WorkspaceService service;

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
    void activeWorkspaceWithoutUserIdentityIsBadRequestEvenWithWeddingId() {
        assertThatThrownBy(() -> service.getWorkspaceForUser(null, " ", null, 1L))
                .isInstanceOf(BadRequestException.class);
        verifyNoInteractions(weddingRepository, userRepository);
    }

    @Test
    void budgetUpdateWithoutWeddingIdIsBadRequest() {
        assertThatThrownBy(() -> service.updateBudgetTarget(null, BigDecimal.TEN))
                .isInstanceOf(BadRequestException.class);
        verifyNoInteractions(weddingRepository);
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
    void detailsUpdateWithoutWeddingIdIsBadRequest() {
        assertThatThrownBy(() -> service.updateWeddingDetails(null, "A", "B", null, null, null, null))
                .isInstanceOf(BadRequestException.class);
        verifyNoInteractions(weddingRepository, slugRepository);
    }

    @Test
    void createWorkspaceWithoutOwnerOrIdentityIsBadRequest() {
        assertThatThrownBy(() -> service.createWorkspace(null, null, null, "A", "B", null, "C", "V", null, null))
                .isInstanceOf(BadRequestException.class);
        verify(userRepository, never()).findAll();
        verify(userRepository, never()).findById(any());
        verifyNoInteractions(weddingRepository);
    }

    @Test
    void createWorkspaceWithUnknownOwnerIdIsNotFound() {
        when(userRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createWorkspace(42L, null, null, "A", "B", null, "C", "V", null, null))
                .isInstanceOf(NotFoundException.class);
        verify(userRepository, never()).findAll();
        verifyNoInteractions(weddingRepository);
    }

    @Test
    void createWorkspaceWithUnknownIdentityIsNotFound() {
        when(userRepository.findByClerkUserId("clerk_x")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("someone@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createWorkspace(null, "Someone@Example.com", "clerk_x", "A", "B", null, "C", "V", null, null))
                .isInstanceOf(NotFoundException.class);
        verify(userRepository, never()).findAll();
        verifyNoInteractions(weddingRepository);
    }

    @Test
    void resetForUnknownWeddingDeletesNothing() {
        when(weddingRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.resetWorkspaceData(404L))
                .isInstanceOf(NotFoundException.class);
        assertNoFallbackToOtherWeddings();
        verifyNoInteractions(checkInLogRepository, expenseRepository, taskRepository, eventRepository,
                vendorRepository, invitationRepository, galleryPhotoRepository, membershipRepository);
    }
}
