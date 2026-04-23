<script setup lang="ts">
import {
  ArrowLeft, Pencil, MoreHorizontal, Building2, AlertCircle, X,
} from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage }  from '~/components/ui/avatar'
import { Badge }      from '~/components/ui/badge'
import { Button }     from '~/components/ui/button'
import { Switch }     from '~/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import { Alert, AlertDescription } from '~/components/ui/alert'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '~/components/ui/tooltip'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '~/components/ui/popover'

definePageMeta({ layout: 'dashboard' })

const route    = useRoute()
const doctorId = route.params.doctorId as string

// ── Mock doctor pool ───────────────────────────────────────────────────────────

const DOCTORS = [
  { id: 'd1', name: 'Elena Voss Martínez', initials: 'EV', title: 'Psicóloga Clínica · Terapeuta EMDR',     role: 'Psicóloga',   active: true,  colegiado: 'M-12345' },
  { id: 'd2', name: 'Marco Silva',          initials: 'MS', title: 'Psiquiatra · Especialista en Adicciones', role: 'Psiquiatra',  active: true,  colegiado: 'M-67890' },
  { id: 'd3', name: 'Priya Nair',           initials: 'PN', title: 'Psicóloga · Especialista en Trauma',      role: 'Psicóloga',   active: true,  colegiado: 'M-11223' },
  { id: 'd4', name: 'James Okafor',         initials: 'JO', title: 'Psicólogo · Terapia de Grupo',            role: 'Psicólogo',   active: true,  colegiado: 'M-44556' },
  { id: 'd5', name: 'Sofia Reyes',          initials: 'SR', title: 'Psicóloga Infanto-Juvenil',               role: 'Psicóloga',   active: true,  colegiado: ''        },
  { id: 'd6', name: 'Lena Brandt',          initials: 'LB', title: 'Neuropsicóloga Clínica',                  role: 'Supervisora', active: false, colegiado: 'M-99887' },
  { id: 'd7', name: 'Elena Voss Martínez', initials: 'EV', title: 'Psicóloga Clínica · Terapeuta EMDR',     role: 'Psicóloga',   active: true,  colegiado: 'M-12345' },
  { id: 'd8', name: 'Clara Müller',         initials: 'CM', title: 'Psicóloga · Terapia de Pareja y Familia', role: 'Psicóloga',   active: false, colegiado: ''        },
]

const found  = DOCTORS.find(d => d.id === doctorId) ?? DOCTORS[0]
const doctor = reactive({ ...found })

// ── State ──────────────────────────────────────────────────────────────────────

const activeTab = ref('public')
const editMode  = ref(false)

const hasLicense    = computed(() => !!doctor.colegiado?.trim())
const orgName       = 'MindCare Clinics'
const otherOrgs     = ['Centro Serena']
const otherOrgsOpen = ref(false)

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
        <span
          class="text-muted-foreground cursor-pointer hover:text-foreground"
          @click="navigateTo('/organization/dashboard/doctors')"
        >Doctores</span>
        <span class="text-muted-foreground/40">/</span>
        <span class="font-medium text-foreground">{{ doctor.name }}</span>
      </div>

      <!-- Alert: sin nº de colegiado -->
      <Alert v-if="!hasLicense" variant="destructive" class="border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300">
        <AlertCircle class="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription class="text-sm">
          Completa los datos de colegiación para activar a este profesional.
          Sin el número de colegiado no puede ejercer.
        </AlertDescription>
      </Alert>

      <!-- Page header -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <Avatar class="size-20 shrink-0">
            <AvatarImage :src="avatarUrl(doctor.name)" :alt="doctor.name" />
            <AvatarFallback class="bg-primary/10 text-primary font-bold text-2xl">{{ doctor.initials }}</AvatarFallback>
          </Avatar>
          <div class="space-y-1.5">
            <!-- Name + role badge + multi-org badge -->
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-2xl font-bold text-foreground tracking-tight">{{ doctor.name }}</h1>
              <Badge variant="secondary" class="text-xs font-medium">{{ doctor.role }}</Badge>
              <Popover v-if="otherOrgs.length" v-model:open="otherOrgsOpen">
                <PopoverTrigger as-child>
                  <Badge
                    variant="outline"
                    class="text-xs gap-1 cursor-pointer border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <Building2 class="w-3 h-3" />
                    También en otras organizaciones
                  </Badge>
                </PopoverTrigger>
                <PopoverContent class="w-60 p-3" align="start">
                  <p class="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Otras organizaciones</p>
                  <div class="space-y-1.5">
                    <div
                      v-for="org in otherOrgs"
                      :key="org"
                      class="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Building2 class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {{ org }}
                    </div>
                  </div>
                  <p class="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                    Los cambios que hagas aquí solo afectan a su perfil en {{ orgName }}.
                  </p>
                </PopoverContent>
              </Popover>
            </div>

            <p class="text-sm text-muted-foreground">{{ doctor.title }}</p>

            <!-- Active toggle -->
            <TooltipProvider :delay-duration="200">
              <Tooltip>
                <TooltipTrigger as-child>
                  <div class="flex items-center gap-2">
                    <Switch
                      v-model="doctor.active"
                      :disabled="!hasLicense"
                      class="data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed"
                    />
                    <span
                      class="text-sm font-medium"
                      :class="!hasLicense ? 'text-muted-foreground' : doctor.active ? 'text-foreground' : 'text-muted-foreground'"
                    >
                      Activo en {{ orgName }}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" class="max-w-[220px] text-xs leading-relaxed">
                  Controla si este profesional está disponible en {{ orgName }}.
                  No afecta a su cuenta global ni a sus otras organizaciones.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <!-- Header actions -->
        <div class="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" class="gap-1.5" @click="toggleEdit">
            <Pencil class="w-3.5 h-3.5" />
            {{ editMode ? 'Cancelar edición' : 'Editar perfil' }}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm" class="gap-1.5">
                <MoreHorizontal class="w-4 h-4" />
                Acciones
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-52">
              <DropdownMenuItem>Cambiar rol</DropdownMenuItem>
              <DropdownMenuItem>Reasignar pacientes</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-amber-600 dark:text-amber-400 focus:text-amber-600 dark:focus:text-amber-400">
                Suspender en esta organización
              </DropdownMenuItem>
              <DropdownMenuItem class="text-destructive focus:text-destructive">
                Quitar de la organización
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Tabs -->
      <Tabs v-model="activeTab">
        <TabsList class="w-full justify-start">
          <TabsTrigger value="public">Perfil público</TabsTrigger>
          <TabsTrigger value="internal">Información interna</TabsTrigger>
        </TabsList>

        <TabsContent value="public" class="mt-6">
          <DoctorPublicProfileTab :doctor-id="doctorId" :edit-mode="editMode" :org-name="orgName" />
        </TabsContent>
        <TabsContent value="internal" class="mt-6">
          <DoctorInternalInfoTab :doctor-id="doctorId" :edit-mode="editMode" :org-name="orgName" />
        </TabsContent>
      </Tabs>

    </div>
  </div>
</template>
