// ---------------------------------------------------------------------------
// AI 자동 견적(계산) 엔진
// 부품구분/교환부품별 단가·공임비 참조표를 기준으로, 접수 1건의 예상 수리 비용을
// 부품비 + 공임비 + 부가세(10%) 구조로 자동 계산합니다.
// ---------------------------------------------------------------------------

export const partPricing = {
  '19인치 휠': { unitPrice: 350000, labor: 30000 },
  '18인치 휠': { unitPrice: 320000, labor: 30000 },
  '17인치 휠': { unitPrice: 280000, labor: 25000 },
  'LED 헤드램프(좌)': { unitPrice: 480000, labor: 50000 },
  'LED 헤드램프(우)': { unitPrice: 480000, labor: 50000 },
}

const DEFAULT_PRICING = { unitPrice: 300000, labor: 30000 }
const VAT_RATE = 0.1

export function formatWon(amount) {
  return `${Math.round(amount).toLocaleString('ko-KR')}원`
}

/**
 * 접수 1건의 예상 견적을 계산합니다.
 * 부품비(단가 × 수량) + 공임비 → 소계 → 부가세(10%) → 합계
 */
export function computeEstimate(receipt) {
  const pricing = partPricing[receipt.part.exchangePart] ?? DEFAULT_PRICING
  const qty = receipt.part.qty ?? 1
  const partAmount = pricing.unitPrice * qty

  const items = [
    {
      label: receipt.part.exchangePart,
      spec: `${receipt.part.type} · ${receipt.part.position}`,
      unitPrice: pricing.unitPrice,
      qty,
      amount: partAmount,
    },
  ]

  const laborLabel = `${receipt.part.type} 교체 공임`
  const laborAmount = pricing.labor

  const subtotal = partAmount + laborAmount
  const vat = Math.round(subtotal * VAT_RATE)
  const total = subtotal + vat

  return {
    items,
    laborLabel,
    laborAmount,
    subtotal,
    vatRate: VAT_RATE,
    vat,
    total,
  }
}
