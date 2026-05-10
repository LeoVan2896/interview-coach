const CAT_COLOR = {
  JAVA_CORE:       'linear-gradient(90deg,#2563eb,#60a5fa)',
  SPRING_BOOT:     'linear-gradient(90deg,#16a34a,#34d399)',
  REST_APIS:       'linear-gradient(90deg,#0891b2,#22d3ee)',
  JPA_HIBERNATE:   'linear-gradient(90deg,#d97706,#fcd34d)',
  SPRING_SECURITY: 'linear-gradient(90deg,#dc2626,#f87171)',
  TESTING:         'linear-gradient(90deg,#7c3aed,#a78bfa)',
  REACT:           'linear-gradient(90deg,#06b6d4,#67e8f9)',
  SYSTEM_DESIGN:   'linear-gradient(90deg,#f59e0b,#fde68a)',
}

const CAT_TEXT_COLOR = {
  JAVA_CORE: '#2563eb', SPRING_BOOT: '#16a34a', REST_APIS: '#0891b2',
  JPA_HIBERNATE: '#d97706', SPRING_SECURITY: '#dc2626', TESTING: '#7c3aed',
  REACT: '#0891b2', SYSTEM_DESIGN: '#f59e0b',
}

const LEVEL_STYLE = {
  BEGINNER:     { bg: '#dcfce7', color: '#15803d' },
  INTERMEDIATE: { bg: '#dbeafe', color: '#1d4ed8' },
  ADVANCED:     { bg: '#ede9fe', color: '#5b21b6' },
}

const STATUS_ICON = { DONE: '✅', IN_PROGRESS: '▶', NOT_STARTED: '○' }

export default function LessonCard({ lesson, isSelected, onClick }) {
  const cardBg = lesson.status === 'DONE'
    ? '#fafffe'
    : lesson.status === 'IN_PROGRESS'
      ? '#f8fbff'
      : '#fff'

  const lvl = LEVEL_STYLE[lesson.level] || LEVEL_STYLE.INTERMEDIATE

  return (
    <div
      onClick={() => onClick(lesson)}
      style={{
        background: cardBg,
        border: `1.5px solid ${isSelected ? '#93c5fd' : 'var(--color-border)'}`,
        borderRadius: 12,
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(37,99,235,.15)'
          : '0 1px 3px rgba(0,0,0,.04)',
        transition: 'all .15s',
      }}
    >
      <div style={{ height: 3, background: CAT_COLOR[lesson.category] || '#94a3b8' }} />

      <div style={{ padding: '12px 14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: CAT_TEXT_COLOR[lesson.category] || '#64748b' }}>
            {lesson.category.replace(/_/g, ' ')}
          </span>
          <span style={{ fontSize: 11, flexShrink: 0 }}>{STATUS_ICON[lesson.status]}</span>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3 }}>
          {lesson.title}
        </div>

        <div style={{ fontSize: 11.5, color: 'var(--color-text-faint)', lineHeight: 1.45, flex: 1,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {lesson.description}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: lvl.bg, color: lvl.color }}>
            {lesson.level.charAt(0) + lesson.level.slice(1).toLowerCase()}
          </span>
          <span style={{ fontSize: 10, color: 'var(--color-text-faint)', marginLeft: 'auto' }}>⏱ {lesson.durationMin} min</span>
        </div>
      </div>
    </div>
  )
}
