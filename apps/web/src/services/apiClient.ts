function getBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.endsWith('.local')
    ) {
      return `http://${host}:8080/api/v1`
    }
    return 'https://weddingos-api.onrender.com/api/v1'
  }
  return 'http://localhost:8080/api/v1'
}

const API_BASE_URL = getBaseUrl()

// Returns the active wedding ID, or 1 in local development / fallback when none is selected.
export function getActiveWeddingId(): number {
  try {
    const raw = localStorage.getItem('weddingos_active_wedding')
    if (raw) {
      const parsed = JSON.parse(raw)
      const id = Number(parsed.id)
      if (Number.isInteger(id) && id > 0) return id
    }
  } catch {}
  if (
    import.meta.env.DEV ||
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.')))
  ) {
    return 1
  }
  return 0
}

// Resolves an explicit or active wedding ID and runs the call; auto-resolves from /workspaces/active if needed.
async function withWedding<T>(weddingId: number | null | undefined, call: (wid: number) => Promise<T>): Promise<T> {
  let wid = weddingId || getActiveWeddingId()
  if (!Number.isInteger(wid) || wid <= 0) {
    try {
      const active = await workspaceApi.getActive()
      if (active && Number.isInteger(active.id) && active.id > 0) {
        wid = active.id
        try {
          localStorage.setItem('weddingos_active_wedding', JSON.stringify(active))
          window.dispatchEvent(new Event('weddingos_active_wedding_changed'))
        } catch {}
      }
    } catch {}
  }
  if (!Number.isInteger(wid) || wid <= 0) {
    if (
      import.meta.env.DEV ||
      (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname.startsWith('192.168.') ||
          window.location.hostname.startsWith('10.')))
    ) {
      wid = 1
    } else {
      return Promise.reject(new Error('No active wedding workspace is selected.'))
    }
  }
  return call(wid)
}

// ---------------- Authentication ----------------
// The backend trusts only a verified Clerk session token. ClerkAuthBridge (App.tsx) registers
// Clerk's getToken here; email/user-id headers or localStorage values are never sent as identity.
type TokenProvider = () => Promise<string | null>
let authTokenProvider: TokenProvider | null = null

export function setAuthTokenProvider(provider: TokenProvider | null) {
  authTokenProvider = provider
}

