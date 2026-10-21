package com.weddingos.api.security;

import com.weddingos.api.exception.ApiErrorBody;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Stateless bearer-token security.
 * <p>
 * Public (no token): guest invitation lookup/RSVP by opaque token, published wedding website and
 * gallery by slug, and CORS preflight. Everything else (including API docs) requires a valid Clerk
 * session token. Wedding-level authorization is enforced in the services via {@code WeddingAccessService}.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    public static final String[] PUBLIC_PATHS = {
            "/api/v1/public/**",
            "/error"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // no cookies/sessions: bearer tokens only
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(b -> b.disable())
                .formLogin(f -> f.disable())
                .logout(l -> l.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(PUBLIC_PATHS).permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(rs -> rs
                        .jwt(Customizer.withDefaults())
                        .authenticationEntryPoint((request, response, ex) -> {
                            response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
                            ApiErrorBody.write(request, response, HttpStatus.UNAUTHORIZED,
                                    "Authentication required: provide a valid bearer token.");
                        })
                        .accessDeniedHandler((request, response, ex) ->
                                ApiErrorBody.write(request, response, HttpStatus.FORBIDDEN, "Access denied.")))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((request, response, ex) -> {
                            response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
                            ApiErrorBody.write(request, response, HttpStatus.UNAUTHORIZED,
                                    "Authentication required: provide a valid bearer token.");
                        })
                        .accessDeniedHandler((request, response, ex) ->
                                ApiErrorBody.write(request, response, HttpStatus.FORBIDDEN, "Access denied.")));
        return http.build();
    }
}
