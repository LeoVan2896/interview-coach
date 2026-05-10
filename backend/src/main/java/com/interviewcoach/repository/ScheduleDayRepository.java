package com.interviewcoach.repository;

import com.interviewcoach.entity.ScheduleDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleDayRepository extends JpaRepository<ScheduleDay, Long> {
    List<ScheduleDay> findByWeekNumOrderByDayNumAsc(int weekNum);
}
