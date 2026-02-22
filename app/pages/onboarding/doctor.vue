<script setup lang="ts">
import { z } from 'zod'

const router = useRouter()
const { setDoctor } = usePersona()

// ─── Local state (plain ref — no SSR useState for UI nav) ─────────
const currentStep = ref(1)
const direction = ref<'forward' | 'backward'>('forward')
const isComplete = ref(false)
const isShaking = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isEmailReadOnly = ref(false)

// Form fields
const form = reactive({
  full_name: '',
  email: '',
  dob: '',
  profile_picture: null as string | null,
  description: '',
  specialty: '',
  contact_phone: '',
  contact_phone_code: '+1',
  contact_email: '',
})

// Pre-fill from invite link
const route = useRoute()
onMounted(() => {
  const emailParam = route.query.email as string
  if (emailParam) {
    form.email = emailParam
    form.contact_email = emailParam
    if (route.query.invite === 'true') isEmailReadOnly.value = true
  }
})

// ─── Validation ────────────────────────────────────────────────────
const step1Schema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  dob: z.string().min(1, 'Date of birth is required'),
})
const step3Schema = z.object({
  specialty: z.string().min(1, 'Please select your specialization'),
})
const step4Schema = z.object({
  contact_email: z.string().email('Enter a valid email address'),
})

const errors = reactive<Record<string, string>>({})

function clearErrors() {
  Object.keys(errors).forEach(k => delete errors[k])
}
function clearError(field: string) {
  delete errors[field]
}

function validateStep(): boolean {
  clearErrors()

  if (currentStep.value === 1) {
    const r = step1Schema.safeParse({
      full_name: form.full_name,
      email: form.email,
      dob: form.dob,
    })
    if (!r.success) {
      r.error.errors.forEach(e => { errors[String(e.path[0])] = e.message })
      return false
    }
  } else if (currentStep.value === 3) {
    const r = step3Schema.safeParse({ specialty: form.specialty })
    if (!r.success) {
      r.error.errors.forEach(e => { errors[String(e.path[0])] = e.message })
      return false
    }
  } else if (currentStep.value === 4) {
    const r = step4Schema.safeParse({ contact_email: form.contact_email })
    if (!r.success) {
      r.error.errors.forEach(e => { errors[String(e.path[0])] = e.message })
      return false
    }
  }
  return true
}

function shake() {
  isShaking.value = true
  setTimeout(() => { isShaking.value = false }, 500)
}

// ─── Navigation ───────────────────────────────────────────────────
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

async function finish() {
  if (!validateStep()) { shake(); return }
  setDoctor(form.full_name || 'Dr. Torres')
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
  router.push('/doctor/dashboard')
}

// ─── Specialties ──────────────────────────────────────────────────
const specialties = [
  'Clinical Psychology', 'Psychiatry', 'Neuropsychology', 'Child & Adolescent Therapy',
  'Cognitive Behavioral Therapy (CBT)', 'Dialectical Behavior Therapy (DBT)',
  'Psychoanalysis & Psychodynamic Therapy', 'Family & Couples Therapy',
  'Trauma & PTSD Therapy', 'Forensic Psychology', 'Health Psychology',
  'Addiction Psychology', 'Geriatric Psychology', 'School Psychology',
  'Art & Music Therapy', 'Group Therapy', 'Other',
]
const specialtySearch = ref('')
const showSpecialtyDropdown = ref(false)
const filteredSpecialties = computed(() =>
  specialties.filter(s => s.toLowerCase().includes(specialtySearch.value.toLowerCase()))
)
function selectSpecialty(s: string) {
  form.specialty = s
  specialtySearch.value = s
  showSpecialtyDropdown.value = false
  clearError('specialty')
}
function onSpecialtyFocus() {
  showSpecialtyDropdown.value = true
  if (form.specialty) specialtySearch.value = ''
}
function onSpecialtyBlur() {
  setTimeout(() => { showSpecialtyDropdown.value = false }, 150)
}

// ─── Country codes ────────────────────────────────────────────────
const countryCodes = [
  { code: '+1', label: '🇺🇸 +1' }, { code: '+44', label: '🇬🇧 +44' },
  { code: '+34', label: '🇪🇸 +34' }, { code: '+52', label: '🇲🇽 +52' },
  { code: '+55', label: '🇧🇷 +55' }, { code: '+54', label: '🇦🇷 +54' },
  { code: '+57', label: '🇨🇴 +57' }, { code: '+56', label: '🇨🇱 +56' },
  { code: '+33', label: '🇫🇷 +33' }, { code: '+49', label: '🇩🇪 +49' },
  { code: '+39', label: '🇮🇹 +39' }, { code: '+351', label: '🇵🇹 +351' },
  { code: '+61', label: '🇦🇺 +61' }, { code: '+81', label: '🇯🇵 +81' },
]

