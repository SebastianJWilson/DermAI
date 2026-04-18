import { Link } from 'react-router-dom'

export default function NewCaseListRow() {
  return (
    <Link
      to="/cases/new"
      aria-label="Create new case"
      className="app-card flex min-h-[92px] items-center gap-4 border border-dashed border-[#18211d]/18 bg-[#faf9f6] hover:-translate-y-0.5 hover:border-[#18211d]/22 hover:bg-white"
    >
      <div className="flex h-[68px] w-[68px] flex-shrink-0 items-center justify-center rounded-[1.2rem] border border-dashed border-[#18211d]/14 bg-white/80 text-[#18211d]">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 5v14m7-7H5" />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-[-0.02em] text-[#18211d]">New case</p>
      </div>

      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f4f1ea] text-[#5e6a60]">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
    </Link>
  )
}
