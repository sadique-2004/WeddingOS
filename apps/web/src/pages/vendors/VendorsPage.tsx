import React, { useState, useMemo } from 'react'
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  DollarSign,
  Edit2,
  Trash2,
  X,
  Sparkles,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  FileCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

export type VendorCategory =
  | 'Venue & Banquets'
  | 'Decor & Production'
  | 'Catering & Banquets'
  | 'Photography & Cinema'
  | 'Music & Entertainment'
  | 'Bridal & Styling'
  | 'Logistics & Transport'
  | 'Invitations & Gifting'
  | 'Priests & Ceremonial'
  | 'Other'

export interface VendorContact {
  id: string
  name: string
  category: VendorCategory
  contactPerson: string
  contactRole?: string
  phoneNumber: string
  email?: string
  address?: string
  websiteUrl?: string
  agreedCost?: number
  currencyCode: string
  contractStatus: 'CONFIRMED' | 'IN_DISCUSSION' | 'COMPLETED'
  relatedCeremony?: string
  notes?: string
}

const CATEGORY_THEMES: Record<
  VendorCategory,
  { bg: string; text: string; border: string; badge: string }
> = {
  'Venue & Banquets': {
    bg: 'bg-[#faf4ec]',
    text: 'text-[#85531d]',
    border: 'border-[#e6bd81]/40',
    badge: 'bg-[#85531d]',
  },
  'Decor & Production': {
    bg: 'bg-[#fdf2f8]',
    text: 'text-pink-800',
    border: 'border-pink-200',
    badge: 'bg-pink-600',
  },
  'Catering & Banquets': {
    bg: 'bg-[#fef3c7]',
    text: 'text-amber-800',
    border: 'border-amber-300',
    badge: 'bg-amber-600',
  },
  'Photography & Cinema': {
    bg: 'bg-[#f0fdf4]',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    badge: 'bg-emerald-600',
  },
  'Music & Entertainment': {
    bg: 'bg-[#faf5ff]',
    text: 'text-purple-800',
    border: 'border-purple-200',
    badge: 'bg-purple-600',
  },
  'Bridal & Styling': {
    bg: 'bg-[#fbe6e9]',
    text: 'text-[#6f0617]',
    border: 'border-[#f8cfd5]',
    badge: 'bg-[#6f0617]',
  },
  'Logistics & Transport': {
    bg: 'bg-[#f0f9ff]',
    text: 'text-sky-800',
    border: 'border-sky-200',
    badge: 'bg-sky-600',
  },
  'Invitations & Gifting': {
    bg: 'bg-[#fff7ed]',
    text: 'text-orange-800',
    border: 'border-orange-200',
    badge: 'bg-orange-500',
  },
  'Priests & Ceremonial': {
    bg: 'bg-[#fffbeb]',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    badge: 'bg-yellow-600',
  },
  Other: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-200',
    badge: 'bg-neutral-500',
  },
}

