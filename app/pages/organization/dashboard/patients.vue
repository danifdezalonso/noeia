<script setup lang="ts">
import {
  Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown,
  UserRound, Mail, Phone, CalendarDays, Link2,
  Pencil, Trash2, Eye, CalendarPlus, UserX, MoreVertical,
  GripVertical, Check, Menu, ArrowUpRight, Activity,
  ChevronDown as ChevronDownIcon, AlignJustify, Rows3,
} from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { markRaw, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter
} from '~/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuGroup,
} from '~/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationFirst, PaginationItem, PaginationLast,
  PaginationNext, PaginationPrevious,
} from '~/components/ui/pagination'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

definePageMeta({ layout: 'dashboard' })

const { success } = useToast()

// ── Types ───────────────────────────────────────────────────────────────────

type PatientStatus = 'active' | 'inactive' | 'on-hold' | 'discharged'
type SortKey = 'name' | 'email' | 'phone' | 'dob' | 'status'
type ColumnKey = SortKey | 'related'
type SortDir = 'asc' | 'desc'
type ViewType = 'all' | PatientStatus

interface RelatedPatient { id: string; name: string; relationship: string }

interface Patient {
  id: string; name: string; initials: string; email: string; phone: string
  dob: string; status: PatientStatus; related: RelatedPatient[]
  sessionCount: number; lastSession?: string
}

// ── Seed data ────────────────────────────────────────────────────────────────

