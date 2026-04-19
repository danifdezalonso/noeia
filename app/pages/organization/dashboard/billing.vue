<script setup lang="ts">
import {
  Plus, Search, Download, ChevronDown, ChevronRight,
  SlidersHorizontal, Euro, AlertCircle,
} from 'lucide-vue-next'
import { Button }   from '~/components/ui/button'
import { Input }    from '~/components/ui/input'
import { Badge }    from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table'
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '~/components/ui/collapsible'
import {
  TooltipProvider, Tooltip, TooltipTrigger, TooltipContent,
} from '~/components/ui/tooltip'
import BillingInvoiceDetailDialog from '~/components/billing/InvoiceDetailDialog.vue'
import BillingInvoiceRow from '~/components/billing/InvoiceRow.vue'
import type { Invoice } from '~/utils/billingMock'
import {
  MOCK_INVOICES, fmtEUR, fmtDateES, STATUS_LABEL, SESSION_LABEL,
} from '~/utils/billingMock'

definePageMeta({ layout: 'dashboard' })

// ── All invoices (reactive so mark-paid/cancel work) ─────────────────────────

const allInvoices = ref<Invoice[]>([...MOCK_INVOICES].sort((a, b) => b.issueDate.localeCompare(a.issueDate)))

// ── Date range ────────────────────────────────────────────────────────────────

const datePreset = ref('este-mes')
const DATE_PRESETS = [
  { value: 'este-mes',    label: 'Este mes' },
  { value: 'ultimo-mes',  label: 'Último mes' },
  { value: 'tres-meses',  label: 'Últimos 3 meses' },
  { value: 'este-ano',    label: 'Este año' },
  { value: 'todo',        label: 'Todo el período' },
]

function invoiceInRange(inv: Invoice) {
  const now = new Date()
  const d   = new Date(inv.issueDate)
  if (datePreset.value === 'este-mes')   return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  if (datePreset.value === 'ultimo-mes') { const lm = new Date(now.getFullYear(), now.getMonth() - 1); return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth() }
  if (datePreset.value === 'tres-meses') return d >= new Date(now.getFullYear(), now.getMonth() - 3)
  if (datePreset.value === 'este-ano')   return d.getFullYear() === now.getFullYear()
  return true
}

// ── Filters ───────────────────────────────────────────────────────────────────

const search       = ref('')
const filterDoctor = ref('todos')
const filterStatus = ref('todos')
const filterType   = ref('todos')

const DOCTORS   = [...new Set(MOCK_INVOICES.map(i => i.doctorName))]
const STATUSES  = [
  { value: 'todos',     label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'pagada',    label: 'Pagadas' },
  { value: 'vencida',   label: 'Vencidas' },
  { value: 'anulada',   label: 'Anuladas' },
]
const TYPES = [
  { value: 'todos',      label: 'Todos los tipos' },
  { value: 'individual', label: 'Individual' },
  { value: 'pareja',     label: 'Pareja' },
  { value: 'familia',    label: 'Familia' },
  { value: 'grupo',      label: 'Grupo' },
  { value: 'infantil',   label: 'Infantil' },
]

const periodInvoices = computed(() => allInvoices.value.filter(invoiceInRange))

const filteredInvoices = computed(() => {
  let list = periodInvoices.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(i =>
      i.patientName.toLowerCase().includes(q) ||
      i.number.toLowerCase().includes(q) ||
      i.doctorName.toLowerCase().includes(q)
    )
  }
  if (filterDoctor.value !== 'todos') list = list.filter(i => i.doctorName === filterDoctor.value)
  if (filterStatus.value !== 'todos') list = list.filter(i => i.status === filterStatus.value)
  if (filterType.value   !== 'todos') list = list.filter(i => i.sessionType === filterType.value)
  return list
})

// ── Stats (on filtered period) ────────────────────────────────────────────────

const statFaturado  = computed(() => periodInvoices.value.filter(i => i.status !== 'anulada').reduce((s, i) => s + i.amount, 0))
const statCobrado   = computed(() => periodInvoices.value.filter(i => i.status === 'pagada').reduce((s, i) => s + i.amountPaid, 0))
const statPendiente = computed(() => periodInvoices.value.filter(i => i.status === 'pendiente' || i.status === 'vencida').reduce((s, i) => s + i.amount, 0))
const statVencidas  = computed(() => periodInvoices.value.filter(i => i.status === 'vencida').length)

// ── Pagination ────────────────────────────────────────────────────────────────

const PAGE_SIZE   = 10
const currentPage = ref(1)

watch(filteredInvoices, () => { currentPage.value = 1 })

const totalPages  = computed(() => Math.max(1, Math.ceil(filteredInvoices.value.length / PAGE_SIZE)))
const pageInvoices = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredInvoices.value.slice(start, start + PAGE_SIZE)
})

// ── Invoice detail dialog ─────────────────────────────────────────────────────

const selectedInvoice = ref<Invoice | null>(null)
const detailOpen      = ref(false)

function viewInvoice(inv: Invoice) {
  selectedInvoice.value = inv
  detailOpen.value = true
}

