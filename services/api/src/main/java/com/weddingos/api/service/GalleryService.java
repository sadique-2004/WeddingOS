package com.weddingos.api.service;

import com.weddingos.api.dto.PublicPhotoView;
import com.weddingos.api.exception.BadRequestException;
import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.model.GalleryPhoto;
import com.weddingos.api.model.Wedding;
import com.weddingos.api.repository.GalleryPhotoRepository;
import com.weddingos.api.security.WeddingAccessService;
import com.weddingos.api.security.WeddingModule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import static com.weddingos.api.security.WeddingAccessService.weddingIdOf;

@Service
@Transactional
public class GalleryService {

    private final GalleryPhotoRepository photoRepository;
    private final WeddingAccessService access;
    private final CloudinaryService cloudinaryService;
    private final WebsiteService websiteService;

    public GalleryService(GalleryPhotoRepository photoRepository, WeddingAccessService access,
                          CloudinaryService cloudinaryService, WebsiteService websiteService) {
        this.photoRepository = photoRepository;
        this.access = access;
        this.cloudinaryService = cloudinaryService;
        this.websiteService = websiteService;
    }

    // ---------------- Organizer (authenticated, GALLERY permission) ----------------

    @Transactional(readOnly = true)
    public List<GalleryPhoto> getApprovedPhotos(Long weddingId) {
        access.require(weddingId, WeddingModule.GALLERY);
        return photoRepository.findByWeddingIdAndModerationStatusOrderByUploadedAtDesc(weddingId, GalleryPhoto.ModerationStatus.APPROVED);
    }

    @Transactional(readOnly = true)
    public List<GalleryPhoto> getPendingModerationQueue(Long weddingId) {
        access.require(weddingId, WeddingModule.GALLERY);
        return photoRepository.findByWeddingIdAndModerationStatusOrderByUploadedAtDesc(weddingId, GalleryPhoto.ModerationStatus.PENDING);
    }

    public GalleryPhoto uploadGuestPhoto(Long weddingId, GalleryPhoto photo) {
        Wedding wedding = access.require(weddingId, WeddingModule.GALLERY).wedding();
        photo.setId(null); // never let a client-supplied ID overwrite an existing row
        photo.setWedding(wedding);
        photo.setModerationStatus(GalleryPhoto.ModerationStatus.PENDING);
        return photoRepository.save(photo);
    }

    public GalleryPhoto uploadPhotoFile(Long weddingId, MultipartFile file, String caption, String ceremonyTag, String uploaderName) throws IOException {
        Wedding wedding = access.require(weddingId, WeddingModule.GALLERY).wedding();
        return storePendingPhoto(wedding, file, caption, uploaderName);
    }

    public GalleryPhoto moderatePhoto(Long photoId, GalleryPhoto.ModerationStatus decision) {
        GalleryPhoto photo = loadAuthorized(photoId);
        photo.setModerationStatus(decision);
        return photoRepository.save(photo);
    }

    public GalleryPhoto toggleHighlight(Long photoId) {
        GalleryPhoto photo = loadAuthorized(photoId);
        photo.setIsHighlight(!Boolean.TRUE.equals(photo.getIsHighlight()));
        return photoRepository.save(photo);
    }

    public void deletePhoto(Long photoId) {
        photoRepository.delete(loadAuthorized(photoId));
    }

    // ---------------- Public (published wedding resolved by slug) ----------------

    @Transactional(readOnly = true)
    public List<PublicPhotoView> getPublicApprovedPhotos(String slug) {
        Wedding wedding = websiteService.requirePublishedWedding(slug);
        return photoRepository.findByWeddingIdAndModerationStatusOrderByUploadedAtDesc(wedding.getId(), GalleryPhoto.ModerationStatus.APPROVED)
                .stream().map(PublicPhotoView::of).toList();
    }

    /** Guest contribution: always lands in the moderation queue of the wedding that owns the slug. */
    public PublicPhotoView uploadPublicPhoto(String slug, MultipartFile file, String caption, String uploaderName) throws IOException {
        Wedding wedding = websiteService.requirePublishedWedding(slug);
        return PublicPhotoView.of(storePendingPhoto(wedding, file, caption, uploaderName));
    }

    private GalleryPhoto storePendingPhoto(Wedding wedding, MultipartFile file, String caption, String uploaderName) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("An image file is required.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new BadRequestException("Only image uploads are allowed.");
        }
        String secureUrl = cloudinaryService.uploadImage(file, "weddingos/photos");

        GalleryPhoto photo = new GalleryPhoto();
        photo.setWedding(wedding);
        photo.setPhotoUrl(secureUrl);
        photo.setCaption(truncate(caption, 255));
        String name = uploaderName != null && !uploaderName.trim().isEmpty() ? uploaderName.trim() : "Wedding Guest";
        photo.setUploaderName(truncate(name, 120));
        photo.setModerationStatus(GalleryPhoto.ModerationStatus.PENDING);
        photo.setIsHighlight(false);
        return photoRepository.save(photo);
    }

    private static String truncate(String value, int max) {
        return value == null || value.length() <= max ? value : value.substring(0, max);
    }

    /** Loads a photo and checks GALLERY permission on the wedding that owns it. */
    private GalleryPhoto loadAuthorized(Long photoId) {
        GalleryPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new NotFoundException("Photo not found: " + photoId));
        access.require(weddingIdOf(photo.getWedding()), WeddingModule.GALLERY);
        return photo;
    }
}
