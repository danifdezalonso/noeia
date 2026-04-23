<script setup lang="ts">
import {
  Search, Database, SlidersHorizontal, Bell, ChevronDown, Trash2,
  UserCircle2, Lock, Eye, EyeOff, QrCode, Monitor, Smartphone,
  AlertTriangle, LogOut, ShieldCheck, User, Globe, Building2, CreditCard,
} from 'lucide-vue-next'
import { Input }     from '~/components/ui/input'
import { Label }     from '~/components/ui/label'
import { Button }    from '~/components/ui/button'
import { Badge }     from '~/components/ui/badge'
import { Switch }    from '~/components/ui/switch'
import { Separator } from '~/components/ui/separator'
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

// ── Sidebar nav ───────────────────────────────────────────────────────────────

type Section = 'account' | 'data-management' | 'defaults' | 'notifications'

const sections = [
  { id: 'account'         as Section, label: 'Account',        icon: UserCircle2 },
  { id: 'data-management' as Section, label: 'Data management', icon: Database },
  { id: 'defaults'        as Section, label: 'Defaults',        icon: SlidersHorizontal },
  { id: 'notifications'   as Section, label: 'Notifications',   icon: Bell },
]

const active = ref<Section>('account')
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return sections
  return sections.filter(s => s.label.toLowerCase().includes(q))
})

// ── Account section ───────────────────────────────────────────────────────────

const GENDERS  = ['Mujer', 'Hombre', 'No binario', 'Prefiero no decirlo']
const PREFIXES = ['+34', '+44', '+33', '+49', '+1', '+52', '+54']
const TIMEZONES = ['Europe/Madrid', 'Europe/London', 'America/New_York', 'America/Mexico_City', 'America/Argentina/Buenos_Aires']
const UI_LANGS = ['Español', 'English', 'Català']

const accountForm = reactive({
  firstName:               'Elena',
  lastName:                'Voss Martínez',
  dni:                     '12345678A',
  dob:                     '1985-06-12',
  gender:                  'Mujer',
  email:                   'elena.voss@mindcare.com',
  phonePrefix:             '+34',
  phone:                   '612 345 678',
  license_number:          'M-12345',
  professional_association: 'Colegio Oficial de Psicólogos de Madrid',
  specialty:               'Psicología Clínica',
  timezone:                'Europe/Madrid',
  ui_language:             'Español',
})

const accountSnapshot = ref(JSON.stringify(accountForm))
const accountDirty    = computed(() => JSON.stringify(accountForm) !== accountSnapshot.value)
function saveAccount()    { accountSnapshot.value = JSON.stringify(accountForm) }
function discardAccount() { Object.assign(accountForm, JSON.parse(accountSnapshot.value)) }

// Password
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

// 2FA
const twoFAEnabled = ref(false)
const showQR       = ref(false)
function toggle2FA()  { if (!twoFAEnabled.value) showQR.value = true; else { twoFAEnabled.value = false; showQR.value = false } }
function confirm2FA() { twoFAEnabled.value = true; showQR.value = false }

// Sessions
interface DeviceSession { id: string; device: string; os: string; browser: string; lastSeen: string; current: boolean }
const sessions = ref<DeviceSession[]>([
  { id: 's1', device: 'MacBook Pro',   os: 'macOS 14',   browser: 'Chrome 124',  lastSeen: 'Ahora',        current: true  },
  { id: 's2', device: 'iPhone 15 Pro', os: 'iOS 17',     browser: 'Safari',      lastSeen: 'Hace 2 horas', current: false },
  { id: 's3', device: 'Windows PC',    os: 'Windows 11', browser: 'Firefox 125', lastSeen: 'Ayer, 18:42',  current: false },
])
function closeSession(id: string) { sessions.value = sessions.value.filter(s => s.id !== id) }
function closeAllSessions()       { sessions.value = sessions.value.filter(s => s.current) }

