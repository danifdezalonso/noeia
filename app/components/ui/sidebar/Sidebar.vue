<script setup lang="ts">
import { cn } from '@/lib/utils'
import { useSidebar } from './index'

const { open, mobileOpen, state } = useSidebar()
</script>

<template>
  <aside
    data-sidebar="sidebar"
    :data-state="state"
    :class="cn(
      // Base card appearance — border on all sides, rounded, shadow
      'flex flex-col bg-sidebar text-sidebar-foreground border border-sidebar-border flex-shrink-0 overflow-hidden',
      // Mobile: fixed floating overlay
      'fixed inset-y-2 left-2 z-40 w-60 rounded-xl shadow-2xl',
      // Desktop: relative flex item with floating margin & rounded corners
      'md:relative md:inset-auto md:z-auto md:self-stretch md:m-2 md:rounded-xl md:shadow-md',
      'transition-[transform,width] duration-200 ease-in-out',
      // Mobile visibility
      mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      // Desktop width (content area, margin is additive)
      open ? 'md:w-60' : 'md:w-14',
    )"
  >
    <slot />
  </aside>
</template>
