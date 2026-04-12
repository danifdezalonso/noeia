<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { COUNTRIES, LANGUAGES, PHONE_PREFIXES } from '~/composables/useOnboardingForm'

definePageMeta({
  layout: 'onboarding',
  pageTransition: { name: 'ob-slide', mode: 'out-in' },
})

const direction = useState<'forward' | 'back'>('onboarding-direction', () => 'forward')
const { form, selectedPhonePrefix, validateJoin } = useOnboardingForm()

// ─── Local error state ────────────────────────────────────────────────────────
const errors = reactive({
  firstName: '',
  lastName: '',
  country: '',
  language: '',
  terms: '',
})

// ─── Country dropdown ─────────────────────────────────────────────────────────
const countryOpen   = ref(false)
const countrySearch = ref('')
const countryDropdownRef = ref<HTMLElement | null>(null)

const filteredCountries = computed(() => {
  const q = countrySearch.value.toLowerCase()
  if (!q) return COUNTRIES
  return COUNTRIES.filter(c => c.name.toLowerCase().includes(q))
})

function selectCountry(c: typeof COUNTRIES[0]) {
  form.value.country = c.name
  errors.country = ''
  countryOpen.value = false
  countrySearch.value = ''
}

const selectedCountry = computed(() => COUNTRIES.find(c => c.name === form.value.country) ?? null)

// ─── Language dropdown ────────────────────────────────────────────────────────
const languageOpen   = ref(false)
const languageSearch = ref('')
const languageDropdownRef = ref<HTMLElement | null>(null)

const filteredLanguages = computed(() => {
  const q = languageSearch.value.toLowerCase()
  if (!q) return LANGUAGES
  return LANGUAGES.filter(l => l.name.toLowerCase().includes(q))
})

function selectLanguage(l: typeof LANGUAGES[0]) {
  form.value.language = l.name
  errors.language = ''
  languageOpen.value = false
  languageSearch.value = ''
}

const selectedLanguage = computed(() => LANGUAGES.find(l => l.name === form.value.language) ?? null)

// ─── Phone prefix dropdown ────────────────────────────────────────────────────
const phonePrefixOpen   = ref(false)
const phonePrefixSearch = ref('')
const phoneDropdownRef  = ref<HTMLElement | null>(null)

const filteredPrefixes = computed(() => {
  const q = phonePrefixSearch.value.toLowerCase()
  if (!q) return PHONE_PREFIXES
  return PHONE_PREFIXES.filter(p =>
    p.country.toLowerCase().includes(q) || p.code.includes(q)
  )
})

function selectPrefix(p: typeof PHONE_PREFIXES[0]) {
  selectedPhonePrefix.value = p
  phonePrefixOpen.value = false
  phonePrefixSearch.value = ''
}

// ─── Close dropdowns on outside click ────────────────────────────────────────
onClickOutside(countryDropdownRef,  () => { countryOpen.value = false })
onClickOutside(languageDropdownRef, () => { languageOpen.value = false })
onClickOutside(phoneDropdownRef,    () => { phonePrefixOpen.value = false })

// ─── Navigation ───────────────────────────────────────────────────────────────
function goBack() {
  direction.value = 'back'
  navigateTo('/onboarding/get-started')
}

