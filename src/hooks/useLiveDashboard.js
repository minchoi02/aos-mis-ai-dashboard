import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createReceipt,
  generateInitialReceipts,
  dailyTrendHistory,
  BASELINE_STATS,
  BASELINE_PARTS,
  TODAY_BASELINE,
  STATUS_LIST,
} from '../data.js'
import { computeGroupStats, computeRiskScore, generateInsights, recommendedAction } from '../utils/aiEngine.js'

const TICK_INTERVAL_MS = 3500
const NEW_RECEIPT_PROBABILITY = 0.55
const STATUS_ADVANCE_PROBABILITY = 0.45

function nextStatus(status) {
  if (status === '수신완료') return Math.random() < 0.82 ? '처리중' : '오류'
  if (status === '처리중') return Math.random() < 0.85 ? '처리완료' : '오류'
  return status
}

function countByStatus(receipts) {
  const counts = { 수신완료: 0, 처리중: 0, 처리완료: 0, 오류: 0 }
  receipts.forEach((r) => {
    counts[r.status] = (counts[r.status] ?? 0) + 1
  })
  return counts
}

function countByPart(receipts) {
  const counts = { 휠: 0, 헤드램프: 0 }
  receipts.forEach((r) => {
    counts[r.part.type] = (counts[r.part.type] ?? 0) + 1
  })
  return counts
}

