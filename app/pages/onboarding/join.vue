<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { COUNTRIES, LANGUAGES, PHONE_PREFIXES } from '~/composables/useOnboardingForm'

definePageMeta({
  layout: 'onboarding',
  pageTransition: { name: 'ob-slide', mode: 'out-in' },
})

const route = useRoute()
const invitationsParam = computed(() => route.query.invitations as string | undefined)

const direction = useState<'forward' | 'back'>('onboarding-direction', () => 'forward')
const { form, selectedPhonePrefix, validateJoin } = useOnboardingForm()

// ─── Original join form state ─────────────────────────────────────────────────
const errors = reactive({ firstName: '', lastName: '', country: '', language: '', terms: '' })
const countryOpen   = ref(false)
const countrySearch = ref('')
const countryDropdownRef = ref<HTMLElement | null>(null)
const languageOpen   = ref(false)
const languageSearch = ref('')
const languageDropdownRef = ref<HTMLElement | null>(null)
const phonePrefixOpen   = ref(false)
const phonePrefixSearch = ref('')
const phoneDropdownRef  = ref<HTMLElement | null>(null)

const filteredCountries = computed(() => {
  const q = countrySearch.value.toLowerCase()
  return q ? COUNTRIES.filter(c => c.name.toLowerCase().includes(q)) : COUNTRIES
})
const filteredLanguages = computed(() => {
  const q = languageSearch.value.toLowerCase()
  return q ? LANGUAGES.filter(l => l.name.toLowerCase().includes(q)) : LANGUAGES
})
const filteredPrefixes = computed(() => {
  const q = phonePrefixSearch.value.toLowerCase()
  return q ? PHONE_PREFIXES.filter(p => p.country.toLowerCase().includes(q) || p.code.includes(q)) : PHONE_PREFIXES
})

const selectedCountry  = computed(() => COUNTRIES.find(c => c.name === form.value.country) ?? null)
const selectedLanguage = computed(() => LANGUAGES.find(l => l.name === form.value.language) ?? null)

function selectCountry(c: typeof COUNTRIES[0])     { form.value.country = c.name; errors.country = ''; countryOpen.value = false; countrySearch.value = '' }
function selectLanguage(l: typeof LANGUAGES[0])    { form.value.language = l.name; errors.language = ''; languageOpen.value = false; languageSearch.value = '' }
function selectPrefix(p: typeof PHONE_PREFIXES[0]) { selectedPhonePrefix.value = p; phonePrefixOpen.value = false; phonePrefixSearch.value = '' }

onClickOutside(countryDropdownRef,  () => { countryOpen.value = false })
onClickOutside(languageDropdownRef, () => { languageOpen.value = false })
onClickOutside(phoneDropdownRef,    () => { phonePrefixOpen.value = false })

function goBack() { direction.value = 'back'; navigateTo('/onboarding/get-started') }

function handleContinue() {
  const { ok, errors: ve } = validateJoin()
  errors.firstName = ''; errors.lastName = ''; errors.country = ''; errors.language = ''; errors.terms = ''
  Object.assign(errors, ve)
  if (ok) { direction.value = 'forward'; navigateTo('/onboarding/your-organisation') }
}

// ─── Single invitation form ───────────────────────────────────────────────────
const singleForm = reactive({ fullName: 'Ana García', email: 'ana.garcia@gmail.com', phone: '' })
const singlePhonePrefixOpen = ref(false)
const singlePhonePrefixSearch = ref('')
const singlePhoneDropdownRef = ref<HTMLElement | null>(null)
const singleSelectedPrefix = ref(PHONE_PREFIXES.find(p => p.code === '+34') ?? PHONE_PREFIXES[0])

const filteredSinglePrefixes = computed(() => {
  const q = singlePhonePrefixSearch.value.toLowerCase()
  return q ? PHONE_PREFIXES.filter(p => p.country.toLowerCase().includes(q) || p.code.includes(q)) : PHONE_PREFIXES
})
function selectSinglePrefix(p: typeof PHONE_PREFIXES[0]) { singleSelectedPrefix.value = p; singlePhonePrefixOpen.value = false; singlePhonePrefixSearch.value = '' }
onClickOutside(singlePhoneDropdownRef, () => { singlePhonePrefixOpen.value = false })

