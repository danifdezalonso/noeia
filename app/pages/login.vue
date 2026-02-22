<script setup lang="ts">
const roles = [
  {
    id: 'organization',
    icon: 'building',
    label: 'Organization',
    sublabel: 'For clinics & healthcare networks',
    desc: 'Manage multiple practitioners, locations, and patients under one unified dashboard.',
    href: '/login/organization',
    color: 'violet',
  },
  {
    id: 'doctor',
    icon: 'stethoscope',
    label: 'Doctor',
    sublabel: 'For independent practitioners',
    desc: 'Access your patient sessions, clinical notes, and AI-powered insights.',
    href: '/onboarding/doctor',
    color: 'indigo',
    primary: true,
  },
  {
    id: 'patient',
    icon: 'user-heart',
    label: 'Patient',
    sublabel: 'For individuals in therapy',
    desc: 'Connect with your therapist, access session summaries, and track your progress.',
    href: '/login/patient',
    color: 'teal',
  },
]
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">

    <!-- Background -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[100px] pointer-events-none" />

    <div class="relative w-full max-w-3xl">
      <!-- Logo -->
      <div class="text-center mb-10">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-6">
          <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span class="text-white font-bold">N</span>
          </div>
          <span class="text-white font-semibold text-xl tracking-tight">Noeia</span>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-white mt-2">How are you joining?</h1>
        <p class="text-slate-400 mt-2 text-sm">Select your role to get started or sign in.</p>
      </div>

      <!-- Role cards -->
      <div class="grid sm:grid-cols-3 gap-4 mb-8">
        <NuxtLink
          v-for="role in roles"
          :key="role.id"
          :to="role.href"
          class="group relative flex flex-col rounded-2xl border p-6 transition-all cursor-pointer"
          :class="role.primary
            ? 'bg-indigo-600/10 border-indigo-500/40 hover:bg-indigo-600/20 hover:border-indigo-400/60 ring-1 ring-indigo-500/20'
            : 'bg-slate-900/60 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600'"
        >
          <!-- Badge for recommended -->
          <div v-if="role.primary" class="absolute -top-2.5 left-1/2 -translate-x-1/2">
            <span class="bg-indigo-600 text-white text-[10px] font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
              Most common
            </span>
          </div>

          <!-- Icon -->
          <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
            :class="role.color === 'indigo' ? 'bg-indigo-600/20 group-hover:bg-indigo-600/30' :
                    role.color === 'violet' ? 'bg-violet-600/20 group-hover:bg-violet-600/30' :
                    'bg-teal-600/20 group-hover:bg-teal-600/30'">
            <!-- Building -->
            <svg v-if="role.icon === 'building'" class="w-6 h-6" :class="role.color === 'violet' ? 'text-violet-400' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"/>
            </svg>
            <!-- Stethoscope-ish (briefcase medical) -->
            <svg v-else-if="role.icon === 'stethoscope'" class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
            </svg>
            <!-- User -->
            <svg v-else class="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
          </div>

          <div class="font-semibold text-white text-base mb-0.5">{{ role.label }}</div>
          <div class="text-xs font-medium mb-3"
            :class="role.color === 'indigo' ? 'text-indigo-400' : role.color === 'violet' ? 'text-violet-400' : 'text-teal-400'">
            {{ role.sublabel }}
          </div>
          <p class="text-slate-500 text-xs leading-relaxed flex-1">{{ role.desc }}</p>

          <div class="mt-4 flex items-center gap-1 text-xs font-medium transition-colors"
            :class="role.color === 'indigo' ? 'text-indigo-400 group-hover:text-indigo-300' :
                    role.color === 'violet' ? 'text-violet-400 group-hover:text-violet-300' :
                    'text-teal-400 group-hover:text-teal-300'">
            Continue
            <svg class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </div>
        </NuxtLink>
      </div>

      <!-- Sign in link -->
      <p class="text-center text-slate-600 text-sm">
        Already have an account?
        <a href="#" class="text-indigo-400 hover:text-indigo-300 transition-colors font-medium ml-1">Sign in</a>
      </p>
    </div>
  </div>
</template>
