package com.weddingos.api.controller;

import com.weddingos.api.model.WeddingWebsite;
import com.weddingos.api.service.WebsiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Website Studio & Public Site", description = "Endpoints for customizing the wedding website theme and serving the public wedding website by slug")
public class WebsiteController {

    private final WebsiteService websiteService;

    public WebsiteController(WebsiteService websiteService) {
        this.websiteService = websiteService;
    }

    @GetMapping("/website")
    @Operation(summary = "Get wedding website studio configuration and theme")
    public ResponseEntity<WeddingWebsite> getWebsiteConfig(@RequestParam(defaultValue = "1") Long weddingId) {
        return ResponseEntity.ok(websiteService.getWebsiteConfig(weddingId));
    }

    @PutMapping("/website")
    @Operation(summary = "Update website theme, welcome headline, copy and livestream URL")
    public ResponseEntity<WeddingWebsite> updateWebsiteConfig(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestBody WeddingWebsite config) {
        return ResponseEntity.ok(websiteService.updateWebsiteConfig(weddingId, config));
    }

    // Public guest wedding website by slug (e.g. /w/ananya-kabir)
    @GetMapping("/public/w/{slug}")
    @Operation(summary = "Public endpoint serving guest wedding website by slug")
    public ResponseEntity<Map<String, Object>> getPublicWebsite(@PathVariable String slug) {
        return ResponseEntity.ok(websiteService.getPublicWebsiteBySlug(slug));
    }
}
