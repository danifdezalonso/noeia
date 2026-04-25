<script setup lang="ts">
import { Check, ChevronsUpDown, ChevronDown, ChevronLeft, ArrowRight, Building2, Plus, Send } from 'lucide-vue-next'
import { COUNTRIES, LANGUAGES, PHONE_PREFIXES } from '~/composables/useOnboardingForm'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '~/components/ui/command'

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
const errors = reactive({ firstName: '', lastName: '', country: '', language: '', terms: '' })

const countryOpen   = ref(false)
const languageOpen  = ref(false)
const phonePrefixOpen = ref(false)

const selectedCountry  = computed(() => COUNTRIES.find(c => c.name === form.value.country) ?? null)
const selectedLanguage = computed(() => LANGUAGES.find(l => l.name === form.value.language) ?? null)

function selectCountry(name: string)  { form.value.country = name; errors.country = ''; countryOpen.value = false }
function selectLanguage(name: string) { form.value.language = name; errors.language = ''; languageOpen.value = false }
function selectPrefix(p: typeof PHONE_PREFIXES[0]) { selectedPhonePrefix.value = p; phonePrefixOpen.value = false }

function goBack() { direction.value = 'back'; navigateTo('/onboarding/get-started') }

function handleContinue() {
  const { ok, errors: ve } = validateJoin()
  errors.firstName = ''; errors.lastName = ''; errors.country = ''; errors.language = ''; errors.terms = ''
  Object.assign(errors, ve)
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

        <!-- Terms -->
        <div class="space-y-1.5 pt-1">
          <div class="flex items-start gap-3">
            <Checkbox
              id="terms"
              :checked="form.agreedToTerms"
              class="mt-0.5"
              :class="errors.terms ? 'border-destructive' : ''"
              @update:checked="v => { form.agreedToTerms = v as boolean; errors.terms = '' }"
            />
            <label for="terms" class="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              I have read and agree to abide by the
              <a href="#" class="text-primary hover:underline" @click.prevent>Usage Policy</a>,
              <a href="#" class="text-primary hover:underline" @click.prevent>Privacy Policy</a> and
              <a href="#" class="text-primary hover:underline" @click.prevent>Terms of Use</a>.
            </label>
          </div>
          <p v-if="errors.terms" class="text-xs text-destructive pl-7">{{ errors.terms }}</p>
        </div>

        <Button type="submit" class="w-full mt-2" size="lg">
          Set up my workspace
          <ArrowRight class="ml-1 w-4 h-4" />
        </Button>
      </form>
    </template>

  </div>
</template>
