import api from './axios'

/**
 * Fetches all 8 week summaries for building the WeekSelector tabs.
 * @returns {Promise<WeekSummary[]>}
 */
export async function fetchAllWeeks() {
  const { data } = await api.get('/schedule/weeks')
  return data
}

/**
 * Fetches full week detail including all 7 daily schedule rows.
 * @param {number} weekNum - 1 through 8
 * @returns {Promise<WeekDetail>}
 */
export async function fetchWeekByNum(weekNum) {
  const { data } = await api.get(`/schedule/weeks/${weekNum}`)
  return data
}
