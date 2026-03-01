<script setup lang="ts">
const features = [
  {
    icon: 'brain',
    title: 'Clinical AI Insights',
    desc: 'NoeIA detects behavioral patterns across sessions, surfacing early warning signs and treatment recommendations tailored to each specialization.',
  },
  {
    icon: 'file-text',
    title: 'Automated Session Notes',
    desc: 'Generate structured clinical notes in seconds. Review, edit, and sign — so you spend more time with patients, less with paperwork.',
  },
  {
    icon: 'shield',
    title: 'HIPAA-Grade Security',
    desc: 'End-to-end encryption, audit logs, and role-based access control built from day one. Your patients\' data stays protected.',
  },
  {
    icon: 'bar-chart',
    title: 'Outcome Tracking',
    desc: 'Monitor treatment progress with validated clinical scales (PHQ-9, GAD-7, PCL-5) integrated directly into patient timelines.',
  },
  {
    icon: 'message-circle',
    title: 'Secure Messaging',
    desc: 'Encrypted doctor–patient communication with session context attached. No more scattered emails or unsecured channels.',
  },
  {
    icon: 'building-2',
    title: 'Multi-Clinic Management',
    desc: 'For organizations managing multiple locations — unified dashboards, team management, and billing in one place.',
  },
]

const testimonials = [
  {
    quote: 'Noeia has fundamentally changed how I run my practice. The AI clinical notes save me 2 hours a day, and the pattern recognition caught something I\'d missed across 6 sessions.',
    name: 'Dr. Elena Martínez',
    role: 'Clinical Psychologist · Madrid',
    initials: 'EM',
  },
  {
    quote: 'As a psychiatrist managing 40+ patients, the outcome tracking dashboards are invaluable. I can finally quantify treatment progress in a way that resonates with both patients and insurers.',
    name: 'Dr. James Okafor',
    role: 'Psychiatrist · London',
    initials: 'JO',
  },
  {
    quote: 'The onboarding took 4 minutes. Four. Minutes. Every other medical platform I\'ve tried has made me fill out the same form seven times. Noeia actually respects my time.',
    name: 'Dr. Sofia Chen',
    role: 'Child & Adolescent Therapist · Toronto',
    initials: 'SC',
  },
]
</script>

