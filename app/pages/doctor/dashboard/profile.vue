<script setup lang="ts">
import { Pencil, Check } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge }  from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'

definePageMeta({ layout: 'dashboard' })

const doctor = reactive({
  id:       'me',
  name:     'Elena Voss',
  initials: 'EV',
  title:    'Psicóloga Clínica · Terapeuta EMDR',
  role:     'Psicóloga',
  active:   true,
})

const activeTab = ref('public')
const editMode  = ref(false)

function toggleEdit() {
  editMode.value = !editMode.value
}
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-6 max-w-[1100px]">

      <!-- Page header -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <Avatar class="size-20 shrink-0">
            <AvatarImage :src="avatarUrl(doctor.name)" :alt="doctor.name" />
            <AvatarFallback class="bg-primary/10 text-primary font-bold text-2xl">{{ doctor.initials }}</AvatarFallback>
          </Avatar>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-2xl font-bold text-foreground tracking-tight">{{ doctor.name }}</h1>
              <Badge variant="secondary" class="text-xs font-medium">{{ doctor.role }}</Badge>
            </div>
            <p class="text-sm text-muted-foreground mt-0.5">{{ doctor.title }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="doctor.active ? 'bg-emerald-500' : 'bg-muted-foreground'"
              />
              <span class="text-sm" :class="doctor.active ? 'text-emerald-600' : 'text-muted-foreground'">
                {{ doctor.active ? 'Activo' : 'Inactivo' }}
              </span>
              <Switch v-model="doctor.active" class="ml-1" />
            </div>
          </div>
        </div>

        <Button
          :variant="editMode ? 'default' : 'outline'"
          size="sm"
          class="gap-1.5 shrink-0"
          @click="toggleEdit"
        >
          <component :is="editMode ? Check : Pencil" class="w-3.5 h-3.5" />
          {{ editMode ? 'Guardar cambios' : 'Editar perfil' }}
        </Button>
      </div>

      <!-- Tabs -->
      <Tabs v-model="activeTab">
        <TabsList class="w-full justify-start">
          <TabsTrigger value="public">Perfil público</TabsTrigger>
          <TabsTrigger value="internal">Información interna</TabsTrigger>
        </TabsList>

        <TabsContent value="public" class="mt-6">
          <DoctorPublicProfileTab doctor-id="me" :edit-mode="editMode" />
        </TabsContent>
        <TabsContent value="internal" class="mt-6">
          <DoctorInternalInfoTab doctor-id="me" :edit-mode="editMode" />
        </TabsContent>
      </Tabs>

    </div>
  </div>
</template>
