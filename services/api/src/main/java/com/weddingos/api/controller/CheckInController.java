package com.weddingos.api.controller;

import com.weddingos.api.model.CheckInLog;
import com.weddingos.api.model.FamilyInvitation;
import com.weddingos.api.service.CheckInService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/check-in")
@Tag(name = "Reception & QR Check-In", description = "Endpoints for fast-track QR scanner check-in, duplicate detection (FR-CHECK-04) and manual lookup")
public class CheckInController {

    private final CheckInService checkInService;

    public CheckInController(CheckInService checkInService) {
        this.checkInService = checkInService;
    }

    @GetMapping("/search")
    @Operation(summary = "Search family invitations by name or phone for manual check-in")
    public ResponseEntity<List<FamilyInvitation>> searchFamilies(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(checkInService.searchFamilies(weddingId, q));
    }

    @PostMapping("/scan")
    @Operation(summary = "Verify QR token, admit family and detect duplicate entry attempts (FR-CHECK-04)")
    public ResponseEntity<Map<String, Object>> scanAndCheckIn(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestBody Map<String, Object> payload) {
        String token = (String) payload.get("token");
        Integer count = payload.containsKey("attendeeCount") ? Integer.parseInt(payload.get("attendeeCount").toString()) : null;
        String officer = (String) payload.get("checkedInBy");
        return ResponseEntity.ok(checkInService.verifyAndCheckIn(weddingId, token, count, officer));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get live check-in audit logs")
    public ResponseEntity<List<CheckInLog>> getLogs(@RequestParam(defaultValue = "1") Long weddingId) {
        return ResponseEntity.ok(checkInService.getRecentLogs(weddingId));
    }
}
