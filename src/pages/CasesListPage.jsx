import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import AppShell from '../components/layout/AppShell'
import CaseCard from '../components/cases/CaseCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3 animate-pulse">
      <div className="w-[60px] h-[60px] rounded-lg bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-2.5 bg-slate-200 rounded w-1/3" />
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

  return (
    <AppShell title="My Cases">
      <div className="px-4 py-4 space-y-3">
        {/* Pull to refresh button (mobile fallback) */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-full text-xs text-teal-600 py-1 flex items-center justify-center gap-1 disabled:text-slate-400"
          aria-label="Refresh cases"
        >
          {refreshing ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
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
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <div>
              <p className="text-slate-700 font-semibold">No cases yet</p>
              <p className="text-sm text-slate-400 mt-1">Start your first skin analysis</p>
            </div>
            <Link
              to="/cases/new"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Start a Case
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

      {/* FAB */}
      <Link
        to="/cases/new"
        className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-4 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center z-20 transition-colors"
        aria-label="New case"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </Link>
    </AppShell>
  )
}
