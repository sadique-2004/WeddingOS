import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-8">
      <h1 className="text-5xl sm:text-6xl font-extrabold text-maroon-700 dark:text-gold-400 mb-2 font-serif">
        404
      </h1>
      <p className="text-xl text-stone-700 dark:text-stone-300 font-medium mb-2">
        Page Not Found
      </p>
      <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mb-6">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-maroon-700 hover:bg-maroon-800 dark:bg-gold-500 dark:text-maroon-950 dark:hover:bg-gold-400 transition-colors shadow-sm"
      >
        Return to Home
      </Link>
    </div>
  )
}
