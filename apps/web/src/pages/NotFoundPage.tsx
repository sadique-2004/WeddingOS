import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16 space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#fbe6e9] border border-[#f8cfd5] flex items-center justify-center text-[#6f0617] text-2xl font-serif font-bold">
        404
      </div>
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#4b030e] tracking-tight">
        Page Not Found
      </h1>
      <p className="text-sm sm:text-base text-[#4b030e]/70 max-w-md font-sans leading-relaxed">
        The link you opened may have been moved, expired, or does not exist. Please check the address or return home.
      </p>
      <div className="pt-2">
        <Link to="/">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