// ─── Multiple invitations mock data ──────────────────────────────────────────
const invitations = ref([
  { id: 1, org: 'MindCare Clinics',        role: 'Doctor',           invitedBy: 'Dr. Laura Sanz',   date: 'Apr 10, 2026', status: 'pending' },
  { id: 2, org: 'Salud Mental Barcelona',   role: 'Clinical Advisor', invitedBy: 'Dr. Marc Puig',    date: 'Apr 5, 2026',  status: 'accepted' },
  { id: 3, org: 'Centro Neuro Madrid',      role: 'Psychologist',     invitedBy: 'Admin Office',     date: 'Mar 28, 2026', status: 'pending' },
])

const statusStyle: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: 'Pending',  bg: 'rgba(234,179,8,0.1)',   color: '#a16207' },
  accepted: { label: 'Accepted', bg: 'rgba(34,197,94,0.1)',   color: '#15803d' },
  declined: { label: 'Declined', bg: 'rgba(239,68,68,0.1)',   color: '#b91c1c' },
}

function acceptInvitation(inv: { id: number; org: string }) {
  invitations.value.find(i => i.id === inv.id)!.status = 'accepted'
  navigateTo(`/onboarding/join?invitations=single&org=${encodeURIComponent(inv.org)}`)
}
function declineInvitation(id: number) { invitations.value.find(i => i.id === id)!.status = 'declined' }

// ─── Single flow: org name from query (set when accepting from multiple flow) ─
const acceptedOrgName = computed(() => (route.query.org as string) || 'MindCare Clinics')

// ─── Expired invitations mock data ───────────────────────────────────────────
const expiredInvitations = ref([
  { id: 1, name: 'MindCare Clinics',      invitedBy: 'Dr. Laura Sanz', email: 'laura.sanz@mindcare.es',   expiredDate: 'Apr 2, 2026',  status: 'expired',   requestSent: false },
  { id: 2, name: 'Salud Mental Barcelona', invitedBy: 'Dr. Marc Puig',  email: 'marc.puig@saludmental.es', expiredDate: 'Mar 20, 2026', status: 'accepted',  requestSent: false },
])
</script>

