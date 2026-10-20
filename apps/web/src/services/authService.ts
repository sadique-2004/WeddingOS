export interface LocalAuthUser {
  id: string
  fullName: string
  email: string
  role: 'ADMIN' | 'ORGANIZER'
  avatarUrl?: string
}

const SESSION_STORAGE_KEY = 'weddingos_session_user'
const REGISTERED_USERS_KEY = 'weddingos_registered_users'

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

export function getRegisteredUsers(): Array<LocalAuthUser & { passwordHash?: string }> {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

export function registerLocalUser(
  fullName: string,
  email: string,
  password?: string
): LocalAuthUser {
  const normalizedEmail = email.trim().toLowerCase()
  const users = getRegisteredUsers()

  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail)
  if (existing) {
    setLocalAuthSession(existing)
    return existing
  }

  const newUser: LocalAuthUser & { passwordHash?: string } = {
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    fullName: fullName.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    role: 'ADMIN',
    passwordHash: password ? btoa(password) : undefined,
  }

  users.push(newUser)
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
  } catch {
    // ignore
  }

  setLocalAuthSession(newUser)
  return newUser
}

export function loginLocalUser(email: string, _password?: string): LocalAuthUser {
  const normalizedEmail = email.trim().toLowerCase()
  const users = getRegisteredUsers()
  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail)

  if (found) {
    setLocalAuthSession(found)
    return found
  }

  // Auto-provision if first time signing in with credentials
  return registerLocalUser(normalizedEmail.split('@')[0], normalizedEmail, _password)
}

export function loginDemoUser(as: 'bride' | 'groom' = 'bride'): LocalAuthUser {
  const demoUser: LocalAuthUser =
    as === 'bride'
      ? {
          id: 'user_aisha_admin_demo',
          fullName: 'Aisha Sharma',
          email: 'aisha.sharma@weddingos.app',
          role: 'ADMIN',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        }
      : {
          id: 'user_imran_admin_demo',
          fullName: 'Imran Khan',
          email: 'imran.khan@weddingos.app',
          role: 'ADMIN',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        }

  setLocalAuthSession(demoUser)
  return demoUser
}
