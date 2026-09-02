import React from 'react'
import { Sparkles, ShieldAlert, ShieldCheck, Info, Layers } from 'lucide-react'

const toneStyle = {
  red: { bg: 'bg-red-50', fg: 'text-red-700', icon: ShieldAlert },
  amber: { bg: 'bg-amber-50', fg: 'text-amber-700', icon: ShieldAlert },
  green: { bg: 'bg-green-50', fg: 'text-green-700', icon: ShieldCheck },
  blue: { bg: 'bg-blue-50', fg: 'text-blue-700', icon: Layers },
  slate: { bg: 'bg-slate-50', fg: 'text-slate-600', icon: Info },
}

export default function AIInsightPanel({ insights, live }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 grid place-items-center shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-slate-800">AI 스마트 인사이트</h2>
            <p className="text-[11px] text-slate-400">정비업체·부품·오류율 데이터를 실시간으로 분석합니다</p>
          </div>
        </div>
        {live && (
          <span className="flex items-center gap-1 text-[10.5px] font-semibold text-purple-600 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
            분석 중
          </span>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {insights.map((item, idx) => {
          const style = toneStyle[item.tone] ?? toneStyle.slate
          const Icon = style.icon
          return (
            <div key={idx} className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 transition-colors duration-500 ${style.bg}`}>
              <Icon size={15} className={`shrink-0 mt-0.5 ${style.fg}`} />
              <p className={`text-[12.5px] leading-snug ${style.fg}`}>{item.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
