package com.interviewcoach.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewcoach.dto.LessonDetailDto;
import com.interviewcoach.dto.LessonSummaryDto;
import com.interviewcoach.entity.LessonStatus;
import com.interviewcoach.exception.ResourceNotFoundException;
import com.interviewcoach.service.LessonService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// WHY @WebMvcTest: loads only the web layer (DispatcherServlet, @ControllerAdvice, filters).
// No database, no full context — tests run fast and verify HTTP contract only.
// GlobalExceptionHandler (@RestControllerAdvice) IS included by @WebMvcTest automatically.
@WebMvcTest(LessonController.class)
class LessonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // WHY @MockBean: registers mock into the Spring context so it gets injected into LessonController.
    // Plain @Mock (Mockito) won't work here — there's no Spring context to inject into.
    @MockBean
    private LessonService lessonService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getAll_givenNoParams_returns200WithLessonList() throws Exception {
        List<LessonSummaryDto> lessons = List.of(
                new LessonSummaryDto(1L, "JAVA_CORE", "Collections", "Desc", "INTERMEDIATE", 45, "DONE", 1)
        );
        when(lessonService.getAllLessons(null, null)).thenReturn(lessons);

        mockMvc.perform(get("/api/v1/lessons"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].category").value("JAVA_CORE"))
                .andExpect(jsonPath("$[0].status").value("DONE"));
    }

    @Test
    void getAll_givenCategoryParam_passesParamToService() throws Exception {
        when(lessonService.getAllLessons("JAVA_CORE", null)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/lessons?category=JAVA_CORE"))
                .andExpect(status().isOk());
    }

    @Test
    void getById_givenValidId_returns200WithDetail() throws Exception {
        LessonDetailDto detail = new LessonDetailDto(
                1L, "JAVA_CORE", "Collections", "Desc", "INTERMEDIATE",
                45, "IN_PROGRESS", 1, "<p>Content</p>", "Fiserv note"
        );
        when(lessonService.getLessonById(1L)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/lessons/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.contentHtml").value("<p>Content</p>"))
                .andExpect(jsonPath("$.fiservNote").value("Fiserv note"));
    }

    @Test
    void getById_givenInvalidId_returns404WithErrorBody() throws Exception {
        // ResourceNotFoundException message: "Lesson not found with id: 99"
        // GlobalExceptionHandler wraps it in ErrorResponse(message) → {"message": "..."}
        when(lessonService.getLessonById(99L))
                .thenThrow(new ResourceNotFoundException("Lesson", 99L));

        mockMvc.perform(get("/api/v1/lessons/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Lesson not found with id: 99"));
    }

    @Test
    void updateStatus_givenValidBody_returns200WithUpdatedDto() throws Exception {
        LessonDetailDto updated = new LessonDetailDto(
                1L, "JAVA_CORE", "Collections", "Desc", "INTERMEDIATE",
                45, "IN_PROGRESS", 1, null, null
        );
        when(lessonService.updateStatus(eq(1L), eq(LessonStatus.IN_PROGRESS))).thenReturn(updated);

        mockMvc.perform(patch("/api/v1/lessons/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void updateStatus_givenNullStatus_returns400() throws Exception {
        // @NotNull on LessonStatusUpdateDto.status() triggers @Valid → 400
        // GlobalExceptionHandler.handleValidation() catches MethodArgumentNotValidException
        mockMvc.perform(patch("/api/v1/lessons/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":null}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateStatus_givenMissingBody_returns400() throws Exception {
        // Empty JSON object {} means status field is absent → null → @NotNull fires → 400
        mockMvc.perform(patch("/api/v1/lessons/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
