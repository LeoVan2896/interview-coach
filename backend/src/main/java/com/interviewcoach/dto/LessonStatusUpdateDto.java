package com.interviewcoach.dto;

import com.interviewcoach.entity.LessonStatus;
import jakarta.validation.constraints.NotNull;

// @NotNull on the record component triggers Bean Validation when @Valid is used on the controller param.
// WHY enum directly in DTO: Spring's Jackson deserializer handles string-to-enum automatically.
public record LessonStatusUpdateDto(
        @NotNull(message = "status is required") LessonStatus status
) {}
