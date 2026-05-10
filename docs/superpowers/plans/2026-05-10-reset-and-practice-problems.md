# Reset Progress Button + Practice Problems Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Reset Progress button to the DSA Roadmap nav bar and a Practice Problems section (with checkboxes + LeetCode links) to the DSA Concept page.

**Architecture:** Two independent edits to two existing React pages. Both share the same `localStorage` key (`dsa_progress`) so progress syncs automatically — no global state needed. The reset button calls `window.confirm` then clears the key and React state. The Practice Problems section reads from `TOPIC_MAP[topicId].problems` (already available) and persists checkbox state to `localStorage` via a new `toggleProblem` handler.

**Tech Stack:** React 18, React Router v6, inline CSS-in-JS, Vite, `localStorage`

---

## File Map

| File | What changes |
|------|-------------|
| `frontend/src/pages/DsaRoadmapPage.jsx` | Add `resetProgress` function + Reset button in nav bar |
| `frontend/src/pages/DsaConceptPage.jsx` | Add `useState` import, `LS_KEY`/`loadProgress` constants, `progress` state + `toggleProblem`, Practice Problems section |

---

## Task 1: Reset Progress Button in DsaRoadmapPage

**Files:**
- Modify: `frontend/src/pages/DsaRoadmapPage.jsx`

**Context:** The nav bar lives in the `return` block (lines 58–68). The file already has `LS_KEY`, `loadProgress`, `progress` state, and `setProgress`. All we need to add is (a) a `resetProgress` function and (b) a `<button>` at the right end of the nav bar flex row.

- [ ] **Step 1: Add `resetProgress` function**

  In `DsaRoadmapPage.jsx`, after the `toggleProblem` function (around line 51), insert this new function:

  ```jsx
  function resetProgress() {
    if (!window.confirm('Reset all progress? This cannot be undone.')) return
    localStorage.removeItem(LS_KEY)
    setProgress({})
  }
  ```

  The full block after the edit (lines 43–55 region) should read:

  ```jsx
  function toggleProblem(problemId) {
    setProgress(prev => {
      const next = { ...prev }
      if (next[problemId]) delete next[problemId]
      else next[problemId] = true
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }

  function resetProgress() {
    if (!window.confirm('Reset all progress? This cannot be undone.')) return
    localStorage.removeItem(LS_KEY)
    setProgress({})
  }
  ```

- [ ] **Step 2: Add Reset button to nav bar**

  In the nav bar JSX (the `<div>` with `padding: '9px 16px'`), the current last two children are the `{totalSolved} / {TOTAL_PROBLEMS} solved` span and the progress bar `<div>`. Append the Reset button after the progress bar `<div>`:

  Before (end of nav bar):
  ```jsx
  <span style={{ fontSize: 12, color: '#8b949e' }}>{totalSolved} / {TOTAL_PROBLEMS} solved</span>
  <div style={{ width: 120, height: 4, background: '#21262d', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ width: `${overallPct}%`, height: '100%', background: '#388bfd', borderRadius: 99, transition: 'width .3s' }} />
  </div>
  ```

  After (add button immediately after the progress bar closing `</div>`):
  ```jsx
  <span style={{ fontSize: 12, color: '#8b949e' }}>{totalSolved} / {TOTAL_PROBLEMS} solved</span>
  <div style={{ width: 120, height: 4, background: '#21262d', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ width: `${overallPct}%`, height: '100%', background: '#388bfd', borderRadius: 99, transition: 'width .3s' }} />
  </div>
  <button
    onClick={resetProgress}
    style={{
      padding: '3px 10px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      cursor: 'pointer',
      background: 'transparent',
      border: '1px solid #f85149',
      color: '#f85149',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,81,73,.1)' }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
  >
    Reset
  </button>
  ```

