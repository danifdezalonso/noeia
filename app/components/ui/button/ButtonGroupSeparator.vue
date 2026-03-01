<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-slot="button-group-separator"
    :class="cn('w-px self-stretch bg-primary-foreground/25', props.class)"
  />
</template>
