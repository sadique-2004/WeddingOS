import type { FamilyInvitation, CheckInLogEntry } from '../types/invitation'
import { invitationsApi, checkInApi, type BackendInvitation } from './apiClient'

const STORAGE_KEY = 'weddingos_family_invitations'
const LOGS_STORAGE_KEY = 'weddingos_checkin_logs'

function getActiveWeddingId(): number {
  // 0 = no active wedding (never fall back to wedding 1)
  try {
    const raw = localStorage.getItem('weddingos_active_wedding')
    if (raw) return Number(JSON.parse(raw).id) || 0
  } catch {}
  return 0
}

function getStorageKey(wid: number): string {
  return `weddingos_${wid}_family_invitations`
}

export async function syncInvitationsFromBackend(weddingId?: number): Promise<FamilyInvitation[]> {
  const wid = weddingId ?? getActiveWeddingId()
  try {
    const res = await invitationsApi.getAll(wid)
    if (res && res.invitations && res.invitations.length > 0) {
      const mapped: FamilyInvitation[] = res.invitations.map((inv: BackendInvitation) => ({
        id: `inv-${inv.id}`,
        displayName: inv.displayName,
        primaryContactName: inv.primaryContactName,
        phoneNumber: inv.phoneNumber,
        email: inv.email || '',
        circle: inv.circle as any,
        maxAttendees: inv.maxAttendees,
        actualAttendees: inv.actualAttendees,
        rsvpStatus: inv.rsvpStatus,
        ceremoniesAllowed: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
        dietaryNotes: inv.dietaryNotes || '',
        invitationToken: inv.invitationToken,
        checkedInAt: inv.checkedInAt || null,
        checkedInBy: inv.checkedInBy || null,
        organizerNotes: inv.organizerNotes || '',
      }))
      saveInvitations(mapped, wid)
      return mapped
    }
  } catch (err) {
    console.warn('Backend invitations sync offline or pending:', err)
  }
  return getInvitations(wid)
}

// Initial sync trigger in browser environment
if (typeof window !== 'undefined') {
  syncInvitationsFromBackend().catch(() => {})
}

export const DEFAULT_INVITATIONS: FamilyInvitation[] = []

export const DEFAULT_LOGS: CheckInLogEntry[] = []


export function getInvitations(weddingId?: number): FamilyInvitation[] {
  const wid = weddingId ?? getActiveWeddingId()
  const key = getStorageKey(wid)
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed reading invitations from storage', err)
  }
  return []
}

export function saveInvitations(invitations: FamilyInvitation[], weddingId?: number): void {
  const wid = weddingId ?? getActiveWeddingId()
  const key = getStorageKey(wid)
  try {
    localStorage.setItem(key, JSON.stringify(invitations))
    window.dispatchEvent(new Event('weddingos_invitations_updated'))
  } catch (err) {
    console.error('Failed saving invitations to storage', err)
  }
}

export function getCheckInLogs(): CheckInLogEntry[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed reading check-in logs from storage', err)
  }
  return []
}

export function saveCheckInLogs(logs: CheckInLogEntry[]): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs))
  } catch (err) {
    console.error('Failed saving check-in logs to storage', err)
  }
}

export function logCheckInAttempt(entry: Omit<CheckInLogEntry, 'id'>): CheckInLogEntry {
  const logs = getCheckInLogs()
  const newEntry: CheckInLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }
  const updatedLogs = [newEntry, ...logs].slice(0, 50) // keep latest 50
  saveCheckInLogs(updatedLogs)
  return newEntry
}

/**
 * Searches for an invitation by:
 * 1. Exact invitation token (e.g. "wos-singhania-8821")
 * 2. Full URL containing the token (e.g. "https://weddingos.app/invite/wos-singhania-8821")
 * 3. Exact ID (e.g. "inv-1")
 * 4. Fuzzy match against family name or primary contact or phone number
 */
