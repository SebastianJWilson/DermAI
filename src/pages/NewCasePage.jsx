import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import ImageUploadZone from '../components/cases/ImageUploadZone'
import CaseDescriptionInput from '../components/cases/CaseDescriptionInput'

export default function NewCasePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [imageData, setImageData] = useState(null) // { file, previewUrl }
  const [imageError, setImageError] = useState('')
  const [description, setDescription] = useState('')
  const [descError, setDescError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function handleImageSelected(data, errorMsg) {
    if (errorMsg) {
      setImageError(errorMsg)
      setImageData(null)
    } else {
      setImageError('')
      setImageData(data)
    }
  }

  const canSubmit = imageData && description.trim().length > 0 && !submitting

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    // Validate
    let hasError = false
    if (!imageData) { setImageError('Please upload a photo'); hasError = true }
    if (!description.trim()) { setDescError('Please describe your concern'); hasError = true }
    if (hasError) return

    setSubmitError('')
    setSubmitting(true)

    const caseId = uuidv4()
    const imagePath = `${user.id}/${caseId}.jpg`

    // Upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('case-images')
      .upload(imagePath, imageData.file, { contentType: imageData.file.type, upsert: false })

    if (uploadError) {
      setSubmitError('Image upload failed. Please try again.')
      setSubmitting(false)
      return
    }

    // Insert case row
    const { error: insertError } = await supabase
      .from('cases')
      .insert({
        id: caseId,
        user_id: user.id,
        title: description.trim(),
        image_path: imagePath,
        status: 'pending',
      })

    if (insertError) {
      // Clean up uploaded image on insert failure
      await supabase.storage.from('case-images').remove([imagePath])
      setSubmitError('Failed to create case. Please try again.')
      setSubmitting(false)
      return
    }

    navigate(`/cases/${caseId}`, { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 max-w-[430px] mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
        <Link
          to="/cases"
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Back to cases"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-slate-900">New Case</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {submitError}
          </div>
        )}

        <ImageUploadZone
          imagePreview={imageData?.previewUrl ?? null}
          onImageSelected={handleImageSelected}
          error={imageError}
        />

        <CaseDescriptionInput
          value={description}
          onChange={val => { setDescription(val); if (val.trim()) setDescError('') }}
          error={descError}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold rounded-xl transition-colors"
        >
          {submitting ? 'Uploading…' : 'Analyze My Skin'}
        </button>

        <p className="text-xs text-slate-400 text-center pb-4">
          Photos and case data are sent to third-party AI services. Do not include identifying
          information beyond the skin area of concern.
        </p>
      </form>
    </div>
  )
}
