package com.interviewcoach.dto;

import java.util.List;

public record WeekDetailDto(
        int weekNum,
        String theme,
        String focusJava,
        String focusDsa,
        String focusProject,
        List<DayDto> days
) {}
