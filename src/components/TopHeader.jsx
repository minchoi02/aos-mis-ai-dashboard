import React, { useState } from 'react'
import { Menu, Bell, UserCircle2, RefreshCw, Radio, LogOut, ChevronDown } from 'lucide-react'

function timeAgo(date) {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (sec < 5) return '방금 전'
  if (sec < 60) return `${sec}초 전`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}분 전`
  return `${Math.floor(min / 60)}시간 전`
}

const toneDot = {
  new: 'bg-blue-500',
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-slate-400',
  'ai-alert': 'bg-purple-500',
}

export default function TopHeader({ onToggleSidebar, title, live, onToggleLive, onRefresh, events, user, onLogout }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="h-[60px] shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-5 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="h-9 w-9 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="메뉴 열기/닫기"
        >
          <Menu size={19} />
        </button>
        <h1 className="text-[16px] font-bold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLive}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
            live ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Radio size={13} className={live ? 'animate-pulse' : ''} />
          {live ? '실시간 ON' : '실시간 OFF'}
        </button>

        <button
          onClick={onRefresh}
          className="h-9 w-9 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="새로고침"
          title="지금 새로고침"
        >
          <RefreshCw size={17} />
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative h-9 w-9 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Bell size={18} />
            {events.length > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] leading-4 text-center text-white font-semibold">
                {Math.min(events.length, 9)}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-11 w-[300px] bg-white rounded-xl shadow-lg border border-slate-100 z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-[13px] font-bold text-slate-800">실시간 활동</p>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {events.length === 0 && (
                    <p className="text-[12px] text-slate-400 text-center py-8">아직 활동 내역이 없습니다.</p>
                  )}
                  {events.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-slate-50 last:border-0">
                      <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${toneDot[ev.tone] ?? toneDot.info}`} />
                      <div className="min-w-0">
                        <p className="text-[12px] text-slate-700 leading-snug">{ev.message}</p>
                        <p className="text-[10.5px] text-slate-400 mt-0.5">{timeAgo(ev.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative flex items-center gap-2 pl-2 ml-1 border-l border-slate-200">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-slate-100 grid place-items-center text-slate-500">
              <UserCircle2 size={20} />
            </div>
            <span className="text-[13.5px] font-medium text-slate-700 hidden sm:inline">
              {user?.displayName ?? '관리자'}
            </span>
            <ChevronDown size={14} className="text-slate-400 hidden sm:inline" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-11 w-[210px] bg-white rounded-xl shadow-lg border border-slate-100 z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-[13px] font-bold text-slate-800">{user?.displayName ?? '관리자'}</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">{user?.role ?? '시스템 관리자'}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    onLogout?.()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
