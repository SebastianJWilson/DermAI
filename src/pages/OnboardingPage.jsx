import { useNavigate } from 'react-router-dom'
import DemographicsForm from '../components/onboarding/DemographicsForm'

export default function OnboardingPage() {
  const navigate = useNavigate()

  function handleSuccess() {
    navigate('/cases', { replace: true })
  }

  return (
    <div className="app-screen px-4 py-6">
      <div className="app-mobile-frame space-y-8">
        <section className="space-y-3">
          <h1 className="max-w-[12ch] text-[2.5rem] font-semibold leading-[0.95] tracking-[-0.07em] text-[#18211d]">
            Profile
          </h1>
          <p className="max-w-[30ch] text-sm leading-6 text-[#5e6a60]">
            Used only to tune matches. You can keep answers short for a demo.
          </p>
        </section>

        <div className="app-panel">
          <DemographicsForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
