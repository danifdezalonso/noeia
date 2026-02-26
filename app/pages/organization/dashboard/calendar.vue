<script setup lang="ts">
import { ChevronLeft, ChevronRight, Plus, Settings2 } from 'lucide-vue-next'
import { addDays, startOfWeek } from 'date-fns'
import type { CalendarEvent } from '~/composables/useCalendar'
import { Button } from '~/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'

definePageMeta({ layout: 'dashboard' })

const cal = useCalendar()
const { viewMode, currentTitle, openCreate, events, initEvents } = cal
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

function pad(n: number) { return String(n).padStart(2, '0') }
function toLocalIso(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}
function createNew() {
  const start = new Date(); start.setMinutes(0, 0, 0)
  if (start.getHours() < 8) start.setHours(9)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  openCreate(toLocalIso(start), toLocalIso(end))
}

const settingsOpen       = ref(false)
const settingsTriggerRef = ref<HTMLElement>()
function toggleSettings() { settingsOpen.value = !settingsOpen.value }
function closeSettings()   { settingsOpen.value = false }
function handleOutsideClick(e: MouseEvent) {
  if (settingsOpen.value && settingsTriggerRef.value && !settingsTriggerRef.value.contains(e.target as Node))
    settingsOpen.value = false
}
onMounted(() => { document.addEventListener('click', handleOutsideClick) })
onBeforeUnmount(() => { document.removeEventListener('click', handleOutsideClick) })

// ── Doctor filter chips ───────────────────────────────────────────────────────

const DOCTOR_COLORS: Record<string, { chip: string; active: string; hex: string }> = {
  d1: { chip: 'bg-primary/10 text-primary border-primary/20',      active: 'bg-primary text-primary-foreground border-primary', hex: '#E83D59' },
  d2: { chip: 'bg-sky-100 text-sky-700 border-sky-200',            active: 'bg-sky-600 text-white border-sky-600',         hex: '#0ea5e9' },
  d3: { chip: 'bg-green-100 text-green-700 border-green-200',      active: 'bg-green-600 text-white border-green-600',     hex: '#22c55e' },
  d4: { chip: 'bg-amber-100 text-amber-700 border-amber-200',      active: 'bg-amber-500 text-white border-amber-500',     hex: '#f59e0b' },
  d5: { chip: 'bg-red-100 text-red-700 border-red-200',            active: 'bg-red-600 text-white border-red-600',         hex: '#ef4444' },
  d6: { chip: 'bg-violet-100 text-violet-700 border-violet-200',   active: 'bg-violet-600 text-white border-violet-600',   hex: '#8b5cf6' },
  d7: { chip: 'bg-teal-100 text-teal-700 border-teal-200',         active: 'bg-teal-600 text-white border-teal-600',       hex: '#14b8a6' },
}

const orgDoctors = [
  { id: 'd1', name: 'Dr. Elena Voss'   },
  { id: 'd2', name: 'Dr. Marco Silva'  },
  { id: 'd3', name: 'Dr. Priya Nair'   },
  { id: 'd4', name: 'Dr. James Okafor' },
  { id: 'd5', name: 'Dr. Sofia Reyes'  },
  { id: 'd6', name: 'Dr. Lena Brandt'  },
  { id: 'd7', name: 'Dr. Aarav Patel'  },
]

const activeDoctors = ref(new Set<string>())

