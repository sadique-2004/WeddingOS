package com.weddingos.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "weddings")
public class Wedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private AppUser ownerUser;

    @Column(name = "bride_name", length = 120)
    private String brideName;

    @Column(name = "groom_name", length = 120)
    private String groomName;

    @Column(name = "wedding_date")
    private LocalDate weddingDate;

    @Column(length = 120)
    private String city;

    @Column(name = "venue_name", length = 255)
    private String venueName;

    @Column(name = "total_budget_target", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalBudgetTarget = new BigDecimal("2500000.00");

    @Column(name = "expected_guest_capacity", nullable = false)
    private Integer expectedGuestCapacity = 350;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode = "INR";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Wedding() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public AppUser getOwnerUser() { return ownerUser; }
    public void setOwnerUser(AppUser ownerUser) { this.ownerUser = ownerUser; }

    public Long getOwnerUserId() { return ownerUser != null ? ownerUser.getId() : null; }

    public String getBrideName() { return brideName; }
    public void setBrideName(String brideName) { this.brideName = brideName; }

    public String getGroomName() { return groomName; }
    public void setGroomName(String groomName) { this.groomName = groomName; }

    public LocalDate getWeddingDate() { return weddingDate; }
    public void setWeddingDate(LocalDate weddingDate) { this.weddingDate = weddingDate; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }

    public BigDecimal getTotalBudgetTarget() { return totalBudgetTarget; }
    public void setTotalBudgetTarget(BigDecimal totalBudgetTarget) { this.totalBudgetTarget = totalBudgetTarget; }

    public Integer getExpectedGuestCapacity() { return expectedGuestCapacity; }
    public void setExpectedGuestCapacity(Integer expectedGuestCapacity) { this.expectedGuestCapacity = expectedGuestCapacity; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
