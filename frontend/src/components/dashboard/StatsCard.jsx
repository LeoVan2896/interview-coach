import Globe from './Globe.jsx'

function StatBox({ value, label, color }) {
  return (
    <div className="stat-box">
      <div className="stat-box-value" style={{ color: color || 'var(--text)' }}>
        {value ?? '--'}
      </div>
      <div className="stat-box-label">{label}</div>
    </div>
  )
}

export default function StatsCard({ lessonsDone, problemsDone, sessionsDone, daysLeft, globeStage }) {
  return (
    <div className="stats-card">
      <div className="stats-card-label">Progress</div>
      <div className="stats-card-grid">
        <StatBox value={lessonsDone}   label="Lessons Done"   color="var(--accent)" />
        <StatBox value={problemsDone}  label="Problems Done"  color="var(--purple)" />
        <StatBox value={sessionsDone}  label="Sessions Done"  color="var(--success)" />
        <StatBox value={daysLeft}      label="Days Left"      color="var(--warning)" />
      </div>
      <Globe stage={globeStage ?? 1} />
    </div>
  )
}
