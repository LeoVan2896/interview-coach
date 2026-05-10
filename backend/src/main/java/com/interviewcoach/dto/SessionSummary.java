package com.interviewcoach.dto;

import com.interviewcoach.model.Session;
import java.time.LocalDateTime;
import java.util.UUID;

public record SessionSummary(
    UUID id,
    String topic,
    String topicLabel,
    String questionText,
    LocalDateTime createdAt,
    boolean completed,
    int messageCount
) {
    // messageCount is passed in separately to avoid N+1 lazy-loading
    public static SessionSummary from(Session session, int messageCount) {
        return new SessionSummary(
            session.getId(),
            session.getTopic().name(),
            session.getTopic().getLabel(),
            session.getQuestionText(),
            session.getCreatedAt(),
            session.isCompleted(),
            messageCount
        );
    }
}
