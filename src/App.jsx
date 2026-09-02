import React, { useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopHeader from './components/TopHeader.jsx'
import StatCards from './components/StatCards.jsx'
import AIInsightPanel from './components/AIInsightPanel.jsx'
import DailyTrendChart from './components/DailyTrendChart.jsx'
import StatusDonutChart from './components/StatusDonutChart.jsx'
import PartsBarChart from './components/PartsBarChart.jsx'
import ReceiptTable from './components/ReceiptTable.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import Footer from './components/Footer.jsx'
import LoginPage from './components/LoginPage.jsx'
import { useLiveDashboard } from './hooks/useLiveDashboard.js'
import { useAuth } from './hooks/useAuth.js'

export default function App() {
  const { user, isAuthenticated, checking, login, logout } = useAuth()

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-100 text-slate-400 text-[13px]">
        불러오는 중...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />
  }

  return <Dashboard user={user} onLogout={logout} />
}

function Dashboard({ user, onLogout }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const {
    receipts,
    stats,
    statusRatio,
    partsBreakdown,
    dailyTrend,
    shopStats,
    partTypeStats,
    riskScores,
    insights,
    live,
    setLive,
    events,
    flashIds,
    manualRefresh,
    resendReceipt,
  } = useLiveDashboard()

  // 통계 카드 값이 바뀔 때 잠깐 하이라이트
  const [changedKeys, setChangedKeys] = useState(new Set())
  const prevStatsRef = useRef(stats)
  useEffect(() => {
    const prev = prevStatsRef.current
    const changed = new Set()
    Object.keys(stats).forEach((key) => {
      if (prev[key] !== stats[key]) changed.add(key)
    })
    if (changed.size > 0) {
      setChangedKeys(changed)
      const timer = setTimeout(() => setChangedKeys(new Set()), 1200)
      prevStatsRef.current = stats
      return () => clearTimeout(timer)
    }
    prevStatsRef.current = stats
    return undefined
  }, [stats])

  const handleSelectReceipt = (id) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  const selectedReceipt = receipts.find((r) => r.id === selectedId) ?? null

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          title="대시보드"
          live={live}
          onToggleLive={() => setLive((v) => !v)}
          onRefresh={manualRefresh}
          events={events}
          user={user}
          onLogout={onLogout}
        />

        <main className="flex-1 p-5 space-y-5">
          <StatCards stats={stats} changedKeys={changedKeys} />

          <AIInsightPanel insights={insights} live={live} />

          <div className="grid grid-cols-1 xl:grid-cols-7 gap-5 items-stretch">
            <div className="xl:col-span-3">
              <DailyTrendChart data={dailyTrend} live={live} />
            </div>
            <div className="xl:col-span-2">
              <StatusDonutChart data={statusRatio} />
            </div>
            <div className="xl:col-span-2">
              <PartsBarChart data={partsBreakdown} />
            </div>
          </div>

          <ReceiptTable
            receipts={receipts}
            onSelectReceipt={handleSelectReceipt}
            selectedId={selectedId}
            flashIds={flashIds}
            riskScores={riskScores}
          />
        </main>

        <Footer />
      </div>

      {detailOpen && selectedReceipt && (
        <DetailPanel
          receipt={selectedReceipt}
          onClose={() => setDetailOpen(false)}
          onResend={resendReceipt}
          shopStats={shopStats}
          partTypeStats={partTypeStats}
        />
      )}
    </div>
  )
}
