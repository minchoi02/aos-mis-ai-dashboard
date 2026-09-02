import React, { useEffect, useState } from 'react'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function format(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const w = WEEKDAYS[date.getDay()]
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return { dateLabel: `${y}년 ${m}월 ${d}일 (${w})`, timeLabel: `${hh}:${mm}:${ss}` }
}

export default function LiveClock({ className = '', timeClassName = '', dateClassName = '' }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const { dateLabel, timeLabel } = format(now)

  return (
    <div className={className}>
      <p className={timeClassName || 'text-[26px] font-bold tabular-nums'}>{timeLabel}</p>
      <p className={dateClassName || 'text-[12.5px] opacity-80'}>{dateLabel}</p>
    </div>
  )
}
