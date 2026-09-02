import React, { useState } from 'react'
import {
  LayoutDashboard,
  ClipboardList,
  Send,
  Wrench,
  Package,
  Car,
  BarChart3,
  Settings,
  ChevronDown,
  ScanLine,
} from 'lucide-react'

const menuData = [
  {
    key: 'dashboard',
    label: '대시보드',
    icon: LayoutDashboard,
    standalone: true,
  },
  {
    key: 'aos',
    label: 'AOS 접수 관리',
    icon: ClipboardList,
    children: ['접수 목록', '접수 등록', '오류 재전송'],
  },
  {
    key: 'transfer',
    label: '전송 관리',
    icon: Send,
    children: ['전송 현황', '전송 이력'],
  },
  {
    key: 'shop',
    label: '정비업체 관리',
    icon: Wrench,
    children: ['업체 목록', '업체 관리'],
  },
  {
    key: 'part',
    label: '부품 관리',
    icon: Package,
    children: ['부품 목록', '부품 통계'],
  },
  {
    key: 'car',
    label: '차량 관리',
    icon: Car,
    children: ['차량 목록', '차량 통계'],
  },
  {
    key: 'stats',
    label: '통계 / 분석 (MIS)',
    icon: BarChart3,
    children: ['일별 통계', '월별 통계', '업체별 통계', '부품별 통계'],
  },
  {
    key: 'system',
    label: '시스템 관리',
    icon: Settings,
    children: ['사용자 관리', '환경 설정'],
  },
]

export default function Sidebar({ collapsed }) {
  const [openKeys, setOpenKeys] = useState(['aos', 'stats'])
  const [activeChild, setActiveChild] = useState('접수 목록')
  const [activeStandalone, setActiveStandalone] = useState('dashboard')

  const toggle = (key) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }

  return (
    <aside
      className={`${
        collapsed ? 'w-0 -translate-x-full lg:translate-x-0 lg:w-[76px]' : 'w-[248px]'
      } shrink-0 h-screen sticky top-0 bg-[#0f172a] text-slate-200 flex flex-col transition-all duration-200 overflow-hidden`}
    >
      <div className="flex items-center gap-2.5 h-[60px] px-5 border-b border-white/10 shrink-0">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <ScanLine size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="leading-tight overflow-hidden whitespace-nowrap">
            <p className="text-[13px] font-bold text-white">AOS 연계 MIS</p>
            <p className="text-[11px] text-slate-400">업무 관리 시스템</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {menuData.map((item) => {
          const Icon = item.icon
          if (item.standalone) {
            const active = activeStandalone === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActiveStandalone(item.key)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            )
          }

          const isOpen = openKeys.includes(item.key)
          return (
            <div key={item.key}>
              <button
                onClick={() => toggle(item.key)}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Icon size={17} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </>
                )}
              </button>
              {!collapsed && isOpen && (
                <div className="mt-1 ml-[34px] space-y-0.5 border-l border-white/10 pl-3">
                  {item.children.map((child) => {
                    const active = activeChild === child
                    return (
                      <button
                        key={child}
                        onClick={() => setActiveChild(child)}
                        className={`block w-full text-left rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                          active
                            ? 'text-white font-semibold bg-white/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {child}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
