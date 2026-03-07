<script setup lang="ts">
import {
  Trash2, Plus, Send, Sparkles, ChevronDown, ChevronLeft, ChevronRight,
  Mic, Undo2, Redo2, Copy, Paperclip, UserRound, LayoutGrid, Pencil,
  Languages, CalendarDays, Volume2, X,
  Bold, Italic, Underline, Strikethrough, List, Heading1,
  PanelLeftClose, PanelLeftOpen,
  ExternalLink, PenLine, Zap, RotateCcw,
  LayoutTemplate, Search, ArrowUpDown, FileText, User, Globe,
  RefreshCw, FilePlus, FileEdit, Check,
} from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import {
  format, addDays, startOfWeek, subWeeks, addMonths, subMonths,
  startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday,
} from 'date-fns'
import { nextTick } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Switch } from '~/components/ui/switch'
import { Slider } from '~/components/ui/slider'

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
  noteText: string
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
    id: 'a0', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: 'Today', tab: 'schedule',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: 'Referred by Dr. García. Generalised anxiety, sleep disturbance. CBT-based approach ongoing.',
    sessionDate: new Date(), sessionTime: '10:00',
    sessions: [{ id: 's0', label: 'Session Today', noteText: '', transcript: [] }],
  },
  {
    id: 'a1', patientName: 'Maddy Test', initials: 'MT',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '4:25pm', groupLabel: 'Today', tab: 'schedule',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: new Date(), sessionTime: '01:54',
    sessions: [{ id: 's1', label: 'Session Feb 21', noteText: '', transcript: [] }],
  },
  {
    id: 'a2', patientName: 'Maddy Test', initials: 'MT',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '2:00pm', groupLabel: '22/02/2026', tab: 'schedule',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: 'Patient reported improvement in sleep patterns last week. Continue CBT techniques for anxiety management.\n\nReferral from Dr. García (GP). Original complaint: generalised anxiety, sleep disturbance.',
    sessionDate: addDays(mon, 1), sessionTime: '14:00',
    sessions: [{ id: 's2', label: 'Session Feb 22', noteText: '', transcript: [] }],
  },
  {
    id: 'a3', patientName: 'John Doe', initials: 'JD',
    avatarBg: 'bg-sky-100', avatarText: 'text-sky-700',
    time: '10:00am', groupLabel: '24/02/2026', tab: 'schedule',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: addDays(mon, 3), sessionTime: '10:00',
    sessions: [{ id: 's3', label: 'Session Feb 24', noteText: '', transcript: [] }],
  },
  {
    id: 'a4', patientName: 'Maddy Test', initials: 'MT',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '3:00pm', groupLabel: '20/02/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: 'Patient has been experiencing work-related stress. Referred by Dr. García.',
    sessionDate: addDays(prev, 3), sessionTime: '15:00',
    sessions: [{
      id: 's4', label: 'Session Feb 20', noteText: '',
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
      id: 's5', label: 'Session Feb 18', noteText: '',
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

// AI configuration
const aiConfig = reactive({
  scribe: 'free' as 'free' | 'pro',
  voice: 'Goldilocks',
  detail: [50] as number[],
  bulletPoints: false,
  quotes: false,
  abbreviations: true,
})
const AI_VOICES = ['Goldilocks', 'Clinical', 'Concise', 'Detailed', 'Empathetic']
const aiConfigOpen = ref(false)
function resetAiConfig() {
  aiConfig.scribe = 'free'; aiConfig.voice = 'Goldilocks'; aiConfig.detail = [50]
  aiConfig.bulletPoints = false; aiConfig.quotes = false; aiConfig.abbreviations = true
}

// Edit session name
const editNameOpen  = ref(false)
const editNameDraft = ref('')

function openEditName() {
  editNameDraft.value = selected.value.patientName
  editNameOpen.value  = true
}
function saveEditName() {
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (appt && editNameDraft.value.trim()) appt.patientName = editNameDraft.value.trim()
  editNameOpen.value = false
}

// Templates
const templateOpen    = ref(false)
const templateSearch  = ref('')
const hidePro         = ref(false)

interface Template { id: string; name: string; pro: boolean; favourite?: boolean }
const TEMPLATES_FAVOURITES: Template[] = [
  { id: 'tf0', name: 'Patient Explainer Letter', pro: true, favourite: true },
]
const TEMPLATES_NOTES: Template[] = [
  { id: 'tn0', name: 'Patient Explainer Letter', pro: true },
  { id: 'tn1', name: 'ADOS-2', pro: true },
  { id: 'tn2', name: 'Audit C', pro: true },
  { id: 'tn3', name: 'Case Formulation [4Ps]', pro: true },
  { id: 'tn4', name: 'Progress Note', pro: false },
  { id: 'tn5', name: 'Session Summary', pro: false },
]

function filteredTemplates(list: Template[]) {
  const q = templateSearch.value.toLowerCase()
  return list.filter(t => {
    if (hidePro.value && t.pro) return false
    return !q || t.name.toLowerCase().includes(q)
  })
}

const calSidebarOpen = ref(true)
const isRecording    = ref(false)
const transcribeOpen = ref(false)
const copyOpen       = ref(false)
const micOpen        = ref(false)
const noeInput          = ref('')
const noeMessages       = ref<{ role: 'user' | 'noe'; text: string }[]>([])
const noeThinking       = ref(false)
const noeActiveResponse = ref<{ text: string; userQuery: string } | null>({
  userQuery: 'Summarize this session',
  text: 'Session Summary — Elena Vasquez, Session 12\n\nElena presented with reduced anxiety symptoms this week (PHQ-7: 8, down from 12). She reported successfully using the breathing technique during a conflict with her sister. Key themes: fear of abandonment, difficulty asserting needs, and ongoing progress with grounding exercises.\n\nInterventions used: CBT cognitive restructuring, mindfulness breathing, behavioral activation planning.\n\nClinical plan: Continue weekly sessions. Assign thought record journaling for catastrophizing patterns. Consider introducing EMDR for early attachment trauma in the next session.',
})

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

// ── Sidebar mini day calendar ───────────────────────────────────────────────

const HOUR_RANGE = [8,9,10,11,12,13,14,15,16,17,18,19]

const todayAppointments = computed(() =>
  appointments.value.filter(a => isToday(a.sessionDate)),
)

function appointmentsAtHour(h: number) {
  return todayAppointments.value.filter(a => {
    const hour = parseInt(a.sessionTime.split(':')[0] ?? '0', 10)
    return hour === h
  })
}

// ── Calendar grid ──────────────────────────────────────────────────────────

const calendarDays = computed(() => {
  const monthStart = startOfMonth(calendarViewDate.value)
  const monthEnd   = endOfMonth(calendarViewDate.value)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 0 })
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

const contextAreaRef  = ref<HTMLElement | null>(null)
const textColorOpen   = ref(false)
const bgColorOpen     = ref(false)
const textStyleOpen   = ref(false)

const fmtBold      = ref(false)
const fmtItalic    = ref(false)
const fmtUnderline = ref(false)
const fmtStrike    = ref(false)
const fmtBlock     = ref('p')

const textStyles = [
  { tag: 'p',  label: 'Normal text', style: { fontSize: '0.8rem' } },
  { tag: 'h1', label: 'Heading 1',   style: { fontSize: '1.4rem', fontWeight: '700' } },
  { tag: 'h2', label: 'Heading 2',   style: { fontSize: '1.15rem', fontWeight: '700' } },
  { tag: 'h3', label: 'Heading 3',   style: { fontSize: '0.95rem', fontWeight: '600' } },
]

const textStyleLabel = computed(() => {
  const found = textStyles.find(s => s.tag === fmtBlock.value)
  return found?.label ?? 'Normal text'
})

const colorPalette = [
  ['#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#d9d9d9','#efefef','#f3f3f3','#ffffff'],
  ['#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff','#9900ff','#ff00ff','#ff0088'],
  ['#980000','#ff6600','#ffcc00','#00aa00','#007799','#1155cc','#0000bb','#7300cc','#bb0099','#bb0044'],
  ['#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e4ef','#c9daf8','#cfe2f3','#d9d2e9','#ead1dc','#ffd7d2'],
  ['#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#a4c2f4','#9fc5e8','#b4a7d6','#d5a6bd','#ff9988'],
  ['#e06666','#f6b26b','#ffd966','#93c47d','#76a5af','#6d9eeb','#6fa8dc','#8e7cc3','#c27ba0','#e06666'],
  ['#cc0000','#e69138','#f1c232','#6aa84f','#45818e','#3c78d8','#3d85c8','#674ea7','#a64d79','#cc0000'],
  ['#7f0000','#783f04','#7f6000','#274e13','#0c343d','#1c4587','#073763','#20124d','#4c1130','#660000'],
]

function undoContext() { contextAreaRef.value?.focus(); document.execCommand('undo') }
function redoContext()  { contextAreaRef.value?.focus(); document.execCommand('redo') }

function onEditorInput(e: Event) {
  const el = e.target as HTMLElement
  const html = el.innerHTML
  if (contentTab.value === 'context') {
    if (selected.value) selected.value.contextText = html
  } else {
    const s = selected.value?.sessions.find(s => s.id === contentTab.value)
    if (s) s.noteText = html
  }
}

function syncEditorFromState() {
  nextTick(() => {
    const el = contextAreaRef.value
    if (el) el.innerHTML = activeText.value
  })
}

function updateFormatState() {
  fmtBold.value      = document.queryCommandState('bold')
  fmtItalic.value    = document.queryCommandState('italic')
  fmtUnderline.value = document.queryCommandState('underline')
  fmtStrike.value    = document.queryCommandState('strikeThrough')
  fmtBlock.value     = document.queryCommandValue('formatBlock').toLowerCase() || 'p'
}

function execFormat(command: string, value?: string) {
  contextAreaRef.value?.focus()
  document.execCommand(command, false, value)
  updateFormatState()
}

function applyTextStyle(tag: string) {
  contextAreaRef.value?.focus()
  document.execCommand('formatBlock', false, tag)
  updateFormatState()
  textStyleOpen.value = false
}

function applyTextColor(color: string) {
  if (!window.getSelection()?.toString()) { textColorOpen.value = false; return }
  contextAreaRef.value?.focus()
  document.execCommand('foreColor', false, color)
  textColorOpen.value = false
}

function applyBgColor(color: string) {
  if (!window.getSelection()?.toString()) { bgColorOpen.value = false; return }
  contextAreaRef.value?.focus()
  document.execCommand('hiliteColor', false, color)
  bgColorOpen.value = false
}

// Unified active text — reads/writes the correct field based on the active tab
const activeText = computed({
  get() {
    if (contentTab.value === 'context') return selected.value.contextText
    return selected.value.sessions.find(s => s.id === contentTab.value)?.noteText ?? ''
  },
  set(v: string) {
    if (contentTab.value === 'context') {
      selected.value.contextText = v
    } else {
      const s = selected.value.sessions.find(s => s.id === contentTab.value)
      if (s) s.noteText = v
    }
  },
})

const currentSession = computed(() =>
  contentTab.value !== 'context'
    ? selected.value.sessions.find(s => s.id === contentTab.value) ?? null
    : null,
)

const transcriptExpanded = ref(false)
watch(contentTab, () => { transcriptExpanded.value = false; syncEditorFromState() })
watch(selectedId, syncEditorFromState, { flush: 'post' })

function addSession() {
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (!appt) return
  const n = appt.sessions.length + 1
  const newSession: SessionRecord = {
    id: crypto.randomUUID(),
    label: `Session ${n}`,
    noteText: '',
    transcript: [],
  }
  appt.sessions.push(newSession)
  contentTab.value = newSession.id
}

function removeSession(id: string) {
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (!appt) return
  appt.sessions = appt.sessions.filter(s => s.id !== id)
  if (contentTab.value === id)
    contentTab.value = appt.sessions.at(-1)?.id ?? 'context'
}

function plainToHtml(text: string): string {
  return text.split('\n\n')
    .map(p => `<p>${p.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function copyContext() {
  const text = contextAreaRef.value?.innerText ?? selected.value?.contextText ?? ''
  navigator.clipboard.writeText(text)
  copyOpen.value = false
}

function sendNoe() {
  if (!noeInput.value.trim()) return
  const query = noeInput.value
  noeInput.value = ''
  noeActiveResponse.value = null
  noeThinking.value = true
  setTimeout(() => {
    noeThinking.value = false
    noeActiveResponse.value = {
      userQuery: query,
      text: 'I\'ve reviewed the session context. Would you like me to draft a SOAP note, generate a summary, or suggest next steps for this patient?',
    }
  }, 1200)
}

function copyNoeText() {
  if (noeActiveResponse.value)
    navigator.clipboard.writeText(noeActiveResponse.value.text)
}

function addToNote() {
  if (!noeActiveResponse.value || !selected.value) return
  const html = plainToHtml(noeActiveResponse.value.text)
  const s = selected.value.sessions.find(s => s.id === contentTab.value)
  if (s) {
    s.noteText = s.noteText ? s.noteText + html : html
  } else if (contentTab.value === 'context') {
    selected.value.contextText += html
  }
  syncEditorFromState()
}

function replaceNote() {
  if (!noeActiveResponse.value || !selected.value) return
  const html = plainToHtml(noeActiveResponse.value.text)
  const s = selected.value.sessions.find(s => s.id === contentTab.value)
  if (s) s.noteText = html
  else if (contentTab.value === 'context') selected.value.contextText = html
  syncEditorFromState()
}

function addNoeTab() {
  if (!noeActiveResponse.value) return
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (!appt) return
  const n = appt.sessions.length + 1
  const newSession = { id: crypto.randomUUID(), label: `Session ${n}`, noteText: plainToHtml(noeActiveResponse.value.text), transcript: [] }
  appt.sessions.push(newSession)
  contentTab.value = newSession.id
}

function regenerateNoe() {
  if (!noeActiveResponse.value) return
  const query = noeActiveResponse.value.userQuery
  noeActiveResponse.value = null
  setTimeout(() => {
    noeActiveResponse.value = {
      userQuery: query,
      text: 'Updated summary: Elena continues to show significant progress managing anxiety with CBT techniques. Mood stabilization observed across contexts. Recommend continuation of current plan with gradual introduction of exposure therapy components targeting social situations.',
    }
  }, 900)
}

function fmtDateBadge(appt: Appointment) {
  if (appt.tab === 'schedule' && appt.groupLabel === 'Today')
    return `Today ${appt.sessionTime}`
  return format(appt.sessionDate, 'MMM d') + ' ' + appt.sessionTime
}

const languages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian']

const { noeiaLinkedEvent } = useCalendar()

onMounted(() => {
  // Auto-select appointment if navigated from a calendar session
  const linked = noeiaLinkedEvent.value
  if (linked?.patientName) {
    const match = appointments.value.find(
      a => a.patientName.toLowerCase() === linked.patientName!.toLowerCase(),
    )
    if (match) selectAppointment(match.id)
    noeiaLinkedEvent.value = null
  }

  syncEditorFromState()

  document.addEventListener('selectionchange', updateFormatState)

  document.addEventListener('click', () => {
    transcribeOpen.value = false
    copyOpen.value       = false
    micOpen.value        = false
    textColorOpen.value  = false
    bgColorOpen.value    = false
  })
})
</script>

<template>
  <div class="flex-1 flex overflow-hidden min-h-0">

    <!-- ══ Left sidebar ═══════════════════════════════════════════════════ -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 -translate-x-4"
      leave-to-class="opacity-0 -translate-x-4"
    >
    <aside v-show="calSidebarOpen" class="w-52 sm:w-60 md:w-64 flex flex-col bg-background border-r border-border/50 shrink-0 min-w-0">

      <!-- Mini today's day view -->
      <div class="mx-3 mt-3 mb-1 rounded-xl border border-border bg-card overflow-hidden shrink-0">
        <div class="px-3 py-1.5 flex items-center justify-between border-b border-border/40">
          <span class="text-[11px] font-semibold text-foreground">Today</span>
          <span class="text-[10px] text-muted-foreground">{{ format(new Date(), 'EEE, MMM d') }}</span>
        </div>
        <div class="overflow-y-auto" style="max-height:160px">
          <!-- Hour rows -->
          <div
            v-for="h in HOUR_RANGE"
            :key="h"
            class="flex items-stretch border-t border-border/20"
            style="height:22px"
          >
            <span class="text-[9px] text-muted-foreground/50 w-8 pl-1.5 shrink-0 flex items-center">{{ h }}</span>
            <div class="flex-1 relative">
              <button
                v-for="appt in appointmentsAtHour(h)"
                :key="appt.id"
                :class="[
                  'absolute inset-y-0.5 inset-x-0.5 rounded px-1.5 text-[9px] font-medium truncate w-full text-left',
                  selectedId === appt.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/30 text-primary hover:bg-primary/50',
                ]"
                @click="selectAppointment(appt.id)"
              >{{ appt.patientName }}</button>
            </div>
          </div>
          <div v-if="todayAppointments.length === 0" class="py-2 text-center">
            <span class="text-[10px] text-muted-foreground/50">No sessions today</span>
          </div>
        </div>
      </div>

      <!-- Today's appointment list -->
      <div class="flex-1 overflow-y-auto py-2">
        <p class="px-4 pt-2 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Today's sessions</p>
        <button
          v-for="appt in todayAppointments"
          :key="appt.id"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left',
            selectedId === appt.id ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-accent',
          ]"
          @click="selectAppointment(appt.id)"
        >
          <Avatar class="size-8 shrink-0">
            <AvatarImage :src="avatarUrl(appt.patientName)" :alt="appt.patientName" />
            <AvatarFallback :class="['text-xs font-bold', appt.avatarBg, appt.avatarText]">{{ appt.initials }}</AvatarFallback>
          </Avatar>
          <div class="min-w-0 flex-1">
            <p :class="['text-sm font-medium truncate leading-tight', selectedId === appt.id ? 'text-primary' : 'text-foreground']">
              {{ appt.patientName }}
            </p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ appt.time }}</p>
          </div>
          <div v-if="selectedId === appt.id" class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
        </button>
        <p v-if="todayAppointments.length === 0" class="px-4 py-3 text-xs text-muted-foreground/60">No sessions today</p>
      </div>
    </aside>
    </Transition>

    <!-- ══ Main area ══════════════════════════════════════════════════════ -->
    <main class="flex-1 flex flex-col min-w-0 bg-muted/30">

      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <header class="shrink-0 bg-background border-b border-border/50 px-6 pt-4 pb-3">

        <!-- Row 1: patient name + trash + right actions -->
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2 min-w-0 flex-wrap">
            <button
              class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
              :title="calSidebarOpen ? 'Hide sidebar' : 'Show sidebar'"
              @click="calSidebarOpen = !calSidebarOpen"
            >
              <PanelLeftClose v-if="calSidebarOpen" class="w-4 h-4" />
              <PanelLeftOpen v-else class="w-4 h-4" />
            </button>
            <h2 class="text-xl font-bold text-foreground truncate">{{ selected.patientName }}</h2>
            <button class="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors shrink-0" title="Edit session name" @click="openEditName">
              <Pencil class="w-4 h-4" />
            </button>

            <!-- Date/time badge → date+time picker popover -->
            <Popover>
              <PopoverTrigger as-child>
                <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors">
                  <CalendarDays class="w-3.5 h-3.5 text-muted-foreground" />
                  {{ fmtDateBadge(selected) }}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" class="w-80 p-5" :side-offset="8">
                <!-- Time input -->
                <p class="text-sm font-semibold text-foreground mb-3">Session start time</p>
                <input
                  v-model="selected.sessionTime"
                  type="time"
                  class="w-full px-4 py-2.5 border border-border rounded-xl text-base text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary mb-5 transition-colors"
                />

                <!-- Mini calendar -->
                <p class="text-sm font-semibold text-foreground mb-3">Session date</p>
                <div class="border border-border rounded-xl overflow-hidden">
                  <!-- Month nav -->
                  <div class="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <button class="p-1 rounded-lg hover:bg-accent transition-colors" @click="prevMonth">
                      <ChevronLeft class="w-4 h-4 text-muted-foreground" />
                    </button>
                    <span class="text-sm font-semibold text-foreground">{{ calendarMonthLabel }}</span>
                    <button class="p-1 rounded-lg hover:bg-accent transition-colors" @click="nextMonth">
                      <ChevronRight class="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <!-- Day grid -->
                  <div class="p-3">
                    <div class="grid grid-cols-7 mb-1">
                      <div v-for="d in ['S','M','T','W','T','F','S']" :key="d" class="text-center text-xs font-medium text-muted-foreground py-1">{{ d }}</div>
                    </div>
                    <div class="grid grid-cols-7 gap-y-0.5">
                      <button
                        v-for="day in calendarDays"
                        :key="day.toISOString()"
                        :class="[
                          'h-8 w-full flex items-center justify-center rounded-full text-sm transition-colors',
                          !isSameMonth(day, calendarViewDate) ? 'text-muted-foreground/40' : 'text-foreground',
                          isSameDay(day, selected.sessionDate) ? 'bg-primary text-primary-foreground font-semibold' : '',
                          isToday(day) && !isSameDay(day, selected.sessionDate) ? 'bg-muted font-semibold' : '',
                          isSameMonth(day, calendarViewDate) && !isSameDay(day, selected.sessionDate) ? 'hover:bg-accent' : '',
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
                <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors">
                  <Languages class="w-3.5 h-3.5 text-muted-foreground" />
                  {{ selected.inputLanguage }}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" class="w-72 p-5" :side-offset="8">
                <h3 class="text-base font-bold text-foreground mb-4">Language settings</h3>

                <!-- Input language -->
                <div class="mb-4">
                  <p class="text-sm font-semibold text-foreground mb-1">Input language</p>
                  <p class="text-xs text-muted-foreground mb-2">Used for transcripts, dictations and uploaded recordings.</p>
                  <div class="relative">
                    <select
                      v-model="selected.inputLanguage"
                      class="w-full appearance-none px-4 py-2.5 border border-border rounded-xl text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary pr-10 transition-colors"
                    >
                      <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <!-- Output language -->
                <div>
                  <p class="text-sm font-semibold text-foreground mb-1">Output language</p>
                  <p class="text-xs text-muted-foreground mb-2">Used for notes and documents.</p>
                  <div class="relative">
                    <select
                      v-model="selected.outputLanguage"
                      class="w-full appearance-none px-4 py-2.5 border border-border rounded-xl text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary pr-10 transition-colors"
                    >
                      <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <!-- Transcribe -->
          <div class="flex items-center gap-2 shrink-0">
            <div class="relative flex">
              <button
                :class="[
                  'flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-sm font-medium border rounded-l-lg transition-colors',
                  isRecording
                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                    : 'bg-card text-foreground border-border hover:bg-accent',
                ]"
                @click="toggleRecord"
              >
                <span v-if="isRecording" class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                </span>
                <Mic v-else class="w-3.5 h-3.5" />
                {{ isRecording ? 'Recording…' : 'Transcribe' }}
              </button>
              <button
                :class="[
                  'flex items-center px-1.5 border-y border-r rounded-r-lg transition-colors',
                  isRecording ? 'bg-destructive/10 border-destructive/30 text-destructive/60' : 'bg-card border-border text-muted-foreground hover:bg-accent',
                ]"
                @click.stop="transcribeOpen = !transcribeOpen"
              >
                <ChevronDown class="w-3.5 h-3.5" />
              </button>

              <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="transcribeOpen" class="absolute right-0 top-full mt-1.5 z-30 w-48 bg-card rounded-xl border border-border shadow-lg overflow-hidden" @click.stop>
                  <button class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-accent" @click="toggleRecord">
                    <Mic class="w-3.5 h-3.5 text-muted-foreground" />Live recording
                  </button>
                  <button class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-accent">
                    <Volume2 class="w-3.5 h-3.5 text-muted-foreground" />Upload audio
                  </button>
                  <div class="border-t border-border" />
                  <button class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-accent">
                    <Copy class="w-3.5 h-3.5 text-muted-foreground" />Paste transcript
                  </button>
                </div>
              </Transition>
            </div>

          </div>
        </div>

      </header>

      <!-- ── Content tabs ─────────────────────────────────────────────────── -->
      <div class="shrink-0 bg-background flex items-end gap-0.5 px-4 pt-2 overflow-x-auto">

        <!-- Context tab -->
        <button
          :class="[
            'group shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-t-lg transition-colors select-none',
            contentTab === 'context'
              ? 'bg-card border border-border border-b-card -mb-px relative z-10 text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
          ]"
          @click="contentTab = 'context'"
        >
          <LayoutGrid class="w-3.5 h-3.5 shrink-0" />
          Context
        </button>

        <!-- Session tabs -->
        <button
          v-for="session in selected.sessions"
          :key="session.id"
          :class="[
            'group shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-t-lg transition-colors select-none',
            contentTab === session.id
              ? 'bg-card border border-border border-b-card -mb-px relative z-10 text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
          ]"
          @click="contentTab = session.id"
        >
          <Pencil class="w-3 h-3 shrink-0" />
          <span class="max-w-[120px] truncate">{{ session.label }}</span>
          <span
            class="ml-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted-foreground/20"
            @click.stop="removeSession(session.id)"
          >
            <X class="w-2.5 h-2.5" />
          </span>
        </button>

        <!-- Add tab -->
        <button
          class="shrink-0 mb-1 p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
          title="New session"
          @click="addSession"
        >
          <Plus class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- ── Tab content ──────────────────────────────────────────────────── -->
      <div class="flex-1 min-h-0 flex flex-col overflow-hidden">

        <!-- Unified editor for all tabs -->
        <div class="flex-1 flex flex-col min-h-0 px-4 pb-4 pt-0">
          <div class="flex-1 flex flex-col bg-card rounded-b-xl border-x border-b border-border shadow-sm overflow-hidden min-h-0">

            <!-- Toolbar row -->
            <div class="shrink-0 flex items-center justify-between gap-2 px-4 py-2 border-b border-border/50">

              <!-- Left: Template + Customize style grouped -->
              <div class="flex items-center gap-2">
                <!-- Template button -->
                <button
                  class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg border border-border transition-colors"
                  @click="templateOpen = true"
                >
                  <LayoutTemplate class="w-3.5 h-3.5" />
                  Template
                </button>

              <!-- AI Configuration popover -->
              <Popover v-model:open="aiConfigOpen">
                <PopoverTrigger as-child>
                  <button class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg border border-border transition-colors">
                    <Sparkles class="w-3.5 h-3.5" />
                    Customize style
                    <ChevronDown class="w-3 h-3 opacity-60" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" class="w-72 p-0 overflow-hidden" :side-offset="8">
                  <!-- Header -->
                  <div class="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <span class="text-sm font-semibold text-foreground">Customize style</span>
                    <a href="#" class="flex items-center gap-1 text-xs text-primary hover:underline">
                      Learn more <ExternalLink class="w-3 h-3" />
                    </a>
                  </div>

                  <div class="px-4 py-3 space-y-4">
                    <!-- Scribe -->
                    <div>
                      <p class="text-xs font-semibold text-foreground mb-2">Scribe</p>
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          :class="[
                            'flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-colors text-left',
                            aiConfig.scribe === 'free'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-border/80 hover:bg-accent',
                          ]"
                          @click="aiConfig.scribe = 'free'"
                        >
                          <Pencil class="w-4 h-4 text-muted-foreground" />
                          <span class="text-xs font-semibold text-foreground leading-tight">Free</span>
                          <span class="text-[10px] text-muted-foreground leading-tight">Fast for simple sessions</span>
                        </button>
                        <button
                          :class="[
                            'flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-colors text-left relative',
                            aiConfig.scribe === 'pro'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-border/80 hover:bg-accent',
                          ]"
                          @click="aiConfig.scribe = 'pro'"
                        >
                          <div class="flex items-center gap-1">
                            <PenLine class="w-4 h-4 text-muted-foreground" />
                            <span class="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                              <Zap class="w-2.5 h-2.5" />PRO
                            </span>
                          </div>
                          <span class="text-xs font-semibold text-foreground leading-tight">Pro</span>
                          <span class="text-[10px] text-muted-foreground leading-tight">Best for complex sessions</span>
                        </button>
                      </div>
                    </div>

                    <!-- Voice -->
                    <div>
                      <p class="text-xs font-semibold text-foreground mb-1.5">Voice</p>
                      <div class="relative">
                        <select
                          v-model="aiConfig.voice"
                          class="w-full appearance-none pl-3 pr-8 py-2 border border-border rounded-lg text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors"
                        >
                          <option v-for="v in AI_VOICES" :key="v" :value="v">{{ v }}</option>
                        </select>
                        <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <!-- Detail -->
                    <div>
                      <p class="text-xs font-semibold text-foreground mb-2">Detail</p>
                      <Slider v-model="aiConfig.detail" :min="0" :max="100" :step="50" class="mb-1.5" />
                      <div class="flex justify-between text-[10px] text-muted-foreground">
                        <span>Low</span><span>Medium</span><span>High</span>
                      </div>
                    </div>

                    <!-- Toggles -->
                    <div class="space-y-2.5">
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-foreground">Bullet points</span>
                        <Switch v-model:checked="aiConfig.bulletPoints" class="scale-90" />
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-foreground">Quotes</span>
                        <Switch v-model:checked="aiConfig.quotes" class="scale-90" />
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-foreground">Abbreviations</span>
                        <Switch v-model:checked="aiConfig.abbreviations" class="scale-90" />
                      </div>
                    </div>

                    <!-- Reset -->
                    <button class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors" @click="resetAiConfig">
                      <RotateCcw class="w-3 h-3" />
                      Reset to default
                    </button>
                  </div>

                  <!-- Footer -->
                  <div class="px-4 py-2.5 border-t border-border/50 bg-muted/30 flex items-center justify-between gap-2">
                    <span class="text-[10px] text-muted-foreground leading-tight">Template instructions are prioritized</span>
                    <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input type="checkbox" class="w-3 h-3 rounded border-border accent-primary" />
                      <span class="text-[10px] text-foreground font-medium">Save as default</span>
                    </label>
                  </div>
                </PopoverContent>
              </Popover>
              </div><!-- end left group -->

              <div class="flex items-center gap-2">
              <!-- Mic group -->
              <div class="relative flex items-center border border-border rounded-lg overflow-visible" @click.stop>
                <button class="p-2 text-muted-foreground hover:bg-accent transition-colors" title="Voice input">
                  <Mic class="w-3.5 h-3.5" />
                </button>
                <div class="w-px h-4 bg-border" />
                <button class="px-1.5 py-2 text-muted-foreground hover:bg-accent transition-colors" @click.stop="micOpen = !micOpen">
                  <ChevronDown class="w-3 h-3" />
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <div v-if="micOpen" class="absolute right-0 top-full mt-1 z-30 w-36 bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                    <button class="w-full px-3 py-2 text-sm text-foreground hover:bg-accent text-left">Record note</button>
                    <button class="w-full px-3 py-2 text-sm text-foreground hover:bg-accent text-left">Dictate text</button>
                  </div>
                </Transition>
              </div>

              <!-- Undo / Redo group -->
              <div class="flex items-center border border-border rounded-lg overflow-hidden">
                <button class="p-2 text-muted-foreground hover:bg-accent transition-colors" title="Undo" @click="undoContext">
                  <Undo2 class="w-3.5 h-3.5" />
                </button>
                <div class="w-px h-4 bg-border" />
                <button class="p-2 text-muted-foreground hover:bg-accent transition-colors" title="Redo" @click="redoContext">
                  <Redo2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Copy group -->
              <div class="relative flex items-center border border-border rounded-lg overflow-visible" @click.stop>
                <button class="flex items-center gap-1.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors" @click="copyContext">
                  Copy
                </button>
                <div class="w-px h-4 bg-border" />
                <button class="px-1.5 py-2 text-muted-foreground hover:bg-accent transition-colors" @click.stop="copyOpen = !copyOpen">
                  <ChevronDown class="w-3 h-3" />
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <div v-if="copyOpen" class="absolute right-0 top-full mt-1 z-30 w-40 bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                    <button class="w-full px-3 py-2 text-sm text-foreground hover:bg-accent text-left" @click="copyContext">Copy all</button>
                    <button class="w-full px-3 py-2 text-sm text-foreground hover:bg-accent text-left">Copy as Markdown</button>
                    <button class="w-full px-3 py-2 text-sm text-foreground hover:bg-accent text-left">Copy as SOAP</button>
                  </div>
                </Transition>
              </div>
              </div><!-- end right group -->
            </div>

            <!-- Formatting toolbar -->
            <div class="shrink-0 flex items-center gap-0.5 px-3 py-1 border-b border-border/40" @click.stop>
              <!-- Undo / Redo -->
              <button class="fmt-btn" title="Undo" @mousedown.prevent @click="undoContext"><Undo2 class="w-3.5 h-3.5" /></button>
              <button class="fmt-btn" title="Redo" @mousedown.prevent @click="redoContext"><Redo2 class="w-3.5 h-3.5" /></button>
              <div class="fmt-sep" />

              <!-- Text style dropdown -->
              <div class="relative" @click.stop>
                <button
                  class="flex items-center gap-1 px-2 py-1 h-7 text-xs rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors whitespace-nowrap"
                  @mousedown.prevent @click="textStyleOpen = !textStyleOpen; textColorOpen = false; bgColorOpen = false"
                >
                  {{ textStyleLabel }}<ChevronDown class="w-3 h-3 opacity-60 shrink-0" />
                </button>
                <div v-if="textStyleOpen" class="absolute top-full left-0 mt-1 z-30 bg-popover border border-border rounded-xl shadow-xl overflow-hidden w-44">
                  <button
                    v-for="s in textStyles" :key="s.tag"
                    class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent transition-colors border-b border-border/30 last:border-0"
                    @mousedown.prevent @click="applyTextStyle(s.tag)"
                  >
                    <span :style="s.style">{{ s.label }}</span>
                    <Check v-if="fmtBlock === s.tag" class="w-3.5 h-3.5 text-primary shrink-0" />
                  </button>
                </div>
              </div>
              <div class="fmt-sep" />

              <!-- Bold / Italic / Underline / Strike -->
              <button :class="['fmt-btn font-bold', fmtBold ? 'fmt-btn-active' : '']" title="Bold" @mousedown.prevent @click="execFormat('bold')">B</button>
              <button :class="['fmt-btn italic', fmtItalic ? 'fmt-btn-active' : '']" title="Italic" @mousedown.prevent @click="execFormat('italic')">I</button>
              <button :class="['fmt-btn underline', fmtUnderline ? 'fmt-btn-active' : '']" title="Underline" @mousedown.prevent @click="execFormat('underline')">U</button>
              <button :class="['fmt-btn', fmtStrike ? 'fmt-btn-active' : '']" title="Strikethrough" @mousedown.prevent @click="execFormat('strikeThrough')"><Strikethrough class="w-3.5 h-3.5" /></button>
              <div class="fmt-sep" />

              <!-- Text color -->
              <div class="relative" @click.stop>
                <button class="fmt-btn" title="Text color" @mousedown.prevent @click="textColorOpen = !textColorOpen; bgColorOpen = false; textStyleOpen = false">
                  <span class="fmt-color-a" style="--fmt-color: #EF4444">A</span>
                </button>
                <div v-if="textColorOpen" class="absolute top-full left-0 mt-1 z-30 bg-popover border border-border rounded-xl shadow-xl p-3">
                  <div v-for="(row, ri) in colorPalette" :key="ri" class="flex gap-1 mb-1 last:mb-0">
                    <button
                      v-for="c in row" :key="c"
                      class="w-5 h-5 rounded-full hover:scale-110 transition-transform shrink-0"
                      :style="{ backgroundColor: c, outline: c === '#ffffff' ? '1px solid #e5e7eb' : 'none' }"
                      @mousedown.prevent @click="applyTextColor(c)"
                    />
                  </div>
                </div>
              </div>

              <!-- Highlight -->
              <div class="relative" @click.stop>
                <button class="fmt-btn" title="Highlight color" @mousedown.prevent @click="bgColorOpen = !bgColorOpen; textColorOpen = false; textStyleOpen = false">
                  <span class="fmt-highlight-a">A</span>
                </button>
                <div v-if="bgColorOpen" class="absolute top-full left-0 mt-1 z-30 bg-popover border border-border rounded-xl shadow-xl p-3">
                  <div v-for="(row, ri) in colorPalette" :key="ri" class="flex gap-1 mb-1 last:mb-0">
                    <button
                      v-for="c in row" :key="c"
                      class="w-5 h-5 rounded-full hover:scale-110 transition-transform shrink-0"
                      :style="{ backgroundColor: c, outline: c === '#ffffff' ? '1px solid #e5e7eb' : 'none' }"
                      @mousedown.prevent @click="applyBgColor(c)"
                    />
                  </div>
                </div>
              </div>
              <div class="fmt-sep" />

              <!-- List -->
              <button class="fmt-btn" title="Bullet list" @mousedown.prevent @click="execFormat('insertUnorderedList')"><List class="w-3.5 h-3.5" /></button>
            </div>

            <!-- Rich text editor -->
            <div class="flex-1 min-h-0 overflow-y-auto">
              <div
                ref="contextAreaRef"
                contenteditable="true"
                :data-placeholder="contentTab === 'context' ? 'Add context about the patient, paste files or notes here…' : 'Write session notes here…'"
                class="noeia-editor w-full min-h-full px-5 py-4 text-sm text-foreground focus:outline-none leading-relaxed"
                @input="onEditorInput"
              />
            </div>

            <!-- Transcript section (sessions with existing transcript) -->
            <template v-if="currentSession && currentSession.transcript.length > 0">
              <button
                class="shrink-0 flex items-center justify-between w-full px-4 py-2.5 border-t border-border/50 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                @click="transcriptExpanded = !transcriptExpanded"
              >
                <div class="flex items-center gap-1.5">
                  <Mic class="w-3.5 h-3.5" />
                  Transcript · {{ currentSession.transcript.length }} lines
                </div>
                <ChevronDown :class="['w-3.5 h-3.5 transition-transform', transcriptExpanded ? 'rotate-180' : '']" />
              </button>
              <div v-if="transcriptExpanded" class="shrink-0 max-h-64 overflow-y-auto border-t border-border/30">
                <div v-if="currentSession.aiSummary" class="mx-4 mt-3 p-3 rounded-xl bg-primary/5 border border-primary/15 mb-3">
                  <div class="flex items-center gap-1.5 mb-1.5">
                    <Sparkles class="w-3 h-3 text-primary" />
                    <span class="text-[10px] font-semibold text-primary uppercase tracking-wider">Noe Summary</span>
                  </div>
                  <p class="text-xs text-foreground leading-relaxed">{{ currentSession.aiSummary }}</p>
                </div>
                <div class="px-4 pb-3 space-y-3">
                  <div
                    v-for="(line, i) in currentSession.transcript"
                    :key="i"
                    :class="['flex gap-2.5', line.speaker === 'patient' ? 'flex-row-reverse' : '']"
                  >
                    <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5', line.speaker === 'therapist' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground']">
                      {{ line.speaker === 'therapist' ? 'T' : 'P' }}
                    </div>
                    <div :class="['max-w-[75%] flex flex-col gap-0.5', line.speaker === 'patient' ? 'items-end' : 'items-start']">
                      <span class="text-[9px] text-muted-foreground">{{ line.speaker === 'therapist' ? 'Therapist' : 'Patient' }} · {{ line.time }}</span>
                      <div :class="['px-3 py-2 rounded-xl text-xs leading-relaxed', line.speaker === 'therapist' ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground']">
                        {{ line.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Bottom action row -->
            <div class="flex items-center gap-2 px-4 py-3 border-t border-border/50 shrink-0">
              <button class="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors" title="Link patient">
                <UserRound class="w-4 h-4" />
              </button>
              <button class="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors" title="Attach file">
                <Paperclip class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Noe AI bar ───────────────────────────────────────────────────── -->
      <div class="shrink-0 bg-background border-t border-border px-4 py-3">

        <!-- Unified card: response/thinking + input bound together -->
        <div :class="['border border-border bg-card shadow-sm overflow-hidden', (noeActiveResponse || noeThinking) ? 'rounded-xl' : 'rounded-xl']">

          <!-- Thinking state -->
          <div v-if="noeThinking && !noeActiveResponse" class="px-3 py-2.5 border-b border-border/50 flex items-center gap-2">
            <div class="w-4 h-4 rounded-md bg-primary flex items-center justify-center shrink-0">
              <Sparkles class="w-2.5 h-2.5 text-primary-foreground" />
            </div>
            <div class="flex items-center gap-1">
              <span class="thinking-dot" />
              <span class="thinking-dot" style="animation-delay:0.2s" />
              <span class="thinking-dot" style="animation-delay:0.4s" />
            </div>
          </div>

          <!-- Active AI response -->
          <template v-if="noeActiveResponse">
            <!-- Card header -->
            <div class="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div class="flex items-center gap-1.5">
                <div class="w-4 h-4 rounded-md bg-primary flex items-center justify-center">
                  <Sparkles class="w-2.5 h-2.5 text-primary-foreground" />
                </div>
                <span class="text-xs font-semibold text-foreground">Noe</span>
              </div>
              <button class="w-5 h-5 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" @click="noeActiveResponse = null">
                <X class="w-3 h-3" />
              </button>
            </div>
            <!-- Response text -->
            <div class="px-3 py-2.5 text-xs text-foreground leading-relaxed max-h-44 overflow-y-auto whitespace-pre-line border-b border-border/50">{{ noeActiveResponse.text }}</div>
            <!-- Action buttons -->
            <div class="flex items-center gap-1 px-3 py-2 border-b border-border/50 flex-wrap">
              <button class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors" @click="copyNoeText">
                <Copy class="w-3 h-3" />Copy text
              </button>
              <button class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors" @click="addToNote">
                <FilePlus class="w-3 h-3" />Add to note
              </button>
              <button class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors" @click="replaceNote">
                <FileEdit class="w-3 h-3" />Replace note
              </button>
              <button class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors" @click="addNoeTab">
                <Plus class="w-3 h-3" />New tab
              </button>
              <button class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-auto" @click="regenerateNoe">
                <RefreshCw class="w-3 h-3" />Regenerate
              </button>
            </div>
          </template>

          <!-- Input bar (always at bottom, flush to card) -->
          <div class="flex items-center gap-2 px-3 py-2">
          <div class="w-5 h-5 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles class="w-3 h-3 text-primary-foreground" />
          </div>
          <input
            v-model="noeInput"
            type="text"
            placeholder="Ask Noe to do anything…"
            class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            @keydown.enter="sendNoe"
          />
          <button class="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors" title="Voice input">
            <Mic class="w-3.5 h-3.5" />
          </button>
          <button
            :class="['w-7 h-7 flex items-center justify-center rounded-full transition-colors', noeInput.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground/40 cursor-default']"
            :disabled="!noeInput.trim()"
            @click="sendNoe"
          >
            <Send class="w-3.5 h-3.5" />
          </button>
        </div>
        </div><!-- end unified card -->
      </div>

    </main>
  </div>

  <!-- ══ Edit Session Name Dialog ════════════════════════════════════════ -->
  <Dialog v-model:open="editNameOpen">
    <DialogContent class="sm:max-w-sm gap-0 p-0">
      <DialogTitle class="px-6 pt-6 pb-4 text-base font-semibold border-b border-border">Edit session name</DialogTitle>
      <DialogDescription class="sr-only">Rename this session</DialogDescription>
      <div class="px-6 py-5">
        <input
          v-model="editNameDraft"
          type="text"
          class="w-full px-4 py-2.5 border border-border rounded-xl text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-colors"
          placeholder="Session name"
          @keydown.enter="saveEditName"
          @keydown.escape="editNameOpen = false"
          autofocus
        />
      </div>
      <div class="flex justify-end gap-2 px-6 pb-6">
        <button class="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-accent transition-colors" @click="editNameOpen = false">Cancel</button>
        <button class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" @click="saveEditName">Save</button>
      </div>
    </DialogContent>
  </Dialog>

  <!-- ══ Templates Dialog ══════════════════════════════════════════════════ -->
  <Dialog v-model:open="templateOpen">
    <DialogContent class="flex flex-col gap-0 p-0 max-h-[80vh] sm:max-w-xl overflow-hidden">
      <DialogTitle class="sr-only">Templates</DialogTitle>
      <DialogDescription class="sr-only">Select or create a session template</DialogDescription>

      <!-- Search bar -->
      <div class="flex items-center gap-3 px-5 py-4 border-b border-border">
        <Search class="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          v-model="templateSearch"
          type="text"
          placeholder="Search or generate anything"
          class="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          autofocus
        />
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-2 px-5 py-3 border-b border-border">
        <button class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground border border-dashed border-border rounded-lg hover:bg-accent transition-colors">
          <ArrowUpDown class="w-3.5 h-3.5 text-muted-foreground" />
          Sort
        </button>
        <button class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground border border-dashed border-border rounded-lg hover:bg-accent transition-colors">
          <FileText class="w-3.5 h-3.5 text-muted-foreground" />
          Type
        </button>
        <button class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground border border-dashed border-border rounded-lg hover:bg-accent transition-colors">
          <User class="w-3.5 h-3.5 text-muted-foreground" />
          Creator
        </button>
        <div class="flex-1" />
        <label class="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
          Hide Pro
          <button
            role="switch"
            :aria-checked="hidePro"
            :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors', hidePro ? 'bg-primary' : 'bg-muted-foreground/30']"
            @click="hidePro = !hidePro"
          >
            <span :class="['inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform', hidePro ? 'translate-x-[18px]' : 'translate-x-[3px]']" />
          </button>
        </label>
      </div>

      <!-- Template list (scrollable) -->
      <div class="flex-1 overflow-y-auto min-h-0">

        <!-- Favourites section -->
        <template v-if="filteredTemplates(TEMPLATES_FAVOURITES).length > 0">
          <p class="px-5 pt-4 pb-1.5 text-xs font-semibold text-muted-foreground">Favourites</p>
          <button
            v-for="t in filteredTemplates(TEMPLATES_FAVOURITES)"
            :key="t.id"
            class="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/60 transition-colors text-left"
            @click="templateOpen = false"
          >
            <Pencil class="w-4 h-4 text-muted-foreground shrink-0" />
            <span class="flex-1 text-sm text-foreground">{{ t.name }}</span>
            <span v-if="t.pro" class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white shrink-0">
              <Zap class="w-3.5 h-3.5" />
            </span>
          </button>
        </template>

        <!-- Note templates section -->
        <template v-if="filteredTemplates(TEMPLATES_NOTES).length > 0">
          <p class="px-5 pt-4 pb-1.5 text-xs font-semibold text-muted-foreground">Note templates</p>
          <button
            v-for="t in filteredTemplates(TEMPLATES_NOTES)"
            :key="t.id"
            class="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/60 transition-colors text-left"
            @click="templateOpen = false"
          >
            <Pencil class="w-4 h-4 text-muted-foreground shrink-0" />
            <span class="flex-1 text-sm text-foreground">{{ t.name }}</span>
            <span v-if="t.pro" class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white shrink-0">
              <Zap class="w-3.5 h-3.5" />
            </span>
          </button>
        </template>

        <div v-if="filteredTemplates(TEMPLATES_FAVOURITES).length === 0 && filteredTemplates(TEMPLATES_NOTES).length === 0" class="py-12 text-center">
          <p class="text-sm text-muted-foreground">No templates found</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="shrink-0 border-t border-border px-5 py-3 flex items-center justify-between">
        <button class="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors">
          <Plus class="w-4 h-4" />
          Create new template
        </button>
        <label class="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
          Set as default
          <button
            role="switch"
            :aria-checked="false"
            class="relative inline-flex h-5 w-9 items-center rounded-full bg-muted-foreground/30 transition-colors"
          >
            <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow translate-x-[3px] transition-transform" />
          </button>
        </label>
      </div>

      <!-- Trial banner -->
      <div class="shrink-0 bg-indigo-50 dark:bg-indigo-950/40 px-5 py-3 flex items-center justify-between gap-4">
        <p class="text-sm text-indigo-900 dark:text-indigo-200">
          You've got <strong>12 days</strong> left in your trial of the Clinician plan
        </p>
        <button class="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shrink-0 transition-colors">
          <Zap class="w-3.5 h-3.5" />
          Upgrade
        </button>
      </div>
    </DialogContent>
  </Dialog>

</template>

<style scoped>
.fmt-btn {
  width: 1.75rem;
  height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  flex-shrink: 0;
  transition: background-color 150ms, color 150ms;
}
.fmt-btn:hover {
  background-color: var(--accent);
  color: var(--accent-foreground);
}
.fmt-btn-active {
  background-color: var(--accent);
  color: var(--accent-foreground);
}
.fmt-sep {
  width: 1px;
  height: 1rem;
  background-color: color-mix(in srgb, var(--border) 60%, transparent);
  margin-inline: 0.25rem;
  flex-shrink: 0;
}
.fmt-color-a {
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1;
  padding-bottom: 1px;
  border-bottom: 2.5px solid var(--fmt-color, #EF4444);
}
.fmt-highlight-a {
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1;
  padding: 0 2px;
  border-radius: 2px;
  background: #FEF08A;
  color: #000;
}

.thinking-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--muted-foreground);
  animation: thinking-bounce 1.2s ease-in-out infinite;
}
@keyframes thinking-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.noeia-editor:empty::before {
  content: attr(data-placeholder);
  color: color-mix(in srgb, var(--muted-foreground) 50%, transparent);
  pointer-events: none;
}
.noeia-editor:focus {
  outline: none;
}
.noeia-editor :deep(h1) {
  font-size: 1.5em;
  font-weight: 700;
  margin-bottom: 0.5em;
}
.noeia-editor :deep(h2) {
  font-size: 1.2em;
  font-weight: 700;
  margin-bottom: 0.4em;
}
.noeia-editor :deep(h3) {
  font-size: 1em;
  font-weight: 600;
  margin-bottom: 0.3em;
}
.noeia-editor :deep(ul) {
  list-style: disc;
  padding-left: 1.5em;
}
.noeia-editor :deep(p) {
  margin-bottom: 0.5em;
}
.noeia-editor :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
