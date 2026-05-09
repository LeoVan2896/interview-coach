package com.interviewcoach.dto;

// LessonDetailDto extends the summary shape with contentHtml and fiservNote.
// Keeping two DTOs (Summary vs Detail) avoids sending large HTML payloads in list endpoints.
public record LessonDetailDto(
        Long id,
        String category,
        String title,
        String description,
        String level,
        int durationMin,
        String status,
        int sortOrder,
        String contentHtml,
        String fiservNote
) {}
