package com.weddingos.api.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;

/**
 * Clerk settings, bound from the {@code clerk.*} properties (see application.yml).
 * None of these have hardcoded values; they come from environment variables.
 */
@ConfigurationProperties(prefix = "clerk")
public class ClerkProperties {

    /** Token issuer, e.g. https://example.clerk.accounts.dev (no trailing slash). */
    private String issuer = "";
    /** JWKS endpoint; defaults to {issuer}/.well-known/jwks.json. */
    private String jwksUrl = "";
    /** Comma-separated origins allowed in the token's azp claim. */
    private String authorizedParties = "";
    /** Optional expected audience; only enforced when set. */
    private String audience = "";
    /** Clerk Backend API secret key (never logged). */
    private String secretKey = "";
    private String apiUrl = "https://api.clerk.com/v1";
    /** Allowed clock skew for exp/nbf checks. */
    private long clockSkewSeconds = 60;

    public boolean isIssuerConfigured() {
        return issuer != null && !issuer.isBlank();
    }

    public String normalizedIssuer() {
        String value = issuer == null ? "" : issuer.trim();
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    public String resolvedJwksUrl() {
        if (jwksUrl != null && !jwksUrl.isBlank()) {
            return jwksUrl.trim();
        }
        return normalizedIssuer() + "/.well-known/jwks.json";
    }

    public List<String> authorizedPartyList() {
        if (authorizedParties == null || authorizedParties.isBlank()) {
            return List.of();
        }
        return Arrays.stream(authorizedParties.split(","))
                .map(String::trim)
                .map(s -> s.endsWith("/") ? s.substring(0, s.length() - 1) : s)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public boolean isSecretKeyConfigured() {
        return secretKey != null && !secretKey.isBlank();
    }

    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }

    public String getJwksUrl() { return jwksUrl; }
    public void setJwksUrl(String jwksUrl) { this.jwksUrl = jwksUrl; }

    public String getAuthorizedParties() { return authorizedParties; }
    public void setAuthorizedParties(String authorizedParties) { this.authorizedParties = authorizedParties; }

    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }

    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }

    public String getApiUrl() { return apiUrl; }
    public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }

    public long getClockSkewSeconds() { return clockSkewSeconds; }
    public void setClockSkewSeconds(long clockSkewSeconds) { this.clockSkewSeconds = clockSkewSeconds; }
}
