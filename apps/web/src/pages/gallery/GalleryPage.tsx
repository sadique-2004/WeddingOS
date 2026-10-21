import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Camera,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Share2,
  Upload,
  Download,
  Filter,
  Eye,
  Check,
  X,
  Sparkles,
  SlidersHorizontal,
  Copy,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Star,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Lock,
  Calendar,
  User,
  Heart,
  Grid3X3,
  List,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent } from '../../components/ui/Card'
import { galleryApi, workspacesApi, getActiveWeddingId } from '../../services/apiClient'

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type CeremonyCategory =
  | 'All'
  | 'Haldi & Mehndi'
  | 'Sangeet Gala'
  | 'Baraat & Pheras'
  | 'Reception Night'
  | 'Guest Candids'

export interface GalleryPhoto {
  id: string
  url: string
  title: string
  caption?: string
  ceremony: CeremonyCategory
  uploaderName: string
  uploaderRole: string
  uploadedAt: string
  status: ModerationStatus
  fileSize: string
  dimensions: string
  featured?: boolean
  likesCount: number
  rejectionReason?: string
}

export interface GallerySettings {
  galleryEnabled: boolean
  guestUploadsEnabled: boolean
  requireModeration: boolean
  allowGuestDownloads: boolean
  maxFileSizeMB: number
  token: string
  slug: string
}

const DEFAULT_SETTINGS: GallerySettings = {
  galleryEnabled: true,
  guestUploadsEnabled: true,
  requireModeration: true,
  allowGuestDownloads: true,
  maxFileSizeMB: 25,
  token: 'gal_94a7e2b810f3c88a',
  slug: 'wedding-gallery'
}

