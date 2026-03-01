<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarEvent } from '~/composables/useCalendar'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '~/components/ui/alert-dialog'

const props = defineProps<{ events?: CalendarEvent[] }>()

const cal = useCalendar()
const {
  viewMode, currentTitle,
  hideWeekends, showWeekNums, slotDuration, workHours,
  openQuickCreate, openEventView, moveEvent, toggleTaskDone, openContextMenu,
} = cal

// Use prop events if provided, otherwise fall back to composable events
const activeEvents = computed(() => props.events ?? cal.events.value)

const calendarRef   = ref<InstanceType<typeof FullCalendar>>()
const showMoveConfirm = ref(false)
const pendingMove     = ref<{ eventId: string; title: string; newStart: string; newEnd: string; allDay: boolean; revertFn: () => void } | null>(null)

function confirmMove() {
  if (pendingMove.value) moveEvent(pendingMove.value.eventId, pendingMove.value.newStart, pendingMove.value.newEnd, pendingMove.value.allDay)
  pendingMove.value   = null
  showMoveConfirm.value = false
}

function cancelMove() {
  pendingMove.value?.revertFn()
  pendingMove.value   = null
  showMoveConfirm.value = false
}

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
      start: ev.allDay ? ev.start.split('T')[0] : ev.start,
      end:   ev.allDay ? ev.end.split('T')[0]   : ev.end,
      allDay: ev.allDay ?? false,
      backgroundColor: bg,
      textColor: style.text,
      borderColor: 'transparent',
      // classNames on the event object itself — FC compares these as a standard
      // prop and re-renders the element whenever the array contents change
      // (e.g. cancelled toggled). eventClassNames callback is kept as fallback.
      classNames: [
        `fc-ev-${ev.category}`,
        ...(ev.done      ? ['fc-ev-done']      : []),
        ...(ev.allDay    ? ['fc-ev-allday']    : []),
        ...(ev.cancelled ? ['fc-ev-cancelled'] : []),
      ],
      extendedProps: {
        category:       ev.category,
        done:           !!ev.done,
        cancelled:      !!ev.cancelled,
        allDay:         !!ev.allDay,
        modality:       ev.modality ?? null,
        hasDescription: !!ev.description,
        hasNotification: ev.notification !== undefined && ev.notification !== -1,
        isPrivate:      ev.visibility === 'private',
      },
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

  // Called by FC every time an event is rendered — guarantees classes are
  // always in sync with the latest extendedProps (unlike per-event classNames
  // which FC may cache when doing efficient partial updates).
  eventClassNames: (info: any) => {
    const p = info.event.extendedProps
    return [
      `fc-ev-${p.category}`,
      ...(p.done      ? ['fc-ev-done']      : []),
      ...(p.allDay    ? ['fc-ev-allday']    : []),
      ...(p.cancelled ? ['fc-ev-cancelled'] : []),
    ]
  },

  select: (info: any) => {
    openQuickCreate(
      toLocalIso(info.start),
      toLocalIso(info.end),
      info.jsEvent?.clientX ?? 400,
      info.jsEvent?.clientY ?? 300,
      info.allDay ?? false,
    )
    // Immediately clear the selection mirror so it doesn't overlap the new event after save
    nextTick(() => calendarRef.value?.getApi()?.unselect())
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
    if (ev) openEventView(ev, info.jsEvent.clientX, info.jsEvent.clientY)
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
    if (info.event.extendedProps.category === 'task') {
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

    // ── Property icons (modality, description, notification, privacy) ───────
    const p = info.event.extendedProps
    const svgWrap = (path: string) =>
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`
    const iconParts: string[] = []
    if (p.modality === 'online')
      iconParts.push(svgWrap('<path d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.311a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>'))
    if (p.modality === 'inperson')
      iconParts.push(svgWrap('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>'))
    if (p.hasDescription)
      iconParts.push(svgWrap('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'))
    if (p.hasNotification)
      iconParts.push(svgWrap('<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>'))
    if (p.isPrivate)
      iconParts.push(svgWrap('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>'))

    if (iconParts.length > 0) {
      const timeEl = info.el.querySelector('.fc-event-time') as HTMLElement | null
      if (timeEl && !timeEl.querySelector('.fc-ev-icons')) {
        const span = document.createElement('span')
        span.className = 'fc-ev-icons'
        span.innerHTML = iconParts.join('')
        timeEl.insertBefore(span, timeEl.firstChild)
      } else if (!timeEl) {
        // All-day events: inject into title
        const titleEl = info.el.querySelector('.fc-event-title') as HTMLElement | null
        if (titleEl && !titleEl.querySelector('.fc-ev-icons')) {
          const span = document.createElement('span')
          span.className = 'fc-ev-icons'
          span.innerHTML = iconParts.join('')
          titleEl.insertBefore(span, titleEl.firstChild)
        }
      }
    }
  },

  eventDrop: (info: any) => {
    const isAllDay = info.event.allDay as boolean
    const endDate  = info.event.end ?? info.event.start
    const newStart = isAllDay ? toLocalIso(info.event.start).split('T')[0] : toLocalIso(info.event.start)
    const newEnd   = isAllDay ? toLocalIso(endDate).split('T')[0]          : toLocalIso(endDate)
    // Do NOT call info.revert() here — keep the event at the dropped position visually.
    // revertFn is stored so Cancel can undo the visual move.
    pendingMove.value   = { eventId: info.event.id, title: info.event.title, newStart, newEnd, allDay: isAllDay, revertFn: info.revert }
    showMoveConfirm.value = true
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

  <!-- Move event confirmation -->
  <AlertDialog :open="showMoveConfirm">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Move event?</AlertDialogTitle>
        <AlertDialogDescription>
          Move "{{ pendingMove?.title }}" to the new time?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="cancelMove">Cancel</AlertDialogCancel>
        <AlertDialogAction @click="confirmMove">Move</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
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

/* ── Event property icons ───────────────────────────────────────────────── */
.fc-ev-icons {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-right: 3px;
  vertical-align: middle;
  flex-wrap: nowrap;
}
.fc-ev-icons svg {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  opacity: 0.85;
  color: inherit;
}

/* ── All-day row ────────────────────────────────────────────────────────── */
.fc-timegrid-axis-cushion { display: none !important; }
.fc-timegrid-axis { width: 52px !important; }
/* In FC v6 the all-day area = the non-liquid body section.
   fc-scroller-harness has overflow:hidden by default which clips event chips.
   Override it and guarantee enough height for at least one chip row. */
.fc-scrollgrid-section-body:not(.fc-scrollgrid-section-liquid) .fc-scroller-harness { overflow: visible !important; }
.fc-scrollgrid-section-body:not(.fc-scrollgrid-section-liquid) .fc-scroller        { overflow: visible !important; }
.fc-scrollgrid-section-body:not(.fc-scrollgrid-section-liquid) .fc-daygrid-day-frame { min-height: 2.5em !important; }

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
.dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #222222 !important; }
.dark .fc-theme-standard .fc-scrollgrid { border-color: #222222 !important; }
.dark .fc-col-header-cell { background: #0A0A0A !important; border-bottom-color: #222222 !important; }
.dark .fc-gcal-dayname                 { color: #94a3b8; }
.dark .fc-gcal-dayname.today           { color: #818cf8; }
.dark .fc-gcal-daynum                  { color: #e2e8f0; }
.dark .fc-gcal-daynum.today            { background: #4f46e5; color: #fff; }
.dark .fc-daygrid .fc-gcal-daynum      { color: #94a3b8 !important; }
.dark .fc-daygrid .fc-gcal-daynum.today { color: #818cf8 !important; }
.dark .fc-day-today                    { background: rgba(79,70,229,0.08) !important; }
.dark .fc-daygrid-day.fc-day-today     { background: rgba(79,70,229,0.1) !important; }
.dark .fc-timegrid-slot-label          { color: #64748b !important; }
.dark .fc-timegrid-slot-minor          { border-top-color: #181818 !important; }
.dark .fc-non-business                 { background: rgba(0,0,0,0.25) !important; }
.dark .fc-highlight                    { background: rgba(99,102,241,0.2) !important; border-color: #6366f1 !important; }
.dark .fc-daygrid-day-number           { color: #94a3b8 !important; }
.dark .fc-day-today .fc-daygrid-day-number { color: #818cf8 !important; }
.dark .fc-daygrid-more-link            { color: #818cf8 !important; }
.dark .fc-week-number                  { color: #475569 !important; }
.dark .fc-list-event:hover td          { background: #1c1c1c !important; }
.dark .fc-list-day-cushion             { background: #181818 !important; color: #94a3b8 !important; }
.dark .fc-list-event-title a           { color: #e2e8f0 !important; }
.dark .fc-list-event-time              { color: #94a3b8 !important; }
.dark .fc-list-table td                { border-color: #334155 !important; }
.dark .fc-list-empty                   { background: #0A0A0A !important; color: #64748b !important; }
.dark .fc-scroller::-webkit-scrollbar-thumb       { background: #333333; }
.dark .fc-scroller::-webkit-scrollbar-thumb:hover { background: #444444; }
</style>
