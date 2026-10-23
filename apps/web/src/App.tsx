import { RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { router } from './app/router'
import ClerkAuthBridge from './app/components/ClerkAuthBridge'

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_Y29tbXVuYWwtcmF2ZW4tNjc5Ny5jbGVyay5hY2NvdW50cy5kZXYk'

export default function App() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/app/dashboard"
      signUpFallbackRedirectUrl="/app/dashboard"
      signInForceRedirectUrl="/app/dashboard"
      signUpForceRedirectUrl="/app/dashboard"
      afterSignInUrl="/app/dashboard"
      afterSignUpUrl="/app/dashboard"
      afterSignOutUrl="/sign-in"
    >
      <ClerkAuthBridge />
      <RouterProvider router={router} />
    </ClerkProvider>
  )
}
