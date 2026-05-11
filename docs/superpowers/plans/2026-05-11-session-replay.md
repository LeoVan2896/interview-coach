# Session Replay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accordion to Session History so clicking a session row expands it inline to show the full conversation thread and scorecard.

**Architecture:** `SessionHistory.jsx` gains `expandedId` state and renders a new `SessionReplay` component below the clicked row. `SessionReplay` fetches `GET /api/sessions/:id` (already wired as `api.getSession`) and renders messages via the existing `MessageBubble` component. No backend changes needed.

**Tech Stack:** React 18, existing `api.getSession`, `MessageBubble.jsx`, `ScoreCard.jsx`

---

## File Map

| Action | File |
|--------|------|
| **Create** | `frontend/src/components/SessionReplay.jsx` |
| **Modify** | `frontend/src/components/SessionHistory.jsx` |
| No change | `frontend/src/api/client.js` (`api.getSession` already exists) |
| No change | `frontend/src/components/MessageBubble.jsx` |
| No change | `frontend/src/components/ScoreCard.jsx` |

---

## Task 1: Create `SessionReplay.jsx`

**Files:**
- Create: `frontend/src/components/SessionReplay.jsx`

This component receives a `sessionId` string, fetches the full session via `api.getSession(id)`, and renders the message list inside a fixed-height scrollable container. It reuses `MessageBubble` for each message (which internally handles scorecard detection). It auto-scrolls to the bottom on load.

- [ ] **Step 1: Create the component file**

Create `frontend/src/components/SessionReplay.jsx` with this content:

```jsx
import { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'
import MessageBubble from './MessageBubble'

export default function SessionReplay({ sessionId }) {
  const [messages, setMessages] = useState([])
  const [status, setStatus]     = useState('loading') // 'loading' | 'error' | 'empty' | 'loaded'
  const bottomRef               = useRef(null)

  useEffect(() => {
    if (!sessionId) return
    setStatus('loading')
    setMessages([])

    api.getSession(sessionId).then(({ data, error }) => {
      if (error || !data) {
        setStatus('error')
        return
      }
      if (!data.messages || data.messages.length === 0) {
        setStatus('empty')
        return
      }
      setMessages(data.messages)
      setStatus('loaded')
    })
  }, [sessionId])

  // Auto-scroll to bottom once messages are loaded
  useEffect(() => {
    if (status === 'loaded' && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'instant' })
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="replay-container">
        <div className="replay-loading">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="replay-container">
        <div className="replay-empty">
          <p>Failed to load session.</p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setStatus('loading')
              api.getSession(sessionId).then(({ data, error }) => {
                if (error || !data) { setStatus('error'); return }
                if (!data.messages || data.messages.length === 0) { setStatus('empty'); return }
                setMessages(data.messages)
                setStatus('loaded')
              })
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div className="replay-container">
        <div className="replay-empty">
          <p>No messages in this session.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="replay-container">
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
```

- [ ] **Step 2: Add styles to `frontend/src/styles/main.css`**

Append these rules at the end of `frontend/src/styles/main.css`:

```css
/* ── Session Replay ─────────────────────────────────────── */
.replay-container {
  max-height: 420px;
  overflow-y: auto;
  padding: 12px 16px;
  background: var(--surface, #0f172a);
  border-top: 1px solid var(--border, #1e293b);
}

.replay-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 0;
}

.replay-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  color: var(--text-muted, #64748b);
  font-size: 0.9rem;
}
```

- [ ] **Step 3: Verify in browser**

Start the frontend dev server if not running:
```bash
cd F:/interview-coach/frontend && npm run dev
```

The component isn't visible yet (not wired into `SessionHistory`), but make sure the dev server compiles without errors.

Expected: no TypeScript/ESLint errors in the terminal.

- [ ] **Step 4: Commit**

```bash
cd F:/interview-coach
git add frontend/src/components/SessionReplay.jsx frontend/src/styles/main.css
git commit -m "feat: add SessionReplay component with loading/error/empty states"
```

---

## Task 2: Wire accordion into `SessionHistory.jsx`

**Files:**
- Modify: `frontend/src/components/SessionHistory.jsx`

Replace the navigate-on-click row behaviour with an accordion toggle. Add `expandedId` state, a chevron indicator, and render `<SessionReplay>` below the expanded row. Only one session can be open at a time.

