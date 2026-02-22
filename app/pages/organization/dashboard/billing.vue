<script setup lang="ts">
import {
  Download, Plus, Search, ChevronDown, ChevronRight, Eye, EyeOff,
  Check, AlertCircle, MoreHorizontal, Clock, ExternalLink,
  ChevronsUpDown, ChevronUp, SlidersHorizontal, FileText, Send,
} from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
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
const doctorStatusOpen   = ref(false)
const doctorStatusMenuId = ref<string | null>(null)

const filteredDoctors = computed(() => {
  let list = [...doctorRows.value]
  if (doctorSearch.value.trim())         list = list.filter(d => d.name.toLowerCase().includes(doctorSearch.value.toLowerCase()))
  if (doctorStatusFilter.value !== 'all') list = list.filter(d => d.billStatus === doctorStatusFilter.value)
  return list
})

const drBillMeta: Record<DoctorRow['billStatus'], { label: string; classes: string }> = {
  billed:  { label: 'Billed',  classes: 'bg-amber-50 text-amber-700 ring-amber-200'    },
  pending: { label: 'Pending', classes: 'bg-orange-50 text-orange-600 ring-orange-200' },
  paid:    { label: 'Paid',    classes: 'bg-green-50 text-green-700 ring-green-200'    },
  draft:   { label: 'Draft',   classes: 'bg-slate-50 text-slate-500 ring-slate-200'    },
}

