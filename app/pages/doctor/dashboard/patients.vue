<script setup lang="ts">
import {
  Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown,
  UserRound, Mail, Phone, CalendarDays, Link2,
  Pencil, Trash2, Eye, CalendarPlus, UserX, ChevronDown as ChevronDownIcon,
} from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '~/components/ui/dropdown-menu'

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

const search      = ref('')
const statusFilter = ref<PatientStatus | 'all'>('all')
const filterOpen  = ref(false)

const statusOptions: { value: PatientStatus | 'all'; label: string }[] = [
  { value: 'all',        label: 'All status'  },
  { value: 'active',     label: 'Active'      },
  { value: 'inactive',   label: 'Inactive'    },
  { value: 'on-hold',    label: 'On hold'     },
  { value: 'discharged', label: 'Discharged'  },
]

// Close dropdown on outside click
onMounted(() => {
  document.addEventListener('click', () => { filterOpen.value = false })
})

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
  active:     { label: 'Active',     dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 ring-green-200'   },
  inactive:   { label: 'Inactive',   dot: 'bg-slate-400',  badge: 'bg-slate-50 text-slate-600 ring-slate-200'   },
  'on-hold':  { label: 'On hold',    dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 ring-amber-200'   },
  discharged: { label: 'Discharged', dot: 'bg-rose-400',   badge: 'bg-rose-50 text-rose-600 ring-rose-200'      },
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
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Patients</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your patient records.</p>
        </div>
        <button
          class="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-sm whitespace-nowrap"
          @click="newPatientModalOpen = true"
        >
          <Plus class="w-4 h-4" />
          New Patient
        </button>
      </div>

      <!-- ── Search & filter bar ─────────────────────────────────────────── -->
      <div class="flex flex-wrap items-center gap-2.5">

        <!-- Search -->
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            v-model="search"
            type="text"
            placeholder="Search by name or email…"
            class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <!-- Status filter -->
        <div class="relative">
          <button
            :class="[
              'flex items-center gap-2 px-3.5 py-2 text-sm font-medium border rounded-lg transition-colors',
              statusFilter !== 'all'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700',
            ]"
            @click.stop="filterOpen = !filterOpen"
          >
            <span>{{ statusOptions.find(o => o.value === statusFilter)?.label }}</span>
            <ChevronDownIcon class="w-3.5 h-3.5 text-slate-400" />
          </button>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="filterOpen"
              class="absolute right-0 top-full mt-1.5 z-20 w-40 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden"
              @click.stop
            >
              <button
                v-for="opt in statusOptions"
                :key="opt.value"
                :class="[
                  'w-full text-left px-3.5 py-2 text-sm transition-colors flex items-center gap-2',
                  statusFilter === opt.value
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
                ]"
                @click="statusFilter = opt.value; filterOpen = false"
              >
                <span
                  v-if="opt.value !== 'all'"
                  :class="['w-2 h-2 rounded-full shrink-0', statusMeta[opt.value as PatientStatus].dot]"
                />
                <span v-else class="w-2 h-2 rounded-full shrink-0 bg-slate-200" />
                {{ opt.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Count -->
        <p class="text-sm text-slate-400 ml-auto">
          {{ filtered.length }} patient{{ filtered.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- ── Table ───────────────────────────────────────────────────────── -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <Table class="min-w-[700px]">
            <TableHeader>
              <TableRow class="bg-slate-50/60 dark:bg-slate-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-700/50">
                <!-- Sortable columns -->
                <TableHead
                  v-for="col in columns"
                  :key="col.key"
                  class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors select-none"
                  @click="toggleSort(col.key)"
                >
                  <div class="flex items-center gap-1">
                    {{ col.label }}
                    <span class="text-slate-300">
                      <ChevronUp      v-if="sortKey === col.key && sortDir === 'asc'"  class="w-3.5 h-3.5 text-indigo-500" />
                      <ChevronDown    v-else-if="sortKey === col.key && sortDir === 'desc'" class="w-3.5 h-3.5 text-indigo-500" />
                      <ChevronsUpDown v-else class="w-3.5 h-3.5" />
                    </span>
                  </div>
                </TableHead>

                <!-- Related — not sortable -->
                <TableHead class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Related
                </TableHead>

                <!-- Actions -->
                <TableHead class="text-xs font-semibold text-slate-500 uppercase tracking-wider w-[100px]" />
              </TableRow>
            </TableHeader>

            <TableBody>

              <!-- Empty state -->
              <TableRow v-if="filtered.length === 0">
                <TableCell colspan="7" class="py-20 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <UserRound class="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-slate-600 dark:text-slate-300">No patients found</p>
                      <p class="text-xs text-slate-400 mt-0.5">
                        {{ search || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'Start by adding your first patient.' }}
                      </p>
                    </div>
                    <button
                      v-if="!search && statusFilter === 'all'"
                      class="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors mt-1"
                      @click="newPatientModalOpen = true"
                    >
                      <Plus class="w-4 h-4" />
                      New Patient
                    </button>
                  </div>
                </TableCell>
              </TableRow>

              <!-- Rows -->
              <TableRow
                v-for="p in filtered"
                :key="p.id"
                class="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
              >

                <!-- Name -->
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="relative shrink-0">
                      <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span class="text-indigo-700 text-[11px] font-bold">{{ p.initials }}</span>
                      </div>
                      <!-- Status dot -->
                      <span
                        :class="[
                          'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
                          statusMeta[p.status].dot,
                        ]"
                      />
                    </div>
                    <div>
                      <p class="font-medium text-slate-800 dark:text-slate-100 leading-tight">{{ p.name }}</p>
                      <p class="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {{ p.sessionCount }} session{{ p.sessionCount !== 1 ? 's' : '' }}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <!-- Email -->
                <TableCell class="whitespace-nowrap">
                  <a
                    :href="`mailto:${p.email}`"
                    class="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors group"
                  >
                    <Mail class="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    <span class="text-sm">{{ p.email }}</span>
                  </a>
                </TableCell>

                <!-- Phone -->
                <TableCell class="whitespace-nowrap">
                  <a
                    :href="`tel:${p.phone}`"
                    class="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors group"
                  >
                    <Phone class="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    <span class="text-sm tabular-nums">{{ p.phone }}</span>
                  </a>
                </TableCell>

                <!-- Date of birth -->
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <CalendarDays class="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <div>
                      <span class="text-sm text-slate-600">{{ fmtDob(p.dob) }}</span>
                      <span class="text-xs text-slate-400 ml-1.5">· {{ calcAge(p.dob) }} y</span>
                    </div>
                  </div>
                </TableCell>

                <!-- Status badge -->
                <TableCell class="whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1',
                      statusMeta[p.status].badge,
                    ]"
                  >
                    <span :class="['w-1.5 h-1.5 rounded-full', statusMeta[p.status].dot]" />
                    {{ statusMeta[p.status].label }}
                  </span>
                </TableCell>

                <!-- Related -->
                <TableCell class="whitespace-nowrap">
                  <div v-if="p.related.length > 0" class="flex flex-col gap-1">
                    <div
                      v-for="rel in p.related"
                      :key="rel.id"
                      class="flex items-center gap-1.5"
                    >
                      <Link2 class="w-3 h-3 text-slate-300 shrink-0" />
                      <span class="text-xs text-slate-600 dark:text-slate-300 font-medium">{{ rel.name }}</span>
                      <span class="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">{{ rel.relationship }}</span>
                    </div>
                  </div>
                  <span v-else class="text-xs text-slate-300">—</span>
                </TableCell>

                <!-- Actions -->
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-1 justify-end">

                    <!-- Quick: schedule session -->
                    <button
                      title="Schedule session"
                      class="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      @click="scheduleSession(p)"
                    >
                      <CalendarPlus class="w-4 h-4" />
                    </button>

                    <!-- Overflow menu -->
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <button class="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="16" r="1.5" />
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-44">
                        <DropdownMenuLabel class="text-xs text-slate-400 font-normal">Patient actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <!-- View profile -->
                        <DropdownMenuItem class="gap-2 cursor-pointer">
                          <Eye class="w-3.5 h-3.5 text-slate-400" />
                          View profile
                        </DropdownMenuItem>

                        <!-- Edit -->
                        <DropdownMenuItem class="gap-2 cursor-pointer">
                          <Pencil class="w-3.5 h-3.5 text-slate-400" />
                          Edit details
                        </DropdownMenuItem>

                        <!-- Schedule -->
                        <DropdownMenuItem class="gap-2 cursor-pointer" @click="scheduleSession(p)">
                          <CalendarPlus class="w-3.5 h-3.5 text-slate-400" />
                          Schedule session
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <!-- Status transitions -->
                        <template v-if="p.status === 'active'">
                          <DropdownMenuItem class="gap-2 cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50" @click="setInactive(p.id)">
                            <UserX class="w-3.5 h-3.5" />
                            Set inactive
                          </DropdownMenuItem>
                          <DropdownMenuItem class="gap-2 cursor-pointer text-rose-500 focus:text-rose-500 focus:bg-rose-50" @click="discharge(p.id)">
                            <UserX class="w-3.5 h-3.5" />
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

                        <!-- Delete -->
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

  <!-- Add patient modal -->
  <AddPatientModal
    v-if="newPatientModalOpen"
    :existing-patients="patients.map(p => ({ id: p.id, name: p.name }))"
    @close="newPatientModalOpen = false"
    @save="onPatientSaved"
  />
</template>
