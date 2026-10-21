import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Camera,
  Upload,
  Heart,
  Share2,
  Sparkles,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react'
import { galleryApi, workspacesApi } from '../../services/apiClient'

export interface GalleryPhoto {
  id: string
  url: string
  title: string
  caption?: string
  ceremony: string
  uploaderName: string
  uploaderRole: string
  uploadedAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  fileSize: string
  dimensions: string
  featured?: boolean
  likesCount: number
}

const CEREMONY_CATEGORIES = [
  'All',
  'Haldi & Mehndi',
  'Sangeet Gala',
  'Baraat & Pheras',
  'Reception Night',
  'Guest Candids',
]

const SAMPLE_APPROVED_PHOTOS: GalleryPhoto[] = []


export default function PublicGalleryPage() {
  const { slug } = useParams<{ slug: string }>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Retrieve active wedding or fallback
  const [wedding, setWedding] = useState(() => {
    try {
      const stored = localStorage.getItem('weddingos_active_wedding')
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return {
      id: 1,
      brideName: '',
      groomName: '',
      city: '',
    }
  })

  const weddingId = wedding.id || 1
  const storageKey = `weddingos_${weddingId}_gallery_photos`

  // Photos State
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const generic = localStorage.getItem('weddingos_gallery_photos')
      if (generic) {
        const parsed = JSON.parse(generic)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // ignore
    }
    return []
  })

  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Upload Form
  const [uploaderName, setUploaderName] = useState('')
  const [caption, setCaption] = useState('')
  const [ceremony, setCeremony] = useState('Guest Candids')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Reload photos when updated by organizer or other guests
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(storageKey) || localStorage.getItem('weddingos_gallery_photos')
        if (stored) {
          setPhotos(JSON.parse(stored))
        }
      } catch {
        // ignore
      }
    }
    window.addEventListener('weddingos_gallery_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('weddingos_gallery_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [storageKey])

  // Fetch approved photos and couple details from backend
  useEffect(() => {
    // 1. Fetch real couple names
    workspacesApi.getActive(1).then((active: any) => {
      if (active) {
        setWedding((prev: any) => ({
          ...prev,
          id: active.id || prev.id,
          brideName: active.brideName || prev.brideName,
          groomName: active.groomName || prev.groomName,
          city: active.venueName || active.city || prev.city,
        }))
      }
    }).catch((err: any) => console.warn('Could not load active wedding:', err))

    // 2. Fetch approved Cloudinary photos
    galleryApi.getAll(1).then((backendPhotos) => {
      if (Array.isArray(backendPhotos) && backendPhotos.length > 0) {
        const mapped: GalleryPhoto[] = backendPhotos.map((p: any) => ({
          id: `photo-db-${p.id}`,
          url: p.photoUrl,
          title: p.caption || 'Wedding Memory',
          caption: p.caption,
          ceremony: p.ceremonyTag || 'Guest Candids',
          uploaderName: p.uploaderName || 'Wedding Guest',
          uploaderRole: 'Guest Contributor',
          uploadedAt: p.uploadedAt ? new Date(p.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          status: 'APPROVED',
          fileSize: '3.5 MB',
          dimensions: '3840 x 2560',
          likesCount: p.likesCount || 0,
        }))

        setPhotos((prev) => {
          const dbUrls = new Set(mapped.map((m) => m.url))
          const nonDuplicates = prev.filter((p) => !dbUrls.has(p.url))
          return [...mapped, ...nonDuplicates]
        })
      }
    }).catch((err) => console.warn('Could not load approved photos from backend:', err))
  }, [])

  // Approved Photos Only for public stream
  const approvedPhotos = useMemo(() => {
    return photos.filter((p) => p.status === 'APPROVED')
  }, [photos])

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'All') return approvedPhotos
    return approvedPhotos.filter((p) => p.ceremony === selectedCategory)
  }, [approvedPhotos, selectedCategory])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.')
      return
    }

    const reader = new FileReader()
    setSelectedRawFile(file)
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!previewUrl && !selectedRawFile) {
      alert('Please select a photo to upload.')
      return
    }

    setIsSubmitting(true)

    let finalUrl = previewUrl || ''
    if (selectedRawFile) {
      try {
        const backendPhoto = await galleryApi.uploadFile(selectedRawFile, {
          weddingId: 1,
          caption: caption.trim(),
          ceremonyTag: ceremony,
          uploaderName: uploaderName.trim() || 'Wedding Guest',
        })
        if (backendPhoto?.photoUrl) {
          finalUrl = backendPhoto.photoUrl
        }
      } catch (err) {
        console.warn('Backend Cloudinary upload failed, using local preview:', err)
      }
    }

    const newPhoto: GalleryPhoto = {
      id: `photo-guest-${Date.now()}`,
      url: finalUrl,
      title: caption.trim() ? caption.slice(0, 40) : 'Guest Photo Memory',
      caption: caption.trim() || undefined,
      ceremony: ceremony,
      uploaderName: uploaderName.trim() || 'Wedding Guest',
      uploaderRole: 'Guest Contributor',
      uploadedAt: 'Just now',
      status: 'PENDING', // Submits to couple's moderation queue!
      fileSize: selectedRawFile ? `${(selectedRawFile.size / (1024 * 1024)).toFixed(1)} MB` : '3.8 MB',
      dimensions: '3000 x 2000',
      likesCount: 0,
    }

    const updated = [newPhoto, ...photos]
    setPhotos(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
    localStorage.setItem('weddingos_gallery_photos', JSON.stringify(updated))
    window.dispatchEvent(new Event('weddingos_gallery_updated'))

    setIsSubmitting(false)
    setIsUploadModalOpen(false)
    setPreviewUrl(null)
    setSelectedRawFile(null)
    setCaption('')
    setUploaderName('')

    showToast('Photo uploaded to Cloudinary! It will appear in the gallery as soon as the couple approves it.')
  }

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = photos.map((p) => (p.id === id ? { ...p, likesCount: p.likesCount + 1 } : p))
    setPhotos(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
    localStorage.setItem('weddingos_gallery_photos', JSON.stringify(updated))
    window.dispatchEvent(new Event('weddingos_gallery_updated'))
  }

  const handleDownload = (photo: GalleryPhoto, e: React.MouseEvent) => {
    e.stopPropagation()
    const a = document.createElement('a')
    a.href = photo.url
    a.download = `${photo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    showToast('Download started!')
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#3a0208] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4b030e] text-[#f4efe8] px-5 py-3 rounded-2xl shadow-xl border border-[#e6bd81]/60 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#e6bd81]" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e6bd81]/30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={slug ? `/w/${slug}` : '/'}
            className="p-1.5 rounded-full hover:bg-[#faf4ec] text-[#6f0617] transition-colors"
            title="Back to Wedding Website"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#fdf5ea] border border-[#e6bd81]/40 text-[#85531d] text-[10px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-[#85531d]" />
              <span>Live Matrimonial Stream</span>
            </div>
            <h1 className="font-cormorant text-xl sm:text-2xl font-bold text-[#4b030e] tracking-tight">
              {wedding.brideName} &amp; {wedding.groomName}'s Photo Gallery
            </h1>
          </div>
        </div>

        {/* Upload Trigger Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6f0617] to-[#4b030e] text-[#f4efe8] text-xs sm:text-sm font-semibold hover:shadow-gold-sm transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Camera className="w-4 h-4 text-[#e6bd81]" />
          <span className="hidden sm:inline">Share Your Photos</span>
          <span className="sm:hidden">Upload</span>
        </button>
      </header>

      {/* HERO BANNER */}
      <section className="bg-gradient-to-b from-white to-[#faf8f5] py-10 px-4 sm:px-8 border-b border-[#e6bd81]/20 text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#b88444]">
          {wedding.city || 'Royal Destination Wedding'}
        </span>
        <h2 className="font-cormorant text-3xl sm:text-5xl font-normal text-[#3a0208] max-w-2xl mx-auto leading-tight">
          Captured Memories &amp; Joyous Moments
        </h2>
        <p className="text-xs sm:text-sm text-[#4b030e]/75 max-w-lg mx-auto">
          Scan the tableside standee or upload your snaps directly from your camera. All photos are curated and published in real-time.
        </p>

        {/* Live Stats Capsule */}
        <div className="inline-flex items-center gap-4 px-4 py-2 rounded-full bg-white border border-[#e6bd81]/40 shadow-xs text-xs font-semibold text-[#4b030e] mt-2">
          <span>📸 {approvedPhotos.length} Published Photos</span>
          <span className="text-stone-300">&bull;</span>
          <span className="text-[#85531d]">🔒 Moderated &amp; Private</span>
        </div>
      </section>

      {/* CEREMONY CATEGORY PILLS */}
      <div className="sticky top-[60px] z-30 bg-[#faf8f5]/95 backdrop-blur-md py-3 px-4 sm:px-8 border-b border-[#e6bd81]/25">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CEREMONY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'bg-white border border-[#e6bd81]/50 text-[#4b030e] hover:bg-[#faf4ec]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PHOTO GALLERY STREAM */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-8 flex-1">
        {filteredPhotos.length === 0 ? (
          <div className="p-16 text-center space-y-4 bg-white rounded-3xl border border-[#e6bd81]/40 shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#fcf6ed] border border-[#e6bd81]/50 flex items-center justify-center text-[#85531d]">
              <ImageIcon className="w-8 h-8 text-[#b88444]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">No Photos In This Ceremony Yet</h3>
              <p className="text-xs text-[#4b030e]/70 max-w-sm mx-auto">
                Be the very first guest to capture and upload a photograph for this celebration!
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#6f0617] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-md cursor-pointer hover:bg-[#520411]"
            >
              <Camera className="w-4 h-4 text-[#e6bd81]" />
              <span>Upload First Photo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setLightboxPhoto(photo)}
                className="group bg-white rounded-2xl border border-[#e6bd81]/40 shadow-xs hover:shadow-gold-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Photo Image Box */}
                <div className="relative aspect-4/3 overflow-hidden bg-stone-900">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = '/events/haldi.jpg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Ceremony Tag */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#e6bd81] border border-[#e6bd81]/40 text-[10px] font-bold uppercase tracking-wider">
                    {photo.ceremony}
                  </span>

                  {/* Download on Hover */}
                  <button
                    onClick={(e) => handleDownload(photo, e)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/80 border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                    title="Download Photo"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Photo Info */}
                <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
                  <div>
                    <h3 className="font-cormorant text-lg font-bold text-[#4b030e] leading-snug line-clamp-1">
                      {photo.title}
                    </h3>
                    {photo.caption && (
                      <p className="text-xs text-[#4b030e]/75 line-clamp-2 mt-0.5 font-sans italic">
                        "{photo.caption}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#e6bd81]/25 flex items-center justify-between text-[11px] text-[#4b030e]/70">
                    <span className="font-medium truncate max-w-[140px]">By {photo.uploaderName}</span>
                    <button
                      onClick={(e) => handleLike(photo.id, e)}
                      className="inline-flex items-center gap-1 text-[#6f0617] hover:scale-110 transition-transform font-bold"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#6f0617]" />
                      <span>{photo.likesCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-[#e6bd81]/40 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Bar */}
            <div className="flex items-center justify-between p-4 bg-black/50 border-b border-white/10 text-white">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#e6bd81] font-bold">
                  {lightboxPhoto.ceremony}
                </span>
                <h3 className="font-cormorant text-xl font-bold">{lightboxPhoto.title}</h3>
              </div>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image View */}
            <div className="relative max-h-[70vh] flex items-center justify-center p-2 bg-black">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-black/60 border-t border-white/10 text-white flex items-center justify-between">
              <span className="text-xs text-white/70">Uploaded by {lightboxPhoto.uploaderName}</span>
              <button
                onClick={(e) => handleDownload(lightboxPhoto, e)}
                className="px-4 py-1.5 rounded-xl bg-[#6f0617] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#520411]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download High-Res</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#e6bd81]/60 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e6bd81]/30 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#b88444]" />
                <h3 className="font-cormorant text-2xl font-bold text-[#4b030e]">Share Wedding Photo</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              {/* File Dropzone / Picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-2xl border-2 border-dashed border-[#e6bd81] bg-[#faf4ec]/60 hover:bg-[#faf4ec] transition-colors text-center cursor-pointer space-y-2"
              >
                {previewUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[#e6bd81]/50">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      Change Photo
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#b88444] mx-auto" />
                    <p className="text-xs font-bold text-[#4b030e]">Tap to select photo from phone or computer</p>
                    <p className="text-[10px] text-[#4b030e]/70">Camera capture, JPEG, PNG, WEBP supported</p>
                  </>
                )}
              </div>

              {/* Your Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#4b030e]">Your Name / Relation</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul (Cousin of Groom)"
                  required
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#6f0617] outline-hidden"
                />
              </div>

              {/* Ceremony Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#4b030e]">Ceremony</label>
                <select
                  value={ceremony}
                  onChange={(e) => setCeremony(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#6f0617] outline-hidden bg-white"
                >
                  <option value="Haldi & Mehndi">Haldi &amp; Mehndi</option>
                  <option value="Sangeet Gala">Sangeet Gala</option>
                  <option value="Baraat & Pheras">Baraat &amp; Pheras</option>
                  <option value="Reception Night">Reception Night</option>
                  <option value="Guest Candids">Guest Candids</option>
                </select>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#4b030e]">Caption / Wish to Couple</label>
                <input
                  type="text"
                  placeholder="e.g. Wishing you both a lifetime of happiness!"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#6f0617] outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !previewUrl}
                  className="px-5 py-2 rounded-xl bg-[#6f0617] hover:bg-[#520411] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Uploading...' : 'Submit Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
