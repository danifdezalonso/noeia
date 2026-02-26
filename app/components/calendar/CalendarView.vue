<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarEvent } from '~/composables/useCalendar'

const props = defineProps<{ events?: CalendarEvent[] }>()

const cal = useCalendar()
const {
  viewMode, currentTitle,
  hideWeekends, showWeekNums, slotDuration, workHours,
  openQuickCreate, openEdit, moveEvent, toggleTaskDone, openContextMenu,
} = cal

// Use prop events if provided, otherwise fall back to composable events
const activeEvents = computed(() => props.events ?? cal.events.value)

const calendarRef = ref<InstanceType<typeof FullCalendar>>()

// ── Category base colors ─────────────────────────────────────────────────────
const categoryStyle: Record<string, { bg: string; text: string }> = {
  session:     { bg: '#4f46e5', text: '#ffffff' },
  ooo:         { bg: '#ea580c', text: '#ffffff' },
  meeting:     { bg: '#0284c7', text: '#ffffff' },
  task:        { bg: '#16a34a', text: '#ffffff' },
  focus:       { bg: '#7c3aed', text: '#ffffff' },
  appointment:   { bg: '#0d9488', text: '#ffffff' },
  documentation: { bg: '#64748b', text: '#ffffff' },
}

function toLocalIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

// ── FC event feed ────────────────────────────────────────────────────────────
const fcEvents = computed(() =>
  activeEvents.value.map((ev) => {
    const style = categoryStyle[ev.category] ?? { bg: '#6b7280', text: '#ffffff' }
    const bg = ev.color ?? style.bg
    return {
      id: ev.id,
      title: ev.title,
      start: ev.start,
      end: ev.end,
      allDay: ev.allDay ?? false,
      backgroundColor: bg,
      textColor: style.text,
      borderColor: 'transparent',
      classNames: [
        `fc-ev-${ev.category}`,
        ...(ev.done      ? ['fc-ev-done']      : []),
        ...(ev.allDay    ? ['fc-ev-allday']    : []),
        ...(ev.cancelled ? ['fc-ev-cancelled'] : []),
      ],
    }
  }),
)

// ── Custom day header ────────────────────────────────────────────────────────
function dayHeaderContent(args: any) {
  const d: Date = args.date
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const name  = days[d.getDay()]
  const num   = d.getDate()
  const today = args.isToday
  return {
    html: `<div class="fc-gcal-header">
      <span class="fc-gcal-dayname${today ? ' today' : ''}">${name}</span>
      <span class="fc-gcal-daynum${today ? ' today' : ''}">${num}</span>
    </div>`,
  }
}

// ── Task circle via eventDidMount (avoids blanking non-task events) ───────────
// eventContent is NOT used — returning undefined/null from it causes FullCalendar
// to render blank events in v6. Instead we inject a circle span via DOM after mount.

// ── One-shot scroll to 9am on first view render ──────────────────────────────
// scrollTime in options doesn't work reliably with the Vue3 FC wrapper when
// options are reactive. Using datesSet (fires after each view render) with a
// flag ensures we only scroll once per component mount.
let firstLoad = true

