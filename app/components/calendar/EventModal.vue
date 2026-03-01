<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { X, Clock, User, MapPin, AlignLeft, Bell, Eye, Video, Target, Link2, CalendarDays, Repeat, ClipboardList, XCircle, ChevronDown } from 'lucide-vue-next'
import type { CalendarEvent } from '~/composables/useCalendar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogFooter } from '~/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Switch } from '~/components/ui/switch'
import { Checkbox } from '~/components/ui/checkbox'

const { modalOpen, editingEvent, pendingRange, draftData, saveEvent, deleteEvent, checkConflict, getConflictingEvents, deleteEvents, mockPatients } = useCalendar()
const { persona } = usePersona()

// ── Form ──────────────────────────────────────────────────────────────────────
const form = reactive({
  category:             'session' as CalendarEvent['category'],
  title:                '',
  date:                 '',
  startTime:            '',
  endTime:              '',
  allDay:               false,
  patientId:            '',
  patientName:          '',
  modality:             'online' as 'online' | 'inperson',
  meetingLinkEnabled:   false,
  meetingLink:          '',
  location:             '',
  recurrence:           'none' as NonNullable<CalendarEvent['recurrence']>,
  done:                 false,
  description:          '',
  notification:         -1 as number,
  visibility:           'default' as 'default' | 'public' | 'private',
  deadline:             '',
  declineMode:          'all' as 'none' | 'new-only' | 'all',
  oooMessage:           'I am currently out of the office.',
  focusDnd:             true,
  focusDeclineInvites:  false,
  appointmentDuration:  30,
  bookingLink:          '',
  linkedSessionId:      '',
  sessionType:          '',
  cancelled:            false,
  cancellationReason:   '',
  notifyPatient:        false,
  notifyPatientMinutes: 60,
})

const patientSearch         = ref('')
const showPatientDropdown   = ref(false)
const showOooConflictDialog = ref(false)
const oooConflicts          = ref<CalendarEvent[]>([])
const pendingSave           = ref<Parameters<typeof saveEvent>[0] | null>(null)
const showDiscardConfirm    = ref(false)
const showDeleteConfirm     = ref(false)
const patientError          = ref(false)

// ── Option maps ───────────────────────────────────────────────────────────────
const RECURRENCE_OPTIONS = [
  { value: 'none',      label: "Doesn't repeat" },
  { value: 'weekly',    label: 'Weekly' },
  { value: 'biweekly',  label: 'Bi-weekly' },
  { value: 'monthly',   label: 'Monthly' },
]
const SESSION_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual therapy' },
  { value: 'initial',    label: 'Initial consultation' },
  { value: 'followup',   label: 'Follow-up session' },
  { value: 'group',      label: 'Group session' },
  { value: 'family',     label: 'Family therapy' },
  { value: 'crisis',     label: 'Crisis intervention' },
]
const LOCATION_OPTIONS = [
  { value: 'Room 101',            label: 'Room 101' },
  { value: 'Room 102',            label: 'Room 102' },
  { value: 'Main Street Clinic',  label: 'Main Street Clinic' },
]
const CANCELLATION_REASONS = [
  { value: 'patient-noshow',       label: 'Patient no-show' },
  { value: 'patient-cancelled',    label: 'Patient cancelled' },
  { value: 'provider-unavailable', label: 'Provider unavailable' },
  { value: 'rescheduled',          label: 'Rescheduled' },
  { value: 'emergency',            label: 'Emergency' },
  { value: 'other',                label: 'Other' },
]
const APPOINTMENT_DURATION_OPTIONS = [
  { value: 15,  label: '15 minutes' },
  { value: 30,  label: '30 minutes' },
  { value: 45,  label: '45 minutes' },
  { value: 50,  label: '50 minutes' },
  { value: 60,  label: '1 hour' },
  { value: 90,  label: '1.5 hours' },
]
const NOTIFICATION_OPTIONS = [
  { value: -1,   label: 'No notification' },
  { value: 0,    label: 'At event time' },
  { value: 5,    label: '5 minutes before' },
  { value: 10,   label: '10 minutes before' },
  { value: 15,   label: '15 minutes before' },
  { value: 30,   label: '30 minutes before' },
  { value: 60,   label: '1 hour before' },
  { value: 1440, label: '1 day before' },
]
const NOTIFY_PATIENT_OPTIONS = [
  { value: 30,   label: '30 min before' },
  { value: 60,   label: '1 hour before' },
  { value: 120,  label: '2 hours before' },
  { value: 1440, label: '1 day before' },
]
const VISIBILITY_OPTIONS = [
  { value: 'default', label: 'Default visibility' },
  { value: 'public',  label: 'Public' },
  { value: 'private', label: 'Private' },
]

