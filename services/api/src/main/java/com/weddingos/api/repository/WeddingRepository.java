package com.weddingos.api.repository;

import com.weddingos.api.model.Wedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeddingRepository extends JpaRepository<Wedding, Long> {
    List<Wedding> findByOwnerUserId(Long ownerUserId);
}
