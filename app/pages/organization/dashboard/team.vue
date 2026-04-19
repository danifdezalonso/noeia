<script setup lang="ts">
import {
  Mail, Phone, MapPin, Globe, ExternalLink, Pencil, Check, X,
  Building2, Stethoscope, UserCheck,
} from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'

definePageMeta({ layout: 'dashboard' })

// ── Organization profile ──────────────────────────────────────────────────────

const orgForm = reactive({
  name:        'MindCare Clinics',
  specialty:   'Salud Mental · Psicología Clínica y Psiquiatría',
  description: 'Clínica multidisciplinar de salud mental que ofrece atención psicológica y psiquiátrica basada en evidencia. Combinamos rigor clínico y atención personalizada para acompañar a personas, familias y organizaciones en cada etapa de su bienestar emocional.',
  email:       'hola@mindcareclinics.es',
  phone:       '+34 91 234 56 78',
  location:    'Madrid, España',
  website:     'mindcareclinics.es',
  founded:     '2016',
  size:        '8 profesionales',
})

const orgSnapshot = ref(JSON.stringify(orgForm))
const editingOrg  = ref(false)
const orgDirty    = computed(() => JSON.stringify(orgForm) !== orgSnapshot.value)

function saveOrg()    { orgSnapshot.value = JSON.stringify(orgForm); editingOrg.value = false }
function discardOrg() { Object.assign(orgForm, JSON.parse(orgSnapshot.value)); editingOrg.value = false }

// ── Doctors ───────────────────────────────────────────────────────────────────

interface Doctor {
  id: string
  name: string
  initials: string
  title: string
  role: string
  active: boolean
  description: string
  email: string
  colegiado: string
}

const doctors = ref<Doctor[]>([
  {
    id: 'd1',
    name: 'Elena Voss',
    initials: 'EV',
    title: 'Psicóloga Clínica · Terapeuta EMDR',
    role: 'Psicóloga',
    active: true,
    description: 'Elena se especializa en el tratamiento del trauma complejo, el duelo y los trastornos de ansiedad mediante EMDR y terapia cognitivo-conductual. Tiene una especial sensibilidad hacia el trabajo con adultos supervivientes de trauma temprano.',
    email: 'elena.voss@mindcareclinics.es',
    colegiado: 'M-12345',
  },
  {
    id: 'd2',
    name: 'Marco Silva',
    initials: 'MS',
    title: 'Psiquiatra · Especialista en Adicciones',
    role: 'Psiquiatra',
    active: true,
    description: 'Marco combina el tratamiento farmacológico con un enfoque psicosocial en el abordaje de las adicciones y los trastornos del estado de ánimo. Cuenta con formación específica en patología dual y más de 12 años de experiencia clínica.',
    email: 'marco.silva@mindcareclinics.es',
    colegiado: 'M-67890',
  },
  {
    id: 'd3',
    name: 'Priya Nair',
    initials: 'PN',
    title: 'Psicóloga · Especialista en Trauma',
    role: 'Psicóloga',
    active: true,
    description: 'Priya trabaja con adultos y adolescentes que han vivido experiencias traumáticas, ofreciendo terapia de exposición prolongada y EMDR. Su enfoque integrador incorpora técnicas de regulación emocional y mindfulness.',
    email: 'priya.nair@mindcareclinics.es',
    colegiado: 'M-11223',
  },
  {
    id: 'd4',
    name: 'James Okafor',
    initials: 'JO',
    title: 'Psicólogo · Terapia de Grupo',
    role: 'Psicólogo',
    active: true,
    description: 'James facilita grupos terapéuticos para adultos con dificultades interpersonales, fobia social y trastornos del estado de ánimo. Su formación en psicoterapia de grupo y ACT le permite crear espacios seguros de crecimiento colectivo.',
    email: 'james.okafor@mindcareclinics.es',
    colegiado: 'M-33445',
  },
  {
    id: 'd5',
    name: 'Sofia Reyes',
    initials: 'SR',
    title: 'Psicóloga Infanto-Juvenil',
    role: 'Psicóloga',
    active: true,
    description: 'Sofia atiende a niños y adolescentes con TDAH, ansiedad, dificultades escolares y problemas de conducta. Trabaja en estrecha colaboración con familias y centros educativos para garantizar una intervención coordinada y eficaz.',
    email: 'sofia.reyes@mindcareclinics.es',
    colegiado: 'M-55667',
  },
  {
    id: 'd6',
    name: 'Lena Brandt',
    initials: 'LB',
    title: 'Neuropsicóloga Clínica',
    role: 'Supervisora',
    active: false,
    description: 'Lena realiza evaluaciones neuropsicológicas para el diagnóstico de TDAH, TEA y deterioro cognitivo. Además, ejerce como supervisora clínica del equipo y lidera los protocolos de calidad asistencial de la clínica.',
    email: 'lena.brandt@mindcareclinics.es',
    colegiado: 'M-77889',
  },
  {
    id: 'd7',
    name: 'Aarav Patel',
    initials: 'AP',
    title: 'Psicólogo · Adicciones y Conducta',
    role: 'Psicólogo',
    active: true,
    description: 'Aarav trabaja con personas que presentan conductas adictivas, trastornos de control de impulsos y juego problemático. Utiliza técnicas de entrevista motivacional y terapia dialéctico-conductual adaptadas a cada caso.',
    email: 'aarav.patel@mindcareclinics.es',
    colegiado: 'M-99001',
  },
  {
    id: 'd8',
    name: 'Clara Müller',
    initials: 'CM',
    title: 'Psicóloga · Terapia de Pareja y Familia',
    role: 'Psicóloga',
    active: false,
    description: 'Clara se especializa en terapia sistémica de pareja y familia, trabajando con dinámicas relacionales disfuncionales, crisis de pareja, duelos familiares y adaptación a cambios vitales significativos.',
    email: 'clara.muller@mindcareclinics.es',
    colegiado: 'M-12398',
  },
])

