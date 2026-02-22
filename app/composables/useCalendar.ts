import { addDays, startOfWeek } from 'date-fns'

export interface CalendarEvent {
  id: string
  title: string
  start: string // local ISO "YYYY-MM-DDTHH:mm:ss"
  end: string
  category: 'session' | 'ooo' | 'meeting' | 'task' | 'focus' | 'appointment'
  allDay?: boolean
  // session
  patientId?: string
  patientName?: string
  modality?: 'online' | 'inperson'
  meetingLink?: string
  // ooo
  declineMode?: 'none' | 'new-only' | 'all'
  oooMessage?: string
  // focus
  focusDnd?: boolean
  focusDeclineInvites?: boolean
  // appointment slots
  appointmentDuration?: number // minutes
  bookingLink?: string
  // common
  location?: string
  recurrence?: 'none' | 'weekly' | 'biweekly' | 'monthly'
  done?: boolean
  description?: string
  notification?: number // minutes before; -1 = none
  visibility?: 'default' | 'public' | 'private'
  deadline?: string // tasks only
  // style overrides
  color?: string
  labels?: string[]
}

export interface MockPatient { id: string; name: string }

export const mockPatients: MockPatient[] = [
  { id: 'p1',  name: 'Sofia Martinez'   },
  { id: 'p2',  name: 'James Wilson'     },
  { id: 'p3',  name: 'Emma Thompson'    },
  { id: 'p4',  name: 'Carlos Rivera'    },
  { id: 'p5',  name: 'Aisha Patel'      },
  { id: 'p6',  name: 'Noah Chen'        },
  { id: 'p7',  name: 'Lucia Fernández'  },
  { id: 'p8',  name: "Michael O'Brien"  },
  { id: 'p9',  name: 'Hannah Kim'       },
  { id: 'p10', name: 'David Okafor'     },
]

