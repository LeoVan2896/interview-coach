package com.interviewcoach.service;

import com.interviewcoach.dto.DashboardTodayDto;
import com.interviewcoach.entity.LessonStatus;
import com.interviewcoach.entity.Plan;
import com.interviewcoach.entity.ScheduleDay;
import com.interviewcoach.exception.ResourceNotFoundException;
import com.interviewcoach.repository.LessonRepository;
import com.interviewcoach.repository.PlanRepository;
import com.interviewcoach.repository.ScheduleDayRepository;
import com.interviewcoach.repository.SessionRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

// WHY no @Transactional: this service is read-only; no write operations, no dirty-checking needed.
// Matches ScheduleServiceImpl pattern — simpler, lower overhead.
@Service
public class DashboardServiceImpl implements DashboardService {

    // WHY Map.ofEntries: produces an immutable map; Map.of() is capped at 10 entries
    // but we have 12 topics, so ofEntries() is required for the larger set.
    private static final Map<String, String> TOPIC_SLUGS = Map.ofEntries(
            Map.entry("Arrays & Hashing",       "arrays-hashing"),
            Map.entry("Two Pointers",            "two-pointers"),
            Map.entry("Sliding Window",          "sliding-window"),
            Map.entry("Stack",                   "stack"),
            Map.entry("Binary Search",           "binary-search"),
            Map.entry("Linked Lists",            "linked-lists"),
            Map.entry("Trees",                   "trees"),
            Map.entry("Heaps / Priority Queue",  "heaps"),
            Map.entry("Graphs",                  "graphs"),
            Map.entry("Dynamic Programming",     "dp"),
            Map.entry("Tries",                   "tries"),
            Map.entry("Intervals",               "intervals")
    );

    private final PlanRepository planRepository;
    private final ScheduleDayRepository scheduleDayRepository;
    private final LessonRepository lessonRepository;
    private final SessionRepository sessionRepository;
    // WHY Clock injection: LocalDate.now(clock) is deterministic in tests via Clock.fixed().
    // Static LocalDate.now() is untestable — an interviewer will ask about this.
    private final Clock clock;

    public DashboardServiceImpl(
            PlanRepository planRepository,
            ScheduleDayRepository scheduleDayRepository,
            LessonRepository lessonRepository,
            SessionRepository sessionRepository,
            Clock clock) {
        this.planRepository = planRepository;
        this.scheduleDayRepository = scheduleDayRepository;
        this.lessonRepository = lessonRepository;
        this.sessionRepository = sessionRepository;
        this.clock = clock;
    }

    @Override
    public DashboardTodayDto getDashboardToday() {
        // WHY findTopByOrderByIdDesc: gets the most recently created plan without
        // requiring the caller to know the plan ID — dashboard always shows the active plan.
        Plan plan = planRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new ResourceNotFoundException("Plan", 0L));

        LocalDate today = LocalDate.now(clock);
        LocalDate startDate = plan.getStartDate();

        // WHY floor + 1: days 0-6 = week 1, days 7-13 = week 2, etc.
        // Example: startDate=May 4, today=May 10 → daysBetween=6, floor(6/7)=0, week=1 ✓
        long daysBetween = ChronoUnit.DAYS.between(startDate, today);
        int currentWeek = Math.min(8, Math.max(1, (int) Math.floor(daysBetween / 7.0) + 1));
        int daysLeft = Math.max(0, (int) ChronoUnit.DAYS.between(today, plan.getEndDate()));

        // WHY ISO day-of-week: DayOfWeek.getValue() returns 1=Mon...7=Sun,
        // which matches the schedule_days.day_num convention used in the seed data.
        int currentDayNum = today.getDayOfWeek().getValue();

        ScheduleDay todayDay = scheduleDayRepository.findByWeekNumAndDayNum(currentWeek, currentDayNum)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleDay", (long) currentDayNum));

        List<ScheduleDay> weekDays = scheduleDayRepository.findByWeekNumOrderByDayNumAsc(currentWeek);

        // WHY weekStart calculated from startDate + offset: avoids relying on calendar APIs;
        // the schedule is always anchored to the plan start date, not the calendar week.
        LocalDate weekStart = startDate.plusDays((long) (currentWeek - 1) * 7);

        List<DashboardTodayDto.WeekDayDto> weekDayDtos = weekDays.stream()
                .map(d -> {
                    LocalDate dayDate = weekStart.plusDays(d.getDayNum() - 1);
                    String status;
                    if (dayDate.isBefore(today)) {
                        status = "DONE";
                    } else if (dayDate.equals(today)) {
                        status = "TODAY";
                    } else if (dayDate.getDayOfWeek() == DayOfWeek.SUNDAY) {
                        // WHY REST checked before FUTURE: Sunday is always a rest day even
                        // when it's a future date — REST takes precedence over FUTURE.
                        status = "REST";
                    } else {
                        status = "FUTURE";
                    }
                    return new DashboardTodayDto.WeekDayDto(d.getDayLabel(), dayDate.toString(), status);
                })
                .toList();

        long lessonsDone = lessonRepository.countByStatus(LessonStatus.DONE);
        long sessionsDone = sessionRepository.count();

        // WHY getOrDefault: if a new DSA pattern is added to the schedule but not yet
        // in TOPIC_SLUGS, the UI still gets a valid (default) slug instead of null.
        String topicId = TOPIC_SLUGS.getOrDefault(todayDay.getDsaPattern(), "arrays-hashing");

        return new DashboardTodayDto(
                new DashboardTodayDto.PlanDto(currentWeek, daysLeft, startDate.toString()),
                new DashboardTodayDto.TodayTasksDto(
                        new DashboardTodayDto.LearningTaskDto(
                                todayDay.getLessonId(),
                                todayDay.getLearningTopic(),
                                todayDay.getLearningDesc(),
                                todayDay.getLearningResource()),
                        new DashboardTodayDto.LeetcodeTaskDto(
                                todayDay.getDsaPattern(),
                                todayDay.getDsaProblems(),
                                topicId),
                        new DashboardTodayDto.ProjectTaskDto(todayDay.getProjectTask())),
                weekDayDtos,
                new DashboardTodayDto.StatsDto(lessonsDone, sessionsDone, daysLeft));
    }
}
