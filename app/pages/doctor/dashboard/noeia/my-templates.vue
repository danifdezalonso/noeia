<script setup lang="ts">
import { LayoutTemplate, Sparkles } from 'lucide-vue-next'
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center gap-5 bg-muted/30 p-8 text-center">
    <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
      <LayoutTemplate class="w-8 h-8 text-primary/60" />
    </div>
    <div>
      <h2 class="text-xl font-bold text-foreground mb-2">We're working on it</h2>
      <p class="text-sm text-muted-foreground max-w-sm">
        My Templates is coming soon. You'll be able to create, manage and reuse custom session note templates tailored to your practice.
      </p>
    </div>
    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
      <Sparkles class="w-3 h-3" />
      Coming soon
    </span>
  </div>
</template>
