import { useEffect, useState } from 'react'
import { fetchLessonById } from '../../api/lessons'

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

export default function LessonDetailPanel({ lesson, onClose, onStatusChange }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!lesson) return
    setLoading(true)
    fetchLessonById(lesson.id)
      .then(setDetail)
      .finally(() => setLoading(false))
  }, [lesson?.id])

  if (!lesson) return null

  const catColor  = CAT_COLOR[lesson.category]  || '#94a3b8'
  const lvlStyle  = LEVEL_STYLE[lesson.level]   || LEVEL_STYLE.INTERMEDIATE
  const statStyle = STATUS_STYLE[lesson.status] || STATUS_STYLE.NOT_STARTED

  return (
    <div style={{
      width: 340, flexShrink: 0,
      borderLeft: '1px solid var(--color-border)',
      background: '#fff',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--color-border-soft)', background: 'linear-gradient(135deg, var(--color-blue-pale), #fff 60%)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: catColor, marginBottom: 5 }}>
          {lesson.category.replace(/_/g, ' ')}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.25, flex: 1, paddingRight: 8 }}>
            {lesson.title}
          </div>
          <button
            onClick={onClose}
            style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'var(--color-border-soft)', color: 'var(--color-text-muted)', fontSize: 14, flexShrink: 0 }}
          >✕</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: lvlStyle.bg, color: lvlStyle.color }}>
            {lesson.level.charAt(0) + lesson.level.slice(1).toLowerCase()}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: statStyle.bg, color: statStyle.color }}>
            {statStyle.label}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: 'var(--color-border-soft)', color: 'var(--color-text-muted)' }}>
            ⏱ {lesson.durationMin} min
          </span>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-faint)' }}>Loading…</div>}

        {!loading && detail?.description && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-soft)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--color-text-faint)', marginBottom: 8 }}>Description</div>
            <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.55 }}>{detail.description}</p>
          </div>
        )}

        {!loading && detail?.companyNote && (
          <div style={{ margin: '10px 14px 0', background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '3px solid #f59e0b', borderRadius: 8, padding: '9px 11px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: '#b45309', marginBottom: 5 }}>💼 Work Context</div>
            <p style={{ fontSize: 11.5, color: '#78350f', lineHeight: 1.5 }}>{detail.companyNote}</p>
          </div>
        )}

        {!loading && detail?.contentHtml && (
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--color-text-faint)', marginBottom: 8 }}>📖 Lesson Content</div>
            <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.6 }}
                 dangerouslySetInnerHTML={{ __html: detail.contentHtml }} />
          </div>
        )}

        {!loading && !detail?.contentHtml && (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 13 }}>
            📝 Full lesson content coming soon
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '11px 14px', borderTop: '1px solid var(--color-border-soft)', display: 'flex', gap: 8, background: '#fafafa' }}>
        <button
          onClick={() => onStatusChange(lesson.id, lesson.status === 'NOT_STARTED' ? 'IN_PROGRESS' : 'DONE')}
          disabled={lesson.status === 'DONE'}
          style={{
            flex: 1, border: 'none', borderRadius: 9,
            padding: '9px 12px', fontSize: 13, fontWeight: 600,
            background: lesson.status === 'DONE' ? '#f1f5f9' : 'var(--color-blue)',
            color: lesson.status === 'DONE' ? 'var(--color-text-faint)' : '#fff',
            cursor: lesson.status === 'DONE' ? 'default' : 'pointer',
          }}
        >
          {lesson.status === 'NOT_STARTED' ? '▶ Start Lesson' : lesson.status === 'IN_PROGRESS' ? '✓ Mark Done' : '✅ Completed'}
        </button>
        <button style={{ flex: 1, border: '1.5px solid #c4b5fd', borderRadius: 9, padding: '9px 12px', fontSize: 13, fontWeight: 600, background: '#fff', color: 'var(--color-purple)' }}>
          🎯 Interview Q&amp;A
        </button>
      </div>
    </div>
  )
}