function handleContinue() {
  const { ok, errors: validationErrors } = validateJoin()
  // Reset local errors
  errors.firstName = ''
  errors.lastName = ''
  errors.country = ''
  errors.language = ''
  errors.terms = ''
  // Apply validation errors
  Object.assign(errors, validationErrors)
  if (ok) {
    direction.value = 'forward'
    navigateTo('/onboarding/your-organisation')
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
        Join Noeia
      </h1>
      <p style="font-size: 14px; color: oklch(0.52 0 0);">Tell us a bit about yourself to set up your account.</p>
    </div>

    <form class="space-y-4" @submit.prevent="handleContinue">

      <!-- First + Last name row -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">First name</label>
          <input
            v-model="form.firstName"
            placeholder="Ana"
            style="width: 100%; height: 40px; border-radius: 10px; border: 1.5px solid oklch(0.91 0 0); padding: 0 12px; font-size: 13.5px; color: oklch(0.14 0 0); outline: none; font-family: inherit; transition: border-color 0.15s;"
            :style="errors.firstName ? { borderColor: '#E83D59' } : {}"
            @focus="(e) => (e.target as HTMLInputElement).style.borderColor = '#E83D59'"
            @blur="(e) => (e.target as HTMLInputElement).style.borderColor = errors.firstName ? '#E83D59' : 'oklch(0.91 0 0)'"
            @input="errors.firstName = ''"
          />
          <p v-if="errors.firstName" style="font-size: 11px; color: #E83D59; margin-top: 3px;">{{ errors.firstName }}</p>
        </div>
        <div>
          <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Last name</label>
          <input
            v-model="form.lastName"
            placeholder="García"
            style="width: 100%; height: 40px; border-radius: 10px; border: 1.5px solid oklch(0.91 0 0); padding: 0 12px; font-size: 13.5px; color: oklch(0.14 0 0); outline: none; font-family: inherit; transition: border-color 0.15s;"
            :style="errors.lastName ? { borderColor: '#E83D59' } : {}"
            @focus="(e) => (e.target as HTMLInputElement).style.borderColor = '#E83D59'"
            @blur="(e) => (e.target as HTMLInputElement).style.borderColor = errors.lastName ? '#E83D59' : 'oklch(0.91 0 0)'"
            @input="errors.lastName = ''"
          />
          <p v-if="errors.lastName" style="font-size: 11px; color: #E83D59; margin-top: 3px;">{{ errors.lastName }}</p>
        </div>
      </div>

      <!-- Country (searchable dropdown) -->
      <div>
        <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Country</label>
        <div ref="countryDropdownRef" style="position: relative;">
          <button
            type="button"
            class="ob-custom-trigger"
            :style="errors.country ? { borderColor: '#E83D59' } : countryOpen ? { borderColor: '#E83D59' } : {}"
            @click="countryOpen = !countryOpen"
          >
            <span v-if="selectedCountry" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px; line-height: 1;">{{ selectedCountry.flag }}</span>
              <span style="font-size: 13.5px; color: oklch(0.14 0 0);">{{ selectedCountry.name }}</span>
            </span>
            <span v-else style="font-size: 13.5px; color: oklch(0.65 0 0);">Select your country</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.56 0 0)" stroke-width="2.5" style="flex-shrink: 0; transition: transform 0.15s; margin-left: auto;" :style="countryOpen ? { transform: 'rotate(180deg)' } : {}">
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <div v-if="countryOpen" class="ob-dropdown-panel">
            <div style="padding: 8px 8px 4px;">
              <input
                v-model="countrySearch"
                placeholder="Search country…"
                autofocus
                class="ob-search-input"
                @focus="(e) => (e.target as HTMLInputElement).style.borderColor = '#E83D59'"
                @blur="(e) => (e.target as HTMLInputElement).style.borderColor = 'oklch(0.91 0 0)'"
              />
            </div>
            <div style="max-height: 196px; overflow-y: auto; padding: 4px 4px 6px;">
              <button
                v-for="c in filteredCountries"
                :key="c.name"
                type="button"
                class="prefix-option"
                :style="form.country === c.name ? { background: 'rgba(232,61,89,0.06)' } : {}"
                @click="selectCountry(c)"
              >
                <span style="font-size: 16px; line-height: 1; flex-shrink: 0;">{{ c.flag }}</span>
                <span style="flex: 1; font-size: 13px; color: oklch(0.2 0 0); text-align: left;">{{ c.name }}</span>
                <svg v-if="form.country === c.name" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6.5L4.5 9L10 3" stroke="#E83D59" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <p v-if="filteredCountries.length === 0" style="text-align: center; padding: 14px 0; font-size: 13px; color: oklch(0.62 0 0);">No results</p>
            </div>
          </div>
        </div>
        <p v-if="errors.country" style="font-size: 11px; color: #E83D59; margin-top: 3px;">{{ errors.country }}</p>
      </div>

      <!-- Language (searchable dropdown) -->
      <div>
        <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Language</label>
        <div ref="languageDropdownRef" style="position: relative;">
          <button
            type="button"
            class="ob-custom-trigger"
            :style="errors.language ? { borderColor: '#E83D59' } : languageOpen ? { borderColor: '#E83D59' } : {}"
            @click="languageOpen = !languageOpen"
          >
            <span v-if="selectedLanguage" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px; line-height: 1;">{{ selectedLanguage.flag }}</span>
              <span style="font-size: 13.5px; color: oklch(0.14 0 0);">{{ selectedLanguage.name }}</span>
            </span>
            <span v-else style="font-size: 13.5px; color: oklch(0.65 0 0);">Select your language</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.56 0 0)" stroke-width="2.5" style="flex-shrink: 0; transition: transform 0.15s; margin-left: auto;" :style="languageOpen ? { transform: 'rotate(180deg)' } : {}">
              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <div v-if="languageOpen" class="ob-dropdown-panel">
            <div style="padding: 8px 8px 4px;">
              <input
                v-model="languageSearch"
                placeholder="Search language…"
                autofocus
                class="ob-search-input"
                @focus="(e) => (e.target as HTMLInputElement).style.borderColor = '#E83D59'"
                @blur="(e) => (e.target as HTMLInputElement).style.borderColor = 'oklch(0.91 0 0)'"
              />
            </div>
            <div style="max-height: 196px; overflow-y: auto; padding: 4px 4px 6px;">
              <button
                v-for="l in filteredLanguages"
                :key="l.name"
                type="button"
                class="prefix-option"
                :style="form.language === l.name ? { background: 'rgba(232,61,89,0.06)' } : {}"
                @click="selectLanguage(l)"
              >
                <span style="font-size: 16px; line-height: 1; flex-shrink: 0;">{{ l.flag }}</span>
                <span style="flex: 1; font-size: 13px; color: oklch(0.2 0 0); text-align: left;">{{ l.name }}</span>
                <svg v-if="form.language === l.name" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6.5L4.5 9L10 3" stroke="#E83D59" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <p v-if="filteredLanguages.length === 0" style="text-align: center; padding: 14px 0; font-size: 13px; color: oklch(0.62 0 0);">No results</p>
            </div>
          </div>
        </div>
        <p v-if="errors.language" style="font-size: 11px; color: #E83D59; margin-top: 3px;">{{ errors.language }}</p>
      </div>

      <!-- Phone number with prefix dropdown -->
      <div>
        <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">
          Phone number
          <span style="color: oklch(0.65 0 0); font-weight: 400;">(optional)</span>
        </label>
        <div ref="phoneDropdownRef" style="position: relative;">
          <!-- Combined field row -->
          <div
            style="display: flex; border: 1.5px solid oklch(0.91 0 0); border-radius: 10px; overflow: visible; transition: border-color 0.15s;"
            :style="phonePrefixOpen ? { borderColor: '#E83D59' } : {}"
          >
            <!-- Prefix trigger -->
            <button
              type="button"
              style="display: flex; align-items: center; gap: 5px; padding: 0 10px; background: oklch(0.97 0 0); border: none; border-right: 1.5px solid oklch(0.91 0 0); border-radius: 9px 0 0 9px; cursor: pointer; white-space: nowrap; flex-shrink: 0; height: 40px; font-family: inherit;"
              @click="phonePrefixOpen = !phonePrefixOpen"
            >
              <span style="font-size: 16px; line-height: 1;">{{ selectedPhonePrefix.flag }}</span>
              <span style="font-size: 13px; font-weight: 500; color: oklch(0.25 0 0);">{{ selectedPhonePrefix.code }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="oklch(0.56 0 0)" stroke-width="2.5" style="transition: transform 0.15s;" :style="phonePrefixOpen ? { transform: 'rotate(180deg)' } : {}">
                <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <!-- Number input -->
            <input
              v-model="form.phone"
              type="tel"
              placeholder="000 000 0000"
              style="flex: 1; height: 40px; border: none; outline: none; padding: 0 12px; font-size: 13.5px; color: oklch(0.14 0 0); font-family: inherit; background: white; border-radius: 0 9px 9px 0; min-width: 0;"
            />
          </div>

          <!-- Prefix dropdown panel -->
          <div
            v-if="phonePrefixOpen"
            style="position: absolute; top: calc(100% + 6px); left: 0; width: 272px; background: white; border-radius: 12px; border: 1.5px solid oklch(0.91 0 0); box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 100; overflow: hidden;"
          >
            <div style="padding: 8px 8px 4px;">
              <input
                v-model="phonePrefixSearch"
                placeholder="Search country or code…"
                autofocus
                style="width: 100%; height: 34px; border-radius: 8px; border: 1.5px solid oklch(0.91 0 0); padding: 0 10px; font-size: 12.5px; outline: none; font-family: inherit; color: oklch(0.2 0 0);"
                @focus="(e) => (e.target as HTMLInputElement).style.borderColor = '#E83D59'"
                @blur="(e) => (e.target as HTMLInputElement).style.borderColor = 'oklch(0.91 0 0)'"
              />
            </div>
            <div style="max-height: 196px; overflow-y: auto; padding: 4px 4px 6px;">
              <button
                v-for="p in filteredPrefixes"
                :key="p.country"
                type="button"
                class="prefix-option"
                :style="selectedPhonePrefix.country === p.country ? { background: 'rgba(232,61,89,0.06)' } : {}"
                @click="selectPrefix(p)"
              >
                <span style="font-size: 16px; line-height: 1; flex-shrink: 0;">{{ p.flag }}</span>
                <span style="flex: 1; font-size: 13px; color: oklch(0.2 0 0); text-align: left;">{{ p.country }}</span>
                <span style="font-size: 12px; color: oklch(0.55 0 0); flex-shrink: 0;">{{ p.code }}</span>
              </button>
              <p v-if="filteredPrefixes.length === 0" style="text-align: center; padding: 14px 0; font-size: 13px; color: oklch(0.62 0 0);">
                No results
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Terms checkbox -->
      <div class="pt-1">
        <label class="flex items-start gap-3 cursor-pointer">
          <div class="relative flex-shrink-0 mt-0.5">
            <input
              v-model="form.agreedToTerms"
              type="checkbox"
              class="sr-only"
              @change="errors.terms = ''"
            />
            <div
              class="w-4 h-4 rounded flex items-center justify-center transition-all duration-150"
              :style="{
                border: form.agreedToTerms ? 'none' : '1.5px solid oklch(0.8 0 0)',
                background: form.agreedToTerms ? '#E83D59' : 'white',
              }"
            >
              <svg v-if="form.agreedToTerms" width="9" height="9" viewBox="0 0 12 12" fill="none">
                <path d="M2 6.5L4.5 9L10 3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <span style="font-size: 12.5px; color: oklch(0.4 0 0); line-height: 1.55;">
            I have read and agree to abide by the
            <a href="#" style="color: #E83D59;" @click.prevent>Usage Policy</a>,
            <a href="#" style="color: #E83D59;" @click.prevent>Privacy Policy</a>
            and <a href="#" style="color: #E83D59;" @click.prevent>Terms of Use</a>.
          </span>
        </label>
        <p v-if="errors.terms" style="font-size: 11px; color: #E83D59; margin-top: 4px; padding-left: 28px;">{{ errors.terms }}</p>
      </div>

      <!-- Continue button -->
      <button
        type="submit"
        class="w-full flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.983] mt-2"
        style="height: 46px; border-radius: 12px; background: #E83D59; color: white; font-size: 14px; font-weight: 600; font-family: inherit; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(232,61,89,0.25);"
      >
        Continue
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </form>
  </div>
</template>

<style scoped>
/* Shared searchable dropdown trigger */
.ob-custom-trigger {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1.5px solid oklch(0.91 0 0);
  background: white;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s;
  text-align: left;
}
.ob-custom-trigger:hover {
  border-color: oklch(0.8 0 0);
}

/* Shared dropdown panel */
.ob-dropdown-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  border: 1.5px solid oklch(0.91 0 0);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  z-index: 100;
  overflow: hidden;
}

/* Shared search input inside panels */
.ob-search-input {
  width: 100%;
  height: 34px;
  border-radius: 8px;
  border: 1.5px solid oklch(0.91 0 0);
  padding: 0 10px;
  font-size: 12.5px;
  outline: none;
  font-family: inherit;
  color: oklch(0.2 0 0);
  transition: border-color 0.15s;
}

/* Phone prefix list items */
.prefix-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s;
}
.prefix-option:hover {
  background: oklch(0.97 0 0);
}
</style>
