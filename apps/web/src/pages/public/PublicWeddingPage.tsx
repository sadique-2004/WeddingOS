import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Sparkles,
  Heart,
  Video,
  Shirt,
  Share2,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react'
import type { PublicWebsiteConfig } from '../../types/website'
import { websiteApi } from '../../services/apiClient'
export type { PublicWebsiteConfig } from '../../types/website'

const DEFAULT_CONFIG: PublicWebsiteConfig = {
  slug: 'my-wedding',
  themeKey: 'CLASSIC_INDIAN',
  brideName: '',
  groomName: '',
  weddingDate: '',
  locationName: '',
  welcomeHeadline: 'Together with our families, we invite you to celebrate our union',
  welcomeMessage:
    'With the blessings of our elders and loved ones, we joyfully invite you to celebrate our union.',
  isPublished: true,
  showSchedule: true,
  showDressCode: true,
  showVenues: true,
  showLivestream: false,
  livestreamUrl: '',
  coverPhoto: '/events/pheras.jpg',
}

const CEREMONIES = [
  {
    name: 'Haldi & Phoolon Ki Holi',
    dayLabel: 'Day 1 • Morning',
    time: '10:30 AM – 01:30 PM',
    date: 'Feb 16, 2027',
    venue: 'The Courtyard Mandap, Udaivilas',
    dressCode: 'Shades of Marigold Yellow & Mustard Bandhani',
    image: '/events/haldi.jpg',
    description: 'Turmeric paste blessings, sweet lassi, and lively Mangal Geet with fresh petal showers.',
  },
  {
    name: 'Mehendi & High Tea Sundowner',
    dayLabel: 'Day 1 • Afternoon',
    time: '04:00 PM – 08:00 PM',
    date: 'Feb 16, 2027',
    venue: 'Poolside Promenade & Royal Verandah',
    dressCode: 'Boho Pastel Florals & Mint Greens',
    image: '/events/mehendi.jpg',
    description: 'Intricate bridal henna sessions, artisanal chaat counters, and lakeside acoustic folk tunes.',
  },
  {
    name: 'Sangeet & Cocktail Soiree',
    dayLabel: 'Day 2 • Evening',
    time: '07:30 PM onwards',
    date: 'Feb 17, 2027',
    venue: 'The Royal Crescent Ballroom',
    dressCode: 'Indo-Western Glitz, Sequin Sarees & Bandhgalas',
    image: '/events/sangeet.jpg',
    description: 'Choreographed Bollywood family performances, awards ceremony, live Sufi band, and late-night DJ sets.',
  },
  {
    name: 'Baraat, Vedic Vivah & Pheras',
    dayLabel: 'Day 3 • Twilight',
    time: '04:30 PM – 08:30 PM',
    date: 'Feb 18, 2027',
    venue: 'Lakeside Lotus Pavilion & Floral Mandap',
    dressCode: 'Traditional Royal Silks, Banarasi Lehengas & Sherwanis',
    image: '/events/pheras.jpg',
    description: 'Royal vintage car arrival, sacred Sanskrit mantras, seven holy vows, and evening Sindoor rituals.',
  },
  {
    name: 'Grand Royal Reception & Dinner',
    dayLabel: 'Day 3 • Night',
    time: '09:00 PM onwards',
    date: 'Feb 18, 2027',
    venue: 'Mewar Banquet Lawns & Mirror Palace',
    dressCode: 'Formal Black Tie & Haute Couture Gowns',
    image: '/events/reception.jpg',
    description: 'Royal 7-course sit-down dinner feast, champagne toast, live orchestra symphony, and midnight lake fireworks.',
  },
]

// Real-time calculation helper
function calculateTimeLeft(dateString: string) {
  try {
    const target = new Date(dateString).getTime()
    const now = new Date().getTime()
    const diff = Math.max(0, target - now)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    const seconds = Math.floor((diff / 1000) % 60)
    return { days, hours, minutes, seconds }
  } catch {
    return { days: 120, hours: 14, minutes: 22, seconds: 45 }
  }
}

