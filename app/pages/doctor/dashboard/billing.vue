<script setup lang="ts">
import {
  Download, Plus, Search, ChevronDown, Eye, EyeOff,
  Info, FileText, X, Check, Send, Printer, AlertCircle,
  ChevronsUpDown, ChevronUp, SlidersHorizontal, MoreHorizontal,
} from 'lucide-vue-next'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, LineElement, PointElement, LinearScale,
  CategoryScale, Filler, Tooltip,
} from 'chart.js'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '~/components/ui/dialog'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

definePageMeta({ layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────────────────────

type SessionStatus = 'completed' | 'scheduled' | 'cancelled' | 'no-show'
type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'waived'
type BillStatus    = 'draft' | 'sent' | 'paid' | 'overdue'
type Modality      = 'online' | 'inperson'

interface BillingRow {
  id: string
  date: string
  patient: string
  patientInitials: string
  professional: string
  type: string
  modality: Modality
  sessionStatus: SessionStatus
  paymentStatus: PaymentStatus
  amount: number
  clinicPct: number
  billStatus: BillStatus
  notes: string
  duration: number // minutes
}

// ── Seed data ──────────────────────────────────────────────────────────────

const rows = ref<BillingRow[]>([
  { id: 'B001', date: '2026-02-03', patient: 'Sofia Martinez',   patientInitials: 'SM', professional: 'Dr. Torres', type: 'Individual',  modality: 'online',   sessionStatus: 'completed', paymentStatus: 'paid',    amount: 85,  clinicPct: 20, billStatus: 'paid',    notes: 'Anxiety follow-up',         duration: 50 },
  { id: 'B002', date: '2026-02-05', patient: 'James Wilson',     patientInitials: 'JW', professional: 'Dr. Torres', type: 'Individual',  modality: 'inperson', sessionStatus: 'completed', paymentStatus: 'paid',    amount: 120, clinicPct: 25, billStatus: 'paid',    notes: 'Initial assessment',        duration: 60 },
  { id: 'B003', date: '2026-02-07', patient: 'Emma Thompson',    patientInitials: 'ET', professional: 'Dr. Torres', type: 'Individual',  modality: 'online',   sessionStatus: 'completed', paymentStatus: 'paid',    amount: 85,  clinicPct: 20, billStatus: 'paid',    notes: 'CBT session',               duration: 50 },
  { id: 'B004', date: '2026-02-10', patient: 'Carlos Rivera',    patientInitials: 'CR', professional: 'Dr. Torres', type: 'Individual',  modality: 'online',   sessionStatus: 'completed', paymentStatus: 'pending', amount: 85,  clinicPct: 20, billStatus: 'sent',    notes: 'Anxiety follow-up',         duration: 50 },
  { id: 'B005', date: '2026-02-12', patient: 'Aisha Patel',      patientInitials: 'AP', professional: 'Dr. Torres', type: 'Individual',  modality: 'inperson', sessionStatus: 'completed', paymentStatus: 'paid',    amount: 95,  clinicPct: 20, billStatus: 'paid',    notes: 'Trauma processing',         duration: 50 },
  { id: 'B006', date: '2026-02-12', patient: 'Hannah Kim',       patientInitials: 'HK', professional: 'Dr. Torres', type: 'Individual',  modality: 'inperson', sessionStatus: 'completed', paymentStatus: 'paid',    amount: 95,  clinicPct: 20, billStatus: 'paid',    notes: 'Sleep disorder consult',    duration: 60 },
  { id: 'B007', date: '2026-02-14', patient: 'Noah Chen',        patientInitials: 'NC', professional: 'Dr. Torres', type: 'Individual',  modality: 'online',   sessionStatus: 'no-show',   paymentStatus: 'pending', amount: 85,  clinicPct: 20, billStatus: 'draft',   notes: 'Mindfulness — no-show',     duration: 50 },
  { id: 'B008', date: '2026-02-17', patient: 'Sofia Martinez',   patientInitials: 'SM', professional: 'Dr. Torres', type: 'Individual',  modality: 'online',   sessionStatus: 'completed', paymentStatus: 'paid',    amount: 85,  clinicPct: 20, billStatus: 'paid',    notes: 'Weekly check-in',           duration: 50 },
  { id: 'B009', date: '2026-02-17', patient: 'James Wilson',     patientInitials: 'JW', professional: 'Dr. Torres', type: 'Individual',  modality: 'inperson', sessionStatus: 'completed', paymentStatus: 'pending', amount: 120, clinicPct: 25, billStatus: 'sent',    notes: 'Initial assessment #2',     duration: 60 },
  { id: 'B010', date: '2026-02-19', patient: 'Emma Thompson',    patientInitials: 'ET', professional: 'Dr. Torres', type: 'Individual',  modality: 'online',   sessionStatus: 'completed', paymentStatus: 'paid',    amount: 85,  clinicPct: 20, billStatus: 'paid',    notes: 'CBT session',               duration: 50 },
  { id: 'B011', date: '2026-02-19', patient: 'Hannah Kim',       patientInitials: 'HK', professional: 'Dr. Torres', type: 'Individual',  modality: 'inperson', sessionStatus: 'completed', paymentStatus: 'overdue', amount: 95,  clinicPct: 20, billStatus: 'overdue', notes: 'Sleep follow-up',           duration: 50 },
  { id: 'B012', date: '2026-02-20', patient: 'David Okafor',     patientInitials: 'DO', professional: 'Dr. Torres', type: 'Individual',  modality: 'online',   sessionStatus: 'no-show',   paymentStatus: 'waived',  amount: 85,  clinicPct: 20, billStatus: 'draft',   notes: 'Grief counseling — missed', duration: 50 },
  { id: 'B013', date: '2026-02-21', patient: 'Carlos Rivera',    patientInitials: 'CR', professional: 'Dr. Torres', type: 'Individual',  modality: 'online',   sessionStatus: 'scheduled', paymentStatus: 'pending', amount: 85,  clinicPct: 20, billStatus: 'draft',   notes: 'Anxiety follow-up',         duration: 50 },
  { id: 'B014', date: '2026-02-21', patient: 'Lucia Fernández',  patientInitials: 'LF', professional: 'Dr. Torres', type: 'Couples',     modality: 'inperson', sessionStatus: 'scheduled', paymentStatus: 'pending', amount: 150, clinicPct: 25, billStatus: 'draft',   notes: 'Couples therapy',           duration: 90 },
])

// ── Stats ──────────────────────────────────────────────────────────────────

const totalBilled  = computed(() => rows.value.reduce((s, r) => s + r.amount, 0))
const totalPaid    = computed(() => rows.value.filter(r => r.paymentStatus === 'paid').reduce((s, r) => s + r.amount, 0))
const totalPending = computed(() => rows.value.filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'overdue').reduce((s, r) => s + r.amount, 0))

const showValues = ref(true)

// Sparkline data (7 days trend mock)
const sparkDays = ['3', '5', '7', '10', '12', '14', '17', '19', '20', '21']
const sparklineBilled  = { labels: sparkDays, datasets: [{ data: [170, 120, 85, 85, 95, 85, 85, 180, 85, 235], fill: true, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.4 }] }
const sparklinePaid    = { labels: sparkDays, datasets: [{ data: [170, 120, 85, 0, 95, 0, 85, 85, 0, 0], fill: true, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.4 }] }
const sparklinePending = { labels: sparkDays, datasets: [{ data: [0, 0, 0, 85, 0, 85, 0, 95, 85, 235], fill: true, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.4 }] }
const sparklineOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, animation: false } as any

