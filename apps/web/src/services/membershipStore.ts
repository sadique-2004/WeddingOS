import type {
  WeddingMembership,
  OrganizerInvitation,
  WorkspaceRole,
  ModulePermissions,
} from '../types/membership'
import { ALL_PERMISSIONS_ENABLED } from '../types/membership'
import { membersApi, type BackendMembership } from './apiClient'
import {
  getLocalAuthSession,
  updateUserRoleAndPermissions,
} from './authService'

export interface CurrentUserSessionInfo {
  id?: string
  fullName?: string
  email?: string
  role?: WorkspaceRole
  avatarUrl?: string
}

function getActiveWeddingId(): number {
  // 0 = no active wedding (never fall back to wedding 1)
  try {
    const raw = localStorage.getItem('weddingos_active_wedding')
    if (raw) return Number(JSON.parse(raw).id) || 0
  } catch {}
  return 0
}

function getMembersStorageKey(wid: number): string {
  return `weddingos_${wid}_workspace_members`
}

const MEMBERS_STORAGE_KEY = 'weddingos_workspace_members'
const INVITES_STORAGE_KEY = 'weddingos_organizer_invitations'

function resolveSessionUser(currentUser?: CurrentUserSessionInfo): CurrentUserSessionInfo | null {
  if (currentUser && currentUser.email) return currentUser
  const local = getLocalAuthSession()
  if (local && local.email) {
    return {
      id: local.id,
      fullName: local.fullName,
      email: local.email,
      role: local.role,
      avatarUrl: local.avatarUrl,
    }
  }
  return null
}

export async function syncMembersFromBackend(weddingId?: number): Promise<WeddingMembership[]> {
  const wid = weddingId ?? getActiveWeddingId()
  try {
    const backendMembers = await membersApi.getAll(wid)
    if (backendMembers && backendMembers.length > 0) {
      const activeSession = resolveSessionUser()
      const mapped: WeddingMembership[] = backendMembers
        .filter((m: BackendMembership) => {
          const email = (m.user?.email || '').toLowerCase()
          return (
            email &&
            email !== 'owner@weddingos.app' &&
            email !== 'rohan.verma@weddingos.app' &&
            !email.endsWith('@weddingos.app') &&
            !m.user?.fullName?.toLowerCase().includes('dummy') &&
            !m.user?.fullName?.toLowerCase().includes('rohan verma')
          )
        })
        .map((m: BackendMembership) => ({
          id: String(m.id),
          weddingId: String(wid),
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
          isCurrentSessionUser: Boolean(
            activeSession?.email &&
            m.user?.email &&
            m.user.email.toLowerCase() === activeSession.email.toLowerCase()
          ),
        }))

      // Ensure the logged in user is represented if backend returned an empty or unpopulated list
      saveMembers(mapped, wid)
      return mapped
    }
  } catch (err) {
    console.warn('Backend members sync offline or pending:', err)
  }
  return getMembers(wid)
}

// Initial sync trigger in browser environment
if (typeof window !== 'undefined') {
  syncMembersFromBackend().catch(() => {})
}

export const DEFAULT_MEMBERS: WeddingMembership[] = []
export const DEFAULT_INVITATIONS: OrganizerInvitation[] = []

