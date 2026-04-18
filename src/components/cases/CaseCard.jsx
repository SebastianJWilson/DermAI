import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import CaseStatusBadge from './CaseStatusBadge'

function useImageUrl(imagePath) {
  if (!imagePath) return null
  const { data } = supabase.storage.from('case-images').getPublicUrl(imagePath)
  return data?.publicUrl ?? null
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function CaseCard({ caseData }) {
  const imageUrl = useImageUrl(caseData.image_path)

  return (
    <Link
      to={`/cases/${caseData.id}`}
      className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3 hover:border-teal-300 active:bg-slate-50 transition-colors min-h-[72px]"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-[60px] h-[60px] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4.5 12.75l7.5-7.5 7.5 7.5M4.5 19.5l7.5-7.5 7.5 7.5" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{caseData.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <CaseStatusBadge status={caseData.status} />
        </div>
        {caseData.status === 'complete' && caseData.top_product && (
          <p className="text-xs text-slate-400 mt-1 truncate">
            Top pick: {caseData.top_product.name}
          </p>
        )}
      </div>

      {/* Timestamp */}
      <div className="flex-shrink-0 text-xs text-slate-400 self-end pb-0.5">
        {relativeTime(caseData.created_at)}
      </div>
    </Link>
  )
}
