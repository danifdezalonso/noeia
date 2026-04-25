<script setup lang="ts">
import {
  Download, Plus, Search, ChevronDown, Eye, EyeOff,
  Info, FileText, X, Check, Send, AlertCircle,
  ChevronsUpDown, ChevronUp, SlidersHorizontal,
  Video, MapPin, CreditCard, ChevronRight, ChevronLeft, CalendarDays, GripVertical, BarChart2,
} from 'lucide-vue-next'
import { format, parseISO, startOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns'
import { parseDate } from '@internationalized/date'
import type { DateValue, DateRange } from 'reka-ui'
import { RangeCalendar } from '~/components/ui/calendar'
import { ChartBar, ChartDonut, ChartAreaInteractive } from '~/components/ui/chart'
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '~/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '~/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '~/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import { Card, CardContent } from '~/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import { Calendar } from '~/components/ui/calendar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'


definePageMeta({ layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────────────────────

type SessionStatus = 'completed' | 'scheduled' | 'cancelled' | 'no-show'
type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'waived'
type BillStatus    = 'draft' | 'sent' | 'paid' | 'overdue'
type Modality      = 'online' | 'inperson'

interface BillingRow {
  id: string
  date: string
  sessionStart: string   // ISO datetime
  sessionEnd: string     // ISO datetime
  patient: string
  patientInitials: string
  professional: string
  type: string
  modality: Modality
  sessionStatus: SessionStatus
  paymentStatus: PaymentStatus
  amount: number
  clinicPct: number      // kept for computation, 40 = 40%
  billStatus: BillStatus
  notes: string
  duration: number
  paymentMethod?: 'card' | 'cash' | 'transfer' | 'insurance'
  paymentDate?: string   // yyyy-MM-dd
}

// ── Seed data ──────────────────────────────────────────────────────────────

const rows = ref<BillingRow[]>([
  { id: 'B001', date: '2026-02-03', sessionStart: '2026-02-03T10:00:00', sessionEnd: '2026-02-03T10:50:00', patient: 'Sofia Martinez',  patientInitials: 'SM', professional: 'Dr. Torres', type: 'Individual', modality: 'online',   sessionStatus: 'completed', paymentStatus: 'paid',    amount: 85,  clinicPct: 40, billStatus: 'paid',    notes: 'Anxiety follow-up',         duration: 50, paymentMethod: 'card',     paymentDate: '2026-02-03' },
  { id: 'B002', date: '2026-02-05', sessionStart: '2026-02-05T14:00:00', sessionEnd: '2026-02-05T15:00:00', patient: 'James Wilson',    patientInitials: 'JW', professional: 'Dr. Torres', type: 'Individual', modality: 'inperson', sessionStatus: 'completed', paymentStatus: 'paid',    amount: 120, clinicPct: 40, billStatus: 'paid',    notes: 'Initial assessment',        duration: 60, paymentMethod: 'transfer', paymentDate: '2026-02-05' },
  { id: 'B003', date: '2026-02-07', sessionStart: '2026-02-07T11:00:00', sessionEnd: '2026-02-07T11:50:00', patient: 'Emma Thompson',   patientInitials: 'ET', professional: 'Dr. Torres', type: 'Individual', modality: 'online',   sessionStatus: 'completed', paymentStatus: 'paid',    amount: 85,  clinicPct: 40, billStatus: 'paid',    notes: 'CBT session',               duration: 50, paymentMethod: 'card',     paymentDate: '2026-02-07' },
  { id: 'B004', date: '2026-02-10', sessionStart: '2026-02-10T09:00:00', sessionEnd: '2026-02-10T09:50:00', patient: 'Carlos Rivera',   patientInitials: 'CR', professional: 'Dr. Torres', type: 'Individual', modality: 'online',   sessionStatus: 'completed', paymentStatus: 'pending', amount: 85,  clinicPct: 40, billStatus: 'sent',    notes: 'Anxiety follow-up',         duration: 50, paymentMethod: undefined,  paymentDate: undefined },
  { id: 'B005', date: '2026-02-12', sessionStart: '2026-02-12T15:00:00', sessionEnd: '2026-02-12T15:50:00', patient: 'Aisha Patel',     patientInitials: 'AP', professional: 'Dr. Torres', type: 'Individual', modality: 'inperson', sessionStatus: 'completed', paymentStatus: 'paid',    amount: 95,  clinicPct: 40, billStatus: 'paid',    notes: 'Trauma processing',         duration: 50, paymentMethod: 'cash',     paymentDate: '2026-02-12' },
  { id: 'B006', date: '2026-02-12', sessionStart: '2026-02-12T09:00:00', sessionEnd: '2026-02-12T10:00:00', patient: 'Hannah Kim',      patientInitials: 'HK', professional: 'Dr. Torres', type: 'Individual', modality: 'inperson', sessionStatus: 'completed', paymentStatus: 'paid',    amount: 95,  clinicPct: 40, billStatus: 'paid',    notes: 'Sleep disorder consult',    duration: 60, paymentMethod: 'insurance',paymentDate: '2026-02-12' },
  { id: 'B007', date: '2026-02-14', sessionStart: '2026-02-14T11:00:00', sessionEnd: '2026-02-14T11:50:00', patient: 'Noah Chen',       patientInitials: 'NC', professional: 'Dr. Torres', type: 'Individual', modality: 'online',   sessionStatus: 'no-show',   paymentStatus: 'pending', amount: 85,  clinicPct: 40, billStatus: 'draft',   notes: 'Mindfulness — no-show',     duration: 50, paymentMethod: undefined,  paymentDate: undefined },
  { id: 'B008', date: '2026-02-17', sessionStart: '2026-02-17T10:00:00', sessionEnd: '2026-02-17T10:50:00', patient: 'Sofia Martinez',  patientInitials: 'SM', professional: 'Dr. Torres', type: 'Individual', modality: 'online',   sessionStatus: 'completed', paymentStatus: 'paid',    amount: 85,  clinicPct: 40, billStatus: 'paid',    notes: 'Weekly check-in',           duration: 50, paymentMethod: 'card',     paymentDate: '2026-02-17' },
  { id: 'B009', date: '2026-02-17', sessionStart: '2026-02-17T14:00:00', sessionEnd: '2026-02-17T15:00:00', patient: 'James Wilson',    patientInitials: 'JW', professional: 'Dr. Torres', type: 'Individual', modality: 'inperson', sessionStatus: 'completed', paymentStatus: 'pending', amount: 120, clinicPct: 40, billStatus: 'sent',    notes: 'Initial assessment #2',     duration: 60, paymentMethod: undefined,  paymentDate: undefined },
  { id: 'B010', date: '2026-02-19', sessionStart: '2026-02-19T11:00:00', sessionEnd: '2026-02-19T11:50:00', patient: 'Emma Thompson',   patientInitials: 'ET', professional: 'Dr. Torres', type: 'Individual', modality: 'online',   sessionStatus: 'completed', paymentStatus: 'paid',    amount: 85,  clinicPct: 40, billStatus: 'paid',    notes: 'CBT session',               duration: 50, paymentMethod: 'transfer', paymentDate: '2026-02-19' },
  { id: 'B011', date: '2026-02-19', sessionStart: '2026-02-19T09:00:00', sessionEnd: '2026-02-19T09:50:00', patient: 'Hannah Kim',      patientInitials: 'HK', professional: 'Dr. Torres', type: 'Individual', modality: 'inperson', sessionStatus: 'completed', paymentStatus: 'overdue', amount: 95,  clinicPct: 40, billStatus: 'overdue', notes: 'Sleep follow-up',           duration: 50, paymentMethod: undefined,  paymentDate: undefined },
  { id: 'B012', date: '2026-02-20', sessionStart: '2026-02-20T20:00:00', sessionEnd: '2026-02-20T20:50:00', patient: 'David Okafor',    patientInitials: 'DO', professional: 'Dr. Torres', type: 'Individual', modality: 'online',   sessionStatus: 'no-show',   paymentStatus: 'waived',  amount: 85,  clinicPct: 40, billStatus: 'draft',   notes: 'Grief counseling — missed', duration: 50, paymentMethod: undefined,  paymentDate: undefined },
  { id: 'B013', date: '2026-02-21', sessionStart: '2026-02-21T09:00:00', sessionEnd: '2026-02-21T09:50:00', patient: 'Carlos Rivera',   patientInitials: 'CR', professional: 'Dr. Torres', type: 'Individual', modality: 'online',   sessionStatus: 'scheduled', paymentStatus: 'pending', amount: 85,  clinicPct: 40, billStatus: 'draft',   notes: 'Anxiety follow-up',         duration: 50, paymentMethod: undefined,  paymentDate: undefined },
  { id: 'B014', date: '2026-02-21', sessionStart: '2026-02-21T14:00:00', sessionEnd: '2026-02-21T15:30:00', patient: 'Lucia Fernández', patientInitials: 'LF', professional: 'Dr. Torres', type: 'Couples',    modality: 'inperson', sessionStatus: 'scheduled', paymentStatus: 'pending', amount: 150, clinicPct: 40, billStatus: 'draft',   notes: 'Couples therapy',           duration: 90, paymentMethod: undefined,  paymentDate: undefined },
])

// ── Stats ──────────────────────────────────────────────────────────────────

const totalBilled  = computed(() => rows.value.reduce((s, r) => s + r.amount, 0))
const totalPaid    = computed(() => rows.value.filter(r => r.paymentStatus === 'paid').reduce((s, r) => s + r.amount, 0))
const totalPending = computed(() => rows.value.filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'overdue').reduce((s, r) => s + r.amount, 0))

const showValues = ref(true)

const sparkBilledData  = [170,120,85,85,95,85,85,180,85,235].map(v => ({ v }))
const sparkPaidData    = [170,120,85,0,95,0,85,85,0,0].map(v => ({ v }))
const sparkPendingData = [0,0,0,85,0,85,0,95,85,235].map(v => ({ v }))

// ── Area chart data (90-day daily billed vs paid) ──────────────────────────
const billingAreaData = (() => {
  function mkRng(seed: number) {
    let s = seed >>> 0
    return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000 }
  }
  const rng = mkRng(42)
  const amts = [85, 85, 95, 95, 120, 150]
  const actual: Record<string, { billed: number; paid: number }> = {
    '2026-02-03': { billed: 85,  paid: 85  },
    '2026-02-05': { billed: 120, paid: 120 },
    '2026-02-07': { billed: 85,  paid: 85  },
    '2026-02-10': { billed: 85,  paid: 0   },
    '2026-02-12': { billed: 190, paid: 190 },
    '2026-02-14': { billed: 85,  paid: 0   },
    '2026-02-17': { billed: 205, paid: 85  },
    '2026-02-19': { billed: 180, paid: 85  },
    '2026-02-20': { billed: 85,  paid: 0   },
    '2026-02-21': { billed: 235, paid: 0   },
  }
  const result: { date: string; billed: number; paid: number }[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date('2026-03-01')
    d.setDate(d.getDate() - i)
    const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    if (actual[ymd]) {
      result.push({ date: ymd, ...actual[ymd] })
    } else {
      const dow = d.getDay()
      if (dow >= 1 && dow <= 5 && rng() < 0.55) {
        const amt = amts[Math.floor(rng() * amts.length)]
        result.push({ date: ymd, billed: amt, paid: rng() > 0.25 ? amt : 0 })
      } else {
        result.push({ date: ymd, billed: 0, paid: 0 })
      }
    }
  }
  return result
})()
const billedSeries = [
  { key: 'billed', label: 'Billed', color: '#6366f1' },
  { key: 'paid',   label: 'Paid',   color: '#22c55e' },
]

// ── Sparkline helpers ──────────────────────────────────────────────────────
function toSparkPath(data: {v: number}[], w = 96, h = 48) {
  const vals = data.map(d => d.v)
  const max = Math.max(...vals, 1)
  return 'M' + vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w
    const y = h - (v / max) * h * 0.85 + 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join('L')
}
function toAreaPath(data: {v: number}[], w = 96, h = 48) {
  const vals = data.map(d => d.v)
  const max = Math.max(...vals, 1)
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w
    const y = h - (v / max) * h * 0.85 + 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M0,${h} L${pts.join(' L')} L${w},${h} Z`
}

// ── Overview charts dialog state ───────────────────────────────────────────
const chartsDialogOpen = ref(false)
const chartsActiveTab  = ref<'overview' | 'billed' | 'paid' | 'pending'>('overview')

const weeklyBilledData = computed(() => {
  const w = [{ billed: 0 }, { billed: 0 }, { billed: 0 }]
  for (const r of rows.value) {
    const day = parseInt(r.date.split('-')[2])
    const i = day <= 7 ? 0 : day <= 14 ? 1 : 2
    w[i].billed += r.amount
  }
  return w
})
const weeklyLabels = ['Feb 1–7', 'Feb 8–14', 'Feb 15–21']

const totalOverdue = computed(() => rows.value.filter(r => r.paymentStatus === 'overdue').reduce((s, r) => s + r.amount, 0))

const paymentDonutData = computed(() => [
  { label: 'Paid',    value: totalPaid.value,    color: '#22c55e' },
  { label: 'Pending', value: rows.value.filter(r => r.paymentStatus === 'pending').reduce((s, r) => s + r.amount, 0), color: '#f97316' },
  { label: 'Overdue', value: totalOverdue.value, color: '#ef4444' },
].filter(d => d.value > 0))

const pendingRows = computed(() => rows.value.filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'overdue'))

const pendingByPatient = computed(() => {
  const map = new Map<string, number>()
  for (const r of pendingRows.value) map.set(r.patient, (map.get(r.patient) ?? 0) + r.amount)
  return [...map.entries()].map(([name, amount]) => ({ name, amount }))
})

// ── Filters ────────────────────────────────────────────────────────────────

const _now  = new Date()
const dateFrom = ref(format(startOfMonth(subMonths(_now, 2)), 'yyyy-MM-dd'))
const dateTo   = ref(format(_now,                             'yyyy-MM-dd'))
const search       = ref('')
const patientFilter  = ref('all')
const typeFilter     = ref('all')
const statusFilter   = ref('all')

const uniquePatients = computed(() => [...new Set(rows.value.map(r => r.patient))].sort())
const uniqueTypes    = computed(() => [...new Set(rows.value.map(r => r.type))].sort())

// ── Column definitions (order + visibility) ────────────────────────────────

interface ColDef { key: string; label: string; visible: boolean }

const colDefs = ref<ColDef[]>([
  { key: 'id',                 label: 'ID',           visible: true  },
  { key: 'date',               label: 'Date & Time',  visible: true  },
  { key: 'patient',            label: 'Patient',      visible: true  },
  { key: 'professional',       label: 'Professional', visible: false },
  { key: 'type',               label: 'Type',         visible: true  },
  { key: 'modality',           label: 'Modality',     visible: true  },
  { key: 'sessionStatus',      label: 'Session',      visible: true  },
  { key: 'payment',            label: 'Payment',      visible: true  },
  { key: 'amount',             label: 'Price',        visible: true  },
  { key: 'centerAmount',       label: 'Center 40%',   visible: true  },
  { key: 'professionalAmount', label: 'Prof. 60%',    visible: true  },
  { key: 'paymentMethod',      label: 'Method',       visible: true  },
  { key: 'billStatus',         label: 'Billing',      visible: true  },
])

const visibleColDefs = computed(() => colDefs.value.filter(c => c.visible))

const SORTABLE_KEYS = new Set(['id', 'date', 'patient', 'type', 'sessionStatus', 'paymentStatus', 'amount', 'billStatus'])

// Drag-to-reorder
const dragKey = ref<string | null>(null)
function onColDragStart(key: string) { dragKey.value = key }
function onColDrop(targetKey: string) {
  if (!dragKey.value || dragKey.value === targetKey) return
  const arr = [...colDefs.value]
  const fromIdx = arr.findIndex(c => c.key === dragKey.value)
  const toIdx   = arr.findIndex(c => c.key === targetKey)
  arr.splice(toIdx, 0, arr.splice(fromIdx, 1)[0])
  colDefs.value = arr
  dragKey.value = null
}

// ── Date-picker state ──────────────────────────────────────────────────────

const datePickerOpen = ref(false)

const dateRangeValue = computed<DateRange | undefined>(() => {
  try {
    const start = dateFrom.value ? parseDate(dateFrom.value) : undefined
    // Only pass end if it's a different date — keeps reka-ui in "selecting" mode after first click
    const end   = dateTo.value && dateTo.value !== dateFrom.value ? parseDate(dateTo.value) : undefined
    if (!start) return undefined
    return { start, end }
  } catch { return undefined }
})

function onRangeSelect(range: DateRange | undefined) {
  if (!range?.start) { dateFrom.value = ''; dateTo.value = ''; return }
  dateFrom.value = range.start.toString()
  dateTo.value   = range.end?.toString() ?? ''
  activePreset.value = null
  // Auto-close only when a complete range with distinct start and end is picked
  if (range.end && range.start.toString() !== range.end.toString()) {
    datePickerOpen.value = false
  }
}

// ── Date presets ───────────────────────────────────────────────────────────

const DATE_PRESETS = [
  { id: 'this-month',        label: 'This month'   },
  { id: 'past-month',        label: 'Past month'   },
  { id: 'past-three-months', label: 'Past 3 months'},
  { id: 'full-year',         label: 'Full year'    },
] as const

type PresetId = typeof DATE_PRESETS[number]['id']

const activePreset = ref<PresetId | null>('past-three-months')

function applyPreset(id: PresetId) {
  activePreset.value = id
  const now = new Date()
  if (id === 'this-month') {
    dateFrom.value = format(startOfMonth(now), 'yyyy-MM-dd')
    dateTo.value   = format(now,               'yyyy-MM-dd')
  } else if (id === 'past-month') {
    const pm = subMonths(now, 1)
    dateFrom.value = format(startOfMonth(pm), 'yyyy-MM-dd')
    dateTo.value   = format(new Date(pm.getFullYear(), pm.getMonth() + 1, 0), 'yyyy-MM-dd')
  } else if (id === 'past-three-months') {
    dateFrom.value = format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd')
    dateTo.value   = format(now, 'yyyy-MM-dd')
  } else if (id === 'full-year') {
    dateFrom.value = format(startOfYear(now), 'yyyy-MM-dd')
    dateTo.value   = format(endOfYear(now),   'yyyy-MM-dd')
  }
  datePickerOpen.value = false
}

// ── Sorting ────────────────────────────────────────────────────────────────

type SortKey = 'id' | 'date' | 'patient' | 'type' | 'sessionStatus' | 'paymentStatus' | 'amount' | 'billStatus'
const sortKey = ref<SortKey>('date')
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

// ── Selection ──────────────────────────────────────────────────────────────

const selected = ref<Set<string>>(new Set())

const allSelected = computed(() =>
  filtered.value.length > 0 && filtered.value.every(r => selected.value.has(r.id)),
)

function toggleAll() {
  if (allSelected.value) {
    for (const r of filtered.value) selected.value.delete(r.id)
    selected.value = new Set(selected.value)
  } else {
    for (const r of filtered.value) selected.value.add(r.id)
    selected.value = new Set(selected.value)
  }
}

function toggleRow(id: string) {
  const next = new Set(selected.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selected.value = next
}

// ── Filtered + sorted list ─────────────────────────────────────────────────

const filtered = computed(() => {
  let list = [...rows.value]

  if (dateFrom.value)        list = list.filter(r => r.date >= dateFrom.value)
  if (dateTo.value)          list = list.filter(r => r.date <= dateTo.value)
  if (search.value.trim())   list = list.filter(r => r.patient.toLowerCase().includes(search.value.toLowerCase()))
  if (patientFilter.value !== 'all') list = list.filter(r => r.patient === patientFilter.value)
  if (typeFilter.value !== 'all')    list = list.filter(r => r.type === typeFilter.value)
  if (statusFilter.value !== 'all') {
    list = list.filter(r => r.paymentStatus === statusFilter.value || r.billStatus === statusFilter.value || r.sessionStatus === statusFilter.value)
  }

  list.sort((a, b) => {
    const va = a[sortKey.value as keyof BillingRow] ?? ''
    const vb = b[sortKey.value as keyof BillingRow] ?? ''
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ?  1 : -1
    return 0
  })

  return list
})

// ── Bill editor modal ──────────────────────────────────────────────────────

const editorOpen    = ref(false)
const editorRow     = ref<BillingRow | null>(null)
const editorIsPaid  = ref(false)

function openEditor(row: BillingRow) {
  editorRow.value   = { ...row }
  editorIsPaid.value = row.paymentStatus === 'paid'
  editorOpen.value  = true
}

function openConsolidated() {
  if (selected.value.size === 0) return
  const first = rows.value.find(r => selected.value.has(r.id))
  if (first) openEditor({ ...first, id: 'CONSOLIDATED', notes: 'Consolidated bill' })
}

function markPaid() {
  if (!editorRow.value) return
  const row = rows.value.find(r => r.id === editorRow.value!.id)
  if (row) { row.paymentStatus = 'paid'; row.billStatus = 'paid' }
  editorIsPaid.value = true
}

// ── Meta helpers ───────────────────────────────────────────────────────────

const sessionStatusMeta: Record<SessionStatus, { label: string; badge: string }> = {
  completed: { label: 'Completed', badge: 'bg-green-50 text-green-700 border-green-200' },
  scheduled: { label: 'Scheduled', badge: 'bg-blue-50 text-blue-700 border-blue-200'   },
  cancelled: { label: 'Cancelled', badge: 'bg-red-50 text-red-600 border-red-200'      },
  'no-show': { label: 'No-show',   badge: 'bg-amber-50 text-amber-700 border-amber-200'},
}

const paymentStatusMeta: Record<PaymentStatus, { label: string; badge: string }> = {
  paid:    { label: 'Paid',    badge: 'bg-green-50 text-green-700 border-green-200'  },
  pending: { label: 'Pending', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  overdue: { label: 'Overdue', badge: 'bg-red-50 text-red-600 border-red-200'        },
  waived:  { label: 'Waived',  badge: 'bg-muted text-muted-foreground border-border' },
}

const billStatusMeta: Record<BillStatus, { label: string; badge: string }> = {
  draft:   { label: 'Draft',   badge: 'bg-muted text-muted-foreground border-border'  },
  sent:    { label: 'Sent',    badge: 'bg-blue-50 text-blue-600 border-blue-200'      },
  paid:    { label: 'Paid',    badge: 'bg-green-50 text-green-700 border-green-200'   },
  overdue: { label: 'Overdue', badge: 'bg-red-50 text-red-600 border-red-200'         },
}

function fmtCurrency(n: number) { return `€${n.toFixed(2)}` }
function fmtDate(d: string) { return format(parseISO(d), 'MMM d, yyyy') }
function fmtTime(iso: string) { return format(parseISO(iso), 'HH:mm') }

const paymentMethodLabel: Record<string, string> = {
  card: 'Card', cash: 'Cash', transfer: 'Transfer', insurance: 'Insurance',
}

// ── Filtered-range summary ─────────────────────────────────────────────────

const filteredTotal        = computed(() => filtered.value.reduce((s, r) => s + r.amount, 0))
const filteredCenter       = computed(() => filtered.value.reduce((s, r) => s + Math.round(r.amount * r.clinicPct / 100), 0))
const filteredProfessional = computed(() => filteredTotal.value - filteredCenter.value)
const filteredToInvoice    = computed(() => filtered.value.filter(r => r.billStatus === 'draft').reduce((s, r) => s + r.amount, 0))
const filteredToInvoiceCount = computed(() => filtered.value.filter(r => r.billStatus === 'draft').length)

function createInvoiceForFiltered() {
  const ids = filtered.value.filter(r => r.billStatus === 'draft').map(r => r.id)
  if (!ids.length) return
  selected.value = new Set(ids)
  openConsolidated()
}


const clinicShare = computed(() => editorRow.value ? Math.round(editorRow.value.amount * editorRow.value.clinicPct / 100) : 0)
const therapistShare = computed(() => editorRow.value ? editorRow.value.amount - clinicShare.value : 0)

// ── Patient profile sheet ──────────────────────────────────────────────────

const patientSheetOpen = ref(false)
const sheetPatient = ref<BillingRow | null>(null)

function openPatientSheet(row: BillingRow) {
  sheetPatient.value = row
  patientSheetOpen.value = true
}

const sheetPatientSessions = computed(() =>
  sheetPatient.value
    ? rows.value.filter(r => r.patient === sheetPatient.value!.patient)
    : [],
)

const sheetPatientTotal = computed(() =>
  sheetPatientSessions.value.reduce((s, r) => s + r.amount, 0),
)

// ── Payment method setter ──────────────────────────────────────────────────

function setPaymentMethod(rowId: string, method: BillingRow['paymentMethod']) {
  const row = rows.value.find(r => r.id === rowId)
  if (row) row.paymentMethod = method
}

// ── JS-based sticky thead/tfoot (allows table-only horizontal scroll) ───────

const pageRef     = ref<HTMLElement | null>(null)
const tableCardRef = ref<HTMLElement | null>(null)
const theadEl     = ref<HTMLElement | null>(null)
const tfootEl     = ref<HTMLElement | null>(null)

function updateStickyHeaders() {
  const page  = pageRef.value
  const card  = tableCardRef.value
  const thead = theadEl.value
  const tfoot = tfootEl.value
  if (!page || !card || !thead || !tfoot) return

  const pageRect = page.getBoundingClientRect()
  const cardRect = card.getBoundingClientRect()

  // thead: translate down when card top scrolls above page top
  const aboveTop = pageRect.top - cardRect.top
  thead.style.transform = aboveTop > 0 ? `translateY(${aboveTop}px)` : ''

  // tfoot: translate up when card bottom scrolls below page bottom
  const belowBottom = cardRect.bottom - pageRect.bottom
  tfoot.style.transform = belowBottom > 0 ? `translateY(${-belowBottom}px)` : ''
}
</script>

<template>
  <div ref="pageRef" class="flex-1 overflow-y-auto min-h-0" @scroll="updateStickyHeaders">
    <div class="p-4 sm:p-6 pb-0 space-y-4 max-w-[1300px]">

      <!-- ── Page header ─────────────────────────────────────────────────── -->
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-foreground tracking-tight">Billing & Sessions</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Manage your sessions and billing for this month.</p>
        </div>
        <div class="flex items-center gap-2">
          <Button @click="openConsolidated">
            <Plus class="w-4 h-4" />
            Create Consolidated Bill
          </Button>
        </div>
      </div>

      <!-- ── Filters ─────────────────────────────────────────────────────── -->
      <div class="flex items-center gap-4 flex-wrap">
        <!-- Search -->
        <div class="relative flex-1 min-w-[180px] max-w-xs">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input v-model="search" type="text" placeholder="Search patient..." class="pl-9" />
        </div>

        <!-- Date range picker -->
        <Popover v-model:open="datePickerOpen">
          <PopoverTrigger as-child>
            <Button variant="outline" class="gap-1.5 h-9 text-sm font-normal pr-2">
              <CalendarDays class="w-4 h-4 text-muted-foreground shrink-0" />
              <span class="text-foreground">Date</span>
              <span
                v-if="dateFrom || dateTo"
                class="ml-0.5 px-2.5 py-0.5 rounded-full bg-muted text-foreground text-xs font-medium leading-none"
              >
                {{ dateFrom ? format(parseISO(dateFrom), 'MMM d') : '…' }} - {{ dateTo ? format(parseISO(dateTo), 'MMM d') : '…' }}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start" :side-offset="6">
            <!-- Range calendar -->
            <RangeCalendar
              :model-value="dateRangeValue"
              :number-of-months="2"
              @update:model-value="onRangeSelect"
            />
            <!-- Footer: presets + reset -->
            <div class="border-t border-border px-4 py-3 flex items-center justify-between gap-3">
              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  v-for="p in DATE_PRESETS"
                  :key="p.id"
                  :class="[
                    'text-xs px-2.5 py-1 rounded-full border transition-colors',
                    activePreset === p.id
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 bg-transparent',
                  ]"
                  @click="applyPreset(p.id)"
                >{{ p.label }}</button>
              </div>
              <button
                class="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
                @click="dateFrom = ''; dateTo = ''; activePreset = null; datePickerOpen = false"
              >Reset</button>
            </div>
          </PopoverContent>
        </Popover>


        <!-- Type filter -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" :class="typeFilter !== 'all' ? 'bg-primary/10 text-primary border-primary/30' : ''">
              {{ typeFilter === 'all' ? 'All Types' : typeFilter }}
              <ChevronDown class="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-40">
            <DropdownMenuItem :class="typeFilter === 'all' ? 'text-primary font-medium' : ''" @click="typeFilter = 'all'">All Types</DropdownMenuItem>
            <DropdownMenuItem v-for="t in uniqueTypes" :key="t" :class="typeFilter === t ? 'text-primary font-medium' : ''" @click="typeFilter = t">{{ t }}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Status filter -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" :class="statusFilter !== 'all' ? 'bg-primary/10 text-primary border-primary/30' : ''">
              {{ statusFilter === 'all' ? 'All Statuses' : statusFilter }}
              <ChevronDown class="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-40">
            <DropdownMenuItem
              v-for="s in ['all','paid','pending','overdue','completed','scheduled','no-show']"
              :key="s"
              class="capitalize"
              :class="statusFilter === s ? 'text-primary font-medium' : ''"
              @click="statusFilter = s"
            >
              {{ s === 'all' ? 'All Statuses' : s }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Columns toggle -->
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="ml-auto">
              <SlidersHorizontal class="w-3.5 h-3.5" />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" class="w-52 p-2" :side-offset="6">
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Drag to reorder</p>
            <div
              v-for="col in colDefs"
              :key="col.key"
              draggable="true"
              :class="[
                'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors select-none',
                dragKey === col.key ? 'opacity-40 bg-accent' : 'hover:bg-accent',
              ]"
              @dragstart="onColDragStart(col.key)"
              @dragover.prevent
              @drop.prevent="onColDrop(col.key)"
              @dragend="dragKey = null"
            >
              <GripVertical class="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 cursor-grab" />
              <Checkbox :checked="col.visible" @update:checked="col.visible = !!$event" />
              <span class="text-sm text-foreground flex-1 truncate">{{ col.label }}</span>
            </div>
          </PopoverContent>
        </Popover>

        <!-- Bulk actions -->
        <template v-if="selected.size > 0">
          <span class="text-xs text-muted-foreground">{{ selected.size }} selected</span>
          <Button size="sm" @click="openConsolidated">
            <FileText class="w-3.5 h-3.5" />
            Create Consolidated Bill
          </Button>
          <Button variant="outline" size="sm">
            <Download class="w-3.5 h-3.5" />
            Download Selected
          </Button>
        </template>
      </div>

      <!-- ── Filtered summary ───────────────────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">

        <!-- Sessions count -->
        <div class="sm:col-span-1 bg-card rounded-xl border border-border p-4 flex flex-col gap-1">
          <p class="text-xs text-muted-foreground font-medium">Sessions in range</p>
          <p class="text-2xl font-bold tabular-nums text-foreground">{{ filtered.length }}</p>
          <p class="text-xs text-muted-foreground">{{ filteredToInvoiceCount }} draft · {{ filtered.length - filteredToInvoiceCount }} billed</p>
        </div>

        <!-- Combined billing card -->
        <div class="sm:col-span-3 bg-card rounded-xl border border-border p-4 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <p class="text-xs text-muted-foreground font-medium">Billing summary</p>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" title="Overview charts" @click="chartsDialogOpen = true">
                <BarChart2 class="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon-sm" @click="showValues = !showValues">
                <component :is="showValues ? Eye : EyeOff" class="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="flex flex-col gap-0.5">
              <p class="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total invoiced</p>
              <p class="text-lg font-bold tabular-nums text-foreground">{{ showValues ? fmtCurrency(filteredTotal) : '€ ···' }}</p>
            </div>
            <div class="flex flex-col gap-0.5">
              <p class="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Center (40%)</p>
              <p class="text-lg font-bold tabular-nums text-foreground">{{ showValues ? fmtCurrency(filteredCenter) : '€ ···' }}</p>
              <p class="text-[10px] text-green-600 font-medium">Net {{ showValues ? fmtCurrency(filteredProfessional) : '···' }}</p>
            </div>
            <div class="flex flex-col gap-0.5">
              <p class="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">To invoice</p>
              <p class="text-lg font-bold tabular-nums text-foreground">{{ showValues ? fmtCurrency(filteredToInvoice) : '€ ···' }}</p>
              <Button
                v-if="filteredToInvoiceCount > 0"
                size="sm"
                class="h-6 text-[10px] gap-1 mt-0.5 px-2"
                @click="createInvoiceForFiltered"
              >
                <FileText class="w-3 h-3" />
                Create bill
              </Button>
            </div>
          </div>
        </div>

      </div>

    </div><!-- /max-w constrained -->

    <!-- Table — card scrolls horizontally, page div scrolls vertically -->
    <div class="px-4 sm:px-6 pb-4 sm:pb-6 pt-5">
      <div ref="tableCardRef" class="bg-card rounded-xl border border-border shadow-sm overflow-x-auto">
        <table class="min-w-[1400px] w-full caption-bottom text-sm">
            <thead ref="theadEl" class="relative z-10 bg-card">
              <TableRow class="bg-muted/50 hover:bg-muted/50">
                <TableHead class="w-10">
                  <Checkbox :checked="allSelected" class="mx-auto" @update:checked="toggleAll" />
                </TableHead>
                <template v-for="col in visibleColDefs" :key="col.key">
                  <TableHead
                    :class="['text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap transition-colors select-none', SORTABLE_KEYS.has(col.key) ? 'cursor-pointer hover:text-foreground' : '']"
                    @click="SORTABLE_KEYS.has(col.key) && toggleSort(col.key as SortKey)"
                  >
                    <div class="flex items-center gap-1">
                      {{ col.label }}
                      <template v-if="SORTABLE_KEYS.has(col.key)">
                        <ChevronUp v-if="sortKey === col.key && sortDir === 'asc'" class="w-3.5 h-3.5 text-primary" />
                        <ChevronDown v-else-if="sortKey === col.key && sortDir === 'desc'" class="w-3.5 h-3.5 text-primary" />
                        <ChevronsUpDown v-else class="w-3.5 h-3.5 text-muted-foreground/70" />
                      </template>
                      <Info v-if="col.key === 'centerAmount'" class="w-3 h-3 text-muted-foreground ml-0.5" />
                    </div>
                  </TableHead>
                </template>
                <TableHead class="w-12" />
              </TableRow>
            </thead>

            <TableBody>
              <!-- Empty state -->
              <TableRow v-if="filtered.length === 0">
                <TableCell colspan="17" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <AlertCircle class="w-8 h-8 text-muted-foreground/50" />
                    <p class="text-sm text-muted-foreground">No sessions found matching your filters.</p>
                  </div>
                </TableCell>
              </TableRow>

              <!-- Data rows -->
              <TableRow
                v-for="row in filtered"
                :key="row.id"
                :class="['hover:bg-accent/50 transition-colors cursor-pointer', selected.has(row.id) ? 'bg-primary/5' : '']"
                @click="openEditor(row)"
              >
                <TableCell @click.stop>
                  <Checkbox :checked="selected.has(row.id)" class="mx-auto" @update:checked="toggleRow(row.id)" />
                </TableCell>
                <template v-for="col in visibleColDefs" :key="col.key">
                  <!-- ID -->
                  <TableCell v-if="col.key === 'id'" class="font-mono text-xs text-muted-foreground whitespace-nowrap">{{ row.id }}</TableCell>

                  <!-- Date & Time (merged) -->
                  <TableCell v-else-if="col.key === 'date'" class="whitespace-nowrap">
                    <p class="text-sm text-foreground">{{ fmtDate(row.date) }}</p>
                    <p class="text-xs text-muted-foreground tabular-nums mt-0.5">
                      {{ fmtTime(row.sessionStart) }}&thinsp;–&thinsp;{{ fmtTime(row.sessionEnd) }}
                      <span class="ml-1 text-muted-foreground/60">({{ row.duration }}m)</span>
                    </p>
                  </TableCell>

                  <!-- Patient — hover underline + opens sheet -->
                  <TableCell v-else-if="col.key === 'patient'" class="whitespace-nowrap" @click.stop>
                    <div
                      class="flex items-center gap-2 cursor-pointer group"
                      @click.stop="openPatientSheet(row)"
                    >
                      <Avatar class="size-6 shrink-0">
                        <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ row.patientInitials }}</AvatarFallback>
                      </Avatar>
                      <span class="text-sm font-medium text-foreground group-hover:underline">{{ row.patient }}</span>
                    </div>
                  </TableCell>

                  <!-- Professional -->
                  <TableCell v-else-if="col.key === 'professional'" class="whitespace-nowrap text-sm text-muted-foreground">{{ row.professional }}</TableCell>

                  <!-- Type -->
                  <TableCell v-else-if="col.key === 'type'" class="whitespace-nowrap text-sm text-muted-foreground">{{ row.type }}</TableCell>

                  <!-- Modality — consistent grey -->
                  <TableCell v-else-if="col.key === 'modality'" class="whitespace-nowrap">
                    <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Video v-if="row.modality === 'online'" class="w-3.5 h-3.5 shrink-0" />
                      <MapPin v-else class="w-3.5 h-3.5 shrink-0" />
                      <span>{{ row.modality === 'online' ? 'Online' : 'In-person' }}</span>
                    </div>
                  </TableCell>

                  <!-- Session status -->
                  <TableCell v-else-if="col.key === 'sessionStatus'" class="whitespace-nowrap">
                    <Badge variant="outline" :class="sessionStatusMeta[row.sessionStatus].badge">
                      {{ sessionStatusMeta[row.sessionStatus].label }}
                    </Badge>
                  </TableCell>

                  <!-- Payment status + date -->
                  <TableCell v-else-if="col.key === 'payment'" class="whitespace-nowrap">
                    <Badge variant="outline" :class="paymentStatusMeta[row.paymentStatus].badge">
                      {{ paymentStatusMeta[row.paymentStatus].label }}
                    </Badge>
                    <p v-if="row.paymentDate" class="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                      {{ fmtDate(row.paymentDate) }}
                    </p>
                  </TableCell>

                  <!-- Amount -->
                  <TableCell v-else-if="col.key === 'amount'" class="whitespace-nowrap font-semibold text-foreground tabular-nums">
                    {{ fmtCurrency(row.amount) }}
                  </TableCell>

                  <!-- Center 40% -->
                  <TableCell v-else-if="col.key === 'centerAmount'" class="whitespace-nowrap text-sm text-muted-foreground tabular-nums">
                    {{ fmtCurrency(Math.round(row.amount * row.clinicPct / 100)) }}
                  </TableCell>

                  <!-- Prof 60% -->
                  <TableCell v-else-if="col.key === 'professionalAmount'" class="whitespace-nowrap text-sm font-medium text-green-600 tabular-nums">
                    {{ fmtCurrency(row.amount - Math.round(row.amount * row.clinicPct / 100)) }}
                  </TableCell>

                  <!-- Payment method — dropdown -->
                  <TableCell v-else-if="col.key === 'paymentMethod'" class="whitespace-nowrap" @click.stop>
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <button class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                          <CreditCard class="w-3 h-3 shrink-0" />
                          {{ row.paymentMethod ? paymentMethodLabel[row.paymentMethod] : 'Set method' }}
                          <ChevronDown class="w-3 h-3 shrink-0 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" class="w-36">
                        <DropdownMenuLabel class="text-xs">Payment method</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          v-for="m in (['card', 'cash', 'transfer', 'insurance'] as const)"
                          :key="m"
                          :class="row.paymentMethod === m ? 'text-primary font-medium' : ''"
                          @click="setPaymentMethod(row.id, m)"
                        >
                          <Check v-if="row.paymentMethod === m" class="w-3.5 h-3.5 mr-1.5" />
                          <span v-else class="w-3.5 mr-1.5 inline-block" />
                          {{ paymentMethodLabel[m] }}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator v-if="row.paymentMethod" />
                        <DropdownMenuItem v-if="row.paymentMethod" class="text-muted-foreground" @click="setPaymentMethod(row.id, undefined)">
                          Clear
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                  <!-- Bill status -->
                  <TableCell v-else-if="col.key === 'billStatus'" class="whitespace-nowrap">
                    <Badge variant="outline" :class="billStatusMeta[row.billStatus].badge">
                      {{ billStatusMeta[row.billStatus].label }}
                    </Badge>
                  </TableCell>
                </template>
                <TableCell class="whitespace-nowrap" @click.stop>
                  <Button variant="ghost" size="icon-sm" @click.stop="openEditor(row)">
                    <FileText class="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>

            <!-- ── Table footer (totals) ─────────────────────────────────── -->
            <tfoot ref="tfootEl" class="relative z-10 bg-card">
              <TableRow class="bg-muted/40 hover:bg-muted/40 border-t-2 border-border font-medium">
                <TableCell class="text-xs font-semibold text-muted-foreground py-3">
                  {{ filtered.length }}
                </TableCell>
                <template v-for="(col, idx) in visibleColDefs" :key="col.key">
                  <TableCell v-if="col.key === 'amount'" class="font-bold text-foreground tabular-nums">
                    {{ fmtCurrency(filteredTotal) }}
                  </TableCell>
                  <TableCell v-else-if="col.key === 'centerAmount'" class="text-muted-foreground tabular-nums">
                    {{ fmtCurrency(filteredCenter) }}
                  </TableCell>
                  <TableCell v-else-if="col.key === 'professionalAmount'" class="text-green-600 font-semibold tabular-nums">
                    {{ fmtCurrency(filteredProfessional) }}
                  </TableCell>
                  <TableCell v-else-if="idx === 0" class="text-xs font-semibold text-muted-foreground">Totals</TableCell>
                  <TableCell v-else />
                </template>
                <TableCell />
              </TableRow>
            </tfoot>

        </table>
      </div>
    </div>
  </div>

  <!-- ══ Patient Profile Sheet ═════════════════════════════════════════════ -->
  <Sheet v-model:open="patientSheetOpen">
    <SheetContent side="right" class="w-[400px] sm:w-[440px] overflow-y-auto p-0">
      <SheetHeader class="px-6 py-5 border-b border-border">
        <SheetTitle class="text-base">Patient Profile</SheetTitle>
      </SheetHeader>

      <div v-if="sheetPatient" class="px-6 py-5 space-y-6">

        <!-- Avatar + name -->
        <div class="flex items-center gap-4">
          <Avatar class="size-14">
            <AvatarFallback class="bg-primary/10 text-primary text-lg font-bold">{{ sheetPatient.patientInitials }}</AvatarFallback>
          </Avatar>
          <div>
            <h2 class="text-lg font-semibold text-foreground">{{ sheetPatient.patient }}</h2>
            <p class="text-sm text-muted-foreground mt-0.5">Individual Therapy</p>
            <div class="flex items-center gap-2 mt-1.5">
              <Badge variant="outline" class="text-xs">Active</Badge>
              <Badge variant="outline" class="text-xs">Dr. Torres</Badge>
            </div>
          </div>
        </div>

        <!-- Contact info -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</p>
          <div class="bg-muted/40 rounded-xl p-3 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Email</span>
              <span class="text-foreground font-medium">{{ sheetPatient.patient.split(' ')[0].toLowerCase() }}@email.com</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Phone</span>
              <span class="text-foreground font-medium">+34 600 000 000</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Since</span>
              <span class="text-foreground font-medium">Jan 2025</span>
            </div>
          </div>
        </div>

        <!-- Billing summary -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billing summary</p>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-muted/40 rounded-xl p-3 text-center">
              <p class="text-xs text-muted-foreground">Sessions</p>
              <p class="text-xl font-bold text-foreground mt-0.5">{{ sheetPatientSessions.length }}</p>
            </div>
            <div class="bg-muted/40 rounded-xl p-3 text-center">
              <p class="text-xs text-muted-foreground">Total billed</p>
              <p class="text-xl font-bold text-foreground mt-0.5">{{ fmtCurrency(sheetPatientTotal) }}</p>
            </div>
          </div>
        </div>

        <!-- Session history -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Session history</p>
          <div class="space-y-1.5">
            <div
              v-for="s in sheetPatientSessions"
              :key="s.id"
              class="flex items-center justify-between px-3 py-2.5 bg-muted/40 rounded-lg"
            >
              <div class="flex items-center gap-2.5">
                <div class="flex flex-col">
                  <span class="text-sm text-foreground font-medium">{{ fmtDate(s.date) }}</span>
                  <span class="text-xs text-muted-foreground">{{ fmtTime(s.sessionStart) }} – {{ fmtTime(s.sessionEnd) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Badge variant="outline" :class="paymentStatusMeta[s.paymentStatus].badge" class="text-xs">
                  {{ paymentStatusMeta[s.paymentStatus].label }}
                </Badge>
                <span class="text-sm font-semibold text-foreground tabular-nums">{{ fmtCurrency(s.amount) }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </SheetContent>
  </Sheet>

  <!-- ══ Overview Charts Dialog (tabbed) ══════════════════════════════════════ -->
  <Dialog v-model:open="chartsDialogOpen">
    <DialogContent class="max-w-[90vw] w-full max-h-[85vh] flex flex-col overflow-hidden p-0">
      <DialogHeader class="px-6 pt-6 pb-0 flex-shrink-0">
        <DialogTitle class="text-lg font-bold">Overview Charts</DialogTitle>
      </DialogHeader>

      <Tabs v-model="chartsActiveTab" class="flex flex-col flex-1 min-h-0">
        <!-- Tab bar -->
        <TabsList class="mx-6 mt-4 mb-0 justify-start rounded-none bg-transparent border-b border-border/50 h-auto pb-0 gap-0 flex-shrink-0">
          <TabsTrigger
            v-for="t in [
              { value: 'overview', label: 'Overview' },
              { value: 'billed',   label: 'Billed'   },
              { value: 'paid',     label: 'Paid'      },
              { value: 'pending',  label: 'Pending'   },
            ]"
            :key="t.value"
            :value="t.value"
            class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2 text-sm"
          >
            {{ t.label }}
          </TabsTrigger>
        </TabsList>

        <!-- Scrollable tab content -->
        <div class="flex-1 overflow-y-auto">

          <!-- ── Overview tab ───────────────────────────────────────────── -->
          <TabsContent value="overview" class="px-6 py-5 space-y-5 mt-0">
            <!-- Sparkline cards — click to jump to that tab -->
            <div class="grid grid-cols-3 gap-4">
              <Card
                v-for="card in [
                  { tab: 'billed',  label: 'Total Billed',  value: totalBilled,  sparkData: sparkBilledData,  lineColor: '#6366f1' },
                  { tab: 'paid',    label: 'Paid',          value: totalPaid,    sparkData: sparkPaidData,    lineColor: '#22c55e' },
                  { tab: 'pending', label: 'Pending',       value: totalPending, sparkData: sparkPendingData, lineColor: '#f97316' },
                ]"
                :key="card.tab"
                class="cursor-pointer hover:shadow-md transition-shadow"
                @click="chartsActiveTab = (card.tab as any)"
              >
                <CardContent class="flex gap-4 p-4">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-muted-foreground font-medium mb-1">{{ card.label }}</p>
                    <p class="text-2xl font-bold tabular-nums text-foreground">
                      {{ showValues ? fmtCurrency(card.value) : '€ ···' }}
                    </p>
                  </div>
                  <div class="w-24 h-12 flex-shrink-0">
                    <svg viewBox="0 0 96 48" class="w-full h-full overflow-visible">
                      <path :d="toAreaPath(card.sparkData)" :fill="card.lineColor" fill-opacity="0.12" />
                      <path :d="toSparkPath(card.sparkData)" :stroke="card.lineColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </div>
            <ChartAreaInteractive
              :data="billingAreaData"
              :series="billedSeries"
              title="Billed vs Paid"
              description="Daily billing activity for the last 3 months"
            />
          </TabsContent>

          <!-- ── Billed tab ─────────────────────────────────────────────── -->
          <TabsContent value="billed" class="px-6 py-5 space-y-5 mt-0">
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-muted/30 rounded-lg p-3 text-center">
                <p class="text-xs text-muted-foreground mb-1">Total Billed</p>
                <p class="text-xl font-bold text-foreground tabular-nums">{{ fmtCurrency(totalBilled) }}</p>
              </div>
              <div class="bg-muted/30 rounded-lg p-3 text-center">
                <p class="text-xs text-muted-foreground mb-1">Sessions</p>
                <p class="text-xl font-bold text-foreground tabular-nums">{{ rows.length }}</p>
              </div>
              <div class="bg-muted/30 rounded-lg p-3 text-center">
                <p class="text-xs text-muted-foreground mb-1">Avg / Session</p>
                <p class="text-xl font-bold text-foreground tabular-nums">{{ fmtCurrency(totalBilled / rows.length) }}</p>
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Weekly Breakdown</p>
              <ChartBar
                :data="weeklyBilledData"
                :segments="[{ key: 'billed', color: '#6366f1', label: 'Billed' }]"
                :x-labels="weeklyLabels"
                class="h-40 w-full"
              />
            </div>
            <div>
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">All Sessions ({{ rows.length }})</p>
              <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                <div
                  v-for="r in rows"
                  :key="r.id"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Avatar class="size-6 shrink-0">
                    <AvatarImage :src="avatarUrl(r.patient)" :alt="r.patient" />
                    <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ r.patientInitials }}</AvatarFallback>
                  </Avatar>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-foreground truncate">{{ r.patient }}</p>
                    <p class="text-xs text-muted-foreground">{{ fmtDate(r.date) }} · {{ r.type }}</p>
                  </div>
                  <Badge variant="outline" :class="paymentStatusMeta[r.paymentStatus].badge">{{ paymentStatusMeta[r.paymentStatus].label }}</Badge>
                  <span class="text-sm font-semibold tabular-nums text-foreground">{{ fmtCurrency(r.amount) }}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- ── Paid tab ───────────────────────────────────────────────── -->
          <TabsContent value="paid" class="px-6 py-5 space-y-5 mt-0">
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-muted/30 rounded-lg p-3 text-center">
                <p class="text-xs text-muted-foreground mb-1">Total Paid</p>
                <p class="text-xl font-bold text-green-600 tabular-nums">{{ fmtCurrency(totalPaid) }}</p>
              </div>
              <div class="bg-muted/30 rounded-lg p-3 text-center">
                <p class="text-xs text-muted-foreground mb-1">Payment Rate</p>
                <p class="text-xl font-bold text-foreground tabular-nums">{{ totalBilled > 0 ? Math.round(totalPaid / totalBilled * 100) : 0 }}%</p>
              </div>
              <div class="bg-muted/30 rounded-lg p-3 text-center">
                <p class="text-xs text-muted-foreground mb-1">Sessions Paid</p>
                <p class="text-xl font-bold text-foreground tabular-nums">{{ rows.filter(r => r.paymentStatus === 'paid').length }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-6 items-center">
              <div>
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Payment Breakdown</p>
                <ChartDonut
                  :data="paymentDonutData"
                  :central-label="`${totalBilled > 0 ? Math.round(totalPaid / totalBilled * 100) : 0}%`"
                  central-sub-label="collected"
                  class="max-h-[200px]"
                />
              </div>
              <div class="flex flex-col gap-2">
                <div v-for="d in paymentDonutData" :key="d.label" class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ background: d.color }" />
                  <span class="text-sm text-muted-foreground">{{ d.label }}</span>
                  <span class="text-sm font-semibold text-foreground ml-auto tabular-nums">{{ fmtCurrency(d.value) }}</span>
                </div>
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Paid Sessions</p>
              <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                <div
                  v-for="r in rows.filter(r => r.paymentStatus === 'paid')"
                  :key="r.id"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Avatar class="size-6 shrink-0">
                    <AvatarImage :src="avatarUrl(r.patient)" :alt="r.patient" />
                    <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ r.patientInitials }}</AvatarFallback>
                  </Avatar>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-foreground truncate">{{ r.patient }}</p>
                    <p class="text-xs text-muted-foreground">{{ fmtDate(r.date) }}</p>
                  </div>
                  <span class="text-sm font-semibold tabular-nums text-green-600">{{ fmtCurrency(r.amount) }}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- ── Pending tab ─────────────────────────────────────────────── -->
          <TabsContent value="pending" class="px-6 py-5 space-y-5 mt-0">
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-muted/30 rounded-lg p-3 text-center">
                <p class="text-xs text-muted-foreground mb-1">Pending</p>
                <p class="text-xl font-bold text-amber-600 tabular-nums">{{ fmtCurrency(rows.filter(r => r.paymentStatus === 'pending').reduce((s, r) => s + r.amount, 0)) }}</p>
              </div>
              <div class="bg-muted/30 rounded-lg p-3 text-center">
                <p class="text-xs text-muted-foreground mb-1">Overdue</p>
                <p class="text-xl font-bold text-red-600 tabular-nums">{{ fmtCurrency(totalOverdue) }}</p>
              </div>
              <div class="bg-muted/30 rounded-lg p-3 text-center">
                <p class="text-xs text-muted-foreground mb-1">Unpaid Sessions</p>
                <p class="text-xl font-bold text-foreground tabular-nums">{{ pendingRows.length }}</p>
              </div>
            </div>
            <div v-if="pendingByPatient.length">
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pending by Patient</p>
              <ChartBar
                :data="pendingByPatient.map(p => ({ amount: p.amount }))"
                :segments="[{ key: 'amount', color: '#f97316', label: 'Pending' }]"
                :x-labels="pendingByPatient.map(p => p.name.split(' ').pop() ?? p.name)"
                class="h-36 w-full"
              />
            </div>
            <div>
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Unpaid Sessions ({{ pendingRows.length }})</p>
              <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                <div
                  v-for="r in pendingRows"
                  :key="r.id"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Avatar class="size-6 shrink-0">
                    <AvatarImage :src="avatarUrl(r.patient)" :alt="r.patient" />
                    <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ r.patientInitials }}</AvatarFallback>
                  </Avatar>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-foreground truncate">{{ r.patient }}</p>
                    <p class="text-xs text-muted-foreground">{{ fmtDate(r.date) }} · {{ r.notes }}</p>
                  </div>
                  <Badge variant="outline" :class="paymentStatusMeta[r.paymentStatus].badge">{{ paymentStatusMeta[r.paymentStatus].label }}</Badge>
                  <span class="text-sm font-semibold tabular-nums" :class="r.paymentStatus === 'overdue' ? 'text-red-600' : 'text-amber-600'">{{ fmtCurrency(r.amount) }}</span>
                </div>
              </div>
            </div>
          </TabsContent>

        </div>
      </Tabs>
    </DialogContent>
  </Dialog>

  <!-- ══ Bill Editor Modal ══════════════════════════════════════════════════ -->
  <Dialog v-model:open="editorOpen">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
      <div v-if="editorRow">

        <!-- Modal header -->
        <DialogHeader class="px-6 pt-6 pb-4 border-b border-border/50">
          <div class="flex items-center justify-between">
            <div>
              <DialogTitle class="text-lg font-bold text-foreground">Bill {{ editorRow.id }}</DialogTitle>
              <div class="flex items-center gap-2 mt-1">
                <Badge variant="outline" :class="billStatusMeta[editorRow.billStatus].badge">
                  {{ billStatusMeta[editorRow.billStatus].label }}
                </Badge>
                <Badge v-if="editorRow.id === 'CONSOLIDATED'" variant="outline" class="bg-primary/10 text-primary border-primary/30">
                  Consolidated · {{ selected.size }} sessions
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <!-- Bill preview (styled as a document) -->
        <div class="mx-6 my-5 p-6 bg-muted/30 rounded-xl border border-border">
          <!-- Clinic header -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span class="text-primary-foreground text-sm font-bold">N</span>
                </div>
                <span class="font-bold text-foreground text-lg">Noeia Clinic</span>
              </div>
              <p class="text-xs text-muted-foreground">Dr. Torres · Clinical Psychology</p>
              <p class="text-xs text-muted-foreground">colegiado@noeia.es</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice</p>
              <p class="text-base font-bold text-foreground">{{ editorRow.id }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">Date: {{ fmtDate(editorRow.date) }}</p>
              <p class="text-xs text-muted-foreground">Due: {{ fmtDate(editorRow.date) }}</p>
            </div>
          </div>

          <!-- Patient info -->
          <div class="mb-5 p-3 bg-card rounded-lg border border-border/50">
            <p class="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Bill to</p>
            <Input v-model="editorRow.patient" class="text-sm font-semibold bg-transparent border-0 shadow-none focus-visible:ring-0 px-0 h-auto" />
          </div>

          <!-- Line items -->
          <div class="mb-5">
            <div class="grid grid-cols-[1fr_80px_80px_80px] gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              <span>Description</span><span class="text-right">Duration</span><span class="text-right">Type</span><span class="text-right">Amount</span>
            </div>
            <div class="bg-card rounded-lg border border-border/50 divide-y divide-border/50">
              <div class="grid grid-cols-[1fr_80px_80px_80px] gap-2 px-3 py-2.5 items-center">
                <div>
                  <Input v-model="editorRow.notes" class="text-sm bg-transparent border-0 shadow-none focus-visible:ring-0 px-0 h-auto" />
                  <p class="text-xs text-muted-foreground mt-0.5">{{ fmtDate(editorRow.date) }}</p>
                </div>
                <p class="text-sm text-muted-foreground text-right">{{ editorRow.duration }}min</p>
                <p class="text-sm text-muted-foreground text-right">{{ editorRow.type }}</p>
                <p class="text-sm font-semibold text-foreground text-right">{{ fmtCurrency(editorRow.amount) }}</p>
              </div>
            </div>
          </div>

          <!-- Revenue split + total -->
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span class="tabular-nums font-medium">{{ fmtCurrency(editorRow.amount) }}</span>
            </div>
            <div class="flex justify-between text-muted-foreground text-xs">
              <span class="flex items-center gap-1">
                Clinic share ({{ editorRow.clinicPct }}%)
                <Info class="w-3 h-3 text-muted-foreground" />
              </span>
              <span class="tabular-nums">−{{ fmtCurrency(clinicShare) }}</span>
            </div>
            <div class="flex justify-between text-muted-foreground text-xs">
              <span>Your net revenue</span>
              <span class="tabular-nums text-green-600 dark:text-green-400 font-medium">{{ fmtCurrency(therapistShare) }}</span>
            </div>
            <div class="border-t border-border pt-2 flex justify-between font-bold text-foreground">
              <span>Total</span>
              <span class="tabular-nums">{{ fmtCurrency(editorRow.amount) }}</span>
            </div>
          </div>
        </div>

        <!-- Modal footer actions -->
        <DialogFooter class="px-6 pb-6 sm:justify-between items-center">
          <div class="flex items-center gap-2">
            <Button v-if="!editorIsPaid" class="bg-green-600 hover:bg-green-700 text-white" @click="markPaid">
              <Check class="w-3.5 h-3.5" />
              Mark as Paid
            </Button>
            <span v-else class="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <Check class="w-4 h-4" />
              Paid
            </span>
          </div>

          <div class="flex items-center gap-2">
            <Button variant="outline">
              <Send class="w-3.5 h-3.5" />
              Send to patient
            </Button>
            <Button>
              <Download class="w-3.5 h-3.5" />
              Download PDF
            </Button>
          </div>
        </DialogFooter>

      </div>
    </DialogContent>
  </Dialog>
</template>
