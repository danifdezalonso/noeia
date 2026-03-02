<script setup lang="ts">
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'

const router = useRouter()
const { setOrganization } = usePersona()

const currentStep = ref(1)
const direction = ref<'forward' | 'backward'>('forward')
const isComplete = ref(false)
const isShaking = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)
const showPassword = ref(false)
const showConfirm = ref(false)
const isDragging = ref(false)

const form = reactive({
  adminName: '',
  password: '',
  confirmPassword: '',
  heardFrom: '',
  logoPreview: null as string | null,
  clinicName: '',
  inviteEmails: [] as string[],
  inviteInput: '',
  selectedPlan: '' as '' | 'starter' | 'growth' | 'enterprise',
})

// ─── Validation ────────────────────────────────────────────────
const step1Schema = z.object({
  adminName: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
const step2Schema = z.object({
  clinicName: z.string().min(1, 'Clinic name is required'),
})
const step4Schema = z.object({
  selectedPlan: z.string().min(1, 'Please select a plan to continue'),
})

const errors = reactive({ adminName: '', password: '', confirmPassword: '', clinicName: '', selectedPlan: '' })

function clearErrors() {
  errors.adminName = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.clinicName = ''
  errors.selectedPlan = ''
}
function clearError(field: keyof typeof errors) { errors[field] = '' }

function validateStep(): boolean {
  clearErrors()
  if (currentStep.value === 1) {
    const r = step1Schema.safeParse({ adminName: form.adminName, password: form.password, confirmPassword: form.confirmPassword })
    if (!r.success) {
      r.error.errors.forEach(e => {
        const k = String(e.path[0]) as keyof typeof errors
        if (k in errors) errors[k] = e.message
      })
      return false
    }
  } else if (currentStep.value === 2) {
    const r = step2Schema.safeParse({ clinicName: form.clinicName })
    if (!r.success) {
      r.error.errors.forEach(e => {
        const k = String(e.path[0]) as keyof typeof errors
        if (k in errors) errors[k] = e.message
      })
      return false
    }
  } else if (currentStep.value === 4) {
    const r = step4Schema.safeParse({ selectedPlan: form.selectedPlan })
    if (!r.success) {
      r.error.errors.forEach(e => {
        const k = String(e.path[0]) as keyof typeof errors
        if (k in errors) errors[k] = e.message
      })
      return false
    }
  }
  return true
}

function shake() {
  isShaking.value = true
  setTimeout(() => { isShaking.value = false }, 500)
}

const TOTAL = 4
function next() {
  if (!validateStep()) { shake(); return }
  direction.value = 'forward'
  currentStep.value++
}
function back() {
  clearErrors()
  direction.value = 'backward'
  currentStep.value--
}
function skipInvites() {
  direction.value = 'forward'
  currentStep.value++
}
async function finish() {
  if (!validateStep()) { shake(); return }
  setOrganization(form.adminName, form.clinicName)
  isComplete.value = true
  await nextTick()
  fireConfetti()
}
async function fireConfetti() {
  const { default: confetti } = await import('canvas-confetti')
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#E83D59', '#8b5cf6', '#14b8a6', '#f59e0b', '#ec4899'] })
  setTimeout(() => {
    confetti({ particleCount: 60, spread: 120, origin: { y: 0.4, x: 0.2 } })
    confetti({ particleCount: 60, spread: 120, origin: { y: 0.4, x: 0.8 } })
  }, 300)
}
function goToDashboard() { router.push('/organization/dashboard') }

function triggerLogoInput() { logoInput.value?.click() }
function handleFile(file: File) {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = e => { form.logoPreview = e.target?.result as string }
  reader.readAsDataURL(file)
}
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}
function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function addInvite() {
  const email = form.inviteInput.trim()
  if (email && !form.inviteEmails.includes(email)) {
    form.inviteEmails.push(email)
    form.inviteInput = ''
  }
}
function removeInvite(idx: number) { form.inviteEmails.splice(idx, 1) }
function onInviteKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addInvite() }
}