export function getMembers(weddingId?: number, currentUser?: CurrentUserSessionInfo): WeddingMembership[] {
  const wid = weddingId ?? getActiveWeddingId()
  const key = getMembersStorageKey(wid)
  const activeUser = resolveSessionUser(currentUser)
  let list: WeddingMembership[] = []

  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // Purge dummy mock data
        list = parsed.filter(
          (m: WeddingMembership) => {
            const email = (m.email || '').toLowerCase()
            return (
              email &&
              email !== 'owner@weddingos.app' &&
              email !== 'rohan.verma@weddingos.app' &&
              !email.endsWith('@weddingos.app') &&
              !m.fullName?.toLowerCase().includes('dummy') &&
              !m.fullName?.toLowerCase().includes('rohan verma')
            )
          }
        )
      }
    }
  } catch (err) {
    console.error('Failed reading members from storage', err)
  }

  // Ensure active user is present in the list
  if (activeUser && activeUser.email) {
    const userEmail = activeUser.email.toLowerCase()
    const existingIndex = list.findIndex((m) => m.email.toLowerCase() === userEmail)

    if (existingIndex >= 0) {
      // Update their entry with their real session name and mark as current user
      list[existingIndex] = {
        ...list[existingIndex],
        fullName: activeUser.fullName || list[existingIndex].fullName,
        isCurrentSessionUser: true,
      }
    } else {
      // Check if this email has an assigned role
      let userRole: WorkspaceRole = activeUser.role || 'ADMIN'
      let userTitle = userRole === 'ADMIN' ? 'Primary Workspace Admin & Owner' : 'Event Co-Organizer'
      let userPermissions: ModulePermissions = { ...ALL_PERMISSIONS_ENABLED }

      try {
        const assignmentsKey = 'weddingos_email_workspace_assignments'
        const existingAssignments = JSON.parse(localStorage.getItem(assignmentsKey) || '{}')
        if (existingAssignments[userEmail]) {
          userRole = existingAssignments[userEmail].role || userRole
          userTitle = existingAssignments[userEmail].title || userTitle
          if (existingAssignments[userEmail].permissions) {
            userPermissions = { ...existingAssignments[userEmail].permissions }
          }
        }
      } catch {}

      const newAdminRecord: WeddingMembership = {
        id: `mem-${wid}-${activeUser.id || 'primary-admin'}`,
        weddingId: String(wid),
        userId: activeUser.id || `user-${Date.now()}`,
        fullName: activeUser.fullName || activeUser.email.split('@')[0],
        email: activeUser.email,
        role: userRole,
        title: userTitle,
        modulePermissions: userPermissions,
        joinedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isCurrentSessionUser: true,
      }

      // Prepend to top of roster
      list.unshift(newAdminRecord)
    }

    // Ensure all other members have isCurrentSessionUser = false
    list = list.map((m) => ({
      ...m,
      isCurrentSessionUser: m.email.toLowerCase() === userEmail,
    }))
  }

  saveMembers(list, wid)
  return list
}

export function getAssignedWorkspaceForEmail(email: string): any | null {
  if (!email) return null
  const normalized = email.trim().toLowerCase()
  try {
    const assignmentsKey = 'weddingos_email_workspace_assignments'
    const assignments = JSON.parse(localStorage.getItem(assignmentsKey) || '{}')
    if (assignments[normalized]) {
      return assignments[normalized]
    }
    const userScopeKey = `weddingos_${normalized.replace(/[^a-z0-9]/g, '_')}_wedding`
    const scoped = localStorage.getItem(userScopeKey)
    if (scoped) {
      return { wedding: JSON.parse(scoped) }
    }
  } catch {}
  return null
}

export function saveMembers(members: WeddingMembership[], weddingId?: number): void {
  const wid = weddingId ?? getActiveWeddingId()
  const key = getMembersStorageKey(wid)
  try {
    localStorage.setItem(key, JSON.stringify(members))
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members))
    window.dispatchEvent(new Event('weddingos_members_updated'))
  } catch (err) {
    console.error('Failed saving members to storage', err)
  }
}

export interface AssignMemberParams {
  fullName: string
  email: string
  // Deprecated: passwords are no longer assigned; ignored if provided.
  password?: string
  role: WorkspaceRole
  title?: string
  modulePermissions: ModulePermissions
  weddingId?: number
}

/**
 * Adds a Co-Organizer or Admin by email to the active wedding and syncs it to the backend.
 * No password is created or stored: the member signs up / signs in with Clerk using this email,
 * and the backend links their verified account to this membership on first sign-in.
 */
