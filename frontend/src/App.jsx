import { Routes, Route, useLocation } from 'react-router-dom'
import Shell from './components/layout/Shell'
import LessonsPage from './pages/LessonsPage'
import LessonDetailPage from './pages/LessonDetailPage'
import SchedulePage from './pages/SchedulePage'

function PracticePage() {
  const location = useLocation()
  const state = location.state
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', background: '#fff' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)' }}>🎯 Interview Practice</div>
        {state?.lessonTitle && (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Topic: <strong>{state.lessonTitle}</strong>
          </div>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#94a3b8' }}>
        <div style={{ fontSize: 40 }}>🚧</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#475569' }}>Interview Practice</div>
        <div style={{ fontSize: 13 }}>Full mock interview coming in the next phase</div>
        {state?.lessonTitle && (
          <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600, background: '#eff6ff', padding: '6px 14px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
            Ready to practice: {state.lessonTitle}
          </div>
        )}
      </div>
    </div>
  )
}

function ComingSoon({ name }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12, color: '#94a3b8' }}>
      <div style={{ fontSize: 40 }}>🚧</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#475569' }}>{name}</div>
      <div style={{ fontSize: 13 }}>Coming in the next phase</div>
    </div>
  )
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/"          element={<ComingSoon name="Today's Plan" />} />
        <Route path="/roadmap"   element={<ComingSoon name="DSA Roadmap" />} />
        <Route path="/schedule"  element={<SchedulePage />} />
        <Route path="/lessons"   element={<LessonsPage />} />
        <Route path="/lessons/:id" element={<LessonDetailPage />} />
        <Route path="/practice"  element={<PracticePage />} />
        <Route path="/sessions"  element={<ComingSoon name="History" />} />
        <Route path="/settings"  element={<ComingSoon name="Settings" />} />
      </Routes>
    </Shell>
  )
}
