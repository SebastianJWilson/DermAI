import { useState } from 'react'

function MiniStars({ score }) {
  if (score == null) return null
  const stars = Math.round(score * 5 * 10) / 10
  return (
    <span className="text-xs text-[#5e6a60]">
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
      className="app-card w-full text-left hover:border-[#18211d]/12"
      aria-expanded={expanded}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e8eee4]">
          <span className="text-xs font-bold text-[#425246]">#{product.rank}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-[#18211d]">{product.name}</p>
          <p className="truncate text-xs text-[#5e6a60]">{product.brand}</p>
          <div className="mt-1">
            <MiniStars score={product.sentiment_score} />
          </div>
          {!expanded && product.review_summary && (
            <p className="mt-2 text-xs leading-5 text-[#5e6a60]">{product.review_summary}</p>
          )}

          {expanded && (
            <div className="mt-2 space-y-1">
              {product.review_summary && (
                <p className="text-sm leading-6 text-[#425246]">{product.review_summary}</p>
              )}
              {product.ranking_rationale && (
                <p className="text-xs italic leading-5 text-[#7f8b83]">{product.ranking_rationale}</p>
              )}
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#18211d] underline decoration-[#9cb49a] underline-offset-4"
                >
                  View product
                </a>
              )}
            </div>
          )}
        </div>

        <svg
          className={`mt-1 h-4 w-4 flex-shrink-0 text-[#7f8b83] transition-transform ${expanded ? 'rotate-180' : ''}`}
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
