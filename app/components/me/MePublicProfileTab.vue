<script setup lang="ts">
import {
  Camera, X, Plus, Users, User, Baby, GraduationCap,
  Video, Phone, MapPin, Clock, Euro, ChevronRight, Eye,
  Globe, Stethoscope, ShieldCheck, Building2,
} from 'lucide-vue-next'
import { Input }    from '~/components/ui/input'
import { Label }    from '~/components/ui/label'
import { Button }   from '~/components/ui/button'
import { Badge }    from '~/components/ui/badge'
import { Textarea } from '~/components/ui/textarea'
import { Switch }   from '~/components/ui/switch'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '~/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '~/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList,
} from '~/components/ui/command'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '~/components/ui/dialog'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '~/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

const props = defineProps<{ editMode: boolean; orgName: string }>()

// ── Options ───────────────────────────────────────────────────────────────────

const LANGUAGES  = ['Español', 'Català', 'English', 'Français', 'Deutsch', 'Otro']
const MODALITIES = ['TCC', 'EMDR', 'Sistémica', 'Humanista', 'Psicodinámica', 'Mindfulness', 'ACT', 'Otro']
const AGE_GROUPS = ['Infantil (0-12)', 'Adolescente', 'Adulto', 'Tercera edad']
const FORMATS    = ['Presencial', 'Videollamada', 'Teléfono']
const DURATIONS  = ['30 min', '45 min', '50 min', '60 min', '90 min']

const ORG_HAS_ROOMS = true

interface SessionRate {
  id: string; label: string; icon: typeof User
  active: boolean; duration: string; price: string
  onlinePrice: string; showOnline: boolean
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const form = reactive({
  avatarUrl:           '',
  public_name:         'Elena Voss',
  pronouns:            'ella',
  title:               'Psicóloga Clínica · Terapeuta EMDR',
  description:         'Psicóloga clínica especializada en terapia cognitivo-conductual y EMDR para trauma y ansiedad. Más de 10 años de experiencia acompañando a personas en procesos de cambio profundo.\n\nOfrezco un espacio seguro, sin juicio y orientado a resultados concretos, adaptando el enfoque a las necesidades únicas de cada persona.',
  languages:           ['Español', 'English', 'Català'] as string[],
  modalities:          ['TCC', 'EMDR', 'Humanista'] as string[],
  age_groups:          ['Adolescente', 'Adulto'] as string[],
  session_formats:     ['Presencial', 'Videollamada'] as string[],
  accepted_insurances: ['Adeslas', 'Sanitas', 'DKV'] as string[],
  rates: [
    { id: 'individual',  label: 'Individual',      icon: User,          active: true,  duration: '50 min', price: '75',  onlinePrice: '65', showOnline: true  },
    { id: 'pareja',      label: 'Pareja',           icon: Users,         active: true,  duration: '60 min', price: '90',  onlinePrice: '80', showOnline: false },
    { id: 'familia',     label: 'Familia',          icon: Users,         active: false, duration: '60 min', price: '100', onlinePrice: '',   showOnline: false },
    { id: 'grupo',       label: 'Grupo',            icon: Users,         active: false, duration: '90 min', price: '40',  onlinePrice: '',   showOnline: false },
    { id: 'infantil',    label: 'Infantil',         icon: Baby,          active: false, duration: '45 min', price: '70',  onlinePrice: '',   showOnline: false },
    { id: 'supervision', label: 'Supervisión',      icon: GraduationCap, active: true,  duration: '60 min', price: '85',  onlinePrice: '75', showOnline: true  },
    { id: 'primera',     label: 'Primera consulta', icon: Clock,         active: true,  duration: '60 min', price: '50',  onlinePrice: '45', showOnline: true  },
  ] as SessionRate[],
})

const snapshot = ref(JSON.stringify(form))
const isDirty  = computed(() => JSON.stringify(form) !== snapshot.value)
const bioLen   = computed(() => form.description.length)

// ── Avatar ────────────────────────────────────────────────────────────────────

const avatarInputRef = ref<HTMLInputElement>()
function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { form.avatarUrl = ev.target?.result as string }
  reader.readAsDataURL(file)
}

// ── Toggle chips ──────────────────────────────────────────────────────────────

function toggle(arr: string[], val: string) {
  const i = arr.indexOf(val)
  if (i === -1) arr.push(val)
  else arr.splice(i, 1)
}

// ── Preview ───────────────────────────────────────────────────────────────────

const showPreview = ref(false)
defineExpose({ openPreview: () => { showPreview.value = true } })

