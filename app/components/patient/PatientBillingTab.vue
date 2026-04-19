<script setup lang="ts">
import {
  ShieldCheck, Euro, AlertCircle, CalendarDays, Pencil, Plus,
  ChevronDown, ChevronRight, CreditCard, Building2, X, Check,
} from 'lucide-vue-next'
import { Input }    from '~/components/ui/input'
import { Label }    from '~/components/ui/label'
import { Button }   from '~/components/ui/button'
import { Badge }    from '~/components/ui/badge'
import { Switch }   from '~/components/ui/switch'
import { Separator } from '~/components/ui/separator'
import { Textarea } from '~/components/ui/textarea'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '~/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '~/components/ui/dialog'
import {
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from '~/components/ui/table'
import BillingInvoiceDetailDialog from '~/components/billing/InvoiceDetailDialog.vue'
import BillingInvoiceRow from '~/components/billing/InvoiceRow.vue'
import type { Invoice, Payment } from '~/utils/billingMock'
import {
  MOCK_INVOICES, MOCK_PAYMENTS, fmtEUR, fmtDateES,
  STATUS_LABEL, METHOD_LABEL,
} from '~/utils/billingMock'

const props = defineProps<{ patientId: string }>()

// ── Filter invoices to this patient ───────────────────────────────────────────

const invoices = ref<Invoice[]>(
  MOCK_INVOICES.filter(i => i.patientId === props.patientId)
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
)

const payments = ref<Payment[]>(
  MOCK_PAYMENTS.filter(p => p.patientId === props.patientId)
    .sort((a, b) => b.date.localeCompare(a.date))
)

// ── Stats ─────────────────────────────────────────────────────────────────────

const statFaturado  = computed(() => invoices.value.filter(i => i.status !== 'anulada').reduce((s, i) => s + i.amount, 0))
const statCobrado   = computed(() => invoices.value.filter(i => i.status === 'pagada').reduce((s, i) => s + i.amountPaid, 0))
const statPendiente = computed(() => invoices.value.filter(i => i.status === 'pendiente' || i.status === 'vencida').reduce((s, i) => s + i.amount, 0))
const lastDate      = computed(() => {
  const sorted = [...invoices.value].filter(i => i.status !== 'anulada').sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
  return sorted[0]?.sessionDate ? fmtDateES(sorted[0].sessionDate) : '—'
})

// ── Seguro ────────────────────────────────────────────────────────────────────

const INSURERS = [
  'Adeslas', 'Asisa', 'AXA Salud', 'Allianz Care', 'BUPA / Sanitas',
  'Cigna', 'DKV', 'Mapfre Salud', 'Generali', 'MUFACE', 'MUGEJU',
  'Privado (sin seguro)',
]

const noInsurance = ref(false)
const insurer = reactive({
  aseguradora:  'Adeslas',
  poliza:       'ADS-2024-778821',
  titular:      '',
  cobertura:    80,
  autorizacion: 'TRP-88234',
  vencimiento:  '2026-05-15',
})
const insurerEdit = reactive({ ...insurer })
const showInsuranceDialog = ref(false)

function openInsuranceEdit() {
  Object.assign(insurerEdit, insurer)
  showInsuranceDialog.value = true
}
function saveInsurance() {
  Object.assign(insurer, insurerEdit)
  showInsuranceDialog.value = false
}

const insuranceExpiringSoon = computed(() => {
  if (!insurer.vencimiento) return false
  const diff = new Date(insurer.vencimiento).getTime() - Date.now()
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
})

// ── Tarifa ────────────────────────────────────────────────────────────────────

const customRate     = ref(false)
const tarifa = reactive({
  tipo:            'individual' as const,
  base:            80,
  custom:          80,
  metodoPago:      'tarjeta',
  iban:            '',
})

// ── Invoices table ────────────────────────────────────────────────────────────

const invoiceFilter = ref<'todas' | 'pendientes' | 'pagadas' | 'vencidas'>('todas')

const filteredInvoices = computed(() => {
  if (invoiceFilter.value === 'todas')     return invoices.value
  if (invoiceFilter.value === 'pendientes') return invoices.value.filter(i => i.status === 'pendiente')
  if (invoiceFilter.value === 'pagadas')   return invoices.value.filter(i => i.status === 'pagada')
  if (invoiceFilter.value === 'vencidas')  return invoices.value.filter(i => i.status === 'vencida')
  return invoices.value
})

const selectedInvoice = ref<Invoice | null>(null)
const detailOpen      = ref(false)

function viewInvoice(inv: Invoice) {
  selectedInvoice.value = inv
  detailOpen.value = true
}

function markPaid(id: string) {
  const inv = invoices.value.find(i => i.id === id)
  if (inv) { inv.status = 'pagada'; inv.amountPaid = inv.amount; inv.paymentMethod = 'tarjeta' }
}

function cancelInvoice(id: string) {
  const inv = invoices.value.find(i => i.id === id)
  if (inv) inv.status = 'anulada'
}

// ── New invoice dialog ────────────────────────────────────────────────────────

const showNewInvoice = ref(false)
const newInv = reactive({ concept: '', date: '', amount: '' })

function createInvoice() {
  const num = String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')
  invoices.value.unshift({
    id: `new-${Date.now()}`,
    number: `PSI-2026-${num}`,
    patientId: props.patientId,
    patientName: 'Sofia Reyes',
    doctorName: 'Elena Voss',
    doctorColegiado: 'M-12345',
    issueDate: new Date().toISOString().slice(0, 10),
    sessionDate: newInv.date || new Date().toISOString().slice(0, 10),
    concept: newInv.concept || 'Sesión individual · 50 min',
    sessionType: 'individual',
    duration: 50,
    amount: Number(newInv.amount) || 80,
    amountPaid: 0,
    status: 'pendiente',
  })
  showNewInvoice.value = false
  Object.assign(newInv, { concept: '', date: '', amount: '' })
}

// ── Payments history ──────────────────────────────────────────────────────────

const expandedPayments = ref<Set<string>>(new Set())

function togglePayment(id: string) {
  const s = new Set(expandedPayments.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expandedPayments.value = s
}

// ── Register payment dialog ───────────────────────────────────────────────────

const showPayDialog   = ref(false)
const pendingInvoices = computed(() => invoices.value.filter(i => i.status === 'pendiente' || i.status === 'vencida'))
const payForm = reactive({
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  method: 'tarjeta',
  reference: '',
  selectedIds: [] as string[],
})

function togglePayInvoice(id: string) {
  const idx = payForm.selectedIds.indexOf(id)
  if (idx >= 0) payForm.selectedIds.splice(idx, 1)
  else payForm.selectedIds.push(id)
}

function registerPayment() {
  if (!payForm.amount || !payForm.date) return
  const newPay = {
    id: `pay-${Date.now()}`,
    date: payForm.date,
    amount: Number(payForm.amount),
    method: payForm.method as any,
    reference: payForm.reference || `TXN-${Date.now()}`,
    invoiceIds: [...payForm.selectedIds],
    patientId: props.patientId,
    patientName: 'Sofia Reyes',
  }
  payForm.selectedIds.forEach(id => {
    const inv = invoices.value.find(i => i.id === id)
    if (inv) { inv.status = 'pagada'; inv.amountPaid = inv.amount; inv.paymentMethod = payForm.method as any }
  })
  payments.value.unshift(newPay as Payment)
  showPayDialog.value = false
  Object.assign(payForm, { amount: '', date: new Date().toISOString().slice(0, 10), method: 'tarjeta', reference: '', selectedIds: [] })
}

// ── Datos de facturación ──────────────────────────────────────────────────────

const billToCompany = ref(false)
const billData = reactive({
  usePersonal: true,
  empresa: '',
  nif: '',
})

const METHOD_LABEL_LOCAL: Record<string, string> = {
  tarjeta: 'Tarjeta', transferencia: 'Transferencia',
  efectivo: 'Efectivo', domiciliacion: 'Domiciliación',
}

const METHOD_BADGE: Record<string, string> = {
  tarjeta:       'border-violet-200 bg-violet-50 text-violet-700',
  transferencia: 'border-sky-200    bg-sky-50    text-sky-700',
  efectivo:      'border-emerald-200 bg-emerald-50 text-emerald-700',
  domiciliacion: 'border-amber-200  bg-amber-50  text-amber-700',
}
</script>

<template>
  <div class="space-y-6 pb-24">

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
        <p class="text-xl font-bold tabular-nums" :class="statPendiente > 0 ? 'text-rose-600' : 'text-foreground'">{{ fmtEUR(statPendiente) }}</p>
      </div>
      <div class="rounded-xl border border-border px-4 py-3 bg-background">
        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Última sesión facturada</p>
        <p class="text-sm font-semibold text-foreground leading-tight mt-1">{{ lastDate }}</p>
      </div>
    </div>

    <!-- ── Seguro ───────────────────────────────────────────────────────────── -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
              <ShieldCheck class="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <CardTitle class="text-base">Seguro médico</CardTitle>
              <CardDescription class="text-xs mt-0.5">Cobertura aplicada a las sesiones de este paciente</CardDescription>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground">Sin seguro</span>
              <Switch v-model="noInsurance" />
            </div>
            <Button v-if="!noInsurance" variant="outline" size="sm" class="gap-1.5 text-xs" @click="openInsuranceEdit">
              <Pencil class="w-3.5 h-3.5" /> Editar seguro
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5">
        <div v-if="noInsurance" class="text-sm text-muted-foreground italic">
          Paciente sin cobertura de seguro médico
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Aseguradora</p>
            <Badge variant="outline" class="border-teal-200 bg-teal-50 text-teal-700 text-xs">{{ insurer.aseguradora }}</Badge>
          </div>
          <div>
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Número de póliza</p>
            <p class="text-sm font-mono text-foreground">{{ insurer.poliza }}</p>
          </div>
          <div>
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Cobertura</p>
            <p class="text-sm font-semibold text-foreground">{{ insurer.cobertura }}% cubierto por seguro</p>
          </div>
          <div v-if="insurer.autorizacion">
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nº autorización / caso</p>
            <p class="text-sm font-mono text-foreground">{{ insurer.autorizacion }}</p>
          </div>
          <div v-if="insurer.titular">
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Titular de la póliza</p>
            <p class="text-sm text-foreground">{{ insurer.titular }}</p>
          </div>
          <div v-if="insurer.vencimiento">
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Vencimiento de cobertura</p>
            <div class="flex items-center gap-2">
              <p class="text-sm text-foreground">{{ fmtDateES(insurer.vencimiento) }}</p>
              <Badge
                v-if="insuranceExpiringSoon"
                variant="outline"
                class="border-amber-200 bg-amber-50 text-amber-700 text-[10px] gap-1"
              >
                <AlertCircle class="w-3 h-3" /> Próximo vencimiento
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Seguro edit dialog -->
    <Dialog v-model:open="showInsuranceDialog">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar datos del seguro</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Aseguradora</Label>
            <Select v-model="insurerEdit.aseguradora">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="ins in INSURERS" :key="ins" :value="ins">{{ ins }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Número de póliza</Label>
              <Input v-model="insurerEdit.poliza" class="font-mono" />
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Titular (si distinto)</Label>
              <Input v-model="insurerEdit.titular" placeholder="Nombre del titular" />
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Cobertura (%)</Label>
              <Input v-model.number="insurerEdit.cobertura" type="number" min="0" max="100" />
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Nº autorización / caso</Label>
              <Input v-model="insurerEdit.autorizacion" class="font-mono" />
            </div>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Fecha de vencimiento de cobertura</Label>
            <Input v-model="insurerEdit.vencimiento" type="date" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" @click="showInsuranceDialog = false">Cancelar</Button>
          <Button size="sm" @click="saveInsurance">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ── Tarifa aplicada ──────────────────────────────────────────────────── -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <Euro class="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <CardTitle class="text-base">Tarifa aplicada</CardTitle>
            <CardDescription class="text-xs mt-0.5">Tipo de sesión, precio y método de pago habitual</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Tipo de sesión</p>
            <Select v-model="tarifa.tipo">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="pareja">Pareja</SelectItem>
                <SelectItem value="familia">Familia</SelectItem>
                <SelectItem value="grupo">Grupo</SelectItem>
                <SelectItem value="infantil">Infantil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Tarifa base del profesional</p>
            <div class="flex items-center h-10 px-3 rounded-md border border-border bg-muted/40 text-sm text-muted-foreground">
              {{ fmtEUR(tarifa.base) }} / sesión <span class="ml-2 text-[10px] text-muted-foreground/60">(desde perfil del profesional)</span>
            </div>
          </div>

          <!-- Custom rate toggle -->
          <div class="sm:col-span-2">
            <div class="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div>
                <p class="text-sm font-medium">Tarifa personalizada</p>
                <p class="text-xs text-muted-foreground mt-0.5">Tarifa exclusiva para este paciente (ej. tarifa social, deslizante)</p>
              </div>
              <Switch v-model="customRate" />
            </div>
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div v-if="customRate" class="mt-2 px-3 py-3 rounded-lg border border-border bg-background">
                <Label class="mb-1.5 block text-xs text-muted-foreground">Tarifa personalizada (€)</Label>
                <Input v-model.number="tarifa.custom" type="number" min="0" class="max-w-[140px]" />
                <p class="text-[11px] text-muted-foreground mt-1.5">Esta tarifa se aplica únicamente a este paciente</p>
              </div>
            </Transition>
          </div>

          <div>
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Método de pago habitual</p>
            <Select v-model="tarifa.metodoPago">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="domiciliacion">Domiciliación bancaria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="tarifa.metodoPago === 'domiciliacion'">
              <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">IBAN</p>
              <Input
                v-model="tarifa.iban"
                placeholder="ES## #### #### #### #### ####"
                class="font-mono"
              />
            </div>
          </Transition>
        </div>
      </CardContent>
    </Card>

    <!-- ── Facturas ─────────────────────────────────────────────────────────── -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <CalendarDays class="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <CardTitle class="text-base">Facturas</CardTitle>
              <CardDescription class="text-xs mt-0.5">{{ invoices.length }} facturas en total</CardDescription>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Filter pills -->
            <div class="flex items-center rounded-lg border border-border bg-muted/30 p-0.5 gap-0.5">
              <button
                v-for="f in [
                  { key: 'todas',     label: 'Todas' },
                  { key: 'pendientes',label: 'Pendientes' },
                  { key: 'pagadas',   label: 'Pagadas' },
                  { key: 'vencidas',  label: 'Vencidas' },
                ]"
                :key="f.key"
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                :class="invoiceFilter === f.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'"
                @click="invoiceFilter = f.key as any"
              >
                {{ f.label }}
              </button>
            </div>
            <Button size="sm" class="gap-1.5 text-xs" @click="showNewInvoice = true">
              <Plus class="w-3.5 h-3.5" /> Nueva factura
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-0 px-0">
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">
                <TableHead class="text-xs pl-6">Nº Factura</TableHead>
                <TableHead class="text-xs">Fecha emisión</TableHead>
                <TableHead class="text-xs">Tipo</TableHead>
                <TableHead class="text-xs hidden sm:table-cell">Concepto</TableHead>
                <TableHead class="text-xs text-right">Importe</TableHead>
                <TableHead class="text-xs">Estado</TableHead>
                <TableHead class="text-xs text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <BillingInvoiceRow
                v-for="inv in filteredInvoices"
                :key="inv.id"
                :invoice="inv"
                :show-patient="false"
                @view="viewInvoice"
                @mark-paid="markPaid"
                @cancel="cancelInvoice"
              />
              <TableRow v-if="filteredInvoices.length === 0">
                <TableCell colspan="7" class="text-center text-sm text-muted-foreground py-10">
                  No hay facturas para este filtro
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- New invoice dialog -->
    <Dialog v-model:open="showNewInvoice">
      <DialogContent class="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva factura</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Concepto</Label>
            <Input v-model="newInv.concept" placeholder="Sesión individual · 50 min" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Fecha de sesión</Label>
              <Input v-model="newInv.date" type="date" />
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Importe (€)</Label>
              <Input v-model="newInv.amount" type="number" min="0" placeholder="80" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" @click="showNewInvoice = false">Cancelar</Button>
          <Button size="sm" @click="createInvoice">Crear factura</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Invoice detail dialog -->
    <BillingInvoiceDetailDialog
      :invoice="selectedInvoice"
      :open="detailOpen"
      @update:open="detailOpen = $event"
    />

    <!-- ── Historial de pagos ────────────────────────────────────────────────── -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
              <CreditCard class="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <CardTitle class="text-base">Historial de pagos</CardTitle>
              <CardDescription class="text-xs mt-0.5">{{ payments.length }} pagos registrados</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" class="gap-1.5 text-xs shrink-0" @click="showPayDialog = true">
            <Plus class="w-3.5 h-3.5" /> Registrar pago
          </Button>
        </div>
      </CardHeader>
      <CardContent class="pt-5">
        <div v-if="payments.length === 0" class="text-sm text-muted-foreground text-center py-6">
          No hay pagos registrados
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="pay in payments"
            :key="pay.id"
            class="pl-4 border-l-2 border-emerald-200 space-y-1"
          >
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-3 flex-wrap">
                <p class="text-xs text-muted-foreground">{{ fmtDateES(pay.date) }}</p>
                <span class="text-sm font-bold text-emerald-600 tabular-nums">+{{ fmtEUR(pay.amount) }}</span>
                <Badge
                  variant="outline"
                  class="text-[10px]"
                  :class="METHOD_BADGE[pay.method] ?? 'border-border bg-muted text-muted-foreground'"
                >
                  {{ METHOD_LABEL_LOCAL[pay.method] }}
                </Badge>
                <span class="text-xs font-mono text-muted-foreground/70">{{ pay.reference }}</span>
              </div>
              <button
                class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                @click="togglePayment(pay.id)"
              >
                <component
                  :is="expandedPayments.has(pay.id) ? ChevronDown : ChevronRight"
                  class="w-3 h-3"
                />
                Cubre {{ pay.invoiceIds.length }} {{ pay.invoiceIds.length === 1 ? 'factura' : 'facturas' }}
              </button>
            </div>
            <Transition
              enter-active-class="transition-all duration-150 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div v-if="expandedPayments.has(pay.id)" class="flex flex-wrap gap-1 pt-1">
                <span
                  v-for="iid in pay.invoiceIds"
                  :key="iid"
                  class="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground"
                >
                  {{ invoices.find(i => i.id === iid)?.number ?? iid }}
                </span>
              </div>
            </Transition>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Register payment dialog -->
    <Dialog v-model:open="showPayDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pago manual</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Importe (€)</Label>
              <Input v-model="payForm.amount" type="number" min="0" placeholder="80" />
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Fecha de pago</Label>
              <Input v-model="payForm.date" type="date" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Método</Label>
              <Select v-model="payForm.method">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="domiciliacion">Domiciliación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Referencia</Label>
              <Input v-model="payForm.reference" class="font-mono" placeholder="TXN-…" />
            </div>
          </div>
          <div v-if="pendingInvoices.length > 0">
            <Label class="mb-2 block text-xs text-muted-foreground">Facturas pendientes (seleccionar las cubiertas)</Label>
            <div class="space-y-2 max-h-36 overflow-y-auto pr-1">
              <div
                v-for="inv in pendingInvoices"
                :key="inv.id"
                class="flex items-center gap-2.5 p-2 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                @click="togglePayInvoice(inv.id)"
              >
                <Checkbox
                  :model-value="payForm.selectedIds.includes(inv.id)"
                  @update:model-value="togglePayInvoice(inv.id)"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-mono text-foreground">{{ inv.number }}</p>
                  <p class="text-[10px] text-muted-foreground">{{ fmtEUR(inv.amount) }} · {{ fmtDateES(inv.sessionDate) }}</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-muted-foreground">No hay facturas pendientes</p>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" @click="showPayDialog = false">Cancelar</Button>
          <Button size="sm" :disabled="!payForm.amount" @click="registerPayment">Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ── Datos de facturación ──────────────────────────────────────────────── -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Building2 class="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <CardTitle class="text-base">Datos de facturación</CardTitle>
              <CardDescription class="text-xs mt-0.5">Dirección y razón social para las facturas</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-4">
        <div class="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
          <div>
            <p class="text-sm font-medium">Misma que dirección personal</p>
            <p class="text-xs text-muted-foreground mt-0.5">Calle Gran Vía 12, 2º B · 28013 Madrid</p>
          </div>
          <Switch v-model="billData.usePersonal" />
        </div>

        <div v-if="!billData.usePersonal" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <Label class="mb-1.5 block text-xs text-muted-foreground">Dirección de facturación</Label>
            <Input placeholder="Calle, número, piso..." />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Código postal</Label>
            <Input placeholder="28001" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Ciudad</Label>
            <Input placeholder="Madrid" />
          </div>
        </div>

        <Separator />

        <div class="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
          <div>
            <p class="text-sm font-medium">Facturar a empresa</p>
            <p class="text-xs text-muted-foreground mt-0.5">El paciente factura a nombre de una persona jurídica</p>
          </div>
          <Switch v-model="billToCompany" />
        </div>

        <div v-if="billToCompany" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Nombre de empresa</Label>
            <Input v-model="billData.empresa" placeholder="Razón social" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">NIF / CIF</Label>
            <Input v-model="billData.nif" placeholder="B12345678" class="font-mono" />
          </div>
        </div>

        <p class="text-xs text-muted-foreground">
          Los datos de dirección del paciente se gestionan en la pestaña
          <button class="underline underline-offset-2 hover:text-foreground transition-colors">General</button>
        </p>
      </CardContent>
    </Card>

  </div>
</template>