export default function PublicWeddingPage({
  previewConfig,
  isMobileView,
}: {
  previewConfig?: PublicWebsiteConfig
  isMobileView?: boolean
}) {
  const { slug } = useParams()
  const [config, setConfig] = useState<PublicWebsiteConfig>(() => {
    if (previewConfig) return previewConfig
    try {
      const stored = localStorage.getItem('weddingos_website_config')
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG
  })

  const [copiedLink, setCopiedLink] = useState(false)

  // Responsive window width detector for real devices
  const [isWindowMobile, setIsWindowMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    return false
  })

  useEffect(() => {
    const check = () => setIsWindowMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Explicit prop overrides window measurement (crucial for Studio mobile phone frame preview)
  const isMobile = isMobileView !== undefined ? isMobileView : isWindowMobile

  // Real-time dynamic countdown state (Seconds live ticking)
  const [countdown, setCountdown] = useState(() => calculateTimeLeft(config.weddingDate))

  useEffect(() => {
    if (previewConfig) {
      setConfig(previewConfig)
      return
    }

    async function loadBackendData() {
      try {
        if (slug) {
          const publicData = await websiteApi.getPublic(slug).catch(() => null)
          if (publicData) {
            setConfig((prev) => ({
              ...prev,
              brideName: publicData.brideName || prev.brideName,
              groomName: publicData.groomName || prev.groomName,
              weddingDate: publicData.weddingDate || prev.weddingDate,
              locationName: publicData.venueName || publicData.city || prev.locationName,
              themeKey: (publicData.themeKey as any) || prev.themeKey,
              welcomeHeadline: publicData.welcomeHeadline || prev.welcomeHeadline,
              welcomeMessage: publicData.welcomeMessage || prev.welcomeMessage,
              isPublished: publicData.isPublished !== undefined ? publicData.isPublished : prev.isPublished,
              showSchedule: publicData.showSchedule !== undefined ? publicData.showSchedule : prev.showSchedule,
              showDressCode: publicData.showDressCode !== undefined ? publicData.showDressCode : prev.showDressCode,
              showVenues: publicData.showVenues !== undefined ? publicData.showVenues : prev.showVenues,
              showLivestream: publicData.showLivestream !== undefined ? publicData.showLivestream : prev.showLivestream,
              livestreamUrl: publicData.livestreamUrl || prev.livestreamUrl,
              slug: publicData.slug || slug,
            }))
            return
          }
        }

        // Unknown or missing slug: do not fall back to another wedding's data (previously wedding 1).
      } catch (err) {
        console.warn('Could not load public wedding data from backend:', err)
      }
    }

    loadBackendData()
  }, [slug, previewConfig])

  // Continuous real-time countdown timer that ticks every 1 second
  useEffect(() => {
    setCountdown(calculateTimeLeft(config.weddingDate))
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft(config.weddingDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [config.weddingDate])

  // Theme Styles Dictionary
  const themeStyles = {
    CLASSIC_INDIAN: {
      bodyBg: 'bg-[#faf7f2]',
      primaryColor: '#4b030e',
      accentColor: '#b88444',
      heroGradient: 'from-[#220106]/95 via-[#4b030e]/80 to-black/40',
      fontHead: 'font-cormorant',
      cardBg: 'bg-white',
      borderColor: 'border-[#e6bd81]/40',
      badgeBg: 'bg-[#fdf5ea] text-[#85531d] border-[#e6bd81]/40',
      heroSubtitle: 'text-[#e6bd81]',
    },
    MINIMAL_ELEGANT: {
      bodyBg: 'bg-[#fcfbf9]',
      primaryColor: '#1c1917',
      accentColor: '#78716c',
      heroGradient: 'from-stone-950/95 via-stone-900/80 to-black/40',
      fontHead: 'font-serif',
      cardBg: 'bg-white',
      borderColor: 'border-stone-200',
      badgeBg: 'bg-stone-100 text-stone-800 border-stone-300',
      heroSubtitle: 'text-stone-300',
    },
    MODERN_CELEBRATION: {
      bodyBg: 'bg-[#0b1329]',
      primaryColor: '#e2e8f0',
      accentColor: '#e6bd81',
      heroGradient: 'from-[#060b18]/95 via-[#0b1329]/85 to-black/50',
      fontHead: 'font-cormorant',
      cardBg: 'bg-[#121c38]',
      borderColor: 'border-amber-400/30',
      badgeBg: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
      heroSubtitle: 'text-amber-300',
    },
  }[config.themeKey] || {
    bodyBg: 'bg-[#faf7f2]',
    primaryColor: '#4b030e',
    accentColor: '#b88444',
    heroGradient: 'from-[#220106]/95 via-[#4b030e]/80 to-black/40',
    fontHead: 'font-cormorant',
    cardBg: 'bg-white',
    borderColor: 'border-[#e6bd81]/40',
    badgeBg: 'bg-[#fdf5ea] text-[#85531d] border-[#e6bd81]/40',
    heroSubtitle: 'text-[#e6bd81]',
  }

  const isDarkTheme = config.themeKey === 'MODERN_CELEBRATION'

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  if (!config.isPublished && !previewConfig) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#e6bd81]/40 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-cormorant text-3xl font-bold text-[#3a0208]">
            Website in Private Draft Mode
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            The couple’s public wedding portal is currently undergoing final ceremonial touches by the organizers. Please check back shortly or access via your private invitation card.
          </p>
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6f0617] text-white text-xs font-semibold shadow-xs"
          >
            <span>Organizer Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeStyles.bodyBg} font-sans antialiased transition-colors duration-500 overflow-x-hidden w-full`}>

      {/* ======================================================== */}
      {/* 1. HERO BANNER (100% VIEWPORT HEIGHT & WIDTH)             */}
      {/* ======================================================== */}
      <section className="relative w-full h-screen min-h-screen flex flex-col items-center justify-center text-center px-3 sm:px-6 overflow-hidden">
        {/* Cover Image Container */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Ambient blurred backdrop for Mobile (fills 100% height with matching royal warmth) */}
          {isMobile && (
            <img
              src={config.coverPhoto || '/events/pheras.jpg'}
              alt=""
              className="w-full h-full object-cover blur-3xl opacity-50 scale-110"
            />
          )}

          {/* Main Cover Image: FULL uncropped image on Mobile (object-contain), Full-bleed on Desktop (object-cover) */}
          <img
            src={config.coverPhoto || '/events/pheras.jpg'}
            alt="Royal Wedding Celebration"
            className={`w-full h-full transition-all duration-700 ${isMobile
                ? 'object-contain object-center scale-100'
                : 'object-cover object-center scale-105'
              }`}
          />
        </div>

        {/* Cinematic Backdrop Overlays */}
        <div className={`absolute inset-0 ${isMobile ? 'bg-gradient-to-t from-black/85 via-black/40 to-black/20' : `bg-gradient-to-t ${themeStyles.heroGradient}`}`} />
        <div className="absolute inset-0 bg-radial from-transparent via-black/25 to-black/60 pointer-events-none" />

        {/* -------------------------------------------------------- */}
        {/* DESKTOP HERO CONTENT (!isMobile - UNTOUCHED GRAND SCALE) */}
        {/* -------------------------------------------------------- */}
        {!isMobile && (
          <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6 pt-4 pb-12 text-white px-4">
            {/* Subtle Royal Crest Pill */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs uppercase tracking-widest font-semibold ${themeStyles.heroSubtitle} shadow-lg`}>
              <Sparkles className="w-3.5 h-3.5 text-[#e6bd81]" />
              <span>The Wedding Celebration Of</span>
            </div>

            {/* Couple Names Headline - Large & Grand */}
            <h1 className={`${themeStyles.fontHead} text-6xl md:text-7xl lg:text-8xl font-normal leading-tight tracking-tight drop-shadow-xl text-white text-center`}>
              {config.brideName} &amp; {config.groomName}
            </h1>

            {/* Date & Destination Venue - Single Horizontal Line with Bullet */}
            <div className="flex items-center justify-center gap-3 text-lg text-white/95 font-sans font-medium drop-shadow-md">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#e6bd81]" />
                <span>{new Date(config.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </span>
              <span className="text-white/60">&bull;</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#e6bd81]" />
                <span>{config.locationName}</span>
              </span>
            </div>

            {/* Large Desktop Real-time Countdown */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[10px] text-white/90 font-medium mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Ceremonial Countdown</span>
              </div>

              <div className="flex justify-center">
                <div className="inline-flex items-center bg-black/70 backdrop-blur-2xl p-2.5 rounded-3xl border border-white/25 shadow-2xl divide-x divide-white/15">
                  {/* Days */}
                  <div className="flex flex-col items-center px-4 py-2 select-none">
                    <div className="relative w-20 h-22 rounded-2xl bg-gradient-to-b from-[#4a0713] to-[#2b0209] shadow-inner border border-white/20 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between px-2.5 pt-1.5 z-20">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                      </div>
                      <div key={countdown.days} className="animate-calendar-page-flip absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-sans font-bold text-4xl text-white tracking-tight tabular-nums drop-shadow-md">
                          {String(countdown.days).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/60 border-b border-white/15 z-10" />
                      <div className="h-1.5 w-full bg-black/30" />
                    </div>
                    <span className="mt-2 font-sans text-xs font-bold tracking-wider text-neutral-300 uppercase">Days</span>
                  </div>

                  {/* Hours */}
                  <div className="flex flex-col items-center px-4 py-2 select-none">
                    <div className="relative w-20 h-22 rounded-2xl bg-gradient-to-b from-[#5c0b19] to-[#36030c] shadow-inner border border-white/20 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between px-2.5 pt-1.5 z-20">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                      </div>
                      <div key={countdown.hours} className="animate-calendar-page-flip absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-sans font-bold text-4xl text-white tracking-tight tabular-nums drop-shadow-md">
                          {String(countdown.hours).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/60 border-b border-white/15 z-10" />
                      <div className="h-1.5 w-full bg-black/30" />
                    </div>
                    <span className="mt-2 font-sans text-xs font-bold tracking-wider text-neutral-300 uppercase">Hours</span>
                  </div>

                  {/* Minutes */}
                  <div className="flex flex-col items-center px-4 py-2 select-none">
                    <div className="relative w-20 h-22 rounded-2xl bg-gradient-to-b from-[#6e1020] to-[#42040f] shadow-inner border border-white/20 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between px-2.5 pt-1.5 z-20">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                      </div>
                      <div key={countdown.minutes} className="animate-calendar-page-flip absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-sans font-bold text-4xl text-white tracking-tight tabular-nums drop-shadow-md">
                          {String(countdown.minutes).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/60 border-b border-white/15 z-10" />
                      <div className="h-1.5 w-full bg-black/30" />
                    </div>
                    <span className="mt-2 font-sans text-xs font-bold tracking-wider text-neutral-300 uppercase">Mins</span>
                  </div>

                  {/* Seconds */}
                  <div className="flex flex-col items-center px-4 py-2 select-none">
                    <div className="relative w-20 h-22 rounded-2xl bg-gradient-to-b from-[#8b162a] to-[#540614] shadow-inner border border-amber-400/40 ring-1 ring-amber-400/30 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between px-2.5 pt-1.5 z-20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300/60 ring-1 ring-black/40" />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300/60 ring-1 ring-black/40" />
                      </div>
                      <div key={countdown.seconds} className="animate-calendar-page-flip absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-sans font-bold text-4xl text-amber-300 tracking-tight tabular-nums drop-shadow-md">
                          {String(countdown.seconds).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/60 border-b border-amber-300/20 z-10" />
                      <div className="h-1.5 w-full bg-black/30" />
                    </div>
                    <span className="mt-2 font-sans text-xs font-bold tracking-wider text-amber-300 uppercase">Secs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop CTAs */}
            <div className="pt-3 flex items-center justify-center gap-3">
              <a href="#story" className="px-6 py-3 rounded-full bg-[#6f0617] hover:bg-[#540411] text-white text-sm font-semibold shadow-xl transition-all hover:scale-105 flex items-center gap-1.5">
                <span>Explore Celebrations</span>
                <ChevronDown className="w-4 h-4" />
              </a>
              <Link
                to={config.slug ? `/gallery/${config.slug}` : '/gallery/royal-wedding'}
                className="px-5 py-3 rounded-full bg-gradient-to-r from-[#b88444] to-[#e6bd81] text-[#3a0208] text-sm font-bold shadow-xl transition-all hover:scale-105 flex items-center gap-1.5"
              >
                <span>📸 Live Guest Gallery</span>
              </Link>
              <button type="button" onClick={handleCopyShare} className="px-5 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-sm font-semibold transition-all flex items-center gap-1.5 shadow-lg">
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Portal'}</span>
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* MOBILE HERO CONTENT (isMobile - CLEAN, FITTED & SHORT)   */}
        {/* -------------------------------------------------------- */}
        {isMobile && (
          <div className="relative z-10 w-full max-w-[340px] mx-auto flex flex-col justify-between h-full py-3 text-white px-2">

            {/* Top Block: Mobile Badge, Couple Names, Date & Venue */}
            <div className="space-y-1.5 text-center shrink-0">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] uppercase tracking-wider font-semibold text-[#e6bd81] shadow-xs">
                <Sparkles className="w-2.5 h-2.5 text-[#e6bd81]" />
                <span>The Wedding Celebration Of</span>
              </div>

              {/* Mobile Couple Names - TIGHT SPACING, NO GAP */}
              <div className="text-center py-0.5">
                <h1 className={`${themeStyles.fontHead} text-3xl font-bold leading-tight tracking-normal text-white text-center`}>
                  <span>{config.brideName}</span>
                  <span className="text-[#e6bd81] font-light text-xl mx-1.5">&amp;</span>
                  <span>{config.groomName}</span>
                </h1>
              </div>

              {/* Mobile Date & Venue: TWO CLEAN SEPARATE LINES (NO BULLET) */}
              <div className="space-y-0.5 text-center font-sans text-xs text-white/90">
                {/* Line 1: Date */}
                <div className="flex items-center justify-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#e6bd81] shrink-0" />
                  <span>{new Date(config.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {/* Line 2: Venue */}
                <div className="flex items-center justify-center gap-1 font-medium text-white/80">
                  <MapPin className="w-3.5 h-3.5 text-[#e6bd81] shrink-0" />
                  <span className="truncate max-w-[260px]">{config.locationName}</span>
                </div>
              </div>
            </div>

            {/* Center Block: THE FULL UNCROPPED ROYAL WEDDING PHOTO SHOWCASE */}
            <div className="w-full my-auto py-1">
              <div className="relative w-full aspect-[16/10] max-h-[220px] rounded-2xl overflow-hidden border-2 border-[#e6bd81]/70 shadow-[0_12px_32px_rgba(0,0,0,0.7)] ring-1 ring-white/10 group bg-black/40">
                <img
                  src={config.coverPhoto && config.coverPhoto.trim() !== '' ? config.coverPhoto : '/events/pheras.jpg'}
                  alt={`${config.brideName} & ${config.groomName} Wedding`}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).src = '/events/pheras.jpg'
                  }}
                />
                {/* Royal Corner Filigree Accents */}
                <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#e6bd81] rounded-tl-xs pointer-events-none shadow-sm" />
                <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#e6bd81] rounded-tr-xs pointer-events-none shadow-sm" />
                <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#e6bd81] rounded-bl-xs pointer-events-none shadow-sm" />
                <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#e6bd81] rounded-br-xs pointer-events-none shadow-sm" />
                {/* Subtle depth vignette */}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Bottom Block: Mobile Short Timer & CTAs (COMPACT, SHORT HEIGHT, FITS ANY PHONE) */}
            <div className="space-y-2 shrink-0 pt-1">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[8px] text-white/90 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Countdown</span>
              </div>

              {/* Short Unified Container */}
              <div className="flex justify-center">
                <div className="inline-flex items-center bg-black/80 backdrop-blur-xl p-1 rounded-xl border border-white/20 shadow-xl divide-x divide-white/10">
                  {/* Days (Short) */}
                  <div className="flex flex-col items-center px-1.5 py-0.5 select-none">
                    <div className="relative w-8 h-9 rounded-md bg-gradient-to-b from-[#4a0713] to-[#2b0209] shadow-inner border border-white/20 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between px-1 pt-0.5 z-20">
                        <span className="w-0.5 h-0.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                        <span className="w-0.5 h-0.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                      </div>
                      <div key={countdown.days} className="animate-calendar-page-flip absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-sans font-bold text-xs text-white tracking-tight tabular-nums">
                          {String(countdown.days).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/60 border-b border-white/15 z-10" />
                      <div className="h-0.5 w-full bg-black/30" />
                    </div>
                    <span className="mt-0.5 font-sans text-[7px] font-bold text-neutral-300 uppercase">Days</span>
                  </div>

                  {/* Hours (Short) */}
                  <div className="flex flex-col items-center px-1.5 py-0.5 select-none">
                    <div className="relative w-8 h-9 rounded-md bg-gradient-to-b from-[#5c0b19] to-[#36030c] shadow-inner border border-white/20 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between px-1 pt-0.5 z-20">
                        <span className="w-0.5 h-0.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                        <span className="w-0.5 h-0.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                      </div>
                      <div key={countdown.hours} className="animate-calendar-page-flip absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-sans font-bold text-xs text-white tracking-tight tabular-nums">
                          {String(countdown.hours).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/60 border-b border-white/15 z-10" />
                      <div className="h-0.5 w-full bg-black/30" />
                    </div>
                    <span className="mt-0.5 font-sans text-[7px] font-bold text-neutral-300 uppercase">Hours</span>
                  </div>

                  {/* Mins (Short) */}
                  <div className="flex flex-col items-center px-1.5 py-0.5 select-none">
                    <div className="relative w-8 h-9 rounded-md bg-gradient-to-b from-[#6e1020] to-[#42040f] shadow-inner border border-white/20 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between px-1 pt-0.5 z-20">
                        <span className="w-0.5 h-0.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                        <span className="w-0.5 h-0.5 rounded-full bg-white/40 ring-1 ring-black/40" />
                      </div>
                      <div key={countdown.minutes} className="animate-calendar-page-flip absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-sans font-bold text-xs text-white tracking-tight tabular-nums">
                          {String(countdown.minutes).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/60 border-b border-white/15 z-10" />
                      <div className="h-0.5 w-full bg-black/30" />
                    </div>
                    <span className="mt-0.5 font-sans text-[7px] font-bold text-neutral-300 uppercase">Mins</span>
                  </div>

                  {/* Secs (Short) */}
                  <div className="flex flex-col items-center px-1.5 py-0.5 select-none">
                    <div className="relative w-8 h-9 rounded-md bg-gradient-to-b from-[#8b162a] to-[#540614] shadow-inner border border-amber-400/40 ring-1 ring-amber-400/30 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between px-1 pt-0.5 z-20">
                        <span className="w-0.5 h-0.5 rounded-full bg-amber-300/60 ring-1 ring-black/40" />
                        <span className="w-0.5 h-0.5 rounded-full bg-amber-300/60 ring-1 ring-black/40" />
                      </div>
                      <div key={countdown.seconds} className="animate-calendar-page-flip absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-sans font-bold text-xs text-amber-300 tracking-tight tabular-nums">
                          {String(countdown.seconds).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/60 border-b border-amber-300/20 z-10" />
                      <div className="h-0.5 w-full bg-black/30" />
                    </div>
                    <span className="mt-0.5 font-sans text-[7px] font-bold text-amber-300 uppercase">Secs</span>
                  </div>
                </div>
              </div>

              {/* Mobile Buttons */}
              <div className="pt-0.5 flex items-center justify-center gap-2">
                <a href="#story" className="px-4 py-1.5 rounded-full bg-[#6f0617] text-white text-[10px] font-semibold shadow-md flex items-center gap-1">
                  <span>Explore</span>
                  <ChevronDown className="w-3 h-3" />
                </a>
                <button type="button" onClick={handleCopyShare} className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-semibold flex items-center gap-1">
                  {copiedLink ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Animated Bouncing Scroll Indicator at exact bottom of 100vh */}
        <a
          href="#story"
          aria-label="Scroll to read wedding story"
          className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 text-white/70 hover:text-[#e6bd81] transition-colors animate-bounce cursor-pointer select-none"
        >
          <span className="text-[7px] sm:text-[9px] uppercase font-bold tracking-widest text-[#e6bd81] drop-shadow-sm">
            Scroll to explore
          </span>
          <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#e6bd81]" />
        </a>
      </section>

      {/* ========================================= */}
      {/* 2. WELCOME STORY MESSAGE                  */}
      {/* ========================================= */}
      <section id="story" className="py-16 sm:py-24 px-4 max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 scroll-mt-6">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${themeStyles.badgeBg}`}>
          <Heart className="w-3 h-3 text-[#6f0617]" />
          <span>Our Welcome Letter</span>
        </div>

        <h2 className={`${themeStyles.fontHead} text-2xl sm:text-4xl md:text-5xl font-normal leading-tight px-2 ${isDarkTheme ? 'text-white' : 'text-[#3a0208]'}`}>
          &ldquo;{config.welcomeHeadline}&rdquo;
        </h2>

        <p className={`text-xs sm:text-base leading-relaxed font-sans max-w-2xl mx-auto px-2 ${isDarkTheme ? 'text-neutral-300' : 'text-neutral-600'}`}>
          {config.welcomeMessage}
        </p>

        <div className="pt-2">
          <span className={`${themeStyles.fontHead} text-xl sm:text-2xl italic ${isDarkTheme ? 'text-[#e6bd81]' : 'text-[#85531d]'}`}>
            With eternal warmth, {config.brideName} &amp; {config.groomName}
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CEREMONY RUN OF SHOW                                                   */}
      {/* MOBILE: IMAGE ON TOP, CONTENT ON BOTTOM                                   */}
      {/* DESKTOP: REGAL 2-PART SPLIT CARD (PHOTO LEFT, CONTENT RIGHT)              */}
      {/* ========================================================================= */}
      {config.showSchedule && (
        <section id="schedule" className="py-12 sm:py-16 px-3 sm:px-6 max-w-5xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center space-y-2 sm:space-y-3 px-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${themeStyles.badgeBg}`}>
              <Sparkles className="w-3 h-3" />
              <span>Ceremonial Itinerary</span>
            </span>
            <h2 className={`${themeStyles.fontHead} text-2xl sm:text-4xl md:text-5xl font-normal ${isDarkTheme ? 'text-white' : 'text-[#3a0208]'}`}>
              Celebrations &amp; Festivities
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto ${isDarkTheme ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Please join us for each sacred ritual and high-energy celebration across our destination wedding.
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {CEREMONIES.map((event, index) => (
              <div
                key={event.name}
                className={`rounded-3xl overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-xl group ${themeStyles.cardBg}`}
                style={{
                  borderColor: isDarkTheme ? 'rgba(251, 191, 36, 0.3)' : 'rgba(230, 189, 129, 0.5)',
                }}
              >
                {/* ------------------------------------------------------------- */}
                {/* MOBILE VIEW: IMAGE ON TOP, CONTENT ON BOTTOM                  */}
                {/* ------------------------------------------------------------- */}
                {isMobile ? (
                  <div>
                    {/* Top: Ceremony Photo with Overlaid Tags */}
                    <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-neutral-900">
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                      {/* Top Badges on Mobile Image */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-[#e6bd81] text-[10px] font-bold tracking-wider uppercase">
                          Part 0{index + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#6f0617] text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                          {event.dayLabel}
                        </span>
                      </div>

                      {/* Bottom Date strip on image */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="font-semibold text-[#e6bd81] text-[11px] drop-shadow-sm">
                          {event.date}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Ceremonial Details & Venues on Mobile */}
                    <div className="p-4 sm:p-6 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#b88444]">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{event.time}</span>
                      </div>

                      <h3 className={`${themeStyles.fontHead} text-2xl font-bold leading-tight ${isDarkTheme ? 'text-white' : 'text-[#3a0208]'}`}>
                        {event.name}
                      </h3>

                      <p className={`text-xs leading-relaxed font-sans ${isDarkTheme ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        {event.description}
                      </p>

                      <div className="pt-2 space-y-2 border-t border-neutral-100 dark:border-neutral-800">
                        {/* Venue on Mobile */}
                        {config.showVenues && (
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${isDarkTheme ? 'bg-neutral-800/80 border-neutral-700 text-white' : 'bg-[#faf7f2] border-[#e6bd81]/30 text-neutral-800'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <MapPin className="w-4 h-4 text-[#6f0617] shrink-0" />
                              <span className="font-medium truncate text-[11px]">{event.venue}</span>
                            </div>
                            <a
                              href="https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-[#6f0617] hover:underline shrink-0 flex items-center gap-1"
                            >
                              <span>Map</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Dress Code on Mobile */}
                        {config.showDressCode && (
                          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                            <Shirt className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-900 shrink-0">Dress:</span>
                            <span className="text-[11px] font-medium truncate">{event.dressCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ------------------------------------------------------------- */
                  /* DESKTOP VIEW: REGAL SPLIT-CARD (PHOTO LEFT, DETAILS RIGHT)    */
                  /* ------------------------------------------------------------- */
                  <div className="grid grid-cols-12 gap-0 overflow-hidden">
                    {/* Event Photo (5 cols) */}
                    <div className="col-span-5 relative min-h-[300px] overflow-hidden bg-neutral-900">
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      {/* Sequence pill */}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold tracking-wider uppercase">
                          Part 0{index + 1}
                        </span>
                      </div>

                      {/* Day Label on photo */}
                      <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                        <span className="text-[11px] font-bold text-[#e6bd81] uppercase tracking-wider block">
                          {event.dayLabel}
                        </span>
                        <span className="text-xs text-white/90 font-medium">
                          {event.date}
                        </span>
                      </div>
                    </div>

                    {/* Event Details (7 cols) */}
                    <div className="col-span-7 p-7 lg:p-8 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#b88444]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{event.time}</span>
                        </div>

                        <h3 className={`${themeStyles.fontHead} text-2xl sm:text-3xl font-semibold leading-tight ${isDarkTheme ? 'text-white' : 'text-[#3a0208]'}`}>
                          {event.name}
                        </h3>

                        <p className={`text-xs sm:text-sm leading-relaxed ${isDarkTheme ? 'text-neutral-300' : 'text-neutral-600'}`}>
                          {event.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-neutral-100">
                        {/* Venue */}
                        {config.showVenues && (
                          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${isDarkTheme ? 'bg-neutral-800/60 border-neutral-700 text-white' : 'bg-[#faf7f2] border-[#e6bd81]/30 text-neutral-800'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <MapPin className="w-4 h-4 text-[#6f0617] shrink-0" />
                              <span className="font-semibold truncate">{event.venue}</span>
                            </div>
                            <a
                              href="https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-[#6f0617] hover:underline shrink-0 flex items-center gap-1"
                            >
                              <span>Directions</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Dress Code */}
                        {config.showDressCode && (
                          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <Shirt className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-900">Dress:</span>
                            <span className="text-[11px] font-medium">{event.dressCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================= */}
      {/* 4. LIVE CEREMONY STREAM                   */}
      {/* ========================================= */}
      {config.showLivestream && config.livestreamUrl && (
        <section className="py-12 sm:py-16 px-3 sm:px-4 max-w-4xl mx-auto text-center space-y-6">
          <div className="bg-gradient-to-r from-[#4b030e] to-[#6f0617] text-white p-6 sm:p-12 rounded-3xl border border-[#b88444]/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#e6bd81] text-[10px] font-bold uppercase tracking-widest">
              <Video className="w-3.5 h-3.5" />
              <span>International Family Broadcast</span>
            </div>

            <h3 className="font-cormorant text-2xl sm:text-4xl font-normal text-white">
              Watch The Live Wedding Ceremonies
            </h3>

            <p className="text-xs sm:text-sm text-white/80 max-w-lg mx-auto leading-relaxed">
              For beloved grandparents, relatives, and friends joining us virtually across continents, our private ceremony livestream will be active in 4K resolution.
            </p>

            <div className="pt-2">
              <a
                href={config.livestreamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-[#e6bd81] text-[#3a0208] text-xs sm:text-sm font-bold shadow-md hover:bg-white transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Open Live Ceremony Stream &rarr;</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ========================================= */}
      {/* 5. FOOTER CREST                           */}
      {/* ========================================= */}
      <footer className="py-10 sm:py-12 text-center border-t border-neutral-200/40 text-xs text-neutral-400 space-y-2 px-4">
        <p className="font-cormorant text-xl text-[#6f0617] font-semibold">
          {config.brideName} &amp; {config.groomName}
        </p>
        <p className="text-[11px]">
          Created with royal devotion on <span className="font-semibold text-neutral-600">WeddingOS</span>
        </p>
      </footer>

    </div>
  )
}
