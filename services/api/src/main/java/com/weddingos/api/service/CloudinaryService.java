package com.weddingos.api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;

    public CloudinaryService(@Value("${cloudinary.url:}") String cloudinaryUrl) {
        // No hardcoded fallback: credentials must come from the CLOUDINARY_URL environment variable.
        // The value itself is never logged.
        Cloudinary client = null;
        if (cloudinaryUrl == null || cloudinaryUrl.isBlank()) {
            log.warn("CLOUDINARY_URL is not set. Photo uploads are disabled until it is configured.");
        } else {
            try {
                client = new Cloudinary(cloudinaryUrl.trim());
            } catch (RuntimeException e) {
                log.error("CLOUDINARY_URL is set but could not be parsed. Photo uploads are disabled.");
            }
        }
        this.cloudinary = client;
    }

    public boolean isConfigured() {
        return cloudinary != null;
    }

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (cloudinary == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Photo uploads are not configured on the server (CLOUDINARY_URL is missing or invalid).");
        }
        String targetFolder = (folder != null && !folder.trim().isEmpty()) ? folder : "weddingos";
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", targetFolder,
                "resource_type", "image"
        ));
        return (String) uploadResult.get("secure_url");
    }
}
