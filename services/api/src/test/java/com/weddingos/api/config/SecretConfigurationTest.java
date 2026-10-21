package com.weddingos.api.config;

import com.weddingos.api.service.CloudinaryService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Guards against re-introducing hardcoded credentials as configuration defaults.
 */
class SecretConfigurationTest {

    private String applicationYml() throws Exception {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("application.yml")) {
            assertThat(in).as("application.yml on classpath").isNotNull();
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    void applicationYmlHasNoCloudinaryCredentialDefault() throws Exception {
        String yml = applicationYml();
        assertThat(yml).doesNotContain("cloudinary://");
        assertThat(yml).contains("${CLOUDINARY_URL:}");
    }

    @Test
    void databasePasswordHasNoLiteralDefault() throws Exception {
        String passwordLine = applicationYml().lines()
                .filter(l -> l.trim().startsWith("password:"))
                .findFirst()
                .orElseThrow();
        assertThat(passwordLine.trim()).isEqualTo("password: ${SPRING_DATASOURCE_PASSWORD:${MYSQLPASSWORD}}");
    }

    @Test
    void cloudinaryWithoutUrlIsDisabledAndUploadFailsWith503() {
        CloudinaryService service = new CloudinaryService("");
        assertThat(service.isConfigured()).isFalse();

        MockMultipartFile file = new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[]{1, 2, 3});
        assertThatThrownBy(() -> service.uploadImage(file, "weddingos/photos"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
    }
}
