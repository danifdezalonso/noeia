<script setup lang="ts">
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const { setOrganization } = usePersona()

// ─── Local state ───────────────────────────────────────────────────────────
const currentStep = ref(1)
const direction = ref<'forward' | 'backward'>('forward')
const isComplete = ref(false)
const isShaking = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)
const showPassword = ref(false)
const showConfirm = ref(false)

// Form fields
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

const isDragging = ref(false)

// ─── Validation ────────────────────────────────────────────────────────────
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
  selectedPlan: z.string().min(1, 'Please select a plan'),
})

const errors = reactive<Record<string, string>>({})

function clearErrors() { Object.keys(errors).forEach(k => delete errors[k]) }
function clearError(field: string) { delete errors[field] }

function validateStep(): boolean {
  clearErrors()
  if (currentStep.value === 1) {
    const r = step1Schema.safeParse({ adminName: form.adminName, password: form.password, confirmPassword: form.confirmPassword })
    if (!r.success) { r.error.errors.forEach(e => { errors[String(e.path[0])] = e.message }); return false }
  } else if (currentStep.value === 2) {
    const r = step2Schema.safeParse({ clinicName: form.clinicName })
    if (!r.success) { r.error.errors.forEach(e => { errors[String(e.path[0])] = e.message }); return false }
  } else if (currentStep.value === 4) {
    const r = step4Schema.safeParse({ selectedPlan: form.selectedPlan })
    if (!r.success) { r.error.errors.forEach(e => { errors[String(e.path[0])] = e.message }); return false }
  }
  return true
}

function shake() {
  isShaking.value = true
  setTimeout(() => { isShaking.value = false }, 500)
}

// ─── Navigation ────────────────────────────────────────────────────────────
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
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#6366f1', '#8b5cf6', '#14b8a6', '#f59e0b', '#ec4899'] })
  setTimeout(() => {
    confetti({ particleCount: 60, spread: 120, origin: { y: 0.4, x: 0.2 } })
    confetti({ particleCount: 60, spread: 120, origin: { y: 0.4, x: 0.8 } })
  }, 300)
}

function goToDashboard() {
  router.push('/organization/dashboard')
}

// ─── Logo upload ───────────────────────────────────────────────────────────
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

// ─── Invite chips ──────────────────────────────────────────────────────────
function addInvite() {
  const email = form.inviteInput.trim()
  if (email && !form.inviteEmails.includes(email)) {
    form.inviteEmails.push(email)
    form.inviteInput = ''
  }
}
function removeInvite(idx: number) {
  form.inviteEmails.splice(idx, 1)
}
function onInviteKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addInvite() }
}

// ─── Plans ────────────────────────────────────────────────────────────────
const plans = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 'Free',
    desc: 'Up to 3 doctors, basic reporting, email support.',
    features: ['3 doctors', 'Calendar', 'Basic billing'],
    recommended: false,
  },
  {
    id: 'growth' as const,
    name: 'Growth',
    price: '$49/mo',
    desc: 'Up to 20 doctors, full analytics, priority support.',
    features: ['20 doctors', 'Advanced analytics', 'Invoicing', 'NoeIA assistant'],
    recommended: true,
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Unlimited doctors, custom integrations, SLA.',
    features: ['Unlimited doctors', 'Custom integrations', 'Dedicated support', 'SLA'],
    recommended: false,
  },
]

// ─── Stepper meta ──────────────────────────────────────────────────────────
const steps = [
  { n: 1, label: 'Credentials' },
  { n: 2, label: 'Clinic' },
  { n: 3, label: 'Invite' },
  { n: 4, label: 'Plan' },
]