function markPaid(id: string) {
  const inv = allInvoices.value.find(i => i.id === id)
  if (inv) { inv.status = 'pagada'; inv.amountPaid = inv.amount; inv.paymentMethod = 'tarjeta' }
}

function cancelInvoice(id: string) {
  const inv = allInvoices.value.find(i => i.id === id)
  if (inv) inv.status = 'anulada'
}

// ── Doctor summary (collapsible) ──────────────────────────────────────────────

interface DoctorSummary {
  doctorName: string
  total: number
  cobrado: number
  pendiente: number
  sessions: number
}

const doctorSummaries = computed<DoctorSummary[]>(() =>
  DOCTORS.map(doc => {
    const invs = periodInvoices.value.filter(i => i.doctorName === doc && i.status !== 'anulada')
    return {
      doctorName: doc,
      total:     invs.reduce((s, i) => s + i.amount, 0),
      cobrado:   invs.filter(i => i.status === 'pagada').reduce((s, i) => s + i.amountPaid, 0),
      pendiente: invs.filter(i => i.status === 'pendiente' || i.status === 'vencida').reduce((s, i) => s + i.amount, 0),
      sessions:  invs.length,
    }
  })
)

const expandedDoctors = ref<Set<string>>(new Set())
function toggleDoctor(name: string) {
  const s = new Set(expandedDoctors.value)
  s.has(name) ? s.delete(name) : s.add(name)
  expandedDoctors.value = s
}
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-6 max-w-[1200px]">

      <!-- ── Page header ────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-bold text-foreground tracking-tight">Facturación</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Gestión de facturas y cobros de la organización</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm" class="gap-1.5 text-xs opacity-60 cursor-not-allowed" disabled>
                  <Download class="w-3.5 h-3.5" /> Exportar CSV
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p class="text-xs">Exporta las facturas filtradas en formato CSV</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button size="sm" class="gap-1.5 text-xs">
            <Plus class="w-3.5 h-3.5" /> Nueva factura
          </Button>
        </div>
      </div>

      <!-- ── Date preset picker ─────────────────────────────────────────────── -->
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="p in DATE_PRESETS"
          :key="p.value"
          class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
          :class="datePreset === p.value
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30'"
          @click="datePreset = p.value"
        >
          {{ p.label }}
        </button>
      </div>

      <!-- ── Stats pills ──────────────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="rounded-xl border border-border px-4 py-3 bg-background">
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total facturado</p>
          <p class="text-xl font-bold text-foreground tabular-nums">{{ fmtEUR(statFaturado) }}</p>
        </div>
        <div class="rounded-xl border border-border px-4 py-3 bg-background">
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total cobrado</p>
          <p class="text-xl font-bold text-emerald-600 tabular-nums">{{ fmtEUR(statCobrado) }}</p>
        </div>
        <div class="rounded-xl border border-border px-4 py-3 bg-background">
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pendiente de cobro</p>
          <p class="text-xl font-bold tabular-nums" :class="statPendiente > 0 ? 'text-amber-600' : 'text-foreground'">{{ fmtEUR(statPendiente) }}</p>
        </div>
        <div class="rounded-xl border px-4 py-3 bg-background" :class="statVencidas > 0 ? 'border-rose-200 bg-rose-50/40' : 'border-border'">
          <p class="text-[10px] font-semibold uppercase tracking-wider mb-1" :class="statVencidas > 0 ? 'text-rose-500' : 'text-muted-foreground'">Facturas vencidas</p>
          <p class="text-xl font-bold tabular-nums" :class="statVencidas > 0 ? 'text-rose-600' : 'text-foreground'">{{ statVencidas }}</p>
        </div>
      </div>

      <!-- ── Filters bar ────────────────────────────────────────────────────── -->
      <div class="flex items-center gap-2 flex-wrap">
        <div class="relative flex-1 min-w-[200px] max-w-xs">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input v-model="search" placeholder="Buscar por paciente o nº factura..." class="pl-9 h-8 text-sm" />
        </div>
        <Select v-model="filterDoctor">
          <SelectTrigger class="h-8 text-xs w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los profesionales</SelectItem>
            <SelectItem v-for="d in DOCTORS" :key="d" :value="d">{{ d }}</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="filterStatus">
          <SelectTrigger class="h-8 text-xs w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="filterType">
          <SelectTrigger class="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="t in TYPES" :key="t.value" :value="t.value">{{ t.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- ── Invoices table ─────────────────────────────────────────────────── -->
      <div class="rounded-xl border border-border overflow-hidden">
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent bg-muted/30">
                <TableHead class="text-xs">Nº Factura</TableHead>
                <TableHead class="text-xs">Fecha</TableHead>
                <TableHead class="text-xs">Paciente</TableHead>
                <TableHead class="text-xs">Profesional</TableHead>
                <TableHead class="text-xs">Tipo</TableHead>
                <TableHead class="text-xs hidden sm:table-cell">Concepto</TableHead>
                <TableHead class="text-xs text-right">Importe</TableHead>
                <TableHead class="text-xs">Estado</TableHead>
                <TableHead class="text-xs text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <BillingInvoiceRow
                v-for="inv in pageInvoices"
                :key="inv.id"
                :invoice="inv"
                :show-patient="true"
                @view="viewInvoice"
                @mark-paid="markPaid"
                @cancel="cancelInvoice"
              />
              <TableRow v-if="pageInvoices.length === 0">
                <TableCell colspan="9" class="text-center text-sm text-muted-foreground py-12">
                  No se encontraron facturas con los filtros aplicados
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <p class="text-xs text-muted-foreground">
            {{ (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filteredInvoices.length) }}
            de {{ filteredInvoices.length }} facturas
          </p>
          <div class="flex items-center gap-1">
            <Button
              variant="outline" size="sm" class="text-xs h-7 px-2.5"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >Anterior</Button>
            <span class="px-2 text-xs text-muted-foreground">{{ currentPage }} / {{ totalPages }}</span>
            <Button
              variant="outline" size="sm" class="text-xs h-7 px-2.5"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >Siguiente</Button>
          </div>
        </div>
      </div>

      <!-- ── Invoice detail dialog ──────────────────────────────────────────── -->
      <BillingInvoiceDetailDialog
        :invoice="selectedInvoice"
        :open="detailOpen"
        @update:open="detailOpen = $event"
      />

      <!-- ── Summary by doctor ──────────────────────────────────────────────── -->
      <div>
        <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resumen por profesional</h2>
        <div class="rounded-xl border border-border overflow-hidden divide-y divide-border">
          <Collapsible
            v-for="doc in doctorSummaries"
            :key="doc.doctorName"
            :open="expandedDoctors.has(doc.doctorName)"
            @update:open="toggleDoctor(doc.doctorName)"
          >
            <CollapsibleTrigger as-child>
              <button class="w-full flex items-center gap-4 px-5 py-3.5 bg-background hover:bg-muted/30 transition-colors text-left">
                <component
                  :is="expandedDoctors.has(doc.doctorName) ? ChevronDown : ChevronRight"
                  class="w-4 h-4 text-muted-foreground shrink-0"
                />
                <span class="flex-1 text-sm font-medium text-foreground">{{ doc.doctorName }}</span>
                <div class="flex items-center gap-6 text-xs tabular-nums shrink-0">
                  <span class="text-muted-foreground">
                    <span class="text-foreground font-semibold">{{ fmtEUR(doc.total) }}</span> facturado
                  </span>
                  <span class="text-muted-foreground">
                    <span class="text-emerald-600 font-semibold">{{ fmtEUR(doc.cobrado) }}</span> cobrado
                  </span>
                  <span v-if="doc.pendiente > 0" class="text-muted-foreground">
                    <span class="text-amber-600 font-semibold">{{ fmtEUR(doc.pendiente) }}</span> pendiente
                  </span>
                  <Badge variant="outline" class="border-border bg-muted text-muted-foreground text-[10px]">
                    {{ doc.sessions }} sesiones
                  </Badge>
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div class="px-5 pb-4 bg-muted/20">
                <div class="rounded-lg border border-border overflow-hidden mt-2">
                  <table class="w-full text-xs">
                    <thead>
                      <tr class="border-b border-border bg-muted/40">
                        <th class="px-4 py-2 text-left font-medium text-muted-foreground">Nº factura</th>
                        <th class="px-4 py-2 text-left font-medium text-muted-foreground">Paciente</th>
                        <th class="px-4 py-2 text-left font-medium text-muted-foreground">Fecha</th>
                        <th class="px-4 py-2 text-right font-medium text-muted-foreground">Importe</th>
                        <th class="px-4 py-2 text-left font-medium text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                      <tr
                        v-for="inv in periodInvoices.filter(i => i.doctorName === doc.doctorName)"
                        :key="inv.id"
                        class="hover:bg-muted/20 cursor-pointer"
                        @click="viewInvoice(inv)"
                      >
                        <td class="px-4 py-2 font-mono text-muted-foreground">{{ inv.number }}</td>
                        <td class="px-4 py-2 text-foreground">{{ inv.patientName }}</td>
                        <td class="px-4 py-2 text-muted-foreground">{{ fmtDateES(inv.issueDate) }}</td>
                        <td class="px-4 py-2 text-right font-semibold text-foreground">{{ fmtEUR(inv.amount) }}</td>
                        <td class="px-4 py-2">
                          <Badge
                            variant="outline"
                            class="text-[10px]"
                            :class="{
                              'border-emerald-200 bg-emerald-50 text-emerald-700': inv.status === 'pagada',
                              'border-amber-200  bg-amber-50  text-amber-700':    inv.status === 'pendiente',
                              'border-rose-200   bg-rose-50   text-rose-700':     inv.status === 'vencida',
                              'border-border     bg-muted     text-muted-foreground': inv.status === 'anulada',
                            }"
                          >{{ STATUS_LABEL[inv.status] }}</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

    </div>
  </div>
</template>
