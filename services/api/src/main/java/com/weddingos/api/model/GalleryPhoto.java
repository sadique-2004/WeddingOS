package com.weddingos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gallery_photos")
public class GalleryPhoto {

    public enum ModerationStatus {
        PENDING, APPROVED, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_id", nullable = false)
    private Wedding wedding;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private WeddingEvent event;

    @Column(name = "photo_url", nullable = false, length = 500)
    private String photoUrl;

    @Column(length = 255)
    private String caption;

    @Column(name = "uploader_name", nullable = false, length = 120)
    private String uploaderName = "Wedding Guest";

    @Enumerated(EnumType.STRING)
    @Column(name = "moderation_status", nullable = false)
    private ModerationStatus moderationStatus = ModerationStatus.PENDING;

    @Column(name = "is_highlight", nullable = false)
    private Boolean isHighlight = false;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public GalleryPhoto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonIgnore
    public Wedding getWedding() { return wedding; }
    public void setWedding(Wedding wedding) { this.wedding = wedding; }

    @JsonIgnore
    public WeddingEvent getEvent() { return event; }
    public void setEvent(WeddingEvent event) { this.event = event; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public String getUploaderName() { return uploaderName; }
    public void setUploaderName(String uploaderName) { this.uploaderName = uploaderName; }

    public ModerationStatus getModerationStatus() { return moderationStatus; }
    public void setModerationStatus(ModerationStatus moderationStatus) {
        this.moderationStatus = moderationStatus;
        if (moderationStatus != ModerationStatus.PENDING) {
            this.reviewedAt = LocalDateTime.now();
        }
    }

    public Boolean getIsHighlight() { return isHighlight; }
    public void setIsHighlight(Boolean highlight) { isHighlight = highlight; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
}
