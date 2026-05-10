import axios from './axios.js'

export async function fetchDashboardToday() {
  const { data } = await axios.get('/dashboard/today')
  return data
}
