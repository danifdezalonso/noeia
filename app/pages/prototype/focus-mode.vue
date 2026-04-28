<script setup lang="ts">
definePageMeta({ layout: false })

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useEditor, EditorContent, Mark, mergeAttributes } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import {
  ArrowLeft, Send, PanelRightClose, PanelRightOpen, Sparkles, X
} from 'lucide-vue-next'

// ── Mock data ──────────────────────────────────────────────────────────────

const patient = { name: 'Mia Anderson', totalSessions: 6 }

const sessions = [
  {
    id: 's6', number: 6, date: '28 abr', time: '14:00',
    status: 'scheduled', type: 'follow-up',
    title: null, note: null,
  },
  {
    id: 's5', number: 5, date: 'Hoy', time: '01:54',
    status: 'current', type: 'follow-up',
    title: 'Sleep diary review · CBT-I fase 2', note: null,
  },
  {
    id: 's4', number: 4, date: '23 abr', time: '15:00',
    status: 'past', type: 'follow-up',
    title: 'Adherencia a la restricción de sueño',
    note: 'Revisión semana 1 de restricción de sueño. Adherencia irregular en fines de semana. Reencuadre cognitivo de "sueño perdido". Diario asignado como tarea.',
  },
  {
    id: 's3', number: 3, date: '19 abr', time: '16:00',
    status: 'past', type: 'follow-up',
    title: 'Psicoeducación: impulso de sueño',
    note: 'Explicación de los procesos S y C a Maddy. Encontró el marco útil y formuló buenas preguntas sobre el momento óptimo de la cafeína.',
  },
  {
    id: 's2', number: 2, date: '12 abr', time: '16:00',
    status: 'past', type: 'follow-up',
    title: 'Introducción a la restricción de sueño',
    note: 'Eficiencia basal: 64%. Primera ventana de sueño: 00:30–07:00. Maddy expresó escepticismo sobre madrugar pero aceptó intentarlo una semana.',
  },
  {
    id: 's1', number: 1, date: '30 mar', time: '16:00',
    status: 'past', type: 'intake',
    title: 'Intake',
    note: 'Motivo de consulta: insomnio crónico, ~6 meses. Inicio coincide con cambio laboral.\n\nHistoria de sueño: la madre la despertaba los fines de semana para "resetear el horario". Maddy enmarca su grasa matutina actual como resistencia.\n\nDiagnóstico de trabajo: trastorno de insomnio crónico. Plan: TCC-I, protocolo de 6 sesiones.',
  },
]

const noeInitialMessages = [
  {
    role: 'user' as const,
    text: "¿Cuál fue la eficiencia de sueño de Maddy esta sesión?",
  },
  {
    role: 'noe' as const,
    text: "De la nota de hoy:\n\n- **Eficiencia de sueño: 78%** (objetivo ≥85%)\n- Diario completado la semana entera ✓\n- Hora de despertar en fin de semana aún resistida\n- Nueva ventana de sueño: 00:00–06:30\n\nLa creencia de \"recuperar sueño\" es la palanca cognitiva clave para la próxima sesión.",
  },
]

const noeResponses: Record<string, string> = {
  'temas': `Tres temas recurrentes:\n\n- **Ambivalencia de adherencia** — diario fuerte, fines de semana resistidos\n- **Eficiencia sub-umbral** — 78% vs objetivo 85%\n- **Palanca cognitiva** — creencia de "recuperar sueño" emergió`,
  'preguntas': `Preguntas para la próxima sesión:\n\n1. ¿Qué pasa por tu mente el domingo por la mañana en cama?\n2. ¿De dónde surgió la idea de "recuperar sueño"?\n3. ¿Cómo sería la semana con una hora de despertar consistente?`,
  'sesión 1': `Del intake (30 mar):\n\n> "La madre la despertaba los fines de semana para 'resetear el horario'. Maddy enmarca su grasa matutina actual como resistencia."`,
  'session 1': `Del intake (30 mar):\n\n> "La madre la despertaba los fines de semana para 'resetear el horario'. Maddy enmarca su grasa matutina actual como resistencia."`,
}
const noeFallback = `En la versión real respondería desde todas las notas de sesión. Prueba: "resumen de temas", "preguntas de seguimiento", o "sesión 1".`

// ── Custom Comment Mark ────────────────────────────────────────────────────

