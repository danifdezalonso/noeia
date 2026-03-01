<script setup lang="ts">
import {
  Edit3, ChevronUp, ChevronDown, X, Send, Minus,
} from 'lucide-vue-next'
import { format, isToday, isYesterday } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Input } from '~/components/ui/input'

const { conversations, selectConversation, sendMessage: _send } = useMessages()
const { persona } = usePersona()

// ── Hub state ─────────────────────────────────────────────────────────────
const hubOpen    = ref(false)
const listSearch = ref('')

const filteredConvs = computed(() => {
  const q = listSearch.value.trim().toLowerCase()
  if (!q) return conversations.value
  return conversations.value.filter(c => c.name.toLowerCase().includes(q))
})

const totalUnread = computed(() =>
  conversations.value.reduce((sum, c) => sum + c.unread, 0)
)

// ── Chat panels ────────────────────────────────────────────────────────────
interface ChatPanel { convId: string; compose: string; minimized: boolean }
const chatPanels = ref<ChatPanel[]>([])
const MAX_PANELS = 3

// Scroll refs: map convId → panel messages div
const scrollEls = ref<Record<string, HTMLElement>>({})

function setScrollEl(convId: string, el: HTMLElement | null) {
  if (el) scrollEls.value[convId] = el
  else delete scrollEls.value[convId]
}

function scrollPanel(convId: string) {
  const el = scrollEls.value[convId]
  if (el) el.scrollTop = el.scrollHeight
}

// Merged panels with their conversation data (for template)
// Keep `panel` as original reactive reference so v-model on panel.compose works
const panelsWithConvs = computed(() =>
  chatPanels.value
    .map((panel, index) => ({
      panel,
      index,
      conv: conversations.value.find(c => c.id === panel.convId) ?? null,
    }))
    .filter((p): p is typeof p & { conv: NonNullable<typeof p['conv']> } => p.conv !== null)
)

// ── Layout constants ───────────────────────────────────────────────────────
// Hub sits at right: 56px (NoeiaSidebar ribbon width)
// Each chat panel opens to the left of the hub
const HUB_RIGHT   = 56
const HUB_WIDTH   = 288
const PANEL_WIDTH = 260
const PANEL_GAP   = 8

function panelRight(index: number): string {
  return `${HUB_RIGHT + HUB_WIDTH + PANEL_GAP + index * (PANEL_WIDTH + PANEL_GAP)}px`
}

// ── Actions ───────────────────────────────────────────────────────────────
function toggleHub() {
  hubOpen.value = !hubOpen.value
}

function openChat(convId: string) {
  // If already open, just unminimize
  const existing = chatPanels.value.find(p => p.convId === convId)
  if (existing) {
    existing.minimized = false
    nextTick(() => scrollPanel(convId))
    return
  }
  // Limit to MAX_PANELS (drop oldest)
  if (chatPanels.value.length >= MAX_PANELS) chatPanels.value.shift()
  chatPanels.value.push({ convId, compose: '', minimized: false })
  selectConversation(convId)
  nextTick(() => scrollPanel(convId))
}

function closePanel(convId: string) {
  chatPanels.value = chatPanels.value.filter(p => p.convId !== convId)
}

function toggleMinimize(convId: string) {
  const panel = chatPanels.value.find(p => p.convId === convId)
  if (panel) {
    panel.minimized = !panel.minimized
    if (!panel.minimized) nextTick(() => scrollPanel(convId))
  }
}

function sendFromPanel(convId: string) {
  const panel = chatPanels.value.find(p => p.convId === convId)
  if (!panel || !panel.compose.trim()) return
  _send(convId, panel.compose.trim())
  panel.compose = ''
  nextTick(() => scrollPanel(convId))
}

function goToMessages() {
  const path = `/${persona.value.role}/dashboard/messages`
  navigateTo(path)
  hubOpen.value = false
}

function fmtTime(d: Date) {
  if (isToday(d))     return format(d, 'HH:mm')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}
</script>

