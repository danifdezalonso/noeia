<script setup lang="ts">
export interface AreaSeries {
  key: string
  label: string
  color: string
}
export interface AreaDataPoint {
  date: string
  [key: string]: number | string
}

const props = withDefaults(defineProps<{
  data: AreaDataPoint[]
  series: AreaSeries[]
  title?: string
  description?: string
}>(), { title: 'Trend', description: '' })

type Range = '90d' | '30d' | '7d'
const activeRange = ref<Range>('90d')
const rangeOpts: { label: string; value: Range }[] = [
  { label: '3 months', value: '90d' },
  { label: '30 days',  value: '30d' },
  { label: '7 days',   value: '7d'  },
]

const filteredData = computed(() => {
  const days = activeRange.value === '90d' ? 90 : activeRange.value === '30d' ? 30 : 7
  const cutoff = new Date('2026-03-01')
  cutoff.setDate(cutoff.getDate() - days)
  return props.data.filter(d => new Date(d.date) >= cutoff)
})

// SVG coordinate space
const VW = 800, VH = 180
const ML = 8, MR = 8, MT = 12, MB = 28
const CW = VW - ML - MR
const CH = VH - MT - MB
const BOTTOM = MT + CH

const maxVal = computed(() =>
  Math.max(1, ...filteredData.value.flatMap(d => props.series.map(s => Number(d[s.key]) || 0)))
)

function getPoints(key: string) {
  const d = filteredData.value
  const n = d.length
  if (!n) return []
  if (n === 1) return [{ x: ML + CW / 2, y: BOTTOM - ((Number(d[0][key]) || 0) / maxVal.value) * CH * 0.9 }]
  return d.map((item, i) => ({
    x: ML + (i / (n - 1)) * CW,
    y: BOTTOM - ((Number(item[key]) || 0) / maxVal.value) * CH * 0.9,
  }))
}

function smoothLine(pts: {x: number; y: number}[]): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i]
    const cx = (p0.x + p1.x) / 2
    d += ` C${cx.toFixed(1)},${p0.y.toFixed(1)} ${cx.toFixed(1)},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`
  }
  return d
}

function buildAreaPath(key: string): string {
  const pts = getPoints(key)
  if (pts.length < 2) return ''
  return `${smoothLine(pts)} L${pts[pts.length - 1].x.toFixed(1)},${BOTTOM} L${pts[0].x.toFixed(1)},${BOTTOM} Z`
}

// X-axis labels (≤7 evenly spaced)
const xLabels = computed(() => {
  const d = filteredData.value
  if (!d.length) return []
  const count = Math.min(7, d.length)
  if (count === 1) return [{ x: ML + CW / 2, label: fmtDate(d[0].date) }]
  return Array.from({ length: count }, (_, i) => {
    const idx = Math.round(i * (d.length - 1) / (count - 1))
    return { x: ML + (idx / (d.length - 1)) * CW, label: fmtDate(d[idx].date) }
  })
})

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Grid lines
const gridLines = [0.25, 0.5, 0.75, 1].map(f => BOTTOM - f * CH * 0.9)

// ── Hover / tooltip ───────────────────────────────────────────────────────
const svgRef = ref<SVGSVGElement>()

const hover = ref({
  visible: false,
  svgX: 0,
  clientX: 0,
  clientY: 0,
  date: '',
  values: [] as { label: string; value: number; color: string }[],
  dots: [] as { x: number; y: number; color: string }[],
})

function onMouseMove(e: MouseEvent) {
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  const relX = (e.clientX - rect.left) / rect.width * VW
  const d = filteredData.value
  if (!d.length) return
  const frac = Math.max(0, Math.min(1, (relX - ML) / CW))
  const idx = Math.round(frac * Math.max(d.length - 1, 0))
  const clampedIdx = Math.min(idx, d.length - 1)
  const item = d[clampedIdx]
  const svgX = d.length > 1 ? ML + (clampedIdx / (d.length - 1)) * CW : ML + CW / 2

  hover.value = {
    visible: true,
    svgX,
    clientX: e.clientX,
    clientY: e.clientY,
    date: fmtDate(item.date),
    values: props.series.map(s => ({ label: s.label, value: Number(item[s.key]) || 0, color: s.color })),
    dots: props.series.map(s => ({
      x: svgX,
      y: BOTTOM - ((Number(item[s.key]) || 0) / maxVal.value) * CH * 0.9,
      color: s.color,
    })),
  }
}

