export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  }
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-[#d9e3d5] border-t-[#18211d] ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
