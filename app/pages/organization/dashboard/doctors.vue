<script setup lang="ts">
import {
  Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown,
  Pencil, Trash2, Eye, UserX, UserCheck, ChevronDown as ChevronDownIcon,
} from 'lucide-vue-next'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '~/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'

definePageMeta({ layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────────────────────

type DoctorStatus = 'active' | 'inactive' | 'on-leave'
type SortKey = 'name' | 'email' | 'specialty' | 'status' | 'patientCount'
type SortDir = 'asc' | 'desc'
type TabKey = 'identity' | 'professional' | 'licensing' | 'invitation'

interface Doctor {
  id: string
  name: string
  initials: string
  email: string
  specialty: string
  status: DoctorStatus
  patientCount: number
  joinedDate: string
}

// ── Seed data ──────────────────────────────────────────────────────────────

const doctors = ref<Doctor[]>([
  { id: 'd1', name: 'Dr. Elena Voss',    initials: 'EV', email: 'elena.voss@clinic.com',    specialty: 'CBT',                  status: 'active',   patientCount: 18, joinedDate: '2024-03-01' },
  { id: 'd2', name: 'Dr. Marco Silva',   initials: 'MS', email: 'marco.silva@clinic.com',   specialty: 'Psychiatry',           status: 'active',   patientCount: 24, joinedDate: '2023-09-15' },
  { id: 'd3', name: 'Dr. Priya Nair',    initials: 'PN', email: 'priya.nair@clinic.com',    specialty: 'Trauma Therapy',       status: 'active',   patientCount: 12, joinedDate: '2024-01-20' },
  { id: 'd4', name: 'Dr. James Okafor',  initials: 'JO', email: 'james.okafor@clinic.com',  specialty: 'Group Therapy',        status: 'active',   patientCount: 31, joinedDate: '2022-06-10' },
  { id: 'd5', name: 'Dr. Sofia Reyes',   initials: 'SR', email: 'sofia.reyes@clinic.com',   specialty: 'Child & Adolescent',   status: 'active',   patientCount: 15, joinedDate: '2023-11-05' },
  { id: 'd6', name: 'Dr. Lena Brandt',   initials: 'LB', email: 'lena.brandt@clinic.com',   specialty: 'Neuropsychology',      status: 'on-leave', patientCount: 9,  joinedDate: '2023-04-22' },
  { id: 'd7', name: 'Dr. Aarav Patel',   initials: 'AP', email: 'aarav.patel@clinic.com',   specialty: 'Addiction Psychology', status: 'active',   patientCount: 20, joinedDate: '2024-07-08' },
  { id: 'd8', name: 'Dr. Clara Müller',  initials: 'CM', email: 'clara.muller@clinic.com',  specialty: 'Family & Couples',     status: 'inactive', patientCount: 0,  joinedDate: '2023-02-14' },
])

// ── Filter & sort ──────────────────────────────────────────────────────────

const search       = ref('')
const statusFilter = ref<DoctorStatus | 'all'>('all')
const sortKey      = ref<SortKey>('name')
const sortDir      = ref<SortDir>('asc')

const statusOptions: { value: DoctorStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'All status' },
  { value: 'active',   label: 'Active'     },
  { value: 'inactive', label: 'Inactive'   },
  { value: 'on-leave', label: 'On leave'   },
]

function toggleSort(key: SortKey) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

const filtered = computed(() => {
  let list = [...doctors.value]
  if (statusFilter.value !== 'all') list = list.filter(d => d.status === statusFilter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(d => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))
  }
  list.sort((a, b) => {
    const va = String(a[sortKey.value as keyof Doctor] ?? '')
    const vb = String(b[sortKey.value as keyof Doctor] ?? '')
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ?  1 : -1
    return 0
  })
  return list
})

// ── Form options ───────────────────────────────────────────────────────────

const PROFESSIONAL_TYPES = ['Psychologist', 'Psychiatrist', 'Therapist', 'Counselor', 'Social Worker', 'Neuropsychologist', 'Life Coach', 'Other']

const SYSTEM_ROLES = [
  { value: 'doctor',        label: 'Doctor',         desc: 'Manage own schedule & patients'  },
  { value: 'doctor_admin',  label: 'Doctor + Admin',  desc: 'Full access plus admin tools'    },
  { value: 'admin',         label: 'Admin only',      desc: 'Org management, no patient care' },
  { value: 'viewer',        label: 'Viewer',          desc: 'Read-only access'                },
]

