import { useState, useMemo } from 'react'
import Topbar from '../components/layout/Topbar'
import CategorySidebar from '../components/lessons/CategorySidebar'
import LessonCard from '../components/lessons/LessonCard'
import { useLessons } from '../hooks/useLessons'

export default function LessonsPage() {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter,   setStatusFilter]   = useState('all')
  const [searchQuery,    setSearchQuery]     = useState('')
  const { lessons, loading, error } = useLessons(categoryFilter, statusFilter)

  // Client-side search: filter already-fetched lessons by title or description.
  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons
    const q = searchQuery.toLowerCase()
    return lessons.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q)
    )
  }, [lessons, searchQuery])

  const doneCount = lessons.filter(l => l.status === 'DONE').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar
        title="Lessons"
        right={
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1.5px solid var(--color-border)', borderRadius: 9, padding: '7px 12px', width: 300 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-faint)' }}>🔍</span>
              <input
                type="text"
                placeholder="Search lessons…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, outline: 'none', color: 'var(--color-text)' }}
              />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, color: '#15803d' }}>
              {doneCount} / 60 done
            </div>
          </>
        }
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <CategorySidebar
          activeCategory={categoryFilter}
          activeStatus={statusFilter}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
          lessons={lessons}
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-faint)', fontWeight: 600 }}>
              {loading ? 'Loading…' : `Showing ${filteredLessons.length} lessons`}
            </span>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}

          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {filteredLessons.map(lesson => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
              {filteredLessons.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--color-text-faint)' }}>
                  No lessons found
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
