<script setup lang="ts">
import {
  Upload, FileText, FileImage, File, MoreHorizontal,
  Download, Trash2, Eye, LayoutGrid, List, Search,
  X, FolderOpen,
} from 'lucide-vue-next'
import { Button }  from '~/components/ui/button'
import { Badge }   from '~/components/ui/badge'
import { Input }   from '~/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

// ── Types ─────────────────────────────────────────────────────────────────────

type FileCategory = 'Consentimiento' | 'Evaluación' | 'Informe' | 'Sesión' | 'Otro'
type ViewMode = 'grid' | 'list'

interface PatientFile {
  id:         string
  name:       string
  size:       string
  sizeBytes:  number
  type:       string   // mime-like: 'pdf' | 'doc' | 'image'
  category:   FileCategory
  uploadedAt: string
  uploadedBy: string
}

// ── Config ────────────────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<FileCategory, string> = {
  'Consentimiento': 'bg-teal-50 text-teal-700 border-teal-200',
  'Evaluación':     'bg-violet-50 text-violet-700 border-violet-200',
  'Informe':        'bg-blue-50 text-blue-700 border-blue-200',
  'Sesión':         'bg-amber-50 text-amber-700 border-amber-200',
  'Otro':           'bg-muted text-muted-foreground border-border',
}

const ALL_CATEGORIES: FileCategory[] = ['Consentimiento', 'Evaluación', 'Informe', 'Sesión', 'Otro']

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockFiles: PatientFile[] = [
  { id: 'f1',  name: 'Consentimiento_Informado_Sofia.pdf',      size: '245 KB',  sizeBytes: 245000,  type: 'pdf',   category: 'Consentimiento', uploadedAt: '2026-01-10', uploadedBy: 'Dra. Elena Voss' },
  { id: 'f2',  name: 'Ficha_Paciente_Inicial.pdf',              size: '112 KB',  sizeBytes: 112000,  type: 'pdf',   category: 'Consentimiento', uploadedAt: '2026-01-10', uploadedBy: 'Dra. Elena Voss' },
  { id: 'f3',  name: 'Escalas_Evaluacion_GAD7_PHQ9.pdf',        size: '180 KB',  sizeBytes: 180000,  type: 'pdf',   category: 'Evaluación',     uploadedAt: '2026-01-22', uploadedBy: 'Dra. Elena Voss' },
  { id: 'f4',  name: 'Plan_Tratamiento_Sofia_v1.pdf',           size: '215 KB',  sizeBytes: 215000,  type: 'pdf',   category: 'Informe',        uploadedAt: '2026-02-05', uploadedBy: 'Dra. Elena Voss' },
  { id: 'f5',  name: 'Folleto_Psicoeducacion_TAG.pdf',          size: '89 KB',   sizeBytes: 89000,   type: 'pdf',   category: 'Sesión',         uploadedAt: '2026-02-05', uploadedBy: 'Dra. Elena Voss' },
  { id: 'f6',  name: 'Material_Defusion_Cognitiva.pdf',         size: '340 KB',  sizeBytes: 340000,  type: 'pdf',   category: 'Sesión',         uploadedAt: '2026-03-05', uploadedBy: 'Dr. Marco Silva' },
  { id: 'f7',  name: 'Registro_Pensamientos_Semana7.pdf',       size: '128 KB',  sizeBytes: 128000,  type: 'pdf',   category: 'Sesión',         uploadedAt: '2026-04-10', uploadedBy: 'Dra. Elena Voss' },
  { id: 'f8',  name: 'Evaluacion_STAI_Marzo2026.pdf',           size: '95 KB',   sizeBytes: 95000,   type: 'pdf',   category: 'Evaluación',     uploadedAt: '2026-03-05', uploadedBy: 'Dra. Elena Voss' },
  { id: 'f9',  name: 'Informe_Progreso_Q1_2026.docx',           size: '78 KB',   sizeBytes: 78000,   type: 'doc',   category: 'Informe',        uploadedAt: '2026-04-01', uploadedBy: 'Dra. Elena Voss' },
  { id: 'f10', name: 'Derivacion_Psiquiatria.pdf',              size: '52 KB',   sizeBytes: 52000,   type: 'pdf',   category: 'Otro',           uploadedAt: '2026-04-15', uploadedBy: 'Dra. Elena Voss' },
]

// ── State ─────────────────────────────────────────────────────────────────────

const files         = ref<PatientFile[]>([...mockFiles])
const search        = ref('')
const activeCategory = ref<FileCategory | 'Todos'>('Todos')
const viewMode      = ref<ViewMode>('grid')
const isDragging    = ref(false)
const fileInputRef  = ref<HTMLInputElement>()

