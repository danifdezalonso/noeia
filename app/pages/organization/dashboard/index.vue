<script setup lang="ts">
import { useTransition, TransitionPresets } from '@vueuse/core'
import { ChartBar, ChartDonut } from '~/components/ui/chart'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'

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
  { label: 'Active Doctors',      display: String(Math.round(aDoctors.value)),   sub: '2 on leave',          color: 'primary' },
  { label: 'Total Patients',      display: String(Math.round(aPatients.value)),  sub: '+12 this month',      color: 'violet' },
  { label: 'Monthly Revenue',     display: `$${Math.round(aRevenue.value).toLocaleString()}`, sub: '+8% vs last month', color: 'amber' },
  { label: 'Sessions This Week',  display: String(Math.round(aSessions.value)),  sub: '6 remaining today',   color: 'emerald' },
])

// ── Sessions chart ─────────────────────────────────────────────────────────

const sessionsLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

const sessionsData = [
  { completed: 18, scheduled: 0  },
  { completed: 22, scheduled: 0  },
  { completed: 16, scheduled: 0  },
  { completed: 14, scheduled: 8  },
  { completed: 0,  scheduled: 12 },
]

// ── Doctor breakdown chart ─────────────────────────────────────────────────

const doctorData = [
  { status: 'Active',   value: 6 },
  { status: 'On Leave', value: 1 },
  { status: 'Inactive', value: 1 },
]

const doctorColors = ['#6366f1', '#f59e0b', '#cbd5e1']

const doctorDonutData = computed(() =>
  doctorData.map((d, i) => ({ label: d.status, value: d.value, color: doctorColors[i] }))
)

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
  primary: { dot: 'bg-primary',     value: 'text-primary'     },
  violet:  { dot: 'bg-violet-500',  value: 'text-violet-600'  },
  amber:   { dot: 'bg-amber-500',   value: 'text-amber-600'   },
  emerald: { dot: 'bg-emerald-500', value: 'text-emerald-600' },
}
function getAccent(color: string) { return accentMap[color] ?? { dot: 'bg-muted-foreground', value: 'text-muted-foreground' } }
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
  <div class="p-4 sm:p-6 space-y-6">

    <!-- Page header -->
    <div class="appear" style="--delay: 0ms">
      <h1 class="text-xl font-semibold text-foreground">
        Good morning, {{ persona.orgName || persona.name }}
      </h1>
      <p class="text-sm text-muted-foreground mt-0.5">Here's your clinic overview for today.</p>
    </div>

    <!-- Metric cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="(card, i) in metricCards"
        :key="card.label"
        class="appear bg-card rounded-xl border border-border shadow-sm p-4"
        :style="{ '--delay': `${i * 70 + 60}ms` }"
      >
        <div class="flex items-center gap-1.5 mb-2">
          <span class="w-1.5 h-1.5 rounded-full" :class="getAccent(card.color).dot" />
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">{{ card.label }}</p>
        </div>
        <p class="text-3xl font-bold text-foreground tabular-nums" :class="getAccent(card.color).value">
          {{ card.display }}
        </p>
        <p class="text-xs text-muted-foreground mt-1.5">{{ card.sub }}</p>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <!-- Sessions bar -->
      <div class="appear lg:col-span-3 bg-card rounded-xl border border-border shadow-sm p-5" style="--delay: 360ms">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-sm font-semibold text-foreground">Sessions This Week</h2>
          <Badge class="text-[10px] border-transparent">70 total</Badge>
        </div>
        <p class="text-xs text-muted-foreground mb-3">All doctors · Mon – Fri</p>
        <!-- Legend -->
        <div class="flex items-center gap-4 mb-3">
          <div v-for="item in [{ label: 'Completed', color: '#6366f1' }, { label: 'Scheduled', color: '#c7d2fe' }]" :key="item.label" class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-sm" :style="{ background: item.color }" />
            <span class="text-[11px] text-muted-foreground">{{ item.label }}</span>
          </div>
        </div>
        <ChartBar
          :data="sessionsData"
          :segments="[
            { key: 'completed', color: '#6366f1', label: 'Completed' },
            { key: 'scheduled', color: '#c7d2fe', label: 'Scheduled' },
          ]"
          :x-labels="sessionsLabels"
          class="h-36 w-full"
        />
      </div>

      <!-- Doctor breakdown donut -->
      <div class="appear lg:col-span-2 bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col" style="--delay: 440ms">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-sm font-semibold text-foreground">Doctor Status</h2>
          <Badge variant="secondary" class="text-[10px] border-transparent">8 total</Badge>
        </div>
        <p class="text-xs text-muted-foreground mb-4">Active · On Leave · Inactive</p>

        <!-- Donut chart -->
        <ChartDonut
          :data="doctorDonutData"
          central-label="8"
          central-sub-label="doctors"
          class="max-h-[200px]"
        />

        <!-- Legend -->
        <div class="flex flex-col gap-1.5 mt-4">
          <div v-for="(d, i) in doctorData" :key="d.status" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ background: doctorColors[i] }" />
            <span class="text-[11px] text-muted-foreground">{{ d.status }}</span>
            <span class="text-[11px] font-semibold text-foreground ml-auto tabular-nums">{{ d.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Two-column content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Top doctors today -->
      <div class="appear bg-card rounded-xl border border-border shadow-sm p-4" style="--delay: 520ms">
        <h2 class="text-sm font-semibold text-foreground mb-3">Top Doctors Today</h2>
        <div class="space-y-1">
          <div
            v-for="(d, i) in recentDoctors"
            :key="d.name"
            class="session-row flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors"
            :style="{ '--i': i }"
          >
            <Avatar class="size-8 flex-shrink-0">
              <AvatarFallback class="bg-primary/10 text-primary text-xs font-bold">{{ d.initials }}</AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ d.name }}</p>
              <p class="text-xs text-muted-foreground">{{ d.specialty }}</p>
            </div>
            <Badge variant="secondary" class="flex-shrink-0 text-[10px] border-transparent">{{ d.sessions }} sessions</Badge>
          </div>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="appear bg-card rounded-xl border border-border shadow-sm p-4" style="--delay: 600ms">
        <h2 class="text-sm font-semibold text-foreground mb-3">Recent Activity</h2>
        <div class="space-y-3">
          <div
            v-for="(a, i) in activity"
            :key="a.text"
            class="activity-row flex items-start gap-3"
            :style="{ '--i': i }"
          >
            <div class="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
            <div>
              <p class="text-sm text-foreground">{{ a.text }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ a.time }}</p>
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
