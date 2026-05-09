import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { icon: '📅', label: "Today's Plan",      to: '/' },
  { icon: '🗺️', label: 'DSA Roadmap',      to: '/roadmap' },
  { icon: '📆', label: '8-Week Schedule',  to: '/schedule' },
]
const PRACTICE_ITEMS = [
  { icon: '📚', label: 'Lessons',          to: '/lessons' },
  { icon: '🎯', label: 'Interview Practice', to: '/practice' },
  { icon: '🕒', label: 'History',          to: '/sessions' },
]

const sb = {
  width: 'var(--sidebar-width)', flexShrink: 0,
  background: 'var(--color-sidebar-bg)',
  display: 'flex', flexDirection: 'column',
  height: '100vh',
}
const sbTop = {
  padding: '16px 14px 14px',
  borderBottom: '1px solid rgba(255,255,255,.06)',
}
const brandMark = {
  width: 30, height: 30, borderRadius: 8,
  background: 'linear-gradient(135deg,#2563eb,#60a5fa)',
  fontSize: 11, fontWeight: 800, color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
const progTrack = { height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 99 }
const progFill  = { height: '100%', width: '14%', background: 'linear-gradient(90deg,#2563eb,#60a5fa)', borderRadius: 99 }
const sbNav = { flex: 1, padding: 8, overflowY: 'auto' }
const navLabel = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '.9px', color: '#334155', padding: '10px 8px 4px',
}

function NavItem({ icon, label, to }) {
  return (
    <NavLink to={to} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', borderRadius: 7,
          fontSize: 13,
          color: isActive ? '#93c5fd' : '#64748b',
          fontWeight: isActive ? 600 : 400,
          background: isActive ? 'rgba(37,99,235,.2)' : 'transparent',
          border: isActive ? '1px solid rgba(37,99,235,.3)' : '1px solid transparent',
          marginBottom: 2,
          transition: 'all .12s',
        }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          {label}
        </div>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <div style={sb}>
      <div style={sbTop}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <div style={brandMark}>IC</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Interview Coach</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>Huy Van · 8-week plan</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', marginBottom: 6 }}>
          <span>Week 1 of 8</span>
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>14%</span>
        </div>
        <div style={progTrack}><div style={progFill}></div></div>
      </div>

      <div style={sbNav}>
        <div style={navLabel}>Workspace</div>
        {NAV_ITEMS.map(item => <NavItem key={item.to} {...item} />)}

        <div style={navLabel}>Practice</div>
        {PRACTICE_ITEMS.map(item => <NavItem key={item.to} {...item} />)}
      </div>

      <div style={{ padding: 8, borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <NavItem icon="⚙️" label="Settings" to="/settings" />
      </div>
    </div>
  )
}
