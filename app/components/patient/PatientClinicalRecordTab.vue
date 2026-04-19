<script setup lang="ts">
import {
  Stethoscope, Target, BookOpen, ClipboardCheck, FileText,
  Plus, X, Trash2, GripVertical, AlertTriangle,
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

// ── Options ───────────────────────────────────────────────────────────────────

const SEVERITIES  = ['Leve', 'Moderado', 'Grave']
const RISK_LEVELS = [
  { value: 'none', label: 'Sin riesgo' },
  { value: 'low',  label: 'Bajo' },
  { value: 'mid',  label: 'Medio' },
  { value: 'high', label: 'Alto' },
]
const MODALITIES = ['TCC', 'EMDR', 'Sistémica', 'Humanista', 'Psicodinámica', 'Otro']
const FREQUENCIES = [
  { value: 'semanal',   label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual',   label: 'Mensual' },
  { value: 'a-demanda', label: 'A demanda' },
]
const SUBSTANCES = ['Alcohol', 'Tabaco', 'Cannabis', 'Otros']
const ASSESSMENT_SUGGESTIONS = ['PHQ-9', 'GAD-7', 'BDI-II', 'PCL-5', 'STAI', 'AUDIT', 'SCL-90']

const RISK_STYLE: Record<string, string> = {
  none: 'bg-muted text-muted-foreground border-transparent',
  low:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  mid:  'bg-orange-50 text-orange-700 border-orange-200',
  high: 'bg-red-50 text-red-700 border-red-200',
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface TherapeuticGoal { id: number; text: string; completed: boolean }
interface Medication      { id: number; name: string; dose: string; prescriber: string }
interface Assessment      { id: number; name: string; score: string; date: string; by: string }

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL = {
  primaryDiagnosisCode:  'F41.1',
  primaryDiagnosisLabel: 'Trastorno de ansiedad generalizada',
  secondaryDiagnoses:    ['F32.1 – Episodio depresivo moderado'] as string[],
  severity:              'Moderado',
  riskLevel:             'low',
  firstConsultation:     '2026-01-10',
  estimatedDuration:     '12 meses',

  modalities: ['TCC', 'Humanista'] as string[],
  frequency:  'semanal',
  goals: [
    { id: 1, text: 'Reducir sintomatología ansiosa (GAD ≤ 7)', completed: true },
    { id: 2, text: 'Desarrollar habilidades de regulación emocional', completed: false },
    { id: 3, text: 'Mejorar calidad del sueño', completed: false },
  ] as TherapeuticGoal[],
  hasReferral:          false,
  referralSpecialty:    '',
  referralProfessional: '',

  hasPreviousTreatment:     true,
  previousTreatmentDetails: 'Tratamiento farmacológico con ansiolíticos durante 2022–2023. Sin psicoterapia previa.',
  medicalHistory:           'Hipotiroidismo controlado. Sin alergias conocidas.',
  medications: [
    { id: 1, name: 'Levotiroxina', dose: '50 mcg/día', prescriber: 'Dr. García (endocrino)' },
  ] as Medication[],
  substances:   [] as string[],
  familyHistory: 'Madre con diagnóstico de depresión mayor. Abuela materna con trastorno bipolar.',

  assessments: [
    { id: 1, name: 'GAD-7', score: '14 (Moderado)', date: '2026-01-10', by: 'Dra. Elena Voss' },
    { id: 2, name: 'PHQ-9', score: '11 (Moderado)', date: '2026-01-10', by: 'Dra. Elena Voss' },
    { id: 3, name: 'STAI',  score: 'E:52 / R:48',  date: '2026-03-05', by: 'Dra. Elena Voss' },
  ] as Assessment[],

  motivoConsulta:    'Dificultad para gestionar el estrés laboral y preocupación excesiva por situaciones cotidianas. Refiere insomnio de conciliación y tensión muscular constante.',
  observacionesClin: 'Paciente colaboradora, con buena capacidad de introspección. Presenta discurso coherente y orientada en tiempo y espacio. Estado de ánimo deprimido de intensidad leve-moderada.',
  hipotesisClin:     'Trastorno de ansiedad generalizada con componente depresivo secundario, probablemente mantenido por esquemas de hiperresponsabilidad y baja tolerancia a la incertidumbre.',
}

// ── Reactive form ─────────────────────────────────────────────────────────────

const form = reactive({
  ...INITIAL,
  secondaryDiagnoses: [...INITIAL.secondaryDiagnoses],
  modalities:         [...INITIAL.modalities],
  goals:              INITIAL.goals.map(g => ({ ...g })),
  medications:        INITIAL.medications.map(m => ({ ...m })),
  substances:         [...INITIAL.substances],
  assessments:        INITIAL.assessments.map(a => ({ ...a })),
})

const snapshot = ref(JSON.stringify(INITIAL))
const isDirty  = computed(() => JSON.stringify({
  ...form,
  goals:       form.goals.map(g => ({ ...g })),
  medications: form.medications.map(m => ({ ...m })),
  assessments: form.assessments.map(a => ({ ...a })),
}) !== snapshot.value)

// ── Secondary diagnoses ───────────────────────────────────────────────────────

const diagInput = ref('')
function addDiagnosis() {
  const v = diagInput.value.trim()
  if (v && !form.secondaryDiagnoses.includes(v)) form.secondaryDiagnoses.push(v)
  diagInput.value = ''
}

// ── Modalities ────────────────────────────────────────────────────────────────

function toggleModality(m: string) {
  const idx = form.modalities.indexOf(m)
  if (idx === -1) form.modalities.push(m)
  else            form.modalities.splice(idx, 1)
}

// ── Goals ─────────────────────────────────────────────────────────────────────

let goalCounter = Math.max(...INITIAL.goals.map(g => g.id)) + 1
function addGoal() {
  form.goals.push({ id: goalCounter++, text: '', completed: false })
}
function removeGoal(id: number) { form.goals = form.goals.filter(g => g.id !== id) }

// ── Medications ───────────────────────────────────────────────────────────────

let medCounter = Math.max(...INITIAL.medications.map(m => m.id)) + 1
function addMedication() {
  form.medications.push({ id: medCounter++, name: '', dose: '', prescriber: '' })
}
function removeMedication(id: number) { form.medications = form.medications.filter(m => m.id !== id) }

// ── Substances ────────────────────────────────────────────────────────────────

function toggleSubstance(s: string) {
  const idx = form.substances.indexOf(s)
  if (idx === -1) form.substances.push(s)
  else            form.substances.splice(idx, 1)
}

// ── Assessments ───────────────────────────────────────────────────────────────

let assCounter    = Math.max(...INITIAL.assessments.map(a => a.id)) + 1
const showAddRow  = ref(false)
const newAss      = reactive({ name: '', score: '', date: '', by: '' })

function addAssessment() {
  if (!newAss.name.trim()) return
  form.assessments.push({ id: assCounter++, ...newAss, name: newAss.name.trim(), score: newAss.score.trim(), by: newAss.by.trim() })
  Object.assign(newAss, { name: '', score: '', date: '', by: '' })
  showAddRow.value = false
}
function removeAssessment(id: number) { form.assessments = form.assessments.filter(a => a.id !== id) }

// ── Save / Discard ────────────────────────────────────────────────────────────

function save() {
  snapshot.value = JSON.stringify({
    ...form,
    goals:       form.goals.map(g => ({ ...g })),
    medications: form.medications.map(m => ({ ...m })),
    assessments: form.assessments.map(a => ({ ...a })),
  })
}

function discard() {
  Object.assign(form, {
    ...INITIAL,
    secondaryDiagnoses: [...INITIAL.secondaryDiagnoses],
    modalities:         [...INITIAL.modalities],
    goals:              INITIAL.goals.map(g => ({ ...g })),
    medications:        INITIAL.medications.map(m => ({ ...m })),
    substances:         [...INITIAL.substances],
    assessments:        INITIAL.assessments.map(a => ({ ...a })),
  })
}
</script>

<template>
  <div class="relative space-y-4 pb-28">

    <!-- ═══════════════════════════════════════════════════════════════
         Diagnostic & Clinical Status
    ════════════════════════════════════════════════════════════════ -->
    <Card>
      <CardHeader class="pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950">
            <Stethoscope class="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle class="text-sm font-semibold">Diagnóstico y estado clínico</CardTitle>
            <CardDescription class="text-xs">Diagnóstico principal, severidad y riesgo</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-5">

        <!-- Primary diagnosis -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Código ICD-11</Label>
            <Input v-model="form.primaryDiagnosisCode" placeholder="F41.1" class="font-mono" />
          </div>
          <div class="sm:col-span-3">
            <Label class="mb-1.5 block text-xs text-muted-foreground">Diagnóstico principal</Label>
            <Input v-model="form.primaryDiagnosisLabel" placeholder="Nombre del diagnóstico" />
          </div>
        </div>

        <!-- Secondary diagnoses -->
        <div>
          <Label class="mb-1.5 block text-xs text-muted-foreground">Diagnósticos secundarios</Label>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <Badge
              v-for="(d, i) in form.secondaryDiagnoses"
              :key="i"
              variant="secondary"
              class="gap-1 pr-1 font-normal"
            >
              {{ d }}
              <button type="button" class="ml-0.5 rounded-sm hover:text-destructive" @click="form.secondaryDiagnoses.splice(i, 1)">
                <X class="w-3 h-3" />
              </button>
            </Badge>
          </div>
          <div class="flex gap-2">
            <Input
              v-model="diagInput"
              placeholder="Código + etiqueta, p.ej. F32.1 – Depresión"
              class="text-sm"
              @keydown.enter.prevent="addDiagnosis"
            />
            <Button type="button" variant="outline" size="sm" class="shrink-0" @click="addDiagnosis">
              <Plus class="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <!-- Severity + Risk + Dates row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Severity -->
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Severidad</Label>
            <div class="flex rounded-md border border-border overflow-hidden h-9">
              <button
                v-for="s in SEVERITIES"
                :key="s"
                type="button"
                class="flex-1 text-xs font-medium transition-colors"
                :class="form.severity === s
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'"
                @click="form.severity = s"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <!-- Risk level -->
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Nivel de riesgo</Label>
            <Select v-model="form.riskLevel">
              <SelectTrigger>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                  :class="RISK_STYLE[form.riskLevel]"
                >
                  {{ RISK_LEVELS.find(r => r.value === form.riskLevel)?.label }}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in RISK_LEVELS" :key="r.value" :value="r.value">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                    :class="RISK_STYLE[r.value]"
                  >
                    {{ r.label }}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- First consultation -->
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Primera consulta</Label>
            <Input :value="form.firstConsultation" type="date" disabled class="opacity-60 cursor-not-allowed" />
          </div>

          <!-- Estimated duration -->
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Duración estimada</Label>
            <Input v-model="form.estimatedDuration" placeholder="p.ej. 6 meses" />
          </div>
        </div>

      </CardContent>
    </Card>

    <!-- ═══════════════════════════════════════════════════════════════
         Treatment Plan  (2-col: modalities+frequency | goals)
    ════════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <!-- Modality & Frequency -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-2.5">
            <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950">
              <Target class="w-3.5 h-3.5 text-violet-600" />
            </div>
            <CardTitle class="text-sm font-semibold">Modalidad y frecuencia</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="pt-4 space-y-4">
          <div>
            <Label class="mb-2 block text-xs text-muted-foreground">Modalidad terapéutica</Label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="m in MODALITIES"
                :key="m"
                type="button"
                class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                :class="form.modalities.includes(m)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'"
                @click="toggleModality(m)"
              >
                {{ m }}
              </button>
            </div>
          </div>
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Frecuencia de sesiones</Label>
            <Select v-model="form.frequency">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="f in FREQUENCIES" :key="f.value" :value="f.value">
                  {{ f.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <!-- Referral -->
          <div class="pt-1 border-t border-border">
            <div class="flex items-center justify-between mb-3">
              <Label class="text-xs text-muted-foreground">Derivación a otro especialista</Label>
              <Switch v-model="form.hasReferral" />
            </div>
            <div v-if="form.hasReferral" class="space-y-3">
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Especialidad</Label>
                <Input v-model="form.referralSpecialty" placeholder="p.ej. Psiquiatría" />
              </div>
              <div>
                <Label class="mb-1.5 block text-xs text-muted-foreground">Profesional</Label>
                <Input v-model="form.referralProfessional" placeholder="Nombre del profesional" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Therapeutic Goals -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                <ClipboardCheck class="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <CardTitle class="text-sm font-semibold">Objetivos terapéuticos</CardTitle>
            </div>
            <Button type="button" variant="ghost" size="sm" class="gap-1 text-xs h-7 text-primary hover:text-primary" @click="addGoal">
              <Plus class="w-3.5 h-3.5" /> Añadir
            </Button>
          </div>
        </CardHeader>
        <CardContent class="pt-4">
          <div class="space-y-2">
            <div
              v-for="goal in form.goals"
              :key="goal.id"
              class="flex items-center gap-2 group"
            >
              <GripVertical class="w-4 h-4 text-muted-foreground/30 shrink-0 cursor-grab" />
              <input
                v-model="goal.completed"
                type="checkbox"
                class="accent-primary w-4 h-4 shrink-0 cursor-pointer"
              />
              <Input
                v-model="goal.text"
                class="flex-1 h-8 text-sm"
                :class="goal.completed ? 'line-through text-muted-foreground' : ''"
                placeholder="Describir objetivo…"
              />
              <button
                type="button"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                @click="removeGoal(goal.id)"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
            <p v-if="form.goals.length === 0" class="text-xs text-muted-foreground/60 py-2">
              Sin objetivos definidos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         Relevant Background  (medical history | medications | other)
    ════════════════════════════════════════════════════════════════ -->

    <!-- Row: Previous treatment + Medical history -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <!-- Previous treatment & Medical history -->
      <Card>
        <CardHeader class="pb-3 border-b border-border">
          <div class="flex items-center gap-2.5">
            <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950">
              <BookOpen class="w-3.5 h-3.5 text-sky-600" />
            </div>
            <CardTitle class="text-sm font-semibold">Antecedentes clínicos</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="pt-4 space-y-4">
          <!-- Previous treatment -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <Label class="text-xs text-muted-foreground">Tratamiento previo</Label>
              <Switch v-model="form.hasPreviousTreatment" />
            </div>
            <div v-if="form.hasPreviousTreatment">
              <Textarea
                v-model="form.previousTreatmentDetails"
                placeholder="Describe el tratamiento anterior…"
                class="min-h-[80px] text-sm resize-none"
              />
            </div>
          </div>
          <!-- Medical history -->
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Historia médica relevante</Label>
            <Textarea
              v-model="form.medicalHistory"
              placeholder="Enfermedades crónicas, cirugías, alergias…"
              class="min-h-[80px] text-sm resize-none"
            />
          </div>
          <!-- Family history -->
          <div>
            <Label class="mb-1.5 block text-xs text-muted-foreground">Antecedentes familiares psiquiátricos</Label>
            <Textarea
              v-model="form.familyHistory"
              placeholder="Historia psiquiátrica familiar relevante…"
              class="min-h-[72px] text-sm resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Medications + Substances -->
      <div class="space-y-4">
        <!-- Medications -->
        <Card>
          <CardHeader class="pb-3 border-b border-border">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950">
                  <AlertTriangle class="w-3.5 h-3.5 text-rose-500" />
                </div>
                <CardTitle class="text-sm font-semibold">Medicación actual</CardTitle>
              </div>
              <Button type="button" variant="ghost" size="sm" class="gap-1 text-xs h-7 text-primary hover:text-primary" @click="addMedication">
                <Plus class="w-3.5 h-3.5" /> Añadir
              </Button>
            </div>
          </CardHeader>
          <CardContent class="pt-4">
            <div class="space-y-2">
              <div
                v-for="med in form.medications"
                :key="med.id"
                class="grid grid-cols-3 gap-2 group items-center"
              >
                <Input v-model="med.name"       class="text-sm h-8" placeholder="Medicamento" />
                <Input v-model="med.dose"       class="text-sm h-8" placeholder="Dosis" />
                <div class="flex gap-1 items-center">
                  <Input v-model="med.prescriber" class="text-sm h-8 flex-1" placeholder="Prescriptor" />
                  <button
                    type="button"
                    class="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                    @click="removeMedication(med.id)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p v-if="form.medications.length === 0" class="text-xs text-muted-foreground/60 py-1">
                Sin medicación registrada.
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Substances -->
        <Card>
          <CardHeader class="pb-3 border-b border-border">
            <div class="flex items-center gap-2.5">
              <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950">
                <AlertTriangle class="w-3.5 h-3.5 text-amber-500" />
              </div>
              <CardTitle class="text-sm font-semibold">Uso de sustancias</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="pt-4">
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                :class="form.substances.length === 0
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'"
                @click="form.substances = []"
              >
                Ninguno
              </button>
              <button
                v-for="s in SUBSTANCES"
                :key="s"
                type="button"
                class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                :class="form.substances.includes(s)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'"
                @click="toggleSubstance(s)"
              >
                {{ s }}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         Psychometric Assessments
    ════════════════════════════════════════════════════════════════ -->
    <Card>
      <CardHeader class="pb-3 border-b border-border">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950">
              <ClipboardCheck class="w-3.5 h-3.5 text-teal-600" />
            </div>
            <CardTitle class="text-sm font-semibold">Evaluaciones psicométricas</CardTitle>
          </div>
          <Button type="button" variant="ghost" size="sm" class="gap-1 text-xs h-7 text-primary hover:text-primary" @click="showAddRow = !showAddRow">
            <Plus class="w-3.5 h-3.5" /> Añadir
          </Button>
        </div>
      </CardHeader>
      <CardContent class="pt-0 pb-0">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Evaluación</th>
              <th class="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Puntuación</th>
              <th class="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Fecha</th>
              <th class="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Administrado por</th>
              <th class="w-8" />
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="a in form.assessments" :key="a.id" class="group hover:bg-muted/30">
              <td class="px-4 py-2.5 font-medium text-foreground">{{ a.name }}</td>
              <td class="px-4 py-2.5 text-muted-foreground font-mono text-xs">{{ a.score }}</td>
              <td class="px-4 py-2.5 text-muted-foreground text-xs">{{ a.date }}</td>
              <td class="px-4 py-2.5 text-muted-foreground text-xs hidden sm:table-cell">{{ a.by }}</td>
              <td class="px-2 py-2.5">
                <button
                  type="button"
                  class="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  @click="removeAssessment(a.id)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
            <tr v-if="form.assessments.length === 0">
              <td colspan="5" class="px-4 py-4 text-center text-xs text-muted-foreground">
                Sin evaluaciones registradas.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Inline add row -->
        <div v-if="showAddRow" class="border-t border-dashed border-border bg-muted/20 px-4 py-4 space-y-3">
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="sug in ASSESSMENT_SUGGESTIONS"
              :key="sug"
              type="button"
              class="px-2 py-0.5 rounded text-xs border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              @click="newAss.name = sug"
            >
              {{ sug }}
            </button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input v-model="newAss.name"  placeholder="Nombre"      class="text-sm" />
            <Input v-model="newAss.score" placeholder="Puntuación"  class="text-sm font-mono" />
            <Input v-model="newAss.date"  type="date"               class="text-sm" />
            <Input v-model="newAss.by"    placeholder="Por"         class="text-sm" />
          </div>
          <div class="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" class="text-xs" @click="showAddRow = false">Cancelar</Button>
            <Button type="button" size="sm" class="text-xs" @click="addAssessment">Guardar</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- ═══════════════════════════════════════════════════════════════
         Clinical Notes
    ════════════════════════════════════════════════════════════════ -->
    <Card>
      <CardHeader class="pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900">
            <FileText class="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <CardTitle class="text-sm font-semibold">Notas clínicas estructuradas</CardTitle>
            <CardDescription class="text-xs">Formulación del caso y observaciones clínicas</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-5 space-y-5">
        <div>
          <Label class="mb-1.5 block text-xs text-muted-foreground">
            Motivo de consulta <span class="text-rose-500">*</span>
          </Label>
          <Textarea
            v-model="form.motivoConsulta"
            placeholder="Descripción del motivo de consulta inicial…"
            class="min-h-[100px] text-sm resize-none"
          />
        </div>
        <div>
          <Label class="mb-1.5 block text-xs text-muted-foreground">Observaciones clínicas generales</Label>
          <Textarea
            v-model="form.observacionesClin"
            placeholder="Estado mental, presentación, observaciones del clínico…"
            class="min-h-[100px] text-sm resize-none"
          />
        </div>
        <div>
          <Label class="mb-1.5 block text-xs text-muted-foreground">Hipótesis clínica</Label>
          <Textarea
            v-model="form.hipotesisClin"
            placeholder="Formulación del caso, hipótesis de trabajo…"
            class="min-h-[100px] text-sm resize-none"
          />
        </div>
      </CardContent>
    </Card>

  </div>

  <!-- ═══════════════════════════════════════════════════════════════
       Sticky action bar
  ════════════════════════════════════════════════════════════════ -->
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
