<script setup lang="ts">
import { Download, MoreHorizontal, Eye, CheckCircle2, XCircle } from 'lucide-vue-next'
import { TableRow, TableCell } from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import type { Invoice } from '~/utils/billingMock'
import { fmtEUR, fmtDateES, STATUS_LABEL, SESSION_LABEL } from '~/utils/billingMock'

const props = defineProps<{
  invoice: Invoice
  showPatient?: boolean
}>()

const emit = defineEmits<{
  view: [invoice: Invoice]
  markPaid: [id: string]
  cancel: [id: string]
}>()

const STATUS_COLORS: Record<string, string> = {
  pagada:    'border-emerald-200 bg-emerald-50 text-emerald-700',
  pendiente: 'border-amber-200  bg-amber-50  text-amber-700',
  vencida:   'border-rose-200   bg-rose-50   text-rose-700',
  anulada:   'border-border     bg-muted     text-muted-foreground',
}

const SESSION_COLORS: Record<string, string> = {
  individual: 'border-violet-200 bg-violet-50 text-violet-700',
  pareja:     'border-sky-200    bg-sky-50    text-sky-700',
  familia:    'border-teal-200   bg-teal-50   text-teal-700',
  grupo:      'border-orange-200 bg-orange-50 text-orange-700',
  infantil:   'border-pink-200   bg-pink-50   text-pink-700',
}
</script>

<template>
  <TableRow
    class="cursor-pointer hover:bg-muted/30 transition-colors"
    @click="emit('view', invoice)"
  >
    <TableCell class="font-mono text-xs text-muted-foreground whitespace-nowrap">
      {{ invoice.number }}
    </TableCell>
    <TableCell class="text-xs text-muted-foreground whitespace-nowrap">
      {{ fmtDateES(invoice.issueDate) }}
    </TableCell>

    <!-- Patient + Doctor columns (global billing page only) -->
    <template v-if="showPatient">
      <TableCell class="text-sm font-medium text-foreground">{{ invoice.patientName }}</TableCell>
      <TableCell class="text-xs text-muted-foreground">{{ invoice.doctorName }}</TableCell>
    </template>

    <TableCell>
      <Badge
        variant="outline"
        class="text-[10px] font-medium whitespace-nowrap"
        :class="SESSION_COLORS[invoice.sessionType]"
      >
        {{ SESSION_LABEL[invoice.sessionType] }}
      </Badge>
    </TableCell>
    <TableCell class="text-xs text-muted-foreground max-w-[180px] truncate hidden sm:table-cell">
      {{ invoice.concept }}
    </TableCell>
    <TableCell class="text-sm font-semibold text-foreground text-right tabular-nums whitespace-nowrap">
      {{ fmtEUR(invoice.amount) }}
    </TableCell>
    <TableCell>
      <Badge
        variant="outline"
        class="text-[10px] font-medium whitespace-nowrap"
        :class="STATUS_COLORS[invoice.status]"
      >
        {{ STATUS_LABEL[invoice.status] }}
      </Badge>
    </TableCell>
    <TableCell class="text-right" @click.stop>
      <div class="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          class="opacity-50 cursor-not-allowed"
          disabled
          title="Descargar PDF"
        >
          <Download class="w-3.5 h-3.5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal class="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-44">
            <DropdownMenuItem @click="emit('view', invoice)">
              <Eye class="w-3.5 h-3.5 mr-2" /> Ver detalle
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              v-if="invoice.status === 'pendiente' || invoice.status === 'vencida'"
              @click="emit('markPaid', invoice.id)"
            >
              <CheckCircle2 class="w-3.5 h-3.5 mr-2 text-emerald-600" />
              Marcar como pagada
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="invoice.status !== 'anulada'"
              class="text-destructive focus:text-destructive"
              @click="emit('cancel', invoice.id)"
            >
              <XCircle class="w-3.5 h-3.5 mr-2" /> Anular factura
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableCell>
  </TableRow>
</template>
