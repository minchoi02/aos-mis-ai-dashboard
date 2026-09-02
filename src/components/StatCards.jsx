import React from 'react'
import { ClipboardList, CheckCircle2, Clock, CheckCheck, AlertCircle } from 'lucide-react'

const CARD_DEFS = [
  { key: 'total', label: '전체 접수', icon: ClipboardList, tone: 'slate' },
  { key: 'received', label: '수신완료', icon: CheckCircle2, tone: 'green' },
  { key: 'processing', label: '처리중', icon: Clock, tone: 'amber' },
  { key: 'done', label: '처리완료', icon: CheckCheck, tone: 'blue' },
  { key: 'error', label: '오류', icon: AlertCircle, tone: 'red' },
]

const toneMap = {
  slate: { bg: 'bg-slate-100', fg: 'text-slate-600' },
  green: { bg: 'bg-green-50', fg: 'text-green-600' },
  amber: { bg: 'bg-amber-50', fg: 'text-amber-500' },
  blue: { bg: 'bg-blue-50', fg: 'text-blue-600' },
  red: { bg: 'bg-red-50', fg: 'text-red-500' },
}

export default function StatCards({ stats, changedKeys }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
      {CARD_DEFS.map((def) => {
        const Icon = def.icon
        const tone = toneMap[def.tone]
        const value = stats[def.key]
        const changed = changedKeys?.has(def.key)
        const percent = def.key === 'total' ? null : +((value / stats.total) * 100).toFixed(1)

        return (
          <div
            key={def.key}
            className={`bg-white rounded-xl shadow-card border p-4 flex items-center gap-3.5 transition-colors duration-700 ${
              changed ? 'border-blue-300 bg-blue-50/50' : 'border-slate-100'
            }`}
          >
            <div className={`h-11 w-11 rounded-full grid place-items-center shrink-0 ${tone.bg} ${tone.fg}`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[12.5px] text-slate-500 font-medium">{def.label}</p>
              <p className="text-[19px] font-bold text-slate-800 leading-tight tabular-nums">
                {value.toLocaleString()}
                <span className="text-[12.5px] font-semibold text-slate-400 ml-1">건</span>
              </p>
              <p className="text-[11.5px] font-semibold text-slate-400 tabular-nums">
                {def.key === 'total' ? '실시간 집계 중' : `${percent}%`}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
