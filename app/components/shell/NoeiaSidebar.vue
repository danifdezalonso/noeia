<script setup lang="ts">
import { Sparkles, X, Send, ChevronRight, RotateCcw, Maximize2, Check, ListTodo, Plus, Trash2, CalendarDays } from 'lucide-vue-next'
import { useSidebar } from '~/components/ui/sidebar'
import { format, isToday, isYesterday } from 'date-fns'

// ── Chain-of-thought types ──────────────────────────────────────────────────
type CotStatus = 'complete' | 'active' | 'pending'
interface CotStep { id: string; label: string; description?: string; status: CotStatus }

const { open } = useNoeia()
const route    = useRoute()
const { open: sidebarOpen } = useSidebar()

// ── Mode ───────────────────────────────────────────────────────────────────
const mode = ref<'ai' | 'quickstart' | 'todos'>('ai')

function toggleMode(m: 'ai' | 'quickstart' | 'todos') {
  if (open.value && mode.value === m) {
    open.value = false
  } else {
    mode.value = m
    open.value = true
  }
}

// Auto-collapse left sidebar on desktop when drawer opens
watch(open, (v) => {
  if (v && process.client && window.innerWidth >= 768) {
    sidebarOpen.value = false
  }
})

// ── AI chat types & state ──────────────────────────────────────────────────
interface MessageCot { title: string; steps: CotStep[] }
interface Message { id: string; role: 'user' | 'assistant'; content: string; cot?: MessageCot; cotOpen?: boolean }

const messages  = ref<Message[]>([])
const input     = ref('')
const isTyping  = ref(false)
const inputRef  = ref<HTMLTextAreaElement>()
const scrollEnd = ref<HTMLDivElement>()

// ── Chain-of-thought state ──────────────────────────────────────────────────
const cotOpen  = ref(true)
const cotTitle = ref('Thinking…')
const cotSteps = ref<CotStep[]>([])

const CLINICAL_CONTEXTS = new Set(['patients', 'calendar', 'messages'])
const isClinical = computed(() => {
  const key = Object.keys(CONTEXTS).find(k => k !== 'dashboard' && route.path.includes(`/${k}`)) ?? 'dashboard'
  return CLINICAL_CONTEXTS.has(key)
})

const COT_CLINICAL: CotStep[] = [
  { id: 'c1', label: 'Reviewing patient context',    description: 'Checking session history and clinical notes…' },
  { id: 'c2', label: 'Analysing clinical patterns',  description: 'Evaluating treatment progress and risk indicators…' },
  { id: 'c3', label: 'Formulating clinical response', description: 'Applying evidence-based guidelines…' },
]
const COT_SAAS: CotStep[] = [
  { id: 's1', label: 'Querying platform data',   description: 'Retrieving relevant metrics and records…' },
  { id: 's2', label: 'Analysing patterns',        description: 'Cross-referencing with historical data…' },
  { id: 's3', label: 'Generating insights',       description: 'Formulating actionable recommendations…' },
]

// ── Context config per route ───────────────────────────────────────────────
interface ContextConfig { label: string; emoji: string; actions: string[] }
const CONTEXTS: Record<string, ContextConfig> = {
  calendar:  { label: 'Calendar',  emoji: '📅', actions: ["Summarize today's schedule", 'Find scheduling conflicts',  'Block focus time tomorrow',  'Show week overview'       ] },
  patients:  { label: 'Patients',  emoji: '👤', actions: ['Show high-priority patients', 'Recent no-shows',            'Patients due for follow-up', 'Draft session notes'      ] },
  billing:   { label: 'Billing',   emoji: '💳', actions: ['List overdue invoices',       'Monthly revenue summary',   'Pending commissions',        'Export this period'       ] },
  doctors:   { label: 'Doctors',   emoji: '🩺', actions: ['Team availability today',     'Performance summary',       'Pending onboardings',        'Schedule audit'           ] },
  messages:  { label: 'Messages',  emoji: '💬', actions: ['Summarize unread threads',    'Draft a reply',             'Flag urgent messages',       'Weekly digest'            ] },
  office:    { label: 'Offices',   emoji: '🏢', actions: ['Room utilization today',      'Available rooms now',       'Most used rooms this week',  'Maintenance reminders'    ] },
  dashboard: { label: 'Dashboard', emoji: '📊', actions: ['Daily summary',              'Key metrics today',         'Upcoming sessions',          'Review pending tasks'     ] },
}
const context = computed<ContextConfig>(() => {
  const path = route.path
  const key  = Object.keys(CONTEXTS).find(k => k !== 'dashboard' && path.includes(`/${k}`)) ?? 'dashboard'
  return CONTEXTS[key]!
})

