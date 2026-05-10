# Phase 2: 8-Week Schedule API + View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 8-Week Schedule feature — a Flyway-seeded PostgreSQL table of 8 weeks × 7 days, a Spring Boot REST API (`GET /api/v1/schedule/weeks`, `GET /api/v1/schedule/weeks/{n}`), and a React schedule page (`/schedule` route) with a WeekSelector and DailyTable component.

**Architecture:** The backend follows the same layered pattern established in Phase 1 — Flyway migrations for schema + seed, entity → repository → service → controller, Java record DTOs, no Lombok (APT not wired). The frontend follows the same hook-based data pattern — `api/schedule.js` → `useSchedule.js` / `useWeekDetail.js` → `SchedulePage.jsx`. The schedule data is read-only (no PATCH endpoints in this phase), so no `@Transactional` is needed on service methods.

**Tech Stack:** Java 17 + Spring Boot 3.2.3 + PostgreSQL 15 (dev/prod) + H2 (test profile) + Flyway 9.x + JUnit 5 + Mockito + MockMvc + AssertJ · React 18 + Vite 5 + Axios singleton (already wired in Phase 1)

---

## Codebase Context (read before implementing)

**Project root:** `F:\interview-coach\`
**Backend root:** `F:\interview-coach\backend\`
**Frontend root:** `F:\interview-coach\frontend\`

**Critical constraints inherited from Phase 1:**
- **No Lombok APT:** `pom.xml` has `lombok` as `<optional>true</optional>` but `maven-compiler-plugin` has no `<annotationProcessorPaths>`. All entities and services must use **explicit constructors and getters/setters**. Do NOT use `@RequiredArgsConstructor`, `@Getter`, or `@Setter`.
- **Enum fields:** Always `@Enumerated(EnumType.STRING)`. Never `ORDINAL`.
- **Constructor injection:** Use `private final FieldType field;` + explicit constructor. Never `@Autowired`.
- **@Transactional:** Only on write methods. Phase 2 is read-only → no `@Transactional` anywhere in `ScheduleServiceImpl`.
- **DTOs as Java records:** Matching the existing `LessonSummaryDto`, `LessonDetailDto` pattern.
- **Test profile:** `H2` in-memory DB, `ddl-auto: create-drop`, `flyway.enabled: false`. Service unit tests use Mockito only (no DB). Controller tests use `@WebMvcTest` with `@MockBean`.
- **ErrorResponse record field:** `message` (not `error`) — `record ErrorResponse(String message)`.
- **GlobalExceptionHandler** already handles: `ResourceNotFoundException → 404`, `IllegalArgumentException → 400`, `MethodArgumentNotValidException → 400`.
- **DB env override:** Run backend with: `DB_URL=jdbc:postgresql://localhost:5432/interviewcoach DB_USER=dev DB_PASS=dev mvn spring-boot:run`

**Existing Flyway migrations:**
- `V1__create_sessions_messages.sql` — sessions + messages + question_type column
- `V2__create_lessons.sql` — lessons table (with `fiserv_note` column)
- `V3__seed_lessons.sql` — 6 seed lessons
- `V4__rename_fiserv_note_to_company_note.sql` — renames `fiserv_note` → `company_note` (**already applied**)

**Next migration numbers:** V5 (schema), V6 (seed)

**Existing relevant files you must NOT break:**
- `com.interviewcoach.config.GlobalExceptionHandler` — already handles your 404/400 cases
- `com.interviewcoach.exception.ResourceNotFoundException` — reuse this
- `com.interviewcoach.dto.ErrorResponse` — reuse this
- `frontend/src/api/axios.js` — singleton with base URL from `VITE_API_BASE_URL` and error normalization interceptor; import as `import api from './axios'`
- `frontend/src/App.jsx` — already has `/schedule` route rendering `<ComingSoon>`; you replace it with `<SchedulePage />`

**Run tests:** `cd F:\interview-coach\backend && DB_URL=jdbc:postgresql://localhost:5432/interviewcoach DB_USER=dev DB_PASS=dev mvn test`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `backend/src/main/resources/db/migration/V4__create_schedule.sql` | Create | DDL: schedule_weeks + schedule_days tables |
| `backend/src/main/resources/db/migration/V5__seed_schedule.sql` | Create | Seed: 8 week rows + 56 day rows |
| `backend/src/main/java/com/interviewcoach/entity/ScheduleWeek.java` | Create | JPA entity for schedule_weeks table |
| `backend/src/main/java/com/interviewcoach/entity/ScheduleDay.java` | Create | JPA entity for schedule_days table |
| `backend/src/main/java/com/interviewcoach/repository/ScheduleWeekRepository.java` | Create | Data access: findAllByOrderByWeekNumAsc, findByWeekNum |
| `backend/src/main/java/com/interviewcoach/repository/ScheduleDayRepository.java` | Create | Data access: findByWeekNumOrderByDayNumAsc |
| `backend/src/main/java/com/interviewcoach/dto/WeekSummaryDto.java` | Create | DTO record for week list response |
| `backend/src/main/java/com/interviewcoach/dto/DayDto.java` | Create | DTO record for a single schedule day |
| `backend/src/main/java/com/interviewcoach/dto/WeekDetailDto.java` | Create | DTO record for single-week detail response (includes days list) |
| `backend/src/main/java/com/interviewcoach/service/ScheduleService.java` | Create | Service interface |
| `backend/src/main/java/com/interviewcoach/service/ScheduleServiceImpl.java` | Create | Service implementation — read-only, no @Transactional |
| `backend/src/main/java/com/interviewcoach/controller/ScheduleController.java` | Create | REST controller: GET /api/v1/schedule/weeks, GET /api/v1/schedule/weeks/{weekNum} |
| `backend/src/test/java/com/interviewcoach/service/ScheduleServiceImplTest.java` | Create | Unit tests: Mockito, 3 cases |
| `backend/src/test/java/com/interviewcoach/controller/ScheduleControllerTest.java` | Create | Controller tests: @WebMvcTest, 3 cases |
| `frontend/src/api/schedule.js` | Create | Axios calls: fetchAllWeeks(), fetchWeekByNum(n) |
| `frontend/src/hooks/useSchedule.js` | Create | Two hooks: useSchedule (all weeks) + useWeekDetail(weekNum) |
| `frontend/src/components/schedule/WeekSelector.jsx` | Create | 8 clickable week tabs with theme labels |
| `frontend/src/components/schedule/DailyTable.jsx` | Create | Table: Day × (Learning · DSA · Project), milestone row highlight |
| `frontend/src/pages/SchedulePage.jsx` | Create | Page: Topbar + WeekSelector + DailyTable |
| `frontend/src/App.jsx` | Modify | Replace ComingSoon for /schedule with `<SchedulePage />` |

---

## Task 1: V5 Migration — Create Schedule Tables

**Files:**
- Create: `backend/src/main/resources/db/migration/V5__create_schedule.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- V5__create_schedule.sql
-- schedule_weeks: one row per week of the 8-week prep plan
-- schedule_days: one row per day (56 total = 8 weeks × 7 days)
-- IF NOT EXISTS matches the V1/V2 style used in this project.

CREATE TABLE IF NOT EXISTS schedule_weeks (
    id            BIGSERIAL    PRIMARY KEY,
    week_num      INT          NOT NULL UNIQUE,
    theme         VARCHAR(100) NOT NULL,
    focus_java    TEXT,
    focus_dsa     TEXT,
    focus_project TEXT
);

CREATE TABLE IF NOT EXISTS schedule_days (
    id                BIGSERIAL    PRIMARY KEY,
    week_num          INT          NOT NULL,
    day_num           INT          NOT NULL,
    day_label         VARCHAR(10)  NOT NULL,
    learning_topic    VARCHAR(200),
    learning_desc     TEXT,
    learning_resource TEXT,
    dsa_pattern       VARCHAR(100),
    dsa_problems      TEXT,
    project_task      TEXT,
    is_milestone      BOOLEAN      NOT NULL DEFAULT FALSE,
    UNIQUE (week_num, day_num)
);

CREATE INDEX idx_schedule_days_week_num ON schedule_days (week_num);
```

- [ ] **Step 2: Verify migration file exists**

```bash
ls F:\interview-coach\backend\src\main\resources\db\migration\
```
Expected: V1, V2, V3, V4 files plus the new V5__create_schedule.sql

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/resources/db/migration/V5__create_schedule.sql
git commit -m "chore(db): add V5 migration for schedule_weeks and schedule_days tables"
```

---

## Task 2: V6 Migration — Seed All 8 Weeks of Schedule Data

**Files:**
- Create: `backend/src/main/resources/db/migration/V6__seed_schedule.sql`

- [ ] **Step 1: Create the seed migration file with all 8 weeks + 56 days**

```sql
-- V6__seed_schedule.sql
-- 8 week summary rows, then 56 daily schedule rows (8 × 7).
-- Columns: week_num, theme, focus_java, focus_dsa, focus_project

INSERT INTO schedule_weeks (week_num, theme, focus_java, focus_dsa, focus_project) VALUES
(1, 'Java Core Deep Dive',
   'Collections, OOP, Streams & Lambdas, Exception Handling, Concurrency, Java 17 features',
   'Arrays & Hashing, Two Pointers, Sliding Window, Binary Search',
   'Lesson seed data, unit tests, MockMvc controller tests'),
