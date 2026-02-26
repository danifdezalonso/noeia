<script setup lang="ts">
import { ChevronLeft, ChevronRight, Plus, Settings2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'

definePageMeta({ layout: 'dashboard' })

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
const settingsOpen      = ref(false)
const settingsTriggerRef = ref<HTMLElement>()

function toggleSettings() { settingsOpen.value = !settingsOpen.value }
function closeSettings()   { settingsOpen.value = false }

function handleOutsideClick(e: MouseEvent) {
  if (settingsOpen.value && settingsTriggerRef.value && !settingsTriggerRef.value.contains(e.target as Node))
    settingsOpen.value = false
}

onMounted(() => { document.addEventListener('click', handleOutsideClick) })
onBeforeUnmount(() => { document.removeEventListener('click', handleOutsideClick) })
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 min-h-0">

    <!-- ══ Toolbar ══════════════════════════════════════════════════════════ -->
    <header class="shrink-0 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">

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
          <h2 class="text-base font-normal text-gray-800 dark:text-slate-100 ml-1 select-none whitespace-nowrap">
            {{ currentTitle || '…' }}
          </h2>
        </div>

        <!-- Right: settings gear -->
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
            <div class="w-14 shrink-0 pt-14 space-y-[47px] pr-2 border-r border-gray-200 dark:border-slate-700">
              <div v-for="i in 8" :key="i" class="h-2.5 bg-gray-100 dark:bg-slate-700 rounded ml-2" />
            </div>
            <div class="flex-1 flex flex-col">
              <div class="grid grid-cols-5 h-14 border-b border-gray-200 dark:border-slate-700">
                <div v-for="i in 5" :key="i" class="flex flex-col items-center justify-center gap-1.5 border-r border-gray-200 dark:border-slate-700 last:border-r-0">
                  <div class="h-2 w-6 bg-gray-100 dark:bg-slate-700 rounded" />
                  <div class="h-7 w-7 bg-gray-100 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
              <div class="flex-1 grid grid-cols-5">
                <div v-for="col in 5" :key="col" class="border-r border-gray-100 dark:border-slate-800 last:border-r-0 space-y-2 p-1.5">
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
    <EventContextMenu />
  </div>
</template>
