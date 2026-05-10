import { useState } from 'react'
import { TOPICS, TOTAL_PROBLEMS } from '../data/dsaData'

const NODE_HEIGHT = 44
const CANVAS_W = 680
const CANVAS_H = 710
const LS_KEY = 'dsa_progress'

const TOPIC_MAP = Object.fromEntries(TOPICS.map(t => [t.id, t]))

const ARROW_LINES = []
TOPICS.forEach(src => {
  const srcCx = src.pos.left + src.width / 2
  const srcBot = src.pos.top + NODE_HEIGHT
  src.edges.forEach(dstId => {
    const dst = TOPIC_MAP[dstId]
    if (!dst) return
    const dstCx = dst.pos.left + dst.width / 2
    const dstTop = dst.pos.top
    ARROW_LINES.push({ x1: srcCx, y1: srcBot, x2: dstCx, y2: dstTop })
  })
})

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
  catch { return {} }
}

export default function DsaRoadmapPage() {
  const [selectedId, setSelectedId] = useState(null)
  const [progress, setProgress] = useState(loadProgress)

  const selectedTopic = selectedId ? TOPIC_MAP[selectedId] : null
  const totalSolved = Object.keys(progress).length

  function selectTopic(id) {
    setSelectedId(prev => (prev === id ? null : id))
  }

  function toggleProblem(problemId) {
    setProgress(prev => {
      const next = { ...prev }
      if (next[problemId]) delete next[problemId]
      else next[problemId] = true
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }

  const overallPct = TOTAL_PROBLEMS > 0 ? (totalSolved / TOTAL_PROBLEMS) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0d1117', color: '#c9d1d9' }}>

      {/* NAV BAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '9px 16px', background: '#161b22', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
        <span style={{ fontSize: 16 }}>🗺️</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f6fc' }}>DSA Roadmap</span>
        <span style={{ fontSize: 12, color: '#8b949e' }}>NeetCode 150</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#8b949e' }}>{totalSolved} / {TOTAL_PROBLEMS} solved</span>
        <div style={{ width: 120, height: 4, background: '#21262d', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${overallPct}%`, height: '100%', background: '#388bfd', borderRadius: 99, transition: 'width .3s' }} />
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* GRAPH AREA */}
        <div style={{ flex: 1, overflow: 'auto', background: '#0d1117', position: 'relative' }}>
          <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, margin: '20px auto' }}>

            {/* SVG arrows */}
            <svg
              style={{ position: 'absolute', inset: 0, width: CANVAS_W, height: CANVAS_H, pointerEvents: 'none' }}
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            >
              <defs>
                <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                  <polygon points="0 0, 7 3.5, 0 7" fill="#3b5bdb" opacity=".75" />
                </marker>
              </defs>
              <g stroke="#3b5bdb" strokeWidth="1.5" fill="none" opacity=".7" markerEnd="url(#arr)">
                {ARROW_LINES.map((ln, i) => (
                  <line key={i} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} />
                ))}
              </g>
            </svg>

            {/* Topic nodes */}
            {TOPICS.map(topic => {
              const solvedCount = topic.problems.filter(p => progress[p.id]).length
              const total = topic.problems.length
              const pct = total > 0 ? (solvedCount / total) * 100 : 0
              const isDone = solvedCount === total && total > 0
              const isSelected = selectedId === topic.id

              let bg = 'linear-gradient(180deg, #1c2d6b 0%, #1a2860 100%)'
              let border = '#2d4ba0'
              let boxShadow = 'none'
              if (isDone) { bg = 'linear-gradient(180deg, #0f3622 0%, #0d2f1d 100%)'; border = '#238636' }
              if (isSelected) { bg = 'linear-gradient(180deg, #1d3d8f 0%, #1a3580 100%)'; border = '#58a6ff'; boxShadow = '0 0 0 3px rgba(88,166,255,.25)' }

              return (
                <div
                  key={topic.id}
                  onClick={() => selectTopic(topic.id)}
                  style={{
                    position: 'absolute',
                    left: topic.pos.left,
                    top: topic.pos.top,
                    width: topic.width,
                    background: bg,
                    border: `1px solid ${border}`,
                    boxShadow,
                    borderRadius: 8,
                    padding: '9px 12px 8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'border-color .15s, box-shadow .15s',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ fontSize: topic.width < 148 ? 10.5 : 11.5, fontWeight: 600, color: '#c9d1d9', whiteSpace: 'nowrap' }}>
                    {topic.label}
                  </div>
                  <div style={{ marginTop: 6, height: 3, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(255,255,255,.4)', borderRadius: 99, transition: 'width .3s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: 400, flexShrink: 0, background: '#161b22', borderLeft: '1px solid #21262d', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedTopic ? (
            <RightPanel
              topic={selectedTopic}
              progress={progress}
              onClose={() => setSelectedId(null)}
              onToggle={toggleProblem}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: '#8b949e' }}>
              <div style={{ fontSize: 28 }}>🗺️</div>
              <div style={{ fontSize: 13 }}>Select a topic to see problems</div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function RightPanel({ topic, progress, onClose, onToggle }) {
  const solvedCount = topic.problems.filter(p => progress[p.id]).length
  const total = topic.problems.length
  const pct = total > 0 ? (solvedCount / total) * 100 : 0

  return (
    <>
      {/* Panel header */}
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #21262d', flexShrink: 0, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 700, color: '#8b949e', background: '#21262d', border: '1px solid #30363d', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}
        >
          ESC
        </button>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#f0f6fc', marginBottom: 4 }}>{topic.label}</div>
        <div style={{ fontSize: 12, color: '#8b949e', textAlign: 'center', marginBottom: 6 }}>({solvedCount} / {total})</div>
        <div style={{ height: 4, background: '#21262d', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#388bfd', borderRadius: 99, transition: 'width .3s' }} />
        </div>
      </div>

      {/* Prerequisites */}
      <div style={{ padding: '10px 18px 12px', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>
          Prerequisites
        </div>
        {topic.prereqs.length === 0 ? (
          <div style={{ fontSize: 12, color: '#8b949e', fontStyle: 'italic' }}>None — this is a starting topic</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 6px' }}>
            {topic.prereqs.map(prereq => (
              <div key={prereq} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 13, height: 13, border: '1px solid #30363d', borderRadius: 3, background: '#0d1117', flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#c9d1d9' }}>{prereq}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Problem table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '34px 34px 1fr 76px 52px', padding: '7px 12px', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, background: '#161b22', zIndex: 2 }}>
          {['Status', 'Star', 'Problem', 'Difficulty', 'Solution'].map((h, i) => (
            <div key={h} style={{ fontSize: 10.5, fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '.5px', textAlign: i !== 2 ? 'center' : 'left' }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {topic.problems.map(prob => {
          const done = !!progress[prob.id]
          const diffColor = prob.difficulty === 'Easy' ? '#3fb950' : prob.difficulty === 'Medium' ? '#d29922' : '#f85149'
          return (
            <div
              key={prob.id}
              style={{ display: 'grid', gridTemplateColumns: '34px 34px 1fr 76px 52px', padding: '8px 12px', borderBottom: '1px solid rgba(33,38,45,.8)', alignItems: 'center', cursor: 'pointer', transition: 'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              {/* Checkbox */}
              <div
                onClick={() => onToggle(prob.id)}
                style={{ width: 14, height: 14, border: done ? 'none' : '1px solid #30363d', borderRadius: 3, background: done ? '#238636' : '#0d1117', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                {done && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
              </div>

              {/* Star */}
              <div style={{ textAlign: 'center', fontSize: 13, color: '#e3b341', opacity: .35 }}>★</div>

              {/* Problem name + link */}
              <div style={{ fontSize: 12.5, color: '#c9d1d9', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                <a
                  href={prob.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#c9d1d9', textDecoration: 'none', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#388bfd'}
                  onMouseLeave={e => e.currentTarget.style.color = '#c9d1d9'}
                >
                  {prob.title}
                </a>
                <span style={{ fontSize: 10, color: '#8b949e', flexShrink: 0 }}>↗</span>
              </div>

              {/* Difficulty */}
              <div style={{ fontSize: 11.5, fontWeight: 600, textAlign: 'center', color: diffColor }}>{prob.difficulty}</div>

              {/* Solution placeholder */}
              <div style={{ textAlign: 'center', fontSize: 14, color: '#30363d', cursor: 'pointer' }}>📄</div>
            </div>
          )
        })}
      </div>
    </>
  )
}
