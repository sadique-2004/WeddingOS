package com.weddingos.api.controller;

import com.weddingos.api.model.GalleryPhoto;
import com.weddingos.api.service.GalleryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/gallery")
@Tag(name = "Photo Gallery & Moderation", description = "Endpoints for managing event albums, public approved photos, and organizer moderation queue (FR-GAL-02)")
public class GalleryController {

    private final GalleryService galleryService;

    public GalleryController(GalleryService galleryService) {
        this.galleryService = galleryService;
    }

    @GetMapping
    @Operation(summary = "Get approved wedding photos visible to guests")
    public ResponseEntity<List<GalleryPhoto>> getApprovedPhotos(@RequestParam(defaultValue = "1") Long weddingId) {
        return ResponseEntity.ok(galleryService.getApprovedPhotos(weddingId));
    }

    @GetMapping("/moderation")
    @Operation(summary = "Get pending photo moderation queue for organizers")
    public ResponseEntity<List<GalleryPhoto>> getModerationQueue(@RequestParam(defaultValue = "1") Long weddingId) {
        return ResponseEntity.ok(galleryService.getPendingModerationQueue(weddingId));
    }

    @PostMapping("/upload")
    @Operation(summary = "Guest photo contribution (placed into moderation queue)")
    public ResponseEntity<GalleryPhoto> uploadPhoto(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestBody GalleryPhoto photo) {
        return ResponseEntity.ok(galleryService.uploadGuestPhoto(weddingId, photo));
    }

    @PostMapping(value = "/upload-file", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image file directly to Cloudinary and register in wedding gallery")
    public ResponseEntity<GalleryPhoto> uploadPhotoFile(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(required = false) String caption,
            @RequestParam(required = false, defaultValue = "Guest Candids") String ceremonyTag,
            @RequestParam(required = false, defaultValue = "Wedding Guest") String uploaderName
    ) throws java.io.IOException {
        return ResponseEntity.ok(galleryService.uploadPhotoFile(weddingId, file, caption, ceremonyTag, uploaderName));
    }

    @PostMapping("/{id}/moderate")
    @Operation(summary = "Approve or reject a pending guest photo")
    public ResponseEntity<GalleryPhoto> moderatePhoto(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        GalleryPhoto.ModerationStatus status = GalleryPhoto.ModerationStatus.valueOf(payload.get("status").toUpperCase());
        return ResponseEntity.ok(galleryService.moderatePhoto(id, status));
    }

    @PatchMapping("/{id}/highlight")
    @Operation(summary = "Toggle photo pinned to top highlights")
    public ResponseEntity<GalleryPhoto> toggleHighlight(@PathVariable Long id) {
        return ResponseEntity.ok(galleryService.toggleHighlight(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete photo")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long id) {
        galleryService.deletePhoto(id);
        return ResponseEntity.noContent().build();
    }
}