- [ ] **Step 1: Update `SessionHistory.jsx`**

Replace the entire file with:

```jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import SessionReplay from './SessionReplay'

export default function SessionHistory() {
  const navigate                    = useNavigate()
  const [sessions, setSessions]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    api.getSessions().then(({ data }) => {
      if (data) setSessions(data)
      setLoading(false)
    })
  }, [])

  async function handleDelete(id, e) {
    e.stopPropagation()
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    const { error } = await api.deleteSession(id)
    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== id))
      // Collapse if the deleted session was expanded
      if (expandedId === id) setExpandedId(null)
    }
  }

  function toggleExpand(id) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h2>Session History</h2>
        <span className="history-count">{sessions.length} sessions</span>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">📭</p>
          <p>No sessions yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/practice')}>
            Start Your First Interview
          </button>
        </div>
      ) : (
        <div className="session-list">
          {sessions.map(s => {
            const isExpanded = expandedId === s.id
            return (
              <div key={s.id} className="session-card-wrapper">
                <div
                  className={`session-card ${isExpanded ? 'session-card--expanded' : ''}`}
                  onClick={() => toggleExpand(s.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={e => e.key === 'Enter' && toggleExpand(s.id)}
                >
                  <span className="session-chevron" aria-hidden="true">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <div className="session-card-left">
                    <div className="session-meta-row">
                      <span className="session-topic-badge">{s.topicLabel}</span>
                      {s.completed && <span className="badge badge-success">✓ Done</span>}
                    </div>
                    <p className="session-question">{s.questionText}</p>
                    <span className="session-meta">
                      {formatDate(s.createdAt)} · {s.messageCount} messages
                    </span>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={e => handleDelete(s.id, e)}
                    title="Delete session"
                  >
                    🗑
                  </button>
                </div>

                {isExpanded && <SessionReplay sessionId={s.id} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add chevron + wrapper styles to `frontend/src/styles/main.css`**

Append these rules to the end of `frontend/src/styles/main.css` (after the replay styles from Task 1):

```css
/* ── Session Accordion ──────────────────────────────────── */
.session-card-wrapper {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid var(--border, #1e293b);
}

.session-card-wrapper .session-card {
  margin-bottom: 0;
  border-radius: 0;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.session-card--expanded {
  background: var(--surface-hover, #1e293b) !important;
}

.session-chevron {
  font-size: 0.65rem;
  color: var(--text-muted, #64748b);
  flex-shrink: 0;
  width: 14px;
}
```

- [ ] **Step 3: Manual test — expand a session**

1. Open `http://localhost:5173/sessions` (or wherever Session History is routed)
2. Click any session row
3. **Expected:** Row expands below, showing spinner then message thread
4. Click same row again — **Expected:** collapses back
5. Click a different row — **Expected:** first row collapses, new row expands
6. Click the 🗑 delete button — **Expected:** confirm dialog opens, row does NOT toggle
7. Delete a session that is currently expanded — **Expected:** row disappears and nothing stays expanded

- [ ] **Step 4: Verify scorecard renders**

If you have a session with a completed scorecard:
1. Expand that session
2. **Expected:** Scorecard renders at the bottom of the message thread in the ASCII-art format, identical to the live session view

- [ ] **Step 5: Commit**

```bash
cd F:/interview-coach
git add frontend/src/components/SessionHistory.jsx frontend/src/styles/main.css
git commit -m "feat: accordion session replay in session history"
```

---

## Self-Review

**Spec coverage:**
- ✅ Chevron `▶` / `▼` indicator per row
- ✅ Click row (not delete) toggles open/closed
- ✅ Only one session expanded at a time
- ✅ Fixed max-height 420px with internal scroll
- ✅ Scorecard as last bubble (handled by `MessageBubble` already)
- ✅ Auto-scroll to bottom on load
- ✅ Loading spinner state
- ✅ Error state + Retry button
- ✅ Empty state ("No messages in this session")
- ✅ 404/fetch-fail → error state
- ✅ Deleting an expanded session collapses it

**No placeholders:** All code is complete and runnable.

**Type consistency:** `api.getSession(id)` returns `{ data, error }` — used correctly in both `SessionReplay.jsx` (Task 1) and the retry handler.
