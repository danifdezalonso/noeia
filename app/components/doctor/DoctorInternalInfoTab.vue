<script setup lang="ts">
import {
  Lock, Eye, EyeOff, QrCode, Monitor, Smartphone, Tablet,
  AlertTriangle, Trash2, LogOut,
} from 'lucide-vue-next'
import { Input }    from '~/components/ui/input'
import { Label }    from '~/components/ui/label'
import { Button }   from '~/components/ui/button'
import { Badge }    from '~/components/ui/badge'
import { Textarea } from '~/components/ui/textarea'
import { Switch }   from '~/components/ui/switch'
import { Separator } from '~/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'

defineProps<{ doctorId: string; editMode: boolean }>()

// ── Options ───────────────────────────────────────────────────────────────────

const GENDERS    = ['Hombre', 'Mujer', 'No binario', 'Prefiero no decirlo']
const TIMEZONES  = ['Europe/Madrid', 'Europe/London', 'America/New_York', 'America/Mexico_City', 'America/Argentina/Buenos_Aires']
const LANGS      = ['Español', 'English', 'Català']
const PREFIXES   = ['+34', '+44', '+33', '+49', '+1', '+52', '+54']

// ── Mock form data ────────────────────────────────────────────────────────────

const form = reactive({
  firstName:    'Elena',
  lastName:     'Voss Martínez',
  gender:       'Mujer',
  dob:          '1985-06-12',
  phonePrefix:  '+34',
  phone:        '612 345 678',
  email:        'elena.voss@clinic.com',
  timezone:     'Europe/Madrid',
  uiLang:       'Español',
  colegiado:    'M-12345',
  college:      'Colegio Oficial de Psicólogos de Madrid',
  billingName:  'Elena Voss Martínez',
  nif:          '12345678A',
  billStreet:   'Calle Gran Vía 28',
  billFloor:    '4º A',
  billPostal:   '28013',
  billCity:     'Madrid',
  billProvince: 'Madrid',
  billCountry:  'ES',
  iban:         'ES12 1234 5678 9012 3456 7890',
  invoicePrefix:'PSI-2025-',
})

const snapshot = ref(JSON.stringify(form))
const isDirty  = computed(() => JSON.stringify(form) !== snapshot.value)

function save()    { snapshot.value = JSON.stringify(form) }
function discard() { Object.assign(form, JSON.parse(snapshot.value)) }

// ── Password ──────────────────────────────────────────────────────────────────

const showPwForm    = ref(false)
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

function toggle2FA() {
  if (!twoFAEnabled.value) { showQR.value = true }
  else                     { twoFAEnabled.value = false; showQR.value = false }
}

function confirm2FA() { twoFAEnabled.value = true; showQR.value = false }

// ── Sessions ──────────────────────────────────────────────────────────────────

interface DeviceSession { id: string; device: string; os: string; browser: string; lastSeen: string; current: boolean }
const sessions = ref<DeviceSession[]>([
  { id: 's1', device: 'MacBook Pro',      os: 'macOS 14',       browser: 'Chrome 124',   lastSeen: 'Ahora',           current: true  },
  { id: 's2', device: 'iPhone 15 Pro',    os: 'iOS 17',         browser: 'Safari',       lastSeen: 'Hace 2 horas',    current: false },
  { id: 's3', device: 'Windows PC',       os: 'Windows 11',     browser: 'Firefox 125',  lastSeen: 'Ayer, 18:42',     current: false },
])

function closeSession(id: string) { sessions.value = sessions.value.filter(s => s.id !== id) }
function closeAllSessions()       { sessions.value = sessions.value.filter(s => s.current)   }

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

// ── Danger zone ───────────────────────────────────────────────────────────────

const deleteConfirmName = ref('')
const DOCTOR_FULL_NAME  = 'Elena Voss Martínez'
const canDelete         = computed(() => deleteConfirmName.value === DOCTOR_FULL_NAME)
</script>

