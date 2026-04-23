<script setup lang="ts">
import {
  Lock, Eye, EyeOff, QrCode, Monitor, Smartphone,
  AlertTriangle, LogOut, Bell, ShieldCheck, User,
  Globe, Building2, CreditCard,
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
import { Alert, AlertDescription } from '~/components/ui/alert'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'

definePageMeta({ layout: 'dashboard' })

// ── Options ───────────────────────────────────────────────────────────────────

const GENDERS    = ['Mujer', 'Hombre', 'No binario', 'Prefiero no decirlo']
const PREFIXES   = ['+34', '+44', '+33', '+49', '+1', '+52', '+54']
const TIMEZONES  = ['Europe/Madrid', 'Europe/London', 'America/New_York', 'America/Mexico_City', 'America/Argentina/Buenos_Aires']
const UI_LANGS   = ['Español', 'English', 'Català']

// ── Form state ────────────────────────────────────────────────────────────────

const form = reactive({
  // Datos personales
  firstName:   'Elena',
  lastName:    'Voss Martínez',
  dni:         '12345678A',
  dob:         '1985-06-12',
  gender:      'Mujer',
  email:       'elena.voss@mindcare.com',
  phonePrefix: '+34',
  phone:       '612 345 678',

  // Credenciales profesionales
  license_number:          'M-12345',
  professional_association: 'Colegio Oficial de Psicólogos de Madrid',
  specialty:               'Psicología Clínica',

  // Preferencias regionales
  timezone:   'Europe/Madrid',
  ui_language: 'Español',
})

const snapshot = ref(JSON.stringify(form))
const isDirty  = computed(() => JSON.stringify(form) !== snapshot.value)
function save()    { snapshot.value = JSON.stringify(form) }
function discard() { Object.assign(form, JSON.parse(snapshot.value)) }

// ── Password ──────────────────────────────────────────────────────────────────

const showPwForm = ref(false)
const pw = reactive({ current: '', next: '', confirm: '' })
const pwErrors = reactive({ current: '', next: '', confirm: '' })
const showPw = reactive({ current: false, next: false, confirm: false })

function savePw() {
  pwErrors.current = pw.current ? '' : 'Requerido'
  pwErrors.next    = pw.next.length >= 8 && /[A-Z]/.test(pw.next) && /[0-9]/.test(pw.next)
    ? '' : 'Mínimo 8 caracteres, 1 mayúscula y 1 número'
  pwErrors.confirm = pw.next === pw.confirm ? '' : 'Las contraseñas no coinciden'
  if (pwErrors.current || pwErrors.next || pwErrors.confirm) return
  showPwForm.value = false
  Object.assign(pw, { current: '', next: '', confirm: '' })
}

// ── 2FA ───────────────────────────────────────────────────────────────────────

const twoFAEnabled = ref(false)
const showQR       = ref(false)
function toggle2FA()  { if (!twoFAEnabled.value) showQR.value = true; else { twoFAEnabled.value = false; showQR.value = false } }
function confirm2FA() { twoFAEnabled.value = true; showQR.value = false }

// ── Sessions ──────────────────────────────────────────────────────────────────

interface DeviceSession { id: string; device: string; os: string; browser: string; lastSeen: string; current: boolean }
const sessions = ref<DeviceSession[]>([
  { id: 's1', device: 'MacBook Pro',   os: 'macOS 14',   browser: 'Chrome 124',  lastSeen: 'Ahora',        current: true  },
  { id: 's2', device: 'iPhone 15 Pro', os: 'iOS 17',     browser: 'Safari',      lastSeen: 'Hace 2 horas', current: false },
  { id: 's3', device: 'Windows PC',    os: 'Windows 11', browser: 'Firefox 125', lastSeen: 'Ayer, 18:42',  current: false },
])
function closeSession(id: string)  { sessions.value = sessions.value.filter(s => s.id !== id) }
function closeAllSessions()        { sessions.value = sessions.value.filter(s => s.current) }

// ── Notifications ─────────────────────────────────────────────────────────────

const NOTIF_EVENTS = [
  'Nueva cita',
  'Cancelación de cita',
  'Recordatorio de sesión (24h)',
  'Nuevo paciente asignado',
  'Mensaje de paciente',
  'Factura generada',
  'Pago recibido',
  'Renovación de suscripción',
]
const NOTIF_CHANNELS = ['Email', 'Push', 'In-app'] as const
type Channel = typeof NOTIF_CHANNELS[number]
const notifs = reactive<Record<string, Record<Channel, boolean>>>(
  Object.fromEntries(NOTIF_EVENTS.map(e => [e, { Email: true, Push: true, 'In-app': true }]))
)

// ── Delete account ────────────────────────────────────────────────────────────

const deleteConfirm  = ref('')
const canDelete      = computed(() => deleteConfirm.value === 'ELIMINAR')

// ── Orgs ──────────────────────────────────────────────────────────────────────

const orgs = [
  { name: 'MindCare Clinics', role: 'Clinician', status: 'Activa', initials: 'MC' },
  { name: 'Centro Serena',    role: 'Clinician', status: 'Activa', initials: 'CS' },
]
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-6 max-w-[860px]">

      <!-- Page title -->
      <div>
        <h1 class="text-2xl font-bold text-foreground tracking-tight">Mi cuenta</h1>
        <p class="text-xs text-muted-foreground mt-1">
          Estos datos son globales para toda tu cuenta Noeia y no dependen de ninguna organización.
        </p>
      </div>

      <!-- ── Datos personales ───────────────────────────────────────────────── -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
              <User class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle class="text-base">Datos personales</CardTitle>
              <CardDescription class="text-xs mt-0.5">Identidad legal y datos de contacto</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">
                Nombre <span class="text-rose-500">*</span>
              </Label>
              <Input v-model="form.firstName" />
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">
                Apellidos <span class="text-rose-500">*</span>
              </Label>
              <Input v-model="form.lastName" />
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">
                DNI / NIF <span class="text-rose-500">*</span>
              </Label>
              <Input v-model="form.dni" placeholder="12345678A" class="font-mono" />
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Fecha de nacimiento</Label>
              <Input v-model="form.dob" type="date" />
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Género</Label>
              <Select v-model="form.gender">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="g in GENDERS" :key="g" :value="g">{{ g }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">
                Email
                <Lock class="w-3 h-3 inline ml-1 text-muted-foreground/60" />
              </Label>
              <Input :value="form.email" disabled class="opacity-70 cursor-not-allowed" />
              <p class="text-[11px] text-muted-foreground mt-1">Gestionado por el sistema de autenticación</p>
            </div>
            <div class="sm:col-span-2">
              <Label class="mb-1.5 block text-xs text-muted-foreground">Teléfono personal</Label>
              <div class="flex gap-2">
                <Select v-model="form.phonePrefix">
                  <SelectTrigger class="w-[90px] shrink-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="p in PREFIXES" :key="p" :value="p">{{ p }}</SelectItem>
                  </SelectContent>
                </Select>
                <Input v-model="form.phone" type="tel" placeholder="612 345 678" class="flex-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- ── Credenciales profesionales ────────────────────────────────────── -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center shrink-0">
              <ShieldCheck class="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle class="text-base">Credenciales profesionales</CardTitle>
              <CardDescription class="text-xs mt-0.5">Colegiación y especialidad</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-5 space-y-4">
          <Alert class="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <AlertTriangle class="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription class="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              Estos datos se comparten con todas las organizaciones a las que perteneces.
              Son requeridos legalmente para poder ejercer.
            </AlertDescription>
          </Alert>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">
                Nº de colegiado <span class="text-rose-500">*</span>
              </Label>
              <Input v-model="form.license_number" placeholder="M-12345" class="font-mono" />
              <p class="text-[11px] text-muted-foreground mt-1">Sin este dato no puedes ser activado en ninguna organización.</p>
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">
                Colegio profesional <span class="text-rose-500">*</span>
              </Label>
              <Input v-model="form.professional_association" placeholder="Col·legi Oficial de Psicologia..." />
            </div>
            <div class="sm:col-span-2">
              <Label class="mb-1.5 block text-xs text-muted-foreground">Especialidad</Label>
              <Input v-model="form.specialty" placeholder="Psicología Clínica" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- ── Preferencias regionales ────────────────────────────────────────── -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center shrink-0">
              <Globe class="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <CardTitle class="text-base">Preferencias regionales</CardTitle>
              <CardDescription class="text-xs mt-0.5">Zona horaria e idioma de la interfaz</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Zona horaria</Label>
              <Select v-model="form.timezone">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="tz in TIMEZONES" :key="tz" :value="tz">{{ tz }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Idioma de la interfaz</Label>
              <Select v-model="form.ui_language">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="l in UI_LANGS" :key="l" :value="l">{{ l }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- ── Seguridad ──────────────────────────────────────────────────────── -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
              <ShieldCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle class="text-base">Seguridad</CardTitle>
              <CardDescription class="text-xs mt-0.5">Contraseña, verificación en dos pasos y sesiones activas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-5 space-y-6">

          <!-- Contraseña -->
          <div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium">Contraseña</p>
                <p class="text-xs text-muted-foreground mt-0.5">Última actualización: hace 3 meses</p>
              </div>
              <Button variant="outline" size="sm" class="text-xs" @click="showPwForm = !showPwForm">
                Actualizar contraseña
              </Button>
            </div>
            <div v-if="showPwForm" class="mt-3 border border-border rounded-xl p-4 space-y-4 bg-muted/20">
              <div v-for="field in (['current', 'next', 'confirm'] as const)" :key="field">
                <Label class="mb-1.5 block text-xs text-muted-foreground">
                  {{ field === 'current' ? 'Contraseña actual' : field === 'next' ? 'Nueva contraseña' : 'Confirmar contraseña' }}
                </Label>
                <div class="relative">
                  <Input
                    v-model="pw[field]"
                    :type="showPw[field] ? 'text' : 'password'"
                    :class="pwErrors[field] ? 'border-destructive pr-10' : 'pr-10'"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    @click="showPw[field] = !showPw[field]"
                  >
                    <component :is="showPw[field] ? EyeOff : Eye" class="w-3.5 h-3.5" />
                  </button>
                </div>
                <p v-if="pwErrors[field]" class="text-xs text-destructive mt-1">{{ pwErrors[field] }}</p>
              </div>
              <div class="flex gap-2 justify-end">
                <Button variant="outline" size="sm" class="text-xs" @click="showPwForm = false">Cancelar</Button>
                <Button size="sm" class="text-xs" @click="savePw">Guardar contraseña</Button>
              </div>
            </div>
          </div>

          <Separator />

          <!-- 2FA -->
          <div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium">Verificación en dos pasos (2FA)</p>
                <p class="text-xs text-muted-foreground mt-0.5">Añade una capa extra de seguridad a tu cuenta</p>
              </div>
              <div class="flex items-center gap-2">
                <Badge
                  variant="outline"
                  :class="twoFAEnabled
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'border-border bg-muted text-muted-foreground'"
                  class="text-xs"
                >{{ twoFAEnabled ? 'Activado' : 'Desactivado' }}</Badge>
                <Button variant="outline" size="sm" class="text-xs" @click="toggle2FA">
                  {{ twoFAEnabled ? 'Gestionar' : 'Activar' }}
                </Button>
              </div>
            </div>
            <div v-if="showQR" class="mt-3 border border-border rounded-xl p-4 bg-muted/20 space-y-4">
              <p class="text-sm font-medium">Configura tu app de autenticación</p>
              <p class="text-xs text-muted-foreground">Escanea el código QR con Google Authenticator, Authy o cualquier app compatible con TOTP.</p>
              <div class="w-32 h-32 bg-foreground/5 border border-border rounded-lg flex items-center justify-center mx-auto">
                <QrCode class="w-20 h-20 text-foreground/40" />
              </div>
              <p class="text-xs text-muted-foreground text-center">Clave manual: <span class="font-mono font-medium text-foreground">JBSWY3DPEHPK3PXP</span></p>
              <div class="flex gap-2 justify-end">
                <Button variant="outline" size="sm" class="text-xs" @click="showQR = false">Cancelar</Button>
                <Button size="sm" class="text-xs" @click="confirm2FA">He escaneado el código</Button>
              </div>
            </div>
          </div>

          <Separator />

          <!-- Sesiones activas -->
          <div>
            <p class="text-sm font-medium mb-3">Sesiones activas</p>
            <div class="space-y-2 mb-3">
              <div
                v-for="s in sessions"
                :key="s.id"
                class="flex items-center gap-3 p-3 rounded-lg border border-border bg-background group"
              >
                <component
                  :is="s.device.includes('iPhone') || s.device.includes('iPad') ? Smartphone : Monitor"
                  class="w-4 h-4 text-muted-foreground shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-foreground">{{ s.device }}</p>
                  <p class="text-xs text-muted-foreground">{{ s.browser }} · {{ s.os }} · {{ s.lastSeen }}</p>
                </div>
                <Badge v-if="s.current" variant="outline" class="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                  Esta sesión
                </Badge>
                <Button
                  v-else
                  variant="ghost"
                  size="sm"
                  class="text-xs text-muted-foreground hover:text-destructive gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  @click="closeSession(s.id)"
                >
                  <LogOut class="w-3.5 h-3.5" /> Cerrar
                </Button>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button variant="outline" size="sm" class="text-xs text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive gap-1.5">
                  <LogOut class="w-3.5 h-3.5" /> Cerrar todas las sesiones
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cerrar todas las sesiones?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se cerrarán todas las sesiones activas excepto esta. Tendrás que volver a iniciar sesión en todos los dispositivos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="closeAllSessions">
                    Cerrar sesiones
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

        </CardContent>
      </Card>

      <!-- ── Notificaciones ─────────────────────────────────────────────────── -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
              <Bell class="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle class="text-base">Notificaciones</CardTitle>
              <CardDescription class="text-xs mt-0.5">Configura cómo y cuándo recibes avisos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-5">
          <div class="rounded-lg border border-border overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40">
                  <th class="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Evento</th>
                  <th v-for="ch in NOTIF_CHANNELS" :key="ch" class="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground w-20">
                    {{ ch }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="ev in NOTIF_EVENTS" :key="ev" class="hover:bg-muted/20">
                  <td class="px-4 py-2.5 text-sm text-foreground">{{ ev }}</td>
                  <td v-for="ch in NOTIF_CHANNELS" :key="ch" class="px-4 py-2.5 text-center">
                    <div class="flex justify-center">
                      <Switch v-model="notifs[ev][ch]" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <!-- ── Mis organizaciones ─────────────────────────────────────────────── -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
              <Building2 class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle class="text-base">Mis organizaciones</CardTitle>
              <CardDescription class="text-xs mt-0.5">Organizaciones a las que perteneces</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-5 space-y-3">
          <div
            v-for="org in orgs"
            :key="org.name"
            class="flex items-center gap-3 p-3 rounded-lg border border-border"
          >
            <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
              {{ org.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground">{{ org.name }}</p>
              <p class="text-xs text-muted-foreground">{{ org.role }}</p>
            </div>
            <Badge variant="outline" class="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
              {{ org.status }}
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground leading-relaxed pt-1">
            Para editar tu perfil en una organización concreta, cámbiala desde la barra lateral y ve a Mi perfil.
          </p>
        </CardContent>
      </Card>

      <!-- ── Zona de peligro ────────────────────────────────────────────────── -->
      <Card class="border-destructive/40">
        <CardHeader class="pb-3 border-b border-destructive/20 bg-destructive/5 rounded-t-xl">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0">
              <AlertTriangle class="w-4 h-4 text-destructive" />
            </div>
            <div>
              <CardTitle class="text-base text-destructive">Zona de peligro</CardTitle>
              <CardDescription class="text-xs mt-0.5">Acciones irreversibles sobre tu cuenta</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-5 bg-destructive/5 rounded-b-xl">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p class="text-sm font-medium">Eliminar cuenta permanentemente</p>
              <p class="text-xs text-muted-foreground mt-0.5">
                Se eliminarán todos tus datos como usuario. Perderás acceso a todas
                las organizaciones a las que perteneces. Esta acción no se puede deshacer.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button variant="destructive" size="sm" class="text-xs gap-1.5 shrink-0">
                  <AlertTriangle class="w-3.5 h-3.5" /> Eliminar mi cuenta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle class="flex items-center gap-2">
                    <AlertTriangle class="w-4 h-4 text-destructive" />
                    Eliminar cuenta permanentemente
                  </AlertDialogTitle>
                  <AlertDialogDescription class="space-y-3">
                    <span class="block">
                      Esta acción no se puede deshacer. Se eliminarán todos tus datos como usuario.
                      Perderás acceso a todas las organizaciones a las que perteneces.
                    </span>
                    <span class="block">Para confirmar, escribe <strong class="text-foreground font-mono">ELIMINAR</strong> a continuación:</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  v-model="deleteConfirm"
                  placeholder="ELIMINAR"
                  class="font-mono mt-1"
                />
                <AlertDialogFooter class="mt-2">
                  <AlertDialogCancel @click="deleteConfirm = ''">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    :disabled="!canDelete"
                    class="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Eliminar permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <!-- Sticky save bar (for personal data / credentials / prefs) -->
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

    </div>
  </div>
</template>
