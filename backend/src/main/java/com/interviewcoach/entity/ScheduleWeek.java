package com.interviewcoach.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "schedule_weeks")
public class ScheduleWeek {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "week_num", nullable = false, unique = true)
    private int weekNum;

    @Column(nullable = false, length = 100)
    private String theme;

    @Column(name = "focus_java", columnDefinition = "TEXT")
    private String focusJava;

    @Column(name = "focus_dsa", columnDefinition = "TEXT")
    private String focusDsa;

    @Column(name = "focus_project", columnDefinition = "TEXT")
    private String focusProject;

    public ScheduleWeek() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getWeekNum() { return weekNum; }
    public void setWeekNum(int weekNum) { this.weekNum = weekNum; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public String getFocusJava() { return focusJava; }
    public void setFocusJava(String focusJava) { this.focusJava = focusJava; }

    public String getFocusDsa() { return focusDsa; }
    public void setFocusDsa(String focusDsa) { this.focusDsa = focusDsa; }

    public String getFocusProject() { return focusProject; }
    public void setFocusProject(String focusProject) { this.focusProject = focusProject; }
}
