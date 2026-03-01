<script setup lang="ts">
import { X, EyeOff, Clock, Briefcase } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'

import type { WorkDayHours } from '~/composables/useCalendar'

const { hideWeekends, slotDuration, workHours } = useCalendar()

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const slotOptions = [
  { value: '00:15:00', label: '15 min' },
  { value: '00:30:00', label: '30 min' },
  { value: '01:00:00', label: '1 hr'   },
]

const DAYS = [
  { dow: 1, label: 'Mon' },
  { dow: 2, label: 'Tue' },
  { dow: 3, label: 'Wed' },
  { dow: 4, label: 'Thu' },
  { dow: 5, label: 'Fri' },
  { dow: 6, label: 'Sat' },
  { dow: 0, label: 'Sun' },
]

const hourOptions = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0')
  const label = i === 0 ? '12am'
    : i < 12 ? `${i}am`
    : i === 12 ? '12pm'
    : `${i - 12}pm`
  return { value: `${h}:00`, label }
})

function setWorkHours(dow: number, update: Partial<WorkDayHours>) {
  workHours.value = { ...workHours.value, [dow]: { ...workHours.value[dow]!, ...update } }
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
        <h3 class="text-sm font-semibold text-foreground">Calendar settings</h3>
        <Button variant="ghost" size="icon-sm" @click="emit('close')">
          <X class="w-4 h-4" />
        </Button>
      </div>

      <div class="px-4 py-3 space-y-5">

        <!-- ── Display section ──────────────────────────────────────────── -->
        <section>
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Display</p>
          <div class="space-y-1">

            <!-- Hide weekends -->
            <div class="flex items-center justify-between py-1.5">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                  <EyeOff class="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <Label class="text-sm text-foreground cursor-pointer">Hide weekends</Label>
              </div>
              <Switch v-model:checked="hideWeekends" />
            </div>

          </div>
        </section>

        <!-- ── Time slots section ───────────────────────────────────────── -->
        <section>
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Time slots</p>
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Clock class="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <ToggleGroup
              type="single"
              :model-value="slotDuration"
              variant="outline"
              class="flex-1 h-8"
              @update:model-value="(v) => v && (slotDuration = v)"
            >
              <ToggleGroupItem
                v-for="opt in slotOptions"
                :key="opt.value"
                :value="opt.value"
                class="flex-1 text-xs h-8 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {{ opt.label }}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </section>

        <!-- ── Working hours section ────────────────────────────────────── -->
        <section>
          <div class="flex items-start gap-2.5 mb-3">
            <div class="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
              <Briefcase class="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Working hours</p>
              <p class="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                Highlighted as bookable for patients.<br>
                You can still add events outside these hours.
              </p>
            </div>
          </div>
          <div class="space-y-0.5">
            <div
              v-for="d in DAYS" :key="d.dow"
              class="flex items-center gap-1.5 h-8"
            >
              <span class="w-7 text-xs font-medium text-muted-foreground shrink-0">{{ d.label }}</span>
              <Switch
                :checked="workHours[d.dow].enabled"
                @update:checked="setWorkHours(d.dow, { enabled: $event })"
                class="shrink-0"
              />
              <template v-if="workHours[d.dow].enabled">
                <div class="flex-1 min-w-0">
                  <Select
                    :model-value="workHours[d.dow].start"
                    @update:model-value="setWorkHours(d.dow, { start: $event })"
                  >
                    <SelectTrigger class="h-7 w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="h in hourOptions" :key="h.value" :value="h.value">
                        {{ h.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <span class="text-muted-foreground text-xs shrink-0">–</span>
                <div class="flex-1 min-w-0">
                  <Select
                    :model-value="workHours[d.dow].end"
                    @update:model-value="setWorkHours(d.dow, { end: $event })"
                  >
                    <SelectTrigger class="h-7 w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="h in hourOptions" :key="h.value" :value="h.value">
                        {{ h.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </template>
              <span v-else class="text-xs text-muted-foreground ml-1">Closed</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  </Transition>
</template>