const plans = [
  { id: 'starter' as const, name: 'Starter', price: 'Free', desc: 'Up to 3 doctors, basic reporting, email support.', features: ['3 doctors', 'Calendar', 'Basic billing'], recommended: false },
  { id: 'growth' as const, name: 'Growth', price: '$49/mo', desc: 'Up to 20 doctors, full analytics, priority support.', features: ['20 doctors', 'Advanced analytics', 'Invoicing', 'NoeIA assistant'], recommended: true },
  { id: 'enterprise' as const, name: 'Enterprise', price: 'Custom', desc: 'Unlimited doctors, custom integrations, SLA.', features: ['Unlimited doctors', 'Custom integrations', 'Dedicated support', 'SLA'], recommended: false },
]

const steps = [
  { n: 1, label: 'Credentials' },
  { n: 2, label: 'Clinic' },
  { n: 3, label: 'Invite' },
  { n: 4, label: 'Plan' },
]

const heardFromOptions = ['Google search', 'LinkedIn', 'Referral', 'Conference', 'Social media', 'Other']
</script>

<template>
  <!-- Same grid pattern as login.vue -->
  <div class="h-screen overflow-hidden grid lg:grid-cols-2 bg-background">

    <!-- ── Left column: NO overflow on this grid item ── -->
    <div class="flex flex-col">

      <header class="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <img src="/Noeia_logo_mini.svg" alt="" class="w-4 h-4 brightness-0 invert" />
          </div>
          <img src="/Noeia_logo.svg" alt="Noeia" class="h-5 dark:hidden" />
          <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-5 hidden dark:block" />
        </NuxtLink>
        <button
          type="button"
          class="px-2.5 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
          @click="router.push('/organization/dashboard')"
        >
          [DEV] Skip
        </button>
      </header>

      <!-- Nested element owns the overflow -->
      <div class="flex-1 overflow-y-auto">
        <div class="min-h-full flex flex-col items-center justify-center px-6 py-10">

          <!-- Success -->
          <div v-if="isComplete" class="text-center max-w-sm w-full">
            <div class="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-foreground mb-2">
              Welcome{{ form.clinicName ? ', ' + form.clinicName : '' }}!
            </h2>
            <p class="text-muted-foreground text-sm mb-8 leading-relaxed">
              Your clinic dashboard is ready. Manage doctors, patients, and billing all in one place.
            </p>
            <Button class="w-full" size="lg" @click="goToDashboard">Go to Dashboard →</Button>
          </div>

          <!-- Wizard -->
          <template v-if="!isComplete">

            <!-- Stepper -->
            <div class="w-full max-w-md mb-8">
              <div class="flex items-start">
                <template v-for="(step, idx) in steps" :key="step.n">
                  <div class="flex flex-col items-center gap-1">
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4"
                      :class="currentStep > step.n
                        ? 'bg-primary text-primary-foreground ring-primary/15'
                        : currentStep === step.n
                          ? 'bg-primary/10 text-primary ring-primary/15 border-2 border-primary'
                          : 'bg-muted text-muted-foreground ring-transparent border border-border'"
                    >
                      <svg v-if="currentStep > step.n" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span v-else>{{ step.n }}</span>
                    </div>
                    <span class="text-[10px] font-semibold uppercase tracking-wide"
                      :class="currentStep === step.n ? 'text-primary' : 'text-muted-foreground/50'">
                      {{ step.label }}
                    </span>
                  </div>
                  <div v-if="idx < steps.length - 1"
                    class="flex-1 h-px mt-4 mx-1 rounded-full transition-all duration-500"
                    :class="currentStep > step.n ? 'bg-primary' : 'bg-border'" />
                </template>
              </div>
            </div>

            <!-- Form card -->
            <div class="w-full max-w-md" :class="{ shake: isShaking }">
              <Transition :name="direction === 'forward' ? 'slide-left' : 'slide-right'" mode="out-in">
                <div :key="currentStep" class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

                  <!-- Step title + description -->
                  <div class="px-6 pt-6 pb-4 border-b border-border">
                    <template v-if="currentStep === 1">
                      <h2 class="text-base font-semibold text-foreground">Admin Credentials</h2>
                      <p class="text-sm text-muted-foreground mt-0.5">Create your admin account to manage the organization.</p>
                    </template>
                    <template v-else-if="currentStep === 2">
                      <h2 class="text-base font-semibold text-foreground">Clinic Profile</h2>
                      <p class="text-sm text-muted-foreground mt-0.5">Set up your clinic's identity — visible across the platform.</p>
                    </template>
                    <template v-else-if="currentStep === 3">
                      <h2 class="text-base font-semibold text-foreground">Invite Doctors</h2>
                      <p class="text-sm text-muted-foreground mt-0.5">Add doctors to your clinic. They'll receive an invitation email.</p>
                    </template>
                    <template v-else>
                      <h2 class="text-base font-semibold text-foreground">Choose a Plan</h2>
                      <p class="text-sm text-muted-foreground mt-0.5">Select the plan that fits your needs. Change it anytime.</p>
                    </template>
                  </div>

                  <!-- Step body -->
                  <div class="px-6 py-5 space-y-4">

                    <!-- Step 1: Credentials -->
                    <template v-if="currentStep === 1">

                      <div class="space-y-1.5">
                        <Label for="adminName">Admin name <span class="text-destructive">*</span></Label>
                        <Input
                          id="adminName"
                          v-model="form.adminName"
                          type="text"
                          placeholder="Your full name"
                          :class="errors.adminName
                            ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive/30'
                            : form.adminName.length >= 2 ? 'border-primary/50' : ''"
                          @input="clearError('adminName')"
                        />
                        <p v-if="errors.adminName" class="flex items-center gap-1.5 text-destructive text-xs font-medium">
                          <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                          {{ errors.adminName }}
                        </p>
                      </div>

                      <div class="space-y-1.5">
                        <Label for="password">Password <span class="text-destructive">*</span></Label>
                        <div class="relative">
                          <Input
                            id="password"
                            v-model="form.password"
                            :type="showPassword ? 'text' : 'password'"
                            placeholder="Min. 8 characters"
                            class="pr-10"
                            :class="errors.password ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive/30' : ''"
                            @input="clearError('password')"
                          />
                          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" @click="showPassword = !showPassword">
                            <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
                          </button>
                        </div>
                        <p v-if="errors.password" class="flex items-center gap-1.5 text-destructive text-xs font-medium">
                          <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                          {{ errors.password }}
                        </p>
                      </div>

                      <div class="space-y-1.5">
                        <Label for="confirmPassword">Confirm password <span class="text-destructive">*</span></Label>
                        <div class="relative">
                          <Input
                            id="confirmPassword"
                            v-model="form.confirmPassword"
                            :type="showConfirm ? 'text' : 'password'"
                            placeholder="Repeat your password"
                            class="pr-10"
                            :class="errors.confirmPassword
                              ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive/30'
                              : form.confirmPassword && form.confirmPassword === form.password ? 'border-primary/50' : ''"
                            @input="clearError('confirmPassword')"
                          />
                          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" @click="showConfirm = !showConfirm">
                            <component :is="showConfirm ? EyeOff : Eye" class="w-4 h-4" />
                          </button>
                        </div>
                        <p v-if="errors.confirmPassword" class="flex items-center gap-1.5 text-destructive text-xs font-medium">
                          <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                          {{ errors.confirmPassword }}
                        </p>
                      </div>

                      <div class="space-y-1.5">
                        <Label>Where did you hear about us? <span class="text-muted-foreground text-xs font-normal">(optional)</span></Label>
                        <Select v-model="form.heardFrom">
                          <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem v-for="opt in heardFromOptions" :key="opt" :value="opt">{{ opt }}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                    </template>

                    <!-- Step 2: Clinic Profile -->
                    <template v-else-if="currentStep === 2">

                      <div class="space-y-2">
                        <Label>Clinic logo <span class="text-muted-foreground text-xs font-normal">(optional)</span></Label>
                        <div class="flex items-center gap-4">
                          <div
                            @click="triggerLogoInput"
                            @dragover.prevent="isDragging = true"
                            @dragleave="isDragging = false"
                            @drop.prevent="onDrop"
                            class="w-20 h-20 rounded-full border-2 border-dashed cursor-pointer overflow-hidden flex items-center justify-center shrink-0 transition-all"
                            :class="isDragging ? 'border-primary bg-primary/5' : form.logoPreview ? 'border-transparent' : 'border-border hover:border-primary/40 hover:bg-muted/30'"
                          >
                            <img v-if="form.logoPreview" :src="form.logoPreview" class="w-full h-full object-cover" alt="Logo" />
                            <svg v-else class="w-6 h-6 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                            </svg>
                          </div>
                          <div class="space-y-1">
                            <button type="button" @click="triggerLogoInput" class="text-sm text-primary hover:text-primary/80 font-medium transition-colors block">
                              {{ form.logoPreview ? 'Change logo' : 'Upload logo' }}
                            </button>
                            <p class="text-xs text-muted-foreground">JPG, PNG or SVG · Max 5 MB</p>
                            <p class="text-xs text-muted-foreground">Shown in reports and patient portal</p>
                            <button v-if="form.logoPreview" type="button" @click="form.logoPreview = null" class="text-xs text-muted-foreground hover:text-destructive transition-colors">Remove</button>
                          </div>
                        </div>
                        <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                      </div>

                      <div class="space-y-1.5">
                        <Label for="clinicName">Clinic name <span class="text-destructive">*</span></Label>
                        <Input
                          id="clinicName"
                          v-model="form.clinicName"
                          type="text"
                          placeholder="MindCare Clinics"
                          :class="errors.clinicName
                            ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive/30'
                            : form.clinicName ? 'border-primary/50' : ''"
                          @input="clearError('clinicName')"
                        />
                        <p v-if="errors.clinicName" class="flex items-center gap-1.5 text-destructive text-xs font-medium">
                          <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                          {{ errors.clinicName }}
                        </p>
                      </div>

                    </template>

                    <!-- Step 3: Invite -->
                    <template v-else-if="currentStep === 3">

                      <div class="space-y-1.5">
                        <Label>Doctor email</Label>
                        <div class="flex gap-2">
                          <Input v-model="form.inviteInput" type="email" placeholder="doctor@clinic.com" class="flex-1" @keydown="onInviteKeydown" />
                          <Button variant="outline" @click="addInvite">Add</Button>
                        </div>
                        <p class="text-xs text-muted-foreground">Press Enter or comma to add multiple</p>
                      </div>

                      <div v-if="form.inviteEmails.length > 0" class="flex flex-wrap gap-2">
                        <div v-for="(email, idx) in form.inviteEmails" :key="email"
                          class="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                          {{ email }}
                          <button type="button" @click="removeInvite(idx)" class="text-primary/50 hover:text-primary transition-colors">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      </div>

                      <div v-if="form.inviteEmails.length === 0" class="rounded-xl border border-dashed border-border p-5 text-center">
                        <p class="text-sm text-muted-foreground">No doctors added yet</p>
                        <p class="text-xs text-muted-foreground/60 mt-0.5">Add emails above or skip for now</p>
                      </div>

                    </template>

                    <!-- Step 4: Plan -->
                    <template v-else-if="currentStep === 4">

                      <div class="space-y-2.5">
                        <div v-for="plan in plans" :key="plan.id"
                          @click="form.selectedPlan = plan.id; clearError('selectedPlan')"
                          class="relative cursor-pointer rounded-xl border-2 p-4 transition-all"
                          :class="form.selectedPlan === plan.id
                            ? 'border-primary bg-primary/5'
                            : errors.selectedPlan ? 'border-destructive/30' : 'border-border hover:border-border/70'"
                        >
                          <div v-if="plan.recommended" class="absolute -top-2.5 left-1/2 -translate-x-1/2">
                            <span class="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">Recommended</span>
                          </div>
                          <div class="flex items-start justify-between gap-3">
                            <div class="flex-1">
                              <div class="flex items-center gap-2 mb-0.5">
                                <p class="font-semibold text-foreground text-sm">{{ plan.name }}</p>
                                <span class="text-sm font-bold" :class="form.selectedPlan === plan.id ? 'text-primary' : 'text-muted-foreground'">{{ plan.price }}</span>
                              </div>
                              <p class="text-xs text-muted-foreground mb-2">{{ plan.desc }}</p>
                              <div class="flex flex-wrap gap-1.5">
                                <span v-for="f in plan.features" :key="f"
                                  class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                  :class="form.selectedPlan === plan.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'">{{ f }}</span>
                              </div>
                            </div>
                            <div class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5"
                              :class="form.selectedPlan === plan.id ? 'border-primary' : 'border-border'">
                              <div v-if="form.selectedPlan === plan.id" class="w-2.5 h-2.5 rounded-full bg-primary" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <p v-if="errors.selectedPlan" class="flex items-center gap-1.5 text-destructive text-xs font-medium">
                        <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        {{ errors.selectedPlan }}
                      </p>

                    </template>

                  </div>

                  <!-- Footer: navigation -->
                  <div class="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
                    <Button v-if="currentStep > 1" variant="outline" size="sm" class="gap-1.5" @click="back">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"/></svg>
                      Back
                    </Button>
                    <div v-else />

                    <div class="flex items-center gap-3">
                      <span class="text-xs text-muted-foreground">{{ currentStep }} of {{ TOTAL }}</span>
                      <button v-if="currentStep === 3" type="button" @click="skipInvites" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Skip</button>
                      <Button v-if="currentStep < TOTAL" size="sm" class="gap-1.5" @click="next">
                        Next
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                      </Button>
                      <Button v-else size="sm" class="gap-1.5" @click="finish">
                        Finish setup
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      </Button>
                    </div>
                  </div>

                </div>
              </Transition>
            </div>

          </template>
        </div>
      </div>
    </div><!-- ── end left ── -->

    <!-- ── Right: brand panel ── -->
    <div class="hidden lg:flex flex-col justify-between bg-sidebar border-l border-border px-10 py-10 relative overflow-hidden">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      <div class="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-primary/8 blur-[100px] pointer-events-none" />

      <div class="relative">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <img src="/Noeia_logo_mini.svg" alt="" class="w-5 h-5 brightness-0 invert" />
          </div>
          <img src="/Noeia_logo.svg" alt="Noeia" class="h-6 dark:hidden" />
          <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-6 hidden dark:block" />
        </NuxtLink>
      </div>

      <div class="relative max-w-sm">
        <h2 class="text-3xl font-bold text-foreground leading-snug mb-4">
          Manage your clinic,<br />
          <span class="text-primary">from one place.</span>
        </h2>
        <p class="text-muted-foreground text-sm leading-relaxed mb-8">
          Invite doctors, track billing, and manage schedules — all in a single dashboard built for modern healthcare organizations.
        </p>
        <div class="flex flex-wrap gap-2">
          <span v-for="f in ['Multi-doctor', 'Billing automation', 'Team management', 'Analytics']" :key="f"
            class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">{{ f }}</span>
        </div>
      </div>

      <div class="relative border-t border-border pt-8">
        <blockquote class="text-sm text-muted-foreground leading-relaxed italic mb-4">
          "Noeia gave us visibility across all our clinics in one dashboard. Billing, scheduling, team management — all connected."
        </blockquote>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span class="text-xs font-bold text-primary">EM</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">Elena Marcos</p>
            <p class="text-xs text-muted-foreground">Operations Director · MindCare Clinics</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from  { transform: translateX(36px); opacity: 0; }
.slide-left-leave-to    { transform: translateX(-36px); opacity: 0; }
.slide-right-enter-from { transform: translateX(-36px); opacity: 0; }
.slide-right-leave-to   { transform: translateX(36px); opacity: 0; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-5px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}
.shake { animation: shake 0.4s ease; }
</style>