function onMouseLeave() { hover.value.visible = false }
</script>

<template>
  <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-border/50">
      <div>
        <h2 class="text-sm font-semibold text-foreground">{{ title }}</h2>
        <p class="text-xs text-muted-foreground mt-0.5">{{ description }}</p>
      </div>
      <!-- Range selector -->
      <div class="flex items-center gap-0.5 bg-muted rounded-lg p-1">
        <button
          v-for="r in rangeOpts"
          :key="r.value"
          :class="[
            'px-3 py-1 text-xs font-medium rounded-md transition-colors',
            activeRange === r.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="activeRange = r.value"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <!-- Chart area -->
    <div class="px-2 pt-2 pb-1">
      <svg
        ref="svgRef"
        :viewBox="`0 0 ${VW} ${VH}`"
        class="w-full"
        style="height: 200px"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
      >
        <defs>
          <linearGradient
            v-for="s in series"
            :key="`grad-${s.key}`"
            :id="`aig-${s.key}`"
            x1="0" y1="0" x2="0" y2="1"
          >
            <stop offset="5%"  :stop-color="s.color" stop-opacity="0.35" />
            <stop offset="95%" :stop-color="s.color" stop-opacity="0.03" />
          </linearGradient>
        </defs>

        <!-- Horizontal grid lines -->
        <line
          v-for="(gy, i) in gridLines"
          :key="i"
          :x1="ML" :y1="gy"
          :x2="VW - MR" :y2="gy"
          class="stroke-border/40"
          stroke-dasharray="3 3"
          stroke-width="0.8"
        />

        <!-- Gradient areas (reverse so first series is on top) -->
        <path
          v-for="s in [...series].reverse()"
          :key="`area-${s.key}`"
          :d="buildAreaPath(s.key)"
          :fill="`url(#aig-${s.key})`"
        />

        <!-- Smooth lines -->
        <path
          v-for="s in [...series].reverse()"
          :key="`line-${s.key}`"
          :d="smoothLine(getPoints(s.key))"
          :stroke="s.color"
          stroke-width="1.8"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Crosshair -->
        <line
          v-if="hover.visible"
          :x1="hover.svgX" :y1="MT"
          :x2="hover.svgX" :y2="BOTTOM"
          class="stroke-foreground/20"
          stroke-width="1"
          stroke-dasharray="4 3"
        />

        <!-- Hover dots -->
        <circle
          v-for="(dot, i) in hover.visible ? hover.dots : []"
          :key="`dot-${i}`"
          :cx="dot.x"
          :cy="dot.y"
          r="3.5"
          :fill="dot.color"
          class="stroke-background stroke-2"
        />

        <!-- X-axis labels -->
        <text
          v-for="(lbl, i) in xLabels"
          :key="i"
          :x="lbl.x"
          :y="VH - 6"
          text-anchor="middle"
          font-size="9.5"
          class="fill-muted-foreground"
        >{{ lbl.label }}</text>
      </svg>

      <!-- Legend -->
      <div class="flex items-center justify-center gap-6 py-2">
        <div v-for="s in series" :key="s.key" class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full" :style="{ background: s.color }" />
          <span class="text-[11px] text-muted-foreground">{{ s.label }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Teleport tooltip -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-75 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="hover.visible"
        class="fixed z-[200] pointer-events-none"
        :style="{ left: `${hover.clientX + 14}px`, top: `${hover.clientY - 75}px` }"
      >
        <div class="bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs min-w-[140px]">
          <p class="font-semibold text-foreground mb-1.5">{{ hover.date }}</p>
          <div
            v-for="item in hover.values"
            :key="item.label"
            class="flex items-center gap-2 mb-0.5 last:mb-0"
          >
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: item.color }" />
            <span class="text-muted-foreground">{{ item.label }}</span>
            <span class="font-mono font-semibold text-foreground ml-auto pl-2">€{{ item.value }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
