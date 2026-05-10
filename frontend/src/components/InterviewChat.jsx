import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useInterview } from '../hooks/useInterview'
import MessageBubble from './MessageBubble'
import ProtocolBar from './ProtocolBar'

export default function InterviewChat() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { session, messages, busy, error, sendMessage, requestScorecard } = useInterview(sessionId)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  async function handleSend() {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    textareaRef.current?.focus()
    await sendMessage(text)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!session && !error) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading session...</p>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="error-screen">
        <p className="error-text">⚠️ {error}</p>
        <Link to="/" className="btn btn-primary">Back to Topics</Link>
      </div>
    )
  }

  return (
    <div className="chat-page">
      {/* ── Top bar ── */}
      <div className="chat-header">
        <button className="btn-back" onClick={() => navigate('/')} title="Back to topics">←</button>
        <div className="chat-header-info">
          <span className="chat-topic-badge">{session?.topicLabel}</span>
          <p className="chat-question" title={session?.questionText}>
            {session?.questionText}
          </p>
        </div>
        <button
          className="btn btn-scorecard"
          onClick={requestScorecard}
          disabled={busy || messages.length < 2 || session?.completed}
          title={session?.completed ? 'Session completed' : 'Request final scorecard'}
        >
          📊 Scorecard
        </button>
      </div>

      {/* ── Phase tracker ── */}
      <ProtocolBar messages={messages} questionType={session?.questionType} />

      {/* ── Messages ── */}
      <div className="chat-messages">
        {messages.length === 0 && !busy && (
          <div className="chat-welcome">
            <div className="welcome-icon">🎯</div>
            <h3>Ready when you are</h3>
            <p>
              Remember: <strong>start with clarifying questions</strong>, not your answer.
              The AI will guide you through all 5 phases.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id ?? i} message={msg} />
        ))}

        {busy && (
          <div className="thinking-indicator" aria-label="AI is thinking">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}

        {error && (
          <div className="error-bubble">⚠️ {error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your response… (Enter to send, Shift+Enter for newline)"
          rows={3}
          disabled={busy || session?.completed}
        />
        <button
          className="btn btn-send"
          onClick={handleSend}
          disabled={busy || !input.trim() || session?.completed}
        >
          Send
        </button>
      </div>
    </div>
  )
}
