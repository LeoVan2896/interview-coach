# Today's Plan Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Today's Plan dashboard (`/` route) showing daily tasks across 3 pillars (Learning, LeetCode, Project), a 7-day week strip, DSA progress bars, and an illustrated 9-stage Globe that tracks overall knowledge growth.

**Architecture:** Spring Boot backend aggregates plan + schedule data into a single `GET /api/v1/dashboard/today` response; a `useDashboard` React hook merges this with DSA progress from localStorage; 7 focused components compose the page layout.

**Tech Stack:** Java 17 / Spring Boot 3.2.3 / PostgreSQL via Flyway / JUnit 5 + Mockito / React 18 + Vite / inline-SVG Globe

---

## File Structure

### New backend files

| File | Responsibility |
|---|---|
| `backend/src/main/resources/db/migration/V9__create_plan.sql` | Create `plans` table + seed row |
| `backend/src/main/resources/db/migration/V10__add_schedule_lesson_fk.sql` | Add `lesson_id` FK to `schedule_days` + backfill |
| `backend/src/main/java/com/interviewcoach/entity/Plan.java` | JPA entity for `plans` table |
| `backend/src/main/java/com/interviewcoach/repository/PlanRepository.java` | `findTopByOrderByIdDesc()` |
| `backend/src/main/java/com/interviewcoach/config/ClockConfig.java` | `@Bean Clock` for testable date logic |
| `backend/src/main/java/com/interviewcoach/dto/DashboardTodayDto.java` | Nested records for the full response |
| `backend/src/main/java/com/interviewcoach/service/DashboardService.java` | Interface: `getDashboardToday()` |
| `backend/src/main/java/com/interviewcoach/service/DashboardServiceImpl.java` | Aggregates plan + schedule + stats |
| `backend/src/main/java/com/interviewcoach/controller/DashboardController.java` | `GET /api/v1/dashboard/today` |
| `backend/src/test/java/com/interviewcoach/service/DashboardServiceImplTest.java` | Unit tests (Mockito) |
| `backend/src/test/java/com/interviewcoach/controller/DashboardControllerTest.java` | MockMvc test |

### Modified backend files

| File | Change |
|---|---|
| `backend/src/main/java/com/interviewcoach/entity/ScheduleDay.java` | Add `lessonId` field + getter/setter |
| `backend/src/main/java/com/interviewcoach/repository/LessonRepository.java` | Add `countByStatus(LessonStatus)` |
| `backend/src/main/java/com/interviewcoach/repository/ScheduleDayRepository.java` | Add `findByWeekNumAndDayNum(int, int)` |

### New frontend files

| File | Responsibility |
|---|---|
| `frontend/src/api/dashboard.js` | `fetchDashboardToday()` via axios |
| `frontend/src/hooks/useDashboard.js` | Fetch + localStorage merge + globe computation |
| `frontend/src/components/dashboard/PillarCard.jsx` | Reusable card for Learning / LeetCode / Project |
| `frontend/src/components/dashboard/WeekStrip.jsx` | 7-day status pills |
| `frontend/src/components/dashboard/DsaProgressList.jsx` | Per-topic DSA progress bars from localStorage |
| `frontend/src/components/dashboard/Globe.jsx` | 9-stage illustrated SVG landscape + slider |
| `frontend/src/components/dashboard/StatsCard.jsx` | 4 stat boxes + Globe |
| `frontend/src/pages/DashboardPage.jsx` | Composes all components |

### Modified frontend files

| File | Change |
|---|---|
| `frontend/src/App.jsx` | Replace `<ComingSoon name="Today's Plan" />` with `<DashboardPage />` |

---

## Task 1: V9 Migration — Create plans table

**Files:**
- Create: `backend/src/main/resources/db/migration/V9__create_plan.sql`

- [ ] **Step 1: Create the migration file**

```sql
CREATE TABLE plans (
  id         BIGSERIAL PRIMARY KEY,
  start_date DATE      NOT NULL,
  end_date   DATE      NOT NULL
);

INSERT INTO plans (start_date, end_date) VALUES ('2026-05-04', '2026-06-28');
```

- [ ] **Step 2: Start the backend and verify migration applies**

Run from `F:\interview-coach\backend\`:
```
mvn spring-boot:run
```
Expected: Flyway prints `Successfully applied 1 migration to schema "public", now at version v9` in startup logs. Stop the server with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/resources/db/migration/V9__create_plan.sql
git commit -m "feat: V9 migration — create plans table with seed row"
```

---

## Task 2: V10 Migration — Add lesson_id FK to schedule_days

**Files:**
- Create: `backend/src/main/resources/db/migration/V10__add_schedule_lesson_fk.sql`

- [ ] **Step 1: Create the migration file**

```sql
ALTER TABLE schedule_days ADD COLUMN lesson_id BIGINT REFERENCES lessons(id);

UPDATE schedule_days sd
SET lesson_id = (SELECT id FROM lessons WHERE title = sd.learning_topic LIMIT 1);
```

The UPDATE is best-effort: rows where no lesson title matches keep `lesson_id = NULL`. The dashboard Learning card falls back to `/lessons` when `lessonId` is null.

- [ ] **Step 2: Start the backend and verify**

Run `mvn spring-boot:run`. Expected: `Successfully applied 1 migration to schema "public", now at version v10`. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/resources/db/migration/V10__add_schedule_lesson_fk.sql
git commit -m "feat: V10 migration — add lesson_id FK to schedule_days with best-effort backfill"
```

---

## Task 3: Update ScheduleDay entity + LessonRepository + ScheduleDayRepository

**Files:**
- Modify: `backend/src/main/java/com/interviewcoach/entity/ScheduleDay.java`
- Modify: `backend/src/main/java/com/interviewcoach/repository/LessonRepository.java`
- Modify: `backend/src/main/java/com/interviewcoach/repository/ScheduleDayRepository.java`

- [ ] **Step 1: Add `lessonId` to ScheduleDay entity**

In `ScheduleDay.java`, after the `isMilestone` field and before the getters, add:

```java
@Column(name = "lesson_id")
private Long lessonId;
```

After the existing `isMilestone` getter/setter, add:

```java
public Long getLessonId() { return lessonId; }
public void setLessonId(Long lessonId) { this.lessonId = lessonId; }
```

- [ ] **Step 2: Add `countByStatus` to LessonRepository**

In `LessonRepository.java`, add this method after the existing ones:

```java
long countByStatus(LessonStatus status);
```

The file should look like:

```java
package com.interviewcoach.repository;

