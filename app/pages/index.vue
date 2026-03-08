<script setup lang="ts">
const stats = [
  { value: '2h',   label: 'saved per session',    color: 'text-[#E83D59]'  },
  { value: '12s',  label: 'to generate a note',   color: 'text-violet-600' },
  { value: '94%',  label: 'less admin time',       color: 'text-emerald-600'},
  { value: '4.9★', label: 'average rating',        color: 'text-amber-500'  },
]

const testimonials = [
  {
    quote: 'NoeIA has fundamentally changed how I run my practice. The AI clinical notes save me 2 hours a day, and the pattern recognition caught something I\'d missed across 6 sessions.',
    name: 'Dr. Elena Martínez', role: 'Clinical Psychologist · Madrid',   initials: 'EM', bg: 'bg-[#E83D59]',
  },
  {
    quote: 'As a psychiatrist managing 40+ patients, the outcome tracking dashboards are invaluable. I can finally quantify treatment progress in a way that resonates with both patients and insurers.',
    name: 'Dr. James Okafor',   role: 'Psychiatrist · London',            initials: 'JO', bg: 'bg-violet-600',
  },
  {
    quote: 'The onboarding took 4 minutes. Four. Minutes. Every other medical platform I\'ve tried made me fill out the same form seven times. Noeia actually respects my time.',
    name: 'Dr. Sofia Chen',     role: 'Child & Adolescent Therapist · Toronto', initials: 'SC', bg: 'bg-sky-600',
  },
]

const orgs = ['MindCare Clinics', 'Nexus Psych', 'TherapyBridge', 'ClearMind Institute', 'WellPath Network']
</script>

