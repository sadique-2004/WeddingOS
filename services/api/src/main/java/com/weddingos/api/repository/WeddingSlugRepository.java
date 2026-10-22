package com.weddingos.api.repository;

import com.weddingos.api.model.WeddingSlug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WeddingSlugRepository extends JpaRepository<WeddingSlug, Long> {
    Optional<WeddingSlug> findBySlugAndIsActiveTrue(String slug);
    Optional<WeddingSlug> findByWeddingId(Long weddingId);
    Optional<WeddingSlug> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
