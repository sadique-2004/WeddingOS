package com.weddingos.api.service;

import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.model.WeddingEvent;
import com.weddingos.api.model.WeddingSlug;
import com.weddingos.api.model.WeddingWebsite;
import com.weddingos.api.repository.WeddingEventRepository;
import com.weddingos.api.repository.WeddingRepository;
import com.weddingos.api.repository.WeddingSlugRepository;
import com.weddingos.api.repository.WeddingWebsiteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class WebsiteService {

    private final WeddingWebsiteRepository websiteRepository;
    private final WeddingRepository weddingRepository;
    private final WeddingSlugRepository slugRepository;
    private final WeddingEventRepository eventRepository;

    public WebsiteService(WeddingWebsiteRepository websiteRepository,
                          WeddingRepository weddingRepository,
                          WeddingSlugRepository slugRepository,
                          WeddingEventRepository eventRepository) {
        this.websiteRepository = websiteRepository;
        this.weddingRepository = weddingRepository;
        this.slugRepository = slugRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional
    public WeddingWebsite getWebsiteConfig(Long weddingId) {
        return websiteRepository.findByWeddingId(weddingId)
                .orElseGet(() -> {
                    Wedding wedding = weddingRepository.findById(weddingId)
                            .orElseThrow(() -> new NotFoundException("Wedding not found: " + weddingId));
                    WeddingWebsite site = new WeddingWebsite();
                    site.setWedding(wedding);
                    site.setWelcomeHeadline("Celebrating the Sacred Union of " + wedding.getBrideName() + " & " + wedding.getGroomName());
                    site.setWelcomeMessage("With the blessings of our parents, we joyously invite you to share in our laughter, sacred ceremonies, and celebrations.");
                    return websiteRepository.save(site);
                });
    }

    public WeddingWebsite updateWebsiteConfig(Long weddingId, WeddingWebsite updates) {
        WeddingWebsite existing = getWebsiteConfig(weddingId);

        if (updates.getThemeKey() != null) existing.setThemeKey(updates.getThemeKey());
        if (updates.getWelcomeHeadline() != null) existing.setWelcomeHeadline(updates.getWelcomeHeadline());
        if (updates.getWelcomeMessage() != null) existing.setWelcomeMessage(updates.getWelcomeMessage());
        if (updates.getIsPublished() != null) existing.setIsPublished(updates.getIsPublished());
        if (updates.getShowSchedule() != null) existing.setShowSchedule(updates.getShowSchedule());
        if (updates.getShowDressCode() != null) existing.setShowDressCode(updates.getShowDressCode());
        if (updates.getShowVenues() != null) existing.setShowVenues(updates.getShowVenues());
        if (updates.getShowLivestream() != null) existing.setShowLivestream(updates.getShowLivestream());
        if (updates.getLivestreamUrl() != null) existing.setLivestreamUrl(updates.getLivestreamUrl());

        return websiteRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPublicWebsiteBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new BadRequestException("slug is required.");
        }
        // Unknown or inactive slugs are a 404 — never fall back to another wedding's site.
        WeddingSlug weddingSlug = slugRepository.findBySlugAndIsActiveTrue(slug.trim())
                .orElseThrow(() -> new NotFoundException("Wedding website not found for slug: " + slug));
        Wedding wedding = weddingSlug.getWedding();

        WeddingWebsite site = getWebsiteConfig(wedding.getId());
        List<WeddingEvent> events = eventRepository.findByWeddingIdOrderByEventDateAscSequenceOrderAsc(wedding.getId());

        Map<String, Object> data = new HashMap<>();
        data.put("slug", weddingSlug.getSlug());
        // Lets public pages (e.g. guest gallery) scope their calls to this wedding instead of a hardcoded ID
        data.put("weddingId", wedding.getId());
        data.put("brideName", wedding.getBrideName());
        data.put("groomName", wedding.getGroomName());
        data.put("weddingDate", wedding.getWeddingDate());
        data.put("city", wedding.getCity());
        data.put("venueName", wedding.getVenueName());
        data.put("themeKey", site.getThemeKey());
        data.put("welcomeHeadline", site.getWelcomeHeadline());
        data.put("welcomeMessage", site.getWelcomeMessage());
        data.put("isPublished", site.getIsPublished());
        data.put("showSchedule", site.getShowSchedule());
        data.put("showDressCode", site.getShowDressCode());
        data.put("showVenues", site.getShowVenues());
        data.put("showLivestream", site.getShowLivestream());
        data.put("livestreamUrl", site.getLivestreamUrl());
        data.put("events", events);

        return data;
    }
}
