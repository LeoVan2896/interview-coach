// frontend/src/components/schedule/WeekSelector.jsx
export default function WeekSelector({ weeks, activeWeekNum, onSelect }) {
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      padding: '12px 16px',
      borderBottom: '1px solid var(--color-border)',
      overflowX: 'auto',
      flexShrink: 0,
    }}>
      {weeks.map(week => {
        const isActive = week.weekNum === activeWeekNum
        return (
          <button
            key={week.weekNum}
            onClick={() => onSelect(week.weekNum)}
            aria-label={`Week ${week.weekNum}: ${week.theme}`}
            style={{
              flexShrink: 0,
              padding: '8px 14px',
              borderRadius: 8,
              border: isActive
                ? '1.5px solid var(--color-blue)'
                : '1.5px solid var(--color-border)',
              background: isActive ? '#eff6ff' : '#fff',
              color: isActive ? 'var(--color-blue)' : 'var(--color-text-faint)',
              fontWeight: isActive ? 700 : 400,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all .12s',
              textAlign: 'left',
              minWidth: 110,
            }}
          >
            <div style={{ fontSize: 10, marginBottom: 2, opacity: 0.7 }}>Week {week.weekNum}</div>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 130,
            }}>
              {week.theme}
            </div>
          </button>
        )
      })}
    </div>
  )
}
