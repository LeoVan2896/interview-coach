export default function Topbar({ title, subtitle, right }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid var(--color-border)',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center',
      flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>{today}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{subtitle}</div>
        )}
      </div>
      {right && <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>}
    </div>
  )
}
