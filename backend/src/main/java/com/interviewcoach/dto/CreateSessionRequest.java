package com.interviewcoach.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateSessionRequest(
    @NotNull(message = "topic is required") String topic,
    @NotBlank(message = "questionText is required") String questionText,
    String questionHint,
    String questionType   // coding | conceptual | design | behavioral
) {}