function toggleDoctorFilter(id: string) {
  const s = new Set(activeDoctors.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  activeDoctors.value = s
}

const coloredEvents = computed<CalendarEvent[]>(() =>
  events.value.map(e => ({
    ...e,
    color: e.doctorId ? (DOCTOR_COLORS[e.doctorId]?.hex ?? e.color) : e.color,
  }))
)

const filteredEvents = computed<CalendarEvent[]>(() => {
  if (activeDoctors.value.size === 0) return coloredEvents.value
  return coloredEvents.value.filter(e => !e.doctorId || activeDoctors.value.has(e.doctorId))
})
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 min-h-0">

    <!-- Toolbar -->
    <header class="shrink-0 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">

      <!-- Row 1 -->
      <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
        <div class="flex items-center gap-1.5">
          <Button variant="outline" class="rounded-2xl mr-1" @click="createNew">
            <Plus class="w-4 h-4" /> New
          </Button>
          <Button variant="outline" size="sm" @click="calendarViewRef?.today()">Today</Button>
          <Button variant="ghost" size="icon" class="rounded-full" @click="calendarViewRef?.prev()">
            <ChevronLeft class="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" class="rounded-full" @click="calendarViewRef?.next()">
            <ChevronRight class="w-5 h-5" />
          </Button>
          <h2 class="text-base font-normal text-gray-800 dark:text-slate-100 ml-1 select-none whitespace-nowrap">{{ currentTitle || '…' }}</h2>
        </div>
        <div ref="settingsTriggerRef" class="relative">
          <Button
            variant="ghost"
            size="icon"
            class="rounded-full"
            :class="settingsOpen ? 'bg-primary/10 text-primary' : ''"
            title="Calendar settings"
            @click.stop="toggleSettings"
          >
            <Settings2 class="w-4.5 h-4.5" />
          </Button>
          <CalendarSettings :open="settingsOpen" @close="closeSettings" />
        </div>
      </div>

      <!-- Row 2: doctor filter chips + view switcher -->
      <div class="flex flex-wrap items-center justify-between px-4 pb-2 gap-x-3 gap-y-2">
        <!-- Doctor filter chips -->
        <div class="flex items-center gap-1.5 flex-wrap min-w-0">
          <span class="text-xs text-gray-400 font-medium shrink-0 mr-0.5">Doctors:</span>
          <button
            v-for="d in orgDoctors"
            :key="d.id"
            @click="toggleDoctorFilter(d.id)"
            class="px-2.5 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap"
            :class="
              activeDoctors.has(d.id)
                ? DOCTOR_COLORS[d.id]?.active
                : activeDoctors.size === 0
                  ? DOCTOR_COLORS[d.id]?.chip
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-50'
            "
          >
            {{ d.name.replace('Dr. ', '') }}
          </button>
          <button
            v-if="activeDoctors.size > 0"
            @click="activeDoctors = new Set()"
            class="px-2 py-1 rounded-full text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            Clear
          </button>
        </div>

        <!-- View switcher -->
        <ToggleGroup
          type="single"
          :model-value="viewMode"
          variant="outline"
          class="shrink-0"
          @update:model-value="(v) => v && handleChangeView(v)"
        >
          <ToggleGroupItem
            v-for="v in views" :key="v.key"
            :value="v.key"
            class="px-3.5 py-1 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {{ v.label }}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </header>

    <!-- Calendar body -->
    <div class="flex-1 min-h-0 relative">
      <ClientOnly>
        <CalendarView ref="calendarViewRef" class="absolute inset-0" :events="filteredEvents" />
        <template #fallback>
          <div class="absolute inset-0 flex animate-pulse">
            <div class="w-14 shrink-0 pt-14 space-y-[47px] pr-2 border-r border-gray-200 dark:border-slate-700">
              <div v-for="i in 8" :key="i" class="h-2.5 bg-gray-100 dark:bg-slate-700 rounded ml-2" />
            </div>
            <div class="flex-1 flex flex-col">
              <div class="grid grid-cols-5 h-14 border-b border-gray-200 dark:border-slate-700">
                <div v-for="i in 5" :key="i" class="flex flex-col items-center justify-center gap-1.5 border-r last:border-r-0 border-gray-200">
                  <div class="h-2 w-6 bg-gray-100 rounded" /><div class="h-7 w-7 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <QuickEventModal />
    <EventModal />
    <EventContextMenu />
  </div>
</template>
