package com.weddingos.api.repository;

import com.weddingos.api.model.WeddingMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeddingMembershipRepository extends JpaRepository<WeddingMembership, Long> {
    List<WeddingMembership> findByWeddingId(Long weddingId);
    Optional<WeddingMembership> findByWeddingIdAndUserId(Long weddingId, Long userId);
    long countByWeddingIdAndRole(Long weddingId, WeddingMembership.Role role);
}
