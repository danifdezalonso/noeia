<script setup lang="ts">
import {
  Trash2, Zap, Plus, Send, Sparkles, ChevronDown, ChevronLeft, ChevronRight,
  Mic, Undo2, Redo2, Copy, Paperclip, UserRound, LayoutGrid, Pencil,
  Languages, CalendarDays, Volume2, MoreHorizontal, Phone, Video,
} from 'lucide-vue-next'
import {
  format, addDays, startOfWeek, subWeeks, addMonths, subMonths,
  startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday,
} from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

definePageMeta({ layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────────────────────

interface TranscriptLine {
  speaker: 'therapist' | 'patient'
  time: string
  text: string
}

interface SessionRecord {
  id: string
  label: string
  transcript: TranscriptLine[]
  aiSummary?: string
}

interface Appointment {
  id: string
  patientName: string
  initials: string
  avatarBg: string
  avatarText: string
  time: string
  groupLabel: string
  tab: 'schedule' | 'past'
  inputLanguage: string
  outputLanguage: string
  contextText: string
  sessions: SessionRecord[]
  sessionDate: Date
  sessionTime: string
}

// ── Seed data ──────────────────────────────────────────────────────────────

const mon  = startOfWeek(new Date(), { weekStartsOn: 1 })
const prev = subWeeks(mon, 1)

const appointments = ref<Appointment[]>([
  {
    id: 'a1', patientName: 'Maddy Test', initials: 'MT',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '4:25pm', groupLabel: 'Today', tab: 'schedule',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: new Date(), sessionTime: '01:54',
    sessions: [{ id: 's1', label: 'Session Feb 21', transcript: [] }],
  },
  {
    id: 'a2', patientName: 'Maddy Test', initials: 'MT',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '2:00pm', groupLabel: '22/02/2026', tab: 'schedule',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: 'Patient reported improvement in sleep patterns last week. Continue CBT techniques for anxiety management.\n\nReferral from Dr. García (GP). Original complaint: generalised anxiety, sleep disturbance.',
    sessionDate: addDays(mon, 1), sessionTime: '14:00',
    sessions: [{ id: 's2', label: 'Session Feb 22', transcript: [] }],
  },
  {
    id: 'a3', patientName: 'John Doe', initials: 'JD',
    avatarBg: 'bg-sky-100', avatarText: 'text-sky-700',
    time: '10:00am', groupLabel: '24/02/2026', tab: 'schedule',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: addDays(mon, 3), sessionTime: '10:00',
    sessions: [{ id: 's3', label: 'Session Feb 24', transcript: [] }],
  },
  {
    id: 'a4', patientName: 'Maddy Test', initials: 'MT',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '3:00pm', groupLabel: '20/02/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: 'Patient has been experiencing work-related stress. Referred by Dr. García.',
    sessionDate: addDays(prev, 3), sessionTime: '15:00',
    sessions: [{
      id: 's4', label: 'Session Feb 20',
      aiSummary: 'Patient reports improvement in sleep (fewer awakenings). Breathing exercises and journalling cited as effective interventions. Continue CBT-based sleep hygiene. Positive trajectory — reinforce behavioural activation.',
      transcript: [
        { speaker: 'therapist', time: '15:02', text: 'How have you been feeling this week compared to last time?' },
        { speaker: 'patient',   time: '15:03', text: 'Honestly, a bit better. The breathing exercises have been helping at night.' },
        { speaker: 'therapist', time: '15:04', text: 'That\'s great to hear. When you say better — can you be more specific? What changed?' },
        { speaker: 'patient',   time: '15:05', text: 'I\'m not waking up as often. Maybe once or twice instead of four or five times.' },
        { speaker: 'therapist', time: '15:07', text: 'That\'s meaningful progress. Let\'s keep building on that.' },
        { speaker: 'patient',   time: '15:08', text: 'I think writing things down before bed helped. I stop ruminating once it\'s on paper.' },
      ],
    }],
  },
  {
    id: 'a5', patientName: 'John Doe', initials: 'JD',
    avatarBg: 'bg-sky-100', avatarText: 'text-sky-700',
    time: '11:00am', groupLabel: '18/02/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: addDays(prev, 1), sessionTime: '11:00',
    sessions: [{
      id: 's5', label: 'Session Feb 18',
      aiSummary: 'Intake session. Patient presents with occupational stress following recent promotion. Symptoms: inability to disengage, chronic overwhelm. No previous therapy. Goal-setting and psychoeducation scheduled for next session.',
      transcript: [
        { speaker: 'therapist', time: '11:01', text: 'Welcome, John. What brings you here today?' },
        { speaker: 'patient',   time: '11:02', text: 'I\'ve been feeling overwhelmed. Work, home — everything needs attention at once and I can\'t switch off.' },
        { speaker: 'therapist', time: '11:04', text: 'I\'m glad you\'re here. Has this been building over time or did something specific trigger it?' },
        { speaker: 'patient',   time: '11:05', text: 'It\'s been building for about six months. A promotion that I now regret taking.' },
      ],
    }],
  },
])

// ── UI state ───────────────────────────────────────────────────────────────

const activeTab  = ref<'schedule' | 'past'>('schedule')
const selectedId = ref('a1')
const contentTab = ref('context')

const isRecording    = ref(false)
const transcribeOpen = ref(false)
const copyOpen       = ref(false)
const micOpen        = ref(false)
const noeInput       = ref('')
const noeMessages    = ref<{ role: 'user' | 'noe'; text: string }[]>([])

// Date picker calendar state
const calendarViewDate = ref(new Date())

// ── Derived ────────────────────────────────────────────────────────────────

const selected = computed(
  () => appointments.value.find(a => a.id === selectedId.value)!,
)

function groups(tab: 'schedule' | 'past') {
  const items = appointments.value.filter(a => a.tab === tab)
  const map: Record<string, Appointment[]> = {}
  for (const item of items) {
    if (!map[item.groupLabel]) map[item.groupLabel] = []
    map[item.groupLabel]!.push(item)
  }
  return Object.entries(map)
}

const currentGroups = computed(() => groups(activeTab.value))

// ── Calendar grid ──────────────────────────────────────────────────────────

const calendarDays = computed(() => {
  const monthStart = startOfMonth(calendarViewDate.value)
  const monthEnd   = endOfMonth(calendarViewDate.value)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 0 })
  // Always render 5 full weeks (35 cells) — enough for any month
  const gridEnd    = addDays(gridStart, 34)
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
})