import com.interviewcoach.entity.Lesson;
import com.interviewcoach.entity.LessonCategory;
import com.interviewcoach.entity.LessonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findAllByOrderBySortOrderAsc();
    List<Lesson> findByCategoryOrderBySortOrderAsc(LessonCategory category);
    List<Lesson> findByStatusOrderBySortOrderAsc(LessonStatus status);
    long countByStatus(LessonStatus status);
}
```

- [ ] **Step 3: Add `findByWeekNumAndDayNum` to ScheduleDayRepository**

In `ScheduleDayRepository.java`, add:

```java
import java.util.Optional;

Optional<ScheduleDay> findByWeekNumAndDayNum(int weekNum, int dayNum);
```

Full file after edit:

```java
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
```

- [ ] **Step 4: Verify compilation**

```
cd F:\interview-coach\backend && mvn compile -q
```
Expected: BUILD SUCCESS with no errors.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/interviewcoach/entity/ScheduleDay.java \
        backend/src/main/java/com/interviewcoach/repository/LessonRepository.java \
        backend/src/main/java/com/interviewcoach/repository/ScheduleDayRepository.java
git commit -m "feat: extend ScheduleDay, LessonRepository, ScheduleDayRepository for dashboard"
```

---

## Task 4: Plan entity + PlanRepository + ClockConfig

**Files:**
- Create: `backend/src/main/java/com/interviewcoach/entity/Plan.java`
- Create: `backend/src/main/java/com/interviewcoach/repository/PlanRepository.java`
- Create: `backend/src/main/java/com/interviewcoach/config/ClockConfig.java`

- [ ] **Step 1: Create Plan entity**

```java
package com.interviewcoach.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    public Plan() {}

    public Long getId() { return id; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
```

- [ ] **Step 2: Create PlanRepository**

```java
package com.interviewcoach.repository;

import com.interviewcoach.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {
    Optional<Plan> findTopByOrderByIdDesc();
}
```

- [ ] **Step 3: Create ClockConfig**

The `Clock` bean lets `DashboardServiceImpl` receive the current time via injection so tests can freeze time without PowerMock.

```java
package com.interviewcoach.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
```

- [ ] **Step 4: Compile**

```
cd F:\interview-coach\backend && mvn compile -q
```
Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/interviewcoach/entity/Plan.java \
        backend/src/main/java/com/interviewcoach/repository/PlanRepository.java \
        backend/src/main/java/com/interviewcoach/config/ClockConfig.java
git commit -m "feat: add Plan entity, PlanRepository, ClockConfig"
```

---

## Task 5: DashboardTodayDto

**Files:**
- Create: `backend/src/main/java/com/interviewcoach/dto/DashboardTodayDto.java`

- [ ] **Step 1: Create the DTO record with nested records**

```java
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
```

- [ ] **Step 2: Compile**

```
cd F:\interview-coach\backend && mvn compile -q
```
Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/interviewcoach/dto/DashboardTodayDto.java
git commit -m "feat: add DashboardTodayDto with nested records"
```

---

## Task 6: DashboardService interface

**Files:**
- Create: `backend/src/main/java/com/interviewcoach/service/DashboardService.java`

- [ ] **Step 1: Create the interface**

```java
package com.interviewcoach.service;

import com.interviewcoach.dto.DashboardTodayDto;

public interface DashboardService {
    DashboardTodayDto getDashboardToday();
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/java/com/interviewcoach/service/DashboardService.java
git commit -m "feat: add DashboardService interface"
```

---

## Task 7: DashboardServiceImplTest (failing tests)

**Files:**
- Create: `backend/src/test/java/com/interviewcoach/service/DashboardServiceImplTest.java`

Write the tests first — they will fail until Task 8 creates the implementation.

- [ ] **Step 1: Create the test class**

