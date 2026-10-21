package com.weddingos.api.service;

import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.model.WeddingEvent;
import com.weddingos.api.model.WeddingSlug;
import com.weddingos.api.model.WeddingWebsite;
import com.weddingos.api.repository.WeddingEventRepository;
import com.weddingos.api.repository.WeddingSlugRepository;
import com.weddingos.api.repository.WeddingWebsiteRepository;
import com.weddingos.api.security.WeddingAccessService;
import com.weddingos.api.security.WeddingModule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class WebsiteService {

    private final WeddingWebsiteRepository websiteRepository;
    private final WeddingSlugRepository slugRepository;
    private final WeddingEventRepository eventRepository;
    private final WeddingAccessService access;

    public WebsiteService(WeddingWebsiteRepository websiteRepository,
                          WeddingSlugRepository slugRepository,
                          WeddingEventRepository eventRepository,
                          WeddingAccessService access) {
        this.websiteRepository = websiteRepository;
        this.slugRepository = slugRepository;
        this.eventRepository = eventRepository;
        this.access = access;
    }

    // ---------------- Organizer (authenticated, WEBSITE permission) ----------------

    public WeddingWebsite getWebsiteConfig(Long weddingId) {
        Wedding wedding = access.require(weddingId, WeddingModule.WEBSITE).wedding();
        return loadOrCreateConfig(wedding);
    }

    public WeddingWebsite updateWebsiteConfig(Long weddingId, WeddingWebsite updates) {
        Wedding wedding = access.require(weddingId, WeddingModule.WEBSITE).wedding();
        WeddingWebsite existing = loadOrCreateConfig(wedding);

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

    private WeddingWebsite loadOrCreateConfig(Wedding wedding) {
        return websiteRepository.findByWeddingId(wedding.getId())
                .orElseGet(() -> {
                    WeddingWebsite site = new WeddingWebsite();
                    site.setWedding(wedding);
                    site.setWelcomeHeadline("Celebrating the Sacred Union of " + wedding.getBrideName() + " & " + wedding.getGroomName());
                    site.setWelcomeMessage("With the blessings of our parents, we joyously invite you to share in our laughter, sacred ceremonies, and celebrations.");
                    return websiteRepository.save(site);
                });
    }

    // ---------------- Public (no login): published sites only, read-only ----------------

    /**
     * Resolves the wedding that owns an active slug and has a published website.
     * Unknown slugs and unpublished sites are both a 404, and nothing is created or modified.
     */
    @Transactional(readOnly = true)
    public Wedding requirePublishedWedding(String slug) {
        return requirePublished(slug).wedding;
    }

    private record Published(WeddingSlug slug, Wedding wedding, WeddingWebsite site) {}

    private Published requirePublished(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new BadRequestException("slug is required.");
        }
        // Unknown or inactive slugs are a 404 — never fall back to another wedding's site.
        WeddingSlug weddingSlug = slugRepository.findBySlugAndIsActiveTrue(slug.trim())
                .orElseThrow(() -> new NotFoundException("Wedding website not found for slug: " + slug));
        Wedding wedding = weddingSlug.getWedding();
        WeddingWebsite site = websiteRepository.findByWeddingId(wedding.getId())
                .filter(s -> Boolean.TRUE.equals(s.getIsPublished()))
                .orElseThrow(() -> new NotFoundException("Wedding website not found for slug: " + slug));
        return new Published(weddingSlug, wedding, site);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPublicWebsiteBySlug(String slug) {
        Published published = requirePublished(slug);
        Wedding wedding = published.wedding();
        WeddingWebsite site = published.site();

        Map<String, Object> data = new HashMap<>();
        data.put("slug", published.slug().getSlug());
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
        // Only expose sections the organizers chose to show
        data.put("livestreamUrl", Boolean.TRUE.equals(site.getShowLivestream()) ? site.getLivestreamUrl() : null);
        List<WeddingEvent> events = Boolean.TRUE.equals(site.getShowSchedule())
                ? eventRepository.findByWeddingIdOrderByEventDateAscSequenceOrderAsc(wedding.getId())
                : List.of();
        data.put("events", events);

        return data;
    }
}
