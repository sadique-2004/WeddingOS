import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Palette,
  Users2,
  MessageSquare,
  ShieldCheck,
  PartyPopper,
  Check,
  CheckCheck,
  Diamond,
  Mail,
  Images,
  CalendarDays,
  Wallet,
  Star,
  Tv,
  CheckCircle2
} from 'lucide-react'

export default function HomePage() {
  const [activeTheme, setActiveTheme] = useState<number>(0)

  return (
    <div className="w-full">
      {/* ========================================== */}
      {/* 1. HERO SECTION (FULL VIEWPORT IMMERSION)  */}
      {/* ========================================== */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center w-full py-8 lg:py-12 overflow-hidden bg-gradient-to-b from-transparent via-[#faf9f6] to-[#f4f1ea]/40">
        {/* Ambient atmospheric gold glow in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[650px] bg-gradient-to-b from-[#e6bd81]/20 via-[#b88444]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left: Copy, CTAs, and Responsive Feature Badges */}
            <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6 z-10">
              {/* Curated Luxury Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 gold-border shadow-gold-sm mb-5 sm:mb-6 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#b88444]" />
                <span className="text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-[#4b030e]">
                  The Indian Wedding Workspace
                </span>
              </div>

              {/* Hero Heading with Cormorant Garamond */}
              <h1 className="font-cormorant text-[42px] sm:text-[56px] lg:text-[66px] font-normal leading-[1.08] text-[#4b030e] tracking-tight mb-4 sm:mb-5">
                Celebrate Traditions, <br />
                <span className="italic font-normal text-[#b88444] bg-gradient-to-r from-[#b88444] via-[#e6bd81] to-[#b88444] bg-clip-text text-transparent">
                  Organized with Elegance.
                </span>
              </h1>

              {/* Subtitle - Punchy & Scannable */}
              <p className="text-base sm:text-lg text-[#4b030e]/80 max-w-lg leading-relaxed mb-6 sm:mb-8 font-sans">
                One dignified workspace to coordinate ceremonies, family-unit RSVPs, budget, and private photo walls.
              </p>

              {/* Dual CTA Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
                <Link
                  to="/app/onboarding"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#6f0617] hover:bg-[#580412] text-white text-sm sm:text-base font-medium shadow-lg hover:shadow-gold-glow hover:-translate-y-0.5 transition-all duration-300 text-center"
                >
                  <span>Create Your Wedding</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#themes"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#fdfaf5] text-[#4b030e] text-sm sm:text-base font-medium border border-[#b88444] shadow-gold-sm hover:-translate-y-0.5 transition-all duration-300 text-center"
                >
                  <Palette className="w-4 h-4 text-[#b88444]" />
                  <span>Explore Themes</span>
                </a>
              </div>

              {/* Clean, Lightweight Trust Chips */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-6 sm:mt-8 pt-5 border-t border-[#e6bd81]/30 w-full max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 gold-border shadow-2xs text-xs font-medium text-[#4b030e]">
                  <Users2 className="w-3.5 h-3.5 text-[#b88444]" />
                  <span>Family-Unit RSVPs</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 gold-border shadow-2xs text-xs font-medium text-[#4b030e]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#b88444]" />
                  <span>WhatsApp Dispatch</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 gold-border shadow-2xs text-xs font-medium text-[#4b030e]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#b88444]" />
                  <span>Moderated Gallery</span>
                </div>
              </div>
            </div>

            {/* Right: Arched Visual Montage & Floating Badges */}
            <div className="lg:col-span-5 relative flex justify-center mt-6 lg:mt-0">
              <div className="relative w-full max-w-[310px] sm:max-w-[340px]">
                {/* Arched Picture Frame */}
                <div className="arch-frame rounded-b-2xl overflow-hidden p-2 bg-white gold-border shadow-card relative group">
                  <div className="arch-frame rounded-b-xl overflow-hidden aspect-[4/5] bg-[#3a0209] relative">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjpTfbo90Ap1TbcRKq-zfxwxToykglWzINgd4XaBrzZPhwNAVo2Q_YTTbndrmx36WIk-ivksNBsjX_0q9TVUm27S4igppnmyICghF8jNPJ6-lx8GlEZ4B7ol1wCF7s8F7zdIRI9qB7l-8J7giYWOrJvWK976sPYp-2LJKyJNbL4-cpzehoynYCjS2skEnRYX-oybFCMVZ-elK8sxdYvMkkAZfnDqm8Ge9_fv--_TtG"
                      alt="Indian wedding couple under royal floral mandap"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2f0209]/90 via-[#2f0209]/20 to-transparent pointer-events-none" />

                    {/* Bottom Caption inside frame */}
                    <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-[#e6bd81] block font-semibold">
                          Udaipur Lake Palace
                        </span>
                        <h3 className="font-cormorant text-xl font-light tracking-wide">
                          Ananya &amp; Kabir
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-medium border border-white/20">
                        <PartyPopper className="w-3 h-3 text-[#e6bd81]" />
                        <span>Day 3 of 4</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlaid Live RSVP Metric Pill */}
                <div className="absolute -top-2.5 -left-2 sm:-left-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-card gold-border flex items-center gap-2 hover:scale-105 transition-transform">
                  <div className="w-7 h-7 rounded-lg bg-[#6f0617] text-white flex items-center justify-center shadow-xs">
                    <Users2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-[#b88444] font-bold block">
                      Live RSVPs
                    </span>
                    <span className="font-sans text-xs font-bold text-[#4b030e] leading-tight">
                      480+ Confirmed
                    </span>
                  </div>
                </div>

                {/* Overlaid WhatsApp Dispatch Pill */}
                <div className="absolute bottom-8 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-card gold-border max-w-[190px] sm:max-w-[210px] hover:scale-105 transition-transform">
                  <div className="flex items-center gap-1.5 mb-1 text-emerald-700 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>WhatsApp Dispatch</span>
                  </div>
                  <p className="text-[10px] text-[#4b030e]/80 leading-snug">
                    Sangeet invite sent to 120 guests
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[9px] text-[#b88444] font-medium">
                    <span>99% Delivered</span>
                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. METRICS & STATS STRIP                   */}
      {/* ========================================== */}
      <section className="w-full py-10 bg-[#f4f1ea] border-y border-[#e6bd81]/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Centerpiece gold decorative ornament */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-20 gold-divider" />
            <Diamond className="w-4 h-4 text-[#b88444] fill-[#b88444]/30" />
            <div className="h-px w-20 gold-divider" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-white/70 gold-border shadow-gold-sm">
              <span className="font-cormorant text-4xl lg:text-5xl font-bold text-[#4b030e] block">
                10,000+
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#b88444] mt-1 block">
                Multi-Day Ceremonies
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white/70 gold-border shadow-gold-sm">
              <span className="font-cormorant text-4xl lg:text-5xl font-bold text-[#4b030e] block">
                99.4%
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#b88444] mt-1 block">
                Family RSVP Rate
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white/70 gold-border shadow-gold-sm">
              <span className="font-cormorant text-4xl lg:text-5xl font-bold text-[#4b030e] block">
                2.4M+
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#b88444] mt-1 block">
                Live Photos Preserved
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white/70 gold-border shadow-gold-sm">
              <span className="font-cormorant text-4xl lg:text-5xl font-bold text-[#4b030e] block">
                Vogue &amp; Bazaar
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#b88444] mt-1 block">
                Bridal Press Accolades
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. FEATURE GRID (4 PREMIUM WHITE CARDS)    */}
      {/* ========================================== */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#b88444] block mb-2">
            Architectural Precision Meets Regal Hospitality
          </span>
          <h2 className="font-cormorant text-4xl lg:text-5xl text-[#4b030e] font-normal mb-4">
            Everything Needed for Monumental Indian Weddings
          </h2>
          <p className="text-[#4b030e]/75 text-base sm:text-lg leading-relaxed">
            From multi-generational family trees to 5-event dress code alerts, every module is crafted for royal hospitality without logistical friction.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Card 1: Family-First Invitations */}
          <div className="bg-white rounded-2xl p-8 lg:p-10 gold-border shadow-card hover:shadow-gold-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#faf4ec] text-[#4b030e] flex items-center justify-center mb-6 border border-[#e6bd81]/40">
                <Mail className="w-7 h-7 text-[#6f0617]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b88444] block mb-1">
                Circle 01 &bull; Guest Curation
              </span>
              <h3 className="font-cormorant text-2xl lg:text-3xl font-semibold text-[#4b030e] mb-3">
                Family-First Invitations &amp; WhatsApp Dispatch
              </h3>
              <p className="text-sm lg:text-base text-[#4b030e]/75 leading-relaxed mb-6">
                Segment joint-family circles across Nanihal, Dadihal, corporate guests, and international travelers. Dispatch personalized bilingual save-the-dates via official WhatsApp API with instant 1-click confirmation.
              </p>
            </div>

            {/* Interactive Preview Component */}
            <div className="bg-[#faf9f6] rounded-xl p-4 border border-[#e6bd81]/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  WhatsApp Business API
                </span>
                <span className="text-[#b88444] font-medium">Delivered 10:14 AM</span>
              </div>
              <div className="bg-white p-3.5 rounded-lg shadow-2xs border border-[#e6bd81]/20">
                <p className="text-xs text-[#4b030e] leading-snug mb-2 font-medium">
                  "Pranaam Singhania Family! You are cordially invited to the Sangeet &amp; Vedic Pheras of Ananya &amp; Kabir in Udaipur. Tap below to verify your party (4 Guests) &amp; dietary requests."
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-[#6f0617] text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm 4 Guests
                  </span>
                  <span className="text-[11px] text-[#b88444] font-medium">Luggage Tag: #UD-448</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Moderated Guest Photo Gallery */}
          <div className="bg-white rounded-2xl p-8 lg:p-10 gold-border shadow-card hover:shadow-gold-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#faf4ec] text-[#4b030e] flex items-center justify-center mb-6 border border-[#e6bd81]/40">
                <Images className="w-7 h-7 text-[#6f0617]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b88444] block mb-1">
                Circle 02 &bull; Live Memories
              </span>
              <h3 className="font-cormorant text-2xl lg:text-3xl font-semibold text-[#4b030e] mb-3">
                Moderated Guest Photo Gallery &amp; LED Cast
              </h3>
              <p className="text-sm lg:text-base text-[#4b030e]/75 leading-relaxed mb-6">
                Real-time high-resolution guest uploads via table QR codes without app downloads. Intelligent AI privacy filtering and family elder face-sorting with instantaneous moderation before ballroom LED displays.
              </p>
            </div>

            {/* Interactive Preview Component */}
            <div className="bg-[#faf9f6] rounded-xl p-4 border border-[#e6bd81]/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#4b030e] font-semibold flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-[#6f0617]" />
                  Ballroom Projection Stream
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#e6bd81]/30 text-[#8e6128] text-[10px] font-bold">
                  14 Moderated
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative h-16 rounded-lg overflow-hidden bg-[#4b030e]/10 border border-[#e6bd81]/40">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjpTfbo90Ap1TbcRKq-zfxwxToykglWzINgd4XaBrzZPhwNAVo2Q_YTTbndrmx36WIk-ivksNBsjX_0q9TVUm27S4igppnmyICghF8jNPJ6-lx8GlEZ4B7ol1wCF7s8F7zdIRI9qB7l-8J7giYWOrJvWK976sPYp-2LJKyJNbL4-cpzehoynYCjS2skEnRYX-oybFCMVZ-elK8sxdYvMkkAZfnDqm8Ge9_fv--_TtG"
                    alt="Couple"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-emerald-600 text-white rounded p-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div className="relative h-16 rounded-lg overflow-hidden bg-[#4b030e]/10 border border-[#e6bd81]/40">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzmCmY6C_zAjkhceJZ4Tlz42BZVYtfzVRgikKPJa2AQWtEXIDW2Da0z8fMM6Erql-ZYE-dj6EozNyaz9Uv-Y5_2xXQdf0XPmOL_duQwfG2H_xe3-yMxsITIsThwQ6ZNpreg2LsKT-q-3hSI8TcLIihLWluZMwGTMi98YYm8lEP3ghVLVnZz-IoNbADNSQd98fewIVgtAqK71xE24Z6aDa6kY2KfkPxsQnf1-QfHDNs"
                    alt="Stationery"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-emerald-600 text-white rounded p-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div className="relative h-16 rounded-lg overflow-hidden border border-[#e6bd81]/40 flex items-center justify-center bg-[#6f0617]/10 p-1">
                  <span className="text-[10px] text-[#4b030e] font-bold text-center leading-tight">
                    Live on Stage LED
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Ceremony & Schedule Timeline Matrix */}
          <div id="schedule" className="bg-white rounded-2xl p-8 lg:p-10 gold-border shadow-card hover:shadow-gold-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#faf4ec] text-[#4b030e] flex items-center justify-center mb-6 border border-[#e6bd81]/40">
                <CalendarDays className="w-7 h-7 text-[#6f0617]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b88444] block mb-1">
                Circle 03 &bull; Ritual Master
              </span>
              <h3 className="font-cormorant text-2xl lg:text-3xl font-semibold text-[#4b030e] mb-3">
                Ceremony &amp; Schedule Timeline Matrix
              </h3>
              <p className="text-sm lg:text-base text-[#4b030e]/75 leading-relaxed mb-6">
                Multi-day precision run-of-show for Mehendi, Haldi, Royal Baraat, Vedic Pheras, and Grand Reception. Automated guest push notifications for auspicious Muhurat timings, palace venue transfers, and dress codes.
              </p>
            </div>

            {/* Interactive Preview Component */}
            <div className="bg-[#faf9f6] rounded-xl p-3.5 border border-[#e6bd81]/30 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e6bd81]/20">
                <span className="font-cormorant text-sm font-bold text-[#b88444] w-16">10:30 AM</span>
                <div className="flex-1 px-2">
                  <div className="text-xs font-bold text-[#4b030e]">Haldi &amp; Floral Holi</div>
                  <div className="text-[10px] text-[#4b030e]/60">Courtyard by the Lake &bull; Sunlit Yellows</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-[#e6bd81]/20 text-[#b88444] font-bold rounded">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e6bd81]/20">
                <span className="font-cormorant text-sm font-bold text-[#b88444] w-16">05:15 PM</span>
                <div className="flex-1 px-2">
                  <div className="text-xs font-bold text-[#4b030e]">Royal Baraat Assembly</div>
                  <div className="text-[10px] text-[#4b030e]/60">Palace Gates &bull; Dhol Tasha Troupe</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-[#6f0617]/10 text-[#6f0617] font-bold rounded">
                  Next
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Real-time RSVP & Budget Tracker */}
          <div className="bg-white rounded-2xl p-8 lg:p-10 gold-border shadow-card hover:shadow-gold-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#faf4ec] text-[#4b030e] flex items-center justify-center mb-6 border border-[#e6bd81]/40">
                <Wallet className="w-7 h-7 text-[#6f0617]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b88444] block mb-1">
                Circle 04 &bull; Ledger &amp; Hospitality
              </span>
              <h3 className="font-cormorant text-2xl lg:text-3xl font-semibold text-[#4b030e] mb-3">
                Real-time RSVP &amp; Multi-Vendor Budget Tracker
              </h3>
              <p className="text-sm lg:text-base text-[#4b030e]/75 leading-relaxed mb-6">
                Track palace room wing assignments, airport shuttle manifests, and dietary preferences (Jain, Swaminarayan, Halal, Vegan). Synchronize multi-currency vendor disbursements across floral decor, jewelry, and catering.
              </p>
            </div>

            {/* Interactive Preview Component */}
            <div className="bg-[#faf9f6] rounded-xl p-4 border border-[#e6bd81]/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#4b030e]">Ceremonial Budget Allocation</span>
                <span className="font-cormorant text-base font-bold text-[#4b030e]">₹1.45 Cr / ₹1.60 Cr</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-[#e6bd81]/30 overflow-hidden flex mb-3">
                <div className="h-full bg-[#6f0617]" style={{ width: '42%' }} title="Hospitality" />
                <div className="h-full bg-[#b88444]" style={{ width: '28%' }} title="Decor & Florals" />
                <div className="h-full bg-[#e6bd81]" style={{ width: '20%' }} title="Catering" />
                <div className="h-full bg-[#2f0209]" style={{ width: '10%' }} title="Artists" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#4b030e]/75">
                <span>Palace Rooms: 128/140 Booked</span>
                <span className="text-emerald-700 font-bold">91% Room Efficiency</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. THEME SHOWCASE CAROUSEL (3 THEMES)      */}
      {/* ========================================== */}
      <section id="themes" className="py-24 bg-[#f5f2eb] border-y border-[#e6bd81]/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#b88444] block mb-2">
                Curated Bespoke Aesthetics
              </span>
              <h2 className="font-cormorant text-4xl lg:text-5xl text-[#4b030e] font-normal">
                Predefined Imperial Wedding Themes
              </h2>
              <p className="text-[#4b030e]/75 text-base sm:text-lg mt-2 max-w-xl">
                Choose from handcrafted design suites designed to harmonize digital invites, WhatsApp cards, and on-site guest portals.
              </p>
            </div>

            {/* Theme Switcher Tabs */}
            <div className="inline-flex p-1.5 rounded-xl bg-white gold-border shadow-gold-sm">
              <button
                onClick={() => setActiveTheme(0)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTheme === 0
                    ? 'bg-[#6f0617] text-white shadow-xs'
                    : 'text-[#4b030e] hover:text-[#6f0617]'
                }`}
              >
                Classic Indian
              </button>
              <button
                onClick={() => setActiveTheme(1)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTheme === 1
                    ? 'bg-[#6f0617] text-white shadow-xs'
                    : 'text-[#4b030e] hover:text-[#6f0617]'
                }`}
              >
                Minimal Elegant
              </button>
              <button
                onClick={() => setActiveTheme(2)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTheme === 2
                    ? 'bg-[#6f0617] text-white shadow-xs'
                    : 'text-[#4b030e] hover:text-[#6f0617]'
                }`}
              >
                Modern Celebration
              </button>
            </div>
          </div>

          {/* Theme Cards Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Theme 1: Classic Indian */}
            <div
              className={`bg-white rounded-2xl overflow-hidden gold-border shadow-card flex flex-col justify-between transition-all ${
                activeTheme === 0 ? 'ring-2 ring-[#b88444] shadow-gold-md' : 'hover:shadow-gold-md'
              }`}
            >
              <div className="relative h-64 overflow-hidden bg-[#6f0617]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjpTfbo90Ap1TbcRKq-zfxwxToykglWzINgd4XaBrzZPhwNAVo2Q_YTTbndrmx36WIk-ivksNBsjX_0q9TVUm27S4igppnmyICghF8jNPJ6-lx8GlEZ4B7ol1wCF7s8F7zdIRI9qB7l-8J7giYWOrJvWK976sPYp-2LJKyJNbL4-cpzehoynYCjS2skEnRYX-oybFCMVZ-elK8sxdYvMkkAZfnDqm8Ge9_fv--_TtG"
                  alt="Classic Indian Theme"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2f0209]/90 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 bg-[#6f0617] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#e6bd81]/50">
                  Most Popular
                </div>
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="text-[10px] tracking-widest uppercase text-[#e6bd81] block font-semibold">
                    Imperial Heritage
                  </span>
                  <h4 className="font-cormorant text-2xl font-normal">Classic Indian</h4>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-[#4b030e]/80 leading-relaxed">
                  Deep crimson velvet, intricate Mughal jali lattice borders, rich zardozi gold embroidery, and royal Rajput crest monograms.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#6f0617] border border-white shadow-xs" title="Royal Burgundy" />
                    <span className="w-5 h-5 rounded-full bg-[#b88444] border border-white shadow-xs" title="Antique Gold" />
                    <span className="w-5 h-5 rounded-full bg-[#e6bd81] border border-white shadow-xs" title="Champagne" />
                    <span className="w-5 h-5 rounded-full bg-[#faf9f6] border border-stone-200 shadow-xs" title="Warm Ivory" />
                    <span className="text-xs text-[#4b030e]/70 ml-2 font-medium">Burgundy &amp; Antique Gold</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Link to="/app/onboarding" className="flex-1">
                      <button className="w-full py-2.5 rounded-xl bg-[#6f0617] text-white text-xs font-semibold hover:bg-[#580412] transition-colors">
                        Apply Theme
                      </button>
                    </Link>
                    <button className="px-4 py-2.5 rounded-xl border border-[#b88444]/50 text-[#4b030e] text-xs font-semibold hover:bg-[#fdfaf5] transition-colors">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme 2: Minimal Elegant */}
            <div
              className={`bg-white rounded-2xl overflow-hidden gold-border shadow-card flex flex-col justify-between transition-all ${
                activeTheme === 1 ? 'ring-2 ring-[#b88444] shadow-gold-md' : 'hover:shadow-gold-md'
              }`}
            >
              <div className="relative h-64 overflow-hidden bg-[#241f1c]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzmCmY6C_zAjkhceJZ4Tlz42BZVYtfzVRgikKPJa2AQWtEXIDW2Da0z8fMM6Erql-ZYE-dj6EozNyaz9Uv-Y5_2xXQdf0XPmOL_duQwfG2H_xe3-yMxsITIsThwQ6ZNpreg2LsKT-q-3hSI8TcLIihLWluZMwGTMi98YYm8lEP3ghVLVnZz-IoNbADNSQd98fewIVgtAqK71xE24Z6aDa6kY2KfkPxsQnf1-QfHDNs"
                  alt="Minimal Elegant Theme"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1715]/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="text-[10px] tracking-widest uppercase text-[#e6bd81] block font-semibold">
                    Contemporary Grace
                  </span>
                  <h4 className="font-cormorant text-2xl font-normal">Minimal Elegant</h4>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-[#4b030e]/80 leading-relaxed">
                  Warm alabaster and deckle-edge handmade paper textures, fine hairline champagne rules, and delicate botanical line art.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#faf9f6] border border-stone-300 shadow-xs" />
                    <span className="w-5 h-5 rounded-full bg-[#e6bd81] border border-white shadow-xs" />
                    <span className="w-5 h-5 rounded-full bg-[#8b7170] border border-white shadow-xs" />
                    <span className="w-5 h-5 rounded-full bg-[#2f0209] border border-white shadow-xs" />
                    <span className="text-xs text-[#4b030e]/70 ml-2 font-medium">Warm Ivory &amp; Champagne</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Link to="/app/onboarding" className="flex-1">
                      <button className="w-full py-2.5 rounded-xl bg-[#6f0617] text-white text-xs font-semibold hover:bg-[#580412] transition-colors">
                        Apply Theme
                      </button>
                    </Link>
                    <button className="px-4 py-2.5 rounded-xl border border-[#b88444]/50 text-[#4b030e] text-xs font-semibold hover:bg-[#fdfaf5] transition-colors">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme 3: Modern Celebration */}
            <div
              className={`bg-white rounded-2xl overflow-hidden gold-border shadow-card flex flex-col justify-between transition-all ${
                activeTheme === 2 ? 'ring-2 ring-[#b88444] shadow-gold-md' : 'hover:shadow-gold-md'
              }`}
            >
              <div className="relative h-64 overflow-hidden bg-[#12281e]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjpTfbo90Ap1TbcRKq-zfxwxToykglWzINgd4XaBrzZPhwNAVo2Q_YTTbndrmx36WIk-ivksNBsjX_0q9TVUm27S4igppnmyICghF8jNPJ6-lx8GlEZ4B7ol1wCF7s8F7zdIRI9qB7l-8J7giYWOrJvWK976sPYp-2LJKyJNbL4-cpzehoynYCjS2skEnRYX-oybFCMVZ-elK8sxdYvMkkAZfnDqm8Ge9_fv--_TtG"
                  alt="Modern Celebration Theme"
                  className="w-full h-full object-cover saturate-150 transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e2118]/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="text-[10px] tracking-widest uppercase text-[#e6bd81] block font-semibold">
                    Festive Vibrant
                  </span>
                  <h4 className="font-cormorant text-2xl font-normal">Modern Celebration</h4>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-[#4b030e]/80 leading-relaxed">
                  Jewel-tone emerald greens, radiant marigold saffron accents, contemporary editorial type, and energetic celebration motifs.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#123624] border border-white shadow-xs" />
                    <span className="w-5 h-5 rounded-full bg-[#e89d38] border border-white shadow-xs" />
                    <span className="w-5 h-5 rounded-full bg-[#e6bd81] border border-white shadow-xs" />
                    <span className="w-5 h-5 rounded-full bg-[#6f0617] border border-white shadow-xs" />
                    <span className="text-xs text-[#4b030e]/70 ml-2 font-medium">Emerald &amp; Saffron Gold</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Link to="/app/onboarding" className="flex-1">
                      <button className="w-full py-2.5 rounded-xl bg-[#6f0617] text-white text-xs font-semibold hover:bg-[#580412] transition-colors">
                        Apply Theme
                      </button>
                    </Link>
                    <button className="px-4 py-2.5 rounded-xl border border-[#b88444]/50 text-[#4b030e] text-xs font-semibold hover:bg-[#fdfaf5] transition-colors">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 5. SOCIAL PROOF & TESTIMONIALS             */}
      {/* ========================================== */}
      <section id="testimonials" className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#b88444] block mb-2">
            Bridal Trust Across Generations
          </span>
          <h2 className="font-cormorant text-4xl lg:text-5xl text-[#4b030e] font-normal">
            Honored by Discerning Families
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-2xl p-8 lg:p-10 gold-border shadow-card relative flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-[#b88444] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-[18px] h-[18px] fill-[#b88444]" />
                ))}
              </div>
              <p className="font-cormorant text-xl lg:text-2xl text-[#4b030e] italic leading-relaxed mb-6">
                "Organizing a 4-day destination wedding in Jaipur for 550 guests felt overwhelming until WeddingOS. The multi-event WhatsApp RSVP and Haldi-to-Reception timeline kept both of our families completely in sync without a single call from panicked relatives."
              </p>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-[#e6bd81]/30">
              <div className="w-12 h-12 rounded-full bg-[#e6bd81]/30 border border-[#b88444] flex items-center justify-center text-[#4b030e] font-cormorant text-lg font-bold">
                AK
              </div>
              <div>
                <h4 className="font-sans text-sm font-bold text-[#4b030e]">Ananya &amp; Kabir Singhania</h4>
                <span className="text-xs text-[#b88444] font-medium">Fairmont Jaipur &bull; 4-Day Royal Vivah</span>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white rounded-2xl p-8 lg:p-10 gold-border shadow-card relative flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-[#b88444] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-[18px] h-[18px] fill-[#b88444]" />
                ))}
              </div>
              <p className="font-cormorant text-xl lg:text-2xl text-[#4b030e] italic leading-relaxed mb-6">
                "The photo moderation feature saved our grand reception. Over 2,000 photos were uploaded in real-time by guests via QR codes, and our team effortlessly approved the most gorgeous candid moments onto the 30-foot stage LED screen."
              </p>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-[#e6bd81]/30">
              <div className="w-12 h-12 rounded-full bg-[#e6bd81]/30 border border-[#b88444] flex items-center justify-center text-[#4b030e] font-cormorant text-lg font-bold">
                RD
              </div>
              <div>
                <h4 className="font-sans text-sm font-bold text-[#4b030e]">Rhea &amp; Devendra Mehta</h4>
                <span className="text-xs text-[#b88444] font-medium">Taj Lake Palace, Udaipur &bull; 650 Guests</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 6. COMPACT CTA BANNER                      */}
      {/* ========================================== */}
      <section id="get-started" className="max-w-5xl mx-auto px-6 lg:px-8 pb-14 sm:pb-16">
        <div className="rounded-2xl bg-[#3a030b] text-white py-8 px-6 sm:py-10 sm:px-10 border border-[#b88444]/60 shadow-[0_12px_36px_rgba(47,2,9,0.3)] relative overflow-hidden text-center">
          {/* Guaranteed Deep Wine Gradient & Radial Glow Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2f0209] via-[#4b030e] to-[#6f0617] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(230,189,129,0.2)_0%,transparent_70%)] pointer-events-none" />

          {/* Decorative subtle gold corner curves */}
          <div className="absolute -top-12 -left-12 w-32 h-32 border border-[#e6bd81]/25 rounded-full pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 border border-[#e6bd81]/25 rounded-full pointer-events-none" />

          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-[#e6bd81]/40 backdrop-blur-xs shadow-xs">
              <Sparkles className="w-3 h-3 text-[#e6bd81]" />
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#e6bd81]">
                Your Wedding Journey Begins
              </span>
            </div>

            <h2 className="font-cormorant text-2xl sm:text-3xl lg:text-4xl font-normal leading-snug text-white">
              Craft an Unforgettable Celebration with Complete Peace of Mind
            </h2>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-md mx-auto font-sans">
              Set up your wedding workspace in under two minutes. Coordinate ceremonies, family RSVPs, and private memories effortlessly.
            </p>

            {/* Compact Action CTAs */}
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/app/onboarding" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-[#e6bd81] hover:bg-white text-[#4b030e] text-xs sm:text-sm font-semibold shadow-md hover:shadow-gold-glow hover:-translate-y-0.5 transition-all duration-300">
                  <span>Create Free Wedding Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4b030e]" />
                </button>
              </Link>
              <Link to="/sign-in" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-[#e6bd81]/50 hover:bg-white/10 text-white text-xs sm:text-sm font-medium transition-all duration-300">
                  Sign In to Workspace
                </button>
              </Link>
            </div>

            {/* Compact Trust Proof Points */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] text-[#e6bd81] pt-1">
              <span className="inline-flex items-center gap-1">
                <Check className="w-3 h-3 text-[#e6bd81]" />
                <span>Instant Setup</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="w-3 h-3 text-[#e6bd81]" />
                <span>Zero Guest App Installs</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Check className="w-3 h-3 text-[#e6bd81]" />
                <span>100% Private Memories</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
