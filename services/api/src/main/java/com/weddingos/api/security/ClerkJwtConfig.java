package com.weddingos.api.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

/**
 * Builds the decoder that verifies Clerk session tokens: RS256 signature against Clerk's JWKS
 * (fetched lazily and cached by Nimbus), plus the claim rules in {@link ClerkJwtValidators}.
 */
@Configuration
@EnableConfigurationProperties(ClerkProperties.class)
public class ClerkJwtConfig {

    private static final Logger log = LoggerFactory.getLogger(ClerkJwtConfig.class);

    @Bean
    public JwtDecoder jwtDecoder(ClerkProperties props) {
        if (!props.isIssuerConfigured()) {
            // Fail closed: private routes reject every token; public routes keep working.
            log.error("CLERK_ISSUER is not configured. All authenticated API routes will return 401.");
            return token -> {
                throw new BadJwtException("Authentication is not configured on the server.");
            };
        }
        if (props.authorizedPartyList().isEmpty()) {
            log.warn("CLERK_AUTHORIZED_PARTIES is not set; the token azp (origin) claim is not being checked.");
        }
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(props.resolvedJwksUrl())
                .jwsAlgorithm(SignatureAlgorithm.RS256)
                .build();
        decoder.setJwtValidator(ClerkJwtValidators.create(props));
        return decoder;
    }
}
