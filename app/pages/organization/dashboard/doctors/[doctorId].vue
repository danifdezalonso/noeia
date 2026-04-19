<script setup lang="ts">
import { ArrowLeft, Pencil, Check } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge }  from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const doctorId = route.params.doctorId as string

// ── Mock doctor pool (mirrors doctors.vue) ────────────────────────────────────

const DOCTORS = [
  { id: 'd1', name: 'Elena Voss',    initials: 'EV', title: 'Psicóloga Clínica · Terapeuta EMDR',     role: 'Psicóloga',   active: true  },
  { id: 'd2', name: 'Marco Silva',   initials: 'MS', title: 'Psiquiatra · Especialista en Adicciones', role: 'Psiquiatra',  active: true  },
  { id: 'd3', name: 'Priya Nair',    initials: 'PN', title: 'Psicóloga · Especialista en Trauma',      role: 'Psicóloga',   active: true  },
  { id: 'd4', name: 'James Okafor',  initials: 'JO', title: 'Psicólogo · Terapia de Grupo',            role: 'Psicólogo',   active: true  },
  { id: 'd5', name: 'Sofia Reyes',   initials: 'SR', title: 'Psicóloga Infanto-Juvenil',               role: 'Psicóloga',   active: true  },
  { id: 'd6', name: 'Lena Brandt',   initials: 'LB', title: 'Neuropsicóloga Clínica',                  role: 'Supervisora', active: false },
  { id: 'd7', name: 'Aarav Patel',   initials: 'AP', title: 'Psicólogo · Adicciones y Conducta',       role: 'Psicólogo',   active: true  },
  { id: 'd8', name: 'Clara Müller',  initials: 'CM', title: 'Psicóloga · Terapia de Pareja y Familia', role: 'Psicóloga',   active: false },
]

const found  = DOCTORS.find(d => d.id === doctorId) ?? DOCTORS[0]
const doctor = reactive({ ...found })

const activeTab = ref('public')
const editMode  = ref(false)

function toggleEdit() {
  editMode.value = !editMode.value
}
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-6 max-w-[1100px]">

      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm">
        <Button variant="ghost" size="icon-sm" @click="navigateTo('/organization/dashboard/doctors')">
          <ArrowLeft class="w-4 h-4" />
        </Button>
        <span class="text-muted-foreground cursor-pointer hover:text-foreground" @click="navigateTo('/organization/dashboard/doctors')">Doctors</span>
        <span class="text-muted-foreground/40">/</span>
        <span class="font-medium text-foreground">{{ doctor.name }}</span>
      </div>

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
          <DoctorPublicProfileTab :doctor-id="doctorId" :edit-mode="editMode" />
        </TabsContent>
        <TabsContent value="internal" class="mt-6">
          <DoctorInternalInfoTab :doctor-id="doctorId" :edit-mode="editMode" />
        </TabsContent>
      </Tabs>

    </div>
  </div>
</template>
