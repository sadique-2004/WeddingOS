package com.weddingos.api.service;

import com.weddingos.api.model.FamilyInvitation;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.repository.FamilyInvitationRepository;
import com.weddingos.api.repository.WeddingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Transactional
public class InvitationService {

    private final FamilyInvitationRepository invitationRepository;
    private final WeddingRepository weddingRepository;

    public InvitationService(FamilyInvitationRepository invitationRepository, WeddingRepository weddingRepository) {
        this.invitationRepository = invitationRepository;
        this.weddingRepository = weddingRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInvitationsWithMetrics(Long weddingId) {
        List<FamilyInvitation> list = invitationRepository.findByWeddingIdOrderByDisplayNameAsc(weddingId);
        
        long totalFamilies = list.size();
        long confirmedGuests = list.stream()
                .filter(i -> i.getRsvpStatus() == FamilyInvitation.RsvpStatus.ATTENDING)
                .mapToInt(FamilyInvitation::getActualAttendees)
                .sum();
        long maxCapacity = list.stream().mapToInt(FamilyInvitation::getMaxAttendees).sum();
        long pendingCount = list.stream().filter(i -> i.getRsvpStatus() == FamilyInvitation.RsvpStatus.PENDING).count();

        Map<String, Object> result = new HashMap<>();
        result.put("invitations", list);
        result.put("totalFamilies", totalFamilies);
        result.put("confirmedGuests", confirmedGuests);
        result.put("maxCapacity", maxCapacity);
        result.put("pendingCount", pendingCount);
        return result;
    }

    public FamilyInvitation createInvitation(Long weddingId, FamilyInvitation invitation) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new IllegalArgumentException("Wedding not found: " + weddingId));
        invitation.setWedding(wedding);
        if (invitation.getInvitationToken() == null || invitation.getInvitationToken().isBlank()) {
            invitation.setInvitationToken("wos-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return invitationRepository.save(invitation);
    }

    public FamilyInvitation updateInvitation(Long id, FamilyInvitation updates) {
        FamilyInvitation existing = invitationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found: " + id));

        if (updates.getDisplayName() != null) existing.setDisplayName(updates.getDisplayName());
        if (updates.getPrimaryContactName() != null) existing.setPrimaryContactName(updates.getPrimaryContactName());
        if (updates.getPhoneNumber() != null) existing.setPhoneNumber(updates.getPhoneNumber());
        if (updates.getEmail() != null) existing.setEmail(updates.getEmail());
        if (updates.getCircle() != null) existing.setCircle(updates.getCircle());
        if (updates.getMaxAttendees() != null) existing.setMaxAttendees(updates.getMaxAttendees());
        if (updates.getActualAttendees() != null) existing.setActualAttendees(updates.getActualAttendees());
        if (updates.getRsvpStatus() != null) existing.setRsvpStatus(updates.getRsvpStatus());
        if (updates.getDietaryNotes() != null) existing.setDietaryNotes(updates.getDietaryNotes());
        if (updates.getOrganizerNotes() != null) existing.setOrganizerNotes(updates.getOrganizerNotes());

        return invitationRepository.save(existing);
    }

    public void deleteInvitation(Long id) {
        invitationRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public FamilyInvitation getByToken(String token) {
        return invitationRepository.findByInvitationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invitation token: " + token));
    }

    public FamilyInvitation submitRsvp(String token, Integer actualAttendees, FamilyInvitation.RsvpStatus status, String dietaryNotes) {
        FamilyInvitation invitation = getByToken(token);

        if (status == FamilyInvitation.RsvpStatus.ATTENDING) {
            int count = actualAttendees != null ? actualAttendees : invitation.getMaxAttendees();
            if (count > invitation.getMaxAttendees()) {
                throw new IllegalArgumentException("Attendee count cannot exceed max allowed: " + invitation.getMaxAttendees());
            }
            invitation.setActualAttendees(count);
            invitation.setRsvpStatus(FamilyInvitation.RsvpStatus.ATTENDING);
        } else {
            invitation.setActualAttendees(0);
            invitation.setRsvpStatus(status);
        }

        if (dietaryNotes != null) {
            invitation.setDietaryNotes(dietaryNotes);
        }

        return invitationRepository.save(invitation);
    }

    public Map<String, String> generateWhatsAppMessage(Long invitationId, String baseUrl) {
        FamilyInvitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found: " + invitationId));

        String inviteLink = baseUrl + "/invite/" + inv.getInvitationToken();

        String rawText = "Pranaam " + inv.getDisplayName() + "! 🌸\n\n"
                + "With the divine blessings of our elders, we cordially invite your family to the wedding celebrations of Ananya & Kabir in Udaipur.\n\n"
                + "🎫 Your Personal Digital Invitation & Entry Pass:\n"
                + inviteLink + "\n\n"
                + "Please tap the link to confirm your party attendance (Up to " + inv.getMaxAttendees() + " Guests) & dietary requests.\n\n"
                + "Warm regards,\nSinghania & Sharma Families";

        String encodedText = URLEncoder.encode(rawText, StandardCharsets.UTF_8);
        String cleanPhone = inv.getPhoneNumber().replaceAll("[^0-9]", "");
        String waLink = "https://wa.me/" + cleanPhone + "?text=" + encodedText;

        Map<String, String> result = new HashMap<>();
        result.put("messageText", rawText);
        result.put("waLink", waLink);
        result.put("inviteLink", inviteLink);
        return result;
    }
}
