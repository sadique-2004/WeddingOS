package com.weddingos.api.repository;

import com.weddingos.api.model.FamilyInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamilyInvitationRepository extends JpaRepository<FamilyInvitation, Long> {
    List<FamilyInvitation> findByWeddingIdOrderByDisplayNameAsc(Long weddingId);
    Optional<FamilyInvitation> findByInvitationToken(String invitationToken);
    Optional<FamilyInvitation> findByWeddingIdAndPhoneNumber(Long weddingId, String phoneNumber);
    List<FamilyInvitation> findByWeddingIdAndDisplayNameContainingIgnoreCase(Long weddingId, String query);
}