const SPECIALTIES = [
  'CBT', 'DBT', 'EMDR', 'Psychiatry', 'Neuropsychology',
  'Child & Adolescent', 'Trauma Therapy', 'Family & Couples',
  'Group Therapy', 'Addiction Psychology', 'Forensic Psychology',
  'Mindfulness', 'Positive Psychology', 'Other',
]

const CLIENT_GROUPS = ['Adults', 'Children', 'Adolescents', 'Couples', 'Families', 'Groups', 'Elderly', 'Veterans', 'LGBTQ+']

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Arabic', 'Mandarin', 'Hindi', 'Japanese']

const MODALITIES = ['Online', 'In-person', 'Hybrid']

const SESSION_LENGTHS = [30, 45, 50, 60, 90]

const REGIONS = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Portugal', 'Netherlands', 'Switzerland',
  'Mexico', 'Brazil', 'Argentina', 'Colombia', 'Japan', 'Singapore', 'Other',
]

const ONBOARDING_LANGS = [
  { value: 'en', label: 'English'    },
  { value: 'es', label: 'Spanish'    },
  { value: 'fr', label: 'French'     },
  { value: 'de', label: 'German'     },
  { value: 'pt', label: 'Portuguese' },
]

// ── Modal state ────────────────────────────────────────────────────────────

const addModalOpen = ref(false)
const editDoctor   = ref<Doctor | null>(null)
const activeTab    = ref<TabKey>('identity')

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: 'identity',    label: 'Identity',    hint: 'Personal info'          },
  { key: 'professional', label: 'Professional', hint: 'Role & expertise'      },
  { key: 'licensing',   label: 'Licensing',   hint: 'Credentials & practice' },
  { key: 'invitation',  label: 'Invitation',  hint: 'Access & onboarding'    },
]

const addForm = reactive({
  // Identity
  firstName: '', lastName: '', email: '', phone: '',
  // Professional
  professionalType: '', systemRole: 'doctor',
  specialties: [] as string[],
  clientGroups: [] as string[],
  languages: [] as string[],
  modalities: [] as string[],
  // Licensing & Practice
  licenseNumber: '', issuingAuthority: '', licenseRegion: '',
  defaultLocation: 'online' as 'online' | 'inperson',
  sessionLength: 50,
  // Invitation
  allowDirectBooking: false,
  inviteClients: true,
  sendInvitation: 'now' as 'now' | 'schedule' | 'none',
  scheduledDate: '',
  onboardingLanguage: 'en',
  customMessage: '',
})

const addErrors = reactive<Record<string, string>>({})

function toggleItem(arr: string[], item: string) {
  const i = arr.indexOf(item)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(item)
}

function tabHasError(key: TabKey) {
  if (key === 'identity')     return ['firstName','lastName','email'].some(f => !!addErrors[f])
  if (key === 'professional') return ['professionalType'].some(f => !!addErrors[f])
  return false
}

function resetForm() {
  Object.assign(addForm, {
    firstName: '', lastName: '', email: '', phone: '',
    professionalType: '', systemRole: 'doctor',
    specialties: [], clientGroups: [], languages: [], modalities: [],
    licenseNumber: '', issuingAuthority: '', licenseRegion: '',
    defaultLocation: 'online', sessionLength: 50,
    allowDirectBooking: false, inviteClients: true,
    sendInvitation: 'now', scheduledDate: '', onboardingLanguage: 'en', customMessage: '',
  })
  Object.keys(addErrors).forEach(k => delete addErrors[k])
}

function openAdd() {
  editDoctor.value = null
  activeTab.value = 'identity'
  resetForm()
  addModalOpen.value = true
}

function openEdit(d: Doctor) {
  editDoctor.value = d
  activeTab.value = 'identity'
  resetForm()
  const raw  = d.name.replace(/^Dr\.\s*/, '')
  const idx  = raw.indexOf(' ')
  Object.assign(addForm, {
    firstName:        idx >= 0 ? raw.slice(0, idx) : raw,
    lastName:         idx >= 0 ? raw.slice(idx + 1) : '',
    email:            d.email,
    specialties:      d.specialty ? [d.specialty] : [],
    sendInvitation:   'none',
    inviteClients:    false,
  })
  addModalOpen.value = true
}

