<script setup lang="ts">
const props = defineProps<{ currentStep: number }>()

const stepContent = computed(() => {
  if (props.currentStep === 1) return {
    eyebrow: 'Why Noeia',
    headline: 'Built for the way\nclinicians actually work.',
    body: 'Everything you need — sessions, notes, billing, patients — in one AI-powered workspace.',
    bullets: [
      { icon: 'sparkle', text: 'AI session notes generated automatically' },
      { icon: 'calendar', text: 'Smart scheduling across your whole team' },
      { icon: 'bolt',     text: 'Billing drafted the moment sessions end' },
    ],
    stat: null, quote: null,
  }
  if (props.currentStep === 2) return {
    eyebrow: 'Trusted worldwide',
    headline: 'Thousands of clinicians\nalready saving hours weekly.',
    body: null,
    bullets: null,
    stat: [
      { value: '10k+', label: 'Clinicians' },
      { value: '2M+',  label: 'Sessions'   },
      { value: '60%',  label: 'Less admin' },
    ],
    quote: {
      text: 'Noeia reduced my documentation time by 60%. I spend more time with patients and less time on paperwork.',
      author: 'Dr. Ana Ruiz', role: 'Clinical Psychologist · MindCare Clinics', initials: 'AR',
    },
  }
  return {
    eyebrow: 'Almost there',
    headline: 'A workspace made\nentirely for you.',
    body: 'Your answers help us tailor Noeia to how you actually work — so everything feels like it was designed for your practice.',
    bullets: [
      { icon: 'template', text: 'Scribe templates matched to your specialty' },
      { icon: 'evidence', text: 'Evidence sources relevant to your field'   },
      { icon: 'team',     text: 'Workflows sized for your team'              },
    ],
    stat: null, quote: null,
  }
})
</script>

