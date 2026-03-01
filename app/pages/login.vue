<script setup lang="ts">
import { Eye, EyeOff, Stethoscope } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({ layout: false })

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function handleSignIn() {
  loading.value = true
  // Demo: navigate to doctor onboarding
  await navigateTo('/onboarding/doctor')
  loading.value = false
}
</script>

<template>
  <div class="min-h-screen flex bg-background">

    <!-- ── Left brand panel (hidden on mobile) ── -->
    <div class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-sidebar flex-col overflow-hidden border-r border-border">
      <!-- Subtle grid background -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      <!-- Radial glow -->
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
            Clinical care,<br />
            <span class="text-primary">intelligently</span> managed.
          </h1>
          <p class="mt-4 text-base text-muted-foreground leading-relaxed">
            Noeia brings your sessions, patients, and billing into a single AI-powered workspace — so you can focus on what matters.
          </p>

          <!-- Feature pills -->
          <div class="mt-8 flex flex-wrap gap-2">
            <span v-for="f in ['AI session notes', 'Smart scheduling', 'Billing automation', 'Patient insights']" :key="f"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {{ f }}
            </span>
          </div>
        </div>

        <!-- Testimonial -->
        <div class="border-t border-border pt-8">
          <blockquote class="text-sm text-muted-foreground leading-relaxed italic">
            "Noeia reduced my documentation time by 60%. I spend more time with patients and less time on paperwork."
          </blockquote>
          <div class="mt-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Stethoscope class="w-4 h-4 text-primary" />
            </div>
            <div>
              <p class="text-sm font-semibold text-foreground">Dr. Ana Ruiz</p>
              <p class="text-xs text-muted-foreground">Clinical Psychologist · MindCare Clinics</p>
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
          <h2 class="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h2>
          <p class="mt-1.5 text-sm text-muted-foreground">
            Welcome back — enter your credentials below.
          </p>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleSignIn">
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
            <div class="flex items-center justify-between">
              <Label for="password">Password</Label>
              <a href="#" class="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                Forgot password?
              </a>
            </div>
            <div class="relative">
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
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

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </Button>
        </form>

        <!-- Divider -->
        <div class="my-6 flex items-center gap-3">
          <div class="flex-1 border-t border-border" />
          <span class="text-xs text-muted-foreground">or continue with</span>
          <div class="flex-1 border-t border-border" />
        </div>

        <!-- OAuth placeholders -->
        <div class="grid grid-cols-2 gap-3">
          <button type="button" class="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <!-- Google icon -->
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button type="button" class="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <!-- Microsoft icon -->
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path fill="#F25022" d="M1 1h10v10H1z"/>
              <path fill="#00A4EF" d="M13 1h10v10H13z"/>
              <path fill="#7FBA00" d="M1 13h10v10H1z"/>
              <path fill="#FFB900" d="M13 13h10v10H13z"/>
            </svg>
            Microsoft
          </button>
        </div>

        <!-- Sign up link -->
        <p class="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?
          <NuxtLink to="/signup" class="text-primary hover:text-primary/80 font-semibold transition-colors ml-1">
            Sign up
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
