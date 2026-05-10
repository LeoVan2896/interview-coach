package com.interviewcoach.repository;

import com.interviewcoach.entity.ScheduleDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleDayRepository extends JpaRepository<ScheduleDay, Long> {
    List<ScheduleDay> findByWeekNumOrderByDayNumAsc(int weekNum);
    Optional<ScheduleDay> findByWeekNumAndDayNum(int weekNum, int dayNum);
}
