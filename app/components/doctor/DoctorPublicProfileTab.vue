<script setup lang="ts">
import {
  Camera, X, Plus, Users, User, Baby, GraduationCap,
  Video, Phone, MapPin, Clock, Euro, ExternalLink, ChevronRight,
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
  Popover, PopoverContent, PopoverTrigger,
} from '~/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList,
} from '~/components/ui/command'

const props = defineProps<{ doctorId: string; editMode: boolean }>()

// ── Options ───────────────────────────────────────────────────────────────────

const LANGUAGES   = ['Español', 'Català', 'English', 'Français', 'Deutsch', 'Otro']
const MODALITIES  = ['TCC', 'EMDR', 'Sistémica', 'Humanista', 'Psicodinámica', 'Mindfulness', 'ACT', 'Otro']
const AGE_GROUPS  = ['Infantil (0-12)', 'Adolescente', 'Adulto', 'Tercera edad']
const FORMATS     = ['Presencial', 'Videollamada', 'Teléfono']
const DURATIONS   = ['30 min', '45 min', '50 min', '60 min', '90 min']

const INSURERS = [
  'Adeslas','Sanitas','Asistencia Sanitaria','Asisa','DKV','Mapfre','AXA','Fiatc',
  'Catalana Occidente','Allianz','Generali','Aegon','Zurich','Santa Lucía','IMQ',
  'Asistencia Sanitaria Colegial','Caser','Asefa','Cigna','Antares','Divina Pastora',
  'Qualitas Auto','Ima Ibérica','Almudena','La Fe','GES','MGS','HNA',
  'Previsora General','ASSSA','Mutua General de Cataluña','Meridiano',
  'Metlife','Clinicum Salut','Stimulus',
]

interface SessionRate {
  id:          string
  label:       string
  icon:        typeof User
  active:      boolean
  duration:    string
  price:       string
  onlinePrice: string
  showOnline:  boolean
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const form = reactive({
  avatarUrl:   '',
  displayName: 'Elena Voss',
  pronouns:    'ella',
  title:       'Psicóloga Clínica · Terapeuta EMDR',
  bio:         'Psicóloga clínica especializada en terapia cognitivo-conductual y EMDR para trauma y ansiedad. Más de 10 años de experiencia acompañando a personas en procesos de cambio profundo.\n\nOfrezco un espacio seguro, sin juicio y orientado a resultados concretos, adaptando el enfoque a las necesidades únicas de cada persona.',
  languages:   ['Español', 'English', 'Català'] as string[],
  modalities:  ['TCC', 'EMDR', 'Humanista'] as string[],
  ageGroups:   ['Adolescente', 'Adulto'] as string[],
  formats:     ['Presencial', 'Videollamada'] as string[],
  noInsurance: false,
  insurers:    ['Adeslas', 'Sanitas', 'DKV'] as string[],
  rates: [
    { id: 'individual',    label: 'Individual',        icon: User,          active: true,  duration: '50 min', price: '75',  onlinePrice: '65',  showOnline: true  },
    { id: 'pareja',        label: 'Pareja',            icon: Users,         active: true,  duration: '60 min', price: '90',  onlinePrice: '80',  showOnline: false },
    { id: 'familia',       label: 'Familia',           icon: Users,         active: false, duration: '60 min', price: '100', onlinePrice: '',    showOnline: false },
    { id: 'grupo',         label: 'Grupo',             icon: Users,         active: false, duration: '90 min', price: '40',  onlinePrice: '',    showOnline: false },
    { id: 'infantil',      label: 'Infantil',          icon: Baby,          active: false, duration: '45 min', price: '70',  onlinePrice: '',    showOnline: false },
    { id: 'supervision',   label: 'Supervisión',       icon: GraduationCap, active: true,  duration: '60 min', price: '85',  onlinePrice: '75',  showOnline: true  },
    { id: 'primera',       label: 'Primera consulta',  icon: Clock,         active: true,  duration: '60 min', price: '50',  onlinePrice: '45',  showOnline: true  },
  ] as SessionRate[],
})

const snapshot    = ref(JSON.stringify(form))
const isDirty     = computed(() => JSON.stringify(form) !== snapshot.value)
const bioLen      = computed(() => form.bio.length)

// ── Avatar upload ─────────────────────────────────────────────────────────────

const avatarInputRef = ref<HTMLInputElement>()
function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { form.avatarUrl = ev.target?.result as string }
  reader.readAsDataURL(file)
}

// ── Toggles ───────────────────────────────────────────────────────────────────

function toggle(arr: string[], val: string) {
  const i = arr.indexOf(val)
  if (i === -1) arr.push(val)
  else arr.splice(i, 1)
}

// ── Insurer search ────────────────────────────────────────────────────────────

const insurerSearch    = ref('')
const insurerPopover   = ref(false)

function addInsurer(ins: string) {
  if (!form.insurers.includes(ins)) form.insurers.push(ins)
}
function removeInsurer(ins: string) {
  form.insurers = form.insurers.filter(i => i !== ins)
}

