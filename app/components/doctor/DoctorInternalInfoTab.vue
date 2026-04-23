<script setup lang="ts">
import {
  User, AlertTriangle, CreditCard, Building, Users,
  Calendar, FileText, DoorOpen, Lock,
} from 'lucide-vue-next'
import { Input }     from '~/components/ui/input'
import { Label }     from '~/components/ui/label'
import { Button }    from '~/components/ui/button'
import { Badge }     from '~/components/ui/badge'
import { Switch }    from '~/components/ui/switch'
import { Separator } from '~/components/ui/separator'
import { Textarea }  from '~/components/ui/textarea'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '~/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import {
  Alert, AlertDescription,
} from '~/components/ui/alert'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'

const props = defineProps<{ doctorId: string; editMode: boolean; orgName: string }>()

// ── Options ───────────────────────────────────────────────────────────────────

const ROLES           = ['Admin', 'Clinician', 'Read-only']
const EMPLOYMENT_TYPES = ['Empleado', 'Colaborador', 'Autónomo']
const ORG_SUPERVISORS = ['Dr. Torres', 'Lena Brandt', 'Marco Silva']
const ORG_ROOMS       = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5']

// ── Mock data ─────────────────────────────────────────────────────────────────

const form = reactive({
  // Identidad profesional (datos legales y credenciales)
  firstName:  'Elena',
  lastName:   'Voss Martínez',
  dni:        '12345678A',
  dob:        '1985-06-12',
  colegiado:  'M-12345',
  college:    'Colegio Oficial de Psicólogos de Madrid',
  specialty:  'Psicología Clínica',

  // Relación con la organización
  role:           'Clinician',
  permissions: {
    viewAllPatients:         false,
    manageBilling:           false,
    manageOtherCalendars:    false,
    manageOtherProfessionals: false,
  },
  employmentType: 'Colaborador',
  startDate:      '2023-09-15',
  supervisor:     'Dr. Torres',
  internalNotes:  'Colaboradora desde septiembre. Atiende principalmente pacientes EMDR derivados por el equipo.',

  // Recursos asignados
  rooms:       ['Sala 2', 'Sala 4'] as string[],
  maxCapacity: 25,
})

const snapshot = ref(JSON.stringify(form))
const isDirty  = computed(() => JSON.stringify(form) !== snapshot.value)

function save()    { snapshot.value = JSON.stringify(form) }
function discard() { Object.assign(form, JSON.parse(snapshot.value)) }

// ── Rooms toggle ──────────────────────────────────────────────────────────────

function toggleRoom(room: string) {
  const i = form.rooms.indexOf(room)
  if (i === -1) form.rooms.push(room)
  else form.rooms.splice(i, 1)
}
</script>

