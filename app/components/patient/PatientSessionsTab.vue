<script setup lang="ts">
import { ChevronDown, Plus, Video, Phone, MapPin, Paperclip, Clock, User } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Badge }  from '~/components/ui/badge'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '~/components/ui/collapsible'
import { Separator } from '~/components/ui/separator'

// ── Types ─────────────────────────────────────────────────────────────────────

type SessionStatus = 'realizada' | 'pendiente' | 'cancelada' | 'no-presentada'
type SessionModality = 'presencial' | 'videollamada' | 'telefono'

interface Task { text: string; completed: boolean }
interface Attachment { name: string; size: string }

interface Session {
  id:          number
  number:      number
  date:        string        // ISO date
  time:        string        // "HH:MM"
  duration:    number        // minutes
  status:      SessionStatus
  modality:    SessionModality
  psychologist: { name: string; initials: string }
  sessionType: string
  motivo:      string
  notes:       string
  tasks:       Task[]
  nextSession: string
  attachments: Attachment[]
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const SESSIONS: Session[] = [
  {
    id: 8, number: 8,
    date: '2026-04-24', time: '11:00', duration: 50,
    status: 'pendiente', modality: 'videollamada',
    psychologist: { name: 'Dra. Elena Voss', initials: 'EV' },
    sessionType: 'Seguimiento',
    motivo: 'Seguimiento de objetivos y revisión de tareas',
    notes: '',
    tasks: [],
    nextSession: 'Por confirmar',
    attachments: [],
  },
  {
    id: 7, number: 7,
    date: '2026-04-10', time: '11:00', duration: 50,
    status: 'realizada', modality: 'videollamada',
    psychologist: { name: 'Dra. Elena Voss', initials: 'EV' },
    sessionType: 'Seguimiento',
    motivo: 'Revisión de técnicas de regulación emocional y avance en objetivos de sueño',
    notes: 'La paciente reporta mejoría significativa en la calidad del sueño. Ha implementado rutinas de higiene del sueño con buenos resultados. Continúa trabajando en la reducción de la rumiación nocturna. Se practica restructuración cognitiva de pensamientos catastróficos relacionados con el trabajo.',
    tasks: [
      { text: 'Registro diario de pensamientos automáticos (7 días)', completed: true },
      { text: 'Técnica de respiración 4-7-8 antes de dormir', completed: true },
      { text: 'Lectura de capítulo 3 del libro "El poder del ahora"', completed: false },
    ],
    nextSession: '24 de abril de 2026 · 11:00',
    attachments: [{ name: 'Registro_Pensamientos_Semana7.pdf', size: '128 KB' }],
  },
  {
    id: 6, number: 6,
    date: '2026-03-26', time: '11:00', duration: 50,
    status: 'realizada', modality: 'presencial',
    psychologist: { name: 'Dra. Elena Voss', initials: 'EV' },
    sessionType: 'Seguimiento',
    motivo: 'Trabajo en habilidades de tolerancia a la incertidumbre y activación conductual',
    notes: 'Sesión centrada en técnicas de mindfulness y tolerancia a la incertidumbre. La paciente muestra resistencia inicial pero buena receptividad al finalizar. Se trabajan esquemas de hiperresponsabilidad con ejercicios de descatastrofización. El estado de ánimo ha mejorado levemente respecto a sesiones anteriores.',
    tasks: [
      { text: 'Práctica de mindfulness MBSR 10 min/día', completed: true },
      { text: 'Agenda de actividades placenteras (mínimo 2 por semana)', completed: true },
    ],
    nextSession: '10 de abril de 2026 · 11:00',
    attachments: [],
  },
  {
    id: 5, number: 5,
    date: '2026-03-05', time: '11:00', duration: 50,
    status: 'realizada', modality: 'videollamada',
    psychologist: { name: 'Dr. Marco Silva', initials: 'MS' },
    sessionType: 'Seguimiento',
    motivo: 'Sesión de cobertura — exploración de cogniciones negativas recurrentes',
    notes: 'Sesión de cobertura por ausencia de Dra. Voss. La paciente muestra buena alianza terapéutica. Se exploran las cogniciones automáticas negativas relacionadas con el rendimiento laboral. Se refuerza el uso del diario de pensamientos y se introducen técnicas de defusión cognitiva (ACT).',
    tasks: [
      { text: 'Completar hoja de registro de pensamientos (formato ABCDe)', completed: true },
      { text: 'Ejercicio de defusión: "Las hojas en el río" (audio guiado)', completed: false },
    ],
    nextSession: '26 de marzo de 2026 · 11:00',
    attachments: [{ name: 'Material_Defusion_Cognitiva.pdf', size: '340 KB' }],
  },
  {
    id: 4, number: 4,
    date: '2026-02-19', time: '11:00', duration: 50,
    status: 'no-presentada', modality: 'presencial',
    psychologist: { name: 'Dra. Elena Voss', initials: 'EV' },
    sessionType: 'Seguimiento',
    motivo: 'No se presentó. No hubo aviso previo.',
    notes: 'Paciente no acudió a la cita. Se intentó contacto telefónico sin respuesta. Se dejó mensaje de voz. Al día siguiente la paciente contactó disculpándose por olvido involuntario.',
    tasks: [],
    nextSession: '5 de marzo de 2026 · 11:00',
    attachments: [],
  },
  {
    id: 3, number: 3,
    date: '2026-02-05', time: '11:00', duration: 50,
    status: 'realizada', modality: 'presencial',
    psychologist: { name: 'Dra. Elena Voss', initials: 'EV' },
    sessionType: 'Seguimiento',
    motivo: 'Profundización en el análisis funcional y establecimiento de objetivos terapéuticos',
    notes: 'Se finaliza el análisis funcional y se presentan los objetivos del plan de tratamiento. La paciente participa activamente en la co-construcción de metas. Se puntúa ansiedad en escala subjetiva: 7/10. Se inicia psicoeducación sobre el modelo cognitivo de la ansiedad.',
    tasks: [
      { text: 'Lectura de folleto psicoeducativo sobre TAG', completed: true },
      { text: 'Identificar 3 situaciones de ansiedad de la semana y anotar pensamientos asociados', completed: true },
    ],
    nextSession: '19 de febrero de 2026 · 11:00',
    attachments: [
      { name: 'Plan_Tratamiento_Sofia_v1.pdf', size: '215 KB' },
      { name: 'Folleto_Psicoeducacion_TAG.pdf', size: '89 KB' },
    ],
  },
  {
    id: 2, number: 2,
    date: '2026-01-22', time: '10:30', duration: 60,
    status: 'realizada', modality: 'presencial',
    psychologist: { name: 'Dra. Elena Voss', initials: 'EV' },
    sessionType: 'Evaluación',
    motivo: 'Evaluación psicológica completa y análisis funcional',
    notes: 'Se administran las escalas GAD-7 (14 — moderado) y PHQ-9 (11 — moderado). Se realiza entrevista semi-estructurada de historia clínica. Análisis funcional preliminar: estímulos desencadenantes relacionados con sobrecarga laboral y relaciones interpersonales. Se identifican conductas de evitación y busca de reaseguración.',
    tasks: [
      { text: 'Autorregistro de situaciones de ansiedad (próximas 2 semanas)', completed: true },
    ],
    nextSession: '5 de febrero de 2026 · 11:00',
    attachments: [
      { name: 'Escalas_Evaluacion_GAD7_PHQ9.pdf', size: '180 KB' },
    ],
  },
  {
    id: 1, number: 1,
    date: '2026-01-10', time: '10:00', duration: 60,
    status: 'realizada', modality: 'presencial',
    psychologist: { name: 'Dra. Elena Voss', initials: 'EV' },
    sessionType: 'Consulta inicial',
    motivo: 'Primera consulta — presentación y motivo de demanda',
    notes: 'Primera sesión. La paciente acude derivada por su médico de cabecera. Refiere episodios de ansiedad generalizada desde 2022, exacerbados tras cambio laboral en 2025. Presenta insomnio de conciliación, tensión muscular y preocupación excesiva. Se recoge anamnesis completa y se explica el proceso de evaluación. Buena alianza inicial. Paciente motivada para el cambio.',
    tasks: [
      { text: 'Traer listado de medicación actual a próxima sesión', completed: true },
    ],
    nextSession: '22 de enero de 2026 · 10:30',
    attachments: [
      { name: 'Consentimiento_Informado_Sofia.pdf', size: '245 KB' },
      { name: 'Ficha_Paciente_Inicial.pdf', size: '112 KB' },
    ],
  },
]

// ── Filters & state ───────────────────────────────────────────────────────────

type Filter = 'all' | SessionStatus
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',           label: 'Todas' },
  { value: 'realizada',     label: 'Realizadas' },
  { value: 'pendiente',     label: 'Pendientes' },
  { value: 'cancelada',     label: 'Canceladas' },
  { value: 'no-presentada', label: 'No presentadas' },
]

