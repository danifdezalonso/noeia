<script setup lang="ts">
import {
  Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown,
  UserRound, Mail, Phone, CalendarDays, Link2,
  Pencil, Trash2, Eye, CalendarPlus,
} from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '~/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'

definePageMeta({ layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────────────────────

type PatientStatus = 'active' | 'inactive' | 'on-hold' | 'discharged'
type SortKey = 'name' | 'email' | 'phone' | 'dob' | 'status'
type SortDir = 'asc' | 'desc'

interface RelatedPatient { id: string; name: string; relationship: string }

interface Patient {
  id: string
  name: string
  initials: string
  email: string
  phone: string
  dob: string          // yyyy-MM-dd
  status: PatientStatus
  related: RelatedPatient[]
  sessionCount: number
  lastSession?: string // ISO date
}

// ── Seed data ──────────────────────────────────────────────────────────────

const patients = ref<Patient[]>([
  {
    id: 'p1', name: 'Sofia Martinez', initials: 'SM',
    email: 'sofia.martinez@email.com', phone: '+34 612 345 678',
    dob: '1990-03-15', status: 'active',
    related: [{ id: 'p4', name: 'Carlos Rivera', relationship: 'Partner' }],
    sessionCount: 14, lastSession: '2026-02-17',
  },
  {
    id: 'p2', name: 'James Wilson', initials: 'JW',
    email: 'j.wilson@example.com', phone: '+44 7700 900123',
    dob: '1985-07-22', status: 'active',
    related: [],
    sessionCount: 8, lastSession: '2026-02-17',
  },
  {
    id: 'p3', name: 'Emma Thompson', initials: 'ET',
    email: 'emma.thompson@email.com', phone: '+44 7911 123456',
    dob: '1994-11-08', status: 'active',
    related: [],
    sessionCount: 21, lastSession: '2026-02-19',
  },
  {
    id: 'p4', name: 'Carlos Rivera', initials: 'CR',
    email: 'c.rivera@correo.es', phone: '+34 654 987 321',
    dob: '1988-05-30', status: 'active',
    related: [{ id: 'p1', name: 'Sofia Martinez', relationship: 'Partner' }],
    sessionCount: 6, lastSession: '2026-02-20',
  },
  {
    id: 'p5', name: 'Aisha Patel', initials: 'AP',
    email: 'aisha.patel@mail.com', phone: '+44 7800 555 123',
    dob: '1997-01-14', status: 'active',
    related: [],
    sessionCount: 5, lastSession: '2026-02-20',
  },
  {
    id: 'p6', name: 'Noah Chen', initials: 'NC',
    email: 'noah.chen@techco.io', phone: '+1 415 555 0190',
    dob: '1993-09-02', status: 'on-hold',
    related: [],
    sessionCount: 3, lastSession: '2026-01-10',
  },
  {
    id: 'p7', name: 'Lucia Fernández', initials: 'LF',
    email: 'lucia.fernandez@gmail.com', phone: '+34 666 111 222',
    dob: '1980-12-25', status: 'active',
    related: [{ id: 'p8', name: "Michael O'Brien", relationship: 'Partner' }],
    sessionCount: 11, lastSession: '2026-02-21',
  },
  {
    id: 'p8', name: "Michael O'Brien", initials: 'MO',
    email: 'mob@outlook.com', phone: '+353 87 123 4567',
    dob: '1979-04-18', status: 'inactive',
    related: [{ id: 'p7', name: 'Lucia Fernández', relationship: 'Partner' }],
    sessionCount: 2, lastSession: '2026-01-28',
  },
  {
    id: 'p9', name: 'Hannah Kim', initials: 'HK',
    email: 'hannah.kim@studio.kr', phone: '+82 10 1234 5678',
    dob: '1996-06-10', status: 'active',
    related: [],
    sessionCount: 9, lastSession: '2026-02-19',
  },
  {
    id: 'p10', name: 'David Okafor', initials: 'DO',
    email: 'david.okafor@work.ng', phone: '+234 801 234 5678',
    dob: '1982-08-03', status: 'discharged',
    related: [],
    sessionCount: 18, lastSession: '2025-11-15',
  },
])

// ── Filter state ───────────────────────────────────────────────────────────

const search       = ref('')
const statusFilter = ref<PatientStatus | 'all'>('all')

const statusOptions: { value: PatientStatus | 'all'; label: string }[] = [
  { value: 'all',        label: 'All status'  },
  { value: 'active',     label: 'Active'      },
  { value: 'inactive',   label: 'Inactive'    },
  { value: 'on-hold',    label: 'On hold'     },
  { value: 'discharged', label: 'Discharged'  },
]

// ── Sorting ────────────────────────────────────────────────────────────────

const sortKey = ref<SortKey>('name')
const sortDir = ref<SortDir>('asc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

// ── Derived list ───────────────────────────────────────────────────────────

const filtered = computed(() => {
  let list = [...patients.value]

  if (statusFilter.value !== 'all') {
    list = list.filter(p => p.status === statusFilter.value)
  }

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q),
    )
  }

  list.sort((a, b) => {
    let va: string = ''
    let vb: string = ''
    if (sortKey.value === 'name')   { va = a.name;   vb = b.name }
    if (sortKey.value === 'email')  { va = a.email;  vb = b.email }
    if (sortKey.value === 'phone')  { va = a.phone;  vb = b.phone }
    if (sortKey.value === 'dob')    { va = a.dob;    vb = b.dob }
    if (sortKey.value === 'status') { va = a.status; vb = b.status }
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ?  1 : -1
    return 0
  })

  return list
})

