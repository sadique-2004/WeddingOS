package com.weddingos.api.controller;

import com.weddingos.api.dto.PublicPhotoView;
import com.weddingos.api.service.GalleryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Public guest gallery for a published wedding, addressed only by its unique slug.
 * Returns approved photos only; uploads always go to the organizers' moderation queue.
 */
@RestController
@RequestMapping("/api/v1/public/w/{slug}/gallery")
@Tag(name = "Public Gallery", description = "Guest gallery for a published wedding website (no login)")
public class PublicGalleryController {

    private final GalleryService galleryService;

    public PublicGalleryController(GalleryService galleryService) {
        this.galleryService = galleryService;
    }

    @GetMapping
    @Operation(summary = "Approved photos of a published wedding")
    public ResponseEntity<List<PublicPhotoView>> getApprovedPhotos(@PathVariable String slug) {
        return ResponseEntity.ok(galleryService.getPublicApprovedPhotos(slug));
    }

    @PostMapping(value = "/upload-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Guest photo contribution (placed in the moderation queue)")
    public ResponseEntity<PublicPhotoView> uploadPhoto(
            @PathVariable String slug,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String caption,
            @RequestParam(required = false, defaultValue = "Wedding Guest") String uploaderName) throws IOException {
        return ResponseEntity.ok(galleryService.uploadPublicPhoto(slug, file, caption, uploaderName));
    }
}
