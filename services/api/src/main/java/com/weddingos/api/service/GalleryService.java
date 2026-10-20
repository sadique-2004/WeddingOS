package com.weddingos.api.service;

import com.weddingos.api.model.GalleryPhoto;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.repository.GalleryPhotoRepository;
import com.weddingos.api.repository.WeddingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class GalleryService {

    private final GalleryPhotoRepository photoRepository;
    private final WeddingRepository weddingRepository;

    public GalleryService(GalleryPhotoRepository photoRepository, WeddingRepository weddingRepository) {
        this.photoRepository = photoRepository;
        this.weddingRepository = weddingRepository;
    }

    @Transactional(readOnly = true)
    public List<GalleryPhoto> getApprovedPhotos(Long weddingId) {
        return photoRepository.findByWeddingIdAndModerationStatusOrderByUploadedAtDesc(weddingId, GalleryPhoto.ModerationStatus.APPROVED);
    }

    @Transactional(readOnly = true)
    public List<GalleryPhoto> getPendingModerationQueue(Long weddingId) {
        return photoRepository.findByWeddingIdAndModerationStatusOrderByUploadedAtDesc(weddingId, GalleryPhoto.ModerationStatus.PENDING);
    }

    public GalleryPhoto uploadGuestPhoto(Long weddingId, GalleryPhoto photo) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new IllegalArgumentException("Wedding not found: " + weddingId));
        photo.setWedding(wedding);
        photo.setModerationStatus(GalleryPhoto.ModerationStatus.PENDING);
        return photoRepository.save(photo);
    }

    public GalleryPhoto moderatePhoto(Long photoId, GalleryPhoto.ModerationStatus decision) {
        GalleryPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("Photo not found: " + photoId));
        photo.setModerationStatus(decision);
        return photoRepository.save(photo);
    }

    public GalleryPhoto toggleHighlight(Long photoId) {
        GalleryPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("Photo not found: " + photoId));
        photo.setIsHighlight(!photo.getIsHighlight());
        return photoRepository.save(photo);
    }

    public void deletePhoto(Long photoId) {
        photoRepository.deleteById(photoId);
    }
}
