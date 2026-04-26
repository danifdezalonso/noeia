<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { SIDEBAR_KEY } from './index'
import type { SidebarContext } from './index'

const open       = ref(true)
const openMobile = ref(false)
const isMobile   = useMediaQuery('(max-width: 767px)')

watch(isMobile, (mobile) => {
  if (!mobile) openMobile.value = false
})

const state = computed<'expanded' | 'collapsed'>(() =>
  open.value ? 'expanded' : 'collapsed',
)

function setOpenMobile(value: boolean) {
  openMobile.value = value
}

function toggleSidebar() {
  if (isMobile.value) openMobile.value = !openMobile.value
  else                open.value       = !open.value
}

provide<SidebarContext>(SIDEBAR_KEY, { open, openMobile, setOpenMobile, isMobile, toggleSidebar, state })
</script>

<template>
  <slot />
</template>