// ── Mock responses ─────────────────────────────────────────────────────────
const RESPONSES: { kw: string[]; text: string }[] = [
  { kw: ['today', 'summary', 'summarize', 'schedule'],   text: 'You have 4 sessions today:\n• 9:00 AM — Sofia Martinez (Online)\n• 11:00 AM — James Wilson (In-person, Room 101)\n• 2:30 PM — Emma Thompson (Online)\n• 4:00 PM — Focus block (2h)\n\nAll sessions confirmed. No conflicts detected.' },
  { kw: ['conflict', 'overlap'],                         text: '1 potential conflict found this week:\nTuesday 11:00 AM — Emma Thompson (Dr. Voss) overlaps with James Wilson (Dr. Silva) in Room 101.\n\nRoom 102 is free at that time — shall I suggest the move?' },
  { kw: ['overdue', 'invoice'],                          text: '3 overdue invoices totalling €440:\n• INV-2504 — David Lee — €160 (48d overdue)\n• INV-2508 — Nora Williams — €140 (31d overdue)\n• INV-2506 — Lucas Martín — €140 (12d overdue)\n\nWould you like me to draft reminder emails?' },
  { kw: ['revenue', 'monthly', 'income'],                text: "This month's revenue:\n• Total billed: €2,220\n• Collected: €990 (44.6%)\n• Pending: €790\n• Overdue: €440\n\nRevenue is up 5.4% vs last month. Top earner: Dr. Marc Vidal (€420)." },
  { kw: ['patient', 'priority', 'follow', 'no-show'],   text: 'Patients flagged for follow-up:\n1. Carlos Rivera — Missed last 2 sessions\n2. Hannah Kim — Due for quarterly review\n3. Noah Chen — No-show last week, rescheduling pending' },
  { kw: ['doctor', 'team', 'availability'],              text: 'Team availability today:\n• Dr. Elena Voss — Available 9am–6pm (3 slots)\n• Dr. Marco Silva — Booked until 3pm\n• Dr. Priya Nair — Day off\n• Dr. James Okafor — Available all day (5 slots)' },
  { kw: ['focus', 'block'],                              text: 'Best focus window tomorrow:\nTuesday 2:00–4:00 PM — No sessions, low conflict risk.\n\nShall I create a Focus block on your calendar?' },
  { kw: ['commission', 'pending'],                       text: 'Pending doctor commissions:\n• Dr. Marc Vidal — €126.00 (pending)\n• Dr. Ana Ruiz — €210.00 (billed)\n• Dr. Omar López — €99.00 (draft)\n\nTotal outstanding: €435.00' },
  { kw: ['room', 'utilization', 'available'],            text: 'Room utilization today:\n• Room 101 — 5/8 slots (62%)\n• Room 102 — 2/8 slots (25%)\n• Room 201 — 8/8 slots (100% — fully booked)' },
  { kw: ['metric', 'key', 'kpi'],                        text: "Today's key metrics:\n• Sessions: 4 completed, 1 upcoming\n• Revenue generated: €530\n• No-show rate: 0% (this week)\n• Avg session score: 4.7/5" },
]
function getResponse(msg: string) {
  const lower = msg.toLowerCase()
  return RESPONSES.find(r => r.kw.some(kw => lower.includes(kw)))?.text
    ?? "I'm analyzing your current view. Could you be more specific? Ask about sessions, patients, billing, or team availability."
}