<template>
  <!-- ── Hub ──────────────────────────────────────────────────────────────── -->
  <div
    class="fixed bottom-0 z-50 flex flex-col pointer-events-none"
    :style="{ right: `${HUB_RIGHT}px`, width: `${HUB_WIDTH}px` }"
  >
    <!-- Expanded list panel -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="hubOpen"
        class="pointer-events-auto bg-background border border-b-0 border-border rounded-t-xl shadow-xl flex flex-col overflow-hidden"
        style="max-height: 440px;"
      >
        <!-- Search -->
        <div class="px-3 py-2 border-b border-border shrink-0">
          <Input
            v-model="listSearch"
            placeholder="Search conversations…"
            class="h-8 text-sm"
          />
        </div>

        <!-- Conversation list -->
        <div class="flex-1 overflow-y-auto">
          <button
            v-for="conv in filteredConvs"
            :key="conv.id"
            class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left border-b border-border/40"
            @click="openChat(conv.id)"
          >
            <div class="relative shrink-0">
              <Avatar class="size-9">
                <AvatarImage :src="avatarUrl(conv.name)" :alt="conv.name" />
                <AvatarFallback :class="[conv.avatarBg, conv.avatarText, 'text-xs font-bold']">{{ conv.initials }}</AvatarFallback>
              </Avatar>
              <span :class="['absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-background', conv.online ? 'bg-green-500' : 'bg-muted-foreground/30']" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <p class="text-sm font-semibold truncate text-foreground">{{ conv.name }}</p>
                <span class="text-[10px] text-muted-foreground shrink-0">{{ fmtTime(conv.lastTime) }}</span>
              </div>
              <div class="flex items-center justify-between gap-1 mt-0.5">
                <p class="text-xs text-muted-foreground truncate">{{ conv.lastMessage }}</p>
                <span v-if="conv.unread > 0" class="shrink-0 min-w-[16px] h-4 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {{ conv.unread }}
                </span>
              </div>
            </div>
          </button>

          <div v-if="filteredConvs.length === 0" class="py-8 text-center text-xs text-muted-foreground">
            No conversations found
          </div>
        </div>

        <!-- Footer -->
        <div class="shrink-0 border-t border-border px-3 py-2 text-center">
          <button class="text-xs text-primary hover:underline font-medium" @click="goToMessages">
            Open Messages →
          </button>
        </div>
      </div>
    </Transition>

    <!-- Hub header bar -->
    <div
      class="pointer-events-auto bg-background border border-border rounded-t-xl flex items-center gap-2 px-3 h-12 shadow-lg select-none cursor-pointer"
      @click="toggleHub"
    >
      <Avatar class="size-7 shrink-0">
        <AvatarImage :src="avatarUrl(persona.name)" :alt="persona.name" />
        <AvatarFallback class="bg-primary text-primary-foreground text-xs font-bold">
          {{ persona.avatarInitials }}
        </AvatarFallback>
      </Avatar>

      <span class="flex-1 text-sm font-semibold text-foreground truncate">Messaging</span>

      <span v-if="totalUnread > 0" class="min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
        {{ totalUnread }}
      </span>

      <button class="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0" @click.stop>
        <Edit3 class="w-3.5 h-3.5" />
      </button>

      <button class="p-1 rounded text-muted-foreground hover:text-foreground transition-colors shrink-0" @click.stop="toggleHub">
        <ChevronDown v-if="hubOpen" class="w-3.5 h-3.5" />
        <ChevronUp v-else class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>

  <!-- ── Chat panels (one per open conversation) ───────────────────────── -->
  <div
    v-for="item in panelsWithConvs"
    :key="item.panel.convId"
    class="fixed bottom-0 z-50 flex flex-col pointer-events-auto"
    :style="{ right: panelRight(item.index), width: `${PANEL_WIDTH}px` }"
  >
    <!-- Panel header bar -->
    <div
      class="bg-background border border-border rounded-t-xl flex items-center gap-2 px-3 h-11 shadow-lg select-none cursor-pointer"
      @click="toggleMinimize(item.panel.convId)"
    >
      <div class="relative shrink-0">
        <Avatar class="size-6">
          <AvatarImage :src="avatarUrl(item.conv.name)" :alt="item.conv.name" />
          <AvatarFallback :class="[item.conv.avatarBg, item.conv.avatarText, 'text-[10px] font-bold']">{{ item.conv.initials }}</AvatarFallback>
        </Avatar>
        <span :class="['absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full border border-background', item.conv.online ? 'bg-green-500' : 'bg-muted-foreground/30']" />
      </div>

      <span class="flex-1 text-xs font-semibold text-foreground truncate">{{ item.conv.name }}</span>

      <span v-if="item.conv.unread > 0" class="min-w-[14px] h-3.5 px-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
        {{ item.conv.unread }}
      </span>

      <button class="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0" @click.stop="toggleMinimize(item.panel.convId)">
        <Minus class="w-3 h-3" />
      </button>
      <button class="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0" @click.stop="closePanel(item.panel.convId)">
        <X class="w-3 h-3" />
      </button>
    </div>

    <!-- Panel body (hidden when minimized) -->
    <div
      v-if="!item.panel.minimized"
      class="bg-background border border-b-0 border-t-0 border-border flex flex-col overflow-hidden shadow-xl"
      style="height: 360px;"
    >
      <!-- Messages -->
      <div
        :ref="(el) => setScrollEl(item.panel.convId, el as HTMLElement | null)"
        class="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0"
      >
        <div
          v-for="msg in item.conv.messages"
          :key="msg.id"
          :class="['flex', msg.from === 'me' ? 'justify-end' : 'justify-start']"
        >
          <div :class="['max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed', msg.from === 'me' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm']">
            {{ msg.text }}
          </div>
        </div>
      </div>

      <!-- Compose -->
      <div class="shrink-0 border-t border-border px-3 py-2 flex items-center gap-2">
        <input
          v-model="item.panel.compose"
          type="text"
          placeholder="Type a message…"
          class="flex-1 text-xs bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          @keydown.enter="sendFromPanel(item.panel.convId)"
        />
        <button
          :class="['w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0', item.panel.compose.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-default']"
          :disabled="!item.panel.compose.trim()"
          @click="sendFromPanel(item.panel.convId)"
        >
          <Send class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>
