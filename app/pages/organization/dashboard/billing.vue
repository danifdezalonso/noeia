<script setup lang="ts">
import {
  Download, Plus, Search, ChevronDown, ChevronRight, Eye, EyeOff,
  Check, AlertCircle, MoreHorizontal, Clock, ExternalLink,
  ChevronsUpDown, ChevronUp, SlidersHorizontal, FileText, Send,
} from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { ChartBar, ChartDonut, ChartAreaInteractive } from '~/components/ui/chart'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'


definePageMeta({ layout: 'dashboard' })

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmtCurrency(n: number) { return `€${n.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
function fmtDate(d: string) { return format(parseISO(d), 'MMM d, yyyy') }

// ── Tabs ────────────────────────────────────────────────────────────────────
const activeTab = ref<'doctors' | 'patients'>('doctors')

// ════════════════════════════════════════════════════════════════════════════
// DOCTORS VIEW
// ════════════════════════════════════════════════════════════════════════════

interface SessionLine {
  id: string
  date: string
  patient: string
  sessionFee: number
  extras: number
  docFee?: number
}

interface DoctorRow {
  id: string
  name: string
  initials: string
  commissionPct: number
  billStatus: 'billed' | 'pending' | 'paid' | 'draft'
  sessions: SessionLine[]
}

const doctorRows = ref<DoctorRow[]>([
  {
    id: 'd1', name: 'Dr. Ana Ruiz', initials: 'AR', commissionPct: 30, billStatus: 'billed',
    sessions: [
      { id: 's1', date: '2025-12-20', patient: 'Sarah Johnson',  sessionFee: 120, extras: 0 },
      { id: 's2', date: '2025-12-15', patient: 'Laura Pérez',    sessionFee: 120, extras: 0 },
      { id: 's3', date: '2025-12-01', patient: 'Emily Davis',    sessionFee: 120, extras: 0 },
      { id: 's4', date: '2025-11-28', patient: 'Sarah Johnson',  sessionFee: 120, extras: 0, docFee: 50 },
      { id: 's5', date: '2025-12-24', patient: 'Olivia Wilson',  sessionFee: 120, extras: 0, docFee: 50 },
    ],
  },
  {
    id: 'd2', name: 'Dr. Marc Vidal', initials: 'MV', commissionPct: 30, billStatus: 'pending',
    sessions: [
      { id: 's6', date: '2026-01-10', patient: 'Michael Brown', sessionFee: 140, extras: 0, docFee: 50 },
      { id: 's7', date: '2026-01-15', patient: 'Lucas Martín',  sessionFee: 140, extras: 0 },
      { id: 's8', date: '2026-01-22', patient: 'Nora Williams', sessionFee: 140, extras: 0 },
    ],
  },
  {
    id: 'd3', name: 'Dr. Júlia Serra', initials: 'JS', commissionPct: 25, billStatus: 'paid',
    sessions: [
      { id: 's9',  date: '2026-01-05', patient: 'Emma Wilson',   sessionFee: 150, extras: 0 },
      { id: 's10', date: '2026-01-19', patient: 'Claire Dubois', sessionFee: 150, extras: 0 },
    ],
  },
  {
    id: 'd4', name: 'Dr. Omar López', initials: 'OL', commissionPct: 30, billStatus: 'draft',
    sessions: [
      { id: 's11', date: '2025-12-05', patient: 'David Lee',   sessionFee: 160, extras: 0, docFee: 50 },
      { id: 's12', date: '2025-12-18', patient: 'Alex Moreno', sessionFee: 160, extras: 0 },
    ],
  },
])

function drVolume(d: DoctorRow) {
  return d.sessions.reduce((s, sess) => s + sess.sessionFee + (sess.docFee ?? 0) + sess.extras, 0)
}
function drCommission(d: DoctorRow) { return Math.round(drVolume(d) * d.commissionPct) / 100 }
function sessComm(fee: number, pct: number) { return Math.round(fee * pct) / 100 }

const totalCommissionYTD  = computed(() => doctorRows.value.reduce((s, d) => s + drCommission(d), 0))
const pendingBillsTotal   = computed(() => doctorRows.value.filter(d => d.billStatus === 'pending' || d.billStatus === 'billed').reduce((s, d) => s + drCommission(d), 0))
const pendingDoctorCount  = computed(() => doctorRows.value.filter(d => d.billStatus === 'pending' || d.billStatus === 'billed').length)
const sessionVolumeTotal  = computed(() => doctorRows.value.reduce((s, d) => s + drVolume(d), 0))

const expandedDoctors = ref<Set<string>>(new Set(['d1']))
function toggleExpand(id: string) {
  const s = new Set(expandedDoctors.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expandedDoctors.value = s
}

const doctorSearch       = ref('')
const doctorStatusFilter = ref('all')
const doctorDateFrom     = ref('2025-01-01')
const doctorDateTo       = ref('2026-02-22')

const filteredDoctors = computed(() => {
  let list = [...doctorRows.value]
  if (doctorSearch.value.trim())         list = list.filter(d => d.name.toLowerCase().includes(doctorSearch.value.toLowerCase()))
  if (doctorStatusFilter.value !== 'all') list = list.filter(d => d.billStatus === doctorStatusFilter.value)
  return list
})

const drBillMeta: Record<DoctorRow['billStatus'], { label: string; classes: string }> = {
  billed:  { label: 'Billed',  classes: 'bg-amber-50 text-amber-700 border-amber-200'    },
  pending: { label: 'Pending', classes: 'bg-orange-50 text-orange-600 border-orange-200' },
  paid:    { label: 'Paid',    classes: 'bg-green-50 text-green-700 border-green-200'    },
  draft:   { label: 'Draft',   classes: 'bg-muted text-muted-foreground border-border'    },
}

function setDrStatus(id: string, status: DoctorRow['billStatus']) {
  const d = doctorRows.value.find(r => r.id === id)
  if (d) d.billStatus = status
}

// ════════════════════════════════════════════════════════════════════════════
// PATIENTS VIEW
// ════════════════════════════════════════════════════════════════════════════

type InvStatus = 'paid' | 'pending' | 'overdue'

interface InvoiceRow {
  id: string
  date: string
  patient: string
  patientInitials: string
  doctorInitials: string
  doctorName: string
  type: string
  sessionStatus: 'done' | 'scheduled' | 'cancelled'
  paymentMethod: string | null
  paymentDate: string | null
  amount: number
  billingStatus: InvStatus
  documentationIncluded: boolean
}

const invoiceRows = ref<InvoiceRow[]>([
  { id: 'INV-2501', date: '2025-12-20', patient: 'Sarah Johnson',  patientInitials: 'SJ', doctorInitials: 'AR', doctorName: 'Dr. Ana Ruiz',    type: 'Online',     sessionStatus: 'done', paymentMethod: 'Stripe',        paymentDate: '2025-12-20', amount: 120, billingStatus: 'paid',    documentationIncluded: false },
  { id: 'INV-2502', date: '2025-12-19', patient: 'Michael Brown',  patientInitials: 'MB', doctorInitials: 'MV', doctorName: 'Dr. Marc Vidal',   type: 'In-Person',  sessionStatus: 'done', paymentMethod: null,            paymentDate: null,          amount: 140, billingStatus: 'pending', documentationIncluded: true  },
  { id: 'INV-2503', date: '2025-12-18', patient: 'Emma Wilson',    patientInitials: 'EW', doctorInitials: 'JS', doctorName: 'Dr. Júlia Serra',  type: 'Couples',    sessionStatus: 'done', paymentMethod: 'Credit Card',   paymentDate: '2025-12-18', amount: 150, billingStatus: 'paid',    documentationIncluded: false },
  { id: 'INV-2504', date: '2025-12-05', patient: 'David Lee',      patientInitials: 'DL', doctorInitials: 'OL', doctorName: 'Dr. Omar López',   type: 'Group',      sessionStatus: 'done', paymentMethod: null,            paymentDate: null,          amount: 160, billingStatus: 'overdue', documentationIncluded: true  },
  { id: 'INV-2505', date: '2025-12-15', patient: 'Laura Pérez',    patientInitials: 'LP', doctorInitials: 'AR', doctorName: 'Dr. Ana Ruiz',    type: 'Online',     sessionStatus: 'done', paymentMethod: 'Bank Transfer', paymentDate: '2025-12-15', amount: 120, billingStatus: 'paid',    documentationIncluded: false },
  { id: 'INV-2506', date: '2026-01-08', patient: 'Lucas Martín',   patientInitials: 'LM', doctorInitials: 'MV', doctorName: 'Dr. Marc Vidal',   type: 'Online',     sessionStatus: 'done', paymentMethod: 'Stripe',        paymentDate: '2026-01-08', amount: 140, billingStatus: 'paid',    documentationIncluded: false },
  { id: 'INV-2507', date: '2026-01-10', patient: 'Claire Dubois',  patientInitials: 'CD', doctorInitials: 'JS', doctorName: 'Dr. Júlia Serra',  type: 'Individual', sessionStatus: 'done', paymentMethod: null,            paymentDate: null,          amount: 150, billingStatus: 'pending', documentationIncluded: false },
  { id: 'INV-2508', date: '2026-01-22', patient: 'Nora Williams',  patientInitials: 'NW', doctorInitials: 'MV', doctorName: 'Dr. Marc Vidal',   type: 'In-Person',  sessionStatus: 'done', paymentMethod: null,            paymentDate: null,          amount: 140, billingStatus: 'overdue', documentationIncluded: false },
])

const totalBilled  = computed(() => invoiceRows.value.reduce((s, r) => s + r.amount, 0))
const totalPaid    = computed(() => invoiceRows.value.filter(r => r.billingStatus === 'paid').reduce((s, r) => s + r.amount, 0))
const totalPending = computed(() => invoiceRows.value.filter(r => r.billingStatus === 'pending').reduce((s, r) => s + r.amount, 0))
const totalOverdue = computed(() => invoiceRows.value.filter(r => r.billingStatus === 'overdue').reduce((s, r) => s + r.amount, 0))

const sparkBilledData  = [120,260,260,400,540,690,810,960,960,1110].map(v => ({ v }))
const sparkPaidData    = [120,120,120,260,260,410,530,530,650,770].map(v => ({ v }))
const sparkPendingData = [0,140,140,140,280,280,280,430,310,170].map(v => ({ v }))
const sparkOverdueData = [0,0,0,0,0,0,0,160,160,300].map(v => ({ v }))

// ── Area chart data (90-day daily revenue vs collected) ────────────────────
const invoiceAreaData = (() => {
  function mkRng(seed: number) {
    let s = seed >>> 0
    return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000 }
  }
  const rng = mkRng(77)
  const amts = [120, 120, 140, 150, 160]
  const actual: Record<string, { revenue: number; collected: number }> = {
    '2025-12-05': { revenue: 160, collected: 0   },
    '2025-12-15': { revenue: 120, collected: 120 },
    '2025-12-18': { revenue: 150, collected: 150 },
    '2025-12-19': { revenue: 140, collected: 0   },
    '2025-12-20': { revenue: 120, collected: 120 },
    '2026-01-08': { revenue: 140, collected: 140 },
    '2026-01-10': { revenue: 150, collected: 0   },
    '2026-01-22': { revenue: 140, collected: 0   },
  }
  const result: { date: string; revenue: number; collected: number }[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date('2026-03-01')
    d.setDate(d.getDate() - i)
    const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    if (actual[ymd]) {
      result.push({ date: ymd, ...actual[ymd] })
    } else {
      const dow = d.getDay()
      if (dow >= 1 && dow <= 5 && rng() < 0.5) {
        const n = Math.floor(rng() * 3) + 1
        const amt = amts.slice(0, n).reduce((s, v) => s + amts[Math.floor(rng() * amts.length)], 0)
        result.push({ date: ymd, revenue: amt, collected: rng() > 0.3 ? amt : 0 })
      } else {
        result.push({ date: ymd, revenue: 0, collected: 0 })
      }
    }
  }
  return result
})()
const invoiceSeries = [
  { key: 'revenue',   label: 'Revenue',   color: '#6366f1' },
  { key: 'collected', label: 'Collected', color: '#22c55e' },
]

// ── Sparkline helpers ──────────────────────────────────────────────────────
function toSparkPath(data: {v: number}[], w = 96, h = 40) {
  const vals = data.map(d => d.v)
  const max = Math.max(...vals, 1)
  return 'M' + vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w
    const y = h - (v / max) * h * 0.85 + 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join('L')
}
function toAreaPath(data: {v: number}[], w = 96, h = 40) {
  const vals = data.map(d => d.v)
  const max = Math.max(...vals, 1)
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w
    const y = h - (v / max) * h * 0.85 + 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M0,${h} L${pts.join(' L')} L${w},${h} Z`
}

