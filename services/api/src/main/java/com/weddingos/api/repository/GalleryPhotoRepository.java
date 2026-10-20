package com.weddingos.api.repository;

import com.weddingos.api.model.GalleryPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryPhotoRepository extends JpaRepository<GalleryPhoto, Long> {
    List<GalleryPhoto> findByWeddingIdOrderByUploadedAtDesc(Long weddingId);
    List<GalleryPhoto> findByWeddingIdAndModerationStatusOrderByUploadedAtDesc(Long weddingId, GalleryPhoto.ModerationStatus status);
    List<GalleryPhoto> findByWeddingIdAndIsHighlightTrueOrderByUploadedAtDesc(Long weddingId);
}
