import React, { useState } from 'react'
import {
  Users2,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Search,
  MessageSquare,
  Share2,
  Copy,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Phone,
  Mail,
  Check,
  Download,
} from 'lucide-react'

export interface FamilyInvitation {
  id: string
  displayName: string
  primaryContactName: string
  phoneNumber: string
  email?: string
  circle: 'Nanihal (Maternal)' | 'Dadihal (Paternal)' | 'Friends & Colleagues' | 'VIP Patrons' | 'International'
  maxAttendees: number
  actualAttendees: number
  rsvpStatus: 'PENDING' | 'ATTENDING' | 'NOT_ATTENDING'
  ceremoniesAllowed: string[]
  dietaryNotes?: string
  invitationToken: string
}

const INITIAL_INVITATIONS: FamilyInvitation[] = [
  {
    id: 'inv-1',
    displayName: 'The Singhania Family',
    primaryContactName: 'Rajesh Singhania',
    phoneNumber: '+91 98201 44521',
    email: 'rajesh.singhania@mewartextiles.com',
    circle: 'Dadihal (Paternal)',
    maxAttendees: 5,
    actualAttendees: 5,
    rsvpStatus: 'ATTENDING',
    ceremoniesAllowed: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
    dietaryNotes: 'Strict Jain Catering (No root vegetables) for 2 elders',
    invitationToken: 'wos-singhania-8821',
  },
  {
    id: 'inv-2',
    displayName: 'Justice & Mrs. Verma',
    primaryContactName: 'Justice Alok Verma',
    phoneNumber: '+91 98110 99823',
    email: 'alok.verma@delhicourts.gov.in',
    circle: 'VIP Patrons',
    maxAttendees: 2,
    actualAttendees: 2,
    rsvpStatus: 'ATTENDING',
    ceremoniesAllowed: ['Sangeet', 'Pheras', 'Reception'],
    dietaryNotes: 'Diabetic dessert alternatives requested',
    invitationToken: 'wos-verma-4192',
  },
  {
    id: 'inv-3',
    displayName: 'The Roy Chowdhury Clan',
    primaryContactName: 'Subir Roy Chowdhury',
    phoneNumber: '+91 98300 23145',
    email: 'subir@kolkatatea.in',
    circle: 'Nanihal (Maternal)',
    maxAttendees: 6,
    actualAttendees: 4,
    rsvpStatus: 'ATTENDING',
    ceremoniesAllowed: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
    dietaryNotes: 'Standard Royal Indian Vegetarian & Non-Veg',
    invitationToken: 'wos-chowdhury-7301',
  },
  {
    id: 'inv-4',
    displayName: 'Dr. Siddharth & Dr. Neha Kapoor',
    primaryContactName: 'Dr. Siddharth Kapoor',
    phoneNumber: '+44 7911 123456',
    email: 'sid.kapoor@nhs.uk',
    circle: 'International',
    maxAttendees: 3,
    actualAttendees: 0,
    rsvpStatus: 'PENDING',
    ceremoniesAllowed: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
    dietaryNotes: 'Nut allergy for 1 child',
    invitationToken: 'wos-kapoor-9920',
  },
  {
    id: 'inv-5',
    displayName: 'Vikramaditya Oberoi & Partners',
    primaryContactName: 'Vikramaditya Oberoi',
    phoneNumber: '+91 98210 65432',
    email: 'v.oberoi@palacecapital.com',
    circle: 'Friends & Colleagues',
    maxAttendees: 2,
    actualAttendees: 0,
    rsvpStatus: 'PENDING',
    ceremoniesAllowed: ['Sangeet', 'Reception'],
    invitationToken: 'wos-oberoi-3310',
  },
  {
    id: 'inv-6',
    displayName: 'Col. Ranjit Singh Rathore',
    primaryContactName: 'Col. Ranjit Singh',
    phoneNumber: '+91 94140 88219',
    email: 'ranjit.rathore@rajasthanregiment.org',
    circle: 'Dadihal (Paternal)',
    maxAttendees: 4,
    actualAttendees: 0,
    rsvpStatus: 'NOT_ATTENDING',
    ceremoniesAllowed: ['Baraat', 'Reception'],
    dietaryNotes: 'Sending ceremonial blessings and token from Jodhpur',
    invitationToken: 'wos-rathore-1092',
  },
]

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<FamilyInvitation[]>(INITIAL_INVITATIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [circleFilter, setCircleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [editingInv, setEditingInv] = useState<FamilyInvitation | null>(null)
  const [selectedInvForShare, setSelectedInvForShare] = useState<FamilyInvitation | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    primaryContactName: '',
    phoneNumber: '',
    email: '',
    circle: 'Dadihal (Paternal)' as FamilyInvitation['circle'],
    maxAttendees: 4,
    actualAttendees: 0,
    rsvpStatus: 'PENDING' as FamilyInvitation['rsvpStatus'],
    ceremoniesAllowed: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
    dietaryNotes: '',
  })

  const openAddModal = () => {
    setEditingInv(null)
    setFormData({
      displayName: '',
      primaryContactName: '',
      phoneNumber: '+91 ',
      email: '',
      circle: 'Dadihal (Paternal)',
      maxAttendees: 4,
      actualAttendees: 0,
      rsvpStatus: 'PENDING',
      ceremoniesAllowed: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
      dietaryNotes: '',
    })
    setIsFormModalOpen(true)
  }

  const openEditModal = (inv: FamilyInvitation) => {
    setEditingInv(inv)
    setFormData({
      displayName: inv.displayName,
      primaryContactName: inv.primaryContactName,
      phoneNumber: inv.phoneNumber,
      email: inv.email || '',
      circle: inv.circle,
      maxAttendees: inv.maxAttendees,
      actualAttendees: inv.actualAttendees,
      rsvpStatus: inv.rsvpStatus,
      ceremoniesAllowed: inv.ceremoniesAllowed,
      dietaryNotes: inv.dietaryNotes || '',
    })
    setIsFormModalOpen(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from your royal invitation register?`)) {
      setInvitations(invitations.filter((i) => i.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingInv) {
      setInvitations(
        invitations.map((i) =>
          i.id === editingInv.id ? { ...i, ...formData } : i
        )
      )
    } else {
      const token = `wos-${formData.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
      const newInv: FamilyInvitation = {
        id: `inv-${Date.now()}`,
        invitationToken: token,
        ...formData,
      }
      setInvitations([...invitations, newInv])
    }
    setIsFormModalOpen(false)
  }

  const handleCopyLink = (token: string) => {
    const fullLink = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(fullLink)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const openWhatsAppDialog = (inv: FamilyInvitation) => {
    setSelectedInvForShare(inv)
    setIsWhatsAppModalOpen(true)
  }

  // Filtered List
  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch =
      inv.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.primaryContactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.phoneNumber.includes(searchQuery)

    const matchesCircle = circleFilter === 'all' || inv.circle === circleFilter
    const matchesStatus = statusFilter === 'all' || inv.rsvpStatus === statusFilter

    return matchesSearch && matchesCircle && matchesStatus
  })

  // Statistics
  const totalFamilies = invitations.length
  const attendingFamilies = invitations.filter((i) => i.rsvpStatus === 'ATTENDING').length
  const pendingFamilies = invitations.filter((i) => i.rsvpStatus === 'PENDING').length
  const regretsFamilies = invitations.filter((i) => i.rsvpStatus === 'NOT_ATTENDING').length

  const totalConfirmedGuests = invitations
    .filter((i) => i.rsvpStatus === 'ATTENDING')
    .reduce((acc, curr) => acc + curr.actualAttendees, 0)
  const maxCapacityGuests = invitations.reduce((acc, curr) => acc + curr.maxAttendees, 0)

  return (
    <div className="space-y-8">
      {/* ========================================= */}
      {/* 1. HEADER SECTION                         */}
      {/* ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6bd81]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdf5ea] border border-[#e6bd81]/40 text-[#85531d] text-[10px] font-bold tracking-widest uppercase mb-1.5">
            <Sparkles className="w-3 h-3 text-[#85531d]" />
            <span>Family-Unit RSVP Protocol</span>
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#3a0208] tracking-tight">
            Family Invitations &amp; RSVP Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[#4b030e]/75 font-sans mt-0.5">
            Curate joint-family invitation quotas, WhatsApp dispatch cards, and ceremony-specific access controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              alert('Exporting complete Royal Guest Matrix (CSV format).')
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#e6bd81]/50 text-[#4b030e] text-xs font-semibold hover:bg-[#faf6f0] transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#b88444]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6f0617] hover:bg-[#520411] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Family Invitation</span>
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. STATS OVERVIEW CARDS                   */}
      {/* ========================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Families */}
        <div className="bg-white p-4 rounded-xl border border-[#e6bd81]/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">Invited Circles</span>
            <span className="font-cormorant text-2xl sm:text-3xl font-bold text-[#3a0208]">{totalFamilies} Families</span>
            <span className="text-[10px] text-neutral-400 block mt-0.5">Max {maxCapacityGuests} total guest cap</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#faf4ec] border border-[#e6bd81]/40 flex items-center justify-center text-[#6f0617]">
            <Users2 className="w-5 h-5" />
          </div>
        </div>

        {/* Confirmed Attending */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-800 block">Confirmed RSVPs</span>
              <span className="font-cormorant text-2xl sm:text-3xl font-bold text-emerald-900">
                {totalConfirmedGuests} Guests
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">
            {attendingFamilies} families verified attendance
          </div>
        </div>

        {/* Pending RSVPs */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-700 block">Awaiting Response</span>
            <span className="font-cormorant text-2xl sm:text-3xl font-bold text-amber-900">{pendingFamilies} Families</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">Automated nudge ready</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Regrets */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">Regrets Received</span>
            <span className="font-cormorant text-2xl sm:text-3xl font-bold text-neutral-600">{regretsFamilies} Families</span>
            <span className="text-[10px] text-neutral-400 block mt-0.5">Reallocated seats available</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. SEARCH & CIRCLE FILTER TABS            */}
      {/* ========================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#faf7f2] p-3 rounded-2xl border border-[#e6bd81]/30">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search family name, primary contact, or phone..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-neutral-300 bg-white text-xs outline-none focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617]"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-medium text-neutral-800 outline-none cursor-pointer"
          >
            <option value="all">All RSVP States</option>
            <option value="ATTENDING">Confirmed Attending</option>
            <option value="PENDING">Pending Response</option>
            <option value="NOT_ATTENDING">Declined</option>
          </select>

          {/* Circle Dropdown */}
          <select
            value={circleFilter}
            onChange={(e) => setCircleFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-medium text-neutral-800 outline-none cursor-pointer"
          >
            <option value="all">All Family Circles</option>
            <option value="Nanihal (Maternal)">Nanihal Side</option>
            <option value="Dadihal (Paternal)">Dadihal Side</option>
            <option value="Friends & Colleagues">Friends &amp; Colleagues</option>
            <option value="VIP Patrons">VIP Patrons</option>
            <option value="International">International Guests</option>
          </select>
        </div>
      </div>

      {/* ========================================= */}
      {/* 4. INVITATIONS LIST TABLE                 */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-[#e6bd81]/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf7f2] text-neutral-500 font-bold uppercase tracking-wider text-[10px] border-b border-[#e6bd81]/30">
              <tr>
                <th className="py-3.5 px-5">Family / Circle</th>
                <th className="py-3.5 px-4">Primary Contact</th>
                <th className="py-3.5 px-4 text-center">RSVP &amp; Headcount</th>
                <th className="py-3.5 px-4">Ceremony Access</th>
                <th className="py-3.5 px-4">Bespoke Guest Link</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredInvitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#fcfaf7] transition-colors">
                  {/* Family Name & Circle */}
                  <td className="py-4 px-5">
                    <div className="font-bold text-sm text-[#3a0208]">{inv.displayName}</div>
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#faf4ec] text-[#85531d] border border-[#e6bd81]/30">
                      <span>{inv.circle}</span>
                    </div>
                    {inv.dietaryNotes && (
                      <div className="text-[10px] text-amber-700 italic mt-1 max-w-xs truncate">
                        ⚠️ {inv.dietaryNotes}
                      </div>
                    )}
                  </td>

                  {/* Primary Contact */}
                  <td className="py-4 px-4">
                    <div className="font-medium text-neutral-800">{inv.primaryContactName}</div>
                    <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] mt-0.5">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      <span>{inv.phoneNumber}</span>
                    </div>
                    {inv.email && (
                      <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[140px]">{inv.email}</span>
                      </div>
                    )}
                  </td>

                  {/* RSVP & Headcount */}
                  <td className="py-4 px-4 text-center">
                    {inv.rsvpStatus === 'ATTENDING' && (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <Check className="w-3 h-3" />
                          <span>Attending</span>
                        </span>
                        <span className="font-bold text-sm text-[#3a0208] mt-1">
                          {inv.actualAttendees} <span className="text-neutral-400 text-xs">/ {inv.maxAttendees}</span>
                        </span>
                      </div>
                    )}
                    {inv.rsvpStatus === 'PENDING' && (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                        <span className="text-neutral-500 text-xs mt-1">
                          Max {inv.maxAttendees} Guests
                        </span>
                      </div>
                    )}
                    {inv.rsvpStatus === 'NOT_ATTENDING' && (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-bold text-[10px]">
                          <span>Declined</span>
                        </span>
                        <span className="text-neutral-400 text-xs mt-1">0 Guests</span>
                      </div>
                    )}
                  </td>

                  {/* Ceremonies Allowed */}
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {inv.ceremoniesAllowed.map((c) => (
                        <span
                          key={c}
                          className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-neutral-100 text-neutral-700"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Guest Token & Direct Link */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(inv.invitationToken)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#faf7f2] border border-[#e6bd81]/40 text-[#6f0617] hover:bg-[#f3ede3] transition-colors font-medium text-[11px]"
                        title="Copy direct invitation link"
                      >
                        {copiedToken === inv.invitationToken ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`/invite/${inv.invitationToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-neutral-400 hover:text-[#6f0617] transition-colors"
                        title="Preview Guest View"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* WhatsApp Dispatch Button */}
                      <button
                        type="button"
                        onClick={() => openWhatsAppDialog(inv)}
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                        title="Dispatch personalized WhatsApp invitation"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEditModal(inv)}
                        className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                        title="Edit Invitation"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(inv.id, inv.displayName)}
                        className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* 5. ADD / EDIT INVITATION MODAL            */}
      {/* ========================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#e6bd81]/40 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="font-cormorant text-2xl font-semibold text-[#3a0208]">
                {editingInv ? 'Edit Family Invitation' : 'Create New Family Invitation'}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Family Display Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Family / Invitation Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. The Singhania Family"
                  className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] outline-none text-xs"
                />
              </div>

              {/* Primary Contact & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Primary Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.primaryContactName}
                    onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                    placeholder="e.g. Rajesh Singhania"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    WhatsApp Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+91 98201 44521"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] outline-none text-xs"
                  />
                </div>
              </div>

              {/* Circle & Max Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Family Circle Grouping
                  </label>
                  <select
                    value={formData.circle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        circle: e.target.value as FamilyInvitation['circle'],
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs outline-none cursor-pointer"
                  >
                    <option value="Dadihal (Paternal)">Dadihal (Paternal Side)</option>
                    <option value="Nanihal (Maternal)">Nanihal (Maternal Side)</option>
                    <option value="Friends & Colleagues">Friends &amp; Colleagues</option>
                    <option value="VIP Patrons">VIP Patrons &amp; Dignitaries</option>
                    <option value="International">International Guests</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Max Permitted Attendees
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 1 })}
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] outline-none text-xs"
                  />
                </div>
              </div>

              {/* Ceremony Access checkboxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Ceremonial Access Granted
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'].map((ceremony) => {
                    const isChecked = formData.ceremoniesAllowed.includes(ceremony)
                    return (
                      <button
                        key={ceremony}
                        type="button"
                        onClick={() => {
                          const updated = isChecked
                            ? formData.ceremoniesAllowed.filter((c) => c !== ceremony)
                            : [...formData.ceremoniesAllowed, ceremony]
                          setFormData({ ...formData, ceremoniesAllowed: updated })
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-[#6f0617] border-[#6f0617] text-white shadow-2xs font-semibold'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {isChecked ? `✓ ${ceremony}` : `+ ${ceremony}`}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Dietary notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Dietary Preferences / Special Requests
                </label>
                <input
                  type="text"
                  value={formData.dietaryNotes}
                  onChange={(e) => setFormData({ ...formData, dietaryNotes: e.target.value })}
                  placeholder="e.g. Strict Jain Catering, Wheelchair assistance"
                  className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#6f0617] hover:bg-[#520411] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  {editingInv ? 'Save Changes' : 'Create Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 6. WHATSAPP DISPATCH MODAL                */}
      {/* ========================================= */}
      {isWhatsAppModalOpen && selectedInvForShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#e6bd81]/40 w-full max-w-lg p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cormorant text-xl font-bold text-[#3a0208]">
                    WhatsApp Invitation Dispatch
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    To: {selectedInvForShare.displayName} ({selectedInvForShare.phoneNumber})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Preview Box */}
            <div className="p-4 rounded-xl bg-[#faf7f2] border border-[#e6bd81]/40 text-xs text-[#3a0208] space-y-3 font-sans leading-relaxed">
              <p>
                🌸 <strong>Shree Ganeshay Namah</strong> 🌸
              </p>
              <p>
                Dearest <strong>{selectedInvForShare.displayName}</strong>,
              </p>
              <p>
                With immense joy and the blessings of our elders, we cordially invite your esteemed family to celebrate the holy union of <strong>Ananya &amp; Kabir</strong> at The Oberoi Udaivilas, Udaipur (Dec 11–13, 2026).
              </p>
              <p>
                Please view your bespoke wedding itinerary, ceremony dress codes, and confirm your family attendance using your private portal link below:
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-[#e6bd81]/60 font-mono text-[11px] text-[#6f0617] break-all">
                {window.location.origin}/invite/{selectedInvForShare.invitationToken}
              </div>
              <p className="text-[11px] text-neutral-500">
                Warm regards,
                <br />
                The Singhania &amp; Roy Families
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  const text = `🌸 Shree Ganeshay Namah 🌸\n\nDearest ${selectedInvForShare.displayName},\n\nWe cordially invite your family to celebrate the wedding of Ananya & Kabir in Udaipur.\n\nPlease confirm your RSVP and view ceremony details at:\n${window.location.origin}/invite/${selectedInvForShare.invitationToken}\n\nWarm regards,\nThe Families`
                  navigator.clipboard.writeText(text)
                  alert('WhatsApp message copied to clipboard!')
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Message</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?phone=${selectedInvForShare.phoneNumber.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(
                  `🌸 Shree Ganeshay Namah 🌸\n\nDearest ${selectedInvForShare.displayName},\n\nWith immense joy, we cordially invite your esteemed family to celebrate the holy union of Ananya & Kabir at The Oberoi Udaivilas, Udaipur (Dec 11–13, 2026).\n\nPlease view your bespoke itinerary & confirm your family attendance here:\n${window.location.origin}/invite/${selectedInvForShare.invitationToken}\n\nWarm regards,\nThe Families`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Open in WhatsApp &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
