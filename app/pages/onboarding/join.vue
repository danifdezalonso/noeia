<script setup lang="ts">
import { Check, ChevronsUpDown, ChevronDown, ChevronLeft, ArrowRight, Building2, Plus, Send } from 'lucide-vue-next'
import { COUNTRIES, LANGUAGES, PHONE_PREFIXES } from '~/composables/useOnboardingForm'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '~/components/ui/command'
import LegalDocumentDialog from '~/components/LegalDocumentDialog.vue'

definePageMeta({
  layout: 'onboarding',
  pageTransition: { name: 'ob-slide', mode: 'out-in' },
})

const route = useRoute()
const invitationsParam = computed(() => route.query.invitations as string | undefined)
const direction = useState<'forward' | 'back'>('onboarding-direction', () => 'forward')
const { form, selectedPhonePrefix, validateJoin } = useOnboardingForm()

const isDev = import.meta.dev

useHead(computed(() => ({
  title: invitationsParam.value === 'multiple' ? 'Organisation invitations — Noeia'
    : invitationsParam.value === 'expired' ? 'Expired invitations — Noeia'
    : invitationsParam.value === 'single'  ? 'Complete your profile — Noeia'
    : 'Join Noeia',
})))

// ─── Default join form ─────────────────────────────────────────────────────────
const errors = reactive({ firstName: '', lastName: '', country: '', language: '', terms: '', usagePolicy: '' })
const agreedToTerms   = ref(false)
const agreedUsagePolicy = ref(false)
const marketingOptIn  = ref(false)

const termsOpen       = ref(false)
const usagePolicyOpen = ref(false)

const countryOpen   = ref(false)
const languageOpen  = ref(false)
const phonePrefixOpen = ref(false)

const selectedCountry  = computed(() => COUNTRIES.find(c => c.name === form.value.country) ?? null)
const selectedLanguage = computed(() => LANGUAGES.find(l => l.name === form.value.language) ?? null)

function selectCountry(name: string)  { form.value.country = name; errors.country = ''; countryOpen.value = false }
function selectLanguage(name: string) { form.value.language = name; errors.language = ''; languageOpen.value = false }
function selectPrefix(p: typeof PHONE_PREFIXES[0]) { selectedPhonePrefix.value = p; phonePrefixOpen.value = false }

function goBack() { direction.value = 'back'; navigateTo('/onboarding/get-started') }

function onTermsChange(v: boolean | 'indeterminate') {
  agreedToTerms.value = v === true
  errors.terms = ''
}

function handleContinue() {
  form.value.agreedToTerms = agreedToTerms.value
  const { ok: baseOk, errors: ve } = validateJoin()
  errors.firstName = ''; errors.lastName = ''; errors.country = ''; errors.language = ''; errors.terms = ''; errors.usagePolicy = ''
  Object.assign(errors, ve)

  if (!agreedUsagePolicy.value) errors.usagePolicy = 'Debes aceptar la Política de Uso'

  const ok = baseOk && agreedUsagePolicy.value
  if (ok) { direction.value = 'forward'; navigateTo('/onboarding/your-organisation') }
}

// ─── Single invitation form ───────────────────────────────────────────────────
const singleForm = reactive({ fullName: '', email: '', phone: '' })
const singlePrefixOpen = ref(false)
const singleSelectedPrefix = ref(PHONE_PREFIXES.find(p => p.code === '+44') ?? PHONE_PREFIXES[0])

// ─── Multiple invitations mock data ──────────────────────────────────────────
const invitations = ref([
  { id: 1, org: 'MindCare Clinics',       role: 'Doctor',           invitedBy: 'Dr. Laura Sanz', date: 'Apr 10, 2026', status: 'pending' },
  { id: 2, org: 'Salud Mental Barcelona',  role: 'Clinical Advisor', invitedBy: 'Dr. Marc Puig',  date: 'Apr 5, 2026',  status: 'accepted' },
  { id: 3, org: 'Centro Neuro Madrid',     role: 'Psychologist',     invitedBy: 'Admin Office',   date: 'Mar 28, 2026', status: 'pending' },
])