```java
package com.interviewcoach.service;

import com.interviewcoach.dto.DashboardTodayDto;
import com.interviewcoach.entity.LessonStatus;
import com.interviewcoach.entity.Plan;
import com.interviewcoach.entity.ScheduleDay;
import com.interviewcoach.repository.LessonRepository;
import com.interviewcoach.repository.PlanRepository;
import com.interviewcoach.repository.ScheduleDayRepository;
import com.interviewcoach.repository.SessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.*;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock PlanRepository planRepository;
    @Mock ScheduleDayRepository scheduleDayRepository;
    @Mock LessonRepository lessonRepository;
    @Mock SessionRepository sessionRepository;

    // ── helpers ──────────────────────────────────────────────────────────────

    private DashboardServiceImpl serviceWithClock(LocalDate fixedDate) {
        Clock clock = Clock.fixed(
                fixedDate.atStartOfDay(ZoneId.systemDefault()).toInstant(),
                ZoneId.systemDefault());
        return new DashboardServiceImpl(
                planRepository, scheduleDayRepository, lessonRepository, sessionRepository, clock);
    }

    private Plan makePlan() {
        Plan p = new Plan();
        p.setStartDate(LocalDate.of(2026, 5, 4));
        p.setEndDate(LocalDate.of(2026, 6, 28));
        return p;
    }

    private ScheduleDay makeDay(int weekNum, int dayNum, String dayLabel) {
        ScheduleDay d = new ScheduleDay();
        d.setWeekNum(weekNum);
        d.setDayNum(dayNum);
        d.setDayLabel(dayLabel);
        d.setLearningTopic("Concurrency: Threads & Executors");
        d.setLearningDesc("Thread, Runnable, Callable");
        d.setLearningResource("Java Concurrency in Practice ch.6");
        d.setDsaPattern("Arrays & Hashing");
        d.setDsaProblems("Two Sum, Contains Duplicate");
        d.setProjectTask("Build the Lessons Browser page");
        d.setLessonId(5L);
        return d;
    }

    private List<ScheduleDay> makeWeek(int weekNum) {
        String[] labels = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        return java.util.stream.IntStream.rangeClosed(1, 7)
                .mapToObj(i -> makeDay(weekNum, i, labels[i - 1]))
                .toList();
    }

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void getToday_givenValidPlan_returnsDtoWithCorrectWeekNum() {
        // today = 2026-05-10 (Sunday, dayNum=7, week 1: daysBetween=6, floor(6/7)=0, week=1)
        LocalDate today = LocalDate.of(2026, 5, 10);
        DashboardServiceImpl service = serviceWithClock(today);

        when(planRepository.findTopByOrderByIdDesc()).thenReturn(Optional.of(makePlan()));
        when(scheduleDayRepository.findByWeekNumAndDayNum(1, 7))
                .thenReturn(Optional.of(makeDay(1, 7, "Sun")));
        when(scheduleDayRepository.findByWeekNumOrderByDayNumAsc(1))
                .thenReturn(makeWeek(1));
        when(lessonRepository.countByStatus(LessonStatus.DONE)).thenReturn(4L);
        when(sessionRepository.count()).thenReturn(7L);

        DashboardTodayDto dto = service.getDashboardToday();

        assertThat(dto.plan().currentWeek()).isEqualTo(1);
        assertThat(dto.plan().daysLeft()).isEqualTo(49);
        assertThat(dto.plan().startDate()).isEqualTo("2026-05-04");
        assertThat(dto.stats().lessonsDone()).isEqualTo(4);
        assertThat(dto.stats().sessionsDone()).isEqualTo(7);
        assertThat(dto.todayTasks().learning().lessonId()).isEqualTo(5L);
        assertThat(dto.todayTasks().leetcode().topicId()).isEqualTo("arrays-hashing");
        // day 7 = today → TODAY
        assertThat(dto.weekDays().get(6).status()).isEqualTo("TODAY");
        // days 1-6 are past → DONE
        assertThat(dto.weekDays().get(0).status()).isEqualTo("DONE");
        assertThat(dto.weekDays().get(5).status()).isEqualTo("DONE");
    }

    @Test
    void getToday_givenSunday_marksAsRestNotFuture() {
        // today = 2026-05-07 (Thursday, dayNum=4)
        // Sunday May 10 is in the future → should be REST, not FUTURE
        LocalDate today = LocalDate.of(2026, 5, 7);
        DashboardServiceImpl service = serviceWithClock(today);

        when(planRepository.findTopByOrderByIdDesc()).thenReturn(Optional.of(makePlan()));
        when(scheduleDayRepository.findByWeekNumAndDayNum(1, 4))
                .thenReturn(Optional.of(makeDay(1, 4, "Thu")));
        when(scheduleDayRepository.findByWeekNumOrderByDayNumAsc(1))
                .thenReturn(makeWeek(1));
        when(lessonRepository.countByStatus(LessonStatus.DONE)).thenReturn(0L);
        when(sessionRepository.count()).thenReturn(0L);

        DashboardTodayDto dto = service.getDashboardToday();

        // dayNum 4 = today
        assertThat(dto.weekDays().get(3).status()).isEqualTo("TODAY");
        // dayNum 5, 6 = future weekdays
        assertThat(dto.weekDays().get(4).status()).isEqualTo("FUTURE");
        assertThat(dto.weekDays().get(5).status()).isEqualTo("FUTURE");
        // dayNum 7 = Sunday in the future → REST (not FUTURE)
        assertThat(dto.weekDays().get(6).status()).isEqualTo("REST");
    }

    @Test
    void getToday_givenPastDate_marksAsDone() {
        // today = 2026-05-06 (Wednesday, dayNum=3)
        // Monday and Tuesday are in the past → DONE
        LocalDate today = LocalDate.of(2026, 5, 6);
        DashboardServiceImpl service = serviceWithClock(today);

        when(planRepository.findTopByOrderByIdDesc()).thenReturn(Optional.of(makePlan()));
        when(scheduleDayRepository.findByWeekNumAndDayNum(1, 3))
                .thenReturn(Optional.of(makeDay(1, 3, "Wed")));
        when(scheduleDayRepository.findByWeekNumOrderByDayNumAsc(1))
                .thenReturn(makeWeek(1));
        when(lessonRepository.countByStatus(LessonStatus.DONE)).thenReturn(2L);
        when(sessionRepository.count()).thenReturn(3L);

        DashboardTodayDto dto = service.getDashboardToday();

        assertThat(dto.weekDays().get(0).status()).isEqualTo("DONE"); // Mon May 4
        assertThat(dto.weekDays().get(1).status()).isEqualTo("DONE"); // Tue May 5
        assertThat(dto.weekDays().get(2).status()).isEqualTo("TODAY"); // Wed May 6
    }
}
```

- [ ] **Step 2: Run tests — expect compile failure (class not found)**

```
cd F:\interview-coach\backend && mvn test -Dtest=DashboardServiceImplTest -q 2>&1 | head -20
```
Expected: compilation error — `DashboardServiceImpl` does not exist yet.

- [ ] **Step 3: Commit the test**

```bash
git add backend/src/test/java/com/interviewcoach/service/DashboardServiceImplTest.java
git commit -m "test: add DashboardServiceImplTest (red — impl pending)"
```

---

## Task 8: DashboardServiceImpl

**Files:**
- Create: `backend/src/main/java/com/interviewcoach/service/DashboardServiceImpl.java`

- [ ] **Step 1: Create the implementation**

```java
package com.interviewcoach.service;

import com.interviewcoach.dto.DashboardTodayDto;
import com.interviewcoach.entity.LessonStatus;
import com.interviewcoach.entity.Plan;
import com.interviewcoach.entity.ScheduleDay;
import com.interviewcoach.exception.ResourceNotFoundException;
import com.interviewcoach.repository.LessonRepository;
import com.interviewcoach.repository.PlanRepository;
import com.interviewcoach.repository.ScheduleDayRepository;
import com.interviewcoach.repository.SessionRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    private static final Map<String, String> TOPIC_SLUGS = Map.ofEntries(
            Map.entry("Arrays & Hashing",       "arrays-hashing"),
            Map.entry("Two Pointers",            "two-pointers"),
            Map.entry("Sliding Window",          "sliding-window"),
            Map.entry("Stack",                   "stack"),
            Map.entry("Binary Search",           "binary-search"),
            Map.entry("Linked Lists",            "linked-lists"),
            Map.entry("Trees",                   "trees"),
            Map.entry("Heaps / Priority Queue",  "heaps"),
            Map.entry("Graphs",                  "graphs"),
            Map.entry("Dynamic Programming",     "dp"),
            Map.entry("Tries",                   "tries"),
            Map.entry("Intervals",               "intervals")
    );

    private final PlanRepository planRepository;
    private final ScheduleDayRepository scheduleDayRepository;
    private final LessonRepository lessonRepository;
    private final SessionRepository sessionRepository;
    private final Clock clock;

    public DashboardServiceImpl(
            PlanRepository planRepository,
            ScheduleDayRepository scheduleDayRepository,
            LessonRepository lessonRepository,
            SessionRepository sessionRepository,
            Clock clock) {
        this.planRepository = planRepository;
        this.scheduleDayRepository = scheduleDayRepository;
        this.lessonRepository = lessonRepository;
        this.sessionRepository = sessionRepository;
        this.clock = clock;
    }

    @Override
    public DashboardTodayDto getDashboardToday() {
        Plan plan = planRepository.findTopByOrderByIdDesc()
                .orElseThrow(() -> new ResourceNotFoundException("Plan", 0L));

        LocalDate today = LocalDate.now(clock);
        LocalDate startDate = plan.getStartDate();

        long daysBetween = ChronoUnit.DAYS.between(startDate, today);
        int currentWeek = Math.min(8, Math.max(1, (int) Math.floor(daysBetween / 7.0) + 1));
        int daysLeft = Math.max(0, (int) ChronoUnit.DAYS.between(today, plan.getEndDate()));

        // ISO day-of-week: 1=Mon … 7=Sun — matches schedule_days.day_num convention
        int currentDayNum = today.getDayOfWeek().getValue();

        ScheduleDay todayDay = scheduleDayRepository.findByWeekNumAndDayNum(currentWeek, currentDayNum)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleDay", (long) currentDayNum));

        List<ScheduleDay> weekDays = scheduleDayRepository.findByWeekNumOrderByDayNumAsc(currentWeek);
        LocalDate weekStart = startDate.plusDays((long) (currentWeek - 1) * 7);

        List<DashboardTodayDto.WeekDayDto> weekDayDtos = weekDays.stream()
                .map(d -> {
                    LocalDate dayDate = weekStart.plusDays(d.getDayNum() - 1);
                    String status;
                    if (dayDate.isBefore(today)) {
                        status = "DONE";
                    } else if (dayDate.equals(today)) {
                        status = "TODAY";
                    } else if (dayDate.getDayOfWeek() == DayOfWeek.SUNDAY) {
                        status = "REST";
                    } else {
                        status = "FUTURE";
                    }
                    return new DashboardTodayDto.WeekDayDto(d.getDayLabel(), dayDate.toString(), status);
                })
                .toList();

        long lessonsDone = lessonRepository.countByStatus(LessonStatus.DONE);
        long sessionsDone = sessionRepository.count();

        String topicId = TOPIC_SLUGS.getOrDefault(todayDay.getDsaPattern(), "arrays-hashing");

        return new DashboardTodayDto(
                new DashboardTodayDto.PlanDto(currentWeek, daysLeft, startDate.toString()),
                new DashboardTodayDto.TodayTasksDto(
                        new DashboardTodayDto.LearningTaskDto(
                                todayDay.getLessonId(),
                                todayDay.getLearningTopic(),
                                todayDay.getLearningDesc(),
                                todayDay.getLearningResource()),
                        new DashboardTodayDto.LeetcodeTaskDto(
                                todayDay.getDsaPattern(),
                                todayDay.getDsaProblems(),
                                topicId),
                        new DashboardTodayDto.ProjectTaskDto(todayDay.getProjectTask())),
                weekDayDtos,
                new DashboardTodayDto.StatsDto(lessonsDone, sessionsDone, daysLeft));
    }
}
```

