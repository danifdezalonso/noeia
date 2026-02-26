<script setup lang="ts">
import { X, Search, Video, MapPin, Link2, Copy, Check } from 'lucide-vue-next'
import { mockPatients, type MockPatient } from '~/composables/useCalendar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'

export interface NewSession {
  title: string
  patientId: string
  patientName: string
  patientInitials: string
  type: string
  modality: 'online' | 'inperson'
  meetingLink?: string
  location?: string
  start: string
  end: string
  notes: string
}

const emit = defineEmits<{ close: []; save: [s: NewSession] }>()

const PROFESSIONAL = 'Dr. Torres'

const SESSION_TYPES = [
  { value: 'individual',  label: 'Individual Session'  },
  { value: 'assessment',  label: 'Initial Assessment'  },
  { value: 'follow-up',   label: 'Follow-up'           },
  { value: 'couples',     label: 'Couples Therapy'     },
  { value: 'group',       label: 'Group Session'       },
  { value: 'evaluation',  label: 'Evaluation'          },
]

const DURATIONS = [
  { value: 30,  label: '30 min' },
  { value: 45,  label: '45 min' },
  { value: 50,  label: '50 min' },
  { value: 60,  label: '60 min' },
  { value: 90,  label: '90 min' },
  { value: 120, label: '2 hrs'  },
]

const PRESET_LOCATIONS = ['Room 101', 'Room 102', 'Main Street Clinic']

