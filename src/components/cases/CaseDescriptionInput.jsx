const MAX_LENGTH = 500

export default function CaseDescriptionInput({ value, onChange, error }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="case-description" className="block text-sm font-medium text-[#324036]">
          Describe your concern <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-[#7f8b83]">{value.length}/{MAX_LENGTH}</span>
      </div>
      <textarea
        id="case-description"
        rows={3}
        maxLength={MAX_LENGTH}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`app-textarea resize-none ${error ? 'border-red-400 focus:border-red-400' : ''}`}
        placeholder="Example: red bumps on my cheek for two weeks, flares after workouts."
      />
      <div className="flex justify-between gap-3">
        <p className="text-xs text-[#7f8b83]">Keep it short and specific.</p>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  )
}
