import { NavLink, Outlet } from 'react-router-dom'

const currentYear = new Date().getFullYear()

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#2D151D] dark:bg-[#150E11] dark:text-[#F8F1F3]">
      <header className="border-b border-gold-200/60 dark:border-maroon-900/60 bg-white/90 dark:bg-[#1C1216]/90 backdrop-blur sticky top-0 z-50 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <NavLink to="/" className="flex items-center space-x-3 group">
            <img
              src="/WeddingOSLogo.png"
              alt="WeddingOS Logo"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </NavLink>
          <nav className="flex items-center space-x-6 sm:space-x-8">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'text-maroon-700 dark:text-gold-400 border-b-2 border-gold-500 pb-1'
                    : 'text-stone-600 dark:text-stone-300 hover:text-maroon-700 dark:hover:text-gold-400'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'text-maroon-700 dark:text-gold-400 border-b-2 border-gold-500 pb-1'
                    : 'text-stone-600 dark:text-stone-300 hover:text-maroon-700 dark:hover:text-gold-400'
                }`
              }
            >
              About
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-gold-200/60 dark:border-maroon-900/60 bg-white/50 dark:bg-[#1A1014]/50 py-6 text-center text-xs text-stone-500 dark:text-stone-400">
        &copy; {currentYear} WeddingOS. Plan &bull; Organize &bull; Celebrate.
      </footer>
    </div>
  )
}
