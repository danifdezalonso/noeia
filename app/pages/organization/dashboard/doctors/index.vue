<script setup lang="ts">
import {
  Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown,
  Pencil, Trash2, Eye, UserX, UserCheck, ChevronDown as ChevronDownIcon, MoreVertical,
} from 'lucide-vue-next'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '~/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

definePageMeta({ layout: 'dashboard' })

const { success } = useToast()

// ── Types ──────────────────────────────────────────────────────────────────

type DoctorStatus = 'active' | 'inactive' | 'on-leave'
type SortKey = 'name' | 'email' | 'specialty' | 'status' | 'patientCount' | 'sessionFeePercent'
type SortDir = 'asc' | 'desc'

interface Doctor {
  id: string
  name: string
  initials: string
  email: string
  specialty: string
  status: DoctorStatus
  patientCount: number
  joinedDate: string
  sessionFeePercent: number
}

// ── Seed data ──────────────────────────────────────────────────────────────

const doctors = ref<Doctor[]>([
  { id: 'd1', name: 'Dr. Elena Voss',    initials: 'EV', email: 'elena.voss@clinic.com',    specialty: 'CBT',                  status: 'active',   patientCount: 18, joinedDate: '2024-03-01', sessionFeePercent: 70 },
  { id: 'd2', name: 'Dr. Marco Silva',   initials: 'MS', email: 'marco.silva@clinic.com',   specialty: 'Psychiatry',           status: 'active',   patientCount: 24, joinedDate: '2023-09-15', sessionFeePercent: 75 },
  { id: 'd3', name: 'Dr. Priya Nair',    initials: 'PN', email: 'priya.nair@clinic.com',    specialty: 'Trauma Therapy',       status: 'active',   patientCount: 12, joinedDate: '2024-01-20', sessionFeePercent: 65 },
  { id: 'd4', name: 'Dr. James Okafor',  initials: 'JO', email: 'james.okafor@clinic.com',  specialty: 'Group Therapy',        status: 'active',   patientCount: 31, joinedDate: '2022-06-10', sessionFeePercent: 80 },
  { id: 'd5', name: 'Dr. Sofia Reyes',   initials: 'SR', email: 'sofia.reyes@clinic.com',   specialty: 'Child & Adolescent',   status: 'active',   patientCount: 15, joinedDate: '2023-11-05', sessionFeePercent: 70 },
  { id: 'd6', name: 'Dr. Lena Brandt',   initials: 'LB', email: 'lena.brandt@clinic.com',   specialty: 'Neuropsychology',      status: 'on-leave', patientCount: 9,  joinedDate: '2023-04-22', sessionFeePercent: 60 },
  { id: 'd7', name: 'Dr. Aarav Patel',   initials: 'AP', email: 'aarav.patel@clinic.com',   specialty: 'Addiction Psychology', status: 'active',   patientCount: 20, joinedDate: '2024-07-08', sessionFeePercent: 72 },
  { id: 'd8', name: 'Dr. Clara Müller',  initials: 'CM', email: 'clara.muller@clinic.com',  specialty: 'Family & Couples',     status: 'inactive', patientCount: 0,  joinedDate: '2023-02-14', sessionFeePercent: 70 },
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

// ── Modal state ────────────────────────────────────────────────────────────

const addModalOpen = ref(false)
const inviteEmail  = ref('')
const inviteError  = ref('')

function openAdd() {
  inviteEmail.value = ''
  inviteError.value = ''
  addModalOpen.value = true
}

function openEdit(d: Doctor) {
  inviteEmail.value = d.email
  inviteError.value = ''
  addModalOpen.value = true
}

function saveDoctor() {
  inviteError.value = ''
  if (!inviteEmail.value.trim()) { inviteError.value = 'Email is required'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.value.trim())) { inviteError.value = 'Enter a valid email address'; return }
  const newId = `d${Date.now()}`
  doctors.value.unshift({
    id: newId,
    name: inviteEmail.value.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    initials: inviteEmail.value.slice(0, 2).toUpperCase(),
    email: inviteEmail.value.trim(),
    specialty: '—',
    status: 'active',
    patientCount: 0,
    joinedDate: new Date().toISOString().slice(0, 10),
    sessionFeePercent: 70,
  })
  addModalOpen.value = false
  success('Invitation sent', `An invitation email has been sent to ${inviteEmail.value.trim()}.`)
  navigateTo(`/organization/dashboard/doctors/${newId}`)
}

// ── Inline fee editing ─────────────────────────────────────────────────────

const editingFeeId  = ref<string | null>(null)
const editingFeeVal = ref<string>('')

function startEditFee(d: Doctor) {
  editingFeeId.value  = d.id
  editingFeeVal.value = String(d.sessionFeePercent)
  nextTick(() => {
    const el = document.getElementById(`fee-input-${d.id}`)
    if (el) (el as HTMLInputElement).select()
  })
}

function commitFee(d: Doctor) {
  const n = parseInt(editingFeeVal.value, 10)
  if (!isNaN(n) && n >= 0 && n <= 100) d.sessionFeePercent = n
  editingFeeId.value = null
}

function onFeeKeydown(e: KeyboardEvent, d: Doctor) {
  if (e.key === 'Enter')  { e.preventDefault(); commitFee(d) }
  if (e.key === 'Escape') { editingFeeId.value = null }
}

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
  inactive:  { label: 'Inactive', dot: 'bg-muted-foreground', badge: 'border-border bg-muted text-muted-foreground'  },
  'on-leave':{ label: 'On leave', dot: 'bg-amber-400', badge: 'border-amber-200 bg-amber-50 text-amber-700'  },
}

