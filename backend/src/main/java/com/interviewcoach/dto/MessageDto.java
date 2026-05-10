package com.interviewcoach.dto;

import com.interviewcoach.model.Message;
import java.time.LocalDateTime;

public record MessageDto(
    Long id,
    String role,
    String content,
    LocalDateTime createdAt
) {
    public static MessageDto from(Message message) {
        return new MessageDto(
            message.getId(),
            message.getRole().name(),
            message.getContent(),
            message.getCreatedAt()
        );
    }
}
