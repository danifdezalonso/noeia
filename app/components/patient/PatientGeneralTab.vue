<script setup lang="ts">
import {
  User, Phone, FileText, ShieldCheck, MapPin,
  ClipboardList, HeartPulse, FileCheck, X,
  Paperclip, AlertTriangle, Eye, Trash2, Upload,
} from 'lucide-vue-next'
import { Input }    from '~/components/ui/input'
import { Label }    from '~/components/ui/label'
import { Button }   from '~/components/ui/button'
import { Badge }    from '~/components/ui/badge'
import { Textarea } from '~/components/ui/textarea'
import { Switch }   from '~/components/ui/switch'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '~/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'

// ── Option lists ──────────────────────────────────────────────────────────────

const PRONOUNS = [
  { value: 'el',   label: 'él' },
  { value: 'ella', label: 'ella' },
  { value: 'elle', label: 'elle' },
  { value: 'otro', label: 'otro' },
]

const GENDERS = [
  { value: 'hombre',              label: 'Hombre' },
  { value: 'mujer',               label: 'Mujer' },
  { value: 'no-binario',          label: 'No binario' },
  { value: 'prefiero-no-decirlo', label: 'Prefiero no decirlo' },
  { value: 'otro',                label: 'Otro' },
]

const CIVIL_STATUS = [
  { value: 'soltero',         label: 'Soltero/a' },
  { value: 'casado',          label: 'Casado/a' },
  { value: 'pareja-de-hecho', label: 'Pareja de hecho' },
  { value: 'divorciado',      label: 'Divorciado/a' },
  { value: 'viudo',           label: 'Viudo/a' },
]

const DOC_TYPES = [
  { value: 'DNI',       label: 'DNI' },
  { value: 'NIE',       label: 'NIE' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'otro',      label: 'Otro' },
]

const PHONE_PREFIXES = [
  { value: '+34',  label: '🇪🇸 +34' },
  { value: '+44',  label: '🇬🇧 +44' },
  { value: '+33',  label: '🇫🇷 +33' },
  { value: '+49',  label: '🇩🇪 +49' },
  { value: '+39',  label: '🇮🇹 +39' },
  { value: '+351', label: '🇵🇹 +351' },
  { value: '+1',   label: '🇺🇸 +1' },
  { value: '+52',  label: '🇲🇽 +52' },
  { value: '+54',  label: '🇦🇷 +54' },
  { value: '+57',  label: '🇨🇴 +57' },
  { value: '+212', label: '🇲🇦 +212' },
  { value: '+40',  label: '🇷🇴 +40' },
]