const CommentMark = Mark.create({
  name: 'comment',
  addOptions() { return { HTMLAttributes: { class: 'comment-mark' } } },
  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-comment-id'),
        renderHTML: (attrs) => attrs.commentId ? { 'data-comment-id': attrs.commentId } : {},
      },
    }
  },
  parseHTML() { return [{ tag: 'span[data-comment-id]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
})

// ── State ──────────────────────────────────────────────────────────────────

const router = useRouter()

const sidebarOpen  = ref(false)
const sidebarPinned = ref(false)
const peekSession  = ref<typeof sessions[0] | null>(null)

const noeCollapsed  = ref(false)
const noeMessages   = ref([...noeInitialMessages])
const noeInput      = ref('')
const isNoeTyping   = ref(false)
const noeChatEl     = ref<HTMLElement | null>(null)

// ── Editor ─────────────────────────────────────────────────────────────────

const editorHTML = `<h1>Sleep diary review · CBT-I fase 2</h1><p><strong>Foco de sesión:</strong> Fase de restricción de sueño TCC-I.</p><p>Maddy completó el diario la semana completa. La eficiencia de sueño mejoró al 78% (objetivo ≥85%). Sigue resistiendo la hora fija de despertar en fines de semana — exploradas <span data-comment-id="c1" class="comment-mark">creencias subyacentes sobre "recuperar sueño"</span>.</p><p>Introducida ventana de sueño reducida: 00:00–06:30 esta semana.</p>`

const editor = useEditor({
  content: editorHTML,
  extensions: [
    StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
    Highlight.configure({ multicolor: true }),
    Placeholder.configure({ placeholder: 'Empieza a escribir…' }),
    CharacterCount,
    CommentMark,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-invert prose-p:leading-relaxed prose-headings:font-semibold focus:outline-none max-w-none text-[16px] leading-[1.75]',
    },
  },
})

const wordCount = computed(() => editor.value?.storage.characterCount.words() ?? 0)

// ── Computed ───────────────────────────────────────────────────────────────

const isSidebarVisible  = computed(() => sidebarOpen.value || sidebarPinned.value)
const sidebarPanelWidth = computed(() => isSidebarVisible.value ? '260px' : '0px')
const noePanelWidth     = computed(() => noeCollapsed.value ? '48px' : '360px')

// ── Helpers ────────────────────────────────────────────────────────────────

function formatNoeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n- /g, '<br/>• ')
    .replace(/\n/g, '<br/>')
}

// ── Handlers ───────────────────────────────────────────────────────────────

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
  if (!sidebarOpen.value) sidebarPinned.value = false
}

function openPeek(session: typeof sessions[0]) {
  if (session.status === 'current') return
  peekSession.value = session
}

async function sendNoe() {
  const text = noeInput.value.trim()
  if (!text || isNoeTyping.value) return
  noeMessages.value.push({ role: 'user', text })
  noeInput.value = ''
  isNoeTyping.value = true
  await new Promise(r => setTimeout(r, 650 + Math.random() * 550))
  isNoeTyping.value = false
  const lower = text.toLowerCase()
  let response = noeFallback
  for (const [key, val] of Object.entries(noeResponses)) {
    if (lower.includes(key)) { response = val; break }
  }
  noeMessages.value.push({ role: 'noe', text: response })
  await nextTick()
  if (noeChatEl.value) noeChatEl.value.scrollTop = noeChatEl.value.scrollHeight
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (peekSession.value) { peekSession.value = null; return }
    if (sidebarOpen.value && !sidebarPinned.value) { sidebarOpen.value = false; return }
  }
  if (e.metaKey && e.key === '[') { e.preventDefault(); toggleSidebar() }
  if (e.metaKey && e.key === '.') { e.preventDefault() }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  editor.value?.destroy()
})
</script>