// ── Calendar options ─────────────────────────────────────────────────────────
const calendarOptions = computed(() => ({
  plugins:    [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  headerToolbar: false as const,
  initialView:   viewMode.value,
  firstDay:      1,
  selectable:    true,
  selectMirror:  true,
  editable:      true,
  weekends:      !hideWeekends.value,
  weekNumbers:   showWeekNums.value,
  weekNumberFormat: { week: 'numeric' } as const,
  dayMaxEvents:  3,
  slotDuration:  slotDuration.value,
  slotLabelInterval: slotDuration.value === '00:15:00' ? '01:00:00' : slotDuration.value,
  scrollTime:    '09:00:00',
  nowIndicator:  true,
  businessHours: Object.entries(workHours.value)
    .filter(([, d]) => d.enabled)
    .map(([dow, d]) => ({ daysOfWeek: [Number(dow)], startTime: d.start, endTime: d.end })),
  height: '100%',
  events: fcEvents.value,
  dayHeaderContent,

  select: (info: any) => {
    openQuickCreate(
      toLocalIso(info.start),
      toLocalIso(info.end),
      info.jsEvent?.clientX ?? 400,
      info.jsEvent?.clientY ?? 300,
    )
  },

  eventClick: (info: any) => {
    // Task circle → toggle done
    if ((info.jsEvent.target as HTMLElement).closest('.fc-task-check')) {
      info.jsEvent.preventDefault()
      const ev = activeEvents.value.find((e) => e.id === info.event.id)
      if (ev?.category === 'task') toggleTaskDone(ev.id)
      return
    }
    const ev = activeEvents.value.find((e) => e.id === info.event.id)
    if (ev) openEdit(ev)
  },

  eventDidMount: (info: any) => {
    // ── Right-click context menu (all events) ───────────────────────────
    info.el.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault()
      openContextMenu(info.event.id, e.clientX, e.clientY)
    })

    // ── Task circle checkbox (task events only) ─────────────────────────
    // We inject a <span class="fc-task-check"> into FullCalendar's default
    // rendered structure so the title + time remain visible.
    // The done/undone appearance is driven purely by the .fc-ev-done CSS class.
    const ev = activeEvents.value.find((e) => e.id === info.event.id)
    if (ev?.category === 'task') {
      const mainEl = info.el.querySelector('.fc-event-main') as HTMLElement | null
      if (mainEl && !mainEl.querySelector('.fc-task-check')) {
        mainEl.style.display       = 'flex'
        mainEl.style.alignItems    = 'flex-start'
        mainEl.style.gap           = '4px'
        mainEl.style.padding       = '3px 5px'
        const circle = document.createElement('span')
        circle.className = 'fc-task-check'
        circle.title     = 'Toggle done'
        mainEl.prepend(circle)
      }
    }
  },

  eventDrop: (info: any) => {
    if (!confirm(`Move "${info.event.title}" to the new time?`)) { info.revert(); return }
    moveEvent(info.event.id, toLocalIso(info.event.start), toLocalIso(info.event.end ?? info.event.start))
  },

  datesSet: (info: any) => {
    currentTitle.value = info.view.title
    // Scroll to 9am only on the very first render (not on prev/next/view changes)
    if (firstLoad) {
      firstLoad = false
      setTimeout(() => {
        calendarRef.value?.getApi()?.scrollToTime('09:00:00')
      }, 50)
    }
  },
}))

watch(viewMode, (v) => calendarRef.value?.getApi().changeView(v))

defineExpose({
  prev:       () => calendarRef.value?.getApi().prev(),
  next:       () => calendarRef.value?.getApi().next(),
  today:      () => calendarRef.value?.getApi().today(),
  changeView: (v: string) => calendarRef.value?.getApi().changeView(v),
})
</script>

<template>
  <FullCalendar ref="calendarRef" :options="calendarOptions" />
</template>

<style>
/* ═══════════════════════════════════════════════════════════════════════════
   FullCalendar — Google Calendar theme
   ─────────────────────────────────────────────────────────────────────────── */

.fc { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif !important; }
.fc .fc-toolbar, .fc .fc-header-toolbar { display: none !important; }

