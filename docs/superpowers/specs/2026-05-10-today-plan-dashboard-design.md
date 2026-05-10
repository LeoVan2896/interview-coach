# Today's Plan Dashboard — Design Spec

**Date:** 2026-05-10
**Status:** Approved
**Phase:** Phase 3 (Today's Plan)

---

## 1. Goal

Replace the `/` route placeholder with a fully functional Today's Plan dashboard — the app's daily entry point. The dashboard shows Huy exactly what to do today across the 3 pillars, tracks weekly and DSA progress, and displays overall knowledge growth as an illustrated 9-stage landscape globe.

---

## 2. Scope

Full spec §4.1:
- 3 pillar cards (📖 Learning · ⚡ LeetCode · 🔨 Project)
- Bottom-left card: 7-day week strip + DSA progress bars
- Bottom-right card: 4 stat boxes + illustrated landscape Globe (9 stages, drag slider)

---

## 3. Architecture

```
React DashboardPage (/ route)
  └── useDashboard() hook
        ├── GET /api/v1/dashboard/today   (server: plan + tasks + week + stats)
        └── localStorage                  (client: problemsDone, dsaProgress[])
```

### Data flow

1. `useDashboard()` calls `GET /api/v1/dashboard/today` on mount.
2. Server returns plan metadata, today's 3 tasks, this week's 7 days with status, and server-owned stats (lessonsDone, sessionsDone, daysLeft).
3. Hook reads `problemsDone` count and per-topic DSA progress from localStorage (same keys used by DsaRoadmapPage).
4. Hook computes `globePercent = ((lessonsDone / 60) * 0.5 + (problemsDone / 150) * 0.5) * 100` (0–100 range) and `globeStage = Math.min(9, Math.floor(globePercent / 11.11) + 1)`.
5. Page renders all components from this merged state.

---

## 4. Backend Changes

### Migration V9 — `create_plan.sql`

```sql
CREATE TABLE plans (
  id         BIGSERIAL PRIMARY KEY,
  start_date DATE      NOT NULL,
  end_date   DATE      NOT NULL
);
INSERT INTO plans (start_date, end_date) VALUES ('2026-05-04', '2026-06-28');
```

### Migration V10 — `add_schedule_lesson_fk.sql`

```sql
ALTER TABLE schedule_days ADD COLUMN lesson_id BIGINT REFERENCES lessons(id);
UPDATE schedule_days sd
SET lesson_id = (SELECT id FROM lessons WHERE title = sd.learning_topic LIMIT 1);
```

Back-fill is best-effort (NULL for unmatched rows). Dashboard returns `lessonId: null` for unmatched slots; Learning card button falls back to `/lessons` if `lessonId` is null.

### New Java classes

| Class | Layer | Notes |
|---|---|---|
| `entity/Plan.java` | Entity | Maps `plans` table. Fields: `id`, `startDate`, `endDate`. |
| `repository/PlanRepository.java` | Repository | `findTopByOrderByIdDesc()` — fetches the single plan row. |
| `dto/DashboardTodayDto.java` | DTO | Nested records: `PlanDto`, `TodayTasksDto`, `LearningTaskDto`, `LeetcodeTaskDto`, `ProjectTaskDto`, `WeekDayDto`, `StatsDto`. |
| `service/DashboardService.java` | Service (interface) | `getDashboardToday(): DashboardTodayDto` |
| `service/DashboardServiceImpl.java` | Service (impl) | Aggregates plan + schedule + lesson counts + session counts. |
| `controller/DashboardController.java` | Controller | `GET /api/v1/dashboard/today` |

### Endpoint: `GET /api/v1/dashboard/today`

```json
{
  "plan": {
    "currentWeek": 1,
    "daysLeft": 49,
    "startDate": "2026-05-04"
  },
  "todayTasks": {
    "learning": {
      "lessonId": 5,
      "topic": "Concurrency: Threads & Executors",
      "desc": "Thread, Runnable, Callable · ExecutorService · CompletableFuture",
      "resource": "Java Concurrency in Practice ch.6"
    },
    "leetcode": {
      "pattern": "Arrays & Hashing",
      "problems": "Two Sum, Contains Duplicate",
      "topicId": "arrays-hashing"
    },
    "project": {
      "task": "Build the Lessons Browser page"
    }
  },
  "weekDays": [
    { "dayLabel": "Mon", "date": "2026-05-04", "status": "DONE" },
    { "dayLabel": "Tue", "date": "2026-05-05", "status": "DONE" },
    { "dayLabel": "Wed", "date": "2026-05-06", "status": "DONE" },
    { "dayLabel": "Thu", "date": "2026-05-07", "status": "DONE" },
    { "dayLabel": "Fri", "date": "2026-05-08", "status": "DONE" },
    { "dayLabel": "Sat", "date": "2026-05-09", "status": "DONE" },
    { "dayLabel": "Sun", "date": "2026-05-10", "status": "TODAY" }
  ],
  "stats": {
    "lessonsDone": 4,
    "sessionsDone": 7,
    "daysLeft": 49
  }
}
```

**`sessionsDone`** counts rows in the existing `sessions` table (`SessionRepository.count()`).

**Day status logic** (computed by `DashboardServiceImpl`, not stored):
- `DONE` — `date < today`
- `TODAY` — `date = today`
- `FUTURE` — `date > today` and not Sunday
- `REST` — Sunday (`dayLabel = "Sun"`) and `date >= today`

**`currentWeek`** computed as `floor((today - startDate) / 7) + 1`, clamped to `[1, 8]`.

**`topicId`** on the LeetCode task: `dsaPattern` string mapped to the roadmap topic slug (e.g., `"Arrays & Hashing"` → `"arrays-hashing"`). Stored on `schedule_days.dsa_pattern` — a static slug mapping in `DashboardServiceImpl`.

### Tests

- `DashboardServiceImplTest` — unit test with Mockito: `getToday_givenValidPlan_returnsDtoWithCorrectWeekNum()`, `getToday_givenSunday_marksAsRestNotFuture()`, `getToday_givenPastDate_marksAsDone()`
- `DashboardControllerTest` — MockMvc: `getToday_returns200WithAllFields()`

---

## 5. Frontend Changes

### New files

```
src/
  api/dashboard.js                  ← fetchDashboardToday()
  hooks/useDashboard.js             ← merges API + localStorage data
  components/dashboard/
    PillarCard.jsx                  ← reusable for all 3 pillars
    WeekStrip.jsx                   ← 7-day status row
    DsaProgressList.jsx             ← pattern progress bars (from localStorage)
    StatsCard.jsx                   ← 4 stat boxes + Globe
    Globe.jsx                       ← 9-stage illustrated landscape SVG
  pages/DashboardPage.jsx           ← composes all components
```

### Modified files

- `App.jsx` — replace `<ComingSoon name="Today's Plan" />` with `<DashboardPage />`

### Component responsibilities

**`PillarCard`** — receives `{ color, icon, label, badge, title, desc, buttonLabel, onAction }`. Renders color top-bar, badge, title, description, action button. All 3 pillars use the same component.

Button actions:
- Learning: `navigate('/lessons/' + lessonId)` if `lessonId` is set, else `navigate('/lessons')`
- LeetCode: `navigate('/roadmap/concept/' + topicId)`
- Project: `navigate('/schedule')`

**`WeekStrip`** — receives `weekDays[]`. Renders 7 day pills. Status → style map: `DONE` = green fill + ✓, `TODAY` = blue border + ●, `FUTURE` = grey outline, `REST` = light grey + 💤.

**`DsaProgressList`** — reads all TOPICS from `dsaData.js`, reads completion counts from localStorage (same `LS_KEY` used by DsaRoadmapPage), renders progress bar + fraction per topic.

**`StatsCard`** — receives `{ lessonsDone, problemsDone, sessionsDone, daysLeft, globeStage }`. Renders 2×2 stat grid and `<Globe stage={globeStage} />`.

**`Globe`** — receives `{ stage: 1–9 }`. Renders the illustrated SVG scene for that stage. Below the scene: `<input type="range" min={1} max={9} value={stage} onChange={...} />` with stage label above and "Dark Ages / Connected World" endpoints below. User can drag to preview — slider state is local to `Globe`, does not write back to progress.

**`useDashboard`** hook:
```js
export function useDashboard() {
  // 1. fetch /dashboard/today
  // 2. read localStorage: problemsDone count, dsaProgress by topicId
  // 3. compute globePercent, globeStage
  // 4. return { plan, todayTasks, weekDays, stats, dsaProgress, globeStage, loading, error }
}
```

---

## 6. Globe — 9 Illustrated Stages

Each stage is a standalone SVG landscape scene (~130×110px viewBox). Rendered inline in `Globe.jsx` as a `switch(stage)` returning the SVG markup.

| Stage | Name | Key SVG elements |
|---|---|---|
| 1 | Dark Ages | Black sky, single dim moon, flat empty ground |
| 2 | Stone Age | Fire glow on horizon, cave silhouette, sparse stars |
| 3 | Ancient Civilization | Pyramids, obelisk, river, low sun |
| 4 | Medieval | Castle with tower, village, candlelit windows, dirt paths |
| 5 | Age of Discovery | Harbor, sailing ship with mast, lighthouse, sunrise gradient |
| 6 | Industrial Revolution | Factory chimneys with smoke puffs, steam train, amber/orange sky |
| 7 | Modern City | Skyscraper skyline, road lines, electric window glow, dusk purple sky |
| 8 | Digital Age | Data center towers, neon light trails, satellite dish, deep purple night |
| 9 | Connected World | Space scene — orbital satellite, Earth arc at bottom, glowing network node connections |

**Progress formula:**
```js
const globePercent = (lessonsDone / 60) * 0.5 + (problemsDone / 150) * 0.5
const globeStage   = Math.min(9, Math.floor(globePercent * 100 / 11.11) + 1)
```

---

## 7. Page Layout

```
┌─ Topbar: "Today's Plan" · "Week 1 of 8 · 49 days left" badge ─────────────┐
│                                                                              │
│  ┌── 📖 Learning ──┐  ┌── ⚡ LeetCode ──┐  ┌── 🔨 Project ──┐            │
│  │ blue top bar     │  │ purple top bar   │  │ green top bar   │            │
│  │ Week 1 · Day 7   │  │ Arrays & Hashing │  │ Week 1 · Build  │            │
│  │ [title]          │  │ [title]          │  │ [title]         │            │
│  │ [desc]           │  │ [desc]           │  │ [desc]          │            │
│  │ [Open Lesson →]  │  │ [Practice →]     │  │ [View Schedule]│            │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘            │
│                                                                              │
│  ┌── Week strip + DSA progress ────────┐  ┌── Stats + Globe ───────────┐   │
│  │ Mon Tue Wed Thu Fri Sat Sun          │  │  4    8    7    49         │   │
│  │  ✓   ✓   ✓   ✓   ✓   ✓   ●        │  │ Less  Prob Sess Days       │   │
│  │                                      │  │                            │   │
│  │ Arrays & Hashing  ████░░░  5/9       │  │  [Stage 3 SVG landscape]  │   │
│  │ Two Pointers      ████░░   2/5       │  │  ─────────────────────── │   │
│  │ Stack             █░░░░░   1/7       │  │  ◄ Dark Ages · Stage 3 ► │   │
│  │ + 9 more...                          │  │     Connected World        │   │
│  └──────────────────────────────────────┘  └────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Error Handling

- API error → `useDashboard` sets `error` string → page shows inline error banner, all stats show `--`
- `lessonId: null` on learning task → Learning card button navigates to `/lessons` (unfiltered)
- DSA localStorage missing → `DsaProgressList` treats all counts as 0 (normal first-launch state)

---

## 9. Testing

| Test | Type | Covers |
|---|---|---|
| `DashboardServiceImplTest` | Unit (Mockito) | currentWeek computation, day status logic (DONE/TODAY/FUTURE/REST), null lessonId handling |
| `DashboardControllerTest` | MockMvc | 200 response with all fields present |
| `Globe.jsx` visual | Manual | All 9 stages render without error; slider updates scene |

---

## 10. Out of Scope (follow-up)

- Auth / per-user plan rows (Phase 5 JWT)
- "Mark today complete" button (no explicit done tracking in MVP — DONE = date has passed)
- AI Customize plan modal (Phase 7)
- Real-time progress sync across tabs
