<script setup lang="ts">
import { Check, ChevronsUpDown, CheckCircle2, XCircle, Loader2 } from 'lucide-vue-next'
import { SPECIALTIES, ROLES, TEAM_SIZES } from '~/composables/useOnboardingForm'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '~/components/ui/command'
import { Button } from '~/components/ui/button'

definePageMeta({
  layout: 'onboarding',
  pageTransition: { name: 'ob-slide', mode: 'out-in' },
})

const direction = useState<'forward' | 'back'>('onboarding-direction', () => 'forward')
const { form, validateOrg } = useOnboardingForm()

const specialtyOpen = ref(false)

// ─── URL slug preview ─────────────────────────────────────────────────────────
const TAKEN_SLUGS = ['mindcare-clinics', 'salud-mental-bcn', 'noeia', 'demo']

function toSlug(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const orgSlug = ref('')

watch(() => form.value.orgName, name => {
  orgSlug.value = toSlug(name)
})

const slugState = ref<'idle' | 'checking' | 'available' | 'taken'>('idle')
let slugTimer: ReturnType<typeof setTimeout> | null = null

watch(orgSlug, (slug) => {
  if (slugTimer) clearTimeout(slugTimer)
  if (!slug) { slugState.value = 'idle'; return }
  slugState.value = 'checking'
  slugTimer = setTimeout(() => {
    slugState.value = TAKEN_SLUGS.includes(slug) ? 'taken' : 'available'
  }, 600)
})

onMounted(() => {
  if (!Array.isArray(form.value.specialty)) form.value.specialty = []
})

function toggleSpecialty(s: string) {
  const idx = form.value.specialty.indexOf(s)
  if (idx === -1) form.value.specialty.push(s)
  else form.value.specialty.splice(idx, 1)
  errors.specialty = ''
}

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
        Tell us about your organization/clinic
      </h1>
      <p style="font-size: 14px; color: oklch(0.52 0 0);">Let's get your workspace set up.</p>
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
        <p v-else style="font-size: 11px; color: oklch(0.6 0 0); margin-top: 3px;">Working solo? Your professional name works too.</p>

      </div>

      <!-- Workspace URL -->
      <div>
        <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Workspace URL</label>
        <div
          class="flex items-center overflow-hidden"
          style="height: 40px; border-radius: 10px; border: 1.5px solid;"
          :style="{
            borderColor: slugState === 'taken'
              ? 'rgba(239,68,68,0.5)'
              : slugState === 'available'
                ? 'rgba(34,197,94,0.5)'
                : 'oklch(0.91 0 0)',
          }"
        >
          <span style="padding: 0 10px; font-size: 13px; color: oklch(0.55 0 0); white-space: nowrap; border-right: 1.5px solid oklch(0.91 0 0); height: 100%; display: flex; align-items: center; background: oklch(0.97 0 0);">noeia.app/</span>
          <input
            v-model="orgSlug"
            placeholder="your-org"
            style="flex: 1; height: 100%; padding: 0 10px; font-size: 13.5px; color: oklch(0.14 0 0); outline: none; font-family: inherit; background: transparent; border: none;"
          />
          <span class="flex items-center gap-1 pr-2.5 shrink-0">
            <Loader2 v-if="slugState === 'checking'" class="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            <CheckCircle2 v-else-if="slugState === 'available'" class="w-3.5 h-3.5 text-emerald-500" />
            <XCircle v-else-if="slugState === 'taken'" class="w-3.5 h-3.5 text-destructive" />
          </span>
        </div>
        <p
          v-if="slugState === 'available' || slugState === 'taken'"
          style="font-size: 11px; margin-top: 3px;"
          :style="slugState === 'taken' ? 'color: #dc2626;' : 'color: #16a34a;'"
        >{{ slugState === 'available' ? 'Available' : 'Already taken — try a different URL' }}</p>
      </div>

      <!-- Specialty multi-select -->
      <div>
        <label style="font-size: 12.5px; font-weight: 500; color: oklch(0.3 0 0); display: block; margin-bottom: 5px;">Specialty</label>

        <Popover v-model:open="specialtyOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="specialtyOpen"
              class="w-full min-h-10 h-auto justify-between font-normal"
              :class="errors.specialty ? 'border-destructive' : ''"
            >
              <div class="flex flex-wrap gap-1 flex-1 text-left">
                <span
                  v-for="s in form.specialty"
                  :key="s"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary"
                  @click.stop="toggleSpecialty(s)"
                >
                  {{ s }}
                  <span class="opacity-50 hover:opacity-100">×</span>
                </span>
                <span v-if="!form.specialty.length" class="text-muted-foreground text-sm">Please select</span>
              </div>
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-full p-0" align="start" style="width: var(--radix-popover-trigger-width);">
            <Command>
              <CommandInput placeholder="Search specialties…" />
              <CommandEmpty>No specialties found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="s in SPECIALTIES"
                    :key="s"
                    :value="s"
                    @select="toggleSpecialty(s)"
                  >
                    <Check
                      class="mr-2 h-4 w-4"
                      :class="form.specialty.includes(s) ? 'opacity-100' : 'opacity-0'"
                    />
                    {{ s }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

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
