<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next'

withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'No messages yet',
  description: 'Start the conversation by sending a message below.',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full gap-3 p-8 text-center select-none">
    <div class="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
      <slot name="icon">
        <MessageCircle class="w-6 h-6 text-muted-foreground" />
      </slot>
    </div>
    <div>
      <p class="text-sm font-medium text-foreground">{{ title }}</p>
      <p class="text-xs text-muted-foreground mt-1">{{ description }}</p>
    </div>
  </div>
</template>
