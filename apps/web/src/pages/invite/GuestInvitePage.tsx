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
} from 'lucide-react'
import QRCode from 'qrcode'
import { resolveInvitation, getInvitations, saveInvitations } from '../../services/invitationStore'
import type { FamilyInvitation } from '../../types/invitation'
import { publicApi } from '../../services/apiClient'

export default function GuestInvitePage() {
  const { token } = useParams<{ token: string }>()
  const [invitation, setInvitation] = useState<FamilyInvitation | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false)
  const [rsvpSavedNotice, setRsvpSavedNotice] = useState(false)

  // Active Wedding Details
  const [wedding, setWedding] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    locationName: '',
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
        setWedding({
          brideName: data.brideName || '',
          groomName: data.groomName || '',
          weddingDate: data.weddingDate || '',
          locationName: data.venueName || data.city || '',
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
    })
  }, [token])

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitation || !token) return

    setIsSubmittingRsvp(true)

    // Call public backend endpoint
    publicApi.submitRsvp(token, {
      rsvpStatus: rsvpStatus === 'PENDING' ? 'ATTENDING' : rsvpStatus,
      actualAttendees: rsvpStatus === 'ATTENDING' ? attendeeCount : 0,
      dietaryNotes: dietaryInput,
    }).catch((err) => {
      console.warn('Backend RSVP submit note:', err)
    }).finally(() => {
      // Also update local storage for offline continuity
      const allInvites = getInvitations()
      const updated = allInvites.map((inv) => {
        if (inv.id === invitation.id || inv.invitationToken === invitation.invitationToken) {
          return {
            ...inv,
            rsvpStatus,
            actualAttendees: rsvpStatus === 'ATTENDING' ? attendeeCount : 0,
            dietaryNotes: dietaryInput,
          }
        }
        return inv
      })

      saveInvitations(updated)

      setInvitation((prev) => prev ? {
        ...prev,
        rsvpStatus,
        actualAttendees: rsvpStatus === 'ATTENDING' ? attendeeCount : 0,
        dietaryNotes: dietaryInput,
      } : null)

      setIsSubmittingRsvp(false)
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
            to="/w/preview"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6f0617] text-white text-xs font-semibold hover:bg-[#4b030e] transition-all"
          >
            Visit Wedding Website
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#4b030e] font-sans antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* ========================================================================= */}
        {/* 1. ROYAL INVITATION HEADER & BANNER                                       */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border-2 border-[#e6bd81] shadow-xl p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#e6bd81]/20 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-radial from-[#e6bd81]/20 to-transparent rounded-full -ml-16 -mb-16 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#b88444]" />
              Official Wedding Invitation &amp; Pass
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-4 text-xs text-left">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf9f6] border border-[#e6bd81]/50">
                <Calendar className="w-5 h-5 text-[#b88444]" shrink-0 />
                <div>
                  <span className="font-bold text-[#4b030e] block">Wedding Date</span>
                  <span className="text-neutral-500">{wedding.weddingDate || 'To Be Announced'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#faf9f6] border border-[#e6bd81]/50">
                <MapPin className="w-5 h-5 text-[#b88444]" shrink-0 />
                <div>
                  <span className="font-bold text-[#4b030e] block">Venue</span>
                  <span className="text-neutral-500 truncate max-w-[150px]">{wedding.locationName || 'Venue Details Soon'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DIGITAL QR ADMISSION PASS (HOW GUEST GETS THEIR QR CODE!)              */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-[#4b030e] via-[#6f0617] to-[#3a0208] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-[#b88444] relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Pass Details */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#e6bd81] text-[#4b030e] uppercase tracking-wider">
                  Fast-Track Gate Pass
                </span>
                {invitation.checkedInAt ? (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    ✓ Checked In at Reception
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 text-white/80 border border-white/20">
                    Ready for Gate Scan
                  </span>
                )}
              </div>

              <h2 className="font-cormorant text-3xl sm:text-4xl font-bold text-[#e6bd81]">
                Your Reception QR Pass
              </h2>

              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                Show this official QR code on your phone when arriving at the welcome desk.
                Our reception team will scan it in seconds to verify your family unit and issue your ceremony badges.
              </p>

              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-white/70">Family Unit:</span>
                  <span className="font-bold">{invitation.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Permitted Attendance:</span>
                  <span className="font-bold text-[#e6bd81]">Up to {invitation.maxAttendees} Guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Pass ID / Token:</span>
                  <span className="font-mono text-white/90">{invitation.invitationToken}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-2">
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

        {/* ========================================================================= */}
        {/* 3. RSVP CONFIRMATION FORM                                                 */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-[#e6bd81]/60 shadow-lg p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-[#e6bd81]/30 pb-4 mb-6">
            <div>
              <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                Confirm Your Family RSVP
              </h3>
              <p className="text-xs text-neutral-500">
                Please let the hosts know if your family will be joining the celebrations.
              </p>
            </div>
            {invitation.rsvpStatus === 'ATTENDING' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ RSVP Confirmed
              </span>
            )}
          </div>

          {rsvpSavedNotice && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you! Your RSVP preferences and guest count have been updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleRsvpSubmit} className="space-y-6">
            {/* Attendance Choice */}
            <div>
              <label className="block text-xs font-bold text-[#4b030e] uppercase tracking-wider mb-2">
                Will your family attend?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRsvpStatus('ATTENDING')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    rsvpStatus === 'ATTENDING'
                      ? 'border-[#6f0617] bg-[#faf4ec] text-[#4b030e] shadow-xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Joyfully Accept</span>
                    {rsvpStatus === 'ATTENDING' && <Check className="w-4 h-4 text-[#6f0617]" />}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">We look forward to celebrating together.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRsvpStatus('NOT_ATTENDING')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    rsvpStatus === 'NOT_ATTENDING'
                      ? 'border-neutral-800 bg-neutral-100 text-neutral-900'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Regretfully Decline</span>
                    {rsvpStatus === 'NOT_ATTENDING' && <Check className="w-4 h-4 text-neutral-800" />}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Sending blessings from afar.</p>
                </button>
              </div>
            </div>

            {/* Attendee Count if Attending */}
            {rsvpStatus === 'ATTENDING' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#4b030e] uppercase tracking-wider">
                  Attending Guests Count (Maximum {invitation.maxAttendees} permitted)
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={attendeeCount}
                    onChange={(e) => setAttendeeCount(Number(e.target.value))}
                    className="px-4 py-3 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-sm font-bold text-[#4b030e] focus:ring-2 focus:ring-[#6f0617] focus:outline-none"
                  >
                    {Array.from({ length: invitation.maxAttendees }, (_, idx) => idx + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-neutral-500">
                    Allocated family quota for ceremonies &amp; dining.
                  </span>
                </div>
              </div>
            )}

            {/* Dietary & Hospitality Notes */}
            <div>
              <label className="block text-xs font-bold text-[#4b030e] uppercase tracking-wider mb-1.5">
                Special Dietary or Hospitality Preferences
              </label>
              <textarea
                value={dietaryInput}
                onChange={(e) => setDietaryInput(e.target.value)}
                placeholder="e.g. Jain catering for 2, wheelchair assistance, diabetic dessert..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs text-[#4b030e] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingRsvp}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#6f0617] hover:bg-[#4b030e] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmittingRsvp ? 'Saving RSVP...' : 'Submit RSVP Preferences'}
            </button>
          </form>
        </div>

        {/* Permitted Ceremonies */}
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