<template>
  <div
    style="width: 100%; height: 100%; display: flex; flex-direction: column; position: relative; overflow: hidden; background: oklch(0.975 0.009 35);"
  >

    <!-- ══ BACKGROUND LAYER ══════════════════════════════════════════════ -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="ill-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#1a1a1a" fill-opacity="0.055" />
        </pattern>
        <radialGradient id="dot-fade" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="white" stop-opacity="0" />
          <stop offset="100%" stop-color="white" stop-opacity="1" />
        </radialGradient>
        <mask id="dot-mask-panel">
          <rect width="100%" height="100%" fill="white" />
          <rect width="100%" height="100%" fill="url(#dot-fade)" />
        </mask>
      </defs>
      <!-- Dot grid -->
      <rect width="100%" height="100%" fill="url(#ill-dots)" mask="url(#dot-mask-panel)" />
      <!-- Ambient glows -->
      <circle cx="88%" cy="12%" r="280" fill="#E83D59" fill-opacity="0.05" />
      <circle cx="8%"  cy="88%" r="200" fill="#E83D59" fill-opacity="0.035" />
      <circle cx="55%" cy="50%" r="220" fill="#fff5f0"  fill-opacity="0.5"  />
    </svg>

    <!-- ══ DECORATIVE ABSTRACT SVG (full panel) ══════════════════════════ -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

      <!-- Large orbit ring (centered right) -->
      <circle cx="390" cy="460" r="175" stroke="#E83D59" stroke-opacity="0.09" stroke-width="1.5" fill="none" stroke-dasharray="6 5" />
      <!-- Second ring (smaller, lower left) -->
      <circle cx="110" cy="640" r="90"  stroke="#E83D59" stroke-opacity="0.07" stroke-width="1"   fill="none" stroke-dasharray="4 4" />
      <!-- Top arc decoration -->
      <path d="M 460 20 Q 540 140 420 240" stroke="#E83D59" stroke-opacity="0.08" stroke-width="1.5" fill="none" />

      <!-- Orbital anchor dots -->
      <circle cx="390" cy="285" r="5"  fill="#E83D59" fill-opacity="0.18" />
      <circle cx="565" cy="460" r="4"  fill="#E83D59" fill-opacity="0.14" />
      <circle cx="310" cy="620" r="5"  fill="#E83D59" fill-opacity="0.16" />
      <circle cx="215" cy="460" r="3"  fill="#E83D59" fill-opacity="0.12" />

      <!-- Calendar grid fragment (top-right area) -->
      <g opacity="0.7">
        <rect x="410" y="80"  width="10" height="10" rx="2" fill="#E83D59" fill-opacity="0.22" />
        <rect x="424" y="80"  width="10" height="10" rx="2" fill="#1a1a1a" fill-opacity="0.06" />
        <rect x="438" y="80"  width="10" height="10" rx="2" fill="#E83D59" fill-opacity="0.1"  />
        <rect x="452" y="80"  width="10" height="10" rx="2" fill="#1a1a1a" fill-opacity="0.06" />
        <rect x="466" y="80"  width="10" height="10" rx="2" fill="#1a1a1a" fill-opacity="0.06" />
        <rect x="410" y="94"  width="10" height="10" rx="2" fill="#1a1a1a" fill-opacity="0.06" />
        <rect x="424" y="94"  width="10" height="10" rx="2" fill="#E83D59" fill-opacity="0.18" />
        <rect x="438" y="94"  width="10" height="10" rx="2" fill="#1a1a1a" fill-opacity="0.06" />
        <rect x="452" y="94"  width="10" height="10" rx="2" fill="#E83D59" fill-opacity="0.08" />
        <rect x="466" y="94"  width="10" height="10" rx="2" fill="#1a1a1a" fill-opacity="0.06" />
        <rect x="410" y="108" width="10" height="10" rx="2" fill="#1a1a1a" fill-opacity="0.06" />
        <rect x="424" y="108" width="10" height="10" rx="2" fill="#1a1a1a" fill-opacity="0.06" />
        <rect x="438" y="108" width="10" height="10" rx="2" fill="#E83D59" fill-opacity="0.25" />
        <rect x="452" y="108" width="10" height="10" rx="2" fill="#1a1a1a" fill-opacity="0.06" />
        <rect x="466" y="108" width="10" height="10" rx="2" fill="#1a1a1a" fill-opacity="0.06" />
      </g>

      <!-- Scattered dots -->
      <circle cx="55"  cy="160" r="3"   fill="#1a1a1a" fill-opacity="0.09" />
      <circle cx="490" cy="200" r="2.5" fill="#E83D59" fill-opacity="0.14" />
      <circle cx="140" cy="340" r="2"   fill="#E83D59" fill-opacity="0.1"  />
      <circle cx="480" cy="380" r="3.5" fill="#1a1a1a" fill-opacity="0.07" />
      <circle cx="70"  cy="500" r="2.5" fill="#E83D59" fill-opacity="0.12" />
      <circle cx="440" cy="560" r="2"   fill="#1a1a1a" fill-opacity="0.08" />
      <circle cx="180" cy="690" r="3"   fill="#E83D59" fill-opacity="0.11" />
      <circle cx="500" cy="710" r="2"   fill="#1a1a1a" fill-opacity="0.07" />
      <circle cx="330" cy="760" r="3.5" fill="#E83D59" fill-opacity="0.1"  />
      <circle cx="90"  cy="760" r="2"   fill="#1a1a1a" fill-opacity="0.07" />

      <!-- Plus / cross accents -->
      <path d="M492 310 v9 M487.5 314.5 h9" stroke="#E83D59" stroke-opacity="0.22" stroke-width="1.5" stroke-linecap="round" />
      <path d="M60  420 v7 M56.5  423.5 h7" stroke="#1a1a1a" stroke-opacity="0.12" stroke-width="1.5" stroke-linecap="round" />
      <path d="M270 760 v7 M266.5 763.5 h7" stroke="#E83D59" stroke-opacity="0.18" stroke-width="1.5" stroke-linecap="round" />
      <path d="M440 160 v6 M437  163   h6" stroke="#E83D59" stroke-opacity="0.2"  stroke-width="1.5" stroke-linecap="round" />

      <!-- Abstract pill shapes (session records) -->
      <rect x="58"  y="580" width="70" height="14" rx="7" fill="none" stroke="#E83D59" stroke-opacity="0.15" stroke-width="1"   />
      <rect x="66"  y="598" width="48" height="10" rx="5" fill="none" stroke="#1a1a1a" stroke-opacity="0.07" stroke-width="1"   />
      <rect x="430" y="680" width="65" height="14" rx="7" fill="#E83D59" fill-opacity="0.06" stroke="#E83D59" stroke-opacity="0.12" stroke-width="1" />

      <!-- Connector dashed lines between cards -->
      <path d="M200 390 C 260 380 300 420 320 450" stroke="#E83D59" stroke-opacity="0.12" stroke-width="1" fill="none" stroke-dasharray="4 4" />
      <path d="M200 560 C 260 580 300 570 340 555" stroke="#E83D59" stroke-opacity="0.1"  stroke-width="1" fill="none" stroke-dasharray="4 4" />
      <circle cx="200" cy="390" r="3" fill="#E83D59" fill-opacity="0.18" />
      <circle cx="320" cy="450" r="3" fill="#E83D59" fill-opacity="0.18" />
      <circle cx="200" cy="560" r="3" fill="#E83D59" fill-opacity="0.15" />
      <circle cx="340" cy="555" r="3" fill="#E83D59" fill-opacity="0.15" />
    </svg>

    <!-- ══ TEXT CONTENT (top, flex-shrink-0) ════════════════════════════ -->
    <div class="relative z-10 flex-shrink-0 px-10 pt-12 pb-6" style="max-width: 460px;">

      <!-- Eyebrow -->
      <div class="mb-3 inline-flex items-center gap-2">
        <div style="width: 18px; height: 2px; background: #E83D59; border-radius: 1px;" />
        <span style="font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #E83D59; font-family: 'Plus Jakarta Sans', system-ui;">
          {{ stepContent.eyebrow }}
        </span>
      </div>

      <Transition name="content-fade" mode="out-in">
        <div :key="currentStep">
          <h2 style="font-size: 26px; font-weight: 700; color: oklch(0.14 0 0); line-height: 1.22; margin-bottom: 12px; white-space: pre-line; font-family: 'Plus Jakarta Sans', system-ui;">
            {{ stepContent.headline }}
          </h2>
          <p v-if="stepContent.body" style="font-size: 13px; color: oklch(0.5 0 0); line-height: 1.65; margin-bottom: 16px; font-family: 'Plus Jakarta Sans', system-ui;">
            {{ stepContent.body }}
          </p>
          <ul v-if="stepContent.bullets" style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px;">
            <li v-for="b in stepContent.bullets" :key="b.text" style="display:flex; align-items:center; gap:9px;">
              <div style="width:26px; height:26px; border-radius:7px; background:rgba(232,61,89,0.1); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <svg v-if="b.icon==='sparkle'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E83D59" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke-linecap="round"/></svg>
                <svg v-else-if="b.icon==='calendar'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E83D59" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/></svg>
                <svg v-else-if="b.icon==='bolt'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E83D59" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <svg v-else-if="b.icon==='template'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E83D59" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9" stroke-linecap="round"/></svg>
                <svg v-else-if="b.icon==='evidence'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E83D59" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E83D59" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-linecap="round"/></svg>
              </div>
              <span style="font-size:12.5px; color:oklch(0.32 0 0); font-family:'Plus Jakarta Sans', system-ui;">{{ b.text }}</span>
            </li>
          </ul>
          <div v-if="stepContent.stat" style="display:flex; gap:0; margin-bottom:16px; border:1.5px solid oklch(0.91 0 0); border-radius:12px; overflow:hidden; background:white;">
            <div v-for="(s,i) in stepContent.stat" :key="s.label" :style="{ flex:1, padding:'12px 0', textAlign:'center', borderRight: i < stepContent.stat.length-1 ? '1.5px solid oklch(0.91 0 0)' : 'none' }">
              <p style="font-size:20px; font-weight:700; color:#E83D59; line-height:1; margin-bottom:2px; font-family:'Plus Jakarta Sans', system-ui;">{{ s.value }}</p>
              <p style="font-size:10.5px; color:oklch(0.56 0 0); font-family:'Plus Jakarta Sans', system-ui;">{{ s.label }}</p>
            </div>
          </div>
          <div v-if="stepContent.quote" style="padding:14px; border-radius:12px; background:white; border:1.5px solid oklch(0.91 0 0);">
            <p style="font-size:12.5px; color:oklch(0.35 0 0); line-height:1.6; font-style:italic; margin-bottom:10px; font-family:'Plus Jakarta Sans', system-ui;">"{{ stepContent.quote.text }}"</p>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:28px; height:28px; border-radius:50%; background:rgba(232,61,89,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <span style="font-size:9px; font-weight:700; color:#E83D59; font-family:'Plus Jakarta Sans', system-ui;">{{ stepContent.quote.initials }}</span>
              </div>
              <div>
                <p style="font-size:11.5px; font-weight:600; color:oklch(0.2 0 0); font-family:'Plus Jakarta Sans', system-ui;">{{ stepContent.quote.author }}</p>
                <p style="font-size:10.5px; color:oklch(0.56 0 0); font-family:'Plus Jakarta Sans', system-ui;">{{ stepContent.quote.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ══ ILLUSTRATION CARDS (fill remaining space) ══════════════════════ -->
    <div class="relative z-10 flex-1 overflow-hidden">

      <!-- Card 1: Today's sessions (upper-left) -->
      <div class="ill-card" style="top:8%; left:7%; width:208px; transform:rotate(-1.5deg); animation:float-a 6s ease-in-out infinite;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
          <div>
            <p style="font-size:9px; color:oklch(0.62 0 0); font-family:system-ui; text-transform:uppercase; letter-spacing:0.06em;">MON, 12 APR</p>
            <p style="font-size:12px; font-weight:600; color:oklch(0.14 0 0); font-family:system-ui;">Today's sessions</p>
          </div>
          <div style="width:26px; height:26px; border-radius:7px; background:rgba(232,61,89,0.1); display:flex; align-items:center; justify-content:center;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E83D59" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:5px;">
          <div style="display:flex; align-items:center; gap:7px; padding:6px 7px; border-radius:7px; background:rgba(232,61,89,0.06);">
            <div style="width:3px; height:24px; border-radius:2px; background:#E83D59; flex-shrink:0;" />
            <div><p style="font-size:10px; font-weight:600; color:oklch(0.18 0 0); font-family:system-ui;">Maria García</p><p style="font-size:9px; color:oklch(0.56 0 0); font-family:system-ui;">9:00 AM · CBT</p></div>
          </div>
          <div style="display:flex; align-items:center; gap:7px; padding:6px 7px; border-radius:7px; background:oklch(0.97 0 0);">
            <div style="width:3px; height:24px; border-radius:2px; background:oklch(0.75 0 0); flex-shrink:0;" />
            <div><p style="font-size:10px; font-weight:600; color:oklch(0.18 0 0); font-family:system-ui;">Carlos López</p><p style="font-size:9px; color:oklch(0.56 0 0); font-family:system-ui;">10:30 AM · Assessment</p></div>
          </div>
          <div style="display:flex; align-items:center; gap:7px; padding:6px 7px; border-radius:7px; background:oklch(0.97 0 0);">
            <div style="width:3px; height:24px; border-radius:2px; background:oklch(0.88 0 0); flex-shrink:0;" />
            <div><p style="font-size:10px; color:oklch(0.6 0 0); font-family:system-ui;">2:00 PM</p><p style="font-size:9px; color:oklch(0.72 0 0); font-family:system-ui;">Available slot</p></div>
          </div>
        </div>
      </div>

      <!-- Card 2: AI Note (upper-right) -->
      <div class="ill-card" style="top:5%; right:5%; width:180px; transform:rotate(1.5deg); animation:float-b 7s ease-in-out infinite;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
          <div style="display:inline-flex; align-items:center; gap:4px; padding:2px 7px; border-radius:20px; background:rgba(232,61,89,0.08); border:1px solid rgba(232,61,89,0.15);">
            <div style="width:5px; height:5px; border-radius:50%; background:#E83D59;" />
            <span style="font-size:9px; font-weight:600; color:#E83D59; font-family:system-ui;">AI Note</span>
          </div>
          <svg width="10" height="11" viewBox="0 0 62 67" fill="none"><path d="M13.2145 53.3016C14.5055 54.9621 16.1848 55.7909 18.2505 55.7909C20.5458 55.7909 22.3255 54.8765 23.5881 53.0443C24.8498 51.2133 25.4818 48.5812 25.4818 45.1474C25.4818 41.2575 24.8641 37.1516 23.6308 32.8305C22.3967 28.5111 20.6614 24.6337 18.4227 21.2004C16.1266 24.8058 14.3615 28.8691 13.1282 33.3882C11.8933 37.9093 11.2773 42.0294 11.2773 45.7485C11.2773 49.1255 11.923 51.6424 13.2145 53.3016ZM18.8531 5.83651C24.1325 1.94623 29.929 0 36.2427 0C41.236 0 45.6398 1.1885 49.4572 3.56181C53.2734 5.9373 56.229 9.35554 58.3241 13.8187C60.4188 18.2825 61.4669 23.576 61.4669 29.6979C61.4669 39.9412 58.4535 51.7861 52.4275 65.2321H40.2034C43.4739 58.7668 45.9132 52.5589 47.5204 46.6066C49.1264 40.6564 49.9308 35.2772 49.9308 30.4703C49.9308 24.2903 48.6528 19.4275 46.1 15.8788C43.5451 12.3314 39.9153 10.5571 35.21 10.5571C31.8804 10.5571 28.8679 11.4453 26.1706 13.2183C29.6141 17.7967 32.2397 23.0029 34.0476 28.8395C35.8558 34.6761 36.7595 40.0552 36.7595 44.9757C36.7595 49.3252 35.9843 53.0869 34.4353 56.2629C32.8855 59.439 30.718 61.8718 27.9357 63.5582C25.1509 65.2459 21.9231 66.0905 18.2505 66.0905C14.7493 66.0905 11.6219 65.3315 8.86689 63.816C6.11227 62.3004 3.94559 60.0113 2.36727 56.9497C0.788531 53.8889 0 50.1836 0 45.8342C0 40.9137 0.975302 35.4781 2.92716 29.5262C4.87734 23.576 7.63196 18.2825 11.1915 13.6476C8.20651 11.5875 4.9636 10.5571 1.46316 10.5571V0C7.94855 0 13.7442 1.94623 18.8531 5.83651Z" fill="#E83D59"/></svg>
        </div>
        <p style="font-size:11px; font-weight:600; color:oklch(0.18 0 0); margin-bottom:8px; font-family:system-ui;">Maria García · Session 4</p>
        <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:10px;">
          <div style="height:6px; border-radius:3px; background:oklch(0.92 0 0); width:100%;" />
          <div style="height:6px; border-radius:3px; background:oklch(0.92 0 0); width:85%;" />
          <div style="height:6px; border-radius:3px; background:oklch(0.92 0 0); width:92%;" />
          <div style="height:6px; border-radius:3px; background:oklch(0.92 0 0); width:68%;" />
        </div>
        <div style="display:flex; align-items:center; gap:5px; padding-top:8px; border-top:1px solid oklch(0.94 0 0);">
          <div style="width:18px; height:18px; border-radius:50%; background:rgba(232,61,89,0.12); display:flex; align-items:center; justify-content:center;">
            <span style="font-size:7px; font-weight:700; color:#E83D59; font-family:system-ui;">DR</span>
          </div>
          <p style="font-size:9px; color:oklch(0.62 0 0); font-family:system-ui;">Transcribed 2 min ago</p>
        </div>
      </div>

      <!-- Card 3: Patient profile (mid-left) -->
      <div class="ill-card" style="top:44%; left:6%; width:172px; transform:rotate(-1deg); animation:float-c 8s ease-in-out infinite;">
        <div style="display:flex; align-items:center; gap:9px; margin-bottom:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, rgba(232,61,89,0.2) 0%, rgba(232,61,89,0.08) 100%); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <span style="font-size:11px; font-weight:700; color:#E83D59; font-family:system-ui;">MG</span>
          </div>
          <div>
            <p style="font-size:11px; font-weight:600; color:oklch(0.18 0 0); font-family:system-ui;">Maria García</p>
            <p style="font-size:9px; color:oklch(0.56 0 0); font-family:system-ui;">Session 4 of 12</p>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:5px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:9.5px; color:oklch(0.55 0 0); font-family:system-ui;">Next session</span>
            <span style="font-size:9.5px; font-weight:600; color:oklch(0.2 0 0); font-family:system-ui;">Thu 14 Apr</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:9.5px; color:oklch(0.55 0 0); font-family:system-ui;">Progress</span>
            <div style="display:flex; align-items:center; gap:5px;">
              <div style="width:56px; height:5px; border-radius:3px; background:oklch(0.92 0 0); overflow:hidden;">
                <div style="width:33%; height:100%; background:#E83D59; border-radius:3px;" />
              </div>
              <span style="font-size:9px; color:oklch(0.55 0 0); font-family:system-ui;">33%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 4: Billing status (mid-right) -->
      <div class="ill-card" style="top:42%; right:5%; width:162px; transform:rotate(2deg); animation:float-a 9s ease-in-out infinite 1s;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <p style="font-size:11px; font-weight:600; color:oklch(0.18 0 0); font-family:system-ui;">Invoice #1042</p>
          <div style="padding:2px 8px; border-radius:20px; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.2);">
            <span style="font-size:9px; font-weight:600; color:#16a34a; font-family:system-ui;">Paid</span>
          </div>
        </div>
        <p style="font-size:20px; font-weight:700; color:oklch(0.14 0 0); font-family:system-ui; margin-bottom:6px;">€ 180<span style="font-size:12px; font-weight:400; color:oklch(0.55 0 0)">.00</span></p>
        <div style="height:1px; background:oklch(0.94 0 0); margin-bottom:8px;" />
        <div style="display:flex; flex-direction:column; gap:3px;">
          <div style="display:flex; justify-content:space-between;">
            <span style="font-size:9px; color:oklch(0.6 0 0); font-family:system-ui;">CBT Session</span>
            <span style="font-size:9px; color:oklch(0.4 0 0); font-family:system-ui;">€120</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="font-size:9px; color:oklch(0.6 0 0); font-family:system-ui;">Assessment</span>
            <span style="font-size:9px; color:oklch(0.4 0 0); font-family:system-ui;">€60</span>
          </div>
        </div>
      </div>

      <!-- Card 5: Quick metrics row (bottom-center) -->
      <div class="absolute bottom-6" style="left:50%; transform:translateX(-50%); display:flex; gap:10px; animation:float-b 7.5s ease-in-out infinite 0.5s;">
        <div v-for="m in [{ v:'8', l:'Today', accent:true }, { v:'47', l:'This week', accent:false }, { v:'2.4h', l:'Avg time', accent:false }]" :key="m.l"
          style="background:white; border-radius:10px; padding:10px 14px; box-shadow:0 3px 12px rgba(0,0,0,0.07); text-align:center; min-width:64px;"
        >
          <p :style="{ fontSize:'18px', fontWeight:'700', lineHeight:'1', fontFamily:'system-ui', color: m.accent ? '#E83D59' : 'oklch(0.18 0 0)' }">{{ m.v }}</p>
          <p style="font-size:9px; color:oklch(0.56 0 0); margin-top:3px; font-family:system-ui; white-space:nowrap;">{{ m.l }}</p>
        </div>
      </div>

    </div><!-- end illustration zone -->

  </div>
</template>

<style scoped>
.ill-card {
  position: absolute;
  background: white;
  border-radius: 14px;
  padding: 13px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
}

@keyframes float-a { 0%,100%{transform:rotate(-1.5deg) translateY(0)} 50%{transform:rotate(-1.5deg) translateY(-8px)} }
@keyframes float-b { 0%,100%{transform:rotate(1.5deg)  translateY(0)} 50%{transform:rotate(1.5deg)  translateY(-6px)} }
@keyframes float-c { 0%,100%{transform:rotate(-1deg)   translateY(0)} 50%{transform:rotate(-1deg)   translateY(-5px)} }

.content-fade-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.content-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.content-fade-enter-from  { opacity: 0; transform: translateY(8px); }
.content-fade-leave-to    { opacity: 0; transform: translateY(-8px); }
</style>
