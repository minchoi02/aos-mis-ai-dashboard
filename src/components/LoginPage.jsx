import React, { useState } from 'react'
import { ScanLine, User, Lock, Eye, EyeOff, Wifi, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import LiveClock from './LiveClock.jsx'
import { serverConfig } from '../data.js'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해 주세요.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onLogin({ username: username.trim(), password, remember })
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (u, p) => {
    setUsername(u)
    setPassword(p)
    setError('')
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-100">
      {/* 좌측 브랜드 패널 */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[#0f172a] text-white flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(13,148,136,0.3), transparent 45%)',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-600 grid place-items-center">
              <ScanLine size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[16px] font-bold">AOS 연계 MES</p>
              <p className="text-[12px] text-slate-400">업무 관리 시스템</p>
            </div>
          </div>

          <div className="mt-16">
            <LiveClock
              timeClassName="text-[46px] font-bold tabular-nums tracking-tight"
              dateClassName="text-[13.5px] text-slate-400 mt-1"
            />
          </div>

          <div className="mt-10 flex items-center gap-2 text-[12.5px] text-slate-300 bg-white/5 rounded-lg px-3 py-2 w-fit">
            <Wifi size={14} className="text-green-400" />
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              서버 연결됨 · {serverConfig.ip}:{serverConfig.port}
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-3 text-[12.5px] text-slate-400">
          <p className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-blue-400" />
            AOS 접수부터 정비업체 연계까지 실시간으로 관리합니다.
          </p>
          <p>© 2026 AOS 연계 MIS 시스템. All rights reserved.</p>
        </div>
      </div>

      {/* 우측 로그인 폼 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-blue-600 grid place-items-center">
              <ScanLine size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-800">AOS 연계 MIS</p>
              <p className="text-[11.5px] text-slate-400">업무 관리 시스템</p>
            </div>
          </div>

          <h1 className="text-[22px] font-bold text-slate-800 mb-1">로그인</h1>
          <p className="text-[13px] text-slate-500 mb-7">계정 정보를 입력해 시스템에 접속하세요.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1.5 block">아이디</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  autoComplete="username"
                  className="w-full text-[13.5px] border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-1.5 block">비밀번호</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  className="w-full text-[13.5px] border border-slate-200 rounded-lg pl-9 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-[12.5px] text-red-600 bg-red-50 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[12.5px] text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                />
                로그인 상태 유지
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-colors text-white text-[13.5px] font-semibold rounded-lg py-2.5"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-[11.5px] text-slate-400 mb-2">데모 계정으로 빠르게 접속해보세요</p>
            <div className="flex gap-2">
              <button
                onClick={() => fillDemo('admin', 'admin1234')}
                className="flex-1 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg py-1.5 hover:bg-slate-50 transition-colors"
              >
                admin / admin1234
              </button>
              <button
                onClick={() => fillDemo('tvulcan', 'tvulcan1!')}
                className="flex-1 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-lg py-1.5 hover:bg-slate-50 transition-colors"
              >
                tvulcan / tvulcan1!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