- [ ] **Step 2: Run the tests — expect GREEN**

```
cd F:\interview-coach\backend && mvn test -Dtest=DashboardServiceImplTest -q
```
Expected:
```
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/interviewcoach/service/DashboardServiceImpl.java
git commit -m "feat: implement DashboardServiceImpl — aggregates plan + schedule + stats"
```

---

## Task 9: DashboardControllerTest (failing)

**Files:**
- Create: `backend/src/test/java/com/interviewcoach/controller/DashboardControllerTest.java`

- [ ] **Step 1: Create the test**

```java
package com.interviewcoach.controller;

import com.interviewcoach.dto.DashboardTodayDto;
import com.interviewcoach.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DashboardController.class)
class DashboardControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean DashboardService dashboardService;

    @Test
    void getToday_returns200WithAllFields() throws Exception {
        DashboardTodayDto dto = new DashboardTodayDto(
                new DashboardTodayDto.PlanDto(1, 49, "2026-05-04"),
                new DashboardTodayDto.TodayTasksDto(
                        new DashboardTodayDto.LearningTaskDto(5L,
                                "Concurrency: Threads & Executors",
                                "Thread, Runnable, Callable",
                                "Java Concurrency in Practice ch.6"),
                        new DashboardTodayDto.LeetcodeTaskDto(
                                "Arrays & Hashing", "Two Sum, Contains Duplicate", "arrays-hashing"),
                        new DashboardTodayDto.ProjectTaskDto("Build the Lessons Browser page")),
                List.of(new DashboardTodayDto.WeekDayDto("Sun", "2026-05-10", "TODAY")),
                new DashboardTodayDto.StatsDto(4L, 7L, 49));

        when(dashboardService.getDashboardToday()).thenReturn(dto);

        mockMvc.perform(get("/api/v1/dashboard/today"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan.currentWeek").value(1))
                .andExpect(jsonPath("$.plan.daysLeft").value(49))
                .andExpect(jsonPath("$.todayTasks.learning.lessonId").value(5))
                .andExpect(jsonPath("$.todayTasks.leetcode.topicId").value("arrays-hashing"))
                .andExpect(jsonPath("$.weekDays[0].status").value("TODAY"))
                .andExpect(jsonPath("$.stats.lessonsDone").value(4))
                .andExpect(jsonPath("$.stats.sessionsDone").value(7));
    }
}
```

- [ ] **Step 2: Run — expect compile error (controller not yet created)**

```
cd F:\interview-coach\backend && mvn test -Dtest=DashboardControllerTest -q 2>&1 | head -10
```
Expected: compilation error.

- [ ] **Step 3: Commit**

```bash
git add backend/src/test/java/com/interviewcoach/controller/DashboardControllerTest.java
git commit -m "test: add DashboardControllerTest (red — controller pending)"
```

---

## Task 10: DashboardController

**Files:**
- Create: `backend/src/main/java/com/interviewcoach/controller/DashboardController.java`

- [ ] **Step 1: Create the controller**

```java
package com.interviewcoach.controller;

import com.interviewcoach.dto.DashboardTodayDto;
import com.interviewcoach.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/today")
    public ResponseEntity<DashboardTodayDto> getToday() {
        return ResponseEntity.ok(dashboardService.getDashboardToday());
    }
}
```

- [ ] **Step 2: Run both test classes — expect GREEN**

```
cd F:\interview-coach\backend && mvn test -Dtest="DashboardControllerTest,DashboardServiceImplTest" -q
```
Expected:
```
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

- [ ] **Step 3: Run full test suite — verify no regressions**

```
cd F:\interview-coach\backend && mvn test -q
```
Expected: BUILD SUCCESS (all existing tests still pass).

- [ ] **Step 4: Quick smoke test against running backend**

Start the backend: `mvn spring-boot:run`

In another terminal:
```
curl http://localhost:8080/api/v1/dashboard/today
```
Expected: JSON response with `plan`, `todayTasks`, `weekDays`, `stats` fields. Stop backend with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/interviewcoach/controller/DashboardController.java
git commit -m "feat: add DashboardController GET /api/v1/dashboard/today"
```

---

## Task 11: Frontend — api/dashboard.js

**Files:**
- Create: `frontend/src/api/dashboard.js`

- [ ] **Step 1: Create the API function**

```js
import axios from './axios.js'

export async function fetchDashboardToday() {
  const { data } = await axios.get('/dashboard/today')
  return data
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/dashboard.js
git commit -m "feat: add fetchDashboardToday API function"
```

---

## Task 12: Frontend — hooks/useDashboard.js

**Files:**
- Create: `frontend/src/hooks/useDashboard.js`

