import type { ModulePermissions } from '../types/membership'

/**
 * Authentication is handled exclusively by Clerk; the backend accepts only verified Clerk
 * session tokens (see setAuthTokenProvider in apiClient.ts).
 *
 * This module no longer creates local accounts, stores passwords, auto-creates ADMIN users or
 * offers demo logins. `weddingos_session_user` is only a non-authoritative display cache; it grants
 * no access (ProtectedRoute checks Clerk) and is never sent to the API.
 */
export interface LocalAuthUser {
  id: string
  fullName: string
  email: string
  role: 'ADMIN' | 'ORGANIZER'
  avatarUrl?: string
  permissions?: ModulePermissions | Record<string, boolean>
}

const SESSION_STORAGE_KEY = 'weddingos_session_user'
// Legacy store that held local accounts with base64-encoded passwords; it is deleted on startup.
const LEGACY_REGISTERED_USERS_KEY = 'weddingos_registered_users'

export function getLocalAuthSession(): LocalAuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore
  }
  return null
}

export function setLocalAuthSession(user: LocalAuthUser): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event('weddingos_auth_changed'))
  } catch (err) {
    console.error('Failed saving auth session', err)
  }
}

export function clearLocalAuthSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    window.dispatchEvent(new Event('weddingos_auth_changed'))
  } catch {
    // ignore
  }
}

/**
 * Removes data left by the old local/demo login: the cached local session and the stored
 * local accounts (which contained base64-encoded passwords).
 */
export function clearLegacyLocalAuthData(): void {
  try {
    const hadSession = localStorage.getItem(SESSION_STORAGE_KEY) !== null
    localStorage.removeItem(LEGACY_REGISTERED_USERS_KEY)
    localStorage.removeItem(SESSION_STORAGE_KEY)
    if (hadSession) {
      window.dispatchEvent(new Event('weddingos_auth_changed'))
    }
  } catch {
    // ignore
  }
}

/** Updates the display cache when the current user's own role/permissions change in the UI. */
export function updateUserRoleAndPermissions(
  email: string,
  role: 'ADMIN' | 'ORGANIZER',
  permissions?: ModulePermissions | Record<string, boolean>
): void {
  const current = getLocalAuthSession()
  if (current && current.email.toLowerCase() === email.trim().toLowerCase()) {
    current.role = role
    if (permissions) current.permissions = permissions
    setLocalAuthSession(current)
  }
}
