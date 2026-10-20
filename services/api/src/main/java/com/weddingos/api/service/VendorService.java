package com.weddingos.api.service;

import com.weddingos.api.model.VendorContact;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.repository.VendorContactRepository;
import com.weddingos.api.repository.WeddingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class VendorService {

    private final VendorContactRepository vendorRepository;
    private final WeddingRepository weddingRepository;

    public VendorService(VendorContactRepository vendorRepository, WeddingRepository weddingRepository) {
        this.vendorRepository = vendorRepository;
        this.weddingRepository = weddingRepository;
    }

    @Transactional(readOnly = true)
    public List<VendorContact> getVendors(Long weddingId, String category) {
        if (category != null && !category.equalsIgnoreCase("ALL")) {
            return vendorRepository.findByWeddingIdAndCategory(weddingId, category);
        }
        return vendorRepository.findByWeddingIdOrderByBusinessNameAsc(weddingId);
    }

    public VendorContact createVendor(Long weddingId, VendorContact vendor) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new IllegalArgumentException("Wedding not found: " + weddingId));
        vendor.setWedding(wedding);
        return vendorRepository.save(vendor);
    }

    public VendorContact updateVendor(Long id, VendorContact updates) {
        VendorContact existing = vendorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + id));

        if (updates.getBusinessName() != null) existing.setBusinessName(updates.getBusinessName());
        if (updates.getContactPerson() != null) existing.setContactPerson(updates.getContactPerson());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getPhone() != null) existing.setPhone(updates.getPhone());
        if (updates.getEmail() != null) existing.setEmail(updates.getEmail());
        if (updates.getTotalContractValue() != null) existing.setTotalContractValue(updates.getTotalContractValue());
        if (updates.getAdvancePaid() != null) existing.setAdvancePaid(updates.getAdvancePaid());
        if (updates.getPaymentStage() != null) existing.setPaymentStage(updates.getPaymentStage());
        if (updates.getNotes() != null) existing.setNotes(updates.getNotes());

        return vendorRepository.save(existing);
    }

    public void deleteVendor(Long id) {
        vendorRepository.deleteById(id);
    }
}
