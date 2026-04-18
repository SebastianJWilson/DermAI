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
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      {/* Age */}
      <div>
        <label htmlFor="ob-age" className="block text-sm font-medium text-slate-700 mb-1">
          Age <span className="text-red-500">*</span>
        </label>
        <input
          id="ob-age"
          type="number"
          min="1"
          max="120"
          value={age}
          onChange={e => setAge(e.target.value)}
          className={`w-full h-11 px-3 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            errors.age ? 'border-red-400' : 'border-slate-300'
          }`}
          placeholder="e.g. 28"
        />
        {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="ob-weight" className="block text-sm font-medium text-slate-700 mb-1">
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
            className={`flex-1 h-11 px-3 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.weight ? 'border-red-400' : 'border-slate-300'
            }`}
            placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
          />
          <div className="flex rounded-lg border border-slate-300 overflow-hidden h-11">
            {['kg', 'lbs'].map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setWeightUnit(u)}
                className={`px-3 text-sm font-medium transition-colors ${
                  weightUnit === u
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        {errors.weight && <p className="mt-1 text-xs text-red-600">{errors.weight}</p>}
      </div>

      {/* Skin Type */}
      <div>
        <p className="block text-sm font-medium text-slate-700 mb-2">
          Skin Type <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setSkinType(type)}
              className={`h-10 px-4 rounded-full text-sm font-medium capitalize transition-colors border ${
                skinType === type
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.skinType && <p className="mt-1 text-xs text-red-600">{errors.skinType}</p>}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="ob-location" className="block text-sm font-medium text-slate-700 mb-1">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          id="ob-location"
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className={`w-full h-11 px-3 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            errors.location ? 'border-red-400' : 'border-slate-300'
          }`}
          placeholder="City, Country"
        />
        {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
      </div>

      {/* Race / Ethnicity */}
      <div>
        <label htmlFor="ob-race" className="block text-sm font-medium text-slate-700 mb-1">
          Race / Ethnicity{' '}
          <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <p className="text-xs text-slate-500 mb-1">
          May help improve accuracy for your skin tone
        </p>
        <input
          id="ob-race"
          type="text"
          value={raceEthnicity}
          onChange={e => setRaceEthnicity(e.target.value)}
          className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="e.g. East Asian, Hispanic, Black, etc."
        />
      </div>

      {/* Biological Sex */}
      <div>
        <label htmlFor="ob-sex" className="block text-sm font-medium text-slate-700 mb-1">
          Biological Sex <span className="text-red-500">*</span>
        </label>
        <select
          id="ob-sex"
          value={biologicalSex}
          onChange={e => setBiologicalSex(e.target.value)}
          className={`w-full h-11 px-3 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            errors.biologicalSex ? 'border-red-400' : 'border-slate-300'
          }`}
        >
          <option value="">Select…</option>
          {BIO_SEX_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.biologicalSex && (
          <p className="mt-1 text-xs text-red-600">{errors.biologicalSex}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isFormValid() || loading}
        className="w-full h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Saving…' : 'Continue'}
      </button>
    </form>
  )
}