const statusStyle: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: 'Pending',  bg: 'rgba(234,179,8,0.1)',  color: '#a16207' },
  accepted: { label: 'Accepted', bg: 'rgba(34,197,94,0.1)',  color: '#15803d' },
  declined: { label: 'Declined', bg: 'rgba(239,68,68,0.1)',  color: '#b91c1c' },
}

function acceptInvitation(inv: { id: number; org: string }) {
  invitations.value.find(i => i.id === inv.id)!.status = 'accepted'
  navigateTo(`/onboarding/join?invitations=single&org=${encodeURIComponent(inv.org)}`)
}
function declineInvitation(id: number) { invitations.value.find(i => i.id === id)!.status = 'declined' }

const acceptedOrgName = computed(() => (route.query.org as string) || 'MindCare Clinics')

// ─── Expired invitations mock data ───────────────────────────────────────────
const expiredInvitations = ref([
  { id: 1, name: 'MindCare Clinics',      invitedBy: 'Dr. Laura Sanz', email: 'laura.sanz@mindcare.es',   expiredDate: 'Apr 2, 2026',  status: 'expired',  requestSent: false },
  { id: 2, name: 'Salud Mental Barcelona', invitedBy: 'Dr. Marc Puig',  email: 'marc.puig@saludmental.es', expiredDate: 'Mar 20, 2026', status: 'accepted', requestSent: false },
])
</script>

