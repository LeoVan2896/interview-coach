export default function DsaProgressList({ dsaProgress = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1 }}>
      {dsaProgress.map(({ topicId, label, done, total }) => {
        const pct = total === 0 ? 0 : Math.round((done / total) * 100)
        return (
          <div key={topicId}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
              <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{label}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{done}/{total}</span>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: '#3b82f6',
                borderRadius: 3,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
