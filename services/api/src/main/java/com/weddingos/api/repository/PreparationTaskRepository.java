package com.weddingos.api.repository;

import com.weddingos.api.model.PreparationTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreparationTaskRepository extends JpaRepository<PreparationTask, Long> {
    List<PreparationTask> findByWeddingIdOrderByCreatedAtDesc(Long weddingId);
    List<PreparationTask> findByWeddingIdAndCategory(Long weddingId, String category);
    List<PreparationTask> findByWeddingIdAndStatus(Long weddingId, PreparationTask.Status status);
}
