package com.interviewcoach.dto;

public record DayDto(
        Long id,
        int weekNum,
        int dayNum,
        String dayLabel,
        String learningTopic,
        String learningDesc,
        String learningResource,
        String dsaPattern,
        String dsaProblems,
        String projectTask,
        boolean isMilestone
) {}
