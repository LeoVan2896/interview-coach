import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const DIFFICULTY_CLASS = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-error' }
const TYPE_CLASS = { coding: 'badge-accent', conceptual: 'badge-muted', design: 'badge-purple', behavioral: 'badge-info' }

const TOPIC_LABELS = {
  JAVA_CORE: 'Java Core', SPRING_BOOT: 'Spring Boot', SQL_DB: 'SQL & DB',
  REST_APIS: 'REST APIs', SYSTEM_DESIGN: 'System Design', BEHAVIORAL: 'Behavioral', DSA: 'DSA'
}

export default function QuestionList() {
  const { topic } = useParams()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedHint, setExpandedHint] = useState(null)
  const [startingId, setStartingId] = useState(null)

  useEffect(() => { fetchQuestions() }, [topic])

  async function fetchQuestions() {
    setLoading(true)
    setError(null)
    const { data, error } = await api.researchQuestions(topic)
    if (error) {
      setError(error)
    } else {
      setQuestions(data?.questions ?? [])
    }
    setLoading(false)
  }

  async function startInterview(question) {
    setStartingId(question.id)
    const { data, error } = await api.createSession(topic, question.question, question.hint, question.type)
    if (error) {
      setStartingId(null)
      return
    }
    navigate(`/interview/${data.id}`)
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
        <button className="btn-back" onClick={() => navigate('/')}>← Topics</button>
        <h2>{TOPIC_LABELS[topic] ?? topic} Questions</h2>
        <button className="btn btn-ghost" onClick={fetchQuestions} title="Refresh with new questions">
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
              <button
                className="btn btn-primary"
                disabled={startingId != null}
                onClick={() => startInterview(q)}
              >
                {startingId === q.id ? 'Starting...' : 'Start Interview'}
              </button>
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