export function assignTeamMember(params: AssignMemberParams): WeddingMembership {
  const normalizedEmail = params.email.trim().toLowerCase()
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Please enter a valid email address.')
  }
  if (!params.fullName.trim()) {
    throw new Error('Please enter the team member’s full name.')
  }

  const wid = params.weddingId ?? getActiveWeddingId()
  const members = getMembers(wid)

  if (members.some((m) => m.email.toLowerCase() === normalizedEmail)) {
    throw new Error(`A member with email "${normalizedEmail}" is already assigned to this workspace.`)
  }

  // 1. Create active membership record
  const newMember: WeddingMembership = {
    id: `mem-${wid}-${Date.now()}`,
    weddingId: String(wid),
    userId: `usr-${Date.now()}`,
    fullName: params.fullName.trim(),
    email: normalizedEmail,
    role: params.role,
    title: params.title?.trim() || (params.role === 'ADMIN' ? 'Co-Administrator' : 'Event Co-Organizer'),
    modulePermissions: params.role === 'ADMIN' ? { ...ALL_PERMISSIONS_ENABLED } : { ...params.modulePermissions },
    joinedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isCurrentSessionUser: false,
  }

  const updatedMembers = [...members, newMember]
  saveMembers(updatedMembers, wid)

  // 2. Cache assignment mapping for this user's email
  try {
    const rawActive = localStorage.getItem('weddingos_active_wedding')
    if (rawActive) {
      const activeWedding = JSON.parse(rawActive)
      const assignedPayload = {
        ...activeWedding,
        id: wid,
        role: params.role,
        userEmail: normalizedEmail,
      }
      const userScopeKey = `weddingos_${normalizedEmail.replace(/[^a-z0-9]/g, '_')}_wedding`
      localStorage.setItem(userScopeKey, JSON.stringify(assignedPayload))

      const assignmentsKey = 'weddingos_email_workspace_assignments'
      const existingAssignments = JSON.parse(localStorage.getItem(assignmentsKey) || '{}')
      existingAssignments[normalizedEmail] = {
        weddingId: wid,
        wedding: assignedPayload,
        role: params.role,
        title: newMember.title,
        permissions: newMember.modulePermissions,
        assignedAt: new Date().toISOString(),
      }
      localStorage.setItem(assignmentsKey, JSON.stringify(existingAssignments))
    }
  } catch (err) {
    console.error('Failed caching user workspace assignment:', err)
  }

  // 3. Persist to backend database
  membersApi.invite({
    fullName: newMember.fullName,
    email: newMember.email,
    role: newMember.role,
    title: newMember.title,
  }, wid).then((created) => {
    if (created?.id && params.role === 'ORGANIZER') {
      membersApi.updatePermissions(created.id, {
        canManageEvents: newMember.modulePermissions.events,
        canManageTasks: newMember.modulePermissions.tasks,
        canManageGuests: newMember.modulePermissions.invitations,
        canCheckInGuests: newMember.modulePermissions.check_in,
        canManageExpenses: newMember.modulePermissions.expenses,
        canManageVendors: newMember.modulePermissions.vendors,
        canManageWebsite: newMember.modulePermissions.website,
        canModerateGallery: newMember.modulePermissions.gallery,
      }).catch(() => {})
    }
  }).catch((e) => console.warn('Failed syncing new member to backend:', e))

  return newMember
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
  return []
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

  // Update in local auth registry so credentials match new role
  updateUserRoleAndPermissions(existing.email, newRole, updated.modulePermissions)

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
 * Legacy invite token generator kept for compatibility
 */
export function inviteOrganizer(
  targetEmail: string,
  targetName: string,
  role: WorkspaceRole,
  permissions: ModulePermissions,
  inviterName: string = 'Workspace Admin',
  inviterId: string = 'user-admin',
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
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const newInvite: OrganizerInvitation = {
    id: `inv-org-${Date.now()}`,
    weddingId: String(getActiveWeddingId()),
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

export function revokeInvitation(invitationId: string): void {
  const invites = getOrganizerInvitations()
  const updated = invites.map((inv) =>
    inv.id === invitationId ? { ...inv, status: 'REVOKED' as const } : inv
  )
  saveOrganizerInvitations(updated)
}

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

  const updatedInvites = invites.map((i) =>
    i.id === invite.id ? { ...i, status: 'ACCEPTED' as const } : i
  )
  saveOrganizerInvitations(updatedInvites)

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

export function resetMembershipDemoData(weddingId?: number, currentUser?: CurrentUserSessionInfo): void {
  const wid = weddingId ?? getActiveWeddingId()
  const active = resolveSessionUser(currentUser)
  const defaultOwner: WeddingMembership[] = active && active.email
    ? [
        {
          id: `mem-${wid}-${active.id || 'admin'}`,
          weddingId: String(wid),
          userId: active.id || `user-admin-${wid}`,
          fullName: active.fullName || active.email.split('@')[0],
          email: active.email,
          role: 'ADMIN',
          title: 'Primary Workspace Admin & Owner',
          modulePermissions: { ...ALL_PERMISSIONS_ENABLED },
          joinedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isCurrentSessionUser: true,
        },
      ]
    : []

  localStorage.setItem(getMembersStorageKey(wid), JSON.stringify(defaultOwner))
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(defaultOwner))
  localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify([]))
  window.dispatchEvent(new Event('weddingos_members_updated'))
}