const heardFromOptions = [
  'Google search', 'LinkedIn', 'Referral', 'Conference', 'Social media', 'Other',
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">

    <!-- Top bar -->
    <header class="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
      <img src="/Noeia_logo.svg" alt="Noeia" class="h-7" />
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          title="Dev only — skip onboarding"
          @click="router.push('/organization/dashboard')"
        >
          [DEV] Skip
        </button>
        <span class="text-slate-400 text-sm">Organization Onboarding</span>
      </div>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center px-4 py-10">

      <!-- ── Success ── -->
      <Transition name="fade">
        <div v-if="isComplete" class="text-center max-w-sm mx-auto">
          <div class="w-20 h-20 rounded-full bg-teal-100 border-2 border-teal-300 flex items-center justify-center mx-auto mb-6 animate-bounce-once">
            <svg class="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 mb-2">
            Welcome to Noeia{{ form.clinicName ? ', ' + form.clinicName : '' }}!
          </h2>
          <p class="text-slate-500 text-sm mb-8 leading-relaxed">
            Your clinic dashboard is ready. Manage your doctors, patients, and billing all in one place.
          </p>
          <button
            type="button"
            @click="goToDashboard"
            class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all"
          >
            Go to Dashboard →
          </button>
        </div>
      </Transition>

      <!-- ── Onboarding ── -->
      <template v-if="!isComplete">

        <!-- Stepper -->
        <div class="w-full max-w-lg mb-8">
          <div class="flex items-center justify-between">
            <template v-for="(step, idx) in steps" :key="step.n">
              <div class="flex flex-col items-center gap-1.5">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300"
                  :class="currentStep > step.n
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : currentStep === step.n
                      ? 'bg-white border-indigo-600 text-indigo-600'
                      : 'bg-white border-slate-200 text-slate-400'"
                >
                  <svg v-if="currentStep > step.n" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span v-else>{{ step.n }}</span>
                </div>
                <span class="text-xs hidden sm:block transition-colors duration-300"
                  :class="currentStep === step.n ? 'text-indigo-600 font-medium' : currentStep > step.n ? 'text-slate-500' : 'text-slate-300'">
                  {{ step.label }}
                </span>
              </div>
              <div v-if="idx < steps.length - 1" class="flex-1 h-0.5 mx-2 transition-all duration-500"
                :class="currentStep > step.n ? 'bg-indigo-600' : 'bg-slate-200'" />
            </template>
          </div>
        </div>

        <!-- Form card + nav -->
        <div class="w-full max-w-lg">
          <Transition :name="direction === 'forward' ? 'slide-left' : 'slide-right'" mode="out-in">
            <div :key="currentStep" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

              <!-- ── Step 1: Credentials ── -->
              <template v-if="currentStep === 1">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-slate-900">Admin Credentials</h2>
                  <p class="text-slate-500 text-sm mt-1">Create your admin account to manage the organization.</p>
                </div>
                <div class="space-y-5">

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Admin name <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="form.adminName"
                      @input="clearError('adminName')"
                      type="text"
                      placeholder="Your full name"
                      class="w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      :class="errors.adminName
                        ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                        : form.adminName.length >= 2
                          ? 'bg-white border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50'
                          : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'"
                    />
                    <Transition name="err">
                      <p v-if="errors.adminName" class="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        {{ errors.adminName }}
                      </p>
                    </Transition>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Password <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        v-model="form.password"
                        @input="clearError('password')"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="Min. 8 characters"
                        class="w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all pr-10 placeholder:text-slate-400"
                        :class="errors.password
                          ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                          : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'"
                      />
                      <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" @click="showPassword = !showPassword">
                        <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
                      </button>
                    </div>
                    <Transition name="err">
                      <p v-if="errors.password" class="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        {{ errors.password }}
                      </p>
                    </Transition>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Confirm password <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        v-model="form.confirmPassword"
                        @input="clearError('confirmPassword')"
                        :type="showConfirm ? 'text' : 'password'"
                        placeholder="Repeat your password"
                        class="w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all pr-10 placeholder:text-slate-400"
                        :class="errors.confirmPassword
                          ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                          : form.confirmPassword && form.confirmPassword === form.password
                            ? 'bg-white border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50'
                            : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'"
                      />
                      <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" @click="showConfirm = !showConfirm">
                        <component :is="showConfirm ? EyeOff : Eye" class="w-4 h-4" />
                      </button>
                    </div>
                    <Transition name="err">
                      <p v-if="errors.confirmPassword" class="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        {{ errors.confirmPassword }}
                      </p>
                    </Transition>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Where did you hear about us? <span class="text-slate-400 text-xs font-normal">(optional)</span>
                    </label>
                    <select
                      v-model="form.heardFrom"
                      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all text-slate-700"
                    >
                      <option value="">Select an option</option>
                      <option v-for="opt in heardFromOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>

                </div>
              </template>

              <!-- ── Step 2: Clinic Profile ── -->
              <template v-else-if="currentStep === 2">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-slate-900">Clinic Profile</h2>
                  <p class="text-slate-500 text-sm mt-1">Set up your clinic's identity. This will appear across the platform.</p>
                </div>
                <div class="space-y-6">

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-3">
                      Clinic logo <span class="text-slate-400 text-xs font-normal">(optional)</span>
                    </label>
                    <div class="flex items-center gap-5">
                      <div
                        @click="triggerLogoInput"
                        @dragover.prevent="isDragging = true"
                        @dragleave="isDragging = false"
                        @drop.prevent="onDrop"
                        class="w-24 h-24 rounded-full border-2 border-dashed cursor-pointer overflow-hidden flex items-center justify-center flex-shrink-0 transition-all"
                        :class="isDragging ? 'border-indigo-400 bg-indigo-50' : form.logoPreview ? 'border-transparent' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'"
                      >
                        <img v-if="form.logoPreview" :src="form.logoPreview" class="w-full h-full object-cover" alt="Logo preview" />
                        <div v-else class="text-center px-2">
                          <svg class="w-6 h-6 text-slate-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                          </svg>
                          <p class="text-[10px] text-slate-400 leading-tight">Click or drop</p>
                        </div>
                      </div>
                      <div>
                        <button type="button" @click="triggerLogoInput" class="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                          {{ form.logoPreview ? 'Change logo' : 'Upload logo' }}
                        </button>
                        <p class="text-xs text-slate-400 mt-1">JPG, PNG or SVG · Max 5MB</p>
                        <p class="text-xs text-slate-400">Shown in reports and portal</p>
                        <button v-if="form.logoPreview" type="button" @click="form.logoPreview = null" class="text-xs text-slate-400 hover:text-rose-500 transition-colors mt-1">
                          Remove
                        </button>
                      </div>
                    </div>
                    <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Clinic name <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="form.clinicName"
                      @input="clearError('clinicName')"
                      type="text"
                      placeholder="MindCare Clinics"
                      class="w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      :class="errors.clinicName
                        ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                        : form.clinicName
                          ? 'bg-white border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50'
                          : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'"
                    />
                    <Transition name="err">
                      <p v-if="errors.clinicName" class="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        {{ errors.clinicName }}
                      </p>
                    </Transition>
                  </div>

                </div>
              </template>

              <!-- ── Step 3: Invite Doctors ── -->
              <template v-else-if="currentStep === 3">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-slate-900">Invite Doctors</h2>
                  <p class="text-slate-500 text-sm mt-1">Add doctors to your clinic. They'll receive an invitation email.</p>
                </div>
                <div class="space-y-4">

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Doctor email</label>
                    <div class="flex gap-2">
                      <input
                        v-model="form.inviteInput"
                        type="email"
                        placeholder="doctor@clinic.com"
                        class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-slate-400"
                        @keydown="onInviteKeydown"
                      />
                      <button
                        type="button"
                        @click="addInvite"
                        class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <p class="text-xs text-slate-400 mt-1.5">Press Enter or comma to add multiple</p>
                  </div>

                  <!-- Email chips -->
                  <div v-if="form.inviteEmails.length > 0" class="flex flex-wrap gap-2">
                    <div
                      v-for="(email, idx) in form.inviteEmails"
                      :key="email"
                      class="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      {{ email }}
                      <button type="button" @click="removeInvite(idx)" class="text-indigo-400 hover:text-indigo-700 transition-colors">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div v-if="form.inviteEmails.length === 0" class="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <p class="text-sm text-slate-400">No doctors added yet</p>
                    <p class="text-xs text-slate-300 mt-1">Add emails above or skip for now</p>
                  </div>

                </div>
              </template>

              <!-- ── Step 4: Subscription ── -->
              <template v-else-if="currentStep === 4">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-slate-900">Choose a Plan</h2>
                  <p class="text-slate-500 text-sm mt-1">Select the plan that fits your clinic's needs. You can change it later.</p>
                </div>

                <div class="space-y-3">
                  <div
                    v-for="plan in plans"
                    :key="plan.id"
                    @click="form.selectedPlan = plan.id; clearError('selectedPlan')"
                    class="relative cursor-pointer rounded-xl border-2 p-4 transition-all"
                    :class="form.selectedPlan === plan.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'"
                  >
                    <!-- Recommended badge -->
                    <div v-if="plan.recommended" class="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span class="bg-indigo-600 text-white text-[10px] font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
                        Recommended
                      </span>
                    </div>

                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <p class="font-semibold text-slate-900">{{ plan.name }}</p>
                          <span class="text-sm font-bold" :class="form.selectedPlan === plan.id ? 'text-indigo-600' : 'text-slate-500'">
                            {{ plan.price }}
                          </span>
                        </div>
                        <p class="text-xs text-slate-500 mb-2">{{ plan.desc }}</p>
                        <div class="flex flex-wrap gap-1.5">
                          <span v-for="f in plan.features" :key="f" class="text-[10px] font-medium px-2 py-0.5 rounded-full" :class="form.selectedPlan === plan.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'">
                            {{ f }}
                          </span>
                        </div>
                      </div>
                      <!-- Radio indicator -->
                      <div class="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5" :class="form.selectedPlan === plan.id ? 'border-indigo-600' : 'border-slate-300'">
                        <div v-if="form.selectedPlan === plan.id" class="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <Transition name="err">
                  <p v-if="errors.selectedPlan" class="flex items-center gap-1.5 text-rose-500 text-xs mt-3">
                    <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    {{ errors.selectedPlan }}
                  </p>
                </Transition>

              </template>

            </div>
          </Transition>

          <!-- Navigation -->
          <div class="flex items-center justify-between mt-5">
            <button
              v-if="currentStep > 1"
              type="button"
              @click="back"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 text-sm font-medium transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
              </svg>
              Back
            </button>
            <div v-else />

            <div class="flex items-center gap-3">
              <!-- Skip for now (step 3 only) -->
              <button
                v-if="currentStep === 3"
                type="button"
                @click="skipInvites"
                class="text-slate-400 hover:text-slate-600 text-sm transition-colors px-2"
              >
                Skip for now
              </button>

              <button
                v-if="currentStep < TOTAL"
                type="button"
                @click="next"
                class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:shadow-indigo-200"
                :class="{ shake: isShaking }"
              >
                Next
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </button>

              <button
                v-else
                type="button"
                @click="finish"
                class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:shadow-indigo-200"
                :class="{ shake: isShaking }"
              >
                Finish setup
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
            </div>
          </div>

          <p class="text-center text-slate-400 text-xs mt-5">Step {{ currentStep }} of {{ TOTAL }}</p>
        </div>

      </template>
    </main>
  </div>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from  { transform: translateX(48px); opacity: 0; }
.slide-left-leave-to    { transform: translateX(-48px); opacity: 0; }
.slide-right-enter-from { transform: translateX(-48px); opacity: 0; }
.slide-right-leave-to   { transform: translateX(48px); opacity: 0; }

.err-enter-active { transition: all 0.2s ease-out; }
.err-leave-active { transition: all 0.15s ease-in; }
.err-enter-from, .err-leave-to { opacity: 0; transform: translateY(-4px); }

.fade-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.fade-enter-from   { opacity: 0; transform: scale(0.95); }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}
.shake { animation: shake 0.45s ease; }

@keyframes bounce-once {
  0%, 100% { transform: translateY(0); }
  40%       { transform: translateY(-12px); }
  60%       { transform: translateY(-6px); }
}
.animate-bounce-once { animation: bounce-once 0.8s ease 0.2s both; }
</style>
