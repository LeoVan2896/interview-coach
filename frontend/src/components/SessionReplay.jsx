import { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'
import MessageBubble from './MessageBubble'

export default function SessionReplay({ sessionId }) {
  const [messages, setMessages]   = useState([])
  const [status, setStatus]       = useState('loading') // 'loading' | 'error' | 'empty' | 'loaded'
  // retryCount bumped by the Retry button so the effect below re-runs without duplicating fetch logic
  const [retryCount, setRetryCount] = useState(0)
  const bottomRef                 = useRef(null)

  useEffect(() => {
    if (!sessionId) return
    // Cancellation flag: if the component unmounts or sessionId changes while the
    // fetch is in-flight, the .then callback sees cancelled=true and bails out,
    // preventing setState on a stale/unmounted component instance.
    let cancelled = false
    setStatus('loading')
    setMessages([])

    api.getSession(sessionId).then(({ data, error }) => {
      if (cancelled) return
      if (error || !data) {
        setStatus('error')
        return
      }
      if (!data.messages || data.messages.length === 0) {
        setStatus('empty')
        return
      }
      setMessages(data.messages)
      setStatus('loaded')
    })
    return () => { cancelled = true }
  }, [sessionId, retryCount])

  // Auto-scroll to bottom once messages are loaded
  useEffect(() => {
    if (status === 'loaded' && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'instant' })
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="replay-container">
        <div className="replay-loading">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="replay-container">
        <div className="replay-empty">
          <p>Failed to load session.</p>
          <button
            className="btn btn-secondary"
            onClick={() => setRetryCount(c => c + 1)}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div className="replay-container">
        <div className="replay-empty">
          <p>No messages in this session.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="replay-container">
      {messages.map((msg, i) => (
        // msg.id ?? i: prefer stable server ID; fall back to index only when id is absent
        <MessageBubble key={msg.id ?? i} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
