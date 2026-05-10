package com.interviewcoach.controller;

import com.interviewcoach.dto.DashboardTodayDto;
import com.interviewcoach.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DashboardController.class)
class DashboardControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean DashboardService dashboardService;

    @Test
    void getToday_returns200WithAllFields() throws Exception {
        DashboardTodayDto dto = new DashboardTodayDto(
                new DashboardTodayDto.PlanDto(1, 49, "2026-05-04"),
                new DashboardTodayDto.TodayTasksDto(
                        new DashboardTodayDto.LearningTaskDto(5L,
                                "Concurrency: Threads & Executors",
                                "Thread, Runnable, Callable",
                                "Java Concurrency in Practice ch.6"),
                        new DashboardTodayDto.LeetcodeTaskDto(
                                "Arrays & Hashing", "Two Sum, Contains Duplicate", "arrays-hashing"),
                        new DashboardTodayDto.ProjectTaskDto("Build the Lessons Browser page")),
                List.of(new DashboardTodayDto.WeekDayDto("Sun", "2026-05-10", "TODAY")),
                new DashboardTodayDto.StatsDto(4L, 7L, 49));

        when(dashboardService.getDashboardToday()).thenReturn(dto);

        mockMvc.perform(get("/api/v1/dashboard/today"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan.currentWeek").value(1))
                .andExpect(jsonPath("$.plan.daysLeft").value(49))
                .andExpect(jsonPath("$.todayTasks.learning.lessonId").value(5))
                .andExpect(jsonPath("$.todayTasks.leetcode.topicId").value("arrays-hashing"))
                .andExpect(jsonPath("$.weekDays[0].status").value("TODAY"))
                .andExpect(jsonPath("$.stats.lessonsDone").value(4))
                .andExpect(jsonPath("$.stats.sessionsDone").value(7));
    }
}