<template>
  <div class="space-y-6 pb-28">

    <!-- ── Identidad profesional ──────────────────────────────────────────────── -->
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">
              Nombre <span class="text-rose-500">*</span>
            </Label>
            <Input v-if="editMode" v-model="form.firstName" />
            <p v-else class="text-sm text-foreground">{{ form.firstName }}</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">
              Apellidos <span class="text-rose-500">*</span>
            </Label>
            <Input v-if="editMode" v-model="form.lastName" />
            <p v-else class="text-sm text-foreground">{{ form.lastName }}</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">
              DNI / NIF <span class="text-rose-500">*</span>
            </Label>
            <Input v-if="editMode" v-model="form.dni" placeholder="12345678A" class="font-mono" />
            <p v-else class="text-sm font-mono text-foreground">{{ form.dni }}</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Fecha de nacimiento</Label>
            <Input v-if="editMode" v-model="form.dob" type="date" />
            <p v-else class="text-sm text-foreground">{{ form.dob ? new Date(form.dob + 'T12:00:00').toLocaleDateString('es-ES') : '—' }}</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">
              Nº de colegiado <span class="text-rose-500">*</span>
            </Label>
            <Input v-if="editMode" v-model="form.colegiado" placeholder="M-12345" class="font-mono" />
            <p v-else class="text-sm font-mono text-foreground">{{ form.colegiado || '—' }}</p>
            <p class="text-[11px] text-muted-foreground mt-1">Sin este dato el profesional no puede ser activado en la organización</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Colegio profesional</Label>
            <Input v-if="editMode" v-model="form.college" placeholder="Col·legi Oficial de Psicologia..." />
            <p v-else class="text-sm text-foreground">{{ form.college || '—' }}</p>
          </div>
          <div class="sm:col-span-2">
            <Label class="mb-1.5 block text-xs text-muted-foreground">Especialidad</Label>
            <Input v-if="editMode" v-model="form.specialty" placeholder="Psicología Clínica" />
            <p v-else class="text-sm text-foreground">{{ form.specialty || '—' }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ── Relación con la organización ──────────────────────────────────────── -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center shrink-0">
            <Building class="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <CardTitle class="text-base">Relación con la organización</CardTitle>
            <CardDescription class="text-xs mt-0.5">Vinculación, rol y permisos en {{ orgName }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-5">

        <!-- Rol + Tipo de vinculación -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Rol</Label>
            <Select v-if="editMode" v-model="form.role">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in ROLES" :key="r" :value="r">{{ r }}</SelectItem>
              </SelectContent>
            </Select>
            <p v-else class="text-sm text-foreground">{{ form.role }}</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Tipo de vinculación</Label>
            <Select v-if="editMode" v-model="form.employmentType">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="t in EMPLOYMENT_TYPES" :key="t" :value="t">{{ t }}</SelectItem>
              </SelectContent>
            </Select>
            <p v-else class="text-sm text-foreground">{{ form.employmentType }}</p>
          </div>
        </div>

        <Separator />

        <!-- Permisos específicos -->
        <div class="space-y-3">
          <p class="text-sm font-medium">Permisos específicos</p>
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm">Ver todos los pacientes de la organización</p>
                <p class="text-xs text-muted-foreground">Si está desactivado, solo puede ver sus propios pacientes</p>
              </div>
              <Switch v-model="form.permissions.viewAllPatients" :disabled="!editMode" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm">Gestionar facturación</p>
              <Switch v-model="form.permissions.manageBilling" :disabled="!editMode" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm">Gestionar calendarios ajenos</p>
              <Switch v-model="form.permissions.manageOtherCalendars" :disabled="!editMode" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm">Gestionar otros profesionales</p>
              <Switch v-model="form.permissions.manageOtherProfessionals" :disabled="!editMode" />
            </div>
          </div>
        </div>

        <Separator />

        <!-- Fecha de alta + Supervisor -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Fecha de alta en la organización</Label>
            <Input :value="form.startDate" type="date" disabled class="opacity-60 cursor-not-allowed" />
            <p class="text-[11px] text-muted-foreground mt-1">No editable después de guardar</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Supervisor clínico</Label>
            <Select v-if="editMode" v-model="form.supervisor">
              <SelectTrigger><SelectValue placeholder="Sin supervisor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin supervisor</SelectItem>
                <SelectItem v-for="s in ORG_SUPERVISORS" :key="s" :value="s">{{ s }}</SelectItem>
              </SelectContent>
            </Select>
            <p v-else class="text-sm text-foreground">{{ form.supervisor || '—' }}</p>
          </div>
        </div>

        <!-- Notas internas -->
        <div>
          <Label class="mb-1.5 block text-xs text-muted-foreground">Notas internas</Label>
          <Textarea
            v-if="editMode"
            v-model="form.internalNotes"
            placeholder="Notas visibles solo para administradores..."
            class="min-h-[80px] text-sm resize-none"
          />
          <p v-else class="text-sm text-muted-foreground leading-relaxed">{{ form.internalNotes || '—' }}</p>
          <p class="text-[11px] text-muted-foreground mt-1">Solo visible para administradores. No se muestra al profesional.</p>
        </div>

      </CardContent>
    </Card>

    <!-- ── Recursos asignados ─────────────────────────────────────────────────── -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0">
            <DoorOpen class="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle class="text-base">Recursos asignados</CardTitle>
            <CardDescription class="text-xs mt-0.5">Salas y capacidad máxima en {{ orgName }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-4">
        <div>
          <Label class="mb-2 block text-xs text-muted-foreground">Salas asignadas</Label>
          <div v-if="editMode" class="flex flex-wrap gap-2">
            <button
              v-for="room in ORG_ROOMS"
              :key="room"
              type="button"
              class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              :class="form.rooms.includes(room)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'"
              @click="toggleRoom(room)"
            >{{ room }}</button>
          </div>
          <div v-else class="flex flex-wrap gap-1.5">
            <Badge
              v-for="room in form.rooms"
              :key="room"
              variant="outline"
              class="text-xs"
            >{{ room }}</Badge>
            <span v-if="form.rooms.length === 0" class="text-xs text-muted-foreground">Sin salas asignadas</span>
          </div>
        </div>
        <div class="max-w-[200px]">
          <Label class="mb-1.5 block text-xs text-muted-foreground">Capacidad máxima de pacientes</Label>
          <Input
            v-if="editMode"
            v-model.number="form.maxCapacity"
            type="number"
            min="1"
            placeholder="Sin límite"
          />
          <p v-else class="text-sm text-foreground">{{ form.maxCapacity ?? '—' }} pacientes</p>
        </div>
      </CardContent>
    </Card>

    <!-- ── Datos de pago al profesional (Fase 2) ──────────────────────────────── -->
    <Card class="opacity-70">
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <CreditCard class="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle class="text-base text-muted-foreground">Datos de pago al profesional</CardTitle>
              <CardDescription class="text-xs mt-0.5">Datos fiscales para emisión de pagos desde {{ orgName }}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" class="text-xs font-medium shrink-0">
            <Lock class="w-3 h-3 mr-1" />
            Fase 2 · Próximamente
          </Badge>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-4">
        <Alert class="border-border bg-muted/30">
          <AlertDescription class="text-xs text-muted-foreground leading-relaxed">
            En Fase 2, esta sección permitirá a {{ orgName }} emitir pagos al profesional.
            La tabla de datos fiscales se está diseñando anticipadamente para reservar el espacio.
          </AlertDescription>
        </Alert>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Nombre de facturación</Label>
            <Input disabled placeholder="Elena Voss Martínez" class="cursor-not-allowed" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">NIF fiscal</Label>
            <Input disabled placeholder="12345678A" class="font-mono cursor-not-allowed" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">IBAN</Label>
            <Input disabled placeholder="ES12 1234 5678 9012 3456 7890" class="font-mono cursor-not-allowed" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Prefijo de serie de facturas</Label>
            <Input disabled placeholder="PSI-2025-" class="font-mono cursor-not-allowed" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ── Zona de peligro ────────────────────────────────────────────────────── -->
    <Card class="border-destructive/40">
      <CardHeader class="pb-3 border-b border-destructive/20 bg-destructive/5 rounded-t-xl">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0">
            <AlertTriangle class="w-4 h-4 text-destructive" />
          </div>
          <div>
            <CardTitle class="text-base text-destructive">Zona de peligro</CardTitle>
            <CardDescription class="text-xs mt-0.5">Acciones que afectan a la vinculación con {{ orgName }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-4 bg-destructive/5 rounded-b-xl">

        <!-- Desactivar en esta org -->
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p class="text-sm font-medium">Desactivar en {{ orgName }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">
              El profesional no podrá ser agendado aquí. Sus pacientes serán reasignados.
              Su cuenta sigue activa en otras organizaciones.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button variant="outline" size="sm" class="text-xs border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 shrink-0">
                Desactivar en esta organización
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Desactivar en {{ orgName }}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Elena Voss Martínez no podrá ser agendada en {{ orgName }}. Sus pacientes activos serán
                  reasignados al equipo. Su cuenta global y su perfil en otras organizaciones no se verán afectados.
                  Esta acción se puede revertir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction class="bg-amber-600 text-white hover:bg-amber-700">
                  Desactivar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Separator class="border-destructive/20" />

        <!-- Quitar de la organización -->
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p class="text-sm font-medium">Quitar de la organización</p>
            <p class="text-xs text-muted-foreground mt-0.5">
              Revoca el acceso definitivamente. Los pacientes asignados serán reasignados
              a otros profesionales. Su cuenta y otras organizaciones no se ven afectadas.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button variant="destructive" size="sm" class="text-xs gap-1.5 shrink-0">
                <AlertTriangle class="w-3.5 h-3.5" /> Quitar de la organización
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle class="flex items-center gap-2">
                  <AlertTriangle class="w-4 h-4 text-destructive" />
                  ¿Quitar a Elena Voss Martínez de {{ orgName }}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción revoca el acceso de forma definitiva. Perderá acceso a todos los pacientes,
                  historiales y datos de {{ orgName }}. Su cuenta global sigue activa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Quitar de la organización
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      </CardContent>
    </Card>

  </div>

  <!-- ── Sticky action bar ───────────────────────────────────────────────────── -->
  <div
    v-if="isDirty"
    class="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/95 backdrop-blur-sm px-4 py-3 shadow-lg ring-1 ring-black/5"
  >
    <p class="text-sm text-muted-foreground">Tienes cambios sin guardar</p>
    <div class="flex gap-2">
      <Button variant="outline" size="sm" @click="discard">Descartar</Button>
      <Button size="sm" @click="save">Guardar cambios</Button>
    </div>
  </div>
</template>
