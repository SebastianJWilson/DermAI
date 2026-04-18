import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useCasePipeline } from '../hooks/useCasePipeline'
import AppShell from '../components/layout/AppShell'
import PipelineProgress from '../components/pipeline/PipelineProgress'
import DiagnosisResults from '../components/pipeline/DiagnosisResults'
import ProductResults from '../components/pipeline/ProductResults'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorBanner from '../components/ui/ErrorBanner'

function CaseImage({ imagePath, small = false }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!imagePath) return
    supabase.storage
      .from('case-images')
      .createSignedUrl(imagePath, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) setUrl(data.signedUrl)
      })
  }, [imagePath])

  if (!url) return null

  return (
    <img
      src={url}
      alt="Case photo"
      className={`w-full rounded-[1.5rem] object-cover ${small ? 'max-h-[160px]' : 'max-h-[320px]'}`}
    />
  )
}

export default function CaseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [realtimeStatus, setRealtimeStatus] = useState('connected')

  // Fetch initial case data
  useEffect(() => {
    if (!id) return
    setLoading(true)

    supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        setLoading(false)
        if (error || !data) {
          setFetchError('Case not found.')
        } else {
          setCaseData(data)
        }
      })
  }, [id])

  // Supabase Realtime subscription (Section 11)
  useEffect(() => {
    if (!id) return

    const subscription = supabase
      .channel(`case-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setCaseData(payload.new)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected')
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setRealtimeStatus('reconnecting')
      })

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [id])

  // Run pipeline hook
  useCasePipeline(caseData, user?.id)

  async function handleRetry() {
    if (!caseData) return
    // Re-fetch current status from DB then reload
    const { data } = await supabase.from('cases').select('*').eq('id', id).single()
    if (data) setCaseData(data)
  }

  if (loading) {
    return (
      <AppShell title="Case">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    )
  }

  if (fetchError || !caseData) {
    return (
      <AppShell title="Case">
        <div className="p-4">
          <ErrorBanner message={fetchError || 'Case not found.'} />
          <Link to="/cases" className="mt-4 block text-center text-teal-600 text-sm font-medium">
            Back to Cases
          </Link>
        </div>
      </AppShell>
    )
  }

  const { status, title, image_path, conditions, selected_condition, ranked_products, top_product, error_message } = caseData

  const isEarlyStage = status === 'pending' || status === 'diagnosing'
  const isMidStage = status === 'diagnosis_complete' || status === 'searching_products'
  const isRankingStage = status === 'ranking_products'
  const isComplete = status === 'complete'
  const isError = status === 'error'

  return (
    <AppShell title="Recommendation">
      <div className="space-y-5">
        {realtimeStatus === 'reconnecting' && (
          <div className="rounded-[1.2rem] border border-yellow-200 bg-yellow-50 px-4 py-2 text-center text-xs text-yellow-700">
            Reconnecting to live updates...
          </div>
        )}

        <section className="app-panel space-y-4">
          <div className="space-y-2">
            <span className="app-kicker">Concern</span>
            <h1 className="max-w-[12ch] text-[2rem] font-semibold leading-[0.96] tracking-[-0.06em] text-[#18211d]">
              {isComplete ? 'Recommendation ready.' : 'Your scan is in progress.'}
            </h1>
            <p className="text-sm leading-6 text-[#5e6a60]">&quot;{title}&quot;</p>
          </div>

          <CaseImage imagePath={image_path} small={!isEarlyStage} />
        </section>

        {!isError && <PipelineProgress status={status} />}

        {isEarlyStage && (
          <div className="app-panel-muted space-y-3 py-6 text-center">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="text-sm text-[#5e6a60]">This usually takes 15 to 30 seconds.</p>
          </div>
        )}

        {(isMidStage || isRankingStage) && conditions?.length > 0 && (
          <>
            <DiagnosisResults
              conditions={conditions}
              selectedCondition={selected_condition}
              collapsed={false}
            />
            {isMidStage && (
              <div className="app-panel-muted text-center text-sm text-[#5e6a60]">
                Searching for products that treat <strong>{selected_condition}</strong>.
              </div>
            )}
            {isRankingStage && (
              <div className="app-panel-muted text-center text-sm text-[#5e6a60]">
                Reading and ranking review data for the strongest match.
              </div>
            )}
          </>
        )}

        {isComplete && (
          <>
            <DiagnosisResults
              conditions={conditions}
              selectedCondition={selected_condition}
              collapsed={true}
            />
            <ProductResults
              rankedProducts={ranked_products}
              topProduct={top_product}
              condition={selected_condition}
            />
            <p className="pb-4 text-center text-xs text-[#7f8b83]">
              AI-generated from publicly available review data. Not a medical endorsement.
            </p>
          </>
        )}

        {isError && (
          <div className="app-panel space-y-4">
            <div className="flex flex-col items-center space-y-2 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-red-100">
                <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#18211d]">Processing stopped</h2>
              {error_message && (
                <p className="text-sm text-[#5e6a60]">{error_message}</p>
              )}
            </div>
            <button
              onClick={handleRetry}
              className="app-button-primary w-full"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
