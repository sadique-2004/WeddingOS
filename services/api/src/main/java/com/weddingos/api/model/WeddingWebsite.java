package com.weddingos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wedding_websites")
public class WeddingWebsite {

    public enum ThemeKey {
        ROYAL_UDAIPUR, EMERALD_PALACE, MARIGOLD_FESTIVE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_id", nullable = false, unique = true)
    private Wedding wedding;

    @Enumerated(EnumType.STRING)
    @Column(name = "theme_key", nullable = false)
    private ThemeKey themeKey = ThemeKey.ROYAL_UDAIPUR;

    @Column(name = "welcome_headline", nullable = false)
    private String welcomeHeadline = "Celebrating Our Sacred Union";

    @Column(name = "welcome_message", nullable = false, columnDefinition = "TEXT")
    private String welcomeMessage;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;

    @Column(name = "show_schedule", nullable = false)
    private Boolean showSchedule = true;

    @Column(name = "show_dress_code", nullable = false)
    private Boolean showDressCode = true;

    @Column(name = "show_venues", nullable = false)
    private Boolean showVenues = true;

    @Column(name = "show_livestream", nullable = false)
    private Boolean showLivestream = false;

    @Column(name = "livestream_url", length = 500)
    private String livestreamUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public WeddingWebsite() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonIgnore
    public Wedding getWedding() { return wedding; }
    public void setWedding(Wedding wedding) { this.wedding = wedding; }

    public ThemeKey getThemeKey() { return themeKey; }
    public void setThemeKey(ThemeKey themeKey) { this.themeKey = themeKey; }

    public String getWelcomeHeadline() { return welcomeHeadline; }
    public void setWelcomeHeadline(String welcomeHeadline) { this.welcomeHeadline = welcomeHeadline; }

    public String getWelcomeMessage() { return welcomeMessage; }
    public void setWelcomeMessage(String welcomeMessage) { this.welcomeMessage = welcomeMessage; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean published) { isPublished = published; }

    public Boolean getShowSchedule() { return showSchedule; }
    public void setShowSchedule(Boolean showSchedule) { this.showSchedule = showSchedule; }

    public Boolean getShowDressCode() { return showDressCode; }
    public void setShowDressCode(Boolean showDressCode) { this.showDressCode = showDressCode; }

    public Boolean getShowVenues() { return showVenues; }
    public void setShowVenues(Boolean showVenues) { this.showVenues = showVenues; }

    public Boolean getShowLivestream() { return showLivestream; }
    public void setShowLivestream(Boolean showLivestream) { this.showLivestream = showLivestream; }

    public String getLivestreamUrl() { return livestreamUrl; }
    public void setLivestreamUrl(String livestreamUrl) { this.livestreamUrl = livestreamUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