const patients = ref<Patient[]>([
  { id: 'p1',  name: 'Sofia Martinez',  initials: 'SM', email: 'sofia.martinez@email.com',   phone: '+34 612 345 678',   dob: '1990-03-15', status: 'active',     related: [{ id: 'p4', name: 'Carlos Rivera',    relationship: 'Partner' }], sessionCount: 14, lastSession: '2026-02-17' },
  { id: 'p2',  name: 'James Wilson',    initials: 'JW', email: 'j.wilson@example.com',        phone: '+44 7700 900123',   dob: '1985-07-22', status: 'active',     related: [], sessionCount: 8,  lastSession: '2026-02-17' },
  { id: 'p3',  name: 'Emma Thompson',   initials: 'ET', email: 'emma.thompson@email.com',     phone: '+44 7911 123456',   dob: '1994-11-08', status: 'active',     related: [], sessionCount: 21, lastSession: '2026-02-19' },
  { id: 'p4',  name: 'Carlos Rivera',   initials: 'CR', email: 'c.rivera@correo.es',          phone: '+34 654 987 321',   dob: '1988-05-30', status: 'active',     related: [{ id: 'p1', name: 'Sofia Martinez',   relationship: 'Partner' }], sessionCount: 6,  lastSession: '2026-02-20' },
  { id: 'p5',  name: 'Aisha Patel',     initials: 'AP', email: 'aisha.patel@mail.com',        phone: '+44 7800 555 123',  dob: '1997-01-14', status: 'active',     related: [], sessionCount: 5,  lastSession: '2026-02-20' },
  { id: 'p6',  name: 'Noah Chen',       initials: 'NC', email: 'noah.chen@techco.io',         phone: '+1 415 555 0190',   dob: '1993-09-02', status: 'on-hold',    related: [], sessionCount: 3,  lastSession: '2026-01-10' },
  { id: 'p7',  name: 'Lucia Fernández', initials: 'LF', email: 'lucia.fernandez@gmail.com',   phone: '+34 666 111 222',   dob: '1980-12-25', status: 'active',     related: [{ id: 'p8', name: "Michael O'Brien",  relationship: 'Partner' }], sessionCount: 11, lastSession: '2026-02-21' },
  { id: 'p8',  name: "Michael O'Brien", initials: 'MO', email: 'mob@outlook.com',             phone: '+353 87 123 4567',  dob: '1979-04-18', status: 'inactive',   related: [{ id: 'p7', name: 'Lucia Fernández',  relationship: 'Partner' }], sessionCount: 2,  lastSession: '2026-01-28' },
  { id: 'p9',  name: 'Hannah Kim',      initials: 'HK', email: 'hannah.kim@studio.kr',        phone: '+82 10 1234 5678',  dob: '1996-06-10', status: 'active',     related: [], sessionCount: 9,  lastSession: '2026-02-19' },
  { id: 'p10', name: 'David Okafor',      initials: 'DO', email: 'david.okafor@work.ng',          phone: '+234 801 234 5678', dob: '1982-08-03', status: 'discharged', related: [], sessionCount: 18, lastSession: '2025-11-15' },
  { id: 'p11', name: 'Isabel Gómez',      initials: 'IG', email: 'isabel.gomez@correo.es',         phone: '+34 677 234 890',   dob: '1991-02-28', status: 'active',     related: [{ id: 'p12', name: 'Rafael Gómez',    relationship: 'Sibling' }], sessionCount: 7,  lastSession: '2026-02-18' },
  { id: 'p12', name: 'Rafael Gómez',      initials: 'RG', email: 'rafa.gomez@gmail.com',           phone: '+34 677 234 891',   dob: '1988-09-14', status: 'on-hold',    related: [{ id: 'p11', name: 'Isabel Gómez',    relationship: 'Sibling' }], sessionCount: 4,  lastSession: '2026-01-22' },
  { id: 'p13', name: 'Yuki Tanaka',        initials: 'YT', email: 'yuki.tanaka@mail.jp',            phone: '+81 90 1234 5678',  dob: '1995-07-07', status: 'active',     related: [], sessionCount: 12, lastSession: '2026-02-21' },
  { id: 'p14', name: 'Fatima Al-Rashid',   initials: 'FA', email: 'fatima.alrashid@outlook.com',   phone: '+971 50 123 4567',  dob: '1987-11-19', status: 'active',     related: [], sessionCount: 9,  lastSession: '2026-02-14' },
  { id: 'p15', name: 'Luca Rossi',         initials: 'LR', email: 'luca.rossi@email.it',            phone: '+39 347 123 4567',  dob: '1993-04-05', status: 'inactive',   related: [], sessionCount: 3,  lastSession: '2025-12-10' },
  { id: 'p16', name: 'Valentina Cruz',     initials: 'VC', email: 'valentina.cruz@empresa.mx',      phone: '+52 55 1234 5678',  dob: '1990-08-22', status: 'active',     related: [{ id: 'p17', name: 'Andrés Cruz',     relationship: 'Partner' }], sessionCount: 16, lastSession: '2026-02-20' },
  { id: 'p17', name: 'Andrés Cruz',        initials: 'AC', email: 'andres.cruz@empresa.mx',         phone: '+52 55 1234 5679',  dob: '1989-03-11', status: 'active',     related: [{ id: 'p16', name: 'Valentina Cruz',  relationship: 'Partner' }], sessionCount: 10, lastSession: '2026-02-19' },
  { id: 'p18', name: 'Priya Sharma',       initials: 'PS', email: 'priya.sharma@company.in',        phone: '+91 98765 43210',   dob: '1992-12-03', status: 'active',     related: [], sessionCount: 6,  lastSession: '2026-02-17' },
  { id: 'p19', name: 'Oliver Müller',      initials: 'OM', email: 'oliver.mueller@post.de',         phone: '+49 151 1234 5678', dob: '1984-06-17', status: 'discharged', related: [], sessionCount: 22, lastSession: '2025-10-30' },
  { id: 'p20', name: 'Ana Belén Ruiz',     initials: 'AR', email: 'anabelen.ruiz@correo.es',        phone: '+34 691 456 789',   dob: '1998-01-09', status: 'active',     related: [], sessionCount: 5,  lastSession: '2026-02-21' },
  { id: 'p21', name: 'Tom Nguyen',         initials: 'TN', email: 'tom.nguyen@techstart.vn',        phone: '+84 90 123 4567',   dob: '1994-10-31', status: 'on-hold',    related: [], sessionCount: 2,  lastSession: '2026-01-05' },
  { id: 'p22', name: 'Sara Lindqvist',     initials: 'SL', email: 'sara.lindqvist@post.se',         phone: '+46 70 123 45 67',  dob: '1986-05-26', status: 'active',     related: [], sessionCount: 13, lastSession: '2026-02-18' },
  { id: 'p23', name: 'Mohammed Al-Farsi',  initials: 'MA', email: 'm.alfarsi@work.om',              phone: '+968 9123 4567',    dob: '1981-07-14', status: 'inactive',   related: [], sessionCount: 1,  lastSession: '2025-11-20' },
  { id: 'p24', name: 'Clara Dubois',       initials: 'CD', email: 'clara.dubois@mail.fr',           phone: '+33 6 12 34 56 78', dob: '1996-03-30', status: 'active',     related: [{ id: 'p25', name: 'Paul Dubois',     relationship: 'Sibling' }], sessionCount: 8,  lastSession: '2026-02-16' },
  { id: 'p25', name: 'Paul Dubois',        initials: 'PD', email: 'paul.dubois@mail.fr',            phone: '+33 6 12 34 56 79', dob: '1993-11-11', status: 'active',     related: [{ id: 'p24', name: 'Clara Dubois',    relationship: 'Sibling' }], sessionCount: 5,  lastSession: '2026-02-15' },
  { id: 'p26', name: 'Elena Popescu',      initials: 'EP', email: 'elena.popescu@email.ro',         phone: '+40 721 123 456',   dob: '1989-09-08', status: 'active',     related: [], sessionCount: 11, lastSession: '2026-02-20' },
  { id: 'p27', name: 'José Antonio Vega',  initials: 'JV', email: 'joseantonio.vega@gmail.com',     phone: '+34 605 789 012',   dob: '1977-04-23', status: 'discharged', related: [], sessionCount: 30, lastSession: '2025-09-12' },
  { id: 'p28', name: 'Nadia Kowalski',     initials: 'NK', email: 'nadia.kowalski@poczta.pl',       phone: '+48 501 234 567',   dob: '1997-08-16', status: 'active',     related: [], sessionCount: 4,  lastSession: '2026-02-13' },
  { id: 'p29', name: 'Sebastián Morales',  initials: 'SM', email: 'sebastian.morales@correo.cl',    phone: '+56 9 1234 5678',   dob: '1983-02-07', status: 'on-hold',    related: [], sessionCount: 6,  lastSession: '2026-01-30' },
  { id: 'p30', name: 'Chloe van der Berg', initials: 'CB', email: 'chloe.vanderberg@mail.nl',       phone: '+31 6 12345678',    dob: '1995-05-20', status: 'active',     related: [], sessionCount: 9,  lastSession: '2026-02-22' },
])

