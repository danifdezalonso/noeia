<script setup lang="ts">
import { useTransition, TransitionPresets } from '@vueuse/core'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

definePageMeta({ layout: 'dashboard' })

const { persona } = usePersona()

// ── Count-up animation ─────────────────────────────────────────────────────

const transitionOpts = { duration: 1500, transition: TransitionPresets.easeOutExpo }

const rawDoctors   = ref(0)
const rawPatients  = ref(0)
const rawRevenue   = ref(0)
const rawSessions  = ref(0)

const aDoctors   = useTransition(rawDoctors,   transitionOpts)
const aPatients  = useTransition(rawPatients,  transitionOpts)
const aRevenue   = useTransition(rawRevenue,   transitionOpts)
const aSessions  = useTransition(rawSessions,  transitionOpts)

onMounted(() => {
  rawDoctors.value   = 8
  rawPatients.value  = 142
  rawRevenue.value   = 18450
  rawSessions.value  = 34
})

const metricCards = computed(() => [
  { label: 'Active Doctors',      display: String(Math.round(aDoctors.value)),   sub: '2 on leave',          color: 'indigo' },
  { label: 'Total Patients',      display: String(Math.round(aPatients.value)),  sub: '+12 this month',      color: 'violet' },
  { label: 'Monthly Revenue',     display: `$${Math.round(aRevenue.value).toLocaleString()}`, sub: '+8% vs last month', color: 'amber' },
  { label: 'Sessions This Week',  display: String(Math.round(aSessions.value)),  sub: '6 remaining today',   color: 'emerald' },
])

// ── Sessions chart ─────────────────────────────────────────────────────────

const sessionsChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    { label: 'Completed', data: [18, 22, 16, 14, 0],  backgroundColor: '#6366f1', borderRadius: 6, borderSkipped: false },
    { label: 'Scheduled', data: [0,  0,  0,  8,  12], backgroundColor: '#e0e7ff', borderRadius: 6, borderSkipped: false },
  ],
}

const sessionsChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top' as const, align: 'end' as const, labels: { boxWidth: 8, boxHeight: 8, borderRadius: 2, font: { size: 11 }, color: '#94a3b8', padding: 16, usePointStyle: true, pointStyle: 'circle' } },
    tooltip: { backgroundColor: '#1e293b', titleFont: { size: 11, weight: 'normal' as const }, bodyFont: { size: 12, weight: 'bold' as const }, padding: 10, cornerRadius: 8, borderWidth: 0 },
  },
  scales: {
    x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
    y: { stacked: true, display: false },
  },
  animation: { duration: 900, easing: 'easeOutQuart' as const, delay: (ctx: any) => ctx.dataIndex * 80 },
}

// ── Doctor breakdown chart ─────────────────────────────────────────────────

const doctorChartData = {
  labels: ['Active', 'On Leave', 'Inactive'],
  datasets: [{
    data: [6, 1, 1],
    backgroundColor: ['#6366f1', '#f59e0b', '#cbd5e1'],
    hoverBackgroundColor: ['#4f46e5', '#d97706', '#94a3b8'],
    borderWidth: 0,
    hoverOffset: 6,
  }],
}

const doctorChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '74%',
  plugins: {
    legend: { position: 'right' as const, labels: { boxWidth: 8, boxHeight: 8, borderRadius: 4, font: { size: 11 }, color: '#64748b', padding: 14, usePointStyle: true, pointStyle: 'circle' } },
    tooltip: { backgroundColor: '#1e293b', titleFont: { size: 11 }, bodyFont: { size: 12, weight: 'bold' as const }, padding: 10, cornerRadius: 8 },
  },
  animation: { animateRotate: true, animateScale: true, duration: 1000, easing: 'easeOutQuart' as const },
}

// ── Recent doctors ─────────────────────────────────────────────────────────

const recentDoctors = [
  { name: 'Dr. Elena Voss',    initials: 'EV', specialty: 'CBT',            sessions: 12 },
  { name: 'Dr. Marco Silva',   initials: 'MS', specialty: 'Psychiatry',     sessions: 9  },
  { name: 'Dr. Priya Nair',    initials: 'PN', specialty: 'Trauma Therapy', sessions: 7  },
  { name: 'Dr. James Okafor',  initials: 'JO', specialty: 'Group Therapy',  sessions: 6  },
]

const activity = [
  { text: 'Dr. Voss completed 4 sessions today',       time: '1 hour ago'      },
  { text: 'Invoice #ORG-042 paid — $1,250',            time: '2 hours ago'     },
  { text: 'New patient registered: A. Martín',         time: '3 hours ago'     },
  { text: 'Dr. Silva added to Room 3 schedule',        time: 'Yesterday, 5pm'  },
]