function saveDoctor() {
  Object.keys(addErrors).forEach(k => delete addErrors[k])
  if (!addForm.firstName.trim())    { addErrors.firstName = 'Required'; activeTab.value = 'identity'; return }
  if (!addForm.lastName.trim())     { addErrors.lastName  = 'Required'; activeTab.value = 'identity'; return }
  if (!addForm.email.trim())        { addErrors.email     = 'Required'; activeTab.value = 'identity'; return }
  if (!addForm.professionalType)    { addErrors.professionalType = 'Required'; activeTab.value = 'professional'; return }

  const fullName = `${addForm.firstName.trim()} ${addForm.lastName.trim()}`
  const initials = [addForm.firstName[0], addForm.lastName[0]].filter(Boolean).map(s => s!.toUpperCase()).join('')
  const specialty = addForm.specialties[0] ?? addForm.professionalType

  if (editDoctor.value) {
    const d = doctors.value.find(d => d.id === editDoctor.value!.id)
    if (d) { d.name = fullName; d.initials = initials; d.email = addForm.email; d.specialty = specialty }
  } else {
    doctors.value.unshift({
      id: `d${Date.now()}`, name: fullName, initials, email: addForm.email,
      specialty, status: 'active', patientCount: 0,
      joinedDate: new Date().toISOString().slice(0, 10),
    })
  }
  addModalOpen.value = false
}

// Listen for the global header CTA signal
const { doctorModalOpen } = useGlobalModals()
watch(doctorModalOpen, (open) => {
  if (open) { doctorModalOpen.value = false; openAdd() }
})

// ── Row actions ────────────────────────────────────────────────────────────

function deactivate(id: string) {
  const d = doctors.value.find(d => d.id === id)
  if (d) d.status = 'inactive'
}
function reactivate(id: string) {
  const d = doctors.value.find(d => d.id === id)
  if (d) d.status = 'active'
}
function remove(id: string) {
  doctors.value = doctors.value.filter(d => d.id !== id)
}

// ── Meta helpers ───────────────────────────────────────────────────────────

const statusMeta: Record<DoctorStatus, { label: string; dot: string; badge: string }> = {
  active:    { label: 'Active',   dot: 'bg-green-500', badge: 'border-green-200 bg-green-50 text-green-700'  },
  inactive:  { label: 'Inactive', dot: 'bg-slate-400', badge: 'border-slate-200 bg-slate-50 text-slate-600'  },
  'on-leave':{ label: 'On leave', dot: 'bg-amber-400', badge: 'border-amber-200 bg-amber-50 text-amber-700'  },
}

