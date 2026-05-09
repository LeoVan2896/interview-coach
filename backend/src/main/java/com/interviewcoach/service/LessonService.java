package com.interviewcoach.service;

import com.interviewcoach.dto.LessonDetailDto;
import com.interviewcoach.dto.LessonSummaryDto;
import com.interviewcoach.entity.LessonStatus;

import java.util.List;

// WHY interface: enables Mockito @InjectMocks in tests and allows swapping implementations
// (e.g., caching implementation) without touching the controller.
public interface LessonService {
    List<LessonSummaryDto> getAllLessons(String category, String status);
    LessonDetailDto getLessonById(Long id);
    LessonDetailDto updateStatus(Long id, LessonStatus newStatus);
}