<template>
  <div class="flex-1 flex flex-col justify-center px-8 py-10 max-w-lg mx-auto w-full">

    <!-- ══════════════════════════════════════════════════════════════════════
         MULTIPLE INVITATIONS
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-if="invitationsParam === 'multiple'">
      <button
        class="inline-flex items-center gap-1.5 mb-7 transition-colors"
        style="font-size: 13px; color: oklch(0.6 0 0); background: none; border: none; cursor: pointer; padding: 0;"
        @click="navigateTo('/login')"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Back
      </button>

      <div class="mb-7">
        <h1 style="font-size: 28px; font-weight: 700; color: oklch(0.14 0 0); margin-bottom: 6px; line-height: 1.2;">
          Organisation invitations
        </h1>
        <p style="font-size: 14px; color: oklch(0.52 0 0);">
          You have been invited to join the following organisations. Accept to get started.
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <div
          v-for="inv in invitations"
          :key="inv.id"
          style="border-radius: 14px; border: 1.5px solid oklch(0.91 0 0); padding: 18px 20px; background: white;"
        >
          <!-- Header row -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <!-- Org avatar -->
              <div style="width: 40px; height: 40px; border-radius: 10px; background: oklch(0.96 0 0); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="oklch(0.45 0 0)" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"/>
                </svg>
              </div>
              <div>
                <p style="font-size: 14px; font-weight: 700; color: oklch(0.14 0 0); margin-bottom: 1px;">{{ inv.org }}</p>
                <p style="font-size: 12px; color: oklch(0.55 0 0);">{{ inv.role }}</p>
              </div>
            </div>
            <!-- Status badge -->
            <span
              style="font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; flex-shrink: 0; margin-top: 2px;"
              :style="{ background: statusStyle[inv.status].bg, color: statusStyle[inv.status].color }"
            >
              {{ statusStyle[inv.status].label }}
            </span>
          </div>

          <!-- Meta -->
          <div style="font-size: 12px; color: oklch(0.58 0 0); margin-bottom: 14px; display: flex; gap: 16px;">
            <span>Invited by {{ inv.invitedBy }}</span>
            <span>{{ inv.date }}</span>
          </div>

          <!-- Actions (only for pending) -->
          <div v-if="inv.status === 'pending'" class="flex gap-2">
            <button
              style="flex: 1; height: 36px; border-radius: 9px; background: #E83D59; color: white; font-size: 13px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s;"
              @mouseenter="e => ((e.currentTarget as HTMLElement).style.opacity = '0.88')"
              @mouseleave="e => ((e.currentTarget as HTMLElement).style.opacity = '1')"
              @click="acceptInvitation(inv)"
            >
              Accept
            </button>
            <button
              style="flex: 1; height: 36px; border-radius: 9px; background: oklch(0.96 0 0); color: oklch(0.35 0 0); font-size: 13px; font-weight: 600; border: 1.5px solid oklch(0.91 0 0); cursor: pointer; font-family: inherit; transition: background 0.15s;"
              @mouseenter="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.93 0 0)')"
              @mouseleave="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.96 0 0)')"
              @click="declineInvitation(inv.id)"
            >
              Decline
            </button>
          </div>

          <!-- Accepted state CTA -->
          <div v-else-if="inv.status === 'accepted'">
            <button
              style="width: 100%; height: 36px; border-radius: 9px; background: oklch(0.96 0 0); color: oklch(0.3 0 0); font-size: 13px; font-weight: 600; border: 1.5px solid oklch(0.91 0 0); cursor: pointer; font-family: inherit; transition: background 0.15s;"
              @mouseenter="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.93 0 0)')"
              @mouseleave="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.96 0 0)')"
              @click="navigateTo('/doctor/dashboard')"
            >
              Go to dashboard →
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════
         SINGLE INVITATION — profile completion
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-else-if="invitationsParam === 'single'">
      <button
        class="inline-flex items-center gap-1.5 mb-7 transition-colors"
        style="font-size: 13px; color: oklch(0.6 0 0); background: none; border: none; cursor: pointer; padding: 0;"
        @click="navigateTo('/login')"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Back
      </button>

      <div class="mb-7">
        <h1 style="font-size: 28px; font-weight: 700; color: oklch(0.14 0 0); margin-bottom: 6px; line-height: 1.2;">
          Complete your profile
        </h1>
        <p style="font-size: 14px; color: oklch(0.52 0 0);">
          You've been invited to join <strong style="color: oklch(0.25 0 0);">{{ acceptedOrgName }}</strong>. Confirm your details to continue.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <!-- Full name -->
        <div>
          <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Full name</label>
          <input
            v-model="singleForm.fullName"
            placeholder="Your full name"
            style="width: 100%; height: 40px; border-radius: 10px; border: 1.5px solid oklch(0.91 0 0); padding: 0 12px; font-size: 13.5px; color: oklch(0.14 0 0); outline: none; font-family: inherit; box-sizing: border-box;"
            @focus="e => ((e.target as HTMLInputElement).style.borderColor = '#E83D59')"
            @blur="e => ((e.target as HTMLInputElement).style.borderColor = 'oklch(0.91 0 0)')"
          />
          <p style="font-size: 11px; color: oklch(0.6 0 0); margin-top: 3px;">Pre-filled from your Google account — you can edit this.</p>
        </div>

        <!-- Email -->
        <div>
          <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Email</label>
          <input
            v-model="singleForm.email"
            type="email"
            placeholder="your@email.com"
            style="width: 100%; height: 40px; border-radius: 10px; border: 1.5px solid oklch(0.91 0 0); padding: 0 12px; font-size: 13.5px; color: oklch(0.14 0 0); outline: none; font-family: inherit; box-sizing: border-box;"
            @focus="e => ((e.target as HTMLInputElement).style.borderColor = '#E83D59')"
            @blur="e => ((e.target as HTMLInputElement).style.borderColor = 'oklch(0.91 0 0)')"
          />
          <p style="font-size: 11px; color: oklch(0.6 0 0); margin-top: 3px;">Pre-filled from your Google account — you can edit this.</p>
        </div>

        <!-- Phone -->
        <div>
          <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">
            Phone number
            <span style="color: oklch(0.65 0 0); font-weight: 400;">(optional)</span>
          </label>
          <div ref="singlePhoneDropdownRef" style="position: relative;">
            <div style="display: flex; border: 1.5px solid oklch(0.91 0 0); border-radius: 10px; overflow: visible; transition: border-color 0.15s;" :style="singlePhonePrefixOpen ? { borderColor: '#E83D59' } : {}">
              <button
                type="button"
                style="display: flex; align-items: center; gap: 5px; padding: 0 10px; background: oklch(0.97 0 0); border: none; border-right: 1.5px solid oklch(0.91 0 0); border-radius: 9px 0 0 9px; cursor: pointer; white-space: nowrap; flex-shrink: 0; height: 40px; font-family: inherit;"
                @click="singlePhonePrefixOpen = !singlePhonePrefixOpen"
              >
                <span style="font-size: 16px; line-height: 1;">{{ singleSelectedPrefix.flag }}</span>
                <span style="font-size: 13px; font-weight: 500; color: oklch(0.25 0 0);">{{ singleSelectedPrefix.code }}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="oklch(0.56 0 0)" stroke-width="2.5" style="transition: transform 0.15s;" :style="singlePhonePrefixOpen ? { transform: 'rotate(180deg)' } : {}">
                  <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <input
                v-model="singleForm.phone"
                type="tel"
                placeholder="000 000 0000"
                style="flex: 1; height: 40px; border: none; outline: none; padding: 0 12px; font-size: 13.5px; color: oklch(0.14 0 0); font-family: inherit; background: white; border-radius: 0 9px 9px 0; min-width: 0;"
              />
            </div>
            <div
              v-if="singlePhonePrefixOpen"
              style="position: absolute; top: calc(100% + 6px); left: 0; width: 272px; background: white; border-radius: 12px; border: 1.5px solid oklch(0.91 0 0); box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 100; overflow: hidden;"
            >
              <div style="padding: 8px 8px 4px;">
                <input
                  v-model="singlePhonePrefixSearch"
                  placeholder="Search country or code…"
                  autofocus
                  style="width: 100%; height: 34px; border-radius: 8px; border: 1.5px solid oklch(0.91 0 0); padding: 0 10px; font-size: 12.5px; outline: none; font-family: inherit; color: oklch(0.2 0 0);"
                  @focus="e => ((e.target as HTMLInputElement).style.borderColor = '#E83D59')"
                  @blur="e => ((e.target as HTMLInputElement).style.borderColor = 'oklch(0.91 0 0)')"
                />
              </div>
              <div style="max-height: 196px; overflow-y: auto; padding: 4px 4px 6px;">
                <button
                  v-for="p in filteredSinglePrefixes"
                  :key="p.country"
                  type="button"
                  class="prefix-option"
                  :style="singleSelectedPrefix.country === p.country ? { background: 'rgba(232,61,89,0.06)' } : {}"
                  @click="selectSinglePrefix(p)"
                >
                  <span style="font-size: 16px; line-height: 1; flex-shrink: 0;">{{ p.flag }}</span>
                  <span style="flex: 1; font-size: 13px; color: oklch(0.2 0 0); text-align: left;">{{ p.country }}</span>
                  <span style="font-size: 12px; color: oklch(0.55 0 0); flex-shrink: 0;">{{ p.code }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Continue -->
        <button
          class="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.983] mt-2"
          style="height: 46px; border-radius: 12px; background: #E83D59; color: white; font-size: 14px; font-weight: 600; font-family: inherit; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(232,61,89,0.25);"
          @click="navigateTo('/doctor/dashboard')"
        >
          Continue to dashboard
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════
         EXPIRED INVITATION(S)
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-else-if="invitationsParam === 'expired'">
      <button
        class="inline-flex items-center gap-1.5 mb-7 transition-colors"
        style="font-size: 13px; color: oklch(0.6 0 0); background: none; border: none; cursor: pointer; padding: 0;"
        @click="navigateTo('/login')"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Back
      </button>

      <div class="mb-7">
        <h1 style="font-size: 28px; font-weight: 700; color: oklch(0.14 0 0); margin-bottom: 6px; line-height: 1.2;">
          Organisation invitations
        </h1>
        <p style="font-size: 14px; color: oklch(0.52 0 0);">
          Some of your invitations have expired. You can request a new one from each organisation.
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <div
          v-for="inv in expiredInvitations"
          :key="inv.id"
          style="border-radius: 14px; border: 1.5px solid oklch(0.91 0 0); padding: 20px; background: white;"
        >
          <!-- Header -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: oklch(0.96 0 0); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="oklch(0.45 0 0)" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"/>
                </svg>
              </div>
              <div>
                <p style="font-size: 14px; font-weight: 700; color: oklch(0.14 0 0); margin-bottom: 2px;">{{ inv.name }}</p>
                <span
                  style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px;"
                  :style="inv.status === 'expired'
                    ? { background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }
                    : { background: 'rgba(34,197,94,0.1)', color: '#15803d' }"
                >
                  {{ inv.status === 'expired' ? 'Expired' : 'Accepted' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Meta -->
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; color: oklch(0.48 0 0); margin-bottom: 16px;">
            <div class="flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
              </svg>
              Invited by <strong style="color: oklch(0.25 0 0);">{{ inv.invitedBy }}</strong>
            </div>
            <div class="flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
              </svg>
              {{ inv.email }}
            </div>
            <div class="flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
              </svg>
              <span v-if="inv.status === 'expired'">Expired on <strong style="color: oklch(0.25 0 0);">{{ inv.expiredDate }}</strong></span>
              <span v-else>Active invitation</span>
            </div>
          </div>

          <!-- Expired: request button or sent confirmation -->
          <template v-if="inv.status === 'expired'">
            <button
              v-if="!inv.requestSent"
              class="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.983]"
              style="height: 38px; border-radius: 9px; background: #E83D59; color: white; font-size: 13px; font-weight: 600; font-family: inherit; border: none; cursor: pointer;"
              @mouseenter="e => ((e.currentTarget as HTMLElement).style.opacity = '0.88')"
              @mouseleave="e => ((e.currentTarget as HTMLElement).style.opacity = '1')"
              @click="inv.requestSent = true"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
              </svg>
              Request new invitation
            </button>
            <div
              v-else
              style="border-radius: 9px; background: rgba(34,197,94,0.07); border: 1.5px solid rgba(34,197,94,0.25); padding: 10px 14px; display: flex; align-items: center; gap: 10px;"
            >
              <div style="width: 26px; height: 26px; border-radius: 7px; background: rgba(34,197,94,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6.5L4.5 9L10 3" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <p style="font-size: 13px; font-weight: 600; color: #15803d; margin-bottom: 1px;">Request sent!</p>
                <p style="font-size: 11.5px; color: oklch(0.48 0 0);">{{ inv.invitedBy }} will receive your request.</p>
              </div>
            </div>
          </template>

          <!-- Accepted: go to dashboard -->
          <button
            v-else
            style="width: 100%; height: 38px; border-radius: 9px; background: oklch(0.96 0 0); color: oklch(0.3 0 0); font-size: 13px; font-weight: 600; border: 1.5px solid oklch(0.91 0 0); cursor: pointer; font-family: inherit; transition: background 0.15s;"
            @mouseenter="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.93 0 0)')"
            @mouseleave="e => ((e.currentTarget as HTMLElement).style.background = 'oklch(0.96 0 0)')"
            @click="navigateTo('/doctor/dashboard')"
          >
            Go to dashboard →
          </button>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════
         ORIGINAL JOIN FORM (default flow)
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-else>
      <button
        class="inline-flex items-center gap-1.5 mb-7 transition-colors"
        style="font-size: 13px; color: oklch(0.6 0 0); background: none; border: none; cursor: pointer; padding: 0;"
        @click="goBack"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Back
      </button>

      <div class="mb-7">
        <h1 style="font-size: 28px; font-weight: 700; color: oklch(0.14 0 0); margin-bottom: 6px; line-height: 1.2;">Join Noeia</h1>
        <p style="font-size: 14px; color: oklch(0.52 0 0);">Tell us a bit about yourself to set up your account.</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleContinue">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">First name</label>
            <input v-model="form.firstName" placeholder="Ana" style="width: 100%; height: 40px; border-radius: 10px; border: 1.5px solid oklch(0.91 0 0); padding: 0 12px; font-size: 13.5px; color: oklch(0.14 0 0); outline: none; font-family: inherit;" :style="errors.firstName ? { borderColor: '#E83D59' } : {}" @focus="e => ((e.target as HTMLInputElement).style.borderColor = '#E83D59')" @blur="e => ((e.target as HTMLInputElement).style.borderColor = errors.firstName ? '#E83D59' : 'oklch(0.91 0 0)')" @input="errors.firstName = ''" />
            <p v-if="errors.firstName" style="font-size: 11px; color: #E83D59; margin-top: 3px;">{{ errors.firstName }}</p>
          </div>
          <div>
            <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Last name</label>
            <input v-model="form.lastName" placeholder="García" style="width: 100%; height: 40px; border-radius: 10px; border: 1.5px solid oklch(0.91 0 0); padding: 0 12px; font-size: 13.5px; color: oklch(0.14 0 0); outline: none; font-family: inherit;" :style="errors.lastName ? { borderColor: '#E83D59' } : {}" @focus="e => ((e.target as HTMLInputElement).style.borderColor = '#E83D59')" @blur="e => ((e.target as HTMLInputElement).style.borderColor = errors.lastName ? '#E83D59' : 'oklch(0.91 0 0)')" @input="errors.lastName = ''" />
            <p v-if="errors.lastName" style="font-size: 11px; color: #E83D59; margin-top: 3px;">{{ errors.lastName }}</p>
          </div>
        </div>

        <!-- Country -->
        <div>
          <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Country</label>
          <div ref="countryDropdownRef" style="position: relative;">
            <button type="button" class="ob-custom-trigger" :style="errors.country ? { borderColor: '#E83D59' } : countryOpen ? { borderColor: '#E83D59' } : {}" @click="countryOpen = !countryOpen">
              <span v-if="selectedCountry" style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 16px;">{{ selectedCountry.flag }}</span><span style="font-size: 13.5px; color: oklch(0.14 0 0);">{{ selectedCountry.name }}</span></span>
              <span v-else style="font-size: 13.5px; color: oklch(0.65 0 0);">Select your country</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.56 0 0)" stroke-width="2.5" style="margin-left: auto; transition: transform 0.15s;" :style="countryOpen ? { transform: 'rotate(180deg)' } : {}"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div v-if="countryOpen" class="ob-dropdown-panel">
              <div style="padding: 8px 8px 4px;"><input v-model="countrySearch" placeholder="Search country…" autofocus class="ob-search-input" @focus="e => ((e.target as HTMLInputElement).style.borderColor = '#E83D59')" @blur="e => ((e.target as HTMLInputElement).style.borderColor = 'oklch(0.91 0 0)')"/></div>
              <div style="max-height: 196px; overflow-y: auto; padding: 4px 4px 6px;">
                <button v-for="c in filteredCountries" :key="c.name" type="button" class="prefix-option" :style="form.country === c.name ? { background: 'rgba(232,61,89,0.06)' } : {}" @click="selectCountry(c)">
                  <span style="font-size: 16px; flex-shrink: 0;">{{ c.flag }}</span><span style="flex: 1; font-size: 13px; color: oklch(0.2 0 0); text-align: left;">{{ c.name }}</span>
                  <svg v-if="form.country === c.name" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L4.5 9L10 3" stroke="#E83D59" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <p v-if="filteredCountries.length === 0" style="text-align: center; padding: 14px 0; font-size: 13px; color: oklch(0.62 0 0);">No results</p>
              </div>
            </div>
          </div>
          <p v-if="errors.country" style="font-size: 11px; color: #E83D59; margin-top: 3px;">{{ errors.country }}</p>
        </div>

        <!-- Language -->
        <div>
          <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Language</label>
          <div ref="languageDropdownRef" style="position: relative;">
            <button type="button" class="ob-custom-trigger" :style="errors.language ? { borderColor: '#E83D59' } : languageOpen ? { borderColor: '#E83D59' } : {}" @click="languageOpen = !languageOpen">
              <span v-if="selectedLanguage" style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 16px;">{{ selectedLanguage.flag }}</span><span style="font-size: 13.5px; color: oklch(0.14 0 0);">{{ selectedLanguage.name }}</span></span>
              <span v-else style="font-size: 13.5px; color: oklch(0.65 0 0);">Select your language</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.56 0 0)" stroke-width="2.5" style="margin-left: auto; transition: transform 0.15s;" :style="languageOpen ? { transform: 'rotate(180deg)' } : {}"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div v-if="languageOpen" class="ob-dropdown-panel">
              <div style="padding: 8px 8px 4px;"><input v-model="languageSearch" placeholder="Search language…" autofocus class="ob-search-input" @focus="e => ((e.target as HTMLInputElement).style.borderColor = '#E83D59')" @blur="e => ((e.target as HTMLInputElement).style.borderColor = 'oklch(0.91 0 0)')"/></div>
              <div style="max-height: 196px; overflow-y: auto; padding: 4px 4px 6px;">
                <button v-for="l in filteredLanguages" :key="l.name" type="button" class="prefix-option" :style="form.language === l.name ? { background: 'rgba(232,61,89,0.06)' } : {}" @click="selectLanguage(l)">
                  <span style="font-size: 16px; flex-shrink: 0;">{{ l.flag }}</span><span style="flex: 1; font-size: 13px; color: oklch(0.2 0 0); text-align: left;">{{ l.name }}</span>
                  <svg v-if="form.language === l.name" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L4.5 9L10 3" stroke="#E83D59" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <p v-if="filteredLanguages.length === 0" style="text-align: center; padding: 14px 0; font-size: 13px; color: oklch(0.62 0 0);">No results</p>
              </div>
            </div>
          </div>
          <p v-if="errors.language" style="font-size: 11px; color: #E83D59; margin-top: 3px;">{{ errors.language }}</p>
        </div>

        <!-- Phone -->
        <div>
          <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Phone number <span style="color: oklch(0.65 0 0); font-weight: 400;">(optional)</span></label>
          <div ref="phoneDropdownRef" style="position: relative;">
            <div style="display: flex; border: 1.5px solid oklch(0.91 0 0); border-radius: 10px; overflow: visible; transition: border-color 0.15s;" :style="phonePrefixOpen ? { borderColor: '#E83D59' } : {}">
              <button type="button" style="display: flex; align-items: center; gap: 5px; padding: 0 10px; background: oklch(0.97 0 0); border: none; border-right: 1.5px solid oklch(0.91 0 0); border-radius: 9px 0 0 9px; cursor: pointer; white-space: nowrap; flex-shrink: 0; height: 40px; font-family: inherit;" @click="phonePrefixOpen = !phonePrefixOpen">
                <span style="font-size: 16px;">{{ selectedPhonePrefix.flag }}</span>
                <span style="font-size: 13px; font-weight: 500; color: oklch(0.25 0 0);">{{ selectedPhonePrefix.code }}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="oklch(0.56 0 0)" stroke-width="2.5" style="transition: transform 0.15s;" :style="phonePrefixOpen ? { transform: 'rotate(180deg)' } : {}"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <input v-model="form.phone" type="tel" placeholder="000 000 0000" style="flex: 1; height: 40px; border: none; outline: none; padding: 0 12px; font-size: 13.5px; color: oklch(0.14 0 0); font-family: inherit; background: white; border-radius: 0 9px 9px 0; min-width: 0;"/>
            </div>
            <div v-if="phonePrefixOpen" style="position: absolute; top: calc(100% + 6px); left: 0; width: 272px; background: white; border-radius: 12px; border: 1.5px solid oklch(0.91 0 0); box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 100; overflow: hidden;">
              <div style="padding: 8px 8px 4px;"><input v-model="phonePrefixSearch" placeholder="Search country or code…" autofocus style="width: 100%; height: 34px; border-radius: 8px; border: 1.5px solid oklch(0.91 0 0); padding: 0 10px; font-size: 12.5px; outline: none; font-family: inherit; color: oklch(0.2 0 0);" @focus="e => ((e.target as HTMLInputElement).style.borderColor = '#E83D59')" @blur="e => ((e.target as HTMLInputElement).style.borderColor = 'oklch(0.91 0 0)')"/></div>
              <div style="max-height: 196px; overflow-y: auto; padding: 4px 4px 6px;">
                <button v-for="p in filteredPrefixes" :key="p.country" type="button" class="prefix-option" :style="selectedPhonePrefix.country === p.country ? { background: 'rgba(232,61,89,0.06)' } : {}" @click="selectPrefix(p)">
                  <span style="font-size: 16px; flex-shrink: 0;">{{ p.flag }}</span><span style="flex: 1; font-size: 13px; color: oklch(0.2 0 0); text-align: left;">{{ p.country }}</span><span style="font-size: 12px; color: oklch(0.55 0 0); flex-shrink: 0;">{{ p.code }}</span>
                </button>
                <p v-if="filteredPrefixes.length === 0" style="text-align: center; padding: 14px 0; font-size: 13px; color: oklch(0.62 0 0);">No results</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Terms -->
        <div class="pt-1">
          <label class="flex items-start gap-3 cursor-pointer">
            <div class="relative flex-shrink-0 mt-0.5">
              <input v-model="form.agreedToTerms" type="checkbox" class="sr-only" @change="errors.terms = ''"/>
              <div class="w-4 h-4 rounded flex items-center justify-center transition-all duration-150" :style="{ border: form.agreedToTerms ? 'none' : '1.5px solid oklch(0.8 0 0)', background: form.agreedToTerms ? '#E83D59' : 'white' }">
                <svg v-if="form.agreedToTerms" width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L4.5 9L10 3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </div>
            <span style="font-size: 12.5px; color: oklch(0.4 0 0); line-height: 1.55;">
              I have read and agree to abide by the <a href="#" style="color: #E83D59;" @click.prevent>Usage Policy</a>, <a href="#" style="color: #E83D59;" @click.prevent>Privacy Policy</a> and <a href="#" style="color: #E83D59;" @click.prevent>Terms of Use</a>.
            </span>
          </label>
          <p v-if="errors.terms" style="font-size: 11px; color: #E83D59; margin-top: 4px; padding-left: 28px;">{{ errors.terms }}</p>
        </div>

        <button type="submit" class="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.983] mt-2" style="height: 46px; border-radius: 12px; background: #E83D59; color: white; font-size: 14px; font-weight: 600; font-family: inherit; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(232,61,89,0.25);">
          Continue
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </form>
    </template>

  </div>
</template>

<style scoped>
.ob-custom-trigger {
  width: 100%; height: 40px; display: flex; align-items: center; gap: 8px;
  padding: 0 12px; border-radius: 10px; border: 1.5px solid oklch(0.91 0 0);
  background: white; cursor: pointer; font-family: inherit; transition: border-color 0.15s; text-align: left;
}
.ob-custom-trigger:hover { border-color: oklch(0.8 0 0); }
.ob-dropdown-panel {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0;
  background: white; border-radius: 12px; border: 1.5px solid oklch(0.91 0 0);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 100; overflow: hidden;
}
.ob-search-input {
  width: 100%; height: 34px; border-radius: 8px; border: 1.5px solid oklch(0.91 0 0);
  padding: 0 10px; font-size: 12.5px; outline: none; font-family: inherit;
  color: oklch(0.2 0 0); transition: border-color 0.15s;
}
.prefix-option {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 7px 10px;
  border: none; border-radius: 8px; background: transparent; cursor: pointer;
  font-family: inherit; transition: background 0.1s;
}
.prefix-option:hover { background: oklch(0.97 0 0); }
</style>
