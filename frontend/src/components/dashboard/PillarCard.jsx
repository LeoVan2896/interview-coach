export default function PillarCard({ color, icon, label, badge, title, desc, buttonLabel, onAction }) {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      background: 'var(--color-surface)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flex: 1,
      minWidth: 0,
    }}>
      {/* Color top bar */}
      <div style={{ background: color, height: 4 }} />

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </span>
          {badge && (
            <span style={{
              marginLeft: 'auto',
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              background: '#f1f5f9',
              borderRadius: 6,
              color: 'var(--color-text-muted)',
            }}>
              {badge}
            </span>
          )}
        </div>

        {/* Title */}
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.35 }}>
          {title}
        </div>

        {/* Description */}
        {desc && (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5, flex: 1 }}>
            {desc}
          </div>
        )}

        {/* Action button */}
        {buttonLabel && (
          <button
            onClick={onAction}
            style={{
              marginTop: 'auto',
              padding: '7px 14px',
              background: color,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  )
}
