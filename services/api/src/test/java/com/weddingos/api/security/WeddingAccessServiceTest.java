package com.weddingos.api.security;

import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.ForbiddenException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.AppUser;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.model.WeddingMembership;
import com.weddingos.api.repository.WeddingMembershipRepository;
import com.weddingos.api.repository.WeddingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class WeddingAccessServiceTest {

    @Mock CurrentUserService currentUserService;
    @Mock WeddingRepository weddingRepository;
    @Mock WeddingMembershipRepository membershipRepository;

    WeddingAccessService access;
    AppUser me;
    Wedding wedding;

    @BeforeEach
    void setUp() {
        access = new WeddingAccessService(currentUserService, weddingRepository, membershipRepository);
        me = new AppUser("user_me", "me@example.com", "Me");
        me.setId(10L);
        AppUser owner = new AppUser("user_owner", "owner@example.com", "Owner");
        owner.setId(20L);
        wedding = new Wedding();
        wedding.setId(1L);
        wedding.setOwnerUser(owner);
        when(currentUserService.requireCurrentUser()).thenReturn(me);
        when(weddingRepository.findById(1L)).thenReturn(Optional.of(wedding));
    }

    private void memberOf(WeddingMembership.Role role, boolean canManageTasks, boolean canManageExpenses) {
        WeddingMembership m = new WeddingMembership();
        m.setWedding(wedding);
        m.setUser(me);
        m.setRole(role);
        m.setCanManageTasks(canManageTasks);
        m.setCanManageExpenses(canManageExpenses);
        when(membershipRepository.findByWeddingIdAndUserId(1L, 10L)).thenReturn(Optional.of(m));
    }

    @Test
    void ownerHasFullAccessEvenWithoutMembershipRow() {
        wedding.setOwnerUser(me);
        when(membershipRepository.findByWeddingIdAndUserId(1L, 10L)).thenReturn(Optional.empty());

        var granted = access.requireAdmin(1L);
        assertThat(granted.admin()).isTrue();
        assertThat(granted.can(WeddingModule.EXPENSES)).isTrue();
    }

    @Test
    void adminMemberHasEveryModule() {
        memberOf(WeddingMembership.Role.ADMIN, false, false);

        for (WeddingModule module : WeddingModule.values()) {
            assertThat(access.require(1L, module).wedding()).isSameAs(wedding);
        }
    }

    @Test
    void organizerOnlyGetsGrantedModules() {
        memberOf(WeddingMembership.Role.ORGANIZER, true, false);

        assertThat(access.require(1L, WeddingModule.TASKS).admin()).isFalse();
        assertThatThrownBy(() -> access.require(1L, WeddingModule.EXPENSES))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void organizerCannotPerformAdminOperations() {
        memberOf(WeddingMembership.Role.ORGANIZER, true, true);

        assertThatThrownBy(() -> access.requireAdmin(1L)).isInstanceOf(ForbiddenException.class);
    }

    @Test
    void nonMemberIsForbidden() {
        when(membershipRepository.findByWeddingIdAndUserId(1L, 10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> access.requireMember(1L)).isInstanceOf(ForbiddenException.class);
    }

    @Test
    void unknownWeddingIsNotFound() {
        when(weddingRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> access.requireMember(404L)).isInstanceOf(NotFoundException.class);
    }

    @Test
    void missingWeddingIdIsBadRequest() {
        assertThatThrownBy(() -> access.requireMember(null)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void unauthenticatedCallerLearnsNothingAboutWeddings() {
        when(currentUserService.requireCurrentUser()).thenThrow(new AuthenticationCredentialsNotFoundException("none"));

        assertThatThrownBy(() -> access.requireMember(1L)).isInstanceOf(AuthenticationCredentialsNotFoundException.class);
        verifyNoInteractions(weddingRepository, membershipRepository);
    }
}
