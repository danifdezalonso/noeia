<script setup lang="ts">
import { ArrowDown } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

/**
 * ConversationThread — auto-scrolling chat thread container.
 * Inspired by ai-elements/conversation. Wraps the message list,
 * shows a floating "scroll to bottom" button when the user scrolls up.
 */
defineProps<{
  class?: string
}>()

const container = ref<HTMLElement>()
const isAtBottom = ref(true)

function onScroll() {
  if (!container.value) return
  const { scrollTop, scrollHeight, clientHeight } = container.value
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 40
}

function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
  container.value?.scrollTo({ top: container.value.scrollHeight, behavior })
}

defineExpose({ scrollToBottom })
</script>

<template>
  <div class="relative flex-1 min-h-0">
    <!-- Message scroll area -->
    <div
      ref="container"
      class="h-full overflow-y-auto"
      :class="$props.class"
      @scroll="onScroll"
    >
      <slot />
    </div>

    <!-- Scroll-to-bottom button -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition-all duration-150"
      leave-to-class="opacity-0 translate-y-2"
    >
      <Button
        v-if="!isAtBottom"
        variant="outline"
        size="icon"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full shadow-lg bg-background border-border h-8 w-8"
        @click="scrollToBottom()"
      >
        <ArrowDown class="w-3.5 h-3.5" />
      </Button>
    </Transition>
  </div>
</template>
