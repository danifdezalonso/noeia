<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { X, Clock, User, MapPin, AlignLeft, Stethoscope, Link2, CalendarDays, Video, Users, ChevronDown } from 'lucide-vue-next'
import { parseDate } from '@internationalized/date'
import type { DateValue } from 'reka-ui'
import type { CalendarEvent } from '~/composables/useCalendar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '~/components/ui/popover'
import { DialogHeader, DialogFooter } from '~/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Calendar } from '~/components/ui/calendar'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'

const cal = useCalendar()
const { quickModalOpen, quickModalPos, pendingRange, pendingAllDay, saveEvent, openFullModal, mockPatients } = cal
const { persona } = usePersona()

const orgDoctors = [
  { id: 'd1', name: 'Dr. Elena Voss' },
  { id: 'd2', name: 'Dr. Marco Silva' },
  { id: 'd3', name: 'Dr. Priya Nair' },
  { id: 'd4', name: 'Dr. James Okafor' },
  { id: 'd5', name: 'Dr. Sofia Reyes' },
  { id: 'd6', name: 'Dr. Lena Brandt' },
  { id: 'd7', name: 'Dr. Aarav Patel' },
]

const DOCTOR_HEX: Record<string, string> = {
  d1: '#6366f1', d2: '#0ea5e9', d3: '#22c55e',
  d4: '#f59e0b', d5: '#ef4444', d6: '#8b5cf6', d7: '#14b8a6',
}

const PLATFORMS = [
  { value: 'google-meet', label: 'Google Meet',     placeholder: 'meet.google.com/xxx-xxxx-xxx' },
  { value: 'zoom',        label: 'Zoom',            placeholder: 'zoom.us/j/0000000000' },
  { value: 'teams',       label: 'Microsoft Teams', placeholder: 'teams.microsoft.com/l/...' },
  { value: 'webex',       label: 'Webex',           placeholder: 'webex.com/meet/...' },
  { value: 'custom',      label: 'Custom link',     placeholder: 'https://...' },
]

const LOCATION_OPTIONS = [
  { value: 'Room 101',           label: 'Room 101' },
  { value: 'Room 102',           label: 'Room 102' },
  { value: 'Main Street Clinic', label: 'Main Street Clinic' },
]

// ── Form ──────────────────────────────────────────────────────────────────────
const form = reactive({
  category: 'session' as CalendarEvent['category'],
  title: '',
  patientId: '',
  patientName: '',
  modality: 'online' as 'online' | 'inperson',
  location: '',
  description: '',
  doctorId: '',
  doctorName: '',
  linkedSessionId: '',
  meetingPlatform: '',
  meetingLink: '',
  allDay: false,
  date: '',
  startTime: '',
  endTime: '',
})

const invitees     = ref<string[]>([])
const inviteeInput = ref('')

const patientSearch       = ref('')
const showPatientDropdown = ref(false)
const titleInputRef       = ref<HTMLInputElement>()
const patientInputRef     = ref<HTMLInputElement>()
const titleManuallyEdited = ref(false)
const showDiscardConfirm  = ref(false)
const patientError        = ref(false)

// ── Category config ───────────────────────────────────────────────────────────
const categories = [
  { value: 'session'       as const, label: 'Session',       hexColor: '#4f46e5' },
  { value: 'ooo'           as const, label: 'Out of Office', hexColor: '#f59e0b' },
  { value: 'meeting'       as const, label: 'Meeting',       hexColor: '#0284c7' },
  { value: 'focus'         as const, label: 'Focus Time',    hexColor: '#7c3aed' },
  { value: 'task'          as const, label: 'Task',          hexColor: '#16a34a' },
  { value: 'appointment'   as const, label: 'Appointments',  hexColor: '#0d9488' },
  { value: 'documentation' as const, label: 'Documentation', hexColor: '#64748b' },
]

