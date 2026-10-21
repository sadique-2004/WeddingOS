import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  Users2,
  CheckSquare,
  DollarSign,
  Camera,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  QrCode,
  MapPin,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Settings,
  User,
  Info
} from 'lucide-react'
import { workspacesApi, eventsApi, tasksApi, expensesApi, galleryApi } from '../../services/apiClient'
import { getInvitations, resetToDemoData } from '../../services/invitationStore'
import { resetMembershipDemoData } from '../../services/membershipStore'

interface DashboardWedding {
  id?: number
  brideName?: string
  groomName?: string
  weddingDate?: string
  locationName?: string
  venueName?: string
  city?: string
  totalBudgetTarget?: number
  expectedGuestCapacity?: number
}

interface DashboardTask {
  id: string | number
  title: string
  priority?: string
  due?: string
  completed: boolean
  ceremony?: string
}

interface DashboardEvent {
  id: string | number
  name: string
  dayLabel?: string
  startTime?: string
  endTime?: string
  venueName?: string
  dressCode?: string
  imageUrl?: string
  eventDate?: string
}

export default function DashboardPage() {
  const [wedding, setWedding] = useState<DashboardWedding>({
    brideName: '',
    groomName: '',
    weddingDate: '',
    locationName: '',
    city: '',
    venueName: '',
    totalBudgetTarget: 0,
    expectedGuestCapacity: 0,
  })

  const [tasks, setTasks] = useState<DashboardTask[]>([])
  const [events, setEvents] = useState<DashboardEvent[]>([])
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [guestMetrics, setGuestMetrics] = useState({
    totalInvitedFamilies: 0,
    confirmedGuests: 0,
    pendingFamilies: 0,
    capacity: 0,
  })
  const [photoMetrics, setPhotoMetrics] = useState({
    pendingCount: 0,
    approvedCount: 0,
  })

  // Modal & feedback states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Live ticking countdown to wedding date (updates every second)
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const loadAllDashboardData = async () => {
    try {
      // 1. Load active workspace summary
      const active = await workspacesApi.getActive(1).catch(() => null)
      if (active) {
        setWedding({
          id: active.id || 1,
          brideName: active.brideName || '',
          groomName: active.groomName || '',
          weddingDate: active.weddingDate || '',
          city: active.city || '',
          venueName: active.venueName || '',
          locationName: active.venueName || active.city || '',
          totalBudgetTarget: Number(active.totalBudgetTarget) || 0,
          expectedGuestCapacity: Number(active.expectedGuestCapacity) || 0,
        })
        if (active.totalRecordedSpending !== undefined) {
          setTotalExpenses(Number(active.totalRecordedSpending) || 0)
        }
      } else {
        const stored = localStorage.getItem('weddingos_active_wedding')
        if (stored) {
          const parsed = JSON.parse(stored)
          setWedding(parsed)
        }
      }

      const activeWeddingId = active?.id || 1

      // 2. Load Tasks (from API or local cache)
      const tasksRes = await tasksApi.getAll(activeWeddingId).catch(() => null)
      if (tasksRes && Array.isArray(tasksRes) && tasksRes.length > 0) {
        setTasks(
          tasksRes.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority || 'MEDIUM',
            due: t.dueDate || 'Soon',
            completed: t.status === 'COMPLETED',
            ceremony: 'General',
          }))
        )
      } else {
        const localTasksRaw = localStorage.getItem(`weddingos_${activeWeddingId}_tasks`)
        if (localTasksRaw) {
          try {
            const parsed = JSON.parse(localTasksRaw)
            if (Array.isArray(parsed)) {
              setTasks(
                parsed.map((t: any) => ({
                  id: t.id,
                  title: t.title,
                  priority: t.priority || 'MEDIUM',
                  due: t.dueDate || 'Soon',
                  completed: t.status === 'COMPLETED' || t.completed,
                  ceremony: t.relatedCeremony || 'General',
                }))
              )
            }
          } catch {}
        } else {
          setTasks([])
        }
      }

      // 3. Load Events (from API or local cache)
      const eventsRes = await eventsApi.getAll(activeWeddingId).catch(() => null)
      if (eventsRes && Array.isArray(eventsRes) && eventsRes.length > 0) {
        setEvents(
          eventsRes.map((e) => ({
            id: e.id,
            name: e.name,
            dayLabel: e.dayLabel || 'Ceremony',
            startTime: e.startTime,
            endTime: e.endTime,
            venueName: e.venueName,
            dressCode: e.dressCode,
            imageUrl: e.imageUrl,
            eventDate: e.eventDate,
          }))
        )
      } else {
        const localEventsRaw = localStorage.getItem(`weddingos_${activeWeddingId}_events`)
        if (localEventsRaw) {
          try {
            const parsed = JSON.parse(localEventsRaw)
            if (Array.isArray(parsed)) setEvents(parsed)
          } catch {}
        } else {
          setEvents([])
        }
      }

      // 4. Load Guest / RSVP Metrics from invitation store
      const invitations = getInvitations(activeWeddingId)
      const totalInvitedFamilies = invitations.length
      const confirmedGuests = invitations.reduce((acc, inv) => {
        if (inv.rsvpStatus === 'ATTENDING') {
          return acc + (inv.actualAttendees || inv.maxAttendees || 1)
        }
        return acc
      }, 0)
      const pendingFamilies = invitations.filter((inv) => inv.rsvpStatus === 'PENDING').length
      const capacity =
        active?.expectedGuestCapacity ||
        invitations.reduce((acc, inv) => acc + (inv.maxAttendees || 1), 0)

      setGuestMetrics({
        totalInvitedFamilies,
        confirmedGuests,
        pendingFamilies,
        capacity,
      })

      // 5. Load Expenses
      const expRes: any = await expensesApi.getAll(activeWeddingId).catch(() => null)
      if (expRes && expRes.expenses && Array.isArray(expRes.expenses)) {
        const sum = expRes.expenses.reduce(
          (acc: number, curr: any) => acc + (Number(curr.actualAmount) || Number(curr.plannedAmount) || 0),
          0
        )
        setTotalExpenses(sum)
      } else {
        const localExpRaw = localStorage.getItem(`weddingos_${activeWeddingId}_expenses`)
        if (localExpRaw) {
          try {
            const parsed = JSON.parse(localExpRaw)
            if (Array.isArray(parsed)) {
              const sum = parsed.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0)
              setTotalExpenses(sum)
            }
          } catch {}
        }
      }

      // 6. Load Gallery photos metrics
      const galleryRes: any = await galleryApi.getAll(activeWeddingId).catch(() => null)
      if (galleryRes && Array.isArray(galleryRes)) {
        const pending = galleryRes.filter((p) => p.status === 'PENDING' || p.moderationStatus === 'PENDING').length
        const approved = galleryRes.filter((p) => p.status === 'APPROVED' || p.moderationStatus === 'APPROVED').length
        setPhotoMetrics({ pendingCount: pending, approvedCount: approved })
      } else {
        const localPhotosRaw = localStorage.getItem('weddingos_gallery_photos')
        if (localPhotosRaw) {
          try {
            const parsed = JSON.parse(localPhotosRaw)
            if (Array.isArray(parsed)) {
              const pending = parsed.filter((p: any) => p.status === 'PENDING').length
              const approved = parsed.filter((p: any) => p.status === 'APPROVED').length
              setPhotoMetrics({ pendingCount: pending, approvedCount: approved })
            }
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Dashboard data loader error:', err)
    }
  }

  useEffect(() => {
    loadAllDashboardData()

    const handleUpdate = () => {
      loadAllDashboardData()
    }
    window.addEventListener('weddingos_wedding_updated', handleUpdate)
    window.addEventListener('weddingos_invitations_updated', handleUpdate)
    window.addEventListener('weddingos_members_updated', handleUpdate)

    return () => {
      window.removeEventListener('weddingos_wedding_updated', handleUpdate)
      window.removeEventListener('weddingos_invitations_updated', handleUpdate)
      window.removeEventListener('weddingos_members_updated', handleUpdate)
    }
  }, [])

  // Live countdown timer calculation
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!wedding.weddingDate) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const parsed = new Date(
        wedding.weddingDate.includes('T') ? wedding.weddingDate : `${wedding.weddingDate}T10:00:00`
      ).getTime()

      if (isNaN(parsed)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const now = new Date().getTime()
      const diff = parsed - now

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [wedding.weddingDate])

  const toggleTask = (id: string | number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  // Master Reset All Data Handler
  const handleResetAllData = async () => {
    setIsResetting(true)
    const wid = wedding.id || 1
    try {
      // 1. Reset in MySQL backend
      try {
        await workspacesApi.reset(wid)
      } catch (err) {
        console.warn('Backend reset call encountered error, proceeding with local clean:', err)
      }

      // 2. Clear all related localStorage items for this wedding
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

      // 3. Clear store demo caches
      resetToDemoData()
      resetMembershipDemoData(wid)

      // 4. Explicitly seed clean blank states so no stale fallbacks reload
      const cleanWedding = {
        id: wid,
        brideName: '',
        groomName: '',
        weddingDate: '',
        locationName: '',
        city: '',
        venueName: '',
        totalBudgetTarget: 0,
        expectedGuestCapacity: 0,
      }
      localStorage.setItem('weddingos_active_wedding', JSON.stringify(cleanWedding))
      localStorage.setItem(`weddingos_${wid}_events`, '[]')
      localStorage.setItem(`weddingos_${wid}_expenses`, '[]')
      localStorage.setItem(`weddingos_${wid}_tasks`, '[]')
      localStorage.setItem(`weddingos_${wid}_vendors`, '[]')
      localStorage.setItem('weddingos_gallery_photos', '[]')
      localStorage.setItem('weddingos_workspace_members', '[]')
      localStorage.setItem('weddingos_family_invitations', '[]')

      // 5. Reset local React states
      setWedding(cleanWedding)
      setTasks([])
      setEvents([])
      setTotalExpenses(0)
      setGuestMetrics({
        totalInvitedFamilies: 0,
        confirmedGuests: 0,
        pendingFamilies: 0,
        capacity: 0,
      })
      setPhotoMetrics({
        pendingCount: 0,
        approvedCount: 0,
      })

      // 6. Trigger notifications & close modal
      window.dispatchEvent(new Event('weddingos_wedding_updated'))
      window.dispatchEvent(new Event('weddingos_invitations_updated'))
      window.dispatchEvent(new Event('weddingos_members_updated'))

      setIsResetModalOpen(false)
      showToast('All workspace data has been reset to a clean slate in the database.')
    } catch (err: any) {
      console.error('Failed to reset all data:', err)
      showToast('Reset failed: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsResetting(false)
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const hasCoupleDetails = Boolean(wedding.brideName?.trim() || wedding.groomName?.trim())
  const weddingDisplayName = hasCoupleDetails
    ? `${wedding.brideName} & ${wedding.groomName}`
    : 'Your Sacred Wedding'

  const formattedDate = wedding.weddingDate
    ? new Date(
        wedding.weddingDate.includes('T') ? wedding.weddingDate : `${wedding.weddingDate}T10:00:00`
      ).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date Not Set Yet'

  const locationDisplay =
    wedding.venueName && wedding.city
      ? `${wedding.venueName}, ${wedding.city}`
      : wedding.venueName || wedding.city || wedding.locationName || 'Location Not Set'

  const budgetUtilization =
    wedding.totalBudgetTarget && wedding.totalBudgetTarget > 0
      ? Math.min(100, Math.round((totalExpenses / wedding.totalBudgetTarget) * 100))
      : 0

  const rsvpPercentage =
    guestMetrics.capacity > 0
      ? Math.min(100, Math.round((guestMetrics.confirmedGuests / guestMetrics.capacity) * 100))
      : 0

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#4b030e] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#e6bd81] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================= */}
      {/* TOP COUNTDOWN & ROYAL PALACE HERO BANNER  */}
      {/* ========================================= */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-[#e6bd81]/50 shadow-gold group min-h-[300px] flex flex-col justify-between p-6 sm:p-8 lg:p-10">
        {/* Background Palace Image with Rich Cinematic Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/dashboard-hero.jpg"
            alt="Royal Palace Mandap Pavilion"
            className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Subtle gradient scrims for contrast without hiding the royal architecture */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/70 sm:from-black/80 sm:via-transparent sm:to-black/60" />
        </div>

        {/* Top Header Row: Live Pill & Reset Button */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-[#e6bd81]/50 text-xs font-semibold uppercase tracking-widest text-[#e6bd81] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <Clock className="w-3.5 h-3.5" />
            <span>Ceremonial Countdown</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/70 hover:bg-red-900/90 active:scale-95 text-rose-200 hover:text-white backdrop-blur-md border border-rose-500/50 text-xs font-semibold transition-all shadow-sm cursor-pointer"
              title="Reset all dummy and active workspace data to a clean blank slate"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Data</span>
            </button>

            <Link
              to="/app/profile"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/95 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[#e6bd81]" />
              <span>Wedding Profile</span>
            </Link>
          </div>
        </div>

        {/* Center: Couple Names & Ceremony Details */}
        <div className="relative z-10 my-4 space-y-2">
          {hasCoupleDetails ? (
            <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight text-white tracking-wide drop-shadow-lg">
              {weddingDisplayName}
            </h1>
          ) : (
            <div className="space-y-1">
              <h1 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white tracking-wide drop-shadow-lg">
                Welcome to WeddingOS
              </h1>
              <p className="text-xs sm:text-sm text-[#e6bd81] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill in your Bride &amp; Groom details in Settings to personalize your royal countdown.</span>
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-stone-200 font-sans drop-shadow">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#e6bd81]" />
              <span className="font-medium text-white">{formattedDate}</span>
            </span>
            <span className="text-[#e6bd81]">&bull;</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#e6bd81]" />
              <span>{locationDisplay}</span>
            </span>
          </div>
        </div>

        {/* Bottom Row: Live Second-by-Second Countdown & Action Button */}
        <div className="relative z-10 pt-5 border-t border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Days */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-black/50 backdrop-blur-md border border-[#e6bd81]/40 text-center min-w-[66px] sm:min-w-[76px] shadow-lg">
              <span className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-[#e6bd81] block leading-none tabular-nums drop-shadow">
                {timeLeft.days}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-white/80 tracking-widest mt-1 block">
                Days
              </span>
            </div>

            <span className="text-xl sm:text-2xl font-light text-[#e6bd81]/60 -mt-2">:</span>

            {/* Hours */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-black/50 backdrop-blur-md border border-[#e6bd81]/40 text-center min-w-[66px] sm:min-w-[76px] shadow-lg">
              <span className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-white block leading-none tabular-nums drop-shadow">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-white/80 tracking-widest mt-1 block">
                Hours
              </span>
            </div>

            <span className="text-xl sm:text-2xl font-light text-[#e6bd81]/60 -mt-2">:</span>

            {/* Mins */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-black/50 backdrop-blur-md border border-[#e6bd81]/40 text-center min-w-[66px] sm:min-w-[76px] shadow-lg">
              <span className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-white block leading-none tabular-nums drop-shadow">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-white/80 tracking-widest mt-1 block">
                Mins
              </span>
            </div>

            <span className="text-xl sm:text-2xl font-light text-[#e6bd81]/60 -mt-2">:</span>

            {/* Secs */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-[#e6bd81]/25 backdrop-blur-md border border-[#e6bd81]/70 text-center min-w-[66px] sm:min-w-[76px] shadow-gold ring-1 ring-[#e6bd81]/50">
              <span className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-[#e6bd81] block leading-none tabular-nums drop-shadow">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-white tracking-widest mt-1 block">
                Secs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!hasCoupleDetails ? (
              <Link to="/app/profile" className="w-full sm:w-auto">
                <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Setup Wedding Details
                </Button>
              </Link>
            ) : (
              <Link to="/app/events" className="shrink-0 w-full sm:w-auto">
                <button className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/30 text-white text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 group/btn cursor-pointer">
                  <span>View Ceremony Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#e6bd81] group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* QUICK ACTIONS BAR                         */}
      {/* ========================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl gold-border shadow-2xs">
        <div className="flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full bg-[#b88444]" />
          <span className="text-xs font-bold text-[#4b030e] uppercase tracking-wider">
            Quick Actions:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/app/events">
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Ceremony
            </Button>
          </Link>
          <Link to="/app/tasks">
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Task
            </Button>
          </Link>
          <Link to="/app/invitations">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Invite Family
            </Button>
          </Link>
          <Link to="/app/check-in">
            <Button variant="gold" size="sm" leftIcon={<QrCode className="w-3.5 h-3.5" />}>
              Check-In Mode
            </Button>
          </Link>
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-700 border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Data</span>
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* 4 CORE METRIC CARDS                       */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: RSVP Attendance */}
        <Link to="/app/invitations" className="block">
          <Card hoverEffect className="relative overflow-hidden h-full">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#fbe6e9] flex items-center justify-center text-[#6f0617]">
                  <Users2 className="w-5 h-5" />
                </div>
                <Badge variant={guestMetrics.confirmedGuests > 0 ? 'success' : 'neutral'} size="sm">
                  {guestMetrics.capacity > 0 ? `${rsvpPercentage}% Confirmed` : 'No Capacity Set'}
                </Badge>
              </div>
              <div>
                <span className="text-xs text-[#4b030e]/70 font-medium block">
                  RSVP Attendance
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-sans text-2xl sm:text-3xl font-bold text-[#4b030e] tabular-nums">
                    {guestMetrics.confirmedGuests}
                  </span>
                  <span className="text-xs text-[#4b030e]/60 font-sans">
                    / {guestMetrics.capacity > 0 ? `${guestMetrics.capacity} capacity` : '0 set'}
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#faf9f6] border border-[#e6bd81]/40 overflow-hidden">
                <div
                  className="h-full bg-[#6f0617] rounded-full transition-all duration-500"
                  style={{ width: `${rsvpPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#4b030e]/75 pt-1">
                <span>{guestMetrics.totalInvitedFamilies} Families Invited</span>
                <span className="font-semibold text-[#6f0617]">
                  {guestMetrics.pendingFamilies} Pending
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 2: Preparation Tasks */}
        <Link to="/app/tasks" className="block">
          <Card hoverEffect className="h-full">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#fdfaf2] flex items-center justify-center text-[#b88444]">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <Badge variant="gold" size="sm">
                  {tasks.length > 0 ? `${Math.round((completedCount / tasks.length) * 100)}% Done` : '0 Tasks'}
                </Badge>
              </div>
              <div>
                <span className="text-xs text-[#4b030e]/70 font-medium block">
                  Preparation Tasks
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-sans text-2xl sm:text-3xl font-bold text-[#4b030e] tabular-nums">
                    {completedCount} of {tasks.length}
                  </span>
                  <span className="text-xs text-[#4b030e]/60 font-sans">
                    Completed
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#faf9f6] border border-[#e6bd81]/40 overflow-hidden">
                <div
                  className="h-full bg-[#b88444] rounded-full transition-all duration-300"
                  style={{
                    width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%',
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#4b030e]/75 pt-1">
                <span>{tasks.length - completedCount} Incomplete</span>
                <span className="font-semibold text-[#6f0617]">
                  {tasks.filter((t) => t.priority === 'HIGH' && !t.completed).length} High Priority
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 3: Budget & Expenses */}
        <Link to="/app/expenses" className="block">
          <Card hoverEffect className="h-full">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#fbe6e9] flex items-center justify-center text-[#6f0617]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <Badge variant="neutral" size="sm">INR (₹)</Badge>
              </div>
              <div>
                <span className="text-xs text-[#4b030e]/70 font-medium block">
                  Expenses Recorded
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-sans text-2xl sm:text-3xl font-bold text-[#4b030e] tabular-nums">
                    ₹{totalExpenses.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#faf9f6] border border-[#e6bd81]/40 overflow-hidden">
                <div
                  className="h-full bg-[#6f0617] rounded-full transition-all duration-500"
                  style={{ width: `${budgetUtilization}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#4b030e]/75 pt-1">
                <span>
                  Budget: ₹{(wedding.totalBudgetTarget || 0).toLocaleString('en-IN')}
                </span>
                <span className="font-semibold text-emerald-700">
                  {budgetUtilization}% utilized
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 4: Moderated Photos */}
        <Link to="/app/gallery" className="block">
          <Card hoverEffect className="h-full">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#fffbeb] flex items-center justify-center text-[#d97706]">
                  <Camera className="w-5 h-5" />
                </div>
                <Badge
                  variant={photoMetrics.pendingCount > 0 ? 'warning' : 'neutral'}
                  size="sm"
                >
                  {photoMetrics.pendingCount > 0 ? 'Pending Review' : 'Up to Date'}
                </Badge>
              </div>
              <div>
                <span className="text-xs text-[#4b030e]/70 font-medium block">
                  Photo Moderation Queue
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-sans text-2xl sm:text-3xl font-bold text-[#a5172a] tabular-nums">
                    {photoMetrics.pendingCount}
                  </span>
                  <span className="text-xs text-[#4b030e]/60 font-sans">
                    Pending
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#faf9f6] border border-[#e6bd81]/40 overflow-hidden">
                <div
                  className="h-full bg-[#d97706] rounded-full transition-all duration-300"
                  style={{
                    width:
                      photoMetrics.pendingCount + photoMetrics.approvedCount > 0
                        ? `${(photoMetrics.pendingCount / (photoMetrics.pendingCount + photoMetrics.approvedCount)) * 100}%`
                        : '0%',
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-[#4b030e]/75">
                  {photoMetrics.approvedCount} Approved Live
                </span>
                <span className="font-semibold text-[#6f0617] hover:underline">
                  Manage Gallery &rarr;
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ========================================= */}
      {/* 2-COLUMN MAIN BODY: TIMELINE & TASKS      */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upcoming Ceremonies Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-cormorant text-2xl font-bold text-[#4b030e]">
              Ceremony Schedule
            </h2>
            <Link to="/app/events" className="text-xs font-semibold text-[#6f0617] hover:underline flex items-center gap-1">
              <span>View All Events ({events.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="space-y-3.5">
              {events.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-white gold-border shadow-2xs hover:shadow-gold-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#e6bd81]/50 shadow-2xs bg-[#faf9f6] flex items-center justify-center">
                      {evt.imageUrl ? (
                        <img
                          src={evt.imageUrl}
                          alt={evt.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Calendar className="w-6 h-6 text-[#b88444]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-1 inset-x-0 text-center text-[9px] font-bold text-white uppercase tracking-wider">
                        {evt.eventDate ? evt.eventDate.slice(5) : 'Event'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-sans text-sm font-bold text-[#4b030e] group-hover:text-[#6f0617] transition-colors">
                        {evt.name}
                      </h4>
                      <p className="text-xs text-[#4b030e]/70 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-[#b88444]" />
                        <span>
                          {evt.startTime || 'TBD'} - {evt.endTime || 'TBD'}
                        </span>
                        {evt.venueName && (
                          <>
                            <span>&bull;</span>
                            <MapPin className="w-3 h-3 text-[#b88444]" />
                            <span className="truncate max-w-[180px]">{evt.venueName}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  {evt.dressCode && (
                    <Badge variant="gold" size="sm">{evt.dressCode}</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl gold-border p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#fdfaf2] text-[#b88444] border border-[#e6bd81]/50 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-cormorant text-xl font-bold text-[#4b030e]">
                No Ceremonies Planned Yet
              </h3>
              <p className="text-xs text-[#4b030e]/70 max-w-sm mx-auto">
                You currently have a clean schedule. Add your Haldi, Mehendi, Sangeet, Pheras, or Reception ceremonies to begin building your itinerary.
              </p>
              <div className="pt-2">
                <Link to="/app/events">
                  <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add Your First Ceremony
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Urgent Preparation Tasks (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-cormorant text-2xl font-bold text-[#4b030e]">
              Checklist &amp; To-Dos
            </h2>
            <Link to="/app/tasks" className="text-xs font-semibold text-[#6f0617] hover:underline flex items-center gap-1">
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="shadow-2xs border-[#e6bd81]/50">
            <CardContent className="p-4 space-y-3">
              {tasks.length > 0 ? (
                <>
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        task.completed
                          ? 'bg-[#faf9f6] border-stone-200/80 opacity-70'
                          : 'bg-white border-[#e6bd81]/40 hover:border-[#b88444]'
                      }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-[#6f0617] border-[#6f0617] text-white'
                            : 'border-[#e6bd81] hover:border-[#6f0617]'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium leading-snug truncate ${
                            task.completed ? 'line-through text-stone-500' : 'text-[#4b030e]'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                          {task.ceremony && (
                            <>
                              <span className="text-[#4b030e]/60">{task.ceremony}</span>
                              <span>&bull;</span>
                            </>
                          )}
                          <span className="text-[#b88444] font-medium">Due {task.due}</span>
                          {task.priority === 'HIGH' && (
                            <span className="px-1.5 py-0.2 rounded bg-[#fef2f2] text-[#a5172a] font-bold">
                              HIGH
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <Link to="/app/tasks" className="w-full">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-[#6f0617]">
                        + Add New Preparation Task
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center space-y-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#fdfaf2] text-[#b88444] border border-[#e6bd81]/50 flex items-center justify-center mx-auto">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <h4 className="font-sans text-sm font-bold text-[#4b030e]">
                    No Tasks Added Yet
                  </h4>
                  <p className="text-xs text-[#4b030e]/70">
                    Keep your wedding on track by adding your personalized to-do list.
                  </p>
                  <div className="pt-2">
                    <Link to="/app/tasks">
                      <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                        Add First Task
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RESET ALL DATA CONFIRMATION MODAL                                         */}
      {/* ========================================= */}
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
                This will reset everything to a <strong>completely fresh clean slate</strong>. All ceremonies, tasks, budget expenses, vendors, guest invitations, check-in logs, and gallery photos will be removed from both this device and your cloud database.
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left text-[11px] text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  After resetting, no dummy data will be shown. You will be able to add and customize all your own details manually.
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetAllData}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Resetting Workspace...' : 'Yes, Reset All Data'}</span>
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
