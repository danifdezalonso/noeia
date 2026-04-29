<script setup lang="ts">
import {
  Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown,
  Pencil, Trash2, Eye, UserX, UserCheck, ChevronDown as ChevronDownIcon, MoreVertical, Menu, GripVertical, Check,
  User, Briefcase, Activity, Users, Percent, ArrowUpRight
} from 'lucide-vue-next'
import { markRaw, ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter
} from '~/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuGroup
} from '~/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '~/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

definePageMeta({ layout: 'dashboard' })

const { success } = useToast()

// ── Types ──────────────────────────────────────────────────────────────────

type DoctorStatus = 'active' | 'inactive' | 'on-leave'
type SortKey = 'name' | 'email' | 'specialty' | 'status' | 'patientCount' | 'sessionFeePercent'
type SortDir = 'asc' | 'desc'
type ViewType = 'all' | 'active' | 'on-leave'

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

// ── Views & Filters ────────────────────────────────────────────────────────

const currentView = ref<ViewType>('all')
const viewOptions = [
  { value: 'all', label: 'All Doctors' },
  { value: 'active', label: 'Active Doctors' },
  { value: 'on-leave', label: 'On Leave' },
]

const search       = ref('')
const sortKey      = ref<SortKey>('name')
const sortDir      = ref<SortDir>('asc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

const filtered = computed(() => {
  let list = [...doctors.value]
  
  if (currentView.value === 'active') list = list.filter(d => d.status === 'active')
  if (currentView.value === 'on-leave') list = list.filter(d => d.status === 'on-leave')
  
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

// ── Columns & Options ──────────────────────────────────────────────────────

interface ColumnDef {
  key: SortKey;
  label: string;
  visible: boolean;
  width: number;
  icon: any;
}

const columnsState = ref<ColumnDef[]>([
  { key: 'name',               label: 'Name',      visible: true, width: 240, icon: markRaw(User) },
  { key: 'specialty',          label: 'Specialty', visible: true, width: 140, icon: markRaw(Briefcase) },
  { key: 'status',             label: 'Status',    visible: true, width: 120, icon: markRaw(Activity) },
  { key: 'patientCount',       label: 'Patients',  visible: true, width: 120, icon: markRaw(Users) },
  { key: 'sessionFeePercent',  label: 'Fee %',     visible: true, width: 120, icon: markRaw(Percent) },
])

const tableWrapperRef = ref<HTMLElement | null>(null)
const containerWidth = ref(1000)

let ro: ResizeObserver | null = null
onMounted(() => {
  if (tableWrapperRef.value) {
    ro = new ResizeObserver((entries) => {
      if (entries[0]) {
        containerWidth.value = entries[0].contentRect.width
      }
    })
    ro.observe(tableWrapperRef.value)
  }
})
onBeforeUnmount(() => {
  if (ro) ro.disconnect()
})

const visibleColumns = computed(() => {
  const visible = columnsState.value.filter(c => c.visible)
  const baseWidthSum = visible.reduce((sum, col) => sum + col.width, 0)
  
  const availableSpace = Math.max(0, containerWidth.value - 48 - baseWidthSum)
  const extraPerColumn = visible.length > 0 ? availableSpace / visible.length : 0
  
  return visible.map(col => ({
    ...col,
    computedWidth: col.width + extraPerColumn
  }))
})

const gridMinWidth = computed(() => visibleColumns.value.reduce((acc, c) => acc + c.computedWidth, 0) + 48)

const draggingColKey = ref<SortKey | null>(null)
const dragOverColKey = ref<SortKey | null>(null)
const dragOverPosition = ref<'left' | 'right' | null>(null)

function onColumnDragStart(e: DragEvent, col: ColumnDef) {
  draggingColKey.value = col.key
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    const th = (e.currentTarget as HTMLElement).closest('th')
    if (th) {
      // Create a clean ghost image of the entire TH element
      e.dataTransfer.setDragImage(th, 15, 15)
    }
  }
}

function onColumnDragOver(e: DragEvent, col: ColumnDef) {
  e.preventDefault()
  if (draggingColKey.value === col.key) return
  dragOverColKey.value = col.key
  
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const mid = rect.left + rect.width / 2
  dragOverPosition.value = e.clientX < mid ? 'left' : 'right'
}

function onColumnDragLeave(col: ColumnDef) {
  if (dragOverColKey.value === col.key) {
    dragOverColKey.value = null
    dragOverPosition.value = null
  }
}

function onColumnDrop(targetCol: ColumnDef) {
  if (!draggingColKey.value || draggingColKey.value === targetCol.key) {
    dragOverColKey.value = null
    dragOverPosition.value = null
    return
  }
  
  const cols = [...columnsState.value]
  const sourceIndex = cols.findIndex(c => c.key === draggingColKey.value)
  let targetIndex = cols.findIndex(c => c.key === targetCol.key)
  
  if (sourceIndex > -1 && targetIndex > -1) {
    const [removed] = cols.splice(sourceIndex, 1)
    
    // Recalculate targetIndex after removal
    targetIndex = cols.findIndex(c => c.key === targetCol.key)
    if (dragOverPosition.value === 'right') {
      targetIndex++
    }
    
    cols.splice(targetIndex, 0, removed)
    columnsState.value = cols
  }
  
  draggingColKey.value = null
  dragOverColKey.value = null
  dragOverPosition.value = null
}

function onColumnDragEnd() {
  draggingColKey.value = null
  dragOverColKey.value = null
  dragOverPosition.value = null
}

function resetColumns() {
  columnsState.value = [
    { key: 'name',               label: 'Name',      visible: true, width: 240, icon: markRaw(User) },
    { key: 'specialty',          label: 'Specialty', visible: true, width: 140, icon: markRaw(Briefcase) },
    { key: 'status',             label: 'Status',    visible: true, width: 120, icon: markRaw(Activity) },
    { key: 'patientCount',       label: 'Patients',  visible: true, width: 120, icon: markRaw(Users) },
    { key: 'sessionFeePercent',  label: 'Fee %',     visible: true, width: 120, icon: markRaw(Percent) },
  ]
}

// ── Column Resizing ────────────────────────────────────────────────────────

const resizingColKey = ref<SortKey | null>(null)
const startX = ref(0)
const startWidth = ref(0)

function onResizeStart(e: PointerEvent, col: ColumnDef) {
  resizingColKey.value = col.key
  startX.value = e.clientX
  startWidth.value = col.width
  
  document.addEventListener('pointermove', onResizeMove)
  document.addEventListener('pointerup', onResizeEnd)
}

function onResizeMove(e: PointerEvent) {
  if (!resizingColKey.value) return
  const col = columnsState.value.find(c => c.key === resizingColKey.value)
  if (!col) return
  
  const delta = e.clientX - startX.value
  col.width = Math.max(60, startWidth.value + delta) // min width 60px
}

function onResizeEnd() {
  resizingColKey.value = null
  document.removeEventListener('pointermove', onResizeMove)
  document.removeEventListener('pointerup', onResizeEnd)
}

// ── Modal state ────────────────────────────────────────────────────────────

const addModalOpen     = ref(false)
const inviteEmail      = ref('')
const inviteError      = ref('')
const inviteSuccessOpen = ref(false)
const invitedEmail     = ref('')

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
  if (!inviteEmail.value.trim()) { inviteError.value = 'Se requiere un email'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.value.trim())) { inviteError.value = 'Introduce un email válido'; return }
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
  invitedEmail.value = inviteEmail.value.trim()
  addModalOpen.value = false
  inviteSuccessOpen.value = true
}

