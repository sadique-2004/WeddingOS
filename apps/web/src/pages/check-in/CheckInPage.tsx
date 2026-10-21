import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { useUser } from '@clerk/clerk-react'
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users2,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Camera,
  CameraOff,
  Printer,
  X,
  RotateCcw,
  Utensils,
  Eye,
  Check,
  Info,
  HeartHandshake,
  ExternalLink,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import QRCode from 'qrcode'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import type {
  FamilyInvitation,
  CheckInLogEntry,
} from '../../types/invitation'
import {
  getInvitations,
  resolveInvitation,
  checkInFamilyInvitation,
  undoCheckIn,
  getCheckInLogs,
  resetToDemoData,
} from '../../services/invitationStore'
import { workspacesApi } from '../../services/apiClient'

export default function CheckInPage() {
  const { user } = useUser()
  const organizerName = user?.fullName || user?.firstName || 'Reception Desk Lead'

  // Active Wedding Details
  const [wedding, setWedding] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    locationName: '',
  })

  // Store data
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([])
  const [recentLogs, setRecentLogs] = useState<CheckInLogEntry[]>([])

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'checked_in' | 'vip'>('all')

  // Scanned / Selected Family
  const [selectedFamily, setSelectedFamily] = useState<FamilyInvitation | null>(null)
  const [manualCodeInput, setManualCodeInput] = useState('')

  // Check-In Alert & Warning Modals
  const [duplicateWarning, setDuplicateWarning] = useState<{
    family: FamilyInvitation
    previousTimestamp: string
  } | null>(null)

  const [successNotice, setSuccessNotice] = useState<{
    family: FamilyInvitation
    timestamp: string
  } | null>(null)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Camera Scanner State
  const [scannerActive, setScannerActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>('')
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  // Pass Preview Modal
  const [passPreviewFamily, setPassPreviewFamily] = useState<FamilyInvitation | null>(null)
  const [modalQrUrl, setModalQrUrl] = useState<string>('')

  const openPassModal = (family: FamilyInvitation) => {
    setPassPreviewFamily(family)
    const url = `${window.location.origin}/invite/${family.invitationToken}`
    QRCode.toDataURL(url, {
      width: 260,
      margin: 2,
      color: {
        dark: '#4b030e',
        light: '#ffffff',
      },
    })
      .then((dataUrl: string) => setModalQrUrl(dataUrl))
      .catch((err: unknown) => console.error('Failed generating pass QR:', err))
  }

  // Sound feedback toggle
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Load initial data
  const refreshData = () => {
    setInvitations(getInvitations())
    setRecentLogs(getCheckInLogs())
  }

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
        const active = await workspacesApi.getActive(1)
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
    refreshData()

    const handleUpdate = () => {
      refreshData()
    }
    window.addEventListener('weddingos_invitations_updated', handleUpdate)
    window.addEventListener('weddingos_wedding_updated', loadWedding)
    return () => {
      window.removeEventListener('weddingos_invitations_updated', handleUpdate)
      window.removeEventListener('weddingos_wedding_updated', loadWedding)
    }
  }, [])

  // Audio chime feedback
  const playChime = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled) return
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1) // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
        osc.start()
        osc.stop(ctx.currentTime + 0.35)
      } else if (type === 'warning') {
        osc.type = 'square'
        osc.frequency.setValueAtTime(440, ctx.currentTime)
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        osc.start()
        osc.stop(ctx.currentTime + 0.4)
      } else {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(220, ctx.currentTime)
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  // Camera cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {})
      }
    }
  }, [])

  // Fetch camera devices when user starts scanner
  const startScanner = async () => {
    setCameraError(null)
    setScannerActive(true)

    try {
      const devices = await Html5Qrcode.getCameras()
      if (devices && devices.length > 0) {
        setAvailableCameras(devices)
        const chosenId = selectedCameraId || devices[0].id
        setSelectedCameraId(chosenId)
        initHtml5QrCode(chosenId)
      } else {
        setCameraError('No camera found on this device. You can still scan by typing or pasting the code.')
        setScannerActive(false)
      }
    } catch (err: unknown) {
      console.warn('Camera permission or availability issue:', err)
      setCameraError('Camera access not granted or not available. Please allow camera permissions or enter the code manually.')
      setScannerActive(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop()
      } catch (err) {
        console.error('Error stopping QR scanner:', err)
      }
    }
    setScannerActive(false)
  }

  const initHtml5QrCode = (cameraId: string) => {
    // Wait for DOM element
    setTimeout(async () => {
      const element = document.getElementById('qr-reader-viewport')
      if (!element) return

      try {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode('qr-reader-viewport', {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
          })
        }

        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop()
        }

        await html5QrCodeRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleCodeScanned(decodedText)
          },
          () => {
            // scan failure callback on every frame without QR (ignored)
          }
        )
      } catch (err) {
        console.error('Failed to initialize Html5Qrcode:', err)
        setCameraError('Unable to start camera preview. Please check browser camera permissions.')
        setScannerActive(false)
      }
    }, 150)
  }

  const handleCameraChange = (newCameraId: string) => {
    setSelectedCameraId(newCameraId)
    if (scannerActive) {
      initHtml5QrCode(newCameraId)
    }
  }

  // Handle scanned or typed token
  const handleCodeScanned = (scannedValue: string) => {
    setErrorMessage(null)
    const found = resolveInvitation(scannedValue)

    if (!found) {
      playChime('error')
      setErrorMessage(`Unrecognized invitation code: "${scannedValue}". Please verify token or find family in the guest list below.`)
      return
    }

    // Process family
    processCheckInOrWarn(found)
  }

  const processCheckInOrWarn = (family: FamilyInvitation) => {
    setSelectedFamily(family)

    // Check if already checked in (FR-CHECK-04: Warn if an already checked-in invitation is scanned again)
    if (family.checkedInAt) {
      playChime('warning')
      setDuplicateWarning({
        family,
        previousTimestamp: family.checkedInAt,
      })
      return
    }

    // Perform check-in
    try {
      const result = checkInFamilyInvitation(family.id, organizerName)
      refreshData()
      setSelectedFamily(result.invitation)

      if (result.alreadyCheckedIn) {
        playChime('warning')
        setDuplicateWarning({
          family: result.invitation,
          previousTimestamp: result.previousTimestamp || new Date().toISOString(),
        })
      } else {
        playChime('success')
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4b030e', '#6f0617', '#e6bd81', '#b88444'],
        })
        setSuccessNotice({
          family: result.invitation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error processing check-in'
      setErrorMessage(message)
    }
  }

  const handleManualSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!manualCodeInput.trim()) return
    handleCodeScanned(manualCodeInput.trim())
    setManualCodeInput('')
  }

  const handleManualCheckInAction = (family: FamilyInvitation) => {
    processCheckInOrWarn(family)
  }

  const handleUndoCheckIn = (invitationId: string) => {
    try {
      const updated = undoCheckIn(invitationId)
      refreshData()
      if (selectedFamily?.id === invitationId) {
        setSelectedFamily(updated)
      }
      setDuplicateWarning(null)
      setSuccessNotice(null)
    } catch (err) {
      console.error(err)
    }
  }

  // Calculate Metrics
  const totalInvited = invitations.length
  const totalCheckedIn = invitations.filter((i) => !!i.checkedInAt).length
  const totalPending = totalInvited - totalCheckedIn
  const checkInRate = totalInvited > 0 ? Math.round((totalCheckedIn / totalInvited) * 100) : 0
  const totalAttendingGuests = invitations
    .filter((i) => i.rsvpStatus === 'ATTENDING')
    .reduce((acc, curr) => acc + (curr.actualAttendees || curr.maxAttendees), 0)

  // Filtered Invitations List
  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch =
      inv.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.primaryContactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invitationToken.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (filterTab === 'pending') return !inv.checkedInAt
    if (filterTab === 'checked_in') return !!inv.checkedInAt
    if (filterTab === 'vip') return inv.circle === 'VIP Patrons'
    return true
  })

  return (
    <div className="space-y-6 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & RECEPTION DESK BANNER                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#e6bd81]/50 shadow-sm p-6 sm:p-7 relative overflow-hidden">
        {/* Decorative corner crest */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#e6bd81]/15 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4b030e] text-[#e6bd81] border border-[#b88444]/40 tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e6bd81]" />
                Reception &amp; Guest Arrival Desk
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Desk Mode
              </span>
            </div>

            <h1 className="font-cormorant text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4b030e]">
              Family Reception &amp; QR Check-In
            </h1>
            <p className="text-sm text-[#4b030e]/80 mt-1 max-w-2xl">
              Welcome esteemed families to{' '}
              <strong>
                {wedding.brideName && wedding.groomName
                  ? `${wedding.brideName} & ${wedding.groomName}’s`
                  : wedding.brideName || wedding.groomName
                  ? `${wedding.brideName || wedding.groomName}’s`
                  : 'the sacred wedding'}
              </strong>{' '}
              celebration. Scan guest QR codes or verify invitation identity to mark family arrival in real time.
            </p>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                resetToDemoData()
                refreshData()
                setSelectedFamily(null)
                setDuplicateWarning(null)
                setSuccessNotice(null)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4b030e] bg-[#faf9f6] border border-[#e6bd81] hover:bg-[#f6ebd9] transition-all cursor-pointer shadow-xs"
              title="Reset data to clean demo set"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#b88444]" />
              Reset Demo Data
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs border ${
                soundEnabled
                  ? 'bg-amber-50 text-[#6f0617] border-[#e6bd81]'
                  : 'bg-neutral-100 text-neutral-500 border-neutral-200'
              }`}
              title="Toggle scan audio feedback"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Chime: {soundEnabled ? 'On' : 'Muted'}
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#e6bd81]/40">
              <div className="text-right">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Active Desk Lead</p>
                <p className="text-xs font-bold text-[#4b030e] truncate max-w-[150px]">{organizerName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATS OVERVIEW CARDS                                                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#e6bd81]/30">
          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-600 block">Total Families Invited</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#4b030e]">{totalInvited}</span>
              <span className="text-xs text-neutral-500">invitations</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">{totalAttendingGuests} confirmed guests</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
            <span className="text-[11px] font-medium text-emerald-800 block">Families Checked In</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-800">{totalCheckedIn}</span>
              <span className="text-xs font-semibold text-emerald-700">({checkInRate}%)</span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${checkInRate}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
            <span className="text-[11px] font-medium text-amber-900 block">Awaiting Arrival</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-900">{totalPending}</span>
              <span className="text-xs text-amber-700">families</span>
            </div>
            <span className="text-[10px] text-amber-700 mt-0.5 block">Reception active</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-600 block">Check-In Unit Scope</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-sm font-bold text-[#6f0617]">Family-Level</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-0.5 block leading-tight">
              One check-in records admission for entire family unit (FR-CHECK-05)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DUAL SCANNER & FAST ENTRY WORKSPACE                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: QR Camera Scanner + Code Entry (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scanner Card */}
          <div className="bg-white rounded-2xl border border-[#e6bd81]/50 shadow-sm p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#faf9f6] text-[#6f0617] border border-[#e6bd81]/40">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#4b030e]">QR Code Scanner</h3>
                  <p className="text-[11px] text-neutral-500">Camera or manual token verification</p>
                </div>
              </div>

              {scannerActive ? (
                <button
                  onClick={stopScanner}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  Stop Camera
                </button>
              ) : (
                <button
                  onClick={startScanner}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#6f0617] text-white hover:bg-[#4b030e] transition-all cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Start Camera
                </button>
              )}
            </div>

            {/* Camera Viewport or Placeholder */}
            {scannerActive ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-square flex items-center justify-center border-2 border-[#b88444]">
                  {/* html5-qrcode will render inside this container */}
                  <div id="qr-reader-viewport" className="w-full h-full overflow-hidden" />

                  {/* Golden Viewfinder HUD Overlay */}
                  <div className="absolute inset-8 pointer-events-none border border-[#e6bd81]/40 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-t-3 border-l-3 border-[#e6bd81] rounded-tl" />
                      <div className="w-5 h-5 border-t-3 border-r-3 border-[#e6bd81] rounded-tr" />
                    </div>
                    {/* Laser scanning line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#e6bd81] to-transparent animate-pulse shadow-[0_0_8px_#e6bd81]" />
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-b-3 border-l-3 border-[#e6bd81] rounded-bl" />
                      <div className="w-5 h-5 border-b-3 border-r-3 border-[#e6bd81] rounded-br" />
                    </div>
                  </div>

                  <div className="absolute bottom-2 inset-x-2 text-center pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/75 text-[10px] text-white backdrop-blur-xs font-medium">
                      Position QR Code in central box
                    </span>
                  </div>
                </div>

                {/* Camera selector if multiple cameras */}
                {availableCameras.length > 1 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-neutral-500 shrink-0">Camera:</span>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => handleCameraChange(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded-lg border border-neutral-300 text-xs bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#6f0617]"
                    >
                      {availableCameras.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label || `Camera ${c.id.slice(0, 5)}...`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-[#e6bd81]/60 bg-[#faf9f6] p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#f6ebd9] text-[#6f0617] flex items-center justify-center mx-auto border border-[#e6bd81]">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#4b030e]">Camera Scanner Ready</p>
                  <p className="text-[11px] text-neutral-500 max-w-xs mx-auto mt-0.5">
                    Click "Start Camera" to scan printed invitation cards or mobile invite passes directly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startScanner}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6f0617] text-white hover:bg-[#4b030e] transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Enable Camera Scanner
                </button>
              </div>
            )}

            {cameraError && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Manual Token Entry Form */}
            <div className="mt-4 pt-4 border-t border-[#e6bd81]/30">
              <label htmlFor="token-manual-input" className="block text-xs font-semibold text-[#4b030e] mb-1.5">
                Manual Token or Passcode Entry
              </label>
              <form onSubmit={handleManualSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="token-manual-input"
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="e.g. wos-singhania-8821 or name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-mono text-[#4b030e] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#6f0617] text-white font-semibold text-xs hover:bg-[#4b030e] transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  Lookup
                </button>
              </form>

              {/* Quick 1-Click Demo Buttons for Fast Testing */}
              <div className="mt-3">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                  1-Click Test Scenarios:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCodeScanned('wos-singhania-8821')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#faf9f6] border border-[#e6bd81] text-[#4b030e] hover:bg-[#f6ebd9] transition-all cursor-pointer"
                  >
                    ✨ Singhania (Unchecked)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCodeScanned('wos-verma-4192')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#faf9f6] border border-[#e6bd81] text-[#4b030e] hover:bg-[#f6ebd9] transition-all cursor-pointer"
                  >
                    👑 Verma (VIP)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCodeScanned('wos-chowdhury-7301')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 transition-all cursor-pointer"
                    title="Simulate scanning an already checked-in QR code"
                  >
                    ⚠️ Chowdhury (Already Checked In)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reception Log Feed */}
          <div className="bg-white rounded-2xl border border-[#e6bd81]/50 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-xs text-[#4b030e] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#b88444]" />
                Recent Gate Activity Feed
              </h4>
              <span className="text-[10px] text-neutral-400">Latest arrivals</span>
            </div>

            {recentLogs.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-4">No gate activity logged yet today.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                {recentLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      log.isDuplicateAttempt
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-[#faf9f6] border-[#e6bd81]/40 text-[#4b030e]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        {log.isDuplicateAttempt ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span className="font-semibold truncate">{log.familyName}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {log.isDuplicateAttempt ? 'Duplicate scan attempted' : `${log.attendeeCount} guests admitted`} • {log.checkedInBy}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Family Verification Card & Live Check-In Action (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* ========================================================================= */}
          {/* FR-CHECK-04: WARNING BANNER (IF ALREADY CHECKED IN)                       */}
          {/* ========================================================================= */}
          {duplicateWarning && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] uppercase tracking-wider">
                      FR-CHECK-04 Security Warning
                    </span>
                    <button
                      onClick={() => setDuplicateWarning(null)}
                      className="text-amber-800 hover:text-black p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-cormorant text-xl font-bold text-amber-950 mt-1">
                    Invitation Already Checked In!
                  </h3>
                  <p className="text-xs text-amber-900 mt-1">
                    <strong>{duplicateWarning.family.displayName}</strong> was already checked in and issued entry credentials.
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-white/80 border border-amber-300 text-xs space-y-1 text-amber-950">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">First Admitted:</span>
                      <span className="font-bold">
                        {new Date(duplicateWarning.previousTimestamp).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Admitting Officer:</span>
                      <span className="font-bold">{duplicateWarning.family.checkedInBy || 'Reception Desk'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Permitted Guests:</span>
                      <span className="font-bold">{duplicateWarning.family.maxAttendees} Guests</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3.5">
                    <button
                      onClick={() => setDuplicateWarning(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-900 text-white hover:bg-black transition-all cursor-pointer shadow-xs"
                    >
                      Acknowledge &amp; Allow Re-entry
                    </button>
                    <button
                      onClick={() => handleUndoCheckIn(duplicateWarning.family.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-amber-400 text-amber-900 hover:bg-amber-100 transition-all cursor-pointer"
                    >
                      Revert Check-In State (Desk Override)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUCCESS BANNER                                                            */}
          {/* ========================================================================= */}
          {successNotice && !duplicateWarning && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase tracking-wider">
                      Admitted Successfully
                    </span>
                    <h3 className="font-cormorant text-xl font-bold text-emerald-950 mt-1">
                      Welcome, {successNotice.family.displayName}!
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1">
                      Family marked checked in at <strong>{successNotice.timestamp}</strong> by <strong>{organizerName}</strong>.
                      Entire family unit ({successNotice.family.actualAttendees} guests) cleared for entry.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSuccessNotice(null)}
                  className="text-emerald-700 hover:text-black p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FR-CHECK-02: ACTIVE FAMILY VERIFICATION DETAILS CARD                      */}
          {/* ========================================================================= */}
          {selectedFamily ? (
            <div className="bg-white rounded-2xl border-2 border-[#e6bd81] shadow-md p-6 relative overflow-hidden">
              {/* Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e6bd81]/30 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#faf9f6] text-[#6f0617] border border-[#e6bd81]">
                    {selectedFamily.circle}
                  </span>
                  {selectedFamily.checkedInAt ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                      Checked In ({new Date(selectedFamily.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      Not Checked In Yet
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPassModal(selectedFamily)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#faf9f6] text-[#4b030e] border border-[#e6bd81] hover:bg-[#f6ebd9] transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#b88444]" />
                    View Welcome Pass
                  </button>
                  <button
                    onClick={() => setSelectedFamily(null)}
                    className="text-neutral-400 hover:text-neutral-700 p-1"
                    title="Close verification card"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Family Identity Details */}
              <div className="space-y-4">
                <div>
                  <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#4b030e]">
                    {selectedFamily.displayName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600 mt-1">
                    <span className="font-semibold text-[#4b030e]">Primary Contact: {selectedFamily.primaryContactName}</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#b88444]" />
                      {selectedFamily.phoneNumber}
                    </span>
                    {selectedFamily.email && (
                      <span className="flex items-center gap-1 text-neutral-500">
                        <Mail className="w-3 h-3 text-[#b88444]" />
                        {selectedFamily.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Attendees and RSVP Info (FR-CHECK-02 & FR-CHECK-05) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/50 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
                      Allowed Attendee Cap (Unit)
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-bold text-[#4b030e]">{selectedFamily.maxAttendees}</span>
                      <span className="text-xs text-neutral-600">Guests max allowed</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Check-in applies to family group. Individual gate counting disabled per FR-CHECK-05.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
                      RSVP Attendance State
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {selectedFamily.rsvpStatus === 'ATTENDING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                          <Check className="w-3 h-3" />
                          Confirmed Attending ({selectedFamily.actualAttendees} attendees)
                        </span>
                      ) : selectedFamily.rsvpStatus === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                          <Clock className="w-3 h-3" />
                          Pending RSVP (Admit as needed)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
                          Declined RSVP
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-1 block font-mono">
                      Token: {selectedFamily.invitationToken}
                    </span>
                  </div>
                </div>

                {/* Allowed Functions / Ceremonies */}
                <div>
                  <span className="text-xs font-semibold text-[#4b030e] block mb-1.5">
                    Permitted Ceremonies &amp; Functions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFamily.ceremoniesAllowed.map((ceremony) => (
                      <span
                        key={ceremony}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-[#f6ebd9] text-[#6f0617] border border-[#e6bd81]"
                      >
                        {ceremony}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dietary & Hospitality Notes */}
                {selectedFamily.dietaryNotes && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                    <Utensils className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Dietary &amp; Hospitality Requirements:</span>
                      <p className="mt-0.5 text-amber-900">{selectedFamily.dietaryNotes}</p>
                    </div>
                  </div>
                )}

                {/* Organizer Private Notes */}
                {selectedFamily.organizerNotes && (
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Organizer Internal Notes:</span>
                      <p className="mt-0.5 text-purple-900">{selectedFamily.organizerNotes}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {!selectedFamily.checkedInAt ? (
                    <button
                      type="button"
                      onClick={() => handleManualCheckInAction(selectedFamily)}
                      className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#6f0617] to-[#4b030e] text-white hover:from-[#4b030e] hover:to-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#e6bd81]" />
                      <span>Confirm &amp; Check In Family</span>
                    </button>
                  ) : (
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <div className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                        <span>Already Checked In by {selectedFamily.checkedInBy || 'Reception Desk'}</span>
                        <span className="font-mono text-[11px]">
                          {new Date(selectedFamily.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUndoCheckIn(selectedFamily.id)}
                        className="py-2.5 px-4 rounded-xl border border-neutral-300 bg-white text-neutral-700 text-xs font-semibold hover:bg-neutral-100 transition-all cursor-pointer"
                      >
                        Revert Check-In
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Empty selection placeholder */
            <div className="bg-white rounded-2xl border border-dashed border-[#e6bd81] p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#faf9f6] text-[#b88444] border border-[#e6bd81] flex items-center justify-center mx-auto shadow-xs">
                <Users2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-cormorant text-xl font-bold text-[#4b030e]">
                  Scan or Select a Family Invitation
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                  Point the camera at an invitation QR code, type a family pass token, or pick a family from the list below to complete reception verification.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INVITATIONS DIRECTORY & QUICK RECEPTION TABLE                           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#e6bd81]/50 shadow-sm p-5 sm:p-6 space-y-4">
        {/* Table Toolbar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
              Guest Roster &amp; Arrival Status
            </h3>
            <p className="text-xs text-neutral-500">
              Manage reception status, search families, or perform instant manual check-in.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#faf9f6] rounded-xl border border-[#e6bd81]/40 self-start sm:self-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-[#4b030e] hover:bg-white'
              }`}
            >
              All ({totalInvited})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'pending'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-[#4b030e] hover:bg-white'
              }`}
            >
              Pending Arrival ({totalPending})
            </button>
            <button
              onClick={() => setFilterTab('checked_in')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'checked_in'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-[#4b030e] hover:bg-white'
              }`}
            >
              Checked In ({totalCheckedIn})
            </button>
            <button
              onClick={() => setFilterTab('vip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'vip'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-[#4b030e] hover:bg-white'
              }`}
            >
              VIP Patrons
            </button>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#b88444] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by family name, primary contact, phone number, or token..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs text-[#4b030e] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
          />
        </div>

        {/* Roster Table */}
        <div className="overflow-x-auto rounded-xl border border-[#e6bd81]/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#faf9f6] text-[#4b030e] border-b border-[#e6bd81]/40 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Family / Contact</th>
                <th className="py-3 px-4">Circle</th>
                <th className="py-3 px-4 text-center">RSVP &amp; Allowed</th>
                <th className="py-3 px-4">Check-In Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6bd81]/20">
              {filteredInvitations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    No family invitations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredInvitations.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedFamily(inv)}
                    className={`hover:bg-[#faf4ec] transition-colors cursor-pointer ${
                      selectedFamily?.id === inv.id ? 'bg-[#faf4ec]' : ''
                    }`}
                  >
                    {/* Family Name & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#4b030e] text-sm">{inv.displayName}</div>
                      <div className="flex items-center gap-2 text-neutral-500 text-[11px] mt-0.5">
                        <span>{inv.primaryContactName}</span>
                        <span>•</span>
                        <span className="font-mono">{inv.phoneNumber}</span>
                      </div>
                      {inv.dietaryNotes && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1 border border-amber-200">
                          <Utensils className="w-2.5 h-2.5 text-amber-700" />
                          <span className="truncate max-w-[200px]">{inv.dietaryNotes}</span>
                        </div>
                      )}
                    </td>

                    {/* Circle */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold bg-[#faf9f6] text-[#6f0617] border border-[#e6bd81]">
                        {inv.circle}
                      </span>
                    </td>

                    {/* RSVP & Allowed */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-sm text-[#4b030e]">
                        {inv.actualAttendees > 0 ? inv.actualAttendees : inv.maxAttendees}
                        <span className="text-neutral-400 text-xs font-normal"> / {inv.maxAttendees}</span>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 ${
                          inv.rsvpStatus === 'ATTENDING'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.rsvpStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {inv.rsvpStatus}
                      </span>
                    </td>

                    {/* Check-In Status */}
                    <td className="py-3.5 px-4">
                      {inv.checkedInAt ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Check className="w-3 h-3" />
                            Checked In
                          </span>
                          <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                            {new Date(inv.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-600">
                          <Clock className="w-3 h-3" />
                          Pending Arrival
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        {!inv.checkedInAt ? (
                          <button
                            type="button"
                            onClick={() => handleManualCheckInAction(inv)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#6f0617] text-white hover:bg-[#4b030e] transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Check In
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUndoCheckIn(inv.id)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer"
                            title="Undo Check-In"
                          >
                            Revert
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openPassModal(inv)}
                          className="p-1.5 rounded-lg text-[#b88444] hover:bg-[#faf4ec] transition-all cursor-pointer"
                          title="View Welcome Pass & QR Code"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: ROYAL RECEPTION PASS PREVIEW & PRINT                             */}
      {/* ========================================================================= */}
      {passPreviewFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-[#b88444] shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPassPreviewFamily(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pass Printable Container */}
            <div className="text-center space-y-4">
              <div className="inline-block p-3 rounded-full bg-[#faf9f6] border border-[#e6bd81]">
                <HeartHandshake className="w-8 h-8 text-[#6f0617]" />
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#b88444] block">
                  Royal Reception Admission Pass
                </span>
                <h3 className="font-cormorant text-3xl font-bold text-[#4b030e] mt-1">
                  {passPreviewFamily.displayName}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {wedding.brideName && wedding.groomName
                    ? `Celebrating ${wedding.brideName} & ${wedding.groomName}`
                    : 'Celebrating the Sacred Wedding'}
                  {wedding.locationName ? ` • ${wedding.locationName}` : ''}
                </p>
              </div>

              {/* Pass Credentials Box */}
              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e6bd81]/60 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#e6bd81]/30 pb-2">
                  <span className="text-neutral-500">Family Circle:</span>
                  <span className="font-bold text-[#4b030e]">{passPreviewFamily.circle}</span>
                </div>
                <div className="flex justify-between border-b border-[#e6bd81]/30 pb-2">
                  <span className="text-neutral-500">Party Headcount:</span>
                  <span className="font-bold text-[#4b030e]">{passPreviewFamily.actualAttendees || passPreviewFamily.maxAttendees} Guests</span>
                </div>
                <div className="flex justify-between border-b border-[#e6bd81]/30 pb-2">
                  <span className="text-neutral-500">Check-In Status:</span>
                  <span className="font-bold text-emerald-800">
                    {passPreviewFamily.checkedInAt
                      ? `Checked In at ${new Date(passPreviewFamily.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Pending Reception Gate Scan'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Invitation Token:</span>
                  <span className="font-mono font-bold text-[#6f0617]">{passPreviewFamily.invitationToken}</span>
                </div>
              </div>

              {/* Dynamic Family QR Code Display */}
              {modalQrUrl && (
                <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#e6bd81] flex flex-col items-center justify-center space-y-2">
                  <img
                    src={modalQrUrl}
                    alt="Family Pass QR Code"
                    className="w-36 h-36 object-contain rounded-xl border-2 border-[#b88444] bg-white p-1 shadow-sm"
                  />
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-[#4b030e] uppercase tracking-wider block">
                      Fast-Track Gate Scan QR
                    </span>
                    <a
                      href={`/invite/${passPreviewFamily.invitationToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6f0617] hover:underline mt-1"
                    >
                      <span>Open Guest Invitation View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Allowed Ceremonies */}
              <div className="text-left">
                <span className="text-[11px] font-semibold text-neutral-500 block mb-1">Permitted Ceremonies:</span>
                <div className="flex flex-wrap gap-1">
                  {passPreviewFamily.ceremoniesAllowed.map((c) => (
                    <span key={c} className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#f6ebd9] text-[#6f0617] border border-[#e6bd81]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pass Footer */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#4b030e] text-white hover:bg-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print Hospitality Slip
                </button>
                <button
                  type="button"
                  onClick={() => setPassPreviewFamily(null)}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
