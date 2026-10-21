const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://weddingos-api.onrender.com/api/v1'
    : 'http://localhost:8080/api/v1')

export function getActiveWeddingId(): number {
  try {
    const raw = localStorage.getItem('weddingos_active_wedding')
    if (raw) {
      const parsed = JSON.parse(raw)
      const id = Number(parsed.id)
      if (id && !isNaN(id)) return id
    }
  } catch {}
  return 1
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // Grab active auth user email & clerk id if present in local session
  let authEmail = ''
  let authClerkId = ''
  try {
    const sessionRaw = localStorage.getItem('weddingos_session_user')
    if (sessionRaw) {
      const sess = JSON.parse(sessionRaw)
      if (sess.email) authEmail = sess.email
      if (sess.id) authClerkId = sess.id
    }
  } catch {}

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(authEmail ? { 'X-User-Email': authEmail } : {}),
    ...(authClerkId ? { 'X-Clerk-User-Id': authClerkId } : {}),
    ...((options.headers as Record<string, string>) || {}),
  }

  // 10s request timeout to guarantee UI never freezes or hangs indefinitely
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      let errorMsg = `API Error ${response.status}: ${response.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.message) errorMsg = errorJson.message
      } catch {
        if (errorText) errorMsg = errorText
      }
      throw new Error(errorMsg)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

// ---------------- Workspaces & Dashboard ----------------
export interface WorkspaceSummary {
  id: number
  slug: string
  brideName: string
  groomName: string
  weddingDate: string
  city: string
  venueName: string
  currencyCode: string
  totalBudgetTarget: number
  totalRecordedSpending: number
  totalPaid: number
  totalPendingDues: number
  remainingRunway: number
  expectedGuestCapacity: number
  totalInvitationsCount: number
}

export const workspaceApi = {
  getActive: (weddingId?: number, userEmail?: string, clerkUserId?: string, userName?: string) => {
    const params: string[] = []
    if (weddingId) params.push(`weddingId=${weddingId}`)
    if (userEmail) params.push(`userEmail=${encodeURIComponent(userEmail)}`)
    if (clerkUserId) params.push(`clerkUserId=${encodeURIComponent(clerkUserId)}`)
    if (userName) params.push(`userName=${encodeURIComponent(userName)}`)
    const qs = params.length > 0 ? `?${params.join('&')}` : ''
    return request<WorkspaceSummary>(`/workspaces/active${qs}`)
  },
  getById: (weddingId: number) => request<WorkspaceSummary>(`/workspaces/${weddingId}`),
  create: (data: {
    ownerUserId?: number
    brideName: string
    groomName: string
    weddingDate?: string
    city: string
    venueName?: string
    totalBudgetTarget?: number
    slug?: string
  }) =>
    request<any>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBudget: (totalBudgetTarget: number, weddingId?: number) => {
    const wid = weddingId ?? getActiveWeddingId()
    return request<any>(`/workspaces/budget?weddingId=${wid}`, {
      method: 'PUT',
      body: JSON.stringify({ totalBudgetTarget, weddingId: wid }),
    })
  },
  updateDetails: (
    details: {
      brideName: string
      groomName: string
      weddingDate?: string
      city?: string
      venueName?: string
      slug?: string
    },
    weddingId?: number
  ) => {
    const wid = weddingId ?? getActiveWeddingId()
    return request<any>(`/workspaces/details?weddingId=${wid}`, {
      method: 'PUT',
      body: JSON.stringify({ ...details, weddingId: wid }),
    })
  },
  reset: async (weddingId?: number) => {
    const wid = weddingId ?? getActiveWeddingId()
    try {
      return await request<WorkspaceSummary>(`/workspaces/${wid}/reset`, {
        method: 'POST',
      })
    } catch {
      return await request<WorkspaceSummary>(`/workspaces/reset?weddingId=${wid}`, {
        method: 'POST',
      })
    }
  },
}
export const workspacesApi = workspaceApi

// ---------------- Events ----------------
export interface BackendWeddingEvent {
  id: number
  weddingId?: number
  name: string
  eventType: string
  eventDate: string
  dayLabel?: string
  startTime: string
  endTime: string
  venueName: string
  address: string
  dressCode?: string
  mapUrl?: string
  description?: string
  attendeeEstimate?: number
  imageUrl?: string
  sequenceOrder?: number
}

export const eventsApi = {
  getAll: (weddingId = 1) => request<BackendWeddingEvent[]>(`/events?weddingId=${weddingId}`),
  create: (data: Partial<BackendWeddingEvent>, weddingId = 1) =>
    request<BackendWeddingEvent>(`/events?weddingId=${weddingId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<BackendWeddingEvent>) =>
    request<BackendWeddingEvent>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/events/${id}`, {
      method: 'DELETE',
    }),
}

// ---------------- Preparation Tasks ----------------
export interface BackendTask {
  id: number
  weddingId?: number
  title: string
  category: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate?: string
  assignedTo?: string
  budgetImpact?: number
  vendorDependency?: string
}

export const tasksApi = {
  getAll: (weddingId = 1) => request<BackendTask[]>(`/tasks?weddingId=${weddingId}`),
  create: (data: Partial<BackendTask>, weddingId = 1) =>
    request<BackendTask>(`/tasks?weddingId=${weddingId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<BackendTask>) =>
    request<BackendTask>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
}