(2, 'Spring Boot Architecture',
   'DI & bean lifecycle, auto-configuration, @Transactional propagation, Spring profiles, Actuator',
   'Linked Lists, Trees (intro)',
   'Schedule API (V4+V5 migrations, ScheduleController, SchedulePage frontend)'),
(3, 'Data Access & Testing',
   'JPA entities & relationships, lazy vs eager, JPQL & @Query, Flyway evolution, Mockito patterns, @WebMvcTest',
   'Trees: BFS & DFS, Heaps, Binary Search',
   'Add @SpringBootTest round-trip tests, @DataJpaTest, refine LessonRepository'),
(4, 'Security & API Design',
   'Spring Security FilterChain, JWT structure & validation, JwtAuthFilter, CORS, REST best practices, pagination',
   'Graphs: BFS/DFS/Union-Find',
   'Spring Security config, JwtUtil, /api/auth/login stub, X-Total-Count header on lessons'),
(5, 'React Fundamentals',
   'Spring Boot review + behavioral prep (15 Q&A each)',
   'Heaps, 1-D Dynamic Programming',
   'React Error Boundary, useParams lesson route, AppContext for auth, Axios auth interceptor'),
(6, 'React Advanced + Performance',
   'Spring Boot microservices concepts for interview, behavioral stories',
   '2-D Dynamic Programming, Greedy, Intervals',
   'React.memo on LessonCard, React.lazy + Suspense code splitting, Vitest + RTL test suite'),
(7, 'System Design + Behavioral',
   'System design: URL shortener, news feed, rate limiter, DB scaling, caching, microservices',
   'Tries, Backtracking, Advanced DP',
   'Architecture diagram, ARCHITECTURE.md, mock system design interview, STAR stories'),
(8, 'Mock Interviews & Review',
   'Full review: Java + Spring Boot + System Design — full loop simulation',
   'Mixed Blind 75 review: all patterns',
   'Swagger/OpenAPI, Lighthouse report, README.md, deploy to Railway/Render, tag v1.0');

-- schedule_days: 56 rows
-- Columns: week_num, day_num, day_label,
--          learning_topic, learning_desc, learning_resource,
--          dsa_pattern, dsa_problems,
--          project_task, is_milestone

INSERT INTO schedule_days (week_num, day_num, day_label, learning_topic, learning_desc, learning_resource, dsa_pattern, dsa_problems, project_task, is_milestone) VALUES

-- ── WEEK 1: Java Core Deep Dive ────────────────────────────────────────────
(1, 1, 'Mon',
 'Collections & Generics',
 'ArrayList vs LinkedList internals, HashMap bucket/load-factor, when generics prevent ClassCastException at compile time.',
 'https://www.baeldung.com/java-collections',
 'Arrays & Hashing',
 'Two Sum, Valid Anagram, Group Anagrams',
 'Add 10 lesson rows to V3 seed SQL covering REST_APIS and JPA_HIBERNATE categories.',
 false),

(1, 2, 'Tue',
 'OOP: Interfaces vs Abstract Classes',
 'When to choose interface over abstract, default methods since Java 8, Liskov substitution, why interviewers ask this every round.',
 'https://www.baeldung.com/java-interface-vs-abstract-class',
 'Two Pointers',
 'Valid Palindrome, Two Sum II, Container With Most Water',
 'Wire LessonDetailPanel: on card click fetch lesson by ID, render contentHtml via dangerouslySetInnerHTML.',
 false),

(1, 3, 'Wed',
 'Streams & Lambdas',
 'filter/map/collect pipelines, Optional.orElseThrow, method references, parallel stream pitfalls in fintech context.',
 'https://www.baeldung.com/java-8-streams',
 'Sliding Window',
 'Best Time To Buy Stock, Longest Substring Without Repeating, Longest Repeating Character Replacement',
 'Wire PATCH /lessons/{id}/status button in LessonDetailPanel; optimistic local state update in useLessons.',
 false),

(1, 4, 'Thu',
 'Exception Handling Patterns',
 'Checked vs unchecked, custom exceptions extending RuntimeException, @RestControllerAdvice pattern, never swallow Exception.',
 'https://www.baeldung.com/java-exceptions',
 'Binary Search',
 'Binary Search, Search Insert Position, Find Minimum in Rotated Array',
 'Write unit tests for LessonServiceImpl (8 test cases with Mockito, matching LessonServiceImplTest pattern).',
 false),

(1, 5, 'Fri',
 'Concurrency: Threads & Executors',
 'Runnable vs Callable, ExecutorService lifecycle, volatile vs synchronized, CompletableFuture chains, race condition traps.',
 'https://www.baeldung.com/java-util-concurrent',
 'Sliding Window',
 'Minimum Window Substring, Permutation in String',
 'Write @WebMvcTest controller tests for LessonController (7 test cases, MockMvc + MockBean).',
 false),

(1, 6, 'Sat',
 'Java 17 Features',
 'Records (immutable DTOs), text blocks, sealed classes, pattern-matching instanceof — new syntax interviewers now expect.',
 'https://openjdk.org/projects/jdk/17/',
 'Arrays & Hashing',
 'Encode and Decode Strings, Longest Consecutive Sequence',
 'Add GlobalExceptionHandler test: verify 404 body shape for unknown lesson ID (jsonPath $.message).',
 false),

(1, 7, 'Sun',
 'Week 1 Review: Java Core',
 'Java Core self-quiz: 20 common interview questions — answer out loud without notes, note gaps.',
 'https://www.interviewbit.com/java-interview-questions/',
 'Review & Revise',
 'Re-implement Two Sum, Group Anagrams, Valid Palindrome from scratch (no looking up)',
 'Run mvn clean test — all green. git tag v0.1.',
 true),

-- ── WEEK 2: Spring Boot Architecture ──────────────────────────────────────
(2, 1, 'Mon',
 'Spring DI & Bean Lifecycle',
 '@Component vs @Service vs @Repository semantic difference, bean scopes (singleton default), constructor vs field injection WHY.',
 'https://www.baeldung.com/spring-dependency-injection',
 'Linked Lists',
 'Reverse Linked List, Merge Two Sorted Lists',
 'Add ScheduleWeek + ScheduleDay entities and V4/V5 migrations to the project.',
 false),

(2, 2, 'Tue',
 'Auto-configuration & Starter POMs',
 'How @SpringBootApplication triggers auto-config, spring.factories, @Conditional — demystify the magic.',
 'https://www.baeldung.com/spring-boot-autoconfiguration',
 'Linked Lists',
 'Reorder List, Remove Nth Node From End of List',
 'Add ScheduleWeekRepository + ScheduleDayRepository + ScheduleService interface.',
 false),

(2, 3, 'Wed',
 '@Transactional Deep Dive',
 'Propagation levels (REQUIRED vs REQUIRES_NEW), read-only optimization, why you put it only on the service layer, not the repository.',
 'https://www.baeldung.com/transaction-configuration-with-jpa-and-spring',
 'Trees',
 'Invert Binary Tree, Maximum Depth of Binary Tree',
 'Implement ScheduleServiceImpl + ScheduleController GET /api/v1/schedule/weeks and /weeks/{weekNum}.',
 false),

(2, 4, 'Thu',
 'Spring Profiles & Configuration',
 'application-{profile}.yml, @Profile, environment-specific beans — used in every real project, never hardcode secrets.',
 'https://www.baeldung.com/spring-profiles',
 'Trees',
 'Same Tree, Subtree of Another Tree',
 'Write ScheduleServiceImplTest (3 Mockito test cases). Run mvn test → RED, then implement → GREEN.',
 false),

(2, 5, 'Fri',
 'Spring Boot Actuator',
 '/actuator/health, /actuator/metrics, custom HealthIndicator — common in production fintech interviews.',
 'https://www.baeldung.com/spring-boot-actuators',
 'Trees',
 'Count Good Nodes in Binary Tree, Validate BST',
 'Write ScheduleControllerTest with @WebMvcTest (3 test cases). Build SchedulePage frontend skeleton.',
 false),

(2, 6, 'Sat',
 'Spring Boot Testing Strategy',
 '@SpringBootTest vs @WebMvcTest vs @DataJpaTest — which slice loads what context and why speed matters.',
 'https://www.baeldung.com/spring-boot-testing',
 'Trees',
 'Kth Smallest in BST, Lowest Common Ancestor of BST',
 'Wire WeekSelector + DailyTable into SchedulePage. Connect to useSchedule/useWeekDetail hooks.',
 false),

(2, 7, 'Sun',
 'Week 2 Review: Spring Boot',
 'Spring Boot Q&A: 15 questions on DI, @Transactional, profiles, Actuator — answer without notes.',
 'https://www.interviewbit.com/spring-boot-interview-questions/',
 'Review & Revise',
 'Re-implement Reverse Linked List and Validate BST from scratch',
 'mvn clean test → green. Smoke test GET /api/v1/schedule/weeks in browser. git tag v0.2.',
 true),

