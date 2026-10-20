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
  ChevronDown,
  ShieldCheck,
  LayoutGrid,
  List,
  Utensils,
  Camera,
  Music,
  Car,
  Gift,
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

const CATEGORY_META: Record<
  VendorCategory,
  {
    icon: React.ComponentType<{ className?: string }>
    bg: string
    text: string
    border: string
    shortLabel: string
  }
> = {
  'Venue & Banquets': {
    icon: Building2,
    bg: 'bg-[#faf4ec]',
    text: 'text-[#85531d]',
    border: 'border-[#e6bd81]/50',
    shortLabel: 'Venue',
  },
  'Decor & Production': {
    icon: Sparkles,
    bg: 'bg-[#fdf2f8]',
    text: 'text-pink-800',
    border: 'border-pink-200',
    shortLabel: 'Decor',
  },
  'Catering & Banquets': {
    icon: Utensils,
    bg: 'bg-[#fef3c7]',
    text: 'text-amber-800',
    border: 'border-amber-300',
    shortLabel: 'Catering',
  },
  'Photography & Cinema': {
    icon: Camera,
    bg: 'bg-[#f0fdf4]',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    shortLabel: 'Cinema',
  },
  'Music & Entertainment': {
    icon: Music,
    bg: 'bg-[#faf5ff]',
    text: 'text-purple-800',
    border: 'border-purple-200',
    shortLabel: 'Music',
  },
  'Bridal & Styling': {
    icon: Sparkles,
    bg: 'bg-[#fbe6e9]',
    text: 'text-[#6f0617]',
    border: 'border-[#f8cfd5]',
    shortLabel: 'Bridal',
  },
  'Logistics & Transport': {
    icon: Car,
    bg: 'bg-[#f0f9ff]',
    text: 'text-sky-800',
    border: 'border-sky-200',
    shortLabel: 'Logistics',
  },
  'Invitations & Gifting': {
    icon: Gift,
    bg: 'bg-[#fff7ed]',
    text: 'text-orange-800',
    border: 'border-orange-200',
    shortLabel: 'Gifting',
  },
  'Priests & Ceremonial': {
    icon: Building2,
    bg: 'bg-[#fffbeb]',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    shortLabel: 'Ceremonial',
  },
  Other: {
    icon: Briefcase,
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-200',
    shortLabel: 'Other',
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: vendors.length }
    vendors.forEach((v) => {
      counts[v.category] = (counts[v.category] || 0) + 1
    })
    return counts
  }, [vendors])

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Locked</span>
          </span>
        )
      case 'IN_DISCUSSION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Negotiating</span>
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-700 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
            <span>Fulfilled</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================= */}
      {/* 1. PAGE HEADER                            */}
      {/* ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6bd81]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdf5ea] border border-[#e6bd81]/40 text-[#85531d] text-[10px] font-bold tracking-widest uppercase mb-1">
            <Sparkles className="w-3 h-3 text-[#85531d]" />
            <span>Palace Partner Network</span>
          </div>
          <h1 className="font-cormorant text-2xl sm:text-4xl font-normal text-[#3a0208] tracking-tight">
            Vendor Directory &amp; Partner Contracts
          </h1>
          <p className="text-xs text-[#4b030e]/75 font-sans mt-0.5">
            Verified suppliers, direct hotlines, committed rates, and operational deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6f0617] hover:bg-[#520411] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor Partner</span>
        </button>
      </div>

      {/* ========================================= */}
      {/* 2. REFINED RESPONSIVE STATS TILES         */}
      {/* ========================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#e6bd81]/40 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">
              Active Partners
            </span>
            <div className="font-sans text-2xl sm:text-3xl font-bold text-[#3a0208] tabular-nums">
              {totalVendors}
            </div>
            <span className="text-[11px] text-neutral-500">Across {uniqueCategories.length} categories</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#faf4ec] border border-[#e6bd81]/50 flex items-center justify-center text-[#85531d] shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#e6bd81]/40 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">
              Total Committed
            </span>
            <div className="font-sans text-2xl sm:text-3xl font-bold text-[#6f0617] tabular-nums">
              {formatCompactINR(totalContractValue)}
            </div>
            <span className="text-[11px] text-neutral-500 truncate block max-w-[120px] tabular-nums" title={formatINR(totalContractValue)}>
              {formatINR(totalContractValue)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fbe6e9] border border-[#f8cfd5] flex items-center justify-center text-[#6f0617] shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#e6bd81]/40 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">
              Contracts Locked
            </span>
            <div className="font-sans text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
              {confirmedCount}
            </div>
            <span className="text-[11px] text-neutral-500">{inDiscussionCount} in discussion</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#e6bd81]/40 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">
              Direct Hotlines
            </span>
            <div className="font-sans text-2xl sm:text-3xl font-bold text-[#b88444] tabular-nums">
              100%
            </div>
            <span className="text-[11px] text-neutral-500">Call &amp; WhatsApp ready</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fdfaf2] border border-[#f6e6be] flex items-center justify-center text-[#b88444] shrink-0">
            <Phone className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. INTERACTIVE CATEGORY QUICK-CHIPS       */}
      {/* ========================================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {/* All Pill */}
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            categoryFilter === 'all'
              ? 'bg-[#6f0617] text-white shadow-xs'
              : 'bg-white border border-[#e6bd81]/40 text-neutral-700 hover:bg-[#faf7f2]'
          }`}
        >
          <span>All Categories</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              categoryFilter === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {categoryCounts['all'] || 0}
          </span>
        </button>

        {/* Individual Category Pills */}
        {(Object.keys(CATEGORY_META) as VendorCategory[]).map((cat) => {
          const meta = CATEGORY_META[cat]
          const CategoryIcon = meta.icon
          const count = categoryCounts[cat] || 0
          const isSelected = categoryFilter === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(isSelected ? 'all' : cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'bg-white border border-[#e6bd81]/40 text-neutral-700 hover:bg-[#faf7f2]'
              }`}
            >
              <CategoryIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-300' : meta.text}`} />
              <span>{meta.shortLabel}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ========================================= */}
      {/* 4. SEARCH, STATUS FILTER & VIEW TOGGLE    */}
      {/* ========================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#faf7f2] p-3 rounded-2xl border border-[#e6bd81]/30">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor name, person, city..."
            className="w-full h-9 pl-9 pr-8 rounded-xl bg-white border border-[#e6bd81]/40 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white border border-[#e6bd81]/40 text-xs font-medium text-neutral-800 outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">All Statuses ({vendors.length})</option>
            <option value="CONFIRMED">Locked ({confirmedCount})</option>
            <option value="IN_DISCUSSION">Negotiating ({inDiscussionCount})</option>
            <option value="COMPLETED">Fulfilled</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-white border border-[#e6bd81]/40 rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#6f0617] text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-[#6f0617] text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Directory Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 5A. VIEW MODE: CARDS GRID (REFINED)       */}
      {/* ========================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredVendors.map((vendor) => {
            const meta = CATEGORY_META[vendor.category] || CATEGORY_META['Other']
            const CategoryIcon = meta.icon
            const isNotesExpanded = expandedNotes[vendor.id]

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl border border-[#e6bd81]/40 hover:border-[#b88444]/60 shadow-xs hover:shadow-md transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Subtle Gold Accent Stripe */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#b88444]/40 to-transparent" />

                <div className="space-y-3">
                  {/* Row 1: Category Tag & Status Badge (ZERO WRAP) */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${meta.bg} ${meta.text} border ${meta.border} whitespace-nowrap shrink-0`}
                    >
                      <CategoryIcon className="w-3 h-3 shrink-0" />
                      <span>{vendor.category}</span>
                    </span>

                    {getStatusBadge(vendor.contractStatus)}
                  </div>

                  {/* Row 2: Company Name & Compact Rate */}
                  <div className="flex items-start justify-between gap-2 pt-0.5">
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-cormorant text-xl sm:text-2xl font-bold text-[#3a0208] leading-tight truncate group-hover:text-[#6f0617] transition-colors"
                        title={vendor.name}
                      >
                        {vendor.name}
                      </h3>

                      {/* Contact Person & Role */}
                      <p className="text-xs text-neutral-600 truncate mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-800">{vendor.contactPerson}</span>
                        {vendor.contactRole && (
                          <>
                            <span className="text-neutral-300">•</span>
                            <span className="text-neutral-500 truncate">{vendor.contactRole}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {vendor.agreedCost ? (
                      <div className="text-right shrink-0">
                        <span
                          className="inline-block font-sans text-sm sm:text-base font-bold text-[#6f0617] bg-[#fdf5ea] px-2.5 py-0.5 rounded-lg border border-[#e6bd81]/40 whitespace-nowrap tabular-nums"
                          title={`Agreed Contract: ${formatINR(vendor.agreedCost)}`}
                        >
                          {formatCompactINR(vendor.agreedCost)}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-medium uppercase tracking-wider block mt-0.5">
                          Agreed
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Row 3: Meta Badges (Ceremony & Short City) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {vendor.relatedCeremony && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#faf7f2] border border-[#e6bd81]/30 text-[#85531d] text-[10px] font-medium whitespace-nowrap">
                        <Calendar className="w-3 h-3 text-[#b88444] shrink-0" />
                        <span className="truncate max-w-[150px]">{vendor.relatedCeremony}</span>
                      </span>
                    )}

                    {vendor.address && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-50 border border-neutral-200 text-neutral-600 text-[10px] font-medium whitespace-nowrap"
                        title={vendor.address}
                      >
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{vendor.address.split(',')[0]}</span>
                      </span>
                    )}
                  </div>

                  {/* Row 4: Expandable Details & Notes (NO WALL OF TEXT!) */}
                  {(vendor.notes || vendor.address) && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => toggleNotes(vendor.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#85531d] hover:text-[#6f0617] transition-colors cursor-pointer"
                      >
                        <span>{isNotesExpanded ? 'Hide Scope Details' : 'View Scope & Notes'}</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${
                            isNotesExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isNotesExpanded && (
                        <div className="mt-2 p-2.5 rounded-xl bg-[#faf7f2] border border-[#e6bd81]/30 text-xs space-y-1.5 animate-fadeIn">
                          {vendor.notes && (
                            <p className="text-[11px] text-neutral-600 italic leading-relaxed">
                              &ldquo;{vendor.notes}&rdquo;
                            </p>
                          )}
                          {vendor.address && (
                            <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-200/60 flex items-start gap-1">
                              <MapPin className="w-3 h-3 text-[#b88444] shrink-0 mt-0.5" />
                              <span>{vendor.address}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Row 5: Action Hotlines Dock */}
                <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1">
                    {/* Call */}
                    {vendor.phoneNumber && (
                      <a
                        href={`tel:${vendor.phoneNumber.replace(/\s+/g, '')}`}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs"
                        title={`Call ${vendor.contactPerson} (${vendor.phoneNumber})`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* WhatsApp */}
                    {vendor.phoneNumber && (
                      <a
                        href={`https://wa.me/${vendor.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Namaste ${vendor.contactPerson}, regarding the upcoming royal wedding with WeddingOS...`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 transition-colors shadow-2xs"
                        title="Send WhatsApp Message"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Email */}
                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="p-1.5 rounded-lg bg-[#faf4ec] hover:bg-[#f3e7d6] text-[#6f0617] border border-[#e6bd81]/40 transition-colors shadow-2xs"
                        title={`Email ${vendor.email}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Website */}
                    {vendor.websiteUrl && (
                      <a
                        href={vendor.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors shadow-2xs"
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
                      className="p-1.5 rounded-lg hover:bg-[#faf4ec] text-[#6f0617] transition-colors cursor-pointer"
                      title="Edit Partner Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vendor.id, vendor.name)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
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
      )}

      {/* ========================================= */}
      {/* 5B. VIEW MODE: COMPACT DIRECTORY TABLE    */}
      {/* ========================================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#e6bd81]/40 shadow-xs overflow-hidden">
          <div className="overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-[#faf7f2] border-b border-[#e6bd81]/30 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Vendor Partner</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Primary Contact</th>
                  <th className="py-3 px-4">Ceremony</th>
                  <th className="py-3 px-4">Agreed Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Hotlines</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredVendors.map((vendor) => {
                  const meta = CATEGORY_META[vendor.category] || CATEGORY_META['Other']
                  const CategoryIcon = meta.icon
                  return (
                    <tr key={vendor.id} className="hover:bg-[#faf7f2]/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-neutral-900 font-cormorant text-base">
                        <div className="font-bold text-[#3a0208]">{vendor.name}</div>
                        {vendor.address && (
                          <div className="text-[10px] text-neutral-400 font-sans truncate max-w-xs">{vendor.address}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.bg} ${meta.text} border ${meta.border} whitespace-nowrap`}>
                          <CategoryIcon className="w-2.5 h-2.5 shrink-0" />
                          <span>{vendor.category}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-800">{vendor.contactPerson}</div>
                        <div className="text-[10px] text-neutral-500">{vendor.contactRole || '—'}</div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        <span className="text-[11px] font-medium text-[#85531d]">{vendor.relatedCeremony || 'All'}</span>
                      </td>
                      <td className="py-3 px-4 font-sans text-xs sm:text-sm font-bold text-[#6f0617] whitespace-nowrap tabular-nums">
                        {vendor.agreedCost ? formatINR(vendor.agreedCost) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(vendor.contractStatus)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {vendor.phoneNumber && (
                            <a href={`tel:${vendor.phoneNumber.replace(/\s+/g, '')}`} className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-700" title="Call">
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {vendor.phoneNumber && (
                            <a href={`https://wa.me/${vendor.phoneNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-green-50 text-emerald-600" title="WhatsApp">
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {vendor.email && (
                            <a href={`mailto:${vendor.email}`} className="p-1.5 rounded-md hover:bg-amber-50 text-[#6f0617]" title="Email">
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {vendor.websiteUrl && (
                            <a href={vendor.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600" title="Website">
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => openEditModal(vendor)} className="p-1.5 rounded-md hover:bg-[#faf4ec] text-[#6f0617]" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => handleDelete(vendor.id, vendor.name)} className="p-1.5 rounded-md hover:bg-red-50 text-neutral-400 hover:text-red-600" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredVendors.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e6bd81]/40 p-10 text-center space-y-3">
          <Building2 className="w-10 h-10 text-neutral-300 mx-auto" />
          <h4 className="text-base font-bold text-neutral-700">No vendor partners found</h4>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            No partner contacts match your search or filter criteria. Click Add Vendor Partner to onboard suppliers.
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
      {/* 6. ADD / EDIT VENDOR MODAL DIALOG         */}
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
                    {Object.keys(CATEGORY_META).map((cat) => (
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