<template>
  <div class="flex-1 flex flex-col justify-center px-8 py-10 max-w-lg mx-auto w-full">

    <!-- ══════════════════════════════════════════════════════════════════════
         MULTIPLE INVITATIONS
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-if="invitationsParam === 'multiple'">
      <button class="inline-flex items-center gap-1.5 mb-7 text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0" @click="navigateTo('/login')">
        <ChevronLeft class="w-4 h-4" />
        Back
      </button>

      <div class="mb-7">
        <h1 class="text-3xl font-bold text-foreground mb-1.5 leading-tight">Organisation invitations</h1>
        <p class="text-sm text-muted-foreground">You have been invited to join the following organisations. Accept to get started.</p>
      </div>

      <div class="flex flex-col gap-3">
        <div v-for="inv in invitations" :key="inv.id" class="rounded-2xl border border-border p-5 bg-card">
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Building2 class="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p class="text-sm font-bold text-foreground">{{ inv.org }}</p>
                <p class="text-xs text-muted-foreground">{{ inv.role }}</p>
              </div>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 mt-0.5" :style="{ background: statusStyle[inv.status].bg, color: statusStyle[inv.status].color }">
              {{ statusStyle[inv.status].label }}
            </span>
          </div>

          <p class="text-xs text-muted-foreground mb-3">Invited by {{ inv.invitedBy }} · {{ inv.date }}</p>

          <div v-if="inv.status === 'pending'" class="flex gap-2">
            <Button class="flex-1" size="sm" @click="acceptInvitation(inv)">Accept</Button>
            <Button class="flex-1" variant="outline" size="sm" @click="declineInvitation(inv.id)">Decline</Button>
          </div>
          <div v-else-if="inv.status === 'accepted'">
            <Button variant="outline" class="w-full" size="sm" @click="navigateTo('/doctor/dashboard')">Go to dashboard →</Button>
          </div>
        </div>
      </div>

      <div class="mt-5 pt-5 border-t border-border">
        <p class="text-xs text-muted-foreground text-center mb-3">Don't have an invitation?</p>
        <Button variant="outline" class="w-full gap-2" @click="navigateTo('/onboarding/your-organisation')">
          <Plus class="w-4 h-4" />
          Create an organisation
        </Button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════
         SINGLE INVITATION — profile completion
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-else-if="invitationsParam === 'single'">
      <button class="inline-flex items-center gap-1.5 mb-7 text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0" @click="navigateTo('/login')">
        <ChevronLeft class="w-4 h-4" />
        Back
      </button>

      <div class="mb-7">
        <h1 class="text-3xl font-bold text-foreground mb-1.5 leading-tight">Complete your profile</h1>
        <p class="text-sm text-muted-foreground">You've been invited to join <strong class="text-foreground">{{ acceptedOrgName }}</strong>. Confirm your details to continue.</p>
      </div>

      <div class="flex flex-col gap-4">
        <div class="space-y-1.5">
          <Label for="singleName">Full name</Label>
          <Input id="singleName" v-model="singleForm.fullName" placeholder="Your full name" />
        </div>

        <div class="space-y-1.5">
          <Label for="singleEmail">Email</Label>
          <Input id="singleEmail" v-model="singleForm.email" type="email" placeholder="your@email.com" />
        </div>

        <!-- Phone with prefix -->
        <div class="space-y-1.5">
          <Label>Phone number <span class="text-muted-foreground font-normal">(optional)</span></Label>
          <div class="flex gap-2">
            <Popover v-model:open="singlePrefixOpen">
              <PopoverTrigger as-child>
                <Button variant="outline" class="shrink-0 gap-1.5 font-normal px-3">
                  <span class="text-base leading-none">{{ singleSelectedPrefix.flag }}</span>
                  <span class="text-sm">{{ singleSelectedPrefix.code }}</span>
                  <ChevronDown class="h-3.5 w-3.5 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-64 p-0">
                <Command>
                  <CommandInput placeholder="Search country…" />
                  <CommandList>
                    <CommandEmpty>No results.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem v-for="p in PHONE_PREFIXES" :key="p.country" :value="p.country" @select="selectPrefix(p)">
                        <span class="mr-2 text-base">{{ p.flag }}</span>
                        <span class="flex-1 text-sm">{{ p.country }}</span>
                        <span class="text-xs text-muted-foreground">{{ p.code }}</span>
                        <Check v-if="singleSelectedPrefix.country === p.country" class="ml-2 h-3.5 w-3.5 text-primary" />
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Input v-model="singleForm.phone" type="tel" placeholder="000 000 0000" class="flex-1" />
          </div>
        </div>

        <Button class="w-full mt-2" size="lg" @click="navigateTo('/doctor/dashboard')">
          Continue to dashboard
          <ArrowRight class="ml-1 w-4 h-4" />
        </Button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════
         EXPIRED INVITATION(S)
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-else-if="invitationsParam === 'expired'">
      <button class="inline-flex items-center gap-1.5 mb-7 text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0" @click="navigateTo('/login')">
        <ChevronLeft class="w-4 h-4" />
        Back
      </button>

      <div class="mb-7">
        <h1 class="text-3xl font-bold text-foreground mb-1.5 leading-tight">Organisation invitations</h1>
        <p class="text-sm text-muted-foreground">Some of your invitations have expired. You can request a new one from each organisation.</p>
      </div>

      <div class="flex flex-col gap-3">
        <div v-for="inv in expiredInvitations" :key="inv.id" class="rounded-2xl border border-border p-5 bg-card">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Building2 class="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p class="text-sm font-bold text-foreground mb-1">{{ inv.name }}</p>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="inv.status === 'expired' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-700'"
              >
                {{ inv.status === 'expired' ? 'Expired' : 'Accepted' }}
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-1.5 text-xs text-muted-foreground mb-4">
            <span>Invited by <strong class="text-foreground">{{ inv.invitedBy }}</strong></span>
            <span>{{ inv.email }}</span>
            <span v-if="inv.status === 'expired'">Expired on <strong class="text-foreground">{{ inv.expiredDate }}</strong></span>
            <span v-else>Already a member</span>
          </div>

          <template v-if="inv.status === 'expired'">
            <Button v-if="!inv.requestSent" class="w-full gap-2" size="sm" @click="inv.requestSent = true">
              <Send class="w-3.5 h-3.5" />
              Request new invitation
            </Button>
            <div v-else class="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-3">
              <div class="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                <Check class="w-3.5 h-3.5" />
              </div>
              <div>
                <p class="text-xs font-semibold text-emerald-700">Request sent!</p>
                <p class="text-xs text-muted-foreground">{{ inv.invitedBy }} will receive your request.</p>
              </div>
            </div>
          </template>
          <Button v-else variant="outline" class="w-full" size="sm" @click="navigateTo('/doctor/dashboard')">Go to dashboard →</Button>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════
         DEFAULT JOIN FORM
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-else>
      <button class="inline-flex items-center gap-1.5 mb-7 text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0" @click="goBack">
        <ChevronLeft class="w-4 h-4" />
        Back
      </button>

      <div class="mb-7">
        <h1 class="text-3xl font-bold text-foreground mb-1.5 leading-tight">Join Noeia</h1>
        <p class="text-sm text-muted-foreground">Tell us a bit about yourself to set up your account.</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleContinue">

        <!-- Name -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label for="firstName">First name</Label>
            <Input
              id="firstName"
              v-model="form.firstName"
              placeholder="First name"
              :class="errors.firstName ? 'border-destructive focus-visible:ring-destructive/30' : ''"
              @input="errors.firstName = ''"
            />
            <p v-if="errors.firstName" class="text-xs text-destructive">{{ errors.firstName }}</p>
          </div>
          <div class="space-y-1.5">
            <Label for="lastName">Last name</Label>
            <Input
              id="lastName"
              v-model="form.lastName"
              placeholder="Last name"
              :class="errors.lastName ? 'border-destructive focus-visible:ring-destructive/30' : ''"
              @input="errors.lastName = ''"
            />
            <p v-if="errors.lastName" class="text-xs text-destructive">{{ errors.lastName }}</p>
          </div>
        </div>

        <!-- Country -->
        <div class="space-y-1.5">
          <Label>Country</Label>
          <Popover v-model:open="countryOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                class="w-full justify-between font-normal"
                :class="errors.country ? 'border-destructive' : ''"
              >
                <span v-if="selectedCountry" class="flex items-center gap-2">
                  <span class="text-base leading-none">{{ selectedCountry.flag }}</span>
                  <span class="text-sm">{{ selectedCountry.name }}</span>
                </span>
                <span v-else class="text-muted-foreground text-sm">Select your country</span>
                <ChevronsUpDown class="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-full p-0" align="start" style="width: var(--radix-popover-trigger-width);">
              <Command>
                <CommandInput placeholder="Search country…" />
                <CommandList>
                  <CommandEmpty>No results.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem v-for="c in COUNTRIES" :key="c.name" :value="c.name" @select="selectCountry(c.name)">
                      <span class="mr-2 text-base">{{ c.flag }}</span>
                      {{ c.name }}
                      <Check v-if="form.country === c.name" class="ml-auto h-4 w-4 text-primary" />
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p v-if="errors.country" class="text-xs text-destructive">{{ errors.country }}</p>
        </div>

        <!-- Language -->
        <div class="space-y-1.5">
          <Label>Language</Label>
          <Popover v-model:open="languageOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                class="w-full justify-between font-normal"
                :class="errors.language ? 'border-destructive' : ''"
              >
                <span v-if="selectedLanguage" class="flex items-center gap-2">
                  <span class="text-base leading-none">{{ selectedLanguage.flag }}</span>
                  <span class="text-sm">{{ selectedLanguage.name }}</span>
                </span>
                <span v-else class="text-muted-foreground text-sm">Select your language</span>
                <ChevronsUpDown class="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-full p-0" align="start" style="width: var(--radix-popover-trigger-width);">
              <Command>
                <CommandInput placeholder="Search language…" />
                <CommandList>
                  <CommandEmpty>No results.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem v-for="l in LANGUAGES" :key="l.name" :value="l.name" @select="selectLanguage(l.name)">
                      <span class="mr-2 text-base">{{ l.flag }}</span>
                      {{ l.name }}
                      <Check v-if="form.language === l.name" class="ml-auto h-4 w-4 text-primary" />
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p v-if="errors.language" class="text-xs text-destructive">{{ errors.language }}</p>
        </div>

        <!-- Phone -->
        <div class="space-y-1.5">
          <Label>Phone number <span class="text-muted-foreground font-normal">(optional)</span></Label>
          <div class="flex gap-2">
            <Popover v-model:open="phonePrefixOpen">
              <PopoverTrigger as-child>
                <Button variant="outline" class="shrink-0 gap-1.5 font-normal px-3">
                  <span class="text-base leading-none">{{ selectedPhonePrefix.flag }}</span>
                  <span class="text-sm">{{ selectedPhonePrefix.code }}</span>
                  <ChevronDown class="h-3.5 w-3.5 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-64 p-0">
                <Command>
                  <CommandInput placeholder="Search country or code…" />
                  <CommandList>
                    <CommandEmpty>No results.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem v-for="p in PHONE_PREFIXES" :key="p.country" :value="p.country" @select="selectPrefix(p)">
                        <span class="mr-2 text-base">{{ p.flag }}</span>
                        <span class="flex-1 text-sm">{{ p.country }}</span>
                        <span class="text-xs text-muted-foreground">{{ p.code }}</span>
                        <Check v-if="selectedPhonePrefix.country === p.country" class="ml-2 h-3.5 w-3.5 text-primary" />
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Input v-model="form.phone" type="tel" placeholder="000 000 0000" class="flex-1" />
          </div>
        </div>

        <!-- Legal checkboxes -->
        <div class="space-y-3 pt-1">

          <!-- Mandatory 1: Términos y Condiciones -->
          <div class="space-y-1">
            <div class="flex items-start gap-3">
              <Checkbox
                id="terms"
                :checked="agreedToTerms"
                aria-required="true"
                class="mt-0.5 shrink-0"
                :class="errors.terms ? 'border-destructive' : ''"
                @update:checked="onTermsChange"
              />
              <label for="terms" class="text-xs text-foreground leading-relaxed cursor-pointer select-none">
                He leído y acepto los
                <button type="button" class="text-primary hover:text-primary/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm" @click.stop="termsOpen = true">
                  Términos y Condiciones</button>.
              </label>
            </div>
            <p v-if="errors.terms" class="text-xs text-destructive pl-7">{{ errors.terms }}</p>
          </div>

          <!-- Mandatory 2: Política de Uso -->
          <div class="space-y-1">
            <div class="flex items-start gap-3">
              <Checkbox
                id="usage-policy"
                :checked="agreedUsagePolicy"
                aria-required="true"
                class="mt-0.5 shrink-0"
                :class="errors.usagePolicy ? 'border-destructive' : ''"
                @update:checked="(v) => { agreedUsagePolicy = v === true; errors.usagePolicy = '' }"
              />
              <label for="usage-policy" class="text-xs text-foreground leading-relaxed cursor-pointer select-none">
                He leído y acepto la
                <button type="button" class="text-primary hover:text-primary/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm" @click.stop="usagePolicyOpen = true">
                  Política de Uso</button>.
              </label>
            </div>
            <p v-if="errors.usagePolicy" class="text-xs text-destructive pl-7">{{ errors.usagePolicy }}</p>
          </div>

          <!-- Optional: Marketing (visually demoted) -->
          <div class="flex items-start gap-3 pt-1.5 border-t border-border/60">
            <Checkbox
              id="marketing"
              :checked="marketingOptIn"
              class="mt-0.5 shrink-0"
              @update:checked="(v) => { marketingOptIn = v === true }"
            />
            <label for="marketing" class="text-[11px] text-muted-foreground font-normal leading-relaxed cursor-pointer select-none">
              Quiero recibir novedades del producto y recursos clínicos por email.
            </label>
          </div>

        </div>

        <Button type="submit" class="w-full mt-2" size="lg">
          Set up my workspace
          <ArrowRight class="ml-1 w-4 h-4" />
        </Button>
      </form>
    </template>

  </div>

  <!-- ══ Términos y Condiciones dialog ══════════════════════════════════════ -->
  <LegalDocumentDialog
    title="Términos y Condiciones"
    last-updated="1 de mayo de 2026"
    :open="termsOpen"
    @update:open="termsOpen = $event"
    @accept="agreedToTerms = true; errors.terms = ''"
  >
    <h2>1. Aceptación de los términos</h2>
    <p>Al crear una cuenta en Noeia y hacer clic en «Configurar mi espacio de trabajo», aceptas quedar vinculado por estos Términos y Condiciones. Si actúas en nombre de una organización, declaras tener autoridad para aceptarlos en su nombre.</p>
    <p>Si no estás de acuerdo con alguno de estos términos, no debes utilizar el servicio.</p>

    <h2>2. Descripción del servicio</h2>
    <p>Noeia es una plataforma SaaS de gestión clínica para profesionales de la salud mental. Ofrece agenda, expediente clínico, facturación, transcripción de sesiones asistida por IA y generación de notas estructuradas.</p>
    <p>Nos reservamos el derecho de modificar, suspender o discontinuar funcionalidades con aviso previo razonable.</p>

    <h2>3. Cuenta de usuario y responsabilidades</h2>
    <p>Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas bajo tu cuenta. Debes notificarnos de inmediato ante cualquier uso no autorizado.</p>
    <p>Toda la información que proporciones al registrarte debe ser veraz, completa y actualizada.</p>

    <h2>4. Uso aceptable</h2>
    <p>Te comprometes a utilizar el servicio únicamente para fines lícitos y de conformidad con la legislación aplicable. Queda prohibido usar Noeia para actividades fraudulentas, difamar a terceros o intentar acceder de forma no autorizada a los sistemas de la plataforma.</p>
    <p>El uso clínico es exclusivo para profesionales habilitados según la legislación de su territorio.</p>

    <h2>5. Propiedad intelectual</h2>
    <p>Todos los derechos sobre el software, diseño, marca y contenidos propios de Noeia pertenecen a Noeia Technologies S.L. Nada en estos términos te transfiere dichos derechos.</p>
    <p>Los datos clínicos y notas que generes son de tu propiedad; Noeia los trata únicamente como encargado del tratamiento.</p>

    <h2>6. Suscripción y pagos</h2>
    <p>El acceso al servicio está sujeto al plan contratado. Los detalles sobre precios, ciclos de facturación y condiciones de cancelación se establecen en el plan seleccionado y en el contrato de suscripción correspondiente.</p>
    <p>Los precios pueden revisarse con un preaviso mínimo de 30 días.</p>

    <h2>7. Limitación de responsabilidad</h2>
    <p>En la medida en que lo permita la legislación aplicable, Noeia no será responsable de daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del servicio.</p>
    <p>Noeia no sustituye el juicio clínico. Las funciones de IA son herramientas de apoyo y no deben interpretarse como diagnóstico médico.</p>

    <h2>8. Modificaciones del servicio</h2>
    <p>Podemos actualizar estos términos periódicamente. Te notificaremos por email con al menos 15 días de antelación ante cambios materiales. El uso continuado tras la entrada en vigor implica aceptación.</p>

    <h2>9. Terminación</h2>
    <p>Puedes cancelar tu cuenta desde la configuración en cualquier momento. Noeia puede suspender cuentas que incumplan estos términos, previa notificación salvo en casos de infracción grave.</p>
    <p>Tras la cancelación, tus datos se conservan 30 días para exportarlos; después se eliminan conforme a nuestra política de retención.</p>

    <h2>10. Legislación aplicable y jurisdicción</h2>
    <p>Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Madrid, renunciando a cualquier otro fuero que pudiera corresponderles.</p>
    <p><em>Última actualización: 1 de mayo de 2026.</em></p>
  </LegalDocumentDialog>

  <!-- ══ Política de Uso dialog ═════════════════════════════════════════════ -->
  <LegalDocumentDialog
    title="Política de Uso"
    last-updated="1 de mayo de 2026"
    :open="usagePolicyOpen"
    @update:open="usagePolicyOpen = $event"
    @accept="agreedUsagePolicy = true; errors.usagePolicy = ''"
  >
    <h2>1. Objeto y ámbito de aplicación</h2>
    <p>La presente Política de Uso regula el acceso y la utilización de la plataforma Noeia por parte de los profesionales y organizaciones registrados. Su objetivo es garantizar un uso responsable, ético y conforme a la legalidad del servicio.</p>
    <p>Esta política complementa los Términos y Condiciones y tiene carácter vinculante para todos los usuarios.</p>

    <h2>2. Usuarios autorizados</h2>
    <p>El acceso a Noeia está reservado a profesionales de la salud mental debidamente habilitados (psicólogos, psiquiatras, terapeutas y otros clínicos con titulación reconocida) y a las organizaciones que los representan.</p>
    <p>Queda prohibida la cesión de credenciales a terceros no autorizados o el acceso compartido entre distintos profesionales bajo una misma cuenta individual.</p>

    <h2>3. Uso clínico responsable</h2>
    <p>Las funciones de inteligencia artificial de Noeia —transcripción, análisis de sesiones y generación de notas— son herramientas de apoyo al profesional. No sustituyen el juicio clínico ni pueden utilizarse como único criterio diagnóstico o terapéutico.</p>
    <p>El profesional es el único responsable de verificar, revisar y validar cualquier contenido generado automáticamente antes de incorporarlo al expediente del paciente.</p>

    <h2>4. Protección de datos de pacientes</h2>
    <p>Los datos de salud introducidos en la plataforma son datos de categoría especial (Art. 9 RGPD). El usuario se compromete a obtener el consentimiento o la base jurídica adecuada de sus pacientes antes de tratar sus datos en Noeia.</p>
    <p>Queda estrictamente prohibido introducir datos de pacientes sin la debida legitimación, compartir expedientes con personas no autorizadas o utilizar la plataforma para fines distintos a la atención clínica.</p>

    <h2>5. Conductas prohibidas</h2>
    <p>Entre otras conductas, se prohíbe expresamente: intentar acceder a datos de otros usuarios o pacientes; realizar ingeniería inversa del software; automatizar el acceso mediante bots o scripts no autorizados; publicar o transmitir contenido ilegal, difamatorio o que infrinja derechos de terceros; y usar el servicio para fines comerciales distintos a la gestión clínica propia.</p>

    <h2>6. Seguridad de la cuenta</h2>
    <p>El usuario debe utilizar contraseñas robustas, activar la autenticación de doble factor cuando esté disponible, y cerrar sesión al terminar en dispositivos compartidos. Cualquier brecha de seguridad conocida debe comunicarse a Noeia sin demora.</p>

    <h2>7. Disponibilidad del servicio</h2>
    <p>Noeia aspira a una disponibilidad del 99,5% mensual, pero no garantiza un funcionamiento ininterrumpido. Las tareas de mantenimiento programado se comunicarán con antelación. El servicio puede interrumpirse temporalmente por causas de fuerza mayor.</p>

    <h2>8. Conservación y exportación de datos</h2>
    <p>El usuario puede exportar sus datos clínicos en cualquier momento desde la configuración de la cuenta en formatos estándar (PDF, CSV). Noeia conserva los datos durante el tiempo necesario para la prestación del servicio y el cumplimiento de las obligaciones legales aplicables.</p>

    <h2>9. Incumplimiento y consecuencias</h2>
    <p>El incumplimiento de esta política podrá dar lugar a la suspensión temporal o definitiva del acceso, sin perjuicio de las acciones legales que pudieran corresponder. Noeia notificará al usuario afectado salvo que la gravedad del incumplimiento o una obligación legal exijan una actuación inmediata.</p>

    <h2>10. Actualizaciones de la política</h2>
    <p>Noeia podrá actualizar esta política en cualquier momento. Los cambios materiales se comunicarán por email con un preaviso mínimo de 15 días. El uso continuado del servicio tras la entrada en vigor implica la aceptación de la versión actualizada.</p>
    <p><em>Última actualización: 1 de mayo de 2026.</em></p>
  </LegalDocumentDialog>

</template>
