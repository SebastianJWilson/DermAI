const MAX_LENGTH = 500

export default function CaseDescriptionInput({ value, onChange, error }) {
  return (
    <div>
      <label htmlFor="case-description" className="block text-sm font-medium text-slate-700 mb-1">
        Describe your concern <span className="text-red-500">*</span>
      </label>
      <textarea
        id="case-description"
        rows={3}
        maxLength={MAX_LENGTH}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
        placeholder="e.g., Red bumps on cheek, itchy for 2 weeks"
      />
      <div className="flex justify-between items-center mt-1">
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          <span />
        )}
        <span className="text-xs text-slate-400 ml-auto">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  )
}
