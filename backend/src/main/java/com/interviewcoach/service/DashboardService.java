package com.interviewcoach.service;

import com.interviewcoach.dto.DashboardTodayDto;

// WHY interface: enables Mockito @InjectMocks in tests and allows swapping implementations
// (e.g., caching implementation) without touching the controller.
public interface DashboardService {
    DashboardTodayDto getDashboardToday();
}
