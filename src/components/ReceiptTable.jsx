import React, { useMemo, useState } from 'react'
import { Search, RotateCcw, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Sparkles } from 'lucide-react'
import { statusMeta, STATUS_LIST } from '../data.js'
import { riskLevel } from '../utils/aiEngine.js'

const columns = [
  '접수번호',
  '접수일시',
  '차량번호',
  '제조사/차종',
  '부품구분',
  '교환부품',
  '정비업체',
  '상태',
  'AI 위험도',
  '연계일시',
  '작업',
]

const riskToneClass = {
  red: 'bg-red-50 text-red-600',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-green-50 text-green-600',
}

const PAGE_SIZE = 8

export default function ReceiptTable({ receipts, onSelectReceipt, selectedId, flashIds, riskScores }) {
  const [receiptNoInput, setReceiptNoInput] = useState('')
  const [carNoInput, setCarNoInput] = useState('')
  const [partFilter, setPartFilter] = useState('전체')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [sortByRisk, setSortByRisk] = useState(false)

  const [appliedFilters, setAppliedFilters] = useState(null)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!appliedFilters) return receipts
    return receipts.filter((r) => {
      if (appliedFilters.receiptNo && !r.id.toLowerCase().includes(appliedFilters.receiptNo.toLowerCase())) {
        return false
      }
      if (appliedFilters.carNo && !r.vehicle.carNumber.includes(appliedFilters.carNo)) {
        return false
      }
      if (appliedFilters.part !== '전체' && r.part.type !== appliedFilters.part) {
        return false
      }
      if (appliedFilters.status !== '전체' && r.status !== appliedFilters.status) {
        return false
      }
      return true
    })
  }, [receipts, appliedFilters])

  const sorted = useMemo(() => {
    if (!sortByRisk) return filtered
    return [...filtered].sort((a, b) => (riskScores?.get(b.id) ?? 0) - (riskScores?.get(a.id) ?? 0))
  }, [filtered, sortByRisk, riskScores])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSearch = () => {
    setAppliedFilters({
      receiptNo: receiptNoInput.trim(),
      carNo: carNoInput.trim(),
      part: partFilter,
      status: statusFilter,
    })
    setPage(1)
  }

  const handleReset = () => {
    setReceiptNoInput('')
    setCarNoInput('')
    setPartFilter('전체')
    setStatusFilter('전체')
    setAppliedFilters(null)
    setPage(1)
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-100">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-bold text-slate-800">AOS 접수 목록</h2>
          <span className="text-[11.5px] text-slate-400">
            총 <span className="font-semibold text-slate-600">{filtered.length.toLocaleString()}</span>건
          </span>
        </div>
        <div className="flex flex-wrap items-end gap-2.5">
          <Field label="접수번호">
            <input
              value={receiptNoInput}
              onChange={(e) => setReceiptNoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="접수번호 입력"
              className="w-[140px] text-[12.5px] border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </Field>
          <Field label="차량번호">
            <input
              value={carNoInput}
              onChange={(e) => setCarNoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="차량번호 입력"
              className="w-[140px] text-[12.5px] border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </Field>
          <Field label="부품구분">
            <select
              value={partFilter}
              onChange={(e) => setPartFilter(e.target.value)}
              className="w-[100px] text-[12.5px] border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none"
            >
              <option>전체</option>
              <option>휠</option>
              <option>헤드램프</option>
            </select>
          </Field>
          <Field label="상태">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[100px] text-[12.5px] border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none"
            >
              <option>전체</option>
              {STATUS_LIST.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="접수일자">
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-md px-2.5 py-1.5 text-[12.5px] text-slate-500">
              <Calendar size={13} />
              2026-05-01 ~ 2026-06-01
            </div>
          </Field>
          <button
            onClick={handleSearch}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-[12.5px] font-semibold rounded-md px-3.5 py-1.5"
          >
            <Search size={13} /> 조회
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 text-[12.5px] font-semibold rounded-md px-3.5 py-1.5"
          >
            <RotateCcw size={13} /> 초기화
          </button>
          <button
            onClick={() => {
              setSortByRisk((v) => !v)
              setPage(1)
            }}
            className={`flex items-center gap-1 text-[12.5px] font-semibold rounded-md px-3.5 py-1.5 transition-colors ${
              sortByRisk
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'border border-purple-200 text-purple-600 hover:bg-purple-50'
            }`}
            title="AI 위험도 점수 순으로 정렬합니다"
          >
            <Sparkles size={13} /> AI 추천순
          </button>
        </div>
      </div>

      <div className="overflow-x-auto table-scroll">
        <table className="w-full text-[12.5px] min-w-[1120px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              {columns.map((col) => (
                <th key={col} className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-slate-400">
                  조건에 맞는 접수 건이 없습니다.
                </td>
              </tr>
            )}
            {pageRows.map((row) => {
              const meta = statusMeta[row.status]
              const active = selectedId === row.id
              const flashing = flashIds?.has(row.id)
              return (
                <tr
                  key={row.id}
                  className={`border-t border-slate-100 hover:bg-slate-50 transition-colors duration-700 ${
                    active ? 'bg-blue-50/60' : ''
                  } ${flashing ? 'bg-amber-50' : ''}`}
                >
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <button
                      onClick={() => onSelectReceipt(row.id)}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {row.id}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.receivedAtLabel.slice(0, 16)}</td>
                  <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap">{row.vehicle.carNumber}</td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                    {row.vehicle.maker} / {row.vehicle.model}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.part.type}</td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.part.exchangePart}</td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.shop.name}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${meta.bg} ${meta.fg}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {meta.text}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <RiskBadge score={riskScores?.get(row.id) ?? 0} />
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{row.linkedAtLabel.slice(0, 16)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <button
                      onClick={() => onSelectReceipt(row.id)}
                      className="text-[12px] font-semibold text-slate-500 border border-slate-200 rounded-md px-2.5 py-1 hover:bg-slate-100 transition-colors"
                    >
                      상세
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-1 py-4">
        <PageBtn icon={<ChevronsLeft size={14} />} onClick={() => setPage(1)} disabled={safePage === 1} />
        <PageBtn
          icon={<ChevronLeft size={14} />}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safePage === 1}
        />
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(0, safePage - 3), Math.max(0, safePage - 3) + 5)
          .map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-7 w-7 grid place-items-center rounded-md text-[12.5px] font-semibold transition-colors ${
                safePage === n ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {n}
            </button>
          ))}
        <PageBtn
          icon={<ChevronRight size={14} />}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage === totalPages}
        />
        <PageBtn
          icon={<ChevronsRight size={14} />}
          onClick={() => setPage(totalPages)}
          disabled={safePage === totalPages}
        />
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-slate-400 font-medium">{label}</span>
      {children}
    </label>
  )
}

function PageBtn({ icon, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-7 w-7 grid place-items-center rounded-md text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {icon}
    </button>
  )
}

function RiskBadge({ score }) {
  const level = riskLevel(score)
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${riskToneClass[level.tone]}`}
    >
      {level.label} · {score}
    </span>
  )
}
