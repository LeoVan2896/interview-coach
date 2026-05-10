const BASE = '/api'

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (body) options.body = JSON.stringify(body)

  try {
    const res = await fetch(`${BASE}${path}`, options)
    // Some endpoints return 204 No Content (DELETE) — guard against empty body
    const data = res.status !== 204 ? await res.json().catch(() => null) : null

    if (!res.ok) {
      return { data: null, error: data?.error ?? `HTTP ${res.status}` }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

export const api = {
  createSession: (topic, questionText, questionHint, questionType) =>
    request('POST', '/sessions', { topic, questionText, questionHint, questionType }),

  getSessions: () => request('GET', '/sessions'),

  getSession: (id) => request('GET', `/sessions/${id}`),

  sendMessage: (sessionId, content) =>
    request('POST', `/sessions/${sessionId}/messages`, { content }),

  requestScorecard: (sessionId) =>
    request('POST', `/sessions/${sessionId}/scorecard`),

  deleteSession: (id) => request('DELETE', `/sessions/${id}`),

  researchQuestions: (topic) =>
    request('GET', `/questions/research?topic=${encodeURIComponent(topic)}`)
}
