import React, { useState } from 'react'
import { X, CheckCircle2, Clock3, XCircle, Send, Printer, Wifi, ZoomIn, Sparkles, Calculator } from 'lucide-react'
import { statusMeta, serverConfig, getImageUrl } from '../data.js'
import { computeRiskScore, riskLevel, generateReasoning, recommendedAction } from '../utils/aiEngine.js'
import { computeEstimate, formatWon } from '../utils/estimateEngine.js'

export default function DetailPanel({ receipt, onClose, onResend, shopStats, partTypeStats }) {
  const [zoomImage, setZoomImage] = useState(null)
  const [resending, setResending] = useState(false)

  if (!receipt) return null
  const meta = statusMeta[receipt.status]

  const riskScore = computeRiskScore(receipt, shopStats, partTypeStats)
  const level = riskLevel(riskScore)
  const reasoning = generateReasoning(receipt, shopStats, partTypeStats)
  const action = recommendedAction(receipt, riskScore)
  const riskBarColor = { red: 'bg-red-500', amber: 'bg-amber-500', green: 'bg-green-500' }[level.tone]
  const riskTextColor = { red: 'text-red-600', amber: 'text-amber-600', green: 'text-green-600' }[level.tone]
  const estimate = computeEstimate(receipt)

  const images = [
    { label: '휠 이미지', fileName: 'wheel.jpg' },
    { label: '헤드램프 이미지', fileName: 'headlamp.jpg' },
  ]

  const handleResend = () => {
    setResending(true)
    onResend(receipt.id)
    setTimeout(() => setResending(false), 900)
  }

  return (
    <>
      <aside className="w-[360px] shrink-0 h-screen sticky top-0 bg-white border-l border-slate-200 flex flex-col">
        <div className="flex items-center justify-between px-5 h-[60px] border-b border-slate-100 shrink-0">
          <h2 className="text-[15px] font-bold text-slate-800">AOS 접수 상세 정보</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[15px] font-bold text-slate-800">{receipt.id}</p>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold transition-colors duration-500 ${meta.bg} ${meta.fg}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {meta.text}
              </span>
            </div>
            <div className="text-[12.5px] text-slate-500 space-y-1 mt-2">
              <Row label="접수일시" value={receipt.receivedAtLabel} />
              <Row label="연계일시" value={receipt.linkedAtLabel} />
            </div>
          </div>

          <Section
            title="AI 스마트 분석"
            extra={
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-purple-600 bg-purple-50 rounded-full px-2 py-0.5">
                <Sparkles size={11} /> AI
              </span>
            }
          >
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-slate-500">위험도 점수</span>
                <span className={`text-[13px] font-bold tabular-nums ${riskTextColor}`}>
                  {riskScore}점 · {level.label}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${riskBarColor} transition-all duration-500`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>
            <ul className="space-y-1.5 mb-3">
              {reasoning.map((text) => (
                <li key={text} className="text-[12px] text-slate-600 flex items-start gap-1.5">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-2 bg-purple-50 rounded-lg px-3 py-2.5">
              <Sparkles size={14} className="text-purple-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-purple-700 leading-snug">
                <span className="font-semibold">AI 추천 조치 : </span>
                {action}
              </p>
            </div>
          </Section>

          <Section title="1. 차량 정보">
            <Row label="차량번호" value={receipt.vehicle.carNumber} />
            <Row label="제조사" value={receipt.vehicle.maker} />
            <Row label="차종" value={receipt.vehicle.model} />
            <Row label="차량색상" value={receipt.vehicle.color} />
          </Section>

          <Section title="2. 부품 정보">
            <Row label="부품구분" value={receipt.part.type} />
            <Row label="교환부품" value={receipt.part.exchangePart} />
            <Row label="OEM 부품번호" value={receipt.part.oemCode} />
            <Row label="장착위치" value={receipt.part.position} />
            <Row label="수량" value={receipt.part.qty} />
          </Section>

          <Section title="3. 정비업체 정보">
            <Row label="업체코드" value={receipt.shop.code} />
            <Row label="업체명" value={receipt.shop.name} />
            <Row label="주소" value={receipt.shop.address} />
            <Row label="연락처" value={receipt.shop.phone} />
            <Row label="담당자" value={receipt.shop.manager} />
          </Section>

          <Section
            title="4. 이미지 정보"
            extra={
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                <Wifi size={11} className="text-blue-500" />
                {serverConfig.ip}:{serverConfig.port}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-3">
              {images.map((img) => {
                const url = getImageUrl(img.fileName)
                const highlighted = receipt.part.imageFile === img.fileName
                return (
                  <div key={img.label}>
                    <p className="text-[11.5px] text-slate-400 mb-1 flex items-center gap-1">
                      {img.label}
                      {highlighted && (
                        <span className="text-[9.5px] font-semibold text-blue-600 bg-blue-50 rounded-full px-1.5 py-0.5">
                          해당 부품
                        </span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => setZoomImage({ url, label: img.label })}
                      className={`group relative aspect-[4/3] w-full rounded-lg bg-slate-100 border overflow-hidden cursor-zoom-in ${
                        highlighted ? 'border-blue-300' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={url}
                        alt={img.label}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = `/images/${img.fileName}`
                        }}
                      />
                      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                        <ZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </button>
                    <p className="text-[10px] text-blue-600 truncate mt-1.5" title={url}>
                      {url}
                    </p>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="5. 연계 이력">
            <div className="space-y-3">
              {receipt.history.map((h) => (
                <div key={h.step} className="flex items-center gap-2.5">
                  {h.status === '성공' && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
                  {h.status === '대기' && <Clock3 size={16} className="text-slate-300 shrink-0" />}
                  {h.status === '실패' && <XCircle size={16} className="text-red-500 shrink-0" />}
                  <span className="text-[12.5px] text-slate-700 flex-1">{h.step}</span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      h.status === '성공'
                        ? 'bg-green-50 text-green-600'
                        : h.status === '실패'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {h.status}
                  </span>
                  <span className="text-[11px] text-slate-400 w-[86px] text-right shrink-0 truncate">{h.time}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="6. 계산 견적서"
            extra={
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-purple-600 bg-purple-50 rounded-full px-2 py-0.5">
                <Calculator size={11} /> AI 자동 계산
              </span>
            }
          >
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-2.5 py-2 text-left font-semibold">항목</th>
                    <th className="px-2.5 py-2 text-right font-semibold">단가</th>
                    <th className="px-2.5 py-2 text-right font-semibold">수량</th>
                    <th className="px-2.5 py-2 text-right font-semibold">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.items.map((item) => (
                    <tr key={item.label} className="border-t border-slate-100">
                      <td className="px-2.5 py-2 text-slate-700 align-top">
                        {item.label}
                        <p className="text-[10.5px] text-slate-400">{item.spec}</p>
                      </td>
                      <td className="px-2.5 py-2 text-right text-slate-600 tabular-nums align-top">
                        {formatWon(item.unitPrice)}
                      </td>
                      <td className="px-2.5 py-2 text-right text-slate-600 tabular-nums align-top">{item.qty}</td>
                      <td className="px-2.5 py-2 text-right text-slate-700 font-medium tabular-nums align-top">
                        {formatWon(item.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-100">
                    <td className="px-2.5 py-2 text-slate-700" colSpan={3}>
                      {estimate.laborLabel}
                    </td>
                    <td className="px-2.5 py-2 text-right text-slate-700 font-medium tabular-nums">
                      {formatWon(estimate.laborAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="border-t border-slate-200 px-3 py-2.5 space-y-1 bg-slate-50">
                <div className="flex items-center justify-between text-[12px] text-slate-500">
                  <span>소계</span>
                  <span className="tabular-nums">{formatWon(estimate.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-slate-500">
                  <span>부가세 (10%)</span>
                  <span className="tabular-nums">{formatWon(estimate.vat)}</span>
                </div>
                <div className="flex items-center justify-between text-[14px] font-bold text-slate-800 pt-1.5 mt-1 border-t border-slate-200">
                  <span>합계</span>
                  <span className="tabular-nums text-blue-600">{formatWon(estimate.total)}</span>
                </div>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-2 leading-relaxed">
              * 본 견적은 부품 단가·공임 참조표를 기반으로 AI가 자동 산정한 예상 금액이며, 실제 청구 금액과 다를 수 있습니다.
            </p>
          </Section>
        </div>

        <div className="border-t border-slate-100 p-4 grid grid-cols-3 gap-2 shrink-0">
          <button
            onClick={handleResend}
            disabled={resending}
            className="col-span-3 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors text-white text-[12.5px] font-semibold rounded-md py-2.5"
          >
            <Send size={14} className={resending ? 'animate-pulse' : ''} />
            {resending ? '재전송 중...' : '연계 재전송'}
          </button>
          <button
            onClick={() => window.print()}
            className="col-span-1 flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 text-[12.5px] font-semibold rounded-md py-2.5"
          >
            <Printer size={14} /> 인쇄
          </button>
          <button
            onClick={onClose}
            className="col-span-2 border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 text-[12.5px] font-semibold rounded-md py-2.5"
          >
            닫기
          </button>
        </div>
      </aside>

      {zoomImage && <ImageZoomModal image={zoomImage} onClose={() => setZoomImage(null)} />}
    </>
  )
}

function ImageZoomModal({ image, onClose }) {
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full mb-3">
          <p className="text-[14px] font-semibold text-white">{image.label}</p>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>
        <img src={image.url} alt={image.label} className="max-w-full max-h-[70vh] rounded-lg object-contain bg-white" />
        <p className="text-[11.5px] text-slate-300 mt-3 break-all">{image.url}</p>
      </div>
    </div>
  )
}

function Section({ title, extra, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-[13px] font-bold text-slate-800">{title}</h3>
        {extra}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-[12.5px] gap-3">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className="text-slate-700 font-medium text-right truncate">{value}</span>
    </div>
  )
}
