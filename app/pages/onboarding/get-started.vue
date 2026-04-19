<script setup lang="ts">
definePageMeta({
  layout: 'onboarding',
  pageTransition: { name: 'ob-slide', mode: 'out-in' },
})

const direction = useState<'forward' | 'back'>('onboarding-direction', () => 'forward')

function goToJoin() {
  direction.value = 'forward'
  navigateTo('/onboarding/join')
}
</script>

<template>
  <div class="flex-1 flex flex-col justify-center px-8 py-10 max-w-lg mx-auto w-full">
    <div class="mb-8">
      <h1
        class="mb-2 tracking-tight"
        style="font-size: 30px; font-weight: 700; color: oklch(0.14 0 0); line-height: 1.15;"
      >
        Let's get you started
      </h1>
      <p style="font-size: 14.5px; color: oklch(0.52 0 0); line-height: 1.6;">
        How would you like to begin with Noeia?
      </p>
    </div>

    <!-- Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <!-- Card: Jump right in -->
      <button
        class="group text-left transition-all duration-200 active:scale-[0.98]"
        style="padding: 24px; border-radius: 16px; border: 1.5px solid oklch(0.91 0 0); background: white; cursor: pointer;"
        @mouseenter="(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = '#E83D59';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(232,61,89,0.1)';
        }"
        @mouseleave="(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'oklch(0.91 0 0)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }"
        @click="goToJoin"
      >
        <!-- Icon -->
        <div
          class="mb-4 inline-flex items-center justify-center"
          style="width: 44px; height: 44px; border-radius: 12px; background: rgba(232,61,89,0.1);"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E83D59" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h3 style="font-size: 15px; font-weight: 700; color: oklch(0.14 0 0); margin-bottom: 6px;">Jump right in</h3>
        <p style="font-size: 13px; color: oklch(0.52 0 0); line-height: 1.55; margin-bottom: 16px;">
          Set up your profile and start using Noeia immediately.
        </p>
        <div
          class="inline-flex items-center gap-2 transition-all duration-150"
          style="font-size: 13px; font-weight: 600; color: #E83D59;"
        >
          Get started
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </button>

      <!-- Card: Book a demo -->
      <div
        class="relative text-left"
        style="padding: 24px; border-radius: 16px; border: 1.5px solid oklch(0.91 0 0); background: oklch(0.97 0 0); cursor: not-allowed; opacity: 0.7;"
      >
        <!-- Coming soon tag -->
        <div
          class="absolute"
          style="top: 14px; right: 14px; padding: 3px 8px; border-radius: 20px; background: oklch(0.91 0 0); font-size: 11px; font-weight: 600; color: oklch(0.45 0 0); letter-spacing: 0.03em;"
        >
          Coming soon
        </div>
        <!-- Icon -->
        <div
          class="mb-4 inline-flex items-center justify-center"
          style="width: 44px; height: 44px; border-radius: 12px; background: oklch(0.93 0 0);"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0 0)" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" />
          </svg>
        </div>
        <h3 style="font-size: 15px; font-weight: 700; color: oklch(0.45 0 0); margin-bottom: 6px;">Book a demo</h3>
        <p style="font-size: 13px; color: oklch(0.65 0 0); line-height: 1.55; margin-bottom: 16px;">
          Let our team walk you through everything Noeia can do.
        </p>
        <div
          class="inline-flex items-center gap-2"
          style="font-size: 13px; font-weight: 600; color: oklch(0.6 0 0);"
        >
          Schedule a call
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Back to login -->
    <div class="mt-8 pt-6" style="border-top: 1px solid oklch(0.94 0 0);">
      <NuxtLink
        to="/login"
        class="inline-flex items-center gap-2 transition-colors"
        style="font-size: 13px; color: oklch(0.6 0 0);"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Back to login
      </NuxtLink>
    </div>
  </div>
</template>
