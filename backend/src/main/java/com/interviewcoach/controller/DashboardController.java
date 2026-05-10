package com.interviewcoach.controller;

import com.interviewcoach.dto.DashboardTodayDto;
import com.interviewcoach.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Pure delegation: parse request → call service → return DTO.
// No business logic, no repository calls, no @Transactional.
// WHY @RestController: combines @Controller + @ResponseBody so every method return value
// is automatically serialized to JSON — no need for @ResponseBody on each method.
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    // WHY explicit constructor instead of @RequiredArgsConstructor:
    // Lombok APT is not wired in this project's build, so code generation would silently fail.
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // GET /api/v1/dashboard/today
    // Returns today's dashboard summary: plan, tasks, week view, stats.
    @GetMapping("/today")
    public ResponseEntity<DashboardTodayDto> getToday() {
        return ResponseEntity.ok(dashboardService.getDashboardToday());
    }
}
