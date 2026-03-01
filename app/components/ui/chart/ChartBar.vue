<script setup lang="ts">
interface BarSegment {
  key: string
  color: string
  label: string
}

const props = withDefaults(defineProps<{
  data: Record<string, any>[]
  segments: BarSegment[]
  xLabels?: string[]
  barPadding?: number
}>(), {
  barPadding: 0.28,
})

// SVG coordinate space
const VW = 400, VH = 200
const ML = 4, MR = 4, MT = 8, MB = 26

const CW = VW - ML - MR
const CH = VH - MT - MB

const maxTotal = computed(() =>
  Math.max(1, ...props.data.map(d =>
    props.segments.reduce((s, seg) => s + (Number(d[seg.key]) || 0), 0)
  ))
)

const barStep   = computed(() => CW / props.data.length)
const barWidth  = computed(() => barStep.value * (1 - props.barPadding))
const barOffset = computed(() => (barStep.value - barWidth.value) / 2)

function barX(i: number) {
  return ML + i * barStep.value + barOffset.value
}

// Rounded-top-only path
function topRoundedRect(x: number, y: number, w: number, h: number, r: number): string {
  const r2 = Math.min(r, w / 2, h)
  return `M${x + r2},${y} h${w - 2 * r2} a${r2},${r2},0,0,1,${r2},${r2} v${h - r2} h${-w} v${-h + r2} a${r2},${r2},0,0,1,${r2},${-r2} Z`
}

function stackedRects(i: number) {
  const d  = props.data[i]
  const mt = maxTotal.value
  let yBottom = VH - MB
  const rects = props.segments
    .map(seg => {
      const val = Number(d[seg.key]) || 0
      const h   = val > 0 ? Math.max(2, (val / mt) * CH) : 0
      const y   = yBottom - h
      yBottom   = y
      return { x: barX(i), y, w: barWidth.value, h, color: seg.color, key: seg.key, label: seg.label, value: val }
    })
    .filter(r => r.h > 0)
  return rects
}

// 4 horizontal grid lines
const gridLines = computed(() => [0.25, 0.5, 0.75, 1].map(f => MT + (1 - f) * CH))

// Tooltip
const tooltip = ref({ visible: false, x: 0, y: 0, day: '', items: [] as { label: string; value: number; color: string }[] })

function onEnter(e: MouseEvent, i: number) {
  const d     = props.data[i]
  const items = props.segments
    .filter(seg => (Number(d[seg.key]) || 0) > 0)
    .map(seg   => ({ label: seg.label, value: Number(d[seg.key]), color: seg.color }))
  tooltip.value = { visible: true, x: e.clientX, y: e.clientY, day: props.xLabels?.[i] ?? String(i + 1), items }
}
function onLeave() { tooltip.value.visible = false }
function onMove(e: MouseEvent) { if (tooltip.value.visible) { tooltip.value.x = e.clientX; tooltip.value.y = e.clientY } }

const hoveredIdx = ref<number | null>(null)
</script>

<template>
  <div class="w-full h-full">
    <svg :viewBox="`0 0 ${VW} ${VH}`" class="w-full h-full overflow-visible">
      <!-- Grid lines -->
      <line
        v-for="(gy, idx) in gridLines"
        :key="idx"
        :x1="ML"
        :y1="gy"
        :x2="VW - MR"
        :y2="gy"
        class="stroke-border/60"
        stroke-dasharray="3 3"
        stroke-width="0.8"
      />

      <!-- Bars per data point -->
      <g
        v-for="(_, i) in data"
        :key="i"
        :opacity="hoveredIdx !== null && hoveredIdx !== i ? 0.45 : 1"
        class="transition-opacity duration-150"
      >
        <!-- Stacked segments — bottom ones are plain rects, topmost has rounded top -->
        <template v-for="(r, j) in stackedRects(i)" :key="`${i}-${j}`">
          <path
            v-if="j === stackedRects(i).length - 1"
            :d="topRoundedRect(r.x, r.y, r.w, r.h, 4)"
            :fill="r.color"
          />
          <rect
            v-else
            :x="r.x"
            :y="r.y"
            :width="r.w"
            :height="r.h"
            :fill="r.color"
          />
        </template>

        <!-- Invisible hit area -->
        <rect
          :x="barX(i)"
          :y="MT"
          :width="barWidth"
          :height="CH"
          fill="transparent"
          class="cursor-pointer"
          @mouseenter="hoveredIdx = i; onEnter($event, i)"
          @mouseleave="hoveredIdx = null; onLeave()"
          @mousemove="onMove"
        />
      </g>

      <!-- X axis labels -->
      <text
        v-for="(label, i) in xLabels"
        :key="i"
        :x="ML + i * barStep + barStep / 2"
        :y="VH - 8"
        text-anchor="middle"
        font-size="9.5"
        class="fill-muted-foreground"
      >{{ label }}</text>
    </svg>
  </div>

  <!-- Tooltip -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-75 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="tooltip.visible"
        class="fixed z-[200] pointer-events-none"
        :style="{ left: `${tooltip.x + 14}px`, top: `${tooltip.y - 70}px` }"
      >
        <div class="bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs min-w-[110px]">
          <p class="font-semibold text-foreground mb-1.5">{{ tooltip.day }}</p>
          <div v-for="item in tooltip.items" :key="item.label" class="flex items-center gap-2 mb-0.5 last:mb-0">
            <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ background: item.color }" />
            <span class="text-muted-foreground">{{ item.label }}</span>
            <span class="font-mono font-semibold text-foreground ml-auto pl-3">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
