import { useRef } from 'react'

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ImageUploadZone({ imagePreview, onImageSelected, error }) {
  const inputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      onImageSelected(null, 'Please use JPG, PNG, or WebP')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      onImageSelected(null, 'Image must be under 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      onImageSelected({ file, previewUrl: reader.result })
    }
    reader.readAsDataURL(file)

    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload photo"
      />

      {imagePreview ? (
        <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 200 }}>
          <img
            src={imagePreview}
            alt="Selected skin photo"
            className="w-full object-cover rounded-xl"
            style={{ maxHeight: 300 }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            Change Photo
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50'
          }`}
          style={{ minHeight: 200 }}
          aria-label="Tap to upload or take a photo"
        >
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">Tap to upload or take a photo</p>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · Max 10MB</p>
          </div>
        </button>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
