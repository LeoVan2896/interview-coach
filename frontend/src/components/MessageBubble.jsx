import ScoreCard from './ScoreCard'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'USER'
  const isScorecard = message.content?.includes('INTERVIEW SCORECARD')

  if (isScorecard) {
    return <ScoreCard content={message.content} />
  }

  return (
    <div className={`message-bubble ${isUser ? 'message-user' : 'message-ai'}`}>
      <div className="message-role">{isUser ? 'You' : '🤖 Interviewer'}</div>
      <div className="message-content">{message.content}</div>
    </div>
  )
}
