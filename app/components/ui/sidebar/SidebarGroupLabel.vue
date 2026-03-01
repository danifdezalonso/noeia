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
    data-sidebar="group-label"
    :class="cn(
      'text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-2 py-1.5',
      'overflow-hidden transition-all duration-200',
      iconOnly && 'h-0 opacity-0 py-0',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
