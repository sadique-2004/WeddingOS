package com.weddingos.api.controller;

import com.weddingos.api.model.VendorContact;
import com.weddingos.api.service.VendorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vendors")
@Tag(name = "Vendor Directory", description = "Endpoints for managing wedding vendor contacts, contracts, advance settlements and categories")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @GetMapping
    @Operation(summary = "Get list of vendors with optional category filtering")
    public ResponseEntity<List<VendorContact>> getVendors(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(vendorService.getVendors(weddingId, category));
    }

    @PostMapping
    @Operation(summary = "Register a new vendor in the workspace")
    public ResponseEntity<VendorContact> createVendor(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestBody VendorContact vendor) {
        return ResponseEntity.ok(vendorService.createVendor(weddingId, vendor));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update vendor details or payment stage")
    public ResponseEntity<VendorContact> updateVendor(@PathVariable Long id, @RequestBody VendorContact vendor) {
        return ResponseEntity.ok(vendorService.updateVendor(id, vendor));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove vendor from directory")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }
}
