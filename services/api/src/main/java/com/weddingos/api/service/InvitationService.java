package com.weddingos.api.service;

import com.weddingos.api.dto.PublicInvitationView;
import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.FamilyInvitation;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.repository.FamilyInvitationRepository;
import com.weddingos.api.security.WeddingAccessService;
import com.weddingos.api.security.WeddingModule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static com.weddingos.api.security.WeddingAccessService.weddingIdOf;

@Service
@Transactional
public class InvitationService {

    private final FamilyInvitationRepository invitationRepository;
    private final WeddingAccessService access;

    public InvitationService(FamilyInvitationRepository invitationRepository, WeddingAccessService access) {
        this.invitationRepository = invitationRepository;
        this.access = access;
    }

    /** New opaque guest tokens: 122 random bits (UUIDv4), not guessable. */
    static String newInvitationToken() {
        return "wos-" + UUID.randomUUID().toString().replace("-", "");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInvitationsWithMetrics(Long weddingId) {
        access.require(weddingId, WeddingModule.GUESTS);
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
        Wedding wedding = access.require(weddingId, WeddingModule.GUESTS).wedding();
        invitation.setId(null); // never let a client-supplied ID overwrite an existing row
        invitation.setWedding(wedding);
        // Tokens are always server-generated so clients cannot choose guessable or colliding values.
        invitation.setInvitationToken(newInvitationToken());
        invitation.setCheckedInAt(null);
        invitation.setCheckedInBy(null);
        return invitationRepository.save(invitation);
    }

    public FamilyInvitation updateInvitation(Long id, FamilyInvitation updates) {
        FamilyInvitation existing = loadAuthorized(id);

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
        invitationRepository.delete(loadAuthorized(id));
    }

    // --------------------------------------------------------------------------
    // Public guest endpoints: the opaque token is the only credential, and only
    // PublicInvitationView fields are ever returned.
    // --------------------------------------------------------------------------

    private FamilyInvitation findByToken(String token) {
        if (token == null || token.isBlank() || token.length() > 120) {
            throw new NotFoundException("Invitation not found for the supplied token.");
        }
        return invitationRepository.findByInvitationToken(token)
                .orElseThrow(() -> new NotFoundException("Invitation not found for the supplied token."));
    }

    @Transactional(readOnly = true)
    public PublicInvitationView getPublicInvitation(String token) {
        return PublicInvitationView.of(findByToken(token));
    }

    public PublicInvitationView submitRsvp(String token, Integer actualAttendees, FamilyInvitation.RsvpStatus status, String dietaryNotes) {
        if (status == null) {
            throw new BadRequestException("rsvpStatus is required.");
        }
        FamilyInvitation invitation = findByToken(token);

        if (status == FamilyInvitation.RsvpStatus.ATTENDING) {
            int count = actualAttendees != null ? actualAttendees : invitation.getMaxAttendees();
            if (count < 1 || count > invitation.getMaxAttendees()) {
                throw new BadRequestException("Attendee count must be between 1 and " + invitation.getMaxAttendees() + ".");
            }
            invitation.setActualAttendees(count);
            invitation.setRsvpStatus(FamilyInvitation.RsvpStatus.ATTENDING);
        } else {
            invitation.setActualAttendees(0);
            invitation.setRsvpStatus(status);
        }

        if (dietaryNotes != null) {
            invitation.setDietaryNotes(dietaryNotes.length() > 2000 ? dietaryNotes.substring(0, 2000) : dietaryNotes);
        }

        return PublicInvitationView.of(invitationRepository.save(invitation));
    }

    public Map<String, String> generateWhatsAppMessage(Long invitationId, String baseUrl) {
        FamilyInvitation inv = loadAuthorized(invitationId);

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

    /** Loads an invitation and checks GUESTS permission on the wedding that owns it. */
    private FamilyInvitation loadAuthorized(Long id) {
        FamilyInvitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Invitation not found: " + id));
        access.require(weddingIdOf(invitation.getWedding()), WeddingModule.GUESTS);
        return invitation;
    }
}
