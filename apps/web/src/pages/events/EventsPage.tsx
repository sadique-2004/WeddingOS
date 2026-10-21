import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Plus,
  Sparkles,
  Music,
  Heart,
  PartyPopper,
  Edit2,
  Trash2,
  X,
  Shirt,
  Info,
  Users,
} from 'lucide-react'
import { eventsApi } from '../../services/apiClient'

export interface WeddingEvent {
  id: string
  name: string
  eventType: 'haldi' | 'mehendi' | 'sangeet' | 'pheras' | 'reception' | 'other'
  eventDate: string
  dayLabel: string
  startTime: string
  endTime: string
  venueName: string
  address: string
  dressCode: string
  mapUrl?: string
  description: string
  attendeeEstimate?: number
  imageUrl?: string
}

const INITIAL_EVENTS: WeddingEvent[] = []


export default function EventsPage() {
  const getActiveWeddingId = (): number => {
    try {
      const stored = localStorage.getItem('weddingos_active_wedding')
      if (stored) {
        const parsed = JSON.parse(stored)
        return Number(parsed.id) || 1
      }
    } catch {
      // ignore
    }
    return 1
  }

  const [weddingId, setWeddingId] = useState<number>(getActiveWeddingId())
  const [events, setEvents] = useState<WeddingEvent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [filterDay, setFilterDay] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null)

  const loadEvents = async (wid: number) => {
    setLoading(true)
    try {
      const backendEvents = await eventsApi.getAll(wid)
      if (backendEvents && Array.isArray(backendEvents)) {
        setEvents(
          backendEvents.map((be) => ({
            id: String(be.id),
            name: be.name,
            eventType: (be.eventType as WeddingEvent['eventType']) || 'other',
            eventDate: be.eventDate || '',
            dayLabel: be.dayLabel || 'Day 1',
            startTime: be.startTime || '10:00 AM',
            endTime: be.endTime || '01:00 PM',
            venueName: be.venueName || '',
            address: be.address || '',
            dressCode: be.dressCode || '',
            mapUrl: be.mapUrl || '',
            description: be.description || '',
            attendeeEstimate: be.attendeeEstimate || 100,
            imageUrl: be.imageUrl || '',
          }))
        )
      } else {
        setEvents([])
      }
    } catch (err) {
      console.warn('Backend events fetch error/offline, using fallback:', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const wid = getActiveWeddingId()
    setWeddingId(wid)
    loadEvents(wid)

    const handleUpdate = () => {
      const newWid = getActiveWeddingId()
      setWeddingId(newWid)
      loadEvents(newWid)
    }
    window.addEventListener('weddingos_wedding_updated', handleUpdate)
    window.addEventListener('weddingos_active_wedding_changed', handleUpdate)
    return () => {
      window.removeEventListener('weddingos_wedding_updated', handleUpdate)
      window.removeEventListener('weddingos_active_wedding_changed', handleUpdate)
    }
  }, [])

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    eventType: 'other' as WeddingEvent['eventType'],
    eventDate: '2026-12-12',
    dayLabel: 'Day 2',
    startTime: '06:00 PM',
    endTime: '10:00 PM',
    venueName: '',
    address: '',
    dressCode: '',
    mapUrl: '',
    description: '',
    attendeeEstimate: 250,
    imageUrl: '/events/haldi.jpg',
  })

  const getEventImage = (evt: WeddingEvent) => {
    if (evt.imageUrl) return evt.imageUrl
    switch (evt.eventType) {
      case 'haldi':
        return '/events/haldi.jpg'
      case 'mehendi':
        return '/events/mehendi.jpg'
      case 'sangeet':
        return '/events/sangeet.jpg'
      case 'pheras':
        return '/events/pheras.jpg'
      case 'reception':
        return '/events/reception.jpg'
      default:
        return '/events/haldi.jpg'
    }
  }

  const openAddModal = () => {
    setEditingEvent(null)
    setFormData({
      name: '',
      eventType: 'other',
      eventDate: '2026-12-12',
      dayLabel: 'Day 2',
      startTime: '06:00 PM',
      endTime: '10:00 PM',
      venueName: '',
      address: '',
      dressCode: '',
      mapUrl: '',
      description: '',
      attendeeEstimate: 250,
      imageUrl: '/events/haldi.jpg',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (evt: WeddingEvent) => {
    setEditingEvent(evt)
    setFormData({
      name: evt.name,
      eventType: evt.eventType,
      eventDate: evt.eventDate,
      dayLabel: evt.dayLabel,
      startTime: evt.startTime,
      endTime: evt.endTime,
      venueName: evt.venueName,
      address: evt.address,
      dressCode: evt.dressCode,
      mapUrl: evt.mapUrl || '',
      description: evt.description,
      attendeeEstimate: evt.attendeeEstimate || 250,
      imageUrl: evt.imageUrl || getEventImage(evt),
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from your itinerary?`)) {
      const numId = Number(id)
      if (!isNaN(numId)) {
        await eventsApi.delete(numId).catch((err) => console.warn('Backend delete failed:', err))
      }
      setEvents((prev) => prev.filter((e) => e.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      eventType: formData.eventType,
      eventDate: formData.eventDate,
      dayLabel: formData.dayLabel,
      startTime: formData.startTime,
      endTime: formData.endTime,
      venueName: formData.venueName,
      address: formData.address,
      dressCode: formData.dressCode,
      mapUrl: formData.mapUrl,
      description: formData.description,
      attendeeEstimate: formData.attendeeEstimate,
      imageUrl: formData.imageUrl,
    }

    if (editingEvent) {
      const numId = Number(editingEvent.id)
      if (!isNaN(numId)) {
        await eventsApi.update(numId, payload).catch((err) => console.warn('Backend update failed:', err))
      }
      setEvents((prev) =>
        prev.map((evt) => (evt.id === editingEvent.id ? { ...evt, ...formData } : evt))
      )
    } else {
      let createdId = `evt-${Date.now()}`
      try {
        const saved = await eventsApi.create(payload, weddingId)
        if (saved?.id) createdId = String(saved.id)
      } catch (err) {
        console.warn('Backend event create offline:', err)
      }
      const newEvent: WeddingEvent = {
        id: createdId,
        ...formData,
      }
      setEvents((prev) => [...prev, newEvent])
    }
    setIsModalOpen(false)
  }

  const filteredEvents =
    filterDay === 'all'
      ? events
      : events.filter((e) => e.eventDate === filterDay)

  const uniqueDates = Array.from(new Set(events.map((e) => e.eventDate))).sort()

  const getEventIcon = (type: WeddingEvent['eventType']) => {
    switch (type) {
      case 'haldi':
        return <Sparkles className="w-4 h-4 text-amber-500" />
      case 'mehendi':
        return <Sparkles className="w-4 h-4 text-emerald-500" />
      case 'sangeet':
        return <Music className="w-4 h-4 text-purple-400" />
      case 'pheras':
        return <Heart className="w-4 h-4 text-[#e6bd81]" />
      case 'reception':
        return <PartyPopper className="w-4 h-4 text-[#e6bd81]" />
      default:
        return <Calendar className="w-4 h-4 text-[#e6bd81]" />
    }
  }

  return (
    <div className="space-y-8">
      {/* ========================================= */}
      {/* 1. PAGE HEADER                            */}
      {/* ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6bd81]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdf5ea] border border-[#e6bd81]/40 text-[#85531d] text-[10px] font-bold tracking-widest uppercase mb-1.5">
            <Sparkles className="w-3 h-3 text-[#85531d]" />
            <span>Ceremony Run of Show</span>
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#3a0208] tracking-tight">
            Ceremonies &amp; Itinerary Decks
          </h1>
          <p className="text-xs sm:text-sm text-[#4b030e]/75 font-sans mt-0.5">
            Coordinate venues, timings, Google Maps links, and royal dress codes across every multi-day function.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6f0617] hover:bg-[#520411] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ceremony</span>
        </button>
      </div>

      {/* ========================================= */}
      {/* 2. DATE FILTER CHIPS & STATS BAR          */}
      {/* ========================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterDay('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterDay === 'all'
                ? 'bg-[#6f0617] text-white shadow-xs'
                : 'bg-white border border-[#e6bd81]/50 text-[#4b030e] hover:bg-[#faf6f0]'
            }`}
          >
            All Ceremonies ({events.length})
          </button>
          {uniqueDates.map((date, idx) => (
            <button
              key={date}
              type="button"
              onClick={() => setFilterDay(date)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterDay === date
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'bg-white border border-[#e6bd81]/50 text-[#4b030e] hover:bg-[#faf6f0]'
              }`}
            >
              Day {idx + 1} &bull; {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </button>
          ))}
        </div>

        <div className="text-xs text-neutral-500 font-medium">
          Showing <span className="text-[#6f0617] font-bold">{filteredEvents.length}</span> functions
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. CEREMONIES TIMELINE LIST               */}
      {/* ========================================= */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e6bd81]/40 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#fcf6ed] border border-[#e6bd81]/50 flex items-center justify-center text-[#85531d]">
            <Calendar className="w-7 h-7 text-[#b88444]" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-cormorant text-2xl font-normal text-[#3a0208]">
              No Ceremonies Added Yet
            </h3>
            <p className="text-xs text-neutral-500">
              Your wedding itinerary is currently clean. Begin orchestrating your celebration by adding your first sacred ritual, musical sangeet, or gala reception.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6f0617] to-[#4b030e] text-[#f4efe8] text-xs font-semibold hover:shadow-gold-sm transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#e6bd81]" />
            <span>Add First Ceremony</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEvents.map((event, index) => (
          <div
            key={event.id}
            className="group bg-white rounded-2xl border border-[#e6bd81]/40 shadow-xs hover:shadow-gold-sm transition-all duration-300 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* Column 1: Image Showcase (4 cols on desktop) */}
              <div className="lg:col-span-4 relative min-h-[220px] sm:min-h-[250px] lg:min-h-full overflow-hidden bg-neutral-900">
                <img
                  src={getEventImage(event)}
                  alt={event.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/events/haldi.jpg'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 pointer-events-none" />
                
                {/* Top Badge Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#e6bd81]/60 text-[#e6bd81] text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 shadow-md">
                    {getEventIcon(event.eventType)}
                    <span>Sequence 0{index + 1}</span>
                  </span>
                </div>

                {/* Bottom Badge Overlay on Image */}
                <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded bg-[#b88444]/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white">
                    {event.dayLabel}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/95">
                    <Clock className="w-3.5 h-3.5 text-[#e6bd81] shrink-0" />
                    <span>{event.startTime} &ndash; {event.endTime}</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Event Details & Venue (5 cols on desktop) */}
              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[#85531d]">
                    <Calendar className="w-3.5 h-3.5 text-[#b88444]" />
                    <span>
                      {new Date(event.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="font-cormorant text-2xl sm:text-3xl font-semibold text-[#3a0208] leading-tight group-hover:text-[#6f0617] transition-colors">
                    {event.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans line-clamp-3">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {/* Venue & Location */}
                  <div className="bg-[#faf7f2] rounded-xl p-3 border border-[#e6bd81]/30 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#6f0617] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#3a0208] truncate">{event.venueName}</div>
                      <div className="text-[11px] text-neutral-500 truncate">{event.address}</div>
                    </div>
                    {event.mapUrl && (
                      <a
                        href={event.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#e6bd81]/40 text-[#6f0617] text-[11px] font-semibold hover:bg-neutral-50 transition-colors shrink-0 shadow-2xs"
                      >
                        <span>Map</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Dress Code Guidance */}
                  {event.dressCode && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs">
                      <Shirt className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-900">Dress:</span>
                      <span className="text-[11px] font-medium truncate">{event.dressCode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Attendance & Action Bar (3 cols on desktop) */}
              <div className="lg:col-span-3 p-5 sm:p-6 bg-[#fdfbf7] lg:border-l border-t lg:border-t-0 border-[#e6bd81]/30 flex flex-row lg:flex-col justify-between items-center lg:items-end gap-4">
                <div className="space-y-1.5 text-left lg:text-right w-full lg:w-auto">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fbe6e9] border border-[#f8cfd5] text-[#6f0617] text-[10px] font-bold uppercase tracking-wider">
                    <Users className="w-3 h-3 text-[#6f0617]" />
                    <span>Expected Attendance</span>
                  </div>
                  <div className="flex items-baseline justify-start lg:justify-end gap-1.5 pt-0.5">
                    <span className="font-sans text-3xl sm:text-4xl font-bold text-[#4b030e] leading-none tabular-nums">
                      {event.attendeeEstimate || 250}
                    </span>
                    <span className="text-xs font-bold text-[#85531d] uppercase tracking-wider">
                      Guests
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block">
                    Confirmed Invitations
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(event)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-[#b88444] text-neutral-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    title="Edit Ceremony Details"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#6f0617]" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id, event.name)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors cursor-pointer"
                    title="Delete Ceremony"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    )}

      {/* ========================================= */}
      {/* 4. ADD / EDIT CEREMONY MODAL DIALOG       */}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#e6bd81]/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdf5ea] border border-[#e6bd81]/40 text-[#85531d] text-[10px] font-bold tracking-widest uppercase mb-1">
                  <Sparkles className="w-3 h-3 text-[#85531d]" />
                  <span>{editingEvent ? 'Edit Function' : 'New Function'}</span>
                </div>
                <h2 className="font-cormorant text-2xl sm:text-3xl font-semibold text-[#3a0208]">
                  {editingEvent ? 'Modify Ceremony Details' : 'Add Ceremony to Wedding Run-of-Show'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Event Name & Preset Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Ceremony Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sangeet & Cocktail Soiree"
                  className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                />
                
                {/* Indian Wedding Ceremony Quick Fill Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400 font-medium mr-1">Quick Select:</span>
                  {[
                    { label: 'Haldi', type: 'haldi' as const, img: '/events/haldi.jpg' },
                    { label: 'Mehendi', type: 'mehendi' as const, img: '/events/mehendi.jpg' },
                    { label: 'Sangeet', type: 'sangeet' as const, img: '/events/sangeet.jpg' },
                    { label: 'Pheras', type: 'pheras' as const, img: '/events/pheras.jpg' },
                    { label: 'Reception', type: 'reception' as const, img: '/events/reception.jpg' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          name: `${preset.label} Ceremony`,
                          eventType: preset.type,
                          imageUrl: preset.img,
                        })
                      }
                      className="px-2 py-0.5 rounded-md bg-[#faf4ec] hover:bg-[#f3e7d6] text-[#6f0617] text-[10px] font-semibold border border-[#e6bd81]/40 transition-colors"
                    >
                      +{preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Day Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Day Label
                  </label>
                  <input
                    type="text"
                    value={formData.dayLabel}
                    onChange={(e) => setFormData({ ...formData, dayLabel: e.target.value })}
                    placeholder="e.g. Day 2 • Evening"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="e.g. 07:00 PM"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="e.g. 11:30 PM"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>
              </div>

              {/* Venue Name & Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  placeholder="e.g. The Oberoi Udaivilas, Grand Lawn"
                  className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Haridas Ji Ki Magri, Udaipur, Rajasthan"
                  className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                />
              </div>

              {/* Google Maps Link & Dress Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    value={formData.mapUrl}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Dress Code Guidance
                  </label>
                  <input
                    type="text"
                    value={formData.dressCode}
                    onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                    placeholder="e.g. Traditional Silk / Festive Pastels"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>
              </div>

              {/* Expected Attendance Guest Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Expected Attendance (Total Guests)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={formData.attendeeEstimate}
                  onChange={(e) => setFormData({ ...formData, attendeeEstimate: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 250"
                  className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Ceremony Description &amp; Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline rituals, catering notes, musical performances, or guest instructions..."
                  className="w-full p-3 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900 resize-none"
                />
              </div>

              {/* Ceremony Visual Banner Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Ceremony Visual Showcase Photo
                  </label>
                  <span className="text-[10px] text-neutral-500 font-medium">Click to select photo</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Haldi', img: '/events/haldi.jpg' },
                    { label: 'Mehendi', img: '/events/mehendi.jpg' },
                    { label: 'Sangeet', img: '/events/sangeet.jpg' },
                    { label: 'Pheras', img: '/events/pheras.jpg' },
                    { label: 'Reception', img: '/events/reception.jpg' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: item.img })}
                      className={`relative rounded-xl overflow-hidden border-2 aspect-[16/10] group transition-all cursor-pointer ${
                        formData.imageUrl === item.img
                          ? 'border-[#6f0617] ring-2 ring-[#6f0617]/30 scale-[1.02]'
                          : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-1">
                        <span className="text-[10px] font-bold text-white tracking-wider">
                          {item.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#6f0617] hover:bg-[#520411] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  {editingEvent ? 'Save Changes' : 'Create Ceremony'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Footer Info Notice */}
      <div className="p-4 rounded-xl bg-[#faf7f2] border border-[#e6bd81]/40 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#85531d] shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-600 leading-relaxed">
          <strong>Family Invitation Assignment:</strong> In the upcoming Invitations module, each guest family can be granted access to specific ceremonies (e.g. intimate Haldi for close relatives vs. Grand Reception for corporate patrons).
        </div>
      </div>
    </div>
  )
}