-- ── WEEK 3: Data Access & Testing ─────────────────────────────────────────
(3, 1, 'Mon',
 'JPA Entities & Relationships',
 '@OneToMany vs @ManyToOne, @JoinColumn, CascadeType options, @MapsId — why enterprise Java codebases are full of JPA.',
 'https://www.baeldung.com/hibernate-one-to-many',
 'Trees: Level-Order BFS',
 'Binary Tree Level Order Traversal, Binary Tree Right Side View',
 'Add @SpringBootTest round-trip test for LessonRepository: save + find + assert.',
 false),

(3, 2, 'Tue',
 'JPA: Lazy vs Eager & N+1 Problem',
 'LazyInitializationException root cause, FetchType.LAZY default, JOIN FETCH in JPQL, EntityGraph — the #1 JPA interview gotcha.',
 'https://www.baeldung.com/hibernate-lazy-eager-loading',
 'Trees: BFS',
 'Binary Tree Zigzag Level Order Traversal',
 'Add @DataJpaTest for LessonRepository: test findByCategoryOrderBySortOrderAsc returns sorted results.',
 false),

(3, 3, 'Wed',
 'JPQL & @Query',
 'JPQL vs native SQL, @Query(nativeQuery=true), @Param binding, Spring Data projections — interview-ready examples.',
 'https://www.baeldung.com/spring-data-jpa-query',
 'Heaps / Priority Queue',
 'Kth Largest Element in an Array, Last Stone Weight',
 'Add @Query to LessonRepository: count lessons per category. Expose as GET /api/v1/lessons/stats.',
 false),

(3, 4, 'Thu',
 'Flyway Schema Evolution',
 'Versioned vs repeatable migrations, repair, baseline, checksum validation — used in every production database.',
 'https://documentation.red-gate.com/flyway',
 'Heaps',
 'K Closest Points to Origin, Task Scheduler',
 'Add V6 migration: add tags VARCHAR(200) column to lessons. Update Lesson entity and LessonSummaryDto.',
 false),

(3, 5, 'Fri',
 'Mockito Patterns',
 '@Mock vs @Spy, thenReturn vs thenThrow, ArgumentCaptor, verify() call counts — the full Mockito toolkit.',
 'https://www.baeldung.com/mockito-annotations',
 'Heaps',
 'Find Median from Data Stream, Top K Frequent Elements',
 'Write SessionService unit tests using Mockito (match LessonServiceImplTest structure and naming convention).',
 false),

(3, 6, 'Sat',
 '@WebMvcTest Deep Dive',
 '@MockBean vs @Mock, MockMvc fluent API, jsonPath assertions, how @RestControllerAdvice is included in slice.',
 'https://www.baeldung.com/spring-boot-testing',
 'Binary Search',
 'Search a 2D Matrix, Eating Bananas, Search in Rotated Array II',
 'Write controller tests for existing SessionController (GET /api/v1/sessions, POST /api/v1/chat).',
 false),

(3, 7, 'Sun',
 'Week 3 Review: JPA & Testing',
 'JPA & Testing Q&A: lazy loading, N+1, Flyway, Mockito traps, @WebMvcTest vs @SpringBootTest.',
 'https://www.baeldung.com/hibernate-common-performance-problems-in-spring-applications',
 'Review & Revise',
 'Re-implement K Closest Points and Search Rotated Array from scratch',
 'mvn clean test → all green. git tag v0.3.',
 true),

-- ── WEEK 4: Security & API Design ─────────────────────────────────────────
(4, 1, 'Mon',
 'Spring Security Architecture',
 'SecurityFilterChain, FilterChainProxy, OncePerRequestFilter, AuthenticationManager flow — the mental model for interviews.',
 'https://www.baeldung.com/spring-security-architecture',
 'Graphs: Islands',
 'Number of Islands, Max Area of Island',
 'Add spring-boot-starter-security to pom.xml. Configure SecurityConfig permitting /api/v1/** for now.',
 false),

(4, 2, 'Tue',
 'JWT: Structure & Validation',
 'Header.payload.signature, HMAC-SHA256, jjwt library, why JWTs are stateless and why that matters in microservices.',
 'https://www.baeldung.com/java-json-web-tokens-jjwt',
 'Graphs',
 'Clone Graph, Pacific Atlantic Water Flow',
 'Add io.jsonwebtoken:jjwt-api to pom.xml. Implement JwtUtil: generateToken, validateToken, getUsernameFromToken.',
 false),

(4, 3, 'Wed',
 'JWT Filter in Spring Security',
 'Extend OncePerRequestFilter, extract Bearer token from Authorization header, set SecurityContextHolder.',
 'https://www.baeldung.com/spring-security-oauth-jwt',
 'Graphs',
 'Surrounded Regions, Rotting Oranges',
 'Add JwtAuthFilter. Add POST /api/auth/login endpoint returning hardcoded test token.',
 false),

(4, 4, 'Thu',
 'CORS & REST API Versioning',
 'CORS preflight, @CrossOrigin vs CorsConfigurationSource, URI versioning (/v1/) — already in project, understand WHY.',
 'https://www.baeldung.com/spring-cors',
 'Graphs: Topological Sort',
 'Course Schedule, Course Schedule II',
 'Update CorsConfig to explicitly allow http://localhost:5173. Add placeholder /api/v2/lessons redirect.',
 false),

(4, 5, 'Fri',
 'REST API Design Best Practices',
 'Idempotency (GET/PUT/DELETE), pagination headers (X-Total-Count), error bodies RFC 7807, HATEOAS basics.',
 'https://www.baeldung.com/rest-with-spring-series',
 'Graphs: Union-Find',
 'Number of Connected Components, Redundant Connection',
 'Add X-Total-Count response header to GET /api/v1/lessons. Add ?page=&size= pagination support.',
 false),

(4, 6, 'Sat',
 'OAuth2 Basics',
 'Authorization Code + PKCE flow, access vs refresh tokens, when to use OAuth2 vs simple JWT — fintech interview staple.',
 'https://www.baeldung.com/spring-security-oauth',
 'Graphs',
 'Graph Valid Tree, Foreign Dictionary (Alien Dictionary)',
 'Add Google OAuth2 login button to frontend (UI only, not wired to server — shows you know the flow).',
 false),

(4, 7, 'Sun',
 'Week 4 Review: Security',
 'Security Q&A: JWT, FilterChain, CORS, OAuth2 — answer without notes. Record yourself for 15 minutes.',
 'https://www.baeldung.com/security-spring',
 'Review & Revise',
 'Re-implement Number of Islands and Course Schedule from scratch',
 'mvn clean test → green. Manually test /api/auth/login returns JWT. git tag v0.4.',
 true),

-- ── WEEK 5: React Fundamentals ────────────────────────────────────────────
(5, 1, 'Mon',
 'useState & useEffect Deep Dive',
 'Closure traps with stale state, cleanup functions, why the deps array matters, render cycle — interviewers probe these.',
 'https://react.dev/reference/react/useState',
 '1-D Dynamic Programming',
 'Climbing Stairs, House Robber, Min Cost Climbing Stairs',
 'Refactor useLessons: replace cancelled flag with AbortController for proper fetch cancellation.',
 false),

(5, 2, 'Tue',
 'useCallback & useMemo — When NOT to Use',
 'Referential equality, when memo actually helps vs adds noise, premature optimization pitfalls.',
 'https://react.dev/reference/react/useCallback',
 '1-D DP',
 'Palindromic Substrings, Decode Ways, Coin Change',
 'Add React Error Boundary component. Wrap LessonsPage and SchedulePage in <ErrorBoundary>.',
 false),

(5, 3, 'Wed',
 'React Router v6: useParams, useNavigate, Outlet',
 'Nested routes, layout routes, dynamic segments, redirect patterns — v6 changed everything from v5.',
 'https://reactrouter.com/en/main/start/tutorial',
 '1-D DP',
 'Maximum Product Subarray, Word Break',
 'Add /lessons/:id route. Clicking a card navigates; LessonDetailPanel reads lesson ID from useParams.',
 false),

(5, 4, 'Thu',
 'React Context API',
 'createContext, useContext, Provider pattern — when Context beats prop drilling and when to reach for Zustand instead.',
 'https://react.dev/learn/passing-data-deeply-with-context',
 '1-D DP',
 'Longest Increasing Subsequence, Partition Equal Subset Sum',
 'Add AppContext: provides currentUser + setCurrentUser (mock user for now). Wrap App in AppProvider.',
 false),

(5, 5, 'Fri',
 'Compound Components & Render Props',
 'Flexible component APIs used in real component libraries — composition over inheritance pattern.',
 'https://www.patterns.dev/react/compound-pattern',
 '2-D DP',
 'Unique Paths, Longest Common Subsequence',
 'Refactor WeekSelector to accept an optional renderTab render prop for custom tab rendering.',
 false),

(5, 6, 'Sat',
 'Axios Interceptors & Error Normalization',
 'Request interceptors (attach Bearer token), response interceptors (normalize errors) — already partial in axios.js.',
 'https://axios-http.com/docs/interceptors',
 '2-D DP',
 'Best Time to Buy and Sell Stock with Cooldown',
 'Update axios.js request interceptor: read JWT from localStorage, attach as Authorization: Bearer <token>.',
 false),