const activeFilter = ref<Filter>('all')
const openSessions = ref<Set<number>>(new Set())

const filtered = computed(() =>
  activeFilter.value === 'all'
    ? SESSIONS
    : SESSIONS.filter(s => s.status === activeFilter.value)
)

function toggleSession(id: number) {
  if (openSessions.value.has(id)) openSessions.value.delete(id)
  else                             openSessions.value.add(id)
  // trigger reactivity
  openSessions.value = new Set(openSessions.value)
}

// ── Stats ─────────────────────────────────────────────────────────────────────

const stats = computed(() => {
  const realized  = SESSIONS.filter(s => s.status === 'realizada').length
  const total     = SESSIONS.filter(s => s.status !== 'pendiente').length
  const pct       = total ? Math.round((realized / total) * 100) : 0
  const lastDone  = SESSIONS.find(s => s.status === 'realizada')
  const daysSince = lastDone
    ? Math.floor((Date.now() - new Date(lastDone.date).getTime()) / 86_400_000)
    : null
  return { total: SESSIONS.length, pct, daysSince }
})

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<SessionStatus, string> = {
  realizada:      'Realizada',
  pendiente:      'Pendiente',
  cancelada:      'Cancelada',
  'no-presentada': 'No presentada',
}

const STATUS_DOT: Record<SessionStatus, string> = {
  realizada:      'bg-primary',
  pendiente:      'bg-muted-foreground/30 ring-2 ring-muted-foreground/20',
  cancelada:      'bg-red-400',
  'no-presentada': 'bg-orange-400',
}

