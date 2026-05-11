import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { icon: '📅', label: "Today's Plan",     to: '/' },
  { icon: '🗺️', label: 'DSA Roadmap',     to: '/roadmap' },
  { icon: '📆', label: '8-Week Schedule', to: '/schedule' },
]
const PRACTICE_ITEMS = [
  { icon: '📚', label: 'Lessons',           to: '/lessons' },
  { icon: '🎯', label: 'Interview Practice', to: '/practice' },
  { icon: '🕒', label: 'History',           to: '/sessions' },
]

function NavItem({ icon, label, to }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `sidebar-nav-item${isActive ? ' active' : ''}`
    }>
      <span className="sidebar-nav-icon">{icon}</span>
      {label}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">IC</div>
          <div>
            <div className="sidebar-brand-name">Interview Coach</div>
            <div className="sidebar-brand-sub">Huy Van · 8-week plan</div>
          </div>
        </div>
        <div className="sidebar-progress-row">
          <span>Week 1 of 8</span>
          <span className="sidebar-progress-value">14%</span>
        </div>
        <div className="sidebar-progress-track">
          <div className="sidebar-progress-fill" style={{ width: '14%' }} />
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="sidebar-nav-label">Workspace</div>
        {NAV_ITEMS.map(item => <NavItem key={item.to} {...item} />)}

        <div className="sidebar-nav-label">Practice</div>
        {PRACTICE_ITEMS.map(item => <NavItem key={item.to} {...item} />)}
      </div>

      <div className="sidebar-footer">
        <NavItem icon="⚙️" label="Settings" to="/settings" />
      </div>
    </div>
  )
}
