package com.weddingos.api.security;

import com.weddingos.api.exception.ForbiddenException;
import com.weddingos.api.model.AppUser;
import com.weddingos.api.repository.AppUserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Identity mapping from a verified Clerk token to AppUser rows, including first-sign-in linking
 * of legacy local and invited users by Clerk-verified email.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CurrentUserServiceTest {

    static final String SUB = "user_2NEWclerk";

    @Mock AppUserRepository userRepository;
    @Mock ClerkUserDirectory directory;
    @Mock PlatformTransactionManager transactionManager;

    CurrentUserService service;

    @BeforeEach
    void setUp() {
        service = new CurrentUserService(userRepository, directory, transactionManager);
        Jwt jwt = Jwt.withTokenValue("t").header("alg", "RS256").subject(SUB)
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build();
        // Same shape as what the resource-server filter produces for a verified token (authenticated = true)
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt, List.of()));
        when(directory.isConfigured()).thenReturn(true);
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    private static AppUser row(long id, String clerkId, String email) {
        AppUser u = new AppUser(clerkId, email, "Name " + id);
        u.setId(id);
        return u;
    }

    @Test
    void existingUserIsMatchedBySubjectWithoutCallingClerk() {
        AppUser existing = row(1L, SUB, "a@example.com");
        when(userRepository.findByClerkUserId(SUB)).thenReturn(Optional.of(existing));

        assertThat(service.requireCurrentUser()).isSameAs(existing);
        verifyNoInteractions(directory);
    }

    @Test
    void noAuthenticationIsRejected() {
        SecurityContextHolder.clearContext();

        assertThatThrownBy(() -> service.requireCurrentUser())
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
        verifyNoInteractions(userRepository);
    }

    @Test
    void unauthenticatedTokenObjectIsRejected() {
        Jwt jwt = Jwt.withTokenValue("t").header("alg", "RS256").subject(SUB)
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt)); // authenticated = false

        assertThatThrownBy(() -> service.requireCurrentUser())
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
        verifyNoInteractions(userRepository);
    }

    @Test
    void legacyLocalUserIsLinkedByVerifiedEmail() {
        AppUser legacy = row(5L, "usr_1729_42", "bride@example.com");
        when(userRepository.findByClerkUserId(SUB)).thenReturn(Optional.empty());
        when(directory.findUser(SUB)).thenReturn(Optional.of(new ClerkUserDirectory.ClerkUserProfile(SUB, "bride@example.com", "Bride")));
        when(userRepository.findAllByEmailIgnoreCase("bride@example.com")).thenReturn(List.of(legacy));

        AppUser resolved = service.requireCurrentUser();

        assertThat(resolved).isSameAs(legacy);
        assertThat(legacy.getClerkUserId()).isEqualTo(SUB);
    }

    @Test
    void invitedPlaceholderIsLinkedByVerifiedEmail() {
        AppUser invited = row(6L, "clerk_invited_ab12cd34", "planner@example.com");
        when(userRepository.findByClerkUserId(SUB)).thenReturn(Optional.empty());
        when(directory.findUser(SUB)).thenReturn(Optional.of(new ClerkUserDirectory.ClerkUserProfile(SUB, "planner@example.com", null)));
        when(userRepository.findAllByEmailIgnoreCase("planner@example.com")).thenReturn(List.of(invited));

        assertThat(service.requireCurrentUser().getId()).isEqualTo(6L);
        assertThat(invited.getClerkUserId()).isEqualTo(SUB);
    }

    @Test
    void rowBoundToAnotherClerkAccountIsNeverRelinked() {
        AppUser otherClerkAccount = row(7L, "user_2OTHER", "shared@example.com");
        when(userRepository.findByClerkUserId(SUB)).thenReturn(Optional.empty());
        when(directory.findUser(SUB)).thenReturn(Optional.of(new ClerkUserDirectory.ClerkUserProfile(SUB, "shared@example.com", "New")));
        when(userRepository.findAllByEmailIgnoreCase("shared@example.com")).thenReturn(List.of(otherClerkAccount));

        AppUser resolved = service.requireCurrentUser();

        assertThat(otherClerkAccount.getClerkUserId()).isEqualTo("user_2OTHER");
        assertThat(resolved).isNotSameAs(otherClerkAccount);
        assertThat(resolved.getClerkUserId()).isEqualTo(SUB);
    }

    @Test
    void brandNewUserIsCreatedFromClerkProfile() {
        when(userRepository.findByClerkUserId(SUB)).thenReturn(Optional.empty());
        when(directory.findUser(SUB)).thenReturn(Optional.of(new ClerkUserDirectory.ClerkUserProfile(SUB, "new@example.com", "New Person")));
        when(userRepository.findAllByEmailIgnoreCase("new@example.com")).thenReturn(List.of());

        service.requireCurrentUser();

        ArgumentCaptor<AppUser> saved = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository).save(saved.capture());
        assertThat(saved.getValue().getClerkUserId()).isEqualTo(SUB);
        assertThat(saved.getValue().getEmail()).isEqualTo("new@example.com");
    }

    @Test
    void unverifiedEmailIsRefused() {
        when(userRepository.findByClerkUserId(SUB)).thenReturn(Optional.empty());
        when(directory.findUser(SUB)).thenReturn(Optional.of(new ClerkUserDirectory.ClerkUserProfile(SUB, null, "X")));

        assertThatThrownBy(() -> service.requireCurrentUser()).isInstanceOf(ForbiddenException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void ambiguousLegacyMatchesAreNotLinked() {
        when(userRepository.findByClerkUserId(SUB)).thenReturn(Optional.empty());
        when(directory.findUser(SUB)).thenReturn(Optional.of(new ClerkUserDirectory.ClerkUserProfile(SUB, "dup@example.com", "X")));
        when(userRepository.findAllByEmailIgnoreCase("dup@example.com"))
                .thenReturn(List.of(row(1L, "usr_1", "dup@example.com"), row(2L, "usr_2", "dup@example.com")));

        assertThatThrownBy(() -> service.requireCurrentUser())
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("More than one");
        verify(userRepository, never()).save(any());
    }

    @Test
    void firstSignInWithoutClerkSecretKeyFailsClosed() {
        when(directory.isConfigured()).thenReturn(false);
        when(userRepository.findByClerkUserId(SUB)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.requireCurrentUser())
                .isInstanceOf(ResponseStatusException.class);
        verify(userRepository, never()).save(any());
        verify(userRepository, never()).findAllByEmailIgnoreCase(any());
    }
}
