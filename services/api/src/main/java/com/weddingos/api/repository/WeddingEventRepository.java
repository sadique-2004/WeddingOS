package com.weddingos.api.repository;

import com.weddingos.api.model.WeddingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeddingEventRepository extends JpaRepository<WeddingEvent, Long> {
    List<WeddingEvent> findByWeddingIdOrderByEventDateAscSequenceOrderAsc(Long weddingId);
}
