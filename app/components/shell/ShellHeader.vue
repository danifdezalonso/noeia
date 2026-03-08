<script setup lang="ts">
import {
  ChevronDown, Search,
  Bell, HelpCircle,
  CalendarPlus, UserPlus, ReceiptText, Stethoscope,
  LayoutDashboard, Calendar, ClipboardList, Users,
  MessageSquare, Receipt, Sparkles, ListTodo,
  Book, Play, MessageCircle as MessageCircleIcon, AlertCircle, Lightbulb,
} from 'lucide-vue-next'
import { useEventListener } from '@vueuse/core'
import { SHELL_KEY } from '~/composables/useDashboard'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '~/components/ui/dropdown-menu'
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator, CommandShortcut,
} from '~/components/ui/command'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '~/components/ui/dialog'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'

const shell = inject(SHELL_KEY)!
const { persona } = usePersona()
const { open: noeOpen } = useNoeia()

const commandOpen  = ref(false)
const helpOpen     = ref(false)
const feedbackOpen = ref(false)
const feedbackTab  = ref<'issue' | 'idea'>('issue')
const feedbackText = ref('')
const feedbackEmail = ref('')
const { sessionModalOpen, patientModalOpen, billModalOpen, doctorModalOpen } = useGlobalModals()

function submitFeedback() {
  if (!feedbackText.value.trim()) return
  feedbackText.value  = ''
  feedbackEmail.value = ''
  feedbackOpen.value  = false
}

// ⌘K shortcut
useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    commandOpen.value = !commandOpen.value
  }
})

const iconMap: Record<string, Component> = {
  LayoutDashboard, Calendar, ClipboardList, Users,
  MessageSquare, Receipt, Sparkles, Stethoscope,
}

function toggleNotifications() {
  shell.notificationsOpen.value = !shell.notificationsOpen.value
}

const notifications = [
  { id: 1, type: 'session',  text: 'Session with M. García starts in 30 min', time: '28m', unread: true },
  { id: 2, type: 'bill',     text: 'Invoice #0042 was paid by R. López',       time: '2h',  unread: true },
  { id: 3, type: 'message',  text: 'A. Martín sent you a new message',          time: '3h',  unread: true },
]
</script>

