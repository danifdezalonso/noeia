<script setup lang="ts">
import { X, Clock, User, MapPin, AlignLeft } from 'lucide-vue-next'
import type { CalendarEvent } from '~/composables/useCalendar'

const { quickModalOpen, quickModalPos, pendingRange, saveEvent, openFullModal, mockPatients } = useCalendar()

// ── Form ──────────────────────────────────────────────────────────────────────
const form = reactive({
  category: 'session' as 'session' | 'ooo' | 'task' | 'focus' | 'appointment',
  title: '',
  patientId: '',
  patientName: '',
  modality: 'online' as 'online' | 'inperson',
  location: '',
  description: '',
})

const patientSearch       = ref('')
const showPatientDropdown = ref(false)
const titleInputRef       = ref<HTMLInputElement>()

// ── Category config ───────────────────────────────────────────────────────────
const categories = [
  { value: 'session'     as const, label: 'Session',      activeClass: 'bg-indigo-600 text-white'  },
  { value: 'ooo'         as const, label: 'Out of Office', activeClass: 'bg-amber-500 text-white'   },
  { value: 'focus'       as const, label: 'Focus',         activeClass: 'bg-violet-600 text-white'  },
  { value: 'task'        as const, label: 'Task',           activeClass: 'bg-emerald-600 text-white' },
  { value: 'appointment' as const, label: 'Appointment',   activeClass: 'bg-teal-600 text-white'    },
]

// ── Positioning ───────────────────────────────────────────────────────────────
const popoverStyle = computed(() => {
  const pos = quickModalPos.value
  if (!pos || typeof window === 'undefined') return {}
  const W = 368; const estH = 460; const m = 12
  let left = pos.x + 14
  let top  = pos.y - 60
  if (left + W > window.innerWidth  - m) left = pos.x - W - 14
  left = Math.max(m, left)
  top  = Math.max(56 + m, Math.min(window.innerHeight - estH - m, top))
  return { left: `${left}px`, top: `${top}px`, width: `${W}px` }
})

// ── OOO: auto-fill title ──────────────────────────────────────────────────────
watch(() => form.category, (cat) => {
  if (cat === 'ooo' && !form.title) form.title = 'Out of Office'
  if (cat === 'focus' && !form.title) form.title = 'Focus Time'
})

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
  form.patientId = p.id; form.patientName = p.name; patientSearch.value = p.name; showPatientDropdown.value = false
}
function onPatientBlur() { setTimeout(() => { showPatientDropdown.value = false }, 150) }

// ── Reset on close ────────────────────────────────────────────────────────────
watch(quickModalOpen, (open) => {
  if (!open) {
    Object.assign(form, { category: 'session', title: '', patientId: '', patientName: '', modality: 'online', location: '', description: '' })
    patientSearch.value = ''
  } else {
    nextTick(() => titleInputRef.value?.focus())
  }
})

// ── Save ──────────────────────────────────────────────────────────────────────
function handleSave() {
  if (!pendingRange.value) return
  const defaults: Record<string, string> = { session: form.patientName ? `Session – ${form.patientName}` : 'Session', ooo: 'Out of Office', task: 'Task', focus: 'Focus Time', appointment: 'Appointment Slots' }
  saveEvent({
    title:       form.title.trim() || defaults[form.category] || form.category,
    start:       pendingRange.value.start,
    end:         pendingRange.value.end,
    category:    form.category as CalendarEvent['category'],
    patientId:   form.category === 'session' && form.patientId   ? form.patientId   : undefined,
    patientName: form.category === 'session' && form.patientName ? form.patientName : undefined,
    modality:    form.category === 'session' ? form.modality : undefined,
    location:    form.location   || undefined,
    description: form.description || undefined,
    recurrence:  'none',
    done:        form.category === 'task' ? false : undefined,
    declineMode: form.category === 'ooo' ? 'all' : undefined,
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
      <div v-if="quickModalOpen" class="fixed inset-0 z-50" @click.self="quickModalOpen = false">
        <!-- Card -->
        <div
          class="fixed z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-slate-700/50 overflow-hidden"
          :style="popoverStyle"
          @click.stop
        >
          <!-- Drag handle + close -->
          <div class="flex items-center justify-between px-4 pt-3 pb-1">
            <div class="w-6 h-0.5 rounded-full bg-slate-200 dark:bg-slate-600" />
            <button class="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" @click="quickModalOpen = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Title -->
          <div class="px-4 pb-3">
            <input
              ref="titleInputRef"
              v-model="form.title"
              type="text"
              placeholder="Add title"
              class="w-full text-[22px] font-normal text-slate-800 dark:text-slate-100 bg-transparent border-b-2 border-indigo-500 focus:outline-none pb-1 placeholder:text-slate-300 dark:placeholder:text-slate-500"
            />
          </div>

          <!-- Category tabs -->
          <div class="flex gap-1 px-4 pb-3 flex-wrap">
            <button
              v-for="cat in categories"
              :key="cat.value"
              :class="['px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors', form.category === cat.value ? cat.activeClass : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700']"
              @click="form.category = cat.value"
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- Fields -->
          <div class="px-4 pb-3 space-y-3">
            <!-- Time -->
            <div class="flex items-center gap-3">
              <Clock class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span class="text-sm text-slate-700 dark:text-slate-200">{{ timeDisplay }}</span>
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

            <!-- Session: Patient + Modality -->
            <template v-if="form.category === 'session'">
              <div class="flex items-start gap-3">
                <User class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-2" />
                <div class="flex-1 relative">
                  <input
                    v-model="patientSearch"
                    type="text"
                    placeholder="Add patient"
                    autocomplete="off"
                    class="w-full px-2.5 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    @focus="showPatientDropdown = true"
                    @blur="onPatientBlur"
                    @input="() => { form.patientId = ''; form.patientName = '' }"
                  />
                  <div v-if="showPatientDropdown && filteredPatients.length" class="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden">
                    <button v-for="p in filteredPatients" :key="p.id" class="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200" @mousedown.prevent="selectPatient(p)">{{ p.name }}</button>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 pl-7">
                <button :class="['flex-1 py-1.5 text-xs rounded-lg font-medium border transition-colors', form.modality === 'online' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600']" @click="form.modality = 'online'">Online</button>
                <button :class="['flex-1 py-1.5 text-xs rounded-lg font-medium border transition-colors', form.modality === 'inperson' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600']" @click="form.modality = 'inperson'">In-person</button>
              </div>
            </template>

            <!-- Location (all except appointment) -->
            <div v-if="form.category !== 'appointment'" class="flex items-center gap-3">
              <MapPin class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <input v-model="form.location" type="text" placeholder="Add location" class="flex-1 px-2.5 py-1.5 text-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-slate-200 dark:focus:border-slate-600 rounded-lg bg-transparent focus:bg-white dark:focus:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            </div>

            <!-- Description -->
            <div class="flex items-start gap-3">
              <AlignLeft class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-1.5" />
              <textarea v-model="form.description" placeholder="Add description" rows="2" class="flex-1 px-2.5 py-1.5 text-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-slate-200 dark:focus:border-slate-600 rounded-lg bg-transparent focus:bg-white dark:focus:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none resize-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
            <button class="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors" @click="handleMoreOptions">
              More options
            </button>
            <button class="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-full transition-colors shadow-sm" @click="handleSave">
              Save
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
