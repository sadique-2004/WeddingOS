package com.weddingos.api.service;

import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.model.WeddingSlug;
import com.weddingos.api.model.WeddingWebsite;
import com.weddingos.api.repository.WeddingEventRepository;
import com.weddingos.api.repository.WeddingSlugRepository;
import com.weddingos.api.repository.WeddingWebsiteRepository;
import com.weddingos.api.security.WeddingAccessService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Public website lookups must only ever return a published site of the wedding that owns the slug,
 * and must never write to the database.
 */
@ExtendWith(MockitoExtension.class)
class WebsiteServiceTest {

    @Mock WeddingWebsiteRepository websiteRepository;
    @Mock WeddingSlugRepository slugRepository;
    @Mock WeddingEventRepository eventRepository;
    @Mock WeddingAccessService access;

    @InjectMocks WebsiteService service;

    private static WeddingSlug slugFor(Wedding wedding, String slug) {
        WeddingSlug s = new WeddingSlug();
        s.setWedding(wedding);
        s.setSlug(slug);
        return s;
    }

    private static Wedding wedding(long id) {
        Wedding w = new Wedding();
        w.setId(id);
        w.setBrideName("Asha");
        w.setGroomName("Ravi");
        return w;
    }

    private static WeddingWebsite site(Wedding w, boolean published) {
        WeddingWebsite site = new WeddingWebsite();
        site.setWedding(w);
        site.setIsPublished(published);
        site.setLivestreamUrl("https://stream.example/live");
        return site;
    }

    @Test
    void unknownSlugIsNotFoundAndNeverFallsBackToAnotherWedding() {
        when(slugRepository.findBySlugAndIsActiveTrue("no-such-couple")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPublicWebsiteBySlug("no-such-couple"))
                .isInstanceOf(NotFoundException.class);

        verify(slugRepository, never()).findAll();
        verify(websiteRepository, never()).save(any());
        verifyNoInteractions(eventRepository, access);
    }

    @Test
    void blankSlugIsBadRequest() {
        assertThatThrownBy(() -> service.getPublicWebsiteBySlug("  "))
                .isInstanceOf(BadRequestException.class);
        verifyNoInteractions(slugRepository, websiteRepository, eventRepository);
    }

    @Test
    void unpublishedSiteIsNotFoundAndNothingIsCreated() {
        Wedding w = wedding(7L);
        when(slugRepository.findBySlugAndIsActiveTrue("asha-ravi")).thenReturn(Optional.of(slugFor(w, "asha-ravi")));
        when(websiteRepository.findByWeddingId(7L)).thenReturn(Optional.of(site(w, false)));

        assertThatThrownBy(() -> service.getPublicWebsiteBySlug("asha-ravi"))
                .isInstanceOf(NotFoundException.class);
        verify(websiteRepository, never()).save(any());
    }

    @Test
    void missingSiteRowIsNotFoundAndNothingIsCreated() {
        Wedding w = wedding(7L);
        when(slugRepository.findBySlugAndIsActiveTrue("asha-ravi")).thenReturn(Optional.of(slugFor(w, "asha-ravi")));
        when(websiteRepository.findByWeddingId(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPublicWebsiteBySlug("asha-ravi"))
                .isInstanceOf(NotFoundException.class);
        verify(websiteRepository, never()).save(any());
    }

    @Test
    void publishedSiteReturnsOnlyThatWeddingsPublicFields() {
        Wedding w = wedding(7L);
        WeddingWebsite published = site(w, true);
        published.setShowLivestream(false);
        when(slugRepository.findBySlugAndIsActiveTrue("asha-ravi")).thenReturn(Optional.of(slugFor(w, "asha-ravi")));
        when(websiteRepository.findByWeddingId(7L)).thenReturn(Optional.of(published));
        when(eventRepository.findByWeddingIdOrderByEventDateAscSequenceOrderAsc(7L)).thenReturn(List.of());

        Map<String, Object> data = service.getPublicWebsiteBySlug("asha-ravi");

        assertThat(data).containsEntry("slug", "asha-ravi").containsEntry("brideName", "Asha");
        assertThat(data).doesNotContainKey("weddingId");
        assertThat(data.get("livestreamUrl")).as("hidden section is not exposed").isNull();
        verify(slugRepository, never()).findAll();
        verifyNoInteractions(access);
    }
}
