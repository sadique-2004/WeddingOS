import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useClerk, useUser, UserButton } from '@clerk/clerk-react'
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Users2,
  DollarSign,
  Briefcase,
  Globe,
  Camera,
  QrCode,
  ShieldAlert,
  Settings,
  Menu,
  X,
  Clock,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function OrganizerLayout() {
  const navigate = useNavigate()
  const { signOut } = useClerk()
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false) // Initially collapsed as requested
  const [wedding, setWedding] = useState({
    brideName: 'Aisha',
    groomName: 'Imran',
    weddingDate: '2027-02-18',
    locationName: 'Bengaluru, Karnataka',
  })

  // Load from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('weddingos_active_wedding')
      if (stored) {
        setWedding(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    try {
      const target = new Date(wedding.weddingDate).getTime()
      const now = new Date().getTime()
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 0
    } catch {
      return 124
    }
  }

  const daysRemaining = calculateDaysRemaining()

  const navItems = [
    { label: 'Dashboard', to: '/app/dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { label: 'Events & Functions', to: '/app/events', icon: <CalendarDays className="w-5 h-5 shrink-0" /> },
    { label: 'Preparation Tasks', to: '/app/tasks', icon: <CheckSquare className="w-5 h-5 shrink-0" /> },
    { label: 'Family Invitations', to: '/app/invitations', icon: <Users2 className="w-5 h-5 shrink-0" /> },
    { label: 'Budget & Expenses', to: '/app/expenses', icon: <DollarSign className="w-5 h-5 shrink-0" /> },
    { label: 'Vendor Directory', to: '/app/vendors', icon: <Briefcase className="w-5 h-5 shrink-0" /> },
    { label: 'Website & Themes', to: '/app/website', icon: <Globe className="w-5 h-5 shrink-0" /> },
    { label: 'Photo Gallery', to: '/app/gallery', icon: <Camera className="w-5 h-5 shrink-0" /> },
    { label: 'Family Check-In', to: '/app/check-in', icon: <QrCode className="w-5 h-5 shrink-0" /> },
    { label: 'Team Members', to: '/app/members', icon: <ShieldAlert className="w-5 h-5 shrink-0" /> },
    { label: 'Settings', to: '/app/settings', icon: <Settings className="w-5 h-5 shrink-0" /> },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // ignore
    }
    navigate('/sign-in')
  }

  return (
    <div className="min-h-screen flex bg-[#faf9f6] text-[#4b030e] font-sans antialiased">
      {/* ========================================= */}
      {/* DESKTOP SIDEBAR (DEFAULT COLLAPSED ICON)  */}
      {/* ========================================= */}
      <aside
        className={`hidden lg:flex h-screen sticky top-0 flex-col justify-between bg-white border-r border-[#e6bd81]/50 shadow-2xs z-30 shrink-0 transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-72' : 'w-20'
        }`}
      >
        <div className="flex flex-col min-h-0">
          {/* Logo Header & Expand/Collapse Toggle */}
          <div
            className={`flex items-center border-b border-[#e6bd81]/30 shrink-0 ${
              isExpanded ? 'h-16 px-5 justify-between' : 'h-18 justify-center px-2'
            }`}
          >
            {isExpanded ? (
              <>
                <Link to="/" className="flex items-center gap-2">
                  <img
                    src="/WeddingOSLogo.png"
                    alt="WeddingOS"
                    className="h-9 w-auto object-contain"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="w-13 h-13 rounded-2xl flex items-center justify-center hover:bg-[#faf4ec] transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
                title="WeddingOS • Click to expand full details"
              >
                <img
                  src="/favicon.png"
                  alt="WeddingOS"
                  className="h-10 w-10 object-contain rounded-xl group-hover:scale-105 transition-transform"
                />
              </button>
            )}
          </div>

          {/* Active Wedding Crest / Countdown Badge (ONLY SHOWN WHEN EXPANDED) */}
          {isExpanded && (
            <div className="p-3.5 mx-3.5 my-3 rounded-xl bg-gradient-to-r from-[#4b030e] to-[#6f0617] text-white shadow-xs border border-[#b88444]/40 shrink-0">
              <div className="flex items-center justify-between text-[10px] text-[#e6bd81] uppercase tracking-wider font-semibold mb-0.5">
                <span>Active Workspace</span>
                <span className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full text-white text-[10px]">
                  <Clock className="w-3 h-3 text-[#e6bd81]" />
                  {daysRemaining} Days
                </span>
              </div>
              <h4 className="font-cormorant text-lg font-normal leading-tight truncate">
                {wedding.brideName} &amp; {wedding.groomName}
              </h4>
              <p className="text-[10px] text-white/75 truncate mt-0.5">
                {wedding.locationName}
              </p>
            </div>
          )}

          {/* Nav Items List (Directly below logo in collapsed mode) */}
          <nav
            className={`overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
              isExpanded ? 'space-y-1 py-2 px-3' : 'space-y-1 py-2 px-2 flex flex-col items-center'
            }`}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app/dashboard'}
                className={({ isActive }) =>
                  isExpanded
                    ? `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#6f0617] text-white shadow-xs font-semibold'
                          : 'text-[#4b030e]/80 hover:bg-[#faf9f6] hover:text-[#6f0617]'
                      }`
                    : `w-10 h-10 flex items-center justify-center rounded-xl transition-all relative group cursor-pointer ${
                        isActive
                          ? 'bg-[#6f0617] text-white shadow-xs'
                          : 'text-[#4b030e]/80 hover:bg-[#faf9f6] hover:text-[#6f0617]'
                      }`
                }
              >
                {item.icon}
                {isExpanded ? (
                  <span className="truncate">{item.label}</span>
                ) : (
                  /* Floating Tooltip on Hover */
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#3a0208] text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom User Actions */}
        <div
          className={`border-t border-[#e6bd81]/30 shrink-0 bg-white ${
            isExpanded ? 'p-3.5 space-y-1.5' : 'p-2 flex flex-col items-center space-y-1'
          }`}
        >
          {isExpanded ? (
            <>
              <Link
                to="/w/preview"
                target="_blank"
                className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#faf9f6] border border-[#e6bd81]/50 text-xs font-semibold text-[#6f0617] hover:bg-[#fdfaf5] transition-colors"
              >
                <span>Preview Public Site</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#b88444]" />
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#a5172a] hover:bg-[#fef2f2] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/w/preview"
                target="_blank"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-[#faf9f6] hover:text-[#6f0617] transition-colors relative group"
                title="Preview Public Site"
              >
                <ExternalLink className="w-4 h-4" />
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#3a0208] text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Preview Public Site
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:bg-[#faf4ec] hover:text-[#6f0617] transition-colors relative group cursor-pointer"
                title="Expand Menu"
              >
                <ChevronRight className="w-4 h-4" />
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#3a0208] text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Expand Menu
                </div>
              </button>

              <button
                onClick={handleSignOut}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#a5172a] hover:bg-[#fef2f2] transition-colors relative group cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#3a0208] text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Sign Out
                </div>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ========================================= */}
      {/* MOBILE DRAWER OVERLAY                     */}
      {/* ========================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-white flex flex-col justify-between shadow-xl z-10 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e6bd81]/30 pb-3">
                <img src="/WeddingOSLogo.png" alt="WeddingOS" className="h-8 w-auto object-contain" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#4b030e]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#4b030e] text-white">
                <span className="text-[10px] text-[#e6bd81] uppercase font-semibold block">
                  {wedding.brideName} &amp; {wedding.groomName}
                </span>
                <span className="text-xs text-white/80">{daysRemaining} Days to Wedding</span>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium ${
                        isActive ? 'bg-[#6f0617] text-white font-semibold' : 'text-[#4b030e]/80'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 p-2 text-xs font-medium text-[#a5172a] border-t border-[#e6bd81]/30 pt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MAIN VIEWPORT & TOP HEADER                */}
      {/* ========================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-8 border-b border-[#e6bd81]/40 bg-white/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#4b030e] hover:bg-[#faf9f6]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-cormorant text-xl sm:text-2xl font-bold text-[#4b030e] tracking-tight">
                {wedding.brideName} &amp; {wedding.groomName}
              </span>
              <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full bg-[#fbe6e9] text-[#6f0617] font-semibold border border-[#f8cfd5]">
                {daysRemaining} Days Left
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/check-in"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#faf9f6] border border-[#e6bd81] text-xs font-semibold text-[#4b030e] hover:bg-[#fdfaf5]"
            >
              <QrCode className="w-3.5 h-3.5 text-[#b88444]" />
              <span>Reception Check-In</span>
            </Link>

            {/* Profile Avatar fetched from Google/Clerk */}
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center gap-2.5">
                  <UserButton
                    afterSignOutUrl="/sign-in"
                    appearance={{
                      elements: {
                        avatarBox:
                          'w-9 h-9 rounded-full ring-2 ring-[#e6bd81] hover:ring-[#b88444] shadow-xs transition-all',
                        userButtonTrigger: 'focus:outline-none',
                      },
                    }}
                  />
                  {user.fullName && (
                    <span className="hidden md:inline-block text-xs font-semibold text-[#4b030e] max-w-[130px] truncate">
                      {user.fullName}
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#6f0617] text-[#e6bd81] flex items-center justify-center font-bold text-xs shadow-xs border border-[#e6bd81]/50">
                  {wedding.brideName.charAt(0)}{wedding.groomName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
