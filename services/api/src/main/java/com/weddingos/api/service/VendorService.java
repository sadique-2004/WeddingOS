package com.weddingos.api.service;

import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.VendorContact;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.repository.VendorContactRepository;
import com.weddingos.api.security.WeddingAccessService;
import com.weddingos.api.security.WeddingModule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.weddingos.api.security.WeddingAccessService.weddingIdOf;

@Service
@Transactional
public class VendorService {

    private final VendorContactRepository vendorRepository;
    private final WeddingAccessService access;

    public VendorService(VendorContactRepository vendorRepository, WeddingAccessService access) {
        this.vendorRepository = vendorRepository;
        this.access = access;
    }

    @Transactional(readOnly = true)
    public List<VendorContact> getVendors(Long weddingId, String category) {
        access.require(weddingId, WeddingModule.VENDORS);
        if (category != null && !category.equalsIgnoreCase("ALL")) {
            return vendorRepository.findByWeddingIdAndCategory(weddingId, category);
        }
        return vendorRepository.findByWeddingIdOrderByBusinessNameAsc(weddingId);
    }

    public VendorContact createVendor(Long weddingId, VendorContact vendor) {
        Wedding wedding = access.require(weddingId, WeddingModule.VENDORS).wedding();
        vendor.setId(null); // never let a client-supplied ID overwrite an existing row
        vendor.setWedding(wedding);
        return vendorRepository.save(vendor);
    }

    public VendorContact updateVendor(Long id, VendorContact updates) {
        VendorContact existing = loadAuthorized(id);

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
        vendorRepository.delete(loadAuthorized(id));
    }

    /** Loads a vendor and checks VENDORS permission on the wedding that owns it. */
    private VendorContact loadAuthorized(Long id) {
        VendorContact vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vendor not found: " + id));
        access.require(weddingIdOf(vendor.getWedding()), WeddingModule.VENDORS);
        return vendor;
    }
}
