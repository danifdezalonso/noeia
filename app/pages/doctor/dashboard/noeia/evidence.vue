<script setup lang="ts">
import { Send, Sparkles, BookOpen, FlaskConical, ChevronRight, Plus, Trash2, MessageSquare } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' })

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

// ─── Seeded conversation history ────────────────────────────────
const now = Date.now()
const DAY = 86_400_000

const seedConvs: Conversation[] = [
  {
    id: 'seed-1',
    title: 'CBT effectiveness for generalised anxiety disorder',
    createdAt: new Date(now - 1.5 * DAY),
    messages: [
      { id: 's1a', role: 'user', content: 'What is the evidence base for CBT in treating generalised anxiety?' },
      { id: 's1b', role: 'assistant', content: '**CBT for Generalised Anxiety Disorder (GAD)**\n\nCognitive Behavioural Therapy is considered a first-line psychological treatment for GAD, with strong Grade A evidence:\n\n• **Meta-analyses** (Cuijpers et al., 2014; Hofmann et al., 2012) show effect sizes of d = 0.80–1.00 versus waitlist controls\n• **NICE Guidelines (CG113)** recommend high-intensity CBT as primary treatment\n• **Remission rates** of 50–60% at end of treatment; gains maintained at 12-month follow-up\n\nKey limitations to note: most RCTs exclude comorbid conditions common in real-world practice.' },
    ],
  },
  {
    id: 'seed-2',
    title: 'EMDR vs TF-CBT for PTSD — key RCT findings',
    createdAt: new Date(now - 2.2 * DAY),
    messages: [
      { id: 's2a', role: 'user', content: 'Latest RCTs on EMDR for PTSD — key findings?' },
      { id: 's2b', role: 'assistant', content: '**EMDR for PTSD — Key Research Findings**\n\nEye Movement Desensitisation and Reprocessing has strong empirical support for PTSD:\n\n• **WHO Guidelines (2013)** recommend EMDR alongside trauma-focused CBT as first-line treatment\n• **Effect sizes**: d = 1.01–1.40 vs waitlist in recent meta-analyses (Chen et al., 2015)\n• **Comparison to TF-CBT**: broadly equivalent outcomes; EMDR often requires fewer sessions\n\nOngoing debate remains about the specific role of bilateral stimulation vs exposure component alone.' },
    ],
  },
  {
    id: 'seed-3',
    title: 'Medication vs psychotherapy in OCD treatment',
    createdAt: new Date(now - 5 * DAY),
    messages: [
      { id: 's3a', role: 'user', content: 'What does the research say about medication vs therapy for OCD?' },
      { id: 's3b', role: 'assistant', content: '**Medication vs Therapy for OCD**\n\nBoth ERP and SSRIs are first-line — combination is often superior:\n\n• **ERP**: Effect size d = 1.39 vs waitlist (Öst et al., 2015); 60–70% response rate\n• **SSRIs**: d ≈ 0.50 vs placebo; slower onset, requires higher doses than for depression\n• **Combined ERP + SSRI**: superior for severe OCD\n• **NICE Guidelines (CG31)**: ERP first for mild-moderate; combined for severe cases' },
    ],
  },
  {
    id: 'seed-4',
    title: 'MBCT for recurrent depression relapse prevention',
    createdAt: new Date(now - 6.5 * DAY),
    messages: [
      { id: 's4a', role: 'user', content: 'Evidence for mindfulness-based interventions in depression' },
      { id: 's4b', role: 'assistant', content: '**Mindfulness-Based Interventions for Depression**\n\nMBCT has the strongest evidence base:\n\n• **NICE-recommended** for recurrent depression (≥3 episodes): reduces relapse by ~40–50%\n• **Meta-analysis** (Kuyken et al., 2016, n=1,258): MBCT significantly reduced depressive symptom severity\n• **Comparison to antidepressants**: equivalent relapse prevention in high-risk groups\n\nLimitation: evidence weaker for first-episode or currently acute depression.' },
    ],
  },
  {
    id: 'seed-5',
    title: 'DBT vs standard CBT for borderline PD',
    createdAt: new Date(now - 14 * DAY),
    messages: [
      { id: 's5a', role: 'user', content: 'Compare DBT and CBT effectiveness for borderline personality disorder' },
      { id: 's5b', role: 'assistant', content: '**DBT vs CBT for BPD**\n\nDialectical Behaviour Therapy remains the gold-standard for BPD:\n\n• **DBT superiority**: Outperforms standard CBT on suicide attempts, self-harm, and dropout rates (Linehan et al., 2006)\n• **Effect sizes**: d = 0.50–0.80 for self-harm reduction at 12 months\n• **Core components**: individual therapy, skills training group, phone coaching, therapist consultation team\n\nRecommendation: DBT for core BPD; adjunctive CBT techniques for comorbid presentations.' },
    ],
  },
]