const calendarMonthLabel = computed(() =>
  format(calendarViewDate.value, 'MMMM yyyy'),
)

function prevMonth() { calendarViewDate.value = subMonths(calendarViewDate.value, 1) }
function nextMonth() { calendarViewDate.value = addMonths(calendarViewDate.value, 1) }

function selectDay(day: Date) {
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (appt) appt.sessionDate = day
}

// ── Mutations ──────────────────────────────────────────────────────────────

function selectAppointment(id: string) {
  selectedId.value = id
  contentTab.value = 'context'
  isRecording.value = false
  calendarViewDate.value = new Date()
}

function setContextText(e: Event) {
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (appt) appt.contextText = (e.target as HTMLTextAreaElement).value
}

function toggleRecord() {
  isRecording.value = !isRecording.value
  if (isRecording.value && selected.value.sessions[0])
    contentTab.value = selected.value.sessions[0].id
  transcribeOpen.value = false
}

function finishSession() {
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (!appt) return
  appt.tab = 'past'
  activeTab.value = 'past'
}

const contextAreaRef = ref<HTMLTextAreaElement>()
function undoContext() { contextAreaRef.value?.focus(); document.execCommand('undo') }
function redoContext()  { contextAreaRef.value?.focus(); document.execCommand('redo') }
function copyContext()  {
  if (selected.value) navigator.clipboard.writeText(selected.value.contextText)
  copyOpen.value = false
}

