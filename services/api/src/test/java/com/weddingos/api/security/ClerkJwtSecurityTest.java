package com.weddingos.api.security;

import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.weddingos.api.controller.InvitationController;
import com.weddingos.api.controller.TaskController;
import com.weddingos.api.controller.WebsiteController;
import com.weddingos.api.dto.PublicInvitationView;
import com.weddingos.api.service.InvitationService;
import com.weddingos.api.service.TaskService;
import com.weddingos.api.service.WebsiteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-end bearer-token checks through the real Spring Security filter chain, using RS256 tokens
 * signed in the test and the production {@link ClerkJwtValidators} rules.
 */
@WebMvcTest(controllers = {TaskController.class, InvitationController.class, WebsiteController.class})
@Import({SecurityConfig.class, ClerkJwtSecurityTest.TestJwtConfig.class})
class ClerkJwtSecurityTest {

    static final String ISSUER = "https://test-instance.clerk.accounts.dev";
    static final String FRONTEND = "http://localhost:5173";
    static final KeyPair TRUSTED_KEYS = generateKeys();
    static final KeyPair UNTRUSTED_KEYS = generateKeys();

    @TestConfiguration
    static class TestJwtConfig {
        @Bean
        JwtDecoder jwtDecoder() {
            ClerkProperties props = new ClerkProperties();
            props.setIssuer(ISSUER);
            props.setAuthorizedParties(FRONTEND + ",https://weddingos.example.com");
            NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey((RSAPublicKey) TRUSTED_KEYS.getPublic()).build();
            decoder.setJwtValidator(ClerkJwtValidators.create(props));
            return decoder;
        }
    }

    @Autowired MockMvc mvc;
    @MockBean TaskService taskService;
    @MockBean InvitationService invitationService;
    @MockBean WebsiteService websiteService;

    static KeyPair generateKeys() {
        try {
            KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
            gen.initialize(2048);
            return gen.generateKeyPair();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    /** A Clerk-style session token; the customizer can break individual claims. */
    static String token(KeyPair keys, Consumer<JWTClaimsSet.Builder> customize) throws Exception {
        Instant now = Instant.now();
        JWTClaimsSet.Builder claims = new JWTClaimsSet.Builder()
                .issuer(ISSUER)
                .subject("user_2abcTEST")
                .claim("azp", FRONTEND)
                .claim("sid", "sess_123")
                .claim("v", 2)
                .claim("sts", "active")
                .issueTime(Date.from(now.minusSeconds(5)))
                .notBeforeTime(Date.from(now.minusSeconds(5)))
                .expirationTime(Date.from(now.plusSeconds(60)));
        customize.accept(claims);
        SignedJWT jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).type(JOSEObjectType.JWT).keyID("ins_test").build(), claims.build());
        jwt.sign(new RSASSASigner((RSAPrivateKey) keys.getPrivate()));
        return jwt.serialize();
    }

    static String validToken() throws Exception {
        return token(TRUSTED_KEYS, c -> {});
    }

    private void expectUnauthorized(String authorizationHeader) throws Exception {
        var request = get("/api/v1/tasks").param("weddingId", "1");
        if (authorizationHeader != null) {
            request = request.header("Authorization", authorizationHeader);
        }
        mvc.perform(request)
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("WWW-Authenticate", containsString("Bearer")))
                .andExpect(jsonPath("$.status").value(401));
        verifyNoInteractions(taskService);
    }

    @Test
    void validClerkTokenIsAccepted() throws Exception {
        when(taskService.getTasks(eq(1L), any(), any())).thenReturn(List.of());

        mvc.perform(get("/api/v1/tasks").param("weddingId", "1").header("Authorization", "Bearer " + validToken()))
                .andExpect(status().isOk());
        verify(taskService).getTasks(eq(1L), any(), any());
    }

    @Test
    void missingTokenIs401() throws Exception {
        expectUnauthorized(null);
    }

    @Test
    void malformedTokenIs401() throws Exception {
        expectUnauthorized("Bearer not-a-jwt");
    }

    @Test
    void tokenSignedByUntrustedKeyIs401() throws Exception {
        expectUnauthorized("Bearer " + token(UNTRUSTED_KEYS, c -> {}));
    }

    @Test
    void expiredTokenIs401() throws Exception {
        Instant past = Instant.now().minusSeconds(3600);
        expectUnauthorized("Bearer " + token(TRUSTED_KEYS, c -> c
                .issueTime(Date.from(past.minusSeconds(60)))
                .notBeforeTime(Date.from(past.minusSeconds(60)))
                .expirationTime(Date.from(past))));
    }

    @Test
    void notYetValidTokenIs401() throws Exception {
        expectUnauthorized("Bearer " + token(TRUSTED_KEYS, c -> c.notBeforeTime(Date.from(Instant.now().plusSeconds(600)))
                .expirationTime(Date.from(Instant.now().plusSeconds(900)))));
    }

    @Test
    void tokenFromAnotherIssuerIs401() throws Exception {
        expectUnauthorized("Bearer " + token(TRUSTED_KEYS, c -> c.issuer("https://evil.clerk.accounts.dev")));
    }

    @Test
    void tokenForUnauthorizedPartyIs401() throws Exception {
        expectUnauthorized("Bearer " + token(TRUSTED_KEYS, c -> c.claim("azp", "https://attacker.example")));
    }

    @Test
    void tokenWithoutAzpIs401WhenPartiesAreConfigured() throws Exception {
        expectUnauthorized("Bearer " + token(TRUSTED_KEYS, c -> c.claim("azp", null)));
    }

    @Test
    void pendingSessionTokenIs401() throws Exception {
        expectUnauthorized("Bearer " + token(TRUSTED_KEYS, c -> c.claim("sts", "pending")));
    }

    @Test
    void tokenWithoutSubjectIs401() throws Exception {
        expectUnauthorized("Bearer " + token(TRUSTED_KEYS, c -> c.subject(null)));
    }

    @Test
    void identityHeadersWithoutTokenAreNotTrusted() throws Exception {
        mvc.perform(get("/api/v1/tasks").param("weddingId", "1")
                        .header("X-User-Email", "victim@example.com")
                        .header("X-Clerk-User-Id", "user_victim"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(taskService);
    }

    @Test
    void publicInvitationRouteNeedsNoToken() throws Exception {
        when(invitationService.getPublicInvitation("wos-abc")).thenReturn(new PublicInvitationView(
                "wos-abc", "The Family", "Primary", "Friends", 4, 0, "PENDING", null, false,
                "Asha", "Ravi", null, "Udaipur", "Lake Palace"));

        mvc.perform(get("/api/v1/public/invite/wos-abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("The Family"))
                .andExpect(jsonPath("$.phoneNumber").doesNotExist())
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(jsonPath("$.organizerNotes").doesNotExist());
    }

    @Test
    void publicWebsiteRouteNeedsNoToken() throws Exception {
        when(websiteService.getPublicWebsiteBySlug("asha-ravi")).thenReturn(Map.of("slug", "asha-ravi"));

        mvc.perform(get("/api/v1/public/w/asha-ravi"))
                .andExpect(status().isOk());
    }

    @Test
    void privateGuestListIsNotPublic() throws Exception {
        mvc.perform(get("/api/v1/invitations").param("weddingId", "1"))
                .andExpect(status().isUnauthorized());
        verify(invitationService, never()).getInvitationsWithMetrics(any());
    }
}
