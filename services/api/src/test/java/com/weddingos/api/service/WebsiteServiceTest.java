package com.weddingos.api.service;

import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.model.WeddingSlug;
import com.weddingos.api.model.WeddingWebsite;
import com.weddingos.api.repository.WeddingEventRepository;
import com.weddingos.api.repository.WeddingRepository;
import com.weddingos.api.repository.WeddingSlugRepository;
import com.weddingos.api.repository.WeddingWebsiteRepository;
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
 * Public website lookups must only ever return the wedding that owns the slug.
 */
@ExtendWith(MockitoExtension.class)
class WebsiteServiceTest {

    @Mock WeddingWebsiteRepository websiteRepository;
    @Mock WeddingRepository weddingRepository;
    @Mock WeddingSlugRepository slugRepository;
    @Mock WeddingEventRepository eventRepository;

    @InjectMocks WebsiteService service;

    @Test
    void unknownSlugIsNotFoundAndNeverFallsBackToAnotherWedding() {
        when(slugRepository.findBySlugAndIsActiveTrue("no-such-couple")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPublicWebsiteBySlug("no-such-couple"))
                .isInstanceOf(NotFoundException.class);

        verify(slugRepository, never()).findAll();
        verify(weddingRepository, never()).findAll();
        verify(weddingRepository, never()).save(any());
        verifyNoInteractions(websiteRepository, eventRepository);
    }

    @Test
    void blankSlugIsBadRequest() {
        assertThatThrownBy(() -> service.getPublicWebsiteBySlug("  "))
                .isInstanceOf(BadRequestException.class);
        verifyNoInteractions(slugRepository, weddingRepository, websiteRepository, eventRepository);
    }

    @Test
    void knownSlugReturnsOnlyThatWeddingIncludingItsId() {
        Wedding wedding = new Wedding();
        wedding.setId(7L);
        wedding.setBrideName("Asha");
        wedding.setGroomName("Ravi");
        WeddingSlug slug = new WeddingSlug();
        slug.setWedding(wedding);
        slug.setSlug("asha-ravi");
        WeddingWebsite site = new WeddingWebsite();
        site.setWedding(wedding);

        when(slugRepository.findBySlugAndIsActiveTrue("asha-ravi")).thenReturn(Optional.of(slug));
        when(websiteRepository.findByWeddingId(7L)).thenReturn(Optional.of(site));
        when(eventRepository.findByWeddingIdOrderByEventDateAscSequenceOrderAsc(7L)).thenReturn(List.of());

        Map<String, Object> data = service.getPublicWebsiteBySlug("asha-ravi");

        assertThat(data).containsEntry("weddingId", 7L)
                .containsEntry("slug", "asha-ravi")
                .containsEntry("brideName", "Asha");
        verify(slugRepository, never()).findAll();
        verify(weddingRepository, never()).findAll();
    }

    @Test
    void websiteConfigForUnknownWeddingIsNotFound() {
        when(websiteRepository.findByWeddingId(404L)).thenReturn(Optional.empty());
        when(weddingRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getWebsiteConfig(404L))
                .isInstanceOf(NotFoundException.class);
        verify(websiteRepository, never()).save(any());
    }
}