function sendNoe() {
  if (!noeInput.value.trim()) return
  noeMessages.value.push({ role: 'user', text: noeInput.value })
  const query = noeInput.value
  noeInput.value = ''
  setTimeout(() => {
    noeMessages.value.push({
      role: 'noe',
      text: 'I\'ve reviewed the session context. Would you like me to draft a SOAP note, generate a summary, or suggest next steps for this patient?',
    })
  }, 800)
}

// Date formatting helpers
function fmtDateBadge(appt: Appointment) {
  if (appt.tab === 'schedule' && appt.groupLabel === 'Today')
    return `Today ${appt.sessionTime}`
  return format(appt.sessionDate, 'MMM d') + ' ' + appt.sessionTime
}

const languages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian']

// Close dropdowns on outside click
onMounted(() => {
  document.addEventListener('click', () => {
    transcribeOpen.value = false
    copyOpen.value       = false
    micOpen.value        = false
  })
})
</script>

<template>
  <div class="flex-1 flex overflow-hidden min-h-0">

    <!-- ══ Left sidebar ═══════════════════════════════════════════════════ -->
    <aside class="w-52 sm:w-60 md:w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shrink-0 min-w-0">

      <!-- Tabs -->
      <div class="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
        <button
          v-for="t in (['schedule', 'past'] as const)"
          :key="t"
          :class="[
            'flex-1 py-3 text-sm font-medium transition-colors',
            activeTab === t
              ? 'text-slate-900 dark:text-white border-b-2 border-indigo-600'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
          ]"
          @click="activeTab = t"
        >
          {{ t === 'schedule' ? 'Schedule' : 'Past' }}
        </button>
      </div>

      <!-- Appointment list -->
      <div class="flex-1 overflow-y-auto py-2">
        <template v-for="([groupLabel, items]) in currentGroups" :key="groupLabel">
          <p class="px-4 pt-3 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            {{ groupLabel }}
          </p>
          <button
            v-for="appt in items"
            :key="appt.id"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left',
              selectedId === appt.id ? 'bg-indigo-50 dark:bg-indigo-950' : 'hover:bg-slate-50 dark:hover:bg-slate-800',
            ]"
            @click="selectAppointment(appt.id)"
          >
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold', appt.avatarBg, appt.avatarText]">
              {{ appt.initials }}
            </div>
            <div class="min-w-0 flex-1">
              <p :class="['text-sm font-medium truncate leading-tight', selectedId === appt.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-100']">
                {{ appt.patientName }}
              </p>
              <p class="text-xs text-slate-400 mt-0.5">{{ appt.time }}</p>
            </div>
            <div v-if="selectedId === appt.id" class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
          </button>
        </template>
      </div>
    </aside>

    <!-- ══ Main area ══════════════════════════════════════════════════════ -->
    <main class="flex-1 flex flex-col min-w-0 bg-slate-50/70 dark:bg-slate-950/70">

      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <header class="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 pt-4 pb-3">

        <!-- Row 1: patient name + trash + right actions -->
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2 min-w-0">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white truncate">{{ selected.patientName }}</h2>
            <button class="p-1 rounded text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0" title="Delete session">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Transcribe + Finish Session -->
          <div class="flex items-center gap-2 shrink-0">
            <div class="relative flex">
              <button
                :class="[
                  'flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-sm font-medium border rounded-l-lg transition-colors',
                  isRecording
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700',
                ]"
                @click="toggleRecord"
              >
                <span v-if="isRecording" class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <Mic v-else class="w-3.5 h-3.5" />
                {{ isRecording ? 'Recording…' : 'Transcribe' }}
              </button>
              <button
                :class="[
                  'flex items-center px-1.5 border-y border-r rounded-r-lg transition-colors',
                  isRecording ? 'bg-red-50 border-red-200 text-red-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700',
                ]"
                @click.stop="transcribeOpen = !transcribeOpen"
              >
                <ChevronDown class="w-3.5 h-3.5" />
              </button>

              <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="transcribeOpen" class="absolute right-0 top-full mt-1.5 z-30 w-48 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden" @click.stop>
                  <button class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700" @click="toggleRecord">
                    <Mic class="w-3.5 h-3.5 text-slate-400" />Live recording
                  </button>
                  <button class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Volume2 class="w-3.5 h-3.5 text-slate-400" />Upload audio
                  </button>
                  <div class="border-t border-slate-100" />
                  <button class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Copy class="w-3.5 h-3.5 text-slate-400" />Paste transcript
                  </button>
                </div>
              </Transition>
            </div>

            <button
              class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              @click="finishSession"
            >
              Finish Session
            </button>
          </div>
        </div>

        <!-- Row 2: metadata badges -->
        <div class="flex items-center gap-2 mt-2.5 flex-wrap">

          <!-- Date/time badge → date+time picker popover -->
          <Popover>
            <PopoverTrigger as-child>
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <CalendarDays class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                {{ fmtDateBadge(selected) }}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" class="w-80 p-5" :side-offset="8">
              <!-- Time input -->
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Session start time</p>
              <input
                v-model="selected.sessionTime"
                type="time"
                class="w-full px-4 py-2.5 border-2 border-indigo-400 rounded-xl text-base text-slate-800 focus:outline-none focus:border-indigo-500 mb-5"
              />

              <!-- Mini calendar -->
              <p class="text-sm font-semibold text-slate-800 mb-3">Session date</p>
              <div class="border border-slate-200 rounded-xl overflow-hidden">
                <!-- Month nav -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <button class="p-1 rounded-lg hover:bg-slate-100 transition-colors" @click="prevMonth">
                    <ChevronLeft class="w-4 h-4 text-slate-500" />
                  </button>
                  <span class="text-sm font-semibold text-slate-800">{{ calendarMonthLabel }}</span>
                  <button class="p-1 rounded-lg hover:bg-slate-100 transition-colors" @click="nextMonth">
                    <ChevronRight class="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <!-- Day grid -->
                <div class="p-3">
                  <!-- Day headers -->
                  <div class="grid grid-cols-7 mb-1">
                    <div v-for="d in ['S','M','T','W','T','F','S']" :key="d" class="text-center text-xs font-medium text-slate-400 py-1">{{ d }}</div>
                  </div>
                  <!-- Days -->
                  <div class="grid grid-cols-7 gap-y-0.5">
                    <button
                      v-for="day in calendarDays"
                      :key="day.toISOString()"
                      :class="[
                        'h-8 w-full flex items-center justify-center rounded-full text-sm transition-colors',
                        !isSameMonth(day, calendarViewDate) ? 'text-slate-300' : 'text-slate-700',
                        isSameDay(day, selected.sessionDate) ? 'bg-indigo-600 text-white font-semibold' : '',
                        isToday(day) && !isSameDay(day, selected.sessionDate) ? 'bg-slate-100 font-semibold' : '',
                        isSameMonth(day, calendarViewDate) && !isSameDay(day, selected.sessionDate) ? 'hover:bg-slate-100' : '',
                      ]"
                      @click="selectDay(day)"
                    >
                      {{ format(day, 'd') }}
                    </button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <!-- Language badge → language settings popover -->
          <Popover>
            <PopoverTrigger as-child>
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Languages class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                {{ selected.inputLanguage }}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" class="w-72 p-5" :side-offset="8">
              <h3 class="text-base font-bold text-slate-900 mb-4">Language settings</h3>

              <!-- Input language -->
              <div class="mb-4">
                <p class="text-sm font-semibold text-slate-800 mb-1">Input language</p>
                <p class="text-xs text-slate-400 mb-2">Used for transcripts, dictations and uploaded recordings.</p>
                <div class="relative">
                  <select
                    v-model="selected.inputLanguage"
                    class="w-full appearance-none px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 pr-10"
                  >
                    <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
                  </select>
                  <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <!-- Output language -->
              <div>
                <p class="text-sm font-semibold text-slate-800 mb-1">Output language</p>
                <p class="text-xs text-slate-400 mb-2">Used for notes and documents.</p>
                <div class="relative">
                  <select
                    v-model="selected.outputLanguage"
                    class="w-full appearance-none px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 pr-10"
                  >
                    <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
                  </select>
                  <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <!-- Trial badge -->
          <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold">
            <Zap class="w-3.5 h-3.5" />
            14 days
          </span>
        </div>
      </header>

      <!-- ── Content tabs ─────────────────────────────────────────────────── -->
      <div class="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 flex items-end">
        <button
          :class="[
            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            contentTab === 'context' ? 'text-indigo-700 dark:text-indigo-300 border-indigo-600' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200',
          ]"
          @click="contentTab = 'context'"
        >
          <LayoutGrid class="w-3.5 h-3.5" />
          Context
        </button>
        <button
          v-for="session in selected.sessions"
          :key="session.id"
          :class="[
            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            contentTab === session.id ? 'text-indigo-700 dark:text-indigo-300 border-indigo-600' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200',
          ]"
          @click="contentTab = session.id"
        >
          <Pencil class="w-3.5 h-3.5" />
          {{ session.label }}
        </button>
        <button class="px-3 py-2.5 text-slate-400 hover:text-slate-600 border-b-2 border-transparent -mb-px transition-colors" title="Add session">
          <Plus class="w-4 h-4" />
        </button>
      </div>

      <!-- ── Tab content ──────────────────────────────────────────────────── -->
      <div class="flex-1 min-h-0 flex flex-col overflow-hidden">

        <!-- Context tab -->
        <div v-if="contentTab === 'context'" class="flex-1 flex flex-col min-h-0 p-5">
          <div class="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-0">

            <!-- Textarea + right-side toolbar -->
            <div class="flex-1 relative min-h-0 flex">
              <textarea
                ref="contextAreaRef"
                :value="selected.contextText"
                placeholder="Add any additional context about the patient or paste files here"
                class="flex-1 resize-none px-5 py-5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none leading-relaxed font-[inherit] min-h-0 bg-transparent"
                @input="setContextText"
              />

              <!-- Right-side toolbar (top-right, inside card) -->
              <div class="absolute top-4 right-4 flex items-center gap-2">

                <!-- Mic group -->
                <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden" @click.stop>
                  <button class="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Voice input">
                    <Mic class="w-3.5 h-3.5" />
                  </button>
                  <div class="w-px h-4 bg-slate-200" />
                  <button class="px-1.5 py-2 text-slate-400 hover:bg-slate-50 transition-colors" @click.stop="micOpen = !micOpen">
                    <ChevronDown class="w-3 h-3" />
                  </button>
                  <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="micOpen" class="absolute right-28 top-8 z-30 w-36 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                      <button class="w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left">Record note</button>
                      <button class="w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left">Dictate text</button>
                    </div>
                  </Transition>
                </div>

                <!-- Undo / Redo group -->
                <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button class="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Undo" @click="undoContext">
                    <Undo2 class="w-3.5 h-3.5" />
                  </button>
                  <div class="w-px h-4 bg-slate-200" />
                  <button class="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Redo" @click="redoContext">
                    <Redo2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Copy group -->
                <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden" @click.stop>
                  <button class="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors" @click="copyContext">
                    Copy
                  </button>
                  <div class="w-px h-4 bg-slate-200" />
                  <button class="px-1.5 py-2 text-slate-400 hover:bg-slate-50 transition-colors" @click.stop="copyOpen = !copyOpen">
                    <ChevronDown class="w-3 h-3" />
                  </button>
                  <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="copyOpen" class="absolute right-0 top-8 z-30 w-40 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                      <button class="w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left" @click="copyContext">Copy all</button>
                      <button class="w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">Copy as Markdown</button>
                      <button class="w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">Copy as SOAP</button>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            <!-- Bottom action row -->
            <div class="flex items-center gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button class="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors" title="Link patient">
                <UserRound class="w-4 h-4" />
              </button>
              <button class="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors" title="Attach file">
                <Paperclip class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Session tabs -->
        <template v-for="session in selected.sessions" :key="session.id">
          <div v-if="contentTab === session.id" class="flex-1 flex flex-col min-h-0 p-5">
            <div class="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-0">

              <!-- Empty state -->
              <div v-if="session.transcript.length === 0" class="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Mic class="w-7 h-7 text-slate-400 dark:text-slate-500" />
                </div>
                <div class="text-center">
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Ready to transcribe</p>
                  <p class="text-xs text-slate-400 mt-1 max-w-xs">Click <strong>Transcribe</strong> to start live recording, or upload an audio file.</p>
                </div>
                <button
                  class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  @click="toggleRecord"
                >
                  <Mic class="w-4 h-4" />
                  Start recording
                </button>
              </div>

              <!-- Transcript -->
              <div v-else class="flex-1 overflow-y-auto min-h-0">
                <div v-if="session.aiSummary" class="mx-5 mt-5 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900">
                  <div class="flex items-center gap-2 mb-2">
                    <Sparkles class="w-3.5 h-3.5 text-indigo-500" />
                    <span class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Noe Summary</span>
                  </div>
                  <p class="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">{{ session.aiSummary }}</p>
                </div>

                <div class="px-5 py-4 space-y-4">
                  <div
                    v-for="(line, i) in session.transcript"
                    :key="i"
                    :class="['flex gap-3', line.speaker === 'patient' ? 'flex-row-reverse' : '']"
                  >
                    <div :class="['w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5', line.speaker === 'therapist' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600']">
                      {{ line.speaker === 'therapist' ? 'T' : 'P' }}
                    </div>
                    <div :class="['max-w-[75%] flex flex-col gap-1', line.speaker === 'patient' ? 'items-end' : 'items-start']">
                      <span class="text-[10px] text-slate-400 font-medium">
                        {{ line.speaker === 'therapist' ? 'Therapist' : 'Patient' }} · {{ line.time }}
                      </span>
                      <div :class="['px-4 py-2.5 rounded-2xl text-sm leading-relaxed', line.speaker === 'therapist' ? 'bg-slate-100 text-slate-800 rounded-tl-sm' : 'bg-indigo-600 text-white rounded-tr-sm']">
                        {{ line.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ── Noe AI bar ───────────────────────────────────────────────────── -->
      <div class="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-5 py-3">
        <!-- Previous Noe messages -->
        <div v-if="noeMessages.length > 0" class="mb-3 max-h-36 overflow-y-auto space-y-2 px-1">
          <div v-for="(msg, i) in noeMessages" :key="i" :class="['flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div v-if="msg.role === 'noe'" class="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles class="w-3 h-3 text-white" />
            </div>
            <div :class="['max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed', msg.role === 'user' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900']">
              {{ msg.text }}
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          <div class="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles class="w-3.5 h-3.5 text-white" />
          </div>
          <input
            v-model="noeInput"
            type="text"
            placeholder="Ask Noe to do anything…"
            class="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            @keydown.enter="sendNoe"
          />
          <button
            :class="['p-1.5 rounded-lg transition-colors', noeInput.trim() ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-300 cursor-default']"
            :disabled="!noeInput.trim()"
            @click="sendNoe"
          >
            <Send class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </main>
  </div>
</template>