(5, 7, 'Sun',
 'Week 5 Review: React Fundamentals',
 'React Hooks Q&A: 15 questions on useState, useEffect, Context, refs — answer without notes.',
 'https://react.dev/learn',
 'Review & Revise',
 'Re-implement Coin Change and Unique Paths from scratch',
 'npm test → green. git tag v0.5.',
 true),

-- ── WEEK 6: React Advanced + Performance ──────────────────────────────────
(6, 1, 'Mon',
 'React.memo & Memoization',
 'Referential equality, when React.memo prevents re-renders, common pitfall: objects/arrays as props break memo.',
 'https://react.dev/reference/react/memo',
 'Greedy',
 'Maximum Subarray, Jump Game, Jump Game II',
 'Wrap LessonCard in React.memo. Open React DevTools Profiler and compare render counts before/after.',
 false),

(6, 2, 'Tue',
 'React.lazy + Suspense Code Splitting',
 'Dynamic import(), Suspense fallback, route-level splitting to reduce initial bundle size.',
 'https://react.dev/reference/react/lazy',
 'Greedy',
 'Gas Station, Hand of Straights',
 'Lazy-load LessonsPage and SchedulePage. Add <Suspense fallback={<div>Loading...</div>}> in App.jsx.',
 false),

(6, 3, 'Wed',
 'Custom Hook Composition Patterns',
 'Extract data-fetching logic, combine multiple hooks cleanly, test hooks in isolation.',
 'https://react.dev/learn/reusing-logic-with-custom-hooks',
 'Intervals',
 'Insert Interval, Merge Intervals, Meeting Rooms',
 'Extract useWeekSelector hook from SchedulePage: manages selectedWeekNum state + prev/next helpers.',
 false),

(6, 4, 'Thu',
 'CSS: Design Tokens, Grid, Accessibility',
 'CSS custom properties as tokens (already in global.css), CSS Grid for table layouts, focus-visible, aria-label.',
 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout',
 'Intervals',
 'Minimum Interval to Include Each Query',
 'Improve DailyTable: switch from HTML table to CSS Grid. Add aria-label to each cell for accessibility.',
 false),

(6, 5, 'Fri',
 'Vite Config & Env Variables',
 'vite.config.js plugins, import.meta.env, .env.production vs .env.development, proxy for local backend.',
 'https://vitejs.dev/guide/env-and-mode',
 'Stack',
 'Valid Parentheses, Min Stack, Evaluate Reverse Polish Notation',
 'Add .env.production with VITE_API_BASE_URL pointing to deployed backend. Add dev proxy in vite.config.js.',
 false),

(6, 6, 'Sat',
 'Frontend Testing: Vitest + RTL',
 'vitest setup, @testing-library/react, userEvent, getByRole queries, async waitFor patterns.',
 'https://testing-library.com/docs/react-testing-library/intro',
 'Stack',
 'Generate Parentheses, Daily Temperatures',
 'Add vitest + @testing-library/react + jsdom. Write tests: WeekSelector renders 8 tabs, click activates correct week.',
 false),

(6, 7, 'Sun',
 'Week 6 Review: React Advanced',
 'React Performance Q&A: memo, lazy, Suspense, profiling — when does optimization actually help?',
 'https://react.dev/learn/render-and-commit',
 'Review & Revise',
 'Re-implement Jump Game and Merge Intervals from scratch',
 'npm run build → 0 errors. npm test → green. git tag v0.6.',
 true),

-- ── WEEK 7: System Design + Behavioral ────────────────────────────────────
(7, 1, 'Mon',
 'System Design: URL Shortener',
 'Unique ID generation (base62), 301 vs 302 redirect, caching layer, DB schema, rate limiting per user.',
 'https://www.educative.io/courses/grokking-the-system-design-interview',
 'Tries',
 'Implement Trie, Design Add and Search Words Data Structure',
 'Write 3 STAR behavioral stories: conflict resolution, tight deadline, and a technical tradeoff you made.',
 false),

(7, 2, 'Tue',
 'System Design: News Feed (Twitter/Instagram)',
 'Fanout-on-write vs fanout-on-read, pagination cursors, CDN for media, DB sharding by user_id.',
 'https://www.youtube.com/watch?v=hnpzNAPiC0E',
 'Tries',
 'Search Suggestions System',
 'Write 3 more STAR stories: mentoring a colleague, cross-team collaboration, production incident you resolved.',
 false),

(7, 3, 'Wed',
 'System Design: Rate Limiter',
 'Token bucket vs leaky bucket algorithms, Redis sorted sets for sliding window, distributed rate limiting.',
 'https://www.youtube.com/watch?v=FU4WlwfS3G0',
 'Backtracking',
 'Subsets, Combination Sum',
 'Conduct a 45-min mock system design interview (record yourself or use Pramp.com). Review recording.',
 false),

(7, 4, 'Thu',
 'System Design: Database Scaling',
 'Vertical vs horizontal scaling, read replicas, sharding strategies (range vs hash), consistent hashing.',
 'https://www.youtube.com/watch?v=vg86F0jUGdA',
 'Backtracking',
 'Permutations, Subsets II',
 'Record a 30-min mock behavioral interview out loud. Score yourself on STAR completeness.',
 false),

(7, 5, 'Fri',
 'System Design: Caching Strategies',
 'Redis data structures (String/Hash/ZSet), write-through vs write-behind, LRU/LFU eviction, cache stampede.',
 'https://www.youtube.com/watch?v=U3RkDLtS7uY',
 'Backtracking',
 'Word Search',
 'Add draw.io architecture diagram to project docs: frontend → Spring Boot → PostgreSQL with labels.',
 false),

(7, 6, 'Sat',
 'System Design: Microservices vs Monolith',
 'Service boundaries, API gateway, distributed transactions (saga pattern), when NOT to split — trade-offs.',
 'https://www.youtube.com/watch?v=rv4LlmLmVWk',
 'Graph Algorithms',
 'Alien Dictionary',
 'Write ARCHITECTURE.md: document layered architecture, design decisions, and what you would change at scale.',
 false),

(7, 7, 'Sun',
 'Week 7 Review: System Design',
 'System Design mock: design the Lessons app at 10M users. Practice solo for 45 min with no notes.',
 'https://github.com/donnemartin/system-design-primer',
 'Review & Revise',
 'Re-implement Combination Sum and Word Search from scratch',
 'Commit all docs and diagrams. git tag v0.7.',
 true),

-- ── WEEK 8: Mock Interviews & Review ──────────────────────────────────────
(8, 1, 'Mon',
 'Java Full Mock Interview (45 min)',
 'Java Core + Concurrency + OOP: answer without notes, time yourself, write down every gap for review.',
 'https://www.interviewbit.com/java-interview-questions/',
 'Mixed Review',
 'Two Sum, Valid Anagram, LRU Cache',
 'Fix any remaining test failures. Ensure mvn clean test → 100% green across all test classes.',
 false),

(8, 2, 'Tue',
 'Spring Boot Full Mock Interview (45 min)',
 'DI, @Transactional, security, JPA: whiteboard an API design from scratch. Record 15-min answer on @Transactional.',
 'https://www.interviewbit.com/spring-boot-interview-questions/',
 'Mixed Review',
 'Number of Islands, Course Schedule',
 'Add Swagger/OpenAPI 3 docs: springdoc-openapi-starter-webmvc-ui. Access at /swagger-ui.html.',
 false),

(8, 3, 'Wed',
 'React Full Mock Interview (45 min)',
 'Build a filterable list component from a mock API: useState, useEffect, fetch, error handling — timed.',
 'https://react.dev/learn',
 'Mixed Review',
 'Longest Palindromic Substring, Maximum Product Subarray',
 'Add Lighthouse performance report (npm run build → serve → Lighthouse). Document scores in README.',
 false),

(8, 4, 'Thu',
 'System Design Mock (60 min)',
 'Design the Interview Coach app at scale: 10M users, DB, caching, auth, CDN, rate limiting — solo.',
 'https://github.com/donnemartin/system-design-primer',
 'Mixed Review',
 'Find Minimum in Rotated Sorted Array, Search in Rotated Sorted Array',
 'Write project README.md: what it does, tech stack table, how to run locally, link to architecture diagram.',
 false),

(8, 5, 'Fri',
 'Behavioral Full Mock (30 min)',
 'Tell me about yourself, greatest challenge, conflict with a colleague, why this company — answer out loud, timed.',
 'https://www.themuse.com/advice/star-interview-method',
 'Mixed Review',
 'Sliding Window Maximum, Minimum Window Substring',
 'Deploy backend to Railway.app (free tier). Deploy frontend to Vercel. Verify prod URLs work end-to-end.',
 false),

(8, 6, 'Sat',
 'Full Loop Simulation (4 hours)',
 'Simulate a full interview day: 2 coding rounds (45 min each) + 1 system design (60 min) + 1 behavioral (30 min).',
 'https://www.pramp.com/',
 'Mixed Review',
 'Serialize and Deserialize BST',
 'Final code review: no TODOs, no console.log in production code, no hardcoded secrets, all tests pass.',
 false),

(8, 7, 'Sun',
 'Rest & Light Review',
 'Review all cheat sheets: Java, Spring Boot, React, System Design one-pagers. Rest. You are ready.',
 'https://github.com/interviews/interview-cheat-sheet',
 'Light Review',
 'Review 3 problems you found hardest this week — read editorial, do not re-implement',
 'git tag v1.0. Update resume with project URL. Send applications.',
 true);