const columns: { key: SortKey; label: string }[] = [
  { key: 'name',               label: 'Name'      },
  { key: 'specialty',          label: 'Specialty' },
  { key: 'status',             label: 'Status'    },
  { key: 'patientCount',       label: 'Patients'  },
  { key: 'sessionFeePercent',  label: 'Fee %'     },
]
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-5 max-w-[1100px]">

      <!-- Page header -->
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-foreground tracking-tight">Doctors</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Manage your clinic's medical staff.</p>
        </div>
        <Button @click="openAdd">
          <Plus class="w-4 h-4" />
          Add Doctor
        </Button>
      </div>

      <!-- Search & filter bar -->
      <div class="flex flex-wrap items-center gap-2.5">
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
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
              <ChevronDownIcon class="w-3.5 h-3.5 ml-1 text-muted-foreground" />
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
              <span v-else class="w-2 h-2 rounded-full shrink-0 bg-muted" />
              {{ opt.label }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <p class="text-sm text-muted-foreground ml-auto">{{ filtered.length }} doctor{{ filtered.length !== 1 ? 's' : '' }}</p>
      </div>

      <!-- Table -->
      <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <Table class="min-w-[700px]">
            <TableHeader>
              <TableRow class="bg-muted/30 hover:bg-muted/30">
                <TableHead
                  v-for="col in columns" :key="col.key"
                  class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-foreground transition-colors select-none"
                  @click="toggleSort(col.key)"
                >
                  <div class="flex items-center gap-1">
                    {{ col.label }}
                    <ChevronUp      v-if="sortKey === col.key && sortDir === 'asc'"       class="w-3.5 h-3.5 text-primary" />
                    <ChevronDown    v-else-if="sortKey === col.key && sortDir === 'desc'" class="w-3.5 h-3.5 text-primary" />
                    <ChevronsUpDown v-else class="w-3.5 h-3.5 text-muted-foreground/70" />
                  </div>
                </TableHead>
                <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="filtered.length === 0">
                <TableCell colspan="6" class="py-20 text-center">
                  <p class="text-sm text-muted-foreground">No doctors found</p>
                </TableCell>
              </TableRow>
              <TableRow v-for="d in filtered" :key="d.id" class="hover:bg-accent/50 transition-colors">
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="relative shrink-0">
                      <Avatar class="size-8">
                        <AvatarImage :src="avatarUrl(d.name)" :alt="d.name" />
                        <AvatarFallback class="bg-primary/10 text-primary text-[11px] font-bold">{{ d.initials }}</AvatarFallback>
                      </Avatar>
                      <span :class="['absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background', statusMeta[d.status].dot]" />
                    </div>
                    <div>
                      <p
                        class="font-medium text-foreground leading-tight hover:text-primary cursor-pointer transition-colors"
                        @click="navigateTo(`/organization/dashboard/doctors/${d.id}`)"
                      >{{ d.name }}</p>
                      <p class="text-[11px] text-muted-foreground leading-tight mt-0.5">{{ d.email }}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell class="whitespace-nowrap text-sm text-muted-foreground">{{ d.specialty }}</TableCell>
                <TableCell class="whitespace-nowrap">
                  <Badge variant="outline" :class="['gap-1.5', statusMeta[d.status].badge]">
                    <span :class="['w-1.5 h-1.5 rounded-full', statusMeta[d.status].dot]" />
                    {{ statusMeta[d.status].label }}
                  </Badge>
                </TableCell>
                <TableCell class="whitespace-nowrap text-sm text-muted-foreground tabular-nums">{{ d.patientCount }}</TableCell>

                <!-- ── Fee % (inline editable) ── -->
                <TableCell class="whitespace-nowrap">
                  <!-- Display pill -->
                  <button
                    v-if="editingFeeId !== d.id"
                    class="fee-pill"
                    :class="d.sessionFeePercent >= 75 ? 'fee-pill--high' : d.sessionFeePercent <= 65 ? 'fee-pill--low' : 'fee-pill--mid'"
                    title="Click to edit"
                    @click="startEditFee(d)"
                  >
                    {{ d.sessionFeePercent }}%
                    <Pencil class="fee-pill__edit w-2.5 h-2.5" />
                  </button>
                  <!-- Edit input -->
                  <div v-else class="fee-input-wrap">
                    <input
                      :id="`fee-input-${d.id}`"
                      v-model="editingFeeVal"
                      type="number"
                      min="0"
                      max="100"
                      class="fee-input"
                      @blur="commitFee(d)"
                      @keydown="onFeeKeydown($event, d)"
                    />
                    <span class="fee-input__suffix">%</span>
                  </div>
                </TableCell>

                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-1 justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="w-8 h-8">
                          <MoreVertical class="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-44">
                        <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Doctor actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="gap-2 cursor-pointer" @click="navigateTo(`/organization/dashboard/doctors/${d.id}`)"><Eye class="w-3.5 h-3.5 text-muted-foreground" /> View profile</DropdownMenuItem>
                        <DropdownMenuItem class="gap-2 cursor-pointer" @click="openEdit(d)"><Pencil class="w-3.5 h-3.5 text-muted-foreground" /> Edit details</DropdownMenuItem>
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

  <!-- ── Add Doctor Modal ─────────────────────────────────────────────────── -->
  <Dialog v-model:open="addModalOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Doctor</DialogTitle>
        <p class="text-sm text-muted-foreground">Enter the doctor's email to send them an invitation to join your organisation.</p>
      </DialogHeader>

      <div class="py-2">
        <Label for="invite-email" class="text-sm font-medium mb-1.5 block">
          Email address <span class="text-rose-500">*</span>
        </Label>
        <Input
          id="invite-email"
          v-model="inviteEmail"
          type="email"
          placeholder="doctor@clinic.com"
          :class="inviteError ? 'border-rose-300 focus-visible:ring-rose-300' : ''"
          @keydown.enter="saveDoctor"
        />
        <p v-if="inviteError" class="text-rose-500 text-xs mt-1.5">{{ inviteError }}</p>
      </div>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button @click="saveDoctor">Send invitation</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* ── Fee % pill ─────────────────────────────────────────────────── */
.fee-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: opacity 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.fee-pill:hover { opacity: 0.8; border-color: currentColor; }

.fee-pill--high  { background: rgba(22,163,74,0.08);  color: #15803d; }
.fee-pill--mid   { background: rgba(59,130,246,0.08); color: #2563eb; }
.fee-pill--low   { background: rgba(245,158,11,0.1);  color: #d97706; }

.fee-pill__edit {
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.fee-pill:hover .fee-pill__edit { opacity: 0.6; }

/* ── Fee % inline input ─────────────────────────────────────────── */
.fee-input-wrap {
  display: inline-flex;
  align-items: center;
  border: 1.5px solid hsl(var(--primary));
  border-radius: 8px;
  overflow: hidden;
  background: hsl(var(--background));
  width: 76px;
}
.fee-input {
  width: 48px;
  padding: 3px 6px;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border: none;
  outline: none;
  background: transparent;
  color: hsl(var(--foreground));
  /* hide spin buttons */
  -moz-appearance: textfield;
}
.fee-input::-webkit-outer-spin-button,
.fee-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.fee-input__suffix {
  padding: 0 7px 0 2px;
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
}
</style>
