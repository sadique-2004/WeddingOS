import React, { useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Kanban,
  ListFilter,
  User,
  ArrowRight,
  Filter,
  GripVertical,
} from 'lucide-react'

export interface Task {
  id: string
  title: string
  description?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate: string
  assigneeName: string
  assigneeRole: string
  relatedCeremony?: string
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-1',
    title: 'Finalize Royal Safa Tying Master & Turbans',
    description: 'Confirm 180 bespoke peach and gold tissue safas with traditional Mewari tying artisans for Baraat.',
    priority: 'HIGH',
    status: 'TODO',
    dueDate: '2026-11-20',
    assigneeName: 'Kabir & Brother',
    assigneeRole: 'Groom Family',
    relatedCeremony: 'Baraat & Pheras',
  },
  {
    id: 'tsk-2',
    title: 'Sangeet Choreography Music Mix & Audio Tracks',
    description: 'Submit edited 12-minute family medley track to the AV console team for ballroom acoustics test.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: '2026-11-25',
    assigneeName: 'Rhea Singhania',
    assigneeRole: 'Sister of Groom',
    relatedCeremony: 'Sangeet & Cocktail',
  },
  {
    id: 'tsk-3',
    title: 'Source 50kg Organic Mogra & Desi Rose Petals',
    description: 'Procure pesticide-free yellow marigolds and scented roses for morning Phoolon Ki Holi.',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '2026-12-01',
    assigneeName: 'Devika Sharma',
    assigneeRole: 'Master Wedding Planner',
    relatedCeremony: 'Haldi & Phoolon Ki Holi',
  },
  {
    id: 'tsk-4',
    title: 'Bride Bridal Lehenga Trial & Final Steaming',
    description: 'Final fitting appointment at Sabyasachi atelier, inspect zardozi embroidery and dupatta draping.',
    priority: 'HIGH',
    status: 'COMPLETED',
    dueDate: '2026-11-10',
    assigneeName: 'Ananya Roy',
    assigneeRole: 'Bride',
    relatedCeremony: 'Baraat & Pheras',
  },
  {
    id: 'tsk-5',
    title: 'Confirm Live Wood-Fired Chaat & Kulhad Chai Counter',
    description: 'Approve menu items for Chandni Chowk style street delicacies during poolside Mehendi.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    dueDate: '2026-11-28',
    assigneeName: 'Devika Sharma',
    assigneeRole: 'Master Wedding Planner',
    relatedCeremony: 'Mehendi & High Tea',
  },
  {
    id: 'tsk-6',
    title: 'Luxury Vintage Car Permit & Lake Palace Boat Jetty',
    description: 'Secure lake crossing permits with palace security for vintage 1948 Rolls Royce arrival.',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    dueDate: '2026-11-15',
    assigneeName: 'Kabir Singhania',
    assigneeRole: 'Groom',
    relatedCeremony: 'Baraat & Pheras',
  },
  {
    id: 'tsk-7',
    title: 'VIP Welcome Hampers & Personalized Itinerary Letters',
    description: 'Assemble 140 brass gift hampers with Mewari sweets, brass diyas, and printed daywise itineraries.',
    priority: 'LOW',
    status: 'TODO',
    dueDate: '2026-12-05',
    assigneeName: 'Ananya & Mother',
    assigneeRole: 'Bride Family',
    relatedCeremony: 'All Ceremonies',
  },
  {
    id: 'tsk-8',
    title: 'Lake Pichola Fireworks License Clearance',
    description: 'Obtain local civil defense green-fireworks permit for 5-minute synchronised midnight spectacle.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: '2026-11-22',
    assigneeName: 'Devika Sharma',
    assigneeRole: 'Master Wedding Planner',
    relatedCeremony: 'Grand Royal Reception',
  },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [ceremonyFilter, setCeremonyFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedTaskId(id)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== status) {
      setDragOverColumn(status)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return
    }
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId
    if (id) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      )
    }
    setDraggedTaskId(null)
    setDragOverColumn(null)
  }

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Task['priority'],
    status: 'TODO' as Task['status'],
    dueDate: '2026-12-01',
    assigneeName: 'Devika Sharma',
    assigneeRole: 'Master Wedding Planner',
    relatedCeremony: 'Haldi & Phoolon Ki Holi',
  })

  const openAddModal = () => {
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: '2026-12-01',
      assigneeName: 'Devika Sharma',
      assigneeRole: 'Master Wedding Planner',
      relatedCeremony: 'Sangeet & Cocktail',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (tsk: Task) => {
    setEditingTask(tsk)
    setFormData({
      title: tsk.title,
      description: tsk.description || '',
      priority: tsk.priority,
      status: tsk.status,
      dueDate: tsk.dueDate,
      assigneeName: tsk.assigneeName,
      assigneeRole: tsk.assigneeRole,
      relatedCeremony: tsk.relatedCeremony || 'All Ceremonies',
    })
    setIsModalOpen(true)
  }

  const handleToggleStatus = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const nextStatus: Task['status'] =
            t.status === 'COMPLETED'
              ? 'TODO'
              : t.status === 'TODO'
              ? 'IN_PROGRESS'
              : 'COMPLETED'
          return { ...t, status: nextStatus }
        }
        return t
      })
    )
  }

  const handleDelete = (id: string) => {
    if (confirm('Remove this preparation task from your wedding checklist?')) {
      setTasks(tasks.filter((t) => t.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTask) {
      setTasks(
        tasks.map((t) => (t.id === editingTask.id ? { ...t, ...formData } : t))
      )
    } else {
      const newTask: Task = {
        id: `tsk-${Date.now()}`,
        ...formData,
      }
      setTasks([...tasks, newTask])
    }
    setIsModalOpen(false)
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority =
      priorityFilter === 'all' || t.priority === priorityFilter
    const matchesCeremony =
      ceremonyFilter === 'all' || t.relatedCeremony === ceremonyFilter
    return matchesPriority && matchesCeremony
  })

  // Statistics
  const totalCount = tasks.length
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const todoCount = tasks.filter((t) => t.status === 'TODO').length
  const highPriorityCount = tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'COMPLETED').length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-2.5 h-2.5 text-red-600" />
            <span>High Priority</span>
          </span>
        )
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700">
            <span>Medium Priority</span>
          </span>
        )
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 border border-neutral-200 text-neutral-600">
            <span>Low Priority</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* ========================================= */}
      {/* 1. HEADER SECTION                         */}
      {/* ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6bd81]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdf5ea] border border-[#e6bd81]/40 text-[#85531d] text-[10px] font-bold tracking-widest uppercase mb-1.5">
            <Sparkles className="w-3 h-3 text-[#85531d]" />
            <span>Master Checklist</span>
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#3a0208] tracking-tight">
            Preparation Tasks &amp; Delegation
          </h1>
          <p className="text-xs sm:text-sm text-[#4b030e]/75 font-sans mt-0.5">
            Assign deliverables across family elders, wedding planners, and bridal parties with ceremonial precision.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="inline-flex items-center p-1 bg-white border border-[#e6bd81]/40 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#6f0617] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6f0617] hover:bg-[#520411] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. STATS & PROGRESS OVERVIEW              */}
      {/* ========================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Progress Card */}
        <div className="bg-white p-4 rounded-xl border border-[#e6bd81]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
            <span>Overall Readiness</span>
            <span className="text-[#6f0617]">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#6f0617] h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-[10px] text-neutral-400 block">
            {completedCount} of {totalCount} deliverables finalized
          </span>
        </div>

        {/* To Do */}
        <div className="bg-white p-4 rounded-xl border border-[#e6bd81]/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">Pending Action</span>
            <span className="font-cormorant text-2xl font-bold text-[#3a0208]">{todoCount} Tasks</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-xs">
            {todoCount}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-xl border border-[#e6bd81]/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">In Execution</span>
            <span className="font-cormorant text-2xl font-bold text-amber-700">{inProgressCount} Active</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs">
            {inProgressCount}
          </div>
        </div>

        {/* Urgent Alert */}
        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-red-600 block">Critical Priority</span>
            <span className="font-cormorant text-2xl font-bold text-red-700">{highPriorityCount} Urgent</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. FILTERS BAR                            */}
      {/* ========================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#faf7f2] p-3 rounded-xl border border-[#e6bd81]/30">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-neutral-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5 text-[#b88444]" />
            <span>Filters:</span>
          </div>
          
          {/* Priority filter */}
          {['all', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                priorityFilter === p
                  ? 'bg-[#6f0617] text-white shadow-2xs font-semibold'
                  : 'bg-white border border-[#e6bd81]/40 text-neutral-700 hover:bg-[#f4efe8]'
              }`}
            >
              {p === 'all' ? 'All Priorities' : p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-medium">Ceremony:</span>
          <select
            value={ceremonyFilter}
            onChange={(e) => setCeremonyFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-[#e6bd81]/40 bg-white text-xs font-medium text-neutral-800 outline-none cursor-pointer"
          >
            <option value="all">All Ceremonies</option>
            <option value="Haldi & Phoolon Ki Holi">Haldi</option>
            <option value="Mehendi & High Tea">Mehendi</option>
            <option value="Sangeet & Cocktail">Sangeet</option>
            <option value="Baraat & Pheras">Baraat &amp; Pheras</option>
            <option value="Grand Royal Reception">Grand Reception</option>
          </select>
        </div>
      </div>

      {/* ========================================= */}
      {/* 4. TASKS DISPLAY (KANBAN BOARD OR LIST)   */}
      {/* ========================================= */}
      {viewMode === 'kanban' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-[#85531d] bg-[#fdf5ea] px-3 py-1.5 rounded-lg border border-[#e6bd81]/40 w-fit">
            <GripVertical className="w-3.5 h-3.5 text-[#b88444]" />
            <span>Drag and drop deliverable cards between columns to update status</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* COLUMN 1: TO DO */}
            <div
              onDragOver={(e) => handleDragOver(e, 'TODO')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'TODO')}
              className={`rounded-2xl border p-4 space-y-4 transition-all duration-200 min-h-[420px] flex flex-col ${
                dragOverColumn === 'TODO'
                  ? 'bg-[#faf4ec] border-[#b88444] ring-2 ring-[#e6bd81]/60 shadow-gold-sm'
                  : 'bg-[#fcfaf7] border-[#e6bd81]/40'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e6bd81]/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                  <h3 className="font-cormorant text-xl font-bold text-[#3a0208]">To Do</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-neutral-200 text-xs font-bold text-neutral-600 shadow-2xs">
                  {filteredTasks.filter((t) => t.status === 'TODO').length}
                </span>
              </div>

              <div className="space-y-3 flex-1 flex flex-col">
                {filteredTasks
                  .filter((t) => t.status === 'TODO')
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isDragging={draggedTaskId === task.id}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onEdit={() => openEditModal(task)}
                      onDelete={() => handleDelete(task.id)}
                      getPriorityBadge={getPriorityBadge}
                    />
                  ))}

                {draggedTaskId && dragOverColumn === 'TODO' && (
                  <div className="rounded-xl border-2 border-dashed border-[#b88444] bg-white/80 p-3.5 text-center text-xs font-semibold text-[#85531d] animate-pulse">
                    Drop here for To Do
                  </div>
                )}

                {filteredTasks.filter((t) => t.status === 'TODO').length === 0 && !draggedTaskId && (
                  <div className="flex-1 min-h-[140px] rounded-xl border-2 border-dashed border-neutral-200/80 flex items-center justify-center text-xs text-neutral-400">
                    No pending deliverables
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: IN PROGRESS */}
            <div
              onDragOver={(e) => handleDragOver(e, 'IN_PROGRESS')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'IN_PROGRESS')}
              className={`rounded-2xl border p-4 space-y-4 transition-all duration-200 min-h-[420px] flex flex-col ${
                dragOverColumn === 'IN_PROGRESS'
                  ? 'bg-[#fffcf4] border-amber-400 ring-2 ring-amber-300 shadow-md'
                  : 'bg-[#fdfaf5] border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="font-cormorant text-xl font-bold text-[#3a0208]">In Progress</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-amber-300 text-xs font-bold text-amber-800 shadow-2xs">
                  {filteredTasks.filter((t) => t.status === 'IN_PROGRESS').length}
                </span>
              </div>

              <div className="space-y-3 flex-1 flex flex-col">
                {filteredTasks
                  .filter((t) => t.status === 'IN_PROGRESS')
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isDragging={draggedTaskId === task.id}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onEdit={() => openEditModal(task)}
                      onDelete={() => handleDelete(task.id)}
                      getPriorityBadge={getPriorityBadge}
                    />
                  ))}

                {draggedTaskId && dragOverColumn === 'IN_PROGRESS' && (
                  <div className="rounded-xl border-2 border-dashed border-amber-500 bg-white/80 p-3.5 text-center text-xs font-semibold text-amber-800 animate-pulse">
                    Drop here for In Progress
                  </div>
                )}

                {filteredTasks.filter((t) => t.status === 'IN_PROGRESS').length === 0 && !draggedTaskId && (
                  <div className="flex-1 min-h-[140px] rounded-xl border-2 border-dashed border-amber-200/60 flex items-center justify-center text-xs text-amber-700/60">
                    No active tasks in progress
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 3: COMPLETED */}
            <div
              onDragOver={(e) => handleDragOver(e, 'COMPLETED')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'COMPLETED')}
              className={`rounded-2xl border p-4 space-y-4 transition-all duration-200 min-h-[420px] flex flex-col ${
                dragOverColumn === 'COMPLETED'
                  ? 'bg-[#f2faf3] border-emerald-500 ring-2 ring-emerald-300 shadow-md'
                  : 'bg-[#f5f9f5] border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h3 className="font-cormorant text-xl font-bold text-[#3a0208]">Completed</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-emerald-300 text-xs font-bold text-emerald-800 shadow-2xs">
                  {filteredTasks.filter((t) => t.status === 'COMPLETED').length}
                </span>
              </div>

              <div className="space-y-3 flex-1 flex flex-col">
                {filteredTasks
                  .filter((t) => t.status === 'COMPLETED')
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isDragging={draggedTaskId === task.id}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onEdit={() => openEditModal(task)}
                      onDelete={() => handleDelete(task.id)}
                      getPriorityBadge={getPriorityBadge}
                    />
                  ))}

                {draggedTaskId && dragOverColumn === 'COMPLETED' && (
                  <div className="rounded-xl border-2 border-dashed border-emerald-500 bg-white/80 p-3.5 text-center text-xs font-semibold text-emerald-800 animate-pulse">
                    Drop here to complete task
                  </div>
                )}

                {filteredTasks.filter((t) => t.status === 'COMPLETED').length === 0 && !draggedTaskId && (
                  <div className="flex-1 min-h-[140px] rounded-xl border-2 border-dashed border-emerald-200/60 flex items-center justify-center text-xs text-emerald-700/60">
                    No finalized tasks yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-2xl border border-[#e6bd81]/40 shadow-xs divide-y divide-neutral-100 overflow-hidden">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#fcfaf7] transition-colors"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(task.id)}
                  className="mt-0.5 text-neutral-400 hover:text-[#6f0617] cursor-pointer shrink-0"
                >
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        task.status === 'COMPLETED'
                          ? 'line-through text-neutral-400'
                          : 'text-[#3a0208]'
                      }`}
                    >
                      {task.title}
                    </span>
                    {getPriorityBadge(task.priority)}
                    {task.relatedCeremony && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#fdf5ea] text-[#85531d] border border-[#e6bd81]/30">
                        {task.relatedCeremony}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-neutral-500 line-clamp-1">{task.description}</p>
                  )}
                </div>
              </div>

              {/* Right side assignee & actions */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <span className="font-semibold text-neutral-800">{task.assigneeName}</span>
                  <span className="text-[10px] text-neutral-400">{task.assigneeRole}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Clock className="w-3.5 h-3.5 text-[#b88444]" />
                  <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(task)}
                    className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================= */}
      {/* 5. ADD / EDIT TASK MODAL DIALOG           */}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#e6bd81]/40 w-full max-w-lg p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="font-cormorant text-2xl font-semibold text-[#3a0208]">
                {editingTask ? 'Edit Task Details' : 'Add Preparation Deliverable'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Confirm 180 Peach Safas with Turban Master"
                  className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                  Description &amp; Deliverable Details
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide vendor instructions, contact telephone, quantities, or specific requirements..."
                  className="w-full p-3 rounded-lg border border-neutral-300 focus:border-[#6f0617] focus:ring-1 focus:ring-[#6f0617] outline-none text-xs text-neutral-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as Task['priority'],
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs outline-none cursor-pointer"
                  >
                    <option value="HIGH">High Priority (Urgent)</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Assigned Organizer
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.assigneeName}
                    onChange={(e) => setFormData({ ...formData, assigneeName: e.target.value })}
                    placeholder="e.g. Devika Sharma"
                    className="w-full h-10 px-3.5 rounded-lg border border-neutral-300 focus:border-[#6f0617] outline-none text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                    Related Ceremony
                  </label>
                  <select
                    value={formData.relatedCeremony}
                    onChange={(e) => setFormData({ ...formData, relatedCeremony: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-xs outline-none cursor-pointer"
                  >
                    <option value="Haldi & Phoolon Ki Holi">Haldi</option>
                    <option value="Mehendi & High Tea">Mehendi</option>
                    <option value="Sangeet & Cocktail">Sangeet</option>
                    <option value="Baraat & Pheras">Baraat &amp; Pheras</option>
                    <option value="Grand Royal Reception">Grand Reception</option>
                    <option value="All Ceremonies">All Ceremonies</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#6f0617] hover:bg-[#520411] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  getPriorityBadge,
}: {
  task: Task
  isDragging: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  onEdit: () => void
  onDelete: () => void
  getPriorityBadge: (p: Task['priority']) => React.ReactNode
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-xl border p-4 shadow-2xs hover:shadow-md transition-all duration-200 space-y-3 group cursor-grab active:cursor-grabbing select-none ${
        isDragging
          ? 'opacity-35 border-dashed border-[#b88444] scale-[0.98] ring-2 ring-[#e6bd81]/40'
          : 'border-neutral-200/80 hover:border-[#b88444]/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
          {getPriorityBadge(task.priority)}
        </div>
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
            title="Edit Task"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div>
        <h4
          className={`text-xs sm:text-sm font-semibold leading-snug ${
            task.status === 'COMPLETED' ? 'line-through text-neutral-400' : 'text-[#3a0208]'
          }`}
        >
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {task.relatedCeremony && (
        <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#85531d] bg-[#fdf5ea] px-2 py-0.5 rounded border border-[#e6bd81]/30">
          <span>{task.relatedCeremony}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-700">
          <div className="w-5 h-5 rounded-full bg-[#faf4ec] border border-[#e6bd81]/40 flex items-center justify-center text-[10px] font-bold text-[#6f0617]">
            <User className="w-2.5 h-2.5" />
          </div>
          <span className="text-[11px] font-medium text-neutral-600 truncate max-w-[110px]">
            {task.assigneeName}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#85531d] font-medium">
          <Clock className="w-3 h-3 text-[#b88444]" />
          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  )
}
