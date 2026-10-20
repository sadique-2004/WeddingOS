package com.weddingos.api.repository;

import com.weddingos.api.model.CheckInLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckInLogRepository extends JpaRepository<CheckInLog, Long> {
    List<CheckInLog> findByWeddingIdOrderByScannedAtDesc(Long weddingId);
    List<CheckInLog> findByInvitationIdOrderByScannedAtDesc(Long invitationId);
}
