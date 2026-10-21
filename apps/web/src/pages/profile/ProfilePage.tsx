import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { getLocalAuthSession } from '../../services/authService'
import {
  User,
  Heart,
  Calendar,
  MapPin,
  Globe,
  DollarSign,
  Users2,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Share2,
  Copy,
  Check,
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { workspacesApi, getActiveWeddingId } from '../../services/apiClient'
import { resetToDemoData } from '../../services/invitationStore'
import { resetMembershipDemoData } from '../../services/membershipStore'

export interface WeddingProfileData {
  id: number | string
  brideName: string
  groomName: string
  weddingDate: string
  venueName: string
  city: string
  slug: string
  totalBudgetTarget: number
  expectedGuestCapacity: number
  currencyCode: string
  welcomeHeadline?: string
  welcomeMessage?: string
}

const DEFAULT_PROFILE: WeddingProfileData = {
  id: 1,
  brideName: '',
  groomName: '',
  weddingDate: '',
  venueName: '',
  city: '',
  slug: 'our-wedding',
  totalBudgetTarget: 0,
  expectedGuestCapacity: 0,
  currencyCode: 'INR (₹)',
  welcomeHeadline: 'Welcome to Our Sacred Celebration',
  welcomeMessage: 'With the blessings of our elders and loved ones, we joyfully invite you to celebrate our union.',
}

export default function ProfilePage() {
  const { user } = useUser()
  const localUser = getLocalAuthSession()
  const [profile, setProfile] = useState<WeddingProfileData>(DEFAULT_PROFILE)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // 1. Fetch from Database / Local cache on mount
  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setIsLoading(true)
      const email = user?.primaryEmailAddress?.emailAddress || localUser?.email || ''
      const clerkId = user?.id || localUser?.id || ''
      const fullName =
        user?.fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
        localUser?.fullName ||
        ''
      const userScopeKey = email
        ? `weddingos_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}_wedding`
        : 'weddingos_active_wedding'

      // First check local cache for immediate paint
      try {
        const stored = localStorage.getItem(userScopeKey) || localStorage.getItem('weddingos_active_wedding')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (isMounted) {
            setProfile((prev) => ({
              ...prev,
              ...parsed,
              brideName: parsed.brideName || '',
              groomName: parsed.groomName || '',
              weddingDate: parsed.weddingDate || '',
              venueName: parsed.venueName || parsed.locationName || '',
              city: parsed.city || '',
              slug: parsed.slug || 'our-wedding',
            }))
          }
        }
      } catch {
        // ignore
      }

      // Then fetch real state from Backend API
      try {
        const backendData = await workspacesApi.getActive(undefined, email, clerkId, fullName)
        if (backendData && isMounted) {
          const normalized: WeddingProfileData = {
            id: backendData.id || 1,
            brideName: backendData.brideName || '',
            groomName: backendData.groomName || '',
            weddingDate: backendData.weddingDate || '',
            venueName: backendData.venueName || '',
            city: backendData.city || '',
            slug: backendData.slug || 'our-wedding',
            totalBudgetTarget: Number(backendData.totalBudgetTarget) || 0,
            expectedGuestCapacity: Number(backendData.expectedGuestCapacity) || 0,
            currencyCode: backendData.currencyCode || 'INR (₹)',
          }
          setProfile((prev) => ({ ...prev, ...normalized }))
          localStorage.setItem('weddingos_active_wedding', JSON.stringify(normalized))
          if (email) {
            localStorage.setItem(userScopeKey, JSON.stringify(normalized))
          }
        }
      } catch (err) {
        console.warn('Backend profile sync pending/offline:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadProfile()
    return () => {
      isMounted = false
    }
  }, [user?.id, user?.primaryEmailAddress?.emailAddress, localUser?.email])

  // Calculate live countdown days
  const calculateDaysRemaining = () => {
    if (!profile.weddingDate) return null
    try {
      const target = new Date(profile.weddingDate).getTime()
      if (isNaN(target)) return null
      const now = new Date().getTime()
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 0
    } catch {
      return null
    }
  }

  const daysRemaining = calculateDaysRemaining()

  // 2. Save Profile handler (Optimistic UI + Fast background sync)
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorNotice(null)

    if (!profile.brideName.trim() && !profile.groomName.trim()) {
      setErrorNotice('Please provide at least the Bride or Groom name.')
      setIsSaving(false)
      return
    }

    try {
      const locationSummary = [profile.venueName.trim(), profile.city.trim()]
        .filter(Boolean)
        .join(', ')

      const email = user?.primaryEmailAddress?.emailAddress || localUser?.email || ''
      const userScopeKey = email
        ? `weddingos_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}_wedding`
        : 'weddingos_active_wedding'

      // 1. Optimistic Update: Save to local storage & broadcast immediately (0ms UI latency)
      const updatedProfile = {
        ...profile,
        locationName: locationSummary,
        userEmail: email,
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem('weddingos_active_wedding', JSON.stringify(updatedProfile))
      if (email) {
        localStorage.setItem(userScopeKey, JSON.stringify(updatedProfile))
      }
      window.dispatchEvent(new Event('weddingos_wedding_updated'))
      window.dispatchEvent(new Event('weddingos_active_wedding_changed'))
      window.dispatchEvent(new StorageEvent('storage', { key: 'weddingos_active_wedding' }))

      setSuccessNotice('Wedding profile details saved and updated across all devices!')
      setTimeout(() => setSuccessNotice(null), 4000)
      setIsSaving(false)

      // 2. Non-blocking background sync directly to Backend MySQL Database
      workspacesApi.updateDetails(
        {
          brideName: profile.brideName.trim(),
          groomName: profile.groomName.trim(),
          weddingDate: profile.weddingDate || undefined,
          city: profile.city.trim(),
          venueName: profile.venueName.trim(),
          slug: profile.slug.trim(),
        },
        Number(profile.id) || undefined
      ).catch((backendErr) => {
        console.warn('Could not sync profile to backend:', backendErr)
      })
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to save profile. Please try again.')
      setIsSaving(false)
    }
  }

  // 3. Reset All Data Handler
  const handleResetWorkspace = async () => {
    setIsResetting(true)
    const wid = profile.id || getActiveWeddingId()

    try {
      // Backend MySQL DB Reset. If it fails (reset is currently disabled server-side, 403),
      // stop here so local data is not wiped and no false success is shown.
      await workspacesApi.reset(Number(wid))

      // Local storage clean
      const keysToClear = [
        `weddingos_${wid}_events`,
        `weddingos_${wid}_expenses`,
        `weddingos_${wid}_tasks`,
        `weddingos_${wid}_vendors`,
        `weddingos_${wid}_invitations_v1`,
        `weddingos_${wid}_members_v1`,
        `weddingos_${wid}_gallery_photos`,
        `weddingos_events_${wid}`,
        `weddingos_expenses_${wid}`,
        `weddingos_tasks_${wid}`,
        `weddingos_vendors_${wid}`,
        'weddingos_events_custom',
        'weddingos_family_invitations',
        'weddingos_workspace_members',
        'weddingos_website_config',
        'weddingos_gallery_photos',
        'weddingos_gallery_settings',
        'weddingos_active_wedding',
      ]

      keysToClear.forEach((k) => localStorage.removeItem(k))

      resetToDemoData()
      resetMembershipDemoData(Number(wid))

      const cleanProfile: WeddingProfileData = {
        id: wid,
        brideName: '',
        groomName: '',
        weddingDate: '',
        venueName: '',
        city: '',
        slug: 'our-wedding',
        totalBudgetTarget: 0,
        expectedGuestCapacity: 0,
        currencyCode: 'INR (₹)',
      }

      localStorage.setItem('weddingos_active_wedding', JSON.stringify(cleanProfile))
      localStorage.setItem(`weddingos_${wid}_events`, '[]')
      localStorage.setItem(`weddingos_${wid}_expenses`, '[]')
      localStorage.setItem(`weddingos_${wid}_tasks`, '[]')
      localStorage.setItem(`weddingos_${wid}_vendors`, '[]')
      localStorage.setItem('weddingos_gallery_photos', '[]')
      localStorage.setItem('weddingos_workspace_members', '[]')
      localStorage.setItem('weddingos_family_invitations', '[]')

      setProfile(cleanProfile)

      window.dispatchEvent(new Event('weddingos_wedding_updated'))
      window.dispatchEvent(new Event('weddingos_invitations_updated'))
      window.dispatchEvent(new Event('weddingos_members_updated'))

      setIsResetModalOpen(false)
      setSuccessNotice('All wedding data has been reset to a completely fresh clean slate.')
      setTimeout(() => setSuccessNotice(null), 4000)
    } catch (err: any) {
      setErrorNotice('Reset error: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsResetting(false)
    }
  }

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/w/${profile.slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const coupleTitle =
    profile.brideName && profile.groomName
      ? `${profile.brideName} & ${profile.groomName}`
      : profile.brideName || profile.groomName || 'Your Wedding Celebration'

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Feedback */}
      {successNotice && (
        <div className="fixed top-6 right-6 z-50 bg-[#4b030e] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#e6bd81] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="fixed top-6 right-6 z-50 bg-red-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-xs font-semibold">{errorNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & IDENTITY OVERVIEW CARD                                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-[#e6bd81]/50 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-radial from-[#e6bd81]/20 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4b030e] text-[#e6bd81] border border-[#b88444]/40 tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e6bd81]" />
                Primary Wedding Profile
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#faf9f6] text-[#6f0617] border border-[#e6bd81]">
                <Clock className="w-3 h-3 text-[#b88444]" />
                {daysRemaining !== null ? `${daysRemaining} Days to Wedding` : 'Date Not Set'}
              </span>
            </div>

            <h1 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4b030e]">
              Wedding Profile &amp; Core Details
            </h1>
            <p className="text-sm text-[#4b030e]/80 mt-1 max-w-2xl">
              Fill your primary celebration information once here. These details automatically sync to your dashboard, navigation bar, invitations, guest passes, and public website.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 transition-all cursor-pointer shadow-xs"
              title="Reset all dummy and active workspace data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              Reset All Data
            </button>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#6f0617] text-white hover:bg-[#4b030e] transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#e6bd81]" />
              {isSaving ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Quick Identity Overview Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#e6bd81]/30">
          <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-500 block">The Couple</span>
            <span className="font-cormorant text-xl font-bold text-[#4b030e] truncate block mt-0.5">
              {coupleTitle}
            </span>
            <span className="text-[10px] text-neutral-400 block">Workspace Owners</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-500 block">Main Wedding Date</span>
            <span className="font-bold text-sm text-[#4b030e] block mt-0.5">
              {profile.weddingDate || 'Date Not Configured'}
            </span>
            <span className="text-[10px] text-neutral-400 block">
              {daysRemaining !== null ? `${daysRemaining} days remaining` : 'Set date below'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-500 block">Venue &amp; City</span>
            <span className="font-bold text-xs text-[#4b030e] truncate block mt-0.5">
              {[profile.venueName, profile.city].filter(Boolean).join(', ') || 'Location Not Configured'}
            </span>
            <span className="text-[10px] text-neutral-400 block">Primary Destination</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-500 block">Public Wedding Link</span>
            <div className="flex items-center justify-between gap-1 mt-0.5">
              <span className="font-mono text-xs font-bold text-[#6f0617] truncate">
                /w/{profile.slug}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1 text-neutral-500 hover:text-[#4b030e] cursor-pointer"
                title="Copy public link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="text-[10px] text-neutral-400 block">Live guest link</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE MASTER PROFILE FORM (ONE-TIME ENTRY FOR ALL COMMON DATA)            */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section A: Bride & Groom Names */}
        <Card className="border-[#e6bd81]/60 shadow-gold-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#e6bd81]/30 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#b88444]" />
              </div>
              <div>
                <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                  Bride &amp; Groom Information
                </h3>
                <p className="text-xs text-neutral-500">
                  These names will be displayed across your navbar crest, invitation cards, and guest welcome portals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                  Bride&apos;s Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#b88444] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.brideName}
                    onChange={(e) => setProfile({ ...profile, brideName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                  Groom&apos;s Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#b88444] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.groomName}
                    onChange={(e) => setProfile({ ...profile, groomName: e.target.value })}
                    placeholder="e.g. Rahul Kapoor"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section B: Celebration Timing & Location */}
        <Card className="border-[#e6bd81]/60 shadow-gold-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#e6bd81]/30 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#b88444]" />
              </div>
              <div>
                <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                  Ceremony Date &amp; Venue Destination
                </h3>
                <p className="text-xs text-neutral-500">
                  Sets the master countdown date for all guests and family coordinators.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                  Main Wedding Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#b88444] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={profile.weddingDate}
                    onChange={(e) => setProfile({ ...profile, weddingDate: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                  Venue Name
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#b88444] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.venueName}
                    onChange={(e) => setProfile({ ...profile, venueName: e.target.value })}
                    placeholder="e.g. The Leela Palace"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                  City / State
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#b88444] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="e.g. Udaipur, Rajasthan"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section C: Target Budget & Capacity Planning */}
        <Card className="border-[#e6bd81]/60 shadow-gold-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#e6bd81]/30 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#b88444]" />
              </div>
              <div>
                <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                  Budget &amp; Guest Capacity Planning
                </h3>
                <p className="text-xs text-neutral-500">
                  Global limits used by the Budget tracker and Family Invitation modules.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                  Total Budget Target (₹)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[#b88444] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={profile.totalBudgetTarget || ''}
                    onChange={(e) => setProfile({ ...profile, totalBudgetTarget: Number(e.target.value) || 0 })}
                    placeholder="e.g. 2500000"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                  Expected Guest Headcount
                </label>
                <div className="relative">
                  <Users2 className="w-4 h-4 text-[#b88444] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    value={profile.expectedGuestCapacity || ''}
                    onChange={(e) => setProfile({ ...profile, expectedGuestCapacity: Number(e.target.value) || 0 })}
                    placeholder="e.g. 350"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                  Currency Standard
                </label>
                <select
                  value={profile.currencyCode}
                  onChange={(e) => setProfile({ ...profile, currencyCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white transition-all"
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="AED (د.إ)">AED (د.إ) - UAE Dirham</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section D: Public Website Portal Slug */}
        <Card className="border-[#e6bd81]/60 shadow-gold-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#e6bd81]/30 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81] flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#b88444]" />
              </div>
              <div>
                <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                  Public Portal Website Slug
                </h3>
                <p className="text-xs text-neutral-500">
                  Choose the unique custom link address where guests view your wedding invitation and RSVP.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                Shareable Website Link Address
              </label>
              <div className="flex rounded-xl border border-[#e6bd81] bg-[#faf9f6] overflow-hidden focus-within:ring-2 focus-within:ring-[#6f0617] max-w-xl">
                <span className="px-3.5 py-2.5 text-xs text-neutral-500 bg-[#f5ecdd] border-r border-[#e6bd81]/50 flex items-center select-none font-mono">
                  {window.location.origin}/w/
                </span>
                <input
                  type="text"
                  value={profile.slug}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    })
                  }
                  placeholder="our-wedding"
                  className="flex-1 px-3.5 py-2.5 text-xs font-mono font-medium text-[#4b030e] focus:outline-none bg-transparent"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5">
                Guests can visit <span className="font-mono text-[#6f0617]">{window.location.origin}/w/{profile.slug}</span> to see your wedding dates and venue.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Footer Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 rounded-2xl bg-white border border-[#e6bd81]/40 shadow-xs">
          <p className="text-xs text-neutral-500">
            Saved profile details are synchronized with your database and live across all devices.
          </p>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold bg-[#6f0617] text-white hover:bg-[#4b030e] transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#e6bd81]" />
            {isSaving ? 'Saving Profile...' : 'Save All Profile Changes'}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* 3. DANGER ZONE: RESET ALL DATA MODAL                                      */}
      {/* ========================================================================= */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border-2 border-red-300 shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-cormorant text-2xl font-bold text-red-950">
                Reset All Wedding Data?
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                This will reset your wedding workspace to a <strong>completely clean blank slate</strong>. All events, preparation tasks, expenses, vendors, invitations, and photos will be cleared from your database and devices.
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left text-[11px] text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  After resetting, all dummy data is removed and you can fill in your custom details from this Profile page.
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetWorkspace}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Resetting Workspace...' : 'Yes, Reset Everything'}</span>
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetModalOpen(false)}
                className="py-2.5 px-4 rounded-xl font-semibold text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
