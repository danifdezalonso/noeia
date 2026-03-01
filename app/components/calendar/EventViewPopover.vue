<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import {
  X, Pencil, Trash2, Video, MapPin, AlignLeft, Bell, Lock,
  Calendar, Clock, ExternalLink,
} from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'

const cal = useCalendar()
const { viewPopoverOpen, viewPopoverEvent, viewPopoverPos, openEdit, deleteEvent } = cal

// ── Positioning ──────────────────────────────────────────────────────────────
const popoverStyle = computed(() => {
  const pos = viewPopoverPos.value
  if (!pos || typeof window === 'undefined') return {}
  const W = 320; const estH = 360; const m = 12
  let left = pos.x + 14
  let top  = pos.y - 60
  if (left + W > window.innerWidth  - m) left = pos.x - W - 14
  left = Math.max(m, left)
  top  = Math.max(56 + m, Math.min(window.innerHeight - estH - m, top))
  return { left: `${left}px`, top: `${top}px`, width: `${W}px`, transform: 'none' }
})

// ── Derived display values ───────────────────────────────────────────────────
const ev = computed(() => viewPopoverEvent.value)

const categoryStyle: Record<string, { bg: string; label: string }> = {
  session:       { bg: '#4f46e5', label: 'Session' },
  ooo:           { bg: '#ea580c', label: 'Out of Office' },
  meeting:       { bg: '#0284c7', label: 'Meeting' },
  task:          { bg: '#16a34a', label: 'Task' },
  focus:         { bg: '#7c3aed', label: 'Focus Time' },
  appointment:   { bg: '#0d9488', label: 'Appointments' },
  documentation: { bg: '#64748b', label: 'Documentation' },
}

const catInfo = computed(() => {
  if (!ev.value) return { bg: '#6b7280', label: '' }
  return categoryStyle[ev.value.category] ?? { bg: '#6b7280', label: ev.value.category }
})

function fmtDateRange(e: typeof ev.value) {
  if (!e) return ''
  try {
    if (e.allDay) {
      return format(parseISO(e.start + 'T12:00:00'), 'EEEE, MMM d')
    }
    const start = parseISO(e.start)
    const end   = parseISO(e.end)
    const day   = format(start, 'EEEE, MMM d')
    const s     = format(start, 'HH:mm')
    const en    = format(end, 'HH:mm')
    const mins  = (end.getTime() - start.getTime()) / 60000
    const dur   = mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}` : `${mins}m`
    return `${day} · ${s} – ${en} (${dur})`
  } catch { return e.start }
}

const dateRange = computed(() => fmtDateRange(ev.value))

function close() { viewPopoverOpen.value = false }

function handleEdit() {
  const e = ev.value
  if (!e) return
  close()
  openEdit(e)
}

function handleDelete() {
  const e = ev.value
  if (!e) return
  close()
  deleteEvent(e.id)
}

useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  if (viewPopoverOpen.value && e.key === 'Escape') {
    e.preventDefault()
    close()
  }
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div v-if="viewPopoverOpen" class="fixed inset-0 z-40" @mousedown="close" />

    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="viewPopoverOpen && ev"
        :style="popoverStyle"
        class="fixed z-50 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
        @mousedown.stop
      >
        <!-- Colored top bar -->
        <div class="h-1.5 w-full" :style="{ backgroundColor: ev.color ?? catInfo.bg }" />

        <!-- Header: title + actions -->
        <div class="flex items-start justify-between gap-2 px-4 pt-3 pb-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <Badge
                class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border-0"
                :style="{ backgroundColor: (ev.color ?? catInfo.bg) + '20', color: ev.color ?? catInfo.bg }"
              >
                {{ catInfo.label }}
              </Badge>
              <span v-if="ev.cancelled" class="text-[10px] font-semibold text-destructive">Cancelled</span>
            </div>
            <h3 class="text-sm font-semibold text-foreground leading-snug">{{ ev.title }}</h3>
          </div>
          <div class="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon-sm" class="rounded-lg h-7 w-7" title="Edit" @click="handleEdit">
              <Pencil class="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" class="rounded-lg h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete" @click="handleDelete">
              <Trash2 class="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" class="rounded-lg h-7 w-7" title="Close" @click="close">
              <X class="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <!-- Details -->
        <div class="px-4 pb-4 space-y-2">
          <!-- Date / time -->
          <div class="flex items-start gap-2.5 text-sm text-foreground">
            <Calendar class="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
            <span>{{ dateRange }}</span>
          </div>

          <!-- Online -->
          <div v-if="ev.modality === 'online'" class="flex items-start gap-2.5 text-sm text-foreground">
            <Video class="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
            <div class="min-w-0">
              <span>Online</span>
              <a
                v-if="ev.meetingLink"
                :href="ev.meetingLink"
                target="_blank"
                rel="noopener"
                class="ml-2 text-primary hover:underline inline-flex items-center gap-0.5 text-xs"
                @click.stop
              >
                Join link <ExternalLink class="w-3 h-3" />
              </a>
            </div>
          </div>

          <!-- In-person -->
          <div v-else-if="ev.modality === 'inperson'" class="flex items-start gap-2.5 text-sm text-foreground">
            <MapPin class="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
            <span>{{ ev.location || 'In person' }}</span>
          </div>

          <!-- Description -->
          <div v-if="ev.description" class="flex items-start gap-2.5 text-sm text-foreground">
            <AlignLeft class="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
            <p class="text-muted-foreground leading-relaxed line-clamp-3">{{ ev.description }}</p>
          </div>

          <!-- Notification -->
          <div v-if="ev.notification !== undefined && ev.notification !== -1" class="flex items-center gap-2.5 text-sm text-foreground">
            <Bell class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span class="text-muted-foreground">
              {{ ev.notification === 0 ? 'At event time' : `${ev.notification} min before` }}
            </span>
          </div>

          <!-- Private -->
          <div v-if="ev.visibility === 'private'" class="flex items-center gap-2.5 text-sm text-foreground">
            <Lock class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span class="text-muted-foreground">Private</span>
          </div>

          <!-- Divider + Edit button -->
          <div class="pt-1 border-t border-border">
            <Button variant="ghost" class="w-full justify-start text-sm h-8 rounded-lg gap-2 text-muted-foreground hover:text-foreground" @click="handleEdit">
              <Pencil class="w-3.5 h-3.5" />
              Open full details
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