// ─── Photo upload ─────────────────────────────────────────────────
const photoPreview = ref<string | null>(null)
const isDragging = ref(false)

function triggerFileInput() { fileInput.value?.click() }

function handleFile(file: File) {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = e => {
    photoPreview.value = e.target?.result as string
    form.profile_picture = photoPreview.value
  }
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

// ─── Stepper meta ─────────────────────────────────────────────────
const steps = [
  { n: 1, label: 'Identity' },
  { n: 2, label: 'Persona' },
  { n: 3, label: 'Specialty' },
  { n: 4, label: 'Contact' },
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
          @click="router.push('/doctor/dashboard')"
        >
          [DEV] Skip
        </button>
        <span class="text-slate-400 text-sm">Doctor Onboarding</span>
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
            Welcome to Noeia{{ form.full_name ? ', ' + form.full_name.split(' ')[0] : '' }}!
          </h2>
          <p class="text-slate-500 text-sm mb-8 leading-relaxed">
            Your clinical profile is ready. NoeIA has been calibrated for
            <span class="font-medium text-slate-700">{{ form.specialty || 'your specialization' }}</span>.
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

              <!-- ── Step 1: Identity ── -->
              <template v-if="currentStep === 1">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-slate-900">Core Identity</h2>
                  <p class="text-slate-500 text-sm mt-1">Establishing your clinical record. Data is secure and HIPAA-compliant.</p>
                </div>
                <div class="space-y-5">

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Full name <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="form.full_name"
                      @input="clearError('full_name')"
                      type="text"
                      placeholder="Dr. Ana Torres"
                      class="w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      :class="errors.full_name
                        ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                        : form.full_name.length >= 2
                          ? 'bg-white border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50'
                          : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'"
                    />
                    <Transition name="err">
                      <p v-if="errors.full_name" class="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        {{ errors.full_name }}
                      </p>
                    </Transition>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Email address <span class="text-rose-500">*</span>
                      <span v-if="isEmailReadOnly" class="ml-2 text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full font-normal">
                        Pre-filled from invite
                      </span>
                    </label>
                    <input
                      v-model="form.email"
                      @input="clearError('email')"
                      type="email"
                      placeholder="you@clinic.com"
                      :readonly="isEmailReadOnly"
                      class="w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      :class="errors.email
                        ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                        : isEmailReadOnly
                          ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'"
                    />
                    <Transition name="err">
                      <p v-if="errors.email" class="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        {{ errors.email }}
                      </p>
                    </Transition>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Date of birth <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="form.dob"
                      @change="clearError('dob')"
                      type="date"
                      class="w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all"
                      :class="errors.dob
                        ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                        : form.dob
                          ? 'bg-white border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50'
                          : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'"
                    />
                    <Transition name="err">
                      <p v-if="errors.dob" class="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        {{ errors.dob }}
                      </p>
                    </Transition>
                  </div>

                </div>
              </template>

              <!-- ── Step 2: Persona ── -->
              <template v-else-if="currentStep === 2">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-slate-900">Professional Persona</h2>
                  <p class="text-slate-500 text-sm mt-1">Personalizes reports and patient communications. All optional.</p>
                </div>
                <div class="space-y-6">

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-3">
                      Profile photo <span class="text-slate-400 text-xs font-normal">(optional)</span>
                    </label>
                    <div class="flex items-center gap-5">
                      <div
                        @click="triggerFileInput"
                        @dragover.prevent="isDragging = true"
                        @dragleave="isDragging = false"
                        @drop.prevent="onDrop"
                        class="w-24 h-24 rounded-full border-2 border-dashed cursor-pointer overflow-hidden flex items-center justify-center flex-shrink-0 transition-all"
                        :class="isDragging ? 'border-indigo-400 bg-indigo-50' : photoPreview ? 'border-transparent' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'"
                      >
                        <img v-if="photoPreview" :src="photoPreview" class="w-full h-full object-cover" alt="Preview" />
                        <div v-else class="text-center px-2">
                          <svg class="w-6 h-6 text-slate-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                          </svg>
                          <p class="text-[10px] text-slate-400 leading-tight">Click or drop</p>
                        </div>
                      </div>
                      <div>
                        <button type="button" @click="triggerFileInput" class="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                          {{ photoPreview ? 'Change photo' : 'Upload photo' }}
                        </button>
                        <p class="text-xs text-slate-400 mt-1">JPG, PNG or GIF · Max 5MB</p>
                        <p class="text-xs text-slate-400">Shown on reports &amp; messages</p>
                        <button v-if="photoPreview" type="button" @click="photoPreview = null; form.profile_picture = null" class="text-xs text-slate-400 hover:text-rose-500 transition-colors mt-1">
                          Remove
                        </button>
                      </div>
                    </div>
                    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Professional bio <span class="text-slate-400 text-xs font-normal">(optional)</span>
                    </label>
                    <textarea
                      v-model="form.description"
                      rows="4"
                      placeholder="Your practice approach, areas of expertise, professional philosophy..."
                      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition-all resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 placeholder:text-slate-400"
                    />
                    <p class="text-xs text-slate-400 mt-1 text-right">{{ form.description.length }} / 500</p>
                  </div>

                </div>
              </template>

              <!-- ── Step 3: Specialty ── -->
              <template v-else-if="currentStep === 3">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-slate-900">Clinical Specialization</h2>
                  <p class="text-slate-500 text-sm mt-1">Seeds NoeIA's clinical context — filters AI prompts and templates to your field.</p>
                </div>
                <div class="space-y-5">

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Your specialization <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        v-model="specialtySearch"
                        @focus="onSpecialtyFocus"
                        @blur="onSpecialtyBlur"
                        @input="clearError('specialty')"
                        type="text"
                        placeholder="Search or select..."
                        class="w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all pr-10 placeholder:text-slate-400"
                        :class="errors.specialty
                          ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                          : form.specialty
                            ? 'bg-white border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50'
                            : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'"
                      />
                      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg v-if="form.specialty" class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <svg v-else class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                      <Transition name="dropdown">
                        <div v-if="showSpecialtyDropdown && filteredSpecialties.length > 0"
                          class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto">
                          <div
                            v-for="s in filteredSpecialties" :key="s"
                            @mousedown.prevent="selectSpecialty(s)"
                            class="px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between"
                            :class="form.specialty === s ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50'"
                          >
                            {{ s }}
                            <svg v-if="form.specialty === s" class="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                        </div>
                      </Transition>
                    </div>
                    <Transition name="err">
                      <p v-if="errors.specialty" class="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        {{ errors.specialty }}
                      </p>
                    </Transition>
                  </div>

                  <Transition name="err">
                    <div v-if="form.specialty" class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
                      <div class="w-5 h-5 rounded-md bg-indigo-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span class="text-[9px] font-bold text-indigo-600">AI</span>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-indigo-700 mb-1">NoeIA context set</p>
                        <p class="text-xs text-indigo-600/70 leading-relaxed">
                          Clinical AI optimized for <strong>{{ form.specialty }}</strong> — pattern detection, documentation templates, and assessment scales tailored to your field.
                        </p>
                      </div>
                    </div>
                  </Transition>

                </div>
              </template>

              <!-- ── Step 4: Contact ── -->
              <template v-else-if="currentStep === 4">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-slate-900">Contact & Connectivity</h2>
                  <p class="text-slate-500 text-sm mt-1">Populates your messaging channel and invoice headers.</p>
                </div>
                <div class="space-y-5">

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Phone number <span class="text-slate-400 text-xs font-normal">(optional)</span>
                    </label>
                    <div class="flex gap-2">
                      <select
                        v-model="form.contact_phone_code"
                        class="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all flex-shrink-0"
                      >
                        <option v-for="c in countryCodes" :key="c.code" :value="c.code">{{ c.label }}</option>
                      </select>
                      <input
                        v-model="form.contact_phone"
                        type="tel"
                        placeholder="612 345 678"
                        class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">
                      Professional contact email <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="form.contact_email"
                      @input="clearError('contact_email')"
                      type="email"
                      placeholder="contact@yourpractice.com"
                      class="w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      :class="errors.contact_email
                        ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                        : form.contact_email
                          ? 'bg-white border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50'
                          : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'"
                    />
                    <p class="text-xs text-slate-400 mt-1.5">May differ from your login email — shown on patient comms and invoices.</p>
                    <Transition name="err">
                      <p v-if="errors.contact_email" class="flex items-center gap-1.5 text-rose-500 text-xs mt-1">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        {{ errors.contact_email }}
                      </p>
                    </Transition>
                  </div>

                </div>
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
              <button
                v-if="currentStep === 2"
                type="button"
                @click="next"
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

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }

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
