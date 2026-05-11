import { Routes, Route } from 'react-router-dom'
import Shell from './components/layout/Shell'
import DashboardPage from './pages/DashboardPage'
import LessonsPage from './pages/LessonsPage'
import LessonDetailPage from './pages/LessonDetailPage'
import SchedulePage from './pages/SchedulePage'
import DsaRoadmapPage from './pages/DsaRoadmapPage'
import DsaConceptPage from './pages/DsaConceptPage'
import TopicSelector from './components/TopicSelector'
import QuestionList from './components/QuestionList'
import InterviewChat from './components/InterviewChat'
import SessionHistory from './components/SessionHistory'

function ScrollPage({ children }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#080c12' }}>
      <div className="app-main">{children}</div>
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
        <Route path="/"                              element={<DashboardPage />} />
        <Route path="/roadmap"                       element={<DsaRoadmapPage />} />
        <Route path="/roadmap/concept/:topicId"      element={<DsaConceptPage />} />
        <Route path="/schedule"                      element={<SchedulePage />} />
        <Route path="/lessons"                       element={<LessonsPage />} />
        <Route path="/lessons/:id"                   element={<LessonDetailPage />} />
        <Route path="/practice"                      element={<ScrollPage><TopicSelector /></ScrollPage>} />
        <Route path="/practice/questions/:topic"     element={<ScrollPage><QuestionList /></ScrollPage>} />
        <Route path="/practice/interview/:sessionId" element={<InterviewChat />} />
        <Route path="/sessions"                      element={<ScrollPage><SessionHistory /></ScrollPage>} />
        <Route path="/settings"                      element={<ComingSoon name="Settings" />} />
      </Routes>
    </Shell>
  )
}
