import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Access requires an active Clerk session. Local/demo sessions in localStorage no longer grant access.
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  // Waiting for Clerk auth state to initialize
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-3 border-[#e6bd81] border-t-[#6f0617] animate-spin" />
          <div className="text-center">
            <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">WeddingOS</h3>
            <p className="text-xs text-[#b88444] uppercase tracking-widest mt-1">Verifying Credentials...</p>
          </div>
        </div>
      </div>
    )
  }

  // If user is not authenticated through Clerk, redirect to sign-in
  if (!isSignedIn) {
    const redirectTarget = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/sign-in?redirect_url=${redirectTarget}`} replace state={{ from: location }} />
  }

  return <>{children}</>
}
