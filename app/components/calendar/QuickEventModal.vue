<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { X, Clock, User, MapPin, AlignLeft, Stethoscope, Link2 } from 'lucide-vue-next'
import type { CalendarEvent } from '~/composables/useCalendar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'

const cal = useCalendar()
const { quickModalOpen, quickModalPos, pendingRange, saveEvent, openFullModal, mockPatients } = cal
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
})

const patientSearch        = ref('')
const showPatientDropdown  = ref(false)
const titleInputRef        = ref<HTMLInputElement>()
const patientInputRef      = ref<HTMLInputElement>()
const titleManuallyEdited  = ref(false)
const showDiscardConfirm   = ref(false)
const patientError         = ref(false)

// ── Category config ───────────────────────────────────────────────────────────
const categories = [
  { value: 'session'       as const, label: 'Session',       activeClass: 'bg-primary text-primary-foreground'           },
  { value: 'ooo'           as const, label: 'Out of Office', activeClass: 'bg-amber-500 text-white'                      },
  { value: 'meeting'       as const, label: 'Meeting',       activeClass: 'bg-sky-600 text-white'                        },
  { value: 'focus'         as const, label: 'Focus Time',    activeClass: 'bg-violet-600 text-white'                     },
  { value: 'task'          as const, label: 'Task',          activeClass: 'bg-emerald-600 text-white'                    },
  { value: 'appointment'   as const, label: 'Appointments',  activeClass: 'bg-teal-600 text-white'                       },
  { value: 'documentation' as const, label: 'Documentation', activeClass: 'bg-slate-600 text-white'                      },
]

// ── Positioning ───────────────────────────────────────────────────────────────
const popoverStyle = computed(() => {
  const pos = quickModalPos.value
  if (!pos || typeof window === 'undefined') return {}
  const W = 368; const estH = 480; const m = 12
  let left = pos.x + 14
  let top  = pos.y - 60
  if (left + W > window.innerWidth  - m) left = pos.x - W - 14
  left = Math.max(m, left)
  top  = Math.max(56 + m, Math.min(window.innerHeight - estH - m, top))
  return { left: `${left}px`, top: `${top}px`, width: `${W}px` }
})

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
  // Always reset manual-edit flag on tab switch so new tab gets fresh auto-fill
  titleManuallyEdited.value = false
  if (cat === 'session') {
    const drName = form.doctorName || (persona.role === 'doctor' ? persona.name : '')
    form.title = form.patientName ? (drName ? `${form.patientName} <> ${drName}` : form.patientName) : ''
  } else {
    form.title = CATEGORY_DEFAULTS[cat] ?? ''
  }
})

// ── Session list for documentation link ──────────────────────────────────────
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

