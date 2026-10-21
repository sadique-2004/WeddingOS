package com.weddingos.api.security;

import java.util.Optional;

/**
 * Looks up a Clerk user server-side (Clerk Backend API) so account linking relies on data from Clerk,
 * never on client-supplied email headers.
 */
public interface ClerkUserDirectory {

    boolean isConfigured();

    Optional<ClerkUserProfile> findUser(String clerkUserId);

    /**
     * @param verifiedPrimaryEmail lower-cased primary email, or null when Clerk reports it as not verified
     */
    record ClerkUserProfile(String userId, String verifiedPrimaryEmail, String fullName) {}
}
