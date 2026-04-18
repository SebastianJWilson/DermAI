const STEPS = [
  { label: 'Analyzing your skin',      activeStatuses: ['pending', 'diagnosing'] },
  { label: 'Finding products',         activeStatuses: ['diagnosis_complete', 'searching_products'] },
  { label: 'Ranking by reviews',       activeStatuses: ['ranking_products'] },
]

const COMPLETE_STATUSES = ['complete']
const COMPLETE_AFTER = [
  [],                                                              // step 0 complete after…
  ['diagnosis_complete', 'searching_products', 'ranking_products', 'complete'],
  ['ranking_products', 'complete'],
  ['complete'],
]

function stepState(stepIndex, status) {
  if (COMPLETE_STATUSES.includes(status)) return 'complete'

  const step = STEPS[stepIndex]
  if (step.activeStatuses.includes(status)) return 'active'

  // Step is complete if the status is past it
  const pastStatuses = COMPLETE_AFTER[stepIndex + 1] ?? []
  if (pastStatuses.includes(status)) return 'complete'

  return 'pending'
}

function StepDot({ state }) {
  if (state === 'complete') {
    return (
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#18211d]">
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )
  }
  if (state === 'active') {
    return (
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#7d9d7e] bg-[#e9f0e5]">
        <div className="h-3 w-3 rounded-full bg-[#445747] animate-pulse" />
      </div>
    )
  }
  return (
    <div className="h-9 w-9 flex-shrink-0 rounded-full border border-[#18211d]/10 bg-white/75" />
  )
}

export default function PipelineProgress({ status }) {
  return (
    <div className="app-panel space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#728077]">Pipeline</p>
        <p className="text-sm text-[#5e6a60]">The photo, concern, and review data move through three stages.</p>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const state = stepState(i, status)
          return (
            <div key={step.label} className="flex items-center gap-3 rounded-[1.25rem] border border-[#18211d]/8 bg-white/65 px-3 py-3">
              <StepDot state={state} />
              <span
                className={`text-sm font-medium tracking-[-0.01em] ${
                  state === 'active'
                    ? 'text-[#18211d]'
                    : state === 'complete'
                    ? 'text-[#425246]'
                    : 'text-[#8a958d]'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
