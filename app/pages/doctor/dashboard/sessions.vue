<script setup lang="ts">
import {
  Search, SlidersHorizontal, Plus, ChevronUp, ChevronDown,
  ChevronsUpDown, FileText, Video, MapPin,
  CheckCircle2, XCircle, Clock, AlertCircle,
  CalendarDays, Pencil, Ban, Eye, RotateCcw, X,
} from 'lucide-vue-next'
import { format, parseISO, addDays, startOfWeek, subWeeks, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '~/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '~/components/ui/dropdown-menu'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '~/components/ui/popover'
import { Slider } from '~/components/ui/slider'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'

definePageMeta({ layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────────────────────

type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show'
type Modality      = 'online' | 'inperson'
type SortKey       = 'title' | 'patient' | 'start' | 'end' | 'status' | 'fee'
type SortDir       = 'asc' | 'desc'

interface Session {
  id: string
  title: string
  patient: { id: string; name: string; initials: string }
  start: string
  end: string
  status: SessionStatus
  modality: Modality
  location?: string
  notes: number
  uploads: number
  fee: number
}

// ── Seed data ──────────────────────────────────────────────────────────────

function iso(base: Date, h: number, m = 0): string {
  const d = new Date(base)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}:00`
}

const mon  = startOfWeek(new Date(), { weekStartsOn: 1 })
const prev = subWeeks(mon, 1)

const sessions = ref<Session[]>([
  {
    id: 's1', title: 'Weekly Check-in',
    patient: { id: 'p1', name: 'Sofia Martinez', initials: 'SM' },
    start: iso(addDays(mon, 0), 10), end: iso(addDays(mon, 0), 11),
    status: 'completed', modality: 'online', notes: 3, uploads: 1, fee: 85,
  },
  {
    id: 's2', title: 'Initial Assessment',
    patient: { id: 'p2', name: 'James Wilson', initials: 'JW' },
    start: iso(addDays(mon, 0), 14), end: iso(addDays(mon, 0), 15),
    status: 'completed', modality: 'inperson', location: 'Room 101', notes: 5, uploads: 2, fee: 120,
  },
  {
    id: 's3', title: 'CBT Session',
    patient: { id: 'p3', name: 'Emma Thompson', initials: 'ET' },
    start: iso(addDays(mon, 2), 11), end: iso(addDays(mon, 2), 12),
    status: 'completed', modality: 'online', notes: 2, uploads: 0, fee: 85,
  },
  {
    id: 's4', title: 'Anxiety Follow-up',
    patient: { id: 'p4', name: 'Carlos Rivera', initials: 'CR' },
    start: iso(addDays(mon, 3), 9), end: iso(addDays(mon, 3), 10),
    status: 'scheduled', modality: 'online', notes: 0, uploads: 0, fee: 85,
  },
  {
    id: 's5', title: 'Trauma Processing',
    patient: { id: 'p5', name: 'Aisha Patel', initials: 'AP' },
    start: iso(addDays(mon, 3), 15), end: iso(addDays(mon, 3), 16),
    status: 'scheduled', modality: 'inperson', location: 'Room 102', notes: 1, uploads: 0, fee: 95,
  },
  {
    id: 's6', title: 'Mindfulness Training',
    patient: { id: 'p6', name: 'Noah Chen', initials: 'NC' },
    start: iso(addDays(mon, 4), 11), end: iso(addDays(mon, 4), 12),
    status: 'scheduled', modality: 'online', notes: 0, uploads: 0, fee: 85,
  },
  {
    id: 's7', title: 'Couples Therapy',
    patient: { id: 'p7', name: 'Lucia Fernández', initials: 'LF' },
    start: iso(addDays(mon, 4), 14), end: iso(addDays(mon, 4), 15, 30),
    status: 'scheduled', modality: 'inperson', location: 'Main Street Clinic', notes: 0, uploads: 0, fee: 150,
  },
  {
    id: 's8', title: 'Mood Tracking Review',
    patient: { id: 'p1', name: 'Sofia Martinez', initials: 'SM' },
    start: iso(addDays(prev, 0), 10), end: iso(addDays(prev, 0), 11),
    status: 'completed', modality: 'online', notes: 4, uploads: 0, fee: 85,
  },
  {
    id: 's9', title: 'Exposure Therapy',
    patient: { id: 'p8', name: "Michael O'Brien", initials: 'MO' },
    start: iso(addDays(prev, 1), 13), end: iso(addDays(prev, 1), 14),
    status: 'cancelled', modality: 'online', notes: 0, uploads: 0, fee: 85,
  },
  {
    id: 's10', title: 'Sleep Disorder Consult',
    patient: { id: 'p9', name: 'Hannah Kim', initials: 'HK' },
    start: iso(addDays(prev, 2), 9), end: iso(addDays(prev, 2), 10),
    status: 'completed', modality: 'inperson', location: 'Room 101', notes: 6, uploads: 3, fee: 95,
  },
  {
    id: 's11', title: 'Grief Counseling',
    patient: { id: 'p10', name: 'David Okafor', initials: 'DO' },
    start: iso(addDays(prev, 3), 16), end: iso(addDays(prev, 3), 17),
    status: 'no-show', modality: 'online', notes: 1, uploads: 0, fee: 85,
  },
  {
    id: 's12', title: 'CBT Session',
    patient: { id: 'p3', name: 'Emma Thompson', initials: 'ET' },
    start: iso(addDays(prev, 2), 14), end: iso(addDays(prev, 2), 15),
    status: 'completed', modality: 'online', notes: 3, uploads: 1, fee: 85,
  },
])

// ── Filter state ───────────────────────────────────────────────────────────

const search        = ref('')
const dateFrom      = ref('')
const dateTo        = ref('')
const statusFilter  = ref<Set<SessionStatus>>(new Set())
const modalityFilter = ref<Set<Modality>>(new Set())

const FEE_MIN = 0
const FEE_MAX = 200
const feeRange = ref<[number, number]>([FEE_MIN, FEE_MAX])

const hasWithNotes   = ref(false)
const hasWithUploads = ref(false)

// ── Active filter chips ────────────────────────────────────────────────────

const activeFilters = computed(() => {
  const chips: { id: string; label: string; clear: () => void }[] = []

  if (dateFrom.value || dateTo.value) {
    const from = dateFrom.value ? format(parseISO(dateFrom.value), 'MMM d') : '…'
    const to   = dateTo.value   ? format(parseISO(dateTo.value),   'MMM d') : '…'
    chips.push({
      id: 'date',
      label: `${from} – ${to}`,
      clear: () => { dateFrom.value = ''; dateTo.value = '' },
    })
  }

  for (const s of statusFilter.value) {
    chips.push({
      id: `status-${s}`,
      label: statusMeta[s].label,
      clear: () => { const next = new Set(statusFilter.value); next.delete(s); statusFilter.value = next },
    })
  }

  for (const m of modalityFilter.value) {
    chips.push({
      id: `modality-${m}`,
      label: m === 'online' ? 'Online' : 'In-person',
      clear: () => { const next = new Set(modalityFilter.value); next.delete(m); modalityFilter.value = next },
    })
  }

  if (feeRange.value[0] !== FEE_MIN || feeRange.value[1] !== FEE_MAX) {
    chips.push({
      id: 'fee',
      label: `€${feeRange.value[0]} – €${feeRange.value[1]}`,
      clear: () => { feeRange.value = [FEE_MIN, FEE_MAX] },
    })
  }

  if (hasWithNotes.value) chips.push({ id: 'notes', label: 'Has notes', clear: () => { hasWithNotes.value = false } })
  if (hasWithUploads.value) chips.push({ id: 'uploads', label: 'Has files', clear: () => { hasWithUploads.value = false } })

  return chips
})

const activeCount = computed(() => activeFilters.value.length)

function clearAllFilters() {
  dateFrom.value = ''
  dateTo.value   = ''
  statusFilter.value = new Set()
  modalityFilter.value = new Set()
  feeRange.value = [FEE_MIN, FEE_MAX]
  hasWithNotes.value   = false
  hasWithUploads.value = false
}

// ── Sorting ────────────────────────────────────────────────────────────────

const sortKey = ref<SortKey>('start')
const sortDir = ref<SortDir>('asc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

// ── Derived list ───────────────────────────────────────────────────────────

const filtered = computed(() => {
  let list = [...sessions.value]

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.patient.name.toLowerCase().includes(q),
    )
  }

  if (dateFrom.value || dateTo.value) {
    list = list.filter((s) => {
      const start = parseISO(s.start)
      if (dateFrom.value && dateTo.value) {
        return isWithinInterval(start, {
          start: startOfDay(parseISO(dateFrom.value)),
          end:   endOfDay(parseISO(dateTo.value)),
        })
      }
      if (dateFrom.value) return start >= startOfDay(parseISO(dateFrom.value))
      if (dateTo.value)   return start <= endOfDay(parseISO(dateTo.value))
      return true
    })
  }

  if (statusFilter.value.size > 0) {
    list = list.filter(s => statusFilter.value.has(s.status))
  }

  if (modalityFilter.value.size > 0) {
    list = list.filter(s => modalityFilter.value.has(s.modality))
  }

  if (feeRange.value[0] !== FEE_MIN || feeRange.value[1] !== FEE_MAX) {
    list = list.filter(s => s.fee >= feeRange.value[0] && s.fee <= feeRange.value[1])
  }

  if (hasWithNotes.value)   list = list.filter(s => s.notes > 0)
  if (hasWithUploads.value) list = list.filter(s => s.uploads > 0)

  list.sort((a, b) => {
    let va: string | number = ''
    let vb: string | number = ''
    if (sortKey.value === 'title')   { va = a.title;        vb = b.title }
    if (sortKey.value === 'patient') { va = a.patient.name; vb = b.patient.name }
    if (sortKey.value === 'start')   { va = a.start;        vb = b.start }
    if (sortKey.value === 'end')     { va = a.end;          vb = b.end }
    if (sortKey.value === 'status')  { va = a.status;       vb = b.status }
    if (sortKey.value === 'fee')     { va = a.fee;          vb = b.fee }
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ?  1 : -1
    return 0
  })

  return list
})

// ── Row actions ────────────────────────────────────────────────────────────

function markComplete(id: string) {
  const s = sessions.value.find(s => s.id === id)
  if (s) s.status = 'completed'
}
function cancelSession(id: string) {
  const s = sessions.value.find(s => s.id === id)
  if (s) s.status = 'cancelled'
}
function markNoShow(id: string) {
  const s = sessions.value.find(s => s.id === id)
  if (s) s.status = 'no-show'
}
function reschedule(id: string) {
  const s = sessions.value.find(s => s.id === id)
  if (!s) return
  const { openCreate } = useCalendar()
  const pad = (n: number) => String(n).padStart(2, '0')
  const now = new Date(); now.setMinutes(0, 0, 0)
  if (now.getHours() < 8) now.setHours(9)
  const end = new Date(now.getTime() + 60 * 60 * 1000)
  const toIso = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  openCreate(toIso(now), toIso(end))
  navigateTo('/doctor/dashboard/calendar')
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDateTime(isoStr: string) { return format(parseISO(isoStr), 'MMM d, HH:mm') }
function fmtTime(isoStr: string)     { return format(parseISO(isoStr), 'HH:mm') }

const statusMeta: Record<SessionStatus, { label: string; badge: string; icon: Component }> = {
  scheduled: { label: 'Scheduled', badge: 'bg-blue-50 text-blue-700 border-blue-200',    icon: Clock        },
  completed: { label: 'Completed', badge: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', badge: 'bg-red-50 text-red-600 border-red-200',        icon: XCircle      },
  'no-show': { label: 'No-show',   badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle  },
}

const columns: { key: SortKey; label: string; sortable: boolean }[] = [
  { key: 'title',   label: 'Title',   sortable: true  },
  { key: 'patient', label: 'Patient', sortable: true  },
  { key: 'start',   label: 'Start',   sortable: true  },
  { key: 'end',     label: 'End',     sortable: false },
  { key: 'status',  label: 'Status',  sortable: true  },
  { key: 'fee',     label: 'Fee',     sortable: true  },
]

function toggleStatus(s: SessionStatus) {
  const next = new Set(statusFilter.value)
  next.has(s) ? next.delete(s) : next.add(s)
  statusFilter.value = next
}
function toggleModality(m: Modality) {
  const next = new Set(modalityFilter.value)
  next.has(m) ? next.delete(m) : next.add(m)
  modalityFilter.value = next
}

// ── Session sheet ──────────────────────────────────────────────────────────

const selectedSession = ref<Session | null>(null)

// ── Schedule new modal ─────────────────────────────────────────────────────

const scheduleModalOpen = ref(false)

function onSessionSaved(s: import('~/components/ScheduleSessionModal.vue').NewSession) {
  const duration = (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000
  const fee = duration <= 50 ? 85 : duration <= 90 ? 120 : 150
  sessions.value.unshift({
    id:       crypto.randomUUID(),
    title:    s.title,
    patient:  { id: s.patientId, name: s.patientName, initials: s.patientInitials },
    start:    s.start,
    end:      s.end,
    status:   'scheduled',
    modality: s.modality,
    location: s.location,
    notes:    s.notes ? 1 : 0,
    uploads:  0,
    fee,
  })
  scheduleModalOpen.value = false
}
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-4 max-w-[1200px]">

      <!-- ── Page header ─────────────────────────────────────────────────── -->
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-foreground tracking-tight">Sessions</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Manage your schedule and appointments.</p>
        </div>
        <Button @click="scheduleModalOpen = true">
          <Plus class="w-4 h-4" />
          Schedule Session
        </Button>
      </div>

      <!-- ── Toolbar: search + filter popover ───────────────────────────── -->
      <div class="flex flex-wrap items-center gap-2.5">

        <!-- Search -->
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            v-model="search"
            type="text"
            placeholder="Search by title or patient…"
            class="pl-9"
          />
        </div>

        <!-- Filter popover ─────────────────────────────────────────────── -->
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              :class="activeCount > 0 ? 'bg-primary/10 text-primary border-primary/30' : ''"
            >
              <SlidersHorizontal class="w-4 h-4" />
              Filters
              <span
                v-if="activeCount > 0"
                class="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {{ activeCount }}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent align="start" class="w-80 p-0 overflow-hidden" :side-offset="6">
            <!-- Panel header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-border">
              <span class="text-sm font-semibold text-foreground">Filters</span>
              <Button
                v-if="activeCount > 0"
                variant="link"
                size="sm"
                class="h-auto p-0 text-xs"
                @click="clearAllFilters"
              >
                Clear all
              </Button>
            </div>

            <div class="px-4 py-4 space-y-5 max-h-[70vh] overflow-y-auto">

              <!-- Date range -->
              <section>
                <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Date range</p>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs text-muted-foreground mb-1">From</label>
                    <Input
                      v-model="dateFrom"
                      type="date"
                      :max="dateTo || undefined"
                      class="text-xs h-8"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-muted-foreground mb-1">To</label>
                    <Input
                      v-model="dateTo"
                      type="date"
                      :min="dateFrom || undefined"
                      class="text-xs h-8"
                    />
                  </div>
                </div>
                <!-- Quick date presets -->
                <div class="flex gap-1.5 mt-2 flex-wrap">
                  <button
                    v-for="preset in [
                      { label: 'This week', from: format(mon, 'yyyy-MM-dd'), to: format(addDays(mon, 6), 'yyyy-MM-dd') },
                      { label: 'Last week', from: format(prev, 'yyyy-MM-dd'), to: format(addDays(prev, 6), 'yyyy-MM-dd') },
                      { label: 'This month', from: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'), to: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd') },
                    ]"
                    :key="preset.label"
                    class="px-2 py-0.5 text-[11px] font-medium rounded-md border border-border text-foreground bg-card hover:bg-accent transition-colors"
                    @click="dateFrom = preset.from; dateTo = preset.to"
                  >
                    {{ preset.label }}
                  </button>
                </div>
              </section>

              <div class="border-t border-border" />

              <!-- Status -->
              <section>
                <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
                <div class="space-y-2">
                  <label
                    v-for="(meta, key) in statusMeta"
                    :key="key"
                    class="flex items-center gap-2.5 cursor-pointer"
                  >
                    <Checkbox
                      :checked="statusFilter.has(key as SessionStatus)"
                      @update:checked="toggleStatus(key as SessionStatus)"
                    />
                    <Badge variant="outline" :class="['gap-1.5', meta.badge]">
                      <component :is="meta.icon" class="w-3 h-3" />
                      {{ meta.label }}
                    </Badge>
                  </label>
                </div>
              </section>

              <div class="border-t border-border" />

              <!-- Modality -->
              <section>
                <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Modality</p>
                <div class="space-y-2">
                  <label
                    v-for="opt in [
                      { value: 'online' as Modality, label: 'Online', icon: Video, color: 'text-primary' },
                      { value: 'inperson' as Modality, label: 'In-person', icon: MapPin, color: 'text-muted-foreground' },
                    ]"
                    :key="opt.value"
                    class="flex items-center gap-2.5 cursor-pointer"
                  >
                    <Checkbox
                      :checked="modalityFilter.has(opt.value)"
                      @update:checked="toggleModality(opt.value)"
                    />
                    <div class="flex items-center gap-1.5">
                      <component :is="opt.icon" :class="['w-3.5 h-3.5', opt.color]" />
                      <span class="text-sm text-foreground">{{ opt.label }}</span>
                    </div>
                  </label>
                </div>
              </section>

              <div class="border-t border-border" />

              <!-- Fee range -->
              <section>
                <div class="flex items-center justify-between mb-3">
                  <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Fee range</p>
                  <span class="text-xs font-medium text-foreground tabular-nums">
                    €{{ feeRange[0] }} – €{{ feeRange[1] }}
                  </span>
                </div>
                <Slider
                  :model-value="feeRange"
                  :min="FEE_MIN"
                  :max="FEE_MAX"
                  :step="5"
                  class="mb-1"
                  @update:model-value="(v) => feeRange = v as [number, number]"
                />
                <div class="flex justify-between mt-1">
                  <span class="text-[10px] text-muted-foreground">€{{ FEE_MIN }}</span>
                  <span class="text-[10px] text-muted-foreground">€{{ FEE_MAX }}+</span>
                </div>
              </section>

              <div class="border-t border-border" />

              <!-- Content flags -->
              <section>
                <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content</p>
                <div class="space-y-2">
                  <label class="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox :checked="hasWithNotes" @update:checked="(v) => hasWithNotes = !!v" />
                    <div class="flex items-center gap-1.5">
                      <FileText class="w-3.5 h-3.5 text-muted-foreground" />
                      <span class="text-sm text-foreground">Has notes</span>
                    </div>
                  </label>
                  <label class="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox :checked="hasWithUploads" @update:checked="(v) => hasWithUploads = !!v" />
                    <div class="flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span class="text-sm text-foreground">Has uploaded files</span>
                    </div>
                  </label>
                </div>
              </section>

            </div>
          </PopoverContent>
        </Popover>

        <!-- Result count -->
        <p class="text-sm text-muted-foreground ml-auto">
          {{ filtered.length }} session{{ filtered.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- ── Active filter chips ──────────────────────────────────────────── -->
      <div v-if="activeFilters.length > 0" class="flex flex-wrap gap-1.5 -mt-1">
        <span
          v-for="chip in activeFilters"
          :key="chip.id"
          class="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
        >
          {{ chip.label }}
          <button
            class="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
            @click="chip.clear()"
          >
            <X class="w-3 h-3" />
          </button>
        </span>
        <button
          class="text-xs text-muted-foreground hover:text-foreground px-1 transition-colors"
          @click="clearAllFilters"
        >
          Clear all
        </button>
      </div>

      <!-- ── Table ───────────────────────────────────────────────────────── -->
      <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <Table class="min-w-[800px]">
            <TableHeader>
              <TableRow class="bg-muted/50 hover:bg-muted/50">
                <TableHead
                  v-for="col in columns"
                  :key="col.key"
                  :class="[
                    'text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap',
                    col.sortable ? 'cursor-pointer hover:text-foreground transition-colors select-none' : '',
                  ]"
                  @click="col.sortable && toggleSort(col.key)"
                >
                  <div class="flex items-center gap-1">
                    {{ col.label }}
                    <span v-if="col.sortable" class="text-muted-foreground">
                      <ChevronUp    v-if="sortKey === col.key && sortDir === 'asc'"  class="w-3.5 h-3.5 text-primary" />
                      <ChevronDown  v-else-if="sortKey === col.key && sortDir === 'desc'" class="w-3.5 h-3.5 text-primary" />
                      <ChevronsUpDown v-else class="w-3.5 h-3.5" />
                    </span>
                  </div>
                </TableHead>
                <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Notes & Files
                </TableHead>
                <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap w-[140px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <!-- Empty state -->
              <TableRow v-if="filtered.length === 0">
                <TableCell colspan="8" class="px-4 py-16 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Search class="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p class="text-sm font-medium text-foreground">No sessions found</p>
                    <p class="text-xs text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>

              <!-- Rows -->
              <TableRow
                v-for="s in filtered"
                :key="s.id"
                class="hover:bg-accent/50 transition-colors cursor-pointer"
                @click="selectedSession = s"
              >
                <!-- Title -->
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <component
                      :is="s.modality === 'online' ? Video : MapPin"
                      :class="['w-3.5 h-3.5 shrink-0', s.modality === 'online' ? 'text-primary' : 'text-muted-foreground']"
                    />
                    <span class="font-medium text-foreground">{{ s.title }}</span>
                  </div>
                  <p v-if="s.location" class="text-xs text-muted-foreground mt-0.5 ml-5.5">{{ s.location }}</p>
                </TableCell>

                <!-- Patient -->
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <Avatar class="size-7 shrink-0">
                      <AvatarImage :src="avatarUrl(s.patient.name)" :alt="s.patient.name" />
                      <AvatarFallback class="bg-primary/10 text-primary text-[10px] font-bold">{{ s.patient.initials }}</AvatarFallback>
                    </Avatar>
                    <span class="text-foreground font-medium">{{ s.patient.name }}</span>
                  </div>
                </TableCell>

                <!-- Start -->
                <TableCell class="text-foreground whitespace-nowrap tabular-nums">
                  {{ fmtDateTime(s.start) }}
                </TableCell>

                <!-- End -->
                <TableCell class="text-muted-foreground whitespace-nowrap tabular-nums">
                  {{ fmtTime(s.end) }}
                </TableCell>

                <!-- Status -->
                <TableCell class="whitespace-nowrap">
                  <Badge variant="outline" :class="['gap-1.5', statusMeta[s.status].badge]">
                    <component :is="statusMeta[s.status].icon" class="w-3 h-3" />
                    {{ statusMeta[s.status].label }}
                  </Badge>
                </TableCell>

                <!-- Fee -->
                <TableCell class="font-medium text-foreground tabular-nums whitespace-nowrap">
                  <span :class="s.status === 'cancelled' ? 'line-through text-muted-foreground' : ''">
                    €{{ s.fee }}
                  </span>
                </TableCell>

                <!-- Notes & Files -->
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <span v-if="s.notes > 0" class="flex items-center gap-1 text-xs text-muted-foreground" :title="`${s.notes} notes`">
                      <FileText class="w-3.5 h-3.5 text-muted-foreground" />{{ s.notes }}
                    </span>
                    <span v-if="s.uploads > 0" class="flex items-center gap-1 text-xs text-muted-foreground" :title="`${s.uploads} files`">
                      <svg class="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {{ s.uploads }}
                    </span>
                    <span v-if="s.notes === 0 && s.uploads === 0" class="text-xs text-muted-foreground">—</span>
                  </div>
                </TableCell>

                <!-- Actions -->
                <TableCell class="whitespace-nowrap" @click.stop>
                  <div class="flex items-center gap-1">

                    <template v-if="s.status === 'scheduled'">
                      <Button variant="ghost" size="icon-sm" title="Mark as completed" @click="markComplete(s.id)">
                        <CheckCircle2 class="w-4 h-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" title="Mark as no-show" @click="markNoShow(s.id)">
                        <AlertCircle class="w-4 h-4 text-amber-600" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" title="Cancel session" @click="cancelSession(s.id)">
                        <Ban class="w-4 h-4 text-red-500" />
                      </Button>
                    </template>

                    <template v-else-if="s.status === 'cancelled' || s.status === 'no-show'">
                      <Button variant="ghost" size="icon-sm" title="Reschedule" @click="reschedule(s.id)">
                        <CalendarDays class="w-4 h-4 text-primary" />
                      </Button>
                    </template>

                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon-sm">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-44">
                        <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Session actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="gap-2 cursor-pointer"><Eye class="w-3.5 h-3.5 text-muted-foreground" />View notes</DropdownMenuItem>
                        <DropdownMenuItem class="gap-2 cursor-pointer"><Pencil class="w-3.5 h-3.5 text-muted-foreground" />Edit session</DropdownMenuItem>
                        <template v-if="s.status === 'scheduled'">
                          <DropdownMenuSeparator />
                          <DropdownMenuItem class="gap-2 cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50" @click="markComplete(s.id)"><CheckCircle2 class="w-3.5 h-3.5" />Mark complete</DropdownMenuItem>
                          <DropdownMenuItem class="gap-2 cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50" @click="markNoShow(s.id)"><AlertCircle class="w-3.5 h-3.5" />Mark no-show</DropdownMenuItem>
                          <DropdownMenuItem class="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50" @click="cancelSession(s.id)"><Ban class="w-3.5 h-3.5" />Cancel session</DropdownMenuItem>
                        </template>
                        <template v-else-if="s.status === 'cancelled' || s.status === 'no-show'">
                          <DropdownMenuSeparator />
                          <DropdownMenuItem class="gap-2 cursor-pointer text-primary focus:text-primary focus:bg-primary/10" @click="reschedule(s.id)"><CalendarDays class="w-3.5 h-3.5" />Reschedule</DropdownMenuItem>
                        </template>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="gap-2 cursor-pointer" @click="reschedule(s.id)"><RotateCcw class="w-3.5 h-3.5 text-muted-foreground" />Book again</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  </div>

  <!-- Session detail Sheet -->
  <Sheet :open="!!selectedSession" @update:open="(v) => { if (!v) selectedSession = null }">
    <SheetContent side="right" class="w-full sm:max-w-md flex flex-col gap-0 p-0">
      <SheetHeader class="px-6 pt-6 pb-4 border-b border-border">
        <div class="flex items-center gap-2.5 mb-1">
          <component
            :is="selectedSession?.modality === 'online' ? Video : MapPin"
            :class="['w-4 h-4 shrink-0', selectedSession?.modality === 'online' ? 'text-primary' : 'text-muted-foreground']"
          />
          <SheetTitle class="text-base font-semibold text-foreground">
            {{ selectedSession?.title }}
          </SheetTitle>
        </div>
        <SheetDescription class="flex items-center gap-2 text-sm">
          <Badge
            v-if="selectedSession"
            variant="outline"
            :class="['gap-1.5', statusMeta[selectedSession.status].badge]"
          >
            <component :is="statusMeta[selectedSession.status].icon" class="w-3 h-3" />
            {{ statusMeta[selectedSession.status].label }}
          </Badge>
        </SheetDescription>
      </SheetHeader>

      <div v-if="selectedSession" class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        <!-- Patient -->
        <div>
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Patient</p>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span class="text-primary text-xs font-bold">{{ selectedSession.patient.initials }}</span>
            </div>
            <span class="font-medium text-foreground">{{ selectedSession.patient.name }}</span>
          </div>
        </div>

        <!-- Date & time -->
        <div>
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Date & Time</p>
          <div class="flex items-center gap-2 text-sm text-foreground">
            <Clock class="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{{ fmtDateTime(selectedSession.start) }} – {{ fmtTime(selectedSession.end) }}</span>
          </div>
        </div>

        <!-- Modality & location -->
        <div>
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Modality</p>
          <div class="flex items-center gap-2 text-sm text-foreground">
            <component
              :is="selectedSession.modality === 'online' ? Video : MapPin"
              :class="['w-4 h-4 shrink-0', selectedSession.modality === 'online' ? 'text-primary' : 'text-muted-foreground']"
            />
            <span>{{ selectedSession.modality === 'online' ? 'Online' : 'In-person' }}</span>
            <span v-if="selectedSession.location" class="text-muted-foreground">· {{ selectedSession.location }}</span>
          </div>
        </div>

        <!-- Fee -->
        <div>
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fee</p>
          <p :class="['text-lg font-semibold', selectedSession.status === 'cancelled' ? 'line-through text-muted-foreground' : 'text-foreground']">
            €{{ selectedSession.fee }}
          </p>
        </div>

        <!-- Notes & files -->
        <div>
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes & Files</p>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1.5 text-sm text-foreground">
              <FileText class="w-4 h-4 text-muted-foreground" />
              <span>{{ selectedSession.notes }} note{{ selectedSession.notes !== 1 ? 's' : '' }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-sm text-foreground">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span>{{ selectedSession.uploads }} file{{ selectedSession.uploads !== 1 ? 's' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="pt-2 border-t border-border">
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actions</p>
          <div class="flex flex-wrap gap-2">
            <template v-if="selectedSession.status === 'scheduled'">
              <Button size="sm" variant="outline" class="gap-1.5 text-green-600 border-green-200 hover:bg-green-50" @click="markComplete(selectedSession.id)">
                <CheckCircle2 class="w-3.5 h-3.5" /> Mark complete
              </Button>
              <Button size="sm" variant="outline" class="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50" @click="markNoShow(selectedSession.id)">
                <AlertCircle class="w-3.5 h-3.5" /> No-show
              </Button>
              <Button size="sm" variant="outline" class="gap-1.5 text-red-500 border-red-200 hover:bg-red-50" @click="cancelSession(selectedSession.id)">
                <Ban class="w-3.5 h-3.5" /> Cancel
              </Button>
            </template>
            <template v-else-if="selectedSession.status === 'cancelled' || selectedSession.status === 'no-show'">
              <Button size="sm" variant="outline" class="gap-1.5" @click="reschedule(selectedSession.id)">
                <CalendarDays class="w-3.5 h-3.5" /> Reschedule
              </Button>
            </template>
          </div>
        </div>

      </div>
    </SheetContent>
  </Sheet>

  <ScheduleSessionModal
    v-if="scheduleModalOpen"
    @close="scheduleModalOpen = false"
    @save="onSessionSaved"
  />
</template>
