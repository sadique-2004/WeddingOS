import type {
  WeddingMembership,
  OrganizerInvitation,
  WorkspaceRole,
  ModulePermissions,
} from '../types/membership'
import { ALL_PERMISSIONS_ENABLED } from '../types/membership'
import { membersApi, type BackendMembership } from './apiClient'

const MEMBERS_STORAGE_KEY = 'weddingos_workspace_members'
const INVITES_STORAGE_KEY = 'weddingos_organizer_invitations'

export async function syncMembersFromBackend(weddingId = 1): Promise<WeddingMembership[]> {
  try {
    const backendMembers = await membersApi.getAll(weddingId)
    if (backendMembers && backendMembers.length > 0) {
      const mapped: WeddingMembership[] = backendMembers.map((m: BackendMembership) => ({
        id: String(m.id),
        weddingId: String(weddingId),
        userId: String(m.user?.id || m.id),
        fullName: m.user?.fullName || 'Wedding Organizer',
        email: m.user?.email || '',
        role: m.role,
        title: m.title || (m.role === 'ADMIN' ? 'Administrator' : 'Organizer'),
        modulePermissions: {
          events: m.canManageEvents ?? true,
          tasks: m.canManageTasks ?? true,
          invitations: m.canManageGuests ?? true,
          check_in: m.canCheckInGuests ?? true,
          expenses: m.canManageExpenses ?? false,
          vendors: m.canManageVendors ?? false,
          website: m.canManageWebsite ?? false,
          gallery: m.canModerateGallery ?? true,
        },
        joinedAt: m.createdAt,
        createdAt: m.createdAt,
        isCurrentSessionUser: m.user?.email === 'aisha.sharma@weddingos.app',
      }))
      saveMembers(mapped)
      return mapped
    }
  } catch (err) {
    console.warn('Backend members sync offline or pending:', err)
  }
  return getMembers()
}

// Initial sync trigger in browser environment
if (typeof window !== 'undefined') {
  syncMembersFromBackend().catch(() => {})
}

export const DEFAULT_MEMBERS: WeddingMembership[] = [
  {
    id: 'mem-1',
    weddingId: 'wed-1',
    userId: 'user-aisha-1',
    fullName: 'Aisha Sharma',
    email: 'aisha.sharma@weddingos.app',
    role: 'ADMIN',
    title: 'Bride & Workspace Co-Owner',
    modulePermissions: { ...ALL_PERMISSIONS_ENABLED },
    joinedAt: '2026-09-01T10:00:00.000Z',
    createdAt: '2026-09-01T10:00:00.000Z',
    isCurrentSessionUser: true,
  },
  {
    id: 'mem-2',
    weddingId: 'wed-1',
    userId: 'user-imran-2',
    fullName: 'Imran Khan',
    email: 'imran.khan@weddingos.app',
    role: 'ADMIN',
    title: 'Groom & Workspace Co-Owner',
    modulePermissions: { ...ALL_PERMISSIONS_ENABLED },
    joinedAt: '2026-09-01T10:30:00.000Z',
    createdAt: '2026-09-01T10:30:00.000Z',
  },
  {
    id: 'mem-3',
    weddingId: 'wed-1',
    userId: 'user-priya-3',
    fullName: 'Priya Patel',
    email: 'priya.patel@palaceconcierge.com',
    role: 'ORGANIZER',
    title: 'Chief Hospitality & Desk Lead',
    modulePermissions: {
      events: true,
      tasks: true,
      invitations: true,
      check_in: true,
      expenses: false,
      vendors: false,
      website: false,
      gallery: true,
    },
    invitedByUserId: 'user-aisha-1',
    invitedByUserName: 'Aisha Sharma',
    joinedAt: '2026-09-12T14:20:00.000Z',
    createdAt: '2026-09-10T09:15:00.000Z',
  },
  {
    id: 'mem-4',
    weddingId: 'wed-1',
    userId: 'user-kabir-4',
    fullName: 'Kabir Mehta',
    email: 'kabir.mehta@royalproduction.in',
    role: 'ORGANIZER',
    title: 'Stage & Ceremonies Director',
    modulePermissions: {
      events: true,
      tasks: true,
      invitations: false,
      check_in: false,
      expenses: false,
      vendors: true,
      website: false,
      gallery: false,
    },
    invitedByUserId: 'user-imran-2',
    invitedByUserName: 'Imran Khan',
    joinedAt: '2026-09-18T16:45:00.000Z',
    createdAt: '2026-09-15T11:00:00.000Z',
  },
]