async function sendMessage(text: string) {
  if (!text.trim() || isTyping.value) return
  messages.value.push({ id: crypto.randomUUID(), role: 'user', content: text.trim() })
  input.value = ''
  isTyping.value = true

  // Initialise chain-of-thought
  const persona = isClinical.value ? 'Psychologist AI' : 'SaaS AI'
  cotTitle.value = `${persona} thinking…`
  cotOpen.value  = true
  const base = (isClinical.value ? COT_CLINICAL : COT_SAAS).map(s => ({ ...s, status: 'pending' as CotStatus }))
  cotSteps.value = base

  await nextTick()
  scrollEnd.value?.scrollIntoView({ behavior: 'smooth' })

  // Animate steps: pending → active → complete
  const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
  for (let si = 0; si < cotSteps.value.length; si++) {
    cotSteps.value[si].status = 'active'
    await delay(220 + Math.random() * 80)
    cotSteps.value[si].status = 'complete'
    scrollEnd.value?.scrollIntoView({ behavior: 'smooth' })
  }
  await delay(120)

  isTyping.value = false
  cotOpen.value  = false // auto-collapse; user can re-open

  const responseText = getResponse(text)
  const msg: Message = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '',
    cot: { title: `${persona} thinking`, steps: cotSteps.value.map(s => ({ ...s })) },
    cotOpen: false,
  }
  messages.value.push(msg)
  let i = 0
  const tick = setInterval(() => {
    if (i < responseText.length) { msg.content += responseText.slice(i, i + 5); i += 5; scrollEnd.value?.scrollIntoView({ behavior: 'smooth' }) }
    else clearInterval(tick)
  }, 16)
}
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value) }
}
function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 96)}px`
}
function clearChat() { messages.value = [] }
watch(open, v => { if (v && mode.value === 'ai') nextTick(() => inputRef.value?.focus()) })

// ── Quick Start checklist ──────────────────────────────────────────────────
const checklist = ref([
  { id: 1,  label: 'Complete your profile setup',    done: true  },
  { id: 2,  label: 'Create your first session',       done: true  },
  { id: 3,  label: 'Add your first patient',          done: true  },
  { id: 4,  label: 'Set your working hours',          done: true  },
  { id: 5,  label: 'Connect your calendar',           done: true  },
  { id: 6,  label: 'Customize session templates',     done: true  },
  { id: 7,  label: 'Review billing settings',         done: true  },
  { id: 8,  label: 'Generate a bill',                 done: false },
  { id: 9,  label: 'Invite your team',                done: false },
  { id: 10, label: 'Send your first message',         done: false },
])
const completedCount = computed(() => checklist.value.filter(i => i.done).length)
const pendingCount   = computed(() => checklist.value.filter(i => !i.done).length)
const progress       = computed(() => Math.round(completedCount.value / checklist.value.length * 100))
function toggleItem(id: number) {
  const item = checklist.value.find(i => i.id === id)
  if (item) item.done = !item.done
}

// ── Tasks & Notes ──────────────────────────────────────────────────────────
const cal = useCalendar()
const taskEvents = computed(() =>
  cal.events.value
    .filter(e => e.category === 'task')
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start))
)

// Task add form
const newTaskTitle = ref('')
const newTaskDate  = ref('')

// Task inline edit
const editingTaskId    = ref<string | null>(null)
const editingTaskTitle = ref('')

function addTask() {
  const title = newTaskTitle.value.trim()
  if (!title) return
  const d = newTaskDate.value || new Date().toISOString().slice(0, 10)
  cal.saveEvent({
    title,
    start: d,
    end:   d,
    category: 'task',
    done: false,
    allDay: true,
    recurrence: 'none',
  })
  newTaskTitle.value = ''
  newTaskDate.value  = ''
}

function startEditTask(task: { id: string; title: string }) {
  editingTaskId.value    = task.id
  editingTaskTitle.value = task.title
}

function saveTaskEdit(task: { id: string }) {
  const ev = cal.events.value.find(e => e.id === task.id)
  if (ev && editingTaskTitle.value.trim() && editingTaskTitle.value.trim() !== ev.title) {
    cal.saveEvent({ ...ev, title: editingTaskTitle.value.trim() })
  }
  editingTaskId.value    = null
  editingTaskTitle.value = ''
}

// Sticky note colors
const NOTE_COLORS = [
  'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-700/60',
  'bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-700/60',
  'bg-sky-100 dark:bg-sky-900/40 border-sky-200 dark:border-sky-700/60',
  'bg-pink-100 dark:bg-pink-900/40 border-pink-200 dark:border-pink-700/60',
  'bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700/60',
  'bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-700/60',
] as const

interface SidebarNote { id: string; text: string; date: Date; color: string }
const sidebarNotes = useState<SidebarNote[]>('sidebar-notes', () => [])
const noteInput    = ref('')
const todosTab     = ref<'tasks' | 'notes'>('tasks')

function addNote() {
  const t = noteInput.value.trim()
  if (!t) return
  const color = NOTE_COLORS[sidebarNotes.value.length % NOTE_COLORS.length]!
  sidebarNotes.value.unshift({ id: crypto.randomUUID(), text: t, date: new Date(), color })
  noteInput.value = ''
}

function deleteNote(id: string) {
  sidebarNotes.value = sidebarNotes.value.filter(n => n.id !== id)
}

function fmtNoteDate(d: Date) {
  if (isToday(d))     return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

function formatTaskDate(start: string) {
  const d = new Date(start)
  if (isToday(d))     return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}
</script>

<template>
  <div class="flex flex-shrink-0 self-stretch my-2 mr-2 rounded-xl overflow-hidden border border-sidebar-border shadow-md">

    <!-- ── Drawer panel ──────────────────────────────────────────────────── -->
    <div
      class="noeia-panel overflow-hidden bg-background transition-[width] duration-300 ease-in-out"
      :style="{ width: open ? '420px' : '0px' }"
    >
      <div class="w-[420px] h-full flex flex-col">

        <!-- ══ NOEIA AI PANEL ══════════════════════════════════════════════ -->
        <template v-if="mode === 'ai'">

          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-violet-300/40">
                <Sparkles class="w-4 h-4 text-white" />
              </div>
              <span class="text-sm font-bold text-foreground">Noeia AI</span>
            </div>
            <div class="flex items-center gap-0.5">
              <button v-if="messages.length > 0" title="Clear chat" class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" @click="clearChat">
                <RotateCcw class="w-3.5 h-3.5" />
              </button>
              <button class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" @click="open = false">
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Context badge -->
          <div class="px-4 py-2.5 border-b border-border/40 flex-shrink-0">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-lg text-xs text-muted-foreground font-medium">
              <span>{{ context.emoji }}</span>
              {{ context.label }}
              <span class="text-muted-foreground/50 font-normal">context active</span>
            </span>
          </div>

          <!-- Messages area — top-aligned -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">

            <!-- Welcome state -->
            <template v-if="messages.length === 0">
              <!-- Top-aligned header (no centering) -->
              <div class="flex items-center gap-3 pb-3">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200/40 dark:shadow-violet-900/40 flex-shrink-0">
                  <Sparkles class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-foreground">How can I help?</h3>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ context.label }} context is active.</p>
                </div>
              </div>

              <!-- Quick action chips -->
              <div class="space-y-1.5">
                <button
                  v-for="action in context.actions"
                  :key="action"
                  class="w-full text-left px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:border-violet-200 dark:hover:border-violet-800 hover:text-violet-800 dark:hover:text-violet-300 transition-all flex items-center justify-between group"
                  @click="sendMessage(action)"
                >
                  <span>{{ action }}</span>
                  <ChevronRight class="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-violet-400 transition-colors shrink-0" />
                </button>
              </div>
            </template>

            <!-- Chat messages -->
            <template v-else>
              <div v-for="msg in messages" :key="msg.id" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">

                <!-- Assistant message -->
                <div v-if="msg.role === 'assistant'" class="flex items-start gap-2 max-w-[92%]">
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles class="w-3 h-3 text-white" />
                  </div>
                  <div class="flex flex-col gap-1.5 flex-1 min-w-0">
                    <!-- Collapsed chain-of-thought (re-openable) -->
                    <AiChainOfThought
                      v-if="msg.cot"
                      :steps="msg.cot.steps"
                      :title="msg.cot.title"
                      :open="msg.cotOpen ?? false"
                      @update:open="msg.cotOpen = $event"
                    />
                    <div class="bg-card border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-foreground shadow-sm whitespace-pre-line leading-relaxed">
                      {{ msg.content }}
                    </div>
                  </div>
                </div>

                <!-- User message -->
                <div v-else class="max-w-[80%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm leading-relaxed">
                  {{ msg.content }}
                </div>
              </div>

              <!-- Typing indicator + live chain-of-thought -->
              <div v-if="isTyping" class="flex items-start gap-2">
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles class="w-3 h-3 text-white" />
                </div>
                <div class="flex flex-col gap-1.5 flex-1 min-w-0">
                  <AiChainOfThought :steps="cotSteps" :title="cotTitle" :open="cotOpen" @update:open="cotOpen = $event" />
                  <div class="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm self-start">
                    <div class="flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay:0ms"   />
                      <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay:150ms" />
                      <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay:300ms" />
                    </div>
                  </div>
                </div>
              </div>
              <div ref="scrollEnd" />
            </template>

          </div>

          <!-- Input -->
          <div class="flex-shrink-0 border-t border-border p-3">
            <div class="flex items-end gap-2 bg-muted rounded-xl border border-border pl-3.5 pr-2 py-2">
              <textarea
                ref="inputRef"
                v-model="input"
                placeholder="Ask anything about this view…"
                rows="1"
                class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-snug"
                style="max-height: 96px; overflow-y: auto;"
                @keydown="handleKeydown"
                @input="autoResize"
              />
              <button
                :disabled="!input.trim() || isTyping"
                :class="['flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all', input.trim() && !isTyping ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'bg-muted text-muted-foreground cursor-not-allowed']"
                @click="sendMessage(input)"
              >
                <Send class="w-3.5 h-3.5" />
              </button>
            </div>
            <p class="text-[10px] text-muted-foreground/40 text-center mt-1.5 select-none">Noeia AI · Clinical context mode</p>
          </div>

        </template>

        <!-- ══ TASKS & NOTES PANEL ════════════════════════════════════════ -->
        <template v-else-if="mode === 'todos'">

          <!-- Header -->
          <div class="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
            <ListTodo class="w-4 h-4 text-primary flex-shrink-0" />
            <span class="text-sm font-bold text-foreground flex-1">Tasks & Notes</span>
            <button class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" @click="open = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Tab switcher -->
          <div class="flex border-b border-border flex-shrink-0">
            <button
              :class="['flex-1 py-2 text-xs font-semibold transition-colors', todosTab === 'tasks' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground']"
              @click="todosTab = 'tasks'"
            >Tasks</button>
            <button
              :class="['flex-1 py-2 text-xs font-semibold transition-colors', todosTab === 'notes' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground']"
              @click="todosTab = 'notes'"
            >Notes</button>
          </div>

          <!-- ── Tasks tab ─────────────────────────────────────────────── -->
          <template v-if="todosTab === 'tasks'">
            <!-- Add task form -->
            <div class="flex-shrink-0 px-3 pt-3 pb-2.5 border-b border-border">
              <div class="flex gap-2 items-center">
                <input
                  v-model="newTaskTitle"
                  type="text"
                  placeholder="Add a task…"
                  class="flex-1 text-xs bg-muted rounded-lg border border-border px-2.5 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  @keydown.enter.exact.prevent="addTask"
                />
                <input
                  v-model="newTaskDate"
                  type="date"
                  class="w-[110px] text-xs bg-muted rounded-lg border border-border px-2 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  :disabled="!newTaskTitle.trim()"
                  :class="['flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors', newTaskTitle.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-default']"
                  @click="addTask"
                >
                  <Plus class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Task list -->
            <div class="flex-1 overflow-y-auto min-h-0 px-3 py-3 space-y-1.5">
              <div v-if="taskEvents.length === 0" class="py-8 text-center">
                <CalendarDays class="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p class="text-xs text-muted-foreground">No tasks yet. Add one above!</p>
              </div>
              <div
                v-for="task in taskEvents"
                :key="task.id"
                class="group flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors"
              >
                <!-- Checkbox -->
                <button
                  :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all', task.done ? 'bg-green-500 border-green-500' : 'border-border hover:border-primary']"
                  @click="cal.toggleTaskDone(task.id)"
                >
                  <Check v-if="task.done" class="w-2.5 h-2.5 text-white" />
                </button>

                <!-- Title (click to edit) -->
                <div class="flex-1 min-w-0">
                  <input
                    v-if="editingTaskId === task.id"
                    v-model="editingTaskTitle"
                    type="text"
                    class="w-full text-xs font-medium bg-background border border-primary rounded px-1.5 py-0.5 text-foreground focus:outline-none"
                    @blur="saveTaskEdit(task)"
                    @keydown.enter.exact.prevent="saveTaskEdit(task)"
                    @keydown.escape="editingTaskId = null"
                  />
                  <p
                    v-else
                    :class="['text-xs font-medium leading-snug cursor-text', task.done ? 'line-through text-muted-foreground' : 'text-foreground hover:text-primary']"
                    @click="startEditTask(task)"
                  >{{ task.title }}</p>
                  <p class="text-[10px] text-muted-foreground mt-0.5">{{ formatTaskDate(task.start) }}</p>
                </div>

                <!-- Delete -->
                <button
                  class="flex-shrink-0 p-1 rounded text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
                  @click="cal.deleteEvents([task.id])"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>

            <div class="flex-shrink-0 border-t border-border p-3">
              <button
                class="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                @click="navigateTo(`/${useRoute().path.includes('/organization/') ? 'organization' : 'doctor'}/dashboard/calendar`)"
              >
                <CalendarDays class="w-3.5 h-3.5" />
                Go to Calendar
              </button>
            </div>
          </template>

          <!-- ── Notes tab ─────────────────────────────────────────────── -->
          <template v-else>
            <!-- Add note input -->
            <div class="flex-shrink-0 px-3 pt-3 pb-2 border-b border-border">
              <div class="flex gap-2">
                <textarea
                  v-model="noteInput"
                  placeholder="Add a note…"
                  rows="2"
                  class="flex-1 text-xs bg-muted rounded-lg border border-border px-2.5 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  @keydown.enter.exact.prevent="addNote"
                />
                <button
                  :disabled="!noteInput.trim()"
                  :class="['flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors self-end', noteInput.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-default']"
                  @click="addNote"
                >
                  <Plus class="w-3.5 h-3.5" />
                </button>
              </div>
              <p class="text-[10px] text-muted-foreground mt-1">Press Enter to add</p>
            </div>

            <!-- Sticky notes grid -->
            <div class="flex-1 overflow-y-auto min-h-0 px-3 py-3">
              <div v-if="sidebarNotes.length === 0" class="py-8 text-center">
                <p class="text-xs text-muted-foreground">No notes yet. Add your first one above.</p>
              </div>
              <div v-else class="grid grid-cols-2 gap-2.5">
                <div
                  v-for="note in sidebarNotes"
                  :key="note.id"
                  :class="['group relative rounded-xl border p-3 shadow-sm flex flex-col gap-2 min-h-[90px]', note.color]"
                >
                  <p class="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap break-words flex-1">{{ note.text }}</p>
                  <p class="text-[10px] text-foreground/50 font-medium">{{ fmtNoteDate(note.date) }}</p>
                  <button
                    class="absolute top-1.5 right-1.5 p-0.5 rounded text-foreground/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    @click="deleteNote(note.id)"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </template>

        </template>

        <!-- ══ QUICK START PANEL ═══════════════════════════════════════════ -->
        <template v-else>

          <!-- Header -->
          <div class="flex items-center gap-2.5 px-4 py-3 border-b border-border flex-shrink-0">
            <div class="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center flex-shrink-0">
              <span class="text-violet-700 dark:text-violet-300 text-xs font-bold leading-none">{{ pendingCount }}</span>
            </div>
            <span class="text-sm font-bold text-foreground flex-1">Quick start</span>
            <button class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Maximize2 class="w-3.5 h-3.5" />
            </button>
            <button class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" @click="open = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto min-h-0">

            <!-- Hero section -->
            <div class="px-5 pt-5 pb-6 bg-background">
              <div class="flex items-start justify-between gap-4 mb-6">
                <div class="flex-1">
                  <h2 class="text-xl font-bold text-foreground mb-3">Quick start</h2>
                  <p class="text-sm text-muted-foreground leading-relaxed">
                    Use our Quick Start guide to learn about everything Noeia can do for you and your product.
                  </p>
                </div>
                <!-- Hedgehog mascot -->
                <div class="w-20 h-20 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 text-4xl">
                  🦔
                </div>
              </div>

              <!-- Progress -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-foreground">Progress</span>
                <span class="text-sm font-semibold text-muted-foreground">{{ progress }}%</span>
              </div>
              <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full bg-violet-500 transition-all duration-500"
                  :style="{ width: `${progress}%` }"
                />
              </div>
            </div>

            <!-- Divider -->
            <div class="h-px bg-border" />

            <!-- Checklist -->
            <div class="px-5 pt-5 pb-6 bg-muted/30 dark:bg-card/60">
              <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Onboarding checklist</p>

              <div class="space-y-2">
                <button
                  v-for="item in checklist"
                  :key="item.id"
                  :class="[
                    'w-full flex items-center gap-3 text-left transition-all group',
                    item.done
                      ? 'px-0 py-1.5'
                      : 'px-4 py-3.5 bg-background rounded-xl border border-border hover:border-violet-200 dark:hover:border-violet-800 shadow-sm',
                  ]"
                  @click="toggleItem(item.id)"
                >
                  <!-- Check circle -->
                  <div
                    :class="[
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      item.done
                        ? 'bg-green-500 border-green-500'
                        : 'border-border group-hover:border-violet-400',
                    ]"
                  >
                    <Check v-if="item.done" class="w-3.5 h-3.5 text-white" />
                  </div>

                  <!-- Label -->
                  <span
                    :class="[
                      'text-sm transition-colors',
                      item.done
                        ? 'line-through text-muted-foreground'
                        : 'font-medium text-foreground',
                    ]"
                  >
                    {{ item.label }}
                  </span>
                </button>
              </div>
            </div>

          </div>

        </template>

      </div>
    </div>

    <!-- ── Ribbon ────────────────────────────────────────────────────────── -->
    <div class="w-12 flex-shrink-0 bg-background border-l border-border flex flex-col items-center select-none">

      <!-- NoeIA AI section -->
      <div
        :class="[
          'w-full flex flex-col items-center pt-3 pb-3 gap-2 cursor-pointer transition-colors',
          open && mode === 'ai' ? 'bg-violet-50 dark:bg-violet-950/40' : 'hover:bg-accent',
        ]"
        @click="toggleMode('ai')"
      >
        <div
          :class="[
            'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
            open && mode === 'ai'
              ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-300/40 dark:shadow-violet-900/40'
              : 'bg-violet-100 dark:bg-violet-900/40',
          ]"
        >
          <Sparkles :class="['w-4 h-4 transition-colors', open && mode === 'ai' ? 'text-white' : 'text-violet-600 dark:text-violet-400']" />
        </div>
        <div style="writing-mode: vertical-lr; text-orientation: mixed; transform: rotate(180deg)">
          <span :class="['text-[10px] font-bold tracking-widest uppercase transition-colors', open && mode === 'ai' ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground']">
            Noeia AI
          </span>
        </div>
      </div>

      <!-- Separator -->
      <div class="w-7 h-px bg-border flex-shrink-0" />

      <!-- Tasks & Notes section -->
      <div
        :class="[
          'w-full flex flex-col items-center pt-3 pb-3 gap-2 cursor-pointer transition-colors',
          open && mode === 'todos' ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-accent',
        ]"
        @click="toggleMode('todos')"
      >
        <div
          :class="[
            'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
            open && mode === 'todos'
              ? 'bg-primary shadow-sm'
              : 'bg-primary/10 dark:bg-primary/20',
          ]"
        >
          <ListTodo :class="['w-4 h-4 transition-colors', open && mode === 'todos' ? 'text-white' : 'text-primary']" />
        </div>
        <div style="writing-mode: vertical-lr; text-orientation: mixed; transform: rotate(180deg)">
          <span :class="['text-[10px] font-bold tracking-widest uppercase transition-colors', open && mode === 'todos' ? 'text-primary' : 'text-muted-foreground']">
            Tasks
          </span>
        </div>
      </div>

      <!-- Separator -->
      <div class="w-7 h-px bg-border flex-shrink-0" />

      <!-- Quick Start section -->
      <div
        :class="[
          'w-full flex-1 flex flex-col items-center pt-3 pb-3 gap-2 cursor-pointer transition-colors',
          open && mode === 'quickstart' ? 'bg-violet-50 dark:bg-violet-950/40' : 'hover:bg-accent',
        ]"
        @click="toggleMode('quickstart')"
      >
        <!-- Pending count badge — bordered box matching the screenshot -->
        <div
          :class="[
            'w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0',
            open && mode === 'quickstart'
              ? 'border-indigo-400 bg-violet-50 dark:bg-violet-950/60'
              : 'border-border bg-card',
          ]"
        >
          <span :class="['text-sm font-bold leading-none transition-colors', open && mode === 'quickstart' ? 'text-violet-600 dark:text-violet-300' : 'text-muted-foreground']">
            {{ pendingCount }}
          </span>
        </div>

        <div style="writing-mode: vertical-lr; text-orientation: mixed; transform: rotate(180deg)">
          <span :class="['text-[10px] font-semibold tracking-widest uppercase transition-colors', open && mode === 'quickstart' ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground']">
            Quick start
          </span>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
/* Below 1024px (tablets & small laptops): drawer overlays instead of pushing content */
@media (max-width: 1023px) {
  .noeia-panel {
    position: fixed !important;
    right: 48px;
    top: 66px; /* header h-14 (56px) + mt-2 (8px) + border (~2px) */
    bottom: 0;
    z-index: 40;
  }
}
</style>