const columns: { key: SortKey; label: string }[] = [
  { key: 'name',         label: 'Name'      },
  { key: 'specialty',    label: 'Specialty' },
  { key: 'status',       label: 'Status'    },
  { key: 'patientCount', label: 'Patients'  },
]
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-5 max-w-[1100px]">

      <!-- Page header -->
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Doctors</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your clinic's medical staff.</p>
        </div>
        <Button @click="openAdd">
          <Plus class="w-4 h-4" />
          Add Doctor
        </Button>
      </div>

      <!-- Search & filter bar -->
      <div class="flex flex-wrap items-center gap-2.5">
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
          <Input
            v-model="search"
            placeholder="Search by name, email or specialty…"
            class="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              :class="statusFilter !== 'all' ? 'bg-primary/10 text-primary border-primary/30' : ''"
            >
              {{ statusOptions.find(o => o.value === statusFilter)?.label }}
              <ChevronDownIcon class="w-3.5 h-3.5 ml-1 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-40">
            <DropdownMenuItem
              v-for="opt in statusOptions" :key="opt.value"
              :class="statusFilter === opt.value ? 'text-primary font-medium' : ''"
              class="flex items-center gap-2 cursor-pointer"
              @click="statusFilter = opt.value"
            >
              <span v-if="opt.value !== 'all'" :class="['w-2 h-2 rounded-full shrink-0', statusMeta[opt.value as DoctorStatus].dot]" />
              <span v-else class="w-2 h-2 rounded-full shrink-0 bg-slate-200" />
              {{ opt.label }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <p class="text-sm text-slate-400 ml-auto">{{ filtered.length }} doctor{{ filtered.length !== 1 ? 's' : '' }}</p>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <Table class="min-w-[700px]">
            <TableHeader>
              <TableRow class="bg-slate-50/60 dark:bg-slate-700/50 hover:bg-slate-50/60">
                <TableHead
                  v-for="col in columns" :key="col.key"
                  class="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-700 transition-colors select-none"
                  @click="toggleSort(col.key)"
                >
                  <div class="flex items-center gap-1">
                    {{ col.label }}
                    <ChevronUp      v-if="sortKey === col.key && sortDir === 'asc'"       class="w-3.5 h-3.5 text-primary" />
                    <ChevronDown    v-else-if="sortKey === col.key && sortDir === 'desc'" class="w-3.5 h-3.5 text-primary" />
                    <ChevronsUpDown v-else class="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </TableHead>
                <TableHead class="text-xs font-semibold text-slate-500 uppercase tracking-wider w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="filtered.length === 0">
                <TableCell colspan="5" class="py-20 text-center">
                  <p class="text-sm text-slate-400">No doctors found</p>
                </TableCell>
              </TableRow>
              <TableRow v-for="d in filtered" :key="d.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="relative shrink-0">
                      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span class="text-primary text-[11px] font-bold">{{ d.initials }}</span>
                      </div>
                      <span :class="['absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white', statusMeta[d.status].dot]" />
                    </div>
                    <div>
                      <p class="font-medium text-slate-800 dark:text-slate-100 leading-tight">{{ d.name }}</p>
                      <p class="text-[11px] text-slate-400 leading-tight mt-0.5">{{ d.email }}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell class="whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{{ d.specialty }}</TableCell>
                <TableCell class="whitespace-nowrap">
                  <Badge variant="outline" :class="['gap-1.5', statusMeta[d.status].badge]">
                    <span :class="['w-1.5 h-1.5 rounded-full', statusMeta[d.status].dot]" />
                    {{ statusMeta[d.status].label }}
                  </Badge>
                </TableCell>
                <TableCell class="whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 tabular-nums">{{ d.patientCount }}</TableCell>
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-1 justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="w-8 h-8">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-44">
                        <DropdownMenuLabel class="text-xs text-slate-400 font-normal">Doctor actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="gap-2 cursor-pointer"><Eye class="w-3.5 h-3.5 text-slate-400" /> View profile</DropdownMenuItem>
                        <DropdownMenuItem class="gap-2 cursor-pointer" @click="openEdit(d)"><Pencil class="w-3.5 h-3.5 text-slate-400" /> Edit details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem v-if="d.status === 'active' || d.status === 'on-leave'" class="gap-2 cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50" @click="deactivate(d.id)"><UserX class="w-3.5 h-3.5" /> Deactivate</DropdownMenuItem>
                        <DropdownMenuItem v-else class="gap-2 cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50" @click="reactivate(d.id)"><UserCheck class="w-3.5 h-3.5" /> Reactivate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50" @click="remove(d.id)"><Trash2 class="w-3.5 h-3.5" /> Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  </div>

  <!-- ── Add / Edit Doctor Modal ──────────────────────────────────────────── -->
  <Dialog v-model:open="addModalOpen">
    <DialogContent class="max-w-2xl p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">

      <!-- Header -->
      <DialogHeader class="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
        <DialogTitle class="text-lg font-semibold text-slate-900 dark:text-white">
          {{ editDoctor ? 'Edit Doctor' : 'Add Doctor' }}
        </DialogTitle>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {{ editDoctor ? 'Update this team member\'s information.' : 'Fill in the details to onboard a new team member.' }}
        </p>
      </DialogHeader>

      <!-- Tab nav -->
      <div class="px-6 border-b border-slate-100 dark:border-slate-700 shrink-0 flex gap-0 overflow-x-auto">
        <button
          v-for="tab in TABS" :key="tab.key"
          type="button"
          @click="activeTab = tab.key"
          :class="[
            'relative flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px',
            activeTab === tab.key
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          ]"
        >
          {{ tab.label }}
          <span
            v-if="tabHasError(tab.key)"
            class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"
          />
        </button>
      </div>

      <!-- Scrollable form body -->
      <div class="flex-1 overflow-y-auto min-h-0 px-6 py-5">

        <!-- ── Tab: Identity ── -->
        <div v-if="activeTab === 'identity'" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First name <span class="text-rose-500">*</span></Label>
              <Input
                v-model="addForm.firstName"
                placeholder="Elena"
                :class="addErrors.firstName ? 'border-rose-300 bg-rose-50' : ''"
              />
              <p v-if="addErrors.firstName" class="text-rose-500 text-xs mt-1">{{ addErrors.firstName }}</p>
            </div>
            <div>
              <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last name <span class="text-rose-500">*</span></Label>
              <Input
                v-model="addForm.lastName"
                placeholder="Voss"
                :class="addErrors.lastName ? 'border-rose-300 bg-rose-50' : ''"
              />
              <p v-if="addErrors.lastName" class="text-rose-500 text-xs mt-1">{{ addErrors.lastName }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address <span class="text-rose-500">*</span></Label>
              <Input
                v-model="addForm.email"
                type="email"
                placeholder="elena.voss@clinic.com"
                :class="addErrors.email ? 'border-rose-300 bg-rose-50' : ''"
              />
              <p v-if="addErrors.email" class="text-rose-500 text-xs mt-1">{{ addErrors.email }}</p>
            </div>
            <div>
              <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone number</Label>
              <Input v-model="addForm.phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
        </div>

        <!-- ── Tab: Professional ── -->
        <div v-if="activeTab === 'professional'" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Professional type <span class="text-rose-500">*</span></Label>
              <Select v-model="addForm.professionalType">
                <SelectTrigger :class="addErrors.professionalType ? 'border-rose-300' : ''">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="t in PROFESSIONAL_TYPES" :key="t" :value="t">{{ t }}</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="addErrors.professionalType" class="text-rose-500 text-xs mt-1">{{ addErrors.professionalType }}</p>
            </div>
          </div>

          <div>
            <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">System role</Label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="role in SYSTEM_ROLES" :key="role.value"
                type="button"
                @click="addForm.systemRole = role.value"
                :class="[
                  'text-left px-3 py-2.5 rounded-xl border transition-all',
                  addForm.systemRole === role.value
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/20'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300',
                ]"
              >
                <p :class="['text-sm font-semibold', addForm.systemRole === role.value ? 'text-primary' : 'text-slate-800 dark:text-slate-100']">{{ role.label }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{{ role.desc }}</p>
              </button>
            </div>
          </div>

          <div>
            <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Specialties</Label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="s in SPECIALTIES" :key="s"
                type="button"
                @click="toggleItem(addForm.specialties, s)"
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                  addForm.specialties.includes(s)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300',
                ]"
              >{{ s }}</button>
            </div>
          </div>

          <div>
            <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Client groups</Label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="g in CLIENT_GROUPS" :key="g"
                type="button"
                @click="toggleItem(addForm.clientGroups, g)"
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                  addForm.clientGroups.includes(g)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300',
                ]"
              >{{ g }}</button>
            </div>
          </div>

          <div>
            <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Languages</Label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="l in LANGUAGES" :key="l"
                type="button"
                @click="toggleItem(addForm.languages, l)"
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                  addForm.languages.includes(l)
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300',
                ]"
              >{{ l }}</button>
            </div>
          </div>

          <div>
            <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Modalities</Label>
            <div class="flex gap-2">
              <button
                v-for="m in MODALITIES" :key="m"
                type="button"
                @click="toggleItem(addForm.modalities, m)"
                :class="[
                  'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                  addForm.modalities.includes(m)
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300',
                ]"
              >{{ m }}</button>
            </div>
          </div>
        </div>

        <!-- ── Tab: Licensing ── -->
        <div v-if="activeTab === 'licensing'" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">License number</Label>
              <Input v-model="addForm.licenseNumber" placeholder="PSY-1234567" />
            </div>
            <div>
              <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Issuing authority</Label>
              <Input v-model="addForm.issuingAuthority" placeholder="State Board of Psychology" />
            </div>
          </div>

          <div>
            <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">License country / region</Label>
            <Select v-model="addForm.licenseRegion">
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in REGIONS" :key="r" :value="r">{{ r }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Default location</Label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="addForm.defaultLocation = 'online'"
                  :class="['py-2 rounded-lg text-sm font-medium border transition-colors', addForm.defaultLocation === 'online' ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300']"
                >Online</button>
                <button
                  type="button"
                  @click="addForm.defaultLocation = 'inperson'"
                  :class="['py-2 rounded-lg text-sm font-medium border transition-colors', addForm.defaultLocation === 'inperson' ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300']"
                >In-person</button>
              </div>
            </div>

            <div>
              <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Session default length</Label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="len in SESSION_LENGTHS" :key="len"
                  type="button"
                  @click="addForm.sessionLength = len"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    addForm.sessionLength === len
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300',
                  ]"
                >{{ len }} min</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Tab: Invitation ── -->
        <div v-if="activeTab === 'invitation'" class="space-y-6">

          <!-- Client access -->
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Client Access</p>
            <div class="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">

              <div class="flex items-start justify-between gap-4 px-4 py-3.5 bg-white dark:bg-slate-800">
                <div>
                  <p class="text-sm font-medium text-slate-800 dark:text-slate-100">Allow direct booking</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Clients can find and schedule appointments with this doctor directly via the platform</p>
                </div>
                <Switch v-model:checked="addForm.allowDirectBooking" class="mt-0.5 flex-shrink-0" />
              </div>

              <div class="flex items-start justify-between gap-4 px-4 py-3.5 bg-white dark:bg-slate-800">
                <div>
                  <p class="text-sm font-medium text-slate-800 dark:text-slate-100">Notify existing clients</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Automatically send a notification to current clients when this doctor joins the clinic</p>
                </div>
                <Switch v-model:checked="addForm.inviteClients" class="mt-0.5 flex-shrink-0" />
              </div>
            </div>
          </div>

          <!-- Doctor invitation -->
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Doctor Invitation</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              A magic link will be sent to the doctor's email address so they can complete their profile setup and access the platform.
            </p>

            <!-- Timing selector -->
            <div class="grid grid-cols-3 gap-2 mb-5">
              <button
                v-for="opt in [{ v: 'now', title: 'Send now', sub: 'Immediately on save' }, { v: 'schedule', title: 'Schedule', sub: 'Pick a date & time' }, { v: 'none', title: 'Skip', sub: 'Send manually later' }]"
                :key="opt.v"
                type="button"
                @click="addForm.sendInvitation = opt.v as 'now' | 'schedule' | 'none'"
                :class="[
                  'py-3 px-2 rounded-xl border text-center transition-all',
                  addForm.sendInvitation === opt.v
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/20'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300',
                ]"
              >
                <p :class="['text-sm font-semibold', addForm.sendInvitation === opt.v ? 'text-primary' : 'text-slate-800 dark:text-slate-100']">{{ opt.title }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ opt.sub }}</p>
              </button>
            </div>

            <!-- Scheduled date -->
            <div v-if="addForm.sendInvitation === 'schedule'" class="mb-4">
              <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Send on</Label>
              <Input v-model="addForm.scheduledDate" type="datetime-local" />
            </div>

            <!-- Language + message (if sending) -->
            <template v-if="addForm.sendInvitation !== 'none'">
              <div class="mb-4">
                <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Onboarding language</Label>
                <Select v-model="addForm.onboardingLanguage">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="l in ONBOARDING_LANGS" :key="l.value" :value="l.value">{{ l.label }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Custom message <span class="text-slate-400 font-normal">(optional)</span></Label>
                <Textarea
                  v-model="addForm.customMessage"
                  placeholder="Welcome to our clinic! We're excited to have you on board. Please complete your profile setup using the link below."
                  :rows="3"
                  class="resize-none"
                />
                <p class="text-xs text-slate-400 mt-1">{{ addForm.customMessage.length }}/300 characters</p>
              </div>
            </template>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
        <Button variant="outline" type="button" @click="addModalOpen = false">Cancel</Button>
        <div class="flex items-center gap-2">
          <!-- Tab indicators -->
          <div class="flex gap-1 mr-2">
            <button
              v-for="tab in TABS" :key="tab.key"
              type="button"
              @click="activeTab = tab.key"
              :class="['w-1.5 h-1.5 rounded-full transition-colors', activeTab === tab.key ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300']"
            />
          </div>
          <Button type="button" @click="saveDoctor">
            {{ editDoctor ? 'Save changes' : 'Add Doctor' }}
          </Button>
        </div>
      </div>

    </DialogContent>
  </Dialog>
</template>
