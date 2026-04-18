function confidenceColor(confidence) {
  if (confidence >= 0.7) return 'bg-green-500'
  if (confidence >= 0.4) return 'bg-yellow-400'
  return 'bg-red-400'
}

export default function ConditionCard({ condition, isTopRank }) {
  const pct = Math.round((condition.confidence ?? 0) * 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isTopRank && (
            <span className="flex-shrink-0 text-[10px] font-semibold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
              Most Likely
            </span>
          )}
          <span className="text-sm font-medium text-slate-800 truncate">{condition.name}</span>
        </div>
        <span className="text-xs text-slate-500 flex-shrink-0">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${confidenceColor(condition.confidence ?? 0)} transition-all duration-500`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
