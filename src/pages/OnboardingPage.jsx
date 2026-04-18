import { useNavigate } from 'react-router-dom'
import DemographicsForm from '../components/onboarding/DemographicsForm'

export default function OnboardingPage() {
  const navigate = useNavigate()

  function handleSuccess() {
    navigate('/cases', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="w-full max-w-[430px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Welcome — Let&apos;s get started</h1>
          <p className="mt-2 text-sm text-slate-500">
            This helps our AI give you more accurate results.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <DemographicsForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