// ── Category config ───────────────────────────────────────────────────────────
const categories = [
  { value: 'session'       as const, label: 'Session',        hexColor: '#4f46e5', activeClass: 'bg-primary text-primary-foreground'            },
  { value: 'ooo'           as const, label: 'Out of Office',  hexColor: '#f59e0b', activeClass: 'bg-amber-500 text-white'                       },
  { value: 'meeting'       as const, label: 'Meeting',        hexColor: '#0284c7', activeClass: 'bg-sky-600 text-white dark:bg-sky-500'         },
  { value: 'focus'         as const, label: 'Focus Time',     hexColor: '#7c3aed', activeClass: 'bg-violet-600 text-white dark:bg-violet-500'   },
  { value: 'task'          as const, label: 'Task',           hexColor: '#16a34a', activeClass: 'bg-emerald-600 text-white dark:bg-emerald-500' },
  { value: 'appointment'   as const, label: 'Appointments',   hexColor: '#0d9488', activeClass: 'bg-teal-600 text-white dark:bg-teal-500'       },
  { value: 'documentation' as const, label: 'Documentation',  hexColor: '#64748b', activeClass: 'bg-muted-foreground text-background'              },
]

const activeCategory      = computed(() => categories.find(c => c.value === form.category))
const activeCategoryColor = computed(() => activeCategory.value?.hexColor ?? '#6b7280')
const activeCategoryLabel = computed(() => activeCategory.value?.label ?? '')

// ── Dropdown labels ───────────────────────────────────────────────────────────
const recurrenceLabel            = computed(() => RECURRENCE_OPTIONS.find(o => o.value === form.recurrence)?.label ?? "Doesn't repeat")
const sessionTypeLabel           = computed(() => SESSION_TYPE_OPTIONS.find(o => o.value === form.sessionType)?.label ?? 'Session type (optional)')
const locationLabel              = computed(() => LOCATION_OPTIONS.find(o => o.value === form.location)?.label ?? 'Select location…')
const cancellationReasonLabel    = computed(() => CANCELLATION_REASONS.find(o => o.value === form.cancellationReason)?.label ?? 'Reason (optional)')
const appointmentDurationLabel   = computed(() => APPOINTMENT_DURATION_OPTIONS.find(o => o.value === form.appointmentDuration)?.label ?? '30 minutes')
const notificationLabel          = computed(() => NOTIFICATION_OPTIONS.find(o => o.value === form.notification)?.label ?? 'No notification')
const notifyPatientMinutesLabel  = computed(() => NOTIFY_PATIENT_OPTIONS.find(o => o.value === form.notifyPatientMinutes)?.label ?? '1 hour before')
const visibilityLabel            = computed(() => VISIBILITY_OPTIONS.find(o => o.value === form.visibility)?.label ?? 'Default visibility')

// ── Derived ───────────────────────────────────────────────────────────────────
const isEditing = computed(() => !!editingEvent.value)

const isDirty = computed(() => {
  if (isEditing.value) return true
  if (form.category === 'session') return !!(form.patientId || form.location || form.description)
  return !!(form.location || form.description)
})

const duration = computed(() => {
  if (form.allDay || !form.startTime || !form.endTime) return ''
  const [sh = 0, sm = 0] = form.startTime.split(':').map(Number)
  const [eh = 0, em = 0] = form.endTime.split(':').map(Number)
  const mins = eh * 60 + em - (sh * 60 + sm)
  if (mins <= 0) return ''
  const h = Math.floor(mins / 60); const m = mins % 60
  return h === 0 ? `${m} min` : m ? `${h}h ${m}min` : `${h}h`
})

const hasConflict = computed(() => {
  if (!form.date || !form.startTime || !form.endTime || form.allDay) return false
  return checkConflict(`${form.date}T${form.startTime}:00`, `${form.date}T${form.endTime}:00`, editingEvent.value?.id)
})

const filteredPatients = computed(() => {
  if (!showPatientDropdown.value) return []
  const q = patientSearch.value.trim().toLowerCase()
  if (!q) return mockPatients.filter(p => p.id !== form.patientId)
  return mockPatients.filter(p => p.name.toLowerCase().includes(q) && p.name !== patientSearch.value)
})
function togglePatientDropdown() { showPatientDropdown.value = !showPatientDropdown.value }