```

- [ ] **Step 2: Verify row count**

```bash
# Count commas in the INSERT to sanity-check you have 56 day rows
# (each row ends with a closing parenthesis + comma or semicolon)
grep -c "^(." V6__seed_schedule.sql
```
Expected: the file exists with both INSERT statements

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/resources/db/migration/V6__seed_schedule.sql
git commit -m "chore(db): add V6 migration seeding 8 weeks and 56 daily schedule rows"
```

---

## Task 3: ScheduleWeek + ScheduleDay Entity Classes

**Files:**
- Create: `backend/src/main/java/com/interviewcoach/entity/ScheduleWeek.java`
- Create: `backend/src/main/java/com/interviewcoach/entity/ScheduleDay.java`

- [ ] **Step 1: Create ScheduleWeek entity**

```java
// backend/src/main/java/com/interviewcoach/entity/ScheduleWeek.java
package com.interviewcoach.entity;

import jakarta.persistence.*;

// WHY explicit getters/setters instead of @Data/@Getter:
// Lombok APT is not wired in this project (no annotationProcessorPaths in pom.xml).
// Annotations compile but byte-code generation never runs — methods would be missing at runtime.
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
```

- [ ] **Step 2: Create ScheduleDay entity**

```java
// backend/src/main/java/com/interviewcoach/entity/ScheduleDay.java
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

    // WHY column name explicit: Java naming convention 'isMilestone' != snake_case 'is_milestone'.
    // Hibernate will not auto-derive 'is_milestone' from 'isMilestone' reliably across versions.
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
```

- [ ] **Step 3: Verify the project still compiles**

```bash
cd F:\interview-coach\backend
mvn compile -q
```
Expected: BUILD SUCCESS with no errors

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/interviewcoach/entity/ScheduleWeek.java
git add backend/src/main/java/com/interviewcoach/entity/ScheduleDay.java
git commit -m "feat(schedule): add ScheduleWeek and ScheduleDay JPA entities"
```

---

## Task 4: Repository Interfaces

**Files:**
- Create: `backend/src/main/java/com/interviewcoach/repository/ScheduleWeekRepository.java`
- Create: `backend/src/main/java/com/interviewcoach/repository/ScheduleDayRepository.java`

- [ ] **Step 1: Create ScheduleWeekRepository**

```java
// backend/src/main/java/com/interviewcoach/repository/ScheduleWeekRepository.java
package com.interviewcoach.repository;

import com.interviewcoach.entity.ScheduleWeek;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// WHY derived method names: Spring Data parses the method name at startup and generates
// the JPQL automatically — no @Query needed for these simple queries.
public interface ScheduleWeekRepository extends JpaRepository<ScheduleWeek, Long> {

    // SELECT w FROM ScheduleWeek w ORDER BY w.weekNum ASC
    List<ScheduleWeek> findAllByOrderByWeekNumAsc();

    // SELECT w FROM ScheduleWeek w WHERE w.weekNum = :weekNum
    Optional<ScheduleWeek> findByWeekNum(int weekNum);
}
```

- [ ] **Step 2: Create ScheduleDayRepository**

```java
// backend/src/main/java/com/interviewcoach/repository/ScheduleDayRepository.java
package com.interviewcoach.repository;

import com.interviewcoach.entity.ScheduleDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleDayRepository extends JpaRepository<ScheduleDay, Long> {

    // SELECT d FROM ScheduleDay d WHERE d.weekNum = :weekNum ORDER BY d.dayNum ASC
    List<ScheduleDay> findByWeekNumOrderByDayNumAsc(int weekNum);
}
```

- [ ] **Step 3: Compile to verify Spring Data proxy generation works**

```bash
mvn compile -q
```
Expected: BUILD SUCCESS

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/interviewcoach/repository/ScheduleWeekRepository.java
git add backend/src/main/java/com/interviewcoach/repository/ScheduleDayRepository.java
git commit -m "feat(schedule): add ScheduleWeekRepository and ScheduleDayRepository"
```

---

## Task 5: DTO Records

**Files:**
- Create: `backend/src/main/java/com/interviewcoach/dto/WeekSummaryDto.java`
- Create: `backend/src/main/java/com/interviewcoach/dto/DayDto.java`
- Create: `backend/src/main/java/com/interviewcoach/dto/WeekDetailDto.java`

- [ ] **Step 1: Create WeekSummaryDto**

```java
// backend/src/main/java/com/interviewcoach/dto/WeekSummaryDto.java
package com.interviewcoach.dto;

// WHY record: zero boilerplate for immutable data carriers.
// Jackson 2.14+ (included in Spring Boot 3.x) fully supports records:
// serializes by component name, uses all-args constructor for deserialization.
public record WeekSummaryDto(
        int weekNum,
        String theme,
        String focusJava,
        String focusDsa,
        String focusProject
) {}
```

- [ ] **Step 2: Create DayDto**

```java
// backend/src/main/java/com/interviewcoach/dto/DayDto.java
package com.interviewcoach.dto;

// WHY boolean isMilestone (not Boolean): primitives cannot be null;
// a schedule day either is or is not a milestone — no null state needed.
// Jackson serializes this record component as "isMilestone" in JSON (component name, not getter prefix).
public record DayDto(
        Long id,
        int weekNum,
        int dayNum,
        String dayLabel,
        String learningTopic,
        String learningDesc,
        String learningResource,
        String dsaPattern,
        String dsaProblems,
        String projectTask,
        boolean isMilestone
) {}
```

- [ ] **Step 3: Create WeekDetailDto**

```java
// backend/src/main/java/com/interviewcoach/dto/WeekDetailDto.java
package com.interviewcoach.dto;

import java.util.List;

// Returned by GET /api/v1/schedule/weeks/{weekNum}.
// Includes all week metadata PLUS the 7 daily schedule rows.
// WHY embed days in the response: the UI always needs both together — one API call, no waterfall.
public record WeekDetailDto(
        int weekNum,
        String theme,
        String focusJava,
        String focusDsa,
        String focusProject,
        List<DayDto> days
) {}
```

- [ ] **Step 4: Compile to verify**

```bash
mvn compile -q
```
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/interviewcoach/dto/WeekSummaryDto.java
git add backend/src/main/java/com/interviewcoach/dto/DayDto.java
git add backend/src/main/java/com/interviewcoach/dto/WeekDetailDto.java
git commit -m "feat(schedule): add WeekSummaryDto, DayDto, WeekDetailDto records"
```

---

## Task 6: ScheduleService Interface + Failing Unit Tests (TDD — RED phase)

**Files:**
- Create: `backend/src/main/java/com/interviewcoach/service/ScheduleService.java`
- Create: `backend/src/test/java/com/interviewcoach/service/ScheduleServiceImplTest.java`

- [ ] **Step 1: Create ScheduleService interface**

```java
// backend/src/main/java/com/interviewcoach/service/ScheduleService.java
package com.interviewcoach.service;

import com.interviewcoach.dto.WeekDetailDto;
import com.interviewcoach.dto.WeekSummaryDto;

import java.util.List;

public interface ScheduleService {

    // Returns all 8 week summaries ordered by weekNum ascending.
    List<WeekSummaryDto> getAllWeeks();

    // Returns full week detail with all 7 days.
    // Throws ResourceNotFoundException if weekNum is not 1-8.
    WeekDetailDto getWeekByNum(int weekNum);
}
```

- [ ] **Step 2: Write the failing unit tests**

```java
// backend/src/test/java/com/interviewcoach/service/ScheduleServiceImplTest.java
package com.interviewcoach.service;

