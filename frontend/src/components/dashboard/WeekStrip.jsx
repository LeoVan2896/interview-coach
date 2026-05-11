const STATUS_CLASS = {
  DONE:   'week-day--done',
  TODAY:  'week-day--today',
  FUTURE: 'week-day--future',
  REST:   'week-day--rest',
}

const STATUS_ICON = {
  DONE:   '✓',
  TODAY:  '●',
  FUTURE: '',
  REST:   '💤',
}

export default function WeekStrip({ weekDays }) {
  return (
    <div className="week-strip">
      {weekDays.map(day => {
        const statusClass = STATUS_CLASS[day.status] || STATUS_CLASS.FUTURE
        const icon = STATUS_ICON[day.status] || ''
        return (
          <div
            key={day.date ?? day.dayLabel}
            className={`week-day ${statusClass}`}
          >
            <div className="week-day-label">{day.dayLabel}</div>
            <div className="week-day-icon">{icon}</div>
          </div>
        )
      })}
    </div>
  )
}
