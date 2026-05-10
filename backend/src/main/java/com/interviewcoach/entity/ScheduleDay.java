package com.interviewcoach.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "schedule_days")
public class ScheduleDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "week_num", nullable = false)
    private int weekNum;

    @Column(name = "day_num", nullable = false)
    private int dayNum;

    @Column(name = "day_label", nullable = false, length = 10)
    private String dayLabel;

    @Column(name = "learning_topic", length = 200)
    private String learningTopic;

    @Column(name = "learning_desc", columnDefinition = "TEXT")
    private String learningDesc;

    @Column(name = "learning_resource", columnDefinition = "TEXT")
    private String learningResource;

    @Column(name = "dsa_pattern", length = 100)
    private String dsaPattern;

    @Column(name = "dsa_problems", columnDefinition = "TEXT")
    private String dsaProblems;

    @Column(name = "project_task", columnDefinition = "TEXT")
    private String projectTask;

    @Column(name = "is_milestone", nullable = false)
    private boolean isMilestone = false;

    public ScheduleDay() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getWeekNum() { return weekNum; }
    public void setWeekNum(int weekNum) { this.weekNum = weekNum; }

    public int getDayNum() { return dayNum; }
    public void setDayNum(int dayNum) { this.dayNum = dayNum; }

    public String getDayLabel() { return dayLabel; }
    public void setDayLabel(String dayLabel) { this.dayLabel = dayLabel; }

    public String getLearningTopic() { return learningTopic; }
    public void setLearningTopic(String learningTopic) { this.learningTopic = learningTopic; }

    public String getLearningDesc() { return learningDesc; }
    public void setLearningDesc(String learningDesc) { this.learningDesc = learningDesc; }

    public String getLearningResource() { return learningResource; }
    public void setLearningResource(String learningResource) { this.learningResource = learningResource; }

    public String getDsaPattern() { return dsaPattern; }
    public void setDsaPattern(String dsaPattern) { this.dsaPattern = dsaPattern; }

    public String getDsaProblems() { return dsaProblems; }
    public void setDsaProblems(String dsaProblems) { this.dsaProblems = dsaProblems; }

    public String getProjectTask() { return projectTask; }
    public void setProjectTask(String projectTask) { this.projectTask = projectTask; }

    public boolean isMilestone() { return isMilestone; }
    public void setMilestone(boolean isMilestone) { this.isMilestone = isMilestone; }
}