// ── Filters ────────────────────────────────────────────────────────────────

const dateFrom     = ref('2026-02-01')
const dateTo       = ref('2026-02-21')
const search       = ref('')
const patientFilter  = ref('all')
const typeFilter     = ref('all')
const statusFilter   = ref('all')

const patientFilter2Open = ref(false)
const typeFilter2Open    = ref(false)
const statusFilter2Open  = ref(false)

const uniquePatients = computed(() => [...new Set(rows.value.map(r => r.patient))].sort())
const uniqueTypes    = computed(() => [...new Set(rows.value.map(r => r.type))].sort())

// Columns visibility
const visibleCols = ref({
  id: true, date: true, patient: true, professional: false,
  type: true, sessionStatus: true, payment: true, amount: true,
  clinicPct: true, billStatus: true,
})
const colsOpen = ref(false)

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

const sessionStatusMeta: Record<SessionStatus, { label: string; classes: string }> = {
  completed: { label: 'Completed', classes: 'bg-green-50 text-green-700 ring-green-200' },
  scheduled: { label: 'Scheduled', classes: 'bg-blue-50 text-blue-700 ring-blue-200'   },
  cancelled: { label: 'Cancelled', classes: 'bg-red-50 text-red-600 ring-red-200'      },
  'no-show': { label: 'No-show',   classes: 'bg-amber-50 text-amber-700 ring-amber-200'},
}

