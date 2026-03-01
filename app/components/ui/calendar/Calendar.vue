<script setup lang="ts">
import type { CalendarRootEmits, CalendarRootProps } from 'reka-ui'
import {
  CalendarCell, CalendarCellTrigger, CalendarGrid, CalendarGridBody,
  CalendarGridHead, CalendarGridRow, CalendarHeadCell, CalendarHeader,
  CalendarHeading, CalendarNext, CalendarPrev, CalendarRoot,
} from 'reka-ui'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<CalendarRootProps & { class?: string }>()
const emits = defineEmits<CalendarRootEmits>()
</script>

<template>
  <CalendarRoot
    v-bind="props"
    :class="cn('p-3 select-none', props.class)"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <template #default="{ weekDays, grid }">
      <CalendarHeader class="relative flex w-full items-center justify-between pt-1 pb-2">
        <CalendarPrev
          class="inline-flex items-center justify-center rounded-md h-7 w-7 p-0 bg-transparent text-muted-foreground opacity-50 hover:opacity-100 hover:bg-accent transition-colors"
        >
          <ChevronLeft class="h-4 w-4" />
        </CalendarPrev>
        <CalendarHeading class="text-sm font-semibold" />
        <CalendarNext
          class="inline-flex items-center justify-center rounded-md h-7 w-7 p-0 bg-transparent text-muted-foreground opacity-50 hover:opacity-100 hover:bg-accent transition-colors"
        >
          <ChevronRight class="h-4 w-4" />
        </CalendarNext>
      </CalendarHeader>

      <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse">
        <CalendarGridHead>
          <CalendarGridRow class="flex mb-1">
            <CalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              class="w-8 text-center text-[0.75rem] font-normal text-muted-foreground"
            >
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow
            v-for="(weekDates, idx) in month.rows"
            :key="idx"
            class="flex w-full mt-1"
          >
            <CalendarCell
              v-for="date in weekDates"
              :key="date.toString()"
              :date="date"
              class="relative p-0 text-center text-sm focus-within:relative focus-within:z-20"
            >
              <CalendarCellTrigger
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
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </template>
  </CalendarRoot>
</template>