// Notifications (account-level preferences)
const NOTIF_EVENTS = [
  'Nueva cita', 'Cancelación de cita', 'Recordatorio de sesión (24h)',
  'Nuevo paciente asignado', 'Mensaje de paciente',
  'Factura generada', 'Pago recibido', 'Renovación de suscripción',
]
const NOTIF_CHANNELS = ['Email', 'Push', 'In-app'] as const
type Channel = typeof NOTIF_CHANNELS[number]
const notifPrefs = reactive<Record<string, Record<Channel, boolean>>>(
  Object.fromEntries(NOTIF_EVENTS.map(e => [e, { Email: true, Push: true, 'In-app': true }]))
)

// Orgs
const orgs = [
  { name: 'MindCare Clinics', role: 'Clinician', status: 'Activa', initials: 'MC' },
  { name: 'Centro Serena',    role: 'Clinician', status: 'Activa', initials: 'CS' },
]

// Delete account
const deleteConfirm = ref('')
const canDelete     = computed(() => deleteConfirm.value === 'ELIMINAR')

// ── Data management section ───────────────────────────────────────────────────

const dataSettings = reactive({
  autoDeleteSessions: false,
  deleteAfterDays:    90,
  dictationPlayback:  false,
})

// ── Defaults section ──────────────────────────────────────────────────────────

const defaults = reactive({
  inputLanguage:  'English',
  outputLanguage: 'English',
  noteStyle:      'SOAP',
  autoSave:       true,
})

// ── Notifications section ─────────────────────────────────────────────────────

const notifs = reactive({
  sessionReminders: true,
  newMessages:      true,
  taskDue:          true,
  weeklyDigest:     false,
  productUpdates:   true,
})
</script>

