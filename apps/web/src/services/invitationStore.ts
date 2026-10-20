import type { FamilyInvitation, CheckInLogEntry } from '../types/invitation'
import { invitationsApi, checkInApi, type BackendInvitation } from './apiClient'

const STORAGE_KEY = 'weddingos_family_invitations'
const LOGS_STORAGE_KEY = 'weddingos_checkin_logs'

function getActiveWeddingId(): number {
  try {
    const raw = localStorage.getItem('weddingos_active_wedding')
    if (raw) return Number(JSON.parse(raw).id) || 1
  } catch {}
  return 1
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

export const DEFAULT_INVITATIONS: FamilyInvitation[] = [
  {
    id: 'inv-1',
    displayName: 'The Singhania Family',
    primaryContactName: 'Rajesh Singhania',
    phoneNumber: '+91 98201 44521',
    email: 'rajesh.singhania@mewartextiles.com',
    circle: 'Dadihal (Paternal)',
    maxAttendees: 5,
    actualAttendees: 5,
    rsvpStatus: 'ATTENDING',
    ceremoniesAllowed: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
    dietaryNotes: 'Strict Jain Catering (No root vegetables) for 2 elders',
    invitationToken: 'wos-singhania-8821',
    checkedInAt: null,
    checkedInBy: null,
    organizerNotes: 'Seated near Stage Row A. Family elders need golf cart at palace gate.',
  },
  {
    id: 'inv-2',
    displayName: 'Justice & Mrs. Verma',
    primaryContactName: 'Justice Alok Verma',
    phoneNumber: '+91 98110 99823',
    email: 'alok.verma@delhicourts.gov.in',
    circle: 'VIP Patrons',
    maxAttendees: 2,
    actualAttendees: 2,
    rsvpStatus: 'ATTENDING',
    ceremoniesAllowed: ['Sangeet', 'Pheras', 'Reception'],
    dietaryNotes: 'Diabetic dessert alternatives requested',
    invitationToken: 'wos-verma-4192',
    checkedInAt: null,
    checkedInBy: null,
    organizerNotes: 'VIP protocol. Escort directly to Royal Courtyard suite.',
  },
  {
    id: 'inv-3',
    displayName: 'The Roy Chowdhury Clan',
    primaryContactName: 'Subir Roy Chowdhury',
    phoneNumber: '+91 98300 23145',
    email: 'subir@kolkatatea.in',
    circle: 'Nanihal (Maternal)',
    maxAttendees: 6,
    actualAttendees: 4,
    rsvpStatus: 'ATTENDING',
    ceremoniesAllowed: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
    dietaryNotes: 'Standard Royal Indian Vegetarian & Non-Veg',
    invitationToken: 'wos-chowdhury-7301',
    checkedInAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // Checked in 45 mins ago
    checkedInBy: 'Aisha Sharma (Coordinator)',
    organizerNotes: 'Arrived via Terminal 2 flight, luggage stored at hospitality desk.',
  },
  {
    id: 'inv-4',
    displayName: 'Dr. Siddharth & Dr. Neha Kapoor',
    primaryContactName: 'Dr. Siddharth Kapoor',
    phoneNumber: '+44 7911 123456',
    email: 'sid.kapoor@nhs.uk',
    circle: 'International',
    maxAttendees: 3,
    actualAttendees: 3,
    rsvpStatus: 'PENDING',
    ceremoniesAllowed: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
    dietaryNotes: 'Severe nut allergy for child (Advait)',
    invitationToken: 'wos-kapoor-9920',
    checkedInAt: null,
    checkedInBy: null,
    organizerNotes: 'Landing in Bengaluru tomorrow morning 7:30 AM.',
  },
  {
    id: 'inv-5',
    displayName: 'Vikramaditya Oberoi & Partners',
    primaryContactName: 'Vikramaditya Oberoi',
    phoneNumber: '+91 98210 65432',
    email: 'v.oberoi@palacecapital.com',
    circle: 'Friends & Colleagues',
    maxAttendees: 2,
    actualAttendees: 2,
    rsvpStatus: 'PENDING',
    ceremoniesAllowed: ['Sangeet', 'Reception'],
    invitationToken: 'wos-oberoi-3310',
    checkedInAt: null,
    checkedInBy: null,
  },
  {
    id: 'inv-6',
    displayName: 'Ambassador & Mrs. K.S. Menon',
    primaryContactName: 'Ambassador K.S. Menon',
    phoneNumber: '+91 98450 11984',
    email: 'ksmenon@diplomats.org',
    circle: 'VIP Patrons',
    maxAttendees: 2,
    actualAttendees: 2,
    rsvpStatus: 'ATTENDING',
    ceremoniesAllowed: ['Pheras', 'Reception'],
    dietaryNotes: 'Low sodium South Indian delicacies',
    invitationToken: 'wos-menon-5512',
    checkedInAt: null,
    checkedInBy: null,
    organizerNotes: 'Wheelchair assistance requested at Grand Ballroom entrance.',
  },
  {
    id: 'inv-7',
    displayName: 'The Deshmukh Family',
    primaryContactName: 'Anil Deshmukh',
    phoneNumber: '+91 98220 89123',
    email: 'deshmukh.anil@puneeng.com',
    circle: 'Nanihal (Maternal)',
    maxAttendees: 4,
    actualAttendees: 4,
    rsvpStatus: 'ATTENDING',
    ceremoniesAllowed: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
    dietaryNotes: 'Pure Maharashtrian vegetarian preference',
    invitationToken: 'wos-deshmukh-2940',
    checkedInAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    checkedInBy: 'Imran Khan (Desk Lead)',
  },
  {
    id: 'inv-8',
    displayName: 'Col. Ranjit Singh Rathore',
    primaryContactName: 'Col. Ranjit Singh',
    phoneNumber: '+91 94140 88219',
    email: 'ranjit.rathore@rajasthanregiment.org',
    circle: 'Dadihal (Paternal)',
    maxAttendees: 4,
    actualAttendees: 0,
    rsvpStatus: 'NOT_ATTENDING',
    ceremoniesAllowed: ['Baraat', 'Reception'],
    dietaryNotes: 'Sending ceremonial blessings and token from Jodhpur',
    invitationToken: 'wos-rathore-1092',
    checkedInAt: null,
    checkedInBy: null,
  },
]

export const DEFAULT_LOGS: CheckInLogEntry[] = [
  {
    id: 'log-1',
    invitationId: 'inv-3',
    familyName: 'The Roy Chowdhury Clan',
    primaryContact: 'Subir Roy Chowdhury',
    attendeeCount: 4,
    maxAttendees: 6,
    circle: 'Nanihal (Maternal)',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    checkedInBy: 'Aisha Sharma (Coordinator)',
    isDuplicateAttempt: false,
  },
  {
    id: 'log-2',
    invitationId: 'inv-7',
    familyName: 'The Deshmukh Family',
    primaryContact: 'Anil Deshmukh',
    attendeeCount: 4,
    maxAttendees: 4,
    circle: 'Nanihal (Maternal)',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    checkedInBy: 'Imran Khan (Desk Lead)',
    isDuplicateAttempt: false,
  },
]

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
  // Initialize with defaults only if wedding 1 (seed demo)
  if (wid === 1) {
    saveInvitations(DEFAULT_INVITATIONS, 1)
    return DEFAULT_INVITATIONS
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
  saveCheckInLogs(DEFAULT_LOGS)
  return DEFAULT_LOGS
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INVITATIONS))
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(DEFAULT_LOGS))
  window.dispatchEvent(new Event('weddingos_invitations_updated'))
}
