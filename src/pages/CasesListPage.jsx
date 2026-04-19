import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import AppShell from '../components/layout/AppShell'
import CaseCard from '../components/cases/CaseCard'
import NewCaseListRow from '../components/cases/NewCaseListRow'

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
  const { user, profile } = useAuth()
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
      setError('Could not load cases.')
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

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const weeklyCount = cases.filter(c => new Date(c.created_at) > sevenDaysAgo).length
  const isLimited = profile?.subscription_tier !== 'premium' && weeklyCount >= 1

  const casesHeaderExtra = (
    <div className="flex shrink-0 items-center gap-2">
      <div
        role="group"
        aria-label={`${cases.length} total, ${completedCount} complete`}
        className="flex items-center rounded-full border border-[#18211d]/10 bg-white/90 px-2.5 py-1.5 text-[11px] leading-none shadow-[0_1px_0_rgba(24,33,29,0.04)]"
      >
        <span className="text-[#7f8b83]">All</span>
        <span className="ml-1 font-semibold tabular-nums text-[#18211d]">{cases.length}</span>
        <span className="mx-2 h-3 w-px shrink-0 bg-[#18211d]/12" aria-hidden />
        <span className="text-[#7f8b83]">Done</span>
        <span className="ml-1 font-semibold tabular-nums text-[#18211d]">{completedCount}</span>
      </div>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={refreshing}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#18211d]/10 bg-white/90 text-[#18211d] shadow-[0_1px_0_rgba(24,33,29,0.04)] transition-colors hover:bg-white disabled:opacity-50"
        aria-label={refreshing ? 'Refreshing' : 'Refresh cases'}
      >
        <svg
          className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  )

  return (
    <AppShell title="Cases" headerExtra={casesHeaderExtra}>
      <div className="space-y-4">
        {error && (
          <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <NewCaseListRow weeklyCount={weeklyCount} isLimited={isLimited} isPremium={profile?.subscription_tier === 'premium'} />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : cases.length === 0 ? (
          <div className="space-y-3">
            <NewCaseListRow weeklyCount={weeklyCount} isLimited={isLimited} isPremium={profile?.subscription_tier === 'premium'} />
            <div className="app-panel py-10 text-center">
              <p className="text-sm text-[#5e6a60]">No cases yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <NewCaseListRow weeklyCount={weeklyCount} isLimited={isLimited} isPremium={profile?.subscription_tier === 'premium'} />
            {cases.map(c => (
              <CaseCard key={c.id} caseData={c} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
