import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

function NavIcon({ children, label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex min-w-[84px] flex-col items-center gap-1 rounded-[1.1rem] px-3 py-2.5 text-[11px] font-medium tracking-[0.02em] transition-all duration-300 ${
          isActive
            ? 'bg-[#18211d] text-white shadow-[0_14px_28px_rgba(24,33,29,0.16)]'
            : 'text-[#5e6a60] hover:bg-white/65 hover:text-[#18211d]'
        }`
      }
    >
      {children}
      <span className="touch-target-override">{label}</span>
    </NavLink>
  )
}

export default function AppShell({ children, title }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const signOutBtnRef = useRef(null)

  // Move focus into dialog when it opens
  useEffect(() => {
    if (showSignOutDialog) {
      signOutBtnRef.current?.focus()
    }
  }, [showSignOutDialog])

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '?'

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#18211d] focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="app-mobile-frame px-4 pb-[calc(112px+env(safe-area-inset-bottom))] pt-3">
        <header className="app-floating-nav sticky top-[calc(env(safe-area-inset-top)+12px)] z-20 mb-5 rounded-[1.8rem] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-[-0.04em] text-[#18211d]">{title}</h1>
            </div>

            <button
              onClick={() => setShowSignOutDialog(true)}
              className="flex h-11 w-11 items-center justify-center rounded-[1.2rem] border border-[#18211d]/8 bg-white/80 text-sm font-semibold text-[#18211d] transition-all duration-300 hover:-translate-y-0.5"
              aria-label="Account menu"
            >
              {initials}
            </button>
          </div>
        </header>

        <main id="main-content" className="app-fade-up">
          {children}
        </main>
      </div>

      <nav
        className="app-floating-nav fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-1.5rem)] max-w-[398px] -translate-x-1/2 items-center justify-around rounded-[1.9rem] px-2 py-2"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        <NavIcon to="/cases" label="Cases">
          <svg className="h-5 w-5 touch-target-override" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </NavIcon>
        <NavIcon to="/cases/new" label="New">
          <svg className="h-5 w-5 touch-target-override" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </NavIcon>
        <button
          onClick={() => setShowSignOutDialog(true)}
          className="flex min-w-[84px] flex-col items-center gap-1 rounded-[1.1rem] px-3 py-2.5 text-[11px] font-medium tracking-[0.02em] text-[#5e6a60] transition-all duration-300 hover:bg-white/65 hover:text-[#18211d]"
          aria-label="Profile"
        >
          <svg className="h-5 w-5 touch-target-override" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="touch-target-override">Profile</span>
        </button>
      </nav>

      {showSignOutDialog && (
        <div className="fixed inset-0 z-50 flex items-end bg-[#18211d]/28 px-4" onClick={() => setShowSignOutDialog(false)}>
          <div
            className="app-panel mb-4 w-full max-w-[430px] space-y-4 rounded-[2rem] px-5 py-5"
            onClick={e => e.stopPropagation()}
            style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
          >
            <div className="space-y-2">
              <span className="app-kicker">Session</span>
              <h2 className="text-[1.45rem] font-semibold tracking-[-0.04em] text-[#18211d]">Sign out</h2>
              <p className="max-w-[28ch] text-sm leading-6 text-[#5e6a60]">
                You can sign back in anytime to review past analyses and recommendations.
              </p>
            </div>

            <div className="grid gap-3">
              <button
                ref={signOutBtnRef}
                onClick={handleSignOut}
                className="app-button-primary w-full"
              >
                Sign out
              </button>
              <button
                onClick={() => setShowSignOutDialog(false)}
                className="app-button-secondary w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
