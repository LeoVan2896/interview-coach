package com.interviewcoach.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
    @NotBlank(message = "content is required") String content
) {}