async function authHeaders(): Promise<Record<string, string>> {
  try {
    // Fallback to Clerk's global instance in case a call fires before ClerkAuthBridge's effect runs.
    const clerkSession = typeof window !== 'undefined' ? (window as any).Clerk?.session : null
    const token = authTokenProvider
      ? await authTokenProvider()
      : clerkSession
        ? await clerkSession.getToken()
        : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

// isPublic: guest endpoints (invite token / website slug) are called without a bearer token.
async function request<T>(endpoint: string, options: RequestInit = {}, isPublic = false): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(isPublic ? {} : await authHeaders()),
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
  // The signed-in user is identified by the bearer token only. The extra parameters are kept for
  // call-site compatibility and are intentionally not sent.
  getActive: (weddingId?: number, _userEmail?: string, _clerkUserId?: string, _userName?: string) => {
    const qs = weddingId ? `?weddingId=${weddingId}` : ''
    return request<WorkspaceSummary>(`/workspaces/active${qs}`)
  },
  getById: (weddingId: number) => request<WorkspaceSummary>(`/workspaces/${weddingId}`),
  // The owner is always the signed-in user (from the bearer token).
  create: (data: {
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
  updateBudget: (totalBudgetTarget: number, weddingId?: number) =>
    withWedding(weddingId, (wid) =>
      request<any>(`/workspaces/budget?weddingId=${wid}`, {
        method: 'PUT',
        body: JSON.stringify({ totalBudgetTarget, weddingId: wid }),
      })
    ),
  updateDetails: (
    details: {
      brideName?: string
      groomName?: string
      weddingDate?: string
      city?: string
      venueName?: string
      slug?: string
    },
    weddingId?: number
  ) =>
    withWedding(weddingId, (wid) =>
      request<any>(`/workspaces/details?weddingId=${wid}`, {
        method: 'PUT',
        body: JSON.stringify({ ...details, weddingId: wid }),
      })
    ),
  // The backend currently rejects resets with 403; the error is surfaced to the caller.
  reset: (weddingId?: number) =>
    withWedding(weddingId, (wid) =>
      request<WorkspaceSummary>(`/workspaces/${wid}/reset`, {
        method: 'POST',
      })
    ),
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
  coverImageUrl?: string
  sequenceOrder?: number
}

export const eventsApi = {
  getAll: (weddingId?: number) =>
    withWedding(weddingId, (wid) => request<BackendWeddingEvent[]>(`/events?weddingId=${wid}`)),
  create: (data: Partial<BackendWeddingEvent>, weddingId?: number) =>
    withWedding(weddingId, (wid) =>
      request<BackendWeddingEvent>(`/events?weddingId=${wid}`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    ),
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
  getAll: (weddingId?: number) =>
    withWedding(weddingId, (wid) => request<BackendTask[]>(`/tasks?weddingId=${wid}`)),
  create: (data: Partial<BackendTask>, weddingId?: number) =>
    withWedding(weddingId, (wid) =>
      request<BackendTask>(`/tasks?weddingId=${wid}`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    ),
  update: (id: number, data: Partial<BackendTask>) =>
    request<BackendTask>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggle: (id: number) =>
    request<BackendTask>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
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
  getAll: (weddingId?: number) =>
    withWedding(weddingId, (wid) => request<InvitationsResponse>(`/invitations?weddingId=${wid}`)),
  create: (data: Partial<BackendInvitation>, weddingId?: number) =>
    withWedding(weddingId, (wid) =>
      request<BackendInvitation>(`/invitations?weddingId=${wid}`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    ),
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
  search: (query: string, weddingId?: number) =>
    withWedding(weddingId, (wid) =>
      request<BackendInvitation[]>(`/check-in/search?weddingId=${wid}&q=${encodeURIComponent(query)}`)
    ),
  scan: (token: string, attendeeCount?: number, checkedInBy = 'Desk Coordinator', weddingId?: number) =>
    withWedding(weddingId, (wid) =>
      request<CheckInResult>(`/check-in/scan?weddingId=${wid}`, {
        method: 'POST',
        body: JSON.stringify({ token, attendeeCount, checkedInBy }),
      })
    ),
  getLogs: (weddingId?: number) =>
    withWedding(weddingId, (wid) => request<CheckInLog[]>(`/check-in/logs?weddingId=${wid}`)),
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
  getAll: (weddingId?: number) =>
    withWedding(weddingId, (wid) => request<BackendMembership[]>(`/members?weddingId=${wid}`)),
  invite: (
    payload: {
      fullName: string
      email: string
      role: 'ADMIN' | 'ORGANIZER'
      title?: string
    },
    weddingId?: number
  ) =>
    withWedding(weddingId, (wid) =>
      request<BackendMembership>(`/members/invite?weddingId=${wid}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    ),
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
  title: string
  category: string
  amount: number
  currencyCode?: string
  expenseDate: string
  paymentStatus: 'PAID' | 'ADVANCE_PAID' | 'PENDING'
  paymentMethod?: string
  notes?: string
  plannedAmount?: number
  actualAmount?: number
  paidAmount?: number
  dueAmount?: number
  status?: string
  vendorName?: string
  invoiceNumber?: string
  paymentDate?: string
}

export interface ExpensesResponse {
  expenses: BackendExpense[]
  totalBudget: number
  totalRecorded: number
  totalPaid: number
  totalPendingDues: number
  remainingBudget: number
  utilizationPercentage: number
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
  currencyCode: string
}

export const expensesApi = {
  getAll: (weddingId?: number) =>
    withWedding(weddingId, (wid) => request<ExpensesResponse>(`/expenses?weddingId=${wid}`)),
  create: (data: Partial<BackendExpense>, weddingId?: number) =>
    withWedding(weddingId, (wid) =>
      request<BackendExpense>(`/expenses?weddingId=${wid}`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    ),
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
  totalContractValue?: number
  advancePaid?: number
  paymentStage?: 'PENDING' | 'PARTIALLY_PAID' | 'SETTLED'
  quotedAmount?: number
  paidAmount?: number
  balanceDue?: number
  status?: string
  notes?: string
}

export const vendorsApi = {
  getAll: (weddingId?: number) =>
    withWedding(weddingId, (wid) => request<BackendVendor[]>(`/vendors?weddingId=${wid}`)),
  create: (data: Partial<BackendVendor>, weddingId?: number) =>
    withWedding(weddingId, (wid) =>
      request<BackendVendor>(`/vendors?weddingId=${wid}`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    ),
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
  getConfig: (weddingId?: number) =>
    withWedding(weddingId, (wid) => request<BackendWebsiteConfig>(`/website?weddingId=${wid}`)),
  updateConfig: (data: Partial<BackendWebsiteConfig>, weddingId?: number) =>
    withWedding(weddingId, (wid) =>
      request<BackendWebsiteConfig>(`/website?weddingId=${wid}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    ),
  // Published sites only; unknown or unpublished slugs return 404.
  getPublic: (slug: string) => request<any>(`/public/w/${encodeURIComponent(slug)}`, {}, true),
}

// ---------------- Public guest endpoints (no login) ----------------
export interface PublicInvitation {
  invitationToken: string
  displayName: string
  primaryContactName: string
  circle: string
  maxAttendees: number
  actualAttendees: number
  rsvpStatus: 'PENDING' | 'ATTENDING' | 'NOT_ATTENDING'
  dietaryNotes?: string
  checkedIn: boolean
  brideName?: string
  groomName?: string
  weddingDate?: string
  city?: string
  venueName?: string
}

export interface PublicPhoto {
  id: number
  photoUrl: string
  caption?: string
  uploaderName: string
  uploadedAt: string
  isHighlight: boolean
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export const publicApi = {
  getInvitation: (token: string) =>
    request<PublicInvitation>(`/public/invite/${encodeURIComponent(token)}`, {}, true),
  submitRsvp: (
    token: string,
    payload: { rsvpStatus: 'ATTENDING' | 'NOT_ATTENDING'; actualAttendees?: number; dietaryNotes?: string }
  ) =>
    request<PublicInvitation>(
      `/public/invite/${encodeURIComponent(token)}/rsvp`,
      { method: 'POST', body: JSON.stringify(payload) },
      true
    ),
  getGallery: (slug: string) =>
    request<PublicPhoto[]>(`/public/w/${encodeURIComponent(slug)}/gallery`, {}, true),
  uploadGalleryFile: async (
    slug: string,
    file: File,
    params: { caption?: string; uploaderName?: string } = {}
  ): Promise<PublicPhoto> => {
    const formData = new FormData()
    formData.append('file', file)
    if (params.caption) formData.append('caption', params.caption)
    if (params.uploaderName) formData.append('uploaderName', params.uploaderName)
    const response = await fetch(`${API_BASE_URL}/public/w/${encodeURIComponent(slug)}/gallery/upload-file`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
    return response.json()
  },
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
  getAll: (weddingId?: number) =>
    withWedding(weddingId, (wid) => request<BackendGalleryPhoto[]>(`/gallery?weddingId=${wid}`)),
  getModerationQueue: (weddingId?: number) =>
    withWedding(weddingId, (wid) => request<BackendGalleryPhoto[]>(`/gallery/moderation?weddingId=${wid}`)),
  upload: (
    data: {
      photoUrl: string
      caption?: string
      uploadedByName?: string
    },
    weddingId?: number
  ) =>
    withWedding(weddingId, (wid) =>
      request<BackendGalleryPhoto>(`/gallery/upload?weddingId=${wid}`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    ),
  uploadFile: async (
    file: File,
    params: { weddingId?: number; caption?: string; ceremonyTag?: string; uploaderName?: string } = {}
  ): Promise<BackendGalleryPhoto> => {
    const wid = params.weddingId || getActiveWeddingId()
    if (!Number.isInteger(wid) || wid <= 0) {
      throw new Error('No active wedding workspace is selected.')
    }
    const formData = new FormData()
    formData.append('file', file)
    formData.append('weddingId', String(wid))
    if (params.caption) formData.append('caption', params.caption)
    if (params.ceremonyTag) formData.append('ceremonyTag', params.ceremonyTag)
    if (params.uploaderName) formData.append('uploaderName', params.uploaderName)

    const response = await fetch(`${API_BASE_URL}/gallery/upload-file`, {
      method: 'POST',
      headers: await authHeaders(),
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