<template>
  <div class="min-h-screen bg-white font-sans">

    <!-- ─── NAVBAR ─── -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span class="text-white font-bold text-sm">N</span>
          </div>
          <span class="text-white font-semibold text-lg tracking-tight">Noeia</span>
        </NuxtLink>

        <!-- Nav links -->
        <div class="hidden md:flex items-center gap-8">
          <a href="#features" class="text-slate-400 hover:text-white text-sm transition-colors">Features</a>
          <a href="#how-it-works" class="text-slate-400 hover:text-white text-sm transition-colors">How it works</a>
          <a href="#testimonials" class="text-slate-400 hover:text-white text-sm transition-colors">Testimonials</a>
        </div>

        <!-- CTA -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/login" class="text-slate-400 hover:text-white text-sm transition-colors">Sign in</NuxtLink>
          <NuxtLink
            to="/login"
            class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get early access
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- ─── HERO ─── -->
    <section class="relative bg-slate-950 overflow-hidden pt-16">
      <!-- Background grid -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px]" />
      <!-- Gradient blob -->
      <div class="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-900/30 blur-[120px] pointer-events-none" />
      <div class="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-900/20 blur-[100px] pointer-events-none" />

      <div class="relative max-w-6xl mx-auto px-6 py-28 lg:py-36 flex flex-col lg:flex-row items-center gap-16">
        <!-- Left: copy -->
        <div class="flex-1 text-center lg:text-left">
          <div class="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span class="text-teal-400 text-xs font-medium">Now in Early Access</span>
          </div>

          <h1 class="text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Clinical AI,<br />
            <span class="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">Human Heart.</span>
          </h1>

          <p class="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10">
            Noeia is the AI-powered platform built exclusively for mental health professionals.
            From session notes to clinical insights — handle the complexity and focus on healing.
          </p>

          <p class="text-slate-400 text-sm mb-4">Get started — choose your role:</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0">
            <NuxtLink
              to="/login"
              class="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all text-center"
            >
              <div class="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <span class="text-sm font-semibold text-white">Doctor</span>
              <span class="text-xs text-slate-400 leading-tight">Manage sessions, notes & patients</span>
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all text-center"
            >
              <div class="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"/>
                </svg>
              </div>
              <span class="text-sm font-semibold text-white">Organization</span>
              <span class="text-xs text-slate-400 leading-tight">Clinics, teams & billing</span>
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-teal-500/30 transition-all text-center"
            >
              <div class="w-9 h-9 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                </svg>
              </div>
              <span class="text-sm font-semibold text-white">Patient</span>
              <span class="text-xs text-slate-400 leading-tight">Your health, your care</span>
            </NuxtLink>
          </div>

          <p class="text-slate-600 text-xs mt-5">No credit card required · HIPAA compliant · Free during beta</p>
        </div>

        <!-- Right: UI mockup -->
        <div class="flex-shrink-0 w-full max-w-sm relative">
          <div class="absolute inset-0 blur-2xl bg-indigo-500/15 rounded-3xl scale-95" />
          <div class="relative bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
            <!-- Header -->
            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span class="text-sm font-medium text-slate-200">Session Active</span>
              </div>
              <span class="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md font-mono">48:23</span>
            </div>

            <!-- Patient -->
            <div class="flex items-center gap-3 pb-4 mb-4 border-b border-white/5">
              <div class="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-semibold text-indigo-300">MG</span>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-200">M. García</p>
                <p class="text-xs text-slate-500">Session #12 · Generalized Anxiety</p>
              </div>
              <div class="ml-auto">
                <span class="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">Review</span>
              </div>
            </div>

            <!-- AI Insight -->
            <div class="bg-indigo-950/50 border border-indigo-500/20 rounded-xl p-3.5 mb-4">
              <div class="flex items-center gap-2 mb-2.5">
                <div class="w-5 h-5 rounded-md bg-indigo-600/40 flex items-center justify-center">
                  <span class="text-[9px] font-bold text-indigo-300">AI</span>
                </div>
                <span class="text-xs font-semibold text-indigo-300">NoeIA Insight</span>
                <div class="ml-auto flex gap-0.5">
                  <div v-for="i in 5" :key="i" class="w-1 rounded-full bg-indigo-400/40" :style="{ height: `${6 + i * 2}px` }" />
                </div>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                "Elevated anxiety markers in last 3 sessions. PHQ-9 trend: <span class="text-rose-400 font-medium">↑ 4 pts</span> over 2 weeks. Consider adjusting CBT frequency."
              </p>
            </div>

            <!-- Mini chart -->
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-slate-500">PHQ-9 Progress</span>
                <span class="text-xs text-teal-400 font-medium">–3 this month</span>
              </div>
              <div class="flex items-end gap-1 h-10">
                <div v-for="(h, i) in [40, 55, 60, 72, 65, 50, 45, 38]" :key="i"
                  class="flex-1 rounded-t-sm transition-all"
                  :class="i === 7 ? 'bg-teal-400' : 'bg-slate-700'"
                  :style="{ height: `${h}%` }" />
              </div>
            </div>

            <!-- Actions -->
            <div class="grid grid-cols-3 gap-2">
              <button class="bg-slate-800 hover:bg-slate-700 rounded-lg py-2 transition-colors">
                <p class="text-[11px] text-slate-400 text-center">Add Note</p>
              </button>
              <button class="bg-slate-800 hover:bg-slate-700 rounded-lg py-2 transition-colors">
                <p class="text-[11px] text-slate-400 text-center">Report</p>
              </button>
              <button class="bg-indigo-600/60 hover:bg-indigo-600/80 rounded-lg py-2 transition-colors">
                <p class="text-[11px] text-indigo-200 text-center">Message</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Trusted by strip -->
      <div class="relative border-t border-white/5 py-8">
        <div class="max-w-6xl mx-auto px-6 text-center">
          <p class="text-slate-600 text-xs uppercase tracking-widest mb-6">Trusted by mental health professionals at</p>
          <div class="flex flex-wrap justify-center gap-x-12 gap-y-4 items-center">
            <span v-for="org in ['MindCare Clinics', 'Nexus Psych', 'TherapyBridge', 'ClearMind Institute', 'WellPath Network']" :key="org"
              class="text-slate-700 font-semibold text-sm tracking-tight">
              {{ org }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FEATURES ─── -->
    <section id="features" class="bg-slate-50 py-24">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <span class="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Platform</span>
          <h2 class="text-4xl font-bold text-slate-900 mt-2 mb-4">Everything for a modern practice</h2>
          <p class="text-slate-500 text-lg max-w-2xl mx-auto">Noeia combines clinical intelligence, administrative efficiency, and patient communication in one platform built for mental health.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="f in features" :key="f.title"
            class="bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
              <!-- Brain -->
              <svg v-if="f.icon === 'brain'" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.44 1.44a1.875 1.875 0 01-2.651 0l-1.258-1.258a3.75 3.75 0 00-5.302 0l-1.258 1.258a1.875 1.875 0 01-2.651 0L3.6 15m16.2 0l1.2 1.2a4.125 4.125 0 010 5.834L19.8 23.25"/>
              </svg>
              <!-- FileText -->
              <svg v-else-if="f.icon === 'file-text'" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <!-- Shield -->
              <svg v-else-if="f.icon === 'shield'" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
              </svg>
              <!-- BarChart -->
              <svg v-else-if="f.icon === 'bar-chart'" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
              </svg>
              <!-- MessageCircle -->
              <svg v-else-if="f.icon === 'message-circle'" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
              </svg>
              <!-- Building -->
              <svg v-else class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-slate-900 mb-2">{{ f.title }}</h3>
            <p class="text-slate-500 text-sm leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── HOW IT WORKS ─── -->
    <section id="how-it-works" class="bg-slate-900 py-24">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <span class="text-teal-400 text-sm font-semibold uppercase tracking-wider">Process</span>
          <h2 class="text-4xl font-bold text-white mt-2 mb-4">Up and running in minutes</h2>
          <p class="text-slate-400 text-lg max-w-xl mx-auto">No lengthy implementation, no IT team required. Noeia is designed for busy clinicians.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="(step, i) in [
            { n: '01', title: 'Create your profile', desc: 'Set up your professional identity and clinical specialization. The onboarding takes under 4 minutes.', color: 'indigo' },
            { n: '02', title: 'Invite your patients', desc: 'Send secure magic links. Patients complete a guided intake — no apps to download, no passwords to remember.', color: 'violet' },
            { n: '03', title: 'Let NoeIA assist', desc: 'Begin sessions with real-time AI support for documentation, pattern recognition, and clinical insights.', color: 'teal' },
          ]" :key="i" class="relative">
            <!-- Connector line -->
            <div v-if="i < 2" class="hidden md:block absolute top-8 left-full w-8 border-t border-dashed border-slate-700 z-10" />

            <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-colors">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl font-black"
                  :class="step.color === 'indigo' ? 'text-indigo-500/40' : step.color === 'violet' ? 'text-violet-500/40' : 'text-teal-500/40'">
                  {{ step.n }}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-white mb-2">{{ step.title }}</h3>
              <p class="text-slate-400 text-sm leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── TESTIMONIALS ─── -->
    <section id="testimonials" class="bg-white py-24">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <span class="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
          <h2 class="text-4xl font-bold text-slate-900 mt-2">Loved by clinicians</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="t in testimonials" :key="t.name"
            class="border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <!-- Stars -->
            <div class="flex gap-0.5 mb-4">
              <svg v-for="s in 5" :key="s" class="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <blockquote class="text-slate-600 text-sm leading-relaxed mb-5">"{{ t.quote }}"</blockquote>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-semibold text-indigo-700">{{ t.initials }}</span>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ t.name }}</p>
                <p class="text-xs text-slate-500">{{ t.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── CTA ─── -->
    <section class="bg-gradient-to-br from-indigo-600 to-violet-700 py-24">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <h2 class="text-4xl font-bold text-white mb-4">Ready to transform your practice?</h2>
        <p class="text-indigo-200 text-lg mb-10">Join the growing community of mental health professionals using Noeia to deliver better care.</p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/30"
        >
          Get started — it's free
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </NuxtLink>
        <p class="text-indigo-300/60 text-sm mt-4">No credit card · Free during beta · HIPAA compliant</p>
      </div>
    </section>

    <!-- ─── FOOTER ─── -->
    <footer class="bg-slate-950 border-t border-white/5 py-12">
      <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span class="text-white font-bold text-xs">N</span>
          </div>
          <span class="text-white font-semibold tracking-tight">Noeia</span>
        </div>
        <div class="flex gap-6 text-slate-600 text-sm">
          <a href="#" class="hover:text-slate-400 transition-colors">Privacy</a>
          <a href="#" class="hover:text-slate-400 transition-colors">Terms</a>
          <a href="#" class="hover:text-slate-400 transition-colors">HIPAA</a>
          <a href="#" class="hover:text-slate-400 transition-colors">Contact</a>
        </div>
        <p class="text-slate-700 text-sm">© 2026 Noeia Health Inc.</p>
      </div>
    </footer>

  </div>
</template>
