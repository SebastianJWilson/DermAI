export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-4 flex items-start gap-3">
      <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm leading-6 text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-semibold text-red-600 underline underline-offset-4"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
