<script setup lang="ts">
import {
  ArrowUpDown, ArrowUp, ArrowDown, Plus, X,
  Check, Settings2, MoreHorizontal, PlusCircle,
  Circle, Timer, CheckCircle2, XCircle, Signal,
  ArrowRight, BookOpen, PenLine, Brain, Dumbbell, Eye,
} from 'lucide-vue-next'
import { Input }    from '~/components/ui/input'
import { Button }   from '~/components/ui/button'
import { Badge }    from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import { Separator } from '~/components/ui/separator'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '~/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '~/components/ui/command'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '~/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'

// ── Types ─────────────────────────────────────────────────────────────────────

type TaskStatus   = 'pendiente' | 'en-progreso' | 'completada' | 'cancelada'
type TaskPriority = 'baja' | 'media' | 'alta'
type TaskLabel    = 'Autorregistro' | 'Psicoeducación' | 'Ejercicio' | 'Lectura' | 'Tarea clínica'

interface Task {
  id:          string
  label:       TaskLabel
  title:       string
  status:      TaskStatus
  priority:    TaskPriority
  dueDate:     string
  assignedBy:  string
  session:     number
}

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: typeof Circle; class: string }> = {
  'pendiente':   { label: 'Pendiente',    icon: Circle,       class: 'text-muted-foreground' },
  'en-progreso': { label: 'En progreso',  icon: Timer,        class: 'text-blue-500' },
  'completada':  { label: 'Completada',   icon: CheckCircle2, class: 'text-emerald-500' },
  'cancelada':   { label: 'Cancelada',    icon: XCircle,      class: 'text-rose-400' },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; icon: typeof Signal; class: string }> = {
  'baja':  { label: 'Baja',  icon: ArrowDown,  class: 'text-muted-foreground' },
  'media': { label: 'Media', icon: ArrowRight, class: 'text-amber-500' },
  'alta':  { label: 'Alta',  icon: ArrowUp,    class: 'text-rose-500' },
}

