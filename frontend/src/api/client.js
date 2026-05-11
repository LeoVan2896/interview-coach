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
    request('GET', `/questions/research?topic=${encodeURIComponent(topic)}`),

  /**
   * Opens an SSE stream for the AI reply and fires callbacks as data arrives.
   *
   * Why fetch instead of Axios?
   * Axios buffers the response body before resolving, which defeats streaming.
   * The Fetch API exposes res.body as a ReadableStream we can consume incrementally.
   *
   * SSE wire format from Spring SseEmitter:
   *   data:chunk_text\n\n          ← regular token chunk
   *   event:done\ndata:uuid\n\n    ← stream complete, uuid = saved message ID
   *
   * Returns an abort function — call it to cancel mid-stream (e.g. component unmount).
   *
   * @param {string}   sessionId
   * @param {string}   content     the user's message text
   * @param {Function} onChunk     called with each text token as it arrives
   * @param {Function} onDone      called once with the saved message UUID when complete
   * @param {Function} onError     called with an error string on failure
   * @returns {Function}           abort function
   */
  streamMessage: (sessionId, content, onChunk, onDone, onError) => {
    const controller = new AbortController()

    fetch(`${BASE}/sessions/${sessionId}/messages/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => `HTTP ${res.status}`)
          onError(text)
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let pendingEvent = null  // tracks the most recent `event:` line

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // SSE lines are separated by \n; a blank line terminates an event block.
          // We pop the last (possibly incomplete) line back into the buffer.
          const lines = buffer.split('\n')
          buffer = lines.pop()

          for (const line of lines) {
            if (line.startsWith('event:')) {
              pendingEvent = line.slice(6).trim()
            } else if (line.startsWith('data:')) {
              const data = line.slice(5).trim()
              if (pendingEvent === 'done') {
                onDone(data)       // data = UUID of the persisted assistant message
                pendingEvent = null
              } else if (data) {
                onChunk(data)      // data = one text token from Claude
              }
            } else if (line === '') {
              pendingEvent = null  // blank line resets event type
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError(err.message)
      })

    return () => controller.abort()
  },
}
