export default function DisclaimerBanner({ children }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
      <p className="text-xs text-amber-700">{children}</p>
    </div>
  )
}
