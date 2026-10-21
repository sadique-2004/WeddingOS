package com.weddingos.api.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * The single JSON error shape used by the API: {timestamp, status, error, message, path}.
 */
public final class ApiErrorBody {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private ApiErrorBody() {}

    public static Map<String, Object> of(int status, String message, String path) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status);
        HttpStatus resolved = HttpStatus.resolve(status);
        body.put("error", resolved != null ? resolved.getReasonPhrase() : "Error");
        body.put("message", message != null && !message.isBlank() ? message : "Request failed.");
        body.put("path", path);
        return body;
    }

    /** Writes the error body directly (used by security filters, outside MVC exception handling). */
    public static void write(HttpServletRequest request, HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        MAPPER.writeValue(response.getOutputStream(), of(status.value(), message, request.getRequestURI()));
    }
}