import com.interviewcoach.dto.WeekDetailDto;
import com.interviewcoach.dto.WeekSummaryDto;
import com.interviewcoach.entity.ScheduleDay;
import com.interviewcoach.entity.ScheduleWeek;
import com.interviewcoach.exception.ResourceNotFoundException;
import com.interviewcoach.repository.ScheduleDayRepository;
import com.interviewcoach.repository.ScheduleWeekRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceImplTest {

    @Mock
    private ScheduleWeekRepository weekRepository;

    @Mock
    private ScheduleDayRepository dayRepository;

    // @InjectMocks creates ScheduleServiceImpl and injects the two mocks.
    @InjectMocks
    private ScheduleServiceImpl scheduleService;

    // ── helpers ──────────────────────────────────────────────────────────────

    private ScheduleWeek makeWeek(int weekNum, String theme) {
        ScheduleWeek w = new ScheduleWeek();
        w.setId((long) weekNum);
        w.setWeekNum(weekNum);
        w.setTheme(theme);
        w.setFocusJava("Java focus " + weekNum);
        w.setFocusDsa("DSA focus " + weekNum);
        w.setFocusProject("Project focus " + weekNum);
        return w;
    }

    private ScheduleDay makeDay(int weekNum, int dayNum, String label) {
        ScheduleDay d = new ScheduleDay();
        d.setId((long) (weekNum * 10 + dayNum));
        d.setWeekNum(weekNum);
        d.setDayNum(dayNum);
        d.setDayLabel(label);
        d.setLearningTopic("Learning " + dayNum);
        d.setLearningDesc("Desc " + dayNum);
        d.setLearningResource("https://example.com");
        d.setDsaPattern("Arrays");
        d.setDsaProblems("Two Sum");
        d.setProjectTask("Task " + dayNum);
        d.setMilestone(dayNum == 7);
        return d;
    }

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void getAllWeeks_givenWeeksExist_returnsListOfWeekSummaryDtos() {
        ScheduleWeek w1 = makeWeek(1, "Java Core Deep Dive");
        ScheduleWeek w2 = makeWeek(2, "Spring Boot Architecture");
        when(weekRepository.findAllByOrderByWeekNumAsc()).thenReturn(List.of(w1, w2));

        List<WeekSummaryDto> result = scheduleService.getAllWeeks();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).weekNum()).isEqualTo(1);
        assertThat(result.get(0).theme()).isEqualTo("Java Core Deep Dive");
        assertThat(result.get(1).weekNum()).isEqualTo(2);
        assertThat(result.get(1).theme()).isEqualTo("Spring Boot Architecture");
    }

    @Test
    void getWeekByNum_givenValidWeekNum_returnsWeekDetailWithAllDays() {
        ScheduleWeek week = makeWeek(1, "Java Core Deep Dive");
        List<ScheduleDay> days = List.of(
                makeDay(1, 1, "Mon"),
                makeDay(1, 2, "Tue"),
                makeDay(1, 7, "Sun")
        );
        when(weekRepository.findByWeekNum(1)).thenReturn(Optional.of(week));
        when(dayRepository.findByWeekNumOrderByDayNumAsc(1)).thenReturn(days);

        WeekDetailDto result = scheduleService.getWeekByNum(1);

        assertThat(result.weekNum()).isEqualTo(1);
        assertThat(result.theme()).isEqualTo("Java Core Deep Dive");
        assertThat(result.days()).hasSize(3);
        assertThat(result.days().get(0).dayLabel()).isEqualTo("Mon");
        // Sunday (dayNum 7) is a milestone
        assertThat(result.days().get(2).isMilestone()).isTrue();
    }

    @Test
    void getWeekByNum_givenInvalidWeekNum_throwsResourceNotFoundException() {
        when(weekRepository.findByWeekNum(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> scheduleService.getWeekByNum(99))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("ScheduleWeek not found with id: 99");
    }
}
```

- [ ] **Step 3: Run tests to confirm RED (class does not exist yet)**

```bash
cd F:\interview-coach\backend
mvn test -pl . -Dtest=ScheduleServiceImplTest -q 2>&1 | tail -20
```
Expected: COMPILATION ERROR — `ScheduleServiceImpl` does not exist yet

- [ ] **Step 4: Commit the interface + tests**

```bash
git add backend/src/main/java/com/interviewcoach/service/ScheduleService.java
git add backend/src/test/java/com/interviewcoach/service/ScheduleServiceImplTest.java
git commit -m "test(schedule): add failing ScheduleServiceImplTest + ScheduleService interface"
```

---

## Task 7: ScheduleServiceImpl — Make Tests GREEN

**Files:**
- Create: `backend/src/main/java/com/interviewcoach/service/ScheduleServiceImpl.java`

- [ ] **Step 1: Implement ScheduleServiceImpl**

```java
// backend/src/main/java/com/interviewcoach/service/ScheduleServiceImpl.java
package com.interviewcoach.service;

import com.interviewcoach.dto.DayDto;
import com.interviewcoach.dto.WeekDetailDto;
import com.interviewcoach.dto.WeekSummaryDto;
import com.interviewcoach.entity.ScheduleDay;
import com.interviewcoach.entity.ScheduleWeek;
import com.interviewcoach.exception.ResourceNotFoundException;
import com.interviewcoach.repository.ScheduleDayRepository;
import com.interviewcoach.repository.ScheduleWeekRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// WHY no @Transactional: this service is read-only — no dirty-checking, no transaction boundary needed.
// Adding @Transactional to read methods adds session lifecycle overhead for zero benefit.
@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleWeekRepository weekRepository;
    private final ScheduleDayRepository dayRepository;

    // WHY explicit constructor: Lombok @RequiredArgsConstructor won't generate this —
    // APT is not configured in this project's pom.xml. Always use explicit constructor injection.
    public ScheduleServiceImpl(ScheduleWeekRepository weekRepository,
                                ScheduleDayRepository dayRepository) {
        this.weekRepository = weekRepository;
        this.dayRepository = dayRepository;
    }

    @Override
    public List<WeekSummaryDto> getAllWeeks() {
        return weekRepository.findAllByOrderByWeekNumAsc()
                .stream()
                .map(this::toSummaryDto)
                .toList();
    }

    @Override
    public WeekDetailDto getWeekByNum(int weekNum) {
        // ResourceNotFoundException → GlobalExceptionHandler maps to HTTP 404 automatically.
        // WHY Long cast: ResourceNotFoundException takes (String resource, Long id).
        ScheduleWeek week = weekRepository.findByWeekNum(weekNum)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleWeek", (long) weekNum));

        List<DayDto> days = dayRepository.findByWeekNumOrderByDayNumAsc(weekNum)
                .stream()
                .map(this::toDayDto)
                .toList();

        return new WeekDetailDto(
                week.getWeekNum(),
                week.getTheme(),
                week.getFocusJava(),
                week.getFocusDsa(),
                week.getFocusProject(),
                days
        );
    }

    // Private mappers keep mapping logic close to the data — no MapStruct dependency at this scale.

    private WeekSummaryDto toSummaryDto(ScheduleWeek w) {
        return new WeekSummaryDto(
                w.getWeekNum(),
                w.getTheme(),
                w.getFocusJava(),
                w.getFocusDsa(),
                w.getFocusProject()
        );
    }

    private DayDto toDayDto(ScheduleDay d) {
        return new DayDto(
                d.getId(),
                d.getWeekNum(),
                d.getDayNum(),
                d.getDayLabel(),
                d.getLearningTopic(),
                d.getLearningDesc(),
                d.getLearningResource(),
                d.getDsaPattern(),
                d.getDsaProblems(),
                d.getProjectTask(),
                d.isMilestone()
        );
    }
}
```

- [ ] **Step 2: Run failing tests to confirm GREEN**

```bash
mvn test -Dtest=ScheduleServiceImplTest -q
```
Expected:
```
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

- [ ] **Step 3: Run the full test suite to confirm nothing is broken**

```bash
mvn test -q
```
Expected: BUILD SUCCESS, all existing tests still pass

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/interviewcoach/service/ScheduleServiceImpl.java
git commit -m "feat(schedule): implement ScheduleServiceImpl — all 3 service tests green"
```

---

## Task 8: ScheduleController + Controller Tests (TDD)

**Files:**
- Create: `backend/src/test/java/com/interviewcoach/controller/ScheduleControllerTest.java`
- Create: `backend/src/main/java/com/interviewcoach/controller/ScheduleController.java`

- [ ] **Step 1: Write the failing controller tests first**

```java
// backend/src/test/java/com/interviewcoach/controller/ScheduleControllerTest.java
package com.interviewcoach.controller;

