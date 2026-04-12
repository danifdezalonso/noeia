<script setup lang="ts">
import { ChevronLeft, ChevronRight, Plus, Settings2, Eye } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'

definePageMeta({ layout: 'dashboard' })

const route  = useRoute()
const router = useRouter()

// ── Trial welcome overlay ───────────────────────────────────────────────────
const trialOpen = ref(false)
onMounted(() => {
  if (route.query.trial === '1') trialOpen.value = true
})

const { viewMode, currentTitle, openCreate, initEvents } = useCalendar()
onMounted(initEvents)

const calendarViewRef = ref<{
  prev: () => void
  next: () => void
  today: () => void
  changeView: (view: string) => void
}>()

const views = [
  { key: 'dayGridMonth', label: 'Month'    },
  { key: 'timeGridWeek', label: 'Week'     },
  { key: 'timeGridDay',  label: 'Day'      },
  { key: 'listWeek',     label: 'Schedule' },
] as const

function handleChangeView(key: string) {
  viewMode.value = key
  calendarViewRef.value?.changeView(key)
}

// ── New event helper ───────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0') }
function toLocalIso(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}
function createNew() {
  const start = new Date()
  start.setMinutes(0, 0, 0)
  if (start.getHours() < 8) start.setHours(9)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  openCreate(toLocalIso(start), toLocalIso(end))
}

// ── Settings panel ─────────────────────────────────────────────────────────
const settingsOpen       = ref(false)
const settingsTriggerRef = ref<HTMLElement>()

function toggleSettings() {
  settingsOpen.value = !settingsOpen.value
  if (settingsOpen.value) colleaguesPanelOpen.value = false
}
function closeSettings() { settingsOpen.value = false }

// ── Colleagues panel ────────────────────────────────────────────────────────
const colleaguesPanelOpen       = ref(false)
const colleaguesTriggerRef = ref<HTMLElement>()

function toggleColleaguesPanel() {
  colleaguesPanelOpen.value = !colleaguesPanelOpen.value
  if (colleaguesPanelOpen.value) settingsOpen.value = false
}
function closeColleaguesPanel() { colleaguesPanelOpen.value = false }

function handleOutsideClick(e: MouseEvent) {
  if (settingsOpen.value && settingsTriggerRef.value && !settingsTriggerRef.value.contains(e.target as Node))
    settingsOpen.value = false
  if (colleaguesPanelOpen.value && colleaguesTriggerRef.value && !colleaguesTriggerRef.value.contains(e.target as Node))
    colleaguesPanelOpen.value = false
}

