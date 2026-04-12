<script setup lang="ts">
import { SPECIALTIES, ROLES, TEAM_SIZES } from '~/composables/useOnboardingForm'

definePageMeta({
  layout: 'onboarding',
  pageTransition: { name: 'ob-slide', mode: 'out-in' },
})

const direction = useState<'forward' | 'back'>('onboarding-direction', () => 'forward')
const { form, validateOrg } = useOnboardingForm()

// ─── Local error state ────────────────────────────────────────────────────────
const errors = reactive({
  orgName: '',
  specialty: '',
  role: '',
  teamSize: '',
})

// ─── Navigation ───────────────────────────────────────────────────────────────
function goBack() {
  direction.value = 'back'
  navigateTo('/onboarding/join')
}

function handleContinue() {
  const { ok, errors: validationErrors } = validateOrg()
  // Reset local errors
  errors.orgName = ''
  errors.specialty = ''
  errors.role = ''
  errors.teamSize = ''
  // Apply validation errors
  Object.assign(errors, validationErrors)
  if (ok) {
    navigateTo('/doctor/dashboard/calendar?trial=1')
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col justify-center px-8 py-10 max-w-lg mx-auto w-full">

    <!-- Back -->
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
      <h1 style="font-size: 28px; font-weight: 700; color: oklch(0.14 0 0); margin-bottom: 6px; line-height: 1.2;">
        Tell us about yourself
      </h1>
      <p style="font-size: 14px; color: oklch(0.52 0 0);">Let's get your account set up.</p>
    </div>

    <div class="space-y-5">

      <!-- Organisation name -->
      <div>
        <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Organisation name</label>
        <input
          v-model="form.orgName"
          placeholder="e.g. MindCare Clinics"
          style="width: 100%; height: 40px; border-radius: 10px; border: 1.5px solid oklch(0.91 0 0); padding: 0 12px; font-size: 13.5px; color: oklch(0.14 0 0); outline: none; font-family: inherit; transition: border-color 0.15s;"
          :style="errors.orgName ? { borderColor: '#E83D59' } : {}"
          @focus="(e) => (e.target as HTMLInputElement).style.borderColor = '#E83D59'"
          @blur="(e) => (e.target as HTMLInputElement).style.borderColor = errors.orgName ? '#E83D59' : 'oklch(0.91 0 0)'"
          @input="errors.orgName = ''"
        />
        <p v-if="errors.orgName" style="font-size: 11px; color: #E83D59; margin-top: 3px;">{{ errors.orgName }}</p>
      </div>

      <!-- Specialty -->
      <div>
        <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Specialty</label>
        <select
          v-model="form.specialty"
          class="ob-select"
          :style="errors.specialty ? { borderColor: '#E83D59' } : {}"
          @change="errors.specialty = ''"
          @focus="(e) => (e.target as HTMLSelectElement).style.borderColor = '#E83D59'"
          @blur="(e) => (e.target as HTMLSelectElement).style.borderColor = errors.specialty ? '#E83D59' : 'oklch(0.91 0 0)'"
        >
          <option value="" disabled>Please select</option>
          <option v-for="s in SPECIALTIES" :key="s" :value="s">{{ s }}</option>
        </select>
        <p v-if="errors.specialty" style="font-size: 11px; color: #E83D59; margin-top: 3px;">{{ errors.specialty }}</p>
      </div>

      <!-- Team size toggle -->
      <div>
        <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 8px;">
          How many clinicians do you work with?
        </label>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="size in TEAM_SIZES"
            :key="size"
            type="button"
            class="transition-all duration-150 active:scale-[0.96]"
            :style="{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: form.teamSize === size ? '600' : '500',
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: form.teamSize === size ? 'none' : '1.5px solid oklch(0.91 0 0)',
              background: form.teamSize === size ? '#E83D59' : 'white',
              color: form.teamSize === size ? 'white' : 'oklch(0.35 0 0)',
              boxShadow: form.teamSize === size ? '0 3px 10px rgba(232,61,89,0.25)' : 'none',
            }"
            @click="form.teamSize = size; errors.teamSize = ''"
          >
            {{ size }}
          </button>
        </div>
        <p v-if="errors.teamSize" style="font-size: 11px; color: #E83D59; margin-top: 5px;">{{ errors.teamSize }}</p>
      </div>

      <!-- Role -->
      <div>
        <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">
          What is your role within the organisation?
        </label>
        <select
          v-model="form.role"
          class="ob-select"
          :style="errors.role ? { borderColor: '#E83D59' } : {}"
          @change="errors.role = ''"
          @focus="(e) => (e.target as HTMLSelectElement).style.borderColor = '#E83D59'"
          @blur="(e) => (e.target as HTMLSelectElement).style.borderColor = errors.role ? '#E83D59' : 'oklch(0.91 0 0)'"
        >
          <option value="" disabled>Please select</option>
          <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
        </select>
        <p v-if="errors.role" style="font-size: 11px; color: #E83D59; margin-top: 3px;">{{ errors.role }}</p>
      </div>

      <!-- Continue button -->
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.983] mt-2"
        style="height: 46px; border-radius: 12px; background: #E83D59; color: white; font-size: 14px; font-weight: 600; font-family: inherit; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(232,61,89,0.25);"
        @click="handleContinue"
      >
        Continue
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Custom select with chevron arrow */
.ob-select {
  width: 100%;
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid oklch(0.91 0 0);
  padding: 0 36px 0 12px;
  font-size: 13.5px;
  color: oklch(0.14 0 0);
  outline: none;
  font-family: inherit;
  background-color: white;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 0.15s;
}
.ob-select:focus {
  border-color: #E83D59;
}
</style>
