function StarRating({ score }) {
  if (score == null) return null
  const stars = Math.round(score * 5 * 10) / 10 // e.g. 0.87 → 4.4
  const fullStars = Math.floor(stars)
  const hasHalf = stars - fullStars >= 0.5

  return (
    <div className="flex items-center gap-1">
      <div className="flex" aria-label={`${stars} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => {
          if (i < fullStars) {
            return <span key={i} className="text-amber-400 text-base">★</span>
          }
          if (i === fullStars && hasHalf) {
            return <span key={i} className="text-amber-400 text-base">½</span>
          }
          return <span key={i} className="text-slate-200 text-base">★</span>
        })}
      </div>
      <span className="text-xs text-slate-500">{stars.toFixed(1)}</span>
    </div>
  )
}

export default function TopProductCard({ product, condition }) {
  if (!product) return null

  return (
    <div className="bg-white rounded-xl border border-teal-200 shadow-sm overflow-hidden">
      <div className="bg-teal-50 px-4 py-2 flex items-center gap-2">
        <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
          Top Pick for {condition}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">{product.name}</h3>
          <p className="text-sm text-slate-500">{product.brand}</p>
        </div>

        {product.review_summary && (
          <p className="text-sm text-slate-700">{product.review_summary}</p>
        )}

        {product.sentiment_score != null && (
          <div className="space-y-0.5">
            <StarRating score={product.sentiment_score} />
            {product.review_count && (
              <p className="text-xs text-slate-400">Based on {product.review_count.toLocaleString()} reviews</p>
            )}
          </div>
        )}

        {product.url ? (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-sm text-center flex items-center justify-center transition-colors"
          >
            View Product
          </a>
        ) : (
          <button
            disabled
            className="w-full h-11 bg-slate-100 text-slate-400 font-semibold rounded-lg text-sm cursor-not-allowed"
          >
            View Product
          </button>
        )}

        <p className="text-xs text-slate-400 text-center">
          Suggestion only — not medical advice
        </p>
      </div>
    </div>
  )
}
