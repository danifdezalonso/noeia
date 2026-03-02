<script setup lang="ts">
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'

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
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#E83D59', '#8b5cf6', '#14b8a6', '#f59e0b', '#ec4899'] })
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
  <div class="min-h-screen grid lg:grid-cols-2 bg-background">

    <!-- ── Left: wizard ── -->
    <div class="flex flex-col overflow-y-auto">

      <header class="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <img src="/Noeia_logo_mini.svg" alt="" class="w-4 h-4 brightness-0 invert" />
          </div>
          <img src="/Noeia_logo.svg" alt="Noeia" class="h-5 dark:hidden" />
          <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-5 hidden dark:block" />
        </NuxtLink>
        <button
          type="button"
          class="px-2.5 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
          @click="router.push('/doctor/dashboard')"
        >
          [DEV] Skip
        </button>
      </header>

      <main class="flex-1 flex flex-col items-center justify-center px-6 py-10">

      <!-- ── Success ── -->
      <Transition name="fade">
        <div v-if="isComplete" class="text-center max-w-sm mx-auto">
          <div class="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6 animate-bounce-once">
            <svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-foreground mb-2">
            Welcome to Noeia{{ form.full_name ? ', ' + form.full_name.split(' ')[0] : '' }}!
          </h2>
          <p class="text-muted-foreground text-sm mb-8 leading-relaxed">
            Your clinical profile is ready. NoeIA has been calibrated for
            <span class="font-medium text-foreground">{{ form.specialty || 'your specialization' }}</span>.
          </p>
          <Button class="w-full h-auto py-3 rounded-xl text-base font-semibold" @click="goToDashboard">
            Go to Dashboard →
          </Button>
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
                    ? 'bg-primary border-primary text-white'
                    : currentStep === step.n
                      ? 'bg-background border-primary text-primary'
                      : 'bg-background border-border text-muted-foreground'"
                >
                  <svg v-if="currentStep > step.n" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span v-else>{{ step.n }}</span>
                </div>
                <span class="text-xs hidden sm:block transition-colors duration-300"
                  :class="currentStep === step.n ? 'text-primary font-medium' : currentStep > step.n ? 'text-muted-foreground' : 'text-muted-foreground/40'">
                  {{ step.label }}
                </span>
              </div>
              <div v-if="idx < steps.length - 1" class="flex-1 h-0.5 mx-2 transition-all duration-500"
                :class="currentStep > step.n ? 'bg-primary' : 'bg-border'" />
            </template>
          </div>
        </div>

        <!-- Form card + nav -->
        <div class="w-full max-w-lg">
          <Transition :name="direction === 'forward' ? 'slide-left' : 'slide-right'" mode="out-in">
            <div :key="currentStep" class="bg-card rounded-2xl shadow-sm border border-border p-8">

              <!-- ── Step 1: Identity ── -->
              <template v-if="currentStep === 1">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-foreground">Core Identity</h2>
                  <p class="text-muted-foreground text-sm mt-1">Establishing your clinical record. Data is secure and HIPAA-compliant.</p>
                </div>
                <div class="space-y-5">

                  <div>
                    <Label class="block text-sm font-medium text-foreground mb-1.5">
                      Full name <span class="text-rose-500">*</span>
                    </Label>
                    <Input
                      v-model="form.full_name"
                      type="text"
                      placeholder="Dr. Ana Torres"
                      class="rounded-xl"
                      :class="errors.full_name
                        ? 'border-destructive/50 bg-destructive/5 focus-visible:ring-destructive/20'
                        : form.full_name.length >= 2
                          ? 'border-primary/50 focus-visible:ring-primary/20'
                          : ''"
                      @input="clearError('full_name')"
                    />
                    <Transition name="err">
                      <p v-if="errors.full_name" class="flex items-center gap-1.5 text-destructive text-xs mt-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        {{ errors.full_name }}
                      </p>
                    </Transition>
                  </div>

                  <div>
                    <Label class="block text-sm font-medium text-foreground mb-1.5">
                      Email address <span class="text-rose-500">*</span>
                      <span v-if="isEmailReadOnly" class="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-normal">
                        Pre-filled from invite
                      </span>
                    </Label>
                    <Input
                      v-model="form.email"
                      type="email"
                      placeholder="you@clinic.com"
                      :readonly="isEmailReadOnly"
                      class="rounded-xl"
                      :class="errors.email
                        ? 'border-destructive/50 bg-destructive/5 focus-visible:ring-destructive/20'
                        : isEmailReadOnly
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : ''"
                      @input="clearError('email')"
                    />
                    <Transition name="err">
                      <p v-if="errors.email" class="flex items-center gap-1.5 text-destructive text-xs mt-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        {{ errors.email }}
                      </p>
                    </Transition>
                  </div>

                  <div>
                    <Label class="block text-sm font-medium text-foreground mb-1.5">
                      Date of birth <span class="text-rose-500">*</span>
                    </Label>
                    <Input
                      v-model="form.dob"
                      type="date"
                      class="rounded-xl"
                      :class="errors.dob
                        ? 'border-destructive/50 bg-destructive/5 focus-visible:ring-destructive/20'
                        : form.dob
                          ? 'border-primary/50 focus-visible:ring-primary/20'
                          : ''"
                      @change="clearError('dob')"
                    />
                    <Transition name="err">
                      <p v-if="errors.dob" class="flex items-center gap-1.5 text-destructive text-xs mt-1.5">
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
                  <h2 class="text-xl font-bold text-foreground">Professional Persona</h2>
                  <p class="text-muted-foreground text-sm mt-1">Personalizes reports and patient communications. All optional.</p>
                </div>
                <div class="space-y-6">

                  <div>
                    <Label class="block text-sm font-medium text-foreground mb-3">
                      Profile photo <span class="text-muted-foreground text-xs font-normal">(optional)</span>
                    </Label>
                    <div class="flex items-center gap-5">
                      <div
                        @click="triggerFileInput"
                        @dragover.prevent="isDragging = true"
                        @dragleave="isDragging = false"
                        @drop.prevent="onDrop"
                        class="w-24 h-24 rounded-full border-2 border-dashed cursor-pointer overflow-hidden flex items-center justify-center flex-shrink-0 transition-all"
                        :class="isDragging ? 'border-primary bg-primary/5' : photoPreview ? 'border-transparent' : 'border-border hover:border-primary/50 hover:bg-muted/50'"
                      >
                        <img v-if="photoPreview" :src="photoPreview" class="w-full h-full object-cover" alt="Preview" />
                        <div v-else class="text-center px-2">
                          <svg class="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                          </svg>
                          <p class="text-[10px] text-muted-foreground/60 leading-tight">Click or drop</p>
                        </div>
                      </div>
                      <div>
                        <button type="button" @click="triggerFileInput" class="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                          {{ photoPreview ? 'Change photo' : 'Upload photo' }}
                        </button>
                        <p class="text-xs text-muted-foreground mt-1">JPG, PNG or GIF · Max 5MB</p>
                        <p class="text-xs text-muted-foreground">Shown on reports &amp; messages</p>
                        <button v-if="photoPreview" type="button" @click="photoPreview = null; form.profile_picture = null" class="text-xs text-muted-foreground hover:text-destructive transition-colors mt-1">
                          Remove
                        </button>
                      </div>
                    </div>
                    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                  </div>

                  <div>
                    <Label class="block text-sm font-medium text-foreground mb-1.5">
                      Professional bio <span class="text-muted-foreground text-xs font-normal">(optional)</span>
                    </Label>
                    <Textarea
                      v-model="form.description"
                      :rows="4"
                      placeholder="Your practice approach, areas of expertise, professional philosophy..."
                      class="rounded-xl resize-none"
                    />
                    <p class="text-xs text-muted-foreground mt-1 text-right">{{ form.description.length }} / 500</p>
                  </div>

                </div>
              </template>

              <!-- ── Step 3: Specialty ── -->
              <template v-else-if="currentStep === 3">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-foreground">Clinical Specialization</h2>
                  <p class="text-muted-foreground text-sm mt-1">Seeds NoeIA's clinical context — filters AI prompts and templates to your field.</p>
                </div>
                <div class="space-y-5">

                  <div>
                    <Label class="block text-sm font-medium text-foreground mb-1.5">
                      Your specialization <span class="text-rose-500">*</span>
                    </Label>
                    <div class="relative">
                      <Input
                        v-model="specialtySearch"
                        type="text"
                        placeholder="Search or select..."
                        class="rounded-xl pr-10"
                        :class="errors.specialty
                          ? 'border-destructive/50 bg-destructive/5 focus-visible:ring-destructive/20'
                          : form.specialty
                            ? 'border-primary/50 focus-visible:ring-primary/20'
                            : ''"
                        @focus="onSpecialtyFocus"
                        @blur="onSpecialtyBlur"
                        @input="clearError('specialty')"
                      />
                      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg v-if="form.specialty" class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <svg v-else class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                      <Transition name="dropdown">
                        <div v-if="showSpecialtyDropdown && filteredSpecialties.length > 0"
                          class="absolute top-full left-0 right-0 mt-1.5 bg-popover border border-border rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto">
                          <div
                            v-for="s in filteredSpecialties" :key="s"
                            @mousedown.prevent="selectSpecialty(s)"
                            class="px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between"
                            :class="form.specialty === s ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'"
                          >
                            {{ s }}
                            <svg v-if="form.specialty === s" class="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                        </div>
                      </Transition>
                    </div>
                    <Transition name="err">
                      <p v-if="errors.specialty" class="flex items-center gap-1.5 text-destructive text-xs mt-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        {{ errors.specialty }}
                      </p>
                    </Transition>
                  </div>

                  <Transition name="err">
                    <div v-if="form.specialty" class="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3">
                      <div class="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span class="text-[9px] font-bold text-primary">AI</span>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-primary mb-1">NoeIA context set</p>
                        <p class="text-xs text-primary/70 leading-relaxed">
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
                  <h2 class="text-xl font-bold text-foreground">Contact & Connectivity</h2>
                  <p class="text-muted-foreground text-sm mt-1">Populates your messaging channel and invoice headers.</p>
                </div>
                <div class="space-y-5">

                  <div>
                    <Label class="block text-sm font-medium text-foreground mb-1.5">
                      Phone number <span class="text-muted-foreground text-xs font-normal">(optional)</span>
                    </Label>
                    <div class="flex gap-2">
                      <select
                        v-model="form.contact_phone_code"
                        class="px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all flex-shrink-0"
                      >
                        <option v-for="c in countryCodes" :key="c.code" :value="c.code">{{ c.label }}</option>
                      </select>
                      <Input
                        v-model="form.contact_phone"
                        type="tel"
                        placeholder="612 345 678"
                        class="rounded-xl flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label class="block text-sm font-medium text-foreground mb-1.5">
                      Professional contact email <span class="text-rose-500">*</span>
                    </Label>
                    <Input
                      v-model="form.contact_email"
                      type="email"
                      placeholder="contact@yourpractice.com"
                      class="rounded-xl"
                      :class="errors.contact_email
                        ? 'border-destructive/50 bg-destructive/5 focus-visible:ring-destructive/20'
                        : form.contact_email
                          ? 'border-primary/50 focus-visible:ring-primary/20'
                          : ''"
                      @input="clearError('contact_email')"
                    />
                    <p class="text-xs text-muted-foreground mt-1.5">May differ from your login email — shown on patient comms and invoices.</p>
                    <Transition name="err">
                      <p v-if="errors.contact_email" class="flex items-center gap-1.5 text-destructive text-xs mt-1">
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
            <Button
              v-if="currentStep > 1"
              variant="outline"
              class="flex items-center gap-2 rounded-xl"
              @click="back"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
              </svg>
              Back
            </Button>
            <div v-else />

            <div class="flex items-center gap-3">
              <button
                v-if="currentStep === 2"
                type="button"
                @click="next"
                class="text-muted-foreground hover:text-foreground text-sm transition-colors px-2"
              >
                Skip for now
              </button>

              <Button
                v-if="currentStep < TOTAL"
                :class="{ shake: isShaking }"
                class="flex items-center gap-2 rounded-xl"
                @click="next"
              >
                Next
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Button>

              <Button
                v-else
                :class="{ shake: isShaking }"
                class="flex items-center gap-2 rounded-xl"
                @click="finish"
              >
                Finish setup
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </Button>
            </div>
          </div>

          <p class="text-center text-muted-foreground text-xs mt-5">Step {{ currentStep }} of {{ TOTAL }}</p>
        </div>

      </template>
    </main>

    </div><!-- ── end left ── -->

    <!-- ── Right: brand panel ── -->
    <div class="hidden lg:flex flex-col justify-between bg-sidebar border-l border-border px-10 py-10 relative overflow-hidden">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      <div class="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-primary/8 blur-[100px] pointer-events-none" />

      <div class="relative">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <img src="/Noeia_logo_mini.svg" alt="" class="w-5 h-5 brightness-0 invert" />
          </div>
          <img src="/Noeia_logo.svg" alt="Noeia" class="h-6 dark:hidden" />
          <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-6 hidden dark:block" />
        </NuxtLink>
      </div>

      <div class="relative max-w-sm">
        <h2 class="text-3xl font-bold text-foreground leading-snug mb-4">
          Set up your practice,<br />
          <span class="text-primary">in minutes.</span>
        </h2>
        <p class="text-muted-foreground text-sm leading-relaxed mb-8">
          Your clinical profile takes under 4 minutes. NoeIA adapts to your specialty — from session templates to AI-powered insights.
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="f in ['AI session notes', 'Specialty context', 'Patient management', 'Outcome tracking']"
            :key="f"
            class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
          >{{ f }}</span>
        </div>
      </div>

      <div class="relative border-t border-border pt-8">
        <blockquote class="text-sm text-muted-foreground leading-relaxed italic mb-4">
          "The onboarding took 4 minutes. Four. Minutes. Every other medical platform I've tried has made me fill out the same form seven times. Noeia actually respects my time."
        </blockquote>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span class="text-xs font-bold text-primary">SC</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">Dr. Sofia Chen</p>
            <p class="text-xs text-muted-foreground">Child & Adolescent Therapist · Toronto</p>
          </div>
        </div>
      </div>
    </div>

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
