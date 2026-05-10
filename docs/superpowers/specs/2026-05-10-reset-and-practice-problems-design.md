# Reset Progress Button + Practice Problems Quick-Link — Design

**Date:** 2026-05-10
**Files affected:**
- `frontend/src/pages/DsaRoadmapPage.jsx` — reset button in nav bar
- `frontend/src/pages/DsaConceptPage.jsx` — Practice Problems section + progress state

---

## Overview

Two independent additions that tighten the learn → practice loop:

1. **Reset Progress Button** — a destructive-action button in the roadmap nav bar that clears all solved progress after a confirmation prompt.
2. **Practice Problems Section** — a new section at the bottom of the concept page listing the topic's NeetCode 150 problems with checkboxes and LeetCode links. Checkboxes read/write the same `localStorage` key as the roadmap, so progress stays in sync.

---

## Feature 1 — Reset Progress Button

### Location

Nav bar in `DsaRoadmapPage`, rightmost element after the progress bar.

```
🗺️  DSA Roadmap   NeetCode 150     ──────────   47 / 150 solved  [Reset]
```

### Behavior

```js
function resetProgress() {
  if (!window.confirm('Reset all progress? This cannot be undone.')) return
  localStorage.removeItem('dsa_progress')
  setProgress({})
}
```

- Single `window.confirm` dialog as the confirmation gate.
- On confirm: removes `localStorage` key and resets React state to `{}`.
- On cancel: no-op.

### Style

```js
{
  padding: '3px 10px',
  borderRadius: 99,
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  background: 'transparent',
  border: '1px solid #f85149',
  color: '#f85149',
}
```

Hover state: `background: 'rgba(248,81,73,.1)'`.

---

## Feature 2 — Practice Problems Section (Concept Page)

### State

`DsaConceptPage` gains progress state that reads/writes the same `localStorage` key as the roadmap:

```js
const LS_KEY = 'dsa_progress'

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
  catch { return {} }
}
```

Inside `DsaConceptPage`:

```js
const [progress, setProgress] = useState(loadProgress)

function toggleProblem(problemId) {
  setProgress(prev => {
    const next = { ...prev }
    if (next[problemId]) delete next[problemId]
    else next[problemId] = true
    localStorage.setItem(LS_KEY, JSON.stringify(next))
    return next
  })
}
```

### Data

Problems come from `TOPIC_MAP[id]?.problems ?? []` — already available via the existing `TOPIC_MAP` on the concept page. No changes to `dsaData.js`.

### Section Position

New `<Section>` at the very bottom of the concept page, after the Code Example section:

```
Overview
When to Use
Common Interview Patterns
Time & Space Complexity
Code Example
Practice Problems          ← new
```

### Section Title

Includes a live solved counter:

```jsx
const problems = TOPIC_MAP[id]?.problems ?? []
const solvedCount = problems.filter(p => progress[p.id]).length
// Section title: `Practice Problems · ${solvedCount} / ${problems.length}`
```

### Row UI

Each problem renders as a flex row:

```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
              borderBottom: '1px solid #21262d', cursor: 'pointer' }}
     onClick={() => toggleProblem(p.id)}>

  {/* Checkbox */}
  <div style={{
    width: 16, height: 16, borderRadius: 3, flexShrink: 0,
    border: `2px solid ${progress[p.id] ? '#388bfd' : '#30363d'}`,
    background: progress[p.id] ? '#388bfd' : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {progress[p.id] && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
  </div>

  {/* Title */}
  <span style={{ flex: 1, fontSize: 13,
                 color: progress[p.id] ? '#8b949e' : '#f0f6fc',
                 textDecoration: progress[p.id] ? 'line-through' : 'none' }}>
    {p.title}
  </span>

  {/* Difficulty badge */}
  <span style={{
    fontSize: 11, fontWeight: 600, borderRadius: 99, padding: '2px 8px',
    color:       p.difficulty === 'Easy' ? '#3fb950' : p.difficulty === 'Medium' ? '#d29922' : '#f85149',
    background:  p.difficulty === 'Easy' ? 'rgba(63,185,80,.1)' : p.difficulty === 'Medium' ? 'rgba(210,153,34,.1)' : 'rgba(248,81,73,.1)',
  }}>
    {p.difficulty}
  </span>

  {/* LeetCode link */}
  <a href={p.leetcodeUrl} target="_blank" rel="noreferrer"
     onClick={e => e.stopPropagation()}
     style={{ fontSize: 12, color: '#58a6ff', textDecoration: 'none' }}>
    ↗
  </a>
</div>
```

### Strikethrough on solved

Solved problems get `textDecoration: 'line-through'` and muted text color `#8b949e` to visually signal completion without removing them from the list.

---

## What Does NOT Change

- `dsaData.js` — no changes
- `App.jsx` — no changes
- `DsaRoadmapPage` props or state shape — only adding a button + handler
- Concept page section order above Practice Problems — unchanged
- Nav bar overall progress display — unaffected by reset (state clears simultaneously)
