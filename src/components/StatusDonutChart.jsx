import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function StatusDonutChart({ data }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-100 p-4 flex flex-col overflow-hidden h-full">
      <h2 className="text-[14px] font-bold text-slate-800 mb-1">상태별 비율</h2>
      <div className="flex-1 flex items-center gap-2">
        <div className="w-[130px] h-[190px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
                stroke="none"
                isAnimationActive
                animationDuration={600}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2.5">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[12.5px]">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-semibold text-slate-800 tabular-nums">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
