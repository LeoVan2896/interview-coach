package com.interviewcoach.dto;

import com.interviewcoach.model.Message;
import com.interviewcoach.model.Session;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SessionDetail(
    UUID id,
    String topic,
    String topicLabel,
    String questionText,
    String questionHint,
    String questionType,
    LocalDateTime createdAt,
    boolean completed,
    List<MessageDto> messages
) {
    public static SessionDetail from(Session session, List<Message> messages) {
        return new SessionDetail(
            session.getId(),
            session.getTopic().name(),
            session.getTopic().getLabel(),
            session.getQuestionText(),
            session.getQuestionHint(),
            session.getQuestionType(),
            session.getCreatedAt(),
            session.isCompleted(),
            messages.stream().map(MessageDto::from).toList()
        );
    }
}
