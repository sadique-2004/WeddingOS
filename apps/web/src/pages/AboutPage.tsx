export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-8">
      <div className="inline-block px-4 py-1.5 rounded-full bg-gold-100 text-gold-700 dark:bg-maroon-900/40 dark:text-gold-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-gold-300/50">
        About The Platform
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-maroon-700 dark:text-gold-400 mb-4 font-serif">
        About WeddingOS
      </h1>

      <p className="text-base sm:text-lg text-stone-700 dark:text-stone-300 max-w-xl leading-relaxed">
        A digital wedding-management workspace designed to coordinate wedding details, events, tasks, family-level invitations, and cherished memories in one unified place.
      </p>
    </div>
  )
}
