package com.interviewcoach.dto;

import java.util.List;

public record DashboardTodayDto(
        PlanDto plan,
        TodayTasksDto todayTasks,
        List<WeekDayDto> weekDays,
        StatsDto stats) {

    public record PlanDto(int currentWeek, int daysLeft, String startDate) {}

    public record TodayTasksDto(
            LearningTaskDto learning,
            LeetcodeTaskDto leetcode,
            ProjectTaskDto project) {}

    public record LearningTaskDto(Long lessonId, String topic, String desc, String resource) {}

    public record LeetcodeTaskDto(String pattern, String problems, String topicId) {}

    public record ProjectTaskDto(String task) {}

    public record WeekDayDto(String dayLabel, String date, String status) {}

    public record StatsDto(long lessonsDone, long sessionsDone, int daysLeft) {}
}