const paymentStatusMeta: Record<PaymentStatus, { label: string; classes: string }> = {
  paid:    { label: 'Paid',    classes: 'bg-green-50 text-green-700 ring-green-200'  },
  pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 ring-amber-200' },
  overdue: { label: 'Overdue', classes: 'bg-red-50 text-red-600 ring-red-200'        },
  waived:  { label: 'Waived',  classes: 'bg-slate-50 text-slate-500 ring-slate-200' },
}

const billStatusMeta: Record<BillStatus, { label: string; classes: string }> = {
  draft:   { label: 'Draft',   classes: 'bg-slate-50 text-slate-500 ring-slate-200'  },
  sent:    { label: 'Sent',    classes: 'bg-blue-50 text-blue-600 ring-blue-200'      },
  paid:    { label: 'Paid',    classes: 'bg-green-50 text-green-700 ring-green-200'   },
  overdue: { label: 'Overdue', classes: 'bg-red-50 text-red-600 ring-red-200'         },
}

function fmtCurrency(n: number) { return `€${n.toFixed(2)}` }
function fmtDate(d: string) { return format(parseISO(d), 'MMM d, yyyy') }

const sortableCols: { key: SortKey; label: string }[] = [
  { key: 'id',            label: 'ID'              },
  { key: 'date',          label: 'Date'            },
  { key: 'patient',       label: 'Patient'         },
  { key: 'type',          label: 'Type'            },
  { key: 'sessionStatus', label: 'Session Status'  },
  { key: 'paymentStatus', label: 'Payment'         },
  { key: 'amount',        label: 'Amount'          },
  { key: 'billStatus',    label: 'Billing'         },
]

