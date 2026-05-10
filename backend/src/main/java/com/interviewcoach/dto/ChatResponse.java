package com.interviewcoach.dto;

// Kept for API documentation clarity; controllers return MessageDto directly.
public record ChatResponse(
    String role,
    String content,
    String sessionId
) {}
