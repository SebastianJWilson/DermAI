function confidenceColor(confidence) {
  if (confidence >= 0.7) return 'bg-[#233128]'
  if (confidence >= 0.4) return 'bg-[#90a883]'
  return 'bg-[#d19482]'
}

export default function ConditionCard({ condition, isTopRank }) {
  const pct = Math.round((condition.confidence ?? 0) * 100)

  return (
    <div className="space-y-2 rounded-[1.25rem] border border-[#18211d]/8 bg-white/76 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isTopRank && (
            <span className="flex-shrink-0 rounded-full bg-[#e7efe1] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#425246]">
              Most Likely
            </span>
          )}
          <span className="truncate text-sm font-medium text-[#18211d]">{condition.name}</span>
        </div>
        <span className="flex-shrink-0 text-xs text-[#5e6a60]">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e7ece4]">
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
