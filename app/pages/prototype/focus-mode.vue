<script setup lang="ts">
definePageMeta({ layout: false })

import { ref, onMounted, onUnmounted, computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import {
  useEditor,
  EditorContent,
  Extension,
  Mark,
  mergeAttributes
} from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {
  MessageSquare,
  CalendarDays,
  X,
  ArrowLeft,
  Send,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Link as LinkIcon,
  Heading1,
  Heading2,
  List,
  CheckSquare,
  Minus,
  MessageSquarePlus,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Search,
  Maximize2
} from 'lucide-vue-next'

// --- Mock Data ---
const patient = {
  id: 'p_mia_anderson',
  name: 'Mia Anderson',
  totalSessions: 6,
}

const sessions = [
  {
    id: 's6',
    number: 6,
    dateLabel: '28 abr',
    time: '14:00',
    status: 'scheduled',
    type: 'follow-up',
    note: null,
  },
  {
    id: 's5',
    number: 5,
    dateLabel: 'today',
    time: '01:54',
    status: 'current',
    type: 'follow-up',
    title: 'Sleep diary review · CBT-I phase 2',
    note: `# Sleep diary review · CBT-I phase 2

**Session focus:** CBT-I sleep restriction phase.

Maddy completed the diary for the full week. Sleep efficiency improved to 78% (target ≥85%). She is still resisting the strict wake time on weekends — explored underlying beliefs about "catching up".

Introduced sleep window narrowing: 00:00–06:30 this week.`,
  },
  {
    id: 's4',
    number: 4,
    dateLabel: '23 abr',
    time: '15:00',
    status: 'past',
    type: 'follow-up',
    title: 'Sleep restriction adherence',
    note: `# Sleep restriction adherence

Reviewed week 1 of sleep restriction. Adherence patchy on weekends. Discussed cognitive reframe of "lost sleep". Set diary as homework. 2 tasks assigned.`,
  },
  {
    id: 's3',
    number: 3,
    dateLabel: '19 abr',
    time: '16:00',
    status: 'past',
    type: 'follow-up',
    title: 'Psychoeducation: sleep drive',
    note: `# Psychoeducation: sleep drive

Walked Maddy through process-S and process-C. She found the framing useful and asked good clarifying questions about caffeine timing.`,
  },
  {
    id: 's2',
    number: 2,
    dateLabel: '12 abr',
    time: '16:00',
    status: 'past',
    type: 'follow-up',
    title: 'Introducing sleep restriction',
    note: `# Introducing sleep restriction

Baseline efficiency 64%. First sleep window: 00:30–07:00. Maddy expressed scepticism about earlier waking — agreed to try for one week.`,
  },
  {
    id: 's1',
    number: 1,
    dateLabel: '30 mar',
    time: '16:00',
    status: 'past',
    type: 'intake',
    title: 'Intake',
    note: `# Intake

Presenting concern: chronic insomnia, ~6 months. Onset coincided with job change.

Sleep history: mother used to wake her early on weekends to "reset the schedule". Maddy frames her current weekend lie-in as resistance.

Working diagnosis: chronic insomnia disorder. Plan: CBT-I, 6-session protocol.`,
  },
]

const initialComments = [
  {
    id: 'c1',
    anchor: { from: 0, to: 0 },
    anchorText: 'underlying beliefs about "catching up"',
    author: { name: 'Maria García', initials: 'MG' },
    body: 'Worth flagging — this "catching up" belief might tie back to her intake notes about parental sleep messages. Check session #1?',
    replies: [],
    resolvedAt: null,
    createdAt: new Date().toISOString(),
  },
]

const noeResponses: Record<string, string> = {
  'summarize key themes': `Three themes:

- **Adherence ambivalence** — diary engagement strong, weekend wake-time resisted
- **Sub-threshold efficiency** — 78%, target 85% to advance the window
- **Cognitive lever** — "catching up" belief surfaced

Likely next session: cognitive work on the catching-up belief.`,

  'suggest follow-up questions': `Three to consider for next session:

1. What goes through your mind on Sunday morning when you stay in bed?
2. How would the week feel if you held the wake time consistently?
3. Where did the idea of "catching up" first come from?`,

  'what did we cover 2 weeks ago': `Session #2 (12 abr) introduced sleep restriction. Key points:

- Baseline efficiency 64%
- First sleep window: 00:30–07:00
- Maddy expressed scepticism about earlier waking but agreed to try for one week`,

  'session 1': `From the intake (30 mar):

> "Mother used to wake her early on weekends to 'reset the schedule'. Maddy frames her current weekend lie-in as resistance."`,
}

const noeFallback = `In a real version I'd answer this from the full session context. For the prototype, try one of: "summarize key themes", "suggest follow-up questions", "what did we cover 2 weeks ago".`

// --- Custom Comment Mark ---
const CommentMark = Mark.create({
  name: 'comment',
  addOptions() {
    return { HTMLAttributes: { class: 'comment-mark' } }
  },
  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) return {}
          return { 'data-comment-id': attributes.commentId }
        }
      }
    }
  },
  parseHTML() { return [{ tag: 'span[data-comment-id]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  }
})

// --- State ---
const router = useRouter()
const activeLeftPanel = ref<'sessions' | 'comments' | null>(null)
const peekSession = ref<typeof sessions[0] | null>(null)

const isNoeCollapsed = ref(false)
const noeSidebarWidth = ref(400)
const isDraggingSidebar = ref(false)

const noeMessages = ref<{ role: 'user' | 'noe', text: string }[]>([])
const noeInput = ref('')
const isNoeTyping = ref(false)

const comments = ref([...initialComments])
const commentFilter = ref<'all' | 'open' | 'resolved' | 'mine'>('all')

const newCommentActive = ref(false)
const newCommentText = ref('')
const newCommentAnchor = ref<{ from: number, to: number } | null>(null)

const activeSession = sessions.find(s => s.status === 'current')!

// --- Bubble Menu State ---
const bubbleMenuVisible = ref(false)
const bubbleMenuCoords = ref({ top: 0, left: 0 })

const bubbleMenuStyle = computed(() => ({
  position: 'fixed' as const,
  top: (bubbleMenuCoords.value.top - 8) + 'px',
  left: bubbleMenuCoords.value.left + 'px',
  transform: 'translate(-50%, -100%)',
  zIndex: 50,
}))

function updateBubbleMenu() {
  if (!editor.value) { bubbleMenuVisible.value = false; return }
  const { from, to, empty } = editor.value.state.selection
  if (empty) { bubbleMenuVisible.value = false; return }
  const startCoords = editor.value.view.coordsAtPos(from)
  const endCoords = editor.value.view.coordsAtPos(to)
  bubbleMenuCoords.value = {
    top: Math.min(startCoords.top, endCoords.top),
    left: (startCoords.left + endCoords.right) / 2,
  }
  bubbleMenuVisible.value = true
}

// --- Editor Setup ---
const editor = useEditor({
  content: activeSession.note,
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [1, 2, 3] }
    }),
    Highlight.configure({ multicolor: true }),
    Underline,
    Placeholder.configure({ placeholder: 'Start writing…' }),
    CharacterCount,
    TaskList,
    TaskItem.configure({ nested: true }),
    CommentMark
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-invert prose-p:leading-relaxed prose-p:font-normal prose-headings:font-medium focus:outline-none max-w-none text-[16px] leading-[1.7]',
    },
  },
  onUpdate: () => { updateBubbleMenu() },
  onSelectionUpdate: () => { updateBubbleMenu() },
  onBlur: () => { bubbleMenuVisible.value = false },
})

