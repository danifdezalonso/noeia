<script setup lang="ts">
import { X, Users } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { colleagues, visibleColleagueIds, toggleColleague } = useCalendar()

function isVisible(id: string) { return visibleColleagueIds.value.includes(id) }

function initials(name: string) {
  return name.split(' ')
    .filter(w => !w.match(/^Dr\.?$/i))
    .map(w => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0 scale-95 -translate-y-1"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 -translate-y-1"
  >
    <div
      v-if="open"
      class="absolute right-0 top-full mt-2 z-50 w-72 bg-card rounded-xl shadow-xl border border-border overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 class="text-sm font-semibold text-foreground">Colleagues' calendars</h3>
        <Button variant="ghost" size="icon-sm" @click="emit('close')">
          <X class="w-4 h-4" />
        </Button>
      </div>

      <div class="px-4 py-3 space-y-3">

        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Your team</p>

        <!-- Empty state -->
        <div v-if="colleagues.length === 0" class="flex flex-col items-center gap-2 py-5 text-center">
          <div class="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <Users class="w-4 h-4 text-muted-foreground" />
          </div>
          <p class="text-xs text-muted-foreground">No colleagues found</p>
        </div>

        <!-- Colleague list -->
        <div v-else class="space-y-0.5">
          <div
            v-for="c in colleagues"
            :key="c.id"
            class="flex items-center justify-between py-1.5"
          >
            <div class="flex items-center gap-2.5">
              <!-- Avatar dot with colleague color -->
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 select-none"
                :style="{ backgroundColor: c.color }"
              >
                {{ initials(c.name) }}
              </div>
              <span class="text-sm text-foreground">{{ c.name }}</span>
            </div>
            <Switch :checked="isVisible(c.id)" @update:checked="toggleColleague(c.id)" />
          </div>
        </div>

        <p class="text-[11px] text-muted-foreground leading-snug pt-0.5 border-t border-border">
          Enabled calendars appear alongside your own events in a distinct color.
        </p>

      </div>
    </div>
  </Transition>
</template>
