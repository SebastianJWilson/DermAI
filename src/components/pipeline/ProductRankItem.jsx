import { useState } from 'react'

function MiniStars({ score }) {
  if (score == null) return null
  const stars = Math.round(score * 5 * 10) / 10
  return (
    <span className="text-xs text-slate-500">
      {'★'.repeat(Math.round(stars))}{'☆'.repeat(5 - Math.round(stars))} {stars.toFixed(1)}
    </span>
  )
}

export default function ProductRankItem({ product }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setExpanded(e => !e)}
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-3 hover:border-slate-300 transition-colors"
      aria-expanded={expanded}
    >
      <div className="flex items-start gap-3">
        {/* Rank badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-600">#{product.rank}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
          <p className="text-xs text-slate-500 truncate">{product.brand}</p>
          <div className="mt-1">
            <MiniStars score={product.sentiment_score} />
          </div>
          {!expanded && product.review_summary && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{product.review_summary}</p>
          )}

          {expanded && (
            <div className="mt-2 space-y-1">
              {product.review_summary && (
                <p className="text-sm text-slate-600">{product.review_summary}</p>
              )}
              {product.ranking_rationale && (
                <p className="text-xs text-slate-400 italic">{product.ranking_rationale}</p>
              )}
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="inline-block mt-1 text-xs text-teal-600 hover:underline font-medium"
                >
                  View Product →
                </a>
              )}
            </div>
          )}
        </div>

        <svg
          className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  )
}