// Insert initial comment mark into editor on mount
onMounted(() => {
  if (editor.value) {
    // A quick hack to find the text and wrap it in the mark
    const textToFind = initialComments[0].anchorText
    let pos = -1
    editor.value.state.doc.descendants((node, p) => {
      if (node.isText && node.text?.includes(textToFind)) {
        pos = p + node.text.indexOf(textToFind)
      }
    })
    if (pos !== -1) {
      initialComments[0].anchor = { from: pos, to: pos + textToFind.length }
      editor.value.commands.setTextSelection({ from: pos, to: pos + textToFind.length })
      editor.value.commands.setMark('comment', { commentId: 'c1' })
      editor.value.commands.setTextSelection(pos + textToFind.length) // clear selection
    }
  }
})

// --- Handlers ---
const toggleLeftPanel = (panel: 'sessions' | 'comments') => {
  if (activeLeftPanel.value === panel) activeLeftPanel.value = null
  else activeLeftPanel.value = panel
}

const closePeek = () => {
  peekSession.value = null
}

const sendNoeMessage = async () => {
  const text = noeInput.value.trim()
  if (!text) return

  noeMessages.value.push({ role: 'user', text })
  noeInput.value = ''
  isNoeTyping.value = true

  const normalized = text.toLowerCase()
  let response = noeFallback
  for (const [trigger, res] of Object.entries(noeResponses)) {
    if (normalized.includes(trigger)) {
      response = res
      break
    }
  }

  // Simulate delay
  await new Promise(r => setTimeout(r, 600 + Math.random() * 600))
  isNoeTyping.value = false
  noeMessages.value.push({ role: 'noe', text: response })
}

