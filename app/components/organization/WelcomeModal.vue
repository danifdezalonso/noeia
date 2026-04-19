<script setup lang="ts">
import {
  Stethoscope, Users, CalendarDays, ArrowRight, Check, Sparkles,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  Dialog, DialogContent,
} from '~/components/ui/dialog'

const props = defineProps<{ open: boolean; centerName: string }>()
const emit  = defineEmits<{ 'update:open': [v: boolean] }>()

const currentStep = ref(0)

watch(() => props.open, (v) => { if (v) currentStep.value = 0 })

const steps = [
  {
    icon: Stethoscope,
    color: 'bg-violet-100 text-violet-600',
    ring:  'ring-violet-200',
    num:   'bg-violet-600',
    title: 'Add your professionals',
    description:
      'Invite the doctors, psychologists, and therapists who will work in this centre. You can set their role, specialties, rates, and public profile.',
    cta: 'Go to Doctors',
    path: '/organization/dashboard/doctors',
    hint: 'You can always add more later from the Team section.',
  },
  {
    icon: Users,
    color: 'bg-sky-100 text-sky-600',
    ring:  'ring-sky-200',
    num:   'bg-sky-600',
    title: 'Register your first patient',
    description:
      'Add patients to the centre and assign them to a professional. Each patient gets their own profile with clinical history, sessions, tasks, and billing.',
    cta: 'Go to Patients',
    path: '/organization/dashboard/patients',
    hint: 'Patient data is kept private and accessible only to assigned professionals.',
  },
  {
    icon: CalendarDays,
    color: 'bg-emerald-100 text-emerald-600',
    ring:  'ring-emerald-200',
    num:   'bg-emerald-600',
    title: 'Schedule your first session',
    description:
      'Open the calendar to book sessions for your patients. You can set recurring appointments, manage availability per professional, and track attendance.',
    cta: 'Go to Calendar',
    path: '/organization/dashboard/calendar',
    hint: 'Sessions automatically link to patient records and generate invoices.',
  },
]

const isLast = computed(() => currentStep.value === steps.length - 1)

function next() {
  if (isLast.value) {
    emit('update:open', false)
  } else {
    currentStep.value++
  }
}

function goTo(path: string) {
  emit('update:open', false)
  navigateTo(path)
}

function skip() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent
      class="max-w-lg p-0 overflow-hidden gap-0"
      :show-close-button="false"
    >
      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <div class="relative bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent px-8 pt-8 pb-6 border-b border-border">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <Sparkles class="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span class="text-xs font-semibold text-primary uppercase tracking-wider">Noeia</span>
        </div>
        <h2 class="text-2xl font-bold text-foreground leading-tight">
          Welcome to<br />
          <span class="text-primary">{{ centerName }}</span> 🎉
        </h2>
        <p class="text-sm text-muted-foreground mt-2 leading-relaxed">
          Your new centre is ready. Here's how to get up and running in three simple steps.
        </p>

        <!-- Progress dots -->
        <div class="flex items-center gap-2 mt-5">
          <div
            v-for="(_, i) in steps"
            :key="i"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="[
              i === currentStep ? 'w-6 bg-primary' : 'w-1.5',
              i < currentStep  ? 'bg-primary/40' : i > currentStep ? 'bg-muted-foreground/20' : '',
            ]"
          />
        </div>
      </div>

      <!-- ── Step content ────────────────────────────────────────────────── -->
      <div class="px-8 py-7">
        <TransitionGroup name="step">
          <div v-for="(step, i) in steps" :key="i">
            <div v-if="i === currentStep" class="space-y-5">

              <!-- Step header -->
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ring-4"
                  :class="[step.color, step.ring]"
                >
                  <component :is="step.icon" class="w-5 h-5" />
                </div>
                <div class="pt-0.5">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Step {{ i + 1 }} of {{ steps.length }}
                    </span>
                    <!-- Completed ticks -->
                    <span
                      v-for="j in i"
                      :key="j"
                      class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100"
                    >
                      <Check class="w-2.5 h-2.5 text-emerald-600" />
                    </span>
                  </div>
                  <h3 class="text-lg font-bold text-foreground leading-tight">{{ step.title }}</h3>
                </div>
              </div>

              <!-- Description -->
              <p class="text-sm text-muted-foreground leading-relaxed">{{ step.description }}</p>

              <!-- Hint -->
              <div class="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-muted/40 border border-border">
                <span class="text-[11px] text-muted-foreground leading-relaxed">💡 {{ step.hint }}</span>
              </div>

            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- ── Footer ─────────────────────────────────────────────────────── -->
      <div class="px-8 pb-7 flex items-center justify-between gap-3 border-t border-border pt-5">
        <button
          class="text-xs text-muted-foreground hover:text-foreground transition-colors"
          @click="skip"
        >
          Skip setup
        </button>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            class="text-xs gap-1.5"
            @click="goTo(steps[currentStep].path)"
          >
            {{ steps[currentStep].cta }}
          </Button>
          <Button size="sm" class="gap-1.5 text-xs" @click="next">
            {{ isLast ? 'Get started' : 'Next' }}
            <ArrowRight class="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

    </DialogContent>
  </Dialog>
</template>

<style scoped>
.step-enter-active,
.step-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
.step-leave-active {
  position: absolute;
}
</style>