const LABEL_ICON: Record<TaskLabel, typeof BookOpen> = {
  'Autorregistro':  PenLine,
  'Psicoeducación': BookOpen,
  'Ejercicio':      Dumbbell,
  'Lectura':        Eye,
  'Tarea clínica':  Brain,
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const TASKS: Task[] = [
  { id: 'TASK-001', label: 'Autorregistro',  title: 'Registro diario de pensamientos automáticos (formato ABCDe)',              status: 'completada',  priority: 'alta',  dueDate: '2026-04-10', assignedBy: 'Dra. Elena Voss', session: 6 },
  { id: 'TASK-002', label: 'Ejercicio',       title: 'Técnica de respiración 4-7-8 antes de dormir durante 7 días',             status: 'completada',  priority: 'alta',  dueDate: '2026-04-10', assignedBy: 'Dra. Elena Voss', session: 6 },
  { id: 'TASK-003', label: 'Lectura',         title: 'Lectura del capítulo 3 del libro "El poder del ahora"',                   status: 'en-progreso', priority: 'baja',  dueDate: '2026-04-24', assignedBy: 'Dra. Elena Voss', session: 6 },
  { id: 'TASK-004', label: 'Ejercicio',       title: 'Práctica de mindfulness MBSR 10 minutos diarios',                        status: 'completada',  priority: 'media', dueDate: '2026-03-26', assignedBy: 'Dra. Elena Voss', session: 5 },
  { id: 'TASK-005', label: 'Autorregistro',   title: 'Agenda de actividades placenteras — mínimo 2 por semana',                 status: 'completada',  priority: 'media', dueDate: '2026-03-26', assignedBy: 'Dra. Elena Voss', session: 5 },
  { id: 'TASK-006', label: 'Autorregistro',   title: 'Registro de situaciones ansiógenas de la semana con pensamientos asociados', status: 'completada', priority: 'alta', dueDate: '2026-03-05', assignedBy: 'Dr. Marco Silva', session: 4 },
  { id: 'TASK-007', label: 'Ejercicio',       title: 'Ejercicio de defusión cognitiva: "Las hojas en el río" (audio guiado)',  status: 'cancelada',   priority: 'media', dueDate: '2026-03-05', assignedBy: 'Dr. Marco Silva', session: 4 },
  { id: 'TASK-008', label: 'Psicoeducación',  title: 'Leer folleto psicoeducativo sobre el trastorno de ansiedad generalizada', status: 'completada', priority: 'alta',  dueDate: '2026-02-19', assignedBy: 'Dra. Elena Voss', session: 2 },
  { id: 'TASK-009', label: 'Autorregistro',   title: 'Identificar 3 situaciones de ansiedad y anotar pensamientos asociados', status: 'completada',   priority: 'alta',  dueDate: '2026-02-19', assignedBy: 'Dra. Elena Voss', session: 2 },
  { id: 'TASK-010', label: 'Autorregistro',   title: 'Autorregistro de situaciones ansiosas durante 2 semanas',               status: 'completada',   priority: 'media', dueDate: '2026-02-05', assignedBy: 'Dra. Elena Voss', session: 1 },
  { id: 'TASK-011', label: 'Tarea clínica',   title: 'Traer listado de medicación actual a la próxima sesión',                status: 'completada',   priority: 'alta',  dueDate: '2026-01-22', assignedBy: 'Dra. Elena Voss', session: 1 },
  { id: 'TASK-012', label: 'Psicoeducación',  title: 'Revisar material sobre técnicas de regulación emocional',               status: 'pendiente',    priority: 'baja',  dueDate: '2026-04-24', assignedBy: 'Dra. Elena Voss', session: 7 },
]

// ── State ─────────────────────────────────────────────────────────────────────

const search         = ref('')
const statusFilter   = ref<Set<TaskStatus>>(new Set())
const priorityFilter = ref<Set<TaskPriority>>(new Set())
const selectedRows   = ref<Set<string>>(new Set())
const pageSize       = ref(10)
const currentPage    = ref(1)
const sortCol        = ref<keyof Task | null>(null)
const sortDir        = ref<'asc' | 'desc'>('asc')

// visible columns
const visibleCols = reactive({
  label:      true,
  title:      true,
  status:     true,
  priority:   true,
  dueDate:    true,
  assignedBy: false,
  session:    false,
})

type ColKey = keyof typeof visibleCols
const COL_LABELS: Record<ColKey, string> = {
  label: 'Etiqueta', title: 'Tarea', status: 'Estado',
  priority: 'Prioridad', dueDate: 'Vencimiento',
  assignedBy: 'Asignado por', session: 'Sesión',
}

// ── Derived ───────────────────────────────────────────────────────────────────

const filtered = computed(() => {
  let list = [...TASKS]
  if (search.value.trim())
    list = list.filter(t => t.title.toLowerCase().includes(search.value.toLowerCase()))
  if (statusFilter.value.size)
    list = list.filter(t => statusFilter.value.has(t.status))
  if (priorityFilter.value.size)
    list = list.filter(t => priorityFilter.value.has(t.priority))
  if (sortCol.value) {
    const col = sortCol.value
    list.sort((a, b) => {
      const av = a[col] as string
      const bv = b[col] as string
      return sortDir.value === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }
  return list
})

const pageCount  = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paginated  = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const isFiltered = computed(() => search.value || statusFilter.value.size || priorityFilter.value.size)

const allPageSelected = computed(() =>
  paginated.value.length > 0 && paginated.value.every(t => selectedRows.value.has(t.id))
)

// ── Actions ───────────────────────────────────────────────────────────────────

function toggleSort(col: keyof Task) {
  if (sortCol.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortCol.value = col; sortDir.value = 'asc' }
}

function toggleStatus(s: TaskStatus) {
  const f = new Set(statusFilter.value)
  f.has(s) ? f.delete(s) : f.add(s)
  statusFilter.value = f
  currentPage.value = 1
}

function togglePriority(p: TaskPriority) {
  const f = new Set(priorityFilter.value)
  f.has(p) ? f.delete(p) : f.add(p)
  priorityFilter.value = f
  currentPage.value = 1
}

function resetFilters() {
  search.value = ''
  statusFilter.value = new Set()
  priorityFilter.value = new Set()
  currentPage.value = 1
}

function toggleRow(id: string) {
  const s = new Set(selectedRows.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selectedRows.value = s
}

function toggleAllPage(checked: boolean) {
  const s = new Set(selectedRows.value)
  paginated.value.forEach(t => checked ? s.add(t.id) : s.delete(t.id))
  selectedRows.value = s
}

watch([search, statusFilter, priorityFilter], () => { currentPage.value = 1 })
</script>

<template>
  <div class="space-y-4">

    <!-- ── Header ──────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold tracking-tight">Tareas</h2>
        <p class="text-sm text-muted-foreground">Gestiona las tareas terapéuticas asignadas a la paciente.</p>
      </div>
      <Button size="sm" class="gap-1.5">
        <Plus class="w-3.5 h-3.5" /> Nueva tarea
      </Button>
    </div>

    <!-- ── Toolbar ─────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <div class="flex flex-1 items-center gap-2 flex-wrap">

        <!-- Search -->
        <Input
          v-model="search"
          placeholder="Filtrar tareas..."
          class="h-8 w-[200px] lg:w-[280px] text-sm"
        />

        <!-- Status faceted filter -->
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" size="sm" class="h-8 border-dashed gap-1.5 text-xs">
              <PlusCircle class="w-3.5 h-3.5" />
              Estado
              <template v-if="statusFilter.size > 0">
                <Separator orientation="vertical" class="mx-0.5 h-4" />
                <Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
                  {{ statusFilter.size }}
                </Badge>
                <div class="hidden lg:flex gap-1">
                  <template v-if="statusFilter.size > 2">
                    <Badge variant="secondary" class="rounded-sm px-1 font-normal">{{ statusFilter.size }} seleccionados</Badge>
                  </template>
                  <template v-else>
                    <Badge
                      v-for="s in statusFilter"
                      :key="s"
                      variant="secondary"
                      class="rounded-sm px-1 font-normal"
                    >
                      {{ STATUS_CONFIG[s].label }}
                    </Badge>
                  </template>
                </div>
              </template>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-[180px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Estado..." />
              <CommandList>
                <CommandEmpty>Sin resultados.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    v-for="(cfg, val) in STATUS_CONFIG"
                    :key="val"
                    :value="val"
                    @select="toggleStatus(val as TaskStatus)"
                  >
                    <div
                      class="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary"
                      :class="statusFilter.has(val as TaskStatus) ? 'bg-primary text-primary-foreground' : 'opacity-50'"
                    >
                      <Check v-if="statusFilter.has(val as TaskStatus)" class="w-3 h-3" />
                    </div>
                    <component :is="cfg.icon" class="mr-2 w-3.5 h-3.5" :class="cfg.class" />
                    <span class="text-sm">{{ cfg.label }}</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <!-- Priority faceted filter -->
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" size="sm" class="h-8 border-dashed gap-1.5 text-xs">
              <PlusCircle class="w-3.5 h-3.5" />
              Prioridad
              <template v-if="priorityFilter.size > 0">
                <Separator orientation="vertical" class="mx-0.5 h-4" />
                <Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
                  {{ priorityFilter.size }}
                </Badge>
                <div class="hidden lg:flex gap-1">
                  <template v-if="priorityFilter.size > 2">
                    <Badge variant="secondary" class="rounded-sm px-1 font-normal">{{ priorityFilter.size }} seleccionados</Badge>
                  </template>
                  <template v-else>
                    <Badge
                      v-for="p in priorityFilter"
                      :key="p"
                      variant="secondary"
                      class="rounded-sm px-1 font-normal"
                    >
                      {{ PRIORITY_CONFIG[p].label }}
                    </Badge>
                  </template>
                </div>
              </template>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-[160px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Prioridad..." />
              <CommandList>
                <CommandEmpty>Sin resultados.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    v-for="(cfg, val) in PRIORITY_CONFIG"
                    :key="val"
                    :value="val"
                    @select="togglePriority(val as TaskPriority)"
                  >
                    <div
                      class="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary"
                      :class="priorityFilter.has(val as TaskPriority) ? 'bg-primary text-primary-foreground' : 'opacity-50'"
                    >
                      <Check v-if="priorityFilter.has(val as TaskPriority)" class="w-3 h-3" />
                    </div>
                    <component :is="cfg.icon" class="mr-2 w-3.5 h-3.5" :class="cfg.class" />
                    <span class="text-sm">{{ cfg.label }}</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <!-- Reset -->
        <Button v-if="isFiltered" variant="ghost" size="sm" class="h-8 px-2 text-xs gap-1" @click="resetFilters">
          Restablecer <X class="w-3.5 h-3.5" />
        </Button>
      </div>

      <!-- View options (column toggle) -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="h-8 gap-1.5 text-xs ml-auto">
            <Settings2 class="w-3.5 h-3.5" /> Columnas
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-[160px]">
          <template v-for="(visible, col) in visibleCols" :key="col">
            <DropdownMenuCheckboxItem
              v-if="col !== 'title'"
              :checked="visible"
              class="capitalize text-sm"
              @update:checked="visibleCols[col as ColKey] = $event"
            >
              {{ COL_LABELS[col as ColKey] }}
            </DropdownMenuCheckboxItem>
          </template>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- ── Table ───────────────────────────────────────────────────── -->
    <div class="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/30 hover:bg-muted/30">
            <!-- Select all -->
            <TableHead class="w-10 px-3">
              <Checkbox
                :checked="allPageSelected"
                @update:checked="toggleAllPage"
              />
            </TableHead>
            <!-- ID -->
            <TableHead class="w-[90px]">
              <button class="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground" @click="toggleSort('id')">
                ID
                <ArrowUpDown v-if="sortCol !== 'id'" class="w-3 h-3 opacity-50" />
                <ArrowUp   v-else-if="sortDir === 'asc'"  class="w-3 h-3" />
                <ArrowDown v-else                          class="w-3 h-3" />
              </button>
            </TableHead>
            <!-- Label -->
            <TableHead v-if="visibleCols.label" class="w-[130px] text-xs font-medium text-muted-foreground">Etiqueta</TableHead>
            <!-- Title -->
            <TableHead class="text-xs font-medium text-muted-foreground">
              <button class="flex items-center gap-1 hover:text-foreground" @click="toggleSort('title')">
                Tarea
                <ArrowUpDown v-if="sortCol !== 'title'" class="w-3 h-3 opacity-50" />
                <ArrowUp   v-else-if="sortDir === 'asc'"  class="w-3 h-3" />
                <ArrowDown v-else                          class="w-3 h-3" />
              </button>
            </TableHead>
            <!-- Status -->
            <TableHead v-if="visibleCols.status" class="w-[130px]">
              <button class="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground" @click="toggleSort('status')">
                Estado
                <ArrowUpDown v-if="sortCol !== 'status'" class="w-3 h-3 opacity-50" />
                <ArrowUp   v-else-if="sortDir === 'asc'"  class="w-3 h-3" />
                <ArrowDown v-else                          class="w-3 h-3" />
              </button>
            </TableHead>
            <!-- Priority -->
            <TableHead v-if="visibleCols.priority" class="w-[110px]">
              <button class="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground" @click="toggleSort('priority')">
                Prioridad
                <ArrowUpDown v-if="sortCol !== 'priority'" class="w-3 h-3 opacity-50" />
                <ArrowUp   v-else-if="sortDir === 'asc'"  class="w-3 h-3" />
                <ArrowDown v-else                          class="w-3 h-3" />
              </button>
            </TableHead>
            <!-- Due date -->
            <TableHead v-if="visibleCols.dueDate" class="w-[110px]">
              <button class="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground" @click="toggleSort('dueDate')">
                Vencimiento
                <ArrowUpDown v-if="sortCol !== 'dueDate'" class="w-3 h-3 opacity-50" />
                <ArrowUp   v-else-if="sortDir === 'asc'"  class="w-3 h-3" />
                <ArrowDown v-else                          class="w-3 h-3" />
              </button>
            </TableHead>
            <!-- Assigned by -->
            <TableHead v-if="visibleCols.assignedBy" class="w-[150px] text-xs font-medium text-muted-foreground">Asignado por</TableHead>
            <!-- Session -->
            <TableHead v-if="visibleCols.session" class="w-[80px] text-xs font-medium text-muted-foreground">Sesión</TableHead>
            <!-- Actions -->
            <TableHead class="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="task in paginated"
            :key="task.id"
            :data-state="selectedRows.has(task.id) ? 'selected' : undefined"
            class="group"
          >
            <!-- Checkbox -->
            <TableCell class="px-3">
              <Checkbox
                :checked="selectedRows.has(task.id)"
                @update:checked="toggleRow(task.id)"
              />
            </TableCell>
            <!-- ID -->
            <TableCell class="font-mono text-xs text-muted-foreground">{{ task.id }}</TableCell>
            <!-- Label -->
            <TableCell v-if="visibleCols.label">
              <Badge variant="outline" class="gap-1.5 font-normal text-xs">
                <component :is="LABEL_ICON[task.label]" class="w-3 h-3" />
                {{ task.label }}
              </Badge>
            </TableCell>
            <!-- Title -->
            <TableCell class="max-w-[360px]">
              <span
                class="font-medium text-sm truncate block"
                :class="task.status === 'completada' ? 'line-through text-muted-foreground' : 'text-foreground'"
              >
                {{ task.title }}
              </span>
            </TableCell>
            <!-- Status -->
            <TableCell v-if="visibleCols.status">
              <div class="flex items-center gap-1.5">
                <component
                  :is="STATUS_CONFIG[task.status].icon"
                  class="w-3.5 h-3.5 shrink-0"
                  :class="STATUS_CONFIG[task.status].class"
                />
                <span class="text-xs text-muted-foreground">{{ STATUS_CONFIG[task.status].label }}</span>
              </div>
            </TableCell>
            <!-- Priority -->
            <TableCell v-if="visibleCols.priority">
              <div class="flex items-center gap-1.5">
                <component
                  :is="PRIORITY_CONFIG[task.priority].icon"
                  class="w-3.5 h-3.5 shrink-0"
                  :class="PRIORITY_CONFIG[task.priority].class"
                />
                <span class="text-xs text-muted-foreground">{{ PRIORITY_CONFIG[task.priority].label }}</span>
              </div>
            </TableCell>
            <!-- Due date -->
            <TableCell v-if="visibleCols.dueDate" class="text-xs text-muted-foreground">
              {{ task.dueDate }}
            </TableCell>
            <!-- Assigned by -->
            <TableCell v-if="visibleCols.assignedBy" class="text-xs text-muted-foreground">
              {{ task.assignedBy }}
            </TableCell>
            <!-- Session -->
            <TableCell v-if="visibleCols.session" class="text-xs text-muted-foreground">
              #{{ task.session }}
            </TableCell>
            <!-- Row actions -->
            <TableCell class="px-2">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    class="h-7 w-7 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal class="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-[160px]">
                  <DropdownMenuItem class="text-sm">Editar</DropdownMenuItem>
                  <DropdownMenuItem class="text-sm">Marcar completada</DropdownMenuItem>
                  <DropdownMenuItem class="text-sm">Duplicar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-sm text-destructive focus:text-destructive">Eliminar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>

          <!-- Empty state -->
          <TableRow v-if="paginated.length === 0">
            <TableCell :colspan="10" class="h-24 text-center text-sm text-muted-foreground">
              No hay tareas que coincidan con los filtros.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- ── Pagination ──────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-4 text-sm text-muted-foreground flex-wrap">
      <!-- Selection count -->
      <span class="text-xs">
        {{ selectedRows.size }} de {{ filtered.length }} fila(s) seleccionada(s)
      </span>

      <div class="flex items-center gap-4 ml-auto flex-wrap justify-end">
        <!-- Page size -->
        <div class="flex items-center gap-2 text-xs">
          Filas por página
          <Select :model-value="String(pageSize)" @update:model-value="v => { pageSize = Number(v); currentPage = 1 }">
            <SelectTrigger class="h-7 w-[64px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="n in [5, 10, 20, 50]" :key="n" :value="String(n)" class="text-xs">{{ n }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Page info + nav -->
        <div class="flex items-center gap-2 text-xs">
          <span>Página {{ currentPage }} de {{ pageCount }}</span>
          <div class="flex gap-1">
            <Button variant="outline" size="icon-sm" class="h-7 w-7" :disabled="currentPage <= 1" @click="currentPage = 1">
              <span class="sr-only">Primera</span>«
            </Button>
            <Button variant="outline" size="icon-sm" class="h-7 w-7" :disabled="currentPage <= 1" @click="currentPage--">
              <span class="sr-only">Anterior</span>‹
            </Button>
            <Button variant="outline" size="icon-sm" class="h-7 w-7" :disabled="currentPage >= pageCount" @click="currentPage++">
              <span class="sr-only">Siguiente</span>›
            </Button>
            <Button variant="outline" size="icon-sm" class="h-7 w-7" :disabled="currentPage >= pageCount" @click="currentPage = pageCount">
              <span class="sr-only">Última</span>»
            </Button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
