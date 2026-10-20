package com.weddingos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "check_in_logs")
public class CheckInLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_id", nullable = false)
    private Wedding wedding;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id", nullable = false)
    private FamilyInvitation invitation;

    @Column(name = "family_name", nullable = false, length = 150)
    private String familyName;

    @Column(name = "primary_contact", nullable = false, length = 120)
    private String primaryContact;

    @Column(name = "attendee_count", nullable = false)
    private Integer attendeeCount;

    @Column(name = "max_attendees", nullable = false)
    private Integer maxAttendees;

    @Column(nullable = false, length = 60)
    private String circle;

    @Column(name = "checked_in_by", nullable = false, length = 120)
    private String checkedInBy;

    @Column(name = "is_duplicate_attempt", nullable = false)
    private Boolean isDuplicateAttempt = false;

    @Column(name = "scanned_at", nullable = false, updatable = false)
    private LocalDateTime scannedAt = LocalDateTime.now();

    public CheckInLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonIgnore
    public Wedding getWedding() { return wedding; }
    public void setWedding(Wedding wedding) { this.wedding = wedding; }

    @JsonIgnore
    public FamilyInvitation getInvitation() { return invitation; }
    public void setInvitation(FamilyInvitation invitation) { this.invitation = invitation; }

    public String getFamilyName() { return familyName; }
    public void setFamilyName(String familyName) { this.familyName = familyName; }

    public String getPrimaryContact() { return primaryContact; }
    public void setPrimaryContact(String primaryContact) { this.primaryContact = primaryContact; }

    public Integer getAttendeeCount() { return attendeeCount; }
    public void setAttendeeCount(Integer attendeeCount) { this.attendeeCount = attendeeCount; }

    public Integer getMaxAttendees() { return maxAttendees; }
    public void setMaxAttendees(Integer maxAttendees) { this.maxAttendees = maxAttendees; }

    public String getCircle() { return circle; }
    public void setCircle(String circle) { this.circle = circle; }

    public String getCheckedInBy() { return checkedInBy; }
    public void setCheckedInBy(String checkedInBy) { this.checkedInBy = checkedInBy; }

    public Boolean getIsDuplicateAttempt() { return isDuplicateAttempt; }
    public void setIsDuplicateAttempt(Boolean duplicateAttempt) { isDuplicateAttempt = duplicateAttempt; }

    public LocalDateTime getScannedAt() { return scannedAt; }
}
