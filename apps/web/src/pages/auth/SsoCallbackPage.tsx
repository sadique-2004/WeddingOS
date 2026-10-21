import { useEffect, useState } from 'react'
import { AuthenticateWithRedirectCallback, useAuth } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'

export default function SsoCallbackPage() {
  const navigate = useNavigate()
  const { isSignedIn, isLoaded } = useAuth()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/app/dashboard', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  // If the SSO handshake does not complete, offer a way back. No demo or local session is created.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSignedIn) setTimedOut(true)
    }, 15000)
    return () => clearTimeout(timer)
  }, [isSignedIn])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6]">
      <AuthenticateWithRedirectCallback
        signUpForceRedirectUrl="/app/onboarding"
        signInForceRedirectUrl="/app/dashboard"
      />
      <div className="flex flex-col items-center gap-4 mt-6">
        {timedOut ? (
          <div className="text-center">
            <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">Sign In Did Not Complete</h3>
            <p className="text-sm text-neutral-600 mt-2">
              We could not finish signing you in.{' '}
              <Link to="/sign-in" className="font-bold text-[#6f0617] hover:underline">
                Return to sign in
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full border-3 border-[#e6bd81] border-t-[#6f0617] animate-spin" />
            <div className="text-center">
              <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">Completing Secure Sign In</h3>
              <p className="text-xs text-[#b88444] uppercase tracking-widest mt-1">Connecting to your Royal Wedding Workspace...</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
