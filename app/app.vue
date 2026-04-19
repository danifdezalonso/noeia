<script setup lang="ts">
const { toasts } = useToast()
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>

  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <Transition
        v-for="toast in toasts"
        :key="toast.id"
        appear
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div class="pointer-events-auto flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 shadow-lg min-w-[280px] max-w-[360px]">
          <svg class="mt-0.5 shrink-0 text-green-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 4 12 14.01l-3-3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div>
            <p class="text-sm font-semibold text-green-900">{{ toast.title }}</p>
            <p v-if="toast.description" class="text-xs text-green-700 mt-0.5">{{ toast.description }}</p>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
