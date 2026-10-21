package com.weddingos.api.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Clerk Backend API client: GET {api}/users/{id} with the secret key.
 * The secret key and response bodies are never logged.
 */
@Component
public class ClerkApiUserDirectory implements ClerkUserDirectory {

    private static final Logger log = LoggerFactory.getLogger(ClerkApiUserDirectory.class);
    private static final Pattern CLERK_ID = Pattern.compile("^[A-Za-z0-9_]{1,128}$");

    private final ClerkProperties props;
    private final RestClient restClient;

    public ClerkApiUserDirectory(ClerkProperties props) {
        this.props = props;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(5_000);
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    @Override
    public boolean isConfigured() {
        return props.isSecretKeyConfigured();
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<ClerkUserProfile> findUser(String clerkUserId) {
        if (!isConfigured()) {
            return Optional.empty();
        }
        if (clerkUserId == null || !CLERK_ID.matcher(clerkUserId).matches()) {
            return Optional.empty();
        }
        Map<String, Object> body;
        try {
            body = restClient.get()
                    .uri(props.getApiUrl() + "/users/{id}", clerkUserId)
                    .header("Authorization", "Bearer " + props.getSecretKey().trim())
                    .retrieve()
                    .body(Map.class);
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (RestClientException e) {
            log.warn("Clerk Backend API user lookup failed ({}).", e.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not verify your account with the identity provider. Please try again.");
        }
        if (body == null) {
            return Optional.empty();
        }

        String primaryId = (String) body.get("primary_email_address_id");
        String verifiedEmail = null;
        Object addresses = body.get("email_addresses");
        if (primaryId != null && addresses instanceof List<?> list) {
            for (Object item : list) {
                if (!(item instanceof Map<?, ?> address)) continue;
                if (!primaryId.equals(address.get("id"))) continue;
                Object verification = address.get("verification");
                boolean verified = verification instanceof Map<?, ?> v && "verified".equals(v.get("status"));
                Object email = address.get("email_address");
                if (verified && email instanceof String s && !s.isBlank()) {
                    verifiedEmail = s.trim().toLowerCase();
                }
            }
        }

        String first = body.get("first_name") instanceof String f ? f.trim() : "";
        String last = body.get("last_name") instanceof String l ? l.trim() : "";
        String fullName = (first + " " + last).trim();

        return Optional.of(new ClerkUserProfile(clerkUserId, verifiedEmail, fullName.isEmpty() ? null : fullName));
    }
}
