const STATUS_CONFIG = {
  pending:            { label: 'Pending', bg: 'bg-[#eef2ea]', text: 'text-[#5f6d63]' },
  diagnosing:         { label: 'Analyzing skin', bg: 'bg-[#e7efe1]', text: 'text-[#324036]' },
  diagnosis_complete: { label: 'Finding products', bg: 'bg-[#f1ede2]', text: 'text-[#6c6457]' },
  searching_products: { label: 'Searching', bg: 'bg-[#ece9e0]', text: 'text-[#625d53]' },
  ranking_products:   { label: 'Ranking', bg: 'bg-[#e1e8db]', text: 'text-[#425246]' },
  complete:           { label: 'Complete', bg: 'bg-[#dfeada]', text: 'text-[#233128]' },
  error:              { label: 'Error', bg: 'bg-red-100', text: 'text-red-700' },
}

export default function CaseStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}
