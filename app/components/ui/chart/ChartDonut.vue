<script setup lang="ts">
interface DonutSegment {
  label: string
  value: number
  color: string
}

const props = withDefaults(defineProps<{
  data: DonutSegment[]
  innerRadiusFraction?: number
  padAngle?: number
  centralLabel?: string
  centralSubLabel?: string
}>(), {
  innerRadiusFraction: 0.62,
  padAngle: 0.025,
})

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0))

// ViewBox is 200×200, center (100,100), outer radius 90
const CX = 100, CY = 100, R = 90

function polar(r: number, a: number): [number, number] {
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

function arcPath(a1: number, a2: number): string {
  const ri = R * props.innerRadiusFraction
  const [x1, y1] = polar(R, a1)
  const [x2, y2] = polar(R, a2)
  const [x3, y3] = polar(ri, a2)
  const [x4, y4] = polar(ri, a1)
  const large = (a2 - a1 > Math.PI) ? 1 : 0
  return `M${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} L${x3},${y3} A${ri},${ri},0,${large},0,${x4},${y4} Z`
}

const segments = computed(() => {
  const t = total.value
  if (!t) return []
  const usable = 2 * Math.PI - props.data.length * props.padAngle
  let angle = -Math.PI / 2
  return props.data.map(d => {
    const sweep = (d.value / t) * usable
    const a1 = angle + props.padAngle / 2
    const a2 = a1 + sweep
    angle = a2 + props.padAngle / 2
    return { ...d, path: arcPath(a1, a2) }
  })
})

const hovered = ref<string | null>(null)
const tooltip  = ref({ visible: false, x: 0, y: 0, label: '', value: 0, color: '' })

function onEnter(e: MouseEvent, seg: DonutSegment) {
  hovered.value  = seg.label
  tooltip.value  = { visible: true, x: e.clientX, y: e.clientY, label: seg.label, value: seg.value, color: seg.color }
}
function onLeave() { hovered.value = null; tooltip.value.visible = false }
function onMove(e: MouseEvent) { if (tooltip.value.visible) { tooltip.value.x = e.clientX; tooltip.value.y = e.clientY } }
</script>

<template>
  <div class="relative aspect-square w-full mx-auto">
    <svg viewBox="0 0 200 200" class="w-full h-full">
      <path
        v-for="seg in segments"
        :key="seg.label"
        :d="seg.path"
        :fill="seg.color"
        :opacity="hovered && hovered !== seg.label ? 0.45 : 1"
        class="transition-opacity duration-150 cursor-pointer"
        @mouseenter="onEnter($event, seg)"
        @mouseleave="onLeave"
        @mousemove="onMove"
      />
    </svg>

    <!-- Center text overlay -->
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
      <span v-if="centralLabel" class="text-3xl font-bold text-foreground leading-none tabular-nums">
        {{ centralLabel }}
      </span>
      <span v-if="centralSubLabel" class="text-xs text-muted-foreground mt-1">
        {{ centralSubLabel }}
      </span>
    </div>
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
        :style="{ left: `${tooltip.x + 14}px`, top: `${tooltip.y - 40}px` }"
      >
        <div class="bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs flex items-center gap-2 whitespace-nowrap">
          <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ background: tooltip.color }" />
          <span class="font-medium text-foreground">{{ tooltip.label }}</span>
          <span class="text-muted-foreground font-mono ml-1">{{ tooltip.value.toLocaleString() }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
