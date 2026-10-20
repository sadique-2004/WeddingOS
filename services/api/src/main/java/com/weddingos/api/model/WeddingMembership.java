package com.weddingos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wedding_memberships", uniqueConstraints = {
    @UniqueConstraint(name = "uq_membership_user", columnNames = {"wedding_id", "user_id"})
})
public class WeddingMembership {

    public enum Role {
        ADMIN, ORGANIZER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_id", nullable = false)
    private Wedding wedding;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.ORGANIZER;

    @Column(length = 120)
    private String title;

    @Column(name = "can_manage_events", nullable = false)
    private Boolean canManageEvents = true;

    @Column(name = "can_manage_tasks", nullable = false)
    private Boolean canManageTasks = true;

    @Column(name = "can_manage_guests", nullable = false)
    private Boolean canManageGuests = true;

    @Column(name = "can_check_in_guests", nullable = false)
    private Boolean canCheckInGuests = true;

    @Column(name = "can_manage_expenses", nullable = false)
    private Boolean canManageExpenses = false;

    @Column(name = "can_manage_vendors", nullable = false)
    private Boolean canManageVendors = false;

    @Column(name = "can_manage_website", nullable = false)
    private Boolean canManageWebsite = false;

    @Column(name = "can_moderate_gallery", nullable = false)
    private Boolean canModerateGallery = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public WeddingMembership() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonIgnore
    public Wedding getWedding() { return wedding; }
    public void setWedding(Wedding wedding) { this.wedding = wedding; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Boolean getCanManageEvents() { return canManageEvents; }
    public void setCanManageEvents(Boolean val) { this.canManageEvents = val; }

    public Boolean getCanManageTasks() { return canManageTasks; }
    public void setCanManageTasks(Boolean val) { this.canManageTasks = val; }

    public Boolean getCanManageGuests() { return canManageGuests; }
    public void setCanManageGuests(Boolean val) { this.canManageGuests = val; }

    public Boolean getCanCheckInGuests() { return canCheckInGuests; }
    public void setCanCheckInGuests(Boolean val) { this.canCheckInGuests = val; }

    public Boolean getCanManageExpenses() { return canManageExpenses; }
    public void setCanManageExpenses(Boolean val) { this.canManageExpenses = val; }

    public Boolean getCanManageVendors() { return canManageVendors; }
    public void setCanManageVendors(Boolean val) { this.canManageVendors = val; }

    public Boolean getCanManageWebsite() { return canManageWebsite; }
    public void setCanManageWebsite(Boolean val) { this.canManageWebsite = val; }

    public Boolean getCanModerateGallery() { return canModerateGallery; }
    public void setCanModerateGallery(Boolean val) { this.canModerateGallery = val; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
