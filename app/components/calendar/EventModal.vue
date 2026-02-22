<script setup lang="ts">
import { X, Clock, User, MapPin, AlignLeft, Bell, Eye, Video, Target, Link2, CalendarDays, Repeat } from 'lucide-vue-next'
import type { CalendarEvent } from '~/composables/useCalendar'

const { modalOpen, editingEvent, pendingRange, draftData, saveEvent, deleteEvent, checkConflict, getConflictingEvents, deleteEvents, mockPatients } = useCalendar()

// ── Form ──────────────────────────────────────────────────────────────────────
const form = reactive({
  category:            'session' as CalendarEvent['category'],
  title:               '',
  date:                '',
  startTime:           '',
  endTime:             '',
  allDay:              false,
  patientId:           '',
  patientName:         '',
  modality:            'online' as 'online' | 'inperson',
  meetingLinkEnabled:  false,
  meetingLink:         '',
  location:            '',
  recurrence:          'none' as NonNullable<CalendarEvent['recurrence']>,
  done:                false,
  description:         '',
  notification:        -1 as number,
  visibility:          'default' as 'default' | 'public' | 'private',
  deadline:            '',
  // OOO
  declineMode:         'all' as 'none' | 'new-only' | 'all',
  oooMessage:          'I am currently out of the office.',
  // Focus
  focusDnd:            true,
  focusDeclineInvites: false,
  // Appointment
  appointmentDuration: 30,
  bookingLink:         '',
})

const patientSearch         = ref('')
const showPatientDropdown   = ref(false)
const showOooConflictDialog = ref(false)
const oooConflicts          = ref<CalendarEvent[]>([])
const pendingSave            = ref<Parameters<typeof saveEvent>[0] | null>(null)

// ── Category config ───────────────────────────────────────────────────────────
const categories = [
  { value: 'session'     as const, label: 'Session',        activeClass: 'bg-indigo-600 text-white dark:bg-indigo-500'    },
  { value: 'ooo'         as const, label: 'Out of Office',  activeClass: 'bg-amber-500 text-white'                         },
  { value: 'meeting'     as const, label: 'Meeting',        activeClass: 'bg-sky-600 text-white dark:bg-sky-500'           },
  { value: 'focus'       as const, label: 'Focus Time',     activeClass: 'bg-violet-600 text-white dark:bg-violet-500'    },
  { value: 'task'        as const, label: 'Task',           activeClass: 'bg-emerald-600 text-white dark:bg-emerald-500'  },
  { value: 'appointment' as const, label: 'Appointments',  activeClass: 'bg-teal-600 text-white dark:bg-teal-500'         },
]

// ── Derived ───────────────────────────────────────────────────────────────────
const isEditing = computed(() => !!editingEvent.value)

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
  const q = patientSearch.value.trim().toLowerCase()
  return q ? mockPatients.filter(p => p.name.toLowerCase().includes(q) && p.name !== patientSearch.value) : []
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeFromIso = (iso: string) => iso.split('T')[1]?.slice(0, 5) ?? ''
const dateFromIso = (iso: string) => iso.split('T')[0] ?? ''

function generateMeetingLink() {
  return `https://meet.noeia.app/${Math.random().toString(36).slice(2, 10)}`
}

function generateBookingLink() {
  return `https://book.noeia.app/${Math.random().toString(36).slice(2, 8)}`
}

function resetForm() {
  Object.assign(form, {
    category: 'session', title: '', date: '', startTime: '', endTime: '', allDay: false,
    patientId: '', patientName: '', modality: 'online', meetingLinkEnabled: false, meetingLink: '',
    location: '', recurrence: 'none', done: false, description: '', notification: -1,
    visibility: 'default', deadline: '', declineMode: 'all', oooMessage: 'I am currently out of the office.',
    focusDnd: true, focusDeclineInvites: false, appointmentDuration: 30, bookingLink: '',
  })
  patientSearch.value = ''
  showPatientDropdown.value = false
}

// ── OOO: auto-fill title ──────────────────────────────────────────────────────
watch(() => form.category, (cat) => {
  if (cat === 'ooo'   && !form.title) form.title = 'Out of Office'
  if (cat === 'focus' && !form.title) form.title = 'Focus Time'
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
    form.appointmentDuration = ev.appointmentDuration ?? 30
    form.bookingLink         = ev.bookingLink ?? ''
    patientSearch.value      = ev.patientName ?? ''
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
    // Auto-fill OOO title on fresh create
    if (form.category === 'ooo' && !form.title)   form.title = 'Out of Office'
    if (form.category === 'focus' && !form.title) form.title = 'Focus Time'
    // Auto-generate booking link for appointments
    if (form.category === 'appointment' && !form.bookingLink) form.bookingLink = generateBookingLink()
  }
})

