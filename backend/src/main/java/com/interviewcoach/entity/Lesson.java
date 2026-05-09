package com.interviewcoach.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lessons")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // EnumType.STRING stores "JAVA_CORE" in the DB column, not ordinal integer 0.
    // Ordinal breaks if you ever reorder enum values — always use STRING.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private LessonCategory category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LessonLevel level = LessonLevel.INTERMEDIATE;

    @Column(name = "duration_min", nullable = false)
    private int durationMin = 45;

    @Column(name = "content_html", columnDefinition = "TEXT")
    private String contentHtml;

    @Column(name = "fiserv_note", columnDefinition = "TEXT")
    private String fiservNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LessonStatus status = LessonStatus.NOT_STARTED;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    // updatable = false: once written on INSERT, Hibernate never emits an UPDATE for this column.
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Lesson() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LessonCategory getCategory() { return category; }
    public void setCategory(LessonCategory category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LessonLevel getLevel() { return level; }
    public void setLevel(LessonLevel level) { this.level = level; }

    public int getDurationMin() { return durationMin; }
    public void setDurationMin(int durationMin) { this.durationMin = durationMin; }

    public String getContentHtml() { return contentHtml; }
    public void setContentHtml(String contentHtml) { this.contentHtml = contentHtml; }

    public String getFiservNote() { return fiservNote; }
    public void setFiservNote(String fiservNote) { this.fiservNote = fiservNote; }

    public LessonStatus getStatus() { return status; }
    public void setStatus(LessonStatus status) { this.status = status; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