- [ ] **Step 1: Create the hook**

```js
import { useState, useEffect } from 'react'
import { fetchDashboardToday } from '../api/dashboard.js'
import { TOPICS } from '../data/dsaData.js'

const LS_KEY = 'dsa_progress'

export function useDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardToday()
      .then(serverData => {
        let progress = {}
        try {
          progress = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
        } catch (_) {}

        const problemsDone = Object.values(progress).filter(Boolean).length

        const dsaProgress = TOPICS.map(topic => ({
          topicId: topic.id,
          label: topic.label,
          done: topic.problems.filter(p => progress[p.id]).length,
          total: topic.problems.length,
        }))

        const lessonsDone = serverData.stats.lessonsDone
        const globePercent =
          ((lessonsDone / 60) * 0.5 + (problemsDone / 150) * 0.5) * 100
        const globeStage = Math.min(9, Math.floor(globePercent / 11.11) + 1)

        setData({ ...serverData, problemsDone, dsaProgress, globeStage })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useDashboard.js
git commit -m "feat: add useDashboard hook — merges API + localStorage + globe computation"
```

---

## Task 13: Frontend — PillarCard.jsx

**Files:**
- Create: `frontend/src/components/dashboard/PillarCard.jsx`

- [ ] **Step 1: Create the component**

```jsx
export default function PillarCard({ color, icon, label, badge, title, desc, buttonLabel, onAction }) {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flex: 1,
      minWidth: 0,
    }}>
      {/* Color top bar */}
      <div style={{ background: color, height: 4 }} />

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </span>
          {badge && (
            <span style={{
              marginLeft: 'auto',
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              background: '#f1f5f9',
              borderRadius: 6,
              color: 'var(--color-text-muted)',
            }}>
              {badge}
            </span>
          )}
        </div>

        {/* Title */}
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.35 }}>
          {title}
        </div>

        {/* Description */}
        {desc && (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5, flex: 1 }}>
            {desc}
          </div>
        )}

        {/* Action button */}
        <button
          onClick={onAction}
          style={{
            marginTop: 'auto',
            padding: '7px 14px',
            background: color,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/dashboard/PillarCard.jsx
git commit -m "feat: add PillarCard component"
```

---

## Task 14: Frontend — WeekStrip.jsx

**Files:**
- Create: `frontend/src/components/dashboard/WeekStrip.jsx`

- [ ] **Step 1: Create the component**

```jsx
const STATUS_STYLE = {
  DONE:   { background: '#dcfce7', border: '1px solid #86efac', color: '#166534' },
  TODAY:  { background: '#eff6ff', border: '2px solid #3b82f6', color: '#1d4ed8' },
  FUTURE: { background: '#f8fafc', border: '1px solid #cbd5e1', color: '#94a3b8' },
  REST:   { background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#94a3b8' },
}

const STATUS_ICON = {
  DONE: '✓',
  TODAY: '●',
  FUTURE: '',
  REST: '💤',
}

export default function WeekStrip({ weekDays }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {weekDays.map(day => {
        const s = STATUS_STYLE[day.status] || STATUS_STYLE.FUTURE
        const icon = STATUS_ICON[day.status] || ''
        return (
          <div
            key={day.date}
            style={{
              ...s,
              borderRadius: 8,
              padding: '6px 10px',
              textAlign: 'center',
              flex: 1,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <div>{day.dayLabel}</div>
            <div style={{ fontSize: 13, marginTop: 2 }}>{icon}</div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/dashboard/WeekStrip.jsx
git commit -m "feat: add WeekStrip component"
```

---

## Task 15: Frontend — DsaProgressList.jsx

**Files:**
- Create: `frontend/src/components/dashboard/DsaProgressList.jsx`

- [ ] **Step 1: Create the component**

```jsx
export default function DsaProgressList({ dsaProgress }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1 }}>
      {dsaProgress.map(({ topicId, label, done, total }) => {
        const pct = total === 0 ? 0 : Math.round((done / total) * 100)
        return (
          <div key={topicId}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{label}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{done}/{total}</span>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: '#3b82f6',
                borderRadius: 3,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/dashboard/DsaProgressList.jsx
git commit -m "feat: add DsaProgressList component"
```

---

## Task 16: Frontend — Globe.jsx

**Files:**
- Create: `frontend/src/components/dashboard/Globe.jsx`

Each case is a standalone SVG landscape scene. The slider is local state and does not write back to progress — it's preview-only.

- [ ] **Step 1: Create the component**

