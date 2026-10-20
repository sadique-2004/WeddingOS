package com.weddingos.api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(@Value("${cloudinary.url:cloudinary://499643659481896:0gqQHwqIuYAjrsaUXFR8bInJk8o@h2diirow}") String cloudinaryUrl) {
        this.cloudinary = new Cloudinary(cloudinaryUrl);
    }

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        String targetFolder = (folder != null && !folder.trim().isEmpty()) ? folder : "weddingos";
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", targetFolder,
                "resource_type", "image"
        ));
        return (String) uploadResult.get("secure_url");
    }
}
