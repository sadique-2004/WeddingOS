package com.weddingos.api.service;

import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.CheckInLog;
import com.weddingos.api.model.FamilyInvitation;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.repository.CheckInLogRepository;
import com.weddingos.api.repository.FamilyInvitationRepository;
import com.weddingos.api.security.WeddingAccessService;
import com.weddingos.api.security.WeddingModule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class CheckInService {

    private final FamilyInvitationRepository invitationRepository;
    private final CheckInLogRepository logRepository;
    private final WeddingAccessService access;

    public CheckInService(FamilyInvitationRepository invitationRepository,
                          CheckInLogRepository logRepository,
                          WeddingAccessService access) {
        this.invitationRepository = invitationRepository;
        this.logRepository = logRepository;
        this.access = access;
    }

    @Transactional(readOnly = true)
    public List<FamilyInvitation> searchFamilies(Long weddingId, String query) {
        access.require(weddingId, WeddingModule.CHECK_IN);
        if (query == null || query.trim().isEmpty()) {
            return invitationRepository.findByWeddingIdOrderByDisplayNameAsc(weddingId);
        }
        return invitationRepository.findByWeddingIdAndDisplayNameContainingIgnoreCase(weddingId, query.trim());
    }

    public Map<String, Object> verifyAndCheckIn(Long weddingId, String token, Integer attendeeCount, String checkedInBy) {
        var granted = access.require(weddingId, WeddingModule.CHECK_IN);
        Wedding wedding = granted.wedding();

        if (token == null || token.isBlank()) {
            throw new NotFoundException("Invitation not found for the supplied token.");
        }
        FamilyInvitation invitation = invitationRepository.findByInvitationToken(token)
                .orElseThrow(() -> new NotFoundException("Invitation not found for the supplied token."));
        // A token from another wedding is treated exactly like an unknown token.
        if (!Objects.equals(invitation.getWedding().getId(), wedding.getId())) {
            throw new NotFoundException("Invitation not found for the supplied token.");
        }

        boolean alreadyCheckedIn = invitation.getCheckedInAt() != null;
        int countToAdmit = attendeeCount != null ? attendeeCount : (invitation.getActualAttendees() > 0 ? invitation.getActualAttendees() : invitation.getMaxAttendees());
        String officer = checkedInBy != null && !checkedInBy.isBlank() ? checkedInBy : granted.user().getFullName();

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
        access.require(weddingId, WeddingModule.CHECK_IN);
        return logRepository.findByWeddingIdOrderByScannedAtDesc(weddingId);
    }
}