const COUNTRIES = [
  { value: 'ES', label: 'España' },
  { value: 'PT', label: 'Portugal' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'IT', label: 'Italy' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'RO', label: 'Rumanía' },
  { value: 'MA', label: 'Marruecos' },
  { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CO', label: 'Colombia' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'CL', label: 'Chile' },
  { value: 'PE', label: 'Perú' },
  { value: 'US', label: 'United States' },
  { value: 'CN', label: 'China' },
  { value: 'PK', label: 'Pakistán' },
]

const STATUSES = [
  { value: 'active',       label: 'Active' },
  { value: 'inactive',     label: 'Inactive' },
  { value: 'waiting-list', label: 'Waiting list' },
  { value: 'discharged',   label: 'Discharged' },
]

const REFERRAL_SOURCES = [
  { value: 'doctoralia',    label: 'Doctoralia' },
  { value: 'gp-referral',   label: 'GP referral' },
  { value: 'word-of-mouth', label: 'Word of mouth' },
  { value: 'social-media',  label: 'Social media' },
  { value: 'other',         label: 'Other' },
]

const EMERGENCY_RELATIONSHIPS = [
  { value: 'familiar',    label: 'Familiar' },
  { value: 'pareja',      label: 'Pareja' },
  { value: 'tutor-legal', label: 'Tutor legal' },
  { value: 'otro',        label: 'Otro' },
]

const CLINICIANS = [
  { id: 'd1', name: 'Dr. Elena Voss' },
  { id: 'd2', name: 'Dr. Marco Silva' },
  { id: 'd3', name: 'Dr. Priya Nair' },
  { id: 'd4', name: 'Dr. James Okafor' },
  { id: 'd5', name: 'Dr. Sofia Reyes' },
]

const INSURERS = [
  'Adeslas', 'Sanitas', 'Asistencia Sanitaria', 'Asisa', 'DKV', 'Mapfre',
  'AXA', 'Fiatc', 'Catalana Occidente', 'Allianz', 'Generali', 'Aegon',
  'Zurich', 'Santa Lucía', 'IMQ', 'Asistencia Sanitaria Colegial', 'Caser',
  'Asefa', 'Cigna', 'Antares', 'Divina Pastora', 'Qualitas Auto',
  'Ima Ibérica', 'Almudena', 'La Fe', 'GES', 'MGS', 'HNA',
  'Previsora General', 'ASSSA', 'Mutua General de Cataluña', 'Meridiano',
  'Metlife', 'Clinicum Salut', 'Stimulus', 'Other',
]

// ── Mock initial data ─────────────────────────────────────────────────────────

const INITIAL = {
  firstName: 'Sofia', lastName: 'Martínez', preferredName: 'Sofi',
  pronouns: 'ella', dob: '1990-03-15', gender: 'mujer',
  civilStatus: 'soltera', nationality: 'ES', occupation: 'Profesora de primaria',
  docType: 'DNI', docNumber: '12345678A',
  phonePrefix: '+34', phone: '612 345 678', email: 'sofia.martinez@email.com',
  street: 'Calle Mayor 42', floor: '3º B', postalCode: '28001',
  city: 'Madrid', province: 'Madrid', country: 'ES',
  sameAddress: true,
  billingStreet: '', billingFloor: '', billingPostalCode: '',
  billingCity: '', billingProvince: '', billingCountry: 'ES',
  hasInsurance: false, insurerName: 'Adeslas', policyNumber: '',
  primaryPsychologist: 'd1', status: 'active', referralSource: 'word-of-mouth',
  labels: ['Ansiedad', 'Estrés laboral'] as string[],
  background: 'Derivada por médico de cabecera en febrero 2025. Refiere episodios de ansiedad generalizada desde 2022, agravados tras un cambio de trabajo.',
  observations: '',
  emergencyName: 'Carlos Martínez', emergencyRelationship: 'familiar',
  emergencyPhonePrefix: '+34', emergencyPhone: '654 321 098', emergencyEmail: '',
  consentSigned: true, consentDate: '2026-01-10',
  consentDocuments: [
    { name: 'Consentimiento_Informado_Sofia.pdf', size: '245 KB', date: '2026-01-10' },
  ] as { name: string; size: string; date: string }[],
  consentLink: '',
}

const form     = reactive({ ...INITIAL, labels: [...INITIAL.labels], consentDocuments: [...INITIAL.consentDocuments] })
const snapshot = ref(JSON.stringify({ ...INITIAL, labels: [...INITIAL.labels], consentDocuments: [...INITIAL.consentDocuments] }))
const isDirty  = computed(() => JSON.stringify(form) !== snapshot.value)

// ── Age & minor ───────────────────────────────────────────────────────────────

const age = computed(() => {
  if (!form.dob) return null
  const birth = new Date(form.dob); const today = new Date()
  let a = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--
  return a
})
const isMinor = computed(() => age.value !== null && age.value < 18)

// ── Validation ────────────────────────────────────────────────────────────────

const errors = reactive({
  firstName: '', lastName: '', email: '', emergencyName: '', emergencyPhone: '',
})

function validateField(field: keyof typeof errors) {
  if (field === 'firstName')
    errors.firstName = form.firstName.trim() ? '' : 'El nombre es obligatorio'
  if (field === 'lastName')
    errors.lastName = form.lastName.trim() ? '' : 'Los apellidos son obligatorios'
  if (field === 'email') {
    if (!form.email.trim()) { errors.email = ''; return }
    errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : 'Email inválido'
  }
  if (field === 'emergencyName' && isMinor.value)
    errors.emergencyName = form.emergencyName.trim() ? '' : 'Obligatorio para menores'
  if (field === 'emergencyPhone' && isMinor.value)
    errors.emergencyPhone = form.emergencyPhone.trim() ? '' : 'Obligatorio para menores'
}

function validateAll() {
  validateField('firstName'); validateField('lastName'); validateField('email')
  if (isMinor.value) { validateField('emergencyName'); validateField('emergencyPhone') }
  return !Object.values(errors).some(Boolean)
}

// ── Labels ────────────────────────────────────────────────────────────────────

const labelInput = ref('')
function onLabelKeydown(e: KeyboardEvent) {
  if ((e.key === 'Enter' || e.key === ',') && labelInput.value.trim()) {
    e.preventDefault()
    const v = labelInput.value.trim().replace(/,$/, '')
    if (v && !form.labels.includes(v)) form.labels.push(v)
    labelInput.value = ''
  }
}
function removeLabel(l: string) { form.labels = form.labels.filter(x => x !== l) }

// ── Consent file ──────────────────────────────────────────────────────────────

const consentFileRef = ref<HTMLInputElement>()
function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  Array.from(files).forEach(file => {
    const kb = Math.round(file.size / 1024)
    const size = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
    const date = new Date().toISOString().slice(0, 10)
    form.consentDocuments.push({ name: file.name, size, date })
  })
  ;(e.target as HTMLInputElement).value = ''
}
function removeConsentDoc(index: number) {
  form.consentDocuments.splice(index, 1)
}
function fileIcon(name: string) {
  if (name.endsWith('.pdf')) return 'pdf'
  if (name.match(/\.(doc|docx)$/)) return 'doc'
  return 'file'
}