import com.interviewcoach.dto.DayDto;
import com.interviewcoach.dto.WeekDetailDto;
import com.interviewcoach.dto.WeekSummaryDto;
import com.interviewcoach.exception.ResourceNotFoundException;
import com.interviewcoach.service.ScheduleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest: loads only web layer — fast, no DB.
// GlobalExceptionHandler (@RestControllerAdvice) is included automatically.
@WebMvcTest(ScheduleController.class)
class ScheduleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ScheduleService scheduleService;

    @Test
    void getAllWeeks_returns200WithWeekList() throws Exception {
        List<WeekSummaryDto> weeks = List.of(
                new WeekSummaryDto(1, "Java Core Deep Dive", "Collections", "Hashing", "Seed data"),
                new WeekSummaryDto(2, "Spring Boot Architecture", "DI", "Linked Lists", "Migrations")
        );
        when(scheduleService.getAllWeeks()).thenReturn(weeks);

        mockMvc.perform(get("/api/v1/schedule/weeks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].weekNum").value(1))
                .andExpect(jsonPath("$[0].theme").value("Java Core Deep Dive"))
                .andExpect(jsonPath("$[1].weekNum").value(2));
    }

    @Test
    void getWeekByNum_givenValidNum_returns200WithWeekDetail() throws Exception {
        List<DayDto> days = List.of(
                new DayDto(1L, 1, 1, "Mon", "Collections", "Desc", "https://baeldung.com",
                        "Arrays & Hashing", "Two Sum", "Add seed data", false),
                new DayDto(7L, 1, 7, "Sun", "Week 1 Review", "Review", "https://interviewbit.com",
                        "Review", "Two Sum revisit", "Tag v0.1", true)
        );
        WeekDetailDto detail = new WeekDetailDto(1, "Java Core Deep Dive",
                "Collections, OOP", "Hashing, Two Pointers", "Seed data", days);
        when(scheduleService.getWeekByNum(1)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/schedule/weeks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weekNum").value(1))
                .andExpect(jsonPath("$.theme").value("Java Core Deep Dive"))
                .andExpect(jsonPath("$.days.length()").value(2))
                .andExpect(jsonPath("$.days[0].dayLabel").value("Mon"))
                .andExpect(jsonPath("$.days[1].isMilestone").value(true));
    }

    @Test
    void getWeekByNum_givenInvalidNum_returns404WithMessage() throws Exception {
        when(scheduleService.getWeekByNum(99))
                .thenThrow(new ResourceNotFoundException("ScheduleWeek", 99L));

        mockMvc.perform(get("/api/v1/schedule/weeks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("ScheduleWeek not found with id: 99"));
    }
}
```

- [ ] **Step 2: Run tests to confirm RED**

```bash
mvn test -Dtest=ScheduleControllerTest -q 2>&1 | tail -10
```
Expected: COMPILATION ERROR — `ScheduleController` does not exist yet

- [ ] **Step 3: Implement ScheduleController**

```java
// backend/src/main/java/com/interviewcoach/controller/ScheduleController.java
package com.interviewcoach.controller;

import com.interviewcoach.dto.WeekDetailDto;
import com.interviewcoach.dto.WeekSummaryDto;
import com.interviewcoach.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Pure delegation: the controller's only job is HTTP — parse request, call service, return DTO.
// No business logic, no repository calls, no @Transactional.
@RestController
@RequestMapping("/api/v1/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    // GET /api/v1/schedule/weeks
    // Returns all 8 week summaries. Useful for building the WeekSelector tabs.
    @GetMapping("/weeks")
    public ResponseEntity<List<WeekSummaryDto>> getAllWeeks() {
        return ResponseEntity.ok(scheduleService.getAllWeeks());
    }

    // GET /api/v1/schedule/weeks/{weekNum}
    // Returns full week detail including all 7 day rows.
    // weekNum is an int path variable — Spring auto-coerces. Non-integer → 400 from Spring.
    // Unknown weekNum (not 1-8) → ResourceNotFoundException → GlobalExceptionHandler → 404.
    @GetMapping("/weeks/{weekNum}")
    public ResponseEntity<WeekDetailDto> getWeekByNum(@PathVariable int weekNum) {
        return ResponseEntity.ok(scheduleService.getWeekByNum(weekNum));
    }
}
```

- [ ] **Step 4: Run controller tests to confirm GREEN**

```bash
mvn test -Dtest=ScheduleControllerTest -q
```
Expected:
```
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

- [ ] **Step 5: Run full test suite**

```bash
mvn test -q
```
Expected: BUILD SUCCESS — all 18+ tests green (8 service + 7 lesson controller + 3 schedule service + 3 schedule controller)

- [ ] **Step 6: Commit**

```bash
git add backend/src/test/java/com/interviewcoach/controller/ScheduleControllerTest.java
git add backend/src/main/java/com/interviewcoach/controller/ScheduleController.java
git commit -m "feat(schedule): add ScheduleController — all 6 schedule tests green"
```

---

## Task 9: Frontend API Module — schedule.js

**Files:**
- Create: `frontend/src/api/schedule.js`

- [ ] **Step 1: Create the API module**

```javascript
// frontend/src/api/schedule.js
// Follows the same pattern as lessons.js: import the singleton Axios instance,
// return data directly (interceptor has already normalized errors to Error objects).
import api from './axios'

/**
 * Fetches all 8 week summaries for building the WeekSelector tabs.
 * @returns {Promise<WeekSummary[]>}
 */
export async function fetchAllWeeks() {
  const { data } = await api.get('/schedule/weeks')
  return data
}

/**
 * Fetches full week detail including all 7 daily schedule rows.
 * @param {number} weekNum - 1 through 8
 * @returns {Promise<WeekDetail>}
 */
export async function fetchWeekByNum(weekNum) {
  const { data } = await api.get(`/schedule/weeks/${weekNum}`)
  return data
}
```

- [ ] **Step 2: Verify the file exists and has no syntax errors**

```bash
cd F:\interview-coach\frontend
node --input-type=module < src/api/schedule.js 2>&1 || echo "parse ok (import error expected in Node without bundler)"
```
Expected: `parse ok` (the import error is normal — Axios is not installed in raw Node, just confirming no syntax errors)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/schedule.js
git commit -m "feat(schedule): add schedule.js Axios API module"
```

---

## Task 10: Custom Hooks — useSchedule.js

**Files:**
- Create: `frontend/src/hooks/useSchedule.js`

- [ ] **Step 1: Create the hooks file with two hooks**

```javascript
// frontend/src/hooks/useSchedule.js
// Two hooks in one file: useSchedule (all weeks list) + useWeekDetail (one week's days).
// Separation of concerns: the page can call both independently.
import { useState, useEffect } from 'react'
import { fetchAllWeeks, fetchWeekByNum } from '../api/schedule'

/**
 * Fetches all 8 week summaries once on mount.
 * Weeks list is static — no deps array values change after mount.
 */
export function useSchedule() {
  const [weeks, setWeeks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchAllWeeks()
      .then(data => { if (!cancelled) setWeeks(data) })
      .catch(err  => { if (!cancelled) setError(err.message) })
      .finally(()  => { if (!cancelled) setLoading(false) })

    // Cleanup: if component unmounts before fetch resolves, ignore stale response.
    return () => { cancelled = true }
  }, []) // empty deps: fetch only once on mount

  return { weeks, loading, error }
}

/**
 * Fetches a single week's full detail (including 7 days) whenever weekNum changes.
 * @param {number|null} weekNum - null means "not selected yet", skips the fetch
 */
export function useWeekDetail(weekNum) {
  const [weekDetail, setWeekDetail] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  useEffect(() => {
    // WHY guard: weekNum can be null on initial render before user selects.
    if (!weekNum) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchWeekByNum(weekNum)
      .then(data => { if (!cancelled) setWeekDetail(data) })
      .catch(err  => { if (!cancelled) setError(err.message) })
      .finally(()  => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [weekNum]) // re-fetch every time weekNum changes

  return { weekDetail, loading, error }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useSchedule.js
git commit -m "feat(schedule): add useSchedule and useWeekDetail custom hooks"
```

---

## Task 11: WeekSelector Component

**Files:**
- Create: `frontend/src/components/schedule/WeekSelector.jsx`

- [ ] **Step 1: Create WeekSelector**

```jsx
// frontend/src/components/schedule/WeekSelector.jsx
// Shows 8 clickable week tabs. Active week has blue highlight.
// Props:
//   weeks: WeekSummary[] — from useSchedule()
//   activeWeekNum: number — currently selected week
//   onSelect: (weekNum: number) => void

export default function WeekSelector({ weeks, activeWeekNum, onSelect }) {
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      padding: '12px 16px',
      borderBottom: '1px solid var(--color-border)',
      overflowX: 'auto',
      flexShrink: 0,
    }}>
      {weeks.map(week => {
        const isActive = week.weekNum === activeWeekNum
        return (
          <button
            key={week.weekNum}
            onClick={() => onSelect(week.weekNum)}
            aria-label={`Week ${week.weekNum}: ${week.theme}`}
            style={{
              flexShrink: 0,
              padding: '8px 14px',
              borderRadius: 8,
              border: isActive
                ? '1.5px solid var(--color-blue)'
                : '1.5px solid var(--color-border)',
              background: isActive ? '#eff6ff' : '#fff',
              color: isActive ? 'var(--color-blue)' : 'var(--color-text-faint)',
              fontWeight: isActive ? 700 : 400,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all .12s',
              textAlign: 'left',
              minWidth: 110,
            }}
          >
            <div style={{ fontSize: 10, marginBottom: 2, opacity: 0.7 }}>Week {week.weekNum}</div>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 130,
            }}>
              {week.theme}
            </div>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/schedule/WeekSelector.jsx
git commit -m "feat(schedule): add WeekSelector component"
```

---

## Task 12: DailyTable Component

**Files:**
- Create: `frontend/src/components/schedule/DailyTable.jsx`

- [ ] **Step 1: Create DailyTable**

```jsx
// frontend/src/components/schedule/DailyTable.jsx
// Shows a 7-row table: Day | Learning (1hr) | DSA (1hr) | Project (1hr)
// Props:
//   weekDetail: WeekDetail | null — from useWeekDetail()
//   loading: boolean
//   error: string | null

const DAY_COLORS = {
  Mon: '#dbeafe', Tue: '#dcfce7', Wed: '#fef9c3',
  Thu: '#fce7f3', Fri: '#ede9fe', Sat: '#ffedd5', Sun: '#f1f5f9',
}

const thStyle = {
  padding: '10px 14px',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '.6px',
  color: 'var(--color-text-faint)',
  borderBottom: '2px solid var(--color-border)',
  textAlign: 'left',
  background: '#f8fafc',
}

const tdStyle = {
  padding: '10px 14px',
  fontSize: 12,
  verticalAlign: 'top',
  borderBottom: '1px solid var(--color-border)',
}

export default function DailyTable({ weekDetail, loading, error }) {
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 13 }}>
        Loading schedule…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ margin: 16, padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
        ⚠ {error}
      </div>
    )
  }

  if (!weekDetail) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 13 }}>
        Select a week to view the daily schedule.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', flex: 1 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 70 }}>Day</th>
            <th style={thStyle}>📖 Learning (1hr)</th>
            <th style={thStyle}>💻 DSA (1hr)</th>
            <th style={thStyle}>🔨 Project (1hr)</th>
          </tr>
        </thead>
        <tbody>
          {weekDetail.days.map(day => (
            <tr
              key={day.dayNum}
              style={{
                background: day.isMilestone
                  ? 'linear-gradient(90deg, #f0fdf4 0%, #fff 100%)'
                  : 'transparent',
              }}
            >
              {/* Day label cell */}
              <td style={{ ...tdStyle, fontWeight: 700 }}>
                <div style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: DAY_COLORS[day.dayLabel] || '#f1f5f9',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#1e293b',
                }}>
                  {day.dayLabel}
                </div>
                {day.isMilestone && (
                  <div style={{ fontSize: 10, color: '#15803d', fontWeight: 700, marginTop: 4 }}>
                    ✓ Milestone
                  </div>
                )}
              </td>

              {/* Learning slot */}
              <td style={tdStyle}>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                  {day.learningTopic}
                </div>
                <div style={{ color: 'var(--color-text-faint)', fontSize: 11, lineHeight: 1.5 }}>
                  {day.learningDesc}
                </div>
                {day.learningResource && (
                  <a
                    href={day.learningResource}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 10, color: 'var(--color-blue)', marginTop: 4, display: 'block' }}
                  >
                    Resource →
                  </a>
                )}
              </td>

              {/* DSA slot */}
              <td style={tdStyle}>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                  {day.dsaPattern}
                </div>
                <div style={{ color: 'var(--color-text-faint)', fontSize: 11 }}>
                  {day.dsaProblems}
                </div>
              </td>

              {/* Project slot */}
              <td style={tdStyle}>
                <div style={{ color: '#334155', fontSize: 12, lineHeight: 1.5 }}>
                  {day.projectTask}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/schedule/DailyTable.jsx
