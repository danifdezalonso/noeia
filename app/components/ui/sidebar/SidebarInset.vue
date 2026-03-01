<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-sidebar="inset"
    :class="cn('flex flex-1 flex-col overflow-hidden min-w-0', props.class)"
  >
    <slot />
  </div>
</template>