export function resolveInvitation(query: string): FamilyInvitation | undefined {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return undefined

  const list = getInvitations()

  // 1. Direct match on token
  let found = list.find((i) => i.invitationToken.toLowerCase() === normalized)
  if (found) return found

  // 2. Direct match on ID
  found = list.find((i) => i.id.toLowerCase() === normalized)
  if (found) return found

  // 3. Match if query contains token (e.g. scanned URL from QR)
  found = list.find((i) => normalized.includes(i.invitationToken.toLowerCase()))
  if (found) return found

  // 4. Exact match on clean phone number
  const cleanPhone = normalized.replace(/[^0-9]/g, '')
  if (cleanPhone.length >= 7) {
    found = list.find((i) => i.phoneNumber.replace(/[^0-9]/g, '').includes(cleanPhone))
    if (found) return found
  }

  // 5. Match by exact or substring of display name
  found = list.find((i) => i.displayName.toLowerCase() === normalized)
  if (found) return found

  return undefined
}

/**
 * Executes a family check-in adhering to FR-CHECK-01 through FR-CHECK-06:
 * - Operates on the family invitation as a unit.
 * - Idempotent: returns alreadyCheckedIn: true if already checked in (per API Design doc).
 * - Records checkedInAt and checkedInBy.
 */
export function checkInFamilyInvitation(
  invitationId: string,
  organizerName: string = 'Authorized Reception Desk'
): { invitation: FamilyInvitation; alreadyCheckedIn: boolean; previousTimestamp?: string } {
  const invitations = getInvitations()
  const index = invitations.findIndex((i) => i.id === invitationId)
  if (index === -1) {
    throw new Error('Invitation record not found in active wedding workspace.')
  }

  const existing = invitations[index]

  // If already checked in: return idempotent response with warning flag (FR-CHECK-04)
  if (existing.checkedInAt) {
    checkInApi.scan(existing.invitationToken, existing.actualAttendees || existing.maxAttendees, organizerName)
      .catch((e) => console.warn('Failed syncing duplicate scan to backend:', e))

    logCheckInAttempt({
      invitationId: existing.id,
      familyName: existing.displayName,
      primaryContact: existing.primaryContactName,
      attendeeCount: existing.actualAttendees || existing.maxAttendees,
      maxAttendees: existing.maxAttendees,
      circle: existing.circle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      checkedInBy: organizerName,
      isDuplicateAttempt: true,
    })

    return {
      invitation: existing,
      alreadyCheckedIn: true,
      previousTimestamp: existing.checkedInAt,
    }
  }

  const timestamp = new Date().toISOString()
  const updatedInvitation: FamilyInvitation = {
    ...existing,
    checkedInAt: timestamp,
    checkedInBy: organizerName,
    // If RSVP was pending but they physically arrived at check-in, set confirmed actualAttendees
    actualAttendees: existing.actualAttendees > 0 ? existing.actualAttendees : existing.maxAttendees,
    rsvpStatus: 'ATTENDING',
  }

  invitations[index] = updatedInvitation
  saveInvitations(invitations)

  checkInApi.scan(existing.invitationToken, updatedInvitation.actualAttendees, organizerName)
    .catch((e) => console.warn('Failed syncing check-in scan to backend:', e))

  logCheckInAttempt({
    invitationId: updatedInvitation.id,
    familyName: updatedInvitation.displayName,
    primaryContact: updatedInvitation.primaryContactName,
    attendeeCount: updatedInvitation.actualAttendees,
    maxAttendees: updatedInvitation.maxAttendees,
    circle: updatedInvitation.circle,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    checkedInBy: organizerName,
    isDuplicateAttempt: false,
  })

  return {
    invitation: updatedInvitation,
    alreadyCheckedIn: false,
  }
}

/**
 * Reverts a check-in (e.g., if organizer clicked by mistake)
 */
export function undoCheckIn(invitationId: string): FamilyInvitation {
  const invitations = getInvitations()
  const index = invitations.findIndex((i) => i.id === invitationId)
  if (index === -1) {
    throw new Error('Invitation record not found')
  }

  const updated: FamilyInvitation = {
    ...invitations[index],
    checkedInAt: null,
    checkedInBy: null,
  }

  invitations[index] = updated
  saveInvitations(invitations)
  return updated
}

export function resetToDemoData(): void {
  const wid = getActiveWeddingId()
  localStorage.setItem(getStorageKey(wid), JSON.stringify([]))
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([]))
  window.dispatchEvent(new Event('weddingos_invitations_updated'))
}
