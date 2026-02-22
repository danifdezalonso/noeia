<script setup lang="ts">
import { Sparkles, X, Send, ChevronRight, RotateCcw, Maximize2, Check } from 'lucide-vue-next'
import { SHELL_KEY } from '~/composables/useDashboard'

const { open } = useNoeia()
const route    = useRoute()
const shell    = inject(SHELL_KEY)!

// ── Mode ───────────────────────────────────────────────────────────────────
const mode = ref<'ai' | 'quickstart'>('ai')

function toggleMode(m: 'ai' | 'quickstart') {
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
    shell.sidebarOpen.value = false
  }
})

// ── AI chat types & state ──────────────────────────────────────────────────
interface Message { id: string; role: 'user' | 'assistant'; content: string }

const messages  = ref<Message[]>([])
const input     = ref('')
const isTyping  = ref(false)
const inputRef  = ref<HTMLTextAreaElement>()
const scrollEnd = ref<HTMLDivElement>()

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
  await nextTick()
  scrollEnd.value?.scrollIntoView({ behavior: 'smooth' })
  await new Promise(r => setTimeout(r, 500 + Math.random() * 400))
  isTyping.value = false
  const responseText = getResponse(text)
  const msg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }
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
</script>

<template>
  <div class="flex flex-shrink-0 h-full">

    <!-- ── Drawer panel ──────────────────────────────────────────────────── -->
    <div
      class="noeia-panel overflow-hidden border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-[width] duration-300 ease-in-out"
      :style="{ width: open ? '420px' : '0px' }"
    >
      <div class="w-[420px] h-full flex flex-col">

        <!-- ══ NOEIA AI PANEL ══════════════════════════════════════════════ -->
        <template v-if="mode === 'ai'">

          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-violet-300/40">
                <Sparkles class="w-4 h-4 text-white" />
              </div>
              <span class="text-sm font-bold text-slate-800 dark:text-slate-100">Noeia AI</span>
            </div>
            <div class="flex items-center gap-0.5">
              <button v-if="messages.length > 0" title="Clear chat" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" @click="clearChat">
                <RotateCcw class="w-3.5 h-3.5" />
              </button>
              <button class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" @click="open = false">
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Context badge -->
          <div class="px-4 py-2.5 border-b border-slate-50 dark:border-slate-800/60 flex-shrink-0">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>{{ context.emoji }}</span>
              {{ context.label }}
              <span class="text-slate-300 dark:text-slate-600 font-normal">context active</span>
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
                  <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">How can I help?</h3>
                  <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ context.label }} context is active.</p>
                </div>
              </div>

              <!-- Quick action chips -->
              <div class="space-y-1.5">
                <button
                  v-for="action in context.actions"
                  :key="action"
                  class="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:border-violet-200 dark:hover:border-violet-800 hover:text-violet-800 dark:hover:text-violet-300 transition-all flex items-center justify-between group"
                  @click="sendMessage(action)"
                >
                  <span>{{ action }}</span>
                  <ChevronRight class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-violet-400 transition-colors shrink-0" />
                </button>
              </div>
            </template>

            <!-- Chat messages -->
            <template v-else>
              <div v-for="msg in messages" :key="msg.id" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
                <div v-if="msg.role === 'assistant'" class="flex items-start gap-2 max-w-[90%]">
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles class="w-3 h-3 text-white" />
                  </div>
                  <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 shadow-sm whitespace-pre-line leading-relaxed">
                    {{ msg.content }}
                  </div>
                </div>
                <div v-else class="max-w-[80%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm leading-relaxed">
                  {{ msg.content }}
                </div>
              </div>

              <!-- Typing indicator -->
              <div v-if="isTyping" class="flex items-start gap-2">
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <Sparkles class="w-3 h-3 text-white" />
                </div>
                <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay:0ms"   />
                    <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay:150ms" />
                    <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay:300ms" />
                  </div>
                </div>
              </div>
              <div ref="scrollEnd" />
            </template>

          </div>

          <!-- Input -->
          <div class="flex-shrink-0 border-t border-slate-100 dark:border-slate-800 p-3">
            <div class="flex items-end gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 pl-3.5 pr-2 py-2">
              <textarea
                ref="inputRef"
                v-model="input"
                placeholder="Ask anything about this view…"
                rows="1"
                class="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none leading-snug"
                style="max-height: 96px; overflow-y: auto;"
                @keydown="handleKeydown"
                @input="autoResize"
              />
              <button
                :disabled="!input.trim() || isTyping"
                :class="['flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all', input.trim() && !isTyping ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed']"
                @click="sendMessage(input)"
              >
                <Send class="w-3.5 h-3.5" />
              </button>
            </div>
            <p class="text-[10px] text-slate-300 dark:text-slate-600 text-center mt-1.5 select-none">Noeia AI · Clinical context mode</p>
          </div>

        </template>

        <!-- ══ QUICK START PANEL ═══════════════════════════════════════════ -->
        <template v-else>

          <!-- Header -->
          <div class="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <div class="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center flex-shrink-0">
              <span class="text-violet-700 dark:text-violet-300 text-xs font-bold leading-none">{{ pendingCount }}</span>
            </div>
            <span class="text-sm font-bold text-slate-800 dark:text-slate-100 flex-1">Quick start</span>
            <button class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Maximize2 class="w-3.5 h-3.5" />
            </button>
            <button class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" @click="open = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto min-h-0">

            <!-- Hero section -->
            <div class="px-5 pt-5 pb-6 bg-white dark:bg-slate-900">
              <div class="flex items-start justify-between gap-4 mb-6">
                <div class="flex-1">
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Quick start</h2>
                  <p class="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
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
                <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">Progress</span>
                <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">{{ progress }}%</span>
              </div>
              <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full bg-violet-500 transition-all duration-500"
                  :style="{ width: `${progress}%` }"
                />
              </div>
            </div>

            <!-- Divider -->
            <div class="h-px bg-slate-100 dark:bg-slate-800" />

            <!-- Checklist -->
            <div class="px-5 pt-5 pb-6 bg-slate-50/60 dark:bg-slate-900/80">
              <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Onboarding checklist</p>

              <div class="space-y-2">
                <button
                  v-for="item in checklist"
                  :key="item.id"
                  :class="[
                    'w-full flex items-center gap-3 text-left transition-all group',
                    item.done
                      ? 'px-0 py-1.5'
                      : 'px-4 py-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 shadow-sm',
                  ]"
                  @click="toggleItem(item.id)"
                >
                  <!-- Check circle -->
                  <div
                    :class="[
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      item.done
                        ? 'bg-green-500 border-green-500'
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-violet-400',
                    ]"
                  >
                    <Check v-if="item.done" class="w-3.5 h-3.5 text-white" />
                  </div>

                  <!-- Label -->
                  <span
                    :class="[
                      'text-sm transition-colors',
                      item.done
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'font-medium text-slate-700 dark:text-slate-200',
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
    <div class="w-12 flex-shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center select-none">

      <!-- NoeIA AI section -->
      <div
        :class="[
          'w-full flex flex-col items-center pt-3 pb-3 gap-2 cursor-pointer transition-colors',
          open && mode === 'ai' ? 'bg-violet-50 dark:bg-violet-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60',
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
          <span :class="['text-[10px] font-bold tracking-widest uppercase transition-colors', open && mode === 'ai' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500']">
            Noeia AI
          </span>
        </div>
      </div>

      <!-- Separator -->
      <div class="w-7 h-px bg-slate-100 dark:bg-slate-800 flex-shrink-0" />

      <!-- Quick Start section -->
      <div
        :class="[
          'w-full flex-1 flex flex-col items-center pt-3 pb-3 gap-2 cursor-pointer transition-colors',
          open && mode === 'quickstart' ? 'bg-violet-50 dark:bg-violet-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60',
        ]"
        @click="toggleMode('quickstart')"
      >
        <!-- Pending count badge — bordered box matching the screenshot -->
        <div
          :class="[
            'w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0',
            open && mode === 'quickstart'
              ? 'border-indigo-400 bg-violet-50 dark:bg-violet-950/60'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
          ]"
        >
          <span :class="['text-sm font-bold leading-none transition-colors', open && mode === 'quickstart' ? 'text-violet-600 dark:text-violet-300' : 'text-slate-500 dark:text-slate-400']">
            {{ pendingCount }}
          </span>
        </div>

        <div style="writing-mode: vertical-lr; text-orientation: mixed; transform: rotate(180deg)">
          <span :class="['text-[10px] font-semibold tracking-widest uppercase transition-colors', open && mode === 'quickstart' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500']">
            Quick start
          </span>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
/* Mobile: drawer overlays instead of pushing content */
@media (max-width: 767px) {
  .noeia-panel {
    position: fixed !important;
    right: 48px;
    top: 56px;
    bottom: 0;
    z-index: 40;
  }
}
</style>
