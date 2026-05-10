import { useState, useEffect } from 'react'
import { fetchDashboardToday } from '../api/dashboard.js'
import { TOPICS } from '../data/dsaData.js'

const LS_KEY = 'dsa_progress'

export function useDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardToday()
      .then(serverData => {
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
          ((lessonsDone / 60) * 0.5 + (problemsDone / 150) * 0.5) * 100
        const globeStage = Math.min(9, Math.floor(globePercent / 11.11) + 1)

        setData({ ...serverData, problemsDone, dsaProgress, globeStage })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