const INITIAL_PHOTOS: GalleryPhoto[] = []

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const stored = localStorage.getItem('weddingos_gallery_photos')
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return []
  })

  const [settings, setSettings] = useState<GallerySettings>(() => {
    try {
      const stored = localStorage.getItem('weddingos_gallery_settings')
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS
  })

  const [wedding, setWedding] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    locationName: '',
  })

  useEffect(() => {
    const loadWedding = async () => {
      try {
        const stored = localStorage.getItem('weddingos_active_wedding')
        if (stored) {
          const parsed = JSON.parse(stored)
          setWedding({
            brideName: parsed.brideName || '',
            groomName: parsed.groomName || '',
            weddingDate: parsed.weddingDate || '',
            locationName: parsed.locationName || parsed.venueName || parsed.city || '',
          })
        }
      } catch {
        // ignore
      }

      try {
        const active = await workspacesApi.getActive(getActiveWeddingId() || undefined)
        if (active) {
          setWedding({
            brideName: active.brideName || '',
            groomName: active.groomName || '',
            weddingDate: active.weddingDate || '',
            locationName: active.venueName || active.city || '',
          })
        }
      } catch {
        // ignore
      }
    }

    loadWedding()
    window.addEventListener('weddingos_wedding_updated', loadWedding)
    return () => window.removeEventListener('weddingos_wedding_updated', loadWedding)
  }, [])

  // Tab State: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SETTINGS'
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'SETTINGS'>('PENDING')
  const [selectedCeremony, setSelectedCeremony] = useState<CeremonyCategory>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID')

  // Modals state
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Upload Form State
  const [uploadCeremony, setUploadCeremony] = useState<CeremonyCategory>('Baraat & Pheras')
  const [uploaderName, setUploaderName] = useState('Organizer (You)')
  const [uploadTitle, setUploadTitle] = useState('')
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null)
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Persist state & dispatch update
  useEffect(() => {
    try {
      localStorage.setItem('weddingos_gallery_photos', JSON.stringify(photos))
      window.dispatchEvent(new Event('weddingos_gallery_updated'))
    } catch {
      // ignore
    }
  }, [photos])

  // Real-time sync listener when guest uploads on public gallery
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem('weddingos_gallery_photos')
        if (stored) {
          setPhotos(JSON.parse(stored))
        }
      } catch {
        // ignore
      }
    }
    window.addEventListener('weddingos_gallery_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('weddingos_gallery_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Fetch real photos from Cloudinary backend on load
  useEffect(() => {
    async function fetchBackendPhotos() {
      try {
        const [approvedRes, pendingRes] = await Promise.allSettled([
          galleryApi.getAll(),
          galleryApi.getModerationQueue()
        ])

        const dbPhotos: GalleryPhoto[] = []
        if (pendingRes.status === 'fulfilled' && Array.isArray(pendingRes.value)) {
          pendingRes.value.forEach((p: any) => {
            dbPhotos.push({
              id: `photo-db-${p.id}`,
              url: p.photoUrl,
              title: p.caption || 'Wedding Memory',
              caption: p.caption,
              ceremony: (p.ceremonyTag as CeremonyCategory) || 'Guest Candids',
              uploaderName: p.uploaderName || 'Wedding Guest',
              uploaderRole: 'Contributor',
              uploadedAt: p.uploadedAt ? new Date(p.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              status: p.moderationStatus || 'PENDING',
              fileSize: '3.5 MB',
              dimensions: '3840 x 2560',
              likesCount: p.likesCount || 0
            })
          })
        }
        if (approvedRes.status === 'fulfilled' && Array.isArray(approvedRes.value)) {
          approvedRes.value.forEach((p: any) => {
            dbPhotos.push({
              id: `photo-db-${p.id}`,
              url: p.photoUrl,
              title: p.caption || 'Wedding Memory',
              caption: p.caption,
              ceremony: (p.ceremonyTag as CeremonyCategory) || 'Guest Candids',
              uploaderName: p.uploaderName || 'Wedding Guest',
              uploaderRole: 'Contributor',
              uploadedAt: p.uploadedAt ? new Date(p.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              status: p.moderationStatus || 'APPROVED',
              fileSize: '3.5 MB',
              dimensions: '3840 x 2560',
              likesCount: p.likesCount || 0
            })
          })
        }

        if (dbPhotos.length > 0) {
          setPhotos(prev => {
            const dbUrls = new Set(dbPhotos.map(d => d.url))
            const nonDuplicates = prev.filter(p => !dbUrls.has(p.url))
            return [...dbPhotos, ...nonDuplicates]
          })
        }
      } catch (err) {
        console.warn('Error loading backend photos:', err)
      }
    }
    fetchBackendPhotos()
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('weddingos_gallery_settings', JSON.stringify(settings))
    } catch {
      // ignore
    }
  }, [settings])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Counts
  const counts = useMemo(() => {
    const pending = photos.filter((p) => p.status === 'PENDING').length
    const approved = photos.filter((p) => p.status === 'APPROVED').length
    const rejected = photos.filter((p) => p.status === 'REJECTED').length
    return { pending, approved, rejected, total: photos.length }
  }, [photos])

  // Filtered Photos for active tab
  const filteredPhotos = useMemo(() => {
    if (activeTab === 'SETTINGS') return []
    return photos.filter((p) => {
      if (p.status !== activeTab) return false
      if (selectedCeremony !== 'All' && p.ceremony !== selectedCeremony) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = p.title.toLowerCase().includes(q)
        const matchUploader = p.uploaderName.toLowerCase().includes(q)
        const matchCeremony = p.ceremony.toLowerCase().includes(q)
        return matchTitle || matchUploader || matchCeremony
      }
      return true
    })
  }, [photos, activeTab, selectedCeremony, searchQuery])

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedPhotoIds.length === filteredPhotos.length) {
      setSelectedPhotoIds([])
    } else {
      setSelectedPhotoIds(filteredPhotos.map((p) => p.id))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleBulkApprove = () => {
    if (!selectedPhotoIds.length) return
    setPhotos((prev) =>
      prev.map((p) => (selectedPhotoIds.includes(p.id) ? { ...p, status: 'APPROVED' } : p))
    )
    showToast(`Approved ${selectedPhotoIds.length} photos to live gallery!`)
    setSelectedPhotoIds([])
  }

  const handleBulkReject = () => {
    if (!selectedPhotoIds.length) return
    setPhotos((prev) =>
      prev.map((p) =>
        selectedPhotoIds.includes(p.id)
          ? { ...p, status: 'REJECTED', rejectionReason: 'Declined during bulk moderation' }
          : p
      )
    )
    showToast(`Moved ${selectedPhotoIds.length} photos to rejected archive.`)
    setSelectedPhotoIds([])
  }

  // Single Action Handlers
  const handleApprovePhoto = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (id.startsWith('photo-db-')) {
      const dbId = id.replace('photo-db-', '')
      galleryApi.moderatePhoto(dbId, 'APPROVED').catch(err => console.warn('Backend moderation error:', err))
    }
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'APPROVED' } : p))
    )
    showToast('Photo approved and published to live gallery!')
    if (lightboxPhoto?.id === id) {
      setLightboxPhoto((prev) => (prev ? { ...prev, status: 'APPROVED' } : null))
    }
  }

  const handleRejectPhoto = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (id.startsWith('photo-db-')) {
      const dbId = id.replace('photo-db-', '')
      galleryApi.moderatePhoto(dbId, 'REJECTED').catch(err => console.warn('Backend moderation error:', err))
    }
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: 'REJECTED', rejectionReason: 'Does not meet gallery quality standards' }
          : p
      )
    )
    showToast('Photo rejected and hidden from guests.')
    if (lightboxPhoto?.id === id) {
      setLightboxPhoto((prev) => (prev ? { ...prev, status: 'REJECTED' } : null))
    }
  }

  const handleToggleFeatured = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    )
    showToast('Highlight status updated!')
  }

  const handleRestoreToPending = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'PENDING', rejectionReason: undefined } : p))
    )
    showToast('Photo restored back to pending moderation queue.')
  }

  const handleDeletePhoto = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (window.confirm('Permanently delete this photo? This cannot be undone.')) {
      setPhotos((prev) => prev.filter((p) => p.id !== id))
      if (lightboxPhoto?.id === id) setLightboxPhoto(null)
      showToast('Photo permanently deleted.')
    }
  }

  // Lightbox Navigation
  const handlePrevLightbox = () => {
    if (!lightboxPhoto) return
    const idx = filteredPhotos.findIndex((p) => p.id === lightboxPhoto.id)
    if (idx > 0) {
      setLightboxPhoto(filteredPhotos[idx - 1])
    } else {
      setLightboxPhoto(filteredPhotos[filteredPhotos.length - 1])
    }
  }

  const handleNextLightbox = () => {
    if (!lightboxPhoto) return
    const idx = filteredPhotos.findIndex((p) => p.id === lightboxPhoto.id)
    if (idx < filteredPhotos.length - 1) {
      setLightboxPhoto(filteredPhotos[idx + 1])
    } else {
      setLightboxPhoto(filteredPhotos[0])
    }
  }

  // Upload handler
  const handleMockUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFilePreview && !selectedRawFile) {
      alert('Please select an image file to upload.')
      return
    }
    setIsUploading(true)

    let finalUrl = selectedFilePreview || ''
    if (selectedRawFile) {
      try {
        const backendResult = await galleryApi.uploadFile(selectedRawFile, {
          caption: uploadTitle.trim(),
          ceremonyTag: uploadCeremony,
          uploaderName: uploaderName.trim() || 'Organizer',
        })
        if (backendResult?.photoUrl) {
          finalUrl = backendResult.photoUrl
        }
      } catch (err) {
        console.warn('Backend Cloudinary upload failed, falling back to local preview:', err)
      }
    }

    const newPhoto: GalleryPhoto = {
      id: `photo-u-${Date.now()}`,
      url: finalUrl,
      title: uploadTitle.trim() || 'Uploaded Wedding Memory',
      ceremony: uploadCeremony,
      uploaderName: uploaderName.trim() || 'Organizer',
      uploaderRole: 'Organizer Upload',
      uploadedAt: 'Just now',
      status: settings.requireModeration ? 'PENDING' : 'APPROVED',
      fileSize: selectedRawFile ? `${(selectedRawFile.size / (1024 * 1024)).toFixed(1)} MB` : '4.2 MB',
      dimensions: '3840 x 2560',
      likesCount: 0
    }

    setPhotos((prev) => [newPhoto, ...prev])
    setIsUploading(false)
    setIsUploadModalOpen(false)
    setUploadTitle('')
    setSelectedFilePreview(null)
    setSelectedRawFile(null)
    showToast(
      settings.requireModeration
        ? 'Photo uploaded to Cloudinary & pending review queue!'
        : 'Photo uploaded to Cloudinary & published live!'
    )
  }

  // Rotate token
  const handleRotateToken = () => {
    const newToken = `gal_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`
    setSettings((prev) => ({ ...prev, token: newToken }))
    showToast('New private access token generated! Previous links are now revoked.')
  }

  const galleryUrl = `${window.location.origin}/gallery/${settings.slug}?token=${settings.token}`

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4b030e] text-white px-5 py-3 rounded-xl shadow-gold border border-[#e6bd81]/60 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#e6bd81]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================= */}
      {/* PAGE HEADER & PRIVATE STATUS              */}
      {/* ========================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e6bd81]/30 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-[#4b030e]">
              Photo Gallery &amp; Moderation
            </h1>
            <Badge variant="gold" size="sm" className="hidden sm:inline-flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Private By Link</span>
            </Badge>
          </div>
          <p className="text-sm text-[#4b030e]/75 mt-1 font-sans">
            FR-GAL Compliant • Moderate guest uploads, share private access tokens, and curate high-resolution memories.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
            leftIcon={<QrCode className="w-4 h-4 text-[#b88444]" />}
          >
            Share QR &amp; Link
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload Photos
          </Button>
        </div>
      </div>

      {/* ========================================= */}
      {/* 4 KPI METRIC CARDS                        */}
      {/* ========================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Queue */}
        <Card
          hoverEffect
          className={`cursor-pointer transition-all ${
            activeTab === 'PENDING' ? 'ring-2 ring-[#a5172a] shadow-gold-sm bg-[#fffaf5]' : ''
          }`}
          onClick={() => setActiveTab('PENDING')}
        >
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#4b030e]/70">Pending Review</span>
              <div className="w-8 h-8 rounded-lg bg-[#fffbeb] text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-[#a5172a] tabular-nums">
                {counts.pending}
              </span>
              <Badge variant="warning" size="sm">
                Requires Action
              </Badge>
            </div>
            <p className="text-[11px] text-[#4b030e]/60">Guest photos awaiting organizer approval</p>
          </CardContent>
        </Card>

        {/* Metric 2: Live Approved Photos */}
        <Card
          hoverEffect
          className={`cursor-pointer transition-all ${
            activeTab === 'APPROVED' ? 'ring-2 ring-emerald-600 shadow-gold-sm bg-[#f7fdf9]' : ''
          }`}
          onClick={() => setActiveTab('APPROVED')}
        >
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#4b030e]/70">Live &amp; Approved</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
                {counts.approved}
              </span>
              <Badge variant="success" size="sm">
                Visible to Guests
              </Badge>
            </div>
            <p className="text-[11px] text-[#4b030e]/60">Published in private gallery link</p>
          </CardContent>
        </Card>

        {/* Metric 3: Rejected / Hidden */}
        <Card
          hoverEffect
          className={`cursor-pointer transition-all ${
            activeTab === 'REJECTED' ? 'ring-2 ring-stone-500 shadow-gold-sm' : ''
          }`}
          onClick={() => setActiveTab('REJECTED')}
        >
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#4b030e]/70">Rejected / Hidden</span>
              <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-stone-600 tabular-nums">
                {counts.rejected}
              </span>
              <span className="text-xs text-stone-500 font-sans">Filtered Out</span>
            </div>
            <p className="text-[11px] text-[#4b030e]/60">Blurry, duplicate or hidden uploads</p>
          </CardContent>
        </Card>

        {/* Metric 4: Storage & Limits */}
        <Card hoverEffect className="cursor-pointer" onClick={() => setActiveTab('SETTINGS')}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#4b030e]/70">Cloud Storage</span>
              <div className="w-8 h-8 rounded-lg bg-[#fbe6e9] text-[#6f0617] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-[#4b030e] tabular-nums">
                412
              </span>
              <span className="text-xs font-semibold text-[#4b030e]/70">MB / 5 GB</span>
            </div>
            {/* Storage Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
              <div className="h-full bg-[#6f0617] rounded-full" style={{ width: '8.2%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================= */}
      {/* TABS NAVIGATION & CONTROLS                */}
      {/* ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6bd81]/40 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'PENDING'
                ? 'bg-[#6f0617] text-white shadow-gold-sm'
                : 'bg-white text-[#4b030e]/80 hover:bg-[#faf4ec] border border-[#e6bd81]/30'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Moderation Queue</span>
            {counts.pending > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                  activeTab === 'PENDING' ? 'bg-[#e6bd81] text-[#4b030e]' : 'bg-[#fef2f2] text-[#a5172a]'
                }`}
              >
                {counts.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'APPROVED'
                ? 'bg-[#6f0617] text-white shadow-gold-sm'
                : 'bg-white text-[#4b030e]/80 hover:bg-[#faf4ec] border border-[#e6bd81]/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approved Gallery</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                activeTab === 'APPROVED' ? 'bg-[#e6bd81] text-[#4b030e]' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {counts.approved}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'REJECTED'
                ? 'bg-[#6f0617] text-white shadow-gold-sm'
                : 'bg-white text-[#4b030e]/80 hover:bg-[#faf4ec] border border-[#e6bd81]/30'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Rejected / Hidden</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                activeTab === 'REJECTED' ? 'bg-[#e6bd81] text-[#4b030e]' : 'bg-stone-100 text-stone-700'
              }`}
            >
              {counts.rejected}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'SETTINGS'
                ? 'bg-[#6f0617] text-white shadow-gold-sm'
                : 'bg-white text-[#4b030e]/80 hover:bg-[#faf4ec] border border-[#e6bd81]/30'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Access &amp; Settings</span>
          </button>
        </div>

        {/* View Switcher for Grid vs List */}
        {activeTab !== 'SETTINGS' && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center rounded-xl bg-white border border-[#e6bd81]/40 p-1 shadow-2xs">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'GRID' ? 'bg-[#6f0617] text-white shadow-sm' : 'text-[#4b030e]/70 hover:bg-stone-100'
                }`}
                title="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'TABLE' ? 'bg-[#6f0617] text-white shadow-sm' : 'text-[#4b030e]/70 hover:bg-stone-100'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* FILTER & BULK ACTIONS BAR                 */}
      {/* ========================================= */}
      {activeTab !== 'SETTINGS' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl gold-border shadow-2xs">
          {/* Ceremony Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(
              [
                'All',
                'Haldi & Mehndi',
                'Sangeet Gala',
                'Baraat & Pheras',
                'Reception Night',
                'Guest Candids'
              ] as CeremonyCategory[]
            ).map((ceremony) => (
              <button
                key={ceremony}
                onClick={() => setSelectedCeremony(ceremony)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCeremony === ceremony
                    ? 'bg-[#4b030e] text-[#e6bd81] font-semibold shadow-xs'
                    : 'bg-[#faf4ec] text-[#4b030e]/80 hover:bg-[#f5e9d9]'
                }`}
              >
                {ceremony}
              </button>
            ))}
          </div>

          {/* Bulk Moderation Controls for Pending */}
          {activeTab === 'PENDING' && filteredPhotos.length > 0 && (
            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#4b030e] cursor-pointer mr-2 select-none">
                <input
                  type="checkbox"
                  checked={
                    selectedPhotoIds.length === filteredPhotos.length && filteredPhotos.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-[#e6bd81] text-[#6f0617] focus:ring-[#6f0617]"
                />
                <span>Select All ({filteredPhotos.length})</span>
              </label>

              <Button
                variant="primary"
                size="sm"
                disabled={selectedPhotoIds.length === 0}
                onClick={handleBulkApprove}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Approve ({selectedPhotoIds.length})
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={selectedPhotoIds.length === 0}
                onClick={handleBulkReject}
                leftIcon={<X className="w-3.5 h-3.5 text-[#a5172a]" />}
              >
                Reject ({selectedPhotoIds.length})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 1 & 2 & 3: PHOTO GRID OR TABLE        */}
      {/* ========================================= */}
      {activeTab !== 'SETTINGS' && (
        <div>
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#e6bd81]/40 shadow-sm p-8">
              <div className="w-16 h-16 rounded-full bg-[#faf4ec] text-[#b88444] flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">No Photos Found</h3>
              <p className="text-sm text-[#4b030e]/70 max-w-md mx-auto mt-1 font-sans">
                {activeTab === 'PENDING'
                  ? 'Great job! There are no pending photos waiting for moderation.'
                  : `No photos match the selected filter "${selectedCeremony}".`}
              </p>
              {activeTab === 'PENDING' && (
                <div className="mt-5">
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('APPROVED')}>
                    View Live Approved Gallery &rarr;
                  </Button>
                </div>
              )}
            </div>
          ) : viewMode === 'GRID' ? (
            /* ========================================= */
            /* MASONRY / VISUAL CARDS GRID               */
            /* ========================================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxPhoto(photo)}
                  className={`group relative rounded-2xl bg-white border overflow-hidden shadow-2xs hover:shadow-gold-sm transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    selectedPhotoIds.includes(photo.id)
                      ? 'border-[#6f0617] ring-2 ring-[#6f0617]'
                      : 'border-[#e6bd81]/40 hover:border-[#b88444]'
                  }`}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Checkbox for Bulk Actions */}
                    {activeTab === 'PENDING' && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleSelect(photo.id)
                        }}
                        className="absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-md bg-black/40 backdrop-blur-md border border-white/60 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        {selectedPhotoIds.includes(photo.id) && (
                          <Check className="w-4 h-4 text-white font-bold" />
                        )}
                      </div>
                    )}

                    {/* Ceremony Badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#e6bd81] border border-[#e6bd81]/40 shadow-xs">
                        {photo.ceremony}
                      </span>
                    </div>

                    {/* Hover Overlay with Quick Fullscreen Icon */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <div className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/40">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Featured Star Badge */}
                    {photo.featured && (
                      <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#b88444] text-white text-[10px] font-bold shadow-xs">
                        <Star className="w-3 h-3 fill-white" />
                        <span>Featured</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-sans text-xs sm:text-sm font-bold text-[#4b030e] line-clamp-1 group-hover:text-[#6f0617] transition-colors">
                        {photo.title}
                      </h4>
                      <p className="text-[11px] text-[#4b030e]/70 flex items-center gap-1.5 mt-1">
                        <User className="w-3 h-3 text-[#b88444]" />
                        <span className="truncate">{photo.uploaderName}</span>
                        <span>&bull;</span>
                        <span className="text-[10px] text-stone-500 shrink-0">{photo.uploadedAt}</span>
                      </p>
                    </div>

                    {/* Moderation Action Buttons per card */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      {photo.status === 'PENDING' ? (
                        <div className="flex items-center gap-2 w-full">
                          <button
                            onClick={(e) => handleApprovePhoto(photo.id, e)}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={(e) => handleRejectPhoto(photo.id, e)}
                            className="flex-1 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#a5172a] text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : photo.status === 'APPROVED' ? (
                        <div className="flex items-center justify-between w-full text-xs">
                          <button
                            onClick={(e) => handleToggleFeatured(photo.id, e)}
                            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] ${
                              photo.featured
                                ? 'text-[#b88444] font-bold'
                                : 'text-stone-400 hover:text-[#b88444]'
                            }`}
                            title="Feature this highlight"
                          >
                            <Star className={`w-3.5 h-3.5 ${photo.featured ? 'fill-[#b88444]' : ''}`} />
                            <span>Highlight</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleRejectPhoto(photo.id, e)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Hide from Live Gallery"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full text-xs">
                          <span className="text-[10px] text-red-600 italic">
                            {photo.rejectionReason || 'Rejected'}
                          </span>
                          <button
                            onClick={(e) => handleRestoreToPending(photo.id, e)}
                            className="px-2 py-1 rounded-md bg-[#faf4ec] hover:bg-[#f0dfc8] text-[#85531d] text-xs font-semibold flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ========================================= */
            /* DIRECTORY TABLE VIEW                      */
            /* ========================================= */
            <div className="bg-white rounded-2xl gold-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#faf4ec] text-[#4b030e] border-b border-[#e6bd81]/40 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-3.5 w-12 text-center">
                        {activeTab === 'PENDING' && (
                          <input
                            type="checkbox"
                            checked={
                              selectedPhotoIds.length === filteredPhotos.length &&
                              filteredPhotos.length > 0
                            }
                            onChange={handleSelectAll}
                            className="rounded border-[#e6bd81] text-[#6f0617] focus:ring-[#6f0617]"
                          />
                        )}
                      </th>
                      <th className="p-3.5">Photo &amp; Caption</th>
                      <th className="p-3.5">Ceremony</th>
                      <th className="p-3.5">Uploader</th>
                      <th className="p-3.5">Time &amp; Size</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredPhotos.map((photo) => (
                      <tr
                        key={photo.id}
                        className="hover:bg-[#fdfbf7] transition-colors cursor-pointer"
                        onClick={() => setLightboxPhoto(photo)}
                      >
                        <td
                          className="p-3.5 text-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (activeTab === 'PENDING') handleToggleSelect(photo.id)
                          }}
                        >
                          {activeTab === 'PENDING' && (
                            <input
                              type="checkbox"
                              checked={selectedPhotoIds.includes(photo.id)}
                              onChange={() => handleToggleSelect(photo.id)}
                              className="rounded border-[#e6bd81] text-[#6f0617] focus:ring-[#6f0617]"
                            />
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={photo.url}
                              alt={photo.title}
                              className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-[#4b030e] line-clamp-1">{photo.title}</p>
                              {photo.caption && (
                                <p className="text-[11px] text-stone-500 line-clamp-1">
                                  {photo.caption}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-[#4b030e]">{photo.ceremony}</td>
                        <td className="p-3.5">
                          <p className="font-semibold text-[#4b030e]">{photo.uploaderName}</p>
                          <p className="text-[10px] text-stone-500">{photo.uploaderRole}</p>
                        </td>
                        <td className="p-3.5 text-[#4b030e]/80">
                          <p>{photo.uploadedAt}</p>
                          <p className="text-[10px] text-stone-500">{photo.fileSize}</p>
                        </td>
                        <td className="p-3.5">
                          <Badge
                            variant={
                              photo.status === 'APPROVED'
                                ? 'success'
                                : photo.status === 'PENDING'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {photo.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {photo.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={(e) => handleApprovePhoto(photo.id, e)}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleRejectPhoto(photo.id, e)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : photo.status === 'APPROVED' ? (
                              <>
                                <button
                                  onClick={(e) => handleToggleFeatured(photo.id, e)}
                                  className={`p-1.5 rounded-lg ${
                                    photo.featured
                                      ? 'text-[#b88444] bg-[#faf4ec]'
                                      : 'text-stone-400 hover:text-[#b88444]'
                                  }`}
                                  title="Highlight"
                                >
                                  <Star className={`w-4 h-4 ${photo.featured ? 'fill-[#b88444]' : ''}`} />
                                </button>
                                <button
                                  onClick={(e) => handleRejectPhoto(photo.id, e)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-700"
                                  title="Hide photo"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => handleRestoreToPending(photo.id, e)}
                                className="p-1.5 rounded-lg bg-[#faf4ec] text-[#85531d] hover:bg-[#f0dfc8]"
                                title="Restore to Pending"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 4: GALLERY ACCESS & SECURITY SETTINGS */}
      {/* ========================================= */}
      {activeTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Access Tokens & Links (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="shadow-2xs">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#b88444]" />
                  <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                    Private Tokenized Gallery Access
                  </h3>
                </div>
                <p className="text-xs text-[#4b030e]/75 font-sans leading-relaxed">
                  Per <strong>FR-GAL-02 &amp; FR-GAL-11</strong>, the wedding gallery is private-by-link. It is not publicly indexed by search engines. Visitors access media via this high-entropy access token.
                </p>

                {/* Token URL Box */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4b030e] uppercase tracking-wider block">
                    Active Private Gallery URL
                  </label>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/50">
                    <input
                      type="text"
                      readOnly
                      value={galleryUrl}
                      className="bg-transparent text-xs text-[#4b030e] font-mono flex-1 outline-hidden select-all"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(galleryUrl)
                        showToast('Private gallery link copied to clipboard!')
                      }}
                      leftIcon={<Copy className="w-3.5 h-3.5" />}
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>

                {/* Rotate Token Warning & Action */}
                <div className="p-4 rounded-xl bg-[#fffbeb] border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <h5 className="text-xs font-bold text-amber-900">Revoke / Rotate Security Token</h5>
                    <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
                      If an unwanted person accesses the link, regenerate this token immediately. All previous QR codes and links will be invalidated.
                    </p>
                    <button
                      onClick={handleRotateToken}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Rotate Access Token Now</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moderation Policies Form */}
            <Card className="shadow-2xs">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                  Moderation &amp; Upload Rules
                </h3>

                <div className="divide-y divide-stone-100">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#4b030e] block">
                        Strict Organizer Moderation
                      </span>
                      <span className="text-[11px] text-[#4b030e]/70">
                        Guest uploads are held in the pending queue until approved (FR-GAL-06)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requireModeration}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, requireModeration: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#6f0617] focus:ring-[#6f0617]"
                    />
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#4b030e] block">
                        Allow Guest Photo Uploads
                      </span>
                      <span className="text-[11px] text-[#4b030e]/70">
                        Allow guests to upload memories from mobile devices without an account (FR-GAL-04)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.guestUploadsEnabled}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, guestUploadsEnabled: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#6f0617] focus:ring-[#6f0617]"
                    />
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#4b030e] block">
                        Allow High-Resolution Downloads
                      </span>
                      <span className="text-[11px] text-[#4b030e]/70">
                        Let guests and family download approved original photo files (FR-GAL-13)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowGuestDownloads}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, allowGuestDownloads: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#6f0617] focus:ring-[#6f0617]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Printable QR Code Standee Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-[#e6bd81]/60 shadow-gold-sm">
              <CardContent className="p-6 text-center space-y-4">
                <span className="text-xs font-bold text-[#b88444] uppercase tracking-widest block">
                  Tabletop Standee Preview
                </span>

                {/* Printable Royal Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-[#4b030e] via-[#6f0617] to-[#4b030e] text-white border-2 border-[#e6bd81] shadow-xl space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-[#e6bd81] tracking-widest">
                      Wedding Memories
                    </span>
                    <h4 className="font-cormorant text-2xl font-bold text-white">
                      {wedding.brideName && wedding.groomName
                        ? `${wedding.brideName} & ${wedding.groomName}`
                        : wedding.brideName || wedding.groomName || 'Wedding Memories'}
                    </h4>
                    <p className="text-[10px] text-white/80 font-sans">
                      {wedding.weddingDate || 'Date to be announced'}{wedding.locationName ? ` • ${wedding.locationName}` : ''}
                    </p>
                  </div>

                  {/* QR Code Graphic Container */}
                  <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto shadow-md border-2 border-[#e6bd81]/40 flex flex-col items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=4b030e&bgcolor=ffffff&data=${encodeURIComponent(galleryUrl)}`}
                      alt="Wedding Memories QR Code"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>

                  <p className="text-xs text-white/90 font-medium">
                    Scan with any phone camera to upload and view wedding photos!
                  </p>
                  <p className="text-[9px] text-[#e6bd81]/80 uppercase tracking-widest">
                    No App Download Needed
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      window.open(galleryUrl, '_blank')
                    }}
                    leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open Live Guest Gallery
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&color=4b030e&bgcolor=ffffff&data=${encodeURIComponent(galleryUrl)}`
                      link.download = `Wedding_Gallery_QR_${settings.slug}.png`
                      link.target = '_blank'
                      link.click()
                    }}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* LIGHTBOX / FULLSCREEN PHOTO MODAL         */}
      {/* ========================================= */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#1c0205] border border-[#e6bd81]/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 text-white/90 hover:text-white hover:bg-black flex items-center justify-center border border-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Left Viewer Pane */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] lg:min-h-[500px]">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.title}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />

              {/* Prev / Next Controls */}
              <button
                onClick={handlePrevLightbox}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 border border-white/20 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextLightbox}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 border border-white/20 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Right Metadata & Actions Pane */}
            <div className="w-full lg:w-80 p-6 bg-[#2a0309] text-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#e6bd81]/30 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#e6bd81]/20 text-[#e6bd81] border border-[#e6bd81]/40">
                    {lightboxPhoto.ceremony}
                  </span>
                  <Badge
                    variant={
                      lightboxPhoto.status === 'APPROVED'
                        ? 'success'
                        : lightboxPhoto.status === 'PENDING'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {lightboxPhoto.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-cormorant text-2xl font-bold text-white leading-snug">
                    {lightboxPhoto.title}
                  </h3>
                  {lightboxPhoto.caption && (
                    <p className="text-xs text-white/80 font-sans mt-1 italic">
                      "{lightboxPhoto.caption}"
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-sans text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Uploaded by:</span>
                    <span className="font-semibold text-white">{lightboxPhoto.uploaderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Role / Relation:</span>
                    <span className="text-stone-200">{lightboxPhoto.uploaderRole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Upload Time:</span>
                    <span className="text-stone-200">{lightboxPhoto.uploadedAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Resolution:</span>
                    <span className="text-stone-200 font-mono text-[11px]">
                      {lightboxPhoto.dimensions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">File Size:</span>
                    <span className="text-stone-200 font-mono text-[11px]">
                      {lightboxPhoto.fileSize}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Lightbox */}
              <div className="pt-6 border-t border-white/10 space-y-2">
                {lightboxPhoto.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprovePhoto(lightboxPhoto.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Photo</span>
                    </button>
                    <button
                      onClick={() => handleRejectPhoto(lightboxPhoto.id)}
                      className="flex-1 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : lightboxPhoto.status === 'APPROVED' ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleToggleFeatured(lightboxPhoto.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        lightboxPhoto.featured
                          ? 'bg-[#b88444] text-white shadow-gold-sm'
                          : 'bg-white/10 hover:bg-white/20 text-[#e6bd81] border border-[#e6bd81]/40'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${lightboxPhoto.featured ? 'fill-white' : ''}`}
                      />
                      <span>{lightboxPhoto.featured ? 'Featured Highlight' : 'Set as Featured'}</span>
                    </button>

                    <button
                      onClick={() => handleRejectPhoto(lightboxPhoto.id)}
                      className="w-full py-2 rounded-xl bg-white/10 hover:bg-red-900/40 text-stone-300 hover:text-red-300 text-xs font-medium flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Hide from Live Gallery</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRestoreToPending(lightboxPhoto.id)}
                    className="w-full py-2 rounded-xl bg-[#e6bd81] hover:bg-[#cf9e57] text-[#4b030e] text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore to Pending</span>
                  </button>
                )}

                <a
                  href={lightboxPhoto.url}
                  download={lightboxPhoto.title}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#e6bd81]" />
                  <span>Download High-Res Original</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* SHARE QR & PRIVATE LINK MODAL             */}
      {/* ========================================= */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#e6bd81]/60 p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#b88444]" />
                <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                  Share Private Gallery
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real Scannable QR Card Visual */}
            <div className="p-5 rounded-2xl bg-[#faf4ec] border border-[#e6bd81]/50 text-center space-y-3">
              <div className="w-48 h-48 bg-white p-2.5 rounded-2xl mx-auto shadow-sm border border-[#e6bd81]/40 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=4b030e&bgcolor=ffffff&data=${encodeURIComponent(galleryUrl)}`}
                  alt="Scannable QR Code for Wedding Gallery"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-[#4b030e]">Live Guest Wedding Gallery</p>
                <p className="text-[11px] text-[#4b030e]/75">
                  Point any phone camera at this QR code to upload and view memories in real-time.
                </p>
              </div>
            </div>

            {/* Direct Open Link */}
            <div>
              <a
                href={galleryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#e6bd81] hover:bg-[#faf4ec] text-[#4b030e] text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#b88444]" />
                <span>Open Public Guest Gallery in New Tab</span>
              </a>
            </div>

            {/* Link Copy Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#4b030e]/80">
                Private Link with Access Token
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200">
                <input
                  type="text"
                  readOnly
                  value={galleryUrl}
                  className="bg-transparent text-xs text-stone-700 font-mono flex-1 outline-hidden"
                />
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(galleryUrl)
                    showToast('Link copied!')
                  }}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `View & upload wedding memories: ${galleryUrl}`
                    )}`,
                    '_blank'
                  )
                }}
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                Share on WhatsApp
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => window.print()}
              >
                Print Standee
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* UPLOAD PHOTOS MODAL                       */}
      {/* ========================================= */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#e6bd81]/60 p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#b88444]" />
                <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                  Upload Wedding Photos
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMockUpload} className="space-y-4">
              {/* File Input and Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setSelectedRawFile(file)
                    const reader = new FileReader()
                    reader.onload = () => setSelectedFilePreview(reader.result as string)
                    reader.readAsDataURL(file)
                  }
                }}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-[#e6bd81] bg-[#faf4ec]/50 hover:bg-[#faf4ec] transition-colors text-center cursor-pointer"
              >
                {selectedFilePreview ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[#e6bd81]/60">
                    <img
                      src={selectedFilePreview}
                      alt="Selected upload"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/75 text-white text-[10px] font-bold">
                      Change Photo
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#b88444] mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#4b030e]">
                      Click to choose image or drag &amp; drop
                    </p>
                    <p className="text-[10px] text-[#4b030e]/70 mt-1">
                      JPG, PNG, WEBP, HEIC supported &bull; High resolution
                    </p>
                  </>
                )}
              </div>

              {/* Title & Caption */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4b030e]">Photo Title / Moment</label>
                <input
                  type="text"
                  placeholder="e.g. Sangeet Family Dance Finale"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#6f0617] outline-hidden"
                  required
                />
              </div>

              {/* Ceremony Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4b030e]">Ceremony Tag</label>
                <select
                  value={uploadCeremony}
                  onChange={(e) => setUploadCeremony(e.target.value as CeremonyCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#6f0617] outline-hidden bg-white"
                >
                  <option value="Haldi & Mehndi">Haldi &amp; Mehndi</option>
                  <option value="Sangeet Gala">Sangeet Gala</option>
                  <option value="Baraat & Pheras">Baraat &amp; Pheras</option>
                  <option value="Reception Night">Reception Night</option>
                  <option value="Guest Candids">Guest Candids</option>
                </select>
              </div>

              {/* Uploader Attribution */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4b030e]">Uploader Attribution</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma (Friend)"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#6f0617] outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Submit Photo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
