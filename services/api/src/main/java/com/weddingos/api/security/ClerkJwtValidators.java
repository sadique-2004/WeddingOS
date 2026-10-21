package com.weddingos.api.security;

import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Validation rules for Clerk session tokens (signature is checked by the decoder against Clerk's JWKS):
 * <ul>
 *   <li>exp / nbf with a small clock skew, and exp is required</li>
 *   <li>iss must equal the configured Clerk issuer</li>
 *   <li>sub must be present</li>
 *   <li>azp (authorized party / frontend origin) must be in the allow-list when one is configured</li>
 *   <li>aud must contain the configured audience, only when one is configured (Clerk omits aud by default)</li>
 *   <li>sts (session status, Clerk v2 tokens) must be "active" when present</li>
 * </ul>
 */
public final class ClerkJwtValidators {

    private static final String INVALID_TOKEN = "invalid_token";

    private ClerkJwtValidators() {}

    public static OAuth2TokenValidator<Jwt> create(ClerkProperties props) {
        List<OAuth2TokenValidator<Jwt>> validators = new ArrayList<>();
        validators.add(new JwtTimestampValidator(Duration.ofSeconds(props.getClockSkewSeconds())));
        validators.add(requireClaim("exp"));
        validators.add(new JwtIssuerValidator(props.normalizedIssuer()));
        validators.add(requireClaim("sub"));

        List<String> parties = props.authorizedPartyList();
        if (!parties.isEmpty()) {
            validators.add(jwt -> {
                String azp = jwt.getClaimAsString("azp");
                String normalized = azp == null ? null : (azp.endsWith("/") ? azp.substring(0, azp.length() - 1) : azp);
                return normalized != null && parties.contains(normalized)
                        ? OAuth2TokenValidatorResult.success()
                        : failure("Token was not issued for an authorized party.");
            });
        }

        String audience = props.getAudience();
        if (audience != null && !audience.isBlank()) {
            String expected = audience.trim();
            validators.add(jwt -> jwt.getAudience() != null && jwt.getAudience().contains(expected)
                    ? OAuth2TokenValidatorResult.success()
                    : failure("Token audience is not accepted."));
        }

        validators.add(jwt -> {
            String status = jwt.getClaimAsString("sts");
            return status == null || "active".equals(status)
                    ? OAuth2TokenValidatorResult.success()
                    : failure("Session is not active.");
        });

        return new DelegatingOAuth2TokenValidator<>(validators);
    }

    private static OAuth2TokenValidator<Jwt> requireClaim(String claim) {
        return jwt -> jwt.hasClaim(claim)
                ? OAuth2TokenValidatorResult.success()
                : failure("Missing required claim: " + claim);
    }

    private static OAuth2TokenValidatorResult failure(String description) {
        return OAuth2TokenValidatorResult.failure(new OAuth2Error(INVALID_TOKEN, description, null));
    }
}
