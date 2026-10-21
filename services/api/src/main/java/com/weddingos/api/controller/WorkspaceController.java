package com.weddingos.api.controller;

import com.weddingos.api.model.Wedding;
import com.weddingos.api.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Map<String, Object>> getActiveWorkspace(@RequestParam(defaultValue = "1") Long weddingId) {
        return ResponseEntity.ok(workspaceService.getActiveWorkspaceSummary(weddingId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get workspace details for a specific wedding ID")
    public ResponseEntity<Map<String, Object>> getWorkspaceById(@PathVariable Long id) {
        return ResponseEntity.ok(workspaceService.getActiveWorkspaceSummary(id));
    }

    @PostMapping
    @Operation(summary = "Create a new wedding workspace for a couple/organizer")
    public ResponseEntity<Wedding> createWorkspace(@RequestBody Map<String, Object> payload) {
        String bride = (String) payload.get("brideName");
        String groom = (String) payload.get("groomName");
        LocalDate date = payload.containsKey("weddingDate") ? LocalDate.parse(payload.get("weddingDate").toString()) : null;
        String city = (String) payload.get("city");
        String venue = (String) payload.get("venueName");
        BigDecimal budget = payload.containsKey("totalBudgetTarget") ? new BigDecimal(payload.get("totalBudgetTarget").toString())
                : (payload.containsKey("totalBudget") ? new BigDecimal(payload.get("totalBudget").toString()) : null);
        Long ownerUserId = payload.containsKey("ownerUserId") ? Long.valueOf(payload.get("ownerUserId").toString()) : null;
        String slug = (String) payload.get("slug");
        return ResponseEntity.ok(workspaceService.createWorkspace(ownerUserId, bride, groom, date, city, venue, budget, slug));
    }

    @PutMapping("/budget")
    @Operation(summary = "Adjust total wedding budget target cap")
    public ResponseEntity<Wedding> updateBudgetTarget(@RequestBody Map<String, Object> payload) {
        BigDecimal amount = new BigDecimal(payload.get("totalBudgetTarget").toString());
        return ResponseEntity.ok(workspaceService.updateBudgetTarget(1L, amount));
    }

    @PutMapping("/details")
    @Operation(summary = "Update wedding general details and countdown date")
    public ResponseEntity<Wedding> updateDetails(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestBody Map<String, String> payload) {
        String bride = payload.get("brideName");
        String groom = payload.get("groomName");
        LocalDate date = (payload.containsKey("weddingDate") && payload.get("weddingDate") != null && !payload.get("weddingDate").isEmpty())
                ? LocalDate.parse(payload.get("weddingDate")) : null;
        String city = payload.get("city");
        String venue = payload.get("venueName");
        String slug = payload.get("slug");
        return ResponseEntity.ok(workspaceService.updateWeddingDetails(weddingId, bride, groom, date, city, venue, slug));
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset all workspace data to a clean blank slate")
    public ResponseEntity<Map<String, Object>> resetWorkspace(@RequestParam(defaultValue = "1") Long weddingId) {
        return ResponseEntity.ok(workspaceService.resetWorkspaceData(weddingId));
    }

    @PostMapping("/{id}/reset")
    @Operation(summary = "Reset workspace data by ID")
    public ResponseEntity<Map<String, Object>> resetWorkspaceById(@PathVariable Long id) {
        return ResponseEntity.ok(workspaceService.resetWorkspaceData(id));
    }
}

