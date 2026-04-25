<script setup lang="ts">
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' },
  ],
})

const route = useRoute()
const isDev = import.meta.dev

// Derive current step from route path
const currentStep = computed(() => {
  if (route.path === '/onboarding/join') return 2
  if (route.path === '/onboarding/your-organisation') return 3
  return 1
})

// Track nav direction for slide transitions
const direction = useState<'forward' | 'back'>('onboarding-direction', () => 'forward')

// ─── Dev helper: fill all fields with test data ───────────────────────────
const { form, selectedPhonePrefix } = useOnboardingForm()

function fillTestData() {
  form.value.firstName    = 'Jordan'
  form.value.lastName     = 'Smith'
  form.value.country      = 'United Kingdom'
  form.value.language     = 'English'
  form.value.phone        = '07700 900 123'
  form.value.agreedToTerms = true
  form.value.orgName      = 'MindCare Clinics'
  form.value.specialty    = ['Clinical Psychology']
  form.value.teamSize     = '6–20'
  form.value.role         = 'Individual clinician'
  selectedPhonePrefix.value = { country: 'United Kingdom', flag: '🇬🇧', code: '+44' }
}

const transitionName = computed(() =>
  direction.value === 'forward' ? 'ob-slide-forward' : 'ob-slide-back'
)

const stepMeta = [
  { label: 'Get started', step: 1, path: '/onboarding/get-started' },
  { label: 'Your profile', step: 2, path: '/onboarding/join' },
  { label: 'Your org',     step: 3, path: '/onboarding/your-organisation' },
]
</script>

<template>
  <div
    class="h-screen overflow-hidden"
    style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif;"
  >
    <!-- Split: left content + right illustration -->
    <div style="display: flex; height: 100%; overflow: hidden;">

      <!-- ─── LEFT PANEL ──────────────────────────────────────────────────── -->
      <div style="flex: 0 0 50%; width: 50%; min-width: 0; height: 100%; overflow-y: auto; display: flex; flex-direction: column; background: white;">

        <!-- Top bar: logo + step progress -->
        <div class="flex items-center justify-between px-8 pt-7 pb-0 flex-shrink-0">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2.5 flex-shrink-0">
            <div
              class="flex items-center justify-center flex-shrink-0"
              style="width: 34px; height: 34px; border-radius: 10px; background: #E83D59;"
            >
              <svg width="14" height="16" viewBox="0 0 62 67" fill="none">
                <path d="M13.2145 53.3016C14.5055 54.9621 16.1848 55.7909 18.2505 55.7909C20.5458 55.7909 22.3255 54.8765 23.5881 53.0443C24.8498 51.2133 25.4818 48.5812 25.4818 45.1474C25.4818 41.2575 24.8641 37.1516 23.6308 32.8305C22.3967 28.5111 20.6614 24.6337 18.4227 21.2004C16.1266 24.8058 14.3615 28.8691 13.1282 33.3882C11.8933 37.9093 11.2773 42.0294 11.2773 45.7485C11.2773 49.1255 11.923 51.6424 13.2145 53.3016ZM18.8531 5.83651C24.1325 1.94623 29.929 0 36.2427 0C41.236 0 45.6398 1.1885 49.4572 3.56181C53.2734 5.9373 56.229 9.35554 58.3241 13.8187C60.4188 18.2825 61.4669 23.576 61.4669 29.6979C61.4669 39.9412 58.4535 51.7861 52.4275 65.2321H40.2034C43.4739 58.7668 45.9132 52.5589 47.5204 46.6066C49.1264 40.6564 49.9308 35.2772 49.9308 30.4703C49.9308 24.2903 48.6528 19.4275 46.1 15.8788C43.5451 12.3314 39.9153 10.5571 35.21 10.5571C31.8804 10.5571 28.8679 11.4453 26.1706 13.2183C29.6141 17.7967 32.2397 23.0029 34.0476 28.8395C35.8558 34.6761 36.7595 40.0552 36.7595 44.9757C36.7595 49.3252 35.9843 53.0869 34.4353 56.2629C32.8855 59.439 30.718 61.8718 27.9357 63.5582C25.1509 65.2459 21.9231 66.0905 18.2505 66.0905C14.7493 66.0905 11.6219 65.3315 8.86689 63.816C6.11227 62.3004 3.94559 60.0113 2.36727 56.9497C0.788531 53.8889 0 50.1836 0 45.8342C0 40.9137 0.975302 35.4781 2.92716 29.5262C4.87734 23.576 7.63196 18.2825 11.1915 13.6476C8.20651 11.5875 4.9636 10.5571 1.46316 10.5571V0C7.94855 0 13.7442 1.94623 18.8531 5.83651Z" fill="white" />
              </svg>
            </div>
            <img src="/Noeia_logo.svg" alt="Noeia" class="h-[19px] dark:hidden" />
          </NuxtLink>

          <!-- Dev: fill test data (hidden in production) -->
          <button
            v-if="isDev"
            class="ob-fill-btn"
            title="Fill all fields with test data"
            @click="fillTestData"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Fill test data
          </button>

          <!-- Step labels -->
          <div class="flex items-center gap-1.5">
            <template v-for="(m, i) in stepMeta" :key="m.step">
              <div class="flex items-center gap-1.5">
                <!-- Circle: always a link -->
                <NuxtLink
                  :to="m.path"
                  class="flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  :style="{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: currentStep > m.step ? '#E83D59' : currentStep === m.step ? '#E83D59' : 'oklch(0.91 0 0)',
                    textDecoration: 'none',
                  }"
                >
                  <svg v-if="currentStep > m.step" width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5L4.5 9L10 3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span v-else style="font-size: 10px; font-weight: 700;" :style="{ color: currentStep === m.step ? 'white' : 'oklch(0.65 0 0)' }">{{ m.step }}</span>
                </NuxtLink>
                <!-- Label: always a link -->
                <NuxtLink
                  :to="m.path"
                  class="transition-all duration-200 hidden sm:block"
                  style="font-size: 12px; white-space: nowrap; text-decoration: none;"
                  :style="{
                    fontWeight: currentStep === m.step ? '600' : '400',
                    color: currentStep === m.step ? '#E83D59' : currentStep > m.step ? 'oklch(0.5 0 0)' : 'oklch(0.72 0 0)',
                  }"
                >{{ m.label }}</NuxtLink>
              </div>
              <!-- Separator -->
              <svg v-if="i < stepMeta.length - 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.8 0 0)" stroke-width="2">
                <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
          </div>
        </div>

        <!-- Step content -->
        <div class="flex-1 flex flex-col">
          <slot />
        </div>
      </div>

      <!-- ─── RIGHT PANEL: Illustration ─────────────────────────────────── -->
      <div style="flex: 0 0 50%; width: 50%; min-width: 0; height: 100%; overflow: hidden;">
        <IllustrationPanel :current-step="currentStep" />
      </div>

    </div>
  </div>
</template>

<style>
/* Dev helper button */
.ob-fill-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
  color: oklch(0.5 0 0);
  background: transparent;
  border: 1.5px dashed oklch(0.82 0 0);
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', system-ui;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.ob-fill-btn:hover {
  color: #E83D59;
  border-color: rgba(232,61,89,0.4);
  background: rgba(232,61,89,0.04);
}

.ob-slide-enter-active,
.ob-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.ob-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.ob-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.ob-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.ob-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