function setDrStatus(id: string, status: DoctorRow['billStatus']) {
  const d = doctorRows.value.find(r => r.id === id)
  if (d) d.billStatus = status
  doctorStatusMenuId.value = null
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

const sparkDays = ['1','3','5','8','10','12','15','18','19','22']
const sparkOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, animation: false } as any
const sparkBilled  = { labels: sparkDays, datasets: [{ data: [120,260,260,400,540,690,810,960,960,1110], fill: true, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.4 }] }
const sparkPaid    = { labels: sparkDays, datasets: [{ data: [120,120,120,260,260,410,530,530,650,770],   fill: true, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)',  borderWidth: 2, pointRadius: 0, tension: 0.4 }] }
const sparkPending = { labels: sparkDays, datasets: [{ data: [0,140,140,140,280,280,280,430,310,170],    fill: true, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', borderWidth: 2, pointRadius: 0, tension: 0.4 }] }
const sparkOverdue = { labels: sparkDays, datasets: [{ data: [0,0,0,0,0,0,0,160,160,300],               fill: true, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)',  borderWidth: 2, pointRadius: 0, tension: 0.4 }] }

const invoiceSearch       = ref('')
const invoiceDoctorFilter = ref('all')
const invoiceStatusFilter = ref('all')
const invoiceDateFrom     = ref('2025-08-19')
const invoiceDateTo       = ref('2026-02-22')
const invoiceDoctorOpen   = ref(false)
const invoiceStatusOpen   = ref(false)
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
  'Individual': 'bg-slate-50 text-slate-600 ring-slate-200',
}

const invBillingMeta: Record<InvStatus, { label: string; classes: string; icon: string }> = {
  paid:    { label: 'Paid',    classes: 'bg-green-50 text-green-700 ring-green-200',   icon: 'check'   },
  pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 ring-amber-200',  icon: 'clock'   },
  overdue: { label: 'Overdue', classes: 'bg-red-50 text-red-600 ring-red-200',        icon: 'warning' },
}

// Invoice editor modal
const editorOpen = ref(false)
const editorRow  = ref<InvoiceRow | null>(null)
function openInvoice(row: InvoiceRow) { editorRow.value = { ...row }; editorOpen.value = true }

// Close all dropdowns on outside click
function closeAllDropdowns() {
  doctorStatusOpen.value   = false
  doctorStatusMenuId.value = null
  invoiceDoctorOpen.value  = false
  invoiceStatusOpen.value  = false
}
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0" @click="closeAllDropdowns">
    <div class="p-4 sm:p-6 space-y-5 max-w-[1300px]">

      <!-- ── Page header ───────────────────────────────────────────────── -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Billing & Invoices</h1>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            <Download class="w-4 h-4" />
            Export
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus class="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <!-- ── Tabs ─────────────────────────────────────────────────────── -->
      <div class="flex gap-1 border-b border-slate-200 dark:border-slate-700 -mb-1">
        <button
          v-for="tab in [{ key: 'doctors', label: 'Doctors' }, { key: 'patients', label: 'Patients' }]"
          :key="tab.key"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === tab.key
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
          ]"
          @click.stop="activeTab = (tab.key as 'doctors' | 'patients')"
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
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">Total Commission (YTD)</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{{ fmtCurrency(totalCommissionYTD) }}</p>
            <p class="text-xs text-green-600 dark:text-green-400 mt-1.5">+5.4% from last month</p>
          </div>

          <!-- Pending Bills -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending Bills</p>
              <Clock class="w-4 h-4 text-orange-400" />
            </div>
            <p class="text-3xl font-bold text-orange-500 tabular-nums">{{ fmtCurrency(pendingBillsTotal) }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Owed by {{ pendingDoctorCount }} {{ pendingDoctorCount === 1 ? 'doctor' : 'doctors' }}</p>
          </div>

          <!-- Session Volume -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">Session Volume</p>
            <p class="text-3xl font-bold text-blue-600 tabular-nums">{{ fmtCurrency(sessionVolumeTotal) }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Total value of services</p>
          </div>

        </div>

        <!-- Filters -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <div class="relative flex-1 min-w-[220px] max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input v-model="doctorSearch" type="text" placeholder="Filter doctors..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- Status filter -->
          <div class="relative" @click.stop>
            <button :class="['flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors', doctorStatusFilter !== 'all' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50']" @click="doctorStatusOpen = !doctorStatusOpen">
              {{ doctorStatusFilter === 'all' ? 'All Statuses' : drBillMeta[doctorStatusFilter as DoctorRow['billStatus']]?.label ?? doctorStatusFilter }}
              <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
            </button>
            <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <div v-if="doctorStatusOpen" class="absolute left-0 top-full mt-1.5 z-20 w-40 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                <button v-for="s in ['all', 'billed', 'pending', 'paid', 'draft']" :key="s" class="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 capitalize" :class="doctorStatusFilter === s ? 'text-indigo-700 font-medium' : 'text-slate-700 dark:text-slate-300'" @click="doctorStatusFilter = s; doctorStatusOpen = false">
                  {{ s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1) }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Date range -->
          <div class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <div class="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span class="text-slate-400 text-xs">📅</span>
              <input v-model="doctorDateFrom" type="date" class="text-sm bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none" />
            </div>
            <span class="text-slate-400">–</span>
            <div class="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span class="text-slate-400 text-xs">📅</span>
              <input v-model="doctorDateTo" type="date" class="text-sm bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none" />
            </div>
          </div>
        </div>

        <!-- Doctors table -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[700px] text-sm">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-700/40">
                  <th class="w-10" />
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Doctor</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Volume</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Commission ({{ filteredDoctors[0]?.commissionPct ?? 30 }}%)</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bill Status</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="doc in filteredDoctors" :key="doc.id">
                  <!-- Doctor summary row -->
                  <tr
                    class="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                    @click.stop="toggleExpand(doc.id)"
                  >
                    <td class="pl-4 py-3.5">
                      <component
                        :is="expandedDoctors.has(doc.id) ? ChevronDown : ChevronRight"
                        class="w-4 h-4 text-slate-400 transition-transform"
                      />
                    </td>
                    <td class="px-4 py-3.5">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                          <span class="text-indigo-700 dark:text-indigo-300 text-xs font-bold">{{ doc.initials }}</span>
                        </div>
                        <div>
                          <p class="font-semibold text-slate-800 dark:text-slate-100">{{ doc.name }}</p>
                          <p class="text-xs text-slate-400 dark:text-slate-500">{{ doc.sessions.length }} sessions</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{{ fmtCurrency(drVolume(doc)) }}</td>
                    <td class="px-4 py-3.5 text-right font-semibold text-slate-800 dark:text-slate-100 tabular-nums">{{ fmtCurrency(drCommission(doc)) }}</td>
                    <td class="px-4 py-3.5" @click.stop>
                      <div class="relative inline-block">
                        <button
                          :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 transition-colors', drBillMeta[doc.billStatus].classes]"
                          @click.stop="doctorStatusMenuId = doctorStatusMenuId === doc.id ? null : doc.id"
                        >
                          {{ drBillMeta[doc.billStatus].label }}
                          <ChevronDown class="w-3 h-3" />
                        </button>
                        <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                          <div v-if="doctorStatusMenuId === doc.id" class="absolute left-0 top-full mt-1.5 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                            <button v-for="s in (['billed','pending','paid','draft'] as DoctorRow['billStatus'][])" :key="s" class="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700" :class="doc.billStatus === s ? 'text-indigo-700 font-medium' : 'text-slate-700 dark:text-slate-300'" @click.stop="setDrStatus(doc.id, s)">
                              {{ drBillMeta[s].label }}
                            </button>
                          </div>
                        </Transition>
                      </div>
                    </td>
                    <td class="px-4 py-3.5 text-right" @click.stop>
                      <button class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <MoreHorizontal class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  <!-- Expanded sub-table -->
                  <tr v-if="expandedDoctors.has(doc.id)" :key="`${doc.id}-expanded`">
                    <td colspan="6" class="bg-slate-50/70 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700 px-0 py-0">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="border-b border-slate-200 dark:border-slate-700/50">
                            <th class="pl-14 pr-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                            <th class="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                            <th class="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Session Fee</th>
                            <th class="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Extras</th>
                            <th class="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Commission ({{ doc.commissionPct }}%)</th>
                            <th class="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="sess in doc.sessions" :key="sess.id">
                            <!-- Session row -->
                            <tr class="border-b border-slate-100 dark:border-slate-700/40 hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                              <td class="pl-14 pr-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ fmtDate(sess.date) }}</td>
                              <td class="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{{ sess.patient }}</td>
                              <td class="px-4 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">{{ fmtCurrency(sess.sessionFee) }}</td>
                              <td class="px-4 py-2.5 text-right tabular-nums text-slate-400">{{ sess.extras ? fmtCurrency(sess.extras) : '–' }}</td>
                              <td class="px-4 py-2.5 text-right tabular-nums font-medium text-slate-700 dark:text-slate-200">{{ fmtCurrency(sessComm(sess.sessionFee, doc.commissionPct)) }}</td>
                              <td class="px-4 py-2.5 text-right">
                                <button class="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium">
                                  Session
                                  <ExternalLink class="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                            <!-- Documentation sub-row -->
                            <tr v-if="sess.docFee" :key="`${sess.id}-doc`" class="border-b border-slate-100 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-900/20">
                              <td class="pl-14 pr-4 py-2" />
                              <td class="px-4 py-2">
                                <div class="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-sm">
                                  <span class="text-slate-300 dark:text-slate-600 text-base leading-none">└</span>
                                  Documentation
                                </div>
                              </td>
                              <td class="px-4 py-2 text-right tabular-nums text-slate-400 dark:text-slate-500 text-sm">{{ fmtCurrency(sess.docFee) }}</td>
                              <td class="px-4 py-2 text-right text-slate-400 text-sm">–</td>
                              <td class="px-4 py-2 text-right tabular-nums text-slate-500 dark:text-slate-400 text-sm">{{ fmtCurrency(sessComm(sess.docFee, doc.commissionPct)) }}</td>
                              <td class="px-4 py-2 text-right">
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">Doc</span>
                              </td>
                            </tr>
                          </template>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </template>

                <tr v-if="filteredDoctors.length === 0">
                  <td colspan="6" class="py-16 text-center">
                    <div class="flex flex-col items-center gap-2">
                      <AlertCircle class="w-8 h-8 text-slate-300" />
                      <p class="text-sm text-slate-500">No doctors match your filters.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
              { label: 'Total Billed', value: totalBilled,  data: sparkBilled,  color: 'text-blue-600'   },
              { label: 'Paid',         value: totalPaid,    data: sparkPaid,    color: 'text-green-600'  },
              { label: 'Pending',      value: totalPending, data: sparkPending, color: 'text-orange-500' },
              { label: 'Overdue',      value: totalOverdue, data: sparkOverdue, color: 'text-red-500'    },
            ]"
            :key="card.label"
            class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col gap-1"
          >
            <div class="flex items-center justify-between">
              <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ card.label }}</p>
              <div class="flex items-center gap-1.5">
                <button @click="showValues = !showValues">
                  <component :is="showValues ? Eye : EyeOff" class="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 transition-colors" />
                </button>
              </div>
            </div>
            <p :class="['text-2xl font-bold tabular-nums', card.color]">
              {{ showValues ? fmtCurrency(card.value) : '€ ···' }}
            </p>
            <div class="h-10 mt-1">
              <Line :data="card.data" :options="sparkOpts" />
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Search -->
          <div class="relative min-w-[200px] max-w-xs flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input v-model="invoiceSearch" type="text" placeholder="Filter invoices..." class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- All Doctors -->
          <div class="relative" @click.stop>
            <button :class="['flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors', invoiceDoctorFilter !== 'all' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50']" @click="invoiceDoctorOpen = !invoiceDoctorOpen; invoiceStatusOpen = false">
              {{ invoiceDoctorFilter === 'all' ? 'All Doctors' : invoiceDoctorFilter }}
              <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
            </button>
            <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <div v-if="invoiceDoctorOpen" class="absolute left-0 top-full mt-1.5 z-20 w-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                <button class="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700" :class="invoiceDoctorFilter === 'all' ? 'text-indigo-700 font-medium' : 'text-slate-700 dark:text-slate-300'" @click="invoiceDoctorFilter = 'all'; invoiceDoctorOpen = false">All Doctors</button>
                <button v-for="d in uniqueDoctors" :key="d" class="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700" :class="invoiceDoctorFilter === d ? 'text-indigo-700 font-medium' : 'text-slate-700 dark:text-slate-300'" @click="invoiceDoctorFilter = d; invoiceDoctorOpen = false">{{ d }}</button>
              </div>
            </Transition>
          </div>

          <!-- All Statuses -->
          <div class="relative" @click.stop>
            <button :class="['flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors', invoiceStatusFilter !== 'all' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50']" @click="invoiceStatusOpen = !invoiceStatusOpen; invoiceDoctorOpen = false">
              {{ invoiceStatusFilter === 'all' ? 'All Statuses' : invoiceStatusFilter.charAt(0).toUpperCase() + invoiceStatusFilter.slice(1) }}
              <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
            </button>
            <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <div v-if="invoiceStatusOpen" class="absolute left-0 top-full mt-1.5 z-20 w-40 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                <button v-for="s in ['all','paid','pending','overdue']" :key="s" class="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 capitalize" :class="invoiceStatusFilter === s ? 'text-indigo-700 font-medium' : 'text-slate-700 dark:text-slate-300'" @click="invoiceStatusFilter = s; invoiceStatusOpen = false">
                  {{ s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1) }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Date range -->
          <div class="flex items-center gap-1.5">
            <div class="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span class="text-slate-400 text-xs">📅</span>
              <input v-model="invoiceDateFrom" type="date" class="text-sm bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none" />
            </div>
            <span class="text-slate-400 text-sm">–</span>
            <div class="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span class="text-slate-400 text-xs">📅</span>
              <input v-model="invoiceDateTo" type="date" class="text-sm bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none" />
            </div>
          </div>

          <!-- Columns button (cosmetic) -->
          <button class="flex items-center gap-1.5 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ml-auto">
            <SlidersHorizontal class="w-3.5 h-3.5" />
            Columns
          </button>
        </div>

        <!-- Invoices table -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <Table class="min-w-[960px]">
              <TableHeader>
                <TableRow class="bg-slate-50/60 dark:bg-slate-700/40 hover:bg-slate-50/60 dark:hover:bg-slate-700/40">
                  <TableHead class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Invoice ID</TableHead>
                  <TableHead class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Date</TableHead>
                  <TableHead class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Patient</TableHead>
                  <TableHead class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Professional</TableHead>
                  <TableHead class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Type</TableHead>
                  <TableHead class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Session Status</TableHead>
                  <TableHead class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Payment</TableHead>
                  <TableHead class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap text-right">Amount</TableHead>
                  <TableHead class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Billing Status</TableHead>
                  <TableHead class="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="filteredInvoices.length === 0">
                  <TableCell :colspan="10" class="py-16 text-center">
                    <div class="flex flex-col items-center gap-2">
                      <AlertCircle class="w-8 h-8 text-slate-300" />
                      <p class="text-sm text-slate-500">No invoices match your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow
                  v-for="row in filteredInvoices"
                  :key="row.id"
                  class="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                  @click="openInvoice(row)"
                >
                  <!-- Invoice ID -->
                  <TableCell class="font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ row.id }}</TableCell>

                  <!-- Date -->
                  <TableCell class="whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{{ fmtDate(row.date) }}</TableCell>

                  <!-- Patient -->
                  <TableCell class="whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                        <span class="text-indigo-700 dark:text-indigo-300 text-[9px] font-bold">{{ row.patientInitials }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ row.patient }}</p>
                        <p v-if="row.documentationIncluded" class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <span class="text-slate-300 dark:text-slate-600 leading-none">└</span>
                          Documentation included
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <!-- Professional -->
                  <TableCell class="whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                      <div class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
                        <span class="text-slate-600 dark:text-slate-300 text-[8px] font-bold">{{ row.doctorInitials }}</span>
                      </div>
                      <span class="text-sm text-slate-600 dark:text-slate-300">{{ row.doctorName }}</span>
                    </div>
                  </TableCell>

                  <!-- Type badge -->
                  <TableCell class="whitespace-nowrap">
                    <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1', typeMeta[row.type] ?? 'bg-slate-50 text-slate-500 ring-slate-200']">{{ row.type }}</span>
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
                    <span v-else class="text-xs text-slate-400">–</span>
                  </TableCell>

                  <!-- Payment -->
                  <TableCell class="whitespace-nowrap">
                    <div v-if="row.paymentMethod" class="text-sm">
                      <p class="font-medium text-slate-700 dark:text-slate-200">{{ row.paymentMethod }}</p>
                      <p class="text-xs text-slate-400 dark:text-slate-500">{{ fmtDate(row.paymentDate!) }}</p>
                    </div>
                    <span v-else class="text-sm text-slate-400">–</span>
                  </TableCell>

                  <!-- Amount -->
                  <TableCell class="text-right tabular-nums font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                    <span class="text-xs text-slate-400 mr-0.5">€</span>{{ row.amount }}
                  </TableCell>

                  <!-- Billing Status -->
                  <TableCell class="whitespace-nowrap">
                    <span :class="['inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1', invBillingMeta[row.billingStatus].classes]">
                      <Check v-if="row.billingStatus === 'paid'" class="w-3 h-3" />
                      <Clock v-else-if="row.billingStatus === 'pending'" class="w-3 h-3" />
                      <AlertCircle v-else class="w-3 h-3" />
                      {{ invBillingMeta[row.billingStatus].label }}
                    </span>
                  </TableCell>

                  <!-- Actions -->
                  <TableCell @click.stop>
                    <button class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <MoreHorizontal class="w-4 h-4" />
                    </button>
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
        <DialogHeader class="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <div>
              <DialogTitle class="text-lg font-bold text-slate-900 dark:text-white">{{ editorRow.id }}</DialogTitle>
              <div class="flex items-center gap-2 mt-1">
                <span :class="['inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1', invBillingMeta[editorRow.billingStatus].classes]">
                  <Check v-if="editorRow.billingStatus === 'paid'" class="w-3 h-3" />
                  <Clock v-else-if="editorRow.billingStatus === 'pending'" class="w-3 h-3" />
                  <AlertCircle v-else class="w-3 h-3" />
                  {{ invBillingMeta[editorRow.billingStatus].label }}
                </span>
                <span v-if="editorRow.documentationIncluded" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-600">
                  + Documentation
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div class="px-6 py-5 space-y-4">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
              <p class="text-xs text-slate-400 mb-1">Patient</p>
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span class="text-indigo-700 text-[9px] font-bold">{{ editorRow.patientInitials }}</span>
                </div>
                <span class="font-medium text-slate-800 dark:text-slate-100">{{ editorRow.patient }}</span>
              </div>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
              <p class="text-xs text-slate-400 mb-1">Professional</p>
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ editorRow.doctorName }}</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
              <p class="text-xs text-slate-400 mb-1">Date</p>
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ fmtDate(editorRow.date) }}</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
              <p class="text-xs text-slate-400 mb-1">Session type</p>
              <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1', typeMeta[editorRow.type] ?? 'bg-slate-50 text-slate-500 ring-slate-200']">{{ editorRow.type }}</span>
            </div>
          </div>

          <div class="border border-slate-100 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700">
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-sm text-slate-600 dark:text-slate-300">Session fee</span>
              <span class="text-sm font-semibold text-slate-800 dark:text-slate-100 tabular-nums">{{ fmtCurrency(editorRow.amount) }}</span>
            </div>
            <div v-if="editorRow.documentationIncluded" class="flex items-center justify-between px-4 py-3">
              <span class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span class="text-slate-300 dark:text-slate-600 text-base leading-none">└</span>
                Documentation
              </span>
              <span class="text-sm text-slate-500 dark:text-slate-400 tabular-nums">€50.00</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-sm font-bold text-slate-800 dark:text-slate-100">Total</span>
              <span class="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{{ fmtCurrency(editorRow.amount + (editorRow.documentationIncluded ? 50 : 0)) }}</span>
            </div>
          </div>

          <div v-if="editorRow.paymentMethod" class="text-sm text-slate-500 dark:text-slate-400">
            Paid via <strong class="text-slate-700 dark:text-slate-200">{{ editorRow.paymentMethod }}</strong> on {{ fmtDate(editorRow.paymentDate!) }}
          </div>
        </div>

        <div class="flex items-center justify-between px-6 pb-6 gap-3">
          <button
            v-if="editorRow.billingStatus !== 'paid'"
            class="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            @click="editorRow && (editorRow.billingStatus = 'paid'); editorOpen = false"
          >
            <Check class="w-3.5 h-3.5" />
            Mark as Paid
          </button>
          <span v-else class="flex items-center gap-1.5 text-sm font-medium text-green-600">
            <Check class="w-4 h-4" />
            Paid
          </span>
          <div class="flex items-center gap-2">
            <button class="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              <Send class="w-3.5 h-3.5 text-slate-400" />
              Send
            </button>
            <button class="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Download class="w-3.5 h-3.5" />
              PDF
            </button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
