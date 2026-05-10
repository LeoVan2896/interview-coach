package com.interviewcoach.service;

import com.interviewcoach.dto.DayDto;
import com.interviewcoach.dto.WeekDetailDto;
import com.interviewcoach.dto.WeekSummaryDto;
import com.interviewcoach.entity.ScheduleDay;
import com.interviewcoach.entity.ScheduleWeek;
import com.interviewcoach.exception.ResourceNotFoundException;
import com.interviewcoach.repository.ScheduleDayRepository;
import com.interviewcoach.repository.ScheduleWeekRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// WHY no @Transactional: this service is read-only. No dirty-checking, no transaction boundary needed.
@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleWeekRepository weekRepository;
    private final ScheduleDayRepository dayRepository;

    // WHY explicit constructor: Lombok @RequiredArgsConstructor won't generate this —
    // APT is not configured in this project's pom.xml.
    public ScheduleServiceImpl(ScheduleWeekRepository weekRepository,
                                ScheduleDayRepository dayRepository) {
        this.weekRepository = weekRepository;
        this.dayRepository = dayRepository;
    }

    @Override
    public List<WeekSummaryDto> getAllWeeks() {
        return weekRepository.findAllByOrderByWeekNumAsc()
                .stream()
                .map(this::toSummaryDto)
                .toList();
    }

    @Override
    public WeekDetailDto getWeekByNum(int weekNum) {
        // WHY orElseThrow with ResourceNotFoundException: gives a clear 404 message instead of
        // a NullPointerException that bubbles up with no context about what was missing.
        ScheduleWeek week = weekRepository.findByWeekNum(weekNum)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleWeek", (long) weekNum));

        List<DayDto> days = dayRepository.findByWeekNumOrderByDayNumAsc(weekNum)
                .stream()
                .map(this::toDayDto)
                .toList();

        return new WeekDetailDto(
                week.getWeekNum(),
                week.getTheme(),
                week.getFocusJava(),
                week.getFocusDsa(),
                week.getFocusProject(),
                days
        );
    }

    private WeekSummaryDto toSummaryDto(ScheduleWeek w) {
        return new WeekSummaryDto(
                w.getWeekNum(),
                w.getTheme(),
                w.getFocusJava(),
                w.getFocusDsa(),
                w.getFocusProject()
        );
    }

    private DayDto toDayDto(ScheduleDay d) {
        // WHY d.isMilestone() not d.getMilestone(): the entity field is a primitive boolean,
        // so the JavaBeans getter is isMilestone(), not getMilestone(). Calling the wrong
        // name is a compile error — isMilestone() is correct.
        return new DayDto(
                d.getId(),
                d.getWeekNum(),
                d.getDayNum(),
                d.getDayLabel(),
                d.getLearningTopic(),
                d.getLearningDesc(),
                d.getLearningResource(),
                d.getDsaPattern(),
                d.getDsaProblems(),
                d.getProjectTask(),
                d.isMilestone()
        );
    }
}
