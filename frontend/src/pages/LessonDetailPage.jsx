import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchLessonById, patchLessonStatus } from '../api/lessons'

const CAT_COLOR = {
  JAVA_CORE: '#2563eb', SPRING_BOOT: '#16a34a', REST_APIS: '#0891b2',
  JPA_HIBERNATE: '#d97706', SPRING_SECURITY: '#dc2626', TESTING: '#7c3aed',
  REACT: '#0891b2', SYSTEM_DESIGN: '#f59e0b',
}

const LEVEL_STYLE = {
  BEGINNER:     { bg: '#dcfce7', color: '#15803d' },
  INTERMEDIATE: { bg: '#dbeafe', color: '#1d4ed8' },
  ADVANCED:     { bg: '#ede9fe', color: '#5b21b6' },
}

const STATUS_STYLE = {
  DONE:        { bg: '#f0fdf4', color: '#16a34a', label: '✅ Done' },
  IN_PROGRESS: { bg: '#eff6ff', color: '#2563eb', label: '▶ In Progress' },
  NOT_STARTED: { bg: '#f8fafc', color: '#94a3b8', label: '○ Not Started' },
}

export default function LessonDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchLessonById(Number(id))
      .then(data => { if (!cancelled) setLesson(data) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  async function handleStatusChange() {
    if (!lesson || lesson.status === 'DONE') return
    const next = lesson.status === 'NOT_STARTED' ? 'IN_PROGRESS' : 'DONE'
    setUpdating(true)
    try {
      const updated = await patchLessonStatus(lesson.id, next)
      setLesson(prev => ({ ...prev, status: updated.status }))
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: 14 }}>
        Loading lesson…
      </div>
    )
  }

  if (!lesson) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12, color: '#94a3b8' }}>
        <div style={{ fontSize: 32 }}>😕</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#475569' }}>Lesson not found</div>
        <button onClick={() => navigate('/lessons')} style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          ← Back to Lessons
        </button>
      </div>
    )
  }

  const catColor  = CAT_COLOR[lesson.category]  || '#94a3b8'
  const lvlStyle  = LEVEL_STYLE[lesson.level]   || LEVEL_STYLE.INTERMEDIATE
  const statStyle = STATUS_STYLE[lesson.status] || STATUS_STYLE.NOT_STARTED

  const nextLabel = lesson.status === 'NOT_STARTED'
    ? '▶ Start Lesson'
    : lesson.status === 'IN_PROGRESS'
      ? '✓ Mark as Done'
      : '✅ Completed'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#f8fafc' }}>

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--color-border)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button
          onClick={() => navigate('/lessons')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}
        >
          ← Lessons
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: catColor }}>
          {lesson.category.replace(/_/g, ' ')}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 5, background: lvlStyle.bg, color: lvlStyle.color }}>
          {lesson.level.charAt(0) + lesson.level.slice(1).toLowerCase()}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 5, background: statStyle.bg, color: statStyle.color }}>
          {statStyle.label}
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>⏱ {lesson.durationMin} min</span>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>

          {/* Title */}
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-text)', lineHeight: 1.2, marginBottom: 8 }}>
            {lesson.title}
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 28 }}>
            {lesson.description}
          </p>

          {/* Company note */}
          {lesson.companyNote && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b', borderRadius: 10, padding: '14px 18px', marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: '#b45309', marginBottom: 6 }}>
                💼 Work Context
              </div>
              <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6, margin: 0 }}>{lesson.companyNote}</p>
            </div>
          )}

          {/* Lesson content */}
          {lesson.contentHtml ? (
            <div style={{
              background: '#fff', borderRadius: 12, border: '1px solid var(--color-border)',
              padding: '24px 28px',
              fontSize: 14, color: '#374151', lineHeight: 1.7,
            }}>
              <div
                dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
                style={{
                  // Scoped styles for rendered HTML
                }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
              📝 Full lesson content coming soon
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button
              onClick={handleStatusChange}
              disabled={lesson.status === 'DONE' || updating}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none',
                fontSize: 14, fontWeight: 700,
                background: lesson.status === 'DONE' ? '#f1f5f9' : 'var(--color-blue)',
                color: lesson.status === 'DONE' ? '#94a3b8' : '#fff',
                cursor: lesson.status === 'DONE' ? 'default' : 'pointer',
                opacity: updating ? 0.7 : 1,
              }}
            >
              {updating ? 'Saving…' : nextLabel}
            </button>
            <button
              onClick={() => navigate('/practice', { state: { lessonId: lesson.id, lessonTitle: lesson.title, category: lesson.category } })}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: 10,
                border: '1.5px solid #c4b5fd',
                fontSize: 14, fontWeight: 700,
                background: '#fff', color: 'var(--color-purple)',
                cursor: 'pointer',
              }}
            >
              🎯 Interview Q&amp;A
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
