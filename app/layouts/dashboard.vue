<script setup lang="ts">
import { createDashboardShell, SHELL_KEY } from '~/composables/useDashboard'
import type { NewSession } from '~/components/ScheduleSessionModal.vue'
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar'

const shell = createDashboardShell()
provide(SHELL_KEY, shell)

// Sync persona role from route so the sidebar profile + header always reflect
// the correct role regardless of whether onboarding was completed first.
const route = useRoute()
const { persona } = usePersona()
watch(() => route.path, (path) => {
  if (path.startsWith('/organization/')) persona.value.role = 'organization'
  else if (path.startsWith('/doctor/'))   persona.value.role = 'doctor'
}, { immediate: true })

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
  <SidebarProvider>
    <div class="fixed inset-0 flex overflow-hidden bg-background">
      <!-- Left sidebar -->
      <ShellNav />

      <!-- Main content area -->
      <SidebarInset>
        <ShellHeader />
        <main class="flex-1 overflow-hidden flex flex-col min-h-0">
          <slot />
        </main>
      </SidebarInset>

      <!-- Right AI sidebar -->
      <NoeiaSidebar />

      <!-- LinkedIn-style messaging widget -->
      <MessagingWidget />
    </div>
  </SidebarProvider>

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