// ── Card dialog state ──────────────────────────────────────────────────────
const activePatCard  = ref<'billed' | 'paid' | 'pending' | 'overdue' | null>(null)
const activeDocCard  = ref<'commission' | 'pendingBills' | 'volume' | null>(null)

// Patients view dialog data
const patDonutData = computed(() => [
  { label: 'Paid',    value: totalPaid.value,    color: '#22c55e' },
  { label: 'Pending', value: totalPending.value, color: '#f97316' },
  { label: 'Overdue', value: totalOverdue.value, color: '#ef4444' },
].filter(d => d.value > 0))

const pendingInvoices  = computed(() => invoiceRows.value.filter(r => r.billingStatus === 'pending'))
const overdueInvoices  = computed(() => invoiceRows.value.filter(r => r.billingStatus === 'overdue'))
const paidInvoices     = computed(() => invoiceRows.value.filter(r => r.billingStatus === 'paid'))

// Doctors view dialog data
const doctorVolumeData   = computed(() => doctorRows.value.map(d => ({ volume: drVolume(d) })))
const doctorVolumeLabels = computed(() => doctorRows.value.map(d => d.initials))
const pendingDoctors     = computed(() => doctorRows.value.filter(d => d.billStatus === 'pending' || d.billStatus === 'billed'))

