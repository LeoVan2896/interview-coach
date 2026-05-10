package com.interviewcoach.service;

import com.interviewcoach.dto.WeekDetailDto;
import com.interviewcoach.dto.WeekSummaryDto;

import java.util.List;

public interface ScheduleService {
    List<WeekSummaryDto> getAllWeeks();
    WeekDetailDto getWeekByNum(int weekNum);
}
