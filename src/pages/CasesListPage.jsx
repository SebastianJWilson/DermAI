import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import AppShell from '../components/layout/AppShell'
import CaseCard from '../components/cases/CaseCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function SkeletonCard() {
  return (
    <div className="app-card flex animate-pulse items-center gap-3">
      <div className="h-[60px] w-[60px] flex-shrink-0 rounded-[1rem] bg-[#dde5d8]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded-full bg-[#dde5d8]" />
        <div className="h-2.5 w-1/3 rounded-full bg-[#e7ece4]" />
      </div>
    </div>
  )
}

export default function CasesListPage() {
  const { user } = useAuth()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchCases = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError('Failed to load cases. Please try again.')
    } else {
      setCases(data ?? [])
    }
  }, [user.id])

  useEffect(() => {
    setLoading(true)
    fetchCases().finally(() => setLoading(false))
  }, [fetchCases])

  async function handleRefresh() {
    setRefreshing(true)
    await fetchCases()
    setRefreshing(false)
  }

  const completedCount = cases.filter(c => c.status === 'complete').length

  return (
    <AppShell title="Cases">
      <div className="space-y-4">
        <section className="app-panel-dark space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="app-kicker bg-white/10 text-white">Library</span>
              <div className="space-y-2">
                <h1 className="max-w-[10ch] text-[2.35rem] font-semibold leading-[0.95] tracking-[-0.07em]">
                  Skin concerns, ranked fast.
                </h1>
                <p className="max-w-[28ch] text-sm leading-6 text-white/72">
                  Each scan turns a photo and concern into a shortlist of products from the database.
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="touch-target-override rounded-full border border-white/12 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              aria-label="Refresh cases"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Total</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{cases.length}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Complete</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{completedCount}</p>
            </div>
          </div>
        </section>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="hidden"
          aria-label="Refresh cases"
        >
          <span className="sr-only">Refresh</span>
        </button>

        {error && (
          <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : cases.length === 0 ? (
          <div className="app-panel flex flex-col items-center justify-center space-y-4 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-[#e7efe1]">
              <svg className="h-10 w-10 text-[#425246]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#18211d]">No analyses yet</p>
              <p className="mt-1 text-sm text-[#5e6a60]">Create your first scan to start the product match flow.</p>
            </div>
            <Link
              to="/cases/new"
              className="app-button-primary"
            >
              <span>Start analysis</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                </svg>
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map(c => (
              <CaseCard key={c.id} caseData={c} />
            ))}
          </div>
        )}
      </div>

      <Link
        to="/cases/new"
        className="app-button-primary fixed bottom-[calc(94px+env(safe-area-inset-bottom))] right-4 z-20 gap-2 px-4 py-3 text-sm"
        aria-label="New analysis"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New
      </Link>
    </AppShell>
  )
}
