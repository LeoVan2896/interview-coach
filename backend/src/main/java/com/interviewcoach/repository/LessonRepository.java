package com.interviewcoach.repository;

import com.interviewcoach.entity.Lesson;
import com.interviewcoach.entity.LessonCategory;
import com.interviewcoach.entity.LessonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Spring Data JPA derives SQL from the method name at startup — no @Query needed here.
// "findAllByOrderBySortOrderAsc" parses as: SELECT * FROM lessons ORDER BY sort_order ASC
@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findAllByOrderBySortOrderAsc();
    List<Lesson> findByCategoryOrderBySortOrderAsc(LessonCategory category);
    List<Lesson> findByStatusOrderBySortOrderAsc(LessonStatus status);
    long countByStatus(LessonStatus status);
}
