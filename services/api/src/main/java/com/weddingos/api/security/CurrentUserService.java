package com.weddingos.api.security;

import com.weddingos.api.exception.ForbiddenException;
import com.weddingos.api.model.AppUser;
import com.weddingos.api.repository.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Resolves the {@link AppUser} for the verified Clerk token on the current request.
 * <p>
 * Identity comes only from the validated JWT {@code sub}. Client headers, query parameters,
 * localStorage values and request-body user IDs are never used.
 * <p>
 * First sign-in for a Clerk user with no matching {@code clerk_user_id}:
 * the user's <b>verified</b> primary email is fetched from the Clerk Backend API and, if exactly one
 * legacy row (local login {@code usr_...} or invited {@code clerk_invited_...} placeholder) has that
 * email, that row is linked by setting its {@code clerk_user_id}. Rows already bound to a different
 * real Clerk ID ({@code user_...}) are never re-linked. Otherwise a new user row is created.
 */
@Service
public class CurrentUserService {

    private static final Logger log = LoggerFactory.getLogger(CurrentUserService.class);
    static final String REAL_CLERK_ID_PREFIX = "user_";

    private final AppUserRepository userRepository;
    private final ClerkUserDirectory clerkDirectory;
    private final TransactionTemplate writeTx;

    public CurrentUserService(AppUserRepository userRepository, ClerkUserDirectory clerkDirectory,
                              PlatformTransactionManager transactionManager) {
        this.userRepository = userRepository;
        this.clerkDirectory = clerkDirectory;
        // Linking/creating runs in its own transaction so it also works when called from read-only service methods.
        this.writeTx = new TransactionTemplate(transactionManager);
        this.writeTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    /** The verified Clerk user ID ({@code sub}) of the current request. */
    public String currentClerkUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof Jwt jwt) {
            String sub = jwt.getSubject();
            if (sub != null && !sub.isBlank()) {
                return sub;
            }
        }
        throw new AuthenticationCredentialsNotFoundException("No verified identity on this request.");
    }

    public AppUser requireCurrentUser() {
        String sub = currentClerkUserId();
        return userRepository.findByClerkUserId(sub)
                .orElseGet(() -> writeTx.execute(status -> linkOrCreate(sub)));
    }

    private AppUser linkOrCreate(String sub) {
        if (!clerkDirectory.isConfigured()) {
            log.error("First-time sign-in cannot be completed: CLERK_SECRET_KEY is not configured.");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Account setup is temporarily unavailable. Please try again later.");
        }
        ClerkUserDirectory.ClerkUserProfile profile = clerkDirectory.findUser(sub)
                .orElseThrow(() -> new ForbiddenException("Your account could not be found with the identity provider."));
        String email = profile.verifiedPrimaryEmail();
        if (email == null || email.isBlank()) {
            throw new ForbiddenException("A verified primary email address is required to use WeddingOS.");
        }

        List<AppUser> linkable = userRepository.findAllByEmailIgnoreCase(email).stream()
                .filter(u -> u.getClerkUserId() == null || !u.getClerkUserId().startsWith(REAL_CLERK_ID_PREFIX))
                .toList();

        if (linkable.size() > 1) {
            log.warn("Account linking skipped: {} legacy users share the same verified email.", linkable.size());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "More than one existing account matches your email. Please contact support to merge them.");
        }

        String name = profile.fullName() != null ? profile.fullName() : email.split("@")[0];
        if (linkable.size() == 1) {
            AppUser existing = linkable.get(0);
            existing.setClerkUserId(sub);
            existing.setEmail(email);
            if (existing.getFullName() == null || existing.getFullName().isBlank()) {
                existing.setFullName(name);
            }
            log.info("Linked existing user id={} to its Clerk account on first verified sign-in.", existing.getId());
            return userRepository.save(existing);
        }

        return userRepository.save(new AppUser(sub, email, name));
    }
}
