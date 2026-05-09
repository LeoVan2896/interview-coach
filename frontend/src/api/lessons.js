import api from './axios'

/**
 * Fetches all lessons, optionally filtered by category or status.
 * @param {{ category?: string, status?: string }} params
 * @returns {Promise<LessonSummary[]>}
 */
export async function fetchLessons({ category, status } = {}) {
  const params = {}
  if (category && category !== 'all') params.category = category
  if (status && status !== 'all')     params.status   = status
  const { data } = await api.get('/lessons', { params })
  return data
}

/**
 * Fetches full lesson detail including contentHtml and fiservNote.
 * @param {number} id
 * @returns {Promise<LessonDetail>}
 */
export async function fetchLessonById(id) {
  const { data } = await api.get(`/lessons/${id}`)
  return data
}

/**
 * Updates the status of a lesson (NOT_STARTED -> IN_PROGRESS -> DONE).
 * @param {number} id
 * @param {'NOT_STARTED'|'IN_PROGRESS'|'DONE'} status
 * @returns {Promise<LessonDetail>}
 */
export async function patchLessonStatus(id, status) {
  const { data } = await api.patch(`/lessons/${id}/status`, { status })
  return data
}
