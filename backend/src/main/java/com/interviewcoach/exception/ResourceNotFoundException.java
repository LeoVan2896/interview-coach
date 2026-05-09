package com.interviewcoach.exception;

// Extends RuntimeException so it's unchecked — callers don't need try/catch.
// WHY unchecked: Spring's @Transactional only rolls back on unchecked exceptions by default.
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " not found with id: " + id);
    }
}
