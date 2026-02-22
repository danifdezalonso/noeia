<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { mockPatients } from '~/composables/useCalendar'

const emit = defineEmits<{ close: []; save: [] }>()

const DURATIONS     = [30, 45, 50, 60, 90, 120]
const SESSION_TYPES = ['Individual', 'Couples', 'Family', 'Group', 'Supervision', 'Assessment']

// ── Form state ──────────────────────────────────────────────────────────────
const patientSearch   = ref('')
const patient         = ref<{ id: string; name: string } | null>(null)
const patientDropOpen = ref(false)
const sessionType     = ref('Individual')
const modality        = ref<'online' | 'inperson'>('online')
const date            = ref(new Date().toISOString().slice(0, 10))
const startTime       = ref('09:00')
const duration        = ref(50)
const amount          = ref<number | null>(null)
const notes           = ref('')
const invoiceStatus   = ref<'draft' | 'send'>('draft')

const filteredPatients = computed(() => {
  const q = patientSearch.value.toLowerCase()
  return mockPatients.filter(p => p.name.toLowerCase().includes(q))
})

function selectPatient(p: { id: string; name: string }) {
  patient.value         = p
  patientSearch.value   = p.name
  patientDropOpen.value = false
}

const endTime = computed(() => {
  if (!startTime.value) return ''
  const [h, m] = startTime.value.split(':').map(Number)
  const mins = (h ?? 0) * 60 + (m ?? 0) + duration.value
  return `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
})

const canSave = computed(() => !!patient.value && !!date.value && !!amount.value)

function save() {
  if (!canSave.value) return
  console.log('→ Billing: new entry created', {
    patient: patient.value,
    date: date.value,
    type: sessionType.value,
    duration: duration.value,
    amount: amount.value,
    modality: modality.value,
    notes: notes.value,
    status: invoiceStatus.value,
  })
  emit('save')
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="emit('close')">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />

      <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">New Bill</h2>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Create a billing entry or send an invoice</p>
          </div>
          <button
            class="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            @click="emit('close')"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <!-- Patient -->
          <div class="relative">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Patient</label>
            <input
              v-model="patientSearch"
              type="text"
              placeholder="Search patient…"
              class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              @focus="patientDropOpen = true"
              @input="patient = null; patientDropOpen = true"
            />
            <div
              v-if="patientDropOpen && filteredPatients.length"
              class="absolute z-20 w-full top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden max-h-40 overflow-y-auto"
            >
              <button
                v-for="p in filteredPatients"
                :key="p.id"
                class="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors"
                @click="selectPatient(p)"
              >
                {{ p.name }}
              </button>
            </div>
          </div>

          <!-- Session type + modality -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Session type</label>
              <select
                v-model="sessionType"
                class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option v-for="t in SESSION_TYPES" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Modality</label>
              <div class="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-[38px]">
                <button
                  :class="['flex-1 text-sm font-medium transition-colors', modality === 'online' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
                  @click="modality = 'online'"
                >Online</button>
                <button
                  :class="['flex-1 text-sm font-medium border-l border-slate-200 dark:border-slate-700 transition-colors', modality === 'inperson' ? 'bg-indigo-600 text-white border-l-indigo-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
                  @click="modality = 'inperson'"
                >In-person</button>
              </div>
            </div>
          </div>

          <!-- Date + time -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
              <input
                v-model="date"
                type="date"
                class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Start time</label>
              <input
                v-model="startTime"
                type="time"
                class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- Duration -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Duration
              <span v-if="endTime" class="normal-case font-normal text-slate-400 ml-1">— ends {{ endTime }}</span>
            </label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="d in DURATIONS"
                :key="d"
                :class="['px-3 py-1.5 text-sm rounded-lg border transition-colors', duration === d ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
                @click="duration = d"
              >{{ d }}m</button>
            </div>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Amount (€)</label>
            <input
              v-model.number="amount"
              type="number"
              min="0"
              step="5"
              placeholder="0"
              class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea
              v-model="notes"
              rows="2"
              placeholder="Optional session or billing notes…"
              class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50/60 dark:bg-slate-800/40">
          <!-- Draft / Send toggle -->
          <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              :class="['px-3 py-1 text-xs font-semibold rounded-md transition-colors', invoiceStatus === 'draft' ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200']"
              @click="invoiceStatus = 'draft'"
            >Save draft</button>
            <button
              :class="['px-3 py-1 text-xs font-semibold rounded-md transition-colors', invoiceStatus === 'send' ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200']"
              @click="invoiceStatus = 'send'"
            >Send invoice</button>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              @click="emit('close')"
            >Cancel</button>
            <button
              :disabled="!canSave"
              :class="['px-4 py-2 text-sm font-semibold rounded-lg transition-colors', canSave ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed']"
              @click="save"
            >{{ invoiceStatus === 'send' ? 'Send' : 'Save' }}</button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>
