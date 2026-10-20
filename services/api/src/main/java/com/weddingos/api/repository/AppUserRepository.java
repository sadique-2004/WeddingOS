package com.weddingos.api.repository;

import com.weddingos.api.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByClerkUserId(String clerkUserId);
    Optional<AppUser> findByEmail(String email);
}
