import { Link } from 'react-router-dom'
import SignupForm from '../components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="app-screen px-4 py-6">
      <div className="app-mobile-frame flex min-h-[calc(100dvh-3rem)] flex-col justify-between">
        <div className="space-y-8">
          <section className="space-y-3">
            <h1 className="max-w-[12ch] text-[2.5rem] font-semibold leading-[0.95] tracking-[-0.07em] text-[#18211d]">
              Create account
            </h1>
            <p className="max-w-[30ch] text-sm leading-6 text-[#5e6a60]">
              Same flow as sign in: upload, concern text, then ranked products.
            </p>
          </section>

          <div className="app-panel space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#728077]">Create account</p>
              <p className="text-sm text-[#5e6a60]">Takes less than a minute.</p>
            </div>
            <SignupForm />
          </div>
        </div>

        <p className="pb-2 text-center text-sm text-[#5e6a60]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#18211d] underline decoration-[#9cb49a] underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