const invoiceSearch       = ref('')
const invoiceDoctorFilter = ref('all')
const invoiceStatusFilter = ref('all')
const invoiceDateFrom     = ref('2025-08-19')
const invoiceDateTo       = ref('2026-02-22')
const showValues          = ref(true)

const uniqueDoctors = computed(() => [...new Set(invoiceRows.value.map(r => r.doctorName))].sort())

const filteredInvoices = computed(() => {
  let list = [...invoiceRows.value]
  if (invoiceSearch.value.trim())          list = list.filter(r => r.patient.toLowerCase().includes(invoiceSearch.value.toLowerCase()) || r.id.toLowerCase().includes(invoiceSearch.value.toLowerCase()))
  if (invoiceDoctorFilter.value !== 'all') list = list.filter(r => r.doctorName === invoiceDoctorFilter.value)
  if (invoiceStatusFilter.value !== 'all') list = list.filter(r => r.billingStatus === invoiceStatusFilter.value)
  if (invoiceDateFrom.value)               list = list.filter(r => r.date >= invoiceDateFrom.value)
  if (invoiceDateTo.value)                 list = list.filter(r => r.date <= invoiceDateTo.value)
  return list
})

const typeMeta: Record<string, string> = {
  'Online':     'bg-sky-50 text-sky-700 ring-sky-200',
  'In-Person':  'bg-teal-50 text-teal-700 ring-teal-200',
  'Couples':    'bg-violet-50 text-violet-700 ring-violet-200',
  'Group':      'bg-amber-50 text-amber-700 ring-amber-200',
  'Individual': 'bg-muted text-muted-foreground ring-border',
}

const invBillingMeta: Record<InvStatus, { label: string; classes: string; icon: string }> = {
  paid:    { label: 'Paid',    classes: 'bg-green-50 text-green-700 border-green-200',  icon: 'check'   },
  pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'clock'   },
  overdue: { label: 'Overdue', classes: 'bg-red-50 text-red-600 border-red-200',       icon: 'warning' },
}

