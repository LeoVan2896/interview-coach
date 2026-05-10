import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function SessionHistory() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

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
    if (!error) setSessions(prev => prev.filter(s => s.id !== id))
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
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Start Your First Interview
          </button>
        </div>
      ) : (
        <div className="session-list">
          {sessions.map(s => (
            <div
              key={s.id}
              className="session-card"
              onClick={() => navigate(`/interview/${s.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/interview/${s.id}`)}
            >
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
          ))}
        </div>
      )}
    </div>
  )
}
