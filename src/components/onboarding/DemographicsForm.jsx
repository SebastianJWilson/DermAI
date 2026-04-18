import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'

const SKIN_TYPES = ['oily', 'dry', 'combination', 'normal', 'sensitive']
const BIO_SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export default function DemographicsForm({ onSuccess }) {
  const { user, refreshProfile } = useAuth()
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [skinType, setSkinType] = useState('')
  const [location, setLocation] = useState('')
  const [raceEthnicity, setRaceEthnicity] = useState('')
  const [biologicalSex, setBiologicalSex] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const errs = {}
    if (!age || isNaN(age) || Number(age) < 1 || Number(age) > 120)
      errs.age = 'Please enter a valid age'
    if (!weight || isNaN(weight) || Number(weight) <= 0)
      errs.weight = 'Please enter a valid weight'
    if (!skinType) errs.skinType = 'Please select your skin type'
    if (!location.trim()) errs.location = 'Please enter your location'
    if (!biologicalSex) errs.biologicalSex = 'Please select an option'
    return errs
  }

  function isFormValid() {
    return (
      age && !isNaN(age) && Number(age) > 0 &&
      weight && !isNaN(weight) && Number(weight) > 0 &&
      skinType &&
      location.trim() &&
      biologicalSex
    )
  }

  function toKg(value, unit) {
    const num = parseFloat(value)
    if (unit === 'lbs') return Math.round((num / 2.205) * 10) / 10
    return num
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)

    const weight_kg = toKg(weight, weightUnit)

    const { error } = await supabase
      .from('profiles')
      .update({
        age: parseInt(age, 10),
        weight_kg,
        skin_type: skinType,
        location: location.trim(),
        race_ethnicity: raceEthnicity.trim() || null,
        biological_sex: biologicalSex,
        onboarding_complete: true,
      })
      .eq('id', user.id)

    setLoading(false)

    if (error) {
      setServerError(error.message)
    } else {
      await refreshProfile()
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {serverError && (
        <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="ob-age" className="block text-sm font-medium text-[#324036]">
          Age <span className="text-red-500">*</span>
        </label>
        <input
          id="ob-age"
          type="number"
          min="1"
          max="120"
          value={age}
          onChange={e => setAge(e.target.value)}
          className={`app-input ${errors.age ? 'border-red-400 focus:border-red-400' : ''}`}
          placeholder="e.g. 28"
        />
        {errors.age && <p className="text-xs text-red-600">{errors.age}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="ob-weight" className="block text-sm font-medium text-[#324036]">
          Weight <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            id="ob-weight"
            type="number"
            min="1"
            step="0.1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className={`app-input flex-1 ${errors.weight ? 'border-red-400 focus:border-red-400' : ''}`}
            placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
          />
          <div className="flex h-12 overflow-hidden rounded-full border border-[#18211d]/10 bg-white/76 p-1">
            {['kg', 'lbs'].map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setWeightUnit(u)}
                className={`rounded-full px-3 text-sm font-medium transition-all ${
                  weightUnit === u
                    ? 'bg-[#18211d] text-white'
                    : 'bg-transparent text-[#5e6a60] hover:bg-[#f3efe7]'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        {errors.weight && <p className="text-xs text-red-600">{errors.weight}</p>}
      </div>

      <div className="space-y-3">
        <p className="block text-sm font-medium text-[#324036]">
          Skin Type <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setSkinType(type)}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium capitalize transition-all ${
                skinType === type
                  ? 'border-[#18211d] bg-[#18211d] text-white shadow-[0_14px_28px_rgba(24,33,29,0.12)]'
                  : 'border-[#18211d]/10 bg-white/75 text-[#5e6a60] hover:border-[#18211d]/20'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.skinType && <p className="text-xs text-red-600">{errors.skinType}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="ob-location" className="block text-sm font-medium text-[#324036]">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          id="ob-location"
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className={`app-input ${errors.location ? 'border-red-400 focus:border-red-400' : ''}`}
          placeholder="City, Country"
        />
        {errors.location && <p className="text-xs text-red-600">{errors.location}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="ob-race" className="block text-sm font-medium text-[#324036]">
          Race / Ethnicity{' '}
          <span className="font-normal text-[#7f8b83]">(Optional)</span>
        </label>
        <p className="text-xs text-[#7f8b83]">
          May help improve accuracy for your skin tone
        </p>
        <input
          id="ob-race"
          type="text"
          value={raceEthnicity}
          onChange={e => setRaceEthnicity(e.target.value)}
          className="app-input"
          placeholder="e.g. East Asian, Hispanic, Black, etc."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="ob-sex" className="block text-sm font-medium text-[#324036]">
          Biological Sex <span className="text-red-500">*</span>
        </label>
        <select
          id="ob-sex"
          value={biologicalSex}
          onChange={e => setBiologicalSex(e.target.value)}
          className={`app-select ${errors.biologicalSex ? 'border-red-400 focus:border-red-400' : ''}`}
        >
          <option value="">Select…</option>
          {BIO_SEX_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.biologicalSex && (
          <p className="text-xs text-red-600">{errors.biologicalSex}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isFormValid() || loading}
        className="app-button-primary w-full"
      >
        <span>{loading ? 'Saving...' : 'Continue'}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </span>
      </button>
    </form>
  )
}
