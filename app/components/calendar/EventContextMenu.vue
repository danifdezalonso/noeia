<script setup lang="ts">
import { Edit2, Copy, Trash2, Palette, Tag, X } from 'lucide-vue-next'

const { contextMenu, closeContextMenu, events, openEdit, deleteEvent, duplicateEvent, setEventColor, toggleEventLabel } = useCalendar()

const EVENT_COLORS = [
  { name: 'Indigo',   value: '#4f46e5' },
  { name: 'Blue',     value: '#2563eb' },
  { name: 'Sky',      value: '#0284c7' },
  { name: 'Teal',     value: '#0d9488' },
  { name: 'Emerald',  value: '#16a34a' },
  { name: 'Amber',    value: '#d97706' },
  { name: 'Orange',   value: '#ea580c' },
  { name: 'Red',      value: '#dc2626' },
  { name: 'Pink',     value: '#db2777' },
  { name: 'Purple',   value: '#9333ea' },
  { name: 'Violet',   value: '#7c3aed' },
  { name: 'Gray',     value: '#6b7280' },
]

const DEFAULT_LABELS = ['Urgent', 'Follow-up', 'Billable', 'No-show', 'Cancelled', 'Rescheduled']

const showColorPicker = ref(false)
const showLabelPicker = ref(false)

const activeEvent = computed(() => {
  if (!contextMenu.value) return null
  return events.value.find(e => e.id === contextMenu.value!.eventId) ?? null
})

const menuStyle = computed(() => {
  const m = contextMenu.value
  if (!m || typeof window === 'undefined') return {}
  const W = 200; const margin = 8
  let left = m.x + 4
  let top  = m.y + 4
  if (left + W > window.innerWidth - margin)  left = m.x - W - 4
  if (top  + 300 > window.innerHeight - margin) top = m.y - 300
  left = Math.max(margin, left)
  top  = Math.max(margin, top)
  return { left: `${left}px`, top: `${top}px` }
})

watch(contextMenu, (val) => {
  if (!val?.open) { showColorPicker.value = false; showLabelPicker.value = false }
})

function handleEdit() {
  if (activeEvent.value) openEdit(activeEvent.value)
  closeContextMenu()
}
function handleDuplicate() {
  if (contextMenu.value) duplicateEvent(contextMenu.value.eventId)
  closeContextMenu()
}
function handleDelete() {
  if (contextMenu.value && activeEvent.value && confirm(`Delete "${activeEvent.value.title}"?`)) {
    deleteEvent(contextMenu.value.eventId)
  }
  closeContextMenu()
}
function handleColor(color: string) {
  if (contextMenu.value) setEventColor(contextMenu.value.eventId, color)
  closeContextMenu()
}
function handleLabel(label: string) {
  if (contextMenu.value) toggleEventLabel(contextMenu.value.eventId, label)
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0 scale-95">
      <div v-if="contextMenu?.open" class="fixed inset-0 z-[60]" @click.self="closeContextMenu" @contextmenu.prevent="closeContextMenu">
        <div class="fixed z-[61] bg-white dark:bg-slate-800 rounded-xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-slate-700/50 py-1 min-w-[192px]" :style="menuStyle" @click.stop>

          <!-- Event name header -->
          <div class="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
            <p class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{{ activeEvent?.title }}</p>
            <p v-if="activeEvent?.labels?.length" class="flex flex-wrap gap-1 mt-1">
              <span v-for="l in activeEvent.labels" :key="l" class="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary">{{ l }}</span>
            </p>
          </div>

          <!-- Actions -->
          <button class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click="handleEdit">
            <Edit2 class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Edit
          </button>
          <button class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click="handleDuplicate">
            <Copy class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Duplicate
          </button>

          <!-- Change color -->
          <div class="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
            <button class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click.stop="showColorPicker = !showColorPicker; showLabelPicker = false">
              <Palette class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Change color
            </button>
            <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
              <div v-if="showColorPicker" class="px-3 pb-2">
                <div class="grid grid-cols-6 gap-1.5 pt-1">
                  <button
                    v-for="c in EVENT_COLORS"
                    :key="c.value"
                    :title="c.name"
                    class="w-6 h-6 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-1 ring-transparent hover:ring-slate-300 dark:hover:ring-slate-500"
                    :style="{ backgroundColor: c.value }"
                    @click="handleColor(c.value)"
                  />
                </div>
              </div>
            </Transition>
          </div>

          <!-- Add/edit labels -->
          <button class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click.stop="showLabelPicker = !showLabelPicker; showColorPicker = false">
            <Tag class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Labels
          </button>
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
            <div v-if="showLabelPicker" class="px-3 pb-2 space-y-1">
              <button
                v-for="label in DEFAULT_LABELS"
                :key="label"
                :class="['w-full text-left px-2 py-1 text-xs rounded-lg transition-colors', activeEvent?.labels?.includes(label) ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700']"
                @click="handleLabel(label)"
              >
                {{ activeEvent?.labels?.includes(label) ? '✓ ' : '' }}{{ label }}
              </button>
            </div>
          </Transition>

          <!-- Delete -->
          <div class="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
            <button class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors" @click="handleDelete">
              <Trash2 class="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
