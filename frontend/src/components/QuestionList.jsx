import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const DIFFICULTY_CLASS = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-error' }
const TYPE_CLASS = { coding: 'badge-accent', conceptual: 'badge-muted', design: 'badge-purple', behavioral: 'badge-info' }

const TOPIC_LABELS = {
  JAVA_CORE: 'Java Core', SPRING_BOOT: 'Spring Boot', SQL_DB: 'SQL & DB',
  REST_APIS: 'REST APIs', SYSTEM_DESIGN: 'System Design', BEHAVIORAL: 'Behavioral', DSA: 'DSA'
}

const CACHE_VERSION = 'v1'
const cacheKey = (topic) => `practice_questions_${topic}_${CACHE_VERSION}`

function loadCache(topic) {
  try {
    const raw = localStorage.getItem(cacheKey(topic))
    if (!raw) return null
    return JSON.parse(raw) // { questions: [...], savedAt: timestamp }
  } catch {
    return null
  }
}

function saveCache(topic, questions) {
  try {
    localStorage.setItem(cacheKey(topic), JSON.stringify({ questions, savedAt: Date.now() }))
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

function clearCache(topic) {
  localStorage.removeItem(cacheKey(topic))
}

function formatCacheAge(savedAt) {
  const diff = Math.floor((Date.now() - savedAt) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function QuestionList() {
  const { topic } = useParams()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedHint, setExpandedHint] = useState(null)
  const [startingId, setStartingId] = useState(null)
  const [cacheAge, setCacheAge] = useState(null)

  useEffect(() => { fetchQuestions() }, [topic])

  async function fetchQuestions(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = loadCache(topic)
      if (cached) {
        setQuestions(cached.questions)
        setCacheAge(formatCacheAge(cached.savedAt))
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setError(null)
    setCacheAge(null)
    const { data, error } = await api.researchQuestions(topic)
    if (error) {
      setError(error)
    } else {
      const qs = data?.questions ?? []
      setQuestions(qs)
      saveCache(topic, qs)
      setCacheAge('just now')
    }
    setLoading(false)
  }

  function handleRefresh() {
    clearCache(topic)
    fetchQuestions(true)
  }

  async function startInterview(question) {
    setStartingId(question.id)
    const { data, error } = await api.createSession(topic, question.question, question.hint, question.type)
    if (error) {
      setStartingId(null)
      return
    }
    navigate(`/practice/interview/${data.id}`)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Researching {TOPIC_LABELS[topic] ?? topic} questions with AI...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-screen">
        <p className="error-text">⚠️ {error}</p>
        <button className="btn btn-primary" onClick={fetchQuestions}>Retry</button>
      </div>
    )
  }

  return (
    <div className="questions-page">
      <div className="questions-header">
        <button className="btn-back" onClick={() => navigate('/practice')}>← Topics</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <h2>{TOPIC_LABELS[topic] ?? topic} Questions</h2>
          {cacheAge && (
            <span style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
              cached {cacheAge}
            </span>
          )}
        </div>
        <button className="btn btn-ghost" onClick={handleRefresh} title="Refresh with new questions">
          ↻ Refresh
        </button>
      </div>

      <div className="questions-list">
        {questions.map(q => (
          <div key={q.id} className="question-card">
            <div className="question-top">
              <div className="question-badges">
                <span className={`badge ${DIFFICULTY_CLASS[q.difficulty] ?? 'badge-muted'}`}>
                  {q.difficulty}
                </span>
                <span className={`badge ${TYPE_CLASS[q.type] ?? 'badge-muted'}`}>
                  {q.type}
                </span>
              </div>
              {q.type === 'coding' ? (
                <button
                  className="btn btn-primary"
                  disabled={startingId != null}
                  onClick={() => startInterview(q)}
                >
                  {startingId === q.id ? 'Starting...' : 'Start Interview →'}
                </button>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
                  Study only
                </span>
              )}
            </div>

            <p className="question-text">{q.question}</p>
            <p className="question-source">📍 {q.source}</p>

            {q.hint && (
              <div className="hint-section">
                <button
                  className="hint-toggle"
                  onClick={() => setExpandedHint(expandedHint === q.id ? null : q.id)}
                >
                  {expandedHint === q.id ? '▼' : '▶'} Hint
                </button>
                {expandedHint === q.id && <p className="hint-text">{q.hint}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
