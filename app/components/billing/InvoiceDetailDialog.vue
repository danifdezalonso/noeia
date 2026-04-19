<script setup lang="ts">
import { Download, X } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from '~/components/ui/dialog'
import type { Invoice } from '~/utils/billingMock'
import { fmtEUR, fmtDateES, STATUS_LABEL, METHOD_LABEL } from '~/utils/billingMock'

const props = defineProps<{ invoice: Invoice | null; open: boolean }>()
const emit  = defineEmits<{ 'update:open': [v: boolean] }>()

const STATUS_COLORS: Record<string, string> = {
  pagada:    'border-emerald-200 bg-emerald-50 text-emerald-700',
  pendiente: 'border-amber-200  bg-amber-50  text-amber-700',
  vencida:   'border-rose-200   bg-rose-50   text-rose-700',
  anulada:   'border-border     bg-muted     text-muted-foreground',
}

const patientResponsibility = computed(() => {
  if (!props.invoice) return 0
  const coverage = props.invoice.insuranceCoverage ?? 0
  return props.invoice.amount * (1 - coverage / 100)
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader class="sr-only">
        <DialogTitle>Detalle de factura</DialogTitle>
      </DialogHeader>

      <div v-if="invoice" class="space-y-6 py-2">

        <!-- ── Invoice header ──────────────────────────────────────────────── -->
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <div class="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <span class="text-[10px] font-bold text-primary-foreground">N</span>
              </div>
              <span class="text-sm font-semibold text-foreground">Noeia · Factura</span>
            </div>
            <p class="text-2xl font-bold text-foreground font-mono tracking-tight">{{ invoice.number }}</p>
          </div>
          <div class="text-right shrink-0">
            <Badge
              variant="outline"
              :class="STATUS_COLORS[invoice.status]"
              class="text-xs mb-2"
            >
              {{ STATUS_LABEL[invoice.status] }}
            </Badge>
            <p class="text-xs text-muted-foreground">Emitida el {{ fmtDateES(invoice.issueDate) }}</p>
            <p class="text-xs text-muted-foreground">Sesión del {{ fmtDateES(invoice.sessionDate) }}</p>
          </div>
        </div>

        <Separator />

        <!-- ── From / To ───────────────────────────────────────────────────── -->
        <div class="grid grid-cols-2 gap-6">
          <div>
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Profesional</p>
            <p class="text-sm font-semibold text-foreground">{{ invoice.doctorName }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">Nº colegiado: {{ invoice.doctorColegiado }}</p>
            <p class="text-xs text-muted-foreground">Clínica Noeia · Madrid</p>
          </div>
          <div>
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Paciente</p>
            <p class="text-sm font-semibold text-foreground">{{ invoice.patientName }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">Calle Gran Vía 12, 2º B</p>
            <p class="text-xs text-muted-foreground">28013 Madrid, España</p>
          </div>
        </div>

        <Separator />

        <!-- ── Line item ───────────────────────────────────────────────────── -->
        <div>
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Concepto</p>
          <div class="rounded-lg border border-border overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40">
                  <th class="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Descripción</th>
                  <th class="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="px-4 py-3">
                    <p class="font-medium text-foreground">{{ invoice.concept }}</p>
                    <p class="text-xs text-muted-foreground mt-0.5">Sesión del {{ fmtDateES(invoice.sessionDate) }}</p>
                  </td>
                  <td class="px-4 py-3 text-right font-semibold">{{ fmtEUR(invoice.amount) }}</td>
                </tr>
                <tr v-if="invoice.insuranceCoverage" class="border-t border-border/50">
                  <td class="px-4 py-2 text-xs text-muted-foreground">
                    Cobertura de seguro ({{ invoice.insuranceCoverage }}%)
                  </td>
                  <td class="px-4 py-2 text-right text-xs text-emerald-600 font-medium">
                    -{{ fmtEUR(invoice.amount * invoice.insuranceCoverage / 100) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-border bg-muted/30">
                  <td class="px-4 py-3 text-sm font-semibold text-foreground">
                    Total a abonar por el paciente
                  </td>
                  <td class="px-4 py-3 text-right text-lg font-bold text-foreground">
                    {{ fmtEUR(patientResponsibility) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- ── Payment info ────────────────────────────────────────────────── -->
        <div class="rounded-lg border border-border p-4 bg-muted/20 space-y-2">
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Estado de pago</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="{
                  'bg-emerald-500': invoice.status === 'pagada',
                  'bg-amber-500':   invoice.status === 'pendiente',
                  'bg-rose-500':    invoice.status === 'vencida',
                  'bg-muted-foreground/40': invoice.status === 'anulada',
                }"
              />
              <span class="text-sm font-medium">{{ STATUS_LABEL[invoice.status] }}</span>
              <span v-if="invoice.paymentMethod" class="text-xs text-muted-foreground">
                · via {{ METHOD_LABEL[invoice.paymentMethod] }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-xs text-muted-foreground">
                Cobrado: <span class="font-semibold text-foreground">{{ fmtEUR(invoice.amountPaid) }}</span>
              </p>
              <p v-if="invoice.amount - invoice.amountPaid > 0 && invoice.status !== 'anulada'" class="text-xs text-muted-foreground">
                Pendiente: <span class="font-semibold text-rose-600">{{ fmtEUR(invoice.amount - invoice.amountPaid) }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- ── Footer actions ──────────────────────────────────────────────── -->
        <div class="flex items-center justify-between pt-2 border-t border-border">
          <p class="text-[11px] text-muted-foreground">
            Generada automáticamente por Noeia · IVA no aplicable (Sanidad exenta art. 20.1.3º LIVA)
          </p>
          <Button variant="outline" size="sm" class="gap-1.5 text-xs opacity-50 cursor-not-allowed" disabled>
            <Download class="w-3.5 h-3.5" /> Descargar PDF
          </Button>
        </div>

      </div>
    </DialogContent>
  </Dialog>
</template>