// ── Patient sheet ──────────────────────────────────────────────────────────

const selectedPatient = ref<Patient | null>(null)

// ── New patient modal ──────────────────────────────────────────────────────

const newPatientModalOpen = ref(false)

function onPatientSaved(data: {
  name: string; email: string; phone: string; dob: string;
  gender: string; pronouns: string; address: string;
  hasInsurance: boolean; insurer: string; policyNumber: string;
  referralSource: string; chiefComplaint: string;
  relatedPatients: { id: string; name: string; relationship: string }[];
  tags: string[]; notes: string;
}) {
  const initials = data.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('')

  const newId = `p${Date.now()}`
  patients.value.unshift({
    id: newId,
    name: data.name,
    initials,
    email: data.email,
    phone: data.phone,
    dob: data.dob || new Date().toISOString().slice(0, 10),
    status: 'active',
    related: data.relatedPatients.map(r => ({
      id: r.id,
      name: r.name,
      relationship: r.relationship,
    })),
    sessionCount: 0,
  })
  newPatientModalOpen.value = false
}

// ── Row actions ────────────────────────────────────────────────────────────

function discharge(id: string) {
  const p = patients.value.find(p => p.id === id)
  if (p) p.status = 'discharged'
}
function setInactive(id: string) {
  const p = patients.value.find(p => p.id === id)
  if (p) p.status = 'inactive'
}
function reactivate(id: string) {
  const p = patients.value.find(p => p.id === id)
  if (p) p.status = 'active'
}
function removePatient(id: string) {
  patients.value = patients.value.filter(p => p.id !== id)
}