<template>
  <div class="min-h-screen bg-white font-sans overflow-x-hidden">

    <!-- ─── NAVBAR ─── -->
    <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-[#E83D59] flex items-center justify-center shrink-0">
            <img src="/Noeia_logo_mini.svg" alt="" class="w-4 h-4 brightness-0 invert" />
          </div>
          <img src="/Noeia_logo.svg" alt="Noeia" class="h-5" />
        </NuxtLink>

        <div class="hidden md:flex items-center gap-8">
          <a href="#features"      class="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Features</a>
          <a href="#how-it-works"  class="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">How it works</a>
          <a href="#testimonials"  class="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Stories</a>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink to="/login" class="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors hidden sm:block">Sign in</NuxtLink>
          <NuxtLink to="/select-role" class="bg-[#E83D59] hover:bg-[#c42843] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shadow-[#E83D59]/20 hover:-translate-y-px">
            Get early access
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- ─── HERO ─── -->
    <section class="relative overflow-hidden bg-white">
      <!-- Dot grid -->
      <div class="absolute inset-0 pointer-events-none dot-grid opacity-60" />
      <!-- Brand glow -->
      <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#E83D59] opacity-5 blur-[100px] pointer-events-none" />

      <div class="relative max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">

        <!-- Badge -->
        <div class="inline-flex items-center gap-2 bg-rose-50 border border-[#E83D59]/20 rounded-full px-4 py-1.5 mb-8">
          <span class="w-1.5 h-1.5 rounded-full bg-[#E83D59] animate-pulse" />
          <span class="text-[#E83D59] text-xs font-semibold">Early Access — Free during beta</span>
        </div>

        <!-- Headline -->
        <h1 class="text-6xl sm:text-7xl lg:text-[88px] font-black text-gray-950 leading-none tracking-tight mb-6">
          Stop writing<br />
          <span class="text-[#E83D59]">session notes.</span>
        </h1>

        <p class="text-gray-400 text-xl leading-relaxed max-w-xl mx-auto mb-10">
          NoeIA listens to every session and generates clinical-grade documentation in seconds.
          Built for mental health professionals who'd rather focus on their patients.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <NuxtLink
            to="/select-role"
            class="group flex items-center gap-2 bg-[#E83D59] hover:bg-[#c42843] text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-base shadow-lg shadow-[#E83D59]/25 hover:shadow-[#E83D59]/40 hover:-translate-y-0.5"
          >
            Start for free
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </NuxtLink>
          <a href="#features" class="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-base font-medium transition-colors">
            See how it works
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </a>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden shadow-sm max-w-2xl mx-auto mb-20">
          <div v-for="s in stats" :key="s.label" class="px-6 py-5 text-center bg-white">
            <p :class="['text-3xl font-black mb-1', s.color]">{{ s.value }}</p>
            <p class="text-gray-400 text-xs">{{ s.label }}</p>
          </div>
        </div>

        <!-- Product mockup -->
        <div class="relative max-w-5xl mx-auto">
          <div class="absolute -inset-8 rounded-3xl pointer-events-none" style="background: radial-gradient(ellipse, rgba(232,61,89,0.07) 0%, transparent 70%)" />

          <div class="relative bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/40 text-left animate-float">
            <!-- Browser bar -->
            <div class="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-gray-900 shrink-0">
              <div class="flex gap-1.5 shrink-0">
                <div class="w-3 h-3 rounded-full bg-gray-700" />
                <div class="w-3 h-3 rounded-full bg-gray-700" />
                <div class="w-3 h-3 rounded-full bg-gray-700" />
              </div>
              <div class="flex-1 flex justify-center">
                <div class="bg-gray-800 rounded-md px-3 py-1 text-xs text-gray-500 flex items-center gap-2 max-w-xs w-full justify-center">
                  <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  app.noeia.health/session
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="flex items-center gap-1.5 text-xs font-medium" style="color:#E83D59">
                  <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background:#E83D59" />
                  Recording
                </span>
                <span class="text-xs text-gray-600 font-mono">31:47</span>
              </div>
            </div>

            <!-- App shell -->
            <div class="flex" style="height:420px">

              <!-- Patient sidebar -->
              <div class="w-48 border-r border-white/5 flex flex-col py-2 shrink-0 overflow-hidden bg-gray-950">
                <p class="px-4 py-2 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Today's sessions</p>

                <div class="flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-r-lg border-l-2" style="background:rgba(232,61,89,0.08);border-color:#E83D59">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style="background:rgba(232,61,89,0.15);border:1px solid rgba(232,61,89,0.3);color:#E83D59">SM</div>
                  <div class="min-w-0">
                    <p class="text-xs font-semibold text-white truncate">Sofia Martinez</p>
                    <p class="text-[10px]" style="color:#E83D59">10:00am · Active</p>
                  </div>
                </div>

                <div
                  v-for="(p, i) in [
                    { i:'JD', n:'John Doe',     t:'11:30am', bg:'bg-sky-950/60',    bd:'border-sky-700/40',    tx:'text-sky-300'    },
                    { i:'MT', n:'Maddy Test',    t:'2:00pm',  bg:'bg-violet-950/60', bd:'border-violet-700/40', tx:'text-violet-300' },
                    { i:'EV', n:'Elena Vasquez', t:'4:30pm',  bg:'bg-amber-950/60',  bd:'border-amber-700/40',  tx:'text-amber-300'  },
                  ]"
                  :key="i"
                  class="flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-lg mt-0.5 hover:bg-white/5 cursor-pointer"
                >
                  <div :class="['w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0', p.bg, p.bd, p.tx]">{{ p.i }}</div>
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-gray-400 truncate">{{ p.n }}</p>
                    <p class="text-[10px] text-gray-600">{{ p.t }}</p>
                  </div>
                </div>
              </div>

              <!-- Main area -->
              <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-950">
                <!-- Session header -->
                <div class="shrink-0 px-5 py-3 border-b border-white/5 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style="background:rgba(232,61,89,0.2);border:1px solid rgba(232,61,89,0.3);color:#E83D59">SM</div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-white">Sofia Martinez</p>
                      <p class="text-xs text-gray-500">Session #12 · Generalized Anxiety · CBT</p>
                    </div>
                  </div>
                  <button class="flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg font-medium shrink-0" style="background:rgba(232,61,89,0.15);color:#E83D59;border-color:rgba(232,61,89,0.3)">
                    <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background:#E83D59" />
                    Recording…
                  </button>
                </div>

                <!-- Tabs -->
                <div class="shrink-0 flex items-end gap-0.5 px-4 pt-2 border-b border-white/5">
                  <div class="text-xs font-medium text-white bg-gray-800 border border-white/10 border-b-gray-950 px-3 py-1.5 rounded-t-lg -mb-px relative z-10 flex items-center gap-1.5">
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Session notes
                  </div>
                  <div class="text-xs text-gray-600 px-3 py-1.5">Context</div>
                  <div class="text-xs text-gray-600 px-3 py-1.5">Transcript</div>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-hidden flex">
                  <!-- Editor -->
                  <div class="flex-1 p-5 overflow-y-auto">
                    <p class="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-2 flex-wrap">
                      SOAP Note
                      <span class="text-[9px] font-semibold px-2 py-0.5 rounded-full border" style="background:rgba(232,61,89,0.12);color:#E83D59;border-color:rgba(232,61,89,0.2)">Generated by NoeIA in 8s</span>
                    </p>
                    <div class="space-y-3 text-xs leading-relaxed">
                      <div>
                        <p class="font-semibold text-[11px] mb-1 uppercase tracking-wide" style="color:#E83D59">Subjective</p>
                        <p class="text-gray-500">Patient reports reduced anxiety (7/10 → 5/10). Breathing exercises applied twice daily. Sleep onset improved from 90 min to 45 min. No SI/HI.</p>
                      </div>
                      <div>
                        <p class="font-semibold text-[11px] mb-1 uppercase tracking-wide" style="color:#E83D59">Objective</p>
                        <p class="text-gray-500">GAD-7: 8 (↓4 from last session). Affect appropriate, normal speech rate and rhythm. Good engagement and insight throughout session.</p>
                      </div>
                      <div>
                        <p class="font-semibold text-[11px] mb-1 uppercase tracking-wide" style="color:#E83D59">Plan</p>
                        <p class="text-gray-500">Continue CBT weekly. Cognitive restructuring for work-related catastrophising. F/U in 2 weeks. Refer to Dr. García for medication review.</p>
                      </div>
                    </div>
                  </div>

                  <!-- Tasks -->
                  <div class="w-48 border-l border-white/5 p-4 shrink-0 overflow-hidden bg-gray-900/40">
                    <p class="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-3">AI-extracted tasks</p>
                    <div class="space-y-2.5">
                      <div v-for="task in [
                        { text:'Refer to Dr. García for medication review', done:false },
                        { text:'Update GAD-7 score in patient record',      done:false },
                        { text:'Flu vaccine administered',                   done:true  },
                      ]" :key="task.text" class="flex items-start gap-2">
                        <div class="mt-0.5 w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors"
                          :style="task.done ? 'background:#E83D59;border-color:#E83D59' : 'border-color:#374151'">
                          <svg v-if="task.done" class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <p :class="['text-[10px] leading-snug', task.done ? 'text-gray-600 line-through' : 'text-gray-400']">{{ task.text }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- Trusted by -->
      <div class="border-t border-gray-100 py-8 bg-gray-50">
        <div class="max-w-6xl mx-auto px-6 text-center">
          <p class="text-gray-300 text-xs uppercase tracking-widest mb-5 font-semibold">Trusted by mental health professionals at</p>
          <div class="flex flex-wrap justify-center gap-x-12 gap-y-3">
            <span v-for="org in orgs" :key="org" class="text-gray-300 font-semibold text-sm">{{ org }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FEATURES ─── -->
    <section id="features" class="bg-white py-24 border-t border-gray-100">
      <div class="max-w-6xl mx-auto px-6">

        <div class="max-w-2xl mb-14">
          <span class="text-[#E83D59] text-sm font-semibold uppercase tracking-wider">Platform</span>
          <h2 class="text-5xl font-black text-gray-950 mt-3 mb-4 leading-tight">Everything for a modern mental health practice</h2>
          <p class="text-gray-400 text-lg leading-relaxed">Clinical AI, documentation, billing, and patient management — in one platform built exclusively for mental health professionals.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <!-- NoeIA Scribe — hero card -->
          <div class="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-[#E83D59]/20 transition-all duration-300 hover:-translate-y-1 group">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-[11px] font-semibold text-[#E83D59] uppercase tracking-wider bg-rose-50 border border-[#E83D59]/15 px-2.5 py-1 rounded-full">AI Scribe</span>
              <span class="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-semibold">Core feature</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3 leading-tight">From spoken word to signed note — in seconds</h3>
            <p class="text-gray-400 text-sm leading-relaxed mb-6 max-w-lg">NoeIA listens live or processes your recordings. Generates structured SOAP, DAP, and progress notes in your voice and style — ready to review and sign in under 12 seconds.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div v-for="b in ['Live transcription with speaker separation','SOAP, DAP, narrative — any format','Customizable templates per patient','Edit, approve and sign in one click']" :key="b" class="flex items-center gap-2.5 text-sm text-gray-600">
                <div class="w-4 h-4 rounded-full bg-rose-50 border border-[#E83D59]/20 flex items-center justify-center shrink-0">
                  <svg class="w-2.5 h-2.5 text-[#E83D59]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </div>
                {{ b }}
              </div>
            </div>
          </div>

          <!-- Clinical Insights -->
          <div class="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 hover:-translate-y-1">
            <span class="text-[11px] font-semibold text-violet-600 uppercase tracking-wider bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full inline-block mb-3">Clinical Insights</span>
            <h3 class="text-xl font-bold text-gray-900 mb-2 leading-tight">Pattern detection across your caseload</h3>
            <p class="text-gray-400 text-sm leading-relaxed">Tracks PHQ-9, GAD-7, and behavioral signals across sessions — surfacing early warning signs before they become urgent.</p>
          </div>

          <!-- Task Management -->
          <div class="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-sky-200 transition-all duration-300 hover:-translate-y-1">
            <span class="text-[11px] font-semibold text-sky-600 uppercase tracking-wider bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-full inline-block mb-3">Task Management</span>
            <h3 class="text-xl font-bold text-gray-900 mb-2 leading-tight">Never miss a follow-up again</h3>
            <p class="text-gray-400 text-sm leading-relaxed">Tasks automatically extracted from session notes. Referrals, prescriptions, callbacks — categorized and linked to patients.</p>
          </div>

          <!-- Template Community -->
          <div class="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300 hover:-translate-y-1">
            <span class="text-[11px] font-semibold text-amber-600 uppercase tracking-wider bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full inline-block mb-3">Template Community</span>
            <h3 class="text-xl font-bold text-gray-900 mb-2 leading-tight">Built by clinicians, for clinicians</h3>
            <p class="text-gray-400 text-sm leading-relaxed">Browse 2,000+ verified templates — ADOS-2, PHQ-9, CBT frameworks, referral letters — created and rated by practitioners worldwide.</p>
          </div>

          <!-- Security -->
          <div class="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1">
            <span class="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full inline-block mb-3">Security</span>
            <h3 class="text-xl font-bold text-gray-900 mb-2 leading-tight">HIPAA-grade from day one</h3>
            <p class="text-gray-400 text-sm leading-relaxed">End-to-end encryption, audit logs, role-based access control. Your patients' data never trains our models — ever.</p>
          </div>

          <!-- Practice Management -->
          <div class="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-[#E83D59]/20 transition-all duration-300 hover:-translate-y-1">
            <span class="text-[11px] font-semibold text-[#E83D59] uppercase tracking-wider bg-rose-50 border border-[#E83D59]/15 px-2.5 py-1 rounded-full inline-block mb-3">Practice Management</span>
            <h3 class="text-xl font-bold text-gray-900 mb-2 leading-tight">Billing, teams, and multi-clinic ops</h3>
            <p class="text-gray-400 text-sm leading-relaxed">Unified dashboards, team management, commission tracking, and invoicing across all your locations in one place.</p>
          </div>

        </div>
      </div>
    </section>

    <!-- ─── HOW IT WORKS ─── -->
    <section id="how-it-works" class="bg-gray-50 py-24 border-t border-gray-100">
      <div class="max-w-6xl mx-auto px-6">

        <div class="text-center mb-16">
          <span class="text-[#E83D59] text-sm font-semibold uppercase tracking-wider">Process</span>
          <h2 class="text-5xl font-black text-gray-950 mt-3 mb-4">Up and running in minutes</h2>
          <p class="text-gray-400 text-lg max-w-xl mx-auto">No IT team. No lengthy implementation. Designed for busy clinicians.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-4">
          <div
            v-for="(step, i) in [
              { n:'01', title:'Set up in 4 minutes',       desc:'Create your professional profile and clinical specialization. Choose your template preferences. Done in minutes, not days.', accent:'text-[#E83D59]', hover:'hover:border-[#E83D59]/20' },
              { n:'02', title:'Start your first session',   desc:'Hit record. NoeIA transcribes in real time with speaker separation. Add context notes as you go — all feeds the AI.', accent:'text-violet-500', hover:'hover:border-violet-200' },
              { n:'03', title:'Review, sign, move on',      desc:'Your structured note is ready seconds after the session ends. Review, edit if needed, sign — and on to the next patient. No end-of-day paperwork.', accent:'text-emerald-500', hover:'hover:border-emerald-200' },
            ]"
            :key="i"
          >
            <div :class="['bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full', step.hover]">
              <span :class="['text-6xl font-black leading-none block mb-6 select-none opacity-15', step.accent]">{{ step.n }}</span>
              <h3 class="text-xl font-bold text-gray-900 mb-3">{{ step.title }}</h3>
              <p class="text-gray-400 text-sm leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ─── TESTIMONIALS ─── -->
    <section id="testimonials" class="bg-white py-24 border-t border-gray-100">
      <div class="max-w-6xl mx-auto px-6">

        <div class="text-center mb-16">
          <span class="text-[#E83D59] text-sm font-semibold uppercase tracking-wider">Stories</span>
          <h2 class="text-5xl font-black text-gray-950 mt-3">Loved by clinicians</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-5">
          <div
            v-for="(t, i) in testimonials"
            :key="t.name"
            :class="[
              'bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col gap-5',
              i === 1 ? 'hover:rotate-1' : i === 2 ? 'hover:-rotate-1' : 'hover:-translate-y-1',
            ]"
          >
            <div class="flex gap-0.5">
              <svg v-for="s in 5" :key="s" class="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <blockquote class="text-gray-600 text-sm leading-relaxed flex-1">"{{ t.quote }}"</blockquote>
            <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0', t.bg]">{{ t.initials }}</div>
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ t.name }}</p>
                <p class="text-xs text-gray-400">{{ t.role }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ─── CTA ─── -->
    <section class="relative overflow-hidden py-24" style="background:#E83D59">
      <div class="absolute inset-0 pointer-events-none cta-pattern" />
      <div class="relative max-w-3xl mx-auto px-6 text-center">
        <h2 class="text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
          Your next session,<br />
          without the paperwork.
        </h2>
        <p class="text-white/70 text-lg mb-10 max-w-xl mx-auto">
          Join 2,000+ mental health professionals already on the waitlist. Free during beta — no credit card required.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <NuxtLink
            to="/select-role"
            class="group flex items-center gap-2 bg-white hover:bg-gray-50 text-[#E83D59] font-bold px-8 py-4 rounded-xl transition-all text-base shadow-xl shadow-black/20 hover:-translate-y-0.5"
          >
            Start for free
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </NuxtLink>
          <NuxtLink to="/login" class="text-white/60 hover:text-white text-sm font-medium transition-colors px-4">
            Already have an account? Sign in →
          </NuxtLink>
        </div>

        <p class="text-white/40 text-xs mt-6">No credit card · HIPAA compliant · Cancel anytime</p>
      </div>
    </section>

    <!-- ─── FOOTER ─── -->
    <footer class="bg-gray-950 border-t border-white/5 py-10">
      <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-[#E83D59] flex items-center justify-center shrink-0">
            <img src="/Noeia_logo_mini.svg" alt="" class="w-3.5 h-3.5 brightness-0 invert" />
          </div>
          <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-4" />
        </div>
        <div class="flex gap-6 text-gray-600 text-sm">
          <a href="#" class="hover:text-gray-400 transition-colors">Privacy</a>
          <a href="#" class="hover:text-gray-400 transition-colors">Terms</a>
          <a href="#" class="hover:text-gray-400 transition-colors">HIPAA</a>
          <a href="#" class="hover:text-gray-400 transition-colors">Contact</a>
        </div>
        <p class="text-gray-700 text-sm">© 2026 Noeia Health Inc.</p>
      </div>
    </footer>

  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}
.animate-float { animation: float 5s ease-in-out infinite; }

.dot-grid {
  background-image: radial-gradient(#d1d5db 1px, transparent 1px);
  background-size: 24px 24px;
}

.cta-pattern {
  background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 22px 22px;
}
</style>