// ── Actions ───────────────────────────────────────────────────────────────────
function selectPatient(p: (typeof mockPatients)[number]) {
  form.patientId = p.id; form.patientName = p.name; patientSearch.value = p.name; showPatientDropdown.value = false
}
function onPatientBlur() { setTimeout(() => { showPatientDropdown.value = false }, 150) }

function toggleMeetingLink() {
  form.meetingLinkEnabled = !form.meetingLinkEnabled
  if (form.meetingLinkEnabled && !form.meetingLink) form.meetingLink = generateMeetingLink()
}

function buildEventData(): Parameters<typeof saveEvent>[0] {
  const start = form.allDay ? `${form.date}T00:00:00` : `${form.date}T${form.startTime}:00`
  const end   = form.allDay ? `${form.date}T23:59:59` : `${form.date}T${form.endTime}:00`
  const defaults: Record<string, string> = { session: form.patientName ? `Session – ${form.patientName}` : 'Session', ooo: 'Out of Office', meeting: 'Meeting', focus: 'Focus Time', task: 'Task', appointment: 'Appointment Slots' }
  return {
    id:                  editingEvent.value?.id,
    title:               form.title.trim() || defaults[form.category] || form.category,
    start, end,
    allDay:              form.allDay || undefined,
    category:            form.category,
    patientId:           form.category === 'session' && form.patientId   ? form.patientId   : undefined,
    patientName:         form.category === 'session' && form.patientName ? form.patientName : undefined,
    modality:            form.category === 'session' ? form.modality : undefined,
    meetingLink:         form.category === 'session' && form.meetingLinkEnabled && form.meetingLink ? form.meetingLink : undefined,
    location:            form.location   || undefined,
    recurrence:          form.recurrence,
    done:                form.category === 'task' ? form.done : undefined,
    description:         form.description || undefined,
    notification:        form.notification >= 0 ? form.notification : undefined,
    visibility:          form.visibility !== 'default' ? form.visibility : undefined,
    deadline:            form.category === 'task' && form.deadline ? form.deadline : undefined,
    declineMode:         form.category === 'ooo' ? form.declineMode : undefined,
    oooMessage:          form.category === 'ooo' && form.declineMode !== 'none' ? form.oooMessage : undefined,
    focusDnd:            form.category === 'focus' ? form.focusDnd : undefined,
    focusDeclineInvites: form.category === 'focus' ? form.focusDeclineInvites : undefined,
    appointmentDuration: form.category === 'appointment' ? form.appointmentDuration : undefined,
    bookingLink:         form.category === 'appointment' ? form.bookingLink : undefined,
  }
}

