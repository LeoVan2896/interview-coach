import { useState, useEffect, useCallback } from 'react'
import { fetchLessons, patchLessonStatus } from '../api/lessons'

/**
 * Manages lesson list state: fetches on mount/filter change, provides status update.
 * Custom hook keeps the data layer out of the page component.
 */
export function useLessons(categoryFilter = 'all', statusFilter = 'all') {
  const [lessons, setLessons]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchLessons({ category: categoryFilter, status: statusFilter })
      .then(data => { if (!cancelled) setLessons(data) })
      .catch(err  => { if (!cancelled) setError(err.message) })
      .finally(()  => { if (!cancelled) setLoading(false) })

    // Cleanup: if component unmounts before fetch completes, ignore stale response.
    return () => { cancelled = true }
  }, [categoryFilter, statusFilter])

  const updateStatus = useCallback(async (id, newStatus) => {
    const updated = await patchLessonStatus(id, newStatus)
    setLessons(prev => prev.map(l => l.id === id ? { ...l, status: updated.status } : l))
    return updated
  }, [])

  return { lessons, loading, error, updateStatus }
}
