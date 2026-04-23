<script setup lang="ts">
import {
  User, CreditCard, Building, DoorOpen, Lock, ExternalLink, Info,
} from 'lucide-vue-next'
import { Button }    from '~/components/ui/button'
import { Badge }     from '~/components/ui/badge'
import { Switch }    from '~/components/ui/switch'
import { Separator } from '~/components/ui/separator'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from '~/components/ui/card'
import { Alert, AlertDescription } from '~/components/ui/alert'

defineProps<{ orgName: string }>()

// ── Mock data (read-only — all owned by the org or user-global) ───────────────

const identity = {
  firstName:              'Elena',
  lastName:               'Voss Martínez',
  dni:                    '12345678A',
  dob:                    '12/06/1985',
  license_number:         'M-12345',
  professional_association: 'Colegio Oficial de Psicólogos de Madrid',
  specialty:              'Psicología Clínica',
}

const membership = {
  role:           'Clinician',
  employment_type: 'Colaboradora',
  start_date:     '15/09/2023',
  supervisor:     'Dr. Torres',
  permissions: {
    viewAllPatients:          false,
    manageBilling:            false,
    manageOtherCalendars:     false,
    manageOtherProfessionals: false,
  },
}

const resources = {
  rooms:       ['Sala 2', 'Sala 4'],
  max_capacity: 25,
}
</script>

<template>
  <div class="space-y-6 pb-28">

    <!-- ── Identidad profesional (read-only, global) ──────────────────────────── -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
            <User class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle class="text-base">Identidad profesional</CardTitle>
            <CardDescription class="text-xs mt-0.5">Datos legales y credenciales</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5">
        <Alert class="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <Info class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            Estos datos son globales para toda tu cuenta Noeia.
            Para modificarlos, ve a <strong>Mi cuenta</strong>.
          </AlertDescription>
        </Alert>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-muted-foreground mb-1">Nombre</p>
            <p class="text-sm text-foreground">{{ identity.firstName }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">Apellidos</p>
            <p class="text-sm text-foreground">{{ identity.lastName }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">DNI / NIF</p>
            <p class="text-sm font-mono text-foreground">{{ identity.dni }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">Fecha de nacimiento</p>
            <p class="text-sm text-foreground">{{ identity.dob }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">Nº de colegiado</p>
            <p class="text-sm font-mono text-foreground">{{ identity.license_number }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">Colegio profesional</p>
            <p class="text-sm text-foreground">{{ identity.professional_association }}</p>
          </div>
          <div class="sm:col-span-2">
            <p class="text-xs text-muted-foreground mb-1">Especialidad</p>
            <p class="text-sm text-foreground">{{ identity.specialty }}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter class="pt-3 border-t border-border">
        <Button variant="outline" size="sm" class="gap-1.5 text-xs" @click="navigateTo('/doctor/dashboard/account')">
          <ExternalLink class="w-3.5 h-3.5" />
          Editar en Mi cuenta
        </Button>
      </CardFooter>
    </Card>

    <!-- ── Mi vinculación con la organización (read-only, admin-owned) ─────────── -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center shrink-0">
            <Building class="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <CardTitle class="text-base">Mi vinculación con {{ orgName }}</CardTitle>
            <CardDescription class="text-xs mt-0.5">Rol, permisos y condiciones en esta organización</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-5">
        <p class="text-xs text-muted-foreground">
          Esta información la gestiona el administrador de la organización.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-muted-foreground mb-1">Rol</p>
            <p class="text-sm text-foreground">{{ membership.role }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">Tipo de vinculación</p>
            <p class="text-sm text-foreground">{{ membership.employment_type }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">Fecha de alta</p>
            <p class="text-sm text-foreground">{{ membership.start_date }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">Supervisor clínico</p>
            <p class="text-sm text-foreground">{{ membership.supervisor }}</p>
          </div>
        </div>

        <Separator />

        <div class="space-y-3">
          <p class="text-sm font-medium">Permisos específicos</p>
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm text-muted-foreground">Ver todos los pacientes de la organización</p>
                <p class="text-xs text-muted-foreground/70">Si está desactivado, solo puedes ver tus propios pacientes</p>
              </div>
              <Switch :model-value="membership.permissions.viewAllPatients" disabled />
            </div>
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm text-muted-foreground">Gestionar facturación</p>
              <Switch :model-value="membership.permissions.manageBilling" disabled />
            </div>
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm text-muted-foreground">Gestionar calendarios ajenos</p>
              <Switch :model-value="membership.permissions.manageOtherCalendars" disabled />
            </div>
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm text-muted-foreground">Gestionar otros profesionales</p>
              <Switch :model-value="membership.permissions.manageOtherProfessionals" disabled />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ── Recursos asignados (read-only) ─────────────────────────────────────── -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0">
            <DoorOpen class="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle class="text-base">Recursos asignados</CardTitle>
            <CardDescription class="text-xs mt-0.5">Salas y capacidad en {{ orgName }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-4">
        <div>
          <p class="text-xs text-muted-foreground mb-2">Salas asignadas</p>
          <div class="flex flex-wrap gap-1.5">
            <Badge v-for="room in resources.rooms" :key="room" variant="outline" class="text-xs opacity-80">
              {{ room }}
            </Badge>
          </div>
        </div>
        <div>
          <p class="text-xs text-muted-foreground mb-1">Capacidad máxima de pacientes</p>
          <p class="text-sm text-foreground">{{ resources.max_capacity }} pacientes</p>
        </div>
      </CardContent>
    </Card>

    <!-- ── Datos de pago recibidos (Fase 2) ───────────────────────────────────── -->
    <Card class="opacity-70">
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <CreditCard class="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle class="text-base text-muted-foreground">Datos de pago recibidos de {{ orgName }}</CardTitle>
              <CardDescription class="text-xs mt-0.5">Datos bancarios para recibir pagos de la organización</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" class="text-xs font-medium shrink-0">
            <Lock class="w-3 h-3 mr-1" />
            Fase 2 · Próximamente
          </Badge>
        </div>
      </CardHeader>
      <CardContent class="pt-5">
        <Alert class="border-border bg-muted/30">
          <AlertDescription class="text-xs text-muted-foreground leading-relaxed">
            En Fase 2 podrás consultar y configurar los datos bancarios con los que
            {{ orgName }} te hará pagos. La sección se está diseñando anticipadamente.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>

  </div>
</template>