- [ ] **Step 3: Manual verification**

  Run `npm run dev` from `frontend/` and open the roadmap page. Verify:
  - A red-outlined "Reset" button appears at the right of the nav bar
  - Clicking it shows `window.confirm("Reset all progress? This cannot be undone.")`
  - Clicking Cancel: nothing changes
  - Clicking OK: all checkboxes clear, solved counter resets to 0 / 150
  - Hover: button gets a faint red background

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/src/pages/DsaRoadmapPage.jsx
  git commit -m "feat: add Reset Progress button to DSA Roadmap nav bar"
  ```

---

## Task 2: Practice Problems Section in DsaConceptPage

**Files:**
- Modify: `frontend/src/pages/DsaConceptPage.jsx`

**Context:** `DsaConceptPage.jsx` currently imports only from `react-router-dom` — no `useState`. The page is a pure display component. We need to (1) add a `useState` import, (2) add `LS_KEY` + `loadProgress` at module scope, (3) wire up `progress` state + `toggleProblem` inside the component, and (4) append a Practice Problems `<Section>` after the Code Example section.

**Important:** React hooks must be called unconditionally — `useState(loadProgress)` must appear before the early-return guard (`if (!topic || !concept)`). The derived variables `problems` and `solvedCount` go after the guard.

- [ ] **Step 1: Add `useState` import**

  Change line 1 from:
  ```js
  import { useParams, useNavigate } from 'react-router-dom'
  ```
  To:
  ```js
  import { useState } from 'react'
  import { useParams, useNavigate } from 'react-router-dom'
  ```

- [ ] **Step 2: Add `LS_KEY` and `loadProgress` at module scope**

  After the imports and before `const TOPIC_MAP = ...`, insert:
  ```js
  const LS_KEY = 'dsa_progress'

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
    catch { return {} }
  }
  ```

  The top of the file should now read:
  ```js
  import { useState } from 'react'
  import { useParams, useNavigate } from 'react-router-dom'
  import { TOPICS } from '../data/dsaData'

  const LS_KEY = 'dsa_progress'

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
    catch { return {} }
  }

  const TOPIC_MAP = Object.fromEntries(TOPICS.map(t => [t.id, t]))
  ```

- [ ] **Step 3: Add `progress` state and `toggleProblem` inside the component**

  Inside `DsaConceptPage`, after the existing `const concept = CONCEPTS[topicId]` line and BEFORE the `if (!topic || !concept)` early-return guard, add:

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

  The component opening should look like:
  ```jsx
  export default function DsaConceptPage() {
    const { topicId } = useParams()
    const navigate = useNavigate()
    const topic = TOPIC_MAP[topicId]
    const concept = CONCEPTS[topicId]
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

    if (!topic || !concept) {
      return (
        ...
      )
    }
    ...
  ```

- [ ] **Step 4: Add `problems` and `solvedCount` derivations after the guard**

  After `if (!topic || !concept) { return (...) }`, add two derived variables before the main `return`:

  ```js
  const problems = TOPIC_MAP[topicId]?.problems ?? []
  const solvedCount = problems.filter(p => progress[p.id]).length
  ```

- [ ] **Step 5: Add Practice Problems `<Section>` at bottom of page**

  In the `return` block, after the Code Example `<Section>` and before the closing `</div></div>` of the page, insert:

  ```jsx
  {/* Practice Problems */}
  <Section title={`Practice Problems · ${solvedCount} / ${problems.length}`}>
    {problems.length === 0 ? (
      <div style={{ fontSize: 13, color: '#8b949e', fontStyle: 'italic' }}>
        No problems listed for this topic.
      </div>
    ) : (
      problems.map(p => (
        <div
          key={p.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 0',
            borderBottom: '1px solid #21262d',
            cursor: 'pointer',
          }}
          onClick={() => toggleProblem(p.id)}
        >
          {/* Checkbox */}
          <div style={{
            width: 16,
            height: 16,
            borderRadius: 3,
            flexShrink: 0,
            border: `2px solid ${progress[p.id] ? '#388bfd' : '#30363d'}`,
            background: progress[p.id] ? '#388bfd' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {progress[p.id] && (
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>
            )}
          </div>

          {/* Title */}
          <span style={{
            flex: 1,
            fontSize: 13,
            color: progress[p.id] ? '#8b949e' : '#f0f6fc',
            textDecoration: progress[p.id] ? 'line-through' : 'none',
          }}>
            {p.title}
          </span>

          {/* Difficulty badge */}
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 99,
            padding: '2px 8px',
            color: p.difficulty === 'Easy' ? '#3fb950' : p.difficulty === 'Medium' ? '#d29922' : '#f85149',
            background: p.difficulty === 'Easy' ? 'rgba(63,185,80,.1)' : p.difficulty === 'Medium' ? 'rgba(210,153,34,.1)' : 'rgba(248,81,73,.1)',
          }}>
            {p.difficulty}
          </span>

          {/* LeetCode link */}
          <a
            href={p.leetcodeUrl}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ fontSize: 12, color: '#58a6ff', textDecoration: 'none' }}
          >
            ↗
          </a>
        </div>
      ))
    )}
  </Section>
  ```

  The exact insertion point — the end of the inner content `<div>` — currently looks like:

  ```jsx
        {/* Code Example */}
        <Section title="Code Example">
          <pre style={{ ... }}>
            <code>{concept.code}</code>
          </pre>
        </Section>

      </div>   {/* ← closes maxWidth div */}
    </div>     {/* ← closes outer page div */}
  )
  ```

  Insert the Practice Problems `<Section>` between `</Section>` (after Code Example) and `</div>` (closes maxWidth div).

- [ ] **Step 6: Manual verification**

  Open any concept page (e.g., `/roadmap/concept/arrays-hashing`). Verify:
  - "Practice Problems · 0 / N" section appears at the bottom
  - Problems list renders with title, difficulty badge, and ↗ link
  - Clicking a row toggles its checkbox (blue check, strikethrough title, muted color)
  - Section title counter increments (`0 / N` → `1 / N`)
  - ↗ link opens LeetCode in a new tab without toggling the checkbox
  - Navigate to `/roadmap` — the roadmap's solved counter also reflects the changes (shared localStorage)
  - Using the Reset button on the roadmap also clears concept page checkboxes on next visit

- [ ] **Step 7: Commit**

  ```bash
  git add frontend/src/pages/DsaConceptPage.jsx
  git commit -m "feat: add Practice Problems section to DSA Concept page"
  ```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Reset button location: nav bar, rightmost element after progress bar (Task 1, Step 2)
- ✅ Reset confirms with `window.confirm` (Task 1, Step 1)
- ✅ Reset clears `localStorage` key AND React state (Task 1, Step 1)
- ✅ Reset button style: transparent bg, red border `#f85149`, hover tint (Task 1, Step 2)
- ✅ `LS_KEY = 'dsa_progress'` — same key as roadmap (Task 2, Step 2)
- ✅ `loadProgress` lazy initializer (Task 2, Step 2)
- ✅ `toggleProblem` reads/writes same key (Task 2, Step 3)
- ✅ Problems from `TOPIC_MAP[id]?.problems ?? []` — no change to dsaData.js (Task 2, Step 4)
- ✅ Section title includes live solved counter (Task 2, Step 5)
- ✅ Checkbox: 16×16, blue when done, `#30363d` border when not done (Task 2, Step 5)
- ✅ Title strikethrough + `#8b949e` when solved (Task 2, Step 5)
- ✅ Difficulty badge colors: Easy `#3fb950`, Medium `#d29922`, Hard `#f85149` (Task 2, Step 5)
- ✅ LeetCode `↗` link with `stopPropagation` (Task 2, Step 5)
- ✅ `useState` placed before early-return guard (Task 2, Step 3)

**Placeholder scan:** None found.

**Type consistency:** `p.id`, `p.title`, `p.difficulty`, `p.leetcodeUrl` match the problem shape in `dsaData.js` (confirmed from prior session read).