const conversations = ref<Conversation[]>(seedConvs)
const currentConvId = ref<string>('')

const currentConv = computed(() => conversations.value.find(c => c.id === currentConvId.value) ?? null)
const messages = computed(() => currentConv.value?.messages ?? [])

// ─── Chat state ──────────────────────────────────────────────────
const input    = ref('')
const isTyping = ref(false)
const scrollEnd = ref<HTMLDivElement>()
const inputRef  = ref<HTMLTextAreaElement>()
const hoveredConvId = ref<string | null>(null)

const SUGGESTIONS = [
  'What is the evidence base for CBT in treating generalised anxiety?',
  'Latest RCTs on EMDR for PTSD — key findings?',
  'Compare DBT and CBT effectiveness for borderline personality disorder',
  'Evidence for mindfulness-based interventions in depression',
  'What does the research say about medication vs therapy for OCD?',
]

const RESPONSES: { kw: string[]; text: string }[] = [
  {
    kw: ['cbt', 'anxiety', 'generalised'],
    text: '**CBT for Generalised Anxiety Disorder (GAD)**\n\nCognitive Behavioural Therapy is considered a first-line psychological treatment for GAD, with strong Grade A evidence:\n\n• **Meta-analyses** (Cuijpers et al., 2014; Hofmann et al., 2012) show effect sizes of d = 0.80–1.00 versus waitlist controls\n• **NICE Guidelines (CG113)** recommend high-intensity CBT as primary treatment\n• **Remission rates** of 50–60% at end of treatment; gains maintained at 12-month follow-up\n• Core components: cognitive restructuring, worry exposure, relaxation training, behavioural experiments\n\nKey limitations to note: most RCTs exclude comorbid conditions common in real-world practice.',
  },
  {
    kw: ['emdr', 'ptsd'],
    text: '**EMDR for PTSD — Key Research Findings**\n\nEye Movement Desensitisation and Reprocessing has strong empirical support for PTSD:\n\n• **WHO Guidelines (2013)** recommend EMDR alongside trauma-focused CBT as first-line treatment\n• **Effect sizes**: d = 1.01–1.40 vs waitlist in recent meta-analyses (Chen et al., 2015)\n• **Comparison to TF-CBT**: broadly equivalent outcomes; EMDR often requires fewer sessions\n• **Recent RCTs** (Shapiro, 2018; van den Berg et al., 2020) confirm efficacy across trauma types\n\nOngoing debate remains about the specific role of bilateral stimulation (eye movements) vs exposure component alone.',
  },
  {
    kw: ['dbt', 'borderline', 'bpd'],
    text: '**DBT vs CBT for BPD**\n\nDialectical Behaviour Therapy (Linehan, 1993) remains the gold-standard for BPD:\n\n• **DBT superiority**: Outperforms standard CBT on suicide attempts, self-harm, and dropout rates (Linehan et al., 2006)\n• **Effect sizes**: d = 0.50–0.80 for self-harm reduction at 12 months\n• **Core components**: individual therapy, skills training group, phone coaching, therapist consultation team\n• **Standard CBT**: effective for comorbid depression/anxiety but limited evidence for core BPD features\n\nRecommendation: DBT for core BPD; adjunctive CBT techniques for comorbid presentations.',
  },
  {
    kw: ['mindfulness', 'depression', 'mbct'],
    text: '**Mindfulness-Based Interventions for Depression**\n\nMBCT (Mindfulness-Based Cognitive Therapy) has the strongest evidence base:\n\n• **NICE-recommended** for recurrent depression (≥3 episodes): reduces relapse by ~40–50%\n• **Meta-analysis** (Kuyken et al., 2016, n=1,258): MBCT significantly reduced depressive symptom severity\n• **Comparison to antidepressants**: equivalent relapse prevention in high-risk groups\n• **MBSR** (Mindfulness-Based Stress Reduction): effective for subclinical depression and comorbid anxiety\n\nLimitation: evidence weaker for first-episode or currently acute depression.',
  },
  {
    kw: ['ocd', 'medication', 'therapy', 'erp'],
    text: '**Medication vs Therapy for OCD**\n\nBoth ERP (Exposure and Response Prevention) and SSRIs are first-line — combination is often superior:\n\n• **ERP**: Effect size d = 1.39 vs waitlist (Öst et al., 2015 meta-analysis); 60–70% response rate\n• **SSRIs** (fluoxetine, sertraline, fluvoxamine): d ≈ 0.50 vs placebo; slower onset, requires higher doses than depression treatment\n• **Combined ERP + SSRI**: superior for severe OCD; SSRIs can lower anxiety threshold to facilitate exposure\n• **NICE Guidelines (CG31)**: recommend ERP first for mild-moderate OCD; combined for severe cases\n\nKey point: ERP produces more durable gains; relapse more common on medication discontinuation alone.',
  },
]

