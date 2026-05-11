export default function PillarCard({ color, icon, label, badge, title, desc, buttonLabel, onAction }) {
  return (
    <div className="pillar-card">
      <div className="pillar-card-bar" style={{ background: color }} />
      <div className="pillar-card-body">
        <div className="pillar-card-header">
          <span className="pillar-card-icon">{icon}</span>
          <span className="pillar-card-label">{label}</span>
          {badge && <span className="pillar-card-badge">{badge}</span>}
        </div>
        <div className="pillar-card-title">{title}</div>
        {desc && <div className="pillar-card-desc">{desc}</div>}
        {buttonLabel && (
          <button
            className="pillar-card-btn"
            style={{ background: color }}
            onClick={onAction}
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  )
}