const sessionOptions = computed(() =>
  useCalendar().events.value
    .filter(e => e.category === 'session')
    .sort((a, b) => b.start.localeCompare(a.start))
    .slice(0, 20)
    .map(e => ({
      id: e.id,
      label: `${e.title} · ${new Date(e.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    }))
)
const linkedSessionLabel = computed(() => {
  if (!form.linkedSessionId) return 'No linked session'
  return sessionOptions.value.find(s => s.id === form.linkedSessionId)?.label ?? 'No linked session'
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeFromIso = (iso: string) => iso.split('T')[1]?.slice(0, 5) ?? ''
const dateFromIso = (iso: string) => iso.split('T')[0] ?? ''

function generateMeetingLink() { return `https://meet.noeia.app/${Math.random().toString(36).slice(2, 10)}` }
function generateBookingLink() { return `https://book.noeia.app/${Math.random().toString(36).slice(2, 8)}` }

function resetForm() {
  Object.assign(form, {
    category: 'session', title: '', date: '', startTime: '', endTime: '', allDay: false,
    patientId: '', patientName: '', modality: 'online', meetingLinkEnabled: false, meetingLink: '',
    location: '', recurrence: 'none', done: false, description: '', notification: -1,
    visibility: 'default', deadline: '', declineMode: 'all', oooMessage: 'I am currently out of the office.',
    focusDnd: true, focusDeclineInvites: false, appointmentDuration: 30, bookingLink: '',
    linkedSessionId: '', sessionType: '', cancelled: false, cancellationReason: '',
    notifyPatient: false, notifyPatientMinutes: 60,
  })
  patientSearch.value = ''
  showPatientDropdown.value = false
  showDiscardConfirm.value = false
  patientError.value = false
}

// ── Auto-fill session title from patient / doctor ─────────────────────────────
watch(() => form.patientName, (patient) => {
  if (form.category !== 'session' || isEditing.value) return
  if (!patient) return
  const drName = persona.role === 'doctor' ? persona.name : ''
  form.title = drName ? `${patient} <> ${drName}` : patient
})

// ── Category title auto-fill ──────────────────────────────────────────────────
const MODAL_CATEGORY_DEFAULTS: Partial<Record<CalendarEvent['category'], string>> = {
  ooo: 'Out of Office', meeting: 'Meeting', focus: 'Focus Time',
  documentation: 'Documentation', task: 'Task', appointment: 'Appointment Slots',
}
watch(() => form.category, (cat) => {
  const def = MODAL_CATEGORY_DEFAULTS[cat]
  if (def && !form.title) form.title = def
})

// ── Populate form on open ─────────────────────────────────────────────────────
watch(modalOpen, (open) => {
  if (!open) { resetForm(); draftData.value = null; return }
  if (editingEvent.value) {
    const ev = editingEvent.value
    form.category            = ev.category
    form.title               = ev.title
    form.date                = dateFromIso(ev.start)
    form.startTime           = timeFromIso(ev.start)
    form.endTime             = timeFromIso(ev.end)
    form.allDay              = ev.allDay ?? false
    form.patientId           = ev.patientId  ?? ''
    form.patientName         = ev.patientName ?? ''
    form.modality            = ev.modality    ?? 'online'
    form.meetingLink         = ev.meetingLink ?? ''
    form.meetingLinkEnabled  = !!ev.meetingLink
    form.location            = ev.location   ?? ''
    form.recurrence          = ev.recurrence ?? 'none'
    form.done                = ev.done       ?? false
    form.description         = ev.description ?? ''
    form.notification        = ev.notification ?? -1
    form.visibility          = ev.visibility  ?? 'default'
    form.deadline            = ev.deadline    ?? ''
    form.declineMode         = ev.declineMode ?? 'all'
    form.oooMessage          = ev.oooMessage  ?? 'I am currently out of the office.'
    form.focusDnd            = ev.focusDnd    ?? true
    form.focusDeclineInvites = ev.focusDeclineInvites ?? false
    form.appointmentDuration  = ev.appointmentDuration ?? 30
    form.bookingLink          = ev.bookingLink ?? ''
    form.linkedSessionId      = ev.linkedSessionId ?? ''
    form.sessionType          = ev.sessionType ?? ''
    form.cancelled            = ev.cancelled ?? false
    form.cancellationReason   = ev.cancellationReason ?? ''
    form.notifyPatient        = ev.notifyPatient ?? false
    form.notifyPatientMinutes = ev.notifyPatientMinutes ?? 60
    patientSearch.value       = ev.patientName ?? ''
  } else {
    const draft = draftData.value
    const range = pendingRange.value
    if (draft) {
      if (draft.category)    form.category    = draft.category
      if (draft.title)       form.title       = draft.title
      if (draft.patientId)   form.patientId   = draft.patientId
      if (draft.patientName) { form.patientName = draft.patientName; patientSearch.value = draft.patientName }
      if (draft.modality)    form.modality    = draft.modality
      if (draft.location)    form.location    = draft.location
      if (draft.description) form.description = draft.description
    }
    if (range) {
      form.date      = dateFromIso(range.start)
      form.startTime = timeFromIso(range.start)
      form.endTime   = timeFromIso(range.end)
    }
    const def = MODAL_CATEGORY_DEFAULTS[form.category]
    if (def && !form.title) form.title = def
    if (form.category === 'appointment' && !form.bookingLink) form.bookingLink = generateBookingLink()
  }
})

// ── Actions ───────────────────────────────────────────────────────────────────
function close() { modalOpen.value = false }

function tryClose() {
  if (showOooConflictDialog.value) { showOooConflictDialog.value = false; return }
  if (showDiscardConfirm.value) { confirmDiscard(); return }
  if (isDirty.value) { showDiscardConfirm.value = true } else { close() }
}

function confirmDiscard() { showDiscardConfirm.value = false; close() }

function selectPatient(p: (typeof mockPatients)[number]) {
  form.patientId = p.id; form.patientName = p.name; patientSearch.value = p.name
  showPatientDropdown.value = false; patientError.value = false
}
function onPatientBlur() { setTimeout(() => { showPatientDropdown.value = false }, 150) }

function toggleMeetingLink() {
  form.meetingLinkEnabled = !form.meetingLinkEnabled
  if (form.meetingLinkEnabled && !form.meetingLink) form.meetingLink = generateMeetingLink()
}

function buildEventData(): Parameters<typeof saveEvent>[0] {
  const start = form.allDay ? form.date : `${form.date}T${form.startTime}:00`
  const end   = form.allDay ? form.date : `${form.date}T${form.endTime}:00`
  const defaults: Record<string, string> = {
    session: form.patientName ? `Session – ${form.patientName}` : 'Session',
    ooo: 'Out of Office', meeting: 'Meeting', focus: 'Focus Time',
    task: 'Task', appointment: 'Appointment Slots',
  }
  return {
    id:                   editingEvent.value?.id,
    title:                form.title.trim() || defaults[form.category] || form.category,
    start, end,
    allDay:               form.allDay || undefined,
    category:             form.category,
    patientId:            form.category === 'session' && form.patientId   ? form.patientId   : undefined,
    patientName:          form.category === 'session' && form.patientName ? form.patientName : undefined,
    modality:             form.category === 'session' ? form.modality : undefined,
    meetingLink:          form.category === 'session' && form.meetingLinkEnabled && form.meetingLink ? form.meetingLink : undefined,
    location:             form.location   || undefined,
    recurrence:           form.recurrence,
    done:                 form.category === 'task' ? form.done : undefined,
    description:          form.description || undefined,
    notification:         form.notification >= 0 ? form.notification : undefined,
    visibility:           form.visibility !== 'default' ? form.visibility : undefined,
    deadline:             form.category === 'task' && form.deadline ? form.deadline : undefined,
    declineMode:          form.category === 'ooo' ? form.declineMode : undefined,
    oooMessage:           form.category === 'ooo' && form.declineMode !== 'none' ? form.oooMessage : undefined,
    focusDnd:             form.category === 'focus' ? form.focusDnd : undefined,
    focusDeclineInvites:  form.category === 'focus' ? form.focusDeclineInvites : undefined,
    appointmentDuration:  form.category === 'appointment' ? form.appointmentDuration : undefined,
    bookingLink:          form.category === 'appointment' ? form.bookingLink : undefined,
    linkedSessionId:      form.category === 'documentation' && form.linkedSessionId ? form.linkedSessionId : undefined,
    sessionType:          form.category === 'session' && form.sessionType ? form.sessionType : undefined,
    cancelled:            form.category === 'session' ? form.cancelled : undefined,
    cancellationReason:   form.category === 'session' && form.cancelled && form.cancellationReason ? form.cancellationReason : undefined,
    notifyPatient:        form.category === 'session' ? form.notifyPatient : undefined,
    notifyPatientMinutes: form.category === 'session' && form.notifyPatient ? form.notifyPatientMinutes : undefined,
  }
}

function handleSave() {
  if (form.category === 'session' && !form.patientId) { patientError.value = true; return }
  patientError.value = false
  if (form.category === 'ooo' && form.declineMode !== 'none') {
    const start = form.allDay ? `${form.date}T00:00:00` : `${form.date}T${form.startTime}:00`
    const end   = form.allDay ? `${form.date}T23:59:59` : `${form.date}T${form.endTime}:00`
    const conflicts = getConflictingEvents(start, end, editingEvent.value?.id)
    if (conflicts.length > 0) {
      oooConflicts.value = conflicts
      pendingSave.value  = buildEventData()
      showOooConflictDialog.value = true
      return
    }
  }
  saveEvent(buildEventData())
}

function confirmOooSave(cancelConflicts: boolean) {
  if (cancelConflicts && oooConflicts.value.length) deleteEvents(oooConflicts.value.map(e => e.id))
  if (pendingSave.value) saveEvent(pendingSave.value)
  showOooConflictDialog.value = false
  oooConflicts.value = []
  pendingSave.value  = null
}

function handleDelete() {
  if (editingEvent.value) showDeleteConfirm.value = true
}

function confirmDelete() {
  if (editingEvent.value) deleteEvent(editingEvent.value.id)
  showDeleteConfirm.value = false
}

useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  if (!modalOpen.value) return
  if (e.key !== 'Escape') return
  e.preventDefault()
  if (showDeleteConfirm.value)    { showDeleteConfirm.value = false; return }
  if (showOooConflictDialog.value) { showOooConflictDialog.value = false; return }
  if (showDiscardConfirm.value) { showDiscardConfirm.value = false; return }
  tryClose()
})
</script>

<template>
  <!-- OOO Conflict Dialog -->
  <Dialog :open="showOooConflictDialog" @update:open="(v) => { if (!v) showOooConflictDialog = false }">
    <DialogContent class="sm:max-w-sm rounded-2xl">
      <h3 class="text-sm font-semibold text-foreground mb-1">Conflicting events found</h3>
      <p class="text-xs text-muted-foreground mb-3">
        You have {{ oooConflicts.length }} event{{ oooConflicts.length > 1 ? 's' : '' }} during your Out of Office time:
      </p>
      <ul class="space-y-1 mb-4 max-h-32 overflow-y-auto">
        <li v-for="ev in oooConflicts" :key="ev.id" class="text-xs text-foreground flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{{ ev.title }}
        </li>
      </ul>
      <p class="text-xs text-muted-foreground mb-4">Would you like to cancel these events?</p>
      <div class="flex gap-2">
        <Button variant="outline" class="flex-1 text-xs" @click="confirmOooSave(false)">Keep them</Button>
        <Button class="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white" @click="confirmOooSave(true)">Cancel events</Button>
      </div>
    </DialogContent>
  </Dialog>

  <!-- Main Modal -->
  <Dialog :open="modalOpen">
    <DialogContent
      :show-close-button="false"
      class="p-0 gap-0 sm:max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
      @escape-key-down.prevent
      @interact-outside="(e) => { e.preventDefault(); tryClose() }"
    >
      <!-- Header: close + title input -->
      <div class="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0">
        <Button variant="ghost" size="icon" class="rounded-lg shrink-0" @click="tryClose">
          <X class="w-5 h-5" />
        </Button>
        <input
          v-model="form.title"
          type="text"
          :placeholder="form.category === 'ooo' ? 'Out of Office' : form.category === 'focus' ? 'Focus Time' : 'Add title'"
          class="flex-1 text-2xl font-normal text-foreground bg-transparent border-b-2 border-primary focus:outline-none pb-1 placeholder:text-muted-foreground/50"
        />
      </div>

      <!-- Category section -->
      <div class="px-5 pb-3 shrink-0">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Type</p>
        <div class="flex gap-1 flex-wrap">
          <Button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            size="sm"
            :class="['rounded-full text-xs font-semibold px-3 h-7 transition-colors', form.category === cat.value ? cat.activeClass : 'text-muted-foreground bg-transparent hover:bg-accent border-0']"
            @click="form.category = cat.value"
          >
            {{ cat.label }}
          </Button>
        </div>
      </div>

      <!-- Scrollable body -->
      <div class="flex-1 overflow-y-auto px-5 pb-2 space-y-4 min-h-0">

        <!-- ── Time section ──────────────────────────────────────────── -->
        <div class="space-y-3 pt-1">
          <div class="flex items-center gap-2 flex-wrap">
            <Clock class="w-4 h-4 text-muted-foreground shrink-0" />
            <input v-model="form.date" type="date" :disabled="form.allDay" class="px-2.5 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" />
            <template v-if="!form.allDay">
              <input v-model="form.startTime" type="time" class="px-2.5 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <span class="text-muted-foreground text-sm">–</span>
              <input v-model="form.endTime" type="time" class="px-2.5 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <span v-if="duration" class="text-xs text-muted-foreground font-medium">{{ duration }}</span>
            </template>
          </div>
          <!-- All day + Recurrence -->
          <div class="flex items-center gap-4 pl-6 flex-wrap">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.allDay" type="checkbox" class="w-3.5 h-3.5 rounded accent-primary" />
              <span class="text-xs text-muted-foreground">All day</span>
            </label>
            <div class="flex items-center gap-2">
              <Repeat class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline" size="sm" class="h-7 text-xs w-40 justify-between font-normal">
                    {{ recurrenceLabel }}
                    <ChevronDown class="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem v-for="o in RECURRENCE_OPTIONS" :key="o.value" @select="form.recurrence = o.value as typeof form.recurrence">
                    {{ o.label }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <!-- ── SESSION fields ──────────────────────────────────────── -->
        <template v-if="form.category === 'session'">
          <!-- Patient search with DropdownMenu -->
          <div class="flex items-start gap-3">
            <User class="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
            <div class="flex-1">
              <DropdownMenu :open="showPatientDropdown && filteredPatients.length > 0" @update:open="(v) => { if (!v) showPatientDropdown = false }">
                <DropdownMenuTrigger as-child>
                  <div class="relative">
                    <Input
                      v-model="patientSearch"
                      :class="['pr-8', patientError ? 'border-red-500 focus-visible:ring-red-500/30' : '']"
                      placeholder="Search patient…"
                      autocomplete="off"
                      @focus="showPatientDropdown = true; patientError = false"
                      @blur="onPatientBlur"
                      @input="() => { form.patientId = ''; form.patientName = ''; patientError = false; showPatientDropdown = true }"
                    />
                    <Button variant="ghost" size="icon" class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:bg-transparent" @mousedown.prevent="togglePatientDropdown">
                      <ChevronDown class="w-4 h-4 transition-transform" :class="showPatientDropdown ? 'rotate-180' : ''" />
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-[--reka-dropdown-menu-trigger-width]">
                  <DropdownMenuItem v-for="p in filteredPatients" :key="p.id" @select="selectPatient(p)">
                    {{ p.name }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p v-if="patientError" class="mt-1 text-xs text-red-500 font-medium">Patient is required to save a session.</p>
            </div>
          </div>

          <!-- Modality -->
          <div class="pl-7">
            <Tabs :model-value="form.modality" @update:model-value="(v) => form.modality = v as 'online' | 'inperson'">
              <TabsList class="w-full">
                <TabsTrigger value="online" class="flex-1 text-xs">Online</TabsTrigger>
                <TabsTrigger value="inperson" class="flex-1 text-xs">In-person</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <!-- Session type -->
          <div class="flex items-center gap-3">
            <ClipboardList class="w-4 h-4 text-muted-foreground shrink-0" />
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" class="flex-1 h-9 justify-between font-normal text-sm">
                  <span class="truncate">{{ sessionTypeLabel }}</span>
                  <ChevronDown class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width]">
                <DropdownMenuItem class="text-muted-foreground" @select="form.sessionType = ''">Session type (optional)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem v-for="o in SESSION_TYPE_OPTIONS" :key="o.value" @select="form.sessionType = o.value">{{ o.label }}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- Location (in-person) -->
          <div v-if="form.modality === 'inperson'" class="flex items-center gap-3">
            <MapPin class="w-4 h-4 text-muted-foreground shrink-0" />
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" class="flex-1 h-9 justify-between font-normal text-sm">
                  <span class="truncate">{{ locationLabel }}</span>
                  <ChevronDown class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width]">
                <DropdownMenuItem class="text-muted-foreground" @select="form.location = ''">Select location…</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem v-for="o in LOCATION_OPTIONS" :key="o.value" @select="form.location = o.value">{{ o.label }}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- Online meeting link -->
          <div v-if="form.modality === 'online'" class="flex items-center gap-3">
            <Video class="w-4 h-4 text-muted-foreground shrink-0" />
            <div class="flex-1">
              <Button v-if="!form.meetingLinkEnabled" variant="link" class="h-auto p-0 text-sm" @click="toggleMeetingLink">+ Add online meeting link</Button>
              <div v-else class="flex items-center gap-2">
                <input v-model="form.meetingLink" type="url" class="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" readonly />
                <Button variant="ghost" size="sm" class="text-xs text-muted-foreground hover:text-red-500" @click="form.meetingLinkEnabled = false; form.meetingLink = ''">Remove</Button>
              </div>
            </div>
          </div>

          <!-- Cancellation (editing) -->
          <template v-if="isEditing">
            <div class="space-y-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <XCircle class="w-4 h-4 text-red-500 dark:text-red-400" />
                  <span class="text-sm font-medium text-foreground">Mark as cancelled</span>
                </div>
                <Switch v-model:checked="form.cancelled" />
              </div>
              <template v-if="form.cancelled">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="outline" size="sm" class="w-full h-8 justify-between font-normal text-sm">
                      <span class="truncate">{{ cancellationReasonLabel }}</span>
                      <ChevronDown class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width]">
                    <DropdownMenuItem class="text-muted-foreground" @select="form.cancellationReason = ''">Reason (optional)</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem v-for="o in CANCELLATION_REASONS" :key="o.value" @select="form.cancellationReason = o.value">{{ o.label }}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </template>
            </div>
          </template>
        </template>

        <!-- ── OOO fields ──────────────────────────────────────────── -->
        <template v-if="form.category === 'ooo'">
          <div class="space-y-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <p class="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Decline meetings</p>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.declineMode" type="radio" value="none" class="accent-amber-600" />
              <span class="text-sm text-foreground">Don't auto-decline</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.declineMode" type="radio" value="new-only" class="accent-amber-600" />
              <span class="text-sm text-foreground">New invitations only</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.declineMode" type="radio" value="all" class="accent-amber-600" />
              <span class="text-sm text-foreground">New invitations and existing sessions</span>
            </label>
            <div v-if="form.declineMode !== 'none'" class="mt-2">
              <label class="block text-xs text-muted-foreground mb-1">Decline message</label>
              <Textarea v-model="form.oooMessage" :rows="2" class="resize-none" />
            </div>
          </div>
        </template>

        <!-- ── FOCUS fields ────────────────────────────────────────── -->
        <template v-if="form.category === 'focus'">
          <div class="space-y-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
            <p class="text-xs font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wide">Focus settings</p>
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm text-foreground">Do Not Disturb mode</span>
              <Switch v-model:checked="form.focusDnd" />
            </label>
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm text-foreground">Auto-decline new invitations</span>
              <Switch v-model:checked="form.focusDeclineInvites" />
            </label>
          </div>
        </template>

        <!-- ── TASK fields ─────────────────────────────────────────── -->
        <template v-if="form.category === 'task'">
          <div class="flex items-center gap-3">
            <Target class="w-4 h-4 text-muted-foreground shrink-0" />
            <div class="flex-1">
              <label class="block text-xs text-muted-foreground mb-1">Deadline (optional)</label>
              <input v-model="form.deadline" type="date" class="px-2.5 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div class="flex items-center gap-2.5 pl-7">
            <Checkbox v-model:checked="form.done" />
            <span class="text-sm text-foreground cursor-pointer" @click="form.done = !form.done">Mark as done</span>
          </div>
        </template>

        <!-- ── DOCUMENTATION fields ───────────────────────────────── -->
        <template v-if="form.category === 'documentation'">
          <div class="flex items-center gap-3">
            <Link2 class="w-4 h-4 text-muted-foreground shrink-0" />
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" class="flex-1 h-9 justify-between font-normal text-sm">
                  <span class="truncate">{{ linkedSessionLabel }}</span>
                  <ChevronDown class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width]">
                <DropdownMenuItem class="text-muted-foreground" @select="form.linkedSessionId = ''">No linked session</DropdownMenuItem>
                <DropdownMenuSeparator v-if="sessionOptions.length" />
                <DropdownMenuItem v-for="s in sessionOptions" :key="s.id" @select="form.linkedSessionId = s.id">{{ s.label }}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div class="ml-7 text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-2">
            When linked, billing will count <strong>session + documentation</strong> time together.
          </div>
        </template>

        <!-- ── APPOINTMENT fields ──────────────────────────────────── -->
        <template v-if="form.category === 'appointment'">
          <div class="space-y-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4">
            <p class="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wide">Appointment slot settings</p>
            <div>
              <label class="block text-xs text-muted-foreground mb-1">Session duration</label>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline" class="w-full h-9 justify-between font-normal text-sm">
                    {{ appointmentDurationLabel }}
                    <ChevronDown class="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width]">
                  <DropdownMenuItem v-for="o in APPOINTMENT_DURATION_OPTIONS" :key="o.value" @select="form.appointmentDuration = o.value">{{ o.label }}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label class="block text-xs text-muted-foreground mb-1">Booking link</label>
              <div class="flex items-center gap-2">
                <input :value="form.bookingLink" readonly class="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-muted/50 text-muted-foreground focus:outline-none" />
                <Button variant="outline" size="sm" class="text-teal-600 border-teal-200 hover:bg-teal-50" @click="navigator.clipboard?.writeText(form.bookingLink)">Copy</Button>
              </div>
            </div>
            <p class="text-xs text-muted-foreground flex items-start gap-1.5">
              <span class="mt-0.5">ℹ️</span>
              Share this link with patients so they can book within this time slot.
            </p>
          </div>
        </template>

        <!-- ── Location (non-session) ──────────────────────────────── -->
        <div v-if="form.category !== 'session' && form.category !== 'appointment'" class="flex items-center gap-3">
          <MapPin class="w-4 h-4 text-muted-foreground shrink-0" />
          <Input v-model="form.location" placeholder="Add location" class="flex-1" />
        </div>

        <!-- ── Notifications ───────────────────────────────────────── -->
        <div class="flex items-center gap-3">
          <Bell class="w-4 h-4 text-muted-foreground shrink-0" />
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="flex-1 h-9 justify-between font-normal text-sm">
                {{ notificationLabel }}
                <ChevronDown class="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width]">
              <DropdownMenuItem v-for="o in NOTIFICATION_OPTIONS" :key="o.value" @select="form.notification = o.value">{{ o.label }}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Patient reminder (sessions only) -->
        <template v-if="form.category === 'session'">
          <div class="flex items-center gap-3 pl-7">
            <span class="text-sm text-muted-foreground flex-1">Notify patient</span>
            <div class="flex items-center gap-2">
              <div v-if="form.notifyPatient" class="w-40">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="outline" size="sm" class="h-8 w-full justify-between font-normal text-xs">
                      {{ notifyPatientMinutesLabel }}
                      <ChevronDown class="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width]">
                    <DropdownMenuItem v-for="o in NOTIFY_PATIENT_OPTIONS" :key="o.value" @select="form.notifyPatientMinutes = o.value">{{ o.label }}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Switch v-model:checked="form.notifyPatient" />
            </div>
          </div>
        </template>

        <!-- ── Visibility ──────────────────────────────────────────── -->
        <div class="flex items-center gap-3">
          <Eye class="w-4 h-4 text-muted-foreground shrink-0" />
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="flex-1 h-9 justify-between font-normal text-sm">
                {{ visibilityLabel }}
                <ChevronDown class="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width]">
              <DropdownMenuItem v-for="o in VISIBILITY_OPTIONS" :key="o.value" @select="form.visibility = o.value as typeof form.visibility">{{ o.label }}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- ── Description ─────────────────────────────────────────── -->
        <div class="flex items-start gap-3">
          <AlignLeft class="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
          <Textarea v-model="form.description" placeholder="Add description or notes…" :rows="3" class="flex-1 resize-none" />
        </div>

        <!-- ── Conflict warning ────────────────────────────────────── -->
        <div v-if="hasConflict" class="flex items-start gap-2.5 px-3 py-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
          <span class="text-red-500 dark:text-red-400 text-sm mt-0.5">⚠</span>
          <p class="text-xs text-red-600 dark:text-red-400 leading-relaxed">This time overlaps with another event. You can still save.</p>
        </div>
      </div>

      <!-- Footer -->
      <DialogFooter class="px-5 py-4 border-t border-border bg-muted/30 shrink-0 sm:justify-between items-center">
        <Button v-if="isEditing" variant="ghost" size="sm" class="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs" @click="handleDelete">Delete</Button>
        <div v-else />
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" class="text-xs rounded-full px-5" @click="tryClose">Cancel</Button>
          <Button size="sm" class="text-xs rounded-full px-5" @click="handleSave">
            {{ form.category === 'appointment' ? 'Create slot' : isEditing ? 'Save changes' : 'Save event' }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Delete event confirmation -->
  <AlertDialog :open="showDeleteConfirm" @update:open="(v) => { if (!v) showDeleteConfirm = false }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete event?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete the event. This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="showDeleteConfirm = false">Cancel</AlertDialogCancel>
        <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="confirmDelete">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- Discard changes confirmation -->
  <AlertDialog :open="showDiscardConfirm" @update:open="(v) => { if (!v) showDiscardConfirm = false }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
        <AlertDialogDescription>
          You have unsaved changes. Are you sure you want to discard them? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="showDiscardConfirm = false">Keep editing</AlertDialogCancel>
        <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="confirmDiscard">Discard</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
