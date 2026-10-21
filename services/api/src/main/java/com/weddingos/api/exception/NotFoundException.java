package com.weddingos.api.exception;

/**
 * Thrown when a requested record (wedding, slug, invitation, task, ...) does not exist.
 * Mapped to HTTP 404 by {@link GlobalExceptionHandler}.
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