const STATUS_BADGE: Record<SessionStatus, string> = {
  realizada:      'bg-primary/10 text-primary border-primary/20',
  pendiente:      'bg-muted text-muted-foreground border-border',
  cancelada:      'bg-red-50 text-red-700 border-red-200',
  'no-presentada': 'bg-orange-50 text-orange-700 border-orange-200',
}

const MODALITY_ICON: Record<SessionModality, typeof Video> = {
  videollamada: Video,
  telefono:     Phone,
  presencial:   MapPin,
}

const MODALITY_LABEL: Record<SessionModality, string> = {
  videollamada: 'Videollamada',
  telefono:     'Teléfono',
  presencial:   'Presencial',
}

function fmtDate(iso: string, time: string) {
  const d = new Date(iso + 'T12:00:00')
  const day  = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return `${day.charAt(0).toUpperCase() + day.slice(1)} · ${time}`
}
</script>

<template>
  <div class="space-y-6 pb-16">

    <!-- ── Header ──────────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <!-- Stats pills -->
      <div class="flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground border border-border">
          <span class="font-medium text-foreground">{{ stats.total }}</span> sesiones totales
        </span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground border border-border">
          <span class="font-medium text-foreground">{{ stats.pct }}%</span> asistencia
        </span>
        <span v-if="stats.daysSince !== null" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground border border-border">
          Última sesión hace <span class="font-medium text-foreground">{{ stats.daysSince }} días</span>
        </span>
      </div>
      <!-- Action -->
      <Button size="sm" class="gap-1.5 shrink-0">
        <Plus class="w-3.5 h-3.5" /> Nueva sesión
      </Button>
    </div>

    <!-- ── Filter bar ──────────────────────────────────────────────── -->
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="f in FILTERS"
        :key="f.value"
        type="button"
        class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
        :class="activeFilter === f.value
          ? 'bg-primary text-primary-foreground border-primary'
          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- ── Timeline ────────────────────────────────────────────────── -->
    <div class="relative">
      <!-- Vertical line -->
      <div class="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />

      <div class="space-y-3">
        <Collapsible
          v-for="session in filtered"
          :key="session.id"
          :open="openSessions.has(session.id)"
        >
          <div class="relative flex gap-4">

            <!-- Timeline dot -->
            <div class="relative z-10 shrink-0 flex items-start pt-3.5">
              <span
                class="w-[10px] h-[10px] rounded-full shrink-0 mt-0.5"
                :class="STATUS_DOT[session.status]"
              />
            </div>

            <!-- Card -->
            <div class="flex-1 min-w-0 rounded-xl border border-border bg-background mb-1 overflow-hidden">

              <!-- Collapsed summary row (always visible) -->
              <CollapsibleTrigger
                as-child
                @click="toggleSession(session.id)"
              >
                <button
                  type="button"
                  class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors group"
                >
                  <!-- Session number -->
                  <span class="text-xs font-mono text-muted-foreground/70 w-7 shrink-0">#{{ session.number }}</span>

                  <!-- Avatar -->
                  <Avatar class="size-7 shrink-0">
                    <AvatarFallback class="text-[10px] font-semibold bg-primary/10 text-primary">
                      {{ session.psychologist.initials }}
                    </AvatarFallback>
                  </Avatar>

                  <!-- Date + info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm font-medium text-foreground truncate">
                        {{ fmtDate(session.date, session.time) }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span class="text-xs text-muted-foreground">{{ session.psychologist.name }}</span>
                      <span class="text-muted-foreground/40 text-xs">·</span>
                      <span class="text-xs text-muted-foreground flex items-center gap-1">
                        <component :is="MODALITY_ICON[session.modality]" class="w-3 h-3" />
                        {{ MODALITY_LABEL[session.modality] }}
                      </span>
                      <span class="text-muted-foreground/40 text-xs">·</span>
                      <span class="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock class="w-3 h-3" />
                        {{ session.duration }} min
                      </span>
                    </div>
                  </div>

                  <!-- Status badge -->
                  <span
                    class="shrink-0 hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border"
                    :class="STATUS_BADGE[session.status]"
                  >
                    {{ STATUS_LABEL[session.status] }}
                  </span>

                  <!-- Chevron -->
                  <ChevronDown
                    class="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200"
                    :class="openSessions.has(session.id) ? 'rotate-180' : ''"
                  />
                </button>
              </CollapsibleTrigger>

              <!-- Expanded content -->
              <CollapsibleContent>
                <div class="border-t border-border px-4 py-4 space-y-5">

                  <!-- Status badge (mobile visible here) -->
                  <div class="flex items-center justify-between gap-2 sm:hidden">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border"
                      :class="STATUS_BADGE[session.status]"
                    >
                      {{ STATUS_LABEL[session.status] }}
                    </span>
                    <Button v-if="session.status !== 'pendiente'" variant="outline" size="sm" class="text-xs h-7">
                      Editar sesión
                    </Button>
                  </div>

                  <!-- Edit button (desktop) -->
                  <div class="hidden sm:flex justify-end">
                    <Button v-if="session.status !== 'pendiente'" variant="outline" size="sm" class="text-xs h-7">
                      Editar sesión
                    </Button>
                  </div>

                  <!-- Motivo -->
                  <div v-if="session.motivo">
                    <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Motivo de la sesión</p>
                    <p class="text-sm text-foreground leading-relaxed">{{ session.motivo }}</p>
                  </div>

                  <!-- Notes -->
                  <div v-if="session.notes">
                    <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Notas de sesión</p>
                    <p class="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{{ session.notes }}</p>
                  </div>

                  <!-- Tasks -->
                  <div v-if="session.tasks.length > 0">
                    <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tareas asignadas</p>
                    <ul class="space-y-1.5">
                      <li
                        v-for="(task, i) in session.tasks"
                        :key="i"
                        class="flex items-start gap-2 text-sm"
                      >
                        <span
                          class="mt-0.5 w-4 h-4 rounded shrink-0 border flex items-center justify-center text-[10px]"
                          :class="task.completed
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border'"
                        >
                          <span v-if="task.completed">✓</span>
                        </span>
                        <span :class="task.completed ? 'line-through text-muted-foreground' : 'text-foreground'">
                          {{ task.text }}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <!-- Next session -->
                  <div v-if="session.nextSession">
                    <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Próxima sesión sugerida</p>
                    <p class="text-sm text-foreground">{{ session.nextSession }}</p>
                  </div>

                  <!-- Attachments -->
                  <div v-if="session.attachments.length > 0">
                    <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Archivos adjuntos</p>
                    <div class="flex flex-wrap gap-2">
                      <a
                        v-for="(att, i) in session.attachments"
                        :key="i"
                        href="#"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-xs text-foreground hover:bg-muted transition-colors"
                        @click.prevent
                      >
                        <Paperclip class="w-3 h-3 text-muted-foreground" />
                        {{ att.name }}
                        <span class="text-muted-foreground/60">{{ att.size }}</span>
                      </a>
                    </div>
                  </div>

                </div>
              </CollapsibleContent>
            </div>
          </div>
        </Collapsible>

        <!-- Empty state -->
        <div v-if="filtered.length === 0" class="ml-8 py-10 text-center text-sm text-muted-foreground">
          No hay sesiones con este filtro.
        </div>

        <!-- End cap -->
        <div v-if="activeFilter === 'all'" class="relative flex gap-4 items-center">
          <div class="relative z-10 shrink-0">
            <span class="w-[10px] h-[10px] rounded-full bg-muted-foreground/30 block ring-2 ring-muted-foreground/10" />
          </div>
          <span class="text-xs text-muted-foreground/60 italic ml-0.5">Inicio de terapia — enero 2026</span>
        </div>

      </div>
    </div>

  </div>
</template>
