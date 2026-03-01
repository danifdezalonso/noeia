<script setup lang="ts">
import {
  Search, Phone, Video, MoreHorizontal, Paperclip, Smile, Send,
  Check, CheckCheck,
} from 'lucide-vue-next'
import { format, isToday, isYesterday } from 'date-fns'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'

definePageMeta({ layout: 'dashboard' })

const { conversations, selectConversation: _select, sendMessage: _send } = useMessages()

// ── State ──────────────────────────────────────────────────────────────────

const selectedId  = ref('c1')
const search      = ref('')
const compose     = ref('')
const threadRef   = ref<InstanceType<typeof import('~/components/ai/ConversationThread.vue').default>>()

const selected = computed(
  () => conversations.value.find(c => c.id === selectedId.value)!,
)

const filteredConversations = computed(() => {
  if (!search.value.trim()) return conversations.value
  const q = search.value.toLowerCase()
  return conversations.value.filter(c => c.name.toLowerCase().includes(q))
})

function selectConversation(id: string) {
  selectedId.value = id
  _select(id)
}

function sendMessage() {
  if (!compose.value.trim()) return
  _send(selectedId.value, compose.value.trim())
  compose.value = ''
  nextTick(() => threadRef.value?.scrollToBottom())
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

type MessageGroup = { dateLabel: string; messages: typeof selected.value.messages }
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

onMounted(() => nextTick(() => threadRef.value?.scrollToBottom('instant')))
watch(() => selected.value?.messages.length, () => {
  nextTick(() => threadRef.value?.scrollToBottom())
})
</script>

<template>
  <div class="flex-1 flex overflow-hidden min-h-0">

    <!-- ══ Left — conversation list ══════════════════════════════════════ -->
    <aside class="w-64 sm:w-72 md:w-80 flex flex-col bg-background border-r border-border shrink-0 min-w-0">

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
        <h2 class="text-base font-bold text-foreground">Messages</h2>
        <Button variant="ghost" size="icon">
          <MoreHorizontal class="w-4 h-4" />
        </Button>
      </div>

      <!-- Search -->
      <div class="px-4 py-3 border-b border-border shrink-0">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input v-model="search" type="text" placeholder="Search messages..." class="pl-9" />
        </div>
      </div>

      <!-- Conversation list -->
      <div class="flex-1 overflow-y-auto">
        <button
          v-for="conv in filteredConversations"
          :key="conv.id"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-border/50',
            selectedId === conv.id ? 'bg-primary/10' : 'hover:bg-accent',
          ]"
          @click="selectConversation(conv.id)"
        >
          <!-- Avatar + online dot -->
          <div class="relative shrink-0">
            <Avatar class="size-10">
              <AvatarImage :src="avatarUrl(conv.name)" :alt="conv.name" />
              <AvatarFallback :class="[conv.avatarBg, conv.avatarText, 'text-sm font-bold']">{{ conv.initials }}</AvatarFallback>
            </Avatar>
            <span :class="['absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background', conv.online ? 'bg-green-500' : 'bg-muted-foreground/30']" />
          </div>

          <!-- Name + preview -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <p :class="['text-sm font-semibold truncate', selectedId === conv.id ? 'text-primary' : 'text-foreground']">
                {{ conv.name }}
              </p>
              <span class="text-[11px] text-muted-foreground shrink-0">{{ fmtTime(conv.lastTime) }}</span>
            </div>
            <div class="flex items-center justify-between gap-2 mt-0.5">
              <p class="text-xs text-muted-foreground truncate">{{ conv.lastMessage }}</p>
              <Badge v-if="conv.unread > 0" class="shrink-0 min-w-4 h-4 px-1 text-[10px] font-bold">{{ conv.unread }}</Badge>
            </div>
          </div>
        </button>

        <!-- Empty search state -->
        <AiConversationEmptyState
          v-if="filteredConversations.length === 0"
          title="No conversations found"
          description="Try a different search term."
        >
          <template #icon><Search class="w-5 h-5 text-muted-foreground" /></template>
        </AiConversationEmptyState>
      </div>
    </aside>

    <!-- ══ Right — active conversation ══════════════════════════════════ -->
    <main class="flex-1 flex flex-col min-w-0 bg-background">

      <!-- Chat header -->
      <header class="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border bg-background">
        <div class="flex items-center gap-3">
          <div class="relative">
            <Avatar class="size-9">
              <AvatarImage :src="avatarUrl(selected.name)" :alt="selected.name" />
              <AvatarFallback :class="[selected.avatarBg, selected.avatarText, 'text-sm font-bold']">{{ selected.initials }}</AvatarFallback>
            </Avatar>
            <span :class="['absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background', selected.online ? 'bg-green-500' : 'bg-muted-foreground/30']" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground leading-tight">{{ selected.name }}</p>
            <p :class="['text-xs leading-tight', selected.online ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground']">
              {{ selected.online ? 'Online' : 'Offline' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="Voice call" class="hover:text-primary hover:bg-primary/10">
            <Phone class="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Video call" class="hover:text-primary hover:bg-primary/10">
            <Video class="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" title="More options">
            <MoreHorizontal class="w-4 h-4" />
          </Button>
        </div>
      </header>

      <!-- Messages area -->
      <AiConversationThread ref="threadRef" class="px-5 py-4 space-y-6 bg-muted/20">
        <AiConversationEmptyState v-if="!groupedMessages.length" title="Start the conversation" description="Send a message to begin." />

        <template v-for="group in groupedMessages" :key="group.dateLabel">
          <!-- Date separator -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-px bg-border" />
            <span class="text-xs text-muted-foreground font-medium px-2">{{ group.dateLabel }}</span>
            <div class="flex-1 h-px bg-border" />
          </div>

          <div class="space-y-2">
            <div v-for="msg in group.messages" :key="msg.id" :class="['flex gap-2.5', msg.from === 'me' ? 'flex-row-reverse' : '']">
              <Avatar v-if="msg.from === 'other'" class="size-8 shrink-0 self-end">
                <AvatarImage :src="avatarUrl(selected.name)" :alt="selected.name" />
                <AvatarFallback :class="[selected.avatarBg, selected.avatarText, 'text-xs font-bold']">{{ selected.initials }}</AvatarFallback>
              </Avatar>

              <div :class="['flex flex-col gap-1 max-w-[70%]', msg.from === 'me' ? 'items-end' : 'items-start']">
                <div :class="['px-4 py-2.5 rounded-2xl text-sm leading-relaxed', msg.from === 'me' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card text-foreground border border-border rounded-bl-sm shadow-sm']">
                  {{ msg.text }}
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[11px] text-muted-foreground">{{ fmtMsgTime(msg.timestamp) }}</span>
                  <template v-if="msg.from === 'me'">
                    <CheckCheck v-if="msg.status === 'read'" class="w-3.5 h-3.5 text-primary/60" />
                    <CheckCheck v-else-if="msg.status === 'delivered'" class="w-3.5 h-3.5 text-muted-foreground" />
                    <Check v-else class="w-3.5 h-3.5 text-muted-foreground/40" />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>
      </AiConversationThread>

      <!-- Compose bar -->
      <footer class="shrink-0 px-5 py-3.5 border-t border-border bg-background">
        <div class="flex items-center gap-3 bg-muted border border-border rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
          <button class="text-muted-foreground hover:text-foreground transition-colors shrink-0" title="Attach file">
            <Paperclip class="w-4.5 h-4.5" />
          </button>

          <input
            v-model="compose"
            type="text"
            placeholder="Type a message..."
            class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            @keydown.enter="sendMessage"
          />

          <button class="text-muted-foreground hover:text-foreground transition-colors shrink-0" title="Emoji">
            <Smile class="w-4.5 h-4.5" />
          </button>

          <button
            :class="['w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0', compose.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted-foreground/20 text-muted-foreground cursor-default']"
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
