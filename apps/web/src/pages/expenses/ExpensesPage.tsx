import React, { useState, useMemo } from 'react'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Calendar,
  Building2,
  Tag,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  PieChart,
} from 'lucide-react'

export type ExpenseCategory =
  | 'Venue & Hospitality'
  | 'Catering & Banquets'
  | 'Decor & Production'
  | 'Attire & Jewellery'
  | 'Photography & Cinematography'
  | 'Music & Entertainment'
  | 'Gifting & Invites'
  | 'Logistics & Vintage Cars'
  | 'Ceremonial & Puja'
  | 'Other'

export interface Expense {
  id: string
  title: string
  amount: number
  currencyCode: string
  expenseDate: string
  category: ExpenseCategory
  relatedCeremony?: string
  vendorName?: string
  paymentStatus: 'PAID' | 'ADVANCE_PAID' | 'PENDING'
  paymentMethod?: 'NEFT / RTGS' | 'UPI' | 'Cheque' | 'Credit Card' | 'Cash'
  notes?: string
}

const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; border: string; bar: string }> = {
  'Venue & Hospitality': { bg: 'bg-[#faf4ec]', text: 'text-[#85531d]', border: 'border-[#e6bd81]/40', bar: 'bg-[#85531d]' },
  'Catering & Banquets': { bg: 'bg-[#fef3c7]', text: 'text-amber-800', border: 'border-amber-300', bar: 'bg-amber-600' },
  'Decor & Production': { bg: 'bg-[#fdf2f8]', text: 'text-pink-800', border: 'border-pink-200', bar: 'bg-pink-600' },
  'Attire & Jewellery': { bg: 'bg-[#fbe6e9]', text: 'text-[#6f0617]', border: 'border-[#f8cfd5]', bar: 'bg-[#6f0617]' },
  'Photography & Cinematography': { bg: 'bg-[#f0fdf4]', text: 'text-emerald-800', border: 'border-emerald-200', bar: 'bg-emerald-600' },
  'Music & Entertainment': { bg: 'bg-[#faf5ff]', text: 'text-purple-800', border: 'border-purple-200', bar: 'bg-purple-600' },
  'Gifting & Invites': { bg: 'bg-[#fff7ed]', text: 'text-orange-800', border: 'border-orange-200', bar: 'bg-orange-500' },
  'Logistics & Vintage Cars': { bg: 'bg-[#f0f9ff]', text: 'text-sky-800', border: 'border-sky-200', bar: 'bg-sky-600' },
  'Ceremonial & Puja': { bg: 'bg-[#fffbeb]', text: 'text-yellow-800', border: 'border-yellow-200', bar: 'bg-yellow-600' },
  'Other': { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200', bar: 'bg-neutral-500' },
}

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'The Oberoi Udaivilas 3-Day Resort Buyout Advance',
    amount: 1450000,
    currencyCode: 'INR',
    expenseDate: '2026-10-05',
    category: 'Venue & Hospitality',
    relatedCeremony: 'All Ceremonies',
    vendorName: 'The Oberoi Udaivilas',
    paymentStatus: 'ADVANCE_PAID',
    paymentMethod: 'NEFT / RTGS',
    notes: 'Advance booking for 85 luxury heritage suites, breakfast banquets and lake jetty access.',
  },
  {
    id: 'exp-2',
    title: 'Royal Mewar Floral Mandap & Lotus Stage Decor',
    amount: 420000,
    currencyCode: 'INR',
    expenseDate: '2026-10-10',
    category: 'Decor & Production',
    relatedCeremony: 'Baraat & Pheras',
    vendorName: 'Ferns & Petals Royal Production',
    paymentStatus: 'PAID',
    paymentMethod: 'NEFT / RTGS',
    notes: 'Exotic tuberoses, 500 brass diyas, and floating water lily mandap construction.',
  },
  {
    id: 'exp-3',
    title: 'Bridal Heritage Red Zardozi Lehenga & Veils',
    amount: 380000,
    currencyCode: 'INR',
    expenseDate: '2026-10-12',
    category: 'Attire & Jewellery',
    relatedCeremony: 'Baraat & Pheras',
    vendorName: 'Sabyasachi Mukherjee Atelier',
    paymentStatus: 'PAID',
    paymentMethod: 'Credit Card',
    notes: 'Handcrafted antique dabka and zardozi bridal lehenga with custom monogram embroidery.',
  },
  {
    id: 'exp-4',
    title: 'Live Sufi Troupe & Sangeet Bollywood Audio-Visual Console',
    amount: 275000,
    currencyCode: 'INR',
    expenseDate: '2026-10-14',
    category: 'Music & Entertainment',
    relatedCeremony: 'Sangeet & Cocktail',
    vendorName: 'Dhruva Live Acoustic Symphony',
    paymentStatus: 'ADVANCE_PAID',
    paymentMethod: 'UPI',
    notes: '7-piece live Sufi band + concert sound setup for crescent ballroom evening.',
  },
  {
    id: 'exp-5',
    title: 'Lake Pichola 4K Drone & Candid Cinematography Deck',
    amount: 350000,
    currencyCode: 'INR',
    expenseDate: '2026-10-15',
    category: 'Photography & Cinematography',
    relatedCeremony: 'All Ceremonies',
    vendorName: 'Stories by Joseph Radhik Studios',
    paymentStatus: 'ADVANCE_PAID',
    paymentMethod: 'NEFT / RTGS',
    notes: 'Full multi-camera 4-day team with aerial drones and cinematic wedding film reel.',
  },
  {
    id: 'exp-6',
    title: 'Artisanal Mewari Sweets & Brass Welcome Hampers',
    amount: 110000,
    currencyCode: 'INR',
    expenseDate: '2026-10-16',
    category: 'Gifting & Invites',
    relatedCeremony: 'All Ceremonies',
    vendorName: 'Jodhpur Royal Sweets & Handicrafts',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    notes: '140 personalized engraved brass hampers with Ghewar and saffron dry fruits.',
  },
  {
    id: 'exp-7',
    title: 'Vintage 1948 Rolls Royce & Palace Boat Jetty Transfers',
    amount: 100000,
    currencyCode: 'INR',
    expenseDate: '2026-10-18',
    category: 'Logistics & Vintage Cars',
    relatedCeremony: 'Baraat & Pheras',
    vendorName: 'Udaipur Heritage Vintage Fleet',
    paymentStatus: 'PENDING',
    paymentMethod: 'Cheque',
    notes: 'Groom royal Baraat arrival vintage car permit and 4 luxury motor launches.',
  },
]

