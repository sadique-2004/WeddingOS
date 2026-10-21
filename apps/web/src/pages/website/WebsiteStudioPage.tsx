import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { getLocalAuthSession } from '../../services/authService'
import {
  Globe,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Smartphone,
  Monitor,
  CheckCircle2,
  Palette,
  Sliders,
  FileText,
  Radio,
  Image as ImageIcon,
  Save,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  MapPin,
  Video,
  Heart,
  ArrowRight,
  Info,
} from 'lucide-react'
import PublicWeddingPage from '../public/PublicWeddingPage'
import type { PublicWebsiteConfig } from '../../types/website'
import { workspacesApi, websiteApi, getActiveWeddingId } from '../../services/apiClient'

const DEFAULT_CONFIG: PublicWebsiteConfig = {
  slug: 'my-wedding',
  themeKey: 'CLASSIC_INDIAN',
  brideName: '',
  groomName: '',
  weddingDate: '',
  locationName: '',
  welcomeHeadline: 'Welcome to Our Wedding Celebration',
  welcomeMessage:
    'With the blessings of our elders and loved ones, we joyfully invite you to celebrate our union.',
  isPublished: false,
  showSchedule: true,
  showDressCode: true,
  showVenues: true,
  showLivestream: false,
  livestreamUrl: '',
  coverPhoto: '/events/pheras.jpg',
}

const CEREMONY_COVER_PHOTOS = [
  { label: 'Pheras & Vivah (Vedic Mandap)', path: '/events/pheras.jpg' },
  { label: 'Sangeet & Cocktail Soiree', path: '/events/sangeet.jpg' },
  { label: 'Haldi & Phoolon Ki Holi', path: '/events/haldi.jpg' },
  { label: 'Mehendi & High Tea', path: '/events/mehendi.jpg' },
  { label: 'Grand Royal Reception Dinner', path: '/events/reception.jpg' },
]