const activeCategory      = computed(() => categories.find(c => c.value === form.category))
const activeCategoryColor = computed(() => activeCategory.value?.hexColor ?? '#6b7280')
const activeCategoryLabel = computed(() => activeCategory.value?.label ?? '')

function setCategory(val: CalendarEvent['category']) { form.category = val }

// ── Positioning (anchor to click coordinates) ─────────────────────────────────
const popoverStyle = computed(() => {
  const pos = quickModalPos.value
  if (!pos || typeof window === 'undefined') return {}
  const W = 368; const estH = 520; const m = 12
  let left = pos.x + 14
  let top  = pos.y - 60
  if (left + W > window.innerWidth  - m) left = pos.x - W - 14
  left = Math.max(m, left)
  top  = Math.max(56 + m, Math.min(window.innerHeight - estH - m, top))
  // transform: 'none' cancels Dialog's default translate(-50%,-50%) centering
  return { left: `${left}px`, top: `${top}px`, width: `${W}px`, transform: 'none' }
})

// ── Field visibility ──────────────────────────────────────────────────────────
const showModality      = computed(() => form.category === 'session' || form.category === 'meeting')
const showLocation      = computed(() => showModality.value && form.modality === 'inperson')
const showOnlineMeeting = computed(() => showModality.value && form.modality === 'online')
const showDescription   = computed(() => form.category !== 'appointment')
const showAllDay        = computed(() => form.category === 'meeting')
const showInvitees      = computed(() => form.category === 'meeting')
const activePlatform    = computed(() => PLATFORMS.find(p => p.value === form.meetingPlatform))
const platformLabel     = computed(() => activePlatform.value?.label ?? 'Platform')
const platformPlaceholder = computed(() => activePlatform.value?.placeholder ?? 'Paste meeting link')
const locationLabel       = computed(() => LOCATION_OPTIONS.find(o => o.value === form.location)?.label ?? 'Select office…')

// ── Default titles per category ───────────────────────────────────────────────
const CATEGORY_DEFAULTS: Partial<Record<CalendarEvent['category'], string>> = {
  ooo: 'Out of Office', meeting: 'Meeting', focus: 'Focus Time',
  documentation: 'Documentation', task: 'Task', appointment: 'Appointment Slots',
}

// ── Dirty check ───────────────────────────────────────────────────────────────
const isDirty = computed(() => {
  if (form.category === 'session') {
    return !!(form.patientId || patientSearch.value.trim() || form.location || form.description || (titleManuallyEdited.value && form.title))
  }
  const defaultTitle = CATEGORY_DEFAULTS[form.category] ?? ''
  return !!(form.title !== defaultTitle || form.location || form.description)
})

// ── Auto-fill title when patient / doctor change (session) ────────────────────
watch([() => form.patientName, () => form.doctorName], ([patient, doctor]) => {
  if (form.category !== 'session' || titleManuallyEdited.value) return
  const drName = doctor || (persona.role === 'doctor' ? persona.name : '')
  form.title = patient ? (drName ? `${patient} <> ${drName}` : patient) : ''
})

// ── Auto-fill title when switching categories ─────────────────────────────────
watch(() => form.category, (cat) => {
  titleManuallyEdited.value = false
  if (cat === 'session') {
    form.allDay = false
    const drName = form.doctorName || (persona.role === 'doctor' ? persona.name : '')
    form.title = form.patientName ? (drName ? `${form.patientName} <> ${drName}` : form.patientName) : ''
  } else {
    form.allDay = pendingAllDay.value
    form.title = CATEGORY_DEFAULTS[cat] ?? ''
  }
})

// ── Documentation: auto-update title from linked session ──────────────────────
watch(() => form.linkedSessionId, (id) => {
  if (form.category !== 'documentation' || titleManuallyEdited.value) return
  if (!id) { form.title = 'Documentation'; return }
  const session = cal.events.value.find(e => e.id === id)
  if (session) form.title = `Notes – ${session.patientName || session.title}`
})

