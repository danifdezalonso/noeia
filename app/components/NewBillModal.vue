<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { mockPatients } from '~/composables/useCalendar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'

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
          <Button variant="ghost" size="icon" class="rounded-full" @click="emit('close')">
            <X class="w-4 h-4" />
          </Button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <!-- Patient -->
          <div class="relative">
            <Label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Patient</Label>
            <Input
              v-model="patientSearch"
              placeholder="Search patient…"
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
                class="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-primary/10 transition-colors"
                @click="selectPatient(p)"
              >
                {{ p.name }}
              </button>
            </div>
          </div>

          <!-- Session type + modality -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <Label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Session type</Label>
              <Select v-model="sessionType">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="t in SESSION_TYPES" :key="t" :value="t">{{ t }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Modality</Label>
              <div class="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-9">
                <button
                  :class="['flex-1 text-sm font-medium transition-colors', modality === 'online' ? 'bg-primary text-primary-foreground' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
                  @click="modality = 'online'"
                >Online</button>
                <button
                  :class="['flex-1 text-sm font-medium border-l border-slate-200 dark:border-slate-700 transition-colors', modality === 'inperson' ? 'bg-primary text-primary-foreground border-l-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
                  @click="modality = 'inperson'"
                >In-person</button>
              </div>
            </div>
          </div>

          <!-- Date + time -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <Label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Date</Label>
              <Input v-model="date" type="date" />
            </div>
            <div>
              <Label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Start time</Label>
              <Input v-model="startTime" type="time" />
            </div>
          </div>

          <!-- Duration -->
          <div>
            <Label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
              Duration
              <span v-if="endTime" class="normal-case font-normal text-slate-400 ml-1">— ends {{ endTime }}</span>
            </Label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="d in DURATIONS"
                :key="d"
                :class="['px-3 py-1.5 text-sm rounded-lg border transition-colors', duration === d ? 'bg-primary text-primary-foreground border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
                @click="duration = d"
              >{{ d }}m</button>
            </div>
          </div>

          <!-- Amount -->
          <div>
            <Label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Amount (€)</Label>
            <Input v-model.number="amount" type="number" min="0" step="5" placeholder="0" />
          </div>

          <!-- Notes -->
          <div>
            <Label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Notes</Label>
            <Textarea
              v-model="notes"
              :rows="2"
              placeholder="Optional session or billing notes…"
              class="resize-none"
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
            <Button variant="ghost" @click="emit('close')">Cancel</Button>
            <Button :disabled="!canSave" @click="save">
              {{ invoiceStatus === 'send' ? 'Send' : 'Save' }}
            </Button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>
