package com.interviewcoach.service;

import com.interviewcoach.dto.LessonDetailDto;
import com.interviewcoach.dto.LessonSummaryDto;
import com.interviewcoach.entity.Lesson;
import com.interviewcoach.entity.LessonCategory;
import com.interviewcoach.entity.LessonLevel;
import com.interviewcoach.entity.LessonStatus;
import com.interviewcoach.exception.ResourceNotFoundException;
import com.interviewcoach.repository.LessonRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LessonServiceImplTest {

    @Mock
    private LessonRepository lessonRepository;

    @InjectMocks
    private LessonServiceImpl lessonService;

    private Lesson makeLesson(Long id, LessonCategory cat, LessonStatus status) {
        Lesson l = new Lesson();
        l.setId(id);
        l.setCategory(cat);
        l.setTitle("Lesson " + id);
        l.setDescription("Desc " + id);
        l.setLevel(LessonLevel.INTERMEDIATE);
        l.setDurationMin(45);
        l.setStatus(status);
        l.setSortOrder(id.intValue());
        return l;
    }

    @Test
    void getAllLessons_givenNoFilters_returnsAllOrderedBySortOrder() {
        Lesson l1 = makeLesson(1L, LessonCategory.JAVA_CORE, LessonStatus.DONE);
        Lesson l2 = makeLesson(2L, LessonCategory.SPRING_BOOT, LessonStatus.NOT_STARTED);
        when(lessonRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of(l1, l2));

        List<LessonSummaryDto> result = lessonService.getAllLessons(null, null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo(1L);
        assertThat(result.get(0).status()).isEqualTo("DONE");
        assertThat(result.get(1).category()).isEqualTo("SPRING_BOOT");
    }

    @Test
    void getAllLessons_givenCategoryFilter_delegatesToCategoryRepository() {
        Lesson l = makeLesson(1L, LessonCategory.JAVA_CORE, LessonStatus.IN_PROGRESS);
        when(lessonRepository.findByCategoryOrderBySortOrderAsc(LessonCategory.JAVA_CORE))
                .thenReturn(List.of(l));

        List<LessonSummaryDto> result = lessonService.getAllLessons("JAVA_CORE", null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).category()).isEqualTo("JAVA_CORE");
        verify(lessonRepository).findByCategoryOrderBySortOrderAsc(LessonCategory.JAVA_CORE);
    }

    @Test
    void getAllLessons_givenStatusFilter_delegatesToStatusRepository() {
        Lesson l = makeLesson(3L, LessonCategory.REACT, LessonStatus.DONE);
        when(lessonRepository.findByStatusOrderBySortOrderAsc(LessonStatus.DONE))
                .thenReturn(List.of(l));

        List<LessonSummaryDto> result = lessonService.getAllLessons(null, "DONE");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).status()).isEqualTo("DONE");
    }

    @Test
    void getAllLessons_givenInvalidCategory_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> lessonService.getAllLessons("INVALID_CATEGORY", null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getLessonById_givenValidId_returnsDetailDtoWithAllFields() {
        Lesson l = makeLesson(1L, LessonCategory.JAVA_CORE, LessonStatus.IN_PROGRESS);
        l.setContentHtml("<p>Content</p>");
        l.setCompanyNote("Relates to real-world API design patterns");
        when(lessonRepository.findById(1L)).thenReturn(Optional.of(l));

        LessonDetailDto result = lessonService.getLessonById(1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.contentHtml()).isEqualTo("<p>Content</p>");
        assertThat(result.companyNote()).isEqualTo("Relates to real-world API design patterns");
        assertThat(result.status()).isEqualTo("IN_PROGRESS");
    }

    @Test
    void getLessonById_givenInvalidId_throwsResourceNotFoundException() {
        when(lessonRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonService.getLessonById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Lesson not found with id: 99");
    }

    @Test
    void updateStatus_givenValidId_savesNewStatusAndReturnsDto() {
        Lesson l = makeLesson(1L, LessonCategory.JAVA_CORE, LessonStatus.NOT_STARTED);
        when(lessonRepository.findById(1L)).thenReturn(Optional.of(l));
        when(lessonRepository.save(any(Lesson.class))).thenReturn(l);

        LessonDetailDto result = lessonService.updateStatus(1L, LessonStatus.IN_PROGRESS);

        assertThat(result.status()).isEqualTo("IN_PROGRESS");
        verify(lessonRepository).save(l);
    }

    @Test
    void updateStatus_givenInvalidId_throwsResourceNotFoundException() {
        when(lessonRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> lessonService.updateStatus(99L, LessonStatus.DONE))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