export const DEFAULT_INVITATIONS: OrganizerInvitation[] = [
  {
    id: 'inv-org-1',
    weddingId: 'wed-1',
    targetEmail: 'neha.verma@weddingcraft.in',
    targetName: 'Neha Verma',
    role: 'ORGANIZER',
    modulePermissions: {
      events: false,
      tasks: true,
      invitations: true,
      check_in: true,
      expenses: false,
      vendors: false,
      website: false,
      gallery: true,
    },
    token: 'wos-team-neha9821',
    invitedByUserId: 'user-aisha-1',
    invitedByUserName: 'Aisha Sharma',
    status: 'PENDING',
    createdAt: '2026-10-15T10:00:00.000Z',
    expiresAt: '2026-10-22T10:00:00.000Z',
  },
  {
    id: 'inv-org-2',
    weddingId: 'wed-1',
    targetEmail: 'samir.desai@soundstage.com',
    targetName: 'Samir Desai',
    role: 'ORGANIZER',
    modulePermissions: {
      events: true,
      tasks: false,
      invitations: false,
      check_in: false,
      expenses: false,
      vendors: true,
      website: false,
      gallery: false,
    },
    token: 'wos-team-samir4412',
    invitedByUserId: 'user-imran-2',
    invitedByUserName: 'Imran Khan',
    status: 'PENDING',
    createdAt: '2026-10-16T15:30:00.000Z',
    expiresAt: '2026-10-23T15:30:00.000Z',
  },
]

export function getMembers(): WeddingMembership[] {
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed reading members from storage', err)
  }
  saveMembers(DEFAULT_MEMBERS)
  return DEFAULT_MEMBERS
}

export function saveMembers(members: WeddingMembership[]): void {
  try {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members))
    window.dispatchEvent(new Event('weddingos_members_updated'))
  } catch (err) {
    console.error('Failed saving members to storage', err)
  }
}

export function getOrganizerInvitations(): OrganizerInvitation[] {
  try {
    const raw = localStorage.getItem(INVITES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed reading invitations from storage', err)
  }
  saveOrganizerInvitations(DEFAULT_INVITATIONS)
  return DEFAULT_INVITATIONS
}

export function saveOrganizerInvitations(invites: OrganizerInvitation[]): void {
  try {
    localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(invites))
    window.dispatchEvent(new Event('weddingos_members_updated'))
  } catch (err) {
    console.error('Failed saving invitations to storage', err)
  }
}

/**
 * Updates a member's role and module permissions.
 * Enforces FR-MEM-06: Prevent removal/demotion of the final Admin.
 */
export function updateMemberRoleAndPermissions(
  memberId: string,
  newRole: WorkspaceRole,
  newPermissions: ModulePermissions,
  newTitle?: string
): WeddingMembership {
  const members = getMembers()
  const index = members.findIndex((m) => m.id === memberId)
  if (index === -1) {
    throw new Error('Member record not found in active wedding workspace.')
  }

  const existing = members[index]

  // Enforce Last-Admin Protection Invariant (FR-MEM-06)
  if (existing.role === 'ADMIN' && newRole === 'ORGANIZER') {
    const adminCount = members.filter((m) => m.role === 'ADMIN').length
    if (adminCount <= 1) {
      throw new Error(
        'Action Denied (FR-MEM-06): Cannot demote the final remaining Admin of this wedding workspace. Assign another Admin first.'
      )
    }
  }

  const updated: WeddingMembership = {
    ...existing,
    role: newRole,
    // If role is promoted to ADMIN, grant all permissions per PRD
    modulePermissions: newRole === 'ADMIN' ? { ...ALL_PERMISSIONS_ENABLED } : { ...newPermissions },
    title: newTitle !== undefined ? newTitle : existing.title,
  }

  members[index] = updated
  saveMembers(members)

  const numericId = parseInt(memberId.replace(/\D/g, ''), 10)
  if (!isNaN(numericId) && numericId > 0) {
    membersApi.updateRole(numericId, newRole).catch((e) => console.warn('Failed syncing role update to backend:', e))
    membersApi.updatePermissions(numericId, {
      canManageEvents: updated.modulePermissions.events,
      canManageTasks: updated.modulePermissions.tasks,
      canManageGuests: updated.modulePermissions.invitations,
      canCheckInGuests: updated.modulePermissions.check_in,
      canManageExpenses: updated.modulePermissions.expenses,
      canManageVendors: updated.modulePermissions.vendors,
      canManageWebsite: updated.modulePermissions.website,
      canModerateGallery: updated.modulePermissions.gallery,
    }).catch((e) => console.warn('Failed syncing permissions update to backend:', e))
  }

  return updated
}

/**
 * Removes a member from the workspace.
 * Enforces FR-MEM-04 & FR-MEM-06: Prevent removal of the final Admin.
 */
