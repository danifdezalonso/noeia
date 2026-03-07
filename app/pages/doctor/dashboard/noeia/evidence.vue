<script setup lang="ts">
import { Send, Sparkles, BookOpen, FlaskConical, ChevronRight } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' })

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([])
const input    = ref('')
const isTyping = ref(false)
const scrollEnd = ref<HTMLDivElement>()
const inputRef  = ref<HTMLTextAreaElement>()

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

async function send(text: string) {
  if (!text.trim() || isTyping.value) return
  messages.value.push({ id: crypto.randomUUID(), role: 'user', content: text.trim() })
  input.value = ''
  isTyping.value = true
  await nextTick()
  scrollEnd.value?.scrollIntoView({ behavior: 'smooth' })

  await new Promise(r => setTimeout(r, 900 + Math.random() * 400))

  const responseText = getResponse(text)
  const msg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }
  messages.value.push(msg)
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
  <div class="flex-1 flex flex-col min-h-0 bg-muted/30">

    <!-- Header -->
    <header class="shrink-0 bg-background border-b border-border/50 px-6 py-4">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
          <FlaskConical class="w-4.5 h-4.5 text-white" style="width:18px;height:18px" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-foreground leading-tight">Evidence</h1>
          <p class="text-xs text-muted-foreground">Ask about clinical guidelines, research and evidence-based practice</p>
        </div>
      </div>
    </header>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto min-h-0 px-6 py-6">

      <!-- Empty state -->
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

          <!-- Suggested queries -->
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
</template>
