package com.interviewcoach.dto;

// Java record: immutable, all-args constructor, equals/hashCode/toString generated automatically.
// WHY record not class: zero boilerplate for DTOs that only carry data — no behavior needed.
public record LessonSummaryDto(
        Long id,
        String category,
        String title,
        String description,
        String level,
        int durationMin,
        String status,
        int sortOrder
) {}