export function removeMember(memberId: string): void {
  const members = getMembers()
  const member = members.find((m) => m.id === memberId)
  if (!member) {
    throw new Error('Member not found.')
  }

  // Enforce Last-Admin Protection Invariant (FR-MEM-06)
  if (member.role === 'ADMIN') {
    const adminCount = members.filter((m) => m.role === 'ADMIN').length
    if (adminCount <= 1) {
      throw new Error(
        'Action Denied (FR-MEM-06): Cannot remove the final remaining Admin of this wedding workspace.'
      )
    }
  }

  const updated = members.filter((m) => m.id !== memberId)
  saveMembers(updated)

  const numericId = parseInt(memberId.replace(/\D/g, ''), 10)
  if (!isNaN(numericId) && numericId > 0) {
    membersApi.remove(numericId).catch((e) => console.warn('Failed syncing member removal to backend:', e))
  }
}

/**
 * Creates and persists a pending invitation for an organizer.
 * Follows FR-MEM-01 & DBDD section 6.
 */
export function inviteOrganizer(
  targetEmail: string,
  targetName: string,
  role: WorkspaceRole,
  permissions: ModulePermissions,
  inviterName: string = 'Aisha Sharma (Admin)',
  inviterId: string = 'user-aisha-1',
  title?: string
): OrganizerInvitation {
  const normalizedEmail = targetEmail.trim().toLowerCase()
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Please enter a valid email address.')
  }

  const members = getMembers()
  if (members.some((m) => m.email.toLowerCase() === normalizedEmail)) {
    throw new Error(`A member with email "${normalizedEmail}" already belongs to this wedding workspace.`)
  }

  const invites = getOrganizerInvitations()
  if (
    invites.some(
      (i) => i.targetEmail.toLowerCase() === normalizedEmail && i.status === 'PENDING'
    )
  ) {
    throw new Error(`A pending invitation for "${normalizedEmail}" is already active.`)
  }

  const cleanSlug = targetName
    ? targetName.toLowerCase().replace(/[^a-z0-9]/g, '')
    : normalizedEmail.split('@')[0].replace(/[^a-z0-9]/g, '')

  const token = `wos-team-${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`
  const now = new Date()
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const newInvite: OrganizerInvitation = {
    id: `inv-org-${Date.now()}`,
    weddingId: 'wed-1',
    targetEmail: normalizedEmail,
    targetName: targetName.trim() || undefined,
    role,
    modulePermissions: role === 'ADMIN' ? { ...ALL_PERMISSIONS_ENABLED } : { ...permissions },
    token,
    invitedByUserId: inviterId,
    invitedByUserName: inviterName,
    status: 'PENDING',
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  }

  const nextInvites = [newInvite, ...invites]
  saveOrganizerInvitations(nextInvites)

  // Persist to backend
  membersApi.invite({
    fullName: targetName.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    role: role,
    title: title || (role === 'ADMIN' ? 'Co-Administrator' : 'Event Organizer'),
  }).then(() => {
    syncMembersFromBackend().catch(() => {})
  }).catch((e) => console.warn('Failed syncing invite to backend:', e))

  return newInvite
}

/**
 * Revokes an existing pending invitation.
 */
export function revokeInvitation(invitationId: string): void {
  const invites = getOrganizerInvitations()
  const updated = invites.map((inv) =>
    inv.id === invitationId ? { ...inv, status: 'REVOKED' as const } : inv
  )
  saveOrganizerInvitations(updated)
}

/**
 * Simulates accepting an invitation and converting it into a full membership.
 */
export function acceptInvitation(
  invitationIdOrToken: string,
  acceptorName?: string
): WeddingMembership {
  const invites = getOrganizerInvitations()
  const invite = invites.find(
    (i) =>
      (i.id === invitationIdOrToken || i.token === invitationIdOrToken) &&
      i.status === 'PENDING'
  )

  if (!invite) {
    throw new Error('Invitation is invalid, expired, or already accepted/revoked (FR-MEM-02).')
  }

  // Mark invite accepted
  const updatedInvites = invites.map((i) =>
    i.id === invite.id ? { ...i, status: 'ACCEPTED' as const } : i
  )
  saveOrganizerInvitations(updatedInvites)

  // Create membership
  const members = getMembers()
  const newMember: WeddingMembership = {
    id: `mem-${Date.now()}`,
    weddingId: invite.weddingId,
    userId: `user-${Date.now()}`,
    fullName: acceptorName || invite.targetName || invite.targetEmail.split('@')[0],
    email: invite.targetEmail,
    role: invite.role,
    modulePermissions: invite.modulePermissions,
    invitedByUserId: invite.invitedByUserId,
    invitedByUserName: invite.invitedByUserName,
    joinedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }

  saveMembers([...members, newMember])
  return newMember
}

export function resetMembershipDemoData(): void {
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(DEFAULT_MEMBERS))
  localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(DEFAULT_INVITATIONS))
  window.dispatchEvent(new Event('weddingos_members_updated'))
}
