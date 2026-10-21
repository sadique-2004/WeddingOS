package com.weddingos.api.exception;

/**
 * Thrown when an authenticated user is not allowed to act on a wedding or module.
 * Mapped to HTTP 403 by {@link GlobalExceptionHandler}.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
