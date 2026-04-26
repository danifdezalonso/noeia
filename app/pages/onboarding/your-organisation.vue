<script setup lang="ts">
import { Check, ChevronsUpDown, CheckCircle2, XCircle, Loader2, ChevronLeft, ArrowRight } from 'lucide-vue-next'
import { SPECIALTIES, ROLES, TEAM_SIZES } from '~/composables/useOnboardingForm'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '~/components/ui/command'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

definePageMeta({
  layout: 'onboarding',
  pageTransition: { name: 'ob-slide', mode: 'out-in' },
})

const direction = useState<'forward' | 'back'>('onboarding-direction', () => 'forward')
const { form, validateOrg } = useOnboardingForm()
const router = useRouter()

useHead({ title: 'Your practice — Noeia' })

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
const errors = reactive({ orgName: '', specialty: '', role: '', teamSize: '' })

// ─── Navigation ───────────────────────────────────────────────────────────────
function goBack() {
  direction.value = 'back'
  router.back()
}

function handleContinue() {
  const { ok, errors: validationErrors } = validateOrg()
  errors.orgName = ''; errors.specialty = ''; errors.role = ''; errors.teamSize = ''
  Object.assign(errors, validationErrors)
  if (ok) navigateTo('/doctor/dashboard/calendar?trial=1')
}
</script>

<template>
  <div class="flex-1 flex flex-col justify-center px-8 py-10 max-w-lg mx-auto w-full">

    <!-- Back -->
    <button
      class="inline-flex items-center gap-1.5 mb-7 text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0"
      @click="goBack"
    >
      <ChevronLeft class="w-4 h-4" />
      Back
    </button>

    <div class="mb-7">
      <h1 class="text-3xl font-bold text-foreground mb-1.5 leading-tight">
        Tell us about your practice
      </h1>
      <p class="text-sm text-muted-foreground">Let's get your workspace set up.</p>
    </div>

    <div class="space-y-5">

      <!-- Organisation name -->
      <div class="space-y-1.5">
        <Label for="orgName">Organisation name</Label>
        <Input
          id="orgName"
          v-model="form.orgName"
          placeholder="e.g. MindCare Clinics"
          :class="errors.orgName ? 'border-destructive focus-visible:ring-destructive/30' : ''"
          @input="errors.orgName = ''"
        />
        <p v-if="errors.orgName" class="text-xs text-destructive">{{ errors.orgName }}</p>
        <p v-else class="text-xs text-muted-foreground">Working solo? Your professional name works too.</p>
      </div>

      <!-- Workspace URL -->
      <div class="space-y-1.5">
        <Label>Workspace URL</Label>
        <div
          class="flex items-center overflow-hidden rounded-md border transition-colors"
          :class="slugState === 'taken' ? 'border-destructive/50' : slugState === 'available' ? 'border-emerald-500/50' : 'border-input'"
        >
          <span class="px-3 h-9 text-sm text-muted-foreground whitespace-nowrap border-r border-input bg-muted flex items-center">
            noeia.app/
          </span>
          <Input
            v-model="orgSlug"
            placeholder="your-org"
            class="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
          />
          <span class="flex items-center gap-1 pr-2.5 shrink-0">
            <Loader2 v-if="slugState === 'checking'" class="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            <CheckCircle2 v-else-if="slugState === 'available'" class="w-3.5 h-3.5 text-emerald-500" />
            <XCircle v-else-if="slugState === 'taken'" class="w-3.5 h-3.5 text-destructive" />
          </span>
        </div>
        <p
          v-if="slugState === 'available' || slugState === 'taken'"
          class="text-xs"
          :class="slugState === 'taken' ? 'text-destructive' : 'text-emerald-600'"
        >
          {{ slugState === 'available' ? 'Available' : 'Already taken — try a different URL' }}
        </p>
      </div>

      <!-- Specialty multi-select -->
      <div class="space-y-1.5">
        <Label>Specialty</Label>
        <Popover v-model:open="specialtyOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="specialtyOpen"
              class="w-full min-h-9 h-auto justify-between font-normal"
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
                    <Check class="mr-2 h-4 w-4" :class="form.specialty.includes(s) ? 'opacity-100' : 'opacity-0'" />
                    {{ s }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <p v-if="errors.specialty" class="text-xs text-destructive">{{ errors.specialty }}</p>
      </div>

      <!-- Team size toggle -->
      <div class="space-y-2">
        <Label>How many clinicians do you work with?</Label>
        <div class="flex gap-2 flex-wrap">
          <Button
            v-for="size in TEAM_SIZES"
            :key="size"
            type="button"
            :variant="form.teamSize === size ? 'default' : 'outline'"
            size="sm"
            @click="form.teamSize = size; errors.teamSize = ''"
          >
            {{ size }}
          </Button>
        </div>
        <p v-if="errors.teamSize" class="text-xs text-destructive">{{ errors.teamSize }}</p>
      </div>

      <!-- Role -->
      <div class="space-y-1.5">
        <Label>What is your role within the organisation?</Label>
        <Select v-model="form.role" @update:model-value="errors.role = ''">
          <SelectTrigger :class="errors.role ? 'border-destructive' : ''">
            <SelectValue placeholder="Please select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="r in ROLES" :key="r" :value="r">{{ r }}</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.role" class="text-xs text-destructive">{{ errors.role }}</p>
      </div>

      <!-- Continue -->
      <Button class="w-full" size="lg" @click="handleContinue">
        Continue
        <ArrowRight class="ml-1 w-4 h-4" />
      </Button>
    </div>
  </div>
</template>

<style scoped></style>
