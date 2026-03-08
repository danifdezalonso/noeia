<script setup lang="ts">
import type { RangeCalendarRootEmits, RangeCalendarRootProps } from 'reka-ui'
import {
  RangeCalendarRoot, RangeCalendarPrev, RangeCalendarNext,
  RangeCalendarGrid, RangeCalendarGridHead, RangeCalendarGridRow,
  RangeCalendarHeadCell, RangeCalendarGridBody, RangeCalendarCell,
  RangeCalendarCellTrigger,
} from 'reka-ui'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const props = defineProps<RangeCalendarRootProps & { class?: string }>()
const emits = defineEmits<RangeCalendarRootEmits>()
</script>

<template>
  <RangeCalendarRoot
    v-bind="props"
    :class="cn('p-3 select-none', props.class)"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <template #default="{ weekDays, grid }">
      <div class="flex gap-x-6">
        <div v-for="(month, monthIdx) in grid" :key="month.value.toString()">

          <!-- Per-month header -->
          <div class="relative flex w-full items-center justify-between pt-1 pb-2">
            <RangeCalendarPrev
              v-if="monthIdx === 0"
              class="inline-flex items-center justify-center rounded-md h-7 w-7 p-0 bg-transparent text-muted-foreground opacity-50 hover:opacity-100 hover:bg-accent transition-colors"
            >
              <ChevronLeft class="h-4 w-4" />
            </RangeCalendarPrev>
            <div v-else class="h-7 w-7" />

            <span class="text-sm font-semibold">
              {{ format(new Date(month.value.year, month.value.month - 1, 1), 'MMMM yyyy') }}
            </span>

            <RangeCalendarNext
              v-if="monthIdx === grid.length - 1"
              class="inline-flex items-center justify-center rounded-md h-7 w-7 p-0 bg-transparent text-muted-foreground opacity-50 hover:opacity-100 hover:bg-accent transition-colors"
            >
              <ChevronRight class="h-4 w-4" />
            </RangeCalendarNext>
            <div v-else class="h-7 w-7" />
          </div>

          <RangeCalendarGrid class="w-full border-collapse space-y-1">
            <RangeCalendarGridHead>
              <RangeCalendarGridRow class="flex">
                <RangeCalendarHeadCell
                  v-for="day in weekDays"
                  :key="day"
                  class="w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground"
                >
                  {{ day }}
                </RangeCalendarHeadCell>
              </RangeCalendarGridRow>
            </RangeCalendarGridHead>
            <RangeCalendarGridBody>
              <RangeCalendarGridRow
                v-for="(weekDates, idx) in month.rows"
                :key="idx"
                class="flex w-full mt-2"
              >
                <RangeCalendarCell
                  v-for="date in weekDates"
                  :key="date.toString()"
                  :date="date"
                  :class="cn(
                    'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
                    '[&:has([data-selected])]:bg-accent',
                    '[&:has([data-selected][data-selection-end])]:rounded-r-md',
                    '[&:has([data-selected][data-selection-start])]:rounded-l-md',
                    'first:[&:has([data-selected])]:rounded-l-md',
                    'last:[&:has([data-selected])]:rounded-r-md',
                  )"
                >
                  <RangeCalendarCellTrigger
                    :day="date"
                    :month="month.value"
                    :class="cn(
                      'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-normal p-0 transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'data-[outside-month]:text-muted-foreground/40 data-[outside-month]:pointer-events-none',
                      'data-[today]:bg-accent data-[today]:text-accent-foreground',
                      'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary data-[selected]:focus:text-primary-foreground',
                      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    )"
                  />
                </RangeCalendarCell>
              </RangeCalendarGridRow>
            </RangeCalendarGridBody>
          </RangeCalendarGrid>

        </div>
      </div>
    </template>
  </RangeCalendarRoot>
</template>
