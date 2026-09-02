import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

export default function PartsBarChart({ data }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-100 p-4 flex flex-col overflow-hidden h-full">
      <h2 className="text-[14px] font-bold text-slate-800 mb-2">부품구분별 현황</h2>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 46, left: 4, bottom: 4 }}
          barCategoryGap={26}
        >
          <CartesianGrid horizontal={false} stroke="#eef1f5" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12.5, fill: '#475569', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            cursor={{ fill: '#f8fafc' }}
            formatter={(value, _n, item) => [`${value.toLocaleString()}건 (${item.payload.ratio}%)`, item.payload.name]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={30} isAnimationActive animationDuration={600}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              content={({ x, y, width, height, index }) => {
                const item = data[index]
                return (
                  <text
                    x={x + width + 8}
                    y={y + height / 2}
                    dy={4}
                    fontSize={12}
                    fontWeight={600}
                    fill="#475569"
                  >
                    {`${item.ratio}% (${item.count.toLocaleString()}건)`}
                  </text>
                )
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