export default function WebsiteStudioPage() {
  const { user } = useUser()
  const localUser = getLocalAuthSession()
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

  const [config, setConfig] = useState<PublicWebsiteConfig>(() => {
    try {
      const stored = localStorage.getItem('weddingos_website_config')
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG
  })

  const [activeTab, setActiveTab] = useState<'themes' | 'content' | 'sections' | 'slug'>('themes')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [copied, setCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Fetch real database details on mount and synchronize with user wedding profile
  useEffect(() => {
    // 1. Initial check from local profile cache for immediate display
    try {
      const storedProfile = localStorage.getItem(userScopeKey) || localStorage.getItem('weddingos_active_wedding')
      if (storedProfile) {
        const p = JSON.parse(storedProfile)
        setConfig(prev => ({
          ...prev,
          brideName: p.brideName !== undefined ? p.brideName : prev.brideName,
          groomName: p.groomName !== undefined ? p.groomName : prev.groomName,
          weddingDate: p.weddingDate !== undefined ? p.weddingDate : prev.weddingDate,
          locationName: p.venueName || p.city || p.locationName || prev.locationName,
          slug: p.slug || prev.slug,
        }))
      }
    } catch {
      // ignore
    }

    // 2. Fetch from backend API
    const wid = getActiveWeddingId()
    Promise.allSettled([
      workspacesApi.getActive(wid, email, clerkId, fullName),
      websiteApi.getConfig(wid)
    ]).then(([workspaceResult, siteResult]) => {
      let updated: Partial<PublicWebsiteConfig> = {}
      if (workspaceResult.status === 'fulfilled' && workspaceResult.value) {
        const w = workspaceResult.value
        updated = {
          ...updated,
          brideName: w.brideName || '',
          groomName: w.groomName || '',
          weddingDate: w.weddingDate || '',
          locationName: w.venueName || w.city || '',
          slug: w.slug || 'our-wedding',
        }
      }
      if (siteResult.status === 'fulfilled' && siteResult.value) {
        const s = siteResult.value
        updated = {
          ...updated,
          themeKey: (s.themeKey as any) || config.themeKey,
          welcomeHeadline: s.welcomeHeadline || config.welcomeHeadline,
          welcomeMessage: s.welcomeMessage || config.welcomeMessage,
          isPublished: s.isPublished !== undefined ? s.isPublished : config.isPublished,
          showSchedule: s.showSchedule !== undefined ? s.showSchedule : config.showSchedule,
          showDressCode: s.showDressCode !== undefined ? s.showDressCode : config.showDressCode,
          showVenues: s.showVenues !== undefined ? s.showVenues : config.showVenues,
          showLivestream: s.showLivestream !== undefined ? s.showLivestream : config.showLivestream,
          livestreamUrl: s.livestreamUrl || config.livestreamUrl,
        }
      }
      if (Object.keys(updated).length > 0) {
        setConfig(prev => ({ ...prev, ...updated }))
      }
    }).catch(err => console.warn('Could not load studio config from backend:', err))

    // 3. Listen to profile updates dispatched from Profile page
    const handleProfileSync = () => {
      try {
        const stored = localStorage.getItem(userScopeKey) || localStorage.getItem('weddingos_active_wedding')
        if (stored) {
          const p = JSON.parse(stored)
          setConfig(prev => ({
            ...prev,
            brideName: p.brideName !== undefined ? p.brideName : prev.brideName,
            groomName: p.groomName !== undefined ? p.groomName : prev.groomName,
            weddingDate: p.weddingDate !== undefined ? p.weddingDate : prev.weddingDate,
            locationName: p.venueName || p.city || p.locationName || prev.locationName,
            slug: p.slug || prev.slug,
          }))
        }
      } catch {}
    }

    window.addEventListener('weddingos_wedding_updated', handleProfileSync)
    window.addEventListener('weddingos_active_wedding_changed', handleProfileSync)
    return () => {
      window.removeEventListener('weddingos_wedding_updated', handleProfileSync)
      window.removeEventListener('weddingos_active_wedding_changed', handleProfileSync)
    }
  }, [email, clerkId, userScopeKey])

  // Save to localStorage whenever config changes
  useEffect(() => {
    try {
      localStorage.setItem('weddingos_website_config', JSON.stringify(config))
    } catch {
      // ignore
    }
  }, [config])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/w/${config.slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    showToast('Public wedding portal URL copied to clipboard!')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSave = async () => {
    const wid = getActiveWeddingId()

    // 1. Optimistic immediate save to localStorage & toast (0ms delay)
    try {
      localStorage.setItem('weddingos_website_config', JSON.stringify(config))
      window.dispatchEvent(new Event('weddingos_website_updated'))
      showToast('Theme studio settings successfully saved & published to cloud!')
    } catch {
      showToast('Error saving settings locally')
    }

    // 2. Parallel background sync to backend
    // Preserves profile couple details and only updates slug & website customizations
    Promise.allSettled([
      workspacesApi.updateDetails({
        slug: config.slug.trim(),
        brideName: config.brideName || undefined,
        groomName: config.groomName || undefined,
        weddingDate: config.weddingDate || undefined,
        venueName: config.locationName || undefined,
        city: config.locationName || undefined,
      }, wid),
      websiteApi.updateConfig({
        themeKey: config.themeKey as any,
        welcomeHeadline: config.welcomeHeadline,
        welcomeMessage: config.welcomeMessage,
        isPublished: config.isPublished,
        showSchedule: config.showSchedule,
        showDressCode: config.showDressCode,
        showVenues: config.showVenues,
        showLivestream: config.showLivestream,
        livestreamUrl: config.livestreamUrl,
      }, wid)
    ]).catch(err => console.warn('Background studio sync error:', err))
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#3a0208] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-[#e6bd81]/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================= */}
      {/* 1. STUDIO HEADER                          */}
      {/* ========================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e6bd81]/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#fdf5ea] text-[#85531d] border border-[#e6bd81]/60 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#b88444]" />
              Guest Experience Studio
            </span>
            {config.isPublished ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live on Web
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                Private Draft
              </span>
            )}
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-[#4b030e] tracking-tight">
            Wedding Website &amp; Themes
          </h1>
          <p className="text-xs text-neutral-500 max-w-xl">
            Design your guest-facing digital invitation portal, choose from curated royal themes, configure your custom slug, and broadcast ceremonial details.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#e6bd81]/60 hover:bg-[#faf4ec] text-[#4b030e] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#b88444]" />}
            <span>{copied ? 'Copied' : 'Copy Public Link'}</span>
          </button>

          <a
            href={`/w/${config.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#faf4ec] border border-[#b88444]/60 hover:bg-[#f6ebdc] text-[#6f0617] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Live Portal</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
          </a>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4b030e] to-[#6f0617] hover:from-[#3a0208] hover:to-[#540411] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#e6bd81]" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. SPLIT LAYOUT: CONTROLS & LIVE PREVIEW  */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: STUDIO CONFIG CONTROLS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Studio Navigation Tabs */}
          <div className="flex items-center border-b border-neutral-200 bg-white p-1 rounded-2xl shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('themes')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'themes'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-[#6f0617] hover:bg-neutral-50'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-[#6f0617] hover:bg-neutral-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Content</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sections')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'sections'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-[#6f0617] hover:bg-neutral-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sections</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('slug')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'slug'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-[#6f0617] hover:bg-neutral-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Slug &amp; Live</span>
            </button>
          </div>

          {/* TAB 1: THEMES & COVER SELECTION */}
          {activeTab === 'themes' && (
            <div className="bg-white p-5 rounded-3xl border border-[#e6bd81]/40 shadow-xs space-y-5">
              <div className="space-y-1">
                <h3 className="font-cormorant text-xl font-bold text-[#4b030e]">
                  Select Wedding Theme Design
                </h3>
                <p className="text-xs text-neutral-500">
                  Select a theme defined in DBDD Section 5.10 with tailored color harmony and typography.
                </p>
              </div>

              {/* 3 Theme Options */}
              <div className="space-y-3">
                {/* 1. CLASSIC INDIAN */}
                <div
                  onClick={() => setConfig({ ...config, themeKey: 'CLASSIC_INDIAN' })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    config.themeKey === 'CLASSIC_INDIAN'
                      ? 'border-[#6f0617] bg-[#fdf5ea]/60 shadow-xs ring-2 ring-[#6f0617]/20'
                      : 'border-neutral-200 hover:border-[#b88444]/60 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        <span className="w-5 h-5 rounded-full bg-[#4b030e] ring-2 ring-white" />
                        <span className="w-5 h-5 rounded-full bg-[#b88444] ring-2 ring-white" />
                        <span className="w-5 h-5 rounded-full bg-[#faf7f2] border border-neutral-300 ring-2 ring-white" />
                      </div>
                      <div>
                        <h4 className="font-cormorant text-base font-bold text-[#4b030e]">
                          Classic Indian Heritage
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          Royal Crimson, Zari Gold &amp; Cormorant Garamond Serifs
                        </p>
                      </div>
                    </div>
                    {config.themeKey === 'CLASSIC_INDIAN' && (
                      <span className="w-6 h-6 rounded-full bg-[#6f0617] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. MINIMAL ELEGANT */}
                <div
                  onClick={() => setConfig({ ...config, themeKey: 'MINIMAL_ELEGANT' })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    config.themeKey === 'MINIMAL_ELEGANT'
                      ? 'border-[#1c1917] bg-stone-50 shadow-xs ring-2 ring-stone-400/20'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        <span className="w-5 h-5 rounded-full bg-[#1c1917] ring-2 ring-white" />
                        <span className="w-5 h-5 rounded-full bg-[#78716c] ring-2 ring-white" />
                        <span className="w-5 h-5 rounded-full bg-[#fcfbf9] border border-stone-300 ring-2 ring-white" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#1c1917]">
                          Minimal Elegant
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          Warm Ivory, Charcoal Slate &amp; Editorial Clean Lines
                        </p>
                      </div>
                    </div>
                    {config.themeKey === 'MINIMAL_ELEGANT' && (
                      <span className="w-6 h-6 rounded-full bg-[#1c1917] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. MODERN CELEBRATION */}
                <div
                  onClick={() => setConfig({ ...config, themeKey: 'MODERN_CELEBRATION' })}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    config.themeKey === 'MODERN_CELEBRATION'
                      ? 'border-amber-400 bg-[#0f172a] text-white shadow-xs ring-2 ring-amber-400/20'
                      : 'border-neutral-200 hover:border-amber-400/60 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        <span className="w-5 h-5 rounded-full bg-[#0b1329] ring-2 ring-white" />
                        <span className="w-5 h-5 rounded-full bg-[#e6bd81] ring-2 ring-white" />
                        <span className="w-5 h-5 rounded-full bg-[#1e293b] ring-2 ring-white" />
                      </div>
                      <div>
                        <h4 className={`font-cormorant text-base font-bold ${config.themeKey === 'MODERN_CELEBRATION' ? 'text-amber-300' : 'text-[#4b030e]'}`}>
                          Modern Celebration Night
                        </h4>
                        <p className={`text-[11px] ${config.themeKey === 'MODERN_CELEBRATION' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          Midnight Navy, Starry Champagne Gold &amp; Vibrant Lighting
                        </p>
                      </div>
                    </div>
                    {config.themeKey === 'MODERN_CELEBRATION' && (
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-900 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Photo Selection */}
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <label className="text-xs font-bold text-[#4b030e] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#b88444]" />
                  <span>Hero Cover Photograph</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CEREMONY_COVER_PHOTOS.map((photo) => (
                    <button
                      key={photo.path}
                      type="button"
                      onClick={() => setConfig({ ...config, coverPhoto: photo.path })}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        config.coverPhoto === photo.path
                          ? 'border-[#6f0617] bg-[#fdf5ea] shadow-2xs font-semibold'
                          : 'border-neutral-200 hover:border-[#b88444] bg-white'
                      }`}
                    >
                      <img
                        src={photo.path}
                        alt={photo.label}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <span className="text-[11px] line-clamp-2 text-neutral-700">
                        {photo.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT & STORY EDITOR */}
          {activeTab === 'content' && (
            <div className="bg-white p-5 rounded-3xl border border-[#e6bd81]/40 shadow-xs space-y-5">
              <div className="space-y-1">
                <h3 className="font-cormorant text-xl font-bold text-[#4b030e]">
                  Invitation Content &amp; Story
                </h3>
                <p className="text-xs text-neutral-500">
                  Customize the welcome headline and love story letter shown to guests on your wedding portal.
                </p>
              </div>

              {/* READ-ONLY PROFILE SYNC CARD (Couple, Date & Location from Profile) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#faf4ec] via-[#fdfbf7] to-[#f6ecde] border border-[#e6bd81]/70 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-[#e6bd81]/30 pb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3a0208] text-[#e6bd81] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-[#e6bd81]" />
                    Synced from Wedding Profile
                  </span>

                  <Link
                    to="/app/profile"
                    className="text-[11px] font-bold text-[#6f0617] hover:text-[#4b030e] flex items-center gap-1 transition-colors hover:underline group cursor-pointer"
                  >
                    <span>Edit in Profile</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Couple */}
                  <div className="p-2.5 rounded-xl bg-white/80 border border-[#e6bd81]/40">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                      <Heart className="w-3 h-3 text-[#6f0617]" />
                      Couple
                    </span>
                    <p className="font-cormorant text-base font-bold text-[#4b030e] truncate" title={`${config.brideName || 'Bride'} & ${config.groomName || 'Groom'}`}>
                      {config.brideName && config.groomName
                        ? `${config.brideName} & ${config.groomName}`
                        : config.brideName || config.groomName || 'Couple Not Set'}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="p-2.5 rounded-xl bg-white/80 border border-[#e6bd81]/40">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                      <Calendar className="w-3 h-3 text-[#b88444]" />
                      Wedding Date
                    </span>
                    <p className="text-xs font-semibold text-neutral-800">
                      {config.weddingDate
                        ? new Date(config.weddingDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Date Not Set'}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="p-2.5 rounded-xl bg-white/80 border border-[#e6bd81]/40">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                      <MapPin className="w-3 h-3 text-[#b88444]" />
                      Venue / City
                    </span>
                    <p className="text-xs font-semibold text-neutral-800 truncate" title={config.locationName || 'Venue not set'}>
                      {config.locationName || 'Venue Not Set'}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 italic flex items-center gap-1 pt-0.5">
                  <Info className="w-3 h-3 text-[#b88444] shrink-0 inline" />
                  <span>Bride &amp; groom names, date, and venue are configured in Profile and automatically reflected across your wedding website.</span>
                </p>
              </div>

              {/* WELCOME HEADLINE */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#4b030e]">
                    Welcome Headline
                  </label>
                  <span className="text-[10px] text-neutral-400">Greeting title for guests</span>
                </div>
                <input
                  type="text"
                  value={config.welcomeHeadline}
                  onChange={(e) => setConfig({ ...config, welcomeHeadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617]/20 focus:outline-none bg-white transition-all shadow-2xs"
                  placeholder="Welcome to Our Wedding Celebration"
                />
              </div>

              {/* WELCOME LETTER / STORY */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#4b030e]">
                    Welcome Letter / Love Story
                  </label>
                  <span className="text-[10px] text-neutral-400">Ceremonial invitation text</span>
                </div>
                <textarea
                  rows={5}
                  value={config.welcomeMessage}
                  onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617]/20 focus:outline-none leading-relaxed bg-white transition-all shadow-2xs"
                  placeholder="With the blessings of our elders and loved ones, we joyfully invite you to celebrate our union..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: SECTIONS & LIVESTREAM */}
          {activeTab === 'sections' && (
            <div className="bg-white p-5 rounded-3xl border border-[#e6bd81]/40 shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="font-cormorant text-xl font-bold text-[#4b030e]">
                  Ceremonial Sections Visibility
                </h3>
                <p className="text-xs text-neutral-500">
                  Toggle which modules and details are displayed on the public landing page.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Schedule Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-[#faf7f2]">
                  <div>
                    <h5 className="text-xs font-bold text-[#4b030e]">Ceremonial Itinerary (Run of Show)</h5>
                    <p className="text-[11px] text-neutral-500">Displays Haldi, Mehendi, Sangeet, Pheras &amp; Reception cards</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showSchedule}
                    onChange={(e) => setConfig({ ...config, showSchedule: e.target.checked })}
                    className="w-4 h-4 text-[#6f0617] rounded accent-[#6f0617] cursor-pointer"
                  />
                </div>

                {/* Dress Code Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-[#faf7f2]">
                  <div>
                    <h5 className="text-xs font-bold text-[#4b030e]">Attire &amp; Dress Code Guide</h5>
                    <p className="text-[11px] text-neutral-500">Recommends color palettes &amp; traditional attire to guests</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showDressCode}
                    onChange={(e) => setConfig({ ...config, showDressCode: e.target.checked })}
                    className="w-4 h-4 text-[#6f0617] rounded accent-[#6f0617] cursor-pointer"
                  />
                </div>

                {/* Venue Maps Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-[#faf7f2]">
                  <div>
                    <h5 className="text-xs font-bold text-[#4b030e]">Venue Locations &amp; Google Maps</h5>
                    <p className="text-[11px] text-neutral-500">Provides one-click navigation links to Udaipur mandap venues</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showVenues}
                    onChange={(e) => setConfig({ ...config, showVenues: e.target.checked })}
                    className="w-4 h-4 text-[#6f0617] rounded accent-[#6f0617] cursor-pointer"
                  />
                </div>

                {/* Livestream Toggle & URL */}
                <div className="p-3 rounded-xl border border-neutral-100 bg-[#faf7f2] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-[#4b030e] flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-[#6f0617]" />
                        <span>Live Broadcast Feed (4K Stream)</span>
                      </h5>
                      <p className="text-[11px] text-neutral-500">For overseas relatives joining virtually</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.showLivestream}
                      onChange={(e) => setConfig({ ...config, showLivestream: e.target.checked })}
                      className="w-4 h-4 text-[#6f0617] rounded accent-[#6f0617] cursor-pointer"
                    />
                  </div>

                  {config.showLivestream && (
                    <div className="pt-2 border-t border-neutral-200/60">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                        YouTube / Zoom / Vimeo Stream URL
                      </label>
                      <input
                        type="url"
                        value={config.livestreamUrl || ''}
                        onChange={(e) => setConfig({ ...config, livestreamUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:border-[#6f0617] focus:outline-none bg-white"
                        placeholder="https://youtube.com/live/..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SLUG & PUBLICATION STATUS */}
          {activeTab === 'slug' && (
            <div className="bg-white p-5 rounded-3xl border border-[#e6bd81]/40 shadow-xs space-y-5">
              <div className="space-y-1">
                <h3 className="font-cormorant text-xl font-bold text-[#4b030e]">
                  Public URL &amp; Live Status
                </h3>
                <p className="text-xs text-neutral-500">
                  Specify your unique web handle and toggle live access for guests.
                </p>
              </div>

              {/* Slug Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4b030e]">Portal URL Handle (Slug)</label>
                <div className="flex items-center rounded-xl border border-neutral-200 overflow-hidden focus-within:border-[#6f0617]">
                  <span className="px-3 py-2 bg-neutral-100 text-neutral-500 text-xs font-mono border-r border-neutral-200 select-none">
                    /w/
                  </span>
                  <input
                    type="text"
                    value={config.slug}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      })
                    }
                    className="flex-1 px-3 py-2 text-xs font-mono focus:outline-none"
                    placeholder="our-wedding"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Full shareable link: <span className="font-mono text-neutral-600 font-semibold">{window.location.origin}/w/{config.slug}</span>
                </p>
              </div>

              {/* Publication Status Switch */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-[#faf7f2] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-[#4b030e]">Live Website Publication</h5>
                    <p className="text-[11px] text-neutral-500">
                      {config.isPublished
                        ? 'Portal is live and accessible to anyone with your link'
                        : 'Draft mode: Visitors will see a private coming-soon screen'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !config.isPublished
                      setConfig({ ...config, isPublished: next })
                      showToast(next ? 'Website published live!' : 'Website set to private draft mode')
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      config.isPublished ? 'bg-emerald-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        config.isPublished ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/60 text-xs font-semibold">
                  {config.isPublished ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Live &amp; Search Engine Indexable
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Draft Mode (Only Authenticated Organizers Can Edit)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: INTERACTIVE DEVICE PREVIEW (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-[#e6bd81]/40 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#4b030e] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#b88444]" />
                <span>Interactive Live Preview</span>
              </span>
              <span className="text-[10px] text-neutral-400">| Updates automatically</span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-white text-[#6f0617] shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-white text-[#6f0617] shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* Interactive Preview Container */}
          <div className="flex justify-center bg-neutral-900/5 p-4 rounded-3xl border border-neutral-200 overflow-hidden">
            {previewDevice === 'desktop' ? (
              <div className="w-full h-[760px] overflow-y-auto rounded-2xl bg-white shadow-xl border border-neutral-200 [scrollbar-width:thin]">
                <PublicWeddingPage previewConfig={config} isMobileView={false} />
              </div>
            ) : (
              /* Mobile Phone Mockup Frame */
              <div className="w-[380px] h-[760px] rounded-[48px] border-[10px] border-neutral-800 bg-black shadow-2xl overflow-hidden relative flex flex-col">
                {/* iPhone Dynamic Island / Speaker Notch */}
                <div className="h-6 bg-neutral-800 flex items-center justify-center shrink-0">
                  <div className="w-24 h-4 bg-black rounded-full" />
                </div>
                {/* Mobile Viewport */}
                <div className="flex-1 overflow-y-auto bg-white [scrollbar-width:none]">
                  <PublicWeddingPage previewConfig={config} isMobileView={true} />
                </div>
                {/* iPhone Bottom Bar */}
                <div className="h-4 bg-neutral-800 flex items-center justify-center shrink-0">
                  <div className="w-32 h-1 bg-white/40 rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
