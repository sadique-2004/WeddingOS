export type WorkspaceRole = 'ADMIN' | 'ORGANIZER'

export type WorkspaceModuleKey =
  | 'events'
  | 'tasks'
  | 'invitations'
  | 'check_in'
  | 'expenses'
  | 'vendors'
  | 'website'
  | 'gallery'

export interface ModulePermissions {
  events: boolean
  tasks: boolean
  invitations: boolean
  check_in: boolean
  expenses: boolean
  vendors: boolean
  website: boolean
  gallery: boolean
}

export const ALL_PERMISSIONS_ENABLED: ModulePermissions = {
  events: true,
  tasks: true,
  invitations: true,
  check_in: true,
  expenses: true,
  vendors: true,
  website: true,
  gallery: true,
}

export const DEFAULT_ORGANIZER_PERMISSIONS: ModulePermissions = {
  events: true,
  tasks: true,
  invitations: true,
  check_in: true,
  expenses: false,
  vendors: false,
  website: false,
  gallery: true,
}

export interface WeddingMembership {
  id: string
  weddingId: string
  userId: string
  fullName: string
  email: string
  avatarUrl?: string
  role: WorkspaceRole
  modulePermissions: ModulePermissions
  invitedByUserId?: string
  invitedByUserName?: string
  joinedAt: string
  createdAt: string
  title?: string // e.g. "Lead Bride Coordinator", "Master of Ceremonies", "Hospitality Lead"
  isCurrentSessionUser?: boolean
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED'

export interface OrganizerInvitation {
  id: string
  weddingId: string
  targetEmail: string
  targetName?: string
  role: WorkspaceRole
  modulePermissions: ModulePermissions
  token: string
  invitedByUserId: string
  invitedByUserName: string
  status: InvitationStatus
  createdAt: string
  expiresAt: string
}
