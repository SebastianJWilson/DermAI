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
      <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )
  }
  if (state === 'active') {
    return (
      <div className="w-7 h-7 rounded-full bg-teal-100 border-2 border-teal-500 flex items-center justify-center flex-shrink-0 animate-pulse">
        <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
      </div>
    )
  }
  return (
    <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-slate-200 flex-shrink-0" />
  )
}

export default function PipelineProgress({ status }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const state = stepState(i, status)
          return (
            <div key={step.label} className="flex items-center gap-3">
              <StepDot state={state} />
              <span
                className={`text-sm font-medium ${
                  state === 'active'
                    ? 'text-teal-700'
                    : state === 'complete'
                    ? 'text-slate-700'
                    : 'text-slate-400'
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
