import { Badge } from '../components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { ShieldCheck, Users, HeartHandshake, Lock, Smartphone, Sparkles } from 'lucide-react'

export default function AboutPage() {
  const principles = [
    {
      icon: <Users className="w-5 h-5 text-[#6f0617]" />,
      title: 'Family-First Invitations',
      desc: 'Indian weddings invite families as a collective unit. We manage allowed attendee counts per family without forcing individual member profiles.',
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-[#b88444]" />,
      title: 'Frictionless Guest Experience',
      desc: 'Elderly relatives and busy friends can RSVP, view ceremony directions, and upload photos directly from a link with zero logins or app downloads.',
    },
    {
      icon: <Lock className="w-5 h-5 text-[#6f0617]" />,
      title: 'Privacy by Default',
      desc: 'Galleries are private-by-link and guest uploads remain pending review until an authorized organizer explicitly approves them.',
    },
    {
      icon: <Smartphone className="w-5 h-5 text-[#b88444]" />,
      title: 'Mobile-First Logistics',
      desc: 'Venue reception check-in, RSVP submission, and quick photo uploads are optimized for smartphone touchscreens and mobile networks.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#6f0617]" />,
      title: 'Strict Workspace Isolation',
      desc: 'Your wedding data, guest contact numbers, and spending budgets belong strictly to your wedding workspace with robust server-side protection.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#b88444]" />,
      title: 'No False Automation',
      desc: 'WhatsApp sharing generates pre-filled messages for organizers to send manually, ensuring personal touch and preventing robotic spam.',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="gold" size="sm">Our Mission & Principles</Badge>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#4b030e] tracking-tight">
          About WeddingOS
        </h1>
        <p className="text-base sm:text-lg text-[#4b030e]/80 leading-relaxed font-sans">
          Wedding planning often relies on disconnected spreadsheets, fragmented chat groups, lost paper notes, and scattered photo links. WeddingOS brings harmony to modern Indian weddings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {principles.map((p, i) => (
          <Card key={i} hoverEffect>
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-[#faf9f6] border border-[#e6bd81]/50 flex items-center justify-center mb-2">
                {p.icon}
              </div>
              <CardTitle className="text-lg">{p.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-[#4b030e]/75 leading-relaxed">
                {p.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
