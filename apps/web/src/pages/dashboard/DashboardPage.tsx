import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  Users2,
  CheckSquare,
  DollarSign,
  Camera,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  QrCode,
  MapPin,
  AlertCircle
} from 'lucide-react'

export default function DashboardPage() {
  const [wedding, setWedding] = useState({
    brideName: 'Aisha',
    groomName: 'Imran',
    weddingDate: '2027-02-18',
    locationName: 'Bengaluru, Karnataka',
  })

  // Mock initial tasks with toggle state
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Confirm Sangeet Choreographer & Song List', priority: 'HIGH', due: 'Feb 10', completed: false, ceremony: 'Sangeet' },
    { id: 2, title: 'Finalize Haldi Floral Decor & Marigold Strings', priority: 'MEDIUM', due: 'Feb 12', completed: true, ceremony: 'Haldi' },
    { id: 3, title: 'Review Reception Stage LED Screen Layout', priority: 'HIGH', due: 'Feb 14', completed: false, ceremony: 'Reception' },
    { id: 4, title: 'Dispatch Wedding Favors & Sweets Hampers', priority: 'LOW', due: 'Feb 15', completed: false, ceremony: 'Wedding' },
  ])

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

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <div className="space-y-8 pb-12">
      {/* ========================================= */}
      {/* TOP COUNTDOWN & WELCOME BANNER            */}
      {/* ========================================= */}
      <div className="rounded-2xl bg-gradient-to-r from-[#4b030e] via-[#6f0617] to-[#880e1f] text-white p-6 sm:p-8 border border-[#b88444]/40 shadow-gold-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#e6bd81]">
            <Clock className="w-3.5 h-3.5" />
            <span>Ceremonial Countdown</span>
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white">
            {wedding.brideName} &amp; {wedding.groomName}
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-sans flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#e6bd81]" />
            <span>{wedding.weddingDate}</span>
            <span>&bull;</span>
            <MapPin className="w-3.5 h-3.5 text-[#e6bd81]" />
            <span>{wedding.locationName}</span>
          </p>
        </div>

        {/* Live Countdown Clock Widget */}
        <div className="flex items-center gap-3 z-10">
          <div className="p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-md border border-[#e6bd81]/30 text-center min-w-[70px]">
            <span className="font-cormorant text-2xl sm:text-3xl font-bold text-[#e6bd81] block leading-none">
              124
            </span>
            <span className="text-[10px] uppercase font-semibold text-white/80 tracking-wider">Days</span>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-md border border-[#e6bd81]/30 text-center min-w-[70px]">
            <span className="font-cormorant text-2xl sm:text-3xl font-bold text-[#e6bd81] block leading-none">
              18
            </span>
            <span className="text-[10px] uppercase font-semibold text-white/80 tracking-wider">Hours</span>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-md border border-[#e6bd81]/30 text-center min-w-[70px]">
            <span className="font-cormorant text-2xl sm:text-3xl font-bold text-[#e6bd81] block leading-none">
              45
            </span>
            <span className="text-[10px] uppercase font-semibold text-white/80 tracking-wider">Mins</span>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* QUICK ACTIONS BAR                         */}
      {/* ========================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl gold-border shadow-2xs">
        <span className="text-xs font-semibold text-[#4b030e] px-2 uppercase tracking-wider">
          Quick Actions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/app/events">
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Ceremony
            </Button>
          </Link>
          <Link to="/app/tasks">
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Task
            </Button>
          </Link>
          <Link to="/app/invitations">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Invite Family
            </Button>
          </Link>
          <Link to="/app/check-in">
            <Button variant="gold" size="sm" leftIcon={<QrCode className="w-3.5 h-3.5" />}>
              Check-In Mode
            </Button>
          </Link>
        </div>
      </div>

      {/* ========================================= */}
      {/* 4 CORE METRIC CARDS                       */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: RSVP Attendance */}
        <Card hoverEffect className="relative overflow-hidden">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-[#fbe6e9] flex items-center justify-center text-[#6f0617]">
                <Users2 className="w-5 h-5" />
              </div>
              <Badge variant="success" size="sm">78% Confirmed</Badge>
            </div>
            <div>
              <span className="text-xs text-[#4b030e]/70 font-medium block">
                RSVP Attendance
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-cormorant text-3xl font-bold text-[#4b030e]">
                  340
                </span>
                <span className="text-xs text-[#4b030e]/60 font-sans">
                  / 450 capacity
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-[#faf9f6] border border-[#e6bd81]/40 overflow-hidden">
              <div className="h-full bg-[#6f0617] rounded-full" style={{ width: '78%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#4b030e]/75 pt-1">
              <span>85 Families Invited</span>
              <span className="font-semibold text-[#6f0617]">12 Pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Preparation Tasks */}
        <Card hoverEffect>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-[#fdfaf2] flex items-center justify-center text-[#b88444]">
                <CheckSquare className="w-5 h-5" />
              </div>
              <Badge variant="gold" size="sm">
                {Math.round((completedCount / tasks.length) * 100)}% Done
              </Badge>
            </div>
            <div>
              <span className="text-xs text-[#4b030e]/70 font-medium block">
                Preparation Tasks
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-cormorant text-3xl font-bold text-[#4b030e]">
                  {completedCount} of {tasks.length}
                </span>
                <span className="text-xs text-[#4b030e]/60 font-sans">
                  Completed
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-[#faf9f6] border border-[#e6bd81]/40 overflow-hidden">
              <div
                className="h-full bg-[#b88444] rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#4b030e]/75 pt-1">
              <span>Next deadline: Feb 10</span>
              <span className="font-semibold text-[#a5172a]">2 High Priority</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Budget & Expenses */}
        <Link to="/app/expenses" className="block">
          <Card hoverEffect className="h-full">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#fbe6e9] flex items-center justify-center text-[#6f0617]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <Badge variant="neutral" size="sm">INR (₹)</Badge>
              </div>
              <div>
                <span className="text-xs text-[#4b030e]/70 font-medium block">
                  Expenses Recorded
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-cormorant text-3xl font-bold text-[#4b030e]">
                    ₹30,85,000
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#faf9f6] border border-[#e6bd81]/40 overflow-hidden">
                <div className="h-full bg-[#6f0617] rounded-full" style={{ width: '68%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#4b030e]/75 pt-1">
                <span>Budget: ₹45,00,000</span>
                <span className="font-semibold text-emerald-700">68% utilized</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 4: Moderated Photos */}
        <Card hoverEffect>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-[#fffbeb] flex items-center justify-center text-[#d97706]">
                <Camera className="w-5 h-5" />
              </div>
              <Badge variant="warning" size="sm">Action Required</Badge>
            </div>
            <div>
              <span className="text-xs text-[#4b030e]/70 font-medium block">
                Photo Moderation Queue
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-cormorant text-3xl font-bold text-[#a5172a]">
                  14
                </span>
                <span className="text-xs text-[#4b030e]/60 font-sans">
                  Pending Review
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-[#faf9f6] border border-[#e6bd81]/40 overflow-hidden">
              <div className="h-full bg-[#d97706] rounded-full" style={{ width: '40%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[#4b030e]/75">86 Approved Live</span>
              <Link to="/app/gallery" className="font-semibold text-[#6f0617] hover:underline">
                Review Photos &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================= */}
      {/* 2-COLUMN MAIN BODY: TIMELINE & TASKS      */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upcoming Ceremonies Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-cormorant text-2xl font-bold text-[#4b030e]">
              Ceremony Schedule
            </h2>
            <Link to="/app/events" className="text-xs font-semibold text-[#6f0617] hover:underline flex items-center gap-1">
              <span>View All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {/* Event 1 */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white gold-border shadow-2xs hover:shadow-gold-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#e6bd81]/50 shadow-2xs">
                  <img src="/events/haldi.jpg" alt="Haldi" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 inset-x-0 text-center text-[9px] font-bold text-white uppercase tracking-wider">Feb 16</span>
                </div>
                <div>
                  <h4 className="font-sans text-sm font-bold text-[#4b030e] group-hover:text-[#6f0617] transition-colors">
                    Haldi &amp; Mehndi Ceremony
                  </h4>
                  <p className="text-xs text-[#4b030e]/70 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-[#b88444]" />
                    <span>04:00 PM - 08:00 PM</span>
                    <span>&bull;</span>
                    <MapPin className="w-3 h-3 text-[#b88444]" />
                    <span>Garden Lawn, Bengaluru</span>
                  </p>
                </div>
              </div>
              <Badge variant="gold" size="sm">Festive Yellow &amp; Green</Badge>
            </div>

            {/* Event 2 */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white gold-border shadow-2xs hover:shadow-gold-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#e6bd81]/50 shadow-2xs">
                  <img src="/events/sangeet.jpg" alt="Sangeet" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 inset-x-0 text-center text-[9px] font-bold text-white uppercase tracking-wider">Feb 17</span>
                </div>
                <div>
                  <h4 className="font-sans text-sm font-bold text-[#4b030e] group-hover:text-[#6f0617] transition-colors">
                    Sangeet &amp; Cocktail Gala
                  </h4>
                  <p className="text-xs text-[#4b030e]/70 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-[#6f0617]" />
                    <span>07:30 PM onwards</span>
                    <span>&bull;</span>
                    <MapPin className="w-3 h-3 text-[#6f0617]" />
                    <span>Grand Ballroom, Palace Grounds</span>
                  </p>
                </div>
              </div>
              <Badge variant="primary" size="sm">Indo-Western Glitz</Badge>
            </div>

            {/* Event 3 */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white gold-border shadow-2xs hover:shadow-gold-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#e6bd81]/50 shadow-2xs">
                  <img src="/events/pheras.jpg" alt="Pheras" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 inset-x-0 text-center text-[9px] font-bold text-white uppercase tracking-wider">Feb 18</span>
                </div>
                <div>
                  <h4 className="font-sans text-sm font-bold text-[#4b030e] group-hover:text-[#6f0617] transition-colors">
                    Main Wedding / Pheras &amp; Reception
                  </h4>
                  <p className="text-xs text-[#4b030e]/70 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-[#b88444]" />
                    <span>10:30 AM - 03:30 PM</span>
                    <span>&bull;</span>
                    <MapPin className="w-3 h-3 text-[#b88444]" />
                    <span>Royal Courtyard, Bengaluru</span>
                  </p>
                </div>
              </div>
              <Badge variant="gold" size="sm">Traditional Royal</Badge>
            </div>
          </div>
        </div>

        {/* Right Column: Urgent Preparation Tasks (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-cormorant text-2xl font-bold text-[#4b030e]">
              Urgent Checklist
            </h2>
            <Link to="/app/tasks" className="text-xs font-semibold text-[#6f0617] hover:underline flex items-center gap-1">
              <span>View Tasks ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="shadow-2xs border-[#e6bd81]/50">
            <CardContent className="p-4 space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    task.completed
                      ? 'bg-[#faf9f6] border-stone-200/80 opacity-70'
                      : 'bg-white border-[#e6bd81]/40 hover:border-[#b88444]'
                  }`}
                >
                  <button
                    type="button"
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      task.completed
                        ? 'bg-[#6f0617] border-[#6f0617] text-white'
                        : 'border-[#e6bd81] hover:border-[#6f0617]'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-snug truncate ${
                        task.completed ? 'line-through text-stone-500' : 'text-[#4b030e]'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                      <span className="text-[#4b030e]/60">{task.ceremony}</span>
                      <span>&bull;</span>
                      <span className="text-[#b88444] font-medium">Due {task.due}</span>
                      {task.priority === 'HIGH' && (
                        <span className="px-1.5 py-0.2 rounded bg-[#fef2f2] text-[#a5172a] font-bold">
                          HIGH
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link to="/app/tasks" className="w-full">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-[#6f0617]">
                    + Add New Preparation Task
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