```jsx
import { useState } from 'react'

const STAGE_LABELS = [
  '', 'Dark Ages', 'Stone Age', 'Ancient Civilization', 'Medieval',
  'Age of Discovery', 'Industrial Revolution', 'Modern City', 'Digital Age', 'Connected World'
]

function StageScene({ stage }) {
  switch (stage) {
    case 1: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <rect width="130" height="110" fill="#0a0a1a" />
        <rect y="85" width="130" height="25" fill="#12120a" />
        <circle cx="98" cy="22" r="10" fill="#7a7040" opacity="0.4" />
        <circle cx="105" cy="19" r="10" fill="#0a0a1a" />
      </svg>
    )
    case 2: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <rect width="130" height="110" fill="#0d1230" />
        <rect y="78" width="130" height="32" fill="#1a1208" />
        <circle cx="20" cy="14" r="0.8" fill="#fff" opacity="0.8" />
        <circle cx="50" cy="9"  r="0.6" fill="#fff" opacity="0.6" />
        <circle cx="75" cy="18" r="0.8" fill="#fff" opacity="0.7" />
        <circle cx="100" cy="8" r="0.6" fill="#fff" opacity="0.5" />
        <path d="M95,78 L80,48 L112,48 L112,78 Z" fill="#080808" />
        <ellipse cx="32" cy="78" rx="14" ry="6" fill="#ff6600" opacity="0.5" />
        <ellipse cx="32" cy="75" rx="7" ry="9" fill="#ffaa00" opacity="0.6" />
      </svg>
    )
    case 3: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87ceeb" />
            <stop offset="100%" stopColor="#ffd580" />
          </linearGradient>
        </defs>
        <rect width="130" height="110" fill="url(#sky3)" />
        <rect y="74" width="130" height="36" fill="#c2a050" />
        <rect y="71" width="130" height="5" fill="#4a90d9" opacity="0.7" />
        <circle cx="14" cy="68" r="11" fill="#ffd700" opacity="0.9" />
        <polygon points="28,74 52,34 76,74" fill="#8b7355" />
        <polygon points="70,74 88,48 106,74" fill="#9b8365" />
        <rect x="57" y="52" width="4" height="22" fill="#6b5a35" />
        <polygon points="57,52 59,46 61,52" fill="#6b5a35" />
      </svg>
    )
    case 4: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <rect width="130" height="110" fill="#6b7280" />
        <rect y="76" width="130" height="34" fill="#7c5914" />
        <path d="M0,90 Q65,82 130,90" stroke="#5a4010" strokeWidth="8" fill="none" />
        <rect x="46" y="46" width="38" height="30" fill="#9ca3af" />
        <rect x="50" y="36" width="10" height="14" fill="#9ca3af" />
        <rect x="74" y="36" width="10" height="14" fill="#9ca3af" />
        <rect x="51" y="33" width="3" height="5" fill="#9ca3af" />
        <rect x="56" y="33" width="3" height="5" fill="#9ca3af" />
        <rect x="75" y="33" width="3" height="5" fill="#9ca3af" />
        <rect x="80" y="33" width="3" height="5" fill="#9ca3af" />
        <rect x="56" y="56" width="6" height="6" fill="#fde047" opacity="0.85" />
        <rect x="68" y="56" width="6" height="6" fill="#fde047" opacity="0.85" />
        <rect x="10" y="63" width="20" height="13" fill="#b45309" />
        <polygon points="10,63 20,54 30,63" fill="#7c2d12" />
        <rect x="18" y="65" width="5" height="5" fill="#fde047" opacity="0.7" />
      </svg>
    )
    case 5: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="sky5" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>
        <rect width="130" height="110" fill="url(#sky5)" />
        <rect y="66" width="130" height="44" fill="#0369a1" />
        <path d="M0,70 Q30,66 60,70 Q90,74 130,70" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
        <path d="M46,66 L82,66 L80,74 L48,74 Z" fill="#7c2d12" />
        <line x1="64" y1="40" x2="64" y2="66" stroke="#4a3728" strokeWidth="2" />
        <polygon points="65,42 65,63 88,54" fill="#f5f0e8" opacity="0.9" />
        <rect x="64" y="37" width="10" height="6" fill="#dc2626" />
        <rect x="106" y="55" width="10" height="20" fill="#e5e7eb" />
        <polygon points="106,55 111,48 116,55" fill="#ef4444" />
        <rect x="107" y="62" width="8" height="4" fill="#fde047" opacity="0.85" />
      </svg>
    )
    case 6: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <rect width="130" height="110" fill="#92400e" />
        <rect y="78" width="130" height="32" fill="#1c1917" />
        <line x1="0" y1="84" x2="130" y2="84" stroke="#4b5563" strokeWidth="3" />
        <line x1="0" y1="90" x2="130" y2="90" stroke="#4b5563" strokeWidth="3" />
        <line x1="10" y1="82" x2="10" y2="92" stroke="#4b5563" strokeWidth="2" />
        <line x1="25" y1="82" x2="25" y2="92" stroke="#4b5563" strokeWidth="2" />
        <line x1="40" y1="82" x2="40" y2="92" stroke="#4b5563" strokeWidth="2" />
        <rect x="18" y="56" width="32" height="22" fill="#374151" />
        <rect x="60" y="46" width="36" height="32" fill="#374151" />
        <rect x="26" y="40" width="7" height="17" fill="#4b5563" />
        <rect x="36" y="34" width="7" height="23" fill="#4b5563" />
        <rect x="68" y="30" width="7" height="17" fill="#4b5563" />
        <rect x="80" y="24" width="7" height="23" fill="#4b5563" />
        <ellipse cx="29" cy="37" rx="8" ry="5" fill="#6b7280" opacity="0.7" />
        <ellipse cx="39" cy="30" rx="9" ry="6" fill="#9ca3af" opacity="0.5" />
        <ellipse cx="71" cy="26" rx="8" ry="5" fill="#6b7280" opacity="0.7" />
        <ellipse cx="83" cy="19" rx="10" ry="6" fill="#9ca3af" opacity="0.5" />
        <rect x="0" y="80" width="24" height="10" fill="#1f2937" />
        <circle cx="7"  cy="90" r="4" fill="#111827" />
        <circle cx="18" cy="90" r="4" fill="#111827" />
        <rect x="3" y="75" width="12" height="7" fill="#374151" />
        <ellipse cx="3" cy="73" rx="5" ry="3" fill="#e5e7eb" opacity="0.5" />
      </svg>
    )
    case 7: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="sky7" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect width="130" height="110" fill="url(#sky7)" />
        <rect y="88" width="130" height="22" fill="#374151" />
        <line x1="0" y1="99" x2="130" y2="99" stroke="#fde047" strokeWidth="1" strokeDasharray="8 4" />
        <rect x="5"   y="50" width="14" height="38" fill="#1e293b" />
        <rect x="22"  y="34" width="17" height="54" fill="#1e3a5f" />
        <rect x="42"  y="43" width="12" height="45" fill="#1e293b" />
        <rect x="58"  y="24" width="22" height="64" fill="#0f2744" />
        <rect x="83"  y="38" width="14" height="50" fill="#1e293b" />
        <rect x="100" y="30" width="17" height="58" fill="#1e3a5f" />
        <rect x="115" y="54" width="14" height="34" fill="#1e293b" />
        <rect x="8"  y="53" width="3" height="3" fill="#fde047" opacity="0.9" />
        <rect x="14" y="58" width="3" height="3" fill="#fde047" opacity="0.7" />
        <rect x="25" y="37" width="3" height="3" fill="#60a5fa" opacity="0.9" />
        <rect x="33" y="45" width="3" height="3" fill="#fde047" opacity="0.8" />
        <rect x="25" y="53" width="3" height="3" fill="#fde047" opacity="0.7" />
        <rect x="61" y="27" width="3" height="3" fill="#60a5fa" opacity="0.9" />
        <rect x="70" y="37" width="3" height="3" fill="#fde047" opacity="0.8" />
        <rect x="61" y="45" width="3" height="3" fill="#fde047" opacity="0.9" />
        <rect x="70" y="55" width="3" height="3" fill="#60a5fa" opacity="0.7" />
        <rect x="103" y="33" width="3" height="3" fill="#fde047" opacity="0.9" />
        <rect x="110" y="42" width="3" height="3" fill="#fde047" opacity="0.8" />
      </svg>
    )
    case 8: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="sky8" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f0f1a" />
            <stop offset="100%" stopColor="#1a0533" />
          </linearGradient>
        </defs>
        <rect width="130" height="110" fill="url(#sky8)" />
        <rect y="84" width="130" height="26" fill="#0f172a" />
        <rect x="4"  y="54" width="20" height="30" fill="#1e293b" />
        <rect x="27" y="44" width="25" height="40" fill="#0f2040" />
        <rect x="55" y="49" width="20" height="35" fill="#1e293b" />
        <rect x="78" y="40" width="28" height="44" fill="#0f2040" />
        <line x1="0"   y1="60" x2="55"  y2="60" stroke="#00f0ff" strokeWidth="1.5" opacity="0.7" />
        <line x1="55"  y1="60" x2="130" y2="46" stroke="#bf00ff" strokeWidth="1.5" opacity="0.6" />
        <line x1="30"  y1="74" x2="110" y2="74" stroke="#00f0ff" strokeWidth="1"   opacity="0.5" />
        <rect x="7"  y="57" width="3" height="1.5" fill="#00ff00" opacity="0.9" />
        <rect x="7"  y="61" width="3" height="1.5" fill="#00ff00" opacity="0.7" />
        <rect x="7"  y="65" width="3" height="1.5" fill="#ffaa00" opacity="0.9" />
        <rect x="30" y="47" width="3" height="1.5" fill="#00ff00" opacity="0.9" />
        <rect x="30" y="51" width="3" height="1.5" fill="#00ff00" opacity="0.9" />
        <rect x="82" y="43" width="3" height="1.5" fill="#00ff00" opacity="0.9" />
        <rect x="82" y="47" width="3" height="1.5" fill="#00ff00" opacity="0.7" />
        <path d="M112,66 Q124,54 129,64" stroke="#9ca3af" strokeWidth="2" fill="none" />
        <line x1="120" y1="60" x2="118" y2="72" stroke="#9ca3af" strokeWidth="1.5" />
        <rect x="115" y="72" width="6" height="10" fill="#9ca3af" />
      </svg>
    )
    case 9: return (
      <svg viewBox="0 0 130 110" width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="earth9" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <clipPath id="earthClip9"><rect width="130" height="110" /></clipPath>
        </defs>
        <rect width="130" height="110" fill="#000010" />
        <circle cx="15"  cy="14" r="0.8" fill="#fff" />
        <circle cx="40"  cy="7"  r="0.5" fill="#fff" />
        <circle cx="70"  cy="20" r="0.8" fill="#fff" />
        <circle cx="90"  cy="5"  r="0.5" fill="#fff" />
        <circle cx="115" cy="12" r="0.8" fill="#fff" />
        <circle cx="25"  cy="34" r="0.5" fill="#fff" />
        <circle cx="55"  cy="28" r="0.5" fill="#fff" />
        <circle cx="65" cy="140" r="60" fill="url(#earth9)" clipPath="url(#earthClip9)" />
        <rect x="54" y="24" width="8" height="5" fill="#9ca3af" />
        <rect x="44" y="24" width="10" height="4" fill="#1d4ed8" opacity="0.85" />
        <rect x="63" y="24" width="10" height="4" fill="#1d4ed8" opacity="0.85" />
        <line x1="44" y1="26" x2="54" y2="26" stroke="#9ca3af" strokeWidth="1.5" />
        <line x1="62" y1="26" x2="72" y2="26" stroke="#9ca3af" strokeWidth="1.5" />
        <circle cx="30"  cy="98" r="3" fill="#60a5fa" />
        <circle cx="65"  cy="92" r="3" fill="#60a5fa" />
        <circle cx="100" cy="98" r="3" fill="#60a5fa" />
        <line x1="30" y1="98" x2="65"  y2="92" stroke="#60a5fa" strokeWidth="1"   opacity="0.8" />
        <line x1="65" y1="92" x2="100" y2="98" stroke="#60a5fa" strokeWidth="1"   opacity="0.8" />
        <line x1="30" y1="98" x2="100" y2="98" stroke="#60a5fa" strokeWidth="0.7" opacity="0.5" />
        <line x1="58" y1="29" x2="30"  y2="98" stroke="#a78bfa" strokeWidth="0.7" opacity="0.5" />
        <line x1="58" y1="29" x2="65"  y2="92" stroke="#a78bfa" strokeWidth="0.7" opacity="0.6" />
        <line x1="58" y1="29" x2="100" y2="98" stroke="#a78bfa" strokeWidth="0.7" opacity="0.5" />
      </svg>
    )
    default: return null
  }
}

export default function Globe({ stage }) {
  const [preview, setPreview] = useState(stage)

  // Keep preview in sync when computed stage changes (e.g. after finishing a lesson)
  // but don't override a mid-drag user gesture — the slider manages local state
  const displayStage = preview

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)' }}>
        Stage {displayStage} — {STAGE_LABELS[displayStage]}
      </div>

      <div style={{ width: '100%', maxWidth: 200, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        <StageScene stage={displayStage} />
      </div>

      <input
        type="range"
        min={1}
        max={9}
        value={preview}
        onChange={e => setPreview(Number(e.target.value))}
        style={{ width: '100%', maxWidth: 200, cursor: 'pointer' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 200, fontSize: 10, color: 'var(--color-text-faint)' }}>
        <span>Dark Ages</span>
        <span>Connected World</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manual verification checklist**

Start the frontend: `cd F:\interview-coach\frontend && npm run dev`, open `http://localhost:5173`.

