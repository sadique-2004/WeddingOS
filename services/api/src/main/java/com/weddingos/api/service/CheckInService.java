package com.weddingos.api.service;

import com.weddingos.api.model.CheckInLog;
import com.weddingos.api.model.FamilyInvitation;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.repository.CheckInLogRepository;
import com.weddingos.api.repository.FamilyInvitationRepository;
import com.weddingos.api.repository.WeddingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class CheckInService {

    private final FamilyInvitationRepository invitationRepository;
    private final CheckInLogRepository logRepository;
    private final WeddingRepository weddingRepository;

    public CheckInService(FamilyInvitationRepository invitationRepository,
                          CheckInLogRepository logRepository,
                          WeddingRepository weddingRepository) {
        this.invitationRepository = invitationRepository;
        this.logRepository = logRepository;
        this.weddingRepository = weddingRepository;
    }

    @Transactional(readOnly = true)
    public List<FamilyInvitation> searchFamilies(Long weddingId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return invitationRepository.findByWeddingIdOrderByDisplayNameAsc(weddingId);
        }
        return invitationRepository.findByWeddingIdAndDisplayNameContainingIgnoreCase(weddingId, query.trim());
    }

    public Map<String, Object> verifyAndCheckIn(Long weddingId, String token, Integer attendeeCount, String checkedInBy) {
        FamilyInvitation invitation = invitationRepository.findByInvitationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invitation QR code / token: " + token));

        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new IllegalArgumentException("Wedding not found: " + weddingId));

        boolean alreadyCheckedIn = invitation.getCheckedInAt() != null;
        int countToAdmit = attendeeCount != null ? attendeeCount : (invitation.getActualAttendees() > 0 ? invitation.getActualAttendees() : invitation.getMaxAttendees());
        String officer = checkedInBy != null && !checkedInBy.isBlank() ? checkedInBy : "Desk Coordinator";

        CheckInLog log = new CheckInLog();
        log.setWedding(wedding);
        log.setInvitation(invitation);
        log.setFamilyName(invitation.getDisplayName());
        log.setPrimaryContact(invitation.getPrimaryContactName());
        log.setAttendeeCount(countToAdmit);
        log.setMaxAttendees(invitation.getMaxAttendees());
        log.setCircle(invitation.getCircle());
        log.setCheckedInBy(officer);
        log.setIsDuplicateAttempt(alreadyCheckedIn);
        logRepository.save(log);

        if (!alreadyCheckedIn) {
            invitation.setCheckedInAt(LocalDateTime.now());
            invitation.setCheckedInBy(officer);
            invitation.setActualAttendees(countToAdmit);
            invitation.setRsvpStatus(FamilyInvitation.RsvpStatus.ATTENDING);
            invitationRepository.save(invitation);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", !alreadyCheckedIn);
        response.put("alreadyCheckedIn", alreadyCheckedIn);
        response.put("invitation", invitation);
        response.put("admittedAttendees", countToAdmit);
        response.put("checkedInBy", officer);
        response.put("checkedInAt", invitation.getCheckedInAt());
        response.put("message", alreadyCheckedIn
                ? "Duplicate scan attempt: Family was already checked in by " + invitation.getCheckedInBy() + " at " + invitation.getCheckedInAt()
                : "Entry cleared: Welcome " + invitation.getDisplayName() + " (" + countToAdmit + " guests admitted).");

        return response;
    }

    @Transactional(readOnly = true)
    public List<CheckInLog> getRecentLogs(Long weddingId) {
        return logRepository.findByWeddingIdOrderByScannedAtDesc(weddingId);
    }
}