// ---------------- Family Invitations ----------------
export interface BackendInvitation {
  id: number
  displayName: string
  primaryContactName: string
  phoneNumber: string
  email?: string
  circle: string
  maxAttendees: number
  actualAttendees: number
  rsvpStatus: 'PENDING' | 'ATTENDING' | 'NOT_ATTENDING'
  dietaryNotes?: string
  invitationToken: string
  organizerNotes?: string
  checkedInAt?: string
  checkedInBy?: string
}

export interface InvitationsResponse {
  totalFamilies: number
  confirmedGuests: number
  pendingCount: number
  maxCapacity: number
  invitations: BackendInvitation[]
}

export const invitationsApi = {
  getAll: (weddingId = 1) => request<InvitationsResponse>(`/invitations?weddingId=${weddingId}`),
  create: (data: Partial<BackendInvitation>, weddingId = 1) =>
    request<BackendInvitation>(`/invitations?weddingId=${weddingId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<BackendInvitation>) =>
    request<BackendInvitation>(`/invitations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/invitations/${id}`, {
      method: 'DELETE',
    }),
  updateRsvp: (
    id: number,
    payload: {
      rsvpStatus: string
      actualAttendees: number
      dietaryNotes?: string
      organizerNotes?: string
    }
  ) =>
    request<BackendInvitation>(`/invitations/${id}/rsvp`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
}

// ---------------- Check-In & Gate Verification ----------------
export interface CheckInLog {
  id: number
  familyName: string
  primaryContact: string
  attendeeCount: number
  maxAttendees: number
  circle: string
  checkedInBy: string
  isDuplicateAttempt: boolean
  scannedAt: string
}

export interface CheckInResult {
  success: boolean
  alreadyCheckedIn: boolean
  invitation?: BackendInvitation
  admittedAttendees: number
  checkedInBy: string
  checkedInAt: string
  message: string
}

export const checkInApi = {
  search: (query: string, weddingId = 1) =>
    request<BackendInvitation[]>(`/check-in/search?weddingId=${weddingId}&q=${encodeURIComponent(query)}`),
  scan: (token: string, attendeeCount?: number, checkedInBy = 'Desk Coordinator', weddingId = 1) =>
    request<CheckInResult>(`/check-in/scan?weddingId=${weddingId}`, {
      method: 'POST',
      body: JSON.stringify({ token, attendeeCount, checkedInBy }),
    }),
  getLogs: (weddingId = 1) => request<CheckInLog[]>(`/check-in/logs?weddingId=${weddingId}`),
}

// ---------------- Team Members & RBAC ----------------
export interface BackendMemberUser {
  id: number
  clerkUserId: string
  email: string
  fullName: string
  avatarUrl?: string
}

export interface BackendMembership {
  id: number
  user: BackendMemberUser
  role: 'ADMIN' | 'ORGANIZER'
  title: string
  canManageEvents: boolean
  canManageTasks: boolean
  canManageGuests: boolean
  canCheckInGuests: boolean
  canManageExpenses: boolean
  canManageVendors: boolean
  canManageWebsite: boolean
  canModerateGallery: boolean
  createdAt: string
}

export const membersApi = {
  getAll: (weddingId = 1) => request<BackendMembership[]>(`/members?weddingId=${weddingId}`),
  invite: (
    payload: {
      fullName: string
      email: string
      role: 'ADMIN' | 'ORGANIZER'
      title?: string
    },
    weddingId = 1
  ) =>
    request<BackendMembership>(`/members/invite?weddingId=${weddingId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateRole: (membershipId: number, role: 'ADMIN' | 'ORGANIZER') =>
    request<BackendMembership>(`/members/${membershipId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  updatePermissions: (membershipId: number, permissions: Partial<BackendMembership>) =>
    request<BackendMembership>(`/members/${membershipId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(permissions),
    }),
  remove: (membershipId: number) =>
    request<void>(`/members/${membershipId}`, {
      method: 'DELETE',
    }),
}

// ---------------- Expenses & Budget Ledger ----------------
export interface BackendExpense {
  id: number
  weddingId?: number
  category: string
  title: string
  plannedAmount: number
  actualAmount: number
  paidAmount: number
  dueAmount: number
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID'
  vendorName?: string
  invoiceNumber?: string
  paymentDate?: string
  notes?: string
}

export const expensesApi = {
  getAll: (weddingId = 1) => request<BackendExpense[]>(`/expenses?weddingId=${weddingId}`),
  create: (data: Partial<BackendExpense>, weddingId = 1) =>
    request<BackendExpense>(`/expenses?weddingId=${weddingId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<BackendExpense>) =>
    request<BackendExpense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/expenses/${id}`, {
      method: 'DELETE',
    }),
}

// ---------------- Vendors ----------------
export interface BackendVendor {
  id: number
  weddingId?: number
  category: string
  businessName: string
  contactPerson?: string
  phone?: string
  email?: string
  quotedAmount: number
  paidAmount: number
  balanceDue: number
  status: 'SHORTLISTED' | 'CONTACTED' | 'CONTRACT_SENT' | 'CONFIRMED' | 'DELIVERED'
  notes?: string
}

export const vendorsApi = {
  getAll: (weddingId = 1) => request<BackendVendor[]>(`/vendors?weddingId=${weddingId}`),
  create: (data: Partial<BackendVendor>, weddingId = 1) =>
    request<BackendVendor>(`/vendors?weddingId=${weddingId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<BackendVendor>) =>
    request<BackendVendor>(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/vendors/${id}`, {
      method: 'DELETE',
    }),
}

// ---------------- Website Studio ----------------
export interface BackendWebsiteConfig {
  id: number
  themeKey: 'ROYAL_UDAIPUR' | 'EMERALD_PALACE' | 'MARIGOLD_FESTIVE'
  welcomeHeadline: string
  welcomeMessage: string
  isPublished: boolean
  showSchedule: boolean
  showDressCode: boolean
  showVenues: boolean
  showLivestream: boolean
  livestreamUrl?: string
}

export const websiteApi = {
  getConfig: (weddingId = 1) => request<BackendWebsiteConfig>(`/website?weddingId=${weddingId}`),
  updateConfig: (data: Partial<BackendWebsiteConfig>, weddingId = 1) =>
    request<BackendWebsiteConfig>(`/website?weddingId=${weddingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getPublic: (slug: string) => request<any>(`/public/w/${slug}`),
}

// ---------------- Gallery & Moderation ----------------
export interface BackendGalleryPhoto {
  id: number
  weddingId?: number
  photoUrl: string
  thumbnailUrl?: string
  caption?: string
  uploadedByName: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  likesCount: number
  createdAt: string
}

export const galleryApi = {
  getAll: (weddingId = 1) => request<BackendGalleryPhoto[]>(`/gallery?weddingId=${weddingId}`),
  getModerationQueue: (weddingId = 1) => request<BackendGalleryPhoto[]>(`/gallery/moderation?weddingId=${weddingId}`),
  upload: (
    data: {
      photoUrl: string
      caption?: string
      uploadedByName?: string
    },
    weddingId = 1
  ) =>
    request<BackendGalleryPhoto>(`/gallery/upload?weddingId=${weddingId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  uploadFile: async (
    file: File,
    params: { weddingId?: number; caption?: string; ceremonyTag?: string; uploaderName?: string } = {}
  ): Promise<BackendGalleryPhoto> => {
    const formData = new FormData()
    formData.append('file', file)
    if (params.weddingId) formData.append('weddingId', String(params.weddingId))
    if (params.caption) formData.append('caption', params.caption)
    if (params.ceremonyTag) formData.append('ceremonyTag', params.ceremonyTag)
    if (params.uploaderName) formData.append('uploaderName', params.uploaderName)

    const response = await fetch(`${API_BASE_URL}/gallery/upload-file`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
    return response.json()
  },
  moderatePhoto: (id: number | string, status: 'APPROVED' | 'REJECTED') =>
    request<BackendGalleryPhoto>(`/gallery/${id}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  updateStatus: (id: number, status: 'APPROVED' | 'REJECTED') =>
    request<BackendGalleryPhoto>(`/gallery/${id}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  delete: (id: number) =>
    request<void>(`/gallery/${id}`, {
      method: 'DELETE',
    }),
}
