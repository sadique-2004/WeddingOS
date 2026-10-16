export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-8">
      <div className="mb-6 relative">
        <img
          src="/WeddingOSLogo.png"
          alt="WeddingOS"
          className="w-64 sm:w-80 h-auto object-contain mx-auto drop-shadow-sm transition-transform duration-300 hover:scale-105"
        />
      </div>


      <p className="text-lg sm:text-xl text-stone-700 dark:text-stone-300 max-w-xl font-medium leading-relaxed">
        Wedding planning, organized in one place.
      </p>

      <div className="mt-8 flex items-center justify-center space-x-2">
        <span className="h-0.5 w-12 bg-gold-400/60 rounded"></span>
        <span className="text-xs uppercase tracking-widest text-gold-600 dark:text-gold-400 font-semibold">
          Plan &bull; Organize &bull; Celebrate
        </span>
        <span className="h-0.5 w-12 bg-gold-400/60 rounded"></span>
      </div>
    </div>
  )
}
