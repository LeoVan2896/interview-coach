const CATEGORIES = [
  { key: 'all',             label: 'All Lessons',      color: '#94a3b8', count: 60 },
  { key: 'JAVA_CORE',       label: 'Java Core',         color: '#2563eb', count: 12 },
  { key: 'SPRING_BOOT',     label: 'Spring Boot',       color: '#16a34a', count: 10 },
  { key: 'REST_APIS',       label: 'REST APIs',         color: '#0891b2', count: 8  },
  { key: 'JPA_HIBERNATE',   label: 'JPA & Hibernate',   color: '#d97706', count: 7  },
  { key: 'SPRING_SECURITY', label: 'Spring Security',   color: '#dc2626', count: 6  },
  { key: 'TESTING',         label: 'Testing',           color: '#7c3aed', count: 7  },
  { key: 'REACT',           label: 'React',             color: '#06b6d4', count: 6  },
  { key: 'SYSTEM_DESIGN',   label: 'System Design',     color: '#f59e0b', count: 4  },
]

const STATUS_FILTERS = [
  { key: 'DONE',        label: 'Done',         dotColor: '#22c55e' },
  { key: 'IN_PROGRESS', label: 'In Progress',  dotColor: '#3b82f6' },
  { key: 'NOT_STARTED', label: 'Not Started',  dotColor: '#e2e8f0' },
]

export default function CategorySidebar({ activeCategory, activeStatus, onCategoryChange, onStatusChange, lessons }) {
  const countByStatus = { DONE: 0, IN_PROGRESS: 0, NOT_STARTED: 0 }
  lessons.forEach(l => { if (countByStatus[l.status] !== undefined) countByStatus[l.status]++ })

  return (
    <div style={{
      width: 190, flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 14px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--color-text-faint)', borderBottom: '1px solid var(--color-border-soft)' }}>
        Categories
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.key
          return (
            <div
              key={cat.key}
              onClick={() => { onCategoryChange(cat.key); onStatusChange('all') }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 8px', borderRadius: 7, cursor: 'pointer',
                marginBottom: 2,
                background: isActive ? 'var(--color-blue-pale)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-blue)' : 'var(--color-text-muted)' }}>
                  {cat.label}
                </span>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                background: isActive ? 'var(--color-blue-muted)' : 'var(--color-border-soft)',
                color: isActive ? '#1d4ed8' : 'var(--color-text-faint)',
              }}>
                {cat.count}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ padding: 8, borderTop: '1px solid var(--color-border-soft)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--color-text-faint)', padding: '4px 8px 6px' }}>Status</div>
        {STATUS_FILTERS.map(sf => {
          const isActive = activeStatus === sf.key
          return (
            <div
              key={sf.key}
              onClick={() => { onStatusChange(isActive ? 'all' : sf.key); onCategoryChange('all') }}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 7, cursor: 'pointer', background: isActive ? 'var(--color-blue-pale)' : 'transparent' }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: sf.dotColor, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: isActive ? 600 : 400, flex: 1 }}>{sf.label}</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>{countByStatus[sf.key]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