<template>
  <div class="fixed inset-0 flex flex-col bg-[#0A0A0A] text-zinc-100 overflow-hidden font-sans antialiased select-none">

    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <header class="h-[52px] shrink-0 border-b border-white/[0.07] flex items-center justify-between px-4 bg-[#0A0A0A] z-10">
      <div class="flex items-center gap-3">
        <button
          class="p-1.5 hover:bg-white/[0.08] rounded-md transition-colors"
          @click="router.back()"
        >
          <ArrowLeft class="w-4 h-4 text-zinc-400" />
        </button>
        <div class="flex items-center gap-2 text-sm">
          <span class="font-medium text-zinc-100">{{ patient.name }}</span>
          <span class="text-zinc-700">·</span>
          <span class="text-zinc-500 text-xs">{{ patient.totalSessions }} sesiones</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span class="text-xs font-mono font-medium text-red-400">12:43</span>
        </div>
        <span class="text-zinc-800">|</span>
        <span class="text-xs text-zinc-500 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500/80 inline-block"></span>
          Guardado
        </span>
        <span class="text-zinc-800">|</span>
        <button class="px-3 py-1.5 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] rounded-md transition-colors">
          Transcribir
        </button>
        <button
          class="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors"
          style="background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.2);color:rgb(252,165,165);"
          @click="router.back()"
        >
          Foco activo
        </button>
      </div>
    </header>

    <!-- ── Body ────────────────────────────────────────────────────────── -->
    <div class="flex-1 flex overflow-hidden min-h-0">

      <!-- ── Left zone: icon rail + session sidebar ─────────────────── -->
      <div class="flex shrink-0">

        <!-- Icon rail (always 48px) -->
        <div class="w-12 flex flex-col items-center pt-4 gap-2 border-r border-white/[0.07] bg-[#0A0A0A]">
          <button
            :class="[
              'p-2.5 rounded-xl transition-all duration-150',
              isSidebarVisible
                ? 'bg-white/[0.1] text-zinc-100 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06]'
            ]"
            title="Sesiones (⌘[)"
            @click="toggleSidebar"
          >
            <!-- Custom sessions glyph: stacked lines + pulse mark -->
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" class="w-[18px] h-[18px]" stroke-linecap="round" stroke-linejoin="round">
              <line x1="2.5" y1="5"   x2="12.5" y2="5"   stroke-width="1.6"/>
              <line x1="2.5" y1="9.5" x2="12.5" y2="9.5" stroke-width="1.6"/>
              <line x1="2.5" y1="14"  x2="8"    y2="14"  stroke-width="1.6"/>
              <!-- ECG/pulse mark at right -->
              <polyline points="9.5,14 10.8,11 12.5,17 14,12.5 15.5,14" stroke-width="1.25" fill="none"/>
            </svg>
          </button>
        </div>

        <!-- Session sidebar (width animates in/out) -->
        <div
          class="overflow-hidden transition-[width] duration-300 ease-in-out border-r border-white/[0.07]"
          :style="{ width: sidebarPanelWidth }"
        >
          <div class="w-[260px] h-full flex flex-col bg-[#0F0F0F]">

            <!-- Sidebar header -->
            <div class="h-[52px] px-4 flex items-center justify-between shrink-0 border-b border-white/[0.06]">
              <span class="text-[11px] font-medium text-zinc-500 tracking-widest uppercase">Sesiones</span>
              <!-- Pin toggle -->
              <button
                :class="[
                  'p-1.5 rounded-md transition-colors text-xs',
                  sidebarPinned ? 'text-amber-400 bg-amber-500/[0.12]' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06]'
                ]"
                :title="sidebarPinned ? 'Desfijar sidebar' : 'Fijar sidebar abierto'"
                @click="sidebarPinned = !sidebarPinned"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5">
                  <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/>
                </svg>
              </button>
            </div>

            <!-- Timeline scroll area -->
            <div class="flex-1 overflow-y-auto py-5 px-3">
              <div class="relative">
                <!-- Vertical spine -->
                <div class="absolute left-[15px] top-5 bottom-5 w-px bg-white/[0.07]"></div>

                <div class="flex flex-col gap-0.5">
                  <button
                    v-for="session in sessions"
                    :key="session.id"
                    :class="[
                      'relative w-full text-left pl-9 pr-3 py-3 rounded-xl group transition-colors',
                      session.status === 'current'
                        ? 'bg-white/[0.06] cursor-default'
                        : session.status === 'past'
                          ? 'hover:bg-white/[0.04] cursor-pointer'
                          : 'cursor-default opacity-50',
                    ]"
                    @click="openPeek(session)"
                  >
                    <!-- Spine dot -->
                    <div class="absolute left-[12px] top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <template v-if="session.status === 'current'">
                        <span class="w-[7px] h-[7px] rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"></span>
                      </template>
                      <template v-else-if="session.status === 'scheduled'">
                        <span class="w-[7px] h-[7px] rounded-full border border-dashed border-zinc-600"></span>
                      </template>
                      <template v-else>
                        <span class="w-[7px] h-[7px] rounded-full bg-zinc-700"></span>
                      </template>
                    </div>

                    <!-- Session info -->
                    <div class="min-w-0">
                      <div class="flex items-center justify-between gap-2 mb-0.5">
                        <span class="text-[11px] font-semibold text-zinc-300">S{{ session.number }}</span>
                        <span class="text-[10px] text-zinc-600 tabular-nums">{{ session.date }}</span>
                      </div>
                      <p class="text-[11px] text-zinc-500 truncate leading-snug">
                        {{ session.title || session.type }}
                      </p>
                      <div class="flex items-center gap-1.5 mt-1.5">
                        <span
                          :class="[
                            'inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide',
                            session.type === 'intake'
                              ? 'bg-violet-500/[0.15] text-violet-400'
                              : 'bg-zinc-800 text-zinc-600'
                          ]"
                        >
                          {{ session.type === 'intake' ? 'Intake' : 'Seguim.' }}
                        </span>
                        <span class="text-[10px] text-zinc-600 tabular-nums">{{ session.time }}</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Center: editor + overlays ───────────────────────────────── -->
      <div class="flex-1 flex flex-col min-w-0 relative select-text">

        <!-- Peek panel overlay (slides in from the right of the center zone) -->
        <Transition name="peek">
          <div v-if="peekSession" class="absolute inset-0 z-20 flex">
            <!-- Backdrop -->
            <div
              class="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
              @click="peekSession = null"
            ></div>

            <!-- Panel -->
            <div class="relative ml-auto w-[540px] h-full bg-[#111111] border-l border-white/[0.08] flex flex-col shadow-2xl">
              <div class="h-[52px] px-5 flex items-center justify-between shrink-0 border-b border-white/[0.06]">
                <div class="min-w-0">
                  <div class="text-[10px] text-zinc-600 mb-0.5">
                    Sesión #{{ peekSession.number }} · {{ peekSession.date }} · {{ peekSession.time }}
                  </div>
                  <h2 class="text-sm font-medium truncate">{{ peekSession.title || peekSession.type }}</h2>
                </div>
                <button
                  class="ml-4 p-1.5 hover:bg-white/[0.08] rounded-md transition-colors shrink-0"
                  title="Cerrar (Esc)"
                  @click="peekSession = null"
                >
                  <X class="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <div class="flex-1 overflow-y-auto px-8 py-8 prose prose-invert prose-sm max-w-none text-zinc-300 prose-p:leading-relaxed">
                <template v-if="peekSession.note">
                  <p v-for="(para, i) in peekSession.note.split('\n\n')" :key="i" class="mb-4">
                    {{ para }}
                  </p>
                </template>
                <p v-else class="text-zinc-600 italic">Sin nota para esta sesión.</p>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Editor toolbar -->
        <div class="shrink-0 px-12 pt-5 pb-3 border-b border-white/[0.04]">
          <div class="mx-auto max-w-[720px]">
            <div class="flex items-center gap-0.5 w-fit bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
              <!-- Heading buttons -->
              <button
                @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
                :class="['px-2 py-1 rounded text-[11px] font-bold transition-colors', editor?.isActive('heading', { level: 1 }) ? 'bg-white/[0.1] text-white' : 'text-zinc-600 hover:text-zinc-200']"
              >H1</button>
              <button
                @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
                :class="['px-2 py-1 rounded text-[11px] font-bold transition-colors', editor?.isActive('heading', { level: 2 }) ? 'bg-white/[0.1] text-white' : 'text-zinc-600 hover:text-zinc-200']"
              >H2</button>

              <div class="w-px h-4 bg-white/[0.08] mx-0.5"></div>

              <!-- Inline marks -->
              <button
                @click="editor?.chain().focus().toggleBold().run()"
                :class="['p-1.5 rounded font-bold transition-colors text-[13px] leading-none', editor?.isActive('bold') ? 'bg-white/[0.1] text-white' : 'text-zinc-600 hover:text-zinc-200']"
              >B</button>
              <button
                @click="editor?.chain().focus().toggleItalic().run()"
                :class="['p-1.5 rounded italic transition-colors text-[13px] leading-none', editor?.isActive('italic') ? 'bg-white/[0.1] text-white' : 'text-zinc-600 hover:text-zinc-200']"
              >I</button>
              <button
                @click="editor?.chain().focus().toggleUnderline().run()"
                :class="['p-1.5 rounded underline transition-colors text-[13px] leading-none', editor?.isActive('underline') ? 'bg-white/[0.1] text-white' : 'text-zinc-600 hover:text-zinc-200']"
              >U</button>
              <button
                @click="editor?.chain().focus().toggleHighlight().run()"
                :class="['p-1.5 rounded transition-colors', editor?.isActive('highlight') ? 'bg-amber-500/[0.2] text-amber-400' : 'text-zinc-600 hover:text-zinc-200']"
                title="Resaltar"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5">
                  <rect x="1.5" y="11" width="13" height="3" rx="1.5" opacity="0.6"/>
                  <path d="M4.5 10.5 L8 2.5 L11.5 10.5 Z"/>
                </svg>
              </button>

              <div class="w-px h-4 bg-white/[0.08] mx-0.5"></div>

              <!-- Lists -->
              <button
                @click="editor?.chain().focus().toggleBulletList().run()"
                :class="['p-1.5 rounded transition-colors', editor?.isActive('bulletList') ? 'bg-white/[0.1] text-white' : 'text-zinc-600 hover:text-zinc-200']"
                title="Lista"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5">
                  <circle cx="2.5" cy="4" r="1.3"/>
                  <circle cx="2.5" cy="8" r="1.3"/>
                  <circle cx="2.5" cy="12" r="1.3"/>
                  <rect x="5.5" y="3" width="9" height="2" rx="1"/>
                  <rect x="5.5" y="7" width="9" height="2" rx="1"/>
                  <rect x="5.5" y="11" width="7" height="2" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Editor scroll area -->
        <div class="flex-1 overflow-y-auto min-h-0">
          <div class="mx-auto max-w-[980px] px-10 pt-8 pb-40 flex gap-8">
            <!-- Editor column -->
            <div class="flex-1 min-w-0">
              <EditorContent v-if="editor" :editor="editor" />
            </div>
            <!-- Comment thread (right margin) -->
            <div class="w-[220px] shrink-0 pt-[108px]">
              <div class="bg-[#181818] border border-white/[0.08] rounded-xl shadow-lg p-3.5 text-xs sticky top-4">
                <!-- Thread header -->
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-6 h-6 rounded-full bg-violet-700/40 flex items-center justify-center text-[9px] font-bold text-violet-300 shrink-0">
                    MG
                  </div>
                  <div class="min-w-0">
                    <div class="text-[11px] font-medium text-zinc-200 leading-none">Maria García</div>
                    <div class="text-[9px] text-zinc-600 mt-0.5">hace 2 h</div>
                  </div>
                </div>
                <!-- Anchor quote -->
                <div class="border-l-2 border-amber-500/40 pl-2 mb-2.5">
                  <span class="text-[10px] text-zinc-500 italic leading-relaxed">
                    "creencias subyacentes sobre «recuperar sueño»"
                  </span>
                </div>
                <!-- Comment body -->
                <p class="text-[11px] text-zinc-300 leading-relaxed mb-3">
                  Esta creencia puede estar conectada con las notas del intake sobre los patrones parentales. ¿Revisamos la sesión #1?
                </p>
                <!-- Reply input -->
                <div class="border-t border-white/[0.06] pt-2.5">
                  <input
                    type="text"
                    placeholder="Responder a Maria…"
                    class="w-full bg-transparent text-zinc-400 placeholder:text-zinc-700 text-[11px] focus:outline-none focus:text-zinc-200 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: stats + shortcuts -->
        <div class="shrink-0 border-t border-white/[0.05] px-12 py-3 flex items-center justify-between">
          <span class="text-[11px] text-zinc-700">{{ wordCount }} palabras</span>
          <div class="flex items-center gap-4 text-[10px] text-zinc-700 font-mono">
            <span><kbd class="not-italic">⌘.</kbd>&nbsp;foco</span>
            <span><kbd class="not-italic">⌘[</kbd>&nbsp;sesiones</span>
            <span><kbd class="not-italic">Esc</kbd>&nbsp;cerrar</span>
          </div>
        </div>
      </div>

      <!-- ── Right: Noe sidebar ────────────────────────────────────────── -->
      <div
        class="shrink-0 border-l border-white/[0.07] bg-[#0D0D0D] overflow-hidden transition-[width] duration-300 ease-in-out"
        :style="{ width: noePanelWidth }"
      >
        <!-- Fixed-width inner container so content doesn't reflow during transition -->
        <div class="w-[360px] h-full flex flex-col">

          <!-- Noe header -->
          <div class="h-[52px] flex items-center shrink-0 border-b border-white/[0.06] px-3">
            <div v-if="!noeCollapsed" class="flex items-center gap-2 ml-1 mr-auto">
              <Sparkles class="w-4 h-4 text-amber-500 shrink-0" />
              <span class="text-sm font-medium">Noe</span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            </div>
            <button
              :class="['p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors', noeCollapsed ? 'mx-auto' : 'ml-auto']"
              @click="noeCollapsed = !noeCollapsed"
              :title="noeCollapsed ? 'Expandir Noe' : 'Colapsar Noe'"
            >
              <PanelRightClose v-if="!noeCollapsed" class="w-4 h-4" />
              <PanelRightOpen  v-else              class="w-4 h-4" />
            </button>
          </div>

          <!-- Chat messages -->
          <div ref="noeChatEl" class="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
            <div
              v-for="(msg, i) in noeMessages"
              :key="i"
              :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
            >
              <div
                :class="[
                  'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-white/[0.08] text-zinc-100 rounded-tr-sm'
                    : 'text-zinc-200 rounded-tl-sm'
                ]"
              >
                <div v-if="msg.role === 'noe'" v-html="formatNoeText(msg.text)"></div>
                <span v-else>{{ msg.text }}</span>
              </div>
            </div>

            <!-- Typing dots -->
            <div v-if="isNoeTyping" class="flex items-center gap-1.5 px-2 py-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style="animation-delay:0ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style="animation-delay:150ms"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style="animation-delay:300ms"></span>
            </div>
          </div>

          <!-- Suggested prompts (only when fresh) -->
          <div v-if="noeMessages.length === 0" class="px-4 pb-3 flex flex-col gap-1.5">
            <button
              v-for="p in ['Resumen de temas', 'Preguntas de seguimiento', 'Sesión 1']"
              :key="p"
              class="text-[11px] text-left text-zinc-500 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-lg px-3 py-2 transition-colors"
              @click="noeInput = p; sendNoe()"
            >
              {{ p }}
            </button>
          </div>

          <!-- Input -->
          <div class="shrink-0 p-3 border-t border-white/[0.06]">
            <div class="flex items-end gap-2 bg-white/[0.05] border border-white/[0.07] rounded-xl px-3 py-2 focus-within:border-white/[0.18] transition-colors">
              <textarea
                v-model="noeInput"
                rows="1"
                placeholder="Pregunta a Noe…"
                class="flex-1 bg-transparent text-[13px] text-white placeholder:text-zinc-700 resize-none max-h-28 focus:outline-none py-0.5"
                @keydown.enter.exact.prevent="sendNoe"
              ></textarea>
              <button
                @click="sendNoe"
                :disabled="!noeInput.trim() || isNoeTyping"
                class="p-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-colors shrink-0 mb-0.5"
              >
                <Send class="w-3.5 h-3.5" />
              </button>
            </div>
            <p class="text-[10px] text-center text-zinc-700 mt-2">Noe puede cometer errores. Verifica lo importante.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Tiptap placeholder */
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #3f3f46;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Comment mark highlight */
:deep(.comment-mark) {
  background-color: rgba(245, 158, 11, 0.12);
  border-bottom: 1.5px solid rgba(245, 158, 11, 0.45);
  border-radius: 2px;
  padding-bottom: 1px;
  cursor: pointer;
  transition: background-color 0.15s;
}
:deep(.comment-mark:hover) {
  background-color: rgba(245, 158, 11, 0.22);
}

/* Prose heading sizing in the editor */
:deep(.ProseMirror h1) {
  font-size: 1.6rem;
  line-height: 1.25;
  margin-bottom: 0.5rem;
  color: #f4f4f5;
}
:deep(.ProseMirror h2) {
  font-size: 1.2rem;
  line-height: 1.3;
  margin-bottom: 0.4rem;
  color: #e4e4e7;
}
:deep(.ProseMirror p) {
  color: #a1a1aa;
  margin-bottom: 0.75rem;
}
:deep(.ProseMirror strong) {
  color: #e4e4e7;
}

/* Peek transition */
.peek-enter-active { transition: opacity 0.2s ease; }
.peek-leave-active { transition: opacity 0.18s ease; }
.peek-enter-from, .peek-leave-to { opacity: 0; }
</style>
