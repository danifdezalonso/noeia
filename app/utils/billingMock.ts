export type InvoiceStatus = 'pagada' | 'pendiente' | 'vencida' | 'anulada'
export type PaymentMethod = 'tarjeta' | 'transferencia' | 'efectivo' | 'domiciliacion'
export type SessionType   = 'individual' | 'pareja' | 'familia' | 'grupo' | 'infantil'

export interface Invoice {
  id: string
  number: string
  patientId: string
  patientName: string
  doctorName: string
  doctorColegiado: string
  issueDate: string
  sessionDate: string
  concept: string
  sessionType: SessionType
  duration: number
  amount: number
  amountPaid: number
  insuranceCoverage?: number
  status: InvoiceStatus
  paymentMethod?: PaymentMethod
  pdfUrl?: string
}

export interface Payment {
  id: string
  date: string
  amount: number
  method: PaymentMethod
  reference: string
  invoiceIds: string[]
  patientId: string
  patientName: string
}

export const MOCK_INVOICES: Invoice[] = [
  // ── Sofia Reyes (p5) · Elena Voss ─────────────────────────────────────────
  {
    id: 'i01', number: 'PSI-2025-0038',
    patientId: 'p5', patientName: 'Sofia Reyes',
    doctorName: 'Elena Voss', doctorColegiado: 'M-12345',
    issueDate: '2025-10-03', sessionDate: '2025-10-02',
    concept: 'Sesión individual · 50 min', sessionType: 'individual', duration: 50,
    amount: 80, amountPaid: 80, status: 'pagada', paymentMethod: 'tarjeta',
  },
  {
    id: 'i02', number: 'PSI-2025-0042',
    patientId: 'p5', patientName: 'Sofia Reyes',
    doctorName: 'Elena Voss', doctorColegiado: 'M-12345',
    issueDate: '2025-11-07', sessionDate: '2025-11-06',
    concept: 'Sesión individual · 50 min', sessionType: 'individual', duration: 50,
    amount: 80, amountPaid: 80, status: 'pagada', paymentMethod: 'tarjeta',
  },
  {
    id: 'i03', number: 'PSI-2025-0049',
    patientId: 'p5', patientName: 'Sofia Reyes',
    doctorName: 'Elena Voss', doctorColegiado: 'M-12345',
    issueDate: '2025-12-05', sessionDate: '2025-12-04',
    concept: 'Sesión individual · 50 min', sessionType: 'individual', duration: 50,
    amount: 80, amountPaid: 0, status: 'pendiente',
  },
  {
    id: 'i04', number: 'PSI-2025-0040',
    patientId: 'p5', patientName: 'Sofia Reyes',
    doctorName: 'Elena Voss', doctorColegiado: 'M-12345',
    issueDate: '2025-10-17', sessionDate: '2025-10-16',
    concept: 'Sesión individual · 50 min', sessionType: 'individual', duration: 50,
    amount: 80, amountPaid: 0, status: 'vencida',
  },
  {
    id: 'i05', number: 'PSI-2026-0005',
    patientId: 'p5', patientName: 'Sofia Reyes',
    doctorName: 'Elena Voss', doctorColegiado: 'M-12345',
    issueDate: '2026-01-10', sessionDate: '2026-01-09',
    concept: 'Sesión individual · 50 min', sessionType: 'individual', duration: 50,
    amount: 80, amountPaid: 0, status: 'anulada',
  },

  // ── Lucas Fernández (p2) · Marco Silva ────────────────────────────────────
  {
    id: 'i06', number: 'PSI-2025-0039',
    patientId: 'p2', patientName: 'Lucas Fernández',
    doctorName: 'Marco Silva', doctorColegiado: 'M-67890',
    issueDate: '2025-10-10', sessionDate: '2025-10-09',
    concept: 'Sesión individual · 50 min', sessionType: 'individual', duration: 50,
    amount: 100, amountPaid: 100, status: 'pagada', paymentMethod: 'transferencia',
  },
  {
    id: 'i07', number: 'PSI-2025-0045',
    patientId: 'p2', patientName: 'Lucas Fernández',
    doctorName: 'Marco Silva', doctorColegiado: 'M-67890',
    issueDate: '2025-11-14', sessionDate: '2025-11-13',
    concept: 'Sesión individual · 50 min', sessionType: 'individual', duration: 50,
    amount: 100, amountPaid: 100, status: 'pagada', paymentMethod: 'transferencia',
  },
  {
    id: 'i08', number: 'PSI-2026-0001',
    patientId: 'p2', patientName: 'Lucas Fernández',
    doctorName: 'Marco Silva', doctorColegiado: 'M-67890',
    issueDate: '2026-01-03', sessionDate: '2026-01-02',
    concept: 'Sesión individual · 50 min', sessionType: 'individual', duration: 50,
    amount: 100, amountPaid: 0, status: 'pendiente',
  },
  {
    id: 'i09', number: 'PSI-2025-0044',
    patientId: 'p2', patientName: 'Lucas Fernández',
    doctorName: 'Marco Silva', doctorColegiado: 'M-67890',
    issueDate: '2025-11-01', sessionDate: '2025-10-31',
    concept: 'Sesión de pareja · 80 min', sessionType: 'pareja', duration: 80,
    amount: 140, amountPaid: 0, status: 'vencida',
  },

  // ── Ana Martínez (p3) · Elena Voss ────────────────────────────────────────
  {
    id: 'i10', number: 'PSI-2025-0041',
    patientId: 'p3', patientName: 'Ana Martínez',
    doctorName: 'Elena Voss', doctorColegiado: 'M-12345',
    issueDate: '2025-10-24', sessionDate: '2025-10-23',
    concept: 'Sesión familia · 60 min', sessionType: 'familia', duration: 60,
    amount: 110, amountPaid: 110, insuranceCoverage: 80,
    status: 'pagada', paymentMethod: 'efectivo',
  },
  {
    id: 'i11', number: 'PSI-2025-0047',
    patientId: 'p3', patientName: 'Ana Martínez',
    doctorName: 'Elena Voss', doctorColegiado: 'M-12345',
    issueDate: '2025-12-01', sessionDate: '2025-11-30',
    concept: 'Sesión familia · 60 min', sessionType: 'familia', duration: 60,
    amount: 110, amountPaid: 110, insuranceCoverage: 80,
    status: 'pagada', paymentMethod: 'efectivo',
  },
  {
    id: 'i12', number: 'PSI-2026-0003',
    patientId: 'p3', patientName: 'Ana Martínez',
    doctorName: 'Elena Voss', doctorColegiado: 'M-12345',
    issueDate: '2026-01-07', sessionDate: '2026-01-06',
    concept: 'Sesión familia · 60 min', sessionType: 'familia', duration: 60,
    amount: 110, amountPaid: 0, insuranceCoverage: 80,
    status: 'pendiente',
  },
]

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay1', date: '2025-10-05', amount: 80,  method: 'tarjeta',       reference: 'TXN-20251005-SR', invoiceIds: ['i01'],      patientId: 'p5', patientName: 'Sofia Reyes'    },
  { id: 'pay2', date: '2025-11-09', amount: 80,  method: 'tarjeta',       reference: 'TXN-20251109-SR', invoiceIds: ['i02'],      patientId: 'p5', patientName: 'Sofia Reyes'    },
  { id: 'pay3', date: '2025-10-12', amount: 100, method: 'transferencia', reference: 'TRF-20251012-LF', invoiceIds: ['i06'],      patientId: 'p2', patientName: 'Lucas Fernández'},
  { id: 'pay4', date: '2025-11-17', amount: 200, method: 'transferencia', reference: 'TRF-20251117-LF', invoiceIds: ['i06','i07'],patientId: 'p2', patientName: 'Lucas Fernández'},
  { id: 'pay5', date: '2025-10-26', amount: 110, method: 'efectivo',      reference: 'EFT-20251026-AM', invoiceIds: ['i10'],      patientId: 'p3', patientName: 'Ana Martínez'   },
  { id: 'pay6', date: '2025-12-03', amount: 110, method: 'efectivo',      reference: 'EFT-20251203-AM', invoiceIds: ['i11'],      patientId: 'p3', patientName: 'Ana Martínez'   },
  { id: 'pay7', date: '2025-11-20', amount: 160, method: 'tarjeta',       reference: 'TXN-20251120-SR', invoiceIds: ['i01','i02'],patientId: 'p5', patientName: 'Sofia Reyes'    },
  { id: 'pay8', date: '2025-12-20', amount: 220, method: 'domiciliacion', reference: 'DOM-20251220-AM', invoiceIds: ['i10','i11'],patientId: 'p3', patientName: 'Ana Martínez'   },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

export function fmtEUR(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
}

export function fmtDateES(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${d} de ${months[m - 1]} de ${y}`
}

export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  pagada:    'Pagada',
  pendiente: 'Pendiente',
  vencida:   'Vencida',
  anulada:   'Anulada',
}

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  tarjeta:        'Tarjeta',
  transferencia:  'Transferencia',
  efectivo:       'Efectivo',
  domiciliacion:  'Domiciliación',
}

export const SESSION_LABEL: Record<SessionType, string> = {
  individual: 'Individual',
  pareja:     'Pareja',
  familia:    'Familia',
  grupo:      'Grupo',
  infantil:   'Infantil',
}
