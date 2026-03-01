<script setup lang="ts">
import { ref, computed } from 'vue'
import { SIDEBAR_KEY } from './index'
import type { SidebarContext } from './index'

const open = ref(true)
const mobileOpen = ref(false)
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', () => {
    const mobile = window.innerWidth < 768
    isMobile.value = mobile
    if (!mobile) mobileOpen.value = false
  })
})

const state = computed<'expanded' | 'collapsed'>(() =>
  open.value ? 'expanded' : 'collapsed',
)

function toggleSidebar() {
  if (isMobile.value) {
    mobileOpen.value = !mobileOpen.value
  } else {
    open.value = !open.value
  }
}

provide<SidebarContext>(SIDEBAR_KEY, { open, mobileOpen, isMobile, toggleSidebar, state })
</script>

<template>
  <slot />
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen && isMobile"
        class="fixed inset-0 z-30 bg-black/40 md:hidden"
        @click="mobileOpen = false"
      />
    </Transition>
  </Teleport>
</template>
