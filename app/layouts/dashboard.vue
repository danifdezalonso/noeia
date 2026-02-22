<script setup lang="ts">
import { createDashboardShell, SHELL_KEY } from '~/composables/useDashboard'
import type { NewSession } from '~/components/ScheduleSessionModal.vue'

const shell = createDashboardShell()
provide(SHELL_KEY, shell)

const { sessionModalOpen, patientModalOpen, billModalOpen } = useGlobalModals()
const { saveEvent } = useCalendar()

// When a session is saved from the global header CTA, add it to the calendar
function onHeaderSessionSaved(data: NewSession) {
  saveEvent({
    title:       data.title,
    start:       data.start,
    end:         data.end,
    category:    'session',
    patientId:   data.patientId,
    patientName: data.patientName,
    modality:    data.modality,
    meetingLink: data.meetingLink,
    location:    data.location,
  })
  sessionModalOpen.value = false
}
</script>

<template>
  <div class="fixed inset-0 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
    <ShellHeader />
    <div class="flex flex-1 overflow-hidden min-h-0 relative">

      <!-- Mobile sidebar backdrop -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200"
        leave-to-class="opacity-0"
      >
        <div
          v-if="shell.mobileNavOpen.value"
          class="fixed top-14 inset-x-0 bottom-0 z-30 bg-black/40 md:hidden"
          @click="shell.mobileNavOpen.value = false"
        />
      </Transition>

      <ShellNav />

      <main class="flex-1 overflow-hidden flex flex-col min-w-0 min-h-0">
        <slot />
      </main>
    </div>
  </div>

  <!-- ── Global modals (Teleported to body) ─────────────────────────────── -->
  <ScheduleSessionModal
    v-if="sessionModalOpen"
    @close="sessionModalOpen = false"
    @save="onHeaderSessionSaved"
  />
  <AddPatientModal
    v-if="patientModalOpen"
    :existing-patients="[]"
    @close="patientModalOpen = false"
    @save="patientModalOpen = false"
  />
  <NewBillModal
    v-if="billModalOpen"
    @close="billModalOpen = false"
    @save="billModalOpen = false"
  />
</template>
