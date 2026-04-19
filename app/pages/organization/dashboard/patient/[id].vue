<script setup lang="ts">
import { ArrowLeft, Mail, Phone } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()

const patient = computed(() => ({
  id: route.params.id as string,
  name: 'New Patient',
  initials: 'NP',
  email: '',
  phone: '',
  status: 'active' as const,
}))

const tabs = [
  { value: 'general',         label: 'General' },
  { value: 'clinical-record', label: 'Clinical record' },
  { value: 'sessions',        label: 'Sessions' },
  { value: 'tasks',           label: 'Tasks' },
  { value: 'files',           label: 'Files' },
  { value: 'billing',         label: 'Billing' },
  { value: 'settings',        label: 'Settings' },
]
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-6 max-w-[1100px]">

      <div class="flex items-center gap-2 text-sm">
        <Button variant="ghost" size="icon-sm" @click="navigateTo('/organization/dashboard/patients')">
          <ArrowLeft class="w-4 h-4" />
        </Button>
        <span class="text-muted-foreground cursor-pointer hover:text-foreground" @click="navigateTo('/organization/dashboard/patients')">Patients</span>
        <span class="text-muted-foreground/40">/</span>
        <span class="font-medium text-foreground">{{ patient.name }}</span>
      </div>

      <div class="flex items-center gap-4">
        <Avatar class="size-14">
          <AvatarImage :src="avatarUrl(patient.name)" :alt="patient.name" />
          <AvatarFallback class="bg-primary/10 text-primary font-bold text-lg">{{ patient.initials }}</AvatarFallback>
        </Avatar>
        <div>
          <h1 class="text-2xl font-bold text-foreground tracking-tight">{{ patient.name }}</h1>
          <div class="flex items-center gap-3 mt-1 flex-wrap">
            <span v-if="patient.email" class="flex items-center gap-1 text-sm text-muted-foreground"><Mail class="w-3.5 h-3.5" />{{ patient.email }}</span>
            <span v-if="patient.phone" class="flex items-center gap-1 text-sm text-muted-foreground"><Phone class="w-3.5 h-3.5" />{{ patient.phone }}</span>
            <Badge variant="outline" class="border-green-200 text-green-700 bg-green-50 gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500" />Active
            </Badge>
          </div>
        </div>
      </div>

      <Tabs default-value="general">
        <TabsList class="w-full justify-start">
          <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" class="mt-6">
          <PatientGeneralTab />
        </TabsContent>
        <TabsContent value="clinical-record" class="mt-6">
          <PatientClinicalRecordTab />
        </TabsContent>
        <TabsContent value="sessions" class="mt-6">
          <PatientSessionsTab />
        </TabsContent>
        <TabsContent value="tasks" class="mt-6">
          <PatientTasksTab />
        </TabsContent>
        <TabsContent value="files" class="mt-6">
          <PatientFilesTab />
        </TabsContent>
        <TabsContent value="billing" class="mt-6">
          <PatientBillingTab :patient-id="(route.params.id as string)" />
        </TabsContent>
        <TabsContent value="settings" class="mt-6">
          <PatientSettingsTab />
        </TabsContent>
      </Tabs>

    </div>
  </div>
</template>
