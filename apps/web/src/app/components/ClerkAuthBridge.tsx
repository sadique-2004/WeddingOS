import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { setAuthTokenProvider } from '../../services/apiClient'
import { clearLegacyLocalAuthData } from '../../services/authService'

/**
 * Connects Clerk to the API client: while a user is signed in, every protected API call gets
 * `Authorization: Bearer <Clerk session token>` (getToken refreshes short-lived tokens itself).
 * Also removes legacy local-login data (sessions and base64 passwords) from this browser.
 */
export default function ClerkAuthBridge() {
  const { isLoaded, isSignedIn, getToken } = useAuth()

  useEffect(() => {
    clearLegacyLocalAuthData()
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn) {
      setAuthTokenProvider(() => getToken())
    } else {
      setAuthTokenProvider(null)
      try {
        // Do not let a previous user's active wedding leak into the next session on this browser.
        localStorage.removeItem('weddingos_active_wedding')
      } catch {
        // ignore
      }
    }
  }, [isLoaded, isSignedIn, getToken])

  return null
}
