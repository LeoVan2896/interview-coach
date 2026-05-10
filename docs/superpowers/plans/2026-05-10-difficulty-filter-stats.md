# Difficulty Filter + Stats Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a color-coded stats bar and difficulty filter row to the DSA roadmap right panel, and fix the Status/Problem column overlap.

**Architecture:** All changes are inside the `RightPanel` function in `DsaRoadmapPage.jsx`. One new `useState` for `activeFilter`. Two new JSX sections (stats bar + filter row) inserted between the Learn Concept button and the problem table. The problem table renders `visibleProblems` (filtered) instead of `topic.problems`.

**Tech Stack:** React 18, inline styles only, no new dependencies

---

### Task 1: Fix Status/Problem column overlap

**Files:**
- Modify: `frontend/src/pages/DsaRoadmapPage.jsx` — two `gridTemplateColumns` values in `RightPanel`

The "Status" header text overflows its 34px column and overlaps "Problem". Fix: widen Status column from `34px` to `54px` in both the table header div and the row div.

- [ ] **Step 1: Update the table header grid**

In `DsaRoadmapPage.jsx`, find the table header `<div>` inside `RightPanel` (around line 236). Change `gridTemplateColumns`:

```jsx
// BEFORE
<div style={{ display: 'grid', gridTemplateColumns: '34px 1fr 76px 52px', padding: '7px 12px', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, background: '#161b22', zIndex: 2 }}>

// AFTER
<div style={{ display: 'grid', gridTemplateColumns: '54px 1fr 76px 52px', padding: '7px 12px', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, background: '#161b22', zIndex: 2 }}>
```

- [ ] **Step 2: Update the row grid**

Find the row `<div>` inside the `topic.problems.map(...)` call (around line 251). Change `gridTemplateColumns`:

```jsx
// BEFORE
<div
  key={prob.id}
  style={{ display: 'grid', gridTemplateColumns: '34px 1fr 76px 52px', padding: '8px 12px', borderBottom: '1px solid rgba(33,38,45,.8)', alignItems: 'center', cursor: 'pointer', transition: 'background .1s' }}

// AFTER
<div
  key={prob.id}
  style={{ display: 'grid', gridTemplateColumns: '54px 1fr 76px 52px', padding: '8px 12px', borderBottom: '1px solid rgba(33,38,45,.8)', alignItems: 'center', cursor: 'pointer', transition: 'background .1s' }}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173/roadmap`, click any topic node. In the right panel problem table, confirm "Status" and "Problem" headers are side-by-side with no overlap.

- [ ] **Step 4: Commit**

```bash
cd F:/interview-coach
git add frontend/src/pages/DsaRoadmapPage.jsx
git commit -m "fix: widen Status column to prevent header overlap with Problem"
```

---

### Task 2: Add filter state, computed values, Stats Bar, and Filter Row

**Files:**
- Modify: `frontend/src/pages/DsaRoadmapPage.jsx` — `RightPanel` function

- [ ] **Step 1: Add `activeFilter` state and computed values to `RightPanel`**

Inside the `RightPanel` function, directly after the existing `const pct = ...` line, add:

```jsx
const [activeFilter, setActiveFilter] = useState('All')

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
const visibleProblems = activeFilter === 'All'
  ? topic.problems
  : topic.problems.filter(p => p.difficulty === activeFilter)
```

Note: `useState` is already imported at the top of the file — no import change needed.

- [ ] **Step 2: Add the Stats Bar section**

Find the closing `</div>` of the "Learn Concept button" section (the one with `borderBottom: '1px solid #21262d'` that wraps the `📖 Learn Concept` button). Insert the Stats Bar **after** it, before the problem table `<div>`:

```jsx
{/* Stats Bar */}
<div style={{ padding: '8px 18px', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
  <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
    {DIFFS.map(d => {
      const color = d === 'Easy' ? '#3fb950' : d === 'Medium' ? '#d29922' : '#f85149'
      return (
        <div key={d} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 99,
          background: 'rgba(255,255,255,.05)',
          border: `1px solid ${color}44`,
        }}>
          <span style={{ color, fontSize: 8 }}>●</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#c9d1d9' }}>
            {counts[d].done} {d}
          </span>
        </div>
      )
    })}
  </div>
</div>
```

- [ ] **Step 3: Add the Filter Row section**

Insert the Filter Row immediately after the Stats Bar, before the problem table `<div>`:

```jsx
{/* Filter Row */}
<div style={{ padding: '8px 18px', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
  <div style={{ display: 'flex', gap: 6 }}>
    {['All', 'Easy', 'Medium', 'Hard'].map(f => {
      const isActive = activeFilter === f
      const activeStyles = {
        All:    { bg: 'rgba(56,139,253,.15)',  border: '#388bfd', text: '#58a6ff' },
        Easy:   { bg: 'rgba(63,185,80,.15)',   border: '#3fb950', text: '#3fb950' },
        Medium: { bg: 'rgba(210,153,34,.15)',  border: '#d29922', text: '#d29922' },
        Hard:   { bg: 'rgba(248,81,73,.15)',   border: '#f85149', text: '#f85149' },
      }[f]
      return (
        <button
          key={f}
          onClick={() => setActiveFilter(f)}
          style={{
            padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
            cursor: 'pointer',
            border: `1px solid ${isActive ? activeStyles.border : '#30363d'}`,
            background: isActive ? activeStyles.bg : '#21262d',
            color: isActive ? activeStyles.text : '#8b949e',
            transition: 'all .15s',
          }}
        >
          {f}
        </button>
      )
    })}
  </div>
</div>
```

- [ ] **Step 4: Wire `visibleProblems` to the problem table**

In the problem table scrollable area, find the line that reads:

```jsx
{topic.problems.map(prob => {
```

Change it to:

```jsx
{visibleProblems.map(prob => {
```

No other changes to the row rendering code.

- [ ] **Step 5: Verify in browser**

Open `http://localhost:5173/roadmap` and click any topic node. Confirm:

1. Stats Bar shows three color-coded pill badges below the Learn Concept button (e.g. `● 0 Easy  ● 0 Medium  ● 0 Hard` for a fresh topic)
2. Filter Row shows `[All] [Easy] [Medium] [Hard]` pill buttons below the stats bar
3. `All` is active by default (blue tint, blue border)
4. Clicking `Easy` highlights the Easy button green and shows only Easy problems in the table
5. Clicking `Medium` highlights Medium yellow and shows only Medium problems
6. Clicking `Hard` highlights Hard red and shows only Hard problems
7. Clicking `All` resets to full problem list
8. Check a few problems as solved, then verify the stats bar badge counts update (e.g. `● 2 Easy`)
9. Switch to a different topic node — filter resets to `All` automatically

- [ ] **Step 6: Commit**

```bash
cd F:/interview-coach
git add frontend/src/pages/DsaRoadmapPage.jsx
git commit -m "feat: add difficulty stats bar and filter row to roadmap right panel"
```
