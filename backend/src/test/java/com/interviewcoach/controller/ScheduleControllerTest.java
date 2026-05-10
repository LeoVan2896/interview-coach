package com.interviewcoach.controller;

import com.interviewcoach.dto.DayDto;
import com.interviewcoach.dto.WeekDetailDto;
import com.interviewcoach.dto.WeekSummaryDto;
import com.interviewcoach.exception.ResourceNotFoundException;
import com.interviewcoach.service.ScheduleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// WHY @WebMvcTest: loads only the web layer (DispatcherServlet, @ControllerAdvice, filters).
// No database, no full context — tests run fast and verify HTTP contract only.
// GlobalExceptionHandler (@RestControllerAdvice) IS included by @WebMvcTest automatically.
@WebMvcTest(ScheduleController.class)
class ScheduleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // WHY @MockBean: registers mock into the Spring context so it gets injected into ScheduleController.
    // Plain @Mock (Mockito) won't work here — there's no Spring context to inject into.
    @MockBean
    private ScheduleService scheduleService;

    @Test
    void getAllWeeks_returns200WithWeekList() throws Exception {
        List<WeekSummaryDto> weeks = List.of(
                new WeekSummaryDto(1, "Java Core Deep Dive", "Collections", "Hashing", "Seed data"),
                new WeekSummaryDto(2, "Spring Boot Architecture", "DI", "Linked Lists", "Migrations")
        );
        when(scheduleService.getAllWeeks()).thenReturn(weeks);

        mockMvc.perform(get("/api/v1/schedule/weeks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].weekNum").value(1))
                .andExpect(jsonPath("$[0].theme").value("Java Core Deep Dive"))
                .andExpect(jsonPath("$[1].weekNum").value(2));
    }

    @Test
    void getWeekByNum_givenValidNum_returns200WithWeekDetail() throws Exception {
        List<DayDto> days = List.of(
                new DayDto(1L, 1, 1, "Mon", "Collections", "Desc", "https://baeldung.com",
                        "Arrays & Hashing", "Two Sum", "Add seed data", false),
                new DayDto(7L, 1, 7, "Sun", "Week 1 Review", "Review", "https://interviewbit.com",
                        "Review", "Two Sum revisit", "Tag v0.1", true)
        );
        WeekDetailDto detail = new WeekDetailDto(1, "Java Core Deep Dive",
                "Collections, OOP", "Hashing, Two Pointers", "Seed data", days);
        when(scheduleService.getWeekByNum(1)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/schedule/weeks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weekNum").value(1))
                .andExpect(jsonPath("$.theme").value("Java Core Deep Dive"))
                .andExpect(jsonPath("$.days.length()").value(2))
                .andExpect(jsonPath("$.days[0].dayLabel").value("Mon"))
                .andExpect(jsonPath("$.days[1].isMilestone").value(true));
    }

    @Test
    void getWeekByNum_givenInvalidNum_returns404WithMessage() throws Exception {
        // ResourceNotFoundException message: "ScheduleWeek not found with id: 99"
        // GlobalExceptionHandler wraps it in ErrorResponse(message) → {"message": "..."}
        when(scheduleService.getWeekByNum(99))
                .thenThrow(new ResourceNotFoundException("ScheduleWeek", 99L));

        mockMvc.perform(get("/api/v1/schedule/weeks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("ScheduleWeek not found with id: 99"));
    }
}
