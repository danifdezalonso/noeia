<script setup lang="ts">
import {
  Sparkles, X, Send, ChevronRight, RotateCcw, Check,
} from 'lucide-vue-next'

// ── Chain-of-thought types ──────────────────────────────────────────────────
type CotStatus = 'complete' | 'active' | 'pending'
interface CotStep { id: string; label: string; description?: string; status: CotStatus }

const { open } = useNoeia()
const route = useRoute()

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

  const persona = isClinical.value ? 'Psychologist AI' : 'SaaS AI'
  cotTitle.value = `${persona} thinking…`
  cotOpen.value  = true
  const base = (isClinical.value ? COT_CLINICAL : COT_SAAS).map(s => ({ ...s, status: 'pending' as CotStatus }))
  cotSteps.value = base

  await nextTick()
  scrollEnd.value?.scrollIntoView({ behavior: 'smooth' })

  const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
  for (let si = 0; si < cotSteps.value.length; si++) {
    cotSteps.value[si].status = 'active'
    await delay(220 + Math.random() * 80)
    cotSteps.value[si].status = 'complete'
    scrollEnd.value?.scrollIntoView({ behavior: 'smooth' })
  }
  await delay(120)

  isTyping.value = false
  cotOpen.value  = false

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
watch(open, v => { if (v) nextTick(() => inputRef.value?.focus()) })
</script>

<template>
  <!-- Outer clip wrapper — animates width to push/pull main content -->
  <div
    class="flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out"
    :style="{ width: open ? '372px' : '0px' }"
  >
    <!-- Padding container so the card floats with 8px gap on all sides -->
    <div class="w-[372px] h-full py-2 pr-2 flex flex-col">
    <!-- Inner card — mirrors left sidebar: floating, rounded, bg-sidebar -->
    <div class="flex-1 min-h-0 flex flex-col bg-sidebar border border-sidebar-border rounded-xl shadow-sm overflow-hidden">

      <!-- ── Header ─────────────────────────────────────────────────────── -->
      <div class="flex items-center gap-2.5 px-3 py-3 border-b border-sidebar-border flex-shrink-0">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-violet-300/30 flex-shrink-0">
          <Sparkles class="w-3.5 h-3.5 text-white" />
        </div>
        <span class="text-sm font-semibold text-sidebar-foreground flex-1">Noeia AI</span>
        <button
          v-if="messages.length > 0"
          title="Clear chat"
          class="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          @click="clearChat"
        >
          <RotateCcw class="w-3.5 h-3.5" />
        </button>
        <button
          class="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          @click="open = false"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- ── Context badge ──────────────────────────────────────────────── -->
      <div class="px-3 py-2 border-b border-sidebar-border/60 flex-shrink-0">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sidebar-accent rounded-lg text-xs text-sidebar-foreground/60 font-medium">
          <span>{{ context.emoji }}</span>
          {{ context.label }}
          <span class="text-sidebar-foreground/40 font-normal">context active</span>
        </span>
      </div>

      <!-- ── Messages area ──────────────────────────────────────────────── -->
      <div class="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">

        <!-- Welcome state -->
        <template v-if="messages.length === 0">
          <div class="flex items-center gap-3 pb-2 pt-1">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-300/30 dark:shadow-violet-900/40 flex-shrink-0">
              <Sparkles class="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-sidebar-foreground">How can I help?</h3>
              <p class="text-xs text-sidebar-foreground/50 mt-0.5">{{ context.label }} context is active.</p>
            </div>
          </div>
          <div class="space-y-1.5">
            <button
              v-for="action in context.actions"
              :key="action"
              class="w-full text-left px-3 py-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/50 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:border-violet-200 dark:hover:border-violet-800 hover:text-violet-700 dark:hover:text-violet-300 transition-all flex items-center justify-between group"
              @click="sendMessage(action)"
            >
              <span>{{ action }}</span>
              <ChevronRight class="w-3.5 h-3.5 text-sidebar-foreground/30 group-hover:text-violet-400 transition-colors shrink-0" />
            </button>
          </div>
        </template>

        <!-- Chat messages -->
        <template v-else>
          <div v-for="msg in messages" :key="msg.id" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">

            <!-- Assistant -->
            <div v-if="msg.role === 'assistant'" class="flex items-start gap-2 max-w-[92%]">
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles class="w-3 h-3 text-white" />
              </div>
              <div class="flex flex-col gap-1.5 flex-1 min-w-0">
                <AiChainOfThought
                  v-if="msg.cot"
                  :steps="msg.cot.steps"
                  :title="msg.cot.title"
                  :open="msg.cotOpen ?? false"
                  @update:open="msg.cotOpen = $event"
                />
                <div class="bg-sidebar-accent border border-sidebar-border rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-sidebar-foreground whitespace-pre-line leading-relaxed">
                  {{ msg.content }}
                </div>
              </div>
            </div>

            <!-- User -->
            <div v-else class="max-w-[80%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm leading-relaxed">
              {{ msg.content }}
            </div>

          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex items-start gap-2">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles class="w-3 h-3 text-white" />
            </div>
            <div class="flex flex-col gap-1.5 flex-1 min-w-0">
              <AiChainOfThought :steps="cotSteps" :title="cotTitle" :open="cotOpen" @update:open="cotOpen = $event" />
              <div class="bg-sidebar-accent border border-sidebar-border rounded-2xl rounded-tl-sm px-4 py-3 self-start">
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay:0ms" />
                  <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay:150ms" />
                  <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay:300ms" />
                </div>
              </div>
            </div>
          </div>

          <div ref="scrollEnd" />
        </template>

      </div>

      <!-- ── Input ──────────────────────────────────────────────────────── -->
      <div class="flex-shrink-0 p-3">
        <div class="rounded-xl border border-sidebar-border bg-sidebar shadow-sm overflow-hidden">
          <div class="flex items-end gap-2 pl-3.5 pr-2 py-2.5">
            <textarea
              ref="inputRef"
              v-model="input"
              placeholder="Ask anything about this view…"
              rows="1"
              class="flex-1 bg-transparent text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 outline-none resize-none leading-snug"
              style="max-height: 96px; overflow-y: auto;"
              @keydown="handleKeydown"
              @input="autoResize"
            />
            <button
              :disabled="!input.trim() || isTyping"
              :class="['flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all', input.trim() && !isTyping ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'text-sidebar-foreground/20 cursor-not-allowed']"
              @click="sendMessage(input)"
            >
              <Send class="w-3.5 h-3.5" />
            </button>
          </div>
          <div class="px-3.5 pb-2.5 flex items-center justify-between">
            <p class="text-[10px] text-sidebar-foreground/30 select-none">Noeia AI · Clinical context</p>
            <kbd class="text-[10px] text-sidebar-foreground/25 font-mono select-none">↵ Send</kbd>
          </div>
        </div>
      </div>

    </div>
    </div>
  </div>
</template>
