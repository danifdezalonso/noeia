<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Star, Check, ArrowRight } from 'lucide-vue-next'

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
            <Star class="w-3 h-3 text-primary fill-primary" />
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
            <div class="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary">
              <Check class="w-2.5 h-2.5" />
            </div>
            <span style="font-size: 13.5px; color: oklch(0.25 0 0); font-family: 'Plus Jakarta Sans', system-ui;">{{ feature }}</span>
          </li>
        </ul>
      </div>

      <!-- CTA -->
      <div class="px-7 py-5">
        <Button class="w-full gap-2" size="lg" @click="startTrial">
          Start my free trial
          <ArrowRight class="w-4 h-4" />
        </Button>
        <p class="text-center mt-3" style="font-size: 11.5px; color: oklch(0.62 0 0); font-family: 'Plus Jakarta Sans', system-ui;">
          We'll remind you before the trial ends.
        </p>
      </div>

    </DialogContent>
  </Dialog>
</template>
