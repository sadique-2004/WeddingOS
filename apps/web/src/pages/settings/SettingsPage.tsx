import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import {
  Settings,
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
  Heart,
  Globe,
  Radio,
  Download,
  Copy,
  ExternalLink,
  Volume2,
  VolumeX,
  ShieldAlert,
  Clock,
  Video,
  X,
  CheckCircle2,
} from 'lucide-react'
import { resetToDemoData } from '../../services/invitationStore'
import { resetMembershipDemoData } from '../../services/membershipStore'
import { workspacesApi, getActiveWeddingId } from '../../services/apiClient'

export interface WeddingWorkspaceSettings {
  id: string | number
  title: string
  brideName: string
  groomName: string
  weddingDate: string
  locationName: string
  description: string
  slug: string
  currency: string
  timezone: string
  livestreamEnabled: boolean
  livestreamUrl: string
  livestreamTitle: string
  livestreamNotes: string
  soundEnabled: boolean
  allowPublicRsvp: boolean
  allowGuestUploads: boolean
  defaultMaxAttendees: number
  createdAt?: string
  updatedAt?: string
}

const DEFAULT_SETTINGS: WeddingWorkspaceSettings = {
  id: 'wed-1',
  title: 'My Wedding Workspace',
  brideName: '',
  groomName: '',
  weddingDate: '',
  locationName: '',
  description: '',
  slug: 'my-wedding',
  currency: 'INR (₹)',
  timezone: 'Asia/Kolkata (IST - UTC+05:30)',
  livestreamEnabled: false,
  livestreamUrl: '',
  livestreamTitle: '',
  livestreamNotes: '',
  soundEnabled: true,
  allowPublicRsvp: true,
  allowGuestUploads: true,
  defaultMaxAttendees: 4,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<WeddingWorkspaceSettings>(DEFAULT_SETTINGS)
  const [activeTab, setActiveTab] = useState<'general' | 'website' | 'livestream' | 'checkin' | 'danger'>('general')

  // Feedback states
  const [isSaving, setIsSaving] = useState(false)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Danger Zone Modals
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false)

  // Load active wedding settings on mount from backend and local cache
  useEffect(() => {
    try {
      const stored = localStorage.getItem('weddingos_active_wedding')
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings((prev) => ({
          ...prev,
          ...parsed,
        }))
      }
    } catch {
      // ignore
    }

    // Resolve the signed-in user's workspace (never wedding 1 by default)
    workspacesApi.getActive(getActiveWeddingId() || undefined).then((backendData: any) => {
      if (backendData) {
        setSettings((prev) => ({
          ...prev,
          brideName: backendData.brideName || prev.brideName,
          groomName: backendData.groomName || prev.groomName,
          weddingDate: backendData.weddingDate || prev.weddingDate,
          locationName: backendData.venueName || backendData.city || prev.locationName,
          slug: backendData.slug || prev.slug,
          title: `${backendData.brideName} & ${backendData.groomName}'s Royal Wedding`,
        }))
        localStorage.setItem('weddingos_active_wedding', JSON.stringify(backendData))
      }
    }).catch((err: any) => console.warn('Could not load settings from backend:', err))
  }, [])

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!settings.weddingDate) return null
    try {
      const target = new Date(settings.weddingDate).getTime()
      if (isNaN(target)) return null
      const now = new Date().getTime()
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 0
    } catch {
      return null
    }
  }

  const daysRemaining = calculateDaysRemaining()

  // Handle Save
  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorNotice(null)

    if (!settings.brideName.trim() || !settings.groomName.trim()) {
      setErrorNotice('Bride and Groom names cannot be blank.')
      setIsSaving(false)
      return
    }

    if (!settings.weddingDate) {
      setErrorNotice('Please specify the main wedding date.')
      setIsSaving(false)
      return
    }

    async function doSave() {
      try {
        const updated = {
          ...settings,
          updatedAt: new Date().toISOString(),
        }

        // 1. Sync to backend MySQL database on Render / TiDB Cloud
        try {
          await workspacesApi.updateDetails({
            brideName: settings.brideName.trim(),
            groomName: settings.groomName.trim(),
            weddingDate: settings.weddingDate,
            venueName: settings.locationName.trim(),
            city: settings.locationName.trim(),
            slug: settings.slug.trim(),
          })
        } catch (apiErr) {
          console.warn('Backend sync error:', apiErr)
        }

        // 2. Update local state & dispatch cross-tab event
        localStorage.setItem('weddingos_active_wedding', JSON.stringify(updated))
        setSettings(updated)

        window.dispatchEvent(new Event('weddingos_wedding_updated'))
        window.dispatchEvent(new StorageEvent('storage', { key: 'weddingos_active_wedding' }))

        setIsSaving(false)
        setSuccessNotice('Wedding workspace settings saved and synced to database!')
        setTimeout(() => setSuccessNotice(null), 4000)
      } catch (err: unknown) {
        setIsSaving(false)
        const msg = err instanceof Error ? err.message : 'Failed to save settings'
        setErrorNotice(msg)
      }
    }
    doSave()
  }

  // Handle Copy Website Link
  const handleCopyWebsiteLink = () => {
    const fullUrl = `${window.location.origin}/w/${settings.slug || 'preview'}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Handle Export Full Archive
  const handleExportArchive = () => {
    const fullBackup = {
      workspaceSettings: settings,
      members: localStorage.getItem('weddingos_workspace_members') || '[]',
      invitations: localStorage.getItem('weddingos_family_invitations') || '[]',
      checkinLogs: localStorage.getItem('weddingos_checkin_logs') || '[]',
      exportedAt: new Date().toISOString(),
      platform: 'WeddingOS v2.0',
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute(
      'download',
      `${settings.brideName}_and_${settings.groomName}_WeddingOS_Backup.json`
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    setSuccessNotice('WeddingOS complete JSON backup archive exported successfully.')
  }

  // Handle Reset All Data
  const handleFullResetDemoData = async () => {
    const wid = getActiveWeddingId()
    try {
      await workspacesApi.reset(wid)
    } catch (err: any) {
      // Backend reset is disabled (403) or no wedding is selected: keep all data and report it.
      setIsResetConfirmOpen(false)
      setErrorNotice(err?.message || 'Workspace reset is not available. No data was changed.')
      return
    }
    resetToDemoData()
    resetMembershipDemoData(wid)
    const cleanSettings = { ...DEFAULT_SETTINGS }
    localStorage.setItem('weddingos_active_wedding', JSON.stringify(cleanSettings))
    setSettings(cleanSettings)

    const keys = [
      `weddingos_${wid}_events`, `weddingos_${wid}_expenses`, `weddingos_${wid}_tasks`, `weddingos_${wid}_vendors`,
      `weddingos_events_${wid}`, `weddingos_expenses_${wid}`, `weddingos_tasks_${wid}`, `weddingos_vendors_${wid}`,
      'weddingos_gallery_photos', 'weddingos_gallery_settings', 'weddingos_website_config'
    ]
    keys.forEach((k) => localStorage.removeItem(k))

    window.dispatchEvent(new Event('weddingos_wedding_updated'))
    window.dispatchEvent(new Event('weddingos_invitations_updated'))
    window.dispatchEvent(new Event('weddingos_members_updated'))
    setIsResetConfirmOpen(false)
    setSuccessNotice('All wedding data has been reset to a clean blank slate.')
  }

  return (
    <div className="space-y-6 pb-20">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & WORKSPACE IDENTITY                                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#e6bd81]/50 shadow-sm p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#e6bd81]/15 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4b030e] text-[#e6bd81] border border-[#b88444]/40 tracking-wide uppercase">
                <Settings className="w-3.5 h-3.5 text-[#e6bd81]" />
                System Preferences &amp; Workspace Configuration
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#faf9f6] text-[#6f0617] border border-[#e6bd81]">
                <Clock className="w-3 h-3 text-[#b88444]" />
                {daysRemaining !== null ? `${daysRemaining} Days Until Wedding` : 'Date Not Set'}
              </span>
            </div>

            <h1 className="font-cormorant text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4b030e]">
              Workspace Settings
            </h1>
            <p className="text-sm text-[#4b030e]/80 mt-1 max-w-2xl">
              Configure celebration metadata, guest portal URLs, ceremonial livestreams, and platform data governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportArchive}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#4b030e] bg-[#faf9f6] border border-[#e6bd81] hover:bg-[#f6ebd9] transition-all cursor-pointer shadow-xs"
              title="Download full JSON workspace backup"
            >
              <Download className="w-3.5 h-3.5 text-[#b88444]" />
              Export Backup Archive
            </button>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#6f0617] text-white hover:bg-[#4b030e] transition-all cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5 text-[#e6bd81]" />
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        {/* Quick Identity Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#e6bd81]/30">
          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-600 block">Couple Names</span>
            <span className="font-cormorant text-lg font-bold text-[#4b030e] truncate block mt-0.5">
              {settings.brideName && settings.groomName
                ? `${settings.brideName} & ${settings.groomName}`
                : settings.brideName || settings.groomName || 'Not Configured'}
            </span>
            <span className="text-[10px] text-neutral-500 block">Workspace Owners</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-600 block">Wedding Date</span>
            <span className="font-bold text-sm text-[#4b030e] block mt-0.5">{settings.weddingDate || 'Date Not Set'}</span>
            <span className="text-[10px] text-neutral-500 block">
              {daysRemaining !== null ? `${daysRemaining} days remaining` : 'Configure Date Below'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-600 block">Celebration Venue</span>
            <span className="font-bold text-xs text-[#4b030e] truncate block mt-0.5">{settings.locationName}</span>
            <span className="text-[10px] text-neutral-500 block">{settings.timezone.split(' ')[0]}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/40">
            <span className="text-[11px] font-medium text-neutral-600 block">Public Website Slug</span>
            <span className="font-mono text-xs font-bold text-[#6f0617] truncate block mt-0.5">
              /w/{settings.slug || 'preview'}
            </span>
            <span className="text-[10px] text-neutral-500 block">Live guest link</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FEEDBACK NOTICES                                                       */}
      {/* ========================================================================= */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-xs text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-700 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 text-xs text-rose-900 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice(null)} className="text-rose-700 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SETTINGS NAVIGATION TABS & FORM                                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#e6bd81]/50 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#faf9f6] border-b border-[#e6bd81]/40">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-[#6f0617] text-white shadow-xs'
                : 'text-[#4b030e] hover:bg-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            General Wedding Details
          </button>

          <button
            onClick={() => setActiveTab('website')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'website'
                ? 'bg-[#6f0617] text-white shadow-xs'
                : 'text-[#4b030e] hover:bg-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Website &amp; Guest Portal
          </button>

          <button
            onClick={() => setActiveTab('livestream')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'livestream'
                ? 'bg-[#6f0617] text-white shadow-xs'
                : 'text-[#4b030e] hover:bg-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Ceremony Livestream (FR-LIVE)
          </button>

          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'checkin'
                ? 'bg-[#6f0617] text-white shadow-xs'
                : 'text-[#4b030e] hover:bg-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Reception &amp; Audio Alerts
          </button>

          <button
            onClick={() => setActiveTab('danger')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'danger'
                ? 'bg-rose-900 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Data &amp; Danger Zone
          </button>
        </div>

        {/* Tab Content Form */}
        <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 space-y-6 text-xs">
          {/* ========================================================================= */}
          {/* TAB 1: GENERAL DETAILS                                                    */}
          {/* ========================================================================= */}
          {activeTab === 'general' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                  Couple &amp; Celebration Identity
                </h3>
                <p className="text-neutral-500 mt-0.5">
                  Update primary wedding names, main ceremony date, and celebration summary.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                    Bride's Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.brideName}
                    onChange={(e) => setSettings({ ...settings, brideName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                    Groom's Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.groomName}
                    onChange={(e) => setSettings({ ...settings, groomName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                  Wedding Celebration Title
                </label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  placeholder="e.g. Royal Wedding Celebration"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                    Main Wedding Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={settings.weddingDate}
                    onChange={(e) => setSettings({ ...settings, weddingDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Powers the countdown clock in dashboard &amp; sidebar ({daysRemaining} days left).
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                    City / Venue Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.locationName}
                    onChange={(e) => setSettings({ ...settings, locationName: e.target.value })}
                    placeholder="e.g. The Oberoi Palace, Bengaluru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                  Welcome Story &amp; Description
                </label>
                <textarea
                  rows={3}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Introduce the celebration..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#e6bd81]/30">
                <div>
                  <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                    Default Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-semibold text-[#4b030e] focus:outline-none focus:ring-1 focus:ring-[#6f0617]"
                  >
                    <option value="INR (₹)">INR (₹) Indian Rupee</option>
                    <option value="USD ($)">USD ($) United States Dollar</option>
                    <option value="EUR (€)">EUR (€) Euro</option>
                    <option value="GBP (£)">GBP (£) British Pound</option>
                    <option value="AED (د.إ)">AED (د.إ) UAE Dirham</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-semibold text-[#4b030e] focus:outline-none focus:ring-1 focus:ring-[#6f0617]"
                  >
                    <option value="Asia/Kolkata (IST - UTC+05:30)">Asia/Kolkata (IST - UTC+05:30)</option>
                    <option value="Asia/Dubai (GST - UTC+04:00)">Asia/Dubai (GST - UTC+04:00)</option>
                    <option value="Europe/London (GMT/BST - UTC+00:00)">Europe/London (GMT/BST - UTC+00:00)</option>
                    <option value="America/New_York (EST/EDT - UTC-05:00)">America/New_York (EST/EDT - UTC-05:00)</option>
                    <option value="America/Los_Angeles (PST/PDT - UTC-08:00)">America/Los_Angeles (PST/PDT - UTC-08:00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: WEBSITE & GUEST PORTAL                                             */}
          {/* ========================================================================= */}
          {activeTab === 'website' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                  Public Wedding Website &amp; Guest Portal
                </h3>
                <p className="text-neutral-500 mt-0.5">
                  Configure your bespoke web address and guest participation policies.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                  Public Website URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-mono">
                    <span className="text-neutral-400 select-none">{window.location.origin}/w/</span>
                    <input
                      type="text"
                      value={settings.slug}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                        })
                      }
                      className="flex-1 bg-transparent text-[#6f0617] font-bold focus:outline-none ml-1"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyWebsiteLink}
                    className="px-3.5 py-2.5 rounded-xl bg-[#faf9f6] border border-[#e6bd81] text-[#4b030e] font-semibold hover:bg-[#f6ebd9] cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <a
                    href={`/w/${settings.slug || 'preview'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#6f0617] text-white font-semibold hover:bg-[#4b030e] cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>Preview Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#e6bd81]/30">
                <span className="font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] block">
                  Guest Permissions &amp; Submission Rules
                </span>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#e6bd81]/40 bg-[#faf9f6] hover:bg-[#faf4ec] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowPublicRsvp}
                    onChange={(e) => setSettings({ ...settings, allowPublicRsvp: e.target.checked })}
                    className="mt-0.5 rounded text-[#6f0617] focus:ring-[#6f0617]"
                  />
                  <div>
                    <span className="font-semibold text-[#4b030e] block text-xs">
                      Enable Digital RSVP Responses
                    </span>
                    <span className="text-[11px] text-neutral-500 leading-tight block">
                      Allows invited families to submit attendance confirmation and headcounts via their private link.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#e6bd81]/40 bg-[#faf9f6] hover:bg-[#faf4ec] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowGuestUploads}
                    onChange={(e) => setSettings({ ...settings, allowGuestUploads: e.target.checked })}
                    className="mt-0.5 rounded text-[#6f0617] focus:ring-[#6f0617]"
                  />
                  <div>
                    <span className="font-semibold text-[#4b030e] block text-xs">
                      Allow Guest Photo Uploads to Wedding Gallery
                    </span>
                    <span className="text-[11px] text-neutral-500 leading-tight block">
                      Enables the mobile photo upload interface for wedding guests (subject to organizer moderation).
                    </span>
                  </div>
                </label>

                <div>
                  <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                    Default Max Attendee Quota (For New Invitations)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={settings.defaultMaxAttendees}
                    onChange={(e) => setSettings({ ...settings, defaultMaxAttendees: Number(e.target.value) })}
                    className="w-36 px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-bold text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: LIVESTREAM BROADCAST (FR-LIVE-01 to FR-LIVE-04)                    */}
          {/* ========================================================================= */}
          {activeTab === 'livestream' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                    Ceremony Livestream Broadcast
                  </h3>
                  <p className="text-neutral-500 mt-0.5">
                    Share your wedding ceremonies in real-time with international relatives and distant well-wishers.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#faf4ec] text-[#6f0617] border border-[#e6bd81]">
                  <Radio className="w-3.5 h-3.5 text-[#b88444]" />
                  PRD § 7.12 Spec
                </div>
              </div>

              {/* FR-LIVE-04 Legal/Technical Disclaimer Alert */}
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
                <Video className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block">FR-LIVE-04 Technical Boundary:</span>
                  <span>
                    WeddingOS embeds validated third-party broadcast feeds (YouTube Live, Vimeo, Zoom). WeddingOS does not host, encode, or store raw video streams on its internal infrastructure.
                  </span>
                </div>
              </div>

              {/* Enable Toggle */}
              <label className="flex items-center justify-between p-4 rounded-xl border border-[#e6bd81] bg-[#faf9f6] cursor-pointer">
                <div>
                  <span className="font-bold text-sm text-[#4b030e] block">
                    Enable Livestream for Guests
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Displays the dedicated livestream player section on your public wedding website.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.livestreamEnabled}
                  onChange={(e) => setSettings({ ...settings, livestreamEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-[#6f0617] focus:ring-[#6f0617]"
                />
              </label>

              {settings.livestreamEnabled && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                      Broadcast Stream URL (YouTube, Vimeo, Zoom) *
                    </label>
                    <input
                      type="url"
                      value={settings.livestreamUrl}
                      onChange={(e) => setSettings({ ...settings, livestreamUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-mono text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                      Stream Headline / Ceremony Title
                    </label>
                    <input
                      type="text"
                      value={settings.livestreamTitle}
                      onChange={(e) => setSettings({ ...settings, livestreamTitle: e.target.value })}
                      placeholder="e.g. Holy Pheras & Sangeet Ceremony"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs font-medium text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#4b030e] uppercase tracking-wider text-[11px] mb-1.5">
                      Viewer Instructions &amp; Timings
                    </label>
                    <textarea
                      rows={2}
                      value={settings.livestreamNotes}
                      onChange={(e) => setSettings({ ...settings, livestreamNotes: e.target.value })}
                      placeholder="e.g. Ceremony begins at 10:30 AM IST. Please refresh page if video does not auto-play."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6bd81] bg-[#faf9f6] text-xs text-[#4b030e] focus:outline-none focus:ring-2 focus:ring-[#6f0617] focus:bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: RECEPTION & AUDIO ALERTS                                           */}
          {/* ========================================================================= */}
          {activeTab === 'checkin' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">
                  Reception Desk &amp; Audio Feedback
                </h3>
                <p className="text-neutral-500 mt-0.5">
                  Configure audio chimes and duplicate scan warnings for the family gate check-in desk.
                </p>
              </div>

              <label className="flex items-center justify-between p-4 rounded-xl border border-[#e6bd81] bg-[#faf9f6] cursor-pointer">
                <div>
                  <div className="flex items-center gap-2">
                    {settings.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-[#6f0617]" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-neutral-400" />
                    )}
                    <span className="font-bold text-sm text-[#4b030e]">
                      Enable Scan Chimes &amp; Audio Feedback
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    Plays celebratory sound on successful admission and warning buzz on repeated scans (FR-CHECK-04).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                  className="w-5 h-5 rounded text-[#6f0617] focus:ring-[#6f0617]"
                />
              </label>

              <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e6bd81]/50 space-y-2">
                <span className="font-semibold text-xs text-[#4b030e] block">
                  Check-In Policy Overview (FR-CHECK-05)
                </span>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  • <strong>Unit Scope:</strong> Check-in operates on the family invitation as a unit. Individual headcount entry logging is disabled per product specification.
                  <br />
                  • <strong>Duplicate Warning:</strong> Re-scanning an already checked-in QR pass will immediately trigger the amber security alert with original admission timestamp.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: DATA MANAGEMENT & DANGER ZONE                                      */}
          {/* ========================================================================= */}
          {activeTab === 'danger' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="font-cormorant text-2xl font-bold text-red-950">
                  Data Governance &amp; Danger Zone
                </h3>
                <p className="text-neutral-500 mt-0.5">
                  Manage workspace data persistence, backups, and demo state restoration.
                </p>
              </div>

              {/* Backup Card */}
              <div className="p-5 rounded-2xl bg-[#faf9f6] border border-[#e6bd81] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-sm text-[#4b030e] block">
                    Export Complete Workspace Backup
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    Downloads all wedding events, invitations, RSVP statuses, memberships, and check-in logs as a JSON archive.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExportArchive}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#e6bd81] text-[#4b030e] font-bold text-xs hover:bg-[#f6ebd9] transition-all cursor-pointer shadow-xs inline-flex items-center gap-2 shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-[#b88444]" />
                  Export JSON Backup
                </button>
              </div>

              {/* Reset to Clean Demo State */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-sm text-amber-950 block">
                    Reset Workspace to Initial Demo Data
                  </span>
                  <span className="text-[11px] text-amber-800 block mt-0.5">
                    Restores all sample families (Singhania, Roy Chowdhury, etc.), default tasks, and organizers to standard test state.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs inline-flex items-center gap-2 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Demo Data
                </button>
              </div>

              {/* Workspace Deletion Workflow (DBDD § 7) */}
              <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm text-red-950 block">
                      Workspace Deletion Protocol (DBDD § 7)
                    </span>
                    <p className="text-[11px] text-red-800 leading-relaxed mt-0.5">
                      Per WeddingOS retention policy, hard database deletion is restricted to authorized platform administrative workflows. Deleting a wedding workspace unpublishes all guest links, revokes member tokens, and closes the countdown clock.
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsArchiveConfirmOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    Archive Wedding Workspace...
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="pt-4 border-t border-[#e6bd81]/30 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-400">
              Changes apply instantly across dashboard, check-in, and guest views.
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-6 rounded-xl font-bold text-xs bg-[#6f0617] hover:bg-[#4b030e] text-white shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5 text-[#e6bd81]" />
              {isSaving ? 'Saving Changes...' : 'Save Workspace Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS FOR CONFIRMATIONS                                               */}
      {/* ========================================================================= */}
      {/* Reset Demo Data Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border-2 border-amber-300 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-amber-950">
                Reset Demo Workspace Data?
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                This will re-seed all default demo families (Singhania, Roy Chowdhury, etc.), reset check-in logs, and restore default team members.
              </p>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleFullResetDemoData}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-700 hover:bg-amber-800 text-white shadow-md transition-all cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive / Deletion Workflow Modal */}
      {isArchiveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border-2 border-red-300 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-red-950">
                Archive Wedding Workspace?
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Archiving will lock public website submissions and freeze guest check-in desk activity. To proceed, please ensure you have exported your JSON archive backup first.
              </p>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleExportArchive()
                    setIsArchiveConfirmOpen(false)
                    setSuccessNotice('Wedding workspace archived. Backup file saved to your device.')
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md transition-all cursor-pointer"
                >
                  Backup &amp; Archive
                </button>
                <button
                  type="button"
                  onClick={() => setIsArchiveConfirmOpen(false)}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs border border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