function getResponse(msg: string): string {
  const lower = msg.toLowerCase()
  return RESPONSES.find(r => r.kw.some(kw => lower.includes(kw)))?.text
    ?? "I've reviewed your query against current clinical literature. For a precise evidence summary, please include specific disorder names, intervention types, or population criteria. You can also ask about effect sizes, specific guidelines (NICE, APA, WHO), or comparison between modalities."
}

function formatText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/\n•/g, '<br>•')
    .replace(/\n/g, '<br>')
}

// ─── Conversation management ─────────────────────────────────────
function newChat() {
  currentConvId.value = ''
  input.value = ''
  nextTick(() => inputRef.value?.focus())
}

function openConv(id: string) {
  currentConvId.value = id
  nextTick(() => scrollEnd.value?.scrollIntoView({ behavior: 'instant' }))
}

function deleteConv(id: string) {
  const idx = conversations.value.findIndex(c => c.id === id)
  if (idx !== -1) conversations.value.splice(idx, 1)
  if (currentConvId.value === id) currentConvId.value = ''
}

// Group conversations by recency
const grouped = computed(() => {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const yesterdayStart = new Date(todayStart.getTime() - DAY)
  const weekStart = new Date(todayStart.getTime() - 7 * DAY)

  const today: Conversation[] = []
  const yesterday: Conversation[] = []
  const lastWeek: Conversation[] = []
  const older: Conversation[] = []

  for (const c of conversations.value) {
    if (c.createdAt >= todayStart) today.push(c)
    else if (c.createdAt >= yesterdayStart) yesterday.push(c)
    else if (c.createdAt >= weekStart) lastWeek.push(c)
    else older.push(c)
  }
  return [
    { label: 'Today', items: today },
    { label: 'Yesterday', items: yesterday },
    { label: 'Last 7 days', items: lastWeek },
    { label: 'Older', items: older },
  ].filter(g => g.items.length > 0)
})

// ─── Send ────────────────────────────────────────────────────────
async function send(text: string) {
  if (!text.trim() || isTyping.value) return

  // Create a new conversation if none active
  if (!currentConv.value) {
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title: text.trim().slice(0, 72),
      messages: [],
      createdAt: new Date(),
    }
    conversations.value.unshift(conv)
    currentConvId.value = conv.id
    await nextTick()
  }

  const conv = currentConv.value!
  if (conv.title === 'New chat' && conv.messages.length === 0) {
    conv.title = text.trim().slice(0, 72)
  }

  conv.messages.push({ id: crypto.randomUUID(), role: 'user', content: text.trim() })
  input.value = ''
  isTyping.value = true
  await nextTick()
  scrollEnd.value?.scrollIntoView({ behavior: 'smooth' })

  await new Promise(r => setTimeout(r, 900 + Math.random() * 400))

  const responseText = getResponse(text)
  const msg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }
  conv.messages.push(msg)
  isTyping.value = false

  let i = 0
  const tick = setInterval(() => {
    if (i < responseText.length) {
      msg.content += responseText.slice(i, i + 6)
      i += 6
      scrollEnd.value?.scrollIntoView({ behavior: 'smooth' })
    } else {
      clearInterval(tick)
    }
  }, 14)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value) }
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

onMounted(() => nextTick(() => inputRef.value?.focus()))
</script>

