import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { diagnoseSkin, rankProducts } from '../lib/featherlessClient'
import { findProductsAndReviews } from '../lib/tinyfishClient'

/**
 * Orchestrates the 3-step AI pipeline for a case.
 * Reads case.status on mount and decides which step to start from (Section 12).
 * Each step writes its output + next status to Supabase before continuing.
 */
export function useCasePipeline(caseData, userId) {
  const runningRef = useRef(false)

  useEffect(() => {
    if (!caseData || !userId) return

    const { status } = caseData

    // Steps that should trigger pipeline run
    const shouldRun = [
      'pending',
      'diagnosing',
      'diagnosis_complete',
      'searching_products',
      'ranking_products',
    ].includes(status)

    if (!shouldRun) return
    if (runningRef.current) return

    runningRef.current = true

    runPipeline(caseData, userId).finally(() => {
      runningRef.current = false
    })
  }, [caseData?.id, caseData?.status, userId]) // eslint-disable-line react-hooks/exhaustive-deps
}

async function updateCase(caseId, updates) {
  const { error } = await supabase
    .from('cases')
    .update(updates)
    .eq('id', caseId)

  if (error) throw new Error(`DB update failed: ${error.message}`)
}

async function runPipeline(caseData, userId) {
  if (!navigator.onLine) {
    // Don't start pipeline when offline; the offline banner informs the user
    return
  }
  const { id: caseId, status } = caseData

  // Determine start step per Section 12 resume logic
  let startStep = 1
  if (status === 'diagnosis_complete') startStep = 2
  else if (status === 'searching_products') startStep = 2
  else if (status === 'ranking_products') startStep = 3

  // ─────────────────────────────────────────
  // STEP 1 — Featherless AI Vision Diagnosis
  // ─────────────────────────────────────────
  if (startStep <= 1) {
    try {
      await updateCase(caseId, { status: 'diagnosing' })

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw new Error(`Profile fetch failed: ${profileError.message}`)

      // Fetch image from Supabase Storage as base64
      const { data: imageBlob, error: imageError } = await supabase.storage
        .from('case-images')
        .download(caseData.image_path)

      if (imageError) throw new Error(`Image download failed: ${imageError.message}`)

      const base64 = await blobToBase64(imageBlob)
      const mediaType = imageBlob.type || 'image/jpeg'
      // Strip the data: prefix — we only need the raw base64
      const rawBase64 = base64.includes(',') ? base64.split(',')[1] : base64

      const result = await diagnoseSkin({
        imageBase64: rawBase64,
        mediaType,
        demographics: profile,
        caseTitle: caseData.title,
      })

      const conditions = (result.conditions ?? []).sort((a, b) => b.confidence - a.confidence)
      const selected_condition = conditions[0]?.name ?? null

      await updateCase(caseId, {
        status: 'diagnosis_complete',
        conditions,
        selected_condition,
      })

      // Continue to step 2 with updated data
      caseData = { ...caseData, status: 'diagnosis_complete', conditions, selected_condition }
      startStep = 2
    } catch (err) {
      await setError(caseId, 'Diagnosis failed')
      return
    }
  }

  // ─────────────────────────────────────────
  // STEP 2 — Tinyfish AI Product + Review Search
  // ─────────────────────────────────────────
  if (startStep <= 2) {
    const condition = caseData.selected_condition
    if (!condition) {
      await setError(caseId, 'No condition selected')
      return
    }

    try {
      await updateCase(caseId, { status: 'searching_products' })

      const rawProductsAndReviews = await findProductsAndReviews({ condition })

      if (!rawProductsAndReviews?.products?.length) {
        await setError(caseId, 'No products found')
        return
      }

      await updateCase(caseId, {
        status: 'ranking_products',
        raw_products_and_reviews: rawProductsAndReviews,
      })

      caseData = { ...caseData, status: 'ranking_products', raw_products_and_reviews: rawProductsAndReviews }
      startStep = 3
    } catch (err) {
      await setError(caseId, 'Product search failed')
      return
    }
  }

  // ─────────────────────────────────────────
  // STEP 3 — Featherless AI Review Synthesis & Ranking
  // ─────────────────────────────────────────
  if (startStep <= 3) {
    const condition = caseData.selected_condition

    // Fetch raw products if not in caseData (resume case)
    let rawProductsAndReviews = caseData.raw_products_and_reviews
    if (!rawProductsAndReviews) {
      const { data, error } = await supabase
        .from('cases')
        .select('raw_products_and_reviews, selected_condition')
        .eq('id', caseId)
        .single()
      if (error || !data?.raw_products_and_reviews) {
        await setError(caseId, 'Ranking failed')
        return
      }
      rawProductsAndReviews = data.raw_products_and_reviews
    }

    try {
      const rankedArray = await rankProducts({
        rawProductsAndReviews,
        condition: condition ?? 'skin condition',
      })

      const ranked_products = rankedArray.sort((a, b) => a.rank - b.rank)
      const top_product = ranked_products[0] ?? null

      await updateCase(caseId, {
        status: 'complete',
        ranked_products,
        top_product,
      })
    } catch (err) {
      await setError(caseId, 'Ranking failed')
    }
  }
}

async function setError(caseId, message) {
  await supabase
    .from('cases')
    .update({ status: 'error', error_message: message })
    .eq('id', caseId)
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