<template>
  <!-- Backdrop to close dropdowns -->
  <div
    v-if="shell.notificationsOpen.value"
    class="fixed inset-0 z-30"
    @click="shell.notificationsOpen.value = false"
  />

  <header class="relative h-14 bg-sidebar border border-sidebar-border flex items-center px-3 sm:px-4 gap-2 sm:gap-3 z-50 flex-shrink-0 mx-2 mt-2 rounded-xl shadow-sm">

    <!-- ── Center: Command search trigger ── -->
    <div class="flex-1 min-w-0">
      <div class="max-w-md hidden sm:block">
        <button
          type="button"
          class="w-full flex items-center gap-2 px-3 py-1.5 bg-accent/50 border border-border rounded-full text-sm text-muted-foreground hover:bg-accent hover:border-border/80 transition-all"
          @click="commandOpen = true"
        >
          <Search class="w-4 h-4 flex-shrink-0" />
          <span class="flex-1 text-left truncate min-w-0">Search patients, sessions, navigate…</span>
          <kbd class="hidden lg:flex items-center gap-0.5 text-[10px] bg-background border border-border px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>
      </div>
    </div>

    <!-- ── Right ── -->
    <div class="flex items-center gap-1 flex-shrink-0">

      <!-- ── Split button: New session + quick-create dropdown ── -->
      <Button
        size="sm"
        class="rounded-r-none"
        @click="sessionModalOpen = true"
      >
        New session
      </Button>
      <div class="w-px self-stretch bg-primary-foreground/25 shrink-0" />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button size="sm" class="rounded-l-none px-2">
            <ChevronDown class="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-44">
            <DropdownMenuLabel class="text-xs font-normal text-muted-foreground">Quick create</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="gap-2 cursor-pointer" @click="sessionModalOpen = true">
              <CalendarPlus class="w-3.5 h-3.5 text-muted-foreground" />
              Session
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2 cursor-pointer" @click="patientModalOpen = true">
              <UserPlus class="w-3.5 h-3.5 text-muted-foreground" />
              Patient
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2 cursor-pointer" @click="billModalOpen = true">
              <ReceiptText class="w-3.5 h-3.5 text-muted-foreground" />
              Invoice
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2 cursor-pointer" @click="navigateTo('/doctor/dashboard/tasks')">
              <ListTodo class="w-3.5 h-3.5 text-muted-foreground" />
              Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      <!-- Separator -->
      <div class="w-px h-5 bg-border mx-1" />

      <!-- Notifications -->
      <div class="relative">
        <button
          type="button"
          aria-label="Notifications"
          @click.stop="toggleNotifications"
          class="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Bell class="w-4 h-4" />
          <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full ring-2 ring-background" />
        </button>

        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-1"
          leave-active-class="transition duration-75 ease-in"
          leave-to-class="opacity-0 scale-95 translate-y-1"
        >
          <div
            v-if="shell.notificationsOpen.value"
            class="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div class="flex items-center justify-between px-4 py-3 border-b border-border">
              <p class="text-sm font-semibold">Notifications</p>
              <button type="button" class="text-xs text-primary hover:text-primary/80 font-medium">
                Mark all read
              </button>
            </div>
            <div class="divide-y divide-border">
              <div
                v-for="n in notifications" :key="n.id"
                class="flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer"
              >
                <div class="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                  :class="n.unread ? 'bg-primary' : 'bg-transparent'" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm leading-snug">{{ n.text }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ n.time }} ago</p>
                </div>
              </div>
            </div>
            <div class="px-4 py-2.5 border-t border-border text-center">
              <button type="button" class="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View all notifications
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Feedback -->
      <button
        type="button"
        class="hidden md:flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
        @click="feedbackOpen = true"
      >
        Feedback
      </button>

      <!-- Help -->
      <button type="button"
        class="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="Help & resources"
        @click="helpOpen = true"
      >
        <HelpCircle class="w-4 h-4" />
      </button>

      <!-- Noeia AI button -->
      <button
        type="button"
        :class="[
          'relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200',
          noeOpen
            ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-400/40 ring-2 ring-violet-300/40'
            : 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-300/30 hover:shadow-violet-400/50 hover:scale-105',
        ]"
        title="Noeia AI"
        @click="noeOpen = !noeOpen"
      >
        <Sparkles class="w-4 h-4 text-white" />
      </button>

    </div>
  </header>

  <!-- ── Help & Resources dialog ── -->
  <Dialog v-model:open="helpOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Help & Resources</DialogTitle>
      </DialogHeader>
      <div class="space-y-3 py-2">
        <a
          href="#"
          class="flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-border hover:bg-accent transition-colors group"
        >
          <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center flex-shrink-0">
            <Book class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Getting Started</p>
            <p class="text-xs text-muted-foreground mt-0.5">Learn the basics of Noeia</p>
          </div>
        </a>
        <a
          href="#"
          class="flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-border hover:bg-accent transition-colors group"
        >
          <div class="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center flex-shrink-0">
            <Play class="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Video Tutorials</p>
            <p class="text-xs text-muted-foreground mt-0.5">Step-by-step walkthroughs</p>
          </div>
        </a>
        <a
          href="#"
          class="flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-border hover:bg-accent transition-colors group"
        >
          <div class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/60 flex items-center justify-center flex-shrink-0">
            <MessageCircleIcon class="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Community Forum</p>
            <p class="text-xs text-muted-foreground mt-0.5">Ask questions, share ideas</p>
          </div>
        </a>
      </div>
      <p class="text-center text-sm text-muted-foreground pt-2">
        Need more help? <a href="#" class="text-primary hover:underline font-medium">Contact Support</a>
      </p>
    </DialogContent>
  </Dialog>

  <!-- ── Feedback dialog ── -->
  <Dialog v-model:open="feedbackOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Share Feedback</DialogTitle>
        <DialogDescription>Help us improve the product.</DialogDescription>
      </DialogHeader>

      <!-- Tab switcher -->
      <div class="flex gap-1 bg-muted rounded-lg p-1">
        <button
          :class="['flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors', feedbackTab === 'issue' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
          @click="feedbackTab = 'issue'"
        >
          <AlertCircle class="w-3.5 h-3.5" />
          Report Issue
        </button>
        <button
          :class="['flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors', feedbackTab === 'idea' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
          @click="feedbackTab = 'idea'"
        >
          <Lightbulb class="w-3.5 h-3.5" />
          Share Idea
        </button>
      </div>

      <div class="space-y-3 py-1">
        <Textarea
          v-model="feedbackText"
          :placeholder="feedbackTab === 'issue' ? 'What went wrong? Please describe the issue…' : 'What\'s your idea? Tell us more…'"
          :rows="4"
          class="resize-none"
        />
        <div>
          <label class="text-xs font-medium text-muted-foreground mb-1.5 block">Email (optional)</label>
          <Input v-model="feedbackEmail" type="email" placeholder="you@example.com" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="feedbackOpen = false">Cancel</Button>
        <Button :disabled="!feedbackText.trim()" @click="submitFeedback">Send Feedback</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ── Command palette ── -->
  <CommandDialog v-model:open="commandOpen">
    <CommandInput placeholder="Search patients, sessions, navigate…" />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>

      <CommandGroup heading="Navigation">
        <CommandItem
          v-for="item in shell.navItems.value"
          :key="item.id"
          :value="item.label"
          @select="navigateTo(item.path); commandOpen = false"
        >
          <component :is="iconMap[item.icon]" class="w-4 h-4" />
          <span>{{ item.label }}</span>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Quick actions">
        <CommandItem value="schedule-session" @select="sessionModalOpen = true; commandOpen = false">
          <CalendarPlus class="w-4 h-4" />
          <span>Schedule session</span>
          <CommandShortcut>⌘S</CommandShortcut>
        </CommandItem>
        <CommandItem value="add-patient" @select="patientModalOpen = true; commandOpen = false">
          <UserPlus class="w-4 h-4" />
          <span>Add patient</span>
          <CommandShortcut>⌘P</CommandShortcut>
        </CommandItem>
        <CommandItem value="create-invoice" @select="billModalOpen = true; commandOpen = false">
          <ReceiptText class="w-4 h-4" />
          <span>Create invoice</span>
          <CommandShortcut>⌘B</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>
