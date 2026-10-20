package com.weddingos.api.repository;

import com.weddingos.api.model.WeddingWebsite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WeddingWebsiteRepository extends JpaRepository<WeddingWebsite, Long> {
    Optional<WeddingWebsite> findByWeddingId(Long weddingId);
}