const clinicShare = computed(() => editorRow.value ? Math.round(editorRow.value.amount * editorRow.value.clinicPct / 100) : 0)
const therapistShare = computed(() => editorRow.value ? editorRow.value.amount - clinicShare.value : 0)
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-5 max-w-[1300px]">

      <!-- ── Page header ─────────────────────────────────────────────────── -->
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Billing & Sessions</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your sessions and billing for this month.</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap">
            <Download class="w-4 h-4" />
            Download All
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-sm whitespace-nowrap"
            @click="openConsolidated"
          >
            <Plus class="w-4 h-4" />
            Create Consolidated Bill
          </button>
        </div>
      </div>

      <!-- ── Summary cards ───────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="card in [
            { label: 'Total Billed (Month)', value: totalBilled, data: sparklineBilled, color: 'text-blue-600', accent: 'bg-blue-50' },
            { label: 'Paid',                 value: totalPaid,   data: sparklinePaid,   color: 'text-green-600', accent: 'bg-green-50' },
            { label: 'Pending',              value: totalPending, data: sparklinePending, color: 'text-orange-500', accent: 'bg-orange-50' },
          ]"
          :key="card.label"
          class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex gap-4"
        >
          <div class="flex-1 min-w-0">
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{{ card.label }}</p>
            <div class="flex items-center gap-2">
              <p :class="['text-2xl font-bold tabular-nums', card.color]">
                {{ showValues ? fmtCurrency(card.value) : '€ ···' }}
              </p>
              <button @click="showValues = !showValues">
                <component :is="showValues ? Eye : EyeOff" class="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
              </button>
            </div>
          </div>
          <!-- Sparkline -->
          <div class="w-24 h-12">
            <Line :data="card.data" :options="sparklineOpts" />
          </div>
        </div>
      </div>

      <!-- ── Filters ─────────────────────────────────────────────────────── -->
      <div class="space-y-2.5">
        <!-- Row 1: search + dropdowns + columns -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Search -->
          <div class="relative flex-1 min-w-[180px] max-w-xs">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input v-model="search" type="text" placeholder="Search patient..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>

          <!-- Patient filter -->
          <div class="relative">
            <button
              :class="['flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors', patientFilter !== 'all' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700']"
              @click.stop="patientFilter2Open = !patientFilter2Open"
            >
              {{ patientFilter === 'all' ? 'All Patients' : patientFilter }}
              <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
            </button>
            <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <div v-if="patientFilter2Open" class="absolute left-0 top-full mt-1.5 z-20 w-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden max-h-60 overflow-y-auto" @click.stop>
                <button class="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700" :class="patientFilter === 'all' ? 'text-indigo-700 dark:text-indigo-400 font-medium' : 'text-slate-700 dark:text-slate-300'" @click="patientFilter = 'all'; patientFilter2Open = false">All Patients</button>
                <button v-for="p in uniquePatients" :key="p" class="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700" :class="patientFilter === p ? 'text-indigo-700 dark:text-indigo-400 font-medium' : 'text-slate-700 dark:text-slate-300'" @click="patientFilter = p; patientFilter2Open = false">{{ p }}</button>
              </div>
            </Transition>
          </div>

          <!-- Type filter -->
          <div class="relative">
            <button
              :class="['flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors', typeFilter !== 'all' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700']"
              @click.stop="typeFilter2Open = !typeFilter2Open"
            >
              {{ typeFilter === 'all' ? 'All Types' : typeFilter }}
              <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
            </button>
            <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <div v-if="typeFilter2Open" class="absolute left-0 top-full mt-1.5 z-20 w-40 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden" @click.stop>
                <button class="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700" :class="typeFilter === 'all' ? 'text-indigo-700 dark:text-indigo-400 font-medium' : 'text-slate-700 dark:text-slate-300'" @click="typeFilter = 'all'; typeFilter2Open = false">All Types</button>
                <button v-for="t in uniqueTypes" :key="t" class="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700" :class="typeFilter === t ? 'text-indigo-700 dark:text-indigo-400 font-medium' : 'text-slate-700 dark:text-slate-300'" @click="typeFilter = t; typeFilter2Open = false">{{ t }}</button>
              </div>
            </Transition>
          </div>

          <!-- Status filter -->
          <div class="relative">
            <button
              :class="['flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors', statusFilter !== 'all' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700']"
              @click.stop="statusFilter2Open = !statusFilter2Open"
            >
              {{ statusFilter === 'all' ? 'All Statuses' : statusFilter }}
              <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
            </button>
            <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <div v-if="statusFilter2Open" class="absolute left-0 top-full mt-1.5 z-20 w-40 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden" @click.stop>
                <button v-for="s in ['all','paid','pending','overdue','completed','scheduled','no-show']" :key="s" class="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 capitalize" :class="statusFilter === s ? 'text-indigo-700 dark:text-indigo-400 font-medium' : 'text-slate-700 dark:text-slate-300'" @click="statusFilter = s; statusFilter2Open = false">
                  {{ s === 'all' ? 'All Statuses' : s }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Columns toggle -->
          <div class="relative ml-auto">
            <button class="flex items-center gap-1.5 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click.stop="colsOpen = !colsOpen">
              <SlidersHorizontal class="w-3.5 h-3.5" />
              Columns
            </button>
            <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <div v-if="colsOpen" class="absolute right-0 top-full mt-1.5 z-20 w-44 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden p-2" @click.stop>
                <label v-for="(val, key) in visibleCols" :key="key" class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                  <div :class="['w-4 h-4 rounded border-2 flex items-center justify-center transition-colors', visibleCols[key] ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300']" @click="visibleCols[key] = !visibleCols[key]">
                    <Check v-if="visibleCols[key]" class="w-2.5 h-2.5 text-white" />
                  </div>
                  <span class="text-sm text-slate-700 dark:text-slate-300 capitalize">{{ key === 'clinicPct' ? 'Clinic %' : key === 'billStatus' ? 'Billing' : key }}</span>
                </label>
              </div>
            </Transition>
          </div>

          <!-- Result count -->
          <p class="text-sm text-slate-400">{{ filtered.length }} sessions</p>
        </div>

        <!-- Row 2: date range -->
        <div class="flex flex-wrap items-center gap-2.5">
          <div class="flex items-center gap-2 text-sm text-slate-600">
            <label class="text-xs text-slate-500">From</label>
            <input v-model="dateFrom" type="date" class="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <label class="text-xs text-slate-500 dark:text-slate-400">To</label>
            <input v-model="dateTo" type="date" class="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <!-- Bulk actions -->
          <div v-if="selected.size > 0" class="flex items-center gap-2 ml-2">
            <span class="text-xs text-slate-500">{{ selected.size }} selected</span>
            <button class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" @click="openConsolidated">
              <FileText class="w-3.5 h-3.5" />
              Create Consolidated Bill
            </button>
            <button class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Download class="w-3.5 h-3.5" />
              Download Selected
            </button>
          </div>
        </div>
      </div>

      <!-- ── Table ───────────────────────────────────────────────────────── -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <Table class="min-w-[900px]">
            <TableHeader>
              <TableRow class="bg-slate-50/60 dark:bg-slate-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-700/50">
                <!-- Checkbox -->
                <TableHead class="w-10">
                  <div
                    :class="['w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors mx-auto', allSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-400']"
                    @click="toggleAll"
                  >
                    <Check v-if="allSelected" class="w-2.5 h-2.5 text-white" />
                  </div>
                </TableHead>

                <!-- Sortable columns -->
                <TableHead
                  v-for="col in sortableCols.filter(c => visibleCols[c.key as keyof typeof visibleCols] !== false)"
                  :key="col.key"
                  class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors select-none"
                  @click="toggleSort(col.key)"
                >
                  <div class="flex items-center gap-1">
                    {{ col.label }}
                    <!-- Clinic % tooltip -->
                    <span v-if="col.key === 'billStatus'" class="relative group">
                      <Info class="w-3 h-3 text-slate-400 hover:text-slate-600" />
                    </span>
                    <ChevronUp v-if="sortKey === col.key && sortDir === 'asc'" class="w-3.5 h-3.5 text-indigo-500" />
                    <ChevronDown v-else-if="sortKey === col.key && sortDir === 'desc'" class="w-3.5 h-3.5 text-indigo-500" />
                    <ChevronsUpDown v-else class="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </TableHead>
                <!-- Clinic % header with tooltip -->
                <TableHead v-if="visibleCols.clinicPct" class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  <div class="flex items-center gap-1 group relative">
                    Clinic %
                    <Info class="w-3 h-3 text-slate-400" />
                    <div class="absolute left-0 top-5 z-30 hidden group-hover:block w-52 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-lg leading-relaxed">
                      Revenue split between the clinic and the assigned professional. Configure in Settings → Billing.
                    </div>
                  </div>
                </TableHead>
                <!-- Actions -->
                <TableHead class="w-12" />
              </TableRow>
            </TableHeader>

            <TableBody>
              <!-- Empty state -->
              <TableRow v-if="filtered.length === 0">
                <TableCell :colspan="12" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <AlertCircle class="w-8 h-8 text-slate-300" />
                    <p class="text-sm text-slate-500">No sessions found matching your filters.</p>
                  </div>
                </TableCell>
              </TableRow>

              <!-- Data rows -->
              <TableRow
                v-for="row in filtered"
                :key="row.id"
                :class="['hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors cursor-pointer', selected.has(row.id) ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : '']"
                @click="openEditor(row)"
              >
                <!-- Checkbox -->
                <TableCell @click.stop>
                  <div
                    :class="['w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors mx-auto', selected.has(row.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-400']"
                    @click.stop="toggleRow(row.id)"
                  >
                    <Check v-if="selected.has(row.id)" class="w-2.5 h-2.5 text-white" />
                  </div>
                </TableCell>

                <TableCell v-if="visibleCols.id" class="font-mono text-xs text-slate-500 whitespace-nowrap">{{ row.id }}</TableCell>
                <TableCell v-if="visibleCols.date" class="whitespace-nowrap text-slate-600 dark:text-slate-300 text-sm">{{ fmtDate(row.date) }}</TableCell>
                <TableCell v-if="visibleCols.patient" class="whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <span class="text-indigo-700 text-[9px] font-bold">{{ row.patientInitials }}</span>
                    </div>
                    <span class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ row.patient }}</span>
                  </div>
                </TableCell>
                <TableCell v-if="visibleCols.professional" class="whitespace-nowrap text-sm text-slate-600">{{ row.professional }}</TableCell>
                <TableCell v-if="visibleCols.type" class="whitespace-nowrap text-sm text-slate-600">{{ row.type }}</TableCell>
                <TableCell v-if="visibleCols.sessionStatus" class="whitespace-nowrap">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1', sessionStatusMeta[row.sessionStatus].classes]">
                    {{ sessionStatusMeta[row.sessionStatus].label }}
                  </span>
                </TableCell>
                <TableCell v-if="visibleCols.payment" class="whitespace-nowrap">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1', paymentStatusMeta[row.paymentStatus].classes]">
                    {{ paymentStatusMeta[row.paymentStatus].label }}
                  </span>
                </TableCell>
                <TableCell v-if="visibleCols.amount" class="whitespace-nowrap font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                  {{ fmtCurrency(row.amount) }}
                </TableCell>
                <TableCell v-if="visibleCols.clinicPct" class="whitespace-nowrap text-sm text-slate-600 tabular-nums">
                  {{ row.clinicPct }}%
                </TableCell>
                <TableCell v-if="visibleCols.billStatus" class="whitespace-nowrap">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1', billStatusMeta[row.billStatus].classes]">
                    {{ billStatusMeta[row.billStatus].label }}
                  </span>
                </TableCell>

                <!-- Row actions -->
                <TableCell class="whitespace-nowrap" @click.stop>
                  <button class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" @click.stop="openEditor(row)">
                    <FileText class="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  </div>

  <!-- ══ Bill Editor Modal ══════════════════════════════════════════════════ -->
  <Dialog v-model:open="editorOpen">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
      <div v-if="editorRow">

        <!-- Modal header -->
        <DialogHeader class="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <div>
              <DialogTitle class="text-lg font-bold text-slate-900 dark:text-white">Bill {{ editorRow.id }}</DialogTitle>
              <div class="flex items-center gap-2 mt-1">
                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1', billStatusMeta[editorRow.billStatus].classes]">
                  {{ billStatusMeta[editorRow.billStatus].label }}
                </span>
                <span v-if="editorRow.id === 'CONSOLIDATED'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                  Consolidated · {{ selected.size }} sessions
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <!-- Bill preview (styled as a document) -->
        <div class="mx-6 my-5 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
          <!-- Clinic header -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <span class="text-white text-sm font-bold">N</span>
                </div>
                <span class="font-bold text-slate-800 dark:text-slate-100 text-lg">Noeia Clinic</span>
              </div>
              <p class="text-xs text-slate-500">Dr. Torres · Clinical Psychology</p>
              <p class="text-xs text-slate-500">colegiado@noeia.es</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</p>
              <p class="text-base font-bold text-slate-800">{{ editorRow.id }}</p>
              <p class="text-xs text-slate-500 mt-0.5">Date: {{ fmtDate(editorRow.date) }}</p>
              <p class="text-xs text-slate-500">Due: {{ fmtDate(editorRow.date) }}</p>
            </div>
          </div>

          <!-- Patient info -->
          <div class="mb-5 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Bill to</p>
            <input v-model="editorRow.patient" class="text-sm font-semibold text-slate-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded px-1 -mx-1 w-full" />
          </div>

          <!-- Line items -->
          <div class="mb-5">
            <div class="grid grid-cols-[1fr_80px_80px_80px] gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
              <span>Description</span><span class="text-right">Duration</span><span class="text-right">Type</span><span class="text-right">Amount</span>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
              <div class="grid grid-cols-[1fr_80px_80px_80px] gap-2 px-3 py-2.5 items-center">
                <div>
                  <input v-model="editorRow.notes" class="text-sm text-slate-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded px-1 -mx-1 w-full" />
                  <p class="text-xs text-slate-400 mt-0.5">{{ fmtDate(editorRow.date) }}</p>
                </div>
                <p class="text-sm text-slate-600 text-right">{{ editorRow.duration }}min</p>
                <p class="text-sm text-slate-600 text-right">{{ editorRow.type }}</p>
                <p class="text-sm font-semibold text-slate-800 text-right">{{ fmtCurrency(editorRow.amount) }}</p>
              </div>
            </div>
          </div>

          <!-- Revenue split + total -->
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span class="tabular-nums font-medium">{{ fmtCurrency(editorRow.amount) }}</span>
            </div>
            <div class="flex justify-between text-slate-500 dark:text-slate-500 text-xs">
              <span class="flex items-center gap-1">
                Clinic share ({{ editorRow.clinicPct }}%)
                <Info class="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </span>
              <span class="tabular-nums">−{{ fmtCurrency(clinicShare) }}</span>
            </div>
            <div class="flex justify-between text-slate-500 dark:text-slate-500 text-xs">
              <span>Your net revenue</span>
              <span class="tabular-nums text-green-600 dark:text-green-400 font-medium">{{ fmtCurrency(therapistShare) }}</span>
            </div>
            <div class="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-slate-900 dark:text-slate-100">
              <span>Total</span>
              <span class="tabular-nums">{{ fmtCurrency(editorRow.amount) }}</span>
            </div>
          </div>
        </div>

        <!-- Modal footer actions -->
        <div class="flex items-center justify-between px-6 pb-6 gap-3">
          <div class="flex items-center gap-2">
            <!-- Mark as paid -->
            <button
              v-if="!editorIsPaid"
              class="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              @click="markPaid"
            >
              <Check class="w-3.5 h-3.5" />
              Mark as Paid
            </button>
            <span v-else class="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <Check class="w-4 h-4" />
              Paid
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button class="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Send class="w-3.5 h-3.5 text-slate-400" />
              Send to patient
            </button>
            <button class="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Download class="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </div>

      </div>
    </DialogContent>
  </Dialog>
</template>
