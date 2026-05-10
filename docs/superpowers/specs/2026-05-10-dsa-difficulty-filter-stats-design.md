# DSA Roadmap — Difficulty Filter + Stats Bar

**Date:** 2026-05-10  
**File affected:** `frontend/src/pages/DsaRoadmapPage.jsx` (`RightPanel` function only)

---

## Overview

Add two new sections to the right panel of the DSA Roadmap, between the "Learn Concept" button and the problem table:

1. **Stats Bar** — color-coded pill badges showing how many problems of each difficulty have been solved for the selected topic
2. **Filter Row** — pill buttons to filter the problem list to a single difficulty level

No new files. No new dependencies. All changes are contained inside the existing `RightPanel` function in `DsaRoadmapPage.jsx`.

---

## Final Panel Order

```
Header (topic title + solved/total + progress bar)
Prerequisites
Learn Concept button
Stats Bar              ← new
Filter Row             ← new
Problem table (scrollable, shows filtered results)
```

---

## State

Add one new `useState` to `RightPanel`:

```js
const [activeFilter, setActiveFilter] = useState('All')
// Values: 'All' | 'Easy' | 'Medium' | 'Hard'
```

**Reset behavior:** `RightPanel` unmounts and remounts whenever a new topic is selected (React key change via `topic.id`). `useState` initializes fresh on each mount — no manual reset needed.

---

## Data Computations

Inside `RightPanel`, compute per-difficulty solved/total counts:

```js
const DIFFS = ['Easy', 'Medium', 'Hard']
const counts = Object.fromEntries(
  DIFFS.map(d => [
    d,
    {
      total: topic.problems.filter(p => p.difficulty === d).length,
      done:  topic.problems.filter(p => p.difficulty === d && progress[p.id]).length,
    }
  ])
)
```

Compute the filtered problem list for the table:

```js
const visibleProblems = activeFilter === 'All'
  ? topic.problems
  : topic.problems.filter(p => p.difficulty === activeFilter)
```

---

## Stats Bar UI

**Position:** new `flexShrink: 0` section with `borderBottom: '1px solid #21262d'`, placed directly below the Learn Concept button section.

**Layout:** horizontal flex row, centered, `gap: 10px`, `padding: '8px 18px'`

**Each badge:**
- Small rounded pill: `borderRadius: 99`, `padding: '3px 10px'`
- Background: `rgba(255,255,255,.05)`
- Border: colored at low opacity (matching difficulty color)
- A colored dot (`●`) on the left
- Text: `{done} {difficulty}` — e.g. `3 Easy`
- Font: 11.5px, semi-bold (`fontWeight: 600`), color `#c9d1d9`

**Difficulty colors** (reuse existing values from the problem rows):
- Easy → `#3fb950`
- Medium → `#d29922`
- Hard → `#f85149`

---

## Filter Row UI

**Position:** new `flexShrink: 0` section with `borderBottom: '1px solid #21262d'`, placed directly below the Stats Bar.

**Layout:** horizontal flex row, `gap: 6px`, `padding: '8px 18px'`

**Buttons:** `[All]  [Easy]  [Medium]  [Hard]`

**Inactive state:**
- Background: `#21262d`
- Border: `1px solid #30363d`
- Text color: `#8b949e`

**Active state (per difficulty):**
- All → blue: background tint `rgba(56,139,253,.15)`, border `#388bfd`, text `#58a6ff`
- Easy → green: background tint `rgba(63,185,80,.15)`, border `#3fb950`, text `#3fb950`
- Medium → yellow: background tint `rgba(210,153,34,.15)`, border `#d29922`, text `#d29922`
- Hard → red: background tint `rgba(248,81,73,.15)`, border `#f85149`, text `#f85149`

**Shared button style:** `borderRadius: 99`, `padding: '4px 12px'`, font 11px semi-bold, `cursor: 'pointer'`

**Behavior:** clicking an already-active filter does nothing. `All` is always available as a reset.

---

## Problem Table Changes

Replace `topic.problems.map(...)` with `visibleProblems.map(...)`. No other changes to the table.

---

## What Does NOT Change

- `DsaRoadmapPage` parent component — no new props, no state changes
- `RightPanel` props interface — unchanged
- `dsaData.js` — unchanged
- Nav bar overall progress — unaffected by filter (counts all progress, not just visible)
- Header `(solved / total)` — unaffected by filter (always shows topic totals)
