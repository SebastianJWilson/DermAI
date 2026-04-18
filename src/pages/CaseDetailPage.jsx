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
      className={`w-full rounded-xl object-cover ${small ? 'max-h-[120px]' : 'max-h-[300px]'}`}
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
    <AppShell title="Case Detail">
      <div className="p-4 space-y-5">
        {/* Reconnecting banner */}
        {realtimeStatus === 'reconnecting' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-4 py-2 text-xs text-center">
            Reconnecting to live updates…
          </div>
        )}

        {/* Image */}
        <CaseImage imagePath={image_path} small={!isEarlyStage} />

        {/* Title */}
        <p className="text-sm text-slate-500 italic">"{title}"</p>

        {/* Pipeline Progress */}
        {!isError && (
          <PipelineProgress status={status} />
        )}

        {/* Stage-specific content */}
        {isEarlyStage && (
          <div className="text-center py-4 space-y-3">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="text-sm text-slate-500">This usually takes 15–30 seconds…</p>
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
              <p className="text-sm text-slate-500 text-center">
                Searching for products that treat <strong>{selected_condition}</strong>…
              </p>
            )}
            {isRankingStage && (
              <p className="text-sm text-slate-500 text-center">
                Reading and analyzing product reviews…
              </p>
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
            <p className="text-xs text-slate-400 text-center pb-4">
              AI-generated from publicly available review data. Not a medical endorsement.
            </p>
          </>
        )}

        {isError && (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-2 py-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
              {error_message && (
                <p className="text-sm text-slate-500">{error_message}</p>
              )}
            </div>
            <button
              onClick={handleRetry}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
