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

  const sendMessage = useCallback(async (text) => {
    if (!sessionId || busy) return
    setError(null)
    setBusy(true)

    // Optimistic update: show the user's message immediately while waiting for AI
    const tempId = `temp-${Date.now()}`
    const userMsg = { id: tempId, role: 'USER', content: text }
    setMessages(prev => [...prev, userMsg])

    const { data, error } = await api.sendMessage(sessionId, text)

    if (error) {
      setError(error)
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } else {
      // Swap temp message for confirmed, then append AI reply
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { ...userMsg, id: Date.now() },
        data
      ])
    }
    setBusy(false)
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
