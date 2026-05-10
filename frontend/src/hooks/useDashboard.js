import { useState, useEffect } from 'react'
import { fetchDashboardToday } from '../api/dashboard.js'
import { TOPICS, TOTAL_PROBLEMS } from '../data/dsaData.js'

const LS_KEY = 'dsa_progress'
const TOTAL_LESSONS = 60

export function useDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchDashboardToday()
      .then(serverData => {
        if (cancelled) return

        let progress = {}
        try {
          progress = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
        } catch (_) {}

        const problemsDone = Object.values(progress).filter(Boolean).length

        const dsaProgress = TOPICS.map(topic => ({
          topicId: topic.id,
          label: topic.label,
          done: topic.problems.filter(p => progress[p.id]).length,
          total: topic.problems.length,
        }))

        const lessonsDone = serverData.stats.lessonsDone
        const globePercent =
          ((lessonsDone / TOTAL_LESSONS) * 0.5 + (problemsDone / TOTAL_PROBLEMS) * 0.5) * 100
        const globeStage = Math.min(9, Math.floor(globePercent / 11.11) + 1)

        if (!cancelled) setData({ ...serverData, problemsDone, dsaProgress, globeStage })
      })
      .catch(err => { if (!cancelled) setError(err.message || String(err)) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
