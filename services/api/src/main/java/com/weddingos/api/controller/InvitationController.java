package com.weddingos.api.controller;

import com.weddingos.api.model.FamilyInvitation;
import com.weddingos.api.service.InvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Family Invitations & RSVP", description = "Endpoints for managing family invitations, bilingual WhatsApp dispatch and public guest RSVPs")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @GetMapping("/invitations")
    @Operation(summary = "Get all family invitations with attendance metrics")
    public ResponseEntity<Map<String, Object>> getInvitations(@RequestParam Long weddingId) {
        return ResponseEntity.ok(invitationService.getInvitationsWithMetrics(weddingId));
    }

    @PostMapping("/invitations")
    @Operation(summary = "Create a new family invitation unit")
    public ResponseEntity<FamilyInvitation> createInvitation(
            @RequestParam Long weddingId,
            @RequestBody FamilyInvitation invitation) {
        return ResponseEntity.ok(invitationService.createInvitation(weddingId, invitation));
    }

    @PutMapping("/invitations/{id}")
    @Operation(summary = "Update family invitation details")
    public ResponseEntity<FamilyInvitation> updateInvitation(@PathVariable Long id, @RequestBody FamilyInvitation invitation) {
        return ResponseEntity.ok(invitationService.updateInvitation(id, invitation));
    }

    @DeleteMapping("/invitations/{id}")
    @Operation(summary = "Delete family invitation")
    public ResponseEntity<Void> deleteInvitation(@PathVariable Long id) {
        invitationService.deleteInvitation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/invitations/{id}/whatsapp")
    @Operation(summary = "Generate pre-composed WhatsApp message and wa.me link for an invitation")
    public ResponseEntity<Map<String, String>> getWhatsAppMessage(
            @PathVariable Long id,
            @RequestParam(defaultValue = "http://localhost:5173") String baseUrl) {
        return ResponseEntity.ok(invitationService.generateWhatsAppMessage(id, baseUrl));
    }

    // --------------------------------------------------------------------------
    // Public Guest Pass & RSVP Endpoints (No Organizer Login Required)
    // --------------------------------------------------------------------------
    @GetMapping("/public/invite/{token}")
    @Operation(summary = "Public endpoint for guest digital pass and live QR lookup")
    public ResponseEntity<FamilyInvitation> getPublicInvitation(@PathVariable String token) {
        return ResponseEntity.ok(invitationService.getByToken(token));
    }

    @PostMapping("/public/invite/{token}/rsvp")
    @Operation(summary = "Public endpoint for guest RSVP confirmation submission")
    public ResponseEntity<FamilyInvitation> submitPublicRsvp(
            @PathVariable String token,
            @RequestBody Map<String, Object> payload) {
        Integer count = payload.containsKey("actualAttendees") ? Integer.parseInt(payload.get("actualAttendees").toString()) : null;
        FamilyInvitation.RsvpStatus status = FamilyInvitation.RsvpStatus.valueOf(payload.get("rsvpStatus").toString());
        String dietaryNotes = (String) payload.get("dietaryNotes");
        return ResponseEntity.ok(invitationService.submitRsvp(token, count, status, dietaryNotes));
    }
}
