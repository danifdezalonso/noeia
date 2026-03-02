<script setup lang="ts">
definePageMeta({ layout: false })

const roles = [
  {
    id: 'doctor',
    title: 'Doctor',
    description: 'Manage sessions, clinical notes & patients',
    href: '/login?role=doctor',
  },
  {
    id: 'organization',
    title: 'Organization',
    description: 'Multi-clinic management, teams & billing',
    href: '/login?role=organization',
  },
  {
    id: 'patient',
    title: 'Patient',
    description: 'Access your health records & session history',
    href: '/login?role=patient',
  },
]
</script>

<template>
  <div class="h-screen overflow-hidden grid lg:grid-cols-2 bg-background">

    <!-- ── Left: role picker ── -->
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

        <div class="text-center space-y-1">
          <div class="mx-auto mb-4 w-10 h-10 rounded-xl bg-primary flex items-center justify-center lg:hidden">
            <img src="/Noeia_logo_mini.svg" alt="" class="w-5 h-5 brightness-0 invert" />
          </div>
          <h1 class="text-2xl font-bold text-foreground">Welcome to Noeia</h1>
          <p class="text-sm text-muted-foreground">Who are you signing in as?</p>
        </div>

        <div class="space-y-3">
          <NuxtLink
            v-for="role in roles"
            :key="role.id"
            :to="role.href"
            class="flex items-center gap-4 w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
          >
            <!-- Icon -->
            <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
              <!-- Doctor -->
              <svg v-if="role.id === 'doctor'" class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <!-- Organization -->
              <svg v-else-if="role.id === 'organization'" class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"/>
              </svg>
              <!-- Patient -->
              <svg v-else class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-foreground">{{ role.title }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ role.description }}</p>
            </div>

            <svg class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>

        <p class="text-center text-sm text-muted-foreground">
          New to Noeia?
          <NuxtLink to="/signup" class="ml-1 text-primary hover:underline font-medium">
            Create an account
          </NuxtLink>
        </p>

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
