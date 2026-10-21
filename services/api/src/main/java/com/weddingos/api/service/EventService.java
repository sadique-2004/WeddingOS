package com.weddingos.api.service;

import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.WeddingEvent;
import com.weddingos.api.repository.WeddingEventRepository;
import com.weddingos.api.security.WeddingAccessService;
import com.weddingos.api.security.WeddingModule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.weddingos.api.security.WeddingAccessService.weddingIdOf;

@Service
@Transactional
public class EventService {

    private final WeddingEventRepository eventRepository;
    private final WeddingAccessService access;

    public EventService(WeddingEventRepository eventRepository, WeddingAccessService access) {
        this.eventRepository = eventRepository;
        this.access = access;
    }

    @Transactional(readOnly = true)
    public List<WeddingEvent> getEvents(Long weddingId) {
        access.require(weddingId, WeddingModule.EVENTS);
        return eventRepository.findByWeddingIdOrderByEventDateAscSequenceOrderAsc(weddingId);
    }

    @Transactional(readOnly = true)
    public WeddingEvent getEventById(Long eventId) {
        return loadAuthorized(eventId);
    }

    public WeddingEvent createEvent(Long weddingId, WeddingEvent event) {
        var granted = access.require(weddingId, WeddingModule.EVENTS);
        event.setId(null); // never let a client-supplied ID overwrite an existing row
        event.setWedding(granted.wedding());
        return eventRepository.save(event);
    }

    public WeddingEvent updateEvent(Long eventId, WeddingEvent updates) {
        WeddingEvent existing = loadAuthorized(eventId);

        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getEventType() != null) existing.setEventType(updates.getEventType());
        if (updates.getEventDate() != null) existing.setEventDate(updates.getEventDate());
        if (updates.getDayLabel() != null) existing.setDayLabel(updates.getDayLabel());
        if (updates.getStartTime() != null) existing.setStartTime(updates.getStartTime());
        if (updates.getEndTime() != null) existing.setEndTime(updates.getEndTime());
        if (updates.getVenueName() != null) existing.setVenueName(updates.getVenueName());
        if (updates.getAddress() != null) existing.setAddress(updates.getAddress());
        if (updates.getMapUrl() != null) existing.setMapUrl(updates.getMapUrl());
        if (updates.getDressCode() != null) existing.setDressCode(updates.getDressCode());
        if (updates.getCoverImageUrl() != null) existing.setCoverImageUrl(updates.getCoverImageUrl());
        if (updates.getAttendeeEstimate() != null) existing.setAttendeeEstimate(updates.getAttendeeEstimate());
        if (updates.getSequenceOrder() != null) existing.setSequenceOrder(updates.getSequenceOrder());

        return eventRepository.save(existing);
    }

    public void deleteEvent(Long eventId) {
        eventRepository.delete(loadAuthorized(eventId));
    }

    /** Loads an event and checks EVENTS permission on the wedding that owns it. */
    private WeddingEvent loadAuthorized(Long eventId) {
        WeddingEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found: " + eventId));
        access.require(weddingIdOf(event.getWedding()), WeddingModule.EVENTS);
        return event;
    }
}
