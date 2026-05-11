# Session Replay — Design Spec

**Date:** 2026-05-11  
**Status:** Approved  
**Feature:** Inline session replay accordion in Session History

---

## Overview

Allow users to review past interview sessions by expanding a session row inline in the Session History page. Clicking a row reveals the full message thread in a fixed-height scrollable container, reusing existing `MessageBubble` and `ScoreCard` components.

---

## User Experience

- Each row in Session History has a `▶` chevron on the left
- Clicking anywhere on a row (except the Delete button) toggles the row open or closed
- Only one session can be expanded at a time — opening a new row collapses the previous one
- The expanded area shows the full conversation thread with a fixed max-height of 420px and internal scroll
- The scorecard (if present) renders as the last message bubble, identical to the live session view
- Auto-scrolls to the bottom on load so the most recent messages are visible first

---

## Architecture

### Files Changed

| File | Change |
|------|--------|
| `frontend/src/api/client.js` | Add `getSessionById(id)` → `GET /api/sessions/:id` |
| `frontend/src/components/SessionHistory.jsx` | Add `expandedId` state, row click handler, render `<SessionReplay>` |
| `frontend/src/components/SessionReplay.jsx` | **New** — fetches + renders a session's messages |

### Files Reused (no changes)

- `MessageBubble.jsx` — renders individual messages
- `ScoreCard.jsx` — renders scorecard if detected in message content

---

## Data Flow

```
SessionHistory
  └─ expandedId: string | null  (useState)
       ↓ row click (not delete button)
  └─ SessionReplay ({ sessionId })
       └─ GET /api/sessions/:id  (via getSessionById)
       └─ renders MessageBubble[] list
            └─ ScoreCard (if last message contains scorecard)
```

---

## Component Specs

### `api/client.js` — addition

```js
getSessionById: (id) => request(`/api/sessions/${id}`)
```

Returns `SessionDetail`: `{ id, topic, topicLabel, questionText, createdAt, completed, messages: MessageDto[] }`

---

### `SessionHistory.jsx` — changes

- Add `const [expandedId, setExpandedId] = useState(null)`
- Row click handler: `setExpandedId(id === expandedId ? null : id)`
- Delete button: `e.stopPropagation()` to prevent row toggle
- Chevron: `▶` (collapsed) / `▼` (expanded) — left side of row
- Below each expanded row: render `<SessionReplay sessionId={expandedId} />`

---

### `SessionReplay.jsx` — new component

**Props:** `{ sessionId: string }`

**States:**
- `loading` — show spinner
- `error` — show "Failed to load session" + Retry button
- `empty` — show "No messages in this session"
- `loaded` — render message list

**Behavior:**
- Fetch on mount / when `sessionId` changes
- Container: `max-height: 420px; overflow-y: auto; padding: 12px`
- Auto-scroll to bottom on load via `useRef` + `scrollTop = scrollHeight`
- Render `<MessageBubble>` for each message (reuse existing component)
- ScoreCard detection handled inside `MessageBubble` (already works this way)

---

## API Contract

**Endpoint:** `GET /api/sessions/{id}`  
**Already implemented** in `SessionController.java`  
**Returns:** `SessionDetail` with `messages: List<MessageDto>`

No backend changes required.

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Fetch fails (network/500) | Show "Failed to load session" + Retry button |
| Session has 0 messages | Show "No messages in this session" |
| Session not found (404) | Show "Session not found" |
| Loading state | Show centered spinner |

---

## Out of Scope

- Editing or continuing a past session from replay view
- Sharing or exporting a session
- Pagination of messages (all messages loaded at once)
- Filtering messages within replay
