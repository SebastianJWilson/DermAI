const STATUS_CONFIG = {
  pending:             { label: 'Pending',          bg: 'bg-slate-100',  text: 'text-slate-600' },
  diagnosing:          { label: 'Analyzing skin',   bg: 'bg-blue-100',   text: 'text-blue-700' },
  diagnosis_complete:  { label: 'Finding products', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  searching_products:  { label: 'Searching',        bg: 'bg-purple-100', text: 'text-purple-700' },
  ranking_products:    { label: 'Ranking',          bg: 'bg-violet-100', text: 'text-violet-700' },
  complete:            { label: 'Complete',         bg: 'bg-green-100',  text: 'text-green-700' },
  error:               { label: 'Error',            bg: 'bg-red-100',    text: 'text-red-700' },
}

export default function CaseStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}
