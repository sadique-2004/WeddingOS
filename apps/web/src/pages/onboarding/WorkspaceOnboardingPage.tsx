import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Sparkles, Calendar, MapPin, Heart, ArrowRight, CheckCircle2 } from 'lucide-react'
import { workspaceApi } from '../../services/apiClient'

export default function WorkspaceOnboardingPage() {
  const navigate = useNavigate()

  // Form State matching API_DESIGN.md POST /api/v1/weddings
  const [formData, setFormData] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    locationName: '',
    title: '',
    description: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.brideName.trim() || !formData.groomName.trim()) {
      setError('Please provide both the Bride and Groom names.')
      return
    }

    if (!formData.weddingDate) {
      setError('Please select your main wedding date.')
      return
    }

    if (!formData.locationName.trim()) {
      setError('Please specify the wedding city or venue location.')
      return
    }

    setIsLoading(true)

    try {
      const slug = `${formData.brideName}-${formData.groomName}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')

      // 1. Create isolated wedding workspace in MySQL database
      const created = await workspaceApi
        .create({
          brideName: formData.brideName.trim(),
          groomName: formData.groomName.trim(),
          weddingDate: formData.weddingDate,
          city: formData.locationName.trim(),
          venueName: formData.title.trim() || undefined,
          slug,
        })
        .catch((err) => {
          console.warn('Backend workspace creation offline, using local fallback:', err)
          return {
            id: Date.now(),
            brideName: formData.brideName,
            groomName: formData.groomName,
            weddingDate: formData.weddingDate,
            city: formData.locationName,
          }
        })

      const workspaceData = {
        id: created.id || 1,
        brideName: created.brideName || formData.brideName,
        groomName: created.groomName || formData.groomName,
        weddingDate: created.weddingDate || formData.weddingDate,
        locationName: created.city || formData.locationName,
        title: formData.title || `${formData.brideName} & ${formData.groomName}'s Wedding`,
        description: formData.description,
        createdAt: new Date().toISOString(),
      }

      // 2. Persist active wedding session
      localStorage.setItem('weddingos_active_wedding', JSON.stringify(workspaceData))
      window.dispatchEvent(new Event('weddingos_wedding_updated'))

      // 3. Reset local storage caches so new user starts completely fresh with 0 events & 0 guests
      localStorage.removeItem('weddingos_events_custom')
      localStorage.removeItem('weddingos_family_invitations')
      localStorage.removeItem('weddingos_workspace_members')
      localStorage.removeItem('weddingos_website_config')
      localStorage.removeItem('weddingos_gallery_photos')

      setIsLoading(false)
      navigate('/app/dashboard')
    } catch (err: any) {
      setIsLoading(false)
      setError(err?.message || 'Failed to initialize workspace')
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] py-10 px-4 sm:px-6 lg:px-8 bg-[#faf9f6] flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Onboarding Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white gold-border shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#b88444]" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#4b030e]">
              Workspace Onboarding &bull; Step 1 of 1
            </span>
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl font-normal text-[#4b030e] tracking-tight">
            Name Your Wedding Celebration
          </h1>
          <p className="text-xs sm:text-sm text-[#4b030e]/75 font-sans leading-relaxed">
            Enter your key wedding details. This establishes your planning workspace, countdown timer, and wedding website slug.
          </p>
        </div>

        {/* 2-Column Split: Form + Real-time Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7">
            <Card className="shadow-gold-sm border-[#e6bd81]/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Core Wedding Details</CardTitle>
                <CardDescription>
                  You can invite your co-organizers and customize ceremonies after creating the workspace.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <div className="p-3 mb-4 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#a5172a] text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Bride & Groom Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Bride's Name"
                      name="brideName"
                      required
                      value={formData.brideName}
                      onChange={handleChange}
                      placeholder="e.g. Aisha"
                    />
                    <Input
                      label="Groom's Name"
                      name="groomName"
                      required
                      value={formData.groomName}
                      onChange={handleChange}
                      placeholder="e.g. Imran"
                    />
                  </div>

                  {/* Wedding Date & Location Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Main Wedding Date"
                      name="weddingDate"
                      type="date"
                      required
                      value={formData.weddingDate}
                      onChange={handleChange}
                      leftIcon={<Calendar className="w-4 h-4" />}
                    />
                    <Input
                      label="City / Venue Summary"
                      name="locationName"
                      required
                      value={formData.locationName}
                      onChange={handleChange}
                      placeholder="e.g. Bengaluru, Karnataka"
                      leftIcon={<MapPin className="w-4 h-4" />}
                    />
                  </div>

                  {/* Optional Title */}
                  <Input
                    label="Wedding Title (Optional)"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Aisha & Imran's Wedding"
                    helperText="Appears on invitations and dashboard header."
                  />

                  {/* Welcome Message */}
                  <div className="space-y-1.5 font-sans">
                    <label className="text-xs sm:text-sm font-medium text-[#4b030e] tracking-tight">
                      Welcome Message to Guests
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="A short note of gratitude for your families and guests..."
                      className="w-full p-3 rounded-lg border border-[#e6bd81] bg-white text-[#4b030e] text-sm focus:ring-2 focus:ring-[#6f0617]/15 focus:border-[#6f0617] outline-none transition-all placeholder:text-[#4b030e]/40 shadow-2xs"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="w-full shadow-md"
                    >
                      Initialize Wedding Workspace
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Preview Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#b88444] px-1">
              Live Preview of Your Wedding Card
            </div>

            {/* Wedding Crest Card */}
            <div className="bg-gradient-to-br from-[#4b030e] to-[#6f0617] text-white p-7 rounded-2xl border-2 border-[#b88444]/60 shadow-gold-md relative overflow-hidden text-center space-y-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(230,189,129,0.2)_0%,transparent_70%)] pointer-events-none" />

              <div className="w-12 h-12 mx-auto rounded-full bg-white/10 border border-[#e6bd81]/40 flex items-center justify-center text-[#e6bd81]">
                <Heart className="w-5 h-5 fill-[#e6bd81]/20" />
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-widest text-[#e6bd81] font-semibold">
                  Royal Matrimonial Celebration
                </p>
                <h3 className="font-cormorant text-3xl font-normal leading-tight text-white">
                  {formData.brideName || 'Bride'} &amp; {formData.groomName || 'Groom'}
                </h3>
                <p className="text-xs text-white/80 font-sans">
                  {formData.title || 'Wedding Celebration'}
                </p>
              </div>

              <div className="pt-3 border-t border-[#e6bd81]/25 grid grid-cols-2 gap-3 text-left">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[9px] uppercase tracking-wider text-[#e6bd81] block font-semibold">
                    Wedding Date
                  </span>
                  <span className="text-xs text-white font-medium block truncate">
                    {formData.weddingDate ? new Date(formData.weddingDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Set Date'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[9px] uppercase tracking-wider text-[#e6bd81] block font-semibold">
                    Location
                  </span>
                  <span className="text-xs text-white font-medium block truncate">
                    {formData.locationName || 'Location'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/10 border border-[#e6bd81]/30 text-left">
                <span className="text-[9px] uppercase tracking-wider text-[#e6bd81] block font-semibold mb-0.5">
                  Welcome Note
                </span>
                <p className="text-xs text-white/85 line-clamp-2 italic font-cormorant">
                  "{formData.description || 'Welcome note will appear here.'}"
                </p>
              </div>
            </div>

            {/* Checklist items */}
            <div className="bg-white p-4 rounded-xl gold-border shadow-2xs space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4b030e] block">
                Included in Your Workspace:
              </span>
              <div className="flex items-center gap-2 text-xs text-[#4b030e]/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6f0617] shrink-0" />
                <span>One stable guest gallery link with moderation</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#4b030e]/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6f0617] shrink-0" />
                <span>Family invitations with strict attendee caps</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#4b030e]/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6f0617] shrink-0" />
                <span>3 predefined wedding website themes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
