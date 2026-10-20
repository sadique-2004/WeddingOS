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
    public ResponseEntity<Map<String, Object>> getActiveWorkspace() {
        // Default to workspace 1 for demo
        return ResponseEntity.ok(workspaceService.getActiveWorkspaceSummary(1L));
    }

    @PutMapping("/budget")
    @Operation(summary = "Adjust total wedding budget target cap")
    public ResponseEntity<Wedding> updateBudgetTarget(@RequestBody Map<String, Object> payload) {
        BigDecimal amount = new BigDecimal(payload.get("totalBudgetTarget").toString());
        return ResponseEntity.ok(workspaceService.updateBudgetTarget(1L, amount));
    }

    @PutMapping("/details")
    @Operation(summary = "Update wedding general details and countdown date")
    public ResponseEntity<Wedding> updateDetails(@RequestBody Map<String, String> payload) {
        String bride = payload.get("brideName");
        String groom = payload.get("groomName");
        LocalDate date = payload.containsKey("weddingDate") ? LocalDate.parse(payload.get("weddingDate")) : null;
        String city = payload.get("city");
        String venue = payload.get("venueName");
        return ResponseEntity.ok(workspaceService.updateWeddingDetails(1L, bride, groom, date, city, venue));
    }
}
