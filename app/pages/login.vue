<script setup lang="ts">
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' },
  ],
})

definePageMeta({ layout: false })

const loading = ref<string | null>(null)

async function continueWithGoogle(role: 'doctor' | 'organization' | 'patient') {
  loading.value = role
  await new Promise(r => setTimeout(r, 750))
  const dest = role === 'doctor' ? '/doctor/dashboard' : role === 'organization' ? '/organization/dashboard' : '/doctor/dashboard'
  await navigateTo(dest)
  loading.value = null
}
</script>

<template>
  <div
    class="h-screen overflow-auto flex items-center justify-center p-4 relative"
    style="background: oklch(0.985 0.006 35); font-family: 'Plus Jakarta Sans', system-ui, sans-serif;"
  >

    <!-- Watermark pattern: Noeia logo marks tiled -->
    <div class="fixed inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
      <svg class="absolute inset-0 w-full h-full opacity-[0.032]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="noeia-watermark" x="0" y="0" width="96" height="104" patternUnits="userSpaceOnUse">
            <path
              d="M6.607 26.65C7.252 27.48 8.092 27.895 9.125 27.895C10.273 27.895 11.163 27.438 11.794 26.522C12.425 25.607 12.74 24.29 12.74 22.574C12.74 20.629 12.432 18.576 11.815 16.415C11.198 14.256 10.33 12.317 9.211 10.6C8.063 12.403 7.181 14.435 6.564 16.694C5.947 18.955 5.638 21.015 5.638 22.874C5.638 24.563 5.962 25.822 6.607 26.65ZM9.427 2.918C12.066 0.973 14.965 0 18.121 0C20.618 0 22.82 0.594 24.729 1.781C26.637 2.969 28.115 4.678 29.162 6.909C30.209 9.141 30.734 11.788 30.734 14.849C30.734 19.971 29.227 25.893 26.214 32.616H20.102C21.737 29.383 22.957 26.279 23.76 23.303C24.563 20.328 24.965 17.639 24.965 15.235C24.965 12.145 24.326 9.714 23.05 7.939C21.773 6.166 19.958 5.279 17.605 5.279C15.94 5.279 14.434 5.723 13.085 6.609C14.807 8.898 16.12 11.501 17.024 14.42C17.928 17.338 18.38 20.028 18.38 22.488C18.38 24.663 17.992 26.543 17.218 28.131C16.443 29.72 15.359 30.936 13.968 31.779C12.575 32.623 10.962 33.045 9.125 33.045C7.375 33.045 5.811 32.666 4.433 31.908C3.056 31.15 1.972 30.007 1.184 28.475C0.394 26.945 0 25.092 0 22.917C0 20.457 0.488 17.739 1.464 14.763C2.439 11.788 3.816 9.141 5.596 6.824C4.103 5.794 2.482 5.279 0.732 5.279V0C3.974 0 6.872 0.973 9.427 2.918Z"
              fill="#E83D59"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#noeia-watermark)" />
      </svg>
    </div>

    <!-- Card -->
    <div class="relative z-10 w-full max-w-[372px]">
      <div
        class="bg-white border overflow-hidden"
        style="border-radius: 20px; border-color: oklch(0.91 0 0); box-shadow: 0 2px 40px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05);"
      >
        <!-- Top accent stripe -->
        <div class="h-[3px] w-full" style="background: #E83D59;" />

        <div class="p-8 pt-7">
          <!-- Logo -->
          <div class="flex flex-col items-center gap-2.5 mb-8">
            <div
              class="w-12 h-12 flex items-center justify-center"
              style="background: #E83D59; border-radius: 14px; box-shadow: 0 4px 16px rgba(232,61,89,0.28);"
            >
              <svg width="22" height="24" viewBox="0 0 62 67" fill="none">
                <path
                  d="M13.2145 53.3016C14.5055 54.9621 16.1848 55.7909 18.2505 55.7909C20.5458 55.7909 22.3255 54.8765 23.5881 53.0443C24.8498 51.2133 25.4818 48.5812 25.4818 45.1474C25.4818 41.2575 24.8641 37.1516 23.6308 32.8305C22.3967 28.5111 20.6614 24.6337 18.4227 21.2004C16.1266 24.8058 14.3615 28.8691 13.1282 33.3882C11.8933 37.9093 11.2773 42.0294 11.2773 45.7485C11.2773 49.1255 11.923 51.6424 13.2145 53.3016ZM18.8531 5.83651C24.1325 1.94623 29.929 0 36.2427 0C41.236 0 45.6398 1.1885 49.4572 3.56181C53.2734 5.9373 56.229 9.35554 58.3241 13.8187C60.4188 18.2825 61.4669 23.576 61.4669 29.6979C61.4669 39.9412 58.4535 51.7861 52.4275 65.2321H40.2034C43.4739 58.7668 45.9132 52.5589 47.5204 46.6066C49.1264 40.6564 49.9308 35.2772 49.9308 30.4703C49.9308 24.2903 48.6528 19.4275 46.1 15.8788C43.5451 12.3314 39.9153 10.5571 35.21 10.5571C31.8804 10.5571 28.8679 11.4453 26.1706 13.2183C29.6141 17.7967 32.2397 23.0029 34.0476 28.8395C35.8558 34.6761 36.7595 40.0552 36.7595 44.9757C36.7595 49.3252 35.9843 53.0869 34.4353 56.2629C32.8855 59.439 30.718 61.8718 27.9357 63.5582C25.1509 65.2459 21.9231 66.0905 18.2505 66.0905C14.7493 66.0905 11.6219 65.3315 8.86689 63.816C6.11227 62.3004 3.94559 60.0113 2.36727 56.9497C0.788531 53.8889 0 50.1836 0 45.8342C0 40.9137 0.975302 35.4781 2.92716 29.5262C4.87734 23.576 7.63196 18.2825 11.1915 13.6476C8.20651 11.5875 4.9636 10.5571 1.46316 10.5571V0C7.94855 0 13.7442 1.94623 18.8531 5.83651Z"
                  fill="white"
                />
              </svg>
            </div>
            <img src="/Noeia_logo.svg" alt="Noeia" class="h-[21px] dark:hidden" />
          </div>

          <!-- Heading -->
          <div class="text-center mb-7">
            <h1 class="text-[22px] font-semibold tracking-tight mb-1.5" style="color: oklch(0.14 0 0);">
              Welcome to Noeia
            </h1>
            <p class="text-[13.5px] leading-relaxed" style="color: oklch(0.56 0 0);">
              The clinical workspace for modern care teams
            </p>
          </div>

          <!-- Google buttons -->
          <div class="flex flex-col gap-2.5">
            <!-- Doctor & Organization -->
            <button
              v-for="role in [
                { key: 'doctor',       label: 'Doctor' },
                { key: 'organization', label: 'Organization' },
              ]"
              :key="role.key"
              :disabled="!!loading"
              class="w-full flex items-center gap-3 transition-all duration-150 active:scale-[0.983] disabled:opacity-60 disabled:cursor-not-allowed"
              style="height: 46px; padding: 0 14px; border-radius: 12px; border: 1.5px solid oklch(0.9 0 0); background: white; font-size: 13.5px; font-weight: 500; color: oklch(0.2 0 0); box-shadow: 0 1px 4px rgba(0,0,0,0.06);"
              @mouseenter="e => !loading && ((e.currentTarget as HTMLElement).style.background = 'oklch(0.985 0 0)')"
              @mouseleave="e => ((e.currentTarget as HTMLElement).style.background = 'white')"
              @click="continueWithGoogle(role.key as 'doctor' | 'organization')"
            >
              <svg v-if="loading !== role.key" width="18" height="18" viewBox="0 0 24 24" class="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" class="animate-spin flex-shrink-0">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.2" stroke-width="4" />
                <path fill="currentColor" fill-opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span class="flex-1 text-left">{{ loading === role.key ? 'Connecting…' : 'Continue with Google' }}</span>
              <span style="font-size: 10.5px; font-weight: 600; padding: 2px 8px; border-radius: 20px; background: oklch(0.94 0 0); color: oklch(0.4 0 0); letter-spacing: 0.03em;">
                {{ role.label }}
              </span>
            </button>

            <!-- Patient — disabled -->
            <div
              style="height: 46px; padding: 0 14px; border-radius: 12px; border: 1.5px solid oklch(0.91 0 0); background: oklch(0.97 0 0); font-size: 13.5px; font-weight: 500; color: oklch(0.65 0 0); cursor: not-allowed; opacity: 0.7; display: flex; align-items: center; gap: 12px;"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" class="flex-shrink-0" style="opacity: 0.4;">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span class="flex-1 text-left">Continue with Google</span>
              <span style="font-size: 10.5px; font-weight: 600; padding: 2px 8px; border-radius: 20px; background: oklch(0.91 0 0); color: oklch(0.5 0 0); letter-spacing: 0.03em;">Coming soon</span>
            </div>
          </div>

          <!-- Terms -->
          <p class="text-center mt-5 leading-relaxed" style="font-size: 11.5px; color: oklch(0.62 0 0);">
            By continuing, you agree to Noeia's
            <a href="#" class="hover:underline" style="color: #E83D59;">Terms of Service</a>
            and <a href="#" class="hover:underline" style="color: #E83D59;">Privacy Policy</a>
          </p>

          <!-- Prototype flows -->
          <div class="mt-6 pt-5" style="border-top: 1px dashed oklch(0.88 0 0);">
            <p class="text-center mb-3" style="font-size: 10.5px; font-weight: 600; letter-spacing: 0.07em; color: oklch(0.7 0 0); text-transform: uppercase;">Prototype flows</p>
            <div class="flex flex-col gap-2">
              <button
                class="w-full text-left"
                style="padding: 9px 12px; border-radius: 9px; border: 1px solid oklch(0.91 0 0); background: oklch(0.985 0 0); font-size: 12px; font-weight: 500; color: oklch(0.3 0 0); cursor: pointer;"
                @mouseenter="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.97 0 0)')"
                @mouseleave="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.985 0 0)')"
                @click="navigateTo('/onboarding/get-started')"
              >
                <span style="color: oklch(0.65 0 0); margin-right: 6px;">→</span> User is not signed in Noeia
              </button>
              <button
                class="w-full text-left"
                style="padding: 9px 12px; border-radius: 9px; border: 1px solid oklch(0.91 0 0); background: oklch(0.985 0 0); font-size: 12px; font-weight: 500; color: oklch(0.3 0 0); cursor: pointer;"
                @mouseenter="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.97 0 0)')"
                @mouseleave="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.985 0 0)')"
                @click="navigateTo('/doctor/dashboard')"
              >
                <span style="color: oklch(0.65 0 0); margin-right: 6px;">→</span> User is signed in Noeia
              </button>
              <button
                class="w-full text-left"
                style="padding: 9px 12px; border-radius: 9px; border: 1px solid oklch(0.91 0 0); background: oklch(0.985 0 0); font-size: 12px; font-weight: 500; color: oklch(0.3 0 0); cursor: pointer;"
                @mouseenter="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.97 0 0)')"
                @mouseleave="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.985 0 0)')"
                @click="navigateTo('/onboarding/join?invitations=multiple')"
              >
                <span style="color: oklch(0.65 0 0); margin-right: 6px;">→</span> Invited to org — multiple invitations
              </button>
<button
                class="w-full text-left"
                style="padding: 9px 12px; border-radius: 9px; border: 1px solid oklch(0.91 0 0); background: oklch(0.985 0 0); font-size: 12px; font-weight: 500; color: oklch(0.3 0 0); cursor: pointer;"
                @mouseenter="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.97 0 0)')"
                @mouseleave="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.985 0 0)')"
                @click="navigateTo('/onboarding/join?invitations=expired')"
              >
                <span style="color: oklch(0.65 0 0); margin-right: 6px;">→</span> Invitation expired
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
