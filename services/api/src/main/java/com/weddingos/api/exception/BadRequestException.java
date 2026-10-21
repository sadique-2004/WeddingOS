package com.weddingos.api.exception;

/**
 * Thrown when a request is missing required input (e.g. no weddingId) or the input is invalid.
 * Mapped to HTTP 400 by {@link GlobalExceptionHandler}.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
