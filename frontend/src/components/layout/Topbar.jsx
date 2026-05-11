export default function Topbar({ title, subtitle, right }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="topbar">
      <div className="topbar-info">
        <div className="topbar-date">{today}</div>
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>
      {right && <div className="topbar-right">{right}</div>}
    </div>
  )
}
