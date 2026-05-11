import { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'
import MessageBubble from './MessageBubble'

export default function SessionReplay({ sessionId }) {
  const [messages, setMessages] = useState([])
  const [status, setStatus]     = useState('loading') // 'loading' | 'error' | 'empty' | 'loaded'
  const bottomRef               = useRef(null)

  useEffect(() => {
    if (!sessionId) return
    setStatus('loading')
    setMessages([])

    api.getSession(sessionId).then(({ data, error }) => {
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
  }, [sessionId])

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
            onClick={() => {
              setStatus('loading')
              api.getSession(sessionId).then(({ data, error }) => {
                if (error || !data) { setStatus('error'); return }
                if (!data.messages || data.messages.length === 0) { setStatus('empty'); return }
                setMessages(data.messages)
                setStatus('loaded')
              })
            }}
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
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
