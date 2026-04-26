<script setup lang="ts">
import { cn } from '@/lib/utils'
import { useSidebar } from './index'
import { Sheet, SheetContent } from '~/components/ui/sheet'

const { open, openMobile, setOpenMobile, isMobile, state } = useSidebar()
</script>

<template>
  <!-- Mobile: Sheet-based drawer (reka-ui Dialog underneath — handles portal, overlay, focus trap, a11y) -->
  <Sheet v-if="isMobile" :open="openMobile" @update:open="setOpenMobile">
    <SheetContent
      side="left"
      :class="cn(
        'w-64 p-0 border-sidebar-border bg-sidebar text-sidebar-foreground',
        '[&>button.absolute]:hidden',
      )"
    >
      <div class="flex flex-col h-full overflow-hidden">
        <slot />
      </div>
    </SheetContent>
  </Sheet>

  <!-- Desktop: static collapsible aside -->
  <aside
    v-else
    data-sidebar="sidebar"
    :data-state="state"
    :class="cn(
      'flex flex-col bg-sidebar text-sidebar-foreground border border-sidebar-border',
      'flex-shrink-0 overflow-hidden self-stretch m-2 rounded-xl shadow-md',
      'transition-[width] duration-200 ease-in-out',
      open ? 'w-60' : 'w-14',
    )"
  >
    <slot />
  </aside>
</template>