// ── Time display ──────────────────────────────────────────────────────────────
function fmt12(t: string): string {
  if (!t) return ''
  const [h = 0, m = 0] = t.split(':').map(Number)
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12  = h % 12 || 12
  return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${ampm}`
}

const timeDisplay = computed(() => {
  const r = pendingRange.value
  if (!r) return ''
  const dateStr = new Date(r.start.split('T')[0]! + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const s = r.start.split('T')[1]?.slice(0, 5) ?? ''
  const e = r.end.split('T')[1]?.slice(0, 5) ?? ''
  return `${dateStr}, ${fmt12(s)} – ${fmt12(e)}`
})

// ── Patient search ────────────────────────────────────────────────────────────
const filteredPatients = computed(() => {
  const q = patientSearch.value.trim().toLowerCase()
  return q ? mockPatients.filter(p => p.name.toLowerCase().includes(q) && p.name !== patientSearch.value) : []
})
function selectPatient(p: (typeof mockPatients)[number]) {
  form.patientId = p.id; form.patientName = p.name; patientSearch.value = p.name; showPatientDropdown.value = false; patientError.value = false
}
function onPatientBlur() { setTimeout(() => { showPatientDropdown.value = false }, 150) }

// ── Reset on close ────────────────────────────────────────────────────────────
watch(quickModalOpen, (open) => {
  if (!open) {
    Object.assign(form, { category: 'session', title: '', patientId: '', patientName: '', modality: 'online', location: '', description: '', doctorId: '', doctorName: '', linkedSessionId: '' })
    patientSearch.value = ''
    titleManuallyEdited.value = false
    showPatientDropdown.value = false
    showDiscardConfirm.value = false
    patientError.value = false
  } else {
    nextTick(() => {
      if (form.category === 'session') patientInputRef.value?.focus()
      else titleInputRef.value?.focus()
    })
  }
})

function close() { quickModalOpen.value = false }

function tryClose() {
  if (showDiscardConfirm.value) {
    confirmDiscard()
    return
  }
  if (isDirty.value) {
    showDiscardConfirm.value = true
  } else {
    close()
  }
}

function confirmDiscard() {
  showDiscardConfirm.value = false
  close()
}

// ── Escape key ────────────────────────────────────────────────────────────────
useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  if (!quickModalOpen.value) return
  if (e.key !== 'Escape') return
  e.preventDefault()
  if (showDiscardConfirm.value) { showDiscardConfirm.value = false; return }
  tryClose()
})

// ── Save ──────────────────────────────────────────────────────────────────────
function handleSave() {
  if (form.category === 'session' && !form.patientId) {
    patientError.value = true
    nextTick(() => patientInputRef.value?.focus())
    return
  }
  patientError.value = false
  if (!pendingRange.value) return
  const defaults: Record<string, string> = { session: form.patientName ? `Session – ${form.patientName}` : 'Session', ooo: 'Out of Office', task: 'Task', focus: 'Focus Time', appointment: 'Appointment Slots', documentation: 'Documentation' }
  saveEvent({
    title:           form.title.trim() || defaults[form.category] || form.category,
    start:           pendingRange.value.start,
    end:             pendingRange.value.end,
    category:        form.category as CalendarEvent['category'],
    patientId:       form.category === 'session' && form.patientId   ? form.patientId   : undefined,
    patientName:     form.category === 'session' && form.patientName ? form.patientName : undefined,
    modality:        form.category === 'session' ? form.modality : undefined,
    location:        form.location   || undefined,
    description:     form.description || undefined,
    recurrence:      'none',
    done:            form.category === 'task' ? false : undefined,
    declineMode:     form.category === 'ooo' ? 'all' : undefined,
    doctorId:        form.doctorId   || undefined,
    doctorName:      form.doctorName || undefined,
    linkedSessionId: form.category === 'documentation' && form.linkedSessionId ? form.linkedSessionId : undefined,
  })
}

function handleMoreOptions() {
  openFullModal({
    category:    form.category as CalendarEvent['category'],
    title:       form.title,
    start:       pendingRange.value?.start,
    end:         pendingRange.value?.end,
    patientId:   form.patientId   || undefined,
    patientName: form.patientName || undefined,
    modality:    form.modality,
    location:    form.location    || undefined,
    description: form.description || undefined,
    doctorId:    form.doctorId    || undefined,
    doctorName:  form.doctorName  || undefined,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div v-if="quickModalOpen" class="fixed inset-0 z-50" @mousedown.self="tryClose">
        <!-- Card -->
        <div
          class="fixed z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-slate-700/50 overflow-hidden"
          :style="popoverStyle"
          @click.stop
          @mousedown.stop
        >
          <!-- Drag handle + close -->
          <div class="flex items-center justify-between px-4 pt-3 pb-1">
            <div class="w-6 h-0.5 rounded-full bg-slate-200 dark:bg-slate-600" />
            <Button variant="ghost" size="icon-sm" @click.stop="tryClose">
              <X class="w-4 h-4" />
            </Button>
          </div>

          <!-- Category tabs -->
          <div class="flex gap-1 px-4 pb-3 flex-wrap">
            <button
              v-for="cat in categories"
              :key="cat.value"
              type="button"
              :class="['px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors', form.category === cat.value ? cat.activeClass : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700']"
              @click="form.category = cat.value"
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- Session: patient search first, then auto-title -->
          <template v-if="form.category === 'session'">
            <div class="px-4 pb-3">
              <!-- Patient search (primary input) -->
              <div class="relative">
                <User class="absolute left-0 top-[13px] w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  ref="patientInputRef"
                  v-model="patientSearch"
                  type="text"
                  placeholder="Search patient…"
                  autocomplete="off"
                  :class="['w-full pl-6 text-[22px] font-normal bg-transparent border-b-2 focus:outline-none pb-1 placeholder:text-slate-300 dark:placeholder:text-slate-500 transition-colors', patientError ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-primary text-slate-800 dark:text-slate-100']"
                  @focus="showPatientDropdown = true; patientError = false"
                  @blur="onPatientBlur"
                  @input="() => { form.patientId = ''; form.patientName = ''; patientError = false }"
                />
                <div v-if="showPatientDropdown && filteredPatients.length" class="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden">
                  <button
                    v-for="p in filteredPatients"
                    :key="p.id"
                    class="w-full px-3 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                    @mousedown.prevent="selectPatient(p)"
                  >{{ p.name }}</button>
                </div>
              </div>
              <!-- Patient required error -->
              <p v-if="patientError" class="mt-1 text-xs text-red-500 font-medium">Patient is required to save a session.</p>
              <!-- Auto-generated title (secondary, editable) -->
              <input
                ref="titleInputRef"
                v-model="form.title"
                type="text"
                placeholder="Title (auto-filled from patient)"
                class="w-full mt-2 text-sm text-slate-400 dark:text-slate-500 bg-transparent focus:outline-none focus:text-slate-700 dark:focus:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors"
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
              class="w-full text-[22px] font-normal text-slate-800 dark:text-slate-100 bg-transparent border-b-2 border-primary focus:outline-none pb-1 placeholder:text-slate-300 dark:placeholder:text-slate-500"
              @input="titleManuallyEdited = true"
            />
          </div>

          <!-- Fields -->
          <div class="px-4 pb-3 space-y-3">
            <!-- Time -->
            <div class="flex items-center gap-3">
              <Clock class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span class="text-sm text-slate-700 dark:text-slate-200">{{ timeDisplay }}</span>
            </div>

            <!-- Documentation: linked session picker -->
            <template v-if="form.category === 'documentation'">
              <div class="flex items-center gap-3">
                <Link2 class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <div class="flex-1">
                  <Select v-model="form.linkedSessionId">
                    <SelectTrigger class="w-full h-8 text-sm">
                      <SelectValue placeholder="Link to session (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Link to session (optional)</SelectItem>
                      <SelectItem v-for="s in sessionOptions" :key="s.id" :value="s.id">{{ s.label }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div class="ml-7 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2">
                When linked, billing will count <strong>session + documentation</strong> time together.
              </div>
            </template>

            <!-- OOO info note -->
            <div v-if="form.category === 'ooo'" class="ml-7 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
              Colleagues will see you're unavailable. Use <strong>More options</strong> to configure meeting decline settings.
            </div>

            <!-- Meeting info note -->
            <div v-if="form.category === 'meeting'" class="ml-7 text-xs text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 rounded-lg px-3 py-2">
              Add participants and an agenda in <strong>More options</strong>.
            </div>

            <!-- Focus info note -->
            <div v-if="form.category === 'focus'" class="ml-7 text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-lg px-3 py-2">
              Focus time blocks distractions. Configure DND & auto-decline in <strong>More options</strong>.
            </div>

            <!-- Appointment info note -->
            <div v-if="form.category === 'appointment'" class="ml-7 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-lg px-3 py-2">
              Create a bookable slot. A shareable link will be generated. Configure in <strong>More options</strong>.
            </div>

            <!-- Session: Doctor select (org only) -->
            <template v-if="form.category === 'session' && persona.role === 'organization'">
              <div class="flex items-center gap-3">
                <Stethoscope class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <div class="flex-1 relative">
                  <span
                    v-if="form.doctorId"
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-10"
                    :style="{ backgroundColor: DOCTOR_HEX[form.doctorId] }"
                  />
                  <Select
                    v-model="form.doctorId"
                    @update:model-value="form.doctorName = orgDoctors.find(d => d.id === form.doctorId)?.name ?? ''"
                  >
                    <SelectTrigger :class="['h-8 text-sm w-full', form.doctorId ? 'pl-7' : '']">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select doctor</SelectItem>
                      <SelectItem v-for="d in orgDoctors" :key="d.id" :value="d.id">{{ d.name }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </template>

            <!-- Session: Modality -->
            <template v-if="form.category === 'session'">
              <div class="flex gap-2">
                <button :class="['flex-1 py-1.5 text-xs rounded-lg font-medium border transition-colors', form.modality === 'online' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600']" @click="form.modality = 'online'">Online</button>
                <button :class="['flex-1 py-1.5 text-xs rounded-lg font-medium border transition-colors', form.modality === 'inperson' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600']" @click="form.modality = 'inperson'">In-person</button>
              </div>
            </template>

            <!-- Location -->
            <div v-if="form.category !== 'appointment'" class="flex items-center gap-3">
              <MapPin class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <Input v-model="form.location" type="text" placeholder="Add location" class="flex-1 h-8 text-sm border-transparent hover:border-input focus:border-input bg-transparent focus:bg-background" />
            </div>

            <!-- Description -->
            <div class="flex items-start gap-3">
              <AlignLeft class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-1.5" />
              <Textarea v-model="form.description" placeholder="Add description" :rows="2" class="flex-1 text-sm border-transparent hover:border-input focus:border-input bg-transparent focus:bg-background resize-none min-h-0" />
            </div>
          </div>

          <!-- Footer / Discard confirm -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
            <template v-if="showDiscardConfirm">
              <span class="text-sm text-slate-600 dark:text-slate-300">Discard changes?</span>
              <div class="flex gap-2">
                <Button type="button" variant="ghost" size="sm" class="text-xs h-8" @click.stop="showDiscardConfirm = false">Keep editing</Button>
                <Button type="button" variant="destructive" size="sm" class="text-xs h-8" @click.stop="confirmDiscard">Discard</Button>
              </div>
            </template>
            <template v-else>
              <Button variant="link" class="text-sm p-0 h-auto" @click="handleMoreOptions">
                More options
              </Button>
              <Button class="rounded-full" @click="handleSave">
                Save
              </Button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
