import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

export function useInterview(sessionId) {
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) return
    loadSession(sessionId)
  }, [sessionId])

  async function loadSession(id) {
    setBusy(true)
    const { data, error } = await api.getSession(id)
    if (error) {
      setError(error)
    } else {
      setSession(data)
      setMessages(data.messages ?? [])
    }
    setBusy(false)
  }

  const sendMessage = useCallback((text) => {
    if (!sessionId || busy) return
    setError(null)
    setBusy(true)

    // IDs for the optimistic user bubble and the streaming AI bubble.
    // They live in state with temp IDs until the server confirms each.
    const tempUserId = `temp-user-${Date.now()}`
    const tempAiId   = `temp-ai-${Date.now()}`

    // Immediately paint both bubbles: user message is final content;
    // AI bubble starts empty and fills token-by-token via onChunk.
    setMessages(prev => [
      ...prev,
      { id: tempUserId, role: 'USER',      content: text, streaming: false },
      { id: tempAiId,   role: 'ASSISTANT', content: '',   streaming: true  },
    ])

    api.streamMessage(
      sessionId,
      text,

      // onChunk — called once per token; append to the streaming bubble
      (chunk) => {
        setMessages(prev => prev.map(m =>
          m.id === tempAiId ? { ...m, content: m.content + chunk } : m
        ))
      },

      // onDone — stream complete; replace temp ID with the real persisted UUID
      (finalId) => {
        setMessages(prev => prev.map(m =>
          m.id === tempAiId ? { ...m, id: finalId, streaming: false } : m
        ))
        setBusy(false)
      },

      // onError — remove both optimistic bubbles and surface the error
      (err) => {
        setError(err)
        setMessages(prev =>
          prev.filter(m => m.id !== tempAiId && m.id !== tempUserId)
        )
        setBusy(false)
      }
    )
  }, [sessionId, busy])

  const requestScorecard = useCallback(async () => {
    if (!sessionId || busy) return
    setError(null)
    setBusy(true)

    const { data, error } = await api.requestScorecard(sessionId)
    if (error) {
      setError(error)
    } else {
      setMessages(prev => [...prev, data])
      setSession(prev => ({ ...prev, completed: true }))
    }
    setBusy(false)
  }, [sessionId, busy])

  return { session, messages, busy, error, sendMessage, requestScorecard }
}