// ── Save ──────────────────────────────────────────────────────────────────────

function save()    { snapshot.value = JSON.stringify(form) }
function discard() { Object.assign(form, JSON.parse(snapshot.value)) }
</script>

<template>
  <div class="relative space-y-4 pb-28">

    <!-- Tab microtext -->
    <p class="text-xs text-muted-foreground">
      Así te ven los pacientes de {{ orgName }}.
      Los cambios no afectan a tu perfil en otras organizaciones.
    </p>

    <!-- ═══════════════════════════════════════════════════════════════
         Presentación
    ════════════════════════════════════════════════════════════════ -->
    <Card>
      <CardHeader class="pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/8">
            <User class="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle class="text-sm font-semibold">Presentación</CardTitle>
            <CardDescription class="text-xs">Información pública visible para pacientes</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5">
        <div class="flex flex-col sm:flex-row gap-6">
          <div class="shrink-0">
            <div class="relative group w-24 h-24">
              <img v-if="form.avatarUrl" :src="form.avatarUrl" class="w-24 h-24 rounded-full object-cover border border-border" />
              <div v-else class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                <span class="text-3xl font-bold text-primary">EV</span>
              </div>
              <button
                v-if="editMode"
                class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                @click="avatarInputRef?.click()"
              >
                <Camera class="w-5 h-5 text-white" />
              </button>
              <input ref="avatarInputRef" type="file" class="hidden" accept="image/*" @change="onAvatarChange" />
            </div>
            <p v-if="editMode" class="text-[11px] text-muted-foreground mt-1.5 text-center w-24">Haz clic para cambiar</p>
          </div>
          <div class="flex-1 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Nombre público</Label>
                <Input v-if="editMode" v-model="form.public_name" />
                <p v-else class="text-sm font-medium text-foreground">{{ form.public_name }}</p>
              </div>
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Pronombres</Label>
                <Input v-if="editMode" v-model="form.pronouns" placeholder="ella / él / elle" />
                <p v-else class="text-sm text-foreground">{{ form.pronouns || '—' }}</p>
              </div>
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Título profesional</Label>
              <Input v-if="editMode" v-model="form.title" placeholder="Psicóloga Clínica · Terapeuta EMDR" />
              <p v-else class="text-sm text-foreground">{{ form.title }}</p>
            </div>
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">
                Descripción <span v-if="editMode" class="font-normal">({{ bioLen }}/500)</span>
              </Label>
              <Textarea
                v-if="editMode"
                v-model="form.description"
                :maxlength="500"
                placeholder="Describe tu enfoque y experiencia..."
                class="min-h-[110px] text-sm resize-none"
              />
              <p v-else class="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{{ form.description }}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ═══════════════════════════════════════════════════════════════
         Modalidades  |  Idiomas + Formatos + Grupos
    ════════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-2.5">
            <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950">
              <Stethoscope class="w-3.5 h-3.5 text-violet-600" />
            </div>
            <CardTitle class="text-sm font-semibold">Modalidades terapéuticas</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="pt-4">
          <div v-if="editMode" class="flex flex-wrap gap-2">
            <button
              v-for="m in MODALITIES" :key="m" type="button"
              class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              :class="form.modalities.includes(m) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'"
              @click="toggle(form.modalities, m)"
            >{{ m }}</button>
          </div>
          <div v-else class="flex flex-wrap gap-1.5">
            <Badge v-for="m in form.modalities" :key="m" variant="outline" class="text-xs">{{ m }}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-2.5">
            <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950">
              <Globe class="w-3.5 h-3.5 text-sky-600" />
            </div>
            <CardTitle class="text-sm font-semibold">Idiomas y formatos</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="pt-4 space-y-4">
          <div>
            <Label class="mb-2 block text-xs text-muted-foreground">Idiomas</Label>
            <div v-if="editMode" class="flex flex-wrap gap-2">
              <button
                v-for="l in LANGUAGES" :key="l" type="button"
                class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                :class="form.languages.includes(l) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'"
                @click="toggle(form.languages, l)"
              >{{ l }}</button>
            </div>
            <div v-else class="flex flex-wrap gap-1.5">
              <Badge v-for="l in form.languages" :key="l" variant="secondary" class="text-xs">{{ l }}</Badge>
            </div>
          </div>
          <div>
            <Label class="mb-2 block text-xs text-muted-foreground">Grupos de edad</Label>
            <div v-if="editMode" class="flex flex-wrap gap-2">
              <button
                v-for="g in AGE_GROUPS" :key="g" type="button"
                class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                :class="form.age_groups.includes(g) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'"
                @click="toggle(form.age_groups, g)"
              >{{ g }}</button>
            </div>
            <div v-else class="flex flex-wrap gap-1.5">
              <Badge v-for="g in form.age_groups" :key="g" variant="outline" class="text-xs">{{ g }}</Badge>
            </div>
          </div>
          <div>
            <Label class="mb-2 block text-xs text-muted-foreground">Formato de sesión</Label>
            <div v-if="editMode" class="flex flex-wrap gap-2">
              <TooltipProvider v-for="f in FORMATS" :key="f" :delay-duration="200">
                <Tooltip :disabled="f !== 'Presencial' || ORG_HAS_ROOMS">
                  <TooltipTrigger as-child>
                    <button
                      type="button"
                      class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                      :class="[
                        form.session_formats.includes(f) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50',
                        f === 'Presencial' && !ORG_HAS_ROOMS ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
                      ]"
                      :disabled="f === 'Presencial' && !ORG_HAS_ROOMS"
                      @click="toggle(form.session_formats, f)"
                    >{{ f }}</button>
                  </TooltipTrigger>
                  <TooltipContent class="text-xs">
                    La organización no tiene salas activas para sesiones presenciales.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div v-else class="flex flex-wrap gap-1.5">
              <Badge v-for="f in form.session_formats" :key="f" variant="outline" class="text-xs flex items-center gap-1">
                <Video v-if="f === 'Videollamada'" class="w-3 h-3" />
                <Phone v-else-if="f === 'Teléfono'" class="w-3 h-3" />
                <MapPin v-else class="w-3 h-3" />
                {{ f }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         Tarifas
    ════════════════════════════════════════════════════════════════ -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center gap-2.5">
          <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950">
            <Euro class="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <CardTitle class="text-sm font-semibold">Tarifas por tipo de sesión</CardTitle>
        </div>
      </CardHeader>
      <CardContent class="pt-4 space-y-2">
        <div
          v-for="rate in form.rates"
          :key="rate.id"
          class="rounded-lg border transition-colors"
          :class="rate.active ? 'border-border' : 'border-border/40 bg-muted/20 opacity-60'"
        >
          <div class="flex items-center gap-3 px-3 py-2.5 flex-wrap">
            <div class="flex items-center gap-2 min-w-[150px]">
              <Switch v-if="editMode" v-model="rate.active" />
              <span v-else class="w-2 h-2 rounded-full shrink-0" :class="rate.active ? 'bg-emerald-500' : 'bg-muted-foreground/30'" />
              <component :is="rate.icon" class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span class="text-sm font-medium">{{ rate.label }}</span>
            </div>
            <template v-if="rate.active">
              <div class="flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <Select v-if="editMode" v-model="rate.duration">
                  <SelectTrigger class="h-7 text-xs w-[100px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="d in DURATIONS" :key="d" :value="d" class="text-xs">{{ d }}</SelectItem>
                  </SelectContent>
                </Select>
                <span v-else class="text-sm text-muted-foreground">{{ rate.duration }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Euro class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div v-if="editMode" class="flex items-center border border-border rounded-md overflow-hidden h-7">
                  <input v-model="rate.price" type="number" min="0" class="w-14 px-2 text-xs bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                  <span class="pr-2 text-xs text-muted-foreground">€</span>
                </div>
                <span v-else class="text-sm font-medium">{{ rate.price }}€</span>
              </div>
              <div v-if="editMode" class="flex items-center gap-1.5 ml-auto">
                <Switch v-model="rate.showOnline" />
                <span class="text-xs text-muted-foreground">Online</span>
              </div>
              <div v-if="rate.showOnline" class="flex items-center gap-1.5">
                <Video class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div v-if="editMode" class="flex items-center border border-border rounded-md overflow-hidden h-7">
                  <input v-model="rate.onlinePrice" type="number" min="0" class="w-14 px-2 text-xs bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                  <span class="pr-2 text-xs text-muted-foreground">€</span>
                </div>
                <span v-else class="text-sm text-muted-foreground">{{ rate.onlinePrice }}€ online</span>
              </div>
            </template>
            <template v-else>
              <span class="text-xs text-muted-foreground">No ofreces este tipo en esta clínica</span>
            </template>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ═══════════════════════════════════════════════════════════════
         Seguros (read-only)  |  Disponibilidad
    ════════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <!-- Seguros — siempre solo lectura para el profesional -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2.5">
              <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950">
                <ShieldCheck class="w-3.5 h-3.5 text-teal-600" />
              </div>
              <CardTitle class="text-sm font-semibold">Seguros aceptados</CardTitle>
            </div>
            <Badge variant="outline" class="text-[10px] gap-1 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400 font-normal">
              <Building2 class="w-3 h-3" />
              Gestionado por la organización
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="pt-4 space-y-3">
          <p class="text-xs text-muted-foreground leading-relaxed">
            Los seguros aceptados los gestiona el administrador de {{ orgName }}.
            Contacta con tu organización si necesitas un cambio.
          </p>
          <div class="flex flex-wrap gap-1.5">
            <Badge
              v-for="ins in form.accepted_insurances"
              :key="ins"
              variant="secondary"
              class="text-xs font-normal opacity-80"
            >{{ ins }}</Badge>
            <span v-if="form.accepted_insurances.length === 0" class="text-xs text-muted-foreground">Sin seguros registrados.</span>
          </div>
        </CardContent>
      </Card>

      <!-- Disponibilidad -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950">
                <Clock class="w-3.5 h-3.5 text-orange-500" />
              </div>
              <CardTitle class="text-sm font-semibold">Disponibilidad</CardTitle>
            </div>
            <button class="flex items-center gap-1 text-xs text-primary hover:underline">
              Gestionar <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </CardHeader>
        <CardContent class="pt-4 space-y-2">
          <div class="flex items-center gap-2 text-sm text-foreground">
            <Clock class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>Lunes a viernes · 9:00–14:00 y 16:00–20:00</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock class="w-3.5 h-3.5 opacity-0 shrink-0" />
            <span>Sábados · 9:00–13:00 (videollamada)</span>
          </div>
          <p class="text-xs text-muted-foreground pt-1">Próxima disponibilidad: mañana, 9:00</p>
        </CardContent>
      </Card>
    </div>

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

  <!-- ── Preview dialog ─────────────────────────────────────────────────────── -->
  <Dialog v-model:open="showPreview">
    <DialogContent class="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-sm text-muted-foreground font-normal">
          <Eye class="w-4 h-4" /> Vista previa pública — lo que ven tus pacientes
        </DialogTitle>
      </DialogHeader>
      <div class="space-y-5 pt-2">
        <div class="flex items-center gap-4">
          <Avatar class="size-16">
            <AvatarImage v-if="form.avatarUrl" :src="form.avatarUrl" />
            <AvatarFallback class="bg-primary/10 text-primary font-bold text-xl">EV</AvatarFallback>
          </Avatar>
          <div>
            <h3 class="text-lg font-bold text-foreground">{{ form.public_name }}</h3>
            <p class="text-sm text-muted-foreground">{{ form.title }}</p>
            <div class="flex flex-wrap gap-1 mt-1.5">
              <Badge v-for="f in form.session_formats" :key="f" variant="outline" class="text-[10px] gap-1">
                <Video v-if="f === 'Videollamada'" class="w-2.5 h-2.5" />
                <MapPin v-else-if="f === 'Presencial'" class="w-2.5 h-2.5" />
                <Phone v-else class="w-2.5 h-2.5" />
                {{ f }}
              </Badge>
            </div>
          </div>
        </div>
        <p class="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{{ form.description }}</p>
        <div>
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Especialidades</p>
          <div class="flex flex-wrap gap-1.5">
            <Badge v-for="m in form.modalities" :key="m" variant="secondary" class="text-xs">{{ m }}</Badge>
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tarifas</p>
          <div class="space-y-1.5">
            <div
              v-for="rate in form.rates.filter(r => r.active)"
              :key="rate.id"
              class="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
            >
              <div class="flex items-center gap-2">
                <component :is="rate.icon" class="w-3.5 h-3.5 text-muted-foreground" />
                <span>{{ rate.label }}</span>
                <span class="text-xs text-muted-foreground">{{ rate.duration }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="font-semibold text-foreground">{{ rate.price }}€</span>
                <span v-if="rate.showOnline && rate.onlinePrice" class="text-muted-foreground">/ {{ rate.onlinePrice }}€ online</span>
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Idiomas</p>
            <div class="flex flex-wrap gap-1">
              <Badge v-for="l in form.languages" :key="l" variant="outline" class="text-xs">{{ l }}</Badge>
            </div>
          </div>
          <div v-if="form.accepted_insurances.length">
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Seguros</p>
            <div class="flex flex-wrap gap-1">
              <Badge v-for="ins in form.accepted_insurances" :key="ins" variant="outline" class="text-xs">{{ ins }}</Badge>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
