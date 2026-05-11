import { useNavigate } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'
import PillarCard from '../components/dashboard/PillarCard'
import WeekStrip from '../components/dashboard/WeekStrip'
import DsaProgressList from '../components/dashboard/DsaProgressList'
import StatsCard from '../components/dashboard/StatsCard'
import { useDashboard } from '../hooks/useDashboard'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, loading, error } = useDashboard()

  const plan         = data?.plan
  const tasks        = data?.todayTasks
  const weekDays     = data?.weekDays ?? []
  const dsaProgress  = data?.dsaProgress ?? []
  const stats        = data?.stats
  const globeStage   = data?.globeStage ?? 1
  const problemsDone = data?.problemsDone ?? 0

  return (
    <div className="dashboard-page">
      <Topbar
        title="Today's Plan"
        right={plan && (
          <div className="topbar-week-badge">
            Week {plan.currentWeek} of 8 · {plan.daysLeft} days left
          </div>
        )}
      />

      {error && (
        <div className="dashboard-error">⚠ {error}</div>
      )}

      {loading && (
        <div className="dashboard-loading">Loading…</div>
      )}

      {!loading && !error && (
        <div className="dashboard-body">

          {/* Row 1: 3 Pillar Cards */}
          <div className="dashboard-pillar-row">
            <PillarCard
              color="#3b82f6"
              icon="📖"
              label="Learning"
              badge={plan ? `Week ${plan.currentWeek}` : ''}
              title={tasks?.learning?.topic ?? '--'}
              desc={tasks?.learning?.desc}
              buttonLabel="Open Lesson →"
              onAction={() => {
                const id = tasks?.learning?.lessonId
                navigate(id ? `/lessons/${id}` : '/lessons')
              }}
            />
            <PillarCard
              color="#8b5cf6"
              icon="⚡"
              label="LeetCode"
              badge={tasks?.leetcode?.pattern}
              title={`Practice ${tasks?.leetcode?.pattern ?? ''}`}
              desc={tasks?.leetcode?.problems}
              buttonLabel="Practice →"
              onAction={() => navigate(tasks?.leetcode?.topicId ? `/roadmap/concept/${tasks.leetcode.topicId}` : '/roadmap')}
            />
            <PillarCard
              color="#10b981"
              icon="🔨"
              label="Project"
              badge={plan ? `Week ${plan.currentWeek} · Build` : ''}
              title={tasks?.project?.task ?? '--'}
              desc={null}
              buttonLabel="View Schedule"
              onAction={() => navigate('/schedule')}
            />
          </div>

          {/* Row 2: Week Strip + DSA Progress | Stats + Globe */}
          <div className="dashboard-lower-row">
            <div className="dashboard-week-panel">
              <div className="dashboard-panel-label">This Week</div>
              {weekDays.length > 0 && <WeekStrip weekDays={weekDays} />}
              <div className="dashboard-panel-label">DSA Progress</div>
              <DsaProgressList dsaProgress={dsaProgress} />
            </div>

            <StatsCard
              lessonsDone={stats?.lessonsDone}
              problemsDone={problemsDone}
              sessionsDone={stats?.sessionsDone}
              daysLeft={stats?.daysLeft}
              globeStage={globeStage}
            />
          </div>
        </div>
      )}
    </div>
  )
}