function scheduleSession(patient: Patient) {
  const { openCreate } = useCalendar()
  const pad = (n: number) => String(n).padStart(2, '0')
  const now = new Date(); now.setMinutes(0, 0, 0)
  if (now.getHours() < 8) now.setHours(9)
  const end = new Date(now.getTime() + 60 * 60 * 1000)
  const toIso = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  openCreate(toIso(now), toIso(end))
  navigateTo('/doctor/dashboard/calendar')
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDob(dob: string) { return format(parseISO(dob), 'MMM d, yyyy') }
function calcAge(dob: string) {
  const birth = parseISO(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const statusMeta: Record<PatientStatus, { label: string; dot: string; badge: string }> = {
  active:     { label: 'Active',     dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200'   },
  inactive:   { label: 'Inactive',   dot: 'bg-slate-400',  badge: 'bg-slate-50 text-slate-600 border-slate-200'   },
  'on-hold':  { label: 'On hold',    dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200'   },
  discharged: { label: 'Discharged', dot: 'bg-rose-400',   badge: 'bg-rose-50 text-rose-600 border-rose-200'      },
}

const columns: { key: SortKey; label: string }[] = [
  { key: 'name',   label: 'Name'          },
  { key: 'email',  label: 'Email'         },
  { key: 'phone',  label: 'Phone'         },
  { key: 'dob',    label: 'Date of birth' },
  { key: 'status', label: 'Status'        },
]
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-5 max-w-[1100px]">

      <!-- ── Page header ─────────────────────────────────────────────────── -->
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-foreground tracking-tight">Patients</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Manage your patient records.</p>
        </div>
        <Button @click="newPatientModalOpen = true">
          <Plus class="w-4 h-4" />
          New Patient
        </Button>
      </div>

      <!-- ── Search & filter bar ─────────────────────────────────────────── -->
      <div class="flex flex-wrap items-center gap-2.5">

        <!-- Search -->
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            v-model="search"
            type="text"
            placeholder="Search by name or email…"
            class="pl-9"
          />
        </div>

        <!-- Status filter -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="outline"
              :class="statusFilter !== 'all' ? 'bg-primary/10 text-primary border-primary/30' : ''"
            >
              {{ statusOptions.find(o => o.value === statusFilter)?.label }}
              <ChevronDown class="w-3.5 h-3.5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-40">
            <DropdownMenuItem
              v-for="opt in statusOptions"
              :key="opt.value"
              class="gap-2 cursor-pointer"
              :class="statusFilter === opt.value ? 'text-primary font-medium' : ''"
              @click="statusFilter = opt.value"
            >
              <span
                v-if="opt.value !== 'all'"
                :class="['w-2 h-2 rounded-full shrink-0', statusMeta[opt.value as PatientStatus].dot]"
              />
              <span v-else class="w-2 h-2 rounded-full shrink-0 bg-muted-foreground/40" />
              {{ opt.label }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Count -->
        <p class="text-sm text-muted-foreground ml-auto">
          {{ filtered.length }} patient{{ filtered.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- ── Table ───────────────────────────────────────────────────────── -->
      <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <Table class="min-w-[700px]">
            <TableHeader>
              <TableRow class="bg-muted/50 hover:bg-muted/50">
                <!-- Sortable columns -->
                <TableHead
                  v-for="col in columns"
                  :key="col.key"
                  class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-foreground transition-colors select-none"
                  @click="toggleSort(col.key)"
                >
                  <div class="flex items-center gap-1">
                    {{ col.label }}
                    <span class="text-muted-foreground">
                      <ChevronUp      v-if="sortKey === col.key && sortDir === 'asc'"  class="w-3.5 h-3.5 text-primary" />
                      <ChevronDown    v-else-if="sortKey === col.key && sortDir === 'desc'" class="w-3.5 h-3.5 text-primary" />
                      <ChevronsUpDown v-else class="w-3.5 h-3.5" />
                    </span>
                  </div>
                </TableHead>

                <!-- Related — not sortable -->
                <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Related
                </TableHead>

                <!-- Actions -->
                <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[100px]" />
              </TableRow>
            </TableHeader>

            <TableBody>

              <!-- Empty state -->
              <TableRow v-if="filtered.length === 0">
                <TableCell colspan="7" class="py-20 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <UserRound class="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-foreground">No patients found</p>
                      <p class="text-xs text-muted-foreground mt-0.5">
                        {{ search || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'Start by adding your first patient.' }}
                      </p>
                    </div>
                    <Button v-if="!search && statusFilter === 'all'" size="sm" @click="newPatientModalOpen = true">
                      <Plus class="w-4 h-4" />
                      New Patient
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <!-- Rows -->
              <TableRow
                v-for="p in filtered"
                :key="p.id"
                class="hover:bg-accent/50 transition-colors cursor-pointer"
                @click="selectedPatient = p"
              >

                <!-- Name -->
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="relative shrink-0">
                      <Avatar class="size-8">
                        <AvatarImage :src="avatarUrl(p.name)" :alt="p.name" />
                        <AvatarFallback class="bg-primary/10 text-primary text-[11px] font-bold">{{ p.initials }}</AvatarFallback>
                      </Avatar>
                      <!-- Status dot -->
                      <span
                        :class="[
                          'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
                          statusMeta[p.status].dot,
                        ]"
                      />
                    </div>
                    <div>
                      <p class="font-medium text-foreground leading-tight">{{ p.name }}</p>
                      <p class="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        {{ p.sessionCount }} session{{ p.sessionCount !== 1 ? 's' : '' }}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <!-- Email -->
                <TableCell class="whitespace-nowrap">
                  <a
                    :href="`mailto:${p.email}`"
                    class="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors group"
                  >
                    <Mail class="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span class="text-sm">{{ p.email }}</span>
                  </a>
                </TableCell>

                <!-- Phone -->
                <TableCell class="whitespace-nowrap">
                  <a
                    :href="`tel:${p.phone}`"
                    class="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors group"
                  >
                    <Phone class="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span class="text-sm tabular-nums">{{ p.phone }}</span>
                  </a>
                </TableCell>

                <!-- Date of birth -->
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <CalendarDays class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <span class="text-sm text-foreground">{{ fmtDob(p.dob) }}</span>
                      <span class="text-xs text-muted-foreground ml-1.5">· {{ calcAge(p.dob) }} y</span>
                    </div>
                  </div>
                </TableCell>

                <!-- Status badge -->
                <TableCell class="whitespace-nowrap">
                  <Badge variant="outline" :class="['gap-1.5', statusMeta[p.status].badge]">
                    <span :class="['w-1.5 h-1.5 rounded-full', statusMeta[p.status].dot]" />
                    {{ statusMeta[p.status].label }}
                  </Badge>
                </TableCell>

                <!-- Related -->
                <TableCell class="whitespace-nowrap">
                  <div v-if="p.related.length > 0" class="flex flex-col gap-1">
                    <div
                      v-for="rel in p.related"
                      :key="rel.id"
                      class="flex items-center gap-1.5"
                    >
                      <Link2 class="w-3 h-3 text-muted-foreground shrink-0" />
                      <span class="text-xs text-foreground font-medium">{{ rel.name }}</span>
                      <span class="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{{ rel.relationship }}</span>
                    </div>
                  </div>
                  <span v-else class="text-xs text-muted-foreground">—</span>
                </TableCell>

                <!-- Actions -->
                <TableCell class="whitespace-nowrap" @click.stop>
                  <div class="flex items-center gap-1 justify-end">

                    <!-- Quick: schedule session -->
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Schedule session"
                      @click="scheduleSession(p)"
                    >
                      <CalendarPlus class="w-4 h-4" />
                    </Button>

                    <!-- Overflow menu -->
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon-sm">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-44">
                        <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Patient actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem class="gap-2 cursor-pointer">
                          <Eye class="w-3.5 h-3.5 text-muted-foreground" />
                          View profile
                        </DropdownMenuItem>

                        <DropdownMenuItem class="gap-2 cursor-pointer">
                          <Pencil class="w-3.5 h-3.5 text-muted-foreground" />
                          Edit details
                        </DropdownMenuItem>

                        <DropdownMenuItem class="gap-2 cursor-pointer" @click="scheduleSession(p)">
                          <CalendarPlus class="w-3.5 h-3.5 text-muted-foreground" />
                          Schedule session
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <template v-if="p.status === 'active'">
                          <DropdownMenuItem class="gap-2 cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50" @click="setInactive(p.id)">
                            <UserRound class="w-3.5 h-3.5" />
                            Set inactive
                          </DropdownMenuItem>
                          <DropdownMenuItem class="gap-2 cursor-pointer text-rose-500 focus:text-rose-500 focus:bg-rose-50" @click="discharge(p.id)">
                            <UserRound class="w-3.5 h-3.5" />
                            Discharge
                          </DropdownMenuItem>
                        </template>
                        <template v-else-if="p.status === 'inactive' || p.status === 'on-hold' || p.status === 'discharged'">
                          <DropdownMenuItem class="gap-2 cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50" @click="reactivate(p.id)">
                            <UserRound class="w-3.5 h-3.5" />
                            Reactivate
                          </DropdownMenuItem>
                        </template>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          class="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50"
                          @click="removePatient(p.id)"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                          Delete record
                        </DropdownMenuItem>
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

  <!-- Patient detail Sheet -->
  <Sheet :open="!!selectedPatient" @update:open="(v) => { if (!v) selectedPatient = null }">
    <SheetContent side="right" class="w-full sm:max-w-md flex flex-col gap-0 p-0">
      <SheetHeader class="px-6 pt-6 pb-4 border-b border-border">
        <div class="flex items-center gap-3 mb-1">
          <div class="relative shrink-0">
            <Avatar class="size-10">
              <AvatarImage :src="avatarUrl(selectedPatient?.name ?? '')" :alt="selectedPatient?.name" />
              <AvatarFallback class="bg-primary/10 text-primary text-sm font-bold">{{ selectedPatient?.initials }}</AvatarFallback>
            </Avatar>
            <span
              v-if="selectedPatient"
              :class="['absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background', statusMeta[selectedPatient.status].dot]"
            />
          </div>
          <div>
            <SheetTitle class="text-base font-semibold text-foreground">
              {{ selectedPatient?.name }}
            </SheetTitle>
            <SheetDescription>
              <Badge
                v-if="selectedPatient"
                variant="outline"
                :class="['gap-1.5 mt-1', statusMeta[selectedPatient.status].badge]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', statusMeta[selectedPatient.status].dot]" />
                {{ statusMeta[selectedPatient.status].label }}
              </Badge>
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div v-if="selectedPatient" class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        <!-- Contact -->
        <div>
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact</p>
          <div class="space-y-2">
            <a :href="`mailto:${selectedPatient.email}`" class="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
              <Mail class="w-4 h-4 text-muted-foreground shrink-0" />
              {{ selectedPatient.email }}
            </a>
            <a :href="`tel:${selectedPatient.phone}`" class="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
              <Phone class="w-4 h-4 text-muted-foreground shrink-0" />
              {{ selectedPatient.phone }}
            </a>
          </div>
        </div>

        <!-- Date of birth -->
        <div>
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Date of Birth</p>
          <div class="flex items-center gap-2 text-sm text-foreground">
            <CalendarDays class="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{{ fmtDob(selectedPatient.dob) }}</span>
            <span class="text-muted-foreground">· {{ calcAge(selectedPatient.dob) }} years old</span>
          </div>
        </div>

        <!-- Sessions -->
        <div>
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sessions</p>
          <div class="flex items-center gap-4 text-sm">
            <div>
              <p class="text-2xl font-bold text-foreground">{{ selectedPatient.sessionCount }}</p>
              <p class="text-xs text-muted-foreground">total sessions</p>
            </div>
            <div v-if="selectedPatient.lastSession">
              <p class="font-medium text-foreground">{{ format(parseISO(selectedPatient.lastSession), 'MMM d, yyyy') }}</p>
              <p class="text-xs text-muted-foreground">last session</p>
            </div>
          </div>
        </div>

        <!-- Related patients -->
        <div v-if="selectedPatient.related.length > 0">
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Related</p>
          <div class="space-y-2">
            <div
              v-for="rel in selectedPatient.related"
              :key="rel.id"
              class="flex items-center gap-2"
            >
              <Link2 class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span class="text-sm font-medium text-foreground">{{ rel.name }}</span>
              <span class="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{{ rel.relationship }}</span>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="pt-2 border-t border-border">
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actions</p>
          <div class="flex flex-wrap gap-2">
            <Button size="sm" class="gap-1.5" @click="scheduleSession(selectedPatient); selectedPatient = null">
              <CalendarPlus class="w-3.5 h-3.5" /> Schedule session
            </Button>
            <template v-if="selectedPatient.status === 'active'">
              <Button size="sm" variant="outline" class="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50" @click="setInactive(selectedPatient.id)">
                Set inactive
              </Button>
              <Button size="sm" variant="outline" class="gap-1.5 text-rose-500 border-rose-200 hover:bg-rose-50" @click="discharge(selectedPatient.id)">
                Discharge
              </Button>
            </template>
            <template v-else-if="selectedPatient.status !== 'active'">
              <Button size="sm" variant="outline" class="gap-1.5 text-green-600 border-green-200 hover:bg-green-50" @click="reactivate(selectedPatient.id)">
                Reactivate
              </Button>
            </template>
          </div>
        </div>

      </div>
    </SheetContent>
  </Sheet>

  <!-- Add patient modal -->
  <AddPatientModal
    v-if="newPatientModalOpen"
    :existing-patients="patients.map(p => ({ id: p.id, name: p.name }))"
    @close="newPatientModalOpen = false"
    @save="onPatientSaved"
  />
</template>
