// frontend/src/components/schedule/DailyTable.jsx
const DAY_COLORS = {
  Mon: '#dbeafe', Tue: '#dcfce7', Wed: '#fef9c3',
  Thu: '#fce7f3', Fri: '#ede9fe', Sat: '#ffedd5', Sun: '#f1f5f9',
}

const thStyle = {
  padding: '10px 14px',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '.6px',
  color: 'var(--color-text-faint)',
  borderBottom: '2px solid var(--color-border)',
  textAlign: 'left',
  background: '#f8fafc',
}

const tdStyle = {
  padding: '10px 14px',
  fontSize: 12,
  verticalAlign: 'top',
  borderBottom: '1px solid var(--color-border)',
}

export default function DailyTable({ weekDetail, loading, error }) {
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 13 }}>
        Loading schedule…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ margin: 16, padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
        ⚠ {error}
      </div>
    )
  }

  if (!weekDetail) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 13 }}>
        Select a week to view the daily schedule.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', flex: 1 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 70 }}>Day</th>
            <th style={thStyle}>📖 Learning (1hr)</th>
            <th style={thStyle}>💻 DSA (1hr)</th>
            <th style={thStyle}>🔨 Project (1hr)</th>
          </tr>
        </thead>
        <tbody>
          {weekDetail.days.map(day => (
            <tr
              key={day.dayNum}
              style={{
                background: day.isMilestone
                  ? 'linear-gradient(90deg, #f0fdf4 0%, #fff 100%)'
                  : 'transparent',
              }}
            >
              <td style={{ ...tdStyle, fontWeight: 700 }}>
                <div style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: DAY_COLORS[day.dayLabel] || '#f1f5f9',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#1e293b',
                }}>
                  {day.dayLabel}
                </div>
                {day.isMilestone && (
                  <div style={{ fontSize: 10, color: '#15803d', fontWeight: 700, marginTop: 4 }}>
                    ✓ Milestone
                  </div>
                )}
              </td>

              <td style={tdStyle}>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                  {day.learningTopic}
                </div>
                <div style={{ color: 'var(--color-text-faint)', fontSize: 11, lineHeight: 1.5 }}>
                  {day.learningDesc}
                </div>
                {day.learningResource && (
                  <a
                    href={day.learningResource}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 10, color: 'var(--color-blue)', marginTop: 4, display: 'block' }}
                  >
                    Resource →
                  </a>
                )}
              </td>

              <td style={tdStyle}>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                  {day.dsaPattern}
                </div>
                <div style={{ color: 'var(--color-text-faint)', fontSize: 11 }}>
                  {day.dsaProblems}
                </div>
              </td>

              <td style={tdStyle}>
                <div style={{ color: '#334155', fontSize: 12, lineHeight: 1.5 }}>
                  {day.projectTask}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
