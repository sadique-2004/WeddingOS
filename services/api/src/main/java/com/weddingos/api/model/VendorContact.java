package com.weddingos.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_contacts")
public class VendorContact {

    public enum PaymentStage {
        PENDING, PARTIALLY_PAID, SETTLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_id", nullable = false)
    private Wedding wedding;

    @Column(name = "business_name", nullable = false, length = 150)
    private String businessName;

    @Column(name = "contact_person", nullable = false, length = 120)
    private String contactPerson;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 255)
    private String email;

    @Column(name = "total_contract_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalContractValue = BigDecimal.ZERO;

    @Column(name = "advance_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal advancePaid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_stage", nullable = false)
    private PaymentStage paymentStage = PaymentStage.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public VendorContact() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonIgnore
    public Wedding getWedding() { return wedding; }
    public void setWedding(Wedding wedding) { this.wedding = wedding; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public BigDecimal getTotalContractValue() { return totalContractValue; }
    public void setTotalContractValue(BigDecimal totalContractValue) { this.totalContractValue = totalContractValue; }

    public BigDecimal getAdvancePaid() { return advancePaid; }
    public void setAdvancePaid(BigDecimal advancePaid) { this.advancePaid = advancePaid; }

    public PaymentStage getPaymentStage() { return paymentStage; }
    public void setPaymentStage(PaymentStage paymentStage) { this.paymentStage = paymentStage; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
