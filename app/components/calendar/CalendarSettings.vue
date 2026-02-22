<script setup lang="ts">
import { X, EyeOff, Hash, Clock, Briefcase } from 'lucide-vue-next'

const { hideWeekends, showWeekNums, slotDuration, workStart, workEnd } = useCalendar()

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const slotOptions = [
  { value: '00:15:00', label: '15 min' },
  { value: '00:30:00', label: '30 min' },
  { value: '01:00:00', label: '1 hr'   },
]

const hourOptions = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0')
  const label = i === 0 ? '12:00 AM'
    : i < 12 ? `${i}:00 AM`
    : i === 12 ? '12:00 PM'
    : `${i - 12}:00 PM`
  return { value: `${h}:00`, label }
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0 scale-95 -translate-y-1"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 -translate-y-1"
  >
    <div
      v-if="open"
      class="absolute right-0 top-full mt-2 z-50 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
        <h3 class="text-sm font-semibold text-gray-800 dark:text-slate-100">Calendar settings</h3>
        <button
          class="p-1 rounded-md text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          @click="emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="px-4 py-3 space-y-5">

        <!-- ── Display section ──────────────────────────────────────────── -->
        <section>
          <p class="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">Display</p>
          <div class="space-y-1">

            <!-- Hide weekends -->
            <label class="flex items-center justify-between py-1.5 cursor-pointer group">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-gray-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <EyeOff class="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
                <span class="text-sm text-gray-700 dark:text-slate-200">Hide weekends</span>
              </div>
              <button
                role="switch"
                :aria-checked="hideWeekends"
                :class="[
                  'relative w-9 h-5 rounded-full transition-colors duration-200',
                  hideWeekends ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-600',
                ]"
                @click="hideWeekends = !hideWeekends"
              >
                <span
                  :class="[
                    'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                    hideWeekends ? 'translate-x-4' : 'translate-x-0',
                  ]"
                />
              </button>
            </label>

            <!-- Week numbers -->
            <label class="flex items-center justify-between py-1.5 cursor-pointer group">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-gray-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <Hash class="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
                <span class="text-sm text-gray-700 dark:text-slate-200">Show week numbers</span>
              </div>
              <button
                role="switch"
                :aria-checked="showWeekNums"
                :class="[
                  'relative w-9 h-5 rounded-full transition-colors duration-200',
                  showWeekNums ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-600',
                ]"
                @click="showWeekNums = !showWeekNums"
              >
                <span
                  :class="[
                    'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                    showWeekNums ? 'translate-x-4' : 'translate-x-0',
                  ]"
                />
              </button>
            </label>
          </div>
        </section>

        <!-- ── Time slots section ───────────────────────────────────────── -->
        <section>
          <p class="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">Time slots</p>
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-gray-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <Clock class="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
            </div>
            <div class="flex rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden flex-1">
              <button
                v-for="opt in slotOptions"
                :key="opt.value"
                :class="[
                  'flex-1 py-1.5 text-xs font-medium transition-colors border-r border-gray-200 dark:border-slate-600 last:border-r-0',
                  slotDuration === opt.value
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700',
                ]"
                @click="slotDuration = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </section>

        <!-- ── Working hours section ────────────────────────────────────── -->
        <section>
          <div class="flex items-start gap-2.5 mb-3">
            <div class="w-7 h-7 rounded-lg bg-gray-50 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <Briefcase class="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
            </div>
            <div>
              <p class="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Working hours</p>
              <p class="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 leading-snug">
                Highlighted as bookable for patients.<br>
                You can still add events outside these hours.
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1">Start</label>
              <select
                v-model="workStart"
                class="w-full text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option
                  v-for="h in hourOptions.slice(0, hourOptions.findIndex(o => o.value === workEnd) || 23)"
                  :key="h.value"
                  :value="h.value"
                >
                  {{ h.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1">End</label>
              <select
                v-model="workEnd"
                class="w-full text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option
                  v-for="h in hourOptions.slice((hourOptions.findIndex(o => o.value === workStart) || 0) + 1)"
                  :key="h.value"
                  :value="h.value"
                >
                  {{ h.label }}
                </option>
              </select>
            </div>
          </div>
        </section>

      </div>
    </div>
  </Transition>
</template>