function localIso(date: Date, hour: number, minute = 0): string {
  const d = new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:${pad(minute)}:00`
}

function createSeedEvents(): CalendarEvent[] {
  const mon = startOfWeek(new Date(), { weekStartsOn: 1 })
  return [
    { id: crypto.randomUUID(), title: 'Session – Sofia Martinez', start: localIso(addDays(mon, 0), 10), end: localIso(addDays(mon, 0), 11), category: 'session', patientId: 'p1', patientName: 'Sofia Martinez', modality: 'online', recurrence: 'weekly' },
    { id: crypto.randomUUID(), title: 'Session – James Wilson',   start: localIso(addDays(mon, 0), 14), end: localIso(addDays(mon, 0), 15), category: 'session', patientId: 'p2', patientName: 'James Wilson', modality: 'inperson', location: 'Room 101', recurrence: 'biweekly' },
    { id: crypto.randomUUID(), title: 'Team Standup',             start: localIso(addDays(mon, 1), 9),  end: localIso(addDays(mon, 1), 9, 30), category: 'meeting', recurrence: 'none' },
    { id: crypto.randomUUID(), title: 'Session – Emma Thompson',  start: localIso(addDays(mon, 2), 11), end: localIso(addDays(mon, 2), 12), category: 'session', patientId: 'p3', patientName: 'Emma Thompson', modality: 'online', recurrence: 'weekly' },
    { id: crypto.randomUUID(), title: 'Conference – Out of Office', start: localIso(addDays(mon, 3), 8), end: localIso(addDays(mon, 3), 18), category: 'ooo', recurrence: 'none', declineMode: 'all' },
    { id: crypto.randomUUID(), title: 'Review billing report',    start: localIso(addDays(mon, 4), 16), end: localIso(addDays(mon, 4), 16, 30), category: 'task', done: false, recurrence: 'none' },
    { id: crypto.randomUUID(), title: 'Deep work – Research',     start: localIso(addDays(mon, 2), 14), end: localIso(addDays(mon, 2), 16), category: 'focus', focusDnd: true, focusDeclineInvites: false, recurrence: 'none' },
  ]
}

export interface ContextMenuState { open: boolean; x: number; y: number; eventId: string }

export const useCalendar = () => {
  const events        = useState<CalendarEvent[]>('calendar-events', createSeedEvents)
  const modalOpen     = useState<boolean>('calendar-modal-open', () => false)
  const editingEvent  = useState<CalendarEvent | null>('calendar-editing-event', () => null)
  const pendingRange  = useState<{ start: string; end: string } | null>('calendar-pending-range', () => null)
  const viewMode      = useState<string>('calendar-view-mode', () => 'timeGridWeek')
  const currentTitle  = useState<string>('calendar-title', () => '')

  // ── Quick modal ────────────────────────────────────────────────────────────
  const quickModalOpen = useState<boolean>('cal-quick-modal', () => false)
  const quickModalPos  = useState<{ x: number; y: number } | null>('cal-quick-modal-pos', () => null)
  const draftData      = useState<Partial<CalendarEvent> | null>('cal-draft', () => null)

  // ── Context menu ────────────────────────────────────────────────────────────
  const contextMenu = useState<ContextMenuState | null>('cal-context-menu', () => null)

  // ── Display settings ────────────────────────────────────────────────────────
  const hideWeekends = useState<boolean>('cal-hide-weekends',  () => true)
  const showWeekNums = useState<boolean>('cal-week-numbers',   () => false)
  const slotDuration = useState<string>('cal-slot-duration',   () => '01:00:00')
  const workStart    = useState<string>('cal-work-start',      () => '08:00')
  const workEnd      = useState<string>('cal-work-end',        () => '18:00')

  // ── Open helpers ────────────────────────────────────────────────────────────
  function openCreate(start: string, end: string) {
    editingEvent.value   = null
    pendingRange.value   = { start, end }
    draftData.value      = null
    quickModalOpen.value = false
    modalOpen.value      = true
  }

  function openQuickCreate(start: string, end: string, x: number, y: number) {
    editingEvent.value   = null
    pendingRange.value   = { start, end }
    draftData.value      = null
    quickModalPos.value  = { x, y }
    quickModalOpen.value = true
    modalOpen.value      = false
  }

  function openFullModal(draft?: Partial<CalendarEvent> & { start?: string; end?: string }) {
    if (draft) {
      const { start, end, ...rest } = draft
      if (start && end) pendingRange.value = { start, end }
      draftData.value = Object.keys(rest).length ? (rest as Partial<CalendarEvent>) : null
    }
    quickModalOpen.value = false
    editingEvent.value   = null
    modalOpen.value      = true
  }

  function openEdit(event: CalendarEvent) {
    editingEvent.value   = { ...event }
    pendingRange.value   = null
    draftData.value      = null
    quickModalOpen.value = false
    modalOpen.value      = true
  }

  // ── Conflict helpers ────────────────────────────────────────────────────────
  function checkConflict(start: string, end: string, excludeId?: string): boolean {
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    return events.value.some((ev) => {
      if (excludeId && ev.id === excludeId) return false
      const evS = new Date(ev.start).getTime()
      const evE = new Date(ev.end).getTime()
      return s < evE && e > evS
    })
  }

  function getConflictingEvents(start: string, end: string, excludeId?: string): CalendarEvent[] {
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    return events.value.filter((ev) => {
      if (excludeId && ev.id === excludeId) return false
      if (ev.category === 'ooo') return false
      const evS = new Date(ev.start).getTime()
      const evE = new Date(ev.end).getTime()
      return s < evE && e > evS
    })
  }

  // ── CRUD ────────────────────────────────────────────────────────────────────
  function saveEvent(data: Omit<CalendarEvent, 'id'> & { id?: string }) {
    if (data.id) {
      const idx = events.value.findIndex((e) => e.id === data.id)
      if (idx !== -1) {
        events.value = [
          ...events.value.slice(0, idx),
          { ...events.value[idx]!, ...data, id: data.id },
          ...events.value.slice(idx + 1),
        ]
      }
    } else {
      events.value = [...events.value, { ...data, id: crypto.randomUUID() } as CalendarEvent]
    }
    modalOpen.value      = false
    quickModalOpen.value = false
    if (data.category === 'session') { console.log('→ Billing: pending entry created'); console.log('→ IA: session placeholder created') }
    if (data.category === 'meeting') console.log('→ Notification: org members notified')
    if (data.patientId)              console.log('→ Patient record: event appended')
  }

  function deleteEvents(ids: string[]) {
    events.value = events.value.filter((e) => !ids.includes(e.id))
  }

  function moveEvent(id: string, start: string, end: string) {
    const idx = events.value.findIndex((e) => e.id === id)
    if (idx !== -1)
      events.value = [...events.value.slice(0, idx), { ...events.value[idx]!, start, end }, ...events.value.slice(idx + 1)]
  }

  function deleteEvent(id: string) {
    events.value = events.value.filter((e) => e.id !== id)
    modalOpen.value = false
  }

  function toggleTaskDone(id: string) {
    const idx = events.value.findIndex((e) => e.id === id)
    if (idx !== -1)
      events.value = [...events.value.slice(0, idx), { ...events.value[idx]!, done: !events.value[idx]!.done }, ...events.value.slice(idx + 1)]
  }

  // ── Context menu ────────────────────────────────────────────────────────────
  function openContextMenu(eventId: string, x: number, y: number) {
    contextMenu.value = { open: true, x, y, eventId }
  }
  function closeContextMenu() { contextMenu.value = null }

  function setEventColor(id: string, color: string) {
    const idx = events.value.findIndex((e) => e.id === id)
    if (idx !== -1)
      events.value = [...events.value.slice(0, idx), { ...events.value[idx]!, color }, ...events.value.slice(idx + 1)]
  }

  function toggleEventLabel(id: string, label: string) {
    const idx = events.value.findIndex((e) => e.id === id)
    if (idx !== -1) {
      const ev = events.value[idx]!
      const labels = ev.labels ?? []
      const newLabels = labels.includes(label) ? labels.filter((l) => l !== label) : [...labels, label]
      events.value = [...events.value.slice(0, idx), { ...ev, labels: newLabels }, ...events.value.slice(idx + 1)]
    }
  }

  function duplicateEvent(id: string) {
    const ev = events.value.find((e) => e.id === id)
    if (!ev) return
    const pad = (n: number) => String(n).padStart(2, '0')
    const shift = (iso: string) => {
      const d = new Date(iso); d.setDate(d.getDate() + 1)
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
    }
    events.value = [...events.value, { ...ev, id: crypto.randomUUID(), start: shift(ev.start), end: shift(ev.end) }]
  }

  return {
    events, modalOpen, editingEvent, pendingRange, viewMode, currentTitle,
    quickModalOpen, quickModalPos, draftData,
    contextMenu,
    hideWeekends, showWeekNums, slotDuration, workStart, workEnd,
    mockPatients,
    openCreate, openQuickCreate, openFullModal, openEdit,
    saveEvent, moveEvent, deleteEvent, deleteEvents, checkConflict, getConflictingEvents,
    toggleTaskDone,
    openContextMenu, closeContextMenu, setEventColor, toggleEventLabel, duplicateEvent,
  }
}
