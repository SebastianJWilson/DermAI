import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const errs = {}
    if (!email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email'
    if (!password) errs.password = 'Password is required'
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

    const { error } = await supabase.auth.signInWithPassword({ email, password })
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
        <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="login-email" className="block text-sm font-medium text-[#324036]">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`app-input ${errors.email ? 'border-red-400 focus:border-red-400' : ''}`}
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="login-password" className="block text-sm font-medium text-[#324036]">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={`app-input ${errors.password ? 'border-red-400 focus:border-red-400' : ''}`}
          placeholder="••••••••"
        />
        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="app-button-primary w-full"
      >
        <span>{loading ? 'Signing in...' : 'Sign in'}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </span>
      </button>
    </form>
  )
}
