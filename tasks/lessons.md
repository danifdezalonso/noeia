# Lessons Learned

## CSS / Layout

### Dashboard full-height layout
- `flex-1` fails when `NuxtLayout` inserts unstyled wrapper divs — breaks flex height chain
- `h-screen` (100vh) also fails when Nuxt wrapper constrains it
- **Rule**: Use `fixed inset-0` on the layout root — only pattern that guarantees 100% viewport regardless of parent chain
- `overflow-y-auto` on `main` breaks flex-1 height computation for children → use `overflow-hidden` on `main` and let each page own its own scroll container

### FullCalendar height
- `height: '100%'` requires the FC container to have a computed height (not just flex-1 in some parent)
- Use `absolute inset-0` on CalendarView inside a `relative` container div

### FullCalendar now-indicator
- `border-width: 2px` sets all 4 borders — FC draws the line via `border-top` only → results in invisible box
- **Rule**: Always use `border-top: 2px solid ... !important; border-right: none !important; ...`

### `<ClientOnly>` and flex
- ClientOnly can insert an unstyled div that breaks flex height propagation
- Workaround: use `absolute inset-0` on the child inside ClientOnly

## FullCalendar v6 Vue3 Wrapper

### eventContent returning undefined
- If `eventContent` returns undefined/null, FC renders BLANK events (no fallback to default rendering)
- **Rule**: Never use `eventContent` unless you handle every case. Use `eventDidMount` for DOM injection instead.

### scrollToTime timing
- `onMounted` + `setTimeout(150ms)` is unreliable — FC finishes internal layout AFTER Vue's tick AND after 150ms sometimes
- `setOption(slotMinTime/Max)` triggers a re-render that fires AFTER `scrollToTime`, resetting scroll position
- **Rule**: Use `datesSet` callback with a one-shot `let firstLoad = true` flag. `datesSet` fires when FC's view is actually ready. Call `scrollToTime` in a `setTimeout(50)` inside `datesSet`.

### Reactive options and scroll position
- When computed options re-evaluate (e.g. events change), FC may re-apply scrollTime which resets scroll
- `slotMinTime`/`slotMaxTime` in computed are fine if FC defaults already match — avoids `setOption` re-render race

### Sidebar collapsed icon centering
- Fixed `px-2.5` padding left-aligns icons in collapsed 56px rail
- **Rule**: Conditionally apply `justify-center px-2` when collapsed vs `px-2.5` when open

## Vue 3 / Nuxt 3

### Global modal state
- Use `useState('key', () => false)` in a composable (`useGlobalModals.ts`) for SSR-safe shared modal state
- Render global modals in `dashboard.vue` layout so they work on any page
- Modals that use `<Teleport to="body">` work correctly when rendered in layout

### Type exports from `.vue` files
- Can `export interface Foo {}` in `<script setup lang="ts">` and import with `import type { Foo } from '~/components/...'`

## Debugging Patterns

### Calendar shows wrong time range / wrong scroll position
1. Check `scrollTime` in computed options — FC may ignore it on reactive re-evaluations
2. Check if `setOption` calls in onMounted are racing with scroll
3. Fix: use `datesSet` one-shot scroll

### Calendar doesn't fill viewport height
1. Trace the full parent chain for heights: `fixed inset-0` → ShellHeader → middle flex row → main → page root → calendar body → CalendarView
2. Check if `overflow-y-auto` on any flex container is breaking `flex-1` children
3. Check if `<ClientOnly>` is inserting an unstyled div
4. Nuclear option: `absolute inset-0` on the calendar container bypasses all flex issues
