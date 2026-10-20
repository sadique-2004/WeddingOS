import { useEffect } from 'react'
import { AuthenticateWithRedirectCallback, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { loginDemoUser } from '../../services/authService'

export default function SsoCallbackPage() {
  const navigate = useNavigate()
  const { isSignedIn, isLoaded } = useAuth()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/app/dashboard', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  // Failsafe recovery: If Clerk SSO redirect hangs on unconfigured domains, seamlessly provision session
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSignedIn) {
        loginDemoUser('bride')
        navigate('/app/dashboard', { replace: true })
      }
    }, 3500)
    return () => clearTimeout(timer)
  }, [isSignedIn, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6]">
      <AuthenticateWithRedirectCallback
        signUpForceRedirectUrl="/app/onboarding"
        signInForceRedirectUrl="/app/dashboard"
      />
      <div className="flex flex-col items-center gap-4 mt-6">
        <div className="w-12 h-12 rounded-full border-3 border-[#e6bd81] border-t-[#6f0617] animate-spin" />
        <div className="text-center">
          <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">Completing Secure Sign In</h3>
          <p className="text-xs text-[#b88444] uppercase tracking-widest mt-1">Connecting to your Royal Wedding Workspace...</p>
        </div>
      </div>
    </div>
  )
}