function handleSave() {
  // OOO: check for conflicts and prompt
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
  if (editingEvent.value && confirm('Delete this event?')) deleteEvent(editingEvent.value.id)
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-4 px-4 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="modalOpen = false" />

        <!-- OOO Conflict Dialog -->
        <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
          <div v-if="showOooConflictDialog" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-black/60" @click="showOooConflictDialog = false" />
            <div class="relative z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full ring-1 ring-slate-900/5 dark:ring-slate-700/50">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">Conflicting events found</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">You have {{ oooConflicts.length }} event{{ oooConflicts.length > 1 ? 's' : '' }} during your Out of Office time:</p>
              <ul class="space-y-1 mb-4 max-h-32 overflow-y-auto">
                <li v-for="ev in oooConflicts" :key="ev.id" class="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{{ ev.title }}
                </li>
              </ul>
              <p class="text-xs text-slate-600 dark:text-slate-300 mb-4">Would you like to cancel these events?</p>
              <div class="flex gap-2">
                <button class="flex-1 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click="confirmOooSave(false)">Keep them</button>
                <button class="flex-1 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" @click="confirmOooSave(true)">Cancel events</button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Modal -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0" appear>
          <div class="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-slate-700/50 flex flex-col max-h-[88vh]" @click.stop>

            <!-- Header -->
            <div class="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0">
              <button class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors" @click="modalOpen = false">
                <X class="w-5 h-5" />
              </button>
              <input
                v-model="form.title"
                type="text"
                :placeholder="form.category === 'ooo' ? 'Out of Office' : form.category === 'focus' ? 'Focus Time' : 'Add title'"
                class="flex-1 text-2xl font-normal text-slate-800 dark:text-slate-100 bg-transparent border-b-2 border-indigo-500 focus:outline-none pb-1 placeholder:text-slate-300 dark:placeholder:text-slate-500"
              />
            </div>

            <!-- Category tabs -->
            <div class="flex gap-1 px-5 pb-3 flex-wrap shrink-0">
              <button
                v-for="cat in categories"
                :key="cat.value"
                :class="['px-3 py-1.5 rounded-full text-xs font-semibold transition-colors', form.category === cat.value ? cat.activeClass : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="form.category = cat.value"
              >
                {{ cat.label }}
              </button>
            </div>

            <!-- Scrollable body -->
            <div class="flex-1 overflow-y-auto px-5 pb-2 space-y-4 min-h-0">

              <!-- ── Time section ─────────────────────────────────────────── -->
              <div class="space-y-3 pt-1">
                <!-- Date + Times row -->
                <div class="flex items-center gap-2 flex-wrap">
                  <Clock class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <input v-model="form.date" type="date" :disabled="form.allDay" class="px-2.5 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" />
                  <template v-if="!form.allDay">
                    <input v-model="form.startTime" type="time" class="px-2.5 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <span class="text-slate-400 dark:text-slate-500 text-sm">–</span>
                    <input v-model="form.endTime" type="time" class="px-2.5 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <span v-if="duration" class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ duration }}</span>
                  </template>
                </div>
                <!-- All day + Recurrence row -->
                <div class="flex items-center gap-4 pl-6 flex-wrap">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="form.allDay" type="checkbox" class="w-3.5 h-3.5 rounded accent-indigo-600" />
                    <span class="text-xs text-slate-600 dark:text-slate-400">All day</span>
                  </label>
                  <div class="flex items-center gap-2">
                    <Repeat class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <select v-model="form.recurrence" class="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="none">Doesn't repeat</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- ── SESSION fields ───────────────────────────────────────── -->
              <template v-if="form.category === 'session'">
                <!-- Patient -->
                <div class="flex items-start gap-3">
                  <User class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-2" />
                  <div class="flex-1 relative">
                    <input v-model="patientSearch" type="text" placeholder="Search patient…" autocomplete="off" class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500" @focus="showPatientDropdown = true" @blur="onPatientBlur" @input="() => { form.patientId = ''; form.patientName = '' }" />
                    <div v-if="showPatientDropdown && filteredPatients.length" class="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden">
                      <button v-for="p in filteredPatients" :key="p.id" class="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200" @mousedown.prevent="selectPatient(p)">{{ p.name }}</button>
                    </div>
                  </div>
                </div>
                <!-- Modality -->
                <div class="flex gap-2 pl-7">
                  <button :class="['flex-1 py-2 text-xs rounded-lg font-medium border transition-colors', form.modality === 'online' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600']" @click="form.modality = 'online'">Online</button>
                  <button :class="['flex-1 py-2 text-xs rounded-lg font-medium border transition-colors', form.modality === 'inperson' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600']" @click="form.modality = 'inperson'">In-person</button>
                </div>
                <!-- Location (in-person) -->
                <div v-if="form.modality === 'inperson'" class="flex items-center gap-3">
                  <MapPin class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <select v-model="form.location" class="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select location…</option>
                    <option>Room 101</option>
                    <option>Room 102</option>
                    <option>Main Street Clinic</option>
                  </select>
                </div>
                <!-- Online meeting link -->
                <div v-if="form.modality === 'online'" class="flex items-center gap-3">
                  <Video class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <div class="flex-1">
                    <button v-if="!form.meetingLinkEnabled" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline" @click="toggleMeetingLink">+ Add online meeting link</button>
                    <div v-else class="flex items-center gap-2">
                      <input v-model="form.meetingLink" type="url" class="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" readonly />
                      <button class="text-xs text-slate-400 hover:text-red-500 transition-colors" @click="form.meetingLinkEnabled = false; form.meetingLink = ''">Remove</button>
                    </div>
                  </div>
                </div>
              </template>

              <!-- ── OOO fields ────────────────────────────────────────────── -->
              <template v-if="form.category === 'ooo'">
                <div class="space-y-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p class="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Decline meetings</p>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="form.declineMode" type="radio" value="none" class="accent-amber-600" />
                    <span class="text-sm text-slate-700 dark:text-slate-200">Don't auto-decline</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="form.declineMode" type="radio" value="new-only" class="accent-amber-600" />
                    <span class="text-sm text-slate-700 dark:text-slate-200">New invitations only</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="form.declineMode" type="radio" value="all" class="accent-amber-600" />
                    <span class="text-sm text-slate-700 dark:text-slate-200">New invitations and existing sessions</span>
                  </label>
                  <div v-if="form.declineMode !== 'none'" class="mt-2">
                    <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Decline message</label>
                    <textarea v-model="form.oooMessage" rows="2" class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
                  </div>
                </div>
              </template>

              <!-- ── FOCUS fields ──────────────────────────────────────────── -->
              <template v-if="form.category === 'focus'">
                <div class="space-y-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
                  <p class="text-xs font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wide">Focus settings</p>
                  <label class="flex items-center justify-between cursor-pointer">
                    <span class="text-sm text-slate-700 dark:text-slate-200">Do Not Disturb mode</span>
                    <button role="switch" :aria-checked="form.focusDnd" :class="['relative w-9 h-5 rounded-full transition-colors duration-200', form.focusDnd ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-600']" @click="form.focusDnd = !form.focusDnd">
                      <span :class="['absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200', form.focusDnd ? 'translate-x-4' : 'translate-x-0']" />
                    </button>
                  </label>
                  <label class="flex items-center justify-between cursor-pointer">
                    <span class="text-sm text-slate-700 dark:text-slate-200">Auto-decline new invitations</span>
                    <button role="switch" :aria-checked="form.focusDeclineInvites" :class="['relative w-9 h-5 rounded-full transition-colors duration-200', form.focusDeclineInvites ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-600']" @click="form.focusDeclineInvites = !form.focusDeclineInvites">
                      <span :class="['absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200', form.focusDeclineInvites ? 'translate-x-4' : 'translate-x-0']" />
                    </button>
                  </label>
                </div>
              </template>

              <!-- ── TASK fields ────────────────────────────────────────────── -->
              <template v-if="form.category === 'task'">
                <div class="flex items-center gap-3">
                  <Target class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <div class="flex-1">
                    <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Deadline (optional)</label>
                    <input v-model="form.deadline" type="date" class="px-2.5 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <label class="flex items-center gap-2.5 pl-7 cursor-pointer">
                  <input v-model="form.done" type="checkbox" class="w-4 h-4 rounded accent-emerald-600" />
                  <span class="text-sm text-slate-700 dark:text-slate-200">Mark as done</span>
                </label>
              </template>

              <!-- ── APPOINTMENT fields ──────────────────────────────────────── -->
              <template v-if="form.category === 'appointment'">
                <div class="space-y-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4">
                  <p class="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wide">Appointment slot settings</p>
                  <div>
                    <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Session duration</label>
                    <select v-model="form.appointmentDuration" class="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option :value="15">15 minutes</option>
                      <option :value="30">30 minutes</option>
                      <option :value="45">45 minutes</option>
                      <option :value="50">50 minutes</option>
                      <option :value="60">1 hour</option>
                      <option :value="90">1.5 hours</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Booking link</label>
                    <div class="flex items-center gap-2">
                      <input :value="form.bookingLink" readonly class="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 focus:outline-none" />
                      <button class="px-2.5 py-2 text-xs text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-700 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors" @click="navigator.clipboard?.writeText(form.bookingLink)">Copy</button>
                    </div>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                    <span class="mt-0.5">ℹ️</span>
                    Share this link with patients so they can book within this time slot.
                  </p>
                </div>
              </template>

              <!-- ── Location (non-session) ──────────────────────────────────── -->
              <div v-if="form.category !== 'session' && form.category !== 'appointment'" class="flex items-center gap-3">
                <MapPin class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <input v-model="form.location" type="text" placeholder="Add location" class="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
              </div>

              <!-- ── Notifications ───────────────────────────────────────────── -->
              <div class="flex items-center gap-3">
                <Bell class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <select v-model="form.notification" class="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option :value="-1">No notification</option>
                  <option :value="0">At event time</option>
                  <option :value="5">5 minutes before</option>
                  <option :value="10">10 minutes before</option>
                  <option :value="15">15 minutes before</option>
                  <option :value="30">30 minutes before</option>
                  <option :value="60">1 hour before</option>
                  <option :value="1440">1 day before</option>
                </select>
              </div>

              <!-- ── Visibility ─────────────────────────────────────────────── -->
              <div class="flex items-center gap-3">
                <Eye class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <select v-model="form.visibility" class="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="default">Default visibility</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <!-- ── Description ────────────────────────────────────────────── -->
              <div class="flex items-start gap-3">
                <AlignLeft class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-2" />
                <textarea v-model="form.description" placeholder="Add description or notes…" rows="3" class="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
              </div>

              <!-- ── Conflict warning ────────────────────────────────────────── -->
              <div v-if="hasConflict" class="flex items-start gap-2.5 px-3 py-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                <span class="text-red-500 dark:text-red-400 text-sm mt-0.5">⚠</span>
                <p class="text-xs text-red-600 dark:text-red-400 leading-relaxed">This time overlaps with another event. You can still save.</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
              <button v-if="isEditing" class="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors" @click="handleDelete">Delete</button>
              <div v-else />
              <div class="flex items-center gap-2">
                <button class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" @click="modalOpen = false">Cancel</button>
                <button class="px-5 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors shadow-sm" @click="handleSave">
                  {{ form.category === 'appointment' ? 'Create slot' : 'Save event' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