const handleSidebarDrag = (e: MouseEvent) => {
  if (!isDraggingSidebar.value) return
  // Sidebar is on the right, so width is window.innerWidth - e.clientX
  let newWidth = window.innerWidth - e.clientX
  if (newWidth < 320) newWidth = 320
  if (newWidth > 560) newWidth = 560
  noeSidebarWidth.value = newWidth
}

const stopSidebarDrag = () => {
  isDraggingSidebar.value = false
  document.removeEventListener('mousemove', handleSidebarDrag)
  document.removeEventListener('mouseup', stopSidebarDrag)
  document.body.style.cursor = ''
}

const startSidebarDrag = () => {
  isDraggingSidebar.value = true
  document.addEventListener('mousemove', handleSidebarDrag)
  document.addEventListener('mouseup', stopSidebarDrag)
  document.body.style.cursor = 'col-resize'
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (peekSession.value) peekSession.value = null
    else if (newCommentActive.value) newCommentActive.value = false
    else if (activeLeftPanel.value) activeLeftPanel.value = null
  }
  if (e.metaKey && e.key === '.') {
    e.preventDefault()
    console.log('Focus mode toggled')
  }
  if (e.metaKey && e.key === '\\') {
    e.preventDefault()
    toggleLeftPanel('sessions')
  }
  if (e.metaKey && e.altKey && e.key === 'm') {
    e.preventDefault()
    startComment()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const startComment = () => {
  if (!editor.value || editor.value.state.selection.empty) return
  const { from, to } = editor.value.state.selection
  newCommentAnchor.value = { from, to }
  newCommentActive.value = true
  // Focus the input would happen here (using a ref on the textarea)
}

const saveComment = () => {
  if (!newCommentText.value.trim() || !newCommentAnchor.value || !editor.value) return
  const id = 'c' + Date.now()
  const text = editor.value.state.doc.textBetween(newCommentAnchor.value.from, newCommentAnchor.value.to)
  
  editor.value.commands.setTextSelection(newCommentAnchor.value)
  editor.value.commands.setMark('comment', { commentId: id })
  editor.value.commands.setTextSelection(newCommentAnchor.value.to)

  comments.value.push({
    id,
    anchor: newCommentAnchor.value,
    anchorText: text,
    author: { name: 'Dr. Clinician', initials: 'DC' },
    body: newCommentText.value,
    replies: [],
    resolvedAt: null,
    createdAt: new Date().toISOString()
  })

  newCommentText.value = ''
  newCommentActive.value = false
  newCommentAnchor.value = null
  activeLeftPanel.value = 'comments'
}

const scrollToComment = (id: string) => {
  // Simple scroll mock
  const el = document.querySelector('[data-comment-id="' + id + '"]')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const resolveComment = (id: string) => {
  const c = comments.value.find(x => x.id === id)
  if (c) {
    c.resolvedAt = c.resolvedAt ? null : new Date().toISOString()
  }
}

const wordCount = computed(() => editor.value?.storage.characterCount.words() || 0)
const taskCount = computed(() => {
  if (!editor.value) return { total: 0, checked: 0 }
  let total = 0
  let checked = 0
  editor.value.state.doc.descendants((node) => {
    if (node.type.name === 'taskItem') {
      total++
      if (node.attrs.checked) checked++
    }
  })
  return { total, checked }
})

const filteredComments = computed(() => {
  if (commentFilter.value === 'open') return comments.value.filter(c => !c.resolvedAt)
  if (commentFilter.value === 'resolved') return comments.value.filter(c => !!c.resolvedAt)
  if (commentFilter.value === 'mine') return comments.value.filter(c => c.author.initials === 'DC')
  return comments.value
})

const noeSuggestedPrompts = [
  "Summarize key themes",
  "Suggest follow-up questions",
  "What did we cover 2 weeks ago?"
]
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-[#0A0A0A] text-zinc-100 overflow-hidden font-sans">
    
    <!-- Top Bar -->
    <header class="h-[52px] shrink-0 border-b border-white/10 flex items-center justify-between px-4 bg-[#0A0A0A] z-20">
      <div class="flex items-center gap-3">
        <button class="p-1.5 hover:bg-white/10 rounded-md transition-colors" @click="router.back()">
          <ArrowLeft class="w-4 h-4 text-zinc-400" />
        </button>
        <div class="flex items-center gap-2">
          <span class="font-medium hover:underline cursor-pointer">{{ patient.name }}</span>
          <span class="text-zinc-500">·</span>
          <span class="text-zinc-500 text-sm">{{ patient.totalSessions }} sessions</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span class="text-xs font-medium text-red-500">12:43</span>
        </div>
        <div class="w-px h-3.5 bg-white/10"></div>
        <span class="text-xs text-zinc-500 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></span> Saved</span>
        <div class="w-px h-3.5 bg-white/10"></div>
        <button class="px-3 py-1.5 text-sm font-medium bg-white/10 hover:bg-white/15 rounded-md transition-colors">
          Transcribe
        </button>
        <button
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors border"
          style="background:rgba(233,69,96,0.12);border-color:rgba(233,69,96,0.3);color:rgb(233,69,96);"
          @click="router.back()"
          title="Exit focus mode (⌘.)"
        >
          Focus
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden relative">
      
      <!-- Left Rail -->
      <div class="w-[40px] shrink-0 border-r border-white/10 bg-[#0A0A0A] flex flex-col items-center py-4 gap-4 z-20">
        <button 
          :class="['p-2 rounded-md transition-colors', activeLeftPanel === 'sessions' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5']"
          title="Sessions (Cmd+\\)"
          @click="toggleLeftPanel('sessions')"
        >
          <CalendarDays class="w-4 h-4" />
        </button>
        <button 
          :class="['p-2 rounded-md transition-colors relative', activeLeftPanel === 'comments' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5']"
          title="Comments"
          @click="toggleLeftPanel('comments')"
        >
          <MessageSquare class="w-4 h-4" />
          <span v-if="comments.filter(c => !c.resolvedAt).length > 0" class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
        </button>
      </div>

      <!-- Slide-over Left Panel -->
      <div 
        :class="['absolute top-0 bottom-0 left-[40px] w-[240px] bg-[#121212] border-r border-white/10 z-10 transition-transform duration-300 flex flex-col', activeLeftPanel ? 'translate-x-0' : '-translate-x-full']"
      >
        <!-- Sessions Panel -->
        <div v-if="activeLeftPanel === 'sessions'" class="flex-1 flex flex-col min-h-0">
          <div class="p-3 border-b border-white/5">
            <div class="relative">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Search sessions..." class="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20" />
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-1">
            <button 
              v-for="session in sessions" :key="session.id"
              class="w-full text-left p-2 rounded-md hover:bg-white/5 transition-colors group flex items-start gap-2"
              @click="peekSession = session"
            >
              <div class="mt-1 flex shrink-0 justify-center w-3">
                <div v-if="session.status === 'scheduled'" class="w-1.5 h-1.5 rounded-full border border-dashed border-zinc-500"></div>
                <div v-else-if="session.status === 'past'" class="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                <div v-else class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-zinc-200">Session #{{ session.number }}</span>
                  <span class="text-[10px] text-zinc-500">{{ session.dateLabel }}</span>
                </div>
                <p class="text-xs text-zinc-500 truncate mt-0.5">{{ session.title || session.type }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Comments Panel -->
        <div v-else-if="activeLeftPanel === 'comments'" class="flex-1 flex flex-col min-h-0">
          <div class="p-3 border-b border-white/5">
            <h3 class="text-sm font-medium mb-3">Comments</h3>
            <div class="flex flex-wrap gap-1.5">
              <button v-for="f in ['all', 'open', 'resolved', 'mine']" :key="f" 
                :class="['text-[10px] px-2 py-1 rounded-full capitalize transition-colors', commentFilter === f ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-white/5 text-zinc-400 border border-transparent hover:bg-white/10']"
                @click="commentFilter = f as any"
              >
                {{ f }}
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-3 space-y-3">
            <div v-if="filteredComments.length === 0" class="text-xs text-zinc-500 text-center mt-4">
              No comments found.
            </div>
            <div v-for="comment in filteredComments" :key="comment.id" 
              :class="['p-3 rounded-lg border text-xs cursor-pointer transition-colors', comment.resolvedAt ? 'bg-white/5 border-transparent opacity-60' : 'bg-[#1A1A1A] border-white/10 hover:border-white/20']"
              @click="scrollToComment(comment.id)"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-1.5">
                  <div class="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-medium text-zinc-300">
                    {{ comment.author.initials }}
                  </div>
                  <span class="font-medium text-zinc-300">{{ comment.author.name }}</span>
                </div>
                <button @click.stop="resolveComment(comment.id)" title="Toggle resolve" class="text-zinc-500 hover:text-white">
                  <CheckSquare class="w-3.5 h-3.5" />
                </button>
              </div>
              <blockquote class="pl-2 border-l-2 border-zinc-700 text-zinc-500 mb-2 italic line-clamp-2">
                "{{ comment.anchorText }}"
              </blockquote>
              <p class="text-zinc-200">{{ comment.body }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Peek Slide-over -->
      <div 
        :class="['absolute top-0 bottom-0 left-[280px] w-[500px] bg-[#0A0A0A] border-r border-white/10 z-10 transition-transform duration-300 flex flex-col shadow-2xl', peekSession ? 'translate-x-0' : '-translate-x-full']"
        style="box-shadow: 20px 0 25px -5px rgba(0,0,0,0.5);"
      >
        <div v-if="peekSession" class="flex-1 flex flex-col min-h-0">
          <div class="p-4 flex items-center justify-between border-b border-white/5">
            <div>
              <div class="text-xs text-zinc-500 mb-1">Session #{{ peekSession.number }} · {{ peekSession.dateLabel }}</div>
              <h2 class="text-lg font-medium">{{ peekSession.title || peekSession.type }}</h2>
            </div>
            <button class="p-1.5 hover:bg-white/10 rounded-md transition-colors" @click="closePeek">
              <X class="w-4 h-4 text-zinc-400" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none text-zinc-300">
            <div v-if="peekSession.note" v-html="peekSession.note.replace(/\\n/g, '<br/>')"></div>
            <div v-else class="text-zinc-500 italic">No notes for this session.</div>
          </div>
        </div>
      </div>

      <!-- Center Editor Area -->
      <div class="flex-1 flex flex-col relative min-w-0 bg-[#0A0A0A]">
        
        <!-- Sticky Editor Toolbar -->
        <div class="sticky top-0 z-10 mx-auto w-full max-w-[820px] pt-4 px-12">
          <div class="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md w-fit shadow-sm">
            <button @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()" :class="['p-1.5 rounded hover:bg-white/10 transition-colors', editor?.isActive('heading', { level: 1 }) ? 'bg-white/10 text-white' : 'text-zinc-400']"><Heading1 class="w-4 h-4" /></button>
            <button @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" :class="['p-1.5 rounded hover:bg-white/10 transition-colors', editor?.isActive('heading', { level: 2 }) ? 'bg-white/10 text-white' : 'text-zinc-400']"><Heading2 class="w-4 h-4" /></button>
            <div class="w-px h-4 bg-white/10 mx-1"></div>
            <button @click="editor?.chain().focus().toggleBold().run()" :class="['p-1.5 rounded hover:bg-white/10 transition-colors', editor?.isActive('bold') ? 'bg-white/10 text-white' : 'text-zinc-400']"><Bold class="w-4 h-4" /></button>
            <button @click="editor?.chain().focus().toggleItalic().run()" :class="['p-1.5 rounded hover:bg-white/10 transition-colors', editor?.isActive('italic') ? 'bg-white/10 text-white' : 'text-zinc-400']"><Italic class="w-4 h-4" /></button>
            <button @click="editor?.chain().focus().toggleUnderline().run()" :class="['p-1.5 rounded hover:bg-white/10 transition-colors', editor?.isActive('underline') ? 'bg-white/10 text-white' : 'text-zinc-400']"><UnderlineIcon class="w-4 h-4" /></button>
            <button @click="editor?.chain().focus().toggleHighlight().run()" :class="['p-1.5 rounded hover:bg-white/10 transition-colors', editor?.isActive('highlight') ? 'bg-amber-500/20 text-amber-500' : 'text-zinc-400']"><Highlighter class="w-4 h-4" /></button>
            <div class="w-px h-4 bg-white/10 mx-1"></div>
            <button @click="editor?.chain().focus().toggleBulletList().run()" :class="['p-1.5 rounded hover:bg-white/10 transition-colors', editor?.isActive('bulletList') ? 'bg-white/10 text-white' : 'text-zinc-400']"><List class="w-4 h-4" /></button>
            <button @click="editor?.chain().focus().toggleTaskList().run()" :class="['p-1.5 rounded hover:bg-white/10 transition-colors', editor?.isActive('taskList') ? 'bg-white/10 text-white' : 'text-zinc-400']"><CheckSquare class="w-4 h-4" /></button>
            <div class="w-px h-4 bg-white/10 mx-1"></div>
            <button @click="startComment" class="p-1.5 rounded hover:bg-white/10 text-zinc-400 transition-colors" title="Comment (⌥⌘M)"><MessageSquarePlus class="w-4 h-4" /></button>
          </div>
        </div>

        <!-- Editor Content -->
        <div class="flex-1 overflow-y-auto pb-32">
          <div class="mx-auto w-full max-w-[820px] px-12 py-10">
            <EditorContent :editor="editor" v-if="editor" />
          </div>
        </div>

        <!-- Sticky Footer inside Editor area -->
        <div class="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          <div class="mx-auto w-full max-w-[820px] px-12 flex justify-between items-center opacity-70 pointer-events-auto">
            <div class="flex items-center gap-4 text-xs text-zinc-500">
              <span>{{ wordCount }} words</span>
              <span>{{ comments.length }} comments</span>
              <span>{{ taskCount.checked }}/{{ taskCount.total }} tasks</span>
            </div>
            <div class="text-xs text-zinc-500 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Autosaved
            </div>
          </div>
        </div>

        <!-- Custom Bubble Menu (shown on text selection) -->
        <Teleport to="body">
          <div
            v-if="bubbleMenuVisible && editor"
            :style="bubbleMenuStyle"
            class="flex bg-zinc-800 border border-white/10 rounded-lg shadow-xl overflow-hidden p-1 gap-0.5"
          >
            <button @click="editor.chain().focus().toggleBold().run()" :class="['p-1.5 hover:bg-white/10 rounded', editor.isActive('bold') ? 'bg-white/10 text-white' : 'text-zinc-300']"><Bold class="w-4 h-4" /></button>
            <button @click="editor.chain().focus().toggleItalic().run()" :class="['p-1.5 hover:bg-white/10 rounded', editor.isActive('italic') ? 'bg-white/10 text-white' : 'text-zinc-300']"><Italic class="w-4 h-4" /></button>
            <button @click="editor.chain().focus().toggleUnderline().run()" :class="['p-1.5 hover:bg-white/10 rounded', editor.isActive('underline') ? 'bg-white/10 text-white' : 'text-zinc-300']"><UnderlineIcon class="w-4 h-4" /></button>
            <button @click="editor.chain().focus().toggleHighlight().run()" :class="['p-1.5 hover:bg-white/10 rounded', editor.isActive('highlight') ? 'bg-amber-500/20 text-amber-500' : 'text-zinc-300']"><Highlighter class="w-4 h-4" /></button>
            <div class="w-px h-5 bg-white/10 my-auto mx-1"></div>
            <button @click="startComment" class="p-1.5 hover:bg-white/10 rounded text-zinc-300" title="Comment (⌥⌘M)"><MessageSquarePlus class="w-4 h-4" /></button>
            <button @click="editor.chain().focus().setLink({ href: '' }).run()" class="p-1.5 hover:bg-white/10 rounded text-zinc-300"><LinkIcon class="w-4 h-4" /></button>
          </div>
        </Teleport>

        <!-- New Comment Popover Mock -->
        <div v-if="newCommentActive" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl w-80 p-3 z-50">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-medium">Add comment</span>
            <button @click="newCommentActive = false" class="text-zinc-400 hover:text-white"><X class="w-3.5 h-3.5" /></button>
          </div>
          <textarea v-model="newCommentText" rows="3" class="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-white/20 mb-2 resize-none placeholder:text-zinc-600" placeholder="Type your comment..."></textarea>
          <div class="flex justify-end">
            <button @click="saveComment" class="bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors">Comment</button>
          </div>
        </div>

      </div>

      <!-- Resizer handle -->
      <div 
        v-if="!isNoeCollapsed"
        class="w-1 cursor-col-resize hover:bg-white/10 active:bg-white/20 transition-colors z-20"
        @mousedown.prevent="startSidebarDrag"
      ></div>

      <!-- Right Noe Sidebar -->
      <div 
        :class="['bg-[#121212] border-l border-white/10 flex flex-col shrink-0 transition-all duration-300 z-10', isNoeCollapsed ? 'w-[48px]' : '']"
        :style="isNoeCollapsed ? {} : { width: noeSidebarWidth + 'px' }"
      >
        <div class="h-[52px] px-3 flex items-center justify-between border-b border-white/5 shrink-0">
          <div v-if="!isNoeCollapsed" class="flex items-center gap-2">
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span class="font-medium text-sm">Noe</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <button 
            @click="isNoeCollapsed = !isNoeCollapsed"
            class="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors ml-auto"
          >
            <PanelRightClose v-if="!isNoeCollapsed" class="w-4 h-4" />
            <PanelRightOpen v-else class="w-4 h-4" />
          </button>
        </div>

        <div v-if="!isNoeCollapsed" class="flex-1 flex flex-col min-h-0">
          
          <!-- Chat Area -->
          <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div v-if="noeMessages.length === 0" class="flex flex-col items-center justify-center h-full text-center px-4">
              <div class="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <Sparkles class="w-6 h-6 text-amber-500" />
              </div>
              <h3 class="text-sm font-medium text-white mb-2">Ask Noe about this session</h3>
              <p class="text-xs text-zinc-500 mb-6">Noe can help you summarize, analyze, or prepare for the next session.</p>
              
              <div class="flex flex-col gap-2 w-full">
                <button 
                  v-for="prompt in noeSuggestedPrompts" :key="prompt"
                  class="text-xs text-left px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors text-zinc-300"
                  @click="noeInput = prompt; sendNoeMessage()"
                >
                  "{{ prompt }}"
                </button>
              </div>
            </div>
            
            <template v-else>
              <div v-for="(msg, idx) in noeMessages" :key="idx" :class="['max-w-[85%] text-sm rounded-2xl p-3', msg.role === 'user' ? 'bg-zinc-800 text-white self-end rounded-tr-sm' : 'bg-transparent text-zinc-200 self-start prose prose-invert prose-sm prose-p:leading-relaxed']">
                <div v-if="msg.role === 'noe'" v-html="msg.text.replace(/\\n/g, '<br/>')"></div>
                <div v-else>{{ msg.text }}</div>
              </div>
              <div v-if="isNoeTyping" class="self-start bg-transparent text-zinc-500 text-sm flex items-center gap-1.5 px-3 py-2">
                <span class="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style="animation-delay: 0.2s"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style="animation-delay: 0.4s"></span>
              </div>
            </template>
          </div>

          <!-- Input Area -->
          <div class="p-4 border-t border-white/5 bg-[#121212]">
            <div class="relative flex items-end gap-2 bg-zinc-900 border border-white/10 rounded-xl p-2 focus-within:border-white/30 transition-colors">
              <textarea 
                v-model="noeInput"
                class="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 resize-none max-h-32 focus:outline-none py-1.5 pl-2"
                rows="1"
                placeholder="Message Noe..."
                @keydown.enter.prevent="sendNoeMessage"
              ></textarea>
              <button 
                @click="sendNoeMessage"
                :disabled="!noeInput.trim() || isNoeTyping"
                class="p-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-colors shrink-0"
              >
                <Send class="w-4 h-4" />
              </button>
            </div>
            <div class="text-[10px] text-center text-zinc-600 mt-2">
              Noe can make mistakes. Check important info.
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style>
/* Tiptap Editor Styles */
.ProseMirror p.is-editor-empty:first-child::before {
  color: #52525b;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.comment-mark {
  border-bottom: 2px solid rgba(245, 158, 11, 0.4);
  background-color: rgba(245, 158, 11, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}
.comment-mark:hover {
  background-color: rgba(245, 158, 11, 0.2);
}

ul[data-type="taskList"] {
  list-style: none;
  padding: 0;
}
ul[data-type="taskList"] p {
  margin: 0;
}
ul[data-type="taskList"] li {
  display: flex;
  margin-bottom: 0.5rem;
}
ul[data-type="taskList"] li > label {
  flex: 0 0 auto;
  margin-right: 0.5rem;
  user-select: none;
}
ul[data-type="taskList"] li > div {
  flex: 1 1 auto;
}
</style>