// ── Derived ───────────────────────────────────────────────────────────────────

const filtered = computed(() => {
  let list = files.value
  if (search.value.trim())
    list = list.filter(f => f.name.toLowerCase().includes(search.value.toLowerCase()))
  if (activeCategory.value !== 'Todos')
    list = list.filter(f => f.category === activeCategory.value)
  return list
})

const totalSize = computed(() => {
  const bytes = files.value.reduce((acc, f) => acc + f.sizeBytes, 0)
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.round(bytes / 1000)} KB`
})

// ── File helpers ──────────────────────────────────────────────────────────────

function fileIcon(type: string) {
  if (type === 'pdf') return FileText
  if (type === 'image') return FileImage
  return File
}

function fileIconClass(type: string) {
  if (type === 'pdf')   return 'text-rose-500 bg-rose-50 dark:bg-rose-950'
  if (type === 'doc')   return 'text-blue-500 bg-blue-50 dark:bg-blue-950'
  if (type === 'image') return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950'
  return 'text-muted-foreground bg-muted'
}

function fileExtLabel(type: string) {
  if (type === 'pdf')   return 'PDF'
  if (type === 'doc')   return 'DOC'
  if (type === 'image') return 'IMG'
  return 'FILE'
}

function guessType(name: string): PatientFile['type'] {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext ?? '')) return 'doc'
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext ?? '')) return 'image'
  return 'pdf'
}

function formatBytes(bytes: number) {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.round(bytes / 1000)} KB`
}

let idCounter = mockFiles.length + 1
function ingestFiles(fileList: FileList) {
  Array.from(fileList).forEach(f => {
    files.value.unshift({
      id:         `f${idCounter++}`,
      name:       f.name,
      size:       formatBytes(f.size),
      sizeBytes:  f.size,
      type:       guessType(f.name),
      category:   'Otro',
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: 'Dra. Elena Voss',
    })
  })
}

// ── Upload handlers ───────────────────────────────────────────────────────────

function onFileInput(e: Event) {
  const fl = (e.target as HTMLInputElement).files
  if (fl?.length) ingestFiles(fl)
  ;(e.target as HTMLInputElement).value = ''
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const fl = e.dataTransfer?.files
  if (fl?.length) ingestFiles(fl)
}

function removeFile(id: string) {
  files.value = files.value.filter(f => f.id !== id)
}
</script>