export default function ExpensesPage() {
  const [totalBudget, setTotalBudget] = useState<number>(4500000) // Default ₹45 Lakhs
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [budgetInput, setBudgetInput] = useState<string>('4500000')

  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [ceremonyFilter, setCeremonyFilter] = useState<string>('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // Form State
  const [formData, setFormData] = useState<{
    title: string
    amount: number
    currencyCode: string
    expenseDate: string
    category: ExpenseCategory
    relatedCeremony: string
    vendorName: string
    paymentStatus: 'PAID' | 'ADVANCE_PAID' | 'PENDING'
    paymentMethod: 'NEFT / RTGS' | 'UPI' | 'Cheque' | 'Credit Card' | 'Cash'
    notes: string
  }>({
    title: '',
    amount: 50000,
    currencyCode: 'INR',
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'Venue & Hospitality',
    relatedCeremony: 'All Ceremonies',
    vendorName: '',
    paymentStatus: 'PAID',
    paymentMethod: 'NEFT / RTGS',
    notes: '',
  })

  // Format INR currency cleanly
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Format compact Lakhs / Crores
  const formatCompactINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`
    }
    return formatINR(val)
  }

  // Aggregate Metrics
  const totalRecorded = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0)
  }, [expenses])

  const remainingBudget = totalBudget - totalRecorded
  const utilizationPercentage = totalBudget > 0 ? Math.min(Math.round((totalRecorded / totalBudget) * 100), 100) : 0

  const totalPaid = useMemo(() => {
    return expenses
      .filter((e) => e.paymentStatus === 'PAID')
      .reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  const totalAdvancePaid = useMemo(() => {
    return expenses
      .filter((e) => e.paymentStatus === 'ADVANCE_PAID')
      .reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  const totalPendingDues = useMemo(() => {
    return expenses
      .filter((e) => e.paymentStatus === 'PENDING')
      .reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount
    })
    return Object.entries(map)
      .map(([cat, amt]) => ({
        category: cat as ExpenseCategory,
        amount: amt,
        percentage: totalRecorded > 0 ? Math.round((amt / totalRecorded) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [expenses, totalRecorded])

  // Filtered List
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.vendorName && e.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || e.paymentStatus === statusFilter
      const matchesCeremony = ceremonyFilter === 'all' || e.relatedCeremony === ceremonyFilter

      return matchesSearch && matchesCategory && matchesStatus && matchesCeremony
    })
  }, [expenses, searchTerm, categoryFilter, statusFilter, ceremonyFilter])

  const openAddModal = () => {
    setEditingExpense(null)
    setFormData({
      title: '',
      amount: 50000,
      currencyCode: 'INR',
      expenseDate: new Date().toISOString().split('T')[0],
      category: 'Venue & Hospitality',
      relatedCeremony: 'All Ceremonies',
      vendorName: '',
      paymentStatus: 'PAID',
      paymentMethod: 'NEFT / RTGS',
      notes: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item: Expense) => {
    setEditingExpense(item)
    setFormData({
      title: item.title,
      amount: item.amount,
      currencyCode: item.currencyCode,
      expenseDate: item.expenseDate,
      category: item.category,
      relatedCeremony: item.relatedCeremony || 'All Ceremonies',
      vendorName: item.vendorName || '',
      paymentStatus: item.paymentStatus,
      paymentMethod: item.paymentMethod || 'NEFT / RTGS',
      notes: item.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove expense record "${title}"?`)) {
      setExpenses(expenses.filter((e) => e.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingExpense) {
      setExpenses(
        expenses.map((item) =>
          item.id === editingExpense.id
            ? {
                ...item,
                ...formData,
              }
            : item
        )
      )
    } else {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        ...formData,
      }
      setExpenses([newExpense, ...expenses])
    }
    setIsModalOpen(false)
  }

  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(budgetInput)
    if (!isNaN(val) && val > 0) {
      setTotalBudget(val)
      setIsBudgetModalOpen(false)
    }
  }

  // Export CSV Ledger
  const handleExportCSV = () => {
    const headers = ['Title', 'Category', 'Amount (INR)', 'Payment Status', 'Payment Method', 'Date', 'Vendor', 'Ceremony', 'Notes']
    const rows = filteredExpenses.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount,
      e.paymentStatus,
      `"${e.paymentMethod || ''}"`,
      e.expenseDate,
      `"${(e.vendorName || '').replace(/"/g, '""')}"`,
      `"${(e.relatedCeremony || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `WeddingOS_Expense_Ledger_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: Expense['paymentStatus']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Fully Paid</span>
          </span>
        )
      case 'ADVANCE_PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Advance Settled</span>
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span>Pending Due</span>
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
            <span>Financial Governance</span>
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#3a0208] tracking-tight">
            Budget Allocation &amp; Expense Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#4b030e]/75 font-sans mt-0.5">
            Monitor ceremonial spending, vendor advances, catering allocations, and live financial runway across all functions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#e6bd81]/50 hover:bg-[#faf6f0] text-neutral-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
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
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. TOP CORE BUDGET & METRIC CARDS         */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Budget Target */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6bd81]/40 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
              Total Budget Cap
            </span>
            <button
              type="button"
              onClick={() => {
                setBudgetInput(totalBudget.toString())
                setIsBudgetModalOpen(true)
              }}
              className="text-[11px] font-semibold text-[#6f0617] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Cap</span>
            </button>
          </div>

          <div>
            <div className="font-sans text-3xl sm:text-4xl font-bold text-[#3a0208] leading-none tabular-nums">
              {formatCompactINR(totalBudget)}
            </div>
            <span className="text-xs text-neutral-500 font-sans mt-1 block">
              {formatINR(totalBudget)} total target
            </span>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Currency: INR (₹)</span>
            <span className="font-semibold text-emerald-700">Allocated</span>
          </div>
        </div>

        {/* Card 2: Recorded Spending */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6bd81]/40 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
              Recorded Spending
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#fbe6e9] text-[#6f0617] text-[10px] font-bold">
              {utilizationPercentage}% Spent
            </span>
          </div>

          <div>
            <div className="font-sans text-3xl sm:text-4xl font-bold text-[#6f0617] leading-none tabular-nums">
              {formatCompactINR(totalRecorded)}
            </div>
            <span className="text-xs text-neutral-500 font-sans mt-1 block">
              Across {expenses.length} ledger line items
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                utilizationPercentage > 90 ? 'bg-red-600' : utilizationPercentage > 75 ? 'bg-amber-500' : 'bg-[#6f0617]'
              }`}
              style={{ width: `${utilizationPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 3: Remaining Runway */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6bd81]/40 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
              Uncommitted Runway
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              Surplus
            </span>
          </div>

          <div>
            <div className="font-sans text-3xl sm:text-4xl font-bold text-emerald-700 leading-none tabular-nums">
              {formatCompactINR(remainingBudget)}
            </div>
            <span className="text-xs text-neutral-500 font-sans mt-1 block">
              {formatINR(remainingBudget)} left to allocate
            </span>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Buffer Margin:</span>
            <span className="font-semibold text-neutral-800">
              {Math.max(100 - utilizationPercentage, 0)}% Available
            </span>
          </div>
        </div>

        {/* Card 4: Settlement Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6bd81]/40 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
              Cash Flow Status
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#fdf5ea] text-[#85531d] text-[10px] font-bold border border-[#e6bd81]/30">
              Audited
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Paid &amp; Advance:</span>
              <span className="font-bold text-emerald-700">{formatCompactINR(totalPaid + totalAdvancePaid)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Pending Dues:</span>
              <span className="font-bold text-red-600">{formatCompactINR(totalPendingDues)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Vendor Outstanding:</span>
            <span className="font-bold text-[#6f0617]">{expenses.filter((e) => e.paymentStatus === 'PENDING').length} Invoices</span>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. CATEGORY DISTRIBUTION BARS             */}
      {/* ========================================= */}
      <div className="bg-white p-6 rounded-2xl border border-[#e6bd81]/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#85531d]" />
            <h3 className="font-cormorant text-xl font-bold text-[#3a0208]">
              Category Allocation Breakdown
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-medium">
            Ranked by total financial commitment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {categoryBreakdown.map((item) => (
            <div
              key={item.category}
              className="p-3.5 rounded-xl border border-neutral-100 bg-[#fdfbf7] space-y-2 hover:border-[#e6bd81]/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#3a0208] truncate max-w-[170px]">
                  {item.category}
                </span>
                <span className="text-xs font-bold text-[#6f0617]">
                  {formatCompactINR(item.amount)}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${CATEGORY_COLORS[item.category].bar}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>{item.percentage}% of total spent</span>
                <span>{formatINR(item.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================= */}
      {/* 4. FILTERS & SEARCH BAR                   */}
      {/* ========================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#faf7f2] p-4 rounded-2xl border border-[#e6bd81]/30">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expense description, vendor, or notes..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#e6bd81]/40 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] shadow-2xs"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white border border-[#e6bd81]/40 text-xs font-medium text-neutral-800 outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">All Categories ({expenses.length})</option>
            {Object.keys(CATEGORY_COLORS).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white border border-[#e6bd81]/40 text-xs font-medium text-neutral-800 outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">All Statuses</option>
            <option value="PAID">Fully Paid</option>
            <option value="ADVANCE_PAID">Advance Settled</option>
            <option value="PENDING">Pending Dues</option>
          </select>

          {/* Ceremony Filter */}
          <select
            value={ceremonyFilter}
            onChange={(e) => setCeremonyFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white border border-[#e6bd81]/40 text-xs font-medium text-neutral-800 outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">All Ceremonies</option>
            <option value="All Ceremonies">Entire Wedding</option>
            <option value="Haldi & Phoolon Ki Holi">Haldi</option>
            <option value="Mehendi & High Tea">Mehendi</option>
            <option value="Sangeet & Cocktail">Sangeet</option>
            <option value="Baraat & Pheras">Baraat &amp; Pheras</option>
            <option value="Grand Royal Reception">Reception</option>
          </select>
        </div>
      </div>

      {/* ========================================= */}
      {/* 5. EXPENSES LEDGER TABLE / CARD VIEW      */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-[#e6bd81]/40 shadow-xs overflow-hidden">
        
        {/* Table Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#85531d]" />
            <h3 className="font-cormorant text-xl font-bold text-[#3a0208]">
              Recorded Transactions
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#fdf5ea] text-[#85531d] text-xs font-bold border border-[#e6bd81]/40">
              {filteredExpenses.length} items
            </span>
          </div>

          <span className="text-xs font-semibold text-[#6f0617]">
            Filtered Sum: {formatINR(filteredExpenses.reduce((s, e) => s + e.amount, 0))}
          </span>
        </div>

        {/* Rows */}
        {filteredExpenses.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {filteredExpenses.map((expense) => {
              const catStyle = CATEGORY_COLORS[expense.category]
              return (
                <div
                  key={expense.id}
                  className="p-4 sm:p-5 hover:bg-[#fcfaf7] transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group"
                >
                  {/* Left Column: Date, Icon & Details */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Date Badge */}
                    <div className="w-13 h-13 rounded-xl bg-[#faf4ec] border border-[#e6bd81]/40 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] font-bold text-[#b88444] uppercase leading-none">
                        {new Date(expense.expenseDate).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="font-sans text-lg font-bold text-[#4b030e] leading-none mt-0.5 tabular-nums">
                        {new Date(expense.expenseDate).toLocaleDateString('en-US', { day: 'numeric' })}
                      </span>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
                          {expense.category}
                        </span>
                        {getStatusBadge(expense.paymentStatus)}
                        {expense.relatedCeremony && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                            {expense.relatedCeremony}
                          </span>
                        )}
                      </div>

                      <h4 className="font-sans text-sm sm:text-base font-bold text-[#3a0208] group-hover:text-[#6f0617] transition-colors">
                        {expense.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 font-sans">
                        {expense.vendorName && (
                          <span className="flex items-center gap-1 text-[#85531d] font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-[#b88444]" />
                            <span>{expense.vendorName}</span>
                          </span>
                        )}
                        {expense.paymentMethod && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{expense.paymentMethod}</span>
                          </span>
                        )}
                        {expense.notes && (
                          <span className="text-neutral-400 italic truncate max-w-sm">
                            &ldquo;{expense.notes}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Amount & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                    <div className="text-left lg:text-right">
                      <div className="font-sans text-2xl sm:text-3xl font-bold text-[#4b030e] leading-none tabular-nums">
                        {formatINR(expense.amount)}
                      </div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">
                        {expense.currencyCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(expense)}
                        className="p-2 rounded-lg bg-white border border-neutral-200 hover:border-[#b88444] text-neutral-600 hover:text-neutral-900 shadow-2xs transition-all cursor-pointer"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#6f0617]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense.id, expense.title)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 shadow-2xs transition-all cursor-pointer"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-neutral-300 mx-auto" />
            <h4 className="text-sm font-bold text-neutral-700">No recorded expenses found</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No financial records match your search or category filters. Click Record Expense to log a new vendor invoice or advance payment.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6f0617] text-white text-xs font-semibold shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record First Expense</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* 6. RECORD / EDIT EXPENSE MODAL DIALOG     */}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#e6bd81]/40 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdf5ea] border border-[#e6bd81]/40 text-[#85531d] text-[10px] font-bold tracking-widest uppercase mb-1">
                  <Sparkles className="w-3 h-3 text-[#85531d]" />
                  <span>{editingExpense ? 'Modify Transaction' : 'New Transaction'}</span>
                </div>
                <h2 className="font-cormorant text-2xl sm:text-3xl font-semibold text-[#3a0208]">
                  {editingExpense ? 'Edit Expense Record' : 'Record Wedding Expense'}
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
              
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sangeet DJ Sound & Lighting Console"
                  className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Amount (INR ₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 150000"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Expense Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs outline-none cursor-pointer"
                >
                  {Object.keys(CATEGORY_COLORS).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor & Ceremony */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Vendor / Payee Name
                  </label>
                  <input
                    type="text"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    placeholder="e.g. Sabyasachi / Oberoi"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Related Ceremony
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

              {/* Payment Status & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Payment Status *
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentStatus: e.target.value as Expense['paymentStatus'],
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs outline-none cursor-pointer"
                  >
                    <option value="PAID">Fully Paid</option>
                    <option value="ADVANCE_PAID">Advance Settled</option>
                    <option value="PENDING">Pending Due / To Pay</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs outline-none cursor-pointer"
                  >
                    <option value="NEFT / RTGS">NEFT / RTGS Wire</option>
                    <option value="UPI">UPI Instant</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Auditor Notes &amp; Invoice Reference
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Record invoice reference, terms, advance receipts, or settlement milestones..."
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
                  {editingExpense ? 'Save Changes' : 'Record Transaction'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 7. EDIT TOTAL BUDGET MODAL                */}
      {/* ========================================= */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#e6bd81]/40 w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-cormorant text-2xl font-bold text-[#3a0208]">
                Adjust Total Budget Cap
              </h3>
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBudget} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Total Wedding Budget (INR ₹)
                </label>
                <input
                  type="number"
                  min={10000}
                  required
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="e.g. 5000000"
                  className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                />
                <span className="text-[11px] text-neutral-500 block">
                  Current preview: {formatINR(parseFloat(budgetInput) || 0)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#6f0617] hover:bg-[#520411] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Update Budget Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
