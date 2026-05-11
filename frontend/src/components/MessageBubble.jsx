import ScoreCard from './ScoreCard'

export default function MessageBubble({ message }) {
  const isUser      = message.role === 'USER'
  const isStreaming = message.streaming === true
  // Don't render the scorecard widget until streaming is complete — partial
  // scorecard content would break the ASCII art layout mid-stream.
  const isScorecard = !isStreaming && message.content?.includes('INTERVIEW SCORECARD')

  if (isScorecard) {
    return <ScoreCard content={message.content} />
  }

  return (
    <div className={`message-bubble ${isUser ? 'message-user' : 'message-ai'}`}>
      <div className="message-role">{isUser ? 'You' : '🤖 Interviewer'}</div>
      <div className="message-content">
        {message.content}
        {/* Blinking cursor visible while tokens are still arriving */}
        {isStreaming && <span className="streaming-cursor" aria-hidden="true" />}
      </div>
    </div>
  )
}