Manually verify (after wiring up the page in Task 18):
- [ ] Each of the 9 stages renders a distinct SVG scene with no console errors
- [ ] Dragging the slider smoothly updates the scene
- [ ] Stage label updates as slider moves
- [ ] "Dark Ages" and "Connected World" appear as endpoint labels

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/Globe.jsx
git commit -m "feat: add Globe component with 9 illustrated SVG landscape stages"
```

---

## Task 17: Frontend — StatsCard.jsx

**Files:**
- Create: `frontend/src/components/dashboard/StatsCard.jsx`

- [ ] **Step 1: Create the component**

```jsx
import Globe from './Globe.jsx'

function StatBox({ value, label, color }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 8px',
      background: '#f8fafc',
      borderRadius: 8,
      border: '1px solid var(--color-border)',
      flex: 1,
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || 'var(--color-text)' }}>
        {value ?? '--'}
      </div>
      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 2 }}>
        {label}
      </div>
    </div>
  )
}

export default function StatsCard({ lessonsDone, problemsDone, sessionsDone, daysLeft, globeStage }) {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      background: '#fff',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      flex: 1,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Progress
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatBox value={lessonsDone} label="Lessons Done"   color="#3b82f6" />
        <StatBox value={problemsDone} label="Problems Done" color="#8b5cf6" />
        <StatBox value={sessionsDone} label="Sessions Done" color="#10b981" />
        <StatBox value={daysLeft}    label="Days Left"      color="#f59e0b" />
      </div>

      <Globe stage={globeStage ?? 1} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/dashboard/StatsCard.jsx
git commit -m "feat: add StatsCard component with 4 stat boxes and Globe"
```

---

## Task 18: Frontend — DashboardPage.jsx

**Files:**
- Create: `frontend/src/pages/DashboardPage.jsx`

- [ ] **Step 1: Create the page**

```jsx
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'
import PillarCard from '../components/dashboard/PillarCard'
import WeekStrip from '../components/dashboard/WeekStrip'
import DsaProgressList from '../components/dashboard/DsaProgressList'
import StatsCard from '../components/dashboard/StatsCard'
import { useDashboard } from '../hooks/useDashboard'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, loading, error } = useDashboard()

  const plan        = data?.plan
  const tasks       = data?.todayTasks
  const weekDays    = data?.weekDays ?? []
  const dsaProgress = data?.dsaProgress ?? []
  const stats       = data?.stats
  const globeStage  = data?.globeStage ?? 1
  const problemsDone = data?.problemsDone ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar
        title="Today's Plan"
        right={plan && (
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            color: 'var(--color-blue)',
          }}>
            Week {plan.currentWeek} of 8 · {plan.daysLeft} days left
          </div>
        )}
      />

      {error && (
        <div style={{
          margin: '12px 16px 0',
          padding: '10px 14px',
          background: '#fee2e2',
          color: '#b91c1c',
          borderRadius: 8,
          fontSize: 13,
          flexShrink: 0,
        }}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: 16, fontSize: 13, color: 'var(--color-text-faint)' }}>
          Loading…
        </div>
      )}

      {!loading && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Row 1: 3 Pillar Cards ─────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 12 }}>
            <PillarCard
              color="#3b82f6"
              icon="📖"
              label="Learning"
              badge={plan ? `Week ${plan.currentWeek}` : ''}
              title={tasks?.learning.topic ?? '--'}
              desc={tasks?.learning.desc}
              buttonLabel="Open Lesson →"
              onAction={() => {
                const id = tasks?.learning.lessonId
                navigate(id ? `/lessons/${id}` : '/lessons')
              }}
            />
            <PillarCard
              color="#8b5cf6"
              icon="⚡"
              label="LeetCode"
              badge={tasks?.leetcode.pattern}
              title={`Practice ${tasks?.leetcode.pattern ?? ''}`}
              desc={tasks?.leetcode.problems}
              buttonLabel="Practice →"
              onAction={() => navigate(`/roadmap/concept/${tasks?.leetcode.topicId}`)}
            />
            <PillarCard
              color="#10b981"
              icon="🔨"
              label="Project"
              badge={plan ? `Week ${plan.currentWeek} · Build` : ''}
              title={tasks?.project.task ?? '--'}
              desc={null}
              buttonLabel="View Schedule"
              onAction={() => navigate('/schedule')}
            />
          </div>

          {/* ── Row 2: Week Strip + DSA Progress | Stats + Globe ─────── */}
          <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>

            {/* Left card: week strip + DSA progress */}
            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              background: '#fff',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              flex: 1.6,
              minWidth: 0,
              overflow: 'hidden',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                This Week
              </div>
              {weekDays.length > 0 && <WeekStrip weekDays={weekDays} />}
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                DSA Progress
              </div>
              <DsaProgressList dsaProgress={dsaProgress} />
            </div>

            {/* Right card: stats + globe */}
            <StatsCard
              lessonsDone={stats?.lessonsDone}
              problemsDone={problemsDone}
              sessionsDone={stats?.sessionsDone}
              daysLeft={stats?.daysLeft}
              globeStage={globeStage}
            />
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DashboardPage.jsx
git commit -m "feat: add DashboardPage — composes all dashboard components"
```

---

## Task 19: Update App.jsx routing

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Import DashboardPage and replace the ComingSoon placeholder**

At the top of `App.jsx`, add the import alongside the other page imports:

```js
import DashboardPage from './pages/DashboardPage'
```

Replace this line:
```jsx
<Route path="/" element={<ComingSoon name="Today's Plan" />} />
```

With:
```jsx
<Route path="/" element={<DashboardPage />} />
```

- [ ] **Step 2: Start the dev server and verify end-to-end**

Make sure the backend is also running (`mvn spring-boot:run` in `F:\interview-coach\backend\`).

```
cd F:\interview-coach\frontend && npm run dev
```

Open `http://localhost:5173`. Check:
- [ ] Topbar shows "Today's Plan" with "Week N of 8 · N days left" badge
- [ ] 3 pillar cards render with today's learning topic, LeetCode pattern, project task
- [ ] "Open Lesson →" navigates to the lesson (or `/lessons` if lessonId is null)
- [ ] "Practice →" navigates to `/roadmap/concept/arrays-hashing` (or current pattern)
- [ ] "View Schedule" navigates to `/schedule`
- [ ] Week strip shows correct DONE/TODAY/FUTURE/REST statuses
- [ ] DSA progress bars render (all 0% if localStorage is empty — expected)
- [ ] Stats card shows lesson count, session count, days left
- [ ] Globe renders Stage 1 (Dark Ages) at zero progress; slider previews all 9 stages
- [ ] No console errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat: wire DashboardPage to / route — Phase 3 Today's Plan complete"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| V9 migration — `plans` table + seed | Task 1 |
| V10 migration — `lesson_id` FK + backfill | Task 2 |
| `Plan` entity + `PlanRepository` | Task 4 |
| `DashboardTodayDto` nested records | Task 5 |
| `DashboardService` interface | Task 6 |
| `DashboardServiceImpl` — week, day status, topicId slug | Task 8 |
| `DashboardController GET /api/v1/dashboard/today` | Task 10 |
| `DashboardServiceImplTest` (3 tests) | Task 7 |
| `DashboardControllerTest` | Task 9 |
| `useDashboard` hook — API + localStorage merge | Task 12 |
| Globe formula `globePercent`, `globeStage` | Task 12 |
| `PillarCard` + 3 instances with navigation | Tasks 13, 18 |
| `WeekStrip` — DONE/TODAY/FUTURE/REST | Task 14 |
| `DsaProgressList` — progress bars from localStorage | Task 15 |
| `Globe` — 9 SVG stages + drag slider | Task 16 |
| `StatsCard` — 4 stat boxes | Task 17 |
| `DashboardPage` — full layout | Task 18 |
| App.jsx routing update | Task 19 |
| Error banner on API failure | Task 18 (error state in DashboardPage) |
| `lessonId: null` → fallback to `/lessons` | Task 18 (PillarCard onAction) |
| DSA localStorage missing → all 0 (graceful) | Task 12 (try/catch in useDashboard) |

All spec requirements covered.

**Type consistency check:**
- `DashboardTodayDto.StatsDto(long lessonsDone, long sessionsDone, int daysLeft)` — used consistently in Task 8 (impl) and Task 9 (test mock)
- `globeStage` computed as `number` in `useDashboard`, passed as `stage` prop to `Globe` — consistent
- `TOPIC_SLUGS` map keys match the `dsa_pattern` values expected from V6 seed (e.g. "Arrays & Hashing" → "arrays-hashing")
- `LS_KEY = 'dsa_progress'` matches `DsaRoadmapPage.jsx` — verified in exploration

**Placeholder scan:** No TBD/TODO/incomplete sections found.
