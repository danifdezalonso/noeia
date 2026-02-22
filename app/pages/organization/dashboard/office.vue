<script setup lang="ts">
import { Plus, Pencil, Trash2, Building2, Users, User } from 'lucide-vue-next'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '~/components/ui/dialog'

definePageMeta({ layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────────────────────

type Assignment = 'single' | 'multiple'
type VisitType  = 'individual' | 'group'

interface Room {
  id: string
  number: string
  name: string
  seats: number
  assignment: Assignment
  visitType: VisitType
  image: string | null
  assignedDoctor?: string
}

// ── Mock data ──────────────────────────────────────────────────────────────

const orgDoctors = [
  'Dr. Elena Voss',
  'Dr. Marco Silva',
  'Dr. Priya Nair',
  'Dr. James Okafor',
  'Dr. Sofia Reyes',
  'Dr. Lena Brandt',
  'Dr. Aarav Patel',
]

const rooms = ref<Room[]>([
  {
    id: 'r1',
    number: '101',
    name: 'Therapy Suite A',
    seats: 2,
    assignment: 'single',
    visitType: 'individual',
    image: null,
    assignedDoctor: 'Dr. Elena Voss',
  },
  {
    id: 'r2',
    number: '102',
    name: 'Therapy Suite B',
    seats: 2,
    assignment: 'single',
    visitType: 'individual',
    image: null,
    assignedDoctor: 'Dr. Marco Silva',
  },
  {
    id: 'r3',
    number: '201',
    name: 'Group Session Room',
    seats: 12,
    assignment: 'multiple',
    visitType: 'group',
    image: null,
    assignedDoctor: undefined,
  },
])

// ── Modal state ────────────────────────────────────────────────────────────

const modalOpen    = ref(false)
const editingId    = ref<string | null>(null)
const deleteTarget = ref<string | null>(null)

interface RoomForm {
  number: string
  name: string
  seats: number
  assignment: Assignment
  visitType: VisitType
  assignedDoctor: string
  image: string | null
}

function blankForm(): RoomForm {
  return { number: '', name: '', seats: 2, assignment: 'single', visitType: 'individual', assignedDoctor: '', image: null }
}

const form = reactive<RoomForm>(blankForm())

function openAdd() {
  editingId.value = null
  Object.assign(form, blankForm())
  modalOpen.value = true
}

function openEdit(room: Room) {
  editingId.value = room.id
  Object.assign(form, {
    number: room.number,
    name: room.name,
    seats: room.seats,
    assignment: room.assignment,
    visitType: room.visitType,
    assignedDoctor: room.assignedDoctor ?? '',
    image: room.image,
  })
  modalOpen.value = true
}

function saveRoom() {
  if (!form.number.trim() || !form.name.trim()) return
  if (editingId.value) {
    const idx = rooms.value.findIndex(r => r.id === editingId.value)
    if (idx !== -1) {
      rooms.value[idx] = {
        id: editingId.value,
        number: form.number.trim(),
        name: form.name.trim(),
        seats: form.seats,
        assignment: form.assignment,
        visitType: form.visitType,
        image: form.image,
        assignedDoctor: form.assignedDoctor || undefined,
      }
    }
  } else {
    rooms.value.push({
      id: `r${Date.now()}`,
      number: form.number.trim(),
      name: form.name.trim(),
      seats: form.seats,
      assignment: form.assignment,
      visitType: form.visitType,
      image: form.image,
      assignedDoctor: form.assignedDoctor || undefined,
    })
  }
  modalOpen.value = false
}

function deleteRoom(id: string) {
  rooms.value = rooms.value.filter(r => r.id !== id)
  deleteTarget.value = null
}

// ── Image upload ───────────────────────────────────────────────────────────

const photoInputRef = ref<HTMLInputElement>()
const isDragging    = ref(false)

function onFileDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) loadImage(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadImage(file)
}

function loadImage(file: File) {
  const reader = new FileReader()
  reader.onload = ev => { form.image = ev.target?.result as string }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-5 max-w-5xl">

      <!-- Page header -->
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Office Management</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your clinic rooms and space assignments.</p>
        </div>
        <button
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
          @click="openAdd"
        >
          <Plus class="w-4 h-4" />
          Add Room
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Total Rooms</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ rooms.length }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Individual</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ rooms.filter(r => r.visitType === 'individual').length }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Group Rooms</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ rooms.filter(r => r.visitType === 'group').length }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Total Seats</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ rooms.reduce((s, r) => s + r.seats, 0) }}</p>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow class="bg-slate-50/60 dark:bg-slate-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-700/50">
                <TableHead class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Room #</TableHead>
                <TableHead class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</TableHead>
                <TableHead class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Seats</TableHead>
                <TableHead class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignment</TableHead>
                <TableHead class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visit Type</TableHead>
                <TableHead class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Doctor</TableHead>
                <TableHead class="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="rooms.length === 0">
                <TableCell :colspan="7" class="py-16 text-center">
                  <Building2 class="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p class="text-sm text-slate-400">No rooms added yet. Click "Add Room" to get started.</p>
                </TableCell>
              </TableRow>
              <TableRow
                v-for="room in rooms"
                :key="room.id"
                class="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
              >
                <!-- Room # -->
                <TableCell class="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {{ room.number }}
                </TableCell>

                <!-- Name -->
                <TableCell class="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {{ room.name }}
                </TableCell>

                <!-- Seats -->
                <TableCell class="text-sm text-slate-600 dark:text-slate-300">
                  <div class="flex items-center gap-1.5">
                    <Users class="w-3.5 h-3.5 text-slate-400" />
                    {{ room.seats }}
                  </div>
                </TableCell>

                <!-- Assignment -->
                <TableCell>
                  <span :class="[
                    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                    room.assignment === 'single'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                      : 'bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
                  ]">
                    <User class="w-3 h-3" />
                    {{ room.assignment === 'single' ? 'Single Doctor' : 'Multiple Doctors' }}
                  </span>
                </TableCell>

                <!-- Visit Type -->
                <TableCell>
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    room.visitType === 'individual'
                      ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                  ]">
                    {{ room.visitType === 'individual' ? 'Individual' : 'Group' }}
                  </span>
                </TableCell>

                <!-- Assigned Doctor -->
                <TableCell class="text-sm text-slate-600 dark:text-slate-300">
                  <span v-if="room.assignedDoctor">{{ room.assignedDoctor }}</span>
                  <span v-else class="text-slate-400 italic text-xs">Unassigned</span>
                </TableCell>

                <!-- Actions -->
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-1 justify-end">
                    <button
                      class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit room"
                      @click="openEdit(room)"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button
                      class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete room"
                      @click="deleteTarget = room.id"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  </div>

  <!-- ══ Add / Edit Room Modal ══════════════════════════════════════════════ -->
  <Dialog v-model:open="modalOpen">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ editingId ? 'Edit Room' : 'Add Room' }}</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 pt-2">

        <!-- Room # + Name -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Room Number <span class="text-red-500">*</span></label>
            <input
              v-model="form.number"
              type="text"
              placeholder="e.g. 101"
              class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Room Name <span class="text-red-500">*</span></label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Therapy Suite A"
              class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Seats -->
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Available Seats</label>
          <input
            v-model.number="form.seats"
            type="number"
            min="1"
            max="100"
            class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <!-- Assignment toggle -->
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assignment</label>
          <div class="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              :class="['flex-1 py-2 text-sm font-medium transition-colors', form.assignment === 'single' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
              @click="form.assignment = 'single'"
            >
              Single Doctor
            </button>
            <button
              :class="['flex-1 py-2 text-sm font-medium border-l border-slate-200 dark:border-slate-700 transition-colors', form.assignment === 'multiple' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
              @click="form.assignment = 'multiple'"
            >
              Multiple Doctors
            </button>
          </div>
        </div>

        <!-- Visit type toggle -->
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Visit Type</label>
          <div class="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              :class="['flex-1 py-2 text-sm font-medium transition-colors', form.visitType === 'individual' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
              @click="form.visitType = 'individual'"
            >
              Individual
            </button>
            <button
              :class="['flex-1 py-2 text-sm font-medium border-l border-slate-200 dark:border-slate-700 transition-colors', form.visitType === 'group' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700']"
              @click="form.visitType = 'group'"
            >
              Group
            </button>
          </div>
        </div>

        <!-- Assign doctor (only for single) -->
        <div v-if="form.assignment === 'single'">
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assigned Doctor <span class="text-slate-400">(optional)</span></label>
          <select
            v-model="form.assignedDoctor"
            class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Unassigned</option>
            <option v-for="d in orgDoctors" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>

        <!-- Photo upload (optional) -->
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Room Photo <span class="text-slate-400">(optional)</span></label>
          <div
            :class="[
              'relative flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors overflow-hidden',
              isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800/50',
            ]"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onFileDrop"
            @click="photoInputRef?.click()"
          >
            <img v-if="form.image" :src="form.image" class="absolute inset-0 w-full h-full object-cover rounded-xl" />
            <template v-else>
              <Building2 class="w-6 h-6 text-slate-300 mb-1" />
              <p class="text-xs text-slate-400">Drop a photo here or <span class="text-indigo-500 font-medium">browse</span></p>
            </template>
          </div>
          <input ref="photoInputRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-end gap-2 pt-1">
          <button
            class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            @click="modalOpen = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!form.number.trim() || !form.name.trim()"
            @click="saveRoom"
          >
            {{ editingId ? 'Save Changes' : 'Add Room' }}
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- ══ Delete confirmation ════════════════════════════════════════════════ -->
  <Dialog :open="!!deleteTarget" @update:open="v => { if (!v) deleteTarget = null }">
    <DialogContent class="max-w-sm">
      <DialogHeader>
        <DialogTitle>Delete Room</DialogTitle>
      </DialogHeader>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Are you sure you want to remove this room? This action cannot be undone.
      </p>
      <div class="flex items-center justify-end gap-2 mt-4">
        <button
          class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          @click="deleteTarget = null"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          @click="deleteRoom(deleteTarget!)"
        >
          Delete
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>