const INITIAL_VENDORS: VendorContact[] = [
  {
    id: 'ven-1',
    name: 'The Oberoi Udaivilas',
    category: 'Venue & Banquets',
    contactPerson: 'Suryaveer Singh Rathore',
    contactRole: 'Director of Palace Hospitality',
    phoneNumber: '+91 98290 12845',
    email: 'events.udaivilas@oberoihotels.com',
    address: 'Haridas Ji Ki Magri, Lake Pichola, Udaipur, Rajasthan 313001',
    websiteUrl: 'https://www.oberoihotels.com/hotels-in-udaipur-udaivilas/',
    agreedCost: 1450000,
    currencyCode: 'INR',
    contractStatus: 'CONFIRMED',
    relatedCeremony: 'All Ceremonies',
    notes: 'Includes lakeside mandap lawn, 85 luxury suites buyout, breakfast banquets, and boat jetty security clearance.',
  },
  {
    id: 'ven-2',
    name: 'Ferns & Petals Royal Production',
    category: 'Decor & Production',
    contactPerson: 'Karan Mehra',
    contactRole: 'Lead Scenographer & Floral Designer',
    phoneNumber: '+91 98114 77201',
    email: 'karan.production@fnp.com',
    address: 'MG Road, South Delhi / Udaipur Hub',
    websiteUrl: 'https://www.fnp.com',
    agreedCost: 420000,
    currencyCode: 'INR',
    contractStatus: 'CONFIRMED',
    relatedCeremony: 'Baraat & Pheras',
    notes: 'Exotic tuberose garlands, 500 hand-hammered brass oil lamps, floating water lily mandap, and mirror walkway.',
  },
  {
    id: 'ven-3',
    name: 'Sabyasachi Mukherjee Atelier',
    category: 'Bridal & Styling',
    contactPerson: 'Shalini Sengupta',
    contactRole: 'Senior Bridal Couturier',
    phoneNumber: '+91 98300 45210',
    email: 'bridal.concierge@sabyasachi.com',
    address: 'Kolkata Headquarters & New Delhi Flagship, One Style Mile',
    websiteUrl: 'https://www.sabyasachi.com',
    agreedCost: 380000,
    currencyCode: 'INR',
    contractStatus: 'CONFIRMED',
    relatedCeremony: 'Baraat & Pheras',
    notes: 'Hand-embroidered zardozi heritage bridal lehenga with custom dupatta monogram, trial on Nov 10.',
  },
  {
    id: 'ven-4',
    name: 'Dhruva Live Acoustic Symphony',
    category: 'Music & Entertainment',
    contactPerson: 'Ustad Aftab Khan',
    contactRole: 'Bandleader & Sufi Vocalist',
    phoneNumber: '+91 98205 33411',
    email: 'bookings@dhruvalive.in',
    address: 'Bandra West, Mumbai, Maharashtra',
    agreedCost: 275000,
    currencyCode: 'INR',
    contractStatus: 'CONFIRMED',
    relatedCeremony: 'Sangeet & Cocktail',
    notes: '7-piece ensemble with harmonium, tabla, acoustic violin, and 12-minute family dance medley medley mix.',
  },
  {
    id: 'ven-5',
    name: 'Stories by Joseph Radhik Studios',
    category: 'Photography & Cinema',
    contactPerson: 'Joseph & Devika',
    contactRole: 'Chief Cinematographers',
    phoneNumber: '+91 98211 99014',
    email: 'weddings@josephradhik.com',
    address: 'Mumbai & Hyderabad',
    websiteUrl: 'https://www.storiesbyjosephradhik.com',
    agreedCost: 350000,
    currencyCode: 'INR',
    contractStatus: 'CONFIRMED',
    relatedCeremony: 'All Ceremonies',
    notes: 'Dual 4K drone cameras, candid photography crew, 3-minute same-day edit reel for reception screen.',
  },
  {
    id: 'ven-6',
    name: 'Udaipur Heritage Vintage Car Fleet',
    category: 'Logistics & Transport',
    contactPerson: 'Mahavir Bhati',
    contactRole: 'Fleet Operations Manager',
    phoneNumber: '+91 94141 88320',
    email: 'royalvintagecars@udaipurheritage.com',
    address: 'City Palace Complex, Udaipur, Rajasthan',
    agreedCost: 100000,
    currencyCode: 'INR',
    contractStatus: 'IN_DISCUSSION',
    relatedCeremony: 'Baraat & Pheras',
    notes: '1948 Rolls Royce Silver Wraith for groom royal entrance + 4 decorated lake launches.',
  },
  {
    id: 'ven-7',
    name: 'Jodhpur Royal Sweets & Handicrafts',
    category: 'Invitations & Gifting',
    contactPerson: 'Poonam Chand Gehlot',
    contactRole: 'Master Confectioner',
    phoneNumber: '+91 98292 66710',
    email: 'gifting@jodhpursweets.in',
    address: 'Clock Tower Market, Jodhpur, Rajasthan',
    agreedCost: 110000,
    currencyCode: 'INR',
    contractStatus: 'CONFIRMED',
    relatedCeremony: 'All Ceremonies',
    notes: '140 hand-carved brass hampers with saffron dry fruits, Ghewar, and ceremonial invite scroll.',
  },
  {
    id: 'ven-8',
    name: 'Pandit Vidyadhar Shastri & Vedic Troupe',
    category: 'Priests & Ceremonial',
    contactPerson: 'Acharya Vidyadhar Shastri',
    contactRole: 'Head Vedic Acharya',
    phoneNumber: '+91 94133 21900',
    address: 'Jagdish Temple Lane, Udaipur',
    agreedCost: 45000,
    currencyCode: 'INR',
    contractStatus: 'CONFIRMED',
    relatedCeremony: 'Baraat & Pheras',
    notes: 'Authentic Sanatan Vivah Vidhi recitation with explanation in Hindi & English for international guests.',
  },
]

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorContact[]>(INITIAL_VENDORS)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<VendorContact | null>(null)

  // Form State
  const [formData, setFormData] = useState<{
    name: string
    category: VendorCategory
    contactPerson: string
    contactRole: string
    phoneNumber: string
    email: string
    address: string
    websiteUrl: string
    agreedCost: number
    currencyCode: string
    contractStatus: 'CONFIRMED' | 'IN_DISCUSSION' | 'COMPLETED'
    relatedCeremony: string
    notes: string
  }>({
    name: '',
    category: 'Decor & Production',
    contactPerson: '',
    contactRole: '',
    phoneNumber: '',
    email: '',
    address: '',
    websiteUrl: '',
    agreedCost: 50000,
    currencyCode: 'INR',
    contractStatus: 'CONFIRMED',
    relatedCeremony: 'All Ceremonies',
    notes: '',
  })

  // Format INR currency
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const formatCompactINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`
    return formatINR(val)
  }

  // Summary Metrics
  const totalVendors = vendors.length
  const totalContractValue = useMemo(() => {
    return vendors.reduce((sum, v) => sum + (v.agreedCost || 0), 0)
  }, [vendors])

  const confirmedCount = vendors.filter((v) => v.contractStatus === 'CONFIRMED').length
  const inDiscussionCount = vendors.filter((v) => v.contractStatus === 'IN_DISCUSSION').length
  const uniqueCategories = Array.from(new Set(vendors.map((v) => v.category)))

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.address && v.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.phoneNumber && v.phoneNumber.includes(searchTerm)) ||
        (v.notes && v.notes.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCat = categoryFilter === 'all' || v.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || v.contractStatus === statusFilter

      return matchesSearch && matchesCat && matchesStatus
    })
  }, [vendors, searchTerm, categoryFilter, statusFilter])

  const openAddModal = () => {
    setEditingVendor(null)
    setFormData({
      name: '',
      category: 'Decor & Production',
      contactPerson: '',
      contactRole: '',
      phoneNumber: '',
      email: '',
      address: '',
      websiteUrl: '',
      agreedCost: 50000,
      currencyCode: 'INR',
      contractStatus: 'CONFIRMED',
      relatedCeremony: 'All Ceremonies',
      notes: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (v: VendorContact) => {
    setEditingVendor(v)
    setFormData({
      name: v.name,
      category: v.category,
      contactPerson: v.contactPerson,
      contactRole: v.contactRole || '',
      phoneNumber: v.phoneNumber,
      email: v.email || '',
      address: v.address || '',
      websiteUrl: v.websiteUrl || '',
      agreedCost: v.agreedCost || 0,
      currencyCode: v.currencyCode || 'INR',
      contractStatus: v.contractStatus,
      relatedCeremony: v.relatedCeremony || 'All Ceremonies',
      notes: v.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove vendor partner "${name}" from your active directory?`)) {
      setVendors(vendors.filter((v) => v.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingVendor) {
      setVendors(
        vendors.map((v) =>
          v.id === editingVendor.id
            ? {
                ...v,
                ...formData,
              }
            : v
        )
      )
    } else {
      const newVendor: VendorContact = {
        id: `ven-${Date.now()}`,
        ...formData,
      }
      setVendors([newVendor, ...vendors])
    }
    setIsModalOpen(false)
  }

  const getStatusBadge = (status: VendorContact['contractStatus']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Contract Locked</span>
          </span>
        )
      case 'IN_DISCUSSION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>In Discussion</span>
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-700 text-[10px] font-bold uppercase tracking-wider">
            <FileCheck className="w-3 h-3 text-neutral-500" />
            <span>Fulfilled</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ========================================= */}
      {/* 1. PAGE HEADER                            */}
      {/* ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6bd81]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdf5ea] border border-[#e6bd81]/40 text-[#85531d] text-[10px] font-bold tracking-widest uppercase mb-1.5">
            <Sparkles className="w-3 h-3 text-[#85531d]" />
            <span>Palace Partner Network</span>
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#3a0208] tracking-tight">
            Vendor Directory &amp; Partner Contracts
          </h1>
          <p className="text-xs sm:text-sm text-[#4b030e]/75 font-sans mt-0.5">
            Maintain verified contracts, direct hotlines, agreed deliverable rates, and operational SLAs across all royal suppliers.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6f0617] hover:bg-[#520411] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor Partner</span>
        </button>
      </div>

      {/* ========================================= */}
      {/* 2. STATS OVERVIEW CARDS                   */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Partners */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6bd81]/40 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">
              Active Partners
            </span>
            <div className="font-cormorant text-3xl font-bold text-[#3a0208]">
              {totalVendors} Vendors
            </div>
            <span className="text-xs text-neutral-500">Across {uniqueCategories.length} categories</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#faf4ec] border border-[#e6bd81]/50 flex items-center justify-center text-[#85531d]">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Contracted Value */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6bd81]/40 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">
              Total Contract Value
            </span>
            <div className="font-cormorant text-3xl font-bold text-[#6f0617]">
              {formatCompactINR(totalContractValue)}
            </div>
            <span className="text-xs text-neutral-500">{formatINR(totalContractValue)} agreed</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#fbe6e9] border border-[#f8cfd5] flex items-center justify-center text-[#6f0617]">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Contracts Confirmed */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6bd81]/40 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">
              Contract Status
            </span>
            <div className="font-cormorant text-3xl font-bold text-emerald-700">
              {confirmedCount} Locked
            </div>
            <span className="text-xs text-neutral-500">{inDiscussionCount} in negotiation</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Operations SLA */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6bd81]/40 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">
              Direct Contact Hotlines
            </span>
            <div className="font-cormorant text-3xl font-bold text-[#b88444]">
              100% Verified
            </div>
            <span className="text-xs text-neutral-500">Call &amp; WhatsApp Ready</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#fdfaf2] border border-[#f6e6be] flex items-center justify-center text-[#b88444]">
            <Phone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. SEARCH & CATEGORY FILTER BAR           */}
      {/* ========================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#faf7f2] p-4 rounded-2xl border border-[#e6bd81]/30">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor name, contact person, city, or phone..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#e6bd81]/40 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] shadow-2xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white border border-[#e6bd81]/40 text-xs font-medium text-neutral-800 outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">All Categories ({vendors.length})</option>
            {Object.keys(CATEGORY_THEMES).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white border border-[#e6bd81]/40 text-xs font-medium text-neutral-800 outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">All Contract Statuses</option>
            <option value="CONFIRMED">Contract Locked</option>
            <option value="IN_DISCUSSION">In Discussion</option>
            <option value="COMPLETED">Fulfilled</option>
          </select>
        </div>
      </div>

      {/* ========================================= */}
      {/* 4. VENDOR PARTNER CARDS GRID              */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => {
          const theme = CATEGORY_THEMES[vendor.category] || CATEGORY_THEMES['Other']
          return (
            <div
              key={vendor.id}
              className="bg-white rounded-2xl border border-[#e6bd81]/40 shadow-xs hover:shadow-gold-sm transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                
                {/* Category & Status Row */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.bg} ${theme.text} border ${theme.border}`}
                  >
                    {vendor.category}
                  </span>
                  {getStatusBadge(vendor.contractStatus)}
                </div>

                {/* Company Name & Agreed Cost */}
                <div>
                  <h3 className="font-cormorant text-2xl font-semibold text-[#3a0208] leading-tight group-hover:text-[#6f0617] transition-colors">
                    {vendor.name}
                  </h3>
                  {vendor.agreedCost ? (
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xs text-neutral-500 font-sans">Agreed Contract:</span>
                      <span className="font-cormorant text-xl font-bold text-[#6f0617]">
                        {formatINR(vendor.agreedCost)}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Contact Person */}
                <div className="bg-[#faf7f2] rounded-xl p-3 border border-[#e6bd81]/30 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#fdf5ea] border border-[#e6bd81]/50 flex items-center justify-center text-[#85531d] shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#3a0208] truncate">
                      {vendor.contactPerson}
                    </div>
                    {vendor.contactRole && (
                      <div className="text-[11px] text-neutral-500 truncate">
                        {vendor.contactRole}
                      </div>
                    )}
                  </div>
                </div>

                {/* Address & Ceremony */}
                <div className="space-y-1.5 text-xs text-neutral-600">
                  {vendor.address && (
                    <div className="flex items-start gap-1.5 text-[11px] text-neutral-500">
                      <MapPin className="w-3.5 h-3.5 text-[#b88444] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{vendor.address}</span>
                    </div>
                  )}

                  {vendor.relatedCeremony && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#85531d] font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-[#b88444] shrink-0" />
                      <span>{vendor.relatedCeremony}</span>
                    </div>
                  )}

                  {vendor.notes && (
                    <p className="text-[11px] text-neutral-500 italic line-clamp-2 pt-1 border-t border-neutral-100">
                      &ldquo;{vendor.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Quick Action Hotlines */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                
                {/* Contact triggers */}
                <div className="flex items-center gap-1.5">
                  {vendor.phoneNumber && (
                    <a
                      href={`tel:${vendor.phoneNumber.replace(/\s+/g, '')}`}
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs"
                      title={`Call ${vendor.contactPerson} (${vendor.phoneNumber})`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {vendor.phoneNumber && (
                    <a
                      href={`https://wa.me/${vendor.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Namaste ${vendor.contactPerson}, regarding the upcoming royal wedding with WeddingOS...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 transition-colors shadow-2xs"
                      title="Send WhatsApp Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {vendor.email && (
                    <a
                      href={`mailto:${vendor.email}`}
                      className="p-2 rounded-lg bg-[#faf4ec] hover:bg-[#f3e7d6] text-[#6f0617] border border-[#e6bd81]/40 transition-colors shadow-2xs"
                      title={`Email ${vendor.email}`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {vendor.websiteUrl && (
                    <a
                      href={vendor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors shadow-2xs"
                      title="Visit Official Website"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Edit & Delete */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(vendor)}
                    className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                    title="Edit Partner Details"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#6f0617]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(vendor.id, vendor.name)}
                    className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete Partner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          )
        })}
      </div>

      {filteredVendors.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e6bd81]/40 p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-neutral-300 mx-auto" />
          <h4 className="text-base font-bold text-neutral-700">No vendor partners found</h4>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            No partner contacts match your search or filter criteria. Click Add Vendor Partner to onboard caterers, choreographers, or decorators.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6f0617] text-white text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Vendor</span>
          </button>
        </div>
      )}

      {/* ========================================= */}
      {/* 5. ADD / EDIT VENDOR MODAL DIALOG         */}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#e6bd81]/40 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdf5ea] border border-[#e6bd81]/40 text-[#85531d] text-[10px] font-bold tracking-widest uppercase mb-1">
                  <Sparkles className="w-3 h-3 text-[#85531d]" />
                  <span>{editingVendor ? 'Modify Partner' : 'New Supplier'}</span>
                </div>
                <h2 className="font-cormorant text-2xl sm:text-3xl font-semibold text-[#3a0208]">
                  {editingVendor ? 'Edit Vendor Details' : 'Onboard Palace Partner'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Vendor Company Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Vendor / Enterprise Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sabyasachi Mukherjee Atelier"
                  className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Vendor Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as VendorCategory })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs outline-none cursor-pointer"
                  >
                    {Object.keys(CATEGORY_THEMES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Contract Status *
                  </label>
                  <select
                    value={formData.contractStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractStatus: e.target.value as VendorContact['contractStatus'],
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs outline-none cursor-pointer"
                  >
                    <option value="CONFIRMED">Contract Locked / Signed</option>
                    <option value="IN_DISCUSSION">In Discussion / Negotiation</option>
                    <option value="COMPLETED">Fulfilled / Completed</option>
                  </select>
                </div>
              </div>

              {/* Contact Person & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Primary Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Shalini Sengupta"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Contact Designation / Title
                  </label>
                  <input
                    type="text"
                    value={formData.contactRole}
                    onChange={(e) => setFormData({ ...formData, contactRole: e.target.value })}
                    placeholder="e.g. Senior Bridal Couturier"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Phone / WhatsApp Hotline *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="e.g. +91 98300 45210"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. bookings@sabyasachi.com"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>
              </div>

              {/* Address & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Address / Studio City
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. One Style Mile, New Delhi"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Portfolio / Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>
              </div>

              {/* Agreed Cost & Assigned Ceremony */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Agreed Contract Value (INR ₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.agreedCost}
                    onChange={(e) =>
                      setFormData({ ...formData, agreedCost: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="e.g. 350000"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Assigned Ceremony
                  </label>
                  <select
                    value={formData.relatedCeremony}
                    onChange={(e) => setFormData({ ...formData, relatedCeremony: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs outline-none cursor-pointer"
                  >
                    <option value="All Ceremonies">Entire Wedding</option>
                    <option value="Haldi & Phoolon Ki Holi">Haldi</option>
                    <option value="Mehendi & High Tea">Mehendi</option>
                    <option value="Sangeet & Cocktail">Sangeet</option>
                    <option value="Baraat & Pheras">Baraat &amp; Pheras</option>
                    <option value="Grand Royal Reception">Reception</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Contract Deliverables &amp; Operational Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Outline payment terms, team size, setup call times, or delivery deadlines..."
                  className="w-full p-3 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#6f0617] hover:bg-[#520411] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  {editingVendor ? 'Save Changes' : 'Confirm Partner Onboarding'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}
