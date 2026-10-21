import type { ModulePermissions } from '../types/membership'

export interface LocalAuthUser {
  id: string
  fullName: string
  email: string
  role: 'ADMIN' | 'ORGANIZER'
  avatarUrl?: string
  permissions?: ModulePermissions | Record<string, boolean>
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
  password?: string,
  role: 'ADMIN' | 'ORGANIZER' = 'ADMIN',
  permissions?: ModulePermissions | Record<string, boolean>
): LocalAuthUser {
  const normalizedEmail = email.trim().toLowerCase()
  const users = getRegisteredUsers()

  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail)
  if (existingIndex >= 0) {
    const existing = users[existingIndex]
    existing.fullName = fullName.trim() || existing.fullName
    existing.role = role
    if (password) {
      existing.passwordHash = btoa(password)
    }
    if (permissions) {
      existing.permissions = permissions
    }
    users[existingIndex] = existing
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
    } catch {}
    return existing
  }

  const newUser: LocalAuthUser & { passwordHash?: string; permissions?: ModulePermissions | Record<string, boolean> } = {
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    fullName: fullName.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    role,
    passwordHash: password ? btoa(password) : undefined,
    permissions,
  }

  users.push(newUser)
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
  } catch {
    // ignore
  }

  return newUser
}

export function loginLocalUser(email: string, password?: string): LocalAuthUser {
  const normalizedEmail = email.trim().toLowerCase()
  const users = getRegisteredUsers()
  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail)

  if (found) {
    if (found.passwordHash && password) {
      if (found.passwordHash !== btoa(password)) {
        throw new Error('Incorrect password. Please verify the credentials assigned by the Workspace Admin.')
      }
    }
    setLocalAuthSession(found)
    return found
  }

  // Auto-provision if first time signing in with credentials as a workspace creator
  const newUser = registerLocalUser(normalizedEmail.split('@')[0], normalizedEmail, password, 'ADMIN')
  setLocalAuthSession(newUser)
  return newUser
}

export function updateUserRoleAndPermissions(
  email: string,
  role: 'ADMIN' | 'ORGANIZER',
  permissions?: ModulePermissions | Record<string, boolean>
): void {
  const normalizedEmail = email.trim().toLowerCase()
  const users = getRegisteredUsers()
  const index = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail)
  if (index >= 0) {
    users[index].role = role
    if (permissions) users[index].permissions = permissions
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
    } catch {}
    
    // Also update active session if current user is this user
    const current = getLocalAuthSession()
    if (current && current.email.toLowerCase() === normalizedEmail) {
      current.role = role
      if (permissions) current.permissions = permissions
      setLocalAuthSession(current)
    }
  }
}

export function loginDemoUser(as: 'bride' | 'groom' = 'bride'): LocalAuthUser {
  const demoUser: LocalAuthUser =
    as === 'bride'
      ? {
          id: 'user_bride_admin_demo',
          fullName: 'Demo Bride',
          email: 'demo.bride@weddingos.app',
          role: 'ADMIN',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        }
      : {
          id: 'user_groom_admin_demo',
          fullName: 'Demo Groom',
          email: 'demo.groom@weddingos.app',
          role: 'ADMIN',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        }

  setLocalAuthSession(demoUser)
  return demoUser
}

