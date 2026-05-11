export default function DsaProgressList({ dsaProgress = [] }) {
  return (
    <div className="dsa-progress-list">
      {dsaProgress.map(({ topicId, label, done, total }) => {
        const pct = total === 0 ? 0 : Math.round((done / total) * 100)
        return (
          <div key={topicId} className="dsa-progress-item">
            <div className="dsa-progress-row">
              <span className="dsa-progress-label">{label}</span>
              <span className="dsa-progress-count">{done}/{total}</span>
            </div>
            <div className="dsa-progress-track">
              <div className="dsa-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
