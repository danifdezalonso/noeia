<script setup lang="ts">
import { Eye, EyeOff, Stethoscope } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'

definePageMeta({ layout: false })

const fullName = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const role = ref<'doctor' | 'organization'>('doctor')
const acceptedTerms = ref(false)
const loading = ref(false)

async function handleSignUp() {
  if (!acceptedTerms.value) return
  loading.value = true
  const path = role.value === 'organization' ? '/onboarding/organization' : '/onboarding/doctor'
  await navigateTo(path)
  loading.value = false
}
</script>

<template>
  <div class="min-h-screen flex bg-background">

    <!-- ── Left brand panel (hidden on mobile) ── -->
    <div class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-sidebar flex-col overflow-hidden border-r border-border">
      <!-- Subtle grid background -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      <div class="absolute top-1/4 left-1/3 w-[480px] h-[480px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />

      <div class="relative flex flex-col h-full px-10 py-10">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <img src="/Noeia_logo_mini.svg" alt="" class="w-5 h-5 brightness-0 invert" />
          </div>
          <img src="/Noeia_logo.svg" alt="Noeia" class="h-6 dark:hidden" />
          <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-6 hidden dark:block" />
        </NuxtLink>

        <!-- Main copy -->
        <div class="flex-1 flex flex-col justify-center max-w-sm">
          <h1 class="text-4xl font-bold tracking-tight text-foreground leading-tight">
            Your practice,<br />
            <span class="text-primary">supercharged</span> by AI.
          </h1>
          <p class="mt-4 text-base text-muted-foreground leading-relaxed">
            Join thousands of clinicians who use Noeia to automate documentation, streamline scheduling, and deliver better patient outcomes.
          </p>

          <!-- Stats -->
          <div class="mt-8 grid grid-cols-3 gap-4">
            <div v-for="stat in [{ value: '10k+', label: 'Clinicians' }, { value: '2M+', label: 'Sessions' }, { value: '60%', label: 'Less admin' }]" :key="stat.label">
              <p class="text-2xl font-bold text-foreground">{{ stat.value }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <!-- Testimonial -->
        <div class="border-t border-border pt-8">
          <blockquote class="text-sm text-muted-foreground leading-relaxed italic">
            "Setting up our clinic on Noeia took less than a day. The AI summaries alone saved us 20 hours a week."
          </blockquote>
          <div class="mt-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Stethoscope class="w-4 h-4 text-primary" />
            </div>
            <div>
              <p class="text-sm font-semibold text-foreground">Dr. Carlos Méndez</p>
              <p class="text-xs text-muted-foreground">Psychiatrist · Salud Mental Centro</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Right form panel ── -->
    <div class="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-10">
      <div class="w-full max-w-sm">

        <!-- Mobile logo -->
        <div class="mb-8 flex justify-center lg:hidden">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <img src="/Noeia_logo_mini.svg" alt="" class="w-5 h-5 brightness-0 invert" />
            </div>
            <img src="/Noeia_logo.svg" alt="Noeia" class="h-6 dark:hidden" />
            <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-6 hidden dark:block" />
          </NuxtLink>
        </div>

        <!-- Heading -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold tracking-tight text-foreground">Create your account</h2>
          <p class="mt-1.5 text-sm text-muted-foreground">
            Get started for free — no credit card required.
          </p>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleSignUp">
          <div class="space-y-1.5">
            <Label for="full-name">Full name</Label>
            <Input
              id="full-name"
              v-model="fullName"
              type="text"
              placeholder="Dr. Ana García"
              autocomplete="name"
              required
            />
          </div>

          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@clinic.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="space-y-1.5">
            <Label for="password">Password</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Min. 8 characters"
                autocomplete="new-password"
                required
                class="pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Role selector -->
          <div class="space-y-1.5">
            <Label>I am a</Label>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="r in [{ id: 'doctor', label: 'Doctor', desc: 'Independent practitioner' }, { id: 'organization', label: 'Organization', desc: 'Clinic or network' }]"
                :key="r.id"
                type="button"
                class="flex flex-col items-start gap-0.5 px-4 py-3 rounded-lg border text-left transition-all"
                :class="role === r.id
                  ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/30'
                  : 'border-border hover:border-primary/40 hover:bg-accent text-foreground'"
                @click="role = r.id as 'doctor' | 'organization'"
              >
                <span class="text-sm font-semibold">{{ r.label }}</span>
                <span class="text-[11px] text-muted-foreground">{{ r.desc }}</span>
              </button>
            </div>
          </div>

          <!-- Terms checkbox -->
          <div class="flex items-start gap-3 pt-1">
            <Checkbox
              id="terms"
              v-model:checked="acceptedTerms"
              class="mt-0.5"
            />
            <Label for="terms" class="text-sm text-muted-foreground font-normal cursor-pointer leading-snug">
              I agree to the
              <a href="#" class="text-primary hover:text-primary/80 font-medium underline-offset-2 hover:underline">Terms of Service</a>
              and
              <a href="#" class="text-primary hover:text-primary/80 font-medium underline-offset-2 hover:underline">Privacy Policy</a>
            </Label>
          </div>

          <Button type="submit" class="w-full" :disabled="loading || !acceptedTerms">
            {{ loading ? 'Creating account…' : 'Create account' }}
          </Button>
        </form>

        <!-- Sign in link -->
        <p class="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?
          <NuxtLink to="/login" class="text-primary hover:text-primary/80 font-semibold transition-colors ml-1">
            Sign in
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
