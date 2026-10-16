import { Link, Outlet } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#2d2a2a] font-sans antialiased selection:bg-[#e6bd81]/40 selection:text-[#4b030e]">
      {/* ========================================== */}
      {/* TOP STICKY NAVIGATION BAR                  */}
      {/* ========================================== */}
      <header className="sticky top-0 z-50 w-full bg-[#faf9f6]/90 backdrop-blur-md border-b border-[#e6bd81]/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/WeddingOSLogo.png"
              alt="WeddingOS"
              className="h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4b030e]/80">
            <a href="/#features" className="hover:text-[#6f0617] transition-colors">Features</a>
            <a href="/#themes" className="hover:text-[#6f0617] transition-colors">Themes</a>
            <a href="/#schedule" className="hover:text-[#6f0617] transition-colors">Ceremony Matrix</a>
            <a href="/#testimonials" className="hover:text-[#6f0617] transition-colors">Testimonials</a>
            <Link to="/about" className="hover:text-[#6f0617] transition-colors">About</Link>
          </nav>

          {/* Right Action / Sign In */}
          <div className="flex items-center gap-5">
            <Link
              to="/sign-in"
              className="text-sm font-semibold text-[#4b030e] hover:text-[#6f0617] transition-colors hidden sm:inline-block"
            >
              Sign In
            </Link>
            <Link
              to="/app/onboarding"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6f0617] hover:bg-[#580412] text-white text-sm font-semibold shadow-gold-sm hover:shadow-gold-glow transition-all duration-300"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* ========================================== */}
      {/* 7. FOOTER                                  */}
      {/* ========================================== */}
      <footer className="w-full bg-[#2f0209] text-[#faf9f6] pt-16 pb-12 border-t-2 border-[#b88444]/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#e6bd81]/20">
            {/* Brand Info */}
            <div className="lg:col-span-2 space-y-4 pr-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center bg-white px-3 py-1.5 rounded-xl shadow-gold-sm border border-[#b88444]/40">
                  <img
                    src="/WeddingOSLogo.png"
                    alt="WeddingOS"
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>
              <p className="text-xs text-[#faf9f6]/70 leading-relaxed max-w-sm">
                The premier ceremonial management operating system engineered for multi-day matrimonial galas, royal itineraries, and discerning guest experiences.
              </p>
              <div className="pt-2">
                <span className="text-[11px] uppercase tracking-wider text-[#e6bd81] font-semibold block mb-2">
                  Subscribe to Ceremonial Dispatch
                </span>
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white/10 border border-[#e6bd81]/30 text-white text-xs px-3.5 py-2 rounded-lg placeholder-white/40 focus:outline-none focus:border-[#e6bd81] w-full"
                  />
                  <button className="bg-[#b88444] hover:bg-[#e6bd81] text-[#4b030e] font-semibold text-xs px-4 py-2 rounded-lg transition-colors shrink-0">
                    Join
                  </button>
                </div>
              </div>
            </div>

            {/* Platform Suites */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#e6bd81] font-semibold mb-4">
                Platform Suites
              </h4>
              <ul className="space-y-2.5 text-xs text-[#faf9f6]/70">
                <li><a href="/#features" className="hover:text-[#e6bd81] transition-colors">WhatsApp RSVP Engine</a></li>
                <li><a href="/#features" className="hover:text-[#e6bd81] transition-colors">Live Photo Wall</a></li>
                <li><a href="/#schedule" className="hover:text-[#e6bd81] transition-colors">Run-of-Show Matrix</a></li>
                <li><a href="/#features" className="hover:text-[#e6bd81] transition-colors">Palace Room Blocks</a></li>
                <li><a href="/#themes" className="hover:text-[#e6bd81] transition-colors">Digital Stationery</a></li>
              </ul>
            </div>

            {/* Ceremony Guides */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#e6bd81] font-semibold mb-4">
                Ceremony Guides
              </h4>
              <ul className="space-y-2.5 text-xs text-[#faf9f6]/70">
                <li><a href="/#features" className="hover:text-[#e6bd81] transition-colors">Sangeet &amp; Mehendi</a></li>
                <li><a href="/#features" className="hover:text-[#e6bd81] transition-colors">Vedic Mandap Protocols</a></li>
                <li><a href="/#features" className="hover:text-[#e6bd81] transition-colors">Grand Reception Gala</a></li>
                <li><a href="/#features" className="hover:text-[#e6bd81] transition-colors">Multi-City Hospitality</a></li>
                <li><a href="/#features" className="hover:text-[#e6bd81] transition-colors">Artisanal Vendors</a></li>
              </ul>
            </div>

            {/* The Atelier */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#e6bd81] font-semibold mb-4">
                The Atelier
              </h4>
              <ul className="space-y-2.5 text-xs text-[#faf9f6]/70">
                <li><Link to="/about" className="hover:text-[#e6bd81] transition-colors">Our Heritage</Link></li>
                <li><a href="#" className="hover:text-[#e6bd81] transition-colors">Private Concierge</a></li>
                <li><a href="#" className="hover:text-[#e6bd81] transition-colors">Privacy &amp; Security</a></li>
                <li><a href="#" className="hover:text-[#e6bd81] transition-colors">Press &amp; Editorials</a></li>
                <li><a href="#" className="hover:text-[#e6bd81] transition-colors">White-Glove Support</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#faf9f6]/60">
            <p>&copy; {new Date().getFullYear()} WeddingOS Inc. Engineered for monumental celebrations. All rights reserved.</p>
            <div className="flex items-center gap-6 text-[#e6bd81]">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Hospitality</a>
              <a href="#" className="hover:text-white transition-colors">Concierge Portal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
