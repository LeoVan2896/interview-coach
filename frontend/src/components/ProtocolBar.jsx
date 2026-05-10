const PHASES = {
  coding: [
    { id: 1, label: '① Clarify' },
    { id: 2, label: '② Approach' },
    { id: 3, label: '③ Solve' },
    { id: 4, label: '④ Trace' },
    { id: 5, label: '⑤ Score' },
  ],
  behavioral: [
    { id: 1, label: '① Situation' },
    { id: 2, label: '② Task' },
    { id: 3, label: '③ Action' },
    { id: 4, label: '④ Result' },
    { id: 5, label: '⑤ Score' },
  ],
  design: [
    { id: 1, label: '① Requirements' },
    { id: 2, label: '② Design' },
    { id: 3, label: '③ Deep Dive' },
    { id: 4, label: '④ Trade-offs' },
    { id: 5, label: '⑤ Score' },
  ],
  conceptual: [
    { id: 1, label: '① Define' },
    { id: 2, label: '② Mechanics' },
    { id: 3, label: '③ Example' },
    { id: 4, label: '④ Trade-offs' },
    { id: 5, label: '⑤ Score' },
  ],
}

function detectPhase(messages, questionType) {
  const aiTexts = messages
    .filter(m => m.role === 'ASSISTANT')
    .map(m => m.content?.toLowerCase() ?? '')
  const last = aiTexts[aiTexts.length - 1] ?? ''

  if (last.includes('interview scorecard')) return 5

  switch (questionType) {
    case 'coding':
      if (last.includes('trace through') || last.includes('example input')) return 4
      if (last.includes('walk me through your approach') || last.includes('naive solution')) return 3
      if (last.includes('good') && last.includes('clarif')) return 2
      return 1

    case 'behavioral':
      if (last.includes('impact') || last.includes('differently')) return 4
      if (last.includes('what did you do') || last.includes('personally')) return 3
      if (last.includes('your role') || last.includes('responsibility')) return 2
      return 1

    case 'design':
      if (last.includes('weakness') || last.includes('trade-off') || last.includes('differently')) return 4
      if (last.includes('schema') || last.includes('deep dive') || last.includes('walk me through')) return 3
      if (last.includes('components') || last.includes('high-level')) return 2
      return 1

    case 'conceptual':
      if (last.includes('when would you not') || last.includes('alternative')) return 4
      if (last.includes('used this') || last.includes('at work') || last.includes('project')) return 3
      if (last.includes('under the hood') || last.includes('step by step')) return 2
      return 1

    default:
      return 1
  }
}

export default function ProtocolBar({ messages, questionType }) {
  const type = questionType?.toLowerCase() ?? 'conceptual'
  const phases = PHASES[type] ?? PHASES.conceptual
  const current = detectPhase(messages, type)

  return (
    <div className="protocol-bar">
      {phases.map(phase => (
        <div
          key={phase.id}
          className={[
            'protocol-step',
            phase.id === current ? 'active' : '',
            phase.id < current ? 'done' : '',
          ].join(' ')}
        >
          {phase.label}
        </div>
      ))}
    </div>
  )
}
