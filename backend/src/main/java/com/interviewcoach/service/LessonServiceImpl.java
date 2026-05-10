package com.interviewcoach.service;

import com.interviewcoach.dto.LessonDetailDto;
import com.interviewcoach.dto.LessonSummaryDto;
import com.interviewcoach.entity.Lesson;
import com.interviewcoach.entity.LessonCategory;
import com.interviewcoach.entity.LessonStatus;
import com.interviewcoach.exception.ResourceNotFoundException;
import com.interviewcoach.repository.LessonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Constructor injection (not @Autowired field injection): final field + explicit constructor.
// This is what @RequiredArgsConstructor would generate — written explicitly because
// this project does not have Lombok annotation processing configured.
@Service
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;

    public LessonServiceImpl(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    @Override
    public List<LessonSummaryDto> getAllLessons(String category, String status) {
        List<Lesson> lessons;

        if (category != null && !category.isBlank()) {
            // valueOf throws IllegalArgumentException on unknown enum name —
            // GlobalExceptionHandler maps that to HTTP 400 automatically.
            LessonCategory cat = LessonCategory.valueOf(category.toUpperCase());
            lessons = lessonRepository.findByCategoryOrderBySortOrderAsc(cat);
        } else if (status != null && !status.isBlank()) {
            LessonStatus st = LessonStatus.valueOf(status.toUpperCase());
            lessons = lessonRepository.findByStatusOrderBySortOrderAsc(st);
        } else {
            lessons = lessonRepository.findAllByOrderBySortOrderAsc();
        }

        return lessons.stream().map(this::toSummaryDto).toList();
    }

    @Override
    public LessonDetailDto getLessonById(Long id) {
        // orElseThrow with ResourceNotFoundException instead of returning null —
        // null would cause NullPointerException later; this gives a clear 404.
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", id));
        return toDetailDto(lesson);
    }

    @Override
    @Transactional
    // @Transactional only on the write method — read methods don't need a transaction boundary
    // (no dirty-checking overhead). This matches the principle of least privilege for transactions.
    public LessonDetailDto updateStatus(Long id, LessonStatus newStatus) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", id));
        lesson.setStatus(newStatus);
        return toDetailDto(lessonRepository.save(lesson));
    }

    // Private mapping methods keep the mapping logic close to the data — no separate
    // MapStruct dependency needed at this scale.
    private LessonSummaryDto toSummaryDto(Lesson l) {
        return new LessonSummaryDto(
                l.getId(),
                l.getCategory().name(),
                l.getTitle(),
                l.getDescription(),
                l.getLevel().name(),
                l.getDurationMin(),
                l.getStatus().name(),
                l.getSortOrder()
        );
    }

    private LessonDetailDto toDetailDto(Lesson l) {
        return new LessonDetailDto(
                l.getId(),
                l.getCategory().name(),
                l.getTitle(),
                l.getDescription(),
                l.getLevel().name(),
                l.getDurationMin(),
                l.getStatus().name(),
                l.getSortOrder(),
                l.getContentHtml(),
                l.getCompanyNote()
        );
    }
}
