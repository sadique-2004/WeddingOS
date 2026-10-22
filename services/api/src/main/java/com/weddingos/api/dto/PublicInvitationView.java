package com.weddingos.api.dto;

import com.weddingos.api.model.FamilyInvitation;
import com.weddingos.api.model.Wedding;

import java.time.LocalDate;

/**
 * What a guest holding an invitation token may see. Deliberately excludes the internal ID,
 * phone number, email, organizer notes and who checked the family in.
 */
public record PublicInvitationView(
        String invitationToken,
        String displayName,
        String primaryContactName,
        String circle,
        Integer maxAttendees,
        Integer actualAttendees,
        String rsvpStatus,
        String dietaryNotes,
        boolean checkedIn,
        String brideName,
        String groomName,
        LocalDate weddingDate,
        String city,
        String venueName,
        String slug
) {
    public PublicInvitationView(
            String invitationToken,
            String displayName,
            String primaryContactName,
            String circle,
            Integer maxAttendees,
            Integer actualAttendees,
            String rsvpStatus,
            String dietaryNotes,
            boolean checkedIn,
            String brideName,
            String groomName,
            LocalDate weddingDate,
            String city,
            String venueName
    ) {
        this(invitationToken, displayName, primaryContactName, circle, maxAttendees, actualAttendees,
                rsvpStatus, dietaryNotes, checkedIn, brideName, groomName, weddingDate, city, venueName, null);
    }

    public static PublicInvitationView of(FamilyInvitation inv) {
        return of(inv, null);
    }

    public static PublicInvitationView of(FamilyInvitation inv, String slug) {
        Wedding w = inv.getWedding();
        return new PublicInvitationView(
                inv.getInvitationToken(),
                inv.getDisplayName(),
                inv.getPrimaryContactName(),
                inv.getCircle(),
                inv.getMaxAttendees(),
                inv.getActualAttendees(),
                inv.getRsvpStatus() != null ? inv.getRsvpStatus().name() : null,
                inv.getDietaryNotes(),
                inv.getCheckedInAt() != null,
                w != null ? w.getBrideName() : null,
                w != null ? w.getGroomName() : null,
                w != null ? w.getWeddingDate() : null,
                w != null ? w.getCity() : null,
                w != null ? w.getVenueName() : null,
                slug
        );
    }
}
