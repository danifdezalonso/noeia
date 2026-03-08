<script setup lang="ts">
import {
  Plus, Search, Check, MoreHorizontal, ChevronUp, ChevronDown,
  CheckCircle2, Calendar, ListFilter, X, Pencil, Trash2,
  ShoppingCart, CalendarCheck, MessageCircle, FileText, Zap,
} from 'lucide-vue-next'
import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from 'date-fns'
import {
  Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

definePageMeta({ layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────────────────────

type TaskStatus   = 'todo' | 'in_progress' | 'done'
type TaskCategory = 'order' | 'coordinate' | 'communicate' | 'document' | 'action' | null

interface Task {
  id: string
  title: string
  patient: string | null
  category: TaskCategory
  status: TaskStatus
  createdAt: Date
  dueDate: Date | null
  done: boolean
}

// ── Category config ────────────────────────────────────────────────────────

const CATEGORIES: { id: TaskCategory; label: string; icon: Component; color: string }[] = [
  { id: 'order',       label: 'Order',       icon: ShoppingCart,  color: 'text-rose-500'   },
  { id: 'coordinate',  label: 'Coordinate',  icon: CalendarCheck, color: 'text-violet-500' },
  { id: 'communicate', label: 'Communicate', icon: MessageCircle, color: 'text-orange-500' },
  { id: 'document',    label: 'Document',    icon: FileText,      color: 'text-emerald-500'},
  { id: 'action',      label: 'Action',      icon: Zap,           color: 'text-sky-500'    },
]

// ── Seed data ──────────────────────────────────────────────────────────────

const tasks = ref<Task[]>([
  { id: '1', title: 'Review session notes for Elena Vasquez',  patient: 'Elena Vasquez',  category: 'document',    status: 'todo',        createdAt: new Date(Date.now() - 4 * 86400000), dueDate: new Date(Date.now() + 1 * 86400000),  done: false },
  { id: '2', title: 'Send referral letter to Dr. Kim',         patient: 'James Wilson',   category: 'communicate', status: 'in_progress', createdAt: new Date(Date.now() - 2 * 86400000), dueDate: new Date(Date.now() + 3 * 86400000),  done: false },
  { id: '3', title: 'Order PHQ-9 screening forms',             patient: null,             category: 'order',       status: 'todo',        createdAt: new Date(Date.now() - 7 * 86400000), dueDate: new Date(Date.now() - 1 * 86400000),  done: false },
  { id: '4', title: 'Coordinate appointment with psychologist',patient: 'Sofia Martinez', category: 'coordinate',  status: 'todo',        createdAt: new Date(Date.now() - 1 * 86400000), dueDate: new Date(Date.now() + 7 * 86400000),  done: false },
  { id: '5', title: 'Update treatment plan documentation',     patient: 'Carlos Rivera',  category: 'document',    status: 'todo',        createdAt: new Date(Date.now() - 3 * 86400000), dueDate: null,                                  done: false },
  { id: '6', title: 'Follow up on ADOS-2 assessment results',  patient: 'Noah Chen',      category: 'action',      status: 'todo',        createdAt: new Date(Date.now() - 5 * 86400000), dueDate: new Date(Date.now() + 2 * 86400000),  done: false },
  { id: '7', title: 'Call insurance provider re: billing',     patient: null,             category: 'communicate', status: 'in_progress', createdAt: new Date(Date.now() - 6 * 86400000), dueDate: null,                                  done: false },
  { id: '8', title: 'Schedule team supervision meeting',       patient: null,             category: 'coordinate',  status: 'todo',        createdAt: new Date(Date.now() - 2 * 86400000), dueDate: new Date(Date.now() + 5 * 86400000),  done: false },
])

// ── Filter / sort state ────────────────────────────────────────────────────

const search         = ref('')
const statusFilter   = ref<'todo' | 'in_progress' | 'done' | 'all'>('todo')
const categoryFilter = ref<TaskCategory | 'all'>('all')
const dateFilter     = ref<'all' | 'today' | 'week'>('all')
const sortCol        = ref<'title' | 'patient' | 'category' | 'createdAt' | 'dueDate'>('createdAt')
const sortDir        = ref<'asc' | 'desc'>('desc')

const showStatusDropdown   = ref(false)
const showCategoryDropdown = ref(false)
const showDateDropdown     = ref(false)
const contextMenuTaskId    = ref<string | null>(null)

// ── New-task dialog state ──────────────────────────────────────────────────

const dialogOpen       = ref(false)
const newTitle         = ref('')
const newPatient       = ref('')
const newCategory      = ref<TaskCategory>(null)
const newDueDate       = ref('')

function openDialog() {
  newTitle.value    = ''
  newPatient.value  = ''
  newCategory.value = null
  newDueDate.value  = ''
  dialogOpen.value  = true
}

function addTask() {
  if (!newTitle.value.trim()) return
  tasks.value.unshift({
    id: crypto.randomUUID(),
    title: newTitle.value.trim(),
    patient: newPatient.value.trim() || null,
    category: newCategory.value,
    status: 'todo',
    createdAt: new Date(),
    dueDate: newDueDate.value ? new Date(newDueDate.value) : null,
    done: false,
  })
  dialogOpen.value = false
}

// ── Computed ───────────────────────────────────────────────────────────────

const filtered = computed(() => {
  let list = tasks.value
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter(t => t.title.toLowerCase().includes(q) || (t.patient ?? '').toLowerCase().includes(q))
  if (statusFilter.value !== 'all') list = list.filter(t => t.status === statusFilter.value)
  if (categoryFilter.value !== 'all') list = list.filter(t => t.category === categoryFilter.value)
  if (dateFilter.value === 'today') {
    const today = new Date().toDateString()
    list = list.filter(t => t.createdAt.toDateString() === today)
  } else if (dateFilter.value === 'week') {
    const week = Date.now() - 7 * 86400000
    list = list.filter(t => t.createdAt.getTime() >= week)
  }
  list = [...list].sort((a, b) => {
    let va: string | number, vb: string | number
    if (sortCol.value === 'createdAt') { va = a.createdAt.getTime(); vb = b.createdAt.getTime() }
    else if (sortCol.value === 'dueDate') { va = a.dueDate?.getTime() ?? Infinity; vb = b.dueDate?.getTime() ?? Infinity }
    else if (sortCol.value === 'title')   { va = a.title.toLowerCase(); vb = b.title.toLowerCase() }
    else if (sortCol.value === 'patient') { va = a.patient ?? ''; vb = b.patient ?? '' }
    else                                  { va = a.category ?? ''; vb = b.category ?? '' }
    return sortDir.value === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0)
  })
  return list
})

const activeFiltersCount = computed(() =>
  (statusFilter.value !== 'todo' ? 1 : 0) +
  (categoryFilter.value !== 'all' ? 1 : 0) +
  (dateFilter.value !== 'all' ? 1 : 0),
)

// ── Actions ────────────────────────────────────────────────────────────────

function toggleSort(col: typeof sortCol.value) {
  if (sortCol.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortCol.value = col; sortDir.value = 'asc' }
}

function toggleDone(id: string) {
  const t = tasks.value.find(t => t.id === id)
  if (!t) return
  t.done   = !t.done
  t.status = t.done ? 'done' : 'todo'
}

function deleteTask(id: string) {
  tasks.value = tasks.value.filter(t => t.id !== id)
  contextMenuTaskId.value = null
}

function resetFilters() {
  statusFilter.value   = 'todo'
  categoryFilter.value = 'all'
  dateFilter.value     = 'all'
  search.value         = ''
}

function getCategoryConfig(id: TaskCategory) {
  return CATEGORIES.find(c => c.id === id) ?? null
}

function fmtCreated(d: Date) {
  return formatDistanceToNow(d, { addSuffix: true })
}

function fmtDue(d: Date | null): { label: string; cls: string } {
  if (!d) return { label: '—', cls: 'text-muted-foreground/50' }
  if (isToday(d))    return { label: 'Today',    cls: 'text-amber-600 dark:text-amber-400 font-medium' }
  if (isTomorrow(d)) return { label: 'Tomorrow', cls: 'text-foreground font-medium' }
  if (isPast(d))     return { label: format(d, 'MMM d'), cls: 'text-destructive font-medium' }
  return { label: format(d, 'MMM d'), cls: 'text-muted-foreground' }
}

const statusLabels: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done', all: 'All' }
const dateLabels:   Record<string, string> = { all: 'All', today: 'Today', week: 'This week' }

function closeDropdowns() {
  showCategoryDropdown.value = false
  showStatusDropdown.value   = false
  showDateDropdown.value     = false
  contextMenuTaskId.value    = null
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-background overflow-hidden" @click="closeDropdowns">

    <!-- Header -->
    <div class="shrink-0 flex items-start justify-between px-8 pt-7 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Tasks</h1>
        <p class="text-sm text-muted-foreground mt-0.5">Incomplete tasks will be archived after 30 days</p>
      </div>
      <Button class="flex items-center gap-1.5" @click="openDialog">
        <Plus class="w-4 h-4" />
        New task
      </Button>
    </div>

    <!-- Filter bar -->
    <div class="shrink-0 flex items-center gap-2 px-8 pb-4" @click.stop>

      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          v-model="search"
          type="text"
          placeholder="Search for a task or patient"
          class="w-64 h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <!-- Status filter -->
      <div class="relative">
        <button
          class="flex items-center gap-2 h-9 px-3 text-sm border border-border rounded-lg hover:bg-accent transition-colors bg-background"
          @click.stop="showStatusDropdown = !showStatusDropdown; showCategoryDropdown = false; showDateDropdown = false"
        >
          <CheckCircle2 class="w-3.5 h-3.5 text-muted-foreground" />
          <span class="font-medium text-foreground">Status</span>
          <span class="px-1.5 py-0.5 text-xs font-medium bg-muted rounded text-muted-foreground">{{ statusLabels[statusFilter] }}</span>
        </button>
        <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-1" leave-active-class="transition duration-75 ease-in" leave-to-class="opacity-0 scale-95 -translate-y-1">
          <div v-if="showStatusDropdown" class="absolute top-full left-0 mt-1.5 w-44 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
            <button v-for="s in ['todo', 'in_progress', 'done', 'all']" :key="s" class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors" :class="statusFilter === s ? 'text-primary font-medium' : 'text-foreground'" @click="statusFilter = s as typeof statusFilter; showStatusDropdown = false">
              {{ statusLabels[s] }}
              <Check v-if="statusFilter === s" class="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </Transition>
      </div>

      <!-- Category filter -->
      <div class="relative">
        <button
          class="flex items-center gap-2 h-9 px-3 text-sm border border-border rounded-lg hover:bg-accent transition-colors bg-background"
          @click.stop="showCategoryDropdown = !showCategoryDropdown; showStatusDropdown = false; showDateDropdown = false"
        >
          <ListFilter class="w-3.5 h-3.5 text-muted-foreground" />
          <span class="font-medium text-foreground">Category</span>
          <span class="px-1.5 py-0.5 text-xs font-medium bg-muted rounded text-muted-foreground">{{ categoryFilter === 'all' ? 'All' : getCategoryConfig(categoryFilter as TaskCategory)?.label }}</span>
        </button>
        <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-1" leave-active-class="transition duration-75 ease-in" leave-to-class="opacity-0 scale-95 -translate-y-1">
          <div v-if="showCategoryDropdown" class="absolute top-full left-0 mt-1.5 w-48 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
            <button class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors" :class="categoryFilter === 'all' ? 'text-primary font-medium' : 'text-foreground'" @click="categoryFilter = 'all'; showCategoryDropdown = false">
              All
              <Check v-if="categoryFilter === 'all'" class="w-3.5 h-3.5 text-primary" />
            </button>
            <button v-for="cat in CATEGORIES" :key="cat.id" class="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors" :class="categoryFilter === cat.id ? 'text-primary font-medium' : 'text-foreground'" @click="categoryFilter = cat.id; showCategoryDropdown = false">
              <component :is="cat.icon" :class="['w-4 h-4', cat.color]" />
              {{ cat.label }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- Date filter -->
      <div class="relative">
        <button
          class="flex items-center gap-2 h-9 px-3 text-sm border border-border rounded-lg hover:bg-accent transition-colors bg-background"
          @click.stop="showDateDropdown = !showDateDropdown; showStatusDropdown = false; showCategoryDropdown = false"
        >
          <Calendar class="w-3.5 h-3.5 text-muted-foreground" />
          <span class="font-medium text-foreground">Date</span>
          <span class="px-1.5 py-0.5 text-xs font-medium bg-muted rounded text-muted-foreground">{{ dateLabels[dateFilter] }}</span>
        </button>
        <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-1" leave-active-class="transition duration-75 ease-in" leave-to-class="opacity-0 scale-95 -translate-y-1">
          <div v-if="showDateDropdown" class="absolute top-full left-0 mt-1.5 w-40 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
            <button v-for="d in ['all', 'today', 'week']" :key="d" class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors" :class="dateFilter === d ? 'text-primary font-medium' : 'text-foreground'" @click="dateFilter = d as typeof dateFilter; showDateDropdown = false">
              {{ dateLabels[d] }}
              <Check v-if="dateFilter === d" class="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </Transition>
      </div>

      <!-- Reset filters -->
      <button v-if="activeFiltersCount > 0 || search" class="flex items-center gap-1.5 h-9 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors" @click.stop="resetFilters">
        Reset filters
        <X class="w-3.5 h-3.5" />
      </button>

    </div>

    <!-- Table -->
    <div class="flex-1 overflow-y-auto px-8 pb-6">
      <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/50 hover:bg-muted/50">
              <TableHead class="w-10 pl-4" />
              <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <button class="flex items-center gap-1 hover:text-foreground transition-colors" @click="toggleSort('title')">
                  Task title
                  <component :is="sortCol === 'title' && sortDir === 'asc' ? ChevronUp : ChevronDown" class="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                <button class="flex items-center gap-1 hover:text-foreground transition-colors" @click="toggleSort('patient')">
                  Patient
                  <component :is="sortCol === 'patient' && sortDir === 'asc' ? ChevronUp : ChevronDown" class="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                <button class="flex items-center gap-1 hover:text-foreground transition-colors" @click="toggleSort('category')">
                  Category
                  <component :is="sortCol === 'category' && sortDir === 'asc' ? ChevronUp : ChevronDown" class="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                <button class="flex items-center gap-1 hover:text-foreground transition-colors" @click="toggleSort('dueDate')">
                  Due
                  <component :is="sortCol === 'dueDate' && sortDir === 'asc' ? ChevronUp : ChevronDown" class="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                <button class="flex items-center gap-1 hover:text-foreground transition-colors" @click="toggleSort('createdAt')">
                  Created
                  <component :is="sortCol === 'createdAt' && sortDir === 'asc' ? ChevronUp : ChevronDown" class="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead class="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableEmpty v-if="!filtered.length">
              <div class="py-16 text-center space-y-2">
                <p class="text-sm text-muted-foreground">No tasks found.</p>
                <button v-if="activeFiltersCount > 0 || search" class="text-sm text-primary hover:underline" @click="resetFilters">Clear filters</button>
                <button v-else class="text-sm text-primary hover:underline" @click="openDialog">Create your first task</button>
              </div>
            </TableEmpty>
            <TableRow
              v-for="task in filtered"
              :key="task.id"
              class="hover:bg-accent/50 transition-colors group"
            >
              <!-- Checkbox -->
              <TableCell class="w-10 pl-4">
                <button
                  :class="['w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all', task.done ? 'bg-primary border-primary' : 'border-border hover:border-primary']"
                  @click="toggleDone(task.id)"
                >
                  <Check v-if="task.done" class="w-2.5 h-2.5 text-primary-foreground" />
                </button>
              </TableCell>

              <!-- Task title -->
              <TableCell class="whitespace-nowrap">
                <span :class="['text-sm font-medium', task.done ? 'line-through text-muted-foreground' : 'text-foreground']">
                  {{ task.title }}
                </span>
              </TableCell>

              <!-- Patient -->
              <TableCell class="text-sm text-muted-foreground whitespace-nowrap">{{ task.patient ?? '-' }}</TableCell>

              <!-- Category -->
              <TableCell class="whitespace-nowrap">
                <span v-if="task.category && getCategoryConfig(task.category)" class="inline-flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-md px-2 py-1 bg-muted/40">
                  <component :is="getCategoryConfig(task.category)!.icon" :class="['w-3.5 h-3.5', getCategoryConfig(task.category)!.color]" />
                  {{ getCategoryConfig(task.category)!.label }}
                </span>
                <span v-else class="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 border border-dashed border-border/60 rounded-md px-2 py-1">
                  <ListFilter class="w-3 h-3" />
                  No category
                </span>
              </TableCell>

              <!-- Due date -->
              <TableCell class="whitespace-nowrap">
                <span :class="['text-sm', fmtDue(task.dueDate).cls]">{{ fmtDue(task.dueDate).label }}</span>
              </TableCell>

              <!-- Created -->
              <TableCell class="text-sm text-muted-foreground whitespace-nowrap">{{ fmtCreated(task.createdAt) }}</TableCell>

              <!-- Actions -->
              <TableCell class="w-12">
                <div class="relative flex justify-end">
                  <button
                    class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                    @click.stop="contextMenuTaskId = contextMenuTaskId === task.id ? null : task.id"
                  >
                    <MoreHorizontal class="w-4 h-4" />
                  </button>
                  <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-75 ease-in" leave-to-class="opacity-0 scale-95">
                    <div v-if="contextMenuTaskId === task.id" class="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden" style="transform-origin: top right">
                      <button class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                        <Pencil class="w-3.5 h-3.5 text-muted-foreground" />
                        Edit task
                      </button>
                      <button class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors" @click="deleteTask(task.id)">
                        <Trash2 class="w-3.5 h-3.5" />
                        Delete task
                      </button>
                    </div>
                  </Transition>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

  </div>

  <!-- ── New task dialog ──────────────────────────────────────────────────── -->
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>New task</DialogTitle>
        <DialogDescription>Add a task to your list. Fill in the details below.</DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">

        <!-- Title -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Task title <span class="text-destructive">*</span></label>
          <Input
            v-model="newTitle"
            placeholder="e.g. Review session notes for…"
            @keydown.enter.exact.prevent="addTask"
          />
        </div>

        <!-- Patient -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Patient <span class="text-muted-foreground font-normal">(optional)</span></label>
          <Input v-model="newPatient" placeholder="Patient name" />
        </div>

        <!-- Category -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Category</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="cat in CATEGORIES"
              :key="cat.id"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                newCategory === cat.id
                  ? 'border-primary bg-primary/5 text-foreground font-medium'
                  : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-accent hover:text-foreground',
              ]"
              @click="newCategory = newCategory === cat.id ? null : cat.id"
            >
              <component :is="cat.icon" :class="['w-3.5 h-3.5 shrink-0', cat.color]" />
              <span class="truncate text-xs">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- Due date -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Due date <span class="text-muted-foreground font-normal">(optional)</span></label>
          <input
            v-model="newDueDate"
            type="date"
            class="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

      </div>

      <DialogFooter>
        <Button variant="outline" @click="dialogOpen = false">Cancel</Button>
        <Button :disabled="!newTitle.trim()" @click="addTask">Add task</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