const accentMap: Record<string, { dot: string; value: string }> = {
  indigo:  { dot: 'bg-indigo-500',  value: 'text-indigo-600'  },
  violet:  { dot: 'bg-violet-500',  value: 'text-violet-600'  },
  amber:   { dot: 'bg-amber-500',   value: 'text-amber-600'   },
  emerald: { dot: 'bg-emerald-500', value: 'text-emerald-600' },
}
function getAccent(color: string) { return accentMap[color] ?? { dot: 'bg-slate-400', value: 'text-slate-600' } }
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
  <div class="p-4 sm:p-6 space-y-6">

    <!-- Page header -->
    <div class="appear" style="--delay: 0ms">
      <h1 class="text-xl font-semibold text-slate-900 dark:text-white">
        Good morning, {{ persona.orgName || persona.name }}
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Here's your clinic overview for today.</p>
    </div>

    <!-- Metric cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="(card, i) in metricCards"
        :key="card.label"
        class="appear bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4"
        :style="{ '--delay': `${i * 70 + 60}ms` }"
      >
        <div class="flex items-center gap-1.5 mb-2">
          <span class="w-1.5 h-1.5 rounded-full" :class="getAccent(card.color).dot" />
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">{{ card.label }}</p>
        </div>
        <p class="text-3xl font-bold text-slate-900 dark:text-white tabular-nums" :class="getAccent(card.color).value">
          {{ card.display }}
        </p>
        <p class="text-xs text-slate-400 mt-1.5">{{ card.sub }}</p>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <!-- Sessions bar -->
      <div class="appear lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5" style="--delay: 360ms">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100">Sessions This Week</h2>
          <span class="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">70 total</span>
        </div>
        <p class="text-xs text-slate-400 mb-4">All doctors · Mon – Fri</p>
        <ClientOnly>
          <div class="h-44">
            <Bar :data="sessionsChartData" :options="sessionsChartOptions" />
          </div>
          <template #fallback>
            <div class="h-44 flex items-end gap-2 px-4 animate-pulse">
              <div v-for="(h, i) in [70, 90, 60, 80, 40]" :key="i" class="flex-1 bg-slate-100 rounded-t-md" :style="{ height: `${h}%` }" />
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Doctor breakdown doughnut -->
      <div class="appear lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5" style="--delay: 440ms">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100">Doctor Status</h2>
          <span class="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">8 total</span>
        </div>
        <p class="text-xs text-slate-400 mb-4">Active · On Leave · Inactive</p>
        <ClientOnly>
          <div class="relative h-44">
            <Doughnut :data="doctorChartData" :options="doctorChartOptions" />
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none" style="right: 30%">
              <div class="text-center">
                <p class="text-2xl font-bold text-slate-900 dark:text-white">8</p>
                <p class="text-[10px] text-slate-400 leading-tight">doctors</p>
              </div>
            </div>
          </div>
          <template #fallback>
            <div class="h-44 flex items-center justify-center animate-pulse">
              <div class="w-32 h-32 rounded-full border-[18px] border-slate-100" />
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Two-column content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Top doctors today -->
      <div class="appear bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4" style="--delay: 520ms">
        <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Top Doctors Today</h2>
        <div class="space-y-1">
          <div
            v-for="(d, i) in recentDoctors"
            :key="d.name"
            class="session-row flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            :style="{ '--i': i }"
          >
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span class="text-indigo-700 text-xs font-bold">{{ d.initials }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{{ d.name }}</p>
              <p class="text-xs text-slate-400">{{ d.specialty }}</p>
            </div>
            <span class="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {{ d.sessions }} sessions
            </span>
          </div>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="appear bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4" style="--delay: 600ms">
        <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Recent Activity</h2>
        <div class="space-y-3">
          <div
            v-for="(a, i) in activity"
            :key="a.text"
            class="activity-row flex items-start gap-3"
            :style="{ '--i': i }"
          >
            <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
            <div>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ a.text }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ a.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  </div>
</template>

<style scoped>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.appear {
  animation: fadeUp 0.5s ease-out both;
  animation-delay: var(--delay, 0ms);
}
@keyframes slideInRow {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
.session-row {
  animation: slideInRow 0.4s ease-out both;
  animation-delay: calc(600ms + var(--i, 0) * 70ms);
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.activity-row {
  animation: fadeIn 0.4s ease-out both;
  animation-delay: calc(680ms + var(--i, 0) * 70ms);
}
</style>
