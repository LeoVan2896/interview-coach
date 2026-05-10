const STATUS_STYLE = {
  DONE:   { background: '#dcfce7', border: '1px solid #86efac', color: '#166534' },
  TODAY:  { background: '#eff6ff', border: '2px solid #3b82f6', color: '#1d4ed8' },
  FUTURE: { background: '#f8fafc', border: '1px solid #cbd5e1', color: '#94a3b8' },
  REST:   { background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#94a3b8' },
}

const STATUS_ICON = {
  DONE: '✓',
  TODAY: '●',
  FUTURE: '',
  REST: '💤',
}

export default function WeekStrip({ weekDays }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {weekDays.map(day => {
        const s = STATUS_STYLE[day.status] || STATUS_STYLE.FUTURE
        const icon = STATUS_ICON[day.status] || ''
        return (
          <div
            key={day.date}
            style={{
              ...s,
              borderRadius: 8,
              padding: '6px 10px',
              textAlign: 'center',
              flex: 1,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <div>{day.dayLabel}</div>
            <div style={{ fontSize: 13, marginTop: 2 }}>{icon}</div>
          </div>
        )
      })}
    </div>
  )
}