// ── Views & Filters ──────────────────────────────────────────────────────────

const currentView = ref<ViewType>('all')
const viewOptions: { value: ViewType; label: string }[] = [
  { value: 'all',        label: 'All Patients' },
  { value: 'active',     label: 'Active' },
  { value: 'on-hold',    label: 'On hold' },
  { value: 'inactive',   label: 'Inactive' },
  { value: 'discharged', label: 'Discharged' },
]

const search  = ref('')
const sortKey = ref<SortKey>('name')
const sortDir = ref<SortDir>('asc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

const filtered = computed(() => {
  let list = [...patients.value]
  if (currentView.value !== 'all') list = list.filter(p => p.status === currentView.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
  }
  list.sort((a, b) => {
    let va = '', vb = ''
    if (sortKey.value === 'name')   { va = a.name;   vb = b.name }
    if (sortKey.value === 'email')  { va = a.email;  vb = b.email }
    if (sortKey.value === 'phone')  { va = a.phone;  vb = b.phone }
    if (sortKey.value === 'dob')    { va = a.dob;    vb = b.dob }
    if (sortKey.value === 'status') { va = a.status; vb = b.status }
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ?  1 : -1
    return 0
  })
  return list
})

// ── Display mode & Pagination ────────────────────────────────────────────────

type DisplayMode = 'scroll' | 'paginate'
const displayMode   = ref<DisplayMode>('scroll')
const pageSize      = ref(10)
const currentPage   = ref(1)
const pageSizeOptions = [10, 15, 20, 25, 50]

watch([filtered, displayMode, pageSize], () => { currentPage.value = 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const displayedRows = computed(() => {
  if (displayMode.value === 'scroll') return filtered.value
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const pageStart = computed(() => Math.min((currentPage.value - 1) * pageSize.value + 1, filtered.value.length))
const pageEnd   = computed(() => Math.min(currentPage.value * pageSize.value, filtered.value.length))

function goToPage(p: number) { currentPage.value = Math.max(1, Math.min(p, totalPages.value)) }

const pageNumbers = computed((): (number | '...')[] => {
  const total = totalPages.value, cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (cur <= 4)        return [1, 2, 3, 4, 5, '...', total]
  if (cur >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', cur - 1, cur, cur + 1, '...', total]
})

// ── Columns & Options ────────────────────────────────────────────────────────

interface ColumnDef {
  key: ColumnKey;
  label: string;
  visible: boolean;
  width: number;
  icon: any;
  sortable: boolean;
}

const columnsState = ref<ColumnDef[]>([
  { key: 'name',    label: 'Name',          visible: true, width: 220, icon: markRaw(UserRound),    sortable: true  },
  { key: 'email',   label: 'Email',         visible: true, width: 200, icon: markRaw(Mail),         sortable: true  },
  { key: 'phone',   label: 'Phone',         visible: true, width: 160, icon: markRaw(Phone),        sortable: true  },
  { key: 'dob',     label: 'Date of birth', visible: true, width: 160, icon: markRaw(CalendarDays), sortable: true  },
  { key: 'status',  label: 'Status',        visible: true, width: 120, icon: markRaw(Activity),     sortable: true  },
  { key: 'related', label: 'Related',       visible: true, width: 180, icon: markRaw(Link2),        sortable: false },
])

const tableWrapperRef = ref<HTMLElement | null>(null)
const containerWidth  = ref(1000)

let ro: ResizeObserver | null = null
onMounted(() => {
  if (tableWrapperRef.value) {
    ro = new ResizeObserver((entries) => {
      if (entries[0]) containerWidth.value = entries[0].contentRect.width
    })
    ro.observe(tableWrapperRef.value)
  }
})
onBeforeUnmount(() => { if (ro) ro.disconnect() })

const visibleColumns = computed(() => {
  const visible = columnsState.value.filter(c => c.visible)
  const baseWidthSum = visible.reduce((sum, col) => sum + col.width, 0)
  const availableSpace = Math.max(0, containerWidth.value - 48 - baseWidthSum)
  const extraPerColumn = visible.length > 0 ? availableSpace / visible.length : 0
  return visible.map(col => ({ ...col, computedWidth: col.width + extraPerColumn }))
})

const gridMinWidth = computed(() => visibleColumns.value.reduce((acc, c) => acc + c.computedWidth, 0) + 48)

// ── Column Drag-to-Reorder ───────────────────────────────────────────────────

const draggingColKey  = ref<ColumnKey | null>(null)
const dragOverColKey  = ref<ColumnKey | null>(null)
const dragOverPosition = ref<'left' | 'right' | null>(null)

function onColumnDragStart(e: DragEvent, col: ColumnDef) {
  draggingColKey.value = col.key
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    const th = (e.currentTarget as HTMLElement).closest('th')
    if (th) e.dataTransfer.setDragImage(th, 15, 15)
  }
}

function onColumnDragOver(e: DragEvent, col: ColumnDef) {
  e.preventDefault()
  if (draggingColKey.value === col.key) return
  dragOverColKey.value = col.key
  const target = e.currentTarget as HTMLElement
  const rect   = target.getBoundingClientRect()
  dragOverPosition.value = e.clientX < rect.left + rect.width / 2 ? 'left' : 'right'
}

function onColumnDragLeave(col: ColumnDef) {
  if (dragOverColKey.value === col.key) {
    dragOverColKey.value  = null
    dragOverPosition.value = null
  }
}

function onColumnDrop(targetCol: ColumnDef) {
  if (!draggingColKey.value || draggingColKey.value === targetCol.key) {
    dragOverColKey.value  = null
    dragOverPosition.value = null
    return
  }
  const cols        = [...columnsState.value]
  const sourceIndex = cols.findIndex(c => c.key === draggingColKey.value)
  let   targetIndex = cols.findIndex(c => c.key === targetCol.key)
  if (sourceIndex > -1 && targetIndex > -1) {
    const [removed] = cols.splice(sourceIndex, 1)
    targetIndex = cols.findIndex(c => c.key === targetCol.key)
    if (dragOverPosition.value === 'right') targetIndex++
    cols.splice(targetIndex, 0, removed)
    columnsState.value = cols
  }
  draggingColKey.value  = null
  dragOverColKey.value  = null
  dragOverPosition.value = null
}

function onColumnDragEnd() {
  draggingColKey.value  = null
  dragOverColKey.value  = null
  dragOverPosition.value = null
}

function resetColumns() {
  columnsState.value = [
    { key: 'name',    label: 'Name',          visible: true, width: 220, icon: markRaw(UserRound),    sortable: true  },
    { key: 'email',   label: 'Email',         visible: true, width: 200, icon: markRaw(Mail),         sortable: true  },
    { key: 'phone',   label: 'Phone',         visible: true, width: 160, icon: markRaw(Phone),        sortable: true  },
    { key: 'dob',     label: 'Date of birth', visible: true, width: 160, icon: markRaw(CalendarDays), sortable: true  },
    { key: 'status',  label: 'Status',        visible: true, width: 120, icon: markRaw(Activity),     sortable: true  },
    { key: 'related', label: 'Related',       visible: true, width: 180, icon: markRaw(Link2),        sortable: false },
  ]
}

// ── Column Resizing ──────────────────────────────────────────────────────────

const resizingColKey = ref<ColumnKey | null>(null)
const startX         = ref(0)
const startWidth     = ref(0)

function onResizeStart(e: PointerEvent, col: ColumnDef) {
  resizingColKey.value = col.key
  startX.value         = e.clientX
  startWidth.value     = col.width
  document.addEventListener('pointermove', onResizeMove)
  document.addEventListener('pointerup', onResizeEnd)
}

function onResizeMove(e: PointerEvent) {
  if (!resizingColKey.value) return
  const col = columnsState.value.find(c => c.key === resizingColKey.value)
  if (!col) return
  col.width = Math.max(60, startWidth.value + (e.clientX - startX.value))
}

function onResizeEnd() {
  resizingColKey.value = null
  document.removeEventListener('pointermove', onResizeMove)
  document.removeEventListener('pointerup', onResizeEnd)
}

// ── Patient actions ──────────────────────────────────────────────────────────

const newPatientModalOpen = ref(false)

function onPatientSaved(data: { name: string; surname: string; initials: string; email: string; phone: string }) {
  const id = `p${Date.now()}`
  patients.value.unshift({
    id,
    name: `${data.name} ${data.surname}`,
    initials: data.initials,
    email: data.email,
    phone: data.phone,
    dob: new Date().toISOString().slice(0, 10),
    status: 'active',
    related: [],
    sessionCount: 0,
  })
  newPatientModalOpen.value = false
  success('Patient added', `${data.name} ${data.surname} has been added successfully.`)
  navigateTo(`/organization/dashboard/patient/${id}`)
}

function discharge(id: string)    { const p = patients.value.find(p => p.id === id); if (p) p.status = 'discharged' }
function setInactive(id: string)  { const p = patients.value.find(p => p.id === id); if (p) p.status = 'inactive'   }
function reactivate(id: string)   { const p = patients.value.find(p => p.id === id); if (p) p.status = 'active'     }
function removePatient(id: string){ patients.value = patients.value.filter(p => p.id !== id) }

function scheduleSession(patient: Patient) {
  const { openCreate } = useCalendar()
  const pad  = (n: number) => String(n).padStart(2, '0')
  const now  = new Date(); now.setMinutes(0, 0, 0)
  if (now.getHours() < 8) now.setHours(9)
  const end  = new Date(now.getTime() + 60 * 60 * 1000)
  const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  openCreate(toIso(now), toIso(end))
  navigateTo('/organization/dashboard/calendar')
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDob(dob: string) { return format(parseISO(dob), 'MMM d, yyyy') }
function calcAge(dob: string) {
  const birth = parseISO(dob); const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const statusMeta: Record<PatientStatus, { label: string; dot: string; badge: string }> = {
  active:     { label: 'Active',     dot: 'bg-emerald-500 dark:bg-emerald-400',     badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400' },
  inactive:   { label: 'Inactive',   dot: 'bg-muted-foreground/40',                 badge: 'border-border bg-muted/50 text-muted-foreground' },
  'on-hold':  { label: 'On hold',    dot: 'bg-amber-400 dark:bg-amber-300',         badge: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400' },
  discharged: { label: 'Discharged', dot: 'bg-rose-400 dark:bg-rose-300',           badge: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400' },
}
</script>

<template>
  <div class="flex-1 min-h-0 flex flex-col p-4 sm:p-6 bg-muted/10">
    <div class="mx-auto max-w-[1440px] w-full flex flex-col flex-1 min-h-0 gap-5">

      <!-- Page header -->
      <div class="flex flex-wrap items-start justify-between gap-3 shrink-0">
        <div>
          <h1 class="text-2xl font-bold text-foreground tracking-tight" style="font-family: 'Roboto Slab', serif;">Patients</h1>
          <p class="text-sm text-muted-foreground mt-0.5">All patients across your clinic.</p>
        </div>
      </div>

      <!-- Data Grid Card -->
      <div class="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden flex-1 min-h-0">

        <!-- Toolbar -->
        <div class="border-b border-border px-4 py-2.5 shrink-0 bg-card">
          <!-- Row 1: View dropdown + right controls -->
          <div class="flex items-center justify-between gap-2">
            <!-- Left: View Dropdown -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm" class="text-muted-foreground text-sm font-medium h-8 px-2.5 hover:bg-muted">
                  <Menu class="w-4 h-4 mr-2" />
                  {{ viewOptions.find(o => o.value === currentView)?.label }}
                  <span class="ml-1.5 opacity-70">&middot; {{ filtered.length }}</span>
                  <ChevronDownIcon class="w-3.5 h-3.5 ml-1.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" class="w-48">
                <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Views</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-for="v in viewOptions" :key="v.value"
                  @click="currentView = v.value"
                  class="cursor-pointer text-sm"
                  :class="currentView === v.value ? 'font-medium text-foreground bg-muted/50' : 'text-muted-foreground'"
                >
                  {{ v.label }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <!-- Right controls -->
            <div class="flex items-center gap-1.5">
              <!-- Search: hidden on mobile (shown in row 2) -->
              <div class="relative mr-2 hidden sm:block">
                <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  v-model="search"
                  placeholder="Search..."
                  class="h-8 w-56 pl-8 text-sm border-transparent bg-muted/50 hover:bg-muted focus-visible:bg-background focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary shadow-none rounded-md transition-all"
                />
              </div>

              <!-- Sort Dropdown: desktop only -->
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm" class="text-muted-foreground h-8 text-sm px-3 font-medium hover:bg-muted hidden sm:flex">
                    Sort: {{ columnsState.find(c => c.key === sortKey)?.label }}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-44">
                  <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Sort by Column</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    v-for="col in columnsState.filter(c => c.sortable)" :key="col.key"
                    @click="toggleSort(col.key as SortKey)"
                    class="text-sm cursor-pointer"
                  >
                    {{ col.label }}
                    <ChevronUp   v-if="sortKey === col.key && sortDir === 'asc'"  class="w-4 h-4 ml-auto text-muted-foreground" />
                    <ChevronDown v-if="sortKey === col.key && sortDir === 'desc'" class="w-4 h-4 ml-auto text-muted-foreground" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <!-- Options Dropdown: desktop only -->
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm" class="text-muted-foreground h-8 text-sm px-3 font-medium hover:bg-muted hidden sm:flex">
                    Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem @click="resetColumns" class="text-sm cursor-pointer text-muted-foreground">
                      Reset columns
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Columns</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      v-for="col in columnsState" :key="col.key"
                      @select.prevent="col.visible = !col.visible"
                      draggable="true"
                      @dragstart="onColumnDragStart($event, col)"
                      @dragover.prevent="onColumnDragOver($event, col)"
                      @dragleave="onColumnDragLeave(col)"
                      @drop="onColumnDrop(col)"
                      @dragend="onColumnDragEnd"
                      class="cursor-grab active:cursor-grabbing text-sm flex items-center justify-between px-2 py-1.5 group/col relative"
                    >
                      <div class="flex items-center gap-2 overflow-hidden pointer-events-none">
                        <GripVertical class="w-3.5 h-3.5 text-muted-foreground/40 group-hover/col:text-muted-foreground shrink-0" />
                        <component :is="col.icon" class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span class="truncate">{{ col.label }}</span>
                      </div>
                      <Check v-if="col.visible" class="w-4 h-4 text-primary shrink-0 ml-3 pointer-events-none" />
                      <div v-if="dragOverColKey === col.key && dragOverPosition === 'left'"  class="absolute top-0 left-0 w-full h-0.5 bg-primary z-30 pointer-events-none" />
                      <div v-if="dragOverColKey === col.key && dragOverPosition === 'right'" class="absolute bottom-0 left-0 w-full h-0.5 bg-primary z-30 pointer-events-none" />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <!-- Scroll / Pages toggle (icon only) -->
              <div class="hidden sm:flex items-center gap-0.5 bg-muted/50 border border-border rounded-md p-0.5">
                <button
                  class="flex items-center justify-center w-7 h-6 rounded transition-all"
                  :class="displayMode === 'scroll' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
                  title="Scroll mode"
                  @click="displayMode = 'scroll'"
                >
                  <AlignJustify class="w-3.5 h-3.5" />
                </button>
                <button
                  class="flex items-center justify-center w-7 h-6 rounded transition-all"
                  :class="displayMode === 'paginate' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'"
                  title="Pages mode"
                  @click="displayMode = 'paginate'"
                >
                  <Rows3 class="w-3.5 h-3.5" />
                </button>
              </div>

              <div class="w-[1px] h-5 bg-border mx-1.5 hidden sm:block" />

              <Button size="sm" class="h-8 text-sm px-3.5 shadow-sm rounded-md" @click="newPatientModalOpen = true">
                <Plus class="w-4 h-4 mr-1.5" /> New Patient
              </Button>
            </div>
          </div>

          <!-- Row 2: full-width search on mobile only -->
          <div class="mt-2 sm:hidden">
            <div class="relative">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                v-model="search"
                placeholder="Search..."
                class="h-8 w-full pl-8 text-sm border-transparent bg-muted/50 hover:bg-muted focus-visible:bg-background focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary shadow-none rounded-md transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Data Grid Table -->
        <div ref="tableWrapperRef" class="overflow-x-auto bg-card flex-1 min-h-0" :class="displayMode === 'scroll' ? 'overflow-y-auto' : 'overflow-y-visible'">
          <Table aria-label="Patients Directory" class="table-fixed border-collapse" :style="{ width: `max(100%, ${gridMinWidth}px)` }">
            <colgroup>
              <col v-for="col in visibleColumns" :key="col.key" :style="{ width: col.computedWidth + 'px' }" />
              <col style="width: 48px" />
            </colgroup>

            <TableHeader class="sticky top-0 bg-card/95 backdrop-blur z-10 shadow-sm border-b border-border">
              <TableRow class="hover:bg-transparent border-0">
                <TableHead
                  v-for="col in visibleColumns" :key="col.key"
                  class="h-10 border-r px-0 text-xs font-semibold text-muted-foreground align-middle transition-colors select-none group/th relative bg-card"
                  :class="draggingColKey === col.key ? 'opacity-30' : ''"
                  @dragover.prevent="onColumnDragOver($event, col)"
                  @dragleave="onColumnDragLeave(col)"
                  @drop="onColumnDrop(col)"
                  @dragend="onColumnDragEnd"
                >
                  <div
                    draggable="true"
                    @dragstart="onColumnDragStart($event, col)"
                    @dragend="onColumnDragEnd"
                    class="flex items-center w-full h-full px-4 cursor-grab active:cursor-grabbing transition-colors"
                    :class="resizingColKey === col.key ? 'bg-muted/30' : 'hover:bg-muted/30'"
                    title="Drag to reorder"
                  >
                    <!-- Sortable column header -->
                    <button
                      v-if="col.sortable"
                      type="button"
                      @click="toggleSort(col.key as SortKey)"
                      class="appearance-none bg-transparent border-none text-left flex items-center justify-between flex-1 cursor-pointer min-w-0 h-full group/sort focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
                      :aria-label="`Sort by ${col.label}`"
                    >
                      <div class="flex items-center gap-2 min-w-0 text-foreground transition-colors">
                        <component :is="col.icon" class="w-3.5 h-3.5 shrink-0" />
                        <span class="truncate">{{ col.label }}</span>
                      </div>
                      <div class="shrink-0 ml-1 flex items-center">
                        <ChevronUp    v-if="sortKey === col.key && sortDir === 'asc'"  class="w-3.5 h-3.5 text-primary" />
                        <ChevronDown  v-else-if="sortKey === col.key && sortDir === 'desc'" class="w-3.5 h-3.5 text-primary" />
                        <ChevronsUpDown v-else class="w-3.5 h-3.5 text-foreground/0 group-hover/th:text-foreground/50 group-hover/sort:!text-foreground transition-colors" />
                      </div>
                    </button>

                    <!-- Non-sortable column header -->
                    <div v-else class="flex items-center gap-2 min-w-0 text-foreground flex-1">
                      <component :is="col.icon" class="w-3.5 h-3.5 shrink-0" />
                      <span class="truncate">{{ col.label }}</span>
                    </div>
                  </div>

                  <!-- Drop indicators -->
                  <div v-if="dragOverColKey === col.key && dragOverPosition === 'left'"  class="absolute top-0 left-0 w-0.5 h-full bg-primary z-30 pointer-events-none" />
                  <div v-if="dragOverColKey === col.key && dragOverPosition === 'right'" class="absolute top-0 right-[-1px] w-0.5 h-full bg-primary z-30 pointer-events-none" />

                  <!-- Resizer handle -->
                  <div
                    class="absolute top-0 right-0 w-1.5 h-full cursor-col-resize transition-colors z-20"
                    :class="resizingColKey === col.key ? 'bg-primary opacity-100' : 'opacity-0 group-hover/th:opacity-100 group-hover/th:bg-primary/20 hover:!bg-primary'"
                    @pointerdown.stop.prevent="onResizeStart($event, col)"
                    @mousedown.stop.prevent
                  />
                </TableHead>

                <TableHead class="h-10 px-3 text-xs font-semibold text-muted-foreground text-center align-middle p-0 border-l-0">
                  <span class="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow v-if="filtered.length === 0">
                <TableCell :colspan="visibleColumns.length + 1" class="h-32 text-center">
                  <p class="text-sm text-muted-foreground">No patients found for this view.</p>
                </TableCell>
              </TableRow>

              <TableRow
                v-for="p in displayedRows" :key="p.id"
                class="group border-b border-border hover:bg-foreground/[0.04] even:bg-foreground/[0.02] transition-colors"
              >
                <TableCell
                  v-for="col in visibleColumns" :key="col.key"
                  class="p-0 border-r overflow-hidden relative"
                >
                  <!-- Name -->
                  <template v-if="col.key === 'name'">
                    <div
                      class="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-muted/50 h-full group/name"
                      @click="navigateTo(`/organization/dashboard/patient/${p.id}`)"
                    >
                      <div class="relative shrink-0">
                        <Avatar class="size-8 rounded-md shadow-sm border border-border/50">
                          <AvatarImage :src="avatarUrl(p.name)" :alt="p.name" />
                          <AvatarFallback class="bg-primary/5 text-primary text-[11px] font-bold rounded-md">{{ p.initials }}</AvatarFallback>
                        </Avatar>
                        <span :class="['absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background', statusMeta[p.status].dot]" />
                      </div>
                      <div class="flex flex-col min-w-0 justify-center flex-1">
                        <span class="text-sm font-medium truncate text-foreground leading-tight">{{ p.name }}</span>
                        <span class="text-xs text-foreground/80 truncate leading-tight mt-0.5">{{ p.sessionCount }} session{{ p.sessionCount !== 1 ? 's' : '' }}</span>
                      </div>
                      <div class="w-6 h-6 rounded-md bg-muted/0 border border-transparent flex items-center justify-center opacity-0 group-hover/name:opacity-100 group-hover/name:bg-muted/50 group-hover/name:border-border/50 transition-all shrink-0">
                        <ArrowUpRight class="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </template>

                  <!-- Email -->
                  <template v-else-if="col.key === 'email'">
                    <div class="px-4 py-2 h-full flex items-center">
                      <a :href="`mailto:${p.email}`" class="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group/link" @click.stop>
                        <Mail class="w-3.5 h-3.5 text-muted-foreground/70 group-hover/link:text-primary/60 shrink-0" />
                        <span class="text-sm truncate">{{ p.email }}</span>
                      </a>
                    </div>
                  </template>

                  <!-- Phone -->
                  <template v-else-if="col.key === 'phone'">
                    <div class="px-4 py-2 h-full flex items-center">
                      <a :href="`tel:${p.phone}`" class="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group/link" @click.stop>
                        <Phone class="w-3.5 h-3.5 text-muted-foreground/70 group-hover/link:text-primary/60 shrink-0" />
                        <span class="text-sm tabular-nums">{{ p.phone }}</span>
                      </a>
                    </div>
                  </template>

                  <!-- Date of birth -->
                  <template v-else-if="col.key === 'dob'">
                    <div class="px-4 py-2 h-full flex items-center gap-1.5">
                      <CalendarDays class="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                      <span class="text-sm text-muted-foreground">{{ fmtDob(p.dob) }}</span>
                      <span class="text-xs text-muted-foreground ml-1">· {{ calcAge(p.dob) }} y</span>
                    </div>
                  </template>

                  <!-- Status -->
                  <template v-else-if="col.key === 'status'">
                    <div class="px-4 py-2 h-full flex items-center">
                      <Badge variant="outline" :class="['rounded-full gap-1.5 text-xs font-medium h-6 px-2 shadow-none', statusMeta[p.status].badge]">
                        <span :class="['w-1.5 h-1.5 rounded-full', statusMeta[p.status].dot]" />
                        {{ statusMeta[p.status].label }}
                      </Badge>
                    </div>
                  </template>

                  <!-- Related -->
                  <template v-else-if="col.key === 'related'">
                    <div class="px-4 py-2 h-full flex flex-col justify-center gap-1">
                      <div v-if="p.related.length > 0" class="flex flex-col gap-1">
                        <div v-for="rel in p.related" :key="rel.id" class="flex items-center gap-1.5">
                          <Link2 class="w-3 h-3 text-muted-foreground/70 shrink-0" />
                          <span class="text-xs text-muted-foreground font-medium truncate">{{ rel.name }}</span>
                          <span class="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">{{ rel.relationship }}</span>
                        </div>
                      </div>
                      <span v-else class="text-xs text-muted-foreground/70">—</span>
                    </div>
                  </template>
                </TableCell>

                <!-- Actions -->
                <TableCell class="p-0">
                  <div class="px-2 py-1.5 h-full flex items-center justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="w-7 h-7 rounded-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
                          <MoreVertical class="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-44">
                        <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Patient actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="gap-2 cursor-pointer text-sm" @click="navigateTo(`/organization/dashboard/patient/${p.id}`)">
                          <Eye class="w-4 h-4 text-muted-foreground" /> View profile
                        </DropdownMenuItem>
                        <DropdownMenuItem class="gap-2 cursor-pointer text-sm">
                          <Pencil class="w-4 h-4 text-muted-foreground" /> Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem class="gap-2 cursor-pointer text-sm" @click="scheduleSession(p)">
                          <CalendarPlus class="w-4 h-4 text-muted-foreground" /> Schedule session
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <template v-if="p.status === 'active'">
                          <DropdownMenuItem class="gap-2 cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50 text-sm" @click="setInactive(p.id)">
                            <UserX class="w-4 h-4" /> Set inactive
                          </DropdownMenuItem>
                          <DropdownMenuItem class="gap-2 cursor-pointer text-rose-500 focus:text-rose-500 focus:bg-rose-50 text-sm" @click="discharge(p.id)">
                            <UserX class="w-4 h-4" /> Discharge
                          </DropdownMenuItem>
                        </template>
                        <template v-else>
                          <DropdownMenuItem class="gap-2 cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50 text-sm" @click="reactivate(p.id)">
                            <UserRound class="w-4 h-4" /> Reactivate
                          </DropdownMenuItem>
                        </template>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 text-sm" @click="removePatient(p.id)">
                          <Trash2 class="w-4 h-4" /> Delete record
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>

            <!-- Summary Footer (scroll mode only) -->
            <TableFooter v-if="displayMode === 'scroll'" class="bg-card z-10 sticky bottom-0">
              <TableRow class="hover:bg-transparent border-t border-border">
                <TableCell
                  v-for="col in visibleColumns" :key="col.key"
                  class="px-4 border-r py-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                >
                  <template v-if="col.key === 'name'">
                    {{ filtered.length }} PATIENT{{ filtered.length !== 1 ? 'S' : '' }}
                  </template>
                  <template v-else-if="col.key === 'status'">
                    {{ filtered.filter(p => p.status === 'active').length }} ACTIVE
                  </template>
                  <template v-else-if="col.key === 'related'">
                    {{ filtered.reduce((acc, p) => acc + p.related.length, 0) }} LINKED
                  </template>
                </TableCell>
                <TableCell class="p-0" />
              </TableRow>
            </TableFooter>
          </Table>
        </div>

      </div>

      <!-- ── Pagination bar (Pages mode only) ── -->
      <div v-if="displayMode === 'paginate'" class="shrink-0 flex items-center gap-4">

        <!-- Per page (left) -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground whitespace-nowrap">Per page</span>
          <Select :model-value="String(pageSize)" @update:model-value="(v) => { pageSize = Number(v); currentPage = 1 }">
            <SelectTrigger class="h-8 text-xs w-16 px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="s in pageSizeOptions" :key="s" :value="String(s)" class="text-xs">{{ s }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Pagination (center, takes remaining space) -->
        <div class="flex-1 flex justify-center">
          <Pagination
            :total="filtered.length"
            :items-per-page="pageSize"
            :page="currentPage"
            :sibling-count="1"
            show-edges
            @update:page="goToPage"
          >
            <PaginationContent v-slot="{ items }">
              <PaginationFirst />
              <PaginationPrevious />
              <template v-for="(item, idx) in items" :key="idx">
                <PaginationItem
                  v-if="item.type === 'page'"
                  :value="item.value"
                  :is-active="item.value === currentPage"
                >
                  {{ item.value }}
                </PaginationItem>
                <PaginationEllipsis v-else :index="idx" />
              </template>
              <PaginationNext />
              <PaginationLast />
            </PaginationContent>
          </Pagination>
        </div>

        <!-- Showing X–Y of Z (right, mirrors left width) -->
        <p class="text-xs text-muted-foreground tabular-nums whitespace-nowrap hidden md:block" style="min-width: 6rem; text-align: right;">
          {{ pageStart }}–{{ pageEnd }} of {{ filtered.length }}
        </p>

      </div>

    </div>
  </div>

  <AddPatientModal
    v-if="newPatientModalOpen"
    :existing-patients="patients.map(p => ({ id: p.id, name: p.name }))"
    @close="newPatientModalOpen = false"
    @save="onPatientSaved"
  />
</template>
