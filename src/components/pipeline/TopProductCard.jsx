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
            return <span key={i} className="text-base text-[#f2d49b]">★</span>
          }
          if (i === fullStars && hasHalf) {
            return <span key={i} className="text-base text-[#f2d49b]">½</span>
          }
          return <span key={i} className="text-base text-white/18">★</span>
        })}
      </div>
      <span className="text-xs text-white/65">{stars.toFixed(1)}</span>
    </div>
  )
}

export default function TopProductCard({ product, condition }) {
  if (!product) return null

  return (
    <div className="app-panel-dark space-y-5 overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
          Top pick for {condition}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-semibold leading-tight tracking-[-0.05em] text-white">{product.name}</h3>
          <p className="mt-1 text-sm text-white/65">{product.brand}</p>
        </div>

        {product.review_summary && (
          <p className="text-sm leading-6 text-white/78">{product.review_summary}</p>
        )}

        {product.sentiment_score != null && (
          <div className="space-y-0.5">
            <StarRating score={product.sentiment_score} />
            {product.review_count && (
              <p className="text-xs text-white/55">Based on {product.review_count.toLocaleString()} reviews</p>
            )}
          </div>
        )}

        {product.url ? (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="app-button-secondary w-full bg-white text-[#18211d]"
          >
            View product
          </a>
        ) : (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white/45"
          >
            View product
          </button>
        )}

        <p className="text-center text-xs text-white/50">
          Suggestion only, not medical advice
        </p>
      </div>
    </div>
  )
}
