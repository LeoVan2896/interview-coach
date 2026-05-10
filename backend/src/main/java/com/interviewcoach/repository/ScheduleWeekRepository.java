package com.interviewcoach.repository;

import com.interviewcoach.entity.ScheduleWeek;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScheduleWeekRepository extends JpaRepository<ScheduleWeek, Long> {
    List<ScheduleWeek> findAllByOrderByWeekNumAsc();
    Optional<ScheduleWeek> findByWeekNum(int weekNum);
}
