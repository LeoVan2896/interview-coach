import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import SessionReplay from './SessionReplay'

export default function SessionHistory() {
  const navigate                    = useNavigate()
  const [sessions, setSessions]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [closingId, setClosingId]   = useState(null)

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
      if (expandedId === id) setExpandedId(null)
      if (closingId === id) setClosingId(null)
    }
  }

  function toggleExpand(id) {
    if (expandedId === id) {
      // Closing: keep panel mounted for exit animation, then unmount
      setClosingId(id)
      setExpandedId(null)
      setTimeout(() => setClosingId(prev => (prev === id ? null : prev)), 250)
    } else {
      // Opening: cancel any in-progress close, open new panel
      setClosingId(null)
      setExpandedId(id)
    }
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
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleExpand(s.id)
                    }
                  }}
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

                {(isExpanded || closingId === s.id) && (
                  <div className={`accordion-body ${
                    closingId === s.id ? 'accordion-body--closing' : 'accordion-body--open'
                  }`}>
                    <SessionReplay sessionId={s.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
