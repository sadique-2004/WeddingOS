package com.weddingos.api.controller;

import com.weddingos.api.model.WeddingEvent;
import com.weddingos.api.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@Tag(name = "Ceremonies & Itinerary", description = "Endpoints for managing wedding ceremonies, timelines, Google Maps and dress codes")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    @Operation(summary = "List all ceremonies sorted by date and sequence")
    public ResponseEntity<List<WeddingEvent>> getEvents(@RequestParam(defaultValue = "1") Long weddingId) {
        return ResponseEntity.ok(eventService.getEvents(weddingId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single ceremony by ID")
    public ResponseEntity<WeddingEvent> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping
    @Operation(summary = "Add a new ceremony to the wedding itinerary")
    public ResponseEntity<WeddingEvent> createEvent(@RequestParam(defaultValue = "1") Long weddingId,
                                                    @RequestBody WeddingEvent event) {
        return ResponseEntity.ok(eventService.createEvent(weddingId, event));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update ceremony details")
    public ResponseEntity<WeddingEvent> updateEvent(@PathVariable Long id, @RequestBody WeddingEvent event) {
        return ResponseEntity.ok(eventService.updateEvent(id, event));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete ceremony from itinerary")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
