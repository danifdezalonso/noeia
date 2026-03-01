<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { PrimitiveProps } from 'reka-ui'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { useSidebar } from './index'

interface Props extends PrimitiveProps {
  isActive?: boolean
  tooltip?: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
})

const { state, isMobile } = useSidebar()
const iconOnly = computed(() => state.value === 'collapsed' && !isMobile.value)

const buttonClass = computed(() =>
  cn(
    'flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors',
    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
    '[&>svg]:size-4 [&>svg]:shrink-0',
    iconOnly.value && '[&>span]:hidden justify-center',
    props.isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
    props.class,
  )
)
</script>

<template>
  <Primitive
    data-sidebar="menu-button"
    :data-active="isActive || undefined"
    :as="as"
    :as-child="asChild"
    :title="iconOnly && tooltip ? tooltip : undefined"
    :class="buttonClass"
  >
    <slot />
  </Primitive>
</template>