// ── Date helpers ───────────────────────────────────────────────────────────
function todayIso() {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function buildIso(date: string, time: string) {
  return `${date}T${time}:00`
}

function addMinutes(time: string, mins: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  const p = (n: number) => String(n % 60 === 0 && n >= 60 ? Math.floor(n / 60) : n).padStart(2, '0')
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// ── Form ───────────────────────────────────────────────────────────────────
const form = reactive({
  patientId:         '',
  patientName:       '',
  title:             '',
  type:              'individual',
  modality:          'online' as 'online' | 'inperson',
  meetingLink:       'https://meet.noeia.com/dr-torres',
  location:          'Room 101',
  locationCustom:    '',
  locationIsCustom:  false,
  date:              todayIso(),
  time:              '09:00',
  duration:          50,
  notes:             '',
})

const titleEdited = ref(false)

watch(() => form.patientName, (name) => {
  if (!titleEdited.value)
    form.title = name ? `${name} <> ${PROFESSIONAL}` : ''
})

// ── Patient search ─────────────────────────────────────────────────────────
const patientQuery   = ref('')
const showPatients   = ref(false)
const patientWrapRef = ref<HTMLElement>()

const patientList = computed(() => {
  const q = patientQuery.value.trim().toLowerCase()
  return q ? mockPatients.filter(p => p.name.toLowerCase().includes(q)) : mockPatients
})

function selectPatient(p: MockPatient) {
  form.patientId   = p.id
  form.patientName = p.name
  patientQuery.value = p.name
  showPatients.value = false
}

function clearPatient() {
  form.patientId   = ''
  form.patientName = ''
  patientQuery.value = ''
  if (!titleEdited.value) form.title = ''
}

function onDocClick(e: MouseEvent) {
  if (!patientWrapRef.value?.contains(e.target as Node))
    showPatients.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

// ── Copy meeting link ──────────────────────────────────────────────────────
const copied = ref(false)
function copyLink() {
  navigator.clipboard?.writeText(form.meetingLink)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1800)
}

// ── Validation & save ──────────────────────────────────────────────────────
const errPatient = ref(false)
const errDate    = ref(false)
const errTime    = ref(false)

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function save() {
  errPatient.value = !form.patientId
  errDate.value    = !form.date
  errTime.value    = !form.time
  if (errPatient.value || errDate.value || errTime.value) return

  const endTime = addMinutes(form.time, form.duration)
  emit('save', {
    title:       form.title || `${form.patientName} <> ${PROFESSIONAL}`,
    patientId:   form.patientId,
    patientName: form.patientName,
    patientInitials: initials(form.patientName),
    type:        form.type,
    modality:    form.modality,
    meetingLink: form.modality === 'online' ? form.meetingLink : undefined,
    location:    form.modality === 'inperson'
      ? (form.locationIsCustom ? form.locationCustom : form.location)
      : undefined,
    start: buildIso(form.date, form.time),
    end:   buildIso(form.date, endTime),
    notes: form.notes,
  })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="emit('close')">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[520px] flex flex-col max-h-[92vh]">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">Schedule Session</h2>
          <Button variant="ghost" size="icon" class="rounded-full" @click="emit('close')">
            <X class="w-4 h-4" />
          </Button>
        </div>

        <!-- Body -->
        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          <!-- ── Client ──────────────────────────────────────────────────── -->
          <div>
            <Label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Client <span class="text-red-500">*</span></Label>
            <div ref="patientWrapRef" class="relative">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                <Input
                  v-model="patientQuery"
                  placeholder="Search patient…"
                  :class="[
                    'pl-9 pr-9',
                    errPatient ? 'border-red-400 focus-visible:ring-red-200' : '',
                  ]"
                  @focus="showPatients = true"
                  @input="showPatients = true; errPatient = false"
                />
                <button v-if="form.patientId" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors" @click="clearPatient">
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
              <p v-if="errPatient" class="mt-1 text-xs text-red-500">Please select a client</p>

              <!-- Dropdown -->
              <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0">
                <div v-if="showPatients && patientList.length > 0" class="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 py-1 max-h-44 overflow-y-auto">
                  <button
                    v-for="p in patientList"
                    :key="p.id"
                    class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    @click="selectPatient(p)"
                  >
                    <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span class="text-primary text-[10px] font-bold">{{ p.name.split(' ').map(w => w[0]).join('').slice(0, 2) }}</span>
                    </div>
                    <span class="text-slate-700 dark:text-slate-200 font-medium">{{ p.name }}</span>
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <!-- ── Title ───────────────────────────────────────────────────── -->
          <div>
            <Label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Title</Label>
            <Input
              v-model="form.title"
              placeholder="Session title…"
              @input="titleEdited = true"
            />
          </div>

          <!-- ── Type ────────────────────────────────────────────────────── -->
          <div>
            <Label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Session type</Label>
            <Select v-model="form.type">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="t in SESSION_TYPES" :key="t.value" :value="t.value">{{ t.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- ── Modality toggle ─────────────────────────────────────────── -->
          <div>
            <Label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Format</Label>
            <div class="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                :class="['flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors', form.modality === 'online' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
                @click="form.modality = 'online'"
              >
                <Video class="w-3.5 h-3.5" /> Online
              </button>
              <button
                :class="['flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium border-l border-slate-200 dark:border-slate-700 transition-colors', form.modality === 'inperson' ? 'bg-primary text-primary-foreground border-primary' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
                @click="form.modality = 'inperson'"
              >
                <MapPin class="w-3.5 h-3.5" /> In-person
              </button>
            </div>

            <!-- Online: meeting link -->
            <div v-if="form.modality === 'online'" class="mt-2.5">
              <div class="flex gap-2 items-center">
                <div class="relative flex-1">
                  <Link2 class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                  <Input
                    v-model="form.meetingLink"
                    type="url"
                    class="pl-9 text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  />
                </div>
                <Button variant="outline" size="sm" class="text-xs whitespace-nowrap" @click="copyLink">
                  <component :is="copied ? Check : Copy" class="w-3.5 h-3.5" :class="copied ? 'text-green-500' : ''" />
                  {{ copied ? 'Copied' : 'Copy' }}
                </Button>
              </div>
            </div>

            <!-- In-person: location -->
            <div v-else class="mt-2.5 space-y-2">
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="loc in PRESET_LOCATIONS"
                  :key="loc"
                  :class="['px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors', !form.locationIsCustom && form.location === loc ? 'bg-primary text-primary-foreground border-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
                  @click="form.location = loc; form.locationIsCustom = false"
                >
                  {{ loc }}
                </button>
                <button
                  :class="['px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors', form.locationIsCustom ? 'bg-primary text-primary-foreground border-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
                  @click="form.locationIsCustom = true"
                >
                  Other…
                </button>
              </div>
              <Input
                v-if="form.locationIsCustom"
                v-model="form.locationCustom"
                placeholder="Enter location…"
              />
            </div>
          </div>

          <!-- ── Date & Time ──────────────────────────────────────────────── -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <Label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Date <span class="text-red-500">*</span></Label>
              <Input
                v-model="form.date"
                type="date"
                :class="errDate ? 'border-red-400 focus-visible:ring-red-200' : ''"
                @input="errDate = false"
              />
            </div>
            <div>
              <Label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Start time <span class="text-red-500">*</span></Label>
              <Input
                v-model="form.time"
                type="time"
                :class="errTime ? 'border-red-400 focus-visible:ring-red-200' : ''"
                @input="errTime = false"
              />
            </div>
          </div>

          <!-- ── Duration ────────────────────────────────────────────────── -->
          <div>
            <Label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Duration</Label>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="d in DURATIONS"
                :key="d.value"
                :class="['px-3.5 py-2 text-sm font-medium rounded-xl border transition-colors', form.duration === d.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
                @click="form.duration = d.value"
              >
                {{ d.label }}
              </button>
            </div>
            <p v-if="form.time && form.date" class="mt-1.5 text-xs text-slate-400">
              Ends at {{ addMinutes(form.time, form.duration) }}
            </p>
          </div>

          <!-- ── Notes ───────────────────────────────────────────────────── -->
          <div>
            <Label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Notes</Label>
            <Textarea
              v-model="form.notes"
              :rows="3"
              placeholder="Session notes, agenda, reminders…"
              class="resize-none"
            />
          </div>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <Button variant="ghost" @click="emit('close')">Cancel</Button>
          <Button @click="save">Schedule Session</Button>
        </div>

      </div>
    </div>
  </Teleport>
</template>
