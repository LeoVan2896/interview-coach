package com.interviewcoach.service;

import com.interviewcoach.dto.WeekDetailDto;
import com.interviewcoach.dto.WeekSummaryDto;
import com.interviewcoach.entity.ScheduleDay;
import com.interviewcoach.entity.ScheduleWeek;
import com.interviewcoach.exception.ResourceNotFoundException;
import com.interviewcoach.repository.ScheduleDayRepository;
import com.interviewcoach.repository.ScheduleWeekRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceImplTest {

    @Mock
    private ScheduleWeekRepository weekRepository;

    @Mock
    private ScheduleDayRepository dayRepository;

    @InjectMocks
    private ScheduleServiceImpl scheduleService;

    private ScheduleWeek makeWeek(int weekNum, String theme) {
        ScheduleWeek w = new ScheduleWeek();
        w.setId((long) weekNum);
        w.setWeekNum(weekNum);
        w.setTheme(theme);
        w.setFocusJava("Java focus " + weekNum);
        w.setFocusDsa("DSA focus " + weekNum);
        w.setFocusProject("Project focus " + weekNum);
        return w;
    }

    private ScheduleDay makeDay(int weekNum, int dayNum, String label) {
        ScheduleDay d = new ScheduleDay();
        d.setId((long) (weekNum * 10 + dayNum));
        d.setWeekNum(weekNum);
        d.setDayNum(dayNum);
        d.setDayLabel(label);
        d.setLearningTopic("Learning " + dayNum);
        d.setLearningDesc("Desc " + dayNum);
        d.setLearningResource("https://example.com");
        d.setDsaPattern("Arrays");
        d.setDsaProblems("Two Sum");
        d.setProjectTask("Task " + dayNum);
        d.setMilestone(dayNum == 7);
        return d;
    }

    @Test
    void getAllWeeks_givenWeeksExist_returnsListOfWeekSummaryDtos() {
        ScheduleWeek w1 = makeWeek(1, "Java Core Deep Dive");
        ScheduleWeek w2 = makeWeek(2, "Spring Boot Architecture");
        when(weekRepository.findAllByOrderByWeekNumAsc()).thenReturn(List.of(w1, w2));

        List<WeekSummaryDto> result = scheduleService.getAllWeeks();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).weekNum()).isEqualTo(1);
        assertThat(result.get(0).theme()).isEqualTo("Java Core Deep Dive");
        assertThat(result.get(1).weekNum()).isEqualTo(2);
        assertThat(result.get(1).theme()).isEqualTo("Spring Boot Architecture");
    }

    @Test
    void getWeekByNum_givenValidWeekNum_returnsWeekDetailWithAllDays() {
        ScheduleWeek week = makeWeek(1, "Java Core Deep Dive");
        List<ScheduleDay> days = List.of(
                makeDay(1, 1, "Mon"),
                makeDay(1, 2, "Tue"),
                makeDay(1, 7, "Sun")
        );
        when(weekRepository.findByWeekNum(1)).thenReturn(Optional.of(week));
        when(dayRepository.findByWeekNumOrderByDayNumAsc(1)).thenReturn(days);

        WeekDetailDto result = scheduleService.getWeekByNum(1);

        assertThat(result.weekNum()).isEqualTo(1);
        assertThat(result.theme()).isEqualTo("Java Core Deep Dive");
        assertThat(result.days()).hasSize(3);
        assertThat(result.days().get(0).dayLabel()).isEqualTo("Mon");
        assertThat(result.days().get(2).isMilestone()).isTrue();
    }

    @Test
    void getWeekByNum_givenInvalidWeekNum_throwsResourceNotFoundException() {
        when(weekRepository.findByWeekNum(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> scheduleService.getWeekByNum(99))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("ScheduleWeek not found with id: 99");
    }
}