const roleColors: Record<string, string> = {
  Psicóloga:   'bg-violet-100 text-violet-700',
  Psicólogo:   'bg-blue-100 text-blue-700',
  Psiquiatra:  'bg-rose-100 text-rose-700',
  Supervisora: 'bg-amber-100 text-amber-700',
  Supervisor:  'bg-amber-100 text-amber-700',
}
</script>

<template>
  <div class="flex-1 overflow-y-auto min-h-0">
    <div class="p-4 sm:p-6 space-y-6 max-w-[1100px]">

      <!-- Page header -->
      <div>
        <h1 class="text-2xl font-bold text-foreground tracking-tight">Team</h1>
        <p class="text-sm text-muted-foreground mt-0.5">Perfil de la organización y sus profesionales clínicos.</p>
      </div>

      <!-- ── Organization profile card ────────────────────────────────────────── -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 class="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle class="text-base">Perfil de la organización</CardTitle>
                <CardDescription class="text-xs mt-0.5">Información pública de MindCare Clinics</CardDescription>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <template v-if="editingOrg">
                <Button variant="outline" size="sm" class="gap-1.5 text-xs" @click="discardOrg">
                  <X class="w-3.5 h-3.5" /> Descartar
                </Button>
                <Button size="sm" class="gap-1.5 text-xs" @click="saveOrg">
                  <Check class="w-3.5 h-3.5" /> Guardar
                </Button>
              </template>
              <Button v-else variant="outline" size="sm" class="gap-1.5 text-xs" @click="editingOrg = true">
                <Pencil class="w-3.5 h-3.5" /> Editar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-5">
          <div class="flex gap-5 items-start flex-wrap sm:flex-nowrap">

            <!-- Org avatar -->
            <div class="w-16 h-16 shrink-0 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-sm">
              {{ orgForm.name.split(' ').map(w => w[0]).slice(0, 2).join('') }}
            </div>

            <!-- Fields -->
            <div class="flex-1 min-w-0 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Nombre de la clínica</Label>
                  <Input v-if="editingOrg" v-model="orgForm.name" />
                  <p v-else class="text-sm font-semibold text-foreground">{{ orgForm.name }}</p>
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Especialidad</Label>
                  <Input v-if="editingOrg" v-model="orgForm.specialty" />
                  <p v-else class="text-sm text-muted-foreground">{{ orgForm.specialty }}</p>
                </div>
              </div>

              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Descripción</Label>
                <Textarea v-if="editingOrg" v-model="orgForm.description" rows="3" class="resize-none text-sm" />
                <p v-else class="text-sm text-muted-foreground leading-relaxed">{{ orgForm.description }}</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Email de contacto</Label>
                  <Input v-if="editingOrg" v-model="orgForm.email" type="email" />
                  <a v-else :href="`mailto:${orgForm.email}`" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Mail class="w-3.5 h-3.5 shrink-0" /> {{ orgForm.email }}
                  </a>
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Teléfono</Label>
                  <Input v-if="editingOrg" v-model="orgForm.phone" type="tel" />
                  <span v-else class="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone class="w-3.5 h-3.5 shrink-0" /> {{ orgForm.phone }}
                  </span>
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Ubicación</Label>
                  <Input v-if="editingOrg" v-model="orgForm.location" />
                  <span v-else class="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin class="w-3.5 h-3.5 shrink-0" /> {{ orgForm.location }}
                  </span>
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Sitio web</Label>
                  <Input v-if="editingOrg" v-model="orgForm.website" />
                  <a v-else :href="`https://${orgForm.website}`" target="_blank" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Globe class="w-3.5 h-3.5 shrink-0" /> {{ orgForm.website }} <ExternalLink class="w-3 h-3 ml-0.5" />
                  </a>
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Año de fundación</Label>
                  <Input v-if="editingOrg" v-model="orgForm.founded" />
                  <p v-else class="text-sm text-muted-foreground">{{ orgForm.founded }}</p>
                </div>
                <div>
                  <Label class="mb-1.5 block text-xs text-muted-foreground">Tamaño del equipo</Label>
                  <Input v-if="editingOrg" v-model="orgForm.size" />
                  <p v-else class="text-sm text-muted-foreground">{{ orgForm.size }}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- ── Doctors ────────────────────────────────────────────────────────── -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
              <Stethoscope class="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <CardTitle class="text-base">Profesionales</CardTitle>
              <CardDescription class="text-xs mt-0.5">{{ doctors.filter(d => d.active).length }} activos · {{ doctors.length }} en total</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="d in doctors"
              :key="d.id"
              class="border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow cursor-pointer"
              @click="navigateTo(`/organization/dashboard/doctors/${d.id}`)"
            >
              <!-- Header: avatar + name + role + status -->
              <div class="flex items-start gap-3">
                <Avatar class="size-11 shrink-0">
                  <AvatarImage :src="avatarUrl(d.name)" :alt="d.name" />
                  <AvatarFallback class="bg-primary/10 text-primary font-bold text-sm">{{ d.initials }}</AvatarFallback>
                </Avatar>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="text-sm font-semibold text-foreground leading-tight">{{ d.name }}</p>
                    <span
                      class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                      :class="roleColors[d.role] ?? 'bg-muted text-muted-foreground'"
                    >
                      {{ d.role }}
                    </span>
                  </div>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ d.title }}</p>
                  <div class="flex items-center gap-1.5 mt-1.5">
                    <span
                      class="w-1.5 h-1.5 rounded-full shrink-0"
                      :class="d.active ? 'bg-emerald-500' : 'bg-muted-foreground/40'"
                    />
                    <span class="text-[11px]" :class="d.active ? 'text-emerald-600' : 'text-muted-foreground/60'">
                      {{ d.active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="text-xs text-muted-foreground leading-relaxed line-clamp-3">{{ d.description }}</p>

              <!-- Footer: email + colegiado + view link -->
              <div class="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                <div class="flex items-center gap-3 min-w-0">
                  <a
                    :href="`mailto:${d.email}`"
                    class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
                    @click.stop
                  >
                    <Mail class="w-3 h-3 shrink-0" />
                    <span class="truncate">{{ d.email }}</span>
                  </a>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <UserCheck class="w-3 h-3 text-muted-foreground/50" />
                  <span class="text-[11px] font-mono text-muted-foreground/70">{{ d.colegiado }}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  </div>
</template>
