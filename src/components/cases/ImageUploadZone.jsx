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
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#728077]">Photo</p>
        <p className="text-sm text-[#5e6a60]">Use a clear close-up with even light.</p>
      </div>

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
        <div className="app-card relative overflow-hidden p-2" style={{ minHeight: 240 }}>
          <img
            src={imagePreview}
            alt="Selected skin photo"
            className="w-full rounded-[1.2rem] object-cover"
            style={{ maxHeight: 320 }}
          />
          <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-[1.2rem] border border-white/10 bg-[#18211d]/82 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-medium">Preview ready</p>
              <p className="text-xs text-white/65">Swap it if you want a sharper close-up.</p>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="touch-target-override rounded-full border border-white/14 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`app-card flex w-full flex-col items-start justify-between gap-6 text-left ${
            error ? 'border-red-300 bg-red-50/70' : 'hover:-translate-y-0.5'
          }`}
          style={{ minHeight: 240 }}
          aria-label="Tap to upload or take a photo"
        >
          <div className="flex w-full items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[#e7efe1] text-[#18211d]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <div className="app-chip">JPG, PNG, WebP</div>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-semibold tracking-[-0.03em] text-[#18211d]">
              Tap to upload or capture
            </p>
            <p className="max-w-[28ch] text-sm leading-6 text-[#5e6a60]">
              Keep the concern centered. Avoid filters, makeup, or harsh shadows when possible.
            </p>
          </div>

          <div className="flex w-full items-center justify-between text-xs text-[#7f8b83]">
            <span>Camera ready</span>
            <span>Max 10MB</span>
          </div>
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
