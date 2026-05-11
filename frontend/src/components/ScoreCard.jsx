/** Parse AI scorecard text into structured data.
 *  Returns null if the content doesn't match the expected format.
 */
function parseScorecard(content) {
  if (!content?.includes('INTERVIEW SCORECARD')) return null

  const lines = content.split('\n').map(l => l.trim())

  // Matches: "Category Name   [7/10] — some note"
  const scoreRe   = /^(.+?)\s+\[(\d+)\/(\d+)\]\s*[—–-]\s*(.+)$/
  // Matches: "TOTAL   [30/50]"
  const totalRe   = /^TOTAL\s+\[(\d+)\/(\d+)\]/
  // Matches section headers that start with one of the five feedback emojis
  const sectionRe = /^(✅|⚠️|🔴|💡|🔗)\s+(.+)$/u

  const scores   = []
  let   total    = null
  const sections = []
  let   cur      = null   // current section being accumulated

  for (const line of lines) {
    // Skip separator lines and the title line
    if (/^[━─═\s]+$/.test(line) || line.includes('INTERVIEW SCORECARD')) continue

    // Section header?
    const secMatch = line.match(sectionRe)
    if (secMatch) {
      cur = { emoji: secMatch[1], title: secMatch[2], lines: [] }
      sections.push(cur)
      continue
    }

    // Total line? (check before section accumulation)
    const totMatch = line.match(totalRe)
    if (totMatch) {
      total = { score: +totMatch[1], max: +totMatch[2] }
      continue
    }

    // Score row? (check before section accumulation)
    const rowMatch = line.match(scoreRe)
    if (rowMatch) {
      scores.push({
        label: rowMatch[1].trim(),
        score: +rowMatch[2],
        max:   +rowMatch[3],
        note:  rowMatch[4].trim(),
      })
      continue
    }

    // Inside a section — accumulate remaining lines into body
    if (cur) {
      cur.lines.push(line)
    }
  }

  // Flatten accumulated section lines to a single body string
  sections.forEach(s => { s.body = s.lines.join('\n').trim() })

  if (scores.length === 0 && !total) return null
  return { scores, total, sections }
}

/** Return a CSS color token string based on score percentage */
function scoreColor(score, max) {
  const pct = max > 0 ? score / max : 0
  if (pct >= 0.75) return 'var(--success)'
  if (pct >= 0.5)  return 'var(--warning)'
  return 'var(--error)'
}

export default function ScoreCard({ content }) {
  const parsed = parseScorecard(content)

  // Fallback: unrecognised format → raw pre block (backward-compat)
  if (!parsed) {
    return (
      <div className="scorecard-bubble">
        <pre className="scorecard-content">{content}</pre>
      </div>
    )
  }

  const { scores, total, sections } = parsed

  return (
    <div className="scorecard-card">

      {/* ── Header: title + total badge ── */}
      <div className="scorecard-header">
        <div className="scorecard-title">
          <span aria-hidden="true">📊</span>
          <span>Interview Scorecard</span>
        </div>
        {total && (
          <div
            className="scorecard-total-badge"
            style={{ color: scoreColor(total.score, total.max) }}
          >
            {total.score}<span className="scorecard-total-max">/{total.max}</span>
          </div>
        )}
      </div>

      {/* ── Score rows ── */}
      {scores.length > 0 && (
        <div className="scorecard-scores">
          {scores.map((row) => (
            <div key={row.label} className="scorecard-row">
              <div className="scorecard-row-top">
                <span className="scorecard-label">{row.label}</span>
                <span
                  className="scorecard-score-text"
                  style={{ color: scoreColor(row.score, row.max) }}
                >
                  {row.score}/{row.max}
                </span>
              </div>
              <div className="scorecard-bar-track">
                <div
                  className="scorecard-bar-fill"
                  style={{
                    width:      `${(row.score / row.max) * 100}%`,
                    background: scoreColor(row.score, row.max),
                  }}
                />
              </div>
              {row.note && <p className="scorecard-note">{row.note}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ── Feedback sections ── */}
      {sections.length > 0 && (
        <div className="scorecard-sections">
          {sections.map((sec) => (
            <div key={sec.emoji + sec.title} className="scorecard-section">
              <div className="scorecard-section-title">
                {sec.emoji} {sec.title}
              </div>
              {sec.body && <p className="scorecard-section-body">{sec.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