onMounted(() => { document.addEventListener('click', handleOutsideClick) })
onBeforeUnmount(() => { document.removeEventListener('click', handleOutsideClick) })
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-background min-h-0">

    <!-- ══ Toolbar ══════════════════════════════════════════════════════════ -->
    <header class="shrink-0 border-b border-border bg-background">

      <!-- Row 1: create · nav · date label · settings -->
      <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-2">

        <!-- Left: + New + navigation + date -->
        <div class="flex items-center gap-1.5">

          <!-- + New -->
          <Button variant="outline" class="rounded-2xl mr-1" @click="createNew">
            <Plus class="w-4 h-4" />
            New
          </Button>

          <!-- Today -->
          <Button variant="outline" size="sm" @click="calendarViewRef?.today()">
            Today
          </Button>

          <!-- Prev / Next -->
          <Button variant="ghost" size="icon" class="rounded-full" @click="calendarViewRef?.prev()">
            <ChevronLeft class="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" class="rounded-full" @click="calendarViewRef?.next()">
            <ChevronRight class="w-5 h-5" />
          </Button>

          <!-- Date label -->
          <h2 class="text-base font-normal text-foreground ml-1 select-none whitespace-nowrap">
            {{ currentTitle || '…' }}
          </h2>
        </div>

        <!-- Right: colleagues + settings -->
        <div class="flex items-center gap-1">

          <!-- Colleagues panel -->
          <div ref="colleaguesTriggerRef" class="relative">
            <Button
              variant="ghost"
              size="icon"
              class="rounded-full"
              :class="colleaguesPanelOpen ? 'bg-primary/10 text-primary' : ''"
              title="View colleagues' calendars"
              @click.stop="toggleColleaguesPanel"
            >
              <Eye class="w-4 h-4" />
            </Button>
            <ColleagueCalendarsPanel :open="colleaguesPanelOpen" @close="closeColleaguesPanel" />
          </div>

          <!-- Settings gear -->
          <div ref="settingsTriggerRef" class="relative">
            <Button
              variant="ghost"
              size="icon"
              class="rounded-full"
              :class="settingsOpen ? 'bg-primary/10 text-primary' : ''"
              title="Calendar settings"
              @click.stop="toggleSettings"
            >
              <Settings2 class="w-4 h-4" />
            </Button>
            <CalendarSettings :open="settingsOpen" @close="closeSettings" />
          </div>

        </div>
      </div>

      <!-- Row 2: view switcher -->
      <div class="flex items-center justify-end px-4 pb-2">
        <ToggleGroup
          type="single"
          :model-value="viewMode"
          variant="outline"
          class="h-8"
          @update:model-value="(v) => v && handleChangeView(v)"
        >
          <ToggleGroupItem
            v-for="v in views"
            :key="v.key"
            :value="v.key"
            class="text-sm px-3.5 py-1 h-8 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {{ v.label }}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </header>

    <!-- ══ Calendar body ══════════════════════════════════════════════════ -->
    <div class="flex-1 min-h-0 relative">
      <ClientOnly>
        <!-- Wrapper fills the parent absolutely so ClientOnly's own div doesn't break flex -->
        <CalendarView ref="calendarViewRef" class="absolute inset-0" />

        <template #fallback>
          <div class="absolute inset-0 flex animate-pulse">
            <div class="w-14 shrink-0 pt-14 space-y-[47px] pr-2 border-r border-border">
              <div v-for="i in 8" :key="i" class="h-2.5 bg-muted rounded ml-2" />
            </div>
            <div class="flex-1 flex flex-col">
              <div class="grid grid-cols-5 h-14 border-b border-border">
                <div v-for="i in 5" :key="i" class="flex flex-col items-center justify-center gap-1.5 border-r border-border last:border-r-0">
                  <div class="h-2 w-6 bg-muted rounded" />
                  <div class="h-7 w-7 bg-muted rounded-full" />
                </div>
              </div>
              <div class="flex-1 grid grid-cols-5">
                <div v-for="col in 5" :key="col" class="border-r border-border last:border-r-0 space-y-2 p-1.5">
                  <div v-if="col === 2" class="h-14 rounded-md bg-primary/10" />
                  <div v-if="col === 4" class="h-10 rounded-md bg-emerald-100 dark:bg-emerald-900/50" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Modals & overlays (teleported to body, order doesn't matter) -->
    <QuickEventModal />
    <EventModal />
    <EventViewPopover />
    <EventContextMenu />
  </div>

  <!-- ══ Trial welcome overlay ══════════════════════════════════════════════ -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="trialOpen"
        class="fixed inset-0 flex items-center justify-center"
        style="z-index: 9000;"
      >
        <!-- Full-page blur backdrop -->
        <div
          class="absolute inset-0"
          style="backdrop-filter: blur(10px) brightness(0.72); background: rgba(10,5,20,0.22);"
        />

        <!-- Trial card -->
        <Transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 scale-[0.97] translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div
            v-if="trialOpen"
            class="relative"
            style="width: 480px; border-radius: 24px; background: white; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.32), 0 8px 24px rgba(0,0,0,0.14);"
          >
            <div style="padding: 44px 44px 36px;">

              <!-- Gift icon -->
              <div class="flex justify-center mb-6">
                <div style="width: 56px; height: 56px; border-radius: 16px; background: rgba(232,61,89,0.08); display: flex; align-items: center; justify-content: center;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E83D59" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                  </svg>
                </div>
              </div>

              <!-- Title + subtitle -->
              <div class="text-center mb-7">
                <h2 style="font-size: 28px; font-weight: 700; color: oklch(0.12 0 0); line-height: 1.2; margin-bottom: 12px; font-family: 'Plus Jakarta Sans', system-ui; letter-spacing: -0.3px;">
                  4 days of the Clinician<br />plan, on us.
                </h2>
                <p style="font-size: 14px; color: oklch(0.55 0 0); line-height: 1.65; font-family: 'Plus Jakarta Sans', system-ui;">
                  No credit card. No commitment. After your<br />
                  trial, stay on the free plan or upgrade—your choice.
                </p>
              </div>

              <!-- Feature rows -->
              <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px;">
                <div
                  v-for="item in [
                    { icon: 'template', label: 'Custom scribe templates' },
                    { icon: 'evidence', label: 'Unlimited Evidence in sessions' },
                    { icon: 'sources',  label: 'Choose trusted evidence sources' },
                  ]"
                  :key="item.label"
                  style="display: flex; align-items: center; gap: 13px;"
                >
                  <!-- Icon container -->
                  <div style="width: 36px; height: 36px; border-radius: 10px; background: oklch(0.96 0 0); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <!-- template icon -->
                    <svg v-if="item.icon === 'template'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="oklch(0.4 0 0)" stroke-width="1.8" stroke-linecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                    </svg>
                    <!-- evidence icon -->
                    <svg v-else-if="item.icon === 'evidence'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="oklch(0.4 0 0)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                    </svg>
                    <!-- sources icon -->
                    <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="oklch(0.4 0 0)" stroke-width="1.8" stroke-linecap="round">
                      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                    </svg>
                  </div>
                  <span style="font-size: 15px; color: oklch(0.22 0 0); font-family: 'Plus Jakarta Sans', system-ui; font-weight: 500;">{{ item.label }}</span>
                </div>
              </div>

              <!-- CTA button -->
              <button
                class="w-full flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.984]"
                style="height: 52px; border-radius: 14px; background: #E83D59; color: white; font-size: 15px; font-weight: 600; font-family: 'Plus Jakarta Sans', system-ui; box-shadow: 0 6px 20px rgba(232,61,89,0.35); border: none; cursor: pointer;"
                @click="trialOpen = false; router.replace('/doctor/dashboard/calendar')"
              >
                <!-- Sparkle icon -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
                </svg>
                Start my free trial
              </button>

              <!-- Footer note -->
              <p class="text-center mt-3.5" style="font-size: 12px; color: oklch(0.65 0 0); font-family: 'Plus Jakarta Sans', system-ui;">
                We'll remind you before the trial ends.
              </p>

            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
