package com.weddingos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "family_invitations")
public class FamilyInvitation {

    public enum RsvpStatus {
        PENDING, ATTENDING, NOT_ATTENDING
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_id", nullable = false)
    private Wedding wedding;

    @Column(name = "display_name", nullable = false, length = 150)
    private String displayName;

    @Column(name = "primary_contact_name", nullable = false, length = 120)
    private String primaryContactName;

    @Column(name = "phone_number", nullable = false, length = 30)
    private String phoneNumber;

    @Column(length = 255)
    private String email;

    @Column(nullable = false, length = 60)
    private String circle = "Nanihal (Maternal)";

    @Column(name = "max_attendees", nullable = false)
    private Integer maxAttendees = 4;

    @Column(name = "actual_attendees", nullable = false)
    private Integer actualAttendees = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "rsvp_status", nullable = false)
    private RsvpStatus rsvpStatus = RsvpStatus.PENDING;

    @Column(name = "dietary_notes", columnDefinition = "TEXT")
    private String dietaryNotes;

    @Column(name = "invitation_token", nullable = false, unique = true, length = 120)
    private String invitationToken;

    @Column(name = "organizer_notes", columnDefinition = "TEXT")
    private String organizerNotes;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "checked_in_by", length = 120)
    private String checkedInBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public FamilyInvitation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonIgnore
    public Wedding getWedding() { return wedding; }
    public void setWedding(Wedding wedding) { this.wedding = wedding; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getPrimaryContactName() { return primaryContactName; }
    public void setPrimaryContactName(String primaryContactName) { this.primaryContactName = primaryContactName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCircle() { return circle; }
    public void setCircle(String circle) { this.circle = circle; }

    public Integer getMaxAttendees() { return maxAttendees; }
    public void setMaxAttendees(Integer maxAttendees) { this.maxAttendees = maxAttendees; }

    public Integer getActualAttendees() { return actualAttendees; }
    public void setActualAttendees(Integer actualAttendees) { this.actualAttendees = actualAttendees; }

    public RsvpStatus getRsvpStatus() { return rsvpStatus; }
    public void setRsvpStatus(RsvpStatus rsvpStatus) { this.rsvpStatus = rsvpStatus; }

    public String getDietaryNotes() { return dietaryNotes; }
    public void setDietaryNotes(String dietaryNotes) { this.dietaryNotes = dietaryNotes; }

    public String getInvitationToken() { return invitationToken; }
    public void setInvitationToken(String invitationToken) { this.invitationToken = invitationToken; }

    public String getOrganizerNotes() { return organizerNotes; }
    public void setOrganizerNotes(String organizerNotes) { this.organizerNotes = organizerNotes; }

    public LocalDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; }

    public String getCheckedInBy() { return checkedInBy; }
    public void setCheckedInBy(String checkedInBy) { this.checkedInBy = checkedInBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
