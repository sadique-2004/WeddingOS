package com.weddingos.api.controller;

import com.weddingos.api.model.WeddingMembership;
import com.weddingos.api.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/members")
@Tag(name = "Team & Permissions", description = "Endpoints for managing workspace organizers, ADMIN vs ORGANIZER roles, 8-module permission matrix and FR-MEM-06 protection")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    @Operation(summary = "Get team roster with roles and module permissions")
    public ResponseEntity<List<WeddingMembership>> getMembers(@RequestParam(defaultValue = "1") Long weddingId) {
        return ResponseEntity.ok(memberService.getMembers(weddingId));
    }

    @PostMapping("/invite")
    @Operation(summary = "Invite a new organizer to the wedding workspace")
    public ResponseEntity<WeddingMembership> inviteMember(
            @RequestParam(defaultValue = "1") Long weddingId,
            @RequestBody Map<String, String> payload) {
        String fullName = payload.get("fullName");
        String email = payload.get("email");
        WeddingMembership.Role role = WeddingMembership.Role.valueOf(payload.getOrDefault("role", "ORGANIZER").toUpperCase());
        String title = payload.get("title");
        return ResponseEntity.ok(memberService.inviteMember(weddingId, fullName, email, role, title));
    }

    @PutMapping("/{id}/permissions")
    @Operation(summary = "Update 8-module permission matrix for an organizer")
    public ResponseEntity<WeddingMembership> updatePermissions(
            @PathVariable Long id,
            @RequestBody WeddingMembership permissions) {
        return ResponseEntity.ok(memberService.updatePermissions(id, permissions));
    }

    @PutMapping("/{id}/role")
    @Operation(summary = "Switch role between ADMIN and ORGANIZER (Protected by FR-MEM-06 last-admin invariant)")
    public ResponseEntity<WeddingMembership> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        WeddingMembership.Role newRole = WeddingMembership.Role.valueOf(payload.get("role").toUpperCase());
        return ResponseEntity.ok(memberService.updateRole(id, newRole));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove organizer from workspace (Protected by FR-MEM-06 last-admin invariant)")
    public ResponseEntity<Void> removeMember(@PathVariable Long id) {
        memberService.removeMember(id);
        return ResponseEntity.noContent().build();
    }
}