git commit -m "feat(schedule): add DailyTable component with milestone row highlighting"
```

---

## Task 13: SchedulePage + Wire into App.jsx

**Files:**
- Create: `frontend/src/pages/SchedulePage.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create SchedulePage**

```jsx
// frontend/src/pages/SchedulePage.jsx
import { useState } from 'react'
import Topbar from '../components/layout/Topbar'
import WeekSelector from '../components/schedule/WeekSelector'
import DailyTable from '../components/schedule/DailyTable'
import { useSchedule, useWeekDetail } from '../hooks/useSchedule'

export default function SchedulePage() {
  // Default to Week 1 so the table is populated immediately on first visit.
  const [selectedWeekNum, setSelectedWeekNum] = useState(1)

  const { weeks, loading: weeksLoading, error: weeksError } = useSchedule()
  const { weekDetail, loading: detailLoading, error: detailError } = useWeekDetail(selectedWeekNum)

  // Find the active week's theme for the Topbar subtitle.
  const activeWeek = weeks.find(w => w.weekNum === selectedWeekNum)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar
        title="8-Week Schedule"
        subtitle={activeWeek ? `Week ${activeWeek.weekNum}: ${activeWeek.theme}` : ''}
        right={
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            color: 'var(--color-blue)',
          }}>
            Week {selectedWeekNum} of 8
          </div>
        }
      />

      {weeksLoading && (
        <div style={{ padding: 16, fontSize: 13, color: 'var(--color-text-faint)' }}>
          Loading weeks…
        </div>
      )}

      {weeksError && (
        <div style={{ margin: 16, padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
          ⚠ {weeksError}
        </div>
      )}

      {!weeksLoading && weeks.length > 0 && (
        <WeekSelector
          weeks={weeks}
          activeWeekNum={selectedWeekNum}
          onSelect={setSelectedWeekNum}
        />
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <DailyTable
          weekDetail={weekDetail}
          loading={detailLoading}
          error={detailError}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update App.jsx to wire in SchedulePage**

The current `App.jsx` has:
```jsx
<Route path="/schedule"  element={<ComingSoon name="8-Week Schedule" />} />
```

Replace only that line. The full updated App.jsx:

```jsx
import { Routes, Route } from 'react-router-dom'
import Shell from './components/layout/Shell'
import LessonsPage from './pages/LessonsPage'
import SchedulePage from './pages/SchedulePage'

function ComingSoon({ name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12, color: '#94a3b8' }}>
      <div style={{ fontSize: 40 }}>🚧</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#475569' }}>{name}</div>
      <div style={{ fontSize: 13 }}>Coming in the next phase</div>
    </div>
  )
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/"          element={<ComingSoon name="Today's Plan" />} />
        <Route path="/roadmap"   element={<ComingSoon name="DSA Roadmap" />} />
        <Route path="/schedule"  element={<SchedulePage />} />
        <Route path="/lessons"   element={<LessonsPage />} />
        <Route path="/practice"  element={<ComingSoon name="Interview Practice" />} />
        <Route path="/sessions"  element={<ComingSoon name="History" />} />
        <Route path="/settings"  element={<ComingSoon name="Settings" />} />
      </Routes>
    </Shell>
  )
}
```

- [ ] **Step 3: Verify the frontend builds with no errors**

```bash
cd F:\interview-coach\frontend
npm run build 2>&1 | tail -20
```
Expected: `✓ built in X.XXs` with no errors

- [ ] **Step 4: Smoke test in the browser**

Start backend:
```bash
cd F:\interview-coach\backend
DB_URL=jdbc:postgresql://localhost:5432/interviewcoach DB_USER=dev DB_PASS=dev mvn spring-boot:run
```

Verify API:
```bash
curl http://localhost:8080/api/v1/schedule/weeks
# Expected: JSON array of 8 objects with weekNum 1..8
curl http://localhost:8080/api/v1/schedule/weeks/1
# Expected: JSON with weekNum:1, theme, days array of 7 objects
curl http://localhost:8080/api/v1/schedule/weeks/99
# Expected: {"message":"ScheduleWeek not found with id: 99"}, status 404
```

Start frontend:
```bash
cd F:\interview-coach\frontend
npm run dev
# Open http://localhost:5173/schedule
# Expected: 8 week tabs visible, Week 1 pre-selected, 7-row table with Mon-Sun
```

- [ ] **Step 5: Run full backend test suite one final time**

```bash
cd F:\interview-coach\backend
DB_URL=jdbc:postgresql://localhost:5432/interviewcoach DB_USER=dev DB_PASS=dev mvn test -q
```
Expected: BUILD SUCCESS, all tests green

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/SchedulePage.jsx frontend/src/App.jsx
git commit -m "feat(schedule): wire SchedulePage into /schedule route — Phase 2 complete"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Flyway V4 migration: `schedule_weeks` + `schedule_days` tables (Task 1)
- ✅ Flyway V5 seed: 8 weeks + 56 days (Task 2)
- ✅ ScheduleWeek + ScheduleDay entities (Task 3)
- ✅ Repositories with derived queries (Task 4)
- ✅ WeekSummaryDto, DayDto, WeekDetailDto records (Task 5)
- ✅ ScheduleService interface (Task 6)
- ✅ ScheduleServiceImpl + 3 unit tests (Tasks 6-7)
- ✅ GET /api/v1/schedule/weeks (Task 8)
- ✅ GET /api/v1/schedule/weeks/{weekNum} (Task 8)
- ✅ 3 controller tests with @WebMvcTest (Task 8)
- ✅ api/schedule.js (Task 9)
- ✅ useSchedule + useWeekDetail hooks (Task 10)
- ✅ WeekSelector component (Task 11)
- ✅ DailyTable component with milestone highlight (Task 12)
- ✅ SchedulePage composing all parts (Task 13)
- ✅ /schedule route wired in App.jsx (Task 13)

**Placeholder scan:** No TBD, TODO, "implement later", "handle edge cases", or "write tests" phrases without actual code.

**Type consistency:**
- `fetchAllWeeks()` → `WeekSummaryDto[]` → rendered by `WeekSelector` — consistent
- `fetchWeekByNum(weekNum)` → `WeekDetailDto` with `days: DayDto[]` → rendered by `DailyTable` — consistent
- `useSchedule()` returns `{ weeks, loading, error }` — used correctly in SchedulePage
- `useWeekDetail(weekNum)` returns `{ weekDetail, loading, error }` — used correctly in SchedulePage
- `ScheduleServiceImpl.getWeekByNum` throws `ResourceNotFoundException("ScheduleWeek", (long) weekNum)` — message: `"ScheduleWeek not found with id: 99"` — matches controller test assertion

**Architecture patterns consistent with Phase 1:**
- No Lombok (explicit constructors + getters/setters) ✅
- No `@Transactional` on read-only service ✅
- GlobalExceptionHandler reused (not modified) ✅
- DTOs as Java records ✅
- Same Axios singleton pattern in frontend ✅
- Same cancelled-flag cleanup pattern in hooks ✅

---

## Next Phase

**Phase 3 candidates (pick one):**
1. **Today's Plan** (`/` route) — dynamic daily view using current date + schedule_days.day_num
2. **Interview Practice** (`/practice` route) — wire existing SessionController + ChatView into the Shell layout
3. **Auth** — JWT login gate + protected routes

Suggested next: **Phase 3 = Interview Practice** (wires the existing chat feature into the new UI shell — highest interview demo value).
