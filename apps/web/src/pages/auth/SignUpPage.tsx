import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSignUp } from '@clerk/clerk-react'
import {
  Mail,
  Key,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Gem,
  Award,
} from 'lucide-react'

export default function SignUpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/app/onboarding'
  const { isLoaded, signUp, setActive } = useSignUp()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignUp = async () => {
    setError('')
    if (!isLoaded || !signUp) {
      navigate(redirectUrl)
      return
    }

    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: redirectUrl,
      })
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Google registration failed.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    if (!agreeTerms) {
      setError('Please accept the Terms of Service and Privacy Protocol.')
      return
    }

    setIsLoading(true)

    if (!isLoaded || !signUp) {
      setTimeout(() => {
        setIsLoading(false)
        navigate(redirectUrl)
      }, 500)
      return
    }

    try {
      const parts = fullName.trim().split(' ')
      const firstName = parts[0]
      const lastName = parts.slice(1).join(' ') || undefined

      await signUp.create({
        emailAddress: email,
        password: password,
        firstName,
        lastName,
      })

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
      setIsLoading(false)
    } catch (err: any) {
      setIsLoading(false)
      setError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          'Registration could not be completed. Please check your details.'
      )
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return
    setIsLoading(true)
    setError('')

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        navigate(redirectUrl)
      } else {
        navigate(redirectUrl)
      }
    } catch (err: any) {
      setIsLoading(false)
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid verification code.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f4efe8] flex items-center justify-center p-3 sm:p-6 lg:p-8">
      {/* Outer Floating Modal Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#e6bd81]/30 p-3 sm:p-5 flex flex-col lg:flex-row gap-5 lg:gap-8 items-stretch overflow-hidden">
        
        {/* ========================================= */}
        {/* LEFT POSTER CARD (EDITORIAL ROYAL HERO)   */}
        {/* ========================================= */}
        <div className="lg:w-5/12 w-full relative rounded-2xl overflow-hidden flex flex-col justify-between p-6 sm:p-7 text-white select-none min-h-[480px]">
          {/* Background Image of Couple */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjpTfbo90Ap1TbcRKq-zfxwxToykglWzINgd4XaBrzZPhwNAVo2Q_YTTbndrmx36WIk-ivksNBsjX_0q9TVUm27S4igppnmyICghF8jNPJ6-lx8GlEZ4B7ol1wCF7s8F7zdIRI9qB7l-8J7giYWOrJvWK976sPYp-2LJKyJNbL4-cpzehoynYCjS2skEnRYX-oybFCMVZ-elK8sxdYvMkkAZfnDqm8Ge9_fv--_TtG"
            alt="Royal Indian Wedding Couple"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Rich Burgundy Gradients overlay to match user screenshot */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#220206] via-[#4b030e]/85 to-[#6f0617]/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#220206]/30 to-[#220206]/90" />

          {/* Top Bar inside Left Card */}
          <div className="relative z-10 flex items-center justify-between">
            {/* WeddingOS Logo Capsule */}
            <Link to="/" className="inline-block">
              <div className="bg-white px-3.5 py-1.5 rounded-full shadow-md flex items-center justify-center border border-[#e6bd81]/40 hover:scale-105 transition-transform">
                <img
                  src="/WeddingOSLogo.png"
                  alt="WeddingOS"
                  className="h-5 w-auto object-contain"
                />
              </div>
            </Link>

            {/* Private Atelier Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-[#e6bd81]/40 text-[#e6bd81] text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e6bd81] inline-block" />
              <span>Private Atelier</span>
            </div>
          </div>

          {/* Center Editorial Quote */}
          <div className="relative z-10 space-y-3 my-auto py-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-[#e6bd81]/40 text-[#e6bd81] text-[10px] font-bold uppercase tracking-widest w-fit">
              <Gem className="w-3 h-3 text-[#e6bd81]" />
              <span>Ceremonial Precision</span>
            </div>
            
            <h2 className="font-cormorant text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-[1.14]">
              Your wedding story,<br />
              <span className="italic text-[#e6bd81] font-light">effortlessly orchestrated.</span>
            </h2>
          </div>

          {/* Bottom Floating Glass Card */}
          <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-xl p-3.5 border border-white/15 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#b88444]/30 border border-[#b88444]/60 flex items-center justify-center text-[#e6bd81] shrink-0">
                  <Award className="w-4 h-4 text-[#e6bd81]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white tracking-wide">
                    4,200+ Royal Celebrations
                  </div>
                  <div className="text-[10px] text-white/65">
                    Udaipur &bull; Lake Como &bull; French Riviera
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-[#e6bd81]/40 text-[#e6bd81] text-[10px] font-bold shrink-0">
                <span>★ 5.0 Concierge</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/10 gap-2">
              <p className="italic text-white/80 text-[10.5px] leading-tight truncate">
                &ldquo;Harmonizing fleets, runs-of-show, and suites in real-time.&rdquo;
              </p>
              <span className="text-[10px] text-white/60 shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                Patrons
              </span>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT COLUMN: SIGN UP FORM                */}
        {/* ========================================= */}
        <div className="lg:w-7/12 w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          {/* Top Right Header Action */}
          <div className="flex justify-end items-center gap-1.5 text-xs text-neutral-600">
            <span>Already have a workspace?</span>
            <Link
              to="/sign-in"
              className="text-[#6f0617] font-semibold underline decoration-[#6f0617]/40 hover:decoration-[#6f0617] inline-flex items-center gap-1"
            >
              <span>Sign In</span>
              <span>↗</span>
            </Link>
          </div>

          {/* Form Body */}
          <div className="my-auto py-3 space-y-4">
            {/* Secured Access Badge & Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fcf6ed] border border-[#e6bd81]/40 text-[#85531d] text-[10px] font-bold tracking-widest uppercase">
                <Sparkles className="w-3 h-3 text-[#85531d]" />
                <span>Regal Onboarding Access</span>
              </div>
              <h1 className="font-cormorant text-3xl sm:text-4xl text-[#3a0208] font-normal tracking-tight mt-2">
                Create Royal Workspace
              </h1>
              <p className="text-xs text-neutral-500 mt-1 font-sans">
                Register your master planner or couple account to orchestrate regal ceremonies.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Google Social Signup */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full h-10 px-4 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 text-neutral-800 text-xs sm:text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[10px] uppercase tracking-wider font-semibold text-neutral-400 shrink-0">
                Or register with email
              </span>
              <div className="border-t border-neutral-200 w-full" />
            </div>

            {/* Verification Form (When Code Sent) */}
            {pendingVerification ? (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="p-3 bg-[#fcf6ed] border border-[#e6bd81]/40 rounded-lg text-xs text-[#85531d]">
                  A 6-digit confirmation code was sent to <strong>{email}</strong>. Enter it below to unlock your workspace.
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider uppercase text-neutral-700 block">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className="w-full h-11 px-3.5 text-center tracking-widest text-lg font-bold rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 px-4 rounded-lg bg-[#6f0617] hover:bg-[#520411] text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? <span>Verifying...</span> : <span>Confirm &amp; Proceed to Workspace &rarr;</span>}
                </button>
              </form>
            ) : (
              /* Registration Form */
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider uppercase text-neutral-700 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Aarav Sharma / Ananya Roy"
                      className="w-full h-10 pl-10 pr-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900 placeholder:text-neutral-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider uppercase text-neutral-700 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="planner@weddingsuite.com"
                      className="w-full h-10 pl-10 pr-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900 placeholder:text-neutral-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-wider uppercase text-neutral-700 block">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full h-10 pl-10 pr-10 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900 placeholder:text-neutral-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms & Privacy checkbox */}
                <div className="flex items-start gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-[#6f0617] focus:ring-[#6f0617] accent-[#6f0617] mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="agreeTerms" className="text-[11px] text-neutral-600 leading-snug cursor-pointer select-none">
                    I agree to the{' '}
                    <span className="text-[#6f0617] underline font-medium">Terms of Service</span>{' '}
                    and acknowledge the{' '}
                    <span className="text-[#6f0617] underline font-medium">Privacy Protocol</span>.
                  </label>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 px-4 rounded-lg bg-[#6f0617] hover:bg-[#520411] active:scale-[0.99] text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-70 mt-1"
                >
                  {isLoading ? (
                    <span>Preparing Workspace...</span>
                  ) : (
                    <>
                      <span>Create Royal Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Secondary Switcher Card */}
                <div className="pt-1">
                  <div className="bg-[#faf7f2] border border-[#e6bd81]/40 rounded-lg py-2.5 px-4 text-center text-xs text-neutral-700">
                    <span>Already have a wedding workspace?</span>{' '}
                    <Link
                      to={redirectUrl !== '/app/onboarding' ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}` : '/sign-in'}
                      className="font-bold text-[#6f0617] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Sign In</span>
                      <span>↗</span>
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Security footnote & copyright */}
          <div className="pt-3 border-t border-neutral-100 space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>End-to-end encrypted VIP guest matrices &amp; budget vaults</span>
            </div>
            <p className="text-[10px] text-neutral-400 text-center">
              &copy; 2025 WeddingOS Inc. &bull; Privacy Policy &bull; Terms &bull; Concierge
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
