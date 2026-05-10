package com.interviewcoach.service;

import com.interviewcoach.dto.DashboardTodayDto;
import com.interviewcoach.entity.LessonStatus;
import com.interviewcoach.entity.Plan;
import com.interviewcoach.entity.ScheduleDay;
import com.interviewcoach.repository.LessonRepository;
import com.interviewcoach.repository.PlanRepository;
import com.interviewcoach.repository.ScheduleDayRepository;
import com.interviewcoach.repository.SessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.*;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

// WHY @ExtendWith(MockitoExtension.class): activates @Mock field injection without
// starting the full Spring context — unit tests should be fast and isolated.
@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock PlanRepository planRepository;
    @Mock ScheduleDayRepository scheduleDayRepository;
    @Mock LessonRepository lessonRepository;
    @Mock SessionRepository sessionRepository;

    // ── helpers ──────────────────────────────────────────────────────────────

    // WHY manual construction instead of @InjectMocks: we need to inject a real Clock
    // value (not a mock), so we build the service ourselves with a fixed Clock.
    // @InjectMocks can't pass constructor arguments — it would inject null for Clock.
    private DashboardServiceImpl serviceWithClock(LocalDate fixedDate) {
        Clock clock = Clock.fixed(
                fixedDate.atStartOfDay(ZoneId.systemDefault()).toInstant(),
                ZoneId.systemDefault());
        return new DashboardServiceImpl(
                planRepository, scheduleDayRepository, lessonRepository, sessionRepository, clock);
    }

    private Plan makePlan() {
        Plan p = new Plan();
        p.setStartDate(LocalDate.of(2026, 5, 4));
        p.setEndDate(LocalDate.of(2026, 6, 28));
        return p;
    }

    private ScheduleDay makeDay(int weekNum, int dayNum, String dayLabel) {
        ScheduleDay d = new ScheduleDay();
        d.setWeekNum(weekNum);
        d.setDayNum(dayNum);
        d.setDayLabel(dayLabel);
        d.setLearningTopic("Concurrency: Threads & Executors");
        d.setLearningDesc("Thread, Runnable, Callable");
        d.setLearningResource("Java Concurrency in Practice ch.6");
        d.setDsaPattern("Arrays & Hashing");
        d.setDsaProblems("Two Sum, Contains Duplicate");
        d.setProjectTask("Build the Lessons Browser page");
        d.setLessonId(5L);
        return d;
    }

    private List<ScheduleDay> makeWeek(int weekNum) {
        String[] labels = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        return java.util.stream.IntStream.rangeClosed(1, 7)
                .mapToObj(i -> makeDay(weekNum, i, labels[i - 1]))
                .toList();
    }

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void getToday_givenValidPlan_returnsDtoWithCorrectWeekNum() {
        // today = 2026-05-10 (Sunday, dayNum=7, week 1: daysBetween=6, floor(6/7)=0, week=1)
        LocalDate today = LocalDate.of(2026, 5, 10);
        DashboardServiceImpl service = serviceWithClock(today);

        when(planRepository.findTopByOrderByIdDesc()).thenReturn(Optional.of(makePlan()));
        when(scheduleDayRepository.findByWeekNumAndDayNum(1, 7))
                .thenReturn(Optional.of(makeDay(1, 7, "Sun")));
        when(scheduleDayRepository.findByWeekNumOrderByDayNumAsc(1))
                .thenReturn(makeWeek(1));
        when(lessonRepository.countByStatus(LessonStatus.DONE)).thenReturn(4L);
        when(sessionRepository.count()).thenReturn(7L);

        DashboardTodayDto dto = service.getDashboardToday();

        assertThat(dto.plan().currentWeek()).isEqualTo(1);
        assertThat(dto.plan().daysLeft()).isEqualTo(49);
        assertThat(dto.plan().startDate()).isEqualTo("2026-05-04");
        assertThat(dto.stats().lessonsDone()).isEqualTo(4);
        assertThat(dto.stats().sessionsDone()).isEqualTo(7);
        assertThat(dto.todayTasks().learning().lessonId()).isEqualTo(5L);
        assertThat(dto.todayTasks().leetcode().topicId()).isEqualTo("arrays-hashing");
        // day 7 = today → TODAY
        assertThat(dto.weekDays().get(6).status()).isEqualTo("TODAY");
        // days 1-6 are past → DONE
        assertThat(dto.weekDays().get(0).status()).isEqualTo("DONE");
        assertThat(dto.weekDays().get(5).status()).isEqualTo("DONE");
    }

    @Test
    void getToday_givenSunday_marksAsRestNotFuture() {
        // today = 2026-05-07 (Thursday, dayNum=4)
        // Sunday May 10 is in the future → should be REST, not FUTURE
        LocalDate today = LocalDate.of(2026, 5, 7);
        DashboardServiceImpl service = serviceWithClock(today);

        when(planRepository.findTopByOrderByIdDesc()).thenReturn(Optional.of(makePlan()));
        when(scheduleDayRepository.findByWeekNumAndDayNum(1, 4))
                .thenReturn(Optional.of(makeDay(1, 4, "Thu")));
        when(scheduleDayRepository.findByWeekNumOrderByDayNumAsc(1))
                .thenReturn(makeWeek(1));
        when(lessonRepository.countByStatus(LessonStatus.DONE)).thenReturn(0L);
        when(sessionRepository.count()).thenReturn(0L);

        DashboardTodayDto dto = service.getDashboardToday();

        // dayNum 4 = today
        assertThat(dto.weekDays().get(3).status()).isEqualTo("TODAY");
        // dayNum 5, 6 = future weekdays
        assertThat(dto.weekDays().get(4).status()).isEqualTo("FUTURE");
        assertThat(dto.weekDays().get(5).status()).isEqualTo("FUTURE");
        // dayNum 7 = Sunday in the future → REST (not FUTURE)
        assertThat(dto.weekDays().get(6).status()).isEqualTo("REST");
    }

    @Test
    void getToday_givenPastDate_marksAsDone() {
        // today = 2026-05-06 (Wednesday, dayNum=3)
        // Monday and Tuesday are in the past → DONE
        LocalDate today = LocalDate.of(2026, 5, 6);
        DashboardServiceImpl service = serviceWithClock(today);

        when(planRepository.findTopByOrderByIdDesc()).thenReturn(Optional.of(makePlan()));
        when(scheduleDayRepository.findByWeekNumAndDayNum(1, 3))
                .thenReturn(Optional.of(makeDay(1, 3, "Wed")));
        when(scheduleDayRepository.findByWeekNumOrderByDayNumAsc(1))
                .thenReturn(makeWeek(1));
        when(lessonRepository.countByStatus(LessonStatus.DONE)).thenReturn(2L);
        when(sessionRepository.count()).thenReturn(3L);

        DashboardTodayDto dto = service.getDashboardToday();

        assertThat(dto.weekDays().get(0).status()).isEqualTo("DONE"); // Mon May 4
        assertThat(dto.weekDays().get(1).status()).isEqualTo("DONE"); // Tue May 5
        assertThat(dto.weekDays().get(2).status()).isEqualTo("TODAY"); // Wed May 6
    }
}