const filteredInsurers = computed(() =>
  INSURERS.filter(i =>
    !form.insurers.includes(i) &&
    i.toLowerCase().includes(insurerSearch.value.toLowerCase())
  )
)

// ── Save ──────────────────────────────────────────────────────────────────────

function save() { snapshot.value = JSON.stringify(form) }
function discard() { Object.assign(form, JSON.parse(snapshot.value)) }
</script>

<template>
  <div class="space-y-10 pb-28">

    <!-- ═══════════════════════════════════════════════════════════════
         Presentación
    ════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Presentación</p>

      <div class="flex flex-col sm:flex-row gap-6">
        <!-- Avatar upload -->
        <div class="shrink-0">
          <div class="relative group w-24 h-24">
            <img
              v-if="form.avatarUrl"
              :src="form.avatarUrl"
              class="w-24 h-24 rounded-full object-cover border border-border"
            />
            <div
              v-else
              class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-border"
            >
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

        <!-- Fields -->
        <div class="flex-1 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label class="mb-1.5 block text-xs text-muted-foreground">Nombre público</Label>
              <Input v-if="editMode" v-model="form.displayName" />
              <p v-else class="text-sm font-medium text-foreground">{{ form.displayName }}</p>
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
              Descripción
              <span v-if="editMode" class="ml-1 font-normal">({{ bioLen }}/500)</span>
            </Label>
            <Textarea
              v-if="editMode"
              v-model="form.bio"
              :maxlength="500"
              placeholder="Describe tu enfoque y experiencia..."
              class="min-h-[110px] text-sm resize-none"
            />
            <p v-else class="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{{ form.bio }}</p>
          </div>

          <div>
            <Label class="mb-2 block text-xs text-muted-foreground">Idiomas</Label>
            <div v-if="editMode" class="flex flex-wrap gap-2">
              <button
                v-for="l in LANGUAGES"
                :key="l"
                type="button"
                class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                :class="form.languages.includes(l)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'"
                @click="toggle(form.languages, l)"
              >{{ l }}</button>
            </div>
            <div v-else class="flex flex-wrap gap-1.5">
              <Badge v-for="l in form.languages" :key="l" variant="secondary" class="text-xs">{{ l }}</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- ═══════════════════════════════════════════════════════════════
         Práctica clínica
    ════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Práctica clínica</p>
      <div class="space-y-5">

        <div>
          <Label class="mb-2 block text-xs text-muted-foreground">Modalidades terapéuticas</Label>
          <div v-if="editMode" class="flex flex-wrap gap-2">
            <button
              v-for="m in MODALITIES" :key="m" type="button"
              class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              :class="form.modalities.includes(m)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'"
              @click="toggle(form.modalities, m)"
            >{{ m }}</button>
          </div>
          <div v-else class="flex flex-wrap gap-1.5">
            <Badge v-for="m in form.modalities" :key="m" variant="outline" class="text-xs">{{ m }}</Badge>
          </div>
        </div>

        <div>
          <Label class="mb-2 block text-xs text-muted-foreground">Grupos de edad atendidos</Label>
          <div v-if="editMode" class="flex flex-wrap gap-2">
            <button
              v-for="g in AGE_GROUPS" :key="g" type="button"
              class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              :class="form.ageGroups.includes(g)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'"
              @click="toggle(form.ageGroups, g)"
            >{{ g }}</button>
          </div>
          <div v-else class="flex flex-wrap gap-1.5">
            <Badge v-for="g in form.ageGroups" :key="g" variant="outline" class="text-xs">{{ g }}</Badge>
          </div>
        </div>

        <div>
          <Label class="mb-2 block text-xs text-muted-foreground">Formato de sesión</Label>
          <div v-if="editMode" class="flex flex-wrap gap-2">
            <button
              v-for="f in FORMATS" :key="f" type="button"
              class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              :class="form.formats.includes(f)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'"
              @click="toggle(form.formats, f)"
            >{{ f }}</button>
          </div>
          <div v-else class="flex flex-wrap gap-1.5">
            <Badge v-for="f in form.formats" :key="f" variant="outline" class="text-xs flex items-center gap-1">
              <Video v-if="f === 'Videollamada'" class="w-3 h-3" />
              <Phone v-else-if="f === 'Teléfono'" class="w-3 h-3" />
              <MapPin v-else class="w-3 h-3" />
              {{ f }}
            </Badge>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- ═══════════════════════════════════════════════════════════════
         Tarifas
    ════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Tarifas por tipo de sesión</p>

      <div class="space-y-2">
        <div
          v-for="rate in form.rates"
          :key="rate.id"
          class="rounded-xl border transition-colors"
          :class="rate.active ? 'border-border bg-background' : 'border-border/50 bg-muted/20 opacity-60'"
        >
          <!-- Main row -->
          <div class="flex items-center gap-3 px-4 py-3 flex-wrap">
            <!-- Toggle + label -->
            <div class="flex items-center gap-2.5 min-w-[160px]">
              <Switch v-if="editMode" v-model="rate.active" />
              <span v-else-if="rate.active" class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span v-else class="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
              <component :is="rate.icon" class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span class="text-sm font-medium">{{ rate.label }}</span>
            </div>

            <template v-if="rate.active">
              <!-- Duration -->
              <div class="flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <Select v-if="editMode" v-model="rate.duration" class="w-[100px]">
                  <SelectTrigger class="h-7 text-xs w-[100px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="d in DURATIONS" :key="d" :value="d" class="text-xs">{{ d }}</SelectItem>
                  </SelectContent>
                </Select>
                <span v-else class="text-sm text-muted-foreground">{{ rate.duration }}</span>
              </div>

              <!-- Price -->
              <div class="flex items-center gap-1.5">
                <Euro class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div v-if="editMode" class="flex items-center border border-border rounded-md overflow-hidden h-7">
                  <input
                    v-model="rate.price"
                    type="number"
                    min="0"
                    class="w-14 px-2 text-xs bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                  />
                  <span class="pr-2 text-xs text-muted-foreground">€</span>
                </div>
                <span v-else class="text-sm font-medium">{{ rate.price }}€</span>
              </div>

              <!-- Online price toggle -->
              <div v-if="editMode" class="flex items-center gap-1.5 ml-auto">
                <Switch v-model="rate.showOnline" />
                <span class="text-xs text-muted-foreground">Precio online</span>
              </div>

              <!-- Online price input -->
              <div v-if="rate.showOnline" class="flex items-center gap-1.5">
                <Video class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div v-if="editMode" class="flex items-center border border-border rounded-md overflow-hidden h-7">
                  <input
                    v-model="rate.onlinePrice"
                    type="number"
                    min="0"
                    class="w-14 px-2 text-xs bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                  />
                  <span class="pr-2 text-xs text-muted-foreground">€</span>
                </div>
                <span v-else class="text-sm text-muted-foreground">{{ rate.onlinePrice }}€ online</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <button v-if="editMode" class="mt-3 text-xs text-primary hover:underline flex items-center gap-1">
        <Plus class="w-3.5 h-3.5" /> Añadir tipo personalizado
      </button>
    </section>

    <Separator />

    <!-- ═══════════════════════════════════════════════════════════════
         Seguros aceptados
    ════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Seguros aceptados</p>

      <div class="space-y-4">
        <!-- No insurance toggle -->
        <div class="flex items-center justify-between">
          <Label class="text-sm text-muted-foreground">No acepta seguros</Label>
          <Switch
            v-if="editMode"
            v-model="form.noInsurance"
            @update:model-value="v => { if (v) form.insurers = [] }"
          />
          <Badge v-else-if="form.noInsurance" variant="secondary" class="text-xs">Sin seguro</Badge>
        </div>

        <!-- Insurer search -->
        <div v-if="!form.noInsurance">
          <Popover v-if="editMode" v-model:open="insurerPopover">
            <PopoverTrigger as-child>
              <Button variant="outline" size="sm" class="gap-1.5 h-8 text-xs border-dashed">
                <Plus class="w-3.5 h-3.5" /> Añadir seguro
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-[260px] p-0" align="start">
              <Command>
                <CommandInput v-model="insurerSearch" placeholder="Buscar aseguradora..." />
                <CommandList>
                  <CommandEmpty>Sin resultados.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      v-for="ins in filteredInsurers"
                      :key="ins"
                      :value="ins"
                      @select="addInsurer(ins); insurerPopover = false; insurerSearch = ''"
                    >
                      {{ ins }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <!-- Selected chips -->
          <div class="flex flex-wrap gap-1.5 mt-2">
            <Badge
              v-for="ins in form.insurers"
              :key="ins"
              variant="secondary"
              class="gap-1 pr-1 font-normal text-xs"
            >
              {{ ins }}
              <button
                v-if="editMode"
                type="button"
                class="ml-0.5 hover:text-destructive rounded-sm"
                @click="removeInsurer(ins)"
              >
                <X class="w-3 h-3" />
              </button>
            </Badge>
            <span v-if="form.insurers.length === 0 && !form.noInsurance" class="text-xs text-muted-foreground">
              Sin seguros registrados.
            </span>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- ═══════════════════════════════════════════════════════════════
         Disponibilidad (read-only)
    ════════════════════════════════════════════════════════════════ -->
    <section>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Disponibilidad</p>
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2 text-sm text-foreground">
            <Clock class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>Lunes a viernes · 9:00–14:00 y 16:00–20:00</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock class="w-3.5 h-3.5 opacity-0 shrink-0" />
            <span>Sábados · 9:00–13:00 (videollamada)</span>
          </div>
        </div>
        <button class="flex items-center gap-1 text-xs text-primary hover:underline shrink-0">
          Gestionar disponibilidad <ChevronRight class="w-3.5 h-3.5" />
        </button>
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
