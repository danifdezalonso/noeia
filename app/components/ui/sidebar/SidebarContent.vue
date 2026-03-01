<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-sidebar="content"
    :class="cn('flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2', props.class)"
  >
    <slot />
  </div>
</template>
