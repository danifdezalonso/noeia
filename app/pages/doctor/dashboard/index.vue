<script setup lang="ts">
import { useTransition, TransitionPresets } from '@vueuse/core'
import { ChartBar, ChartDonut } from '~/components/ui/chart'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'

definePageMeta({ layout: 'dashboard' })

// ── Count-up animation ─────────────────────────────────────────────────────

const transitionOpts = { duration: 1500, transition: TransitionPresets.easeOutExpo }

const rawSessions = ref(0)
const rawPatients = ref(0)
const rawInvoice  = ref(0)
const rawMessages = ref(0)

const aSessions = useTransition(rawSessions, transitionOpts)
const aPatients = useTransition(rawPatients, transitionOpts)
const aInvoice  = useTransition(rawInvoice,  transitionOpts)
const aMessages = useTransition(rawMessages, transitionOpts)

onMounted(() => {
  rawSessions.value = 6
  rawPatients.value = 42
  rawInvoice.value  = 1240
  rawMessages.value = 5
})

const metricCards = computed(() => [
  { label: 'Sessions Today',   display: String(Math.round(aSessions.value)), sub: '2 remaining',   color: 'primary'  },
  { label: 'Active Patients',  display: String(Math.round(aPatients.value)), sub: '+3 this month',  color: 'violet'   },
  { label: 'Pending Invoices', display: `€${Math.round(aInvoice.value).toLocaleString()}`, sub: '4 unpaid', color: 'amber' },
  { label: 'Messages',         display: String(Math.round(aMessages.value)), sub: '2 unread',       color: 'emerald'  },
])

// ── Sessions chart ─────────────────────────────────────────────────────────

const sessionsLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

const sessionsData = [
  { completed: 5, scheduled: 0 },
  { completed: 6, scheduled: 0 },
  { completed: 4, scheduled: 0 },
  { completed: 3, scheduled: 3 },
  { completed: 0, scheduled: 3 },
]

// ── Patient breakdown chart ────────────────────────────────────────────────

const patientData = [
  { status: 'Active',   value: 28 },
  { status: 'On Hold',  value: 8  },
  { status: 'Inactive', value: 6  },
]

const patientColors = ['#6366f1', '#f59e0b', '#cbd5e1']

const patientDonutData = computed(() =>
  patientData.map((d, i) => ({ label: d.status, value: d.value, color: patientColors[i] }))
)

// ── Sessions list + activity ───────────────────────────────────────────────

const sessions = [
  { name: 'M. García',    initials: 'MG', time: '10:00 – 11:00', type: 'Online'     },
  { name: 'R. López',     initials: 'RL', time: '11:30 – 12:30', type: 'In-person'  },
  { name: 'A. Martín',    initials: 'AM', time: '16:00 – 17:00', type: 'Online'     },
  { name: 'C. Fernández', initials: 'CF', time: '17:30 – 18:30', type: 'In-person'  },
]

const activity = [
  { text: 'Invoice #0042 paid by R. López',         time: '2 hours ago'        },
  { text: 'New message from A. Martín',             time: '3 hours ago'        },
  { text: 'Session notes saved for M. García',      time: 'Yesterday, 11:05'   },
  { text: 'Patient C. Fernández profile updated',   time: 'Yesterday, 09:30'   },
]

const accentMap: Record<string, { dot: string; value: string }> = {
  primary: { dot: 'bg-primary',     value: 'text-primary'    },
  violet:  { dot: 'bg-violet-500',  value: 'text-violet-600' },
  amber:   { dot: 'bg-amber-500',   value: 'text-amber-600'  },
  emerald: { dot: 'bg-emerald-500', value: 'text-emerald-600'},
}
function getAccent(color: string) { return accentMap[color] ?? { dot: 'bg-muted-foreground', value: 'text-muted-foreground' } }
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
  <div class="p-4 sm:p-6 space-y-6">

    <!-- Page header -->
    <div class="appear" style="--delay: 0ms">
      <h1 class="text-xl font-semibold text-foreground">Good morning, Dr. Torres</h1>
      <p class="text-sm text-muted-foreground mt-0.5">Here's what's happening today.</p>
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
      <!-- Sessions this week — bar -->
      <div class="appear lg:col-span-3 bg-card rounded-xl border border-border shadow-sm p-5" style="--delay: 360ms">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-sm font-semibold text-foreground">Sessions This Week</h2>
          <Badge class="text-[10px] border-transparent">18 total</Badge>
        </div>
        <p class="text-xs text-muted-foreground mb-3">Mon – Fri · completed vs scheduled</p>
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

      <!-- Patient overview — donut -->
      <div class="appear lg:col-span-2 bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col" style="--delay: 440ms">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-sm font-semibold text-foreground">Patient Overview</h2>
          <Badge variant="secondary" class="text-[10px] border-transparent">42 total</Badge>
        </div>
        <p class="text-xs text-muted-foreground mb-4">Active · On Hold · Inactive</p>

        <!-- Donut chart -->
        <ChartDonut
          :data="patientDonutData"
          central-label="42"
          central-sub-label="patients"
          class="max-h-[200px]"
        />

        <!-- Legend -->
        <div class="flex flex-col gap-1.5 mt-4">
          <div v-for="(d, i) in patientData" :key="d.status" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ background: patientColors[i] }" />
            <span class="text-[11px] text-muted-foreground">{{ d.status }}</span>
            <span class="text-[11px] font-semibold text-foreground ml-auto tabular-nums">{{ d.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Two-column content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Upcoming sessions -->
      <div class="appear bg-card rounded-xl border border-border shadow-sm p-4" style="--delay: 520ms">
        <h2 class="text-sm font-semibold text-foreground mb-3">Upcoming Sessions</h2>
        <div class="space-y-1">
          <div
            v-for="(s, i) in sessions"
            :key="s.name"
            class="session-row flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors"
            :style="{ '--i': i }"
          >
            <Avatar class="size-8 flex-shrink-0">
              <AvatarFallback class="bg-primary/10 text-primary text-xs font-bold">{{ s.initials }}</AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ s.name }}</p>
              <p class="text-xs text-muted-foreground">{{ s.time }}</p>
            </div>
            <Badge :class="['flex-shrink-0 text-[10px] border-transparent', s.type === 'Online' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'bg-muted text-muted-foreground']">
              {{ s.type }}
            </Badge>
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
