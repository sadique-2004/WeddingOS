import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Heart,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  Download,
  Share2,
  Check,
  Globe,
  ExternalLink,
  X,
  Loader2,
  Users,
} from 'lucide-react'
import QRCode from 'qrcode'
import { resolveInvitation, getInvitations, saveInvitations } from '../../services/invitationStore'
import type { FamilyInvitation } from '../../types/invitation'
import { publicApi } from '../../services/apiClient'

function formatInvitationDate(dateStr?: string): string {
  if (!dateStr) return 'Date To Be Announced'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function GuestInvitePage() {
  const { token } = useParams<{ token: string }>()
  const [invitation, setInvitation] = useState<FamilyInvitation | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false)
  const [rsvpSavedNotice, setRsvpSavedNotice] = useState(false)
  const [isEditingRsvp, setIsEditingRsvp] = useState(false)

  // Active Wedding Details
  const [wedding, setWedding] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    locationName: '',
    slug: '',
  })

  // Form State for RSVP
  const [rsvpStatus, setRsvpStatus] = useState<'ATTENDING' | 'NOT_ATTENDING' | 'PENDING'>('PENDING')
  const [attendeeCount, setAttendeeCount] = useState<number>(1)
  const [dietaryInput, setDietaryInput] = useState<string>('')

  useEffect(() => {
    if (!token) return

    // 1. First attempt to load via public API from backend
    publicApi.getInvitation(token).then((data) => {
      if (data) {
        setInvitation({
          id: data.invitationToken,
          displayName: data.displayName,
          primaryContactName: data.primaryContactName,
          phoneNumber: '',
          circle: (data.circle as any) || 'Friends & Colleagues',
          maxAttendees: data.maxAttendees || 2,
          actualAttendees: data.actualAttendees || 0,
          rsvpStatus: (data.rsvpStatus as any) || 'PENDING',
          ceremoniesAllowed: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
          dietaryNotes: data.dietaryNotes || '',
          checkedInAt: data.checkedIn ? new Date().toISOString() : null,
          invitationToken: data.invitationToken,
        })
        setRsvpStatus((data.rsvpStatus as any) || 'PENDING')
        setAttendeeCount(data.actualAttendees > 0 ? data.actualAttendees : (data.maxAttendees || 2))
        setDietaryInput(data.dietaryNotes || '')
        
        let resolvedSlug = data.slug || ''
        if (!resolvedSlug) {
          try {
            const siteStored = localStorage.getItem('weddingos_website_config')
            if (siteStored) resolvedSlug = JSON.parse(siteStored).slug || ''
            if (!resolvedSlug) {
              const activeStored = localStorage.getItem('weddingos_active_wedding')
              if (activeStored) resolvedSlug = JSON.parse(activeStored).slug || ''
            }
          } catch {}
        }

        setWedding({
          brideName: data.brideName || '',
          groomName: data.groomName || '',
          weddingDate: data.weddingDate || '',
          locationName: data.venueName || data.city || '',
          slug: resolvedSlug,
        })

        // Generate dynamic QR Code encoding the exact invitation token/URL
        const inviteUrl = `${window.location.origin}/invite/${data.invitationToken}`
        QRCode.toDataURL(inviteUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: '#4b030e',
            light: '#ffffff',
          },
        })
          .then((url: string) => setQrDataUrl(url))
          .catch((err: unknown) => console.error('Failed generating QR code:', err))
      }
    }).catch(() => {
      // 2. Fallback to local offline invitation store
      const found = resolveInvitation(token)
      if (found) {
        setInvitation(found)
        setRsvpStatus(found.rsvpStatus)
        setAttendeeCount(found.actualAttendees > 0 ? found.actualAttendees : found.maxAttendees)
        setDietaryInput(found.dietaryNotes || '')

        const inviteUrl = `${window.location.origin}/invite/${found.invitationToken}`
        QRCode.toDataURL(inviteUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: '#4b030e',
            light: '#ffffff',
          },
        })
          .then((url: string) => setQrDataUrl(url))
          .catch((err: unknown) => console.error('Failed generating QR code:', err))
      }

      try {
        let slug = ''
        const siteStored = localStorage.getItem('weddingos_website_config')
        if (siteStored) slug = JSON.parse(siteStored).slug || ''
        const stored = localStorage.getItem('weddingos_active_wedding')
        if (stored) {
          const parsed = JSON.parse(stored)
          setWedding({
            brideName: parsed.brideName || '',
            groomName: parsed.groomName || '',
            weddingDate: parsed.weddingDate || '',
            locationName: parsed.locationName || parsed.venueName || parsed.city || '',
            slug: slug || parsed.slug || '',
          })
        }
      } catch {
        // ignore
      }
    })
  }, [token])

  const handleQuickAccept = (count?: number, notes?: string) => {
    if (!invitation || !token) return
    const targetCount = count !== undefined ? count : (attendeeCount || invitation.maxAttendees || 1)
    const targetNotes = notes !== undefined ? notes : dietaryInput

    setIsSubmittingRsvp(true)
    setRsvpStatus('ATTENDING')
    setAttendeeCount(targetCount)

    publicApi.submitRsvp(token, {
      rsvpStatus: 'ATTENDING',
      actualAttendees: targetCount,
      dietaryNotes: targetNotes,
    }).catch((err) => {
      console.warn('Backend RSVP submit note:', err)
    }).finally(() => {
      const allInvites = getInvitations()
      const updated = allInvites.map((inv) => {
        if (inv.id === invitation.id || inv.invitationToken === invitation.invitationToken) {
          return {
            ...inv,
            rsvpStatus: 'ATTENDING' as const,
            actualAttendees: targetCount,
            dietaryNotes: targetNotes,
          }
        }
        return inv
      })
      saveInvitations(updated)

      setInvitation((prev) => prev ? {
        ...prev,
        rsvpStatus: 'ATTENDING',
        actualAttendees: targetCount,
        dietaryNotes: targetNotes,
      } : null)

      setIsSubmittingRsvp(false)
      setIsEditingRsvp(false)
      setRsvpSavedNotice(true)
      setTimeout(() => setRsvpSavedNotice(false), 4000)
    })
  }

  const handleQuickDecline = () => {
    if (!invitation || !token) return
    setIsSubmittingRsvp(true)
    setRsvpStatus('NOT_ATTENDING')

    publicApi.submitRsvp(token, {
      rsvpStatus: 'NOT_ATTENDING',
      actualAttendees: 0,
      dietaryNotes: dietaryInput,
    }).catch((err) => {
      console.warn('Backend RSVP submit note:', err)
    }).finally(() => {
      const allInvites = getInvitations()
      const updated = allInvites.map((inv) => {
        if (inv.id === invitation.id || inv.invitationToken === invitation.invitationToken) {
          return {
            ...inv,
            rsvpStatus: 'NOT_ATTENDING' as const,
            actualAttendees: 0,
          }
        }
        return inv
      })
      saveInvitations(updated)

      setInvitation((prev) => prev ? {
        ...prev,
        rsvpStatus: 'NOT_ATTENDING',
        actualAttendees: 0,
      } : null)

      setIsSubmittingRsvp(false)
      setIsEditingRsvp(false)
      setRsvpSavedNotice(true)
      setTimeout(() => setRsvpSavedNotice(false), 4000)
    })
  }

  const handleCopyPassLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQr = () => {
    if (!qrDataUrl || !invitation) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `${invitation.displayName.replace(/\s+/g, '_')}_Wedding_Pass_QR.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#e6bd81] text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f6ebd9] text-[#6f0617] flex items-center justify-center mx-auto border border-[#e6bd81]">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-cormorant text-3xl font-bold text-[#4b030e]">Invitation Not Found</h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            The invitation link or pass code does not match any current guest record. Please check the link or contact the wedding hosts.
          </p>
          <Link
            to={wedding.slug ? `/w/${wedding.slug}` : '/w/preview'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6f0617] text-white text-xs font-semibold hover:bg-[#4b030e] transition-all"
          >
            Visit Wedding Website
          </Link>
        </div>
      </div>
    )
  }

  const websiteUrl = wedding.slug ? `/w/${wedding.slug}` : '/w/preview'

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#4b030e] font-sans antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ========================================================================= */}
        {/* 1. ROYAL INVITATION CARD (ALWAYS SHOWN)                                   */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border-2 border-[#e6bd81] shadow-xl p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#e6bd81]/20 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-radial from-[#e6bd81]/20 to-transparent rounded-full -ml-16 -mb-16 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#b88444]" />
              Official Wedding Invitation
            </div>

            <p className="font-cormorant italic text-lg sm:text-xl text-[#b88444]">
              Shree Ganeshay Namah
            </p>

            <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-bold text-[#4b030e] tracking-tight">
              {wedding.brideName && wedding.groomName
                ? `${wedding.brideName} & ${wedding.groomName}`
                : wedding.brideName || wedding.groomName || 'The Sacred Wedding'}
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto">
              Together with their families, cordially invite
            </p>

            <div className="py-2">
              <span className="font-cormorant text-3xl sm:text-4xl font-bold text-[#6f0617] block">
                {invitation.displayName}
              </span>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#faf9f6] text-[#b88444] border border-[#e6bd81]">
                {invitation.circle}
              </span>
            </div>

            {/* Date & Location Pill Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2 text-xs text-left">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf9f6] border border-[#e6bd81]/50">
                <Calendar className="w-5 h-5 text-[#b88444] shrink-0" />
                <div>
                  <span className="font-bold text-[#4b030e] block">Wedding Date</span>
                  <span className="text-neutral-500">{formatInvitationDate(wedding.weddingDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf9f6] border border-[#e6bd81]/50">
                <MapPin className="w-5 h-5 text-[#b88444] shrink-0" />
                <div>
                  <span className="font-bold text-[#4b030e] block">Venue</span>
                  <span className="text-neutral-500 truncate max-w-[150px]">
                    {wedding.locationName || 'Venue Details Soon'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. RSVP DECISION SECTION (TWO BUTTONS INITIALLY, NO QR CODE!)            */}
        {/* ========================================================================= */}
        
        {rsvpSavedNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Thank you! Your RSVP response has been recorded successfully.</span>
          </div>
        )}

        {/* CASE A: PENDING OR EDITING -> TWO CLEAN BUTTONS (NO QR CODE!) */}
        {(rsvpStatus === 'PENDING' || isEditingRsvp) && (
          <div className="bg-white rounded-3xl border-2 border-[#e6bd81] shadow-xl p-6 sm:p-10 space-y-6">
            <div className="text-center space-y-1.5 border-b border-[#e6bd81]/30 pb-5">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81] uppercase tracking-wider inline-block">
                RSVP Confirmation
              </span>
              <h3 className="font-cormorant text-3xl font-bold text-[#4b030e]">
                Will Your Family Attend?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
                Please let the hosts know if your family will be joining in the celebrations. Upon accepting, your official entrance gate QR pass will be unlocked.
              </p>
            </div>

            {/* Attendee Count Selection if multiple permitted */}
            {invitation.maxAttendees > 1 && (
              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e6bd81]/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#4b030e] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#b88444]" />
                    <span>Number of Attending Guests</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#85531d]">
                    Up to {invitation.maxAttendees} Guests Allowed
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {Array.from({ length: invitation.maxAttendees }, (_, idx) => idx + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setAttendeeCount(n)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        attendeeCount === n
                          ? 'bg-[#6f0617] text-white shadow-xs scale-105'
                          : 'bg-white border border-[#e6bd81]/60 text-[#4b030e] hover:bg-[#faf4ec]'
                      }`}
                    >
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Dietary / Assistance Preferences */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4b030e] uppercase tracking-wider flex items-center justify-between">
                <span>Dietary or Special Assistance (Optional)</span>
                <span className="text-[10px] text-neutral-400 font-normal">e.g. Jain catering, wheelchair assistance</span>
              </label>
              <input
                type="text"
                value={dietaryInput}
                onChange={(e) => setDietaryInput(e.target.value)}
                placeholder="Mention any dietary preferences or assistance needed..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#e6bd81]/60 bg-[#faf9f6] text-xs text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
              />
            </div>

            {/* THE TWO BUTTONS: ACCEPT OR DECLINE */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleQuickAccept()}
                disabled={isSubmittingRsvp}
                className="p-4 rounded-2xl bg-gradient-to-r from-[#4b030e] to-[#6f0617] hover:from-[#3a0208] hover:to-[#540411] text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
              >
                {isSubmittingRsvp ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#e6bd81]" />
                ) : (
                  <Check className="w-5 h-5 text-emerald-400" />
                )}
                <span>Joyfully Accept</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDecline()}
                disabled={isSubmittingRsvp}
                className="p-4 rounded-2xl bg-[#faf9f6] hover:bg-neutral-100 border-2 border-neutral-300 text-neutral-700 font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5 text-neutral-500" />
                <span>Regretfully Decline</span>
              </button>
            </div>

            {isEditingRsvp && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingRsvp(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
                >
                  Cancel editing &amp; return to pass
                </button>
              </div>
            )}
          </div>
        )}

        {/* CASE B: ACCEPTED -> REVEAL THE QR PASS (VERY COOL AND CLEAN!) */}
        {rsvpStatus === 'ATTENDING' && !isEditingRsvp && (
          <div className="bg-gradient-to-br from-[#4b030e] via-[#6f0617] to-[#3a0208] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-[#b88444] relative overflow-hidden space-y-6">
            {/* Top Pass Status Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Invitation Accepted
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e6bd81] text-[#4b030e] uppercase tracking-wider">
                  Official Gate Pass
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingRsvp(true)}
                className="text-xs font-semibold text-[#e6bd81] hover:text-white underline cursor-pointer"
              >
                Update Response / Guest Count
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Pass Details */}
              <div className="md:col-span-7 space-y-4">
                <h2 className="font-cormorant text-3xl sm:text-4xl font-bold text-[#e6bd81]">
                  Your Reception QR Pass
                </h2>

                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  We look forward to celebrating with you! Present this official gate pass on your phone upon arrival at the welcome desk for instant badge check-in.
                </p>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Family Unit:</span>
                    <span className="font-bold text-sm text-white">{invitation.displayName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Confirmed Attendance:</span>
                    <span className="font-bold text-[#e6bd81] text-sm">
                      {invitation.actualAttendees || attendeeCount} { (invitation.actualAttendees || attendeeCount) === 1 ? 'Guest' : 'Guests'} Confirmed
                    </span>
                  </div>
                  {invitation.dietaryNotes && (
                    <div className="flex justify-between items-start pt-1.5 border-t border-white/10">
                      <span className="text-white/70">Dietary Preferences:</span>
                      <span className="font-medium text-white/90 text-right max-w-[200px]">{invitation.dietaryNotes}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1.5 border-t border-white/10">
                    <span className="text-white/70">Gate Pass Code:</span>
                    <span className="font-mono text-white/90 font-bold">{invitation.invitationToken}</span>
                  </div>
                </div>

                {/* Download / Share Buttons */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e6bd81] text-[#4b030e] font-bold text-xs hover:bg-[#f6ebd9] transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Save Pass QR to Phone
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPassLink}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    {copied ? 'Link Copied!' : 'Share Pass Link'}
                  </button>
                </div>
              </div>

              {/* Right QR Display Container */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-[#e6bd81] text-center max-w-[260px] w-full">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Family Invitation QR Code"
                      className="w-full aspect-square object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-neutral-100 flex items-center justify-center rounded-xl">
                      <span className="text-xs text-neutral-400">Generating QR...</span>
                    </div>
                  )}
                  <div className="mt-2 text-center">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#4b030e] block">
                      Scan At Entrance Gate
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 block truncate">
                      {invitation.invitationToken}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE C: DECLINED -> WARM RESPECTFUL CONFIRMATION */}
        {rsvpStatus === 'NOT_ATTENDING' && !isEditingRsvp && (
          <div className="bg-white rounded-3xl border-2 border-neutral-300 shadow-lg p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7 text-[#6f0617]" />
            </div>
            <h3 className="font-cormorant text-3xl font-bold text-[#4b030e]">
              Response Recorded: Regretfully Declined
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              We understand you will not be able to attend. The couple and families send their heartfelt gratitude and warmest blessings from afar!
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsEditingRsvp(true)}
                className="px-4 py-2 rounded-xl bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81] text-xs font-semibold hover:bg-[#f6ebd9] transition-all cursor-pointer"
              >
                Changed your mind? Click here to update RSVP
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. WEDDING WEBSITE PORTAL BANNER (SEPARATE LINK TO EXPLORE MORE)          */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#4b030e] via-[#6f0617] to-[#3a0208] text-white p-6 sm:p-8 rounded-3xl border-2 border-[#e6bd81] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#e6bd81] text-xs font-semibold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-[#e6bd81]" />
              Official Wedding Website
            </div>
            <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-white">
              Explore Celebrations &amp; Full Itinerary
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-md">
              View the 3-day ceremonial timeline, auspicious event timings, royal dress codes, livestream, and interactive guest photo gallery.
            </p>
          </div>

          <Link
            to={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#b88444] to-[#e6bd81] hover:from-[#c99555] hover:to-[#f0ca94] text-[#3a0208] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all hover:scale-105 shrink-0 cursor-pointer"
          >
            <span>Visit Wedding Website</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 4. CEREMONIES & FUNCTIONS INCLUDED                                        */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-[#e6bd81]/50 p-6 sm:p-8 space-y-3">
          <h4 className="font-cormorant text-xl font-bold text-[#4b030e]">
            Ceremonies &amp; Functions Included
          </h4>
          <p className="text-xs text-neutral-500">
            Your family invitation provides access to the following royal celebrations:
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {invitation.ceremoniesAllowed.map((ceremony) => (
              <span
                key={ceremony}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81]"
              >
                {ceremony}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
