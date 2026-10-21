package com.weddingos.api.controller;

import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/workspaces")
@Tag(name = "Workspace & Dashboard", description = "Endpoints for managing the active wedding workspace, executive countdown & budget cap")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping("/active")
    @Operation(summary = "Get active wedding workspace summary, countdown and budget health")
    public ResponseEntity<Map<String, Object>> getActiveWorkspace(
            @RequestParam(required = false) Long weddingId,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String clerkUserId,
            @RequestParam(required = false) String userName,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail,
            @RequestHeader(value = "X-Clerk-User-Id", required = false) String headerClerkId) {
        String effectiveEmail = (userEmail != null && !userEmail.isBlank()) ? userEmail : headerEmail;
        String effectiveClerkId = (clerkUserId != null && !clerkUserId.isBlank()) ? clerkUserId : headerClerkId;
        return ResponseEntity.ok(workspaceService.getWorkspaceForUser(effectiveEmail, effectiveClerkId, userName, weddingId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get workspace details for a specific wedding ID")
    public ResponseEntity<Map<String, Object>> getWorkspaceById(@PathVariable Long id) {
        return ResponseEntity.ok(workspaceService.getActiveWorkspaceSummary(id));
    }

    @PostMapping
    @Operation(summary = "Create a new wedding workspace for a couple/organizer")
    public ResponseEntity<Wedding> createWorkspace(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail,
            @RequestHeader(value = "X-Clerk-User-Id", required = false) String headerClerkId) {
        String bride = (String) payload.get("brideName");
        String groom = (String) payload.get("groomName");
        LocalDate date = payload.containsKey("weddingDate") ? LocalDate.parse(payload.get("weddingDate").toString()) : null;
        String city = (String) payload.get("city");
        String venue = (String) payload.get("venueName");
        BigDecimal budget = payload.containsKey("totalBudgetTarget") ? new BigDecimal(payload.get("totalBudgetTarget").toString())
                : (payload.containsKey("totalBudget") ? new BigDecimal(payload.get("totalBudget").toString()) : null);
        Long ownerUserId = payload.containsKey("ownerUserId") ? Long.valueOf(payload.get("ownerUserId").toString()) : null;
        String slug = (String) payload.get("slug");
        return ResponseEntity.ok(workspaceService.createWorkspace(ownerUserId, headerEmail, headerClerkId, bride, groom, date, city, venue, budget, slug));
    }

    @PutMapping("/budget")
    @Operation(summary = "Adjust total wedding budget target cap")
    public ResponseEntity<Wedding> updateBudgetTarget(
            @RequestParam(required = false) Long weddingId,
            @RequestBody Map<String, Object> payload) {
        Long targetWid = weddingId;
        if (targetWid == null && payload.containsKey("weddingId")) {
            try {
                targetWid = Long.valueOf(payload.get("weddingId").toString());
            } catch (Exception ignored) {}
        }
        if (payload.get("totalBudgetTarget") == null) {
            throw new BadRequestException("totalBudgetTarget is required.");
        }
        BigDecimal amount = new BigDecimal(payload.get("totalBudgetTarget").toString());
        return ResponseEntity.ok(workspaceService.updateBudgetTarget(targetWid, amount));
    }

    @PutMapping("/details")
    @Operation(summary = "Update wedding general details and countdown date")
    public ResponseEntity<Wedding> updateDetails(
            @RequestParam(required = false) Long weddingId,
            @RequestBody Map<String, String> payload) {
        Long targetWid = weddingId;
        if (targetWid == null && payload.containsKey("weddingId")) {
            try {
                targetWid = Long.valueOf(payload.get("weddingId"));
            } catch (Exception ignored) {}
        }
        String bride = payload.get("brideName");
        String groom = payload.get("groomName");
        LocalDate date = (payload.containsKey("weddingDate") && payload.get("weddingDate") != null && !payload.get("weddingDate").isEmpty())
                ? LocalDate.parse(payload.get("weddingDate")) : null;
        String city = payload.get("city");
        String venue = payload.get("venueName");
        String slug = payload.get("slug");
        return ResponseEntity.ok(workspaceService.updateWeddingDetails(targetWid, bride, groom, date, city, venue, slug));
    }

    // Destructive reset is disabled until the API authenticates callers and checks wedding membership.
    // These handlers never call WorkspaceService.resetWorkspaceData, so no data is deleted.
    static final String RESET_DISABLED_MESSAGE =
            "Workspace reset is temporarily disabled. No data was changed.";

    @PostMapping("/reset")
    @Operation(summary = "Reset all workspace data (temporarily disabled; always returns 403)")
    public ResponseEntity<Map<String, Object>> resetWorkspace() {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, RESET_DISABLED_MESSAGE);
    }

    @PostMapping("/{id}/reset")
    @Operation(summary = "Reset workspace data by ID (temporarily disabled; always returns 403)")
    public ResponseEntity<Map<String, Object>> resetWorkspaceById(@PathVariable String id) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, RESET_DISABLED_MESSAGE);
    }
}