/* ── Grid borders ───────────────────────────────────────────────────────── */
.fc-theme-standard td, .fc-theme-standard th { border-color: #e5e7eb !important; }
.fc-theme-standard .fc-scrollgrid            { border-color: #e5e7eb !important; }

/* ── Day column header ──────────────────────────────────────────────────── */
.fc-col-header-cell { background: #fff !important; border-bottom: 1px solid #e5e7eb !important; }
.fc-col-header-cell-cushion { padding: 0 !important; }

.fc-gcal-header { display: flex; flex-direction: column; align-items: center; padding: 6px 0 10px; gap: 3px; }
.fc-gcal-dayname { font-size: 11px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; color: #6b7280; line-height: 1; }
.fc-gcal-dayname.today { color: #4f46e5; }
.fc-gcal-daynum { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 20px; font-weight: 400; color: #111827; line-height: 1; }
.fc-gcal-daynum.today { background: #4f46e5; color: #fff; font-weight: 600; }

.fc-daygrid .fc-gcal-header { flex-direction: row; gap: 5px; padding: 5px 0 7px; }
.fc-daygrid .fc-gcal-daynum { width: auto; height: auto; font-size: 11px; font-weight: 500; color: #6b7280; background: none !important; }
.fc-daygrid .fc-gcal-daynum.today { color: #4f46e5; background: none !important; font-weight: 700; }

/* ── All-day row ────────────────────────────────────────────────────────── */
.fc-timegrid-axis-cushion { display: none !important; }
.fc-timegrid-axis { width: 52px !important; }
.fc-timegrid-all-day .fc-daygrid-body, .fc-timegrid-all-day-cushion { padding: 1px 0 !important; }
.fc-timegrid-all-day .fc-daygrid-day-frame { min-height: 12px !important; }

/* ── Today column ───────────────────────────────────────────────────────── */
.fc-day-today         { background: rgba(79,70,229,0.025) !important; }
.fc-daygrid-day.fc-day-today { background: rgba(79,70,229,0.04) !important; }

/* ── Time labels ────────────────────────────────────────────────────────── */
.fc-timegrid-slot-label { font-size: 10px !important; color: #9ca3af !important; font-weight: 500; }
.fc-timegrid-slot-label-cushion { padding: 0 6px 0 0 !important; text-align: right; }
.fc-timegrid-slot-minor .fc-timegrid-slot-label-cushion { display: none !important; }

/* ── Time grid ──────────────────────────────────────────────────────────── */
.fc-timegrid-slot { height: 48px !important; }
.fc-timegrid-slot-minor { border-top-style: dashed !important; border-color: #f3f4f6 !important; }

/* ── Now indicator ──────────────────────────────────────────────────────── */
:root { --fc-now-indicator-color: #ef4444; }

/* FC renders the arrow in the time-axis gutter (always far-left) and the   */
/* line inside today's column only — they're in different DOM subtrees.      */
/* Solution: hide the gutter arrow; synthesise the dot via ::before on the  */
/* line so both elements live in today's column.                             */
.fc-timegrid-now-indicator-arrow { display: none !important; }

.fc-timegrid-now-indicator-line {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  height: 0 !important;
  border-width: 2px 0 0 0 !important;
  border-style: solid !important;
  border-color: #ef4444 !important;
  margin-top: -1px !important;
  z-index: 20 !important;
  box-shadow: 0 1px 6px rgba(239,68,68,0.35) !important;
  pointer-events: none !important;
  overflow: visible !important;
}

/* Dot pinned to the left edge of the line, inside today's column */
.fc-timegrid-now-indicator-line::before {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  top: -5px !important;
  width: 10px !important;
  height: 10px !important;
  border-radius: 50% !important;
  background: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239,68,68,0.2) !important;
  z-index: 21 !important;
  display: block !important;
  pointer-events: none !important;
}

/* ── Non-business hours ─────────────────────────────────────────────────── */
.fc-non-business { background: rgba(0,0,0,0.045) !important; }

/* ── Events (time grid) ─────────────────────────────────────────────────── */
.fc-timegrid-event { border-radius: 6px !important; border: none !important; box-shadow: 0 1px 3px rgba(0,0,0,0.15) !important; transition: box-shadow 0.15s, filter 0.15s !important; overflow: hidden !important; }
.fc-timegrid-event:hover { filter: brightness(0.92) !important; box-shadow: 0 3px 8px rgba(0,0,0,0.22) !important; cursor: pointer !important; }
.fc-timegrid-event .fc-event-main { padding: 3px 6px !important; }
.fc-timegrid-event .fc-event-title { font-size: 12px !important; font-weight: 600 !important; line-height: 1.3 !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
.fc-timegrid-event .fc-event-time  { font-size: 10px !important; font-weight: 400 !important; opacity: 0.85 !important; display: block !important; margin-top: 1px !important; }

/* ── Focus events: striped pattern ─────────────────────────────────────── */
.fc-ev-focus .fc-event-main { background: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.08) 4px, rgba(255,255,255,0.08) 8px) !important; }

/* ── Appointment slots: dashed border ──────────────────────────────────── */
.fc-ev-appointment { border: 2px dashed rgba(255,255,255,0.5) !important; }

/* ── Documentation events: subtle left accent to signal linked session ──── */
.fc-ev-documentation { border-left: 3px solid rgba(255,255,255,0.4) !important; }

/* ── Events (month/daygrid) ─────────────────────────────────────────────── */
.fc-daygrid-event { border-radius: 4px !important; border: none !important; font-size: 11px !important; font-weight: 600 !important; padding: 1px 5px !important; box-shadow: 0 1px 2px rgba(0,0,0,0.12) !important; transition: filter 0.15s !important; }
.fc-daygrid-event:hover { filter: brightness(0.9) !important; cursor: pointer !important; }

/* ── Selection highlight ────────────────────────────────────────────────── */
.fc-highlight { background: rgba(79,70,229,0.12) !important; border: 1px solid #818cf8 !important; border-radius: 4px !important; }

/* ── Month day numbers ──────────────────────────────────────────────────── */
.fc-daygrid-day-number { font-size: 12px !important; color: #374151 !important; padding: 6px 8px !important; text-decoration: none !important; }
.fc-day-today .fc-daygrid-day-number { color: #4f46e5 !important; font-weight: 700 !important; }
.fc-daygrid-more-link { font-size: 11px !important; font-weight: 600 !important; color: #4f46e5 !important; }

/* ── Week numbers ───────────────────────────────────────────────────────── */
.fc-week-number { font-size: 10px !important; color: #9ca3af !important; font-weight: 600 !important; }

/* ── List view ──────────────────────────────────────────────────────────── */
.fc-list-event:hover td  { background: #f9fafb !important; cursor: pointer !important; }
.fc-list-event-dot        { border-width: 8px !important; border-radius: 50% !important; }
.fc-list-day-cushion      { background: #f3f4f6 !important; font-size: 12px !important; font-weight: 600 !important; color: #374151 !important; }
.fc-list-event-title a    { color: #111827 !important; font-size: 13px !important; }
.fc-list-event-time       { color: #6b7280 !important; font-size: 12px !important; }

/* ── Scrollbar ──────────────────────────────────────────────────────────── */
.fc-scroller::-webkit-scrollbar       { width: 6px; height: 6px; }
.fc-scroller::-webkit-scrollbar-track { background: transparent; }
.fc-scroller::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
.fc-scroller::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

/* ── Task event ─────────────────────────────────────────────────────────── */
/* Circle injected into .fc-event-main via eventDidMount DOM manipulation   */
.fc-task-check {
  flex-shrink: 0;
  width: 14px; height: 14px;
  margin-top: 1px;
  border: 1.5px solid rgba(255,255,255,0.75);
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: transform 0.12s, background 0.12s, border-color 0.12s;
  font-size: 10px; font-weight: 700; color: #fff;
}
.fc-task-check:hover { border-color: #fff; transform: scale(1.18); }

/* Done state — driven by .fc-ev-done class on the event element */
.fc-ev-done .fc-task-check { background: rgba(255,255,255,0.25); border-color: #fff; }
.fc-ev-done .fc-task-check::before { content: '✓'; line-height: 1; }
.fc-ev-done .fc-event-title { text-decoration: line-through !important; opacity: 0.55 !important; }

/* Cancelled state — driven by .fc-ev-cancelled class on the event element */
.fc-ev-cancelled { opacity: 0.55 !important; filter: grayscale(0.4) !important; }
.fc-ev-cancelled .fc-event-title { text-decoration: line-through !important; }
.fc-ev-cancelled .fc-event-main {
  background: repeating-linear-gradient(
    -45deg,
    transparent, transparent 4px,
    rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px
  ) !important;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Dark mode overrides
   ─────────────────────────────────────────────────────────────────────────── */
.dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #334155 !important; }
.dark .fc-theme-standard .fc-scrollgrid { border-color: #334155 !important; }
.dark .fc-col-header-cell { background: #0f172a !important; border-bottom-color: #334155 !important; }
.dark .fc-gcal-dayname                 { color: #94a3b8; }
.dark .fc-gcal-dayname.today           { color: #818cf8; }
.dark .fc-gcal-daynum                  { color: #e2e8f0; }
.dark .fc-gcal-daynum.today            { background: #4f46e5; color: #fff; }
.dark .fc-daygrid .fc-gcal-daynum      { color: #94a3b8 !important; }
.dark .fc-daygrid .fc-gcal-daynum.today { color: #818cf8 !important; }
.dark .fc-day-today                    { background: rgba(79,70,229,0.08) !important; }
.dark .fc-daygrid-day.fc-day-today     { background: rgba(79,70,229,0.1) !important; }
.dark .fc-timegrid-slot-label          { color: #64748b !important; }
.dark .fc-timegrid-slot-minor          { border-top-color: #1e293b !important; }
.dark .fc-non-business                 { background: rgba(0,0,0,0.25) !important; }
.dark .fc-highlight                    { background: rgba(99,102,241,0.2) !important; border-color: #6366f1 !important; }
.dark .fc-daygrid-day-number           { color: #94a3b8 !important; }
.dark .fc-day-today .fc-daygrid-day-number { color: #818cf8 !important; }
.dark .fc-daygrid-more-link            { color: #818cf8 !important; }
.dark .fc-week-number                  { color: #475569 !important; }
.dark .fc-list-event:hover td          { background: #1e293b !important; }
.dark .fc-list-day-cushion             { background: #1e293b !important; color: #94a3b8 !important; }
.dark .fc-list-event-title a           { color: #e2e8f0 !important; }
.dark .fc-list-event-time              { color: #94a3b8 !important; }
.dark .fc-list-table td                { border-color: #334155 !important; }
.dark .fc-list-empty                   { background: #0f172a !important; color: #64748b !important; }
.dark .fc-scroller::-webkit-scrollbar-thumb       { background: #475569; }
.dark .fc-scroller::-webkit-scrollbar-thumb:hover { background: #64748b; }
</style>
