<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '~/components/ui/card'

definePageMeta({ layout: false })

const email    = ref('')
const password = ref('')
const showPassword = ref(false)
const loading  = ref(false)

async function handleSignIn() {
  loading.value = true
  await navigateTo('/onboarding/doctor')
  loading.value = false
}
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2 bg-background">

    <!-- ── Left: form ── -->
    <div class="flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-sm space-y-6">

        <!-- Mobile logo -->
        <div class="flex justify-center lg:hidden">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <img src="/Noeia_logo_mini.svg" alt="" class="w-5 h-5 brightness-0 invert" />
            </div>
            <img src="/Noeia_logo.svg" alt="Noeia" class="h-6 dark:hidden" />
            <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-6 hidden dark:block" />
          </NuxtLink>
        </div>

        <Card>
          <CardHeader class="text-center">
            <div class="mx-auto mb-2 w-10 h-10 rounded-xl bg-primary flex items-center justify-center lg:hidden">
              <img src="/Noeia_logo_mini.svg" alt="" class="w-5 h-5 brightness-0 invert" />
            </div>
            <CardTitle class="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your Noeia account</CardDescription>
          </CardHeader>

          <CardContent class="space-y-4">
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
                  <a href="#" class="text-xs text-primary hover:underline">Forgot password?</a>
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

            <div class="relative my-2">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t border-border" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <Button variant="outline" type="button" class="w-full gap-2">
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button" class="w-full gap-2">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                  <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft
              </Button>
            </div>
          </CardContent>

          <CardFooter class="justify-center text-sm text-muted-foreground">
            Don't have an account?
            <NuxtLink to="/signup" class="ml-1 text-primary hover:underline font-medium">
              Sign up
            </NuxtLink>
          </CardFooter>
        </Card>

      </div>
    </div>

    <!-- ── Right: brand panel ── -->
    <div class="hidden lg:flex flex-col justify-between bg-sidebar border-l border-border px-10 py-10 relative overflow-hidden">
      <!-- Grid pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      <!-- Glow -->
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
          Clinical care,<br />
          <span class="text-primary">intelligently</span> managed.
        </h2>
        <p class="text-muted-foreground text-sm leading-relaxed mb-8">
          Noeia brings your sessions, patients, and billing into a single AI-powered workspace — so you can focus on what matters.
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="f in ['AI session notes', 'Smart scheduling', 'Billing automation', 'Patient insights']"
            :key="f"
            class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
          >{{ f }}</span>
        </div>
      </div>

      <div class="relative border-t border-border pt-8">
        <blockquote class="text-sm text-muted-foreground leading-relaxed italic mb-4">
          "Noeia reduced my documentation time by 60%. I spend more time with patients and less time on paperwork."
        </blockquote>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span class="text-xs font-bold text-primary">AR</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">Dr. Ana Ruiz</p>
            <p class="text-xs text-muted-foreground">Clinical Psychologist · MindCare Clinics</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
