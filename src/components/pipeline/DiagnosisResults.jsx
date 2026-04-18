import { useState } from 'react'
import ConditionCard from './ConditionCard'

export default function DiagnosisResults({ conditions = [], selectedCondition, collapsed: initialCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  const sorted = [...conditions].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
        aria-expanded={!collapsed}
      >
        <h2 className="text-sm font-semibold text-slate-900">Possible Conditions</h2>
        <div className="flex items-center gap-2">
          {collapsed && (
            <span className="text-xs text-slate-500">{sorted.length} conditions analyzed</span>
          )}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-slate-400 -mt-1">
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
