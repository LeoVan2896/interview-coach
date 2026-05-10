import { Routes, Route } from 'react-router-dom'
import Shell from './components/layout/Shell'
import LessonsPage from './pages/LessonsPage'

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
        <Route path="/schedule"  element={<ComingSoon name="8-Week Schedule" />} />
        <Route path="/lessons"   element={<LessonsPage />} />
        <Route path="/practice"  element={<ComingSoon name="Interview Practice" />} />
        <Route path="/sessions"  element={<ComingSoon name="History" />} />
        <Route path="/settings"  element={<ComingSoon name="Settings" />} />
      </Routes>
    </Shell>
  )
}
