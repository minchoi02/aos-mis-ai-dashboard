// ---------------------------------------------------------------------------
// AI 스마트 분석 엔진
// 실제 LLM 호출 없이도 "지능형"으로 보이도록, 데이터 기반의 통계·규칙 엔진으로
// 위험도 스코어링 / 이상 탐지 / 인사이트 문구 / 추천 조치를 실시간 계산합니다.
// (재실행 시에도 동일한 접수 건은 항상 동일한 점수 경향을 갖도록 시드 기반 난수를 사용합니다)
// ---------------------------------------------------------------------------

function seededRandom(str) {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return (Math.abs(hash) % 1000) / 1000
}

/**
 * receipts 배열을 keyFn 기준으로 그룹화하여, 그룹별 총건수/오류건수/오류율을 계산합니다.
 * (정비업체별, 부품구분별 통계에 공용으로 사용)
 */
export function computeGroupStats(receipts, keyFn) {
  const raw = new Map()
  receipts.forEach((r) => {
    const key = keyFn(r)
    if (!raw.has(key)) raw.set(key, { total: 0, error: 0 })
    const entry = raw.get(key)
    entry.total += 1
    if (r.status === '오류') entry.error += 1
  })
  const result = new Map()
  raw.forEach((v, k) => result.set(k, { ...v, rate: v.total ? v.error / v.total : 0 }))
  return result
}

/**
 * 접수 1건의 AI 위험도 점수(0~100)를 계산합니다.
 * - 정비업체 최근 오류율 (가중치 55%)
 * - 부품구분 오류율 (가중치 25%)
 * - 접수 시간대 (업무 외 시간 가중)
 * - 현재 처리 상태
 */
export function computeRiskScore(receipt, shopStats, partStats) {
  if (receipt.status === '오류') return 100

  const shopRate = shopStats.get(receipt.shop.code)?.rate ?? 0
  const partRate = partStats.get(receipt.part.type)?.rate ?? 0
  const hour = receipt.receivedAt.getHours()
  const offHours = hour < 9 || hour >= 18
  const seed = seededRandom(receipt.id)

  let score = shopRate * 55 + partRate * 25 + (offHours ? 10 : 3) + seed * 12
  if (receipt.status === '처리완료') score *= 0.22
  if (receipt.status === '처리중') score += 5

  return Math.round(Math.min(97, Math.max(3, score)))
}

export function riskLevel(score) {
  if (score >= 60) return { label: '높음', tone: 'red' }
  if (score >= 30) return { label: '보통', tone: 'amber' }
  return { label: '낮음', tone: 'green' }
}

/**
 * 특정 접수 건의 위험도 판단 근거를 사람이 읽을 수 있는 문장으로 생성합니다. (설명 가능한 AI)
 */
export function generateReasoning(receipt, shopStats, partStats) {
  const reasons = []
  const shop = shopStats.get(receipt.shop.code)
  const part = partStats.get(receipt.part.type)

  if (receipt.status === '오류') {
    reasons.push('현재 상태가 "오류"로 즉시 확인이 필요합니다.')
  }
  if (shop && shop.total >= 2) {
    reasons.push(
      `${receipt.shop.name}의 최근 오류율은 ${(shop.rate * 100).toFixed(0)}%입니다 (전체 ${shop.total}건 중 ${shop.error}건).`,
    )
  }
  if (part && part.total >= 2) {
    reasons.push(`${receipt.part.type} 부품군 전체 오류율은 ${(part.rate * 100).toFixed(0)}%로 집계되고 있습니다.`)
  }
  const hour = receipt.receivedAt.getHours()
  if (hour < 9 || hour >= 18) {
    reasons.push('업무 외 시간대 접수 건으로, 처리 지연 가능성이 다소 높습니다.')
  }
  if (reasons.length === 0) {
    reasons.push('특이 이력이 없는 정상 패턴의 접수 건입니다.')
  }
  return reasons
}

export function recommendedAction(receipt, score) {
  if (receipt.status === '오류') return '즉시 재전송 및 정비업체 재확인을 권장합니다.'
  if (score >= 60) return '우선순위를 높여 담당자 확인을 권장합니다.'
  if (score >= 30) return '정상 처리 흐름이나, 진행 상황을 주기적으로 확인하세요.'
  return '정상 처리가 예상되어 별도 조치가 필요하지 않습니다.'
}

/**
 * 대시보드 전체를 대상으로 한 AI 인사이트 문구 목록을 생성합니다.
 */
export function generateInsights(receipts, stats, shopStats, partStats) {
  const insights = []

  // 1) 전체 오류율 vs 기준치
  const errorRate = stats.total ? (stats.error / stats.total) * 100 : 0
  const baseline = 3
  if (errorRate > baseline) {
    insights.push({
      tone: 'red',
      text: `전체 오류율이 ${errorRate.toFixed(1)}%로 기준치(${baseline}%) 대비 높습니다. 원인 분석이 필요합니다.`,
    })
  } else {
    insights.push({
      tone: 'green',
      text: `전체 오류율 ${errorRate.toFixed(1)}%로 안정적인 범위에서 운영되고 있습니다.`,
    })
  }

  // 2) 오류율이 가장 높은 정비업체
  let worstShop = null
  shopStats.forEach((v, k) => {
    if (v.total >= 2 && (!worstShop || v.rate > worstShop.rate)) worstShop = { code: k, ...v }
  })
  if (worstShop && worstShop.rate > 0.15) {
    const shopName = receipts.find((r) => r.shop.code === worstShop.code)?.shop.name ?? worstShop.code
    insights.push({
      tone: 'amber',
      text: `${shopName}의 오류율이 ${(worstShop.rate * 100).toFixed(0)}%로 평균보다 높습니다. 품질 점검을 권장합니다.`,
    })
  }

  // 3) 부품 쏠림 현상
  let dominantPart = null
  partStats.forEach((v, k) => {
    if (!dominantPart || v.total > dominantPart.total) dominantPart = { type: k, ...v }
  })
  if (dominantPart && receipts.length > 0) {
    const ratio = (dominantPart.total / receipts.length) * 100
    insights.push({
      tone: 'blue',
      text: `최근 접수의 ${ratio.toFixed(0)}%가 "${dominantPart.type}" 부품군에 집중되어 있습니다.`,
    })
  }

  // 4) 처리 대기 현황
  const pending = receipts.filter((r) => r.status === '수신완료' || r.status === '처리중').length
  insights.push({
    tone: 'slate',
    text: `현재 처리 대기 중인 접수는 ${pending}건입니다. AI 추천순 정렬로 우선순위를 확인해 보세요.`,
  })

  return insights.slice(0, 4)
}
