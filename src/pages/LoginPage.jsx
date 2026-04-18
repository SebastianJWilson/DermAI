import { Link } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="app-screen px-4 py-6">
      <div className="app-mobile-frame flex min-h-[calc(100dvh-3rem)] flex-col justify-between">
        <div className="space-y-8">
          <section className="space-y-3">
            <h1 className="max-w-[12ch] text-[2.5rem] font-semibold leading-[0.95] tracking-[-0.07em] text-[#18211d]">
              Sign in
            </h1>
            <p className="max-w-[30ch] text-sm leading-6 text-[#5e6a60]">
              Photo plus a short note, then product picks from the database.
            </p>
          </section>

          <div className="app-panel space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#728077]">Sign in</p>
              <p className="text-sm text-[#5e6a60]">Pick up where you left off.</p>
            </div>
            <LoginForm />
          </div>
        </div>

        <p className="pb-2 text-center text-sm text-[#5e6a60]">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#18211d] underline decoration-[#9cb49a] underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
