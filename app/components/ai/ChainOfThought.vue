<script setup lang="ts">
import { Brain, ChevronDown, Check, Loader } from 'lucide-vue-next'

export interface ChainOfThoughtStep {
  id: string
  label: string
  description?: string
  status: 'complete' | 'active' | 'pending'
}

const props = withDefaults(defineProps<{
  open?: boolean
  steps?: ChainOfThoughtStep[]
  title?: string
}>(), {
  open: false,
  steps: () => [],
  title: 'Thinking…',
})

const emit = defineEmits<{ 'update:open': [value: boolean] }>()
const toggle = () => emit('update:open', !props.open)
</script>

<template>
  <div class="rounded-xl border border-border overflow-hidden text-xs">
    <!-- Header -->
    <button
      type="button"
      class="w-full flex items-center gap-2 px-3 py-2.5 bg-muted/60 hover:bg-muted transition-colors"
      @click="toggle"
    >
      <div class="w-5 h-5 rounded-md bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
        <Brain class="w-3 h-3 text-violet-600 dark:text-violet-400" />
      </div>
      <span class="flex-1 text-left font-medium text-foreground">{{ title }}</span>
      <ChevronDown
        class="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <!-- Collapsible steps -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="open" class="overflow-hidden">
        <div class="px-3 py-2.5 space-y-2 border-t border-border">
          <div
            v-for="step in steps"
            :key="step.id"
            class="flex items-start gap-2"
          >
            <!-- Status icon -->
            <div class="mt-0.5 w-4 h-4 flex items-center justify-center flex-shrink-0">
              <div v-if="step.status === 'complete'" class="w-4 h-4 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <Check class="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
              </div>
              <div v-else-if="step.status === 'active'" class="w-4 h-4 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                <Loader class="w-2.5 h-2.5 text-violet-600 dark:text-violet-400 animate-spin" />
              </div>
              <div v-else class="w-4 h-4 rounded-full border border-border" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p
                :class="[
                  'font-medium leading-snug',
                  step.status === 'complete' ? 'text-muted-foreground line-through' : step.status === 'active' ? 'text-foreground' : 'text-muted-foreground/60',
                ]"
              >{{ step.label }}</p>
              <p v-if="step.description && step.status === 'active'" class="text-muted-foreground mt-0.5 leading-relaxed">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
