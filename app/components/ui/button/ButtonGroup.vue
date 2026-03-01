<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-slot="button-group"
    :class="cn(
      'inline-flex items-stretch',
      '[&>[data-slot=button]]:rounded-none',
      '[&>[data-slot=button]:first-child]:rounded-l-md',
      '[&>[data-slot=button]:last-child]:rounded-r-md',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
