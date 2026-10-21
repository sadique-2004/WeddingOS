import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useUser } from '@clerk/clerk-react'
import {
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users2,
  Mail,
  Copy,
  Check,
  Trash2,
  Edit2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  Calendar,
  CheckSquare,
  DollarSign,
  Briefcase,
  Globe,
  Camera,
  QrCode,
  X,
  Clock,
  Send,
  CheckCircle2,
  Key,
  RefreshCw,
} from 'lucide-react'
import type {
  WeddingMembership,
  OrganizerInvitation,
  WorkspaceRole,
  WorkspaceModuleKey,
} from '../../types/membership'
import {
  ALL_PERMISSIONS_ENABLED,
  DEFAULT_ORGANIZER_PERMISSIONS,
} from '../../types/membership'
import {
  getMembers,
  getOrganizerInvitations,
  updateMemberRoleAndPermissions,
  removeMember,
  assignTeamMember,
  revokeInvitation,
  acceptInvitation,
  syncMembersFromBackend,
} from '../../services/membershipStore'
import { getLocalAuthSession } from '../../services/authService'

const MODULE_DEFINITIONS: {
  key: WorkspaceModuleKey
  label: string
  description: string
  icon: typeof Calendar
}[] = [
  { key: 'events', label: 'Events & Functions', description: 'Ceremony dates, venues, schedules & itineraries', icon: Calendar },
  { key: 'tasks', label: 'Preparation Tasks', description: 'Checklist, deadlines, vendor task assignments', icon: CheckSquare },
  { key: 'invitations', label: 'Family Invitations', description: 'Guest circles, guest caps, RSVP matrix & WhatsApp cards', icon: Users2 },
  { key: 'check_in', label: 'Reception & QR Check-In', description: 'Gate scanner, arrival roster, family pass verification', icon: QrCode },
  { key: 'expenses', label: 'Budget & Expenses', description: 'Budget limits, invoices, payments, expense breakdown', icon: DollarSign },
  { key: 'vendors', label: 'Vendor Directory', description: 'Caterers, photographers, decorators, contracts & phone', icon: Briefcase },
  { key: 'website', label: 'Website & Themes', description: 'Public wedding site editor, stories, theme customization', icon: Globe },
  { key: 'gallery', label: 'Photo Gallery Moderation', description: 'Guest upload moderation, live slideshow, approvals', icon: Camera },
]

