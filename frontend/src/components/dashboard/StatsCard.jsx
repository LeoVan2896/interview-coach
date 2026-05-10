import Globe from './Globe.jsx'

function StatBox({ value, label, color }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 8px',
      background: '#f8fafc',
      borderRadius: 8,
      border: '1px solid var(--color-border)',
      flex: 1,
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || 'var(--color-text)' }}>
        {value ?? '--'}
      </div>
      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 2 }}>
        {label}
      </div>
    </div>
  )
}

export default function StatsCard({ lessonsDone, problemsDone, sessionsDone, daysLeft, globeStage }) {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      background: 'var(--color-surface)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      flex: 1,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Progress
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatBox value={lessonsDone} label="Lessons Done"   color="#3b82f6" />
        <StatBox value={problemsDone} label="Problems Done" color="#8b5cf6" />
        <StatBox value={sessionsDone} label="Sessions Done" color="#10b981" />
        <StatBox value={daysLeft}    label="Days Left"      color="#f59e0b" />
      </div>

      <Globe stage={globeStage ?? 1} />
    </div>
  )
}
