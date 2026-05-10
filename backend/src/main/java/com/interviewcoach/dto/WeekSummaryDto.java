package com.interviewcoach.dto;

public record WeekSummaryDto(
        int weekNum,
        String theme,
        String focusJava,
        String focusDsa,
        String focusProject
) {}
