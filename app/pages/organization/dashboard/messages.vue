<script setup lang="ts">
import {
  Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send,
  Check, CheckCheck, Circle,
} from 'lucide-vue-next'
import { format, isToday, isYesterday, parseISO } from 'date-fns'

definePageMeta({ layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────────────────────

type MessageStatus = 'sent' | 'delivered' | 'read'

interface Message {
  id: string
  from: 'admin' | 'contact'
  text: string
  timestamp: Date
  status?: MessageStatus
}

interface Conversation {
  id: string
  contactName: string
  initials: string
  avatarBg: string
  avatarText: string
  online: boolean
  lastMessage: string
  lastTime: Date
  unread: number
  messages: Message[]
}

// ── Mock data ──────────────────────────────────────────────────────────────

function t(h: number, m: number): Date {
  const d = new Date(); d.setHours(h, m, 0, 0); return d
}
function yesterday(h: number, m: number): Date {
  const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(h, m, 0, 0); return d
}

const conversations = ref<Conversation[]>([
  {
    id: 'c1',
    contactName: 'Dr. Elena Voss',
    initials: 'EV',
    avatarBg: 'bg-indigo-100',
    avatarText: 'text-indigo-700',
    online: true,
    lastMessage: 'I\'ll send over the session notes shortly.',
    lastTime: t(10, 30),
    unread: 2,
    messages: [
      { id: 'm1', from: 'admin',   text: 'Good morning, Dr. Voss. Could you confirm your availability for the team meeting on Thursday?', timestamp: t(9, 15), status: 'read' },
      { id: 'm2', from: 'contact', text: 'Of course! Thursday afternoon works perfectly for me.', timestamp: t(9, 20), status: 'read' },
      { id: 'm3', from: 'admin',   text: 'Great, we\'ll schedule it for 4pm. Also, could you forward the latest patient outcome reports when you get a chance?', timestamp: t(9, 22), status: 'read' },
      { id: 'm4', from: 'contact', text: 'Will do. I have a few sessions this morning but I\'ll get to it after lunch.', timestamp: t(9, 25), status: 'read' },
      { id: 'm5', from: 'contact', text: 'I\'ll send over the session notes shortly.', timestamp: t(10, 30), status: 'delivered' },
    ],
  },
  {
    id: 'c2',
    contactName: 'Dr. Marco Silva',
    initials: 'MS',
    avatarBg: 'bg-sky-100',
    avatarText: 'text-sky-700',
    online: false,
    lastMessage: 'Thanks for approving the leave request.',
    lastTime: yesterday(15, 45),
    unread: 0,
    messages: [
      { id: 'm1', from: 'contact', text: 'Hi, I submitted a leave request for next Friday. Is that okay?', timestamp: yesterday(14, 30), status: 'read' },
      { id: 'm2', from: 'admin',   text: 'We\'ve reviewed it and approved the request. No sessions are scheduled that day so it\'s all clear.', timestamp: yesterday(15, 10), status: 'read' },
      { id: 'm3', from: 'contact', text: 'Thanks for approving the leave request.', timestamp: yesterday(15, 45), status: 'read' },
    ],
  },
  {
    id: 'c3',
    contactName: 'Dr. Priya Nair',
    initials: 'PN',
    avatarBg: 'bg-green-100',
    avatarText: 'text-green-700',
    online: true,
    lastMessage: 'Can we discuss the new intake forms?',
    lastTime: t(8, 45),
    unread: 1,
    messages: [
      { id: 'm1', from: 'contact', text: 'Good morning! Can we discuss the new intake forms? I have some feedback from patients.', timestamp: t(8, 45), status: 'delivered' },
    ],
  },
])

// ── State ──────────────────────────────────────────────────────────────────

const selectedId  = ref('c1')
const search      = ref('')
const compose     = ref('')
const messagesEnd = ref<HTMLElement>()

const selected = computed(
  () => conversations.value.find(c => c.id === selectedId.value)!,
)

const filteredConversations = computed(() => {
  if (!search.value.trim()) return conversations.value
  const q = search.value.toLowerCase()
  return conversations.value.filter(c => c.contactName.toLowerCase().includes(q))
})

function selectConversation(id: string) {
  selectedId.value = id
  const c = conversations.value.find(c => c.id === id)
  if (c) c.unread = 0
}

function sendMessage() {
  if (!compose.value.trim()) return
  const c = conversations.value.find(c => c.id === selectedId.value)
  if (!c) return
  c.messages.push({
    id: `m${Date.now()}`,
    from: 'admin',
    text: compose.value.trim(),
    timestamp: new Date(),
    status: 'sent',
  })
  c.lastMessage = compose.value.trim()
  c.lastTime = new Date()
  compose.value = ''
  nextTick(() => messagesEnd.value?.scrollIntoView({ behavior: 'smooth' }))
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtTime(d: Date) {
  if (isToday(d))     return format(d, 'HH:mm')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

function fmtMsgTime(d: Date) {
  return format(d, 'HH:mm')
}

// Group messages by date for the chat divider
type MessageGroup = { dateLabel: string; messages: Message[] }
const groupedMessages = computed<MessageGroup[]>(() => {
  const msgs = selected.value?.messages ?? []
  const groups: MessageGroup[] = []
  for (const msg of msgs) {
    const label = isToday(msg.timestamp)
      ? 'Today'
      : isYesterday(msg.timestamp)
        ? 'Yesterday'
        : format(msg.timestamp, 'MMMM d, yyyy')
    const last = groups.at(-1)
    if (last?.dateLabel === label) {
      last.messages.push(msg)
    } else {
      groups.push({ dateLabel: label, messages: [msg] })
    }
  }
  return groups
})

// Auto-scroll on mount and when messages change
onMounted(() => messagesEnd.value?.scrollIntoView())
watch(() => selected.value?.messages.length, () => {
  nextTick(() => messagesEnd.value?.scrollIntoView({ behavior: 'smooth' }))
})
</script>

<template>
  <div class="flex-1 flex overflow-hidden min-h-0">

    <!-- ══ Left — conversation list ══════════════════════════════════════ -->
    <aside class="w-64 sm:w-72 md:w-80 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shrink-0 min-w-0">

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Messages</h2>
        <button class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <MoreHorizontal class="w-4 h-4" />
        </button>
      </div>

      <!-- Search -->
      <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            v-model="search"
            type="text"
            placeholder="Search messages..."
            class="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Conversation list -->
      <div class="flex-1 overflow-y-auto">
        <button
          v-for="conv in filteredConversations"
          :key="conv.id"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-slate-50',
            selectedId === conv.id ? 'bg-indigo-50 dark:bg-indigo-950' : 'hover:bg-slate-50 dark:hover:bg-slate-800',
          ]"
          @click="selectConversation(conv.id)"
        >
          <!-- Avatar + online dot -->
          <div class="relative shrink-0">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold', conv.avatarBg, conv.avatarText]">
              {{ conv.initials }}
            </div>
            <span
              :class="[
                'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white',
                conv.online ? 'bg-green-500' : 'bg-slate-300',
              ]"
            />
          </div>

          <!-- Name + preview -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <p :class="['text-sm font-semibold truncate', selectedId === conv.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-100']">
                {{ conv.contactName }}
              </p>
              <span class="text-[11px] text-slate-400 shrink-0">{{ fmtTime(conv.lastTime) }}</span>
            </div>
            <div class="flex items-center justify-between gap-2 mt-0.5">
              <p class="text-xs text-slate-500 truncate">{{ conv.lastMessage }}</p>
              <span
                v-if="conv.unread > 0"
                class="shrink-0 min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center"
              >
                {{ conv.unread }}
              </span>
            </div>
          </div>
        </button>

        <!-- Empty search state -->
        <div v-if="filteredConversations.length === 0" class="py-12 text-center">
          <Search class="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p class="text-sm text-slate-400">No conversations found</p>
        </div>
      </div>
    </aside>

    <!-- ══ Right — active conversation ══════════════════════════════════ -->
    <main class="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">

      <!-- Chat header -->
      <header class="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div class="flex items-center gap-3">
          <!-- Avatar -->
          <div class="relative">
            <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold', selected.avatarBg, selected.avatarText]">
              {{ selected.initials }}
            </div>
            <span :class="['absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white', selected.online ? 'bg-green-500' : 'bg-slate-300']" />
          </div>

          <!-- Name + status -->
          <div>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{{ selected.contactName }}</p>
            <p :class="['text-xs leading-tight', selected.online ? 'text-green-600' : 'text-slate-400']">
              {{ selected.online ? 'Online' : 'Offline' }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1">
          <button class="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Voice call">
            <Phone class="w-4 h-4" />
          </button>
          <button class="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Video call">
            <Video class="w-4 h-4" />
          </button>
          <button class="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="More options">
            <MoreHorizontal class="w-4 h-4" />
          </button>
        </div>
      </header>

      <!-- Messages area -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-6 min-h-0 bg-slate-50/40 dark:bg-slate-950/40">
        <template v-for="group in groupedMessages" :key="group.dateLabel">

          <!-- Date divider -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-px bg-slate-200" />
            <span class="text-xs text-slate-400 font-medium px-2">{{ group.dateLabel }}</span>
            <div class="flex-1 h-px bg-slate-200" />
          </div>

          <!-- Messages in group -->
          <div class="space-y-2">
            <div
              v-for="msg in group.messages"
              :key="msg.id"
              :class="['flex gap-2.5', msg.from === 'admin' ? 'flex-row-reverse' : '']"
            >
              <!-- Contact avatar (only for contact messages) -->
              <div
                v-if="msg.from === 'contact'"
                :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 self-end', selected.avatarBg, selected.avatarText]"
              >
                {{ selected.initials }}
              </div>

              <!-- Bubble + time -->
              <div :class="['flex flex-col gap-1 max-w-[70%]', msg.from === 'admin' ? 'items-end' : 'items-start']">
                <div
                  :class="[
                    'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                    msg.from === 'admin'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm shadow-sm',
                  ]"
                >
                  {{ msg.text }}
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[11px] text-slate-400">{{ fmtMsgTime(msg.timestamp) }}</span>
                  <!-- Read receipt for admin messages -->
                  <template v-if="msg.from === 'admin'">
                    <CheckCheck v-if="msg.status === 'read'" class="w-3.5 h-3.5 text-indigo-400" />
                    <CheckCheck v-else-if="msg.status === 'delivered'" class="w-3.5 h-3.5 text-slate-400" />
                    <Check v-else class="w-3.5 h-3.5 text-slate-300" />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Scroll anchor -->
        <div ref="messagesEnd" />
      </div>

      <!-- Compose bar -->
      <footer class="shrink-0 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          <!-- Attach -->
          <button class="text-slate-400 hover:text-slate-600 transition-colors shrink-0" title="Attach file">
            <Paperclip class="w-4.5 h-4.5" />
          </button>

          <!-- Input -->
          <input
            v-model="compose"
            type="text"
            placeholder="Type a message..."
            class="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            @keydown.enter="sendMessage"
          />

          <!-- Emoji -->
          <button class="text-slate-400 hover:text-slate-600 transition-colors shrink-0" title="Emoji">
            <Smile class="w-4.5 h-4.5" />
          </button>

          <!-- Send -->
          <button
            :class="[
              'w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0',
              compose.trim()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-slate-200 text-slate-400 cursor-default',
            ]"
            :disabled="!compose.trim()"
            @click="sendMessage"
          >
            <Send class="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

    </main>
  </div>
</template>