// ── Save / Discard ────────────────────────────────────────────────────────────

function save() {
  if (!validateAll()) return
  snapshot.value = JSON.stringify(form)
  const { success } = useToast()
  success('Changes saved', 'Patient profile has been updated.')
}

function discard() {
  const s = JSON.parse(snapshot.value)
  Object.assign(form, s)
  form.labels = [...s.labels]
  form.consentDocuments = [...s.consentDocuments]
  Object.keys(errors).forEach(k => { (errors as Record<string, string>)[k] = '' })
}


</script>

<template>
  <div class="relative space-y-4 pb-28">

    <!-- ═══════════════════════════════════════════════════════════════
         Personal Information
    ════════════════════════════════════════════════════════════════ -->
    <Card>
      <CardHeader class="pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/8">
            <User class="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle class="text-sm font-semibold">Personal Information</CardTitle>
            <CardDescription class="text-xs">Identity and demographic data</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5">

        <!-- Fields grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">First name <span class="text-destructive">*</span></Label>
            <Input v-model="form.firstName" :class="errors.firstName ? 'border-destructive' : ''" @blur="validateField('firstName')" />
            <p v-if="errors.firstName" class="text-xs text-destructive mt-1">{{ errors.firstName }}</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Last name <span class="text-destructive">*</span></Label>
            <Input v-model="form.lastName" :class="errors.lastName ? 'border-destructive' : ''" @blur="validateField('lastName')" />
            <p v-if="errors.lastName" class="text-xs text-destructive mt-1">{{ errors.lastName }}</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Preferred name</Label>
            <Input v-model="form.preferredName" placeholder="Optional" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Pronouns</Label>
            <Select v-model="form.pronouns">
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="p in PRONOUNS" :key="p.value" :value="p.value">{{ p.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Date of birth</Label>
            <div class="flex items-center gap-2">
              <Input v-model="form.dob" type="date" class="flex-1" />
              <Badge v-if="age !== null" variant="secondary" class="shrink-0 tabular-nums">{{ age }}y</Badge>
            </div>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Gender</Label>
            <Select v-model="form.gender">
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="g in GENDERS" :key="g.value" :value="g.value">{{ g.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Civil status</Label>
            <Select v-model="form.civilStatus">
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="s in CIVIL_STATUS" :key="s.value" :value="s.value">{{ s.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Nationality</Label>
            <Select v-model="form.nationality">
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in COUNTRIES" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Occupation</Label>
            <Input v-model="form.occupation" placeholder="e.g. Profesora" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ═══════════════════════════════════════════════════════════════
         Contact  |  Identification  |  Insurance  (3-col row)
    ════════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- Contact -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-2.5">
            <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950">
              <Phone class="w-3.5 h-3.5 text-sky-600" />
            </div>
            <CardTitle class="text-sm font-semibold">Contact</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="pt-4 space-y-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Phone</Label>
            <div class="flex gap-2">
              <Select v-model="form.phonePrefix">
                <SelectTrigger class="w-[6.5rem] shrink-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="p in PHONE_PREFIXES" :key="p.value" :value="p.value">{{ p.label }}</SelectItem>
                </SelectContent>
              </Select>
              <Input v-model="form.phone" type="tel" placeholder="612 345 678" class="flex-1" />
            </div>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Email</Label>
            <Input
              v-model="form.email"
              type="email"
              placeholder="patient@email.com"
              :class="errors.email ? 'border-destructive' : ''"
              @blur="validateField('email')"
            />
            <p v-if="errors.email" class="text-xs text-destructive mt-1">{{ errors.email }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Identification -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-2.5">
            <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950">
              <FileText class="w-3.5 h-3.5 text-violet-600" />
            </div>
            <CardTitle class="text-sm font-semibold">Identification</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="pt-4 space-y-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Document type</Label>
            <Select v-model="form.docType">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="d in DOC_TYPES" :key="d.value" :value="d.value">{{ d.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Document number</Label>
            <Input v-model="form.docNumber" placeholder="00000000A" class="font-mono tracking-wide" />
          </div>
        </CardContent>
      </Card>

      <!-- Insurance -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                <ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <CardTitle class="text-sm font-semibold">Insurance</CardTitle>
            </div>
            <Switch v-model="form.hasInsurance" />
          </div>
        </CardHeader>
        <CardContent class="pt-4">
          <div v-if="form.hasInsurance" class="space-y-4">
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Insurer</Label>
              <Select v-model="form.insurerName">
                <SelectTrigger><SelectValue placeholder="Select insurer…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="ins in INSURERS" :key="ins" :value="ins">{{ ins }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Policy number</Label>
              <Input v-model="form.policyNumber" placeholder="POL-000000" class="font-mono tracking-wide" />
            </div>
          </div>
          <p v-else class="text-sm text-muted-foreground">No insurance on record.</p>
        </CardContent>
      </Card>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         Address
    ════════════════════════════════════════════════════════════════ -->
    <Card>
      <CardHeader class="pb-4 border-b border-border">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950">
              <MapPin class="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <CardTitle class="text-sm font-semibold">Address</CardTitle>
              <CardDescription class="text-xs">Residential and billing address</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-6">

        <!-- Residential -->
        <div>
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Residential</p>
          <div class="space-y-3">
            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <Label class="mb-1.5 block text-xs text-muted-foreground">Street &amp; number</Label>
                <Input v-model="form.street" placeholder="Calle Mayor 42" />
              </div>
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Floor / Apt</Label>
                <Input v-model="form.floor" placeholder="3º B" />
              </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Postal code</Label>
                <Input v-model="form.postalCode" placeholder="28001" />
              </div>
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">City</Label>
                <Input v-model="form.city" placeholder="Madrid" />
              </div>
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Province</Label>
                <Input v-model="form.province" placeholder="Madrid" />
              </div>
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Country</Label>
                <Select v-model="form.country">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="c in COUNTRIES" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <!-- Billing toggle separator -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-border" />
          <label class="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <span class="text-xs text-muted-foreground">Billing same as residential</span>
            <Switch v-model="form.sameAddress" />
          </label>
        </div>

        <!-- Billing address -->
        <div v-if="!form.sameAddress" class="space-y-3">
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Billing</p>
            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <Label class="mb-1.5 block text-xs text-muted-foreground">Street &amp; number</Label>
                <Input v-model="form.billingStreet" placeholder="Calle Mayor 42" />
              </div>
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Floor / Apt</Label>
                <Input v-model="form.billingFloor" placeholder="3º B" />
              </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Postal code</Label>
                <Input v-model="form.billingPostalCode" placeholder="28001" />
              </div>
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">City</Label>
                <Input v-model="form.billingCity" placeholder="Madrid" />
              </div>
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Province</Label>
                <Input v-model="form.billingProvince" placeholder="Madrid" />
              </div>
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Country</Label>
                <Select v-model="form.billingCountry">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="c in COUNTRIES" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

      </CardContent>
    </Card>

    <!-- ═══════════════════════════════════════════════════════════════
         Clinical Context
    ════════════════════════════════════════════════════════════════ -->
    <Card>
      <CardHeader class="pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950">
            <ClipboardList class="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle class="text-sm font-semibold">Clinical Context</CardTitle>
            <CardDescription class="text-xs">Assignment, referral and clinical notes</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-5">

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Primary psychologist</Label>
            <Select v-model="form.primaryPsychologist">
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in CLINICIANS" :key="c.id" :value="c.id">{{ c.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Status</Label>
            <Select v-model="form.status">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Referral source</Label>
            <Select v-model="form.referralSource">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in REFERRAL_SOURCES" :key="r.value" :value="r.value">{{ r.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Labels -->
        <div>
          <Label class="mb-1.5 block text-xs text-muted-foreground">Labels</Label>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <Badge
              v-for="l in form.labels"
              :key="l"
              variant="secondary"
              class="gap-1 pl-2 pr-1 py-0.5 text-xs"
            >
              {{ l }}
              <button
                type="button"
                class="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                @click="removeLabel(l)"
              >
                <X class="w-3 h-3" />
              </button>
            </Badge>
          </div>
          <Input v-model="labelInput" placeholder="Type and press Enter to add…" @keydown="onLabelKeydown" />
        </div>

        <!-- Background -->
        <div>
          <Label class="mb-0.5 block text-xs text-muted-foreground">Background</Label>
          <p class="text-[11px] text-muted-foreground/70 mb-1.5">Clinical background and relevant history</p>
          <Textarea v-model="form.background" rows="4" class="resize-none" />
        </div>

        <!-- Observations -->
        <div>
          <Label class="mb-0.5 block text-xs text-muted-foreground">Observations</Label>
          <p class="text-[11px] text-muted-foreground/70 mb-1.5">Internal notes — not visible to the patient</p>
          <Textarea v-model="form.observations" rows="3" placeholder="Internal notes…" class="resize-none" />
        </div>

      </CardContent>
    </Card>

    <!-- ═══════════════════════════════════════════════════════════════
         Emergency Contact / Legal Guardian  (half)  |  Consent (half)
    ════════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

      <!-- Emergency Contact -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-2.5">
            <div
              class="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              :class="isMinor ? 'bg-amber-50 dark:bg-amber-950' : 'bg-rose-50 dark:bg-rose-950'"
            >
              <HeartPulse class="w-3.5 h-3.5" :class="isMinor ? 'text-amber-600' : 'text-rose-500'" />
            </div>
            <div class="flex items-center gap-2">
              <CardTitle class="text-sm font-semibold">
                {{ isMinor ? 'Legal Guardian' : 'Emergency Contact' }}
              </CardTitle>
              <Badge
                v-if="isMinor"
                variant="outline"
                class="border-amber-300 text-amber-700 bg-amber-50 gap-1 text-[10px] px-1.5"
              >
                <AlertTriangle class="w-2.5 h-2.5" /> Minor
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-4 space-y-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">
              {{ isMinor ? 'Guardian name' : 'Name' }}
              <span v-if="isMinor" class="text-destructive">*</span>
            </Label>
            <Input
              v-model="form.emergencyName"
              :class="errors.emergencyName ? 'border-destructive' : ''"
              @blur="validateField('emergencyName')"
            />
            <p v-if="errors.emergencyName" class="text-xs text-destructive mt-1">{{ errors.emergencyName }}</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Relationship</Label>
            <Select v-model="form.emergencyRelationship">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in EMERGENCY_RELATIONSHIPS" :key="r.value" :value="r.value">{{ r.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">
              Phone <span v-if="isMinor" class="text-destructive">*</span>
            </Label>
            <div class="flex gap-2">
              <Select v-model="form.emergencyPhonePrefix">
                <SelectTrigger class="w-[6.5rem] shrink-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="p in PHONE_PREFIXES" :key="p.value" :value="p.value">{{ p.label }}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                v-model="form.emergencyPhone"
                type="tel"
                class="flex-1"
                :class="errors.emergencyPhone ? 'border-destructive' : ''"
                @blur="validateField('emergencyPhone')"
              />
            </div>
            <p v-if="errors.emergencyPhone" class="text-xs text-destructive mt-1">{{ errors.emergencyPhone }}</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Email <span class="text-muted-foreground/60">(optional)</span></Label>
            <Input v-model="form.emergencyEmail" type="email" placeholder="contact@email.com" />
          </div>
        </CardContent>
      </Card>

      <!-- Consent -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950">
                <FileCheck class="w-3.5 h-3.5 text-teal-600" />
              </div>
              <CardTitle class="text-sm font-semibold">Consent</CardTitle>
            </div>
            <Switch v-model="form.consentSigned" />
          </div>
        </CardHeader>
        <CardContent class="pt-4">
          <!-- Unsigned state -->
          <div v-if="!form.consentSigned" class="flex flex-col items-center justify-center py-6 text-center gap-2">
            <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <FileCheck class="w-5 h-5 text-muted-foreground" />
            </div>
            <p class="text-sm text-muted-foreground">No consent on file</p>
            <p class="text-xs text-muted-foreground/70">Toggle to record informed consent</p>
          </div>

          <!-- Signed state -->
          <div v-if="form.consentSigned" class="space-y-4">
              <!-- Date signed -->
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Date signed</Label>
                <Input v-model="form.consentDate" type="date" />
              </div>

              <!-- Documents -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <Label class="text-xs text-muted-foreground">Documents</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="h-7 gap-1.5 text-xs text-primary hover:text-primary px-2"
                    @click="consentFileRef?.click()"
                  >
                    <Upload class="w-3.5 h-3.5" />
                    Upload
                  </Button>
                </div>

                <input
                  ref="consentFileRef"
                  type="file"
                  class="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg"
                  multiple
                  @change="handleFileChange"
                />

                <!-- File list -->
                <div v-if="form.consentDocuments.length > 0" class="space-y-1.5">
                  <div
                    v-for="(doc, i) in form.consentDocuments"
                    :key="i"
                    class="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 group"
                  >
                    <!-- File type icon -->
                    <div
                      class="flex items-center justify-center w-8 h-8 rounded-md shrink-0 text-[10px] font-bold"
                      :class="fileIcon(doc.name) === 'pdf'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950'"
                    >
                      {{ fileIcon(doc.name) === 'pdf' ? 'PDF' : 'DOC' }}
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-foreground truncate leading-tight">{{ doc.name }}</p>
                      <p class="text-[11px] text-muted-foreground mt-0.5">{{ doc.size }} · {{ doc.date }}</p>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        class="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="View document"
                      >
                        <Eye class="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        class="h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="Remove document"
                        @click="removeConsentDoc(i)"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <!-- Link input -->
                <div class="flex gap-2 mt-2">
                  <Input
                    v-model="form.consentLink"
                    placeholder="Or paste a document link…"
                    class="flex-1 text-xs h-8"
                  />
                  <Button
                    v-if="form.consentLink.trim()"
                    type="button"
                    variant="outline"
                    size="sm"
                    class="h-8 gap-1.5 text-xs shrink-0"
                    @click="form.consentDocuments.push({ name: form.consentLink.trim(), size: '—', date: new Date().toISOString().slice(0,10) }); form.consentLink = ''"
                  >
                    <Paperclip class="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>

                <p v-if="form.consentDocuments.length === 0" class="text-xs text-muted-foreground/70 mt-1">
                  No documents uploaded yet.
                </p>
              </div>
            </div>
        </CardContent>
      </Card>
    </div>

    <!-- ═════════════════════════════════════════════════════════════════
         Sticky action bar
    ══════════════════════════════════════════════════════════════════ -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-3"
    >
      <div
        v-if="isDirty"
        class="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/95 backdrop-blur-sm px-4 py-3 shadow-lg ring-1 ring-black/5"
      >
        <p class="text-sm text-muted-foreground">You have unsaved changes</p>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="discard">Discard</Button>
          <Button size="sm" @click="save">Save changes</Button>
        </div>
      </div>
    </Transition>

  </div>
</template>
