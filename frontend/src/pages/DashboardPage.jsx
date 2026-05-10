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

  const plan        = data?.plan
  const tasks       = data?.todayTasks
  const weekDays    = data?.weekDays ?? []
  const dsaProgress = data?.dsaProgress ?? []
  const stats       = data?.stats
  const globeStage  = data?.globeStage ?? 1
  const problemsDone = data?.problemsDone ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar
        title="Today's Plan"
        right={plan && (
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            color: 'var(--color-blue)',
          }}>
            Week {plan.currentWeek} of 8 · {plan.daysLeft} days left
          </div>
        )}
      />

      {error && (
        <div style={{
          margin: '12px 16px 0',
          padding: '10px 14px',
          background: '#fee2e2',
          color: '#b91c1c',
          borderRadius: 8,
          fontSize: 13,
          flexShrink: 0,
        }}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: 16, fontSize: 13, color: 'var(--color-text-faint)' }}>
          Loading…
        </div>
      )}

      {!loading && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Row 1: 3 Pillar Cards */}
          <div style={{ display: 'flex', gap: 12 }}>
            <PillarCard
              color="#3b82f6"
              icon="📖"
              label="Learning"
              badge={plan ? `Week ${plan.currentWeek}` : ''}
              title={tasks?.learning.topic ?? '--'}
              desc={tasks?.learning.desc}
              buttonLabel="Open Lesson →"
              onAction={() => {
                const id = tasks?.learning.lessonId
                navigate(id ? `/lessons/${id}` : '/lessons')
              }}
            />
            <PillarCard
              color="#8b5cf6"
              icon="⚡"
              label="LeetCode"
              badge={tasks?.leetcode.pattern}
              title={`Practice ${tasks?.leetcode.pattern ?? ''}`}
              desc={tasks?.leetcode.problems}
              buttonLabel="Practice →"
              onAction={() => navigate(`/roadmap/concept/${tasks?.leetcode.topicId}`)}
            />
            <PillarCard
              color="#10b981"
              icon="🔨"
              label="Project"
              badge={plan ? `Week ${plan.currentWeek} · Build` : ''}
              title={tasks?.project.task ?? '--'}
              desc={null}
              buttonLabel="View Schedule"
              onAction={() => navigate('/schedule')}
            />
          </div>

          {/* Row 2: Week Strip + DSA Progress | Stats + Globe */}
          <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>

            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              background: 'var(--color-surface)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              flex: 1.6,
              minWidth: 0,
              overflow: 'hidden',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                This Week
              </div>
              {weekDays.length > 0 && <WeekStrip weekDays={weekDays} />}
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                DSA Progress
              </div>
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
