export type InvitationCircle =
  | 'Nanihal (Maternal)'
  | 'Dadihal (Paternal)'
  | 'Friends & Colleagues'
  | 'VIP Patrons'
  | 'International'

export type RsvpStatus = 'PENDING' | 'ATTENDING' | 'NOT_ATTENDING'

export interface FamilyInvitation {
  id: string
  displayName: string
  primaryContactName: string
  phoneNumber: string
  email?: string
  circle: InvitationCircle
  maxAttendees: number
  actualAttendees: number
  rsvpStatus: RsvpStatus
  ceremoniesAllowed: string[]
  dietaryNotes?: string
  invitationToken: string
  checkedInAt?: string | null
  checkedInBy?: string | null
  organizerNotes?: string
}

export interface CheckInLogEntry {
  id: string
  invitationId: string
  familyName: string
  primaryContact: string
  attendeeCount: number
  maxAttendees: number
  circle: string
  timestamp: string
  checkedInBy: string
  isDuplicateAttempt?: boolean
}

export interface CheckInResult {
  success: boolean
  invitation: FamilyInvitation
  alreadyCheckedIn: boolean
  message: string
  timestamp: string
}
