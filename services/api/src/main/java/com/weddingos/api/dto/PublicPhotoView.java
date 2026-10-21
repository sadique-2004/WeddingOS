package com.weddingos.api.dto;

import com.weddingos.api.model.GalleryPhoto;

import java.time.LocalDateTime;

/** Gallery photo fields that may be shown to public gallery visitors. */
public record PublicPhotoView(
        Long id,
        String photoUrl,
        String caption,
        String uploaderName,
        LocalDateTime uploadedAt,
        boolean isHighlight,
        String moderationStatus
) {
    public static PublicPhotoView of(GalleryPhoto p) {
        return new PublicPhotoView(
                p.getId(),
                p.getPhotoUrl(),
                p.getCaption(),
                p.getUploaderName(),
                p.getUploadedAt(),
                Boolean.TRUE.equals(p.getIsHighlight()),
                p.getModerationStatus() != null ? p.getModerationStatus().name() : null
        );
    }
}