<template>
  <div class="space-y-5">

    <!-- ── Stats + actions header ─────────────────────────────────── -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm text-muted-foreground">
          <span class="font-medium text-foreground">{{ files.length }}</span> archivos
        </span>
        <span class="text-muted-foreground/40">·</span>
        <span class="text-sm text-muted-foreground">{{ totalSize }} en total</span>
      </div>
      <Button size="sm" class="gap-1.5" @click="fileInputRef?.click()">
        <Upload class="w-3.5 h-3.5" /> Subir archivo
      </Button>
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        multiple
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        @change="onFileInput"
      />
    </div>

    <!-- ── Drop zone ───────────────────────────────────────────────── -->
    <div
      class="relative rounded-xl border-2 border-dashed transition-colors"
      :class="isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:bg-muted/40'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="fileInputRef?.click()"
    >
      <div class="flex flex-col items-center justify-center py-8 gap-2 cursor-pointer select-none">
        <div
          class="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
          :class="isDragging ? 'bg-primary/15' : 'bg-muted'"
        >
          <Upload class="w-5 h-5" :class="isDragging ? 'text-primary' : 'text-muted-foreground'" />
        </div>
        <div class="text-center">
          <p class="text-sm font-medium" :class="isDragging ? 'text-primary' : 'text-foreground'">
            {{ isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para subir' }}
          </p>
          <p class="text-xs text-muted-foreground mt-0.5">PDF, DOC, PNG, JPG — máx. 25 MB por archivo</p>
        </div>
      </div>
    </div>

    <!-- ── Toolbar: search + category + view toggle ────────────────── -->
    <div class="flex items-center gap-2 flex-wrap justify-between">
      <div class="flex items-center gap-2 flex-wrap flex-1">
        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            v-model="search"
            placeholder="Buscar archivos..."
            class="pl-8 h-8 w-[200px] text-sm"
          />
          <button v-if="search" class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" @click="search = ''">
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Category pills -->
        <div class="flex gap-1.5 flex-wrap">
          <button
            class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            :class="activeCategory === 'Todos'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'"
            @click="activeCategory = 'Todos'"
          >
            Todos
          </button>
          <button
            v-for="cat in ALL_CATEGORIES"
            :key="cat"
            class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            :class="activeCategory === cat
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'"
            @click="activeCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- View toggle -->
      <div class="flex items-center rounded-md border border-border overflow-hidden shrink-0">
        <button
          class="px-2 py-1.5 transition-colors"
          :class="viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'"
          @click="viewMode = 'grid'"
        >
          <LayoutGrid class="w-3.5 h-3.5" />
        </button>
        <button
          class="px-2 py-1.5 transition-colors border-l border-border"
          :class="viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'"
          @click="viewMode = 'list'"
        >
          <List class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- ── Empty state ─────────────────────────────────────────────── -->
    <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <FolderOpen class="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <p class="text-sm font-medium text-foreground">No hay archivos</p>
        <p class="text-xs text-muted-foreground mt-0.5">
          {{ search || activeCategory !== 'Todos' ? 'Prueba con otros filtros' : 'Sube el primer archivo para esta paciente' }}
        </p>
      </div>
    </div>

    <!-- ── Grid view ───────────────────────────────────────────────── -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      <div
        v-for="file in filtered"
        :key="file.id"
        class="group relative flex flex-col rounded-xl border border-border bg-background hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
      >
        <!-- File type colour strip -->
        <div
          class="flex items-center justify-center h-24 text-2xl font-bold tracking-tight"
          :class="fileIconClass(file.type)"
        >
          <div class="flex flex-col items-center gap-1">
            <component :is="fileIcon(file.type)" class="w-8 h-8" />
            <span class="text-[10px] font-bold tracking-widest opacity-70">{{ fileExtLabel(file.type) }}</span>
          </div>
        </div>

        <!-- Info -->
        <div class="p-2.5">
          <p class="text-xs font-medium text-foreground leading-snug line-clamp-2 mb-1.5" :title="file.name">
            {{ file.name }}
          </p>
          <div class="flex items-center justify-between gap-1">
            <span
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border"
              :class="CATEGORY_STYLE[file.category]"
            >
              {{ file.category }}
            </span>
            <span class="text-[10px] text-muted-foreground">{{ file.size }}</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">{{ file.uploadedAt }}</p>
        </div>

        <!-- Hover actions overlay -->
        <div class="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="w-6 h-6 rounded-md bg-background/90 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background shadow-sm">
            <Eye class="w-3 h-3" />
          </button>
          <button class="w-6 h-6 rounded-md bg-background/90 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background shadow-sm">
            <Download class="w-3 h-3" />
          </button>
          <button
            class="w-6 h-6 rounded-md bg-background/90 border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background shadow-sm"
            @click.stop="removeFile(file.id)"
          >
            <Trash2 class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── List view ───────────────────────────────────────────────── -->
    <div v-else class="rounded-xl border border-border overflow-hidden">
      <div
        v-for="(file, i) in filtered"
        :key="file.id"
        class="group flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
        :class="i > 0 ? 'border-t border-border' : ''"
      >
        <!-- Icon -->
        <div
          class="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 text-[10px] font-bold"
          :class="fileIconClass(file.type)"
        >
          <component :is="fileIcon(file.type)" class="w-4.5 h-4.5" />
        </div>

        <!-- Name + meta -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-foreground truncate">{{ file.name }}</p>
          <div class="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border"
              :class="CATEGORY_STYLE[file.category]"
            >
              {{ file.category }}
            </span>
            <span class="text-xs text-muted-foreground">{{ file.size }}</span>
            <span class="text-muted-foreground/40 text-xs">·</span>
            <span class="text-xs text-muted-foreground">{{ file.uploadedAt }}</span>
            <span class="text-muted-foreground/40 text-xs hidden sm:inline">·</span>
            <span class="text-xs text-muted-foreground hidden sm:inline">{{ file.uploadedBy }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon-sm" class="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Eye class="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" class="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Download class="w-3.5 h-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon-sm" class="h-7 w-7 text-muted-foreground hover:text-foreground">
                <MoreHorizontal class="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-[160px]">
              <DropdownMenuItem class="text-sm gap-2"><Eye class="w-3.5 h-3.5" /> Ver</DropdownMenuItem>
              <DropdownMenuItem class="text-sm gap-2"><Download class="w-3.5 h-3.5" /> Descargar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-sm text-destructive focus:text-destructive gap-2" @click="removeFile(file.id)">
                <Trash2 class="w-3.5 h-3.5" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

  </div>
</template>