export function useLiveDashboard() {
  const [receipts, setReceipts] = useState(() => generateInitialReceipts(40).reverse())
  const [live, setLive] = useState(true)
  const [events, setEvents] = useState([])
  const [flashIds, setFlashIds] = useState(() => new Set())
  const baselineRef = useRef(null)

  // 초기 데이터 기준으로 "기저치"를 계산해, 화면상의 큰 숫자(전체 접수 1,248건 등)가
  // 실제 목록 데이터 변화와 함께 자연스럽게 움직이도록 함
  if (baselineRef.current === null) {
    const initialStatusCounts = countByStatus(receipts)
    const initialPartCounts = countByPart(receipts)
    baselineRef.current = {
      total: BASELINE_STATS.total - receipts.length,
      received: BASELINE_STATS.received - initialStatusCounts.수신완료,
      processing: BASELINE_STATS.processing - initialStatusCounts.처리중,
      done: BASELINE_STATS.done - initialStatusCounts.처리완료,
      error: BASELINE_STATS.error - initialStatusCounts.오류,
      휠: BASELINE_PARTS.휠 - initialPartCounts.휠,
      헤드램프: BASELINE_PARTS.헤드램프 - initialPartCounts.헤드램프,
      todayTotal: TODAY_BASELINE.전체 - receipts.length,
      todayReceived: TODAY_BASELINE.수신완료 - initialStatusCounts.수신완료,
      todayError: TODAY_BASELINE.오류 - initialStatusCounts.오류,
    }
  }

  const pushEvent = useCallback((message, tone = 'info') => {
    setEvents((prev) => [{ id: `${Date.now()}-${Math.random()}`, message, tone, time: new Date() }, ...prev].slice(0, 30))
  }, [])

  const flash = useCallback((id) => {
    setFlashIds((prev) => new Set(prev).add(id))
    setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 2200)
  }, [])

  const tick = useCallback(() => {
    setReceipts((prev) => {
      let next = prev
      let erroredReceipt = null

      if (Math.random() < NEW_RECEIPT_PROBABILITY) {
        const created = createReceipt(new Date())
        next = [created, ...next]
        pushEvent(`신규 접수 ${created.id} (${created.vehicle.carNumber} · ${created.part.type})`, 'new')
        flash(created.id)
      }

      if (Math.random() < STATUS_ADVANCE_PROBABILITY) {
        const candidates = next.filter((r) => r.status === '수신완료' || r.status === '처리중')
        if (candidates.length > 0) {
          const target = candidates[Math.floor(Math.random() * candidates.length)]
          const updatedStatus = nextStatus(target.status)
          if (updatedStatus !== target.status) {
            next = next.map((r) => {
              if (r.id !== target.id) return r
              const nowLabel = new Date()
              const historyStepIndex = updatedStatus === '오류' ? 2 : r.history.findIndex((h) => h.status === '대기')
              const updatedHistory = r.history.map((h, idx) =>
                idx === historyStepIndex
                  ? {
                      ...h,
                      status: updatedStatus === '오류' ? '실패' : '성공',
                      time: nowLabel.toLocaleString('ko-KR'),
                    }
                  : h,
              )
              return { ...r, status: updatedStatus, history: updatedHistory }
            })
            const tone = updatedStatus === '오류' ? 'error' : updatedStatus === '처리완료' ? 'success' : 'info'
            pushEvent(`${target.id} 상태 변경: ${target.status} → ${updatedStatus}`, tone)
            flash(target.id)
            if (updatedStatus === '오류') {
              erroredReceipt = next.find((r) => r.id === target.id)
            }
          }
        }
      }

      // AI 이상 탐지: 오류가 새로 발생하면 위험도를 즉시 계산해 별도 경고를 남김
      if (erroredReceipt) {
        const shopStats = computeGroupStats(next, (r) => r.shop.code)
        const partStats = computeGroupStats(next, (r) => r.part.type)
        const score = computeRiskScore(erroredReceipt, shopStats, partStats)
        pushEvent(
          `🤖 AI 이상 탐지: ${erroredReceipt.id} 오류 발생 (위험도 ${score}점) — ${recommendedAction(erroredReceipt, score)}`,
          'ai-alert',
        )
      }

      return next
    })
  }, [flash, pushEvent])

  useEffect(() => {
    if (!live) return undefined
    const timer = setInterval(tick, TICK_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [live, tick])

  const manualRefresh = useCallback(() => {
    tick()
    pushEvent('수동 새로고침을 실행했습니다', 'info')
  }, [tick, pushEvent])

  const resendReceipt = useCallback(
    (id) => {
      setReceipts((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r
          const nowLabel = new Date().toLocaleString('ko-KR')
          const resolvedStatus = r.status === '오류' ? '처리중' : r.status
          return {
            ...r,
            status: resolvedStatus,
            history: r.history.map((h, idx) =>
              idx === 2 ? { ...h, status: '성공', time: nowLabel } : h,
            ),
          }
        }),
      )
      pushEvent(`${id} 연계 재전송을 요청했습니다`, 'info')
      flash(id)
    },
    [pushEvent, flash],
  )

  const derived = useMemo(() => {
    const base = baselineRef.current
    const statusCounts = countByStatus(receipts)
    const partCounts = countByPart(receipts)

    const stats = {
      total: base.total + receipts.length,
      received: base.received + statusCounts.수신완료,
      processing: base.processing + statusCounts.처리중,
      done: base.done + statusCounts.처리완료,
      error: base.error + statusCounts.오류,
    }

    const statusRatio = [
      { name: '수신완료', value: +((stats.received / stats.total) * 100).toFixed(1), color: '#16a34a' },
      { name: '처리중', value: +((stats.processing / stats.total) * 100).toFixed(1), color: '#f59e0b' },
      { name: '처리완료', value: +((stats.done / stats.total) * 100).toFixed(1), color: '#2563eb' },
      { name: '오류', value: +((stats.error / stats.total) * 100).toFixed(1), color: '#ef4444' },
    ]

    const partsTotal = base.휠 + base.헤드램프 + receipts.length
    const wheelCount = base.휠 + partCounts.휠
    const headlampCount = base.헤드램프 + partCounts.헤드램프
    const partsBreakdown = [
      { name: '휠', count: wheelCount, ratio: +((wheelCount / partsTotal) * 100).toFixed(1), color: '#2563eb' },
      { name: '헤드램프', count: headlampCount, ratio: +((headlampCount / partsTotal) * 100).toFixed(1), color: '#0d9488' },
    ]

    const todayTotal = base.todayTotal + receipts.length
    const todayReceived = base.todayReceived + statusCounts.수신완료
    const todayError = base.todayError + statusCounts.오류
    const dailyTrend = [
      ...dailyTrendHistory,
      { date: '05/31', 전체: todayTotal, 수신완료: todayReceived, 오류: todayError },
    ]

    // ---- AI 스마트 분석 ----
    const shopStats = computeGroupStats(receipts, (r) => r.shop.code)
    const partTypeStats = computeGroupStats(receipts, (r) => r.part.type)
    const riskScores = new Map(receipts.map((r) => [r.id, computeRiskScore(r, shopStats, partTypeStats)]))
    const insights = generateInsights(receipts, stats, shopStats, partTypeStats)

    return { stats, statusRatio, partsBreakdown, dailyTrend, shopStats, partTypeStats, riskScores, insights }
  }, [receipts])

  return {
    receipts,
    ...derived,
    live,
    setLive,
    events,
    flashIds,
    manualRefresh,
    resendReceipt,
    STATUS_LIST,
  }
}
