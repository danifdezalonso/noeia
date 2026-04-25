<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [val: boolean]; confirm: [] }>()

const router = useRouter()

function startTrial() {
  emit('update:open', false)
  router.replace('/doctor/dashboard/calendar')
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent
      class="max-w-[440px] p-0 overflow-hidden gap-0"
      style="border-radius: 20px; border: 1.5px solid oklch(0.91 0 0); box-shadow: 0 20px 60px rgba(0,0,0,0.14);"
    >

      <!-- Header band -->
      <div class="px-7 pt-7 pb-5" style="background: linear-gradient(135deg, oklch(0.985 0.008 35) 0%, white 100%);">

        <!-- Tier badge -->
        <div class="flex justify-center mb-4">
          <div
            class="inline-flex items-center gap-2 px-3 py-1.5"
            style="background: rgba(232,61,89,0.08); border: 1px solid rgba(232,61,89,0.2); border-radius: 20px;"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E83D59" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style="font-size: 11px; font-weight: 600; color: #E83D59; font-family: 'Plus Jakarta Sans', system-ui;">Clinician plan</span>
          </div>
        </div>

        <DialogHeader class="text-center space-y-2">
          <DialogTitle
            class="text-center leading-tight"
            style="font-size: 24px; font-weight: 700; color: oklch(0.14 0 0); font-family: 'Plus Jakarta Sans', system-ui;"
          >
          Start your 4-day free trial
          </DialogTitle>
          <DialogDescription
            class="text-center"
            style="font-size: 13.5px; color: oklch(0.52 0 0); line-height: 1.6; font-family: 'Plus Jakarta Sans', system-ui;"
          >
            No credit card. No commitment.<br />
            After your trial, continue free or upgrade—your choice.
          </DialogDescription>
        </DialogHeader>
      </div>

      <!-- Feature list -->
      <div class="px-7 py-5" style="border-top: 1px solid oklch(0.94 0 0); border-bottom: 1px solid oklch(0.94 0 0);">
        <ul class="space-y-3">
          <li
            v-for="feature in [
              'Custom scribe templates',
              'Unlimited evidence in sessions',
              'Choose trusted evidence sources',
            ]"
            :key="feature"
            class="flex items-center gap-3"
          >
            <div
              class="flex-shrink-0 flex items-center justify-center"
              style="width: 20px; height: 20px; border-radius: 50%; background: rgba(232,61,89,0.1);"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6.5L4.5 9L10 3" stroke="#E83D59" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <span style="font-size: 13.5px; color: oklch(0.25 0 0); font-family: 'Plus Jakarta Sans', system-ui;">{{ feature }}</span>
          </li>
        </ul>
      </div>

      <!-- CTA -->
      <div class="px-7 py-5">
        <button
          class="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.983]"
          style="height: 48px; border-radius: 12px; background: #E83D59; color: white; font-size: 14px; font-weight: 600; font-family: 'Plus Jakarta Sans', system-ui; box-shadow: 0 4px 16px rgba(232,61,89,0.3);"
          @click="startTrial"
        >
          Start my free trial
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <p class="text-center mt-3" style="font-size: 11.5px; color: oklch(0.62 0 0); font-family: 'Plus Jakarta Sans', system-ui;">
          We'll remind you before the trial ends.
        </p>
      </div>

    </DialogContent>
  </Dialog>
</template>