function inviteMore() {
  inviteSuccessOpen.value = false
  inviteEmail.value = ''
  inviteError.value = ''
  addModalOpen.value = true
}

function inviteDone() {
  const id = doctors.value.find(d => d.email === invitedEmail.value)?.id
  inviteSuccessOpen.value = false
  if (id) navigateTo(`/organization/dashboard/doctors/${id}`)
}

// ── Fee Edit Modal ─────────────────────────────────────────────────────────

const feeModalOpen = ref(false)
const confirmFeeOpen = ref(false)
const feeModalDoctor = ref<Doctor | null>(null)
const feeModalValue = ref<number>(0)

function openFeeModal(d: Doctor) {
  feeModalDoctor.value = d
  feeModalValue.value = d.sessionFeePercent
  feeModalOpen.value = true
}

function initiateFeeSave() {
  if (feeModalDoctor.value && feeModalValue.value !== feeModalDoctor.value.sessionFeePercent) {
    confirmFeeOpen.value = true
  } else {
    feeModalOpen.value = false
    feeModalDoctor.value = null
  }
}

function confirmFeeSave() {
  if (feeModalDoctor.value) {
    feeModalDoctor.value.sessionFeePercent = feeModalValue.value
    success('Fee Updated', `${feeModalDoctor.value.name}'s fee has been updated to ${feeModalValue.value}%.`)
  }
  confirmFeeOpen.value = false
  feeModalOpen.value = false
  feeModalDoctor.value = null
}

