import { useState } from 'react'
import ConditionCard from './ConditionCard'

export default function DiagnosisResults({ conditions = [], selectedCondition, collapsed: initialCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  const sorted = [...conditions].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))

  return (
    <div className="app-panel overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/50"
        aria-expanded={!collapsed}
      >
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#324036]">Possible conditions</h2>
        <div className="flex items-center gap-2">
          {collapsed && (
            <span className="text-xs text-[#7f8b83]">{sorted.length} reviewed</span>
          )}
          <svg
            className={`h-4 w-4 text-[#7f8b83] transition-transform ${collapsed ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {!collapsed && (
        <div className="space-y-3 px-5 pb-5">
          <p className="text-xs leading-5 text-[#7f8b83]">
            These are AI-generated estimates, not medical diagnoses. Please consult a licensed dermatologist.
          </p>
          {sorted.map((cond, i) => (
            <ConditionCard key={cond.name} condition={cond} isTopRank={i === 0} />
          ))}
        </div>
      )}
    </div>
  )
}