// ── Session list for documentation link ───────────────────────────────────────
const sessionOptions = computed(() =>
  cal.events.value
    .filter(e => e.category === 'session')
    .sort((a, b) => b.start.localeCompare(a.start))
    .slice(0, 20)
    .map(e => ({
      id: e.id,
      label: `${e.title} · ${new Date(e.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    }))
)
const linkedSessionLabel = computed(() => sessionOptions.value.find(s => s.id === form.linkedSessionId)?.label ?? 'Link to session (optional)')

// ── Patient search ────────────────────────────────────────────────────────────
const filteredPatients = computed(() => {
  const q = patientSearch.value.trim().toLowerCase()
  if (!q) return mockPatients.filter(p => p.id !== form.patientId)
  return mockPatients.filter(p => p.name.toLowerCase().includes(q) && p.name !== patientSearch.value)
})
function selectPatient(p: (typeof mockPatients)[number]) {
  form.patientId = p.id
  form.patientName = p.name
  patientSearch.value = p.name
  showPatientDropdown.value = false
  patientError.value = false
}
function onPatientBlur() { setTimeout(() => { showPatientDropdown.value = false }, 150) }

// ── Date picker ───────────────────────────────────────────────────────────────
const datePickerOpen = ref(false)

const calendarValue = computed<DateValue | undefined>(() => {
  if (!form.date) return undefined
  try { return parseDate(form.date) } catch { return undefined }
})

function onDateSelect(val: DateValue | undefined) {
  if (!val) return
  form.date = `${val.year}-${String(val.month).padStart(2, '0')}-${String(val.day).padStart(2, '0')}`
}

const dateLabel = computed(() => {
  if (!form.date) return 'Pick date'
  try {
    return new Date(form.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  } catch { return form.date }
})

// ── Invitee helpers ───────────────────────────────────────────────────────────
function addInvitee() {
  const v = inviteeInput.value.trim().replace(/,$/, '')
  if (v && !invitees.value.includes(v)) invitees.value.push(v)
  inviteeInput.value = ''
}
function removeInvitee(i: number) { invitees.value.splice(i, 1) }

// ── Reset on close ────────────────────────────────────────────────────────────
watch(quickModalOpen, (open) => {
  if (!open) {
    Object.assign(form, {
      category: 'session', title: '', patientId: '', patientName: '',
      modality: 'online', location: '', description: '', doctorId: '', doctorName: '',
      linkedSessionId: '', meetingPlatform: '', meetingLink: '', allDay: false,
      date: '', startTime: '', endTime: '',
    })
    patientSearch.value = ''
    titleManuallyEdited.value = false
    showPatientDropdown.value = false
    showDiscardConfirm.value = false
    patientError.value = false
    invitees.value = []
    inviteeInput.value = ''
  } else {
    const r = pendingRange.value
    if (r) {
      form.date   = r.start.split('T')[0] ?? ''
      form.allDay = pendingAllDay.value
      if (!pendingAllDay.value) {
        form.startTime = r.start.split('T')[1]?.slice(0, 5) ?? '09:00'
        form.endTime   = r.end.split('T')[1]?.slice(0, 5) ?? '10:00'
      }
    }
    nextTick(() => {
      if (form.category === 'session') patientInputRef.value?.focus()
      else titleInputRef.value?.focus()
    })
  }
})

function close() { quickModalOpen.value = false }

function tryClose() {
  if (isDirty.value) { showDiscardConfirm.value = true } else { close() }
}

function confirmDiscard() {
  showDiscardConfirm.value = false
  close()
}

// ── Keyboard shortcuts ─────────────────────────────────────────────────────────
useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  if (!quickModalOpen.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    if (showDiscardConfirm.value) { showDiscardConfirm.value = false; return }
    tryClose()
    return
  }
  if (e.key === 'Enter') {
    if ((e.target as HTMLElement)?.tagName === 'TEXTAREA' && !e.metaKey && !e.ctrlKey) return
    if (document.querySelector('[role="menu"]')) return
    if ((e.target as HTMLElement)?.dataset?.inviteeInput) return
    e.preventDefault()
    handleSave()
  }
})

// ── Save ──────────────────────────────────────────────────────────────────────
function handleSave() {
  if (form.category === 'session' && !form.patientId) {
    patientError.value = true
    nextTick(() => patientInputRef.value?.focus())
    return
  }
  patientError.value = false
  if (!form.date) return
  const isAllDay = form.allDay
  let start: string
  let end: string
  if (isAllDay) {
    const d = new Date(form.date + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    const pad = (n: number) => String(n).padStart(2, '0')
    start = form.date
    end   = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  } else {
    start = `${form.date}T${form.startTime}:00`
    end   = `${form.date}T${form.endTime}:00`
  }
  const defaults: Record<string, string> = {
    session: form.patientName ? `Session – ${form.patientName}` : 'Session',
    ooo: 'Out of Office', task: 'Task', focus: 'Focus Time',
    appointment: 'Appointment Slots', documentation: 'Documentation',
  }
  saveEvent({
    title:           form.title.trim() || defaults[form.category] || form.category,
    start,
    end,
    category:        form.category as CalendarEvent['category'],
    patientId:       form.category === 'session' && form.patientId   ? form.patientId   : undefined,
    patientName:     form.category === 'session' && form.patientName ? form.patientName : undefined,
    modality:        showModality.value ? form.modality : undefined,
    location:        showLocation.value ? form.location || undefined : undefined,
    meetingLink:     showOnlineMeeting.value ? form.meetingLink || undefined : undefined,
    description:     showDescription.value ? form.description || undefined : undefined,
    allDay:          isAllDay ? true : undefined,
    invitees:        showInvitees.value && invitees.value.length ? [...invitees.value] : undefined,
    recurrence:      'none',
    done:            form.category === 'task' ? false : undefined,
    declineMode:     form.category === 'ooo' ? 'all' : undefined,
    doctorId:        form.doctorId   || undefined,
    doctorName:      form.doctorName || undefined,
    linkedSessionId: form.category === 'documentation' && form.linkedSessionId ? form.linkedSessionId : undefined,
  })
}

function handleMoreOptions() {
  const start = form.date ? `${form.date}T${form.startTime}:00` : pendingRange.value?.start
  const end   = form.date ? `${form.date}T${form.endTime}:00`   : pendingRange.value?.end
  openFullModal({
    category:    form.category as CalendarEvent['category'],
    title:       form.title,
    start,
    end,
    patientId:   form.patientId   || undefined,
    patientName: form.patientName || undefined,
    modality:    showModality.value ? form.modality : undefined,
    location:    showLocation.value ? form.location || undefined : undefined,
    description: showDescription.value ? form.description || undefined : undefined,
    doctorId:    form.doctorId    || undefined,
    doctorName:  form.doctorName  || undefined,
  })
}
</script>

<template>
  <Teleport to="body">
    <!-- Transparent backdrop — catches outside clicks to close -->
    <div v-if="quickModalOpen" class="fixed inset-0 z-40" @mousedown="tryClose" />

    <!-- Modal panel — positioned near the calendar click point -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="quickModalOpen"
        :style="popoverStyle"
        class="fixed z-50 bg-background border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        @mousedown.stop
      >
        <!-- Header: color dot + category label + close -->
        <DialogHeader class="flex-row items-center justify-between gap-0 px-4 pt-4 pb-0 space-y-0">
          <h2 class="text-sm font-semibold flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: activeCategoryColor }" />
            {{ activeCategoryLabel }}
          </h2>
          <Button variant="ghost" size="icon" class="rounded-full h-7 w-7 -mr-1 mt-0" @mousedown.stop="tryClose">
            <X class="w-4 h-4" />
          </Button>
        </DialogHeader>

        <!-- Category dropdown -->
        <div class="px-4 pt-2 pb-1">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="sm" class="h-8 px-2.5 bg-muted hover:bg-muted/80 gap-2 font-normal">
                <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: activeCategoryColor }" />
                {{ activeCategoryLabel }}
                <ChevronDown class="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="min-w-[170px]">
              <DropdownMenuItem
                v-for="cat in categories"
                :key="cat.value"
                class="gap-2"
                @select="setCategory(cat.value)"
              >
                <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: cat.hexColor }" />
                {{ cat.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto min-h-0">

          <!-- Session: patient search first, then auto-title -->
          <template v-if="form.category === 'session'">
            <div class="px-4 pb-3">
              <!-- Patient search — plain div dropdown (avoids reka blur-dismiss) -->
              <div class="relative">
                <User class="absolute left-0 top-[13px] w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  ref="patientInputRef"
                  v-model="patientSearch"
                  type="text"
                  placeholder="Search patient…"
                  autocomplete="off"
                  :class="['w-full pl-6 pr-6 text-[22px] font-normal bg-transparent border-b-2 focus:outline-none pb-1 placeholder:text-muted-foreground transition-colors', patientError ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-primary text-foreground']"
                  @focus="showPatientDropdown = true; patientError = false"
                  @blur="onPatientBlur"
                  @input="() => { form.patientId = ''; form.patientName = ''; patientError = false; showPatientDropdown = true }"
                />
                <button
                  type="button"
                  class="absolute right-0 top-[6px] h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  @mousedown.prevent="showPatientDropdown = !showPatientDropdown; if (showPatientDropdown) nextTick(() => patientInputRef?.focus())"
                >
                  <ChevronDown class="w-4 h-4 transition-transform" :class="showPatientDropdown ? 'rotate-180' : ''" />
                </button>
                <!-- Plain patient dropdown list -->
                <div
                  v-if="showPatientDropdown && filteredPatients.length"
                  class="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border border-border rounded-md shadow-lg py-1"
                >
                  <div
                    v-for="p in filteredPatients"
                    :key="p.id"
                    class="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    @mousedown.prevent="selectPatient(p)"
                  >
                    {{ p.name }}
                  </div>
                </div>
              </div>
              <p v-if="patientError" class="mt-1 text-xs text-red-500 font-medium">Patient is required to save a session.</p>
              <!-- Auto-generated title (secondary, editable) -->
              <input
                ref="titleInputRef"
                v-model="form.title"
                type="text"
                placeholder="Title (auto-filled from patient)"
                class="w-full mt-2 text-sm text-muted-foreground bg-transparent focus:outline-none focus:text-foreground placeholder:text-muted-foreground/50 transition-colors"
                @input="titleManuallyEdited = true"
              />
            </div>
          </template>

          <!-- Non-session: title first -->
          <div v-else class="px-4 pb-3">
            <input
              ref="titleInputRef"
              v-model="form.title"
              type="text"
              placeholder="Add title"
              class="w-full text-[22px] font-normal text-foreground bg-transparent border-b-2 border-primary focus:outline-none pb-1 placeholder:text-muted-foreground"
              @input="titleManuallyEdited = true"
            />
          </div>

          <!-- Fields -->
          <div class="px-4 pb-3 space-y-3">
            <!-- Date + time: button group → opens calendar+time popover -->
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-muted-foreground shrink-0" />
              <Popover v-model:open="datePickerOpen">
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    size="sm"
                    class="h-8 px-0 gap-0 overflow-hidden rounded-full font-normal text-sm border-border"
                  >
                    <span class="px-3 border-r border-border font-medium text-foreground">{{ dateLabel }}</span>
                    <span class="px-3 text-muted-foreground">{{ form.startTime || '—' }} – {{ form.endTime || '—' }}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-72 p-0 shadow-xl overflow-hidden" align="start" :side-offset="8" @mousedown.stop>
                  <Calendar :model-value="calendarValue" :initial-focus="true" @update:model-value="onDateSelect" />
                  <div class="border-t border-border px-3 pt-3 pb-3 space-y-2.5">
                    <div>
                      <p class="text-xs font-medium text-muted-foreground mb-1.5">Start Time</p>
                      <div class="relative">
                        <Clock class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <input v-model="form.startTime" type="time" class="time-input w-full pl-9 pr-3 h-9 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                      </div>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-muted-foreground mb-1.5">End Time</p>
                      <div class="relative">
                        <Clock class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <input v-model="form.endTime" type="time" class="time-input w-full pl-9 pr-3 h-9 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <!-- All-day (meeting only) -->
            <div v-if="showAllDay" class="flex items-center gap-3">
              <CalendarDays class="w-4 h-4 text-muted-foreground shrink-0" />
              <label class="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" v-model="form.allDay" class="rounded" />
                All day
              </label>
            </div>

            <!-- Doctor select (session + org) -->
            <template v-if="form.category === 'session' && persona.role === 'organization'">
              <div class="flex items-center gap-3">
                <Stethoscope class="w-4 h-4 text-muted-foreground shrink-0" />
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="outline" size="sm" class="flex-1 h-8 justify-between font-normal text-sm">
                      <span class="flex items-center gap-2 min-w-0">
                        <span v-if="form.doctorId" class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: DOCTOR_HEX[form.doctorId] }" />
                        <span class="truncate">{{ form.doctorName || 'Select doctor' }}</span>
                      </span>
                      <ChevronDown class="w-3 h-3 text-muted-foreground shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width]">
                    <DropdownMenuItem class="text-muted-foreground" @select="form.doctorId = ''; form.doctorName = ''">
                      Select doctor
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      v-for="d in orgDoctors"
                      :key="d.id"
                      class="gap-2"
                      @select="form.doctorId = d.id; form.doctorName = d.name"
                    >
                      <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: DOCTOR_HEX[d.id] }" />
                      {{ d.name }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </template>

            <!-- Modality toggle (session or meeting) — shadcn Tabs -->
            <Tabs v-if="showModality" :model-value="form.modality" @update:model-value="(v) => form.modality = v as 'online' | 'inperson'">
              <TabsList class="w-full">
                <TabsTrigger value="online" class="flex-1 text-xs">Online</TabsTrigger>
                <TabsTrigger value="inperson" class="flex-1 text-xs">In-person</TabsTrigger>
              </TabsList>
            </Tabs>

            <!-- Location (inperson only) — office dropdown -->
            <div v-if="showLocation" class="flex items-center gap-3">
              <MapPin class="w-4 h-4 text-muted-foreground shrink-0" />
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline" size="sm" class="flex-1 h-8 justify-between font-normal text-sm">
                    <span class="truncate">{{ locationLabel }}</span>
                    <ChevronDown class="w-3 h-3 text-muted-foreground shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width]">
                  <DropdownMenuItem class="text-muted-foreground" @select="form.location = ''">Select office…</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem v-for="o in LOCATION_OPTIONS" :key="o.value" @select="form.location = o.value">{{ o.label }}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <!-- Online meeting (online only) -->
            <div v-if="showOnlineMeeting" class="flex items-center gap-3">
              <Video class="w-4 h-4 text-muted-foreground shrink-0" />
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline" size="sm" class="h-8 w-36 shrink-0 justify-between font-normal text-sm">
                    {{ platformLabel }}
                    <ChevronDown class="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    v-for="p in PLATFORMS"
                    :key="p.value"
                    @select="form.meetingPlatform = p.value"
                  >
                    {{ p.label }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input v-model="form.meetingLink" :placeholder="platformPlaceholder" class="flex-1 h-8 text-sm border-transparent hover:border-input focus:border-input bg-transparent focus:bg-background" />
            </div>

            <!-- Invitees (meeting only) -->
            <div v-if="showInvitees" class="flex items-start gap-3">
              <Users class="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
              <div class="flex-1">
                <div v-if="invitees.length" class="flex flex-wrap gap-1 mb-1.5">
                  <span
                    v-for="(inv, i) in invitees"
                    :key="i"
                    class="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700"
                  >
                    {{ inv }}
                    <button type="button" class="h-4 w-4 flex items-center justify-center rounded-full hover:bg-sky-200 text-sky-600" @mousedown.prevent="removeInvitee(i)">
                      <X class="w-2.5 h-2.5" />
                    </button>
                  </span>
                </div>
                <input
                  v-model="inviteeInput"
                  type="text"
                  placeholder="Invite people (press Enter)"
                  class="w-full text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground"
                  data-invitee-input="true"
                  @keydown.enter.stop.prevent="addInvitee"
                  @keydown="(e) => { if (e.key === ',') { e.preventDefault(); addInvitee() } }"
                />
              </div>
            </div>

            <!-- OOO info note -->
            <div v-if="form.category === 'ooo'" class="ml-7 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
              Colleagues will see you're unavailable. Use <strong>More options</strong> to configure meeting decline settings.
            </div>

            <!-- Focus info note -->
            <div v-if="form.category === 'focus'" class="ml-7 text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-lg px-3 py-2">
              Focus time blocks distractions. Configure DND & auto-decline in <strong>More options</strong>.
            </div>

            <!-- Appointment info note -->
            <div v-if="form.category === 'appointment'" class="ml-7 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-lg px-3 py-2">
              Create a bookable slot. A shareable link will be generated. Configure in <strong>More options</strong>.
            </div>

            <!-- Documentation: linked session picker -->
            <template v-if="form.category === 'documentation'">
              <div class="flex items-center gap-3">
                <Link2 class="w-4 h-4 text-muted-foreground shrink-0" />
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="outline" size="sm" class="flex-1 h-8 justify-between font-normal text-sm min-w-0">
                      <span class="truncate">{{ linkedSessionLabel }}</span>
                      <ChevronDown class="w-3 h-3 text-muted-foreground shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width]">
                    <DropdownMenuItem class="text-muted-foreground" @select="form.linkedSessionId = ''">
                      Link to session (optional)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator v-if="sessionOptions.length" />
                    <DropdownMenuItem
                      v-for="s in sessionOptions"
                      :key="s.id"
                      @select="form.linkedSessionId = s.id"
                    >
                      {{ s.label }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div class="ml-7 text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-2">
                When linked, billing will count <strong>session + documentation</strong> time together.
              </div>
            </template>

            <!-- Description (all except appointment) -->
            <div v-if="showDescription" class="flex items-start gap-3">
              <AlignLeft class="w-4 h-4 text-muted-foreground shrink-0 mt-1.5" />
              <Textarea v-model="form.description" placeholder="Add description" :rows="2" class="flex-1 text-sm border-transparent hover:border-input focus:border-input bg-transparent focus:bg-background resize-none min-h-0" />
            </div>
          </div>

        </div><!-- end scrollable -->

        <!-- Footer — sticky -->
        <DialogFooter class="px-4 py-3 border-t border-border sm:justify-between items-center shrink-0">
          <Button variant="link" class="text-sm p-0 h-auto" @click="handleMoreOptions">More options</Button>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" class="rounded-full px-4 text-xs" @click="tryClose">Cancel</Button>
            <Button size="sm" class="rounded-full px-4 text-xs" @click="handleSave">Save</Button>
          </div>
        </DialogFooter>
      </div>
    </Transition>

    <!-- Discard changes confirmation -->
    <AlertDialog :open="showDiscardConfirm" @update:open="(v) => { if (!v) showDiscardConfirm = false }">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Are you sure you want to discard them?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDiscardConfirm = false">Keep editing</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="confirmDiscard">Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Teleport>
</template>

<style scoped>
/* Hide the native browser clock/picker icon inside <input type="time"> */
.time-input::-webkit-calendar-picker-indicator {
  display: none;
}
</style>
