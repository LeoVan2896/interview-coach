import { useState, useEffect } from 'react'
import { fetchAllWeeks, fetchWeekByNum } from '../api/schedule'

/**
 * Fetches all 8 week summaries once on mount.
 */
export function useSchedule() {
  const [weeks, setWeeks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchAllWeeks()
      .then(data => { if (!cancelled) setWeeks(data) })
      .catch(err  => { if (!cancelled) setError(err.message) })
      .finally(()  => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  return { weeks, loading, error }
}

/**
 * Fetches a single week's full detail (including 7 days) whenever weekNum changes.
 * @param {number|null} weekNum
 */
export function useWeekDetail(weekNum) {
  const [detail, setDetail]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!weekNum) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchWeekByNum(weekNum)
      .then(data => { if (!cancelled) setDetail(data) })
      .catch(err  => { if (!cancelled) setError(err.message) })
      .finally(()  => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [weekNum])

  return { detail, loading, error }
}
