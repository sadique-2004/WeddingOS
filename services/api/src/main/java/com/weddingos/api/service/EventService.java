package com.weddingos.api.service;

import com.weddingos.api.model.Wedding;
import com.weddingos.api.model.WeddingEvent;
import com.weddingos.api.repository.WeddingEventRepository;
import com.weddingos.api.repository.WeddingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EventService {

    private final WeddingEventRepository eventRepository;
    private final WeddingRepository weddingRepository;

    public EventService(WeddingEventRepository eventRepository, WeddingRepository weddingRepository) {
        this.eventRepository = eventRepository;
        this.weddingRepository = weddingRepository;
    }

    @Transactional(readOnly = true)
    public List<WeddingEvent> getEvents(Long weddingId) {
        return eventRepository.findByWeddingIdOrderByEventDateAscSequenceOrderAsc(weddingId);
    }

    @Transactional(readOnly = true)
    public WeddingEvent getEventById(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Ceremony event not found with ID: " + eventId));
    }

    public WeddingEvent createEvent(Long weddingId, WeddingEvent event) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new IllegalArgumentException("Wedding not found: " + weddingId));
        event.setWedding(wedding);
        return eventRepository.save(event);
    }

    public WeddingEvent updateEvent(Long eventId, WeddingEvent updates) {
        WeddingEvent existing = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        
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
        eventRepository.deleteById(eventId);
    }
}
