import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

function NavIcon({ children, label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 min-w-[56px] py-2 px-3 rounded-lg transition-colors ${
          isActive ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'
        }`
      }
    >
      {children}
      <span className="text-[10px] font-medium">{label}</span>
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
    <div className="flex flex-col min-h-screen bg-slate-50 max-w-[430px] mx-auto">
      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:text-teal-700 focus:font-medium focus:shadow"
      >
        Skip to main content
      </a>
      {/* Top header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        <button
          onClick={() => setShowSignOutDialog(true)}
          className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-semibold text-sm flex items-center justify-center"
          aria-label="Account menu"
        >
          {initials}
        </button>
      </header>

      {/* Main content */}
      <main id="main-content" className="flex-1 pb-[calc(64px+env(safe-area-inset-bottom))]">
        {children}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-200 flex items-center justify-around px-2 z-10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <NavIcon to="/cases" label="Cases">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </NavIcon>
        <NavIcon to="/cases/new" label="New Case">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </NavIcon>
        <button
          onClick={() => setShowSignOutDialog(true)}
          className="flex flex-col items-center gap-0.5 min-w-[56px] py-2 px-3 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
          aria-label="Profile"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>

      {/* Sign out dialog */}
      {showSignOutDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setShowSignOutDialog(false)}>
          <div
            className="w-full max-w-[430px] mx-auto bg-white rounded-t-2xl p-6 space-y-3"
            onClick={e => e.stopPropagation()}
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          >
            <h2 className="text-lg font-semibold text-slate-900">Sign out?</h2>
            <p className="text-sm text-slate-500">You&apos;ll need to sign in again to access your cases.</p>
            <button
              ref={signOutBtnRef}
              onClick={handleSignOut}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
            >
              Sign Out
            </button>
            <button
              onClick={() => setShowSignOutDialog(false)}
              className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