<template>
  <div class="flex-1 flex overflow-hidden min-h-0 bg-muted/30">

    <!-- ══ Secondary sidebar ══════════════════════════════════════════════════ -->
    <aside class="w-56 shrink-0 flex flex-col bg-background border-r border-border">
      <div class="px-4 pt-5 pb-3">
        <h1 class="text-base font-semibold text-foreground">Settings</h1>
      </div>
      <div class="px-3 pb-3">
        <div class="relative">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input v-model="search" placeholder="Search" class="pl-8 h-8 text-sm bg-muted/50 border-border/60" />
        </div>
      </div>
      <div class="px-3 pb-1">
        <p class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-1">Personal</p>
        <button
          v-for="s in filtered"
          :key="s.id"
          :class="[
            'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors text-left',
            active === s.id
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
          ]"
          @click="active = s.id"
        >
          <component :is="s.icon" class="w-4 h-4 shrink-0" />
          {{ s.label }}
        </button>
      </div>
    </aside>

    <!-- ══ Content area ════════════════════════════════════════════════════════ -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-[860px] mx-auto px-8 py-8 space-y-6">

        <!-- ── Account ──────────────────────────────────────────────────────── -->
        <template v-if="active === 'account'">

          <div>
            <h2 class="text-2xl font-bold text-foreground tracking-tight">Mi cuenta</h2>
            <p class="text-xs text-muted-foreground mt-1">
              Estos datos son globales para toda tu cuenta Noeia y no dependen de ninguna organización.
            </p>
          </div>

          <!-- Datos personales -->
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
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Nombre <span class="text-rose-500">*</span></Label>
                  <Input v-model="accountForm.firstName" />
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Apellidos <span class="text-rose-500">*</span></Label>
                  <Input v-model="accountForm.lastName" />
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">DNI / NIF <span class="text-rose-500">*</span></Label>
                  <Input v-model="accountForm.dni" placeholder="12345678A" class="font-mono" />
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Fecha de nacimiento</Label>
                  <Input v-model="accountForm.dob" type="date" />
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Género</Label>
                  <Select v-model="accountForm.gender">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="g in GENDERS" :key="g" :value="g">{{ g }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">
                    Email <Lock class="w-3 h-3 inline ml-1 text-muted-foreground/60" />
                  </Label>
                  <Input :value="accountForm.email" disabled class="opacity-70 cursor-not-allowed" />
                  <p class="text-[11px] text-muted-foreground mt-1">Gestionado por el sistema de autenticación</p>
                </div>
                <div class="sm:col-span-2">
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Teléfono personal</Label>
                  <div class="flex gap-2">
                    <Select v-model="accountForm.phonePrefix">
                      <SelectTrigger class="w-[90px] shrink-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="p in PREFIXES" :key="p" :value="p">{{ p }}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input v-model="accountForm.phone" type="tel" placeholder="612 345 678" class="flex-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Credenciales profesionales -->
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
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Nº de colegiado <span class="text-rose-500">*</span></Label>
                  <Input v-model="accountForm.license_number" placeholder="M-12345" class="font-mono" />
                  <p class="text-[11px] text-muted-foreground mt-1">Sin este dato no puedes ser activado en ninguna organización.</p>
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Colegio profesional <span class="text-rose-500">*</span></Label>
                  <Input v-model="accountForm.professional_association" placeholder="Col·legi Oficial de Psicologia..." />
                </div>
                <div class="sm:col-span-2">
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Especialidad</Label>
                  <Input v-model="accountForm.specialty" placeholder="Psicología Clínica" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Preferencias regionales -->
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
                  <Select v-model="accountForm.timezone">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="tz in TIMEZONES" :key="tz" :value="tz">{{ tz }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Idioma de la interfaz</Label>
                  <Select v-model="accountForm.ui_language">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="l in UI_LANGS" :key="l" :value="l">{{ l }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Seguridad -->
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
                      <Input v-model="pw[field]" :type="showPw[field] ? 'text' : 'password'" :class="pwErrors[field] ? 'border-destructive pr-10' : 'pr-10'" />
                      <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" @click="showPw[field] = !showPw[field]">
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
                    <Badge variant="outline" :class="twoFAEnabled ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'border-border bg-muted text-muted-foreground'" class="text-xs">
                      {{ twoFAEnabled ? 'Activado' : 'Desactivado' }}
                    </Badge>
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
                  <div v-for="s in sessions" :key="s.id" class="flex items-center gap-3 p-3 rounded-lg border border-border bg-background group">
                    <component :is="s.device.includes('iPhone') || s.device.includes('iPad') ? Smartphone : Monitor" class="w-4 h-4 text-muted-foreground shrink-0" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-foreground">{{ s.device }}</p>
                      <p class="text-xs text-muted-foreground">{{ s.browser }} · {{ s.os }} · {{ s.lastSeen }}</p>
                    </div>
                    <Badge v-if="s.current" variant="outline" class="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                      Esta sesión
                    </Badge>
                    <Button v-else variant="ghost" size="sm" class="text-xs text-muted-foreground hover:text-destructive gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" @click="closeSession(s.id)">
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
                      <AlertDialogDescription>Se cerrarán todas las sesiones activas excepto esta. Tendrás que volver a iniciar sesión en todos los dispositivos.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="closeAllSessions">Cerrar sesiones</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

            </CardContent>
          </Card>

          <!-- Notificaciones -->
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
                      <th v-for="ch in NOTIF_CHANNELS" :key="ch" class="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground w-20">{{ ch }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    <tr v-for="ev in NOTIF_EVENTS" :key="ev" class="hover:bg-muted/20">
                      <td class="px-4 py-2.5 text-sm text-foreground">{{ ev }}</td>
                      <td v-for="ch in NOTIF_CHANNELS" :key="ch" class="px-4 py-2.5 text-center">
                        <div class="flex justify-center">
                          <Switch v-model="notifPrefs[ev][ch]" />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <!-- Mis organizaciones -->
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
              <div v-for="org in orgs" :key="org.name" class="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">{{ org.initials }}</div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-foreground">{{ org.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ org.role }}</p>
                </div>
                <Badge variant="outline" class="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">{{ org.status }}</Badge>
              </div>
              <p class="text-xs text-muted-foreground leading-relaxed pt-1">
                Para editar tu perfil en una organización concreta, cámbiala desde la barra lateral y ve a Mi perfil.
              </p>
            </CardContent>
          </Card>

          <!-- Zona de peligro -->
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
                  <p class="text-xs text-muted-foreground mt-0.5">Se eliminarán todos tus datos como usuario. Perderás acceso a todas las organizaciones a las que perteneces. Esta acción no se puede deshacer.</p>
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
                        <AlertTriangle class="w-4 h-4 text-destructive" /> Eliminar cuenta permanentemente
                      </AlertDialogTitle>
                      <AlertDialogDescription class="space-y-3">
                        <span class="block">Esta acción no se puede deshacer. Se eliminarán todos tus datos como usuario. Perderás acceso a todas las organizaciones a las que perteneces.</span>
                        <span class="block">Para confirmar, escribe <strong class="text-foreground font-mono">ELIMINAR</strong> a continuación:</span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input v-model="deleteConfirm" placeholder="ELIMINAR" class="font-mono mt-1" />
                    <AlertDialogFooter class="mt-2">
                      <AlertDialogCancel @click="deleteConfirm = ''">Cancelar</AlertDialogCancel>
                      <AlertDialogAction :disabled="!canDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed">
                        Eliminar permanentemente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <!-- Sticky save bar -->
          <div
            v-if="accountDirty"
            class="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/95 backdrop-blur-sm px-4 py-3 shadow-lg ring-1 ring-black/5"
          >
            <p class="text-sm text-muted-foreground">Tienes cambios sin guardar</p>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" @click="discardAccount">Descartar</Button>
              <Button size="sm" @click="saveAccount">Guardar cambios</Button>
            </div>
          </div>

        </template>

        <!-- ── Data management ────────────────────────────────────────────────── -->
        <template v-else-if="active === 'data-management'">
          <p class="text-xs text-muted-foreground mb-1">Personal</p>
          <h2 class="text-3xl font-bold text-foreground mb-6">Data management</h2>
          <div class="bg-card border border-border rounded-xl p-6 space-y-6 mb-10">
            <div class="flex items-start justify-between gap-6">
              <div class="flex-1">
                <p class="text-sm font-semibold text-foreground mb-1">Automatically delete sessions</p>
                <p class="text-sm text-muted-foreground mb-3">Schedule sessions to delete on a recurring basis (between 1 to 90 days).</p>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-muted-foreground">Delete after</span>
                  <input v-model.number="dataSettings.deleteAfterDays" type="number" min="1" max="90" :disabled="!dataSettings.autoDeleteSessions" class="w-20 h-9 rounded-md border border-border bg-muted/50 px-3 text-sm text-foreground text-center outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                  <span class="text-sm text-muted-foreground">days</span>
                </div>
              </div>
              <button :class="['relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors mt-0.5', dataSettings.autoDeleteSessions ? 'bg-primary' : 'bg-muted-foreground/30']" @click="dataSettings.autoDeleteSessions = !dataSettings.autoDeleteSessions">
                <span :class="['pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', dataSettings.autoDeleteSessions ? 'translate-x-5' : 'translate-x-0']" />
              </button>
            </div>
            <div class="border-t border-border/50" />
            <div class="flex items-start justify-between gap-6">
              <div class="flex-1">
                <p class="text-sm font-semibold text-foreground mb-1">Enable dictation playback</p>
                <p class="text-sm text-muted-foreground leading-relaxed">Opting in will store recordings of your dictations. This allows you or your staff to play back and verify the accuracy of dictations. You must get consent to record patients speaking.</p>
              </div>
              <button :class="['relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors mt-0.5', dataSettings.dictationPlayback ? 'bg-primary' : 'bg-muted-foreground/30']" @click="dataSettings.dictationPlayback = !dataSettings.dictationPlayback">
                <span :class="['pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', dataSettings.dictationPlayback ? 'translate-x-5' : 'translate-x-0']" />
              </button>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-destructive mb-5">Delete all sessions</h3>
          <div class="bg-card border border-border rounded-xl p-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-destructive mb-1">Danger zone</p>
                <p class="text-sm text-muted-foreground leading-relaxed">Permanently delete all sessions on your account, and all transcripts, notes and documents associated with these sessions.</p>
              </div>
              <Button variant="outline" class="shrink-0 text-destructive border-destructive/40 hover:bg-destructive/5 hover:border-destructive gap-1.5">
                <Trash2 class="w-3.5 h-3.5" /> Delete all sessions
              </Button>
            </div>
          </div>
        </template>

        <!-- ── Defaults ───────────────────────────────────────────────────────── -->
        <template v-else-if="active === 'defaults'">
          <p class="text-xs text-muted-foreground mb-1">Personal</p>
          <h2 class="text-3xl font-bold text-foreground mb-6">Defaults</h2>
          <div class="bg-card border border-border rounded-xl p-6 space-y-5">
            <h3 class="text-base font-semibold text-foreground">Session defaults</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-foreground block mb-1.5">Input language</label>
                <div class="relative">
                  <select v-model="defaults.inputLanguage" class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8">
                    <option>English</option><option>Spanish</option><option>French</option><option>German</option><option>Portuguese</option>
                  </select>
                  <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-foreground block mb-1.5">Output language</label>
                <div class="relative">
                  <select v-model="defaults.outputLanguage" class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8">
                    <option>English</option><option>Spanish</option><option>French</option><option>German</option><option>Portuguese</option>
                  </select>
                  <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-foreground block mb-1.5">Default note style</label>
              <div class="relative">
                <select v-model="defaults.noteStyle" class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8">
                  <option>SOAP</option><option>DAP</option><option>Free text</option><option>Structured</option>
                </select>
                <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div class="flex items-center justify-between py-1">
              <div>
                <p class="text-sm font-medium text-foreground">Auto-save notes</p>
                <p class="text-xs text-muted-foreground">Automatically save notes after each session ends.</p>
              </div>
              <button :class="['relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', defaults.autoSave ? 'bg-primary' : 'bg-muted-foreground/30']" @click="defaults.autoSave = !defaults.autoSave">
                <span :class="['pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', defaults.autoSave ? 'translate-x-4' : 'translate-x-0']" />
              </button>
            </div>
          </div>
          <div class="flex justify-end mt-4">
            <Button>Save changes</Button>
          </div>
        </template>

        <!-- ── Notifications ──────────────────────────────────────────────────── -->
        <template v-else-if="active === 'notifications'">
          <p class="text-xs text-muted-foreground mb-1">Personal</p>
          <h2 class="text-3xl font-bold text-foreground mb-6">Notifications</h2>
          <div class="bg-card border border-border rounded-xl divide-y divide-border">
            <div
              v-for="item in [
                { key: 'sessionReminders', label: 'Session reminders', desc: 'Get notified before upcoming sessions.' },
                { key: 'newMessages',      label: 'New messages',      desc: 'Receive alerts when patients send you a message.' },
                { key: 'taskDue',          label: 'Task due',           desc: 'Reminder when a task is approaching its due date.' },
                { key: 'weeklyDigest',     label: 'Weekly digest',      desc: 'A weekly summary of sessions and activity.' },
                { key: 'productUpdates',   label: 'Product updates',    desc: 'Be the first to know about new features.' },
              ]"
              :key="item.key"
              class="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p class="text-sm font-medium text-foreground">{{ item.label }}</p>
                <p class="text-xs text-muted-foreground">{{ item.desc }}</p>
              </div>
              <button :class="['relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', notifs[item.key as keyof typeof notifs] ? 'bg-primary' : 'bg-muted-foreground/30']" @click="notifs[item.key as keyof typeof notifs] = !notifs[item.key as keyof typeof notifs]">
                <span :class="['pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', notifs[item.key as keyof typeof notifs] ? 'translate-x-4' : 'translate-x-0']" />
              </button>
            </div>
          </div>
        </template>

      </div>
    </div>

  </div>
</template>