<template>
  <div class="flex-1 flex min-h-0">

    <!-- ── Sidebar ── -->
    <aside class="w-60 shrink-0 flex flex-col border-r border-border bg-sidebar">

      <!-- Sidebar header -->
      <div class="shrink-0 px-3 py-3 border-b border-border/60">
        <button
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors group"
          @click="newChat"
        >
          <div class="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
            <Plus class="w-3.5 h-3.5 text-white" />
          </div>
          <span class="flex-1 text-left">New chat</span>
        </button>
      </div>

      <!-- Conversation list -->
      <div class="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        <div v-for="group in grouped" :key="group.label">
          <p class="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
            {{ group.label }}
          </p>
          <div class="space-y-0.5">
            <div
              v-for="conv in group.items"
              :key="conv.id"
              class="group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors"
              :class="currentConvId === conv.id
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground/80 hover:bg-accent/60 hover:text-foreground'"
              @mouseenter="hoveredConvId = conv.id"
              @mouseleave="hoveredConvId = null"
              @click="openConv(conv.id)"
            >
              <MessageSquare class="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              <span class="flex-1 text-xs leading-snug truncate min-w-0">{{ conv.title }}</span>

              <!-- Delete button -->
              <button
                v-if="hoveredConvId === conv.id || currentConvId === conv.id"
                class="shrink-0 w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                @click.stop="deleteConv(conv.id)"
                aria-label="Delete conversation"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty sidebar state -->
        <div v-if="conversations.length === 0" class="px-2 py-6 text-center">
          <p class="text-xs text-muted-foreground/50">No conversations yet</p>
        </div>
      </div>

      <!-- Sidebar footer -->
      <div class="shrink-0 px-3 py-3 border-t border-border/60">
        <p class="text-[10px] text-muted-foreground/40 text-center select-none">Evidence · Clinical Literature</p>
      </div>
    </aside>

    <!-- ── Main chat area ── -->
    <div class="flex-1 flex flex-col min-h-0 bg-muted/30">

      <!-- Header -->
      <header class="shrink-0 bg-background border-b border-border/50 px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <FlaskConical class="text-white" style="width:18px;height:18px" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-foreground leading-tight">
              {{ currentConv ? currentConv.title : 'Evidence' }}
            </h1>
            <p class="text-xs text-muted-foreground">Ask about clinical guidelines, research and evidence-based practice</p>
          </div>
        </div>
      </header>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto min-h-0 px-6 py-6">

        <!-- Empty state (new chat) -->
        <template v-if="messages.length === 0">
          <div class="max-w-2xl mx-auto">
            <div class="flex flex-col items-center text-center mb-10 pt-6">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md mb-4">
                <FlaskConical class="text-white" style="width:26px;height:26px" />
              </div>
              <h2 class="text-xl font-bold text-foreground mb-2">Evidence Research</h2>
              <p class="text-sm text-muted-foreground max-w-md">
                Ask about clinical evidence, research findings, treatment guidelines, and evidence-based practices across mental health disciplines.
              </p>
            </div>

            <div class="space-y-2">
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Suggested queries</p>
              <button
                v-for="s in SUGGESTIONS"
                :key="s"
                class="w-full flex items-center justify-between gap-3 px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-all group"
                @click="send(s)"
              >
                <div class="flex items-center gap-3">
                  <BookOpen class="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500 shrink-0 transition-colors" />
                  <span>{{ s }}</span>
                </div>
                <ChevronRight class="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-emerald-400 shrink-0 transition-colors" />
              </button>
            </div>
          </div>
        </template>

        <!-- Chat messages -->
        <template v-else>
          <div class="max-w-2xl mx-auto space-y-5">
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
            >
              <!-- Assistant -->
              <div v-if="msg.role === 'assistant'" class="flex items-start gap-3 max-w-[90%]">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <FlaskConical class="text-white" style="width:14px;height:14px" />
                </div>
                <div class="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-foreground shadow-sm leading-relaxed">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <p v-html="'<p>' + formatText(msg.content) + '</p>'" />
                </div>
              </div>

              <!-- User -->
              <div v-else class="max-w-[75%] bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                {{ msg.content }}
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isTyping" class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                <FlaskConical class="text-white" style="width:14px;height:14px" />
              </div>
              <div class="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style="animation-delay:0ms" />
                  <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style="animation-delay:150ms" />
                  <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style="animation-delay:300ms" />
                </div>
              </div>
            </div>

            <div ref="scrollEnd" />
          </div>
        </template>
      </div>

      <!-- Input -->
      <div class="shrink-0 bg-background border-t border-border px-6 py-4">
        <div class="max-w-2xl mx-auto">
          <div class="flex items-end gap-3 bg-muted/50 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-400/50 transition-all">
            <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mb-0.5">
              <FlaskConical class="text-white" style="width:13px;height:13px" />
            </div>
            <textarea
              ref="inputRef"
              v-model="input"
              placeholder="Ask about clinical evidence, research or guidelines…"
              rows="1"
              class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-snug"
              style="max-height:120px;overflow-y:auto"
              @keydown="handleKeydown"
              @input="autoResize"
            />
            <button
              :disabled="!input.trim() || isTyping"
              :class="['shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all', input.trim() && !isTyping ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-muted text-muted-foreground cursor-not-allowed']"
              @click="send(input)"
            >
              <Send class="w-3.5 h-3.5" />
            </button>
          </div>
          <p class="text-[10px] text-muted-foreground/40 text-center mt-2 select-none">Responses are based on published clinical literature · Always apply clinical judgement</p>
        </div>
      </div>

    </div>
  </div>
</template>
