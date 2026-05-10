// frontend/src/pages/SchedulePage.jsx
import { useState } from 'react'
import Topbar from '../components/layout/Topbar'
import WeekSelector from '../components/schedule/WeekSelector'
import DailyTable from '../components/schedule/DailyTable'
import { useSchedule, useWeekDetail } from '../hooks/useSchedule'

export default function SchedulePage() {
  const [selectedWeekNum, setSelectedWeekNum] = useState(1)

  const { weeks, loading: weeksLoading, error: weeksError } = useSchedule()
  const { weekDetail, loading: detailLoading, error: detailError } = useWeekDetail(selectedWeekNum)

  const activeWeek = weeks.find(w => w.weekNum === selectedWeekNum)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar
        title="8-Week Schedule"
        subtitle={activeWeek ? `Week ${activeWeek.weekNum}: ${activeWeek.theme}` : ''}
        right={
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            color: 'var(--color-blue)',
          }}>
            Week {selectedWeekNum} of 8
          </div>
        }
      />

      {weeksLoading && (
        <div style={{ padding: 16, fontSize: 13, color: 'var(--color-text-faint)' }}>
          Loading weeks…
        </div>
      )}

      {weeksError && (
        <div style={{ margin: 16, padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
          ⚠ {weeksError}
        </div>
      )}

      {!weeksLoading && weeks.length > 0 && (
        <WeekSelector
          weeks={weeks}
          activeWeekNum={selectedWeekNum}
          onSelect={setSelectedWeekNum}
        />
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <DailyTable
          weekDetail={weekDetail}
          loading={detailLoading}
          error={detailError}
        />
      </div>
    </div>
  )
}