export default function MembersPage() {
  const { user: clerkUser } = useUser()
  const localUser = getLocalAuthSession()

  // Resolve currently authenticated user
  const activeUser = clerkUser
    ? {
        id: clerkUser.id,
        fullName: clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Main Admin',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        role: 'ADMIN' as WorkspaceRole,
        avatarUrl: clerkUser.imageUrl,
      }
    : localUser
    ? {
        id: localUser.id,
        fullName: localUser.fullName,
        email: localUser.email,
        role: localUser.role as WorkspaceRole,
        avatarUrl: localUser.avatarUrl,
      }
    : null

  const currentUserName = activeUser?.fullName || 'Workspace Admin'

  const [wedding, setWedding] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    locationName: '',
  })

  // Store data
  const [members, setMembers] = useState<WeddingMembership[]>([])
  const [invitations, setInvitations] = useState<OrganizerInvitation[]>([])

  // View Filter / Tabs
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'matrix'>('members')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Feedback alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [copiedCreds, setCopiedCreds] = useState(false)

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<WeddingMembership | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<WeddingMembership | null>(null)
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string
    email: string
    role: WorkspaceRole
    title?: string
  } | null>(null)

  // Invite Form State
  const [inviteForm, setInviteForm] = useState({
    targetEmail: '',
    targetName: '',
    title: '',
    role: 'ORGANIZER' as WorkspaceRole,
    permissions: { ...DEFAULT_ORGANIZER_PERMISSIONS },
  })

  // Edit Member Form State
  const [editForm, setEditForm] = useState({
    role: 'ORGANIZER' as WorkspaceRole,
    title: '',
    permissions: { ...DEFAULT_ORGANIZER_PERMISSIONS },
  })

  const refreshData = () => {
    const list = getMembers(undefined, activeUser || undefined)
    setMembers(list)
    setInvitations(getOrganizerInvitations())
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('weddingos_active_wedding')
      if (stored) setWedding(JSON.parse(stored))
    } catch {
      // ignore
    }

    refreshData()
    syncMembersFromBackend().then(() => refreshData()).catch(() => {})

    const handleUpdate = () => refreshData()
    window.addEventListener('weddingos_members_updated', handleUpdate)
    window.addEventListener('weddingos_auth_changed', handleUpdate)
    return () => {
      window.removeEventListener('weddingos_members_updated', handleUpdate)
      window.removeEventListener('weddingos_auth_changed', handleUpdate)
    }
  }, [clerkUser, localUser?.email])

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setErrorMessage(null)
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  const showError = (msg: string) => {
    setErrorMessage(msg)
    setSuccessMessage(null)
    setTimeout(() => setErrorMessage(null), 6000)
  }

  // Handle adding a team member by email (they sign in with Clerk; no password is assigned)
  const handleInviteSubmit = (e: FormEvent) => {
    e.preventDefault()
    try {
      const newMember = assignTeamMember({
        fullName: inviteForm.targetName,
        email: inviteForm.targetEmail,
        role: inviteForm.role,
        title: inviteForm.title,
        modulePermissions: inviteForm.role === 'ADMIN' ? ALL_PERMISSIONS_ENABLED : inviteForm.permissions,
      })

      refreshData()
      setIsInviteModalOpen(false)
      setCreatedCredentials({
        name: newMember.fullName,
        email: newMember.email,
        role: newMember.role,
        title: newMember.title,
      })
      showSuccess(`Added "${newMember.fullName}" as ${newMember.role}. Ask them to sign up with this email to get access.`)

      // Reset form
      setInviteForm({
        targetEmail: '',
        targetName: '',
        title: '',
        role: 'ORGANIZER',
        permissions: { ...DEFAULT_ORGANIZER_PERMISSIONS },
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assign team member'
      showError(msg)
    }
  }

  // Open Edit Member Modal
  const openEditModal = (member: WeddingMembership) => {
    setEditingMember(member)
    setEditForm({
      role: member.role,
      title: member.title || '',
      permissions: { ...member.modulePermissions },
    })
  }

  // Handle Save Member Edit (FR-MEM-03 & FR-MEM-06)
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!editingMember) return

    try {
      updateMemberRoleAndPermissions(
        editingMember.id,
        editForm.role,
        editForm.role === 'ADMIN' ? ALL_PERMISSIONS_ENABLED : editForm.permissions,
        editForm.title
      )
      refreshData()
      setEditingMember(null)
      showSuccess(`Updated permissions and role for ${editingMember.fullName}.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed updating member'
      showError(msg)
    }
  }

  // Handle Member Removal (FR-MEM-04 & FR-MEM-06)
  const confirmRemoveMember = () => {
    if (!memberToDelete) return
    try {
      removeMember(memberToDelete.id)
      refreshData()
      showSuccess(`Removed "${memberToDelete.fullName}" from the wedding workspace.`)
      setMemberToDelete(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed removing member'
      showError(msg)
      setMemberToDelete(null)
    }
  }

  // Handle Revoke Invitation
  const handleRevoke = (inviteId: string, email: string) => {
    if (confirm(`Revoke pending invitation for "${email}"? This link will no longer work.`)) {
      revokeInvitation(inviteId)
      refreshData()
      showSuccess(`Invitation for "${email}" has been revoked.`)
    }
  }

  // Handle Simulate Accept Invitation (FR-MEM-02 testing)
  const handleSimulateAccept = (invite: OrganizerInvitation) => {
    try {
      const newMember = acceptInvitation(invite.id, invite.targetName)
      refreshData()
      showSuccess(`Simulated acceptance! ${newMember.fullName} (${newMember.role}) is now an active member.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed accepting invitation'
      showError(msg)
    }
  }

  // Copy invitation link
  const handleCopyInviteLink = (token: string) => {
    const link = `${window.location.origin}/app/members?invite=${token}`
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2500)
  }

  // Copy created credentials
  const handleCopyCredentials = () => {
    if (!createdCredentials) return
    const text = `You have been added to a WeddingOS wedding workspace.\nCreate your account (or sign in) at: ${window.location.origin}/sign-up\nUse this email: ${createdCredentials.email}\nRole: ${createdCredentials.role}`
    navigator.clipboard.writeText(text)
    setCopiedCreds(true)
    setTimeout(() => setCopiedCreds(false), 2500)
  }

  // Counts & stats
  const totalMembers = members.length
  const adminCount = members.filter((m) => m.role === 'ADMIN').length
  const organizerCount = members.filter((m) => m.role === 'ORGANIZER').length
  const pendingCount = invitations.filter((i) => i.status === 'PENDING').length

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesRole = roleFilter === 'all' || m.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Filtered invitations list
  const filteredInvitations = invitations.filter((i) => {
    return (
      i.targetEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.targetName && i.targetName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  return (
    <div className="space-y-6 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & WORKSPACE AUTHORITY BANNER                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#e6bd81]/50 shadow-sm p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#e6bd81]/15 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4b030e] text-[#e6bd81] border border-[#b88444]/40 tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e6bd81]" />
                Workspace Administration &amp; Access Controls
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                <Lock className="w-3 h-3 text-purple-600" />
                FR-MEM-06 Final-Admin Protected
              </span>
            </div>

            <h1 className="font-cormorant text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4b030e]">
              Organizer Team &amp; Role Permissions
            </h1>
            <p className="text-sm text-[#4b030e]/80 mt-1 max-w-2xl">
              Workspace access for <strong>{wedding.brideName || 'Wedding'} &amp; {wedding.groomName}’s</strong> planning team.
              Add Co-Organizers or Admins by email. They sign up with that email to access this dashboard.
            </p>
          </div>

          {/* Right Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                syncMembersFromBackend().then(() => refreshData()).catch(() => refreshData())
                showSuccess('Team roster synchronized.')
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4b030e] bg-[#faf9f6] border border-[#e6bd81] hover:bg-[#f6ebd9] transition-all cursor-pointer shadow-xs"
              title="Refresh team roster"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#b88444]" />
              Refresh
            </button>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#6f0617] text-white hover:bg-[#4b030e] transition-all cursor-pointer shadow-md"
            >
              <UserPlus className="w-4 h-4 text-[#e6bd81]" />
              Assign Co-Organizer / Admin
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATS OVERVIEW CARDS                                                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#e6bd81]/30">
          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-600 block">Total Active Members</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#4b030e]">{totalMembers}</span>
              <span className="text-xs text-neutral-500">organizers</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">Full workspace roster</span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
            <span className="text-[11px] font-medium text-purple-900 block">Workspace Admins</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-purple-900">{adminCount}</span>
              <span className="text-xs font-semibold text-purple-700">(Full Access)</span>
            </div>
            <span className="text-[10px] text-purple-700 mt-0.5 block">
              {adminCount === 1 ? '⚠️ Final Admin Protected' : 'Multiple Admins enabled'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-600 block">Module Coordinators</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#6f0617]">{organizerCount}</span>
              <span className="text-xs text-neutral-500">specialists</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">Custom granular access</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <span className="text-[11px] font-medium text-amber-900 block">Pending Invitations</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-900">{pendingCount}</span>
              <span className="text-xs text-amber-700">awaiting</span>
            </div>
            <span className="text-[10px] text-amber-700 mt-0.5 block">7-day secure tokens</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FEEDBACK NOTIFICATIONS (ALERTS)                                        */}
      {/* ========================================================================= */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-xs text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 text-xs text-rose-900 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notice for Created Member Credentials */}
      {createdCredentials && (
        <div className="p-5 rounded-2xl bg-emerald-50/95 border-2 border-emerald-400 text-xs text-emerald-950 space-y-3 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase tracking-wider">
                ✓ Member Added
              </span>
              <span className="font-bold text-sm text-[#4b030e]">{createdCredentials.name}</span>
            </div>
            <button onClick={() => setCreatedCredentials(null)} className="text-emerald-800 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-emerald-900">
            Ask this member to create their account at <strong className="font-mono text-[#6f0617]">{window.location.origin}/sign-up</strong> using the email below. Their access is linked automatically once the email is verified.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/90 p-3 rounded-xl border border-emerald-300">
            <div>
              <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Email</span>
              <span className="font-mono font-bold text-neutral-800 text-xs break-all">{createdCredentials.email}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Assigned Role</span>
              <span className="font-semibold text-xs text-purple-900">{createdCredentials.role} ({createdCredentials.title || 'Team Member'})</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleCopyCredentials}
              className="px-3.5 py-1.5 rounded-lg bg-[#6f0617] text-white font-sans text-xs font-semibold hover:bg-[#4b030e] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedCreds ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCreds ? 'Copied Invite Message!' : 'Copy Invite Message (Share via WhatsApp)'}
            </button>
            <button
              onClick={() => setCreatedCredentials(null)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TABS AND SEARCH CONTROLS                                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#e6bd81]/50 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#faf9f6] rounded-xl border border-[#e6bd81]/40 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-[#4b030e] hover:bg-white'
              }`}
            >
              Active Members ({totalMembers})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'invitations'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-[#4b030e] hover:bg-white'
              }`}
            >
              Pending Invitations ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-[#4b030e] hover:bg-white'
              }`}
            >
              Permission Matrix
            </button>
          </div>

          {/* Role Filter & Search */}
          <div className="flex items-center gap-2">
            {activeTab === 'members' && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-semibold text-[#4b030e] focus:outline-none focus:ring-1 focus:ring-[#6f0617]"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admins Only</option>
                <option value="ORGANIZER">Organizers Only</option>
              </select>
            )}

            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, or title..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs text-[#4b030e] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
              />
              <Mail className="w-3.5 h-3.5 text-[#b88444] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB A: ACTIVE MEMBERS TABLE                                               */}
        {/* ========================================================================= */}
        {activeTab === 'members' && (
          <div className="overflow-x-auto rounded-xl border border-[#e6bd81]/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] text-[#4b030e] border-b border-[#e6bd81]/40 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Member Name &amp; Contact</th>
                  <th className="py-3 px-4">Role &amp; Title</th>
                  <th className="py-3 px-4">Configured Module Access</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6bd81]/20">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      No members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const isLastAdmin = member.role === 'ADMIN' && adminCount === 1

                    return (
                      <tr key={member.id} className="hover:bg-[#faf4ec] transition-colors">
                        {/* Member Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#6f0617] text-[#e6bd81] flex items-center justify-center font-bold text-xs shadow-xs border border-[#e6bd81]/50 shrink-0">
                              {member.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#4b030e] text-sm">{member.fullName}</span>
                                {member.isCurrentSessionUser && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#faf9f6] text-[#6f0617] border border-[#e6bd81] shadow-2xs">
                                    ★ Main Admin (You)
                                  </span>
                                )}
                              </div>
                              <span className="text-neutral-500 text-[11px] block">{member.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role & Title */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            {member.role === 'ADMIN' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                                <ShieldCheck className="w-3 h-3 text-purple-700" />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <UserCheck className="w-3 h-3 text-amber-700" />
                                Organizer
                              </span>
                            )}
                            <p className="text-[11px] font-medium text-neutral-600">
                              {member.title || (member.role === 'ADMIN' ? 'Workspace Admin' : 'Event Co-Organizer')}
                            </p>
                          </div>
                        </td>

                        {/* Configured Module Access */}
                        <td className="py-3.5 px-4">
                          {member.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#faf9f6] text-[#6f0617] border border-[#e6bd81]">
                              <Sparkles className="w-3 h-3 text-[#b88444]" />
                              Full Workspace Authority (All 8 Modules)
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {MODULE_DEFINITIONS.filter((mod) => member.modulePermissions[mod.key]).map((mod) => (
                                <span
                                  key={mod.key}
                                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#f6ebd9] text-[#6f0617] border border-[#e6bd81]/50"
                                >
                                  {mod.label.split(' ')[0]}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 text-neutral-500 text-[11px]">
                          {new Date(member.joinedAt).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(member)}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
                              title="Edit Role & Permissions"
                            >
                              <Edit2 className="w-4 h-4 text-[#b88444]" />
                            </button>

                            <button
                              type="button"
                              disabled={isLastAdmin}
                              onClick={() => {
                                if (isLastAdmin) {
                                  showError('Action Denied (FR-MEM-06): Cannot remove the final remaining Admin.')
                                  return
                                }
                                setMemberToDelete(member)
                              }}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isLastAdmin
                                  ? 'opacity-30 cursor-not-allowed text-neutral-400'
                                  : 'hover:bg-red-50 text-neutral-400 hover:text-red-600'
                              }`}
                              title={isLastAdmin ? 'Protected: Final Admin cannot be removed (FR-MEM-06)' : 'Remove Member'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB B: PENDING INVITATIONS                                                */}
        {/* ========================================================================= */}
        {activeTab === 'invitations' && (
          <div className="overflow-x-auto rounded-xl border border-[#e6bd81]/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] text-[#4b030e] border-b border-[#e6bd81]/40 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Invited Email &amp; Candidate</th>
                  <th className="py-3 px-4">Intended Role</th>
                  <th className="py-3 px-4">Invited By</th>
                  <th className="py-3 px-4">Status &amp; Expiry</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6bd81]/20">
                {filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      No pending token invitations found. (Assigned team members appear under Active Members).
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#faf4ec] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#4b030e] text-sm">{inv.targetEmail}</div>
                        {inv.targetName && <span className="text-neutral-500 text-[11px]">{inv.targetName}</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {inv.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-600 text-[11px]">
                        {inv.invitedByUserName}
                      </td>

                      <td className="py-3.5 px-4">
                        {inv.status === 'PENDING' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-700" />
                              Pending
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              Expires {new Date(inv.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ) : inv.status === 'ACCEPTED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Accepted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-500">
                            {inv.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {inv.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSimulateAccept(inv)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition-all cursor-pointer"
                                title="Simulate invitation acceptance"
                              >
                                Accept &amp; Join
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyInviteLink(inv.token)}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-[#b88444] transition-colors cursor-pointer"
                                title="Copy Invitation Token / Link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRevoke(inv.id, inv.targetEmail)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Revoke Invitation"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB C: PERMISSION MATRIX OVERVIEW                                         */}
        {/* ========================================================================= */}
        {activeTab === 'matrix' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/40 text-xs text-neutral-600 flex items-center justify-between">
              <span>
                Visual overview of module access permissions across all team members. Click "Edit" on any member to modify permissions.
              </span>
              <span className="font-semibold text-[#6f0617]">8 Configurable Modules</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#e6bd81]/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#faf9f6] text-[#4b030e] border-b border-[#e6bd81]/40 font-semibold text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-3">Team Member</th>
                    <th className="py-3 px-2 text-center">Role</th>
                    {MODULE_DEFINITIONS.map((mod) => (
                      <th key={mod.key} className="py-3 px-2 text-center" title={mod.description}>
                        {mod.label.split(' ')[0]}
                      </th>
                    ))}
                    <th className="py-3 px-3 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6bd81]/20">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-[#faf4ec] transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#4b030e]">
                        {member.fullName}
                        <span className="block text-[10px] text-neutral-400 font-normal">{member.email}</span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                            member.role === 'ADMIN' ? 'bg-purple-100 text-purple-900' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>

                      {MODULE_DEFINITIONS.map((mod) => {
                        const hasAccess = member.role === 'ADMIN' || member.modulePermissions[mod.key]
                        return (
                          <td key={mod.key} className="py-3 px-2 text-center">
                            {hasAccess ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-100 text-neutral-300 text-xs">
                                —
                              </span>
                            )}
                          </td>
                        )
                      })}

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(member)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#faf9f6] border border-[#e6bd81] text-[#4b030e] hover:bg-[#f6ebd9] cursor-pointer"
                        >
                          Modify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: ASSIGN CO-ORGANIZER OR ADMIN                                     */}
      {/* ========================================================================= */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border-2 border-[#e6bd81] shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81] text-[10px] font-bold uppercase tracking-wider">
                Direct Workspace Access
              </span>
            </div>

            <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#4b030e]">
              Assign Co-Organizer or Admin
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Provide their name and email. They create their own account with that email; access is linked automatically once the email is verified.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1">
                  Candidate Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={inviteForm.targetName}
                  onChange={(e) => setInviteForm({ ...inviteForm, targetName: e.target.value })}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1">
                  Login Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.targetEmail}
                  onChange={(e) => setInviteForm({ ...inviteForm, targetEmail: e.target.value })}
                  placeholder="e.g. vikram@weddingcraft.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">They sign up at /sign-up with this exact email</span>
              </div>

              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1">
                  Designation / Role Title (Optional)
                </label>
                <input
                  type="text"
                  value={inviteForm.title}
                  onChange={(e) => setInviteForm({ ...inviteForm, title: e.target.value })}
                  placeholder="e.g. Brother of Bride, Event Lead, Hospitality Lead"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1">
                  Workspace Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInviteForm({ ...inviteForm, role: 'ORGANIZER' })}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      inviteForm.role === 'ORGANIZER'
                        ? 'border-[#6f0617] bg-[#faf4ec] text-[#4b030e]'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <span className="font-bold text-xs block">Co-Organizer</span>
                    <span className="text-[10px] text-neutral-500">Fine-grained module access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInviteForm({ ...inviteForm, role: 'ADMIN' })}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      inviteForm.role === 'ADMIN'
                        ? 'border-purple-600 bg-purple-50 text-purple-950'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <span className="font-bold text-xs block">Admin</span>
                    <span className="text-[10px] text-neutral-500">Full workspace authority</span>
                  </button>
                </div>
              </div>

              {/* Module Permissions Checkboxes (Only for Organizer role) */}
              {inviteForm.role === 'ORGANIZER' && (
                <div className="space-y-2 pt-2 border-t border-[#e6bd81]/30">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#4b030e] uppercase tracking-wider text-[11px]">
                      Configurable Module Permissions (FR-MEM-03)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setInviteForm({
                            ...inviteForm,
                            permissions: { ...ALL_PERMISSIONS_ENABLED },
                          })
                        }
                        className="text-[10px] text-[#6f0617] font-semibold hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setInviteForm({
                            ...inviteForm,
                            permissions: {
                              events: false,
                              tasks: false,
                              invitations: false,
                              check_in: false,
                              expenses: false,
                              vendors: false,
                              website: false,
                              gallery: false,
                            },
                          })
                        }
                        className="text-[10px] text-neutral-400 font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MODULE_DEFINITIONS.map((mod) => (
                      <label
                        key={mod.key}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl border border-[#e6bd81]/40 bg-[#faf9f6] hover:bg-[#faf4ec] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={inviteForm.permissions[mod.key]}
                          onChange={(e) =>
                            setInviteForm({
                              ...inviteForm,
                              permissions: {
                                ...inviteForm.permissions,
                                [mod.key]: e.target.checked,
                              },
                            })
                          }
                          className="mt-0.5 rounded text-[#6f0617] focus:ring-[#6f0617]"
                        />
                        <div>
                          <span className="font-semibold text-[#4b030e] block text-xs">{mod.label}</span>
                          <span className="text-[10px] text-neutral-500 leading-tight block">
                            {mod.description}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 rounded-xl font-bold text-xs bg-[#6f0617] hover:bg-[#4b030e] text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Assign &amp; Authorize Member
                </button>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="py-3 px-4 rounded-xl font-semibold text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: EDIT ROLE & PERMISSIONS (FR-MEM-03 & FR-MEM-06)                 */}
      {/* ========================================================================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border-2 border-[#e6bd81] shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-0.5 rounded-full bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81] text-[10px] font-bold uppercase tracking-wider block w-fit mb-1">
              FR-MEM-03 Permission Editor
            </span>

            <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#4b030e]">
              Edit Member Access: {editingMember.fullName}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">{editingMember.email}</p>

            {/* FR-MEM-06 Warning if this member is the last Admin */}
            {editingMember.role === 'ADMIN' && adminCount === 1 && (
              <div className="mt-4 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
                <Lock className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Protected by FR-MEM-06 Invariant</span>
                  <span>
                    This member is the only remaining Admin of this wedding workspace. Demoting them to Organizer is blocked to prevent workspace lockout.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1">
                  Role Title / Responsibility
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. Chief Hospitality Coordinator"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                />
              </div>

              {/* Role Selector */}
              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1">
                  Workspace Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={editingMember.role === 'ADMIN' && adminCount === 1}
                    onClick={() => setEditForm({ ...editForm, role: 'ORGANIZER' })}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      editingMember.role === 'ADMIN' && adminCount === 1
                        ? 'opacity-40 cursor-not-allowed border-neutral-200 bg-neutral-100'
                        : editForm.role === 'ORGANIZER'
                        ? 'border-[#6f0617] bg-[#faf4ec] text-[#4b030e]'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <span className="font-bold text-xs block">Organizer</span>
                    <span className="text-[10px] text-neutral-500">Fine-grained module access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, role: 'ADMIN' })}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      editForm.role === 'ADMIN'
                        ? 'border-purple-600 bg-purple-50 text-purple-950'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <span className="font-bold text-xs block">Admin</span>
                    <span className="text-[10px] text-neutral-500">Full workspace authority</span>
                  </button>
                </div>
              </div>

              {/* Module Permissions Checkboxes (Only when Organizer role is selected) */}
              {editForm.role === 'ORGANIZER' && (
                <div className="space-y-2 pt-2 border-t border-[#e6bd81]/30">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#4b030e] uppercase tracking-wider text-[11px]">
                      Configurable Module Access
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            permissions: { ...ALL_PERMISSIONS_ENABLED },
                          })
                        }
                        className="text-[10px] text-[#6f0617] font-semibold hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            permissions: {
                              events: false,
                              tasks: false,
                              invitations: false,
                              check_in: false,
                              expenses: false,
                              vendors: false,
                              website: false,
                              gallery: false,
                            },
                          })
                        }
                        className="text-[10px] text-neutral-400 font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MODULE_DEFINITIONS.map((mod) => (
                      <label
                        key={mod.key}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl border border-[#e6bd81]/40 bg-[#faf9f6] hover:bg-[#faf4ec] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={editForm.permissions[mod.key]}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              permissions: {
                                ...editForm.permissions,
                                [mod.key]: e.target.checked,
                              },
                            })
                          }
                          className="mt-0.5 rounded text-[#6f0617] focus:ring-[#6f0617]"
                        />
                        <div>
                          <span className="font-semibold text-[#4b030e] block text-xs">{mod.label}</span>
                          <span className="text-[10px] text-neutral-500 leading-tight block">
                            {mod.description}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 rounded-xl font-bold text-xs bg-[#6f0617] hover:bg-[#4b030e] text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Role &amp; Permissions
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="py-3 px-4 rounded-xl font-semibold text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: CONFIRM REMOVE MEMBER (FR-MEM-04)                               */}
      {/* ========================================================================= */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border-2 border-red-300 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-red-950">
                Remove Team Member?
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Are you sure you want to revoke workspace access for <strong>{memberToDelete.fullName}</strong> ({memberToDelete.email})?
                They will immediately lose access to all wedding planning modules.
              </p>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={confirmRemoveMember}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md transition-all cursor-pointer"
                >
                  Confirm &amp; Remove
                </button>
                <button
                  type="button"
                  onClick={() => setMemberToDelete(null)}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
