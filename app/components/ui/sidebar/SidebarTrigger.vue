<script setup lang="ts">
import { PanelLeft } from 'lucide-vue-next'
import { useSidebar } from './index'

const { toggleSidebar, state } = useSidebar()
</script>

<template>
  <button
    type="button"
    data-sidebar="trigger"
    :title="state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'"
    class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    @click="toggleSidebar"
  >
    <PanelLeft class="w-4 h-4" />
  </button>
</template>
