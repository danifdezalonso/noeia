<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { useSidebar } from './index'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const { state, isMobile } = useSidebar()
const iconOnly = computed(() => state.value === 'collapsed' && !isMobile.value)
</script>

<template>
  <div
    v-if="!iconOnly"
    data-sidebar="menu-badge"
    :class="cn(
      'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2',
      'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5',
      'text-[10px] font-bold tabular-nums',
      'bg-sidebar-primary/10 text-sidebar-primary',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
