const PHASES = {
  coding: [
    { id: 1, label: '① Understand' },
    { id: 2, label: '② Design' },
    { id: 3, label: '③ Implement' },
    { id: 4, label: '④ Test' },
    { id: 5, label: '⑤ Optimize' },
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
      // Step 5 — Optimize: AI suggests improvements or asks for better solution
      if (last.includes('optimiz') || last.includes('better solution') || last.includes('improve') || last.includes('can you do better')) return 5
      // Step 4 — Test: AI asks for manual trace / walkthrough
      if (last.includes('trace through') || last.includes('walk me through') || last.includes('walk through it') || last.includes('concrete example') || last.includes('edge case')) return 4
      // Step 3 — Implement: AI asks for code / implementation
      if (last.includes('implement') || last.includes('write the code') || last.includes('write a') || last.includes('code it') || last.includes('let\'s code')) return 3
      // Step 2 — Design: AI asks for approach / algorithm
      if (last.includes('design') || last.includes('approach') || last.includes('algorithm') || last.includes('data structure') || last.includes('solution design')) return 2
      // Step 1 — Understand (default)
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
