package com.interviewcoach.controller;

import com.interviewcoach.dto.WeekDetailDto;
import com.interviewcoach.dto.WeekSummaryDto;
import com.interviewcoach.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Pure delegation: parse request → call service → return DTO.
// No business logic, no repository calls, no @Transactional.
// WHY @RestController: combines @Controller + @ResponseBody so every method return value
// is automatically serialized to JSON — no need for @ResponseBody on each method.
@RestController
@RequestMapping("/api/v1/schedule")
public class ScheduleController {

    // WHY explicit constructor instead of @RequiredArgsConstructor:
    // Lombok APT is not wired in this project's build, so code generation would silently fail.
    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    // GET /api/v1/schedule/weeks
    // Returns all weeks as a flat summary list — no day data to keep the payload small.
    @GetMapping("/weeks")
    public ResponseEntity<List<WeekSummaryDto>> getAllWeeks() {
        return ResponseEntity.ok(scheduleService.getAllWeeks());
    }

    // GET /api/v1/schedule/weeks/{weekNum}
    // weekNum is int — Spring auto-coerces from path string. Non-integer → 400 from Spring.
    // Unknown weekNum → ResourceNotFoundException → GlobalExceptionHandler → 404.
    @GetMapping("/weeks/{weekNum}")
    public ResponseEntity<WeekDetailDto> getWeekByNum(@PathVariable int weekNum) {
        return ResponseEntity.ok(scheduleService.getWeekByNum(weekNum));
    }
}
