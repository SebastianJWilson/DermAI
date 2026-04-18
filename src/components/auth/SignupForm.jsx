import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SignupForm({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const errs = {}
    if (!email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
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

    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) {
      setServerError(error.message)
    } else {
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`w-full h-11 px-3 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            errors.email ? 'border-red-400' : 'border-slate-300'
          }`}
          placeholder="you@example.com"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={`w-full h-11 px-3 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            errors.password ? 'border-red-400' : 'border-slate-300'
          }`}
          placeholder="Min. 8 characters"
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="signup-confirm" className="block text-sm font-medium text-slate-700 mb-1">
          Confirm Password
        </label>
        <input
          id="signup-confirm"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className={`w-full h-11 px-3 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            errors.confirmPassword ? 'border-red-400' : 'border-slate-300'
          }`}
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}