<template>
  <div class="space-y-10 pb-28">

    <!-- ═══════════════════════════════════════════════════════════════
         Datos personales
    ════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Datos personales</p>
      <div class="space-y-4">

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Nombre <span class="text-rose-500">*</span></Label>
            <Input v-model="form.firstName" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Apellidos <span class="text-rose-500">*</span></Label>
            <Input v-model="form.lastName" />
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
            <Label class="mb-1.5 block text-xs text-muted-foreground">Fecha de nacimiento</Label>
            <Input v-model="form.dob" type="date" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Teléfono</Label>
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
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">
              Email
              <Lock class="w-3 h-3 inline ml-1 text-muted-foreground/60" />
            </Label>
            <Input :value="form.email" disabled class="opacity-70 cursor-not-allowed" />
            <p class="text-[11px] text-muted-foreground mt-1">Gestionado por el sistema de autenticación</p>
          </div>
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
            <Select v-model="form.uiLang">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="l in LANGS" :key="l" :value="l">{{ l }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Nº de colegiado <span class="text-rose-500">*</span></Label>
            <Input v-model="form.colegiado" placeholder="M-12345" class="font-mono" />
            <p class="text-[11px] text-muted-foreground mt-1">Requerido para verificación legal como profesional sanitario</p>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Colegio profesional</Label>
            <Input v-model="form.college" placeholder="Col·legi Oficial de Psicologia de Catalunya" />
          </div>
        </div>

      </div>
    </section>

    <Separator />

    <!-- ═══════════════════════════════════════════════════════════════
         Seguridad
    ════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Seguridad</p>
      <div class="space-y-6">

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-sm font-medium">Contraseña</p>
              <p class="text-xs text-muted-foreground">Última actualización: hace 3 meses</p>
            </div>
            <Button variant="outline" size="sm" class="text-xs" @click="showPwForm = !showPwForm">
              Actualizar contraseña
            </Button>
          </div>
          <div v-if="showPwForm" class="border border-border rounded-xl p-4 space-y-4 bg-muted/20">
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
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-sm font-medium">Verificación en dos pasos (2FA)</p>
              <p class="text-xs text-muted-foreground">Añade una capa extra de seguridad a tu cuenta</p>
            </div>
            <div class="flex items-center gap-2">
              <Badge
                variant="outline"
                :class="twoFAEnabled
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-border bg-muted text-muted-foreground'"
                class="text-xs"
              >
                {{ twoFAEnabled ? 'Activado' : 'Desactivado' }}
              </Badge>
              <Button variant="outline" size="sm" class="text-xs" @click="toggle2FA">
                {{ twoFAEnabled ? 'Desactivar' : 'Activar' }}
              </Button>
            </div>
          </div>
          <div v-if="showQR" class="border border-border rounded-xl p-4 bg-muted/20 space-y-4">
            <p class="text-sm font-medium">Configura tu app de autenticación</p>
            <p class="text-xs text-muted-foreground">Escanea el código QR con Google Authenticator, Authy o cualquier app compatible con TOTP.</p>
            <!-- Mock QR -->
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

        <!-- Active sessions -->
        <div>
          <p class="text-sm font-medium mb-3">Sesiones activas</p>
          <div class="space-y-2 mb-3">
            <div
              v-for="s in sessions"
              :key="s.id"
              class="flex items-center gap-3 p-3 rounded-lg border border-border bg-background group"
            >
              <component
                :is="s.device.includes('iPhone') || s.device.includes('iPad') ? Smartphone : s.device.includes('Windows') || s.device.includes('Mac') ? Monitor : Tablet"
                class="w-4 h-4 text-muted-foreground shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground">{{ s.device }}</p>
                <p class="text-xs text-muted-foreground">{{ s.browser }} · {{ s.os }} · {{ s.lastSeen }}</p>
              </div>
              <Badge v-if="s.current" variant="outline" class="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 shrink-0">
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

      </div>
    </section>

    <Separator />

    <!-- ═══════════════════════════════════════════════════════════════
         Facturación
    ════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Facturación</p>
      <div class="space-y-4">

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Nombre de facturación</Label>
            <Input v-model="form.billingName" placeholder="Nombre legal o empresa" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">NIF / CIF</Label>
            <Input v-model="form.nif" placeholder="12345678A" class="font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-2">
            <Label class="mb-1.5 block text-xs text-muted-foreground">Calle y número</Label>
            <Input v-model="form.billStreet" placeholder="Calle Gran Vía 28" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Piso / Apto</Label>
            <Input v-model="form.billFloor" placeholder="4º A" />
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Código postal</Label>
            <Input v-model="form.billPostal" placeholder="28013" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Ciudad</Label>
            <Input v-model="form.billCity" placeholder="Madrid" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Provincia</Label>
            <Input v-model="form.billProvince" placeholder="Madrid" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">País</Label>
            <Input v-model="form.billCountry" placeholder="ES" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">IBAN</Label>
            <Input v-model="form.iban" placeholder="ES12 1234 5678 9012 3456 7890" class="font-mono tracking-wide" />
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Prefijo de serie de facturas</Label>
            <Input v-model="form.invoicePrefix" placeholder="PSI-2025-" class="font-mono" />
          </div>
        </div>

      </div>
    </section>

    <Separator />

    <!-- ═══════════════════════════════════════════════════════════════
         Notificaciones
    ════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Notificaciones</p>
      <div class="rounded-xl border border-border overflow-hidden">
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
    </section>

    <Separator />

    <!-- ═══════════════════════════════════════════════════════════════
         Zona de peligro
    ════════════════════════════════════════════════════════════════ -->
    <section class="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-4">
      <p class="text-xs font-semibold text-destructive uppercase tracking-wider">Zona de peligro</p>

      <!-- Deactivate -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p class="text-sm font-medium">Desactivar cuenta</p>
          <p class="text-xs text-muted-foreground mt-0.5">El profesional no podrá iniciar sesión. Sus pacientes serán reasignados.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button variant="outline" size="sm" class="text-xs border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 shrink-0">
              Desactivar cuenta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Desactivar cuenta?</AlertDialogTitle>
              <AlertDialogDescription>
                Elena Voss no podrá acceder a la plataforma. Todos sus pacientes activos serán reasignados al equipo. Esta acción se puede revertir.
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

      <!-- Delete -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p class="text-sm font-medium">Eliminar cuenta permanentemente</p>
          <p class="text-xs text-muted-foreground mt-0.5">Se eliminarán todos los datos del profesional. Esta acción no se puede deshacer.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button variant="destructive" size="sm" class="text-xs gap-1.5 shrink-0">
              <Trash2 class="w-3.5 h-3.5" /> Eliminar cuenta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle class="flex items-center gap-2">
                <AlertTriangle class="w-4 h-4 text-destructive" />
                Eliminar cuenta permanentemente
              </AlertDialogTitle>
              <AlertDialogDescription class="space-y-3">
                <span class="block">Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a este profesional: historial de sesiones, notas clínicas, facturas y accesos.</span>
                <span class="block">Para confirmar, escribe el nombre completo del profesional:</span>
                <span class="block font-mono text-sm font-semibold text-foreground">{{ DOCTOR_FULL_NAME }}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              v-model="deleteConfirmName"
              placeholder="Escribe el nombre completo para confirmar"
              class="mt-1"
            />
            <AlertDialogFooter class="mt-2">
              <AlertDialogCancel @click="deleteConfirmName = ''">Cancelar</AlertDialogCancel>
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
    </section>

  </div>

  <!-- Sticky action bar -->
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