function cancelFeeSave() {
  confirmFeeOpen.value = false
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
  active:    { label: 'Active',   dot: 'bg-emerald-500 dark:bg-emerald-400', badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400'  },
  inactive:  { label: 'Inactive', dot: 'bg-muted-foreground/40', badge: 'border-border bg-muted/50 text-muted-foreground'  },
  'on-leave':{ label: 'On leave', dot: 'bg-foreground/60', badge: 'border-border bg-muted text-foreground dark:border-border dark:bg-muted dark:text-foreground'  },
}
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 bg-muted/10">
    <div class="mx-auto max-w-[1440px] w-full flex flex-col space-y-5">
      <!-- Page header -->
      <div class="flex flex-wrap items-start justify-between gap-3 shrink-0">
        <div>
          <h1 class="text-2xl font-bold text-foreground tracking-tight" style="font-family: 'Roboto Slab', serif;">Doctors</h1>
          <p class="text-sm text-muted-foreground mt-0.5">Manage your clinic's medical staff.</p>
        </div>
      </div>

      <!-- Data Grid Card -->
      <div class="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">

        <!-- Toolbar -->
        <div class="flex items-center justify-between border-b border-border px-4 py-2.5 shrink-0 bg-card">
          <div class="flex items-center gap-2">
            <!-- View Dropdown -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm" class="text-muted-foreground text-sm font-medium h-8 px-2.5 hover:bg-muted">
                  <Menu class="w-4 h-4 mr-2" />
                  {{ viewOptions.find(o => o.value === currentView)?.label }}
                  <span class="ml-1.5 opacity-70">&middot; {{ filtered.length }}</span>
                  <ChevronDownIcon class="w-3.5 h-3.5 ml-1.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" class="w-48">
                <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Views</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-for="v in viewOptions" :key="v.value"
                  @click="currentView = v.value"
                  class="cursor-pointer text-sm"
                  :class="currentView === v.value ? 'font-medium text-foreground bg-muted/50' : 'text-muted-foreground'"
                >
                  {{ v.label }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Search Input -->
            <div class="relative mr-2">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                v-model="search"
                placeholder="Search..."
                class="h-8 w-56 pl-8 text-sm border-transparent bg-muted/50 hover:bg-muted focus-visible:bg-background focus-visible:border-primary/30 focus-visible:ring-1 focus-visible:ring-primary shadow-none rounded-md transition-all"
              />
            </div>

            <!-- Sort Dropdown -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm" class="text-muted-foreground h-8 text-sm px-3 font-medium hover:bg-muted">
                  Sort: {{ columnsState.find(c => c.key === sortKey)?.label }}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-40">
                <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Sort by Column</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem v-for="col in columnsState" :key="col.key" @click="toggleSort(col.key as SortKey)" class="text-sm cursor-pointer">
                  {{ col.label }}
                  <ChevronUp v-if="sortKey === col.key && sortDir === 'asc'" class="w-4 h-4 ml-auto text-muted-foreground" />
                  <ChevronDown v-if="sortKey === col.key && sortDir === 'desc'" class="w-4 h-4 ml-auto text-muted-foreground" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <!-- Options Dropdown -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm" class="text-muted-foreground h-8 text-sm px-3 font-medium hover:bg-muted">
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    @click="resetColumns"
                    class="text-sm cursor-pointer text-muted-foreground"
                  >
                    Reset columns
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Columns</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    v-for="col in columnsState"
                    :key="col.key"
                    @select.prevent="col.visible = !col.visible"
                    draggable="true"
                    @dragstart="onColumnDragStart($event, col)"
                    @dragover.prevent="onColumnDragOver($event, col)"
                    @dragleave="onColumnDragLeave(col)"
                    @drop="onColumnDrop(col)"
                    @dragend="onColumnDragEnd"
                    class="cursor-grab active:cursor-grabbing text-sm flex items-center justify-between px-2 py-1.5 group/col relative"
                  >
                    <div class="flex items-center gap-2 overflow-hidden pointer-events-none">
                      <GripVertical class="w-3.5 h-3.5 text-muted-foreground/40 group-hover/col:text-muted-foreground shrink-0" />
                      <component :is="col.icon" class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span class="truncate">{{ col.label }}</span>
                    </div>
                    <Check v-if="col.visible" class="w-4 h-4 text-primary shrink-0 ml-3 pointer-events-none" />
                    
                    <!-- Drop Indicators for Menu -->
                    <div v-if="dragOverColKey === col.key && dragOverPosition === 'left'" class="absolute top-0 left-0 w-full h-0.5 bg-primary z-30 pointer-events-none"></div>
                    <div v-if="dragOverColKey === col.key && dragOverPosition === 'right'" class="absolute bottom-0 left-0 w-full h-0.5 bg-primary z-30 pointer-events-none"></div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div class="w-[1px] h-5 bg-border mx-1.5" />
            
            <Button size="sm" class="h-8 text-sm px-3.5 shadow-sm rounded-md" @click="openAdd">
              <Plus class="w-4 h-4 mr-1.5" /> Add Doctor
            </Button>
          </div>
        </div>

        <!-- Data Grid Table -->
        <div ref="tableWrapperRef" class="overflow-x-auto bg-card">
          <Table aria-label="Doctors Directory" class="table-fixed border-collapse" :style="{ width: `max(100%, ${gridMinWidth}px)` }">
            <colgroup>
              <col v-for="col in visibleColumns" :key="col.key" :style="{ width: col.computedWidth + 'px' }" />
              <col style="width: 48px" />
            </colgroup>
            <TableHeader class="sticky top-0 bg-card/95 backdrop-blur z-10 shadow-sm border-b border-border">
              <TableRow class="hover:bg-transparent border-0">
                <TableHead 
                  v-for="col in visibleColumns" :key="col.key"
                  class="h-10 border-r px-0 text-xs font-semibold text-muted-foreground align-middle transition-colors select-none group/th relative bg-card"
                  :class="draggingColKey === col.key ? 'opacity-30' : ''"
                  @dragover.prevent="onColumnDragOver($event, col)"
                  @dragleave="onColumnDragLeave(col)"
                  @drop="onColumnDrop(col)"
                  @dragend="onColumnDragEnd"
                >
                  <div 
                    draggable="true"
                    @dragstart="onColumnDragStart($event, col)"
                    @dragend="onColumnDragEnd"
                    class="flex items-center w-full h-full px-4 cursor-grab active:cursor-grabbing transition-colors"
                    :class="resizingColKey === col.key ? 'bg-muted/30' : 'hover:bg-muted/30'"
                    title="Drag to reorder"
                  >
                    <!-- Sortable Area -->
                    <button
                      type="button"
                      @click="toggleSort(col.key as SortKey)"
                      class="appearance-none bg-transparent border-none text-left flex items-center justify-between flex-1 cursor-pointer min-w-0 h-full group/sort focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
                      :aria-label="`Sort by ${col.label}`"
                    >
                      <div class="flex items-center gap-2 min-w-0 text-foreground transition-colors">
                        <component :is="col.icon" class="w-3.5 h-3.5 shrink-0" />
                        <span class="truncate">{{ col.label }}</span>
                      </div>
                      
                      <!-- Sort Arrow -->
                      <div class="shrink-0 ml-1 flex items-center">
                        <ChevronUp v-if="sortKey === col.key && sortDir === 'asc'" class="w-3.5 h-3.5 text-primary" />
                        <ChevronDown v-else-if="sortKey === col.key && sortDir === 'desc'" class="w-3.5 h-3.5 text-primary" />
                        <ChevronsUpDown v-else class="w-3.5 h-3.5 text-foreground/0 group-hover/th:text-foreground/50 group-hover/sort:!text-foreground transition-colors" />
                      </div>
                    </button>
                  </div>
                  
                  <!-- Drop Indicators for Table Header -->
                  <div v-if="dragOverColKey === col.key && dragOverPosition === 'left'" class="absolute top-0 left-0 w-0.5 h-full bg-primary z-30 pointer-events-none"></div>
                  <div v-if="dragOverColKey === col.key && dragOverPosition === 'right'" class="absolute top-0 right-[-1px] w-0.5 h-full bg-primary z-30 pointer-events-none"></div>

                  <!-- Resizer Handle -->
                  <div 
                    class="absolute top-0 right-0 w-1.5 h-full cursor-col-resize transition-colors z-20"
                    :class="resizingColKey === col.key ? 'bg-primary opacity-100' : 'opacity-0 group-hover/th:opacity-100 group-hover/th:bg-primary/20 hover:!bg-primary'"
                    @pointerdown.stop.prevent="onResizeStart($event, col)"
                    @mousedown.stop.prevent
                  ></div>
                </TableHead>
                
                <TableHead class="h-10 px-3 text-xs font-semibold text-muted-foreground text-center align-middle p-0 border-l-0">
                  <span class="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              <TableRow v-if="filtered.length === 0">
                <TableCell :colspan="visibleColumns.length + 1" class="h-32 text-center">
                  <p class="text-sm text-muted-foreground">No doctors found for this view.</p>
                </TableCell>
              </TableRow>
              
              <TableRow v-for="d in filtered" :key="d.id" class="group border-b border-border hover:bg-foreground/[0.04] even:bg-foreground/[0.02] transition-colors">
                
                <TableCell 
                  v-for="col in visibleColumns" :key="col.key"
                  class="p-0 border-r overflow-hidden relative"
                  :class="{
                    'group/fee cursor-pointer hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-muted/30': col.key === 'sessionFeePercent'
                  }"
                  :tabindex="col.key === 'sessionFeePercent' ? 0 : undefined"
                  @click="col.key === 'sessionFeePercent' ? startEditFee(d) : null"
                  @keydown.enter="col.key === 'sessionFeePercent' ? startEditFee(d) : null"
                  :role="col.key === 'sessionFeePercent' ? 'button' : undefined"
                  :aria-label="col.key === 'sessionFeePercent' ? 'Edit Fee Percentage' : undefined"
                >
                  <template v-if="col.key === 'name'">
                     <div class="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-muted/50 h-full group/name" @click="navigateTo(`/organization/dashboard/doctors/${d.id}`)">
                      <Avatar class="size-8 rounded-md shadow-sm border border-border/50">
                        <AvatarFallback class="bg-primary/5 text-primary text-[11px] font-bold rounded-md">{{ d.initials }}</AvatarFallback>
                      </Avatar>
                       <div class="flex flex-col min-w-0 justify-center flex-1">
                         <span class="text-sm font-medium truncate text-foreground leading-tight">{{ d.name }}</span>
                         <span class="text-xs text-foreground/80 truncate leading-tight mt-0.5">{{ d.email }}</span>
                       </div>
                       <div class="w-6 h-6 rounded-md bg-muted/0 border border-transparent flex items-center justify-center opacity-0 group-hover/name:opacity-100 group-hover/name:bg-muted/50 group-hover/name:border-border/50 transition-all shrink-0">
                         <ArrowUpRight class="w-3.5 h-3.5 text-muted-foreground" />
                       </div>
                    </div>
                  </template>

                  <template v-else-if="col.key === 'specialty'">
                     <div class="px-4 py-2 text-sm text-foreground h-full flex items-center">{{ d.specialty }}</div>
                  </template>

                  <template v-else-if="col.key === 'status'">
                     <div class="px-4 py-2 h-full flex items-center">
                       <Badge variant="outline" :class="['rounded-full gap-1.5 text-xs font-medium h-6 px-2 shadow-none', statusMeta[d.status].badge]">
                          <span :class="['w-1.5 h-1.5 rounded-full', statusMeta[d.status].dot]" />
                          {{ statusMeta[d.status].label }}
                       </Badge>
                     </div>
                  </template>

                  <template v-else-if="col.key === 'patientCount'">
                     <div class="px-4 py-2 text-sm text-foreground tabular-nums h-full flex items-center">{{ d.patientCount }}</div>
                  </template>

                  <template v-else-if="col.key === 'sessionFeePercent'">
                     <div class="px-3 py-1.5 mx-1 my-1 h-[calc(100%-8px)] flex items-center justify-between rounded-md hover:bg-muted/50 border border-transparent hover:border-border/50 cursor-pointer transition-all group/fee" title="Click to edit fee" @click="openFeeModal(d)">
                       <Badge variant="secondary" class="rounded-full text-xs font-medium h-6 px-2.5 shadow-none border-transparent">
                         {{ d.sessionFeePercent }}%
                       </Badge>
                       <Pencil class="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/fee:opacity-100 transition-opacity" />
                     </div>
                  </template>
                </TableCell>
                
                <TableCell class="p-0">
                   <div class="px-2 py-1.5 h-full flex items-center justify-center">
                     <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <Button variant="ghost" size="icon" class="w-7 h-7 rounded-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
                            <MoreVertical class="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" class="w-44">
                          <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Doctor actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem class="gap-2 cursor-pointer text-sm" @click="navigateTo(`/organization/dashboard/doctors/${d.id}`)"><Eye class="w-4 h-4 text-muted-foreground" /> View profile</DropdownMenuItem>
                          <DropdownMenuItem class="gap-2 cursor-pointer text-sm" @click="openEdit(d)"><Pencil class="w-4 h-4 text-muted-foreground" /> Edit details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem v-if="d.status === 'active' || d.status === 'on-leave'" class="gap-2 cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50 text-sm" @click="deactivate(d.id)"><UserX class="w-4 h-4" /> Deactivate</DropdownMenuItem>
                          <DropdownMenuItem v-else class="gap-2 cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50 text-sm" @click="reactivate(d.id)"><UserCheck class="w-4 h-4" /> Reactivate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem class="gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 text-sm" @click="remove(d.id)"><Trash2 class="w-4 h-4" /> Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                   </div>
                </TableCell>
              </TableRow>
            </TableBody>
            
            <!-- Summary Footer -->
            <TableFooter class="bg-card sticky bottom-0">
              <TableRow class="hover:bg-transparent border-t border-border shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
                <TableCell 
                  v-for="col in visibleColumns" :key="col.key"
                  class="px-4 border-r py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                >
                  <template v-if="col.key === 'name'">
                     {{ filtered.length }} DOCTOR{{ filtered.length !== 1 ? 'S' : '' }}
                  </template>
                  <template v-else-if="col.key === 'status'">
                     {{ filtered.filter(d => d.status === 'active').length }} ACTIVE
                  </template>
                  <template v-else-if="col.key === 'patientCount'">
                     {{ filtered.reduce((acc, d) => acc + d.patientCount, 0) }} TOTAL
                  </template>
                  <template v-else-if="col.key === 'sessionFeePercent'">
                     {{ filtered.length ? Math.round(filtered.reduce((acc, d) => acc + d.sessionFeePercent, 0) / filtered.length) : 0 }}% AVG
                  </template>
                </TableCell>

                <TableCell class="p-0"></TableCell>
              </TableRow>
            </TableFooter>

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

      <DialogFooter class="p-6 border-t -mx-6 -mb-6 mt-4">
        <DialogClose as-child>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button @click="saveDoctor">Send invitation</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ── Invite Success Modal ──────────────────────────────────────────────── -->
  <Dialog v-model:open="inviteSuccessOpen">
    <DialogContent class="sm:max-w-sm text-center" :show-close="true">
      <DialogHeader class="items-center gap-3 pt-2">
        <!-- Green check circle -->
        <div class="w-14 h-14 rounded-full bg-emerald-900/60 flex items-center justify-center mx-auto">
          <svg class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <DialogTitle class="text-xl font-bold">Enviado</DialogTitle>
      </DialogHeader>

      <!-- Invitation row -->
      <div class="flex items-center justify-between gap-3 bg-muted/40 border border-border rounded-xl px-4 py-3 my-2 text-left">
        <div class="flex items-center gap-3 min-w-0">
          <svg class="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div class="min-w-0">
            <p class="text-sm font-medium text-foreground truncate">{{ invitedEmail }}</p>
            <p class="text-xs text-muted-foreground">Caduca en 31 días</p>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <span class="text-xs text-muted-foreground whitespace-nowrap">Invitado como médico</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <button class="text-muted-foreground hover:text-foreground transition-colors">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Recibirán un email para unirse a tu organización</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <DialogFooter class="flex-row justify-between gap-2 mt-1">
        <Button variant="outline" class="flex-1" @click="inviteMore">
          Invitar a más médicos
        </Button>
        <Button class="flex-1" @click="inviteDone">
          Listo
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ── Edit Fee Modal ─────────────────────────────────────────────────────── -->
  <Dialog :open="feeModalOpen" @update:open="val => feeModalOpen = val">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Session Fee</DialogTitle>
        <DialogDescription>
          Adjust the commission percentage for this doctor.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4 space-y-4" v-if="feeModalDoctor">
        <div class="space-y-2">
          <Label class="text-sm font-medium mb-1.5 block">Current Fee (%)</Label>
          <div class="relative">
            <Input
              :model-value="feeModalDoctor.sessionFeePercent"
              type="number"
              disabled
              class="pr-8"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">%</span>
          </div>
        </div>
        
        <div class="space-y-2">
          <Label for="fee-edit" class="text-sm font-medium mb-1.5 block">New Fee (%)</Label>
          <div class="relative">
            <Input
              id="fee-edit"
              v-model="feeModalValue"
              type="number"
              min="0"
              max="100"
              class="pr-8"
              @keydown.enter="initiateFeeSave"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">%</span>
          </div>
        </div>
      </div>

      <DialogFooter class="p-6 border-t -mx-6 -mb-6 mt-4">
        <Button variant="outline" @click="feeModalOpen = false">Cancel</Button>
        <Button @click="initiateFeeSave">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- ── Confirm Fee Change Dialog ────────────────────────────────────────── -->
  <AlertDialog :open="confirmFeeOpen" @update:open="val => { if (!val) cancelFeeSave() }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Confirm Fee Update</AlertDialogTitle>
        <AlertDialogDescription v-if="feeModalDoctor">
          Are you sure you want to change the session fee for <span class="font-semibold text-foreground">{{ feeModalDoctor.name }}</span> from {{ feeModalDoctor.sessionFeePercent }}% to <span class="font-semibold text-foreground">{{ feeModalValue }}%</span>?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="cancelFeeSave">Cancel</AlertDialogCancel>
        <AlertDialogAction @click="confirmFeeSave">Confirm Update</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
