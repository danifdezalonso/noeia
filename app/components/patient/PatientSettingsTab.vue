<script setup lang="ts">
import { Bell, Lock, UserX, Trash2, AlertTriangle, Link, Mail, Phone } from 'lucide-vue-next'
import { Label }    from '~/components/ui/label'
import { Button }   from '~/components/ui/button'
import { Badge }    from '~/components/ui/badge'
import { Switch }   from '~/components/ui/switch'
import { Input }    from '~/components/ui/input'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '~/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'

// ── State ─────────────────────────────────────────────────────────────────────

const notifications = reactive({
  sessionReminder:    true,
  reminderHours:      '24',
  taskReminder:       true,
  missedSessionAlert: true,
  channel:            'email',
})

const privacy = reactive({
  visibleToOrg:    true,
  sharedWithTeam:  false,
  anonymizeExport: true,
})

const linked = reactive({
  portalEnabled: false,
  portalEmail:   'sofia.martinez@email.com',
})

const snapshot = reactive({ ...toRaw(notifications) })
const isDirty = computed(() =>
  JSON.stringify(notifications) !== JSON.stringify(snapshot)
  || JSON.stringify(privacy) !== JSON.stringify({ visibleToOrg: true, sharedWithTeam: false, anonymizeExport: true })
  || JSON.stringify(linked) !== JSON.stringify({ portalEnabled: false, portalEmail: 'sofia.martinez@email.com' })
)

function save() {
  Object.assign(snapshot, { ...notifications })
}
</script>

<template>
  <div class="relative space-y-4 pb-28 max-w-2xl">

    <!-- ── Notifications ──────────────────────────────────────────── -->
    <Card>
      <CardHeader class="pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950">
            <Bell class="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <CardTitle class="text-sm font-semibold">Notificaciones</CardTitle>
            <CardDescription class="text-xs">Recordatorios y alertas para esta paciente</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-5">

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">Recordatorio de cita</p>
            <p class="text-xs text-muted-foreground mt-0.5">Enviar aviso antes de cada sesión programada</p>
          </div>
          <Switch v-model="notifications.sessionReminder" />
        </div>

        <div v-if="notifications.sessionReminder" class="ml-0 pl-4 border-l-2 border-border space-y-3">
          <div class="flex items-center gap-3">
            <Label class="text-xs text-muted-foreground shrink-0">Tiempo de aviso</Label>
            <Select v-model="notifications.reminderHours">
              <SelectTrigger class="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1"  class="text-xs">1 hora antes</SelectItem>
                <SelectItem value="2"  class="text-xs">2 horas antes</SelectItem>
                <SelectItem value="24" class="text-xs">24 horas antes</SelectItem>
                <SelectItem value="48" class="text-xs">48 horas antes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center gap-3">
            <Label class="text-xs text-muted-foreground shrink-0">Canal</Label>
            <Select v-model="notifications.channel">
              <SelectTrigger class="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email"    class="text-xs">Email</SelectItem>
                <SelectItem value="sms"      class="text-xs">SMS</SelectItem>
                <SelectItem value="whatsapp" class="text-xs">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">Recordatorio de tareas</p>
            <p class="text-xs text-muted-foreground mt-0.5">Notificar tareas pendientes entre sesiones</p>
          </div>
          <Switch v-model="notifications.taskReminder" />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">Alerta de no presentación</p>
            <p class="text-xs text-muted-foreground mt-0.5">Notificar al clínico si la paciente no acude</p>
          </div>
          <Switch v-model="notifications.missedSessionAlert" />
        </div>

      </CardContent>
    </Card>

    <!-- ── Privacy & Access ───────────────────────────────────────── -->
    <Card>
      <CardHeader class="pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950">
            <Lock class="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <CardTitle class="text-sm font-semibold">Privacidad y acceso</CardTitle>
            <CardDescription class="text-xs">Visibilidad del expediente dentro de la organización</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-5">

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">Visible para la organización</p>
            <p class="text-xs text-muted-foreground mt-0.5">Otros miembros del equipo pueden ver este expediente</p>
          </div>
          <Switch v-model="privacy.visibleToOrg" />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">Compartir con equipo clínico</p>
            <p class="text-xs text-muted-foreground mt-0.5">Supervisores y co-terapeutas tienen acceso de lectura</p>
          </div>
          <Switch v-model="privacy.sharedWithTeam" />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">Anonimizar en exportaciones</p>
            <p class="text-xs text-muted-foreground mt-0.5">Los datos de identidad se ocultarán en informes exportados</p>
          </div>
          <Switch v-model="privacy.anonymizeExport" />
        </div>

      </CardContent>
    </Card>

    <!-- ── Patient Portal ─────────────────────────────────────────── -->
    <Card>
      <CardHeader class="pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950">
            <Link class="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <CardTitle class="text-sm font-semibold">Portal de la paciente</CardTitle>
            <CardDescription class="text-xs">Acceso del paciente a su expediente y tareas</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-5">

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">Activar portal de paciente</p>
            <p class="text-xs text-muted-foreground mt-0.5">La paciente puede ver sus tareas, sesiones y documentos</p>
          </div>
          <Switch v-model="linked.portalEnabled" />
        </div>

        <div v-if="linked.portalEnabled" class="space-y-3">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Email de acceso</Label>
            <div class="flex gap-2">
              <Input v-model="linked.portalEmail" type="email" class="text-sm flex-1" />
              <Button variant="outline" size="sm" class="gap-1.5 text-xs shrink-0">
                <Mail class="w-3.5 h-3.5" /> Reenviar invitación
              </Button>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="outline" class="border-emerald-200 text-emerald-700 bg-emerald-50 gap-1.5 text-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Invitación enviada
            </Badge>
            <span class="text-xs text-muted-foreground">Último acceso: nunca</span>
          </div>
        </div>

      </CardContent>
    </Card>

    <!-- ── Danger Zone ─────────────────────────────────────────────── -->
    <Card class="border-destructive/30">
      <CardHeader class="pb-4 border-b border-destructive/20">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950">
            <AlertTriangle class="w-4 h-4 text-destructive" />
          </div>
          <div>
            <CardTitle class="text-sm font-semibold text-destructive">Zona de peligro</CardTitle>
            <CardDescription class="text-xs">Acciones irreversibles sobre el expediente</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-4">

        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium">Archivar paciente</p>
            <p class="text-xs text-muted-foreground mt-0.5">El expediente se conserva pero la paciente queda inactiva</p>
          </div>
          <Button variant="outline" size="sm" class="shrink-0 gap-1.5 text-xs border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive">
            <UserX class="w-3.5 h-3.5" /> Archivar
          </Button>
        </div>

        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium">Eliminar expediente</p>
            <p class="text-xs text-muted-foreground mt-0.5">Se eliminan todos los datos de forma permanente. Esta acción no se puede deshacer.</p>
          </div>
          <Button variant="outline" size="sm" class="shrink-0 gap-1.5 text-xs border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <Trash2 class="w-3.5 h-3.5" /> Eliminar
          </Button>
        </div>

      </CardContent>
    </Card>

  </div>

  <!-- Sticky bar -->
  <div
    v-if="isDirty"
    class="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/95 backdrop-blur-sm px-4 py-3 shadow-lg ring-1 ring-black/5"
  >
    <p class="text-sm text-muted-foreground">Tienes cambios sin guardar</p>
    <div class="flex gap-2">
      <Button variant="outline" size="sm">Descartar</Button>
      <Button size="sm" @click="save">Guardar cambios</Button>
    </div>
  </div>
</template>