// Invoice editor modal
const editorOpen = ref(false)
const editorRow  = ref<InvoiceRow | null>(null)
function openInvoice(row: InvoiceRow) { editorRow.value = { ...row }; editorOpen.value = true }
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-5 max-w-[1300px]">

      <!-- ── Page header ───────────────────────────────────────────────── -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-bold text-foreground tracking-tight">Billing & Invoices</h1>
        <div class="flex items-center gap-2">
          <Button variant="outline">
            <Download class="w-4 h-4" />
            Export
          </Button>
          <Button>
            <Plus class="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      <!-- ── Tabs ─────────────────────────────────────────────────────── -->
      <div class="flex gap-1 border-b border-border -mb-1">
        <button
          v-for="tab in [{ key: 'doctors', label: 'Doctors' }, { key: 'patients', label: 'Patients' }]"
          :key="tab.key"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          ]"
          @click="activeTab = (tab.key as 'doctors' | 'patients')"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           DOCTORS VIEW
      ══════════════════════════════════════════════════════════════════ -->
      <template v-if="activeTab === 'doctors'">

        <!-- Metric cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <!-- Total Commission YTD -->
          <div class="bg-card rounded-xl border border-border shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow" @click="activeDocCard = 'commission'">
            <p class="text-sm text-muted-foreground font-medium mb-3">Total Commission (YTD)</p>
            <p class="text-3xl font-bold text-foreground tabular-nums">{{ fmtCurrency(totalCommissionYTD) }}</p>
            <p class="text-xs text-green-600 dark:text-green-400 mt-1.5">+5.4% from last month</p>
          </div>

          <!-- Pending Bills -->
          <div class="bg-card rounded-xl border border-border shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow" @click="activeDocCard = 'pendingBills'">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm text-muted-foreground font-medium">Pending Bills</p>
              <Clock class="w-4 h-4 text-orange-400" />
            </div>
            <p class="text-3xl font-bold text-orange-500 tabular-nums">{{ fmtCurrency(pendingBillsTotal) }}</p>
            <p class="text-xs text-muted-foreground mt-1.5">Owed by {{ pendingDoctorCount }} {{ pendingDoctorCount === 1 ? 'doctor' : 'doctors' }}</p>
          </div>

          <!-- Session Volume -->
          <div class="bg-card rounded-xl border border-border shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow" @click="activeDocCard = 'volume'">
            <p class="text-sm text-muted-foreground font-medium mb-3">Session Volume</p>
            <p class="text-3xl font-bold text-blue-600 tabular-nums">{{ fmtCurrency(sessionVolumeTotal) }}</p>
            <p class="text-xs text-muted-foreground mt-1.5">Total value of services</p>
          </div>

        </div>

        <!-- Filters -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <div class="relative flex-1 min-w-[220px] max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
            <Input v-model="doctorSearch" placeholder="Filter doctors..." class="pl-9" />
          </div>

          <!-- Status filter -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                :class="doctorStatusFilter !== 'all' ? 'bg-primary/10 text-primary border-primary/30' : ''"
              >
                {{ doctorStatusFilter === 'all' ? 'All Statuses' : drBillMeta[doctorStatusFilter as DoctorRow['billStatus']]?.label ?? doctorStatusFilter }}
                <ChevronDown class="w-3.5 h-3.5 ml-1 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-40">
              <DropdownMenuItem
                v-for="s in ['all', 'billed', 'pending', 'paid', 'draft']"
                :key="s"
                :class="doctorStatusFilter === s ? 'text-primary font-medium' : ''"
                @click="doctorStatusFilter = s"
              >
                {{ s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1) }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- Date range -->
          <div class="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <div class="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg">
              <span class="text-muted-foreground text-xs">📅</span>
              <input v-model="doctorDateFrom" type="date" class="text-sm bg-transparent text-foreground focus:outline-none" />
            </div>
            <span class="text-muted-foreground">–</span>
            <div class="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg">
              <span class="text-muted-foreground text-xs">📅</span>
              <input v-model="doctorDateTo" type="date" class="text-sm bg-transparent text-foreground focus:outline-none" />
            </div>
          </div>
        </div>

        <!-- Doctors table -->
        <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <Table class="min-w-[700px]">
              <TableHeader>
                <TableRow class="border-b border-border bg-muted/30 hover:bg-muted/30">
                  <TableHead class="w-10" />
                  <TableHead class="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Doctor</TableHead>
                  <TableHead class="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Volume</TableHead>
                  <TableHead class="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commission ({{ filteredDoctors[0]?.commissionPct ?? 30 }}%)</TableHead>
                  <TableHead class="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bill Status</TableHead>
                  <TableHead class="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-for="doc in filteredDoctors" :key="doc.id">
                  <!-- Doctor summary row -->
                  <TableRow
                    class="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                    @click="toggleExpand(doc.id)"
                  >
                    <TableCell class="pl-4 py-3.5">
                      <component
                        :is="expandedDoctors.has(doc.id) ? ChevronDown : ChevronRight"
                        class="w-4 h-4 text-muted-foreground transition-transform"
                      />
                    </TableCell>
                    <TableCell class="px-4 py-3.5">
                      <div class="flex items-center gap-2.5">
                        <Avatar class="size-8 shrink-0">
                          <AvatarImage :src="avatarUrl(doc.name)" :alt="doc.name" />
                          <AvatarFallback class="bg-primary/10 text-primary text-xs font-bold">{{ doc.initials }}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p class="font-semibold text-foreground">{{ doc.name }}</p>
                          <p class="text-xs text-muted-foreground">{{ doc.sessions.length }} sessions</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell class="px-4 py-3.5 text-right font-semibold text-foreground tabular-nums">{{ fmtCurrency(drVolume(doc)) }}</TableCell>
                    <TableCell class="px-4 py-3.5 text-right font-semibold text-foreground tabular-nums">{{ fmtCurrency(drCommission(doc)) }}</TableCell>
                    <TableCell class="px-4 py-3.5" @click.stop>
                      <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <button
                            :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors', drBillMeta[doc.billStatus].classes]"
                          >
                            {{ drBillMeta[doc.billStatus].label }}
                            <ChevronDown class="w-3 h-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" class="w-36">
                          <DropdownMenuItem
                            v-for="s in (['billed','pending','paid','draft'] as DoctorRow['billStatus'][])"
                            :key="s"
                            :class="doc.billStatus === s ? 'text-primary font-medium' : ''"
                            @click="setDrStatus(doc.id, s)"
                          >
                            {{ drBillMeta[s].label }}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell class="px-4 py-3.5 text-right" @click.stop>
                      <Button variant="ghost" size="icon" class="w-8 h-8">
                        <MoreHorizontal class="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  <!-- Expanded sub-table -->
                  <TableRow v-if="expandedDoctors.has(doc.id)" :key="`${doc.id}-expanded`">
                    <TableCell colspan="6" class="bg-muted/30 border-b border-border px-0 py-0">
                      <Table>
                        <TableHeader>
                          <TableRow class="border-b border-border hover:bg-transparent">
                            <TableHead class="pl-14 pr-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</TableHead>
                            <TableHead class="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</TableHead>
                            <TableHead class="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Session Fee</TableHead>
                            <TableHead class="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Extras</TableHead>
                            <TableHead class="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commission ({{ doc.commissionPct }}%)</TableHead>
                            <TableHead class="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <template v-for="sess in doc.sessions" :key="sess.id">
                            <!-- Session row -->
                            <TableRow class="border-b border-border/50 hover:bg-accent/30 transition-colors">
                              <TableCell class="pl-14 pr-4 py-2.5 text-muted-foreground whitespace-nowrap">{{ fmtDate(sess.date) }}</TableCell>
                              <TableCell class="px-4 py-2.5 font-medium text-foreground">{{ sess.patient }}</TableCell>
                              <TableCell class="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{{ fmtCurrency(sess.sessionFee) }}</TableCell>
                              <TableCell class="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{{ sess.extras ? fmtCurrency(sess.extras) : '–' }}</TableCell>
                              <TableCell class="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">{{ fmtCurrency(sessComm(sess.sessionFee, doc.commissionPct)) }}</TableCell>
                              <TableCell class="px-4 py-2.5 text-right">
                                <Button variant="link" size="sm" class="h-auto p-0 text-xs gap-1">
                                  Session <ExternalLink class="w-3 h-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                            <!-- Documentation sub-row -->
                            <TableRow v-if="sess.docFee" :key="`${sess.id}-doc`" class="border-b border-border/50 bg-muted/20">
                              <TableCell class="pl-14 pr-4 py-2" />
                              <TableCell class="px-4 py-2">
                                <div class="flex items-center gap-1.5 text-muted-foreground text-sm">
                                  <span class="text-muted-foreground/50 text-base leading-none">└</span>
                                  Documentation
                                </div>
                              </TableCell>
                              <TableCell class="px-4 py-2 text-right tabular-nums text-muted-foreground text-sm">{{ fmtCurrency(sess.docFee) }}</TableCell>
                              <TableCell class="px-4 py-2 text-right text-muted-foreground text-sm">–</TableCell>
                              <TableCell class="px-4 py-2 text-right tabular-nums text-muted-foreground text-sm">{{ fmtCurrency(sessComm(sess.docFee, doc.commissionPct)) }}</TableCell>
                              <TableCell class="px-4 py-2 text-right">
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">Doc</span>
                              </TableCell>
                            </TableRow>
                          </template>
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                </template>

                <TableRow v-if="filteredDoctors.length === 0">
                  <TableCell colspan="6" class="py-16 text-center">
                    <div class="flex flex-col items-center gap-2">
                      <AlertCircle class="w-8 h-8 text-muted-foreground/50" />
                      <p class="text-sm text-muted-foreground">No doctors match your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

      </template>

      <!-- ══════════════════════════════════════════════════════════════════
           PATIENTS VIEW
      ══════════════════════════════════════════════════════════════════ -->
      <template v-else>

        <!-- 4 metric cards with sparklines -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="card in [
              { key: 'billed',  label: 'Total Billed', value: totalBilled,  sparkData: sparkBilledData,  lineColor: '#6366f1' },
              { key: 'paid',    label: 'Paid',         value: totalPaid,    sparkData: sparkPaidData,    lineColor: '#22c55e' },
              { key: 'pending', label: 'Pending',      value: totalPending, sparkData: sparkPendingData, lineColor: '#f97316' },
              { key: 'overdue', label: 'Overdue',      value: totalOverdue, sparkData: sparkOverdueData, lineColor: '#ef4444' },
            ]"
            :key="card.label"
            class="bg-card rounded-xl border border-border shadow-sm p-4 flex flex-col gap-1 cursor-pointer hover:shadow-md transition-shadow"
            @click="activePatCard = (card.key as any)"
          >
            <div class="flex items-center justify-between">
              <p class="text-sm text-muted-foreground font-medium">{{ card.label }}</p>
              <Button variant="ghost" size="icon" class="w-6 h-6" @click.stop="showValues = !showValues">
                <component :is="showValues ? Eye : EyeOff" class="w-3.5 h-3.5 text-muted-foreground/70 hover:text-muted-foreground transition-colors" />
              </Button>
            </div>
            <p class="text-2xl font-bold tabular-nums text-foreground">
              {{ showValues ? fmtCurrency(card.value) : '€ ···' }}
            </p>
            <!-- SVG Sparkline -->
            <div class="h-10 mt-1">
              <svg viewBox="0 0 96 40" class="w-full h-full overflow-visible">
                <path :d="toAreaPath(card.sparkData)" :fill="card.lineColor" fill-opacity="0.12" />
                <path :d="toSparkPath(card.sparkData)" :stroke="card.lineColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Area chart -->
        <ChartAreaInteractive
          :data="invoiceAreaData"
          :series="invoiceSeries"
          title="Revenue vs Collected"
          description="Daily invoice activity for the last 3 months"
        />

        <!-- Filters -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Search -->
          <div class="relative min-w-[200px] max-w-xs flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
            <Input v-model="invoiceSearch" placeholder="Filter invoices..." class="pl-9" />
          </div>

          <!-- All Doctors -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                :class="invoiceDoctorFilter !== 'all' ? 'bg-primary/10 text-primary border-primary/30' : ''"
              >
                {{ invoiceDoctorFilter === 'all' ? 'All Doctors' : invoiceDoctorFilter }}
                <ChevronDown class="w-3.5 h-3.5 ml-1 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-52">
              <DropdownMenuItem
                :class="invoiceDoctorFilter === 'all' ? 'text-primary font-medium' : ''"
                @click="invoiceDoctorFilter = 'all'"
              >
                All Doctors
              </DropdownMenuItem>
              <DropdownMenuItem
                v-for="d in uniqueDoctors"
                :key="d"
                :class="invoiceDoctorFilter === d ? 'text-primary font-medium' : ''"
                @click="invoiceDoctorFilter = d"
              >
                {{ d }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- All Statuses -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                :class="invoiceStatusFilter !== 'all' ? 'bg-primary/10 text-primary border-primary/30' : ''"
              >
                {{ invoiceStatusFilter === 'all' ? 'All Statuses' : invoiceStatusFilter.charAt(0).toUpperCase() + invoiceStatusFilter.slice(1) }}
                <ChevronDown class="w-3.5 h-3.5 ml-1 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-40">
              <DropdownMenuItem
                v-for="s in ['all','paid','pending','overdue']"
                :key="s"
                :class="invoiceStatusFilter === s ? 'text-primary font-medium' : ''"
                @click="invoiceStatusFilter = s"
              >
                {{ s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1) }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- Date range -->
          <div class="flex flex-wrap items-center gap-1.5">
            <div class="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg">
              <span class="text-muted-foreground text-xs">📅</span>
              <input v-model="invoiceDateFrom" type="date" class="text-sm bg-transparent text-foreground focus:outline-none" />
            </div>
            <span class="text-muted-foreground text-sm">–</span>
            <div class="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg">
              <span class="text-muted-foreground text-xs">📅</span>
              <input v-model="invoiceDateTo" type="date" class="text-sm bg-transparent text-foreground focus:outline-none" />
            </div>
          </div>

          <!-- Columns button (cosmetic) -->
          <Button variant="outline" class="ml-auto">
            <SlidersHorizontal class="w-3.5 h-3.5" />
            Columns
          </Button>
        </div>

        <!-- Invoices table -->
        <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <Table class="min-w-[960px]">
              <TableHeader>
                <TableRow class="bg-muted/30 hover:bg-muted/30">
                  <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Invoice ID</TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Date</TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Patient</TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Professional</TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Type</TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Session Status</TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Payment</TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-right">Amount</TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Billing Status</TableHead>
                  <TableHead class="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="filteredInvoices.length === 0">
                  <TableCell :colspan="10" class="py-16 text-center">
                    <div class="flex flex-col items-center gap-2">
                      <AlertCircle class="w-8 h-8 text-muted-foreground/50" />
                      <p class="text-sm text-muted-foreground">No invoices match your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow
                  v-for="row in filteredInvoices"
                  :key="row.id"
                  class="hover:bg-accent/50 transition-colors cursor-pointer"
                  @click="openInvoice(row)"
                >
                  <!-- Invoice ID -->
                  <TableCell class="font-mono text-xs text-muted-foreground whitespace-nowrap">{{ row.id }}</TableCell>

                  <!-- Date -->
                  <TableCell class="whitespace-nowrap text-sm text-muted-foreground">{{ fmtDate(row.date) }}</TableCell>

                  <!-- Patient -->
                  <TableCell class="whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <Avatar class="size-6 shrink-0">
                        <AvatarImage :src="avatarUrl(row.patient)" :alt="row.patient" />
                        <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ row.patientInitials }}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p class="text-sm font-medium text-foreground">{{ row.patient }}</p>
                        <p v-if="row.documentationIncluded" class="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <span class="text-muted-foreground/50 leading-none">└</span>
                          Documentation included
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <!-- Professional -->
                  <TableCell class="whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                      <div class="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span class="text-muted-foreground text-[8px] font-bold">{{ row.doctorInitials }}</span>
                      </div>
                      <span class="text-sm text-muted-foreground">{{ row.doctorName }}</span>
                    </div>
                  </TableCell>

                  <!-- Type badge -->
                  <TableCell class="whitespace-nowrap">
                    <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1', typeMeta[row.type] ?? 'bg-muted text-muted-foreground ring-border']">{{ row.type }}</span>
                  </TableCell>

                  <!-- Session Status -->
                  <TableCell class="whitespace-nowrap">
                    <span v-if="row.sessionStatus === 'done'" class="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                      <Check class="w-3.5 h-3.5" />
                      Done
                    </span>
                    <span v-else-if="row.sessionStatus === 'scheduled'" class="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <Clock class="w-3.5 h-3.5" />
                      Scheduled
                    </span>
                    <span v-else class="text-xs text-muted-foreground">–</span>
                  </TableCell>

                  <!-- Payment -->
                  <TableCell class="whitespace-nowrap">
                    <div v-if="row.paymentMethod" class="text-sm">
                      <p class="font-medium text-foreground">{{ row.paymentMethod }}</p>
                      <p class="text-xs text-muted-foreground">{{ fmtDate(row.paymentDate!) }}</p>
                    </div>
                    <span v-else class="text-sm text-muted-foreground">–</span>
                  </TableCell>

                  <!-- Amount -->
                  <TableCell class="text-right tabular-nums font-semibold text-foreground whitespace-nowrap">
                    <span class="text-xs text-muted-foreground mr-0.5">€</span>{{ row.amount }}
                  </TableCell>

                  <!-- Billing Status -->
                  <TableCell class="whitespace-nowrap">
                    <Badge variant="outline" :class="['gap-1', invBillingMeta[row.billingStatus].classes]">
                      <Check v-if="row.billingStatus === 'paid'" class="w-3 h-3" />
                      <Clock v-else-if="row.billingStatus === 'pending'" class="w-3 h-3" />
                      <AlertCircle v-else class="w-3 h-3" />
                      {{ invBillingMeta[row.billingStatus].label }}
                    </Badge>
                  </TableCell>

                  <!-- Actions -->
                  <TableCell @click.stop>
                    <Button variant="ghost" size="icon" class="w-8 h-8">
                      <MoreHorizontal class="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

      </template>

    </div>
  </div>

  <!-- ══ Invoice Detail Modal ═══════════════════════════════════════════════ -->
  <Dialog v-model:open="editorOpen">
    <DialogContent class="max-w-lg p-0">
      <div v-if="editorRow">
        <DialogHeader class="px-6 pt-6 pb-4 border-b border-border/50">
          <div class="flex items-center justify-between">
            <div>
              <DialogTitle class="text-lg font-bold text-foreground">{{ editorRow.id }}</DialogTitle>
              <div class="flex items-center gap-2 mt-1">
                <Badge variant="outline" :class="['gap-1', invBillingMeta[editorRow.billingStatus].classes]">
                  <Check v-if="editorRow.billingStatus === 'paid'" class="w-3 h-3" />
                  <Clock v-else-if="editorRow.billingStatus === 'pending'" class="w-3 h-3" />
                  <AlertCircle v-else class="w-3 h-3" />
                  {{ invBillingMeta[editorRow.billingStatus].label }}
                </Badge>
                <Badge v-if="editorRow.documentationIncluded" variant="secondary">
                  + Documentation
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div class="px-6 py-5 space-y-4">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="bg-muted/30 rounded-lg p-3">
              <p class="text-xs text-muted-foreground mb-1">Patient</p>
              <div class="flex items-center gap-2">
                <Avatar class="size-6 shrink-0">
                  <AvatarImage :src="avatarUrl(editorRow.patient)" :alt="editorRow.patient" />
                  <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ editorRow.patientInitials }}</AvatarFallback>
                </Avatar>
                <span class="font-medium text-foreground">{{ editorRow.patient }}</span>
              </div>
            </div>
            <div class="bg-muted/30 rounded-lg p-3">
              <p class="text-xs text-muted-foreground mb-1">Professional</p>
              <p class="font-medium text-foreground">{{ editorRow.doctorName }}</p>
            </div>
            <div class="bg-muted/30 rounded-lg p-3">
              <p class="text-xs text-muted-foreground mb-1">Date</p>
              <p class="font-medium text-foreground">{{ fmtDate(editorRow.date) }}</p>
            </div>
            <div class="bg-muted/30 rounded-lg p-3">
              <p class="text-xs text-muted-foreground mb-1">Session type</p>
              <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1', typeMeta[editorRow.type] ?? 'bg-muted text-muted-foreground ring-border']">{{ editorRow.type }}</span>
            </div>
          </div>

          <div class="border border-border/50 rounded-xl divide-y divide-border/50">
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-sm text-muted-foreground">Session fee</span>
              <span class="text-sm font-semibold text-foreground tabular-nums">{{ fmtCurrency(editorRow.amount) }}</span>
            </div>
            <div v-if="editorRow.documentationIncluded" class="flex items-center justify-between px-4 py-3">
              <span class="text-sm text-muted-foreground flex items-center gap-1.5">
                <span class="text-muted-foreground/50 text-base leading-none">└</span>
                Documentation
              </span>
              <span class="text-sm text-muted-foreground tabular-nums">€50.00</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-sm font-bold text-foreground">Total</span>
              <span class="text-sm font-bold text-foreground tabular-nums">{{ fmtCurrency(editorRow.amount + (editorRow.documentationIncluded ? 50 : 0)) }}</span>
            </div>
          </div>

          <div v-if="editorRow.paymentMethod" class="text-sm text-muted-foreground">
            Paid via <strong class="text-foreground">{{ editorRow.paymentMethod }}</strong> on {{ fmtDate(editorRow.paymentDate!) }}
          </div>
        </div>

        <DialogFooter class="px-6 pb-6 sm:justify-between items-center">
          <Button
            v-if="editorRow.billingStatus !== 'paid'"
            class="bg-green-600 text-white hover:bg-green-700"
            @click="editorRow && (editorRow.billingStatus = 'paid'); editorOpen = false"
          >
            <Check class="w-3.5 h-3.5" />
            Mark as Paid
          </Button>
          <span v-else class="flex items-center gap-1.5 text-sm font-medium text-green-600">
            <Check class="w-4 h-4" />
            Paid
          </span>
          <div class="flex items-center gap-2">
            <Button variant="outline">
              <Send class="w-3.5 h-3.5" />
              Send
            </Button>
            <Button>
              <Download class="w-3.5 h-3.5" />
              PDF
            </Button>
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>

  <!-- ══ Doctors: Commission Dialog ═════════════════════════════════════════ -->
  <Dialog :open="activeDocCard === 'commission'" @update:open="v => { if (!v) activeDocCard = null }">
    <DialogContent class="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b border-border/50">
        <DialogTitle class="text-lg font-bold">Total Commission (YTD)</DialogTitle>
      </DialogHeader>
      <div class="px-6 py-5 space-y-5">
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Total Commission</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ fmtCurrency(totalCommissionYTD) }}</p>
          </div>
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Doctors</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ doctorRows.length }}</p>
          </div>
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Avg / Doctor</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ doctorRows.length ? fmtCurrency(totalCommissionYTD / doctorRows.length) : '—' }}</p>
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Commission by Doctor</p>
          <ChartBar
            :data="doctorVolumeData"
            :segments="[{ key: 'volume', color: '#6366f1', label: 'Volume' }]"
            :x-labels="doctorVolumeLabels"
            class="h-36 w-full"
          />
        </div>
        <div class="space-y-1.5">
          <div
            v-for="d in doctorRows"
            :key="d.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <Avatar class="size-7 shrink-0">
              <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ d.initials }}</AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ d.name }}</p>
              <p class="text-xs text-muted-foreground">{{ d.sessions.length }} sessions · {{ d.commissionPct }}% rate</p>
            </div>
            <span class="text-sm font-semibold tabular-nums text-foreground">{{ fmtCurrency(drCommission(d)) }}</span>
          </div>
        </div>
      </div>
      <DialogFooter class="px-6 pb-6">
        <DialogClose as-child><Button variant="outline">Close</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ══ Doctors: Pending Bills Dialog ══════════════════════════════════════ -->
  <Dialog :open="activeDocCard === 'pendingBills'" @update:open="v => { if (!v) activeDocCard = null }">
    <DialogContent class="max-w-xl max-h-[85vh] overflow-y-auto p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b border-border/50">
        <DialogTitle class="text-lg font-bold">Pending Bills</DialogTitle>
      </DialogHeader>
      <div class="px-6 py-5 space-y-5">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Pending Total</p>
            <p class="text-xl font-bold text-orange-600 tabular-nums">{{ fmtCurrency(pendingBillsTotal) }}</p>
          </div>
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Doctors Awaiting</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ pendingDoctorCount }}</p>
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Doctors with Pending Bills</p>
          <div class="space-y-1.5">
            <div
              v-for="d in pendingDoctors"
              :key="d.id"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <Avatar class="size-7 shrink-0">
                <AvatarImage :src="avatarUrl(d.name)" :alt="d.name" />
                <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ d.initials }}</AvatarFallback>
              </Avatar>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">{{ d.name }}</p>
                <p class="text-xs text-muted-foreground">{{ d.sessions.length }} sessions</p>
              </div>
              <Badge variant="outline" :class="drBillMeta[d.billStatus].classes">{{ drBillMeta[d.billStatus].label }}</Badge>
              <span class="text-sm font-semibold tabular-nums text-orange-600">{{ fmtCurrency(drCommission(d)) }}</span>
            </div>
            <p v-if="!pendingDoctors.length" class="text-sm text-muted-foreground text-center py-4">No pending bills</p>
          </div>
        </div>
      </div>
      <DialogFooter class="px-6 pb-6">
        <DialogClose as-child><Button variant="outline">Close</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ══ Doctors: Session Volume Dialog ════════════════════════════════════= -->
  <Dialog :open="activeDocCard === 'volume'" @update:open="v => { if (!v) activeDocCard = null }">
    <DialogContent class="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b border-border/50">
        <DialogTitle class="text-lg font-bold">Session Volume</DialogTitle>
      </DialogHeader>
      <div class="px-6 py-5 space-y-5">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Total Volume</p>
            <p class="text-xl font-bold text-blue-600 tabular-nums">{{ fmtCurrency(sessionVolumeTotal) }}</p>
          </div>
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Total Sessions</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ doctorRows.reduce((s, d) => s + d.sessions.length, 0) }}</p>
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Volume by Doctor</p>
          <ChartBar
            :data="doctorVolumeData"
            :segments="[{ key: 'volume', color: '#0284c7', label: 'Volume' }]"
            :x-labels="doctorVolumeLabels"
            class="h-36 w-full"
          />
        </div>
        <div class="space-y-1.5">
          <div
            v-for="d in doctorRows"
            :key="d.id"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <Avatar class="size-7 shrink-0">
              <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ d.initials }}</AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ d.name }}</p>
              <p class="text-xs text-muted-foreground">{{ d.sessions.length }} sessions</p>
            </div>
            <span class="text-sm font-semibold tabular-nums text-blue-600">{{ fmtCurrency(drVolume(d)) }}</span>
          </div>
        </div>
      </div>
      <DialogFooter class="px-6 pb-6">
        <DialogClose as-child><Button variant="outline">Close</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ══ Patients: Total Billed Dialog ══════════════════════════════════════ -->
  <Dialog :open="activePatCard === 'billed'" @update:open="v => { if (!v) activePatCard = null }">
    <DialogContent class="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b border-border/50">
        <DialogTitle class="text-lg font-bold">Total Billed</DialogTitle>
      </DialogHeader>
      <div class="px-6 py-5 space-y-5">
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Total</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ fmtCurrency(totalBilled) }}</p>
          </div>
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Invoices</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ invoiceRows.length }}</p>
          </div>
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Avg / Invoice</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ invoiceRows.length ? fmtCurrency(totalBilled / invoiceRows.length) : '—' }}</p>
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Payment Status Breakdown</p>
          <div class="grid grid-cols-2 gap-5 items-center">
            <ChartDonut :data="patDonutData" :central-label="fmtCurrency(totalBilled)" central-sub-label="billed" class="max-h-[160px]" />
            <div class="flex flex-col gap-2">
              <div v-for="d in patDonutData" :key="d.label" class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ background: d.color }" />
                <span class="text-sm text-muted-foreground">{{ d.label }}</span>
                <span class="text-sm font-semibold text-foreground ml-auto tabular-nums">{{ fmtCurrency(d.value) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">All Invoices</p>
          <div class="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            <div v-for="r in invoiceRows" :key="r.id" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <Avatar class="size-6 shrink-0">
                <AvatarImage :src="avatarUrl(r.patient)" :alt="r.patient" />
                <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ r.patientInitials }}</AvatarFallback>
              </Avatar>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">{{ r.patient }}</p>
                <p class="text-xs text-muted-foreground">{{ fmtDate(r.date) }} · {{ r.doctorName }}</p>
              </div>
              <Badge variant="outline" :class="invBillingMeta[r.billingStatus].classes">{{ invBillingMeta[r.billingStatus].label }}</Badge>
              <span class="text-sm font-semibold tabular-nums text-foreground">{{ fmtCurrency(r.amount) }}</span>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter class="px-6 pb-6">
        <DialogClose as-child><Button variant="outline">Close</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ══ Patients: Paid Dialog ═══════════════════════════════════════════════ -->
  <Dialog :open="activePatCard === 'paid'" @update:open="v => { if (!v) activePatCard = null }">
    <DialogContent class="max-w-xl max-h-[85vh] overflow-y-auto p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b border-border/50">
        <DialogTitle class="text-lg font-bold">Paid Invoices</DialogTitle>
      </DialogHeader>
      <div class="px-6 py-5 space-y-5">
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Total Paid</p>
            <p class="text-xl font-bold text-green-600 tabular-nums">{{ fmtCurrency(totalPaid) }}</p>
          </div>
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Collection Rate</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ totalBilled > 0 ? Math.round(totalPaid / totalBilled * 100) : 0 }}%</p>
          </div>
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Invoices Paid</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ paidInvoices.length }}</p>
          </div>
        </div>
        <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          <div v-for="r in paidInvoices" :key="r.id" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <Avatar class="size-6 shrink-0">
              <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ r.patientInitials }}</AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ r.patient }}</p>
              <p class="text-xs text-muted-foreground">{{ fmtDate(r.date) }} · via {{ r.paymentMethod }}</p>
            </div>
            <span class="text-sm font-semibold tabular-nums text-green-600">{{ fmtCurrency(r.amount) }}</span>
          </div>
        </div>
      </div>
      <DialogFooter class="px-6 pb-6">
        <DialogClose as-child><Button variant="outline">Close</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ══ Patients: Pending Dialog ════════════════════════════════════════════ -->
  <Dialog :open="activePatCard === 'pending'" @update:open="v => { if (!v) activePatCard = null }">
    <DialogContent class="max-w-xl max-h-[85vh] overflow-y-auto p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b border-border/50">
        <DialogTitle class="text-lg font-bold">Pending Invoices</DialogTitle>
      </DialogHeader>
      <div class="px-6 py-5 space-y-5">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Pending Total</p>
            <p class="text-xl font-bold text-amber-600 tabular-nums">{{ fmtCurrency(totalPending) }}</p>
          </div>
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Awaiting Payment</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ pendingInvoices.length }}</p>
          </div>
        </div>
        <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          <div v-for="r in pendingInvoices" :key="r.id" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <Avatar class="size-6 shrink-0">
              <AvatarFallback class="bg-primary/10 text-primary text-[9px] font-bold">{{ r.patientInitials }}</AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ r.patient }}</p>
              <p class="text-xs text-muted-foreground">{{ fmtDate(r.date) }} · {{ r.doctorName }}</p>
            </div>
            <span class="text-sm font-semibold tabular-nums text-amber-600">{{ fmtCurrency(r.amount) }}</span>
          </div>
          <p v-if="!pendingInvoices.length" class="text-sm text-muted-foreground text-center py-4">No pending invoices</p>
        </div>
      </div>
      <DialogFooter class="px-6 pb-6">
        <DialogClose as-child><Button variant="outline">Close</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ══ Patients: Overdue Dialog ════════════════════════════════════════════ -->
  <Dialog :open="activePatCard === 'overdue'" @update:open="v => { if (!v) activePatCard = null }">
    <DialogContent class="max-w-xl max-h-[85vh] overflow-y-auto p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b border-border/50">
        <DialogTitle class="text-lg font-bold">Overdue Invoices</DialogTitle>
      </DialogHeader>
      <div class="px-6 py-5 space-y-5">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Overdue Total</p>
            <p class="text-xl font-bold text-red-600 tabular-nums">{{ fmtCurrency(totalOverdue) }}</p>
          </div>
          <div class="bg-muted/30 rounded-lg p-3 text-center">
            <p class="text-xs text-muted-foreground mb-1">Overdue Invoices</p>
            <p class="text-xl font-bold text-foreground tabular-nums">{{ overdueInvoices.length }}</p>
          </div>
        </div>
        <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          <div v-for="r in overdueInvoices" :key="r.id" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors">
            <Avatar class="size-6 shrink-0">
              <AvatarFallback class="bg-red-100 text-red-600 text-[9px] font-bold">{{ r.patientInitials }}</AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ r.patient }}</p>
              <p class="text-xs text-muted-foreground">{{ fmtDate(r.date) }} · {{ r.doctorName }}</p>
            </div>
            <span class="text-sm font-semibold tabular-nums text-red-600">{{ fmtCurrency(r.amount) }}</span>
          </div>
          <p v-if="!overdueInvoices.length" class="text-sm text-muted-foreground text-center py-4">No overdue invoices</p>
        </div>
      </div>
      <DialogFooter class="px-6 pb-6">
        <DialogClose as-child><Button variant="outline">Close</Button></DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
