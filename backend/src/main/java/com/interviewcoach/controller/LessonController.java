package com.interviewcoach.controller;

import com.interviewcoach.dto.LessonDetailDto;
import com.interviewcoach.dto.LessonStatusUpdateDto;
import com.interviewcoach.dto.LessonSummaryDto;
import com.interviewcoach.service.LessonService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// WHY @RestController: combines @Controller + @ResponseBody so every method return value
// is automatically serialized to JSON — no need for @ResponseBody on each method.
@RestController
@RequestMapping("/api/v1/lessons")
public class LessonController {

    // WHY explicit constructor instead of @RequiredArgsConstructor:
    // Lombok APT is not wired in this project's build, so code generation would silently fail.
    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    // GET /api/v1/lessons?category=JAVA_CORE&status=DONE
    // Both params are optional — null is passed to the service when omitted.
    @GetMapping
    public ResponseEntity<List<LessonSummaryDto>> getAll(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(lessonService.getAllLessons(category, status));
    }

    // GET /api/v1/lessons/{id}
    // Returns 404 via GlobalExceptionHandler if ResourceNotFoundException is thrown.
    @GetMapping("/{id}")
    public ResponseEntity<LessonDetailDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.getLessonById(id));
    }

    // PATCH /api/v1/lessons/{id}/status
    // WHY @Valid: triggers Bean Validation on LessonStatusUpdateDto (@NotNull on status field).
    // Without @Valid, the @NotNull constraint is ignored at runtime.
    @PatchMapping("/{id}/status")
    public ResponseEntity<LessonDetailDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody LessonStatusUpdateDto dto
    ) {
        return ResponseEntity.ok(lessonService.updateStatus(id, dto.status()));
    }
}
