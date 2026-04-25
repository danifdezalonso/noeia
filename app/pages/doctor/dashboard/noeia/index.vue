<script setup lang="ts">
import {
  Trash2, Plus, Send, Sparkles, ChevronDown, ChevronLeft, ChevronRight,
  Mic, Undo2, Redo2, Copy, Paperclip, UserRound, LayoutGrid, Pencil,
  Languages, CalendarDays, Volume2, X,
  Bold, Italic, Underline, Strikethrough, List, Heading1,
  PanelLeftClose, PanelLeftOpen,
  ExternalLink, PenLine, Zap, RotateCcw,
  LayoutTemplate, Search, ArrowUpDown, FileText, User, Globe,
  RefreshCw, FilePlus, FileEdit, Check,
  ListChecks, Share2, MessageSquareMore, CheckCircle2,
} from 'lucide-vue-next'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import {
  format, addDays, startOfWeek, subWeeks, addMonths, subMonths,
  startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { nextTick, type Component } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Switch } from '~/components/ui/switch'
import { Slider } from '~/components/ui/slider'

definePageMeta({ layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────────────────────

interface TranscriptLine {
  speaker: 'therapist' | 'patient'
  time: string
  text: string
}

type TaskCategory = 'document' | 'coordinate' | 'communicate' | 'review'

interface AiTask {
  id: string
  text: string
  done: boolean
  category: TaskCategory
}

interface SessionRecord {
  id: string
  label: string
  noteText: string
  transcript: TranscriptLine[]
  aiSummary?: string
}

interface Appointment {
  id: string
  patientName: string
  initials: string
  avatarBg: string
  avatarText: string
  time: string
  groupLabel: string
  tab: 'schedule' | 'past'
  tasks: AiTask[]
  inputLanguage: string
  outputLanguage: string
  contextText: string
  sessions: SessionRecord[]
  sessionDate: Date
  sessionTime: string
}

// ── Seed data ──────────────────────────────────────────────────────────────

const mon  = startOfWeek(new Date(), { weekStartsOn: 1 })
const prev = subWeeks(mon, 1)

const appointments = ref<Appointment[]>([
  {
    id: 'a0', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: 'Today', tab: 'schedule',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: 'Referred by Dr. García. Generalised anxiety, sleep disturbance. CBT-based approach ongoing.',
    sessionDate: new Date(), sessionTime: '10:00',
    sessions: [{ id: 's0', label: 'CBT: Cognitive Restructuring', noteText: '<p><strong>Session focus:</strong> Cognitive restructuring of workplace triggers.</p><p>Sofia arrived on time. She reported a difficult week — two incidents at work where she felt "exposed" in front of colleagues. We revisited the CBT triangle and walked through both events using thought records.</p><p><strong>Key theme:</strong> Strong tendency toward mind-reading ("they think I\'m incompetent"). Challenged this with behavioural evidence — no negative feedback received from manager or peers in the past quarter.</p><p><strong>Homework:</strong> Complete one thought record per day. Note the triggering situation, the automatic thought, and three pieces of evidence for/against.</p>', transcript: [] }],
    tasks: [
      { id: 't0', text: 'Administer seasonal flu vaccine', done: true,  category: 'document' },
      { id: 't1', text: 'Add Ventolin inhaler to patient record', done: false, category: 'document' },
      { id: 't2', text: 'Arrange spirometry test at respiratory clinic for next Thursday 9am', done: false, category: 'coordinate' },
      { id: 't3', text: 'Call Dr. Thompson to arrange psychology appointment', done: false, category: 'communicate' },
    ],
  },
  {
    id: 'a1', patientName: 'Mia Anderson', initials: 'MA',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '4:25pm', groupLabel: 'Today', tab: 'schedule',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: new Date(), sessionTime: '01:54',
    sessions: [{ id: 's1', label: 'Sleep Diary Review', noteText: '<p><strong>Session focus:</strong> CBT-I sleep restriction phase.</p><p>Maddy completed the sleep diary for the full week. Sleep efficiency improved to 78% (target: ≥85%). She is still resisting the strict wake time on weekends — explored underlying beliefs about "catching up".</p><p>Introduced sleep window narrowing: 00:00–06:30 this week.</p>', transcript: [] }],
    tasks: [],
  },
  {
    id: 'a2', patientName: 'Mia Anderson', initials: 'MA',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '2:00pm', groupLabel: '22/02/2026', tab: 'schedule',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: 'Patient reported improvement in sleep patterns last week. Continue CBT techniques for anxiety management.\n\nReferral from Dr. García (GP). Original complaint: generalised anxiety, sleep disturbance.',
    sessionDate: addDays(mon, 1), sessionTime: '14:00',
    sessions: [{ id: 's2', label: 'Stimulus Control + Relaxation', noteText: '<p><strong>Session focus:</strong> Consolidating stimulus control, introducing PMR.</p><p>Mia reports the bed-only-for-sleep rule is holding. She moved her phone charger out of the bedroom — noted as a significant behavioural shift. Introduced progressive muscle relaxation as a pre-sleep ritual. Practiced a 10-minute body scan in session.</p>', transcript: [] }],
    tasks: [],
  },
  {
    id: 'a3', patientName: 'John Doe', initials: 'JD',
    avatarBg: 'bg-sky-100', avatarText: 'text-sky-700',
    time: '10:00am', groupLabel: '24/02/2026', tab: 'schedule',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: addDays(mon, 3), sessionTime: '10:00',
    sessions: [{ id: 's3', label: 'Values Clarification + Boundaries', noteText: '<p><strong>Session focus:</strong> Values work and delegation practice review.</p><p>John delegated three tasks this week — a personal best. He reported guilt lasting approximately 4 hours after the first delegation, reducing to 1 hour by the third. Explored the perfectionism schema underlying the guilt: "if I don\'t do it myself, it won\'t be done right."</p><p>Introduced the values card exercise — John ranked "family" and "creative output" above "professional status" when prompted to consider a year without work.</p>', transcript: [] }],
    tasks: [],
  },
  {
    id: 'a4', patientName: 'Mia Anderson', initials: 'MA',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '3:00pm', groupLabel: '20/02/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: 'Patient has been experiencing work-related stress. Referred by Dr. García.',
    sessionDate: addDays(prev, 3), sessionTime: '15:00',
    sessions: [{
      id: 's4', label: 'Sleep Progress + Journalling', noteText: '<p><strong>Session notes:</strong> Positive session. Sleep efficiency now 82%. Patient arrived energised and reported journalling every night this week without prompting.</p><p>We reviewed two journal entries together — she identified a pattern of self-criticism surfacing between 10–11pm. Explored cognitive defusion: naming the inner critic ("the editor").</p>',
      aiSummary: 'Patient reports improvement in sleep (fewer awakenings). Breathing exercises and journalling cited as effective interventions. Continue CBT-based sleep hygiene. Positive trajectory — reinforce behavioural activation.',
      transcript: [
        { speaker: 'therapist', time: '15:02', text: 'How have you been feeling this week compared to last time?' },
        { speaker: 'patient',   time: '15:03', text: 'Honestly, a bit better. The breathing exercises have been helping at night.' },
        { speaker: 'therapist', time: '15:04', text: 'That\'s great to hear. When you say better — can you be more specific? What changed?' },
        { speaker: 'patient',   time: '15:05', text: 'I\'m not waking up as often. Maybe once or twice instead of four or five times.' },
        { speaker: 'therapist', time: '15:07', text: 'That\'s meaningful progress. Let\'s keep building on that.' },
        { speaker: 'patient',   time: '15:08', text: 'I think writing things down before bed helped. I stop ruminating once it\'s on paper.' },
      ],
    }],
    tasks: [
      { id: 't7', text: 'Reinforce sleep hygiene handout at next session', done: false, category: 'document' },
      { id: 't8', text: 'Review journalling technique — check consistency', done: true, category: 'review' },
    ],
  },
  {
    id: 'a5', patientName: 'John Doe', initials: 'JD',
    avatarBg: 'bg-sky-100', avatarText: 'text-sky-700',
    time: '11:00am', groupLabel: '18/02/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: addDays(prev, 1), sessionTime: '11:00',
    sessions: [{
      id: 's5', label: 'Occupational Stress — Intake', noteText: '<p><strong>Intake notes:</strong> John self-referred. Presenting complaint: chronic overwhelm since promotion 6 months ago. Reports inability to disengage from work after hours, disrupted sleep, and increasing irritability at home.</p><p>PHQ-9: 7 (mild), GAD-7: 11 (moderate). No previous therapy. Motivated and articulate. Agreed on 8-session ACT-informed CBT protocol.</p>',
      aiSummary: 'Intake session. Patient presents with occupational stress following recent promotion. Symptoms: inability to disengage, chronic overwhelm. No previous therapy. Goal-setting and psychoeducation scheduled for next session.',
      transcript: [
        { speaker: 'therapist', time: '11:01', text: 'Welcome, John. What brings you here today?' },
        { speaker: 'patient',   time: '11:02', text: 'I\'ve been feeling overwhelmed. Work, home — everything needs attention at once and I can\'t switch off.' },
        { speaker: 'therapist', time: '11:04', text: 'I\'m glad you\'re here. Has this been building over time or did something specific trigger it?' },
        { speaker: 'patient',   time: '11:05', text: 'It\'s been building for about six months. A promotion that I now regret taking.' },
      ],
    }],
    tasks: [],
  },
  {
    id: 'a6', patientName: 'Carmen López', initials: 'CL',
    avatarBg: 'bg-rose-100', avatarText: 'text-rose-700',
    time: '9:00am', groupLabel: '11/02/2026', tab: 'past',
    inputLanguage: 'Spanish', outputLanguage: 'Spanish',
    contextText: 'Trastorno de ansiedad generalizada. Derivada por médico de cabecera. Síntomas principales: tensión muscular crónica, dificultad para conciliar el sueño, pensamientos rumiativos.',
    sessionDate: addDays(prev, -3), sessionTime: '09:00',
    sessions: [{
      id: 's6', label: 'Relajación Progresiva', noteText: '<p><strong>Notas de sesión:</strong> Carmen llegó con tensión muscular visible en hombros y cuello. Repasamos el registro de pensamientos de la semana — 6 entradas, bien cumplimentadas.</p><p>Introdujimos la técnica de relajación muscular progresiva de Jacobson. La practicamos durante 15 minutos en sesión. La paciente reportó una reducción subjetiva del 40% en la tensión al finalizar.</p><p><strong>Tarea:</strong> Practicar RPM cada noche antes de dormir, registrar nivel de tensión pre/post (escala 0–10).</p>',
      aiSummary: 'Segunda sesión. La paciente reporta ligera reducción de la tensión muscular tras practicar la relajación progresiva. Se refuerza la técnica y se introduce el registro de pensamientos automáticos.',
      transcript: [],
    }],
    tasks: [
      { id: 't10', text: 'Enviar ficha de registro de pensamientos automáticos', done: true, category: 'document' },
    ],
  },
  {
    id: 'a7', patientName: 'Roberto Sanz', initials: 'RS',
    avatarBg: 'bg-teal-100', avatarText: 'text-teal-700',
    time: '2:00pm', groupLabel: '05/02/2026', tab: 'past',
    inputLanguage: 'Spanish', outputLanguage: 'Spanish',
    contextText: 'Paciente de 42 años. Estrés laboral crónico, burnout. Sin terapia previa. Empresa tecnológica, posición directiva.',
    sessionDate: addDays(prev, -8), sessionTime: '14:00',
    sessions: [{
      id: 's7', label: 'Evaluación Burnout — Inicio', noteText: '<p><strong>Primera sesión:</strong> Roberto derivado por médico de cabecera. Síntomas consistentes con burnout severo (Maslach: AE alta, DP moderada, RP baja). Lleva 8 meses sin vacaciones. Duerme 5h de media.</p><p>Psicoeducación sobre el ciclo estrés-agotamiento. Se acuerda protocolo de 10 sesiones con componentes de activación conductual y reestructuración de creencias laborales.</p>',
      aiSummary: 'Sesión de evaluación inicial. Roberto presenta síntomas claros de burnout: agotamiento emocional, despersonalización y baja sensación de logro. Se inicia psicoeducación sobre el ciclo estrés-respuesta y se acuerda registro semanal de actividades y estado emocional.',
      transcript: [
        { speaker: 'therapist', time: '14:02', text: '¿Cómo describirías tu nivel de energía esta semana?' },
        { speaker: 'patient',   time: '14:03', text: 'Llegué al viernes sin poder más. El fin de semana lo pasé en el sofá, incapaz de hacer nada.' },
        { speaker: 'therapist', time: '14:05', text: '¿Cuánto tiempo llevas sintiéndote así?' },
        { speaker: 'patient',   time: '14:06', text: 'Unos ocho meses. Desde que ascendí al puesto de director.' },
      ],
    }],
    tasks: [
      { id: 't11', text: 'Compartir cuestionario Maslach de burnout por email', done: true, category: 'communicate' },
      { id: 't12', text: 'Revisar registro semanal en próxima sesión', done: false, category: 'review' },
    ],
  },
  {
    id: 'a8', patientName: 'Carmen López', initials: 'CL',
    avatarBg: 'bg-rose-100', avatarText: 'text-rose-700',
    time: '9:00am', groupLabel: '26/02/2026', tab: 'schedule',
    inputLanguage: 'Spanish', outputLanguage: 'Spanish',
    contextText: '',
    sessionDate: addDays(mon, 9), sessionTime: '09:00',
    sessions: [{ id: 's8', label: 'Flecha Descendente — Revisión', noteText: '<p><strong>Sesión pendiente.</strong> Objetivo: revisar los registros de pensamientos automáticos de la semana y continuar con la técnica de la flecha descendente para explorar creencias nucleares.</p><p>Preparar: ficha de creencias intermedias, ejemplo de diálogo socrático.</p>', transcript: [] }],
    tasks: [],
  },
  {
    id: 'a9', patientName: 'Ana Belén Castro', initials: 'AC',
    avatarBg: 'bg-amber-100', avatarText: 'text-amber-700',
    time: '11:30am', groupLabel: '04/03/2026', tab: 'schedule',
    inputLanguage: 'Spanish', outputLanguage: 'Spanish',
    contextText: 'Derivada por médico de cabecera. Episodio depresivo leve tras duelo por pérdida de empleo. Sin medicación actual.',
    sessionDate: addDays(mon, 16), sessionTime: '11:30',
    sessions: [{ id: 's9', label: 'Grief & Activation Plan', noteText: '<p><strong>Session pending.</strong> Ana Belén — third session. Plan: review behavioural activation log, identify one valued activity blocked by grief response, introduce behavioural experiment.</p><p>PHQ-9 to be re-administered (due at session 3).</p>', transcript: [] }],
    tasks: [],
  },
  // ── Other patients ───────────────────────────────────────────────────────
  {
    id: 'mt-a01', patientName: 'Mia Anderson', initials: 'MA',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '4:00pm', groupLabel: '13/02/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -1), sessionTime: '16:00',
    sessions: [{ id: 'mt-s01', label: 'Stimulus Control — Intro', noteText: '<p>Sleep diary reviewed. Average sleep onset: 68 min, sleep efficiency: 64%. Strict wake time set at 06:45 regardless of sleep quality. No napping rule introduced. Mia expressed concern about weekend — explored this in depth.</p>', aiSummary: 'Patient reports ongoing sleep difficulties. Introduced stimulus control therapy. Strict wake time and no-napping rule assigned as homework.', transcript: [] }],
    tasks: [{ id: 'mt-t01', text: 'Send sleep diary template', done: true, category: 'document' }],
  },
  {
    id: 'mt-a02', patientName: 'Mia Anderson', initials: 'MA',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '4:00pm', groupLabel: '06/02/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -8), sessionTime: '16:00',
    sessions: [{ id: 'mt-s02', label: 'PMR + Sleep Window Tightening', noteText: '<p>Sleep efficiency 72%, up from 64%. Mia pleased with progress. Introduced PMR — practiced in session. Sleep window adjusted: 23:30–06:45. Reviewed sleep hygiene checklist. Patient engaged and compliant.</p>', aiSummary: 'Third session. Sleep diary reviewed — sleep efficiency improved to 72%. Patient motivated. Introduced progressive muscle relaxation as pre-sleep routine.', transcript: [] }],
    tasks: [],
  },
  {
    id: 'mt-a03', patientName: 'Mia Anderson', initials: 'MA',
    avatarBg: 'bg-violet-100', avatarText: 'text-violet-700',
    time: '4:00pm', groupLabel: '23/01/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -21), sessionTime: '16:00',
    sessions: [{ id: 'mt-s03', label: 'Insomnia Intake — CBT-I', noteText: '<p><strong>Intake:</strong> Mia self-referred via GP. Chronic insomnia 8 months, secondary to work redundancy. Average sleep: 4.5h. PHQ-9: 11, ISI: 19 (severe). No current medication. Motivated. CBT-I 6-session protocol agreed. Sleep diary to begin immediately.</p>', aiSummary: 'Intake session. Chronic insomnia onset 8 months ago, low mood. PHQ-9: 11. CBT-I protocol introduced and agreed.', transcript: [] }],
    tasks: [],
  },
  {
    id: 'jd-a01', patientName: 'John Doe', initials: 'JD',
    avatarBg: 'bg-sky-100', avatarText: 'text-sky-700',
    time: '11:00am', groupLabel: '04/02/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -10), sessionTime: '11:00',
    sessions: [{ id: 'jd-s01', label: 'Stress Triggers + SMART Goals', noteText: '<p>Three main stressors mapped: unclear role expectations, inability to delegate, fear of failure post-promotion. Introduced SMART framework for goal-setting. John identified first goal: delegate at least one task per week for the next month. Discussed catastrophic thinking patterns around failure.</p>', aiSummary: 'Follow-up after intake. Reviewed occupational stress triggers. Three key stressors identified: unclear expectations, lack of delegation, fear of failure. Goal-setting started using SMART framework.', transcript: [] }],
    tasks: [{ id: 'jd-t01', text: 'Send SMART goals worksheet', done: true, category: 'document' }],
  },
  {
    id: 'jd-a02', patientName: 'John Doe', initials: 'JD',
    avatarBg: 'bg-sky-100', avatarText: 'text-sky-700',
    time: '11:00am', groupLabel: '21/01/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -23), sessionTime: '11:00',
    sessions: [{ id: 'jd-s02', label: 'Perfectionism Schema Work', noteText: '<p>John delegated two tasks. Workload perceptibly reduced but guilt prominent — rated 7/10. Explored perfectionism schema: "results define my worth." Used historical review technique to challenge. Patient recalled three examples of successful outcomes that weren\'t his direct work.</p>', aiSummary: 'Third session. Reviewed SMART goals. John delegated two tasks to team members. Reports reduced workload but residual guilt. Worked on perfectionism schema.', transcript: [] }],
    tasks: [],
  },
  {
    id: 'cl-a01', patientName: 'Carmen López', initials: 'CL',
    avatarBg: 'bg-rose-100', avatarText: 'text-rose-700',
    time: '9:00am', groupLabel: '08/01/2026', tab: 'past',
    inputLanguage: 'Spanish', outputLanguage: 'Spanish', contextText: '',
    sessionDate: addDays(prev, -36), sessionTime: '09:00',
    sessions: [{ id: 'cl-s01', label: 'Flecha Descendente — Intro', noteText: '<p>Carmen identifica pensamiento nuclear recurrente: "si cometo un error, todos sabrán que no valgo". Aplicamos la técnica de la flecha descendente durante 20 minutos — llegamos a la creencia nuclear: "soy un fraude".</p><p>Gran apertura emocional al final. Acordamos pausar y reintroducir este trabajo en la siguiente sesión con más espacio.</p>', aiSummary: 'Tercera sesión. Carmen identifica pensamientos ansiosos antes de entrar al aula. Se introduce la técnica de la flecha descendente. Tarea: registrar 3 pensamientos automáticos por día.', transcript: [] }],
    tasks: [],
  },
  {
    id: 'jd-a03', patientName: 'John Doe', initials: 'JD',
    avatarBg: 'bg-sky-100', avatarText: 'text-sky-700',
    time: '11:00am', groupLabel: '07/01/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -37), sessionTime: '11:00',
    sessions: [{ id: 'jd-s03', label: 'Values Clarification', noteText: '<p>Sleep now averaging 7h (was 5h at intake). Work finish time moved back to 18:30 consistently. Introduced values clarification exercise — John placed "being present for my children" as his highest value, above career advancement. Significant emotional response. Explored the gap between values and current behaviour.</p>', aiSummary: 'Fourth session. John sleeping better (7h average vs 5h at intake). Work boundaries improving. Values clarification exercise introduced. Strong motivation noted.', transcript: [] }],
    tasks: [],
  },
  // ── Additional past sessions (all Sofia Martinez) ────────────────────────
  {
    id: 'sm-a01', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '10/02/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: addDays(prev, -4), sessionTime: '10:00',
    sessions: [{ id: 'sm-s01', label: 'Thought Challenging', noteText: '<p>Revisited thought record technique. Sofia brought three completed records. Worked through the "they\'ll see through me" thought using Socratic questioning. Identified cognitive distortions: mind-reading, fortune-telling. Practised generating balanced alternatives in session.</p>', aiSummary: 'Session focused on thought challenging. Patient identified three cognitive distortions related to work performance: mind-reading, all-or-nothing thinking, and catastrophising. CBT triangle practiced in session with a recent workplace incident.', transcript: [] }],
    tasks: [
      { id: 'sm-t01', text: 'Send thought record worksheet', done: true, category: 'document' },
      { id: 'sm-t02', text: 'Ask Sofia to complete one record per day until next session', done: false, category: 'review' },
    ],
  },
  {
    id: 'sm-a02', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '27/01/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: addDays(prev, -17), sessionTime: '10:00',
    sessions: [{
      id: 'sm-s02', label: 'Thought Diary + Behavioural Activation', noteText: '<p>Excellent session. Sofia completed 8 thought diary entries — well above the agreed minimum of 3. GAD-7 now 10, down from 14. Sleep improving. Introduced behavioural activation: scheduling one enjoyable activity per week as a mood "anchor".</p><p>Sofia chose Tuesday evening pottery class — agreed to attend without cancelling due to anxiety.</p>',
      aiSummary: 'Second session. Patient presented a completed thought diary with 8 entries. Anxiety self-rated at 6/10, down from 8/10 at intake. Sleep improved by approximately 45 minutes per night. Continued psychoeducation on the anxiety cycle. Introduced the concept of behavioural activation.',
      transcript: [
        { speaker: 'therapist', time: '10:03', text: 'How was the thought diary this week?' },
        { speaker: 'patient',   time: '10:04', text: 'Harder than I expected. Writing things down made me realise how negative my inner voice is.' },
        { speaker: 'therapist', time: '10:06', text: 'That awareness is actually a really important first step. What kind of thoughts were coming up most?' },
        { speaker: 'patient',   time: '10:07', text: 'Mostly around work. That I\'m not good enough, that people will find out I\'m faking it.' },
      ],
    }],
    tasks: [
      { id: 'sm-t03', text: 'Share behavioural activation handout', done: true, category: 'document' },
      { id: 'sm-t04', text: 'Ask to schedule one enjoyable activity before next session', done: false, category: 'review' },
    ],
  },
  {
    id: 'sm-a03', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '13/01/2026', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: addDays(prev, -31), sessionTime: '10:00',
    sessions: [{ id: 'sm-s03', label: 'Anxiety Intake — CBT Assessment', noteText: '<p><strong>Intake session:</strong> Sofia referred by Dr. García (GP). Presenting with GAD, sleep disturbance, and social anxiety at work. GAD-7: 14, PHQ-9: 8. No previous therapy. No medication.</p><p>Rapport good. Psychoeducation on anxiety cycle provided. 12-session CBT protocol agreed. Thought diary to begin immediately. Next session in 2 weeks.</p>', aiSummary: 'Intake session. Patient referred by Dr. García for generalised anxiety and sleep disturbance. GAD-7 score: 14 (moderate-severe). PHQ-9: 8. Psychoeducation on anxiety and the fight-or-flight response provided. CBT plan agreed — weekly sessions, 12-session protocol.', transcript: [] }],
    tasks: [
      { id: 'sm-t05', text: 'Add GAD-7 and PHQ-9 scores to clinical record', done: true, category: 'document' },
      { id: 'sm-t06', text: 'Send welcome pack and session agreement', done: true, category: 'communicate' },
    ],
  },
  {
    id: 'sm-a04', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '16/12/2025', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: addDays(prev, -52), sessionTime: '10:00',
    sessions: [{
      id: 'sm-s04', label: 'Pre-Holiday Assertiveness', noteText: '<p>Sofia anticipating family gathering over Christmas with heightened anxiety (rated 8/10). Mapped out specific scenarios likely to trigger boundary violations. Wrote assertiveness scripts for two recurring situations.</p><p>Role-played refusing to discuss salary and redirecting intrusive questions. Practised 4-7-8 breathing as in-the-moment tool. Patient left session feeling notably more prepared.</p>',
      aiSummary: 'Pre-holiday session. Sofia reports heightened anticipatory anxiety about a family gathering. Worked on assertiveness scripts for boundary-setting with relatives. Reviewed 4-7-8 breathing for acute anxiety moments. Patient proactive and well-engaged throughout.',
      transcript: [
        { speaker: 'therapist', time: '10:02', text: 'How are you feeling about the holidays coming up?' },
        { speaker: 'patient',   time: '10:03', text: 'Honestly, dreading it. My family dynamics are exhausting and I always leave feeling worse.' },
        { speaker: 'therapist', time: '10:05', text: 'Let\'s prepare some specific scripts you can use if conversations feel overwhelming.' },
        { speaker: 'patient',   time: '10:06', text: 'That would help a lot. I freeze in those moments and never know what to say.' },
      ],
    }],
    tasks: [
      { id: 'sm-t07', text: 'Send assertiveness script worksheet', done: true, category: 'document' },
      { id: 'sm-t08', text: 'Schedule check-in call first week of January', done: true, category: 'coordinate' },
    ],
  },
  {
    id: 'sm-a05', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '02/12/2025', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: addDays(prev, -66), sessionTime: '10:00',
    sessions: [{
      id: 'sm-s05', label: 'Self-Compassion + Perfectionism', noteText: '<p>Sofia described a work presentation that went well externally but she fixated on a 30-second stumble. Classic perfectionism pattern. Introduced the compassionate observer technique — asked her to write a letter to a colleague who described the same scenario. Powerful exercise.</p><p>She acknowledged the double standard: she would never judge a colleague the way she judges herself.</p>',
      aiSummary: 'Session on perfectionism and self-criticism. Sofia described a presentation at work that went well objectively, but she focused entirely on a 30-second stumble. Introduced the compassionate observer technique. Patient found it difficult initially but showed openness by end of session.',
      transcript: [
        { speaker: 'therapist', time: '10:04', text: 'You mentioned the presentation — how do you feel it went?' },
        { speaker: 'patient',   time: '10:05', text: 'Terrible. I lost my train of thought for a moment and I could see people looking at each other.' },
        { speaker: 'therapist', time: '10:07', text: 'What feedback did you actually receive afterwards?' },
        { speaker: 'patient',   time: '10:08', text: 'They said it was great. But I can\'t let go of that one moment.' },
      ],
    }],
    tasks: [
      { id: 'sm-t09', text: 'Send compassionate observer guided audio', done: true, category: 'communicate' },
      { id: 'sm-t10', text: 'Ask Sofia to write a self-compassion letter before next session', done: false, category: 'review' },
      { id: 'sm-t11', text: 'Flag perfectionism pattern for case formulation review', done: false, category: 'review' },
    ],
  },
  {
    id: 'sm-a06', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '29/10/2025', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English',
    contextText: '',
    sessionDate: addDays(prev, -100), sessionTime: '10:00',
    sessions: [{
      id: 'sm-s06', label: 'Rumination + Postponed Worry', noteText: '<p>Sofia attended a work event — stayed full 2h despite high anxiety. A significant behavioural win. However, ruminated heavily for ~3h afterwards. Explored the rumination cycle: trigger → replaying → avoidance function.</p><p>Introduced postponed worry: scheduled 20-min "worry time" at 17:00 daily. Outside this window, she uses a cue card to redirect. Patient receptive. Therapeutic alliance strong.</p>',
      aiSummary: 'Fifth session overall. Sofia attended a work social event — stayed the full two hours despite high anxiety. Used breathing technique in situ with partial success. Ruminated heavily afterwards for three hours. Explored the rumination cycle and introduced the postponed worry technique. Strong therapeutic alliance noted.',
      transcript: [
        { speaker: 'therapist', time: '10:02', text: 'How did the work event go last Friday?' },
        { speaker: 'patient',   time: '10:03', text: 'I went, which felt huge. But I was in fight-or-flight the whole time.' },
        { speaker: 'therapist', time: '10:05', text: 'Staying two hours when everything in you wants to leave is a real win. Let\'s build on that.' },
        { speaker: 'patient',   time: '10:06', text: 'I hadn\'t looked at it that way. I just felt like a failure because of how anxious I was.' },
      ],
    }],
    tasks: [
      { id: 'sm-t12', text: 'Share postponed worry technique handout', done: true, category: 'document' },
      { id: 'sm-t13', text: 'Ask to log rumination episodes with start time and duration', done: false, category: 'review' },
      { id: 'sm-t14', text: 'Draft exposure hierarchy for social situations — discuss next session', done: false, category: 'review' },
    ],
  },
  {
    id: 'sm-a07', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '15/10/2025', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -114), sessionTime: '10:00',
    sessions: [{
      id: 'sm-s07', label: 'Graded Exposure Hierarchy', noteText: '<p>Introduced graded exposure. Collaboratively built hierarchy of 8 social situations ranked by anxiety (0–100 SUDS). Top item: speaking up in a team meeting. First item: eating lunch in staff canteen without headphones.</p><p>Sofia committed to attempting item #1 three times before next session. Discussed the rationale: repeated exposure reduces the brain\'s threat response over time.</p>',
      aiSummary: 'Fourth session. Introduced graded exposure to social situations. Collaboratively built an anxiety hierarchy of 8 items. Sofia committed to attempting item #1 (eating lunch in the staff canteen alone) before next session. Good insight and motivation.',
      transcript: [
        { speaker: 'therapist', time: '10:03', text: 'Let\'s think about what feels manageable — something small but real.' },
        { speaker: 'patient',   time: '10:04', text: 'Maybe eating lunch with colleagues. I always eat at my desk to avoid it.' },
        { speaker: 'therapist', time: '10:06', text: 'That\'s a great first step. What\'s the worst you imagine could happen?' },
        { speaker: 'patient',   time: '10:07', text: 'That I\'d have nothing to say and they\'d think I was weird.' },
      ],
    }],
    tasks: [
      { id: 'sm-t15', text: 'Print exposure hierarchy and give to Sofia', done: true, category: 'document' },
      { id: 'sm-t16', text: 'Review outcome of canteen exposure next session', done: false, category: 'review' },
    ],
  },
  {
    id: 'sm-a08', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '01/10/2025', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -128), sessionTime: '10:00',
    sessions: [{
      id: 'sm-s08', label: 'Performance Review Anxiety', noteText: '<p>Sofia anxious about upcoming performance review (5 days away). Applied cognitive restructuring to feared scenarios: "they\'ll find out I\'ve been underperforming." Examined the evidence. She hit all targets. Identified the "imposter syndrome" thought pattern — psychoeducation provided.</p><p>Discussed the difference between feeling incompetent and being incompetent. Sleep diary shows 48-min onset (down from 72 at start). Good progress.</p>',
      aiSummary: 'Third session. Sleep diary reviewed: average sleep onset reduced from 72 to 48 minutes. Patient experimenting with stimulus control. Discussed upcoming performance review at work as significant source of anticipatory anxiety. Cognitive restructuring applied to the specific feared scenario.',
      transcript: [
        { speaker: 'therapist', time: '10:02', text: 'You mentioned a performance review coming up — how is that sitting with you?' },
        { speaker: 'patient',   time: '10:03', text: 'I\'ve been dreading it for weeks. I keep thinking they\'ll realise I\'ve been underperforming.' },
        { speaker: 'therapist', time: '10:05', text: 'What evidence do you have for that belief?' },
        { speaker: 'patient',   time: '10:06', text: 'Well... I did hit all my targets. But I feel like it\'s been luck.' },
      ],
    }],
    tasks: [
      { id: 'sm-t17', text: 'Ask Sofia to write down 5 specific work achievements before next session', done: true, category: 'review' },
    ],
  },
  {
    id: 'sm-a09', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '17/09/2025', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -142), sessionTime: '10:00',
    sessions: [{ id: 'sm-s09', label: 'Avoidance Mapping', noteText: '<p>Reviewed 6 thought diary entries — quality improving. Explored the avoidance cycle: anxiety → avoidance → short-term relief → long-term maintenance of anxiety. Sofia identified four consistent avoidance behaviours: eating lunch alone, declining meeting invitations, deferring to others in group settings, avoiding eye contact with senior colleagues.</p><p>Began collaborative case formulation — presented back to Sofia for review.</p>', aiSummary: 'Second session. Reviewed thought diary homework — 6 entries completed. Patient identifying automatic negative thoughts more consistently. Sleep onset improving slightly. Explored the relationship between anxiety and avoidance behaviours. Began collaborative case formulation.', transcript: [] }],
    tasks: [
      { id: 'sm-t18', text: 'Update case formulation draft and share with supervisor', done: true, category: 'document' },
      { id: 'sm-t19', text: 'Ask Sofia to note one avoided situation per day', done: false, category: 'review' },
    ],
  },
  {
    id: 'sm-a10', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '03/09/2025', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -156), sessionTime: '10:00',
    sessions: [{
      id: 'sm-s10', label: 'GAD Intake — New Episode', noteText: '<p><strong>New treatment episode.</strong> Sofia returned after a 3-month break following a previous course of therapy. Presenting symptoms have intensified — new workplace trigger (team restructure). GAD-7: 16 (severe), PHQ-9: 9 (mild-moderate).</p><p>Agreed to resume CBT with a focus on social anxiety and imposter syndrome. Psychoeducation refreshed. First thought diary due next session.</p>',
      aiSummary: 'Intake session. Sofia self-referred after six months of worsening anxiety. GAD-7: 14, PHQ-9: 8. Reports generalised worry, social anxiety, poor sleep, and imposter syndrome at work. No previous therapy. Discussed CBT model and 12-session protocol. Good rapport established from the outset.',
      transcript: [
        { speaker: 'therapist', time: '10:02', text: 'What made you decide to reach out for support now?' },
        { speaker: 'patient',   time: '10:03', text: 'I kept thinking it would pass on its own. But it\'s been getting worse and I\'m exhausted.' },
        { speaker: 'therapist', time: '10:05', text: 'You did the right thing coming in. Can you tell me a bit about what a typical anxious day looks like for you?' },
        { speaker: 'patient',   time: '10:07', text: 'I wake up already worrying. By the time I get to work I\'ve already catastrophised about a dozen things.' },
      ],
    }],
    tasks: [
      { id: 'sm-t20', text: 'Record GAD-7 and PHQ-9 baseline scores in clinical notes', done: true, category: 'document' },
      { id: 'sm-t21', text: 'Send thought diary template for first week', done: true, category: 'communicate' },
      { id: 'sm-t22', text: 'Book next 4 weekly sessions', done: true, category: 'coordinate' },
    ],
  },
  {
    id: 'sm-a11', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '20/08/2025', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -170), sessionTime: '10:00',
    sessions: [{ id: 'sm-s11', label: 'Pre-Treatment Assessment', noteText: '<p>Assessment session prior to new CBT episode. GAD-7: 16, PHQ-9: 9, WASA: 28. Sofia reports symptoms worsening over past 4 months. Sleep affected: takes 60–90 min to fall asleep. Two episodes of acute anxiety at work requiring early departure.</p><p>Consent obtained. Psychoeducation provided informally. Waitlist confirmed — expected start date within 2 weeks.</p>', aiSummary: 'Assessment session (pre-treatment). Sofia completed standard psychometric battery. GAD-7: 16, PHQ-9: 9, WASA: 28. Psychoeducation on anxiety provided informally. Consent obtained. Waiting list referral accepted for CBT — estimated 2-week wait.', transcript: [] }],
    tasks: [
      { id: 'sm-t23', text: 'Score and file psychometric battery', done: true, category: 'document' },
      { id: 'sm-t24', text: 'Send confirmation email with expected start date', done: true, category: 'communicate' },
    ],
  },
  {
    id: 'sm-a12', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '06/08/2025', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -184), sessionTime: '10:00',
    sessions: [{ id: 'sm-s12', label: 'Crisis Follow-Up', noteText: '<p>Follow-up after duty line call 3 days prior. Sofia experienced acute distress following conflict with line manager — felt "trapped" and unable to regulate. No safety risk. Used grounding technique (5-4-3-2-1) on the call with partial success.</p><p>Reviewed the incident in detail today. Identified escalation pattern: somatic symptoms → catastrophic thoughts → behavioural freeze. Discussed prevention plan for future acute episodes. Patient stable and reflective.</p>', aiSummary: 'Follow-up on previous crisis contact. Sofia called the duty line 3 days prior — acute distress related to a conflict with her manager. No safety concerns. Reviewed coping strategies used. Reinforced grounding techniques. Plan: resume regular weekly sessions.', transcript: [] }],
    tasks: [
      { id: 'sm-t25', text: 'Document crisis contact details in clinical record', done: true, category: 'document' },
    ],
  },
  {
    id: 'sm-a13', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '23/07/2025', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -198), sessionTime: '10:00',
    sessions: [{
      id: 'sm-s13', label: 'Mid-Treatment Review', noteText: '<p><strong>Session 8 review:</strong> GAD-7 now 9 (was 16 at start). PHQ-9 stable at 7. Sofia reports significantly less avoidance — eating with colleagues 2–3×/week, making eye contact in meetings. Sleep onset down to ~30 min.</p><p>Remaining difficulty: speaking up in group settings and handling conflict with authority figures. Agreed to extend protocol by 4 sessions to address social anxiety specifically. Patient very positive about progress.</p>',
      aiSummary: 'Mid-treatment review (session 8 equivalent). GAD-7 reduced to 9 (from 16), PHQ-9 stable at 7. Patient attributes improvement to thought challenging and breathing techniques. Social avoidance remains moderate. Agreed to extend protocol by 4 sessions to address social anxiety more thoroughly.',
      transcript: [
        { speaker: 'therapist', time: '10:03', text: 'Looking back at where you started — what feels most different now?' },
        { speaker: 'patient',   time: '10:04', text: 'I don\'t spiral as quickly. I catch myself and ask "is this thought actually true?"' },
        { speaker: 'therapist', time: '10:06', text: 'That\'s exactly the shift we\'ve been working towards. Your scores reflect it too.' },
        { speaker: 'patient',   time: '10:07', text: 'I\'m glad. I still struggle at work but I feel like I have tools now.' },
      ],
    }],
    tasks: [
      { id: 'sm-t26', text: 'Update treatment plan to include 4 additional sessions', done: true, category: 'document' },
      { id: 'sm-t27', text: 'Re-administer GAD-7 and PHQ-9 at next session', done: false, category: 'review' },
    ],
  },
  {
    id: 'sm-a14', patientName: 'Sofia Martinez', initials: 'SM',
    avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-700',
    time: '10:00am', groupLabel: '09/07/2025', tab: 'past',
    inputLanguage: 'English', outputLanguage: 'English', contextText: '',
    sessionDate: addDays(prev, -212), sessionTime: '10:00',
    sessions: [{
      id: 'sm-s14', label: 'Exposure Hierarchy Progress', noteText: '<p>Sofia completed 4 of 5 exposure items. Notable achievement: asked a colleague for help without excessive apologising. Remaining item: speaking up in team meetings. Explored what stops her: "the moment passes" or someone else says it first.</p><p>Wrote a coping card for meetings: what to do when the urge to speak arises. Role-played assertive contribution in session. Strong progress. Therapeutic alliance excellent.</p>',
      aiSummary: 'Sixth session. Reviewed graded exposure progress — Sofia completed 4 out of 5 items on her hierarchy. High engagement. Remaining item: speaking up in team meetings. Troubleshot anticipatory anxiety with a coping card. Modelled assertive speech in role-play. Positive session, strong progress.',
      transcript: [
        { speaker: 'therapist', time: '10:02', text: 'You managed four of the five — that\'s remarkable progress in three weeks.' },
        { speaker: 'patient',   time: '10:03', text: 'The coffee one was hard. I asked a colleague for help and didn\'t apologise three times.' },
        { speaker: 'therapist', time: '10:05', text: 'That is huge. And the meetings — what stops you from speaking up there?' },
        { speaker: 'patient',   time: '10:06', text: 'I prepare what I want to say and then someone else says it, or the moment passes.' },
      ],
    }],
    tasks: [
      { id: 'sm-t28', text: 'Send coping card template for meetings', done: true, category: 'document' },
      { id: 'sm-t29', text: 'Ask Sofia to commit to one contribution per meeting this week', done: false, category: 'review' },
      { id: 'sm-t30', text: 'Review role-play recording in next session if patient consents', done: false, category: 'review' },
    ],
  },
])

// ── UI state ───────────────────────────────────────────────────────────────

const screenView = ref<'picker' | 'workspace'>('picker')
const activeTab  = ref<'schedule' | 'past'>('schedule')
const selectedId = ref('a1')
const contentTab = ref('context')

// AI configuration
const aiConfig = reactive({
  scribe: 'free' as 'free' | 'pro',
  voice: 'Goldilocks',
  detail: [50] as number[],
  bulletPoints: false,
  quotes: false,
  abbreviations: true,
})
const AI_VOICES = ['Goldilocks', 'Clinical', 'Concise', 'Detailed', 'Empathetic']
const aiConfigOpen = ref(false)
function resetAiConfig() {
  aiConfig.scribe = 'free'; aiConfig.voice = 'Goldilocks'; aiConfig.detail = [50]
  aiConfig.bulletPoints = false; aiConfig.quotes = false; aiConfig.abbreviations = true
}

// Edit session name
const editNameOpen  = ref(false)
const editNameDraft = ref('')

function openEditName() {
  editNameDraft.value = selected.value.patientName
  editNameOpen.value  = true
}
function saveEditName() {
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (appt && editNameDraft.value.trim()) appt.patientName = editNameDraft.value.trim()
  editNameOpen.value = false
}

// ── Tasks panel ────────────────────────────────────────────────────────────
const tasksOpen    = ref(false)
const addingTask   = ref(false)
const newTaskText  = ref('')
const newTaskCat   = ref<TaskCategory>('document')

const categoryConfig: Record<TaskCategory, { label: string; icon: Component; color: string; bg: string }> = {
  document:    { label: 'Document',    icon: FileText,          color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30' },
  coordinate:  { label: 'Coordinate',  icon: Share2,            color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  communicate: { label: 'Communicate', icon: MessageSquareMore, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  review:      { label: 'Review',      icon: ListChecks,        color: 'text-sky-700 dark:text-sky-400',      bg: 'bg-sky-100 dark:bg-sky-900/30' },
}

function addTask() {
  if (!newTaskText.value.trim()) return
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (!appt) return
  appt.tasks.push({
    id: `t${Date.now()}`,
    text: newTaskText.value.trim(),
    done: false,
    category: newTaskCat.value,
  })
  newTaskText.value = ''
  addingTask.value = false
}

// ── Templates ───────────────────────────────────────────────────────────────
const templateOpen    = ref(false)
const templateSearch  = ref('')
const hidePro         = ref(false)

interface Template { id: string; name: string; pro: boolean; favourite?: boolean }
const TEMPLATES_FAVOURITES: Template[] = [
  { id: 'tf0', name: 'Patient Explainer Letter', pro: true, favourite: true },
]
const TEMPLATES_NOTES: Template[] = [
  { id: 'tn0', name: 'Patient Explainer Letter', pro: true },
  { id: 'tn1', name: 'ADOS-2', pro: true },
  { id: 'tn2', name: 'Audit C', pro: true },
  { id: 'tn3', name: 'Case Formulation [4Ps]', pro: true },
  { id: 'tn4', name: 'Progress Note', pro: false },
  { id: 'tn5', name: 'Session Summary', pro: false },
]

function filteredTemplates(list: Template[]) {
  const q = templateSearch.value.toLowerCase()
  return list.filter(t => {
    if (hidePro.value && t.pro) return false
    return !q || t.name.toLowerCase().includes(q)
  })
}

const calSidebarOpen = ref(true)
const isRecording    = ref(false)
const transcribeOpen = ref(false)
const copyOpen       = ref(false)
const micOpen        = ref(false)
const noeInput          = ref('')
const noeMessages       = ref<{ role: 'user' | 'noe'; text: string }[]>([])
const noeThinking       = ref(false)
const noeActiveResponse = ref<{ text: string; userQuery: string } | null>(null)

// Date picker calendar state
const calendarViewDate = ref(new Date())

// ── Derived ────────────────────────────────────────────────────────────────

const selected = computed(
  () => appointments.value.find(a => a.id === selectedId.value) ?? appointments.value[0]!,
)

function groups(tab: 'schedule' | 'past') {
  const items = appointments.value.filter(a => a.tab === tab)
  const map: Record<string, Appointment[]> = {}
  for (const item of items) {
    if (!map[item.groupLabel]) map[item.groupLabel] = []
    map[item.groupLabel]!.push(item)
  }
  return Object.entries(map)
}

const currentGroups = computed(() => groups(activeTab.value))

// ── Picker / timeline helpers ──────────────────────────────────────────────

function isLiveAppt(appt: Appointment): boolean {
  if (!isToday(appt.sessionDate)) return false
  const now = new Date()
  const [h, m] = appt.sessionTime.split(':').map(Number)
  const sessionStart = new Date()
  sessionStart.setHours(h ?? 0, m ?? 0, 0, 0)
  const diff = (now.getTime() - sessionStart.getTime()) / 60000
  return diff >= -30 && diff <= 90
}

const liveSession = computed(() =>
  appointments.value.find(a => isLiveAppt(a)) ?? null,
)

const timelineAppointments = computed(() =>
  appointments.value
    .filter(a => a.patientName === selected.value.patientName)
    .sort((a, b) => {
      const da = new Date(a.sessionDate)
      const [ah = 0, am = 0] = a.sessionTime.split(':').map(Number)
      da.setHours(ah, am, 0, 0)
      const db = new Date(b.sessionDate)
      const [bh = 0, bm = 0] = b.sessionTime.split(':').map(Number)
      db.setHours(bh, bm, 0, 0)
      return db.getTime() - da.getTime()
    }),
)

const sessionNumberMap = computed(() => {
  const map: Record<string, number> = {}
  ;[...timelineAppointments.value].reverse().forEach((a, i) => { map[a.id] = i + 1 })
  return map
})

function sessionStatus(appt: Appointment): { dot: string; label: string } {
  if (isLiveAppt(appt))    return { dot: 'bg-destructive', label: 'En curso' }
  if (appt.tab === 'past') return { dot: 'bg-emerald-500', label: 'Realizada' }
  return                          { dot: 'bg-primary/50',  label: 'Programada' }
}

function fmtSessionDate(appt: Appointment): string {
  if (isToday(appt.sessionDate)) return `Hoy · ${appt.sessionTime}`
  return format(appt.sessionDate, "EEE d MMM", { locale: es }) + ' · ' + appt.sessionTime
}

function sessionCategory(appt: Appointment): string {
  return sessionNumberMap.value[appt.id] === 1 ? 'Inicio' : 'Seguimiento'
}

const todayPickerSessions = computed(() =>
  appointments.value
    .filter(a => isToday(a.sessionDate) && !isLiveAppt(a))
    .sort((a, b) => a.sessionTime.localeCompare(b.sessionTime)),
)

const upcomingPickerSessions = computed(() =>
  appointments.value
    .filter(a => a.tab === 'schedule' && !isToday(a.sessionDate))
    .sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime()),
)

const pastPickerSessions = computed(() =>
  appointments.value
    .filter(a => a.tab === 'past')
    .sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime()),
)

function enterWorkspace(id: string) {
  selectAppointment(id)
  screenView.value = 'workspace'
}

function backToPicker() {
  screenView.value = 'picker'
}

// ── Sidebar mini day calendar ───────────────────────────────────────────────

const HOUR_RANGE = [8,9,10,11,12,13,14,15,16,17,18,19]

const todayAppointments = computed(() =>
  appointments.value.filter(a => isToday(a.sessionDate)),
)

function appointmentsAtHour(h: number) {
  return todayAppointments.value.filter(a => {
    const hour = parseInt(a.sessionTime.split(':')[0] ?? '0', 10)
    return hour === h
  })
}

// ── Calendar grid ──────────────────────────────────────────────────────────

const calendarDays = computed(() => {
  const monthStart = startOfMonth(calendarViewDate.value)
  const monthEnd   = endOfMonth(calendarViewDate.value)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd    = addDays(gridStart, 34)
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
})

const calendarMonthLabel = computed(() =>
  format(calendarViewDate.value, 'MMMM yyyy'),
)

function prevMonth() { calendarViewDate.value = subMonths(calendarViewDate.value, 1) }
function nextMonth() { calendarViewDate.value = addMonths(calendarViewDate.value, 1) }

function selectDay(day: Date) {
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (appt) appt.sessionDate = day
}

// ── Mutations ──────────────────────────────────────────────────────────────

function selectAppointment(id: string) {
  selectedId.value = id
  const appt = appointments.value.find(a => a.id === id)
  contentTab.value = appt?.sessions[0]?.id ?? 'context'
  isRecording.value = false
  calendarViewDate.value = new Date()
}


function toggleRecord() {
  isRecording.value = !isRecording.value
  if (isRecording.value && selected.value.sessions[0])
    contentTab.value = selected.value.sessions[0].id
  transcribeOpen.value = false
}

function finishSession() {
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (!appt) return
  appt.tab = 'past'
  activeTab.value = 'past'
}

const contextAreaRef  = ref<HTMLElement | null>(null)
const textColorOpen   = ref(false)
const bgColorOpen     = ref(false)
const textStyleOpen   = ref(false)

const fmtBold      = ref(false)
const fmtItalic    = ref(false)
const fmtUnderline = ref(false)
const fmtStrike    = ref(false)
const fmtBlock     = ref('p')

const textStyles = [
  { tag: 'p',  label: 'Normal text', style: { fontSize: '0.8rem' } },
  { tag: 'h1', label: 'Heading 1',   style: { fontSize: '1.4rem', fontWeight: '700' } },
  { tag: 'h2', label: 'Heading 2',   style: { fontSize: '1.15rem', fontWeight: '700' } },
  { tag: 'h3', label: 'Heading 3',   style: { fontSize: '0.95rem', fontWeight: '600' } },
]

const textStyleLabel = computed(() => {
  const found = textStyles.find(s => s.tag === fmtBlock.value)
  return found?.label ?? 'Normal text'
})

const colorPalette = [
  ['#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#d9d9d9','#efefef','#f3f3f3','#ffffff'],
  ['#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff','#9900ff','#ff00ff','#ff0088'],
  ['#980000','#ff6600','#ffcc00','#00aa00','#007799','#1155cc','#0000bb','#7300cc','#bb0099','#bb0044'],
  ['#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e4ef','#c9daf8','#cfe2f3','#d9d2e9','#ead1dc','#ffd7d2'],
  ['#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#a4c2f4','#9fc5e8','#b4a7d6','#d5a6bd','#ff9988'],
  ['#e06666','#f6b26b','#ffd966','#93c47d','#76a5af','#6d9eeb','#6fa8dc','#8e7cc3','#c27ba0','#e06666'],
  ['#cc0000','#e69138','#f1c232','#6aa84f','#45818e','#3c78d8','#3d85c8','#674ea7','#a64d79','#cc0000'],
  ['#7f0000','#783f04','#7f6000','#274e13','#0c343d','#1c4587','#073763','#20124d','#4c1130','#660000'],
]

function undoContext() { contextAreaRef.value?.focus(); document.execCommand('undo') }
function redoContext()  { contextAreaRef.value?.focus(); document.execCommand('redo') }

function onEditorInput(e: Event) {
  const el = e.target as HTMLElement
  const html = el.innerHTML
  if (contentTab.value === 'context') {
    if (selected.value) selected.value.contextText = html
  } else {
    const s = selected.value?.sessions.find(s => s.id === contentTab.value)
    if (s) s.noteText = html
  }
}

function syncEditorFromState() {
  nextTick(() => {
    const el = contextAreaRef.value
    if (el) el.innerHTML = activeText.value
  })
}

function updateFormatState() {
  fmtBold.value      = document.queryCommandState('bold')
  fmtItalic.value    = document.queryCommandState('italic')
  fmtUnderline.value = document.queryCommandState('underline')
  fmtStrike.value    = document.queryCommandState('strikeThrough')
  fmtBlock.value     = document.queryCommandValue('formatBlock').toLowerCase() || 'p'
}

function execFormat(command: string, value?: string) {
  contextAreaRef.value?.focus()
  document.execCommand(command, false, value)
  updateFormatState()
}

function applyTextStyle(tag: string) {
  contextAreaRef.value?.focus()
  document.execCommand('formatBlock', false, tag)
  updateFormatState()
  textStyleOpen.value = false
}

function applyTextColor(color: string) {
  if (!window.getSelection()?.toString()) { textColorOpen.value = false; return }
  contextAreaRef.value?.focus()
  document.execCommand('foreColor', false, color)
  textColorOpen.value = false
}

function applyBgColor(color: string) {
  if (!window.getSelection()?.toString()) { bgColorOpen.value = false; return }
  contextAreaRef.value?.focus()
  document.execCommand('hiliteColor', false, color)
  bgColorOpen.value = false
}

// Unified active text — reads/writes the correct field based on the active tab
const activeText = computed({
  get() {
    if (contentTab.value === 'context') return selected.value.contextText
    return selected.value.sessions.find(s => s.id === contentTab.value)?.noteText ?? ''
  },
  set(v: string) {
    if (contentTab.value === 'context') {
      selected.value.contextText = v
    } else {
      const s = selected.value.sessions.find(s => s.id === contentTab.value)
      if (s) s.noteText = v
    }
  },
})

const currentSession = computed(() =>
  contentTab.value !== 'context'
    ? selected.value.sessions.find(s => s.id === contentTab.value) ?? null
    : null,
)

const transcriptExpanded = ref(false)
watch(contentTab, () => { transcriptExpanded.value = false; syncEditorFromState() })
watch(selectedId, syncEditorFromState, { flush: 'post' })

function addSession() {
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (!appt) return
  const n = appt.sessions.length + 1
  const newSession: SessionRecord = {
    id: crypto.randomUUID(),
    label: `Session ${n}`,
    noteText: '',
    transcript: [],
  }
  appt.sessions.push(newSession)
  contentTab.value = newSession.id
}

function removeSession(id: string) {
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (!appt) return
  appt.sessions = appt.sessions.filter(s => s.id !== id)
  if (contentTab.value === id)
    contentTab.value = appt.sessions.at(-1)?.id ?? 'context'
}

function plainToHtml(text: string): string {
  return text.split('\n\n')
    .map(p => `<p>${p.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function copyContext() {
  const text = contextAreaRef.value?.innerText ?? selected.value?.contextText ?? ''
  navigator.clipboard.writeText(text).catch(() => {})
  copyOpen.value = false
}

const pendingTimers = ref<ReturnType<typeof setTimeout>[]>([])

function sendNoe() {
  if (!noeInput.value.trim()) return
  const query = noeInput.value
  noeInput.value = ''
  noeActiveResponse.value = null
  noeThinking.value = true
  const t = setTimeout(() => {
    noeThinking.value = false
    noeActiveResponse.value = {
      userQuery: query,
      text: 'I\'ve reviewed the session context. Would you like me to draft a SOAP note, generate a summary, or suggest next steps for this patient?',
    }
  }, 1200)
  pendingTimers.value.push(t)
}

function copyNoeText() {
  if (noeActiveResponse.value)
    navigator.clipboard.writeText(noeActiveResponse.value.text).catch(() => {})
}

function addToNote() {
  if (!noeActiveResponse.value || !selected.value) return
  const html = plainToHtml(noeActiveResponse.value.text)
  const s = selected.value.sessions.find(s => s.id === contentTab.value)
  if (s) {
    s.noteText = s.noteText ? s.noteText + html : html
  } else if (contentTab.value === 'context') {
    selected.value.contextText += html
  }
  syncEditorFromState()
}

function replaceNote() {
  if (!noeActiveResponse.value || !selected.value) return
  const html = plainToHtml(noeActiveResponse.value.text)
  const s = selected.value.sessions.find(s => s.id === contentTab.value)
  if (s) s.noteText = html
  else if (contentTab.value === 'context') selected.value.contextText = html
  syncEditorFromState()
}

function addNoeTab() {
  if (!noeActiveResponse.value) return
  const appt = appointments.value.find(a => a.id === selectedId.value)
  if (!appt) return
  const n = appt.sessions.length + 1
  const newSession = { id: crypto.randomUUID(), label: `Session ${n}`, noteText: plainToHtml(noeActiveResponse.value.text), transcript: [] }
  appt.sessions.push(newSession)
  contentTab.value = newSession.id
}

function regenerateNoe() {
  if (!noeActiveResponse.value) return
  const query = noeActiveResponse.value.userQuery
  noeActiveResponse.value = null
  const t = setTimeout(() => {
    noeActiveResponse.value = {
      userQuery: query,
      text: 'Updated summary: Elena continues to show significant progress managing anxiety with CBT techniques. Mood stabilization observed across contexts. Recommend continuation of current plan with gradual introduction of exposure therapy components targeting social situations.',
    }
  }, 900)
  pendingTimers.value.push(t)
}

function fmtDateBadge(appt: Appointment) {
  if (appt.tab === 'schedule' && appt.groupLabel === 'Today')
    return `Today ${appt.sessionTime}`
  return format(appt.sessionDate, 'MMM d') + ' ' + appt.sessionTime
}

const languages = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian']

const { noeiaLinkedEvent } = useCalendar()

function closeAllPopovers() {
  transcribeOpen.value = false
  copyOpen.value       = false
  micOpen.value        = false
  textColorOpen.value  = false
  bgColorOpen.value    = false
}

onMounted(() => {
  // Auto-select appointment if navigated from a calendar session
  const linked = noeiaLinkedEvent.value
  if (linked?.patientName) {
    const match = appointments.value.find(
      a => a.patientName.toLowerCase() === linked.patientName!.toLowerCase(),
    )
    if (match) selectAppointment(match.id)
    noeiaLinkedEvent.value = null
  }

  syncEditorFromState()

  document.addEventListener('selectionchange', updateFormatState)
  document.addEventListener('click', closeAllPopovers)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', updateFormatState)
  document.removeEventListener('click', closeAllPopovers)
  pendingTimers.value.forEach(clearTimeout)
})
</script>

<template>

  <!-- ══ PICKER SCREEN ════════════════════════════════════════════════════ -->
  <div v-if="screenView === 'picker'" class="flex-1 flex flex-col overflow-hidden min-h-0 bg-muted/20">
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-2xl mx-auto px-6 py-8">

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-foreground">Sessions</h1>
          <p class="text-sm text-muted-foreground mt-1">Select a session to start working</p>
        </div>

        <!-- Live Now (featured) -->
        <div v-if="liveSession" class="mb-8">
          <div class="flex items-center gap-2 mb-3">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
            </span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-destructive">Live now</span>
          </div>
          <button
            class="w-full text-left rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent p-5 hover:border-primary/40 hover:shadow-md transition-all group"
            @click="enterWorkspace(liveSession.id)"
          >
            <div class="flex items-center gap-4">
              <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold ring-4 ring-primary/10', liveSession.avatarBg, liveSession.avatarText]">
                {{ liveSession.initials }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-lg font-bold text-foreground">{{ liveSession.patientName }}</p>
                <p class="text-sm text-muted-foreground mt-0.5">{{ liveSession.sessionTime }} · Today</p>
                <p class="text-xs text-muted-foreground/70 mt-0.5">{{ liveSession.sessions[0]?.label }}</p>
              </div>
              <div class="flex items-center gap-1.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <span class="text-sm font-semibold">Open</span>
                <ArrowRight class="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        <!-- Today -->
        <div v-if="liveSession || todayPickerSessions.length" class="mb-8">
          <p v-if="liveSession && todayPickerSessions.length" class="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Also today</p>
          <p v-else-if="todayPickerSessions.length" class="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Today</p>
          <div class="space-y-2">
            <button
              v-for="appt in todayPickerSessions"
              :key="appt.id"
              class="w-full text-left rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
              @click="enterWorkspace(appt.id)"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold', appt.avatarBg, appt.avatarText]">{{ appt.initials }}</div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-foreground">{{ appt.patientName }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ appt.sessionTime }}</p>
                </div>
                <ChevronRight class="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
              </div>
            </button>
          </div>
        </div>

        <!-- Upcoming -->
        <div v-if="upcomingPickerSessions.length" class="mb-8">
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Upcoming</p>
          <div class="space-y-2">
            <button
              v-for="appt in upcomingPickerSessions"
              :key="appt.id"
              class="w-full text-left rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
              @click="enterWorkspace(appt.id)"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold', appt.avatarBg, appt.avatarText]">{{ appt.initials }}</div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-foreground">{{ appt.patientName }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ format(appt.sessionDate, 'EEE, MMM d') }} · {{ appt.sessionTime }}</p>
                </div>
                <ChevronRight class="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
              </div>
            </button>
          </div>
        </div>

        <!-- Past -->
        <div v-if="pastPickerSessions.length">
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Past sessions</p>
          <div class="space-y-2">
            <button
              v-for="appt in pastPickerSessions"
              :key="appt.id"
              class="w-full text-left rounded-xl border border-border bg-card/60 p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
              @click="enterWorkspace(appt.id)"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold opacity-75', appt.avatarBg, appt.avatarText]">{{ appt.initials }}</div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-foreground">{{ appt.patientName }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ format(appt.sessionDate, 'EEE, MMM d') }} · {{ appt.sessionTime }}</p>
                </div>
                <ChevronRight class="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- ══ WORKSPACE SCREEN ══════════════════════════════════════════════════ -->
  <div v-else class="flex-1 flex overflow-hidden min-h-0">

    <!-- ══ Left sidebar ═══════════════════════════════════════════════════ -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 -translate-x-4"
      leave-to-class="opacity-0 -translate-x-4"
    >
    <aside v-show="calSidebarOpen" class="w-52 sm:w-60 md:w-64 flex flex-col bg-background border-r border-border/50 shrink-0 min-w-0">

      <!-- Fixed: Context + Profile nav -->
      <div class="shrink-0 px-3 pt-3 pb-2 border-b border-border/40 space-y-0.5">
        <button
          :class="[
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
            contentTab === 'context' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          ]"
          @click="contentTab = 'context'"
        >
          <LayoutGrid class="w-4 h-4 shrink-0" />
          Context
        </button>
        <button
          :class="[
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
            contentTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          ]"
          @click="contentTab = 'profile'"
        >
          <UserRound class="w-4 h-4 shrink-0" />
          Profile
        </button>
      </div>

      <!-- Scrollable timeline -->
      <div class="flex-1 overflow-y-auto py-3">
        <div class="flex items-center justify-between px-4 pb-2">
          <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Session history</p>
          <button
            class="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            @click="backToPicker"
          >← All sessions</button>
        </div>

        <div class="relative px-3 pt-1">
          <!-- Connecting vertical line -->
          <div class="absolute left-[26px] top-4 bottom-4 w-px bg-border" />

          <div
            v-for="appt in timelineAppointments"
            :key="appt.id"
            class="relative flex items-start gap-3 pb-3 last:pb-0"
          >
            <!-- Timeline dot -->
            <div class="relative z-10 mt-2.5 w-7 h-7 flex items-center justify-center flex-shrink-0">
              <template v-if="isLiveAppt(appt)">
                <span class="relative flex h-3.5 w-3.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-destructive" />
                </span>
              </template>
              <div v-else-if="appt.tab === 'past'" class="w-3 h-3 rounded-full bg-primary/60" />
              <div v-else class="w-3 h-3 rounded-full border-2 border-primary/50 bg-background" />
            </div>

            <!-- Session card -->
            <button
              :class="[
                'flex-1 text-left rounded-xl border px-3 py-2.5 transition-all min-w-0',
                selectedId === appt.id && contentTab !== 'context' && contentTab !== 'profile'
                  ? 'bg-primary/5 border-primary/20 shadow-sm'
                  : 'bg-card border-border hover:border-primary/20 hover:shadow-sm',
              ]"
              @click="selectAppointment(appt.id)"
            >
              <!-- Line 1: #N · date · time + status -->
              <div class="flex items-baseline justify-between gap-1">
                <p class="text-[11px] leading-tight truncate" :class="selectedId === appt.id && contentTab !== 'context' && contentTab !== 'profile' ? 'text-primary' : 'text-foreground'">
                  <span class="font-bold mr-1">#{{ sessionNumberMap[appt.id] }}</span>{{ fmtSessionDate(appt) }}
                </p>
                <TooltipProvider :delay-duration="300">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <span :class="['w-2 h-2 rounded-full shrink-0 cursor-default', sessionStatus(appt).dot]" />
                    </TooltipTrigger>
                    <TooltipContent side="right">{{ sessionStatus(appt).label }}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <!-- Line 2: type · category -->
              <p class="text-[10px] text-muted-foreground mt-0.5 leading-tight">Individual · {{ sessionCategory(appt) }}</p>
              <!-- Line 3: notes + tasks -->
              <div class="flex items-center gap-1 mt-0.5">
                <span v-if="appt.sessions[0]?.aiSummary || appt.sessions[0]?.noteText" class="text-[10px] text-muted-foreground/70">📝 Con notas</span>
                <span v-if="(appt.sessions[0]?.aiSummary || appt.sessions[0]?.noteText) && appt.tasks.length" class="text-[10px] text-muted-foreground/40"> · </span>
                <span v-if="appt.tasks.length" class="text-[10px] text-muted-foreground/70">✓ {{ appt.tasks.length }} {{ appt.tasks.length === 1 ? 'tarea' : 'tareas' }}</span>
              </div>
            </button>
          </div>

          <div v-if="timelineAppointments.length === 0" class="py-4 px-2 text-center">
            <span class="text-[10px] text-muted-foreground/50">No sessions yet</span>
          </div>
        </div>
      </div>
    </aside>
    </Transition>

    <!-- ══ Main area ══════════════════════════════════════════════════════ -->
    <main class="flex-1 flex flex-col min-w-0 bg-muted/30">

      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <header class="shrink-0 bg-background border-b border-border/50 px-6 pt-4 pb-3">

        <!-- Row 1: patient name + trash + right actions -->
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2 min-w-0 flex-wrap">
            <button
              class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
              :title="calSidebarOpen ? 'Hide sidebar' : 'Show sidebar'"
              @click="calSidebarOpen = !calSidebarOpen"
            >
              <PanelLeftClose v-if="calSidebarOpen" class="w-4 h-4" />
              <PanelLeftOpen v-else class="w-4 h-4" />
            </button>
            <h2 class="text-xl font-bold text-foreground truncate">
              {{ contentTab === 'context' || contentTab === 'profile' ? (contentTab === 'profile' ? 'Patient profile' : 'Patient context') : selected.patientName }}
            </h2>
            <button v-if="contentTab !== 'context' && contentTab !== 'profile'" class="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors shrink-0" title="Edit session name" @click="openEditName">
              <Pencil class="w-4 h-4" />
            </button>

            <!-- Date/time badge → date+time picker popover (only in session view) -->
            <Popover v-if="contentTab !== 'context' && contentTab !== 'profile'">
              <PopoverTrigger as-child>
                <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors">
                  <CalendarDays class="w-3.5 h-3.5 text-muted-foreground" />
                  {{ fmtDateBadge(selected) }}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" class="w-80 p-5" :side-offset="8">
                <!-- Time input -->
                <p class="text-sm font-semibold text-foreground mb-3">Session start time</p>
                <input
                  v-model="selected.sessionTime"
                  type="time"
                  class="w-full px-4 py-2.5 border border-border rounded-xl text-base text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary mb-5 transition-colors"
                />

                <!-- Mini calendar -->
                <p class="text-sm font-semibold text-foreground mb-3">Session date</p>
                <div class="border border-border rounded-xl overflow-hidden">
                  <!-- Month nav -->
                  <div class="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <button aria-label="Previous month" class="p-1 rounded-lg hover:bg-accent transition-colors" @click="prevMonth">
                      <ChevronLeft class="w-4 h-4 text-muted-foreground" />
                    </button>
                    <span class="text-sm font-semibold text-foreground">{{ calendarMonthLabel }}</span>
                    <button aria-label="Next month" class="p-1 rounded-lg hover:bg-accent transition-colors" @click="nextMonth">
                      <ChevronRight class="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <!-- Day grid -->
                  <div class="p-3">
                    <div class="grid grid-cols-7 mb-1">
                      <div v-for="d in ['S','M','T','W','T','F','S']" :key="d" class="text-center text-xs font-medium text-muted-foreground py-1">{{ d }}</div>
                    </div>
                    <div class="grid grid-cols-7 gap-y-0.5">
                      <button
                        v-for="day in calendarDays"
                        :key="day.toISOString()"
                        :class="[
                          'h-8 w-full flex items-center justify-center rounded-full text-sm transition-colors',
                          !isSameMonth(day, calendarViewDate) ? 'text-muted-foreground/40' : 'text-foreground',
                          isSameDay(day, selected.sessionDate) ? 'bg-primary text-primary-foreground font-semibold' : '',
                          isToday(day) && !isSameDay(day, selected.sessionDate) ? 'bg-muted font-semibold' : '',
                          isSameMonth(day, calendarViewDate) && !isSameDay(day, selected.sessionDate) ? 'hover:bg-accent' : '',
                        ]"
                        @click="selectDay(day)"
                      >
                        {{ format(day, 'd') }}
                      </button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <!-- Language badge → language settings popover -->
            <Popover>
              <PopoverTrigger as-child>
                <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-accent transition-colors">
                  <Languages class="w-3.5 h-3.5 text-muted-foreground" />
                  {{ selected.inputLanguage }}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" class="w-72 p-5" :side-offset="8">
                <h3 class="text-base font-bold text-foreground mb-4">Language settings</h3>

                <!-- Input language -->
                <div class="mb-4">
                  <p class="text-sm font-semibold text-foreground mb-1">Input language</p>
                  <p class="text-xs text-muted-foreground mb-2">Used for transcripts, dictations and uploaded recordings.</p>
                  <div class="relative">
                    <select
                      v-model="selected.inputLanguage"
                      class="w-full appearance-none px-4 py-2.5 border border-border rounded-xl text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary pr-10 transition-colors"
                    >
                      <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <!-- Output language -->
                <div>
                  <p class="text-sm font-semibold text-foreground mb-1">Output language</p>
                  <p class="text-xs text-muted-foreground mb-2">Used for notes and documents.</p>
                  <div class="relative">
                    <select
                      v-model="selected.outputLanguage"
                      class="w-full appearance-none px-4 py-2.5 border border-border rounded-xl text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary pr-10 transition-colors"
                    >
                      <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <!-- Transcribe -->
          <div class="flex items-center gap-2 shrink-0">
            <div class="relative flex">
              <button
                :class="[
                  'flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-sm font-medium border rounded-l-lg transition-colors',
                  isRecording
                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                    : 'bg-card text-foreground border-border hover:bg-accent',
                ]"
                @click="toggleRecord"
              >
                <span v-if="isRecording" class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                </span>
                <Mic v-else class="w-3.5 h-3.5" />
                {{ isRecording ? 'Recording…' : 'Transcribe' }}
              </button>
              <button
                :class="[
                  'flex items-center px-1.5 border-y border-r rounded-r-lg transition-colors',
                  isRecording ? 'bg-destructive/10 border-destructive/30 text-destructive/60' : 'bg-card border-border text-muted-foreground hover:bg-accent',
                ]"
                @click.stop="transcribeOpen = !transcribeOpen"
              >
                <ChevronDown class="w-3.5 h-3.5" />
              </button>

              <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="transcribeOpen" class="absolute right-0 top-full mt-1.5 z-30 w-48 bg-card rounded-xl border border-border shadow-lg overflow-hidden" @click.stop>
                  <button class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-accent" @click="toggleRecord">
                    <Mic class="w-3.5 h-3.5 text-muted-foreground" />Live recording
                  </button>
                  <button class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-accent">
                    <Volume2 class="w-3.5 h-3.5 text-muted-foreground" />Upload audio
                  </button>
                  <div class="border-t border-border" />
                  <button class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-accent">
                    <Copy class="w-3.5 h-3.5 text-muted-foreground" />Paste transcript
                  </button>
                </div>
              </Transition>
            </div>

          </div>
        </div>

      </header>

      <!-- ── Content + Tasks split ────────────────────────────────────────── -->
      <div class="flex-1 min-h-0 flex overflow-hidden">

      <!-- Left: tabs + editor -->
      <div class="flex-1 min-w-0 flex flex-col overflow-hidden">

      <!-- ── Content tabs (only shown when a session is active) ──────────── -->
      <div v-if="contentTab !== 'profile' && contentTab !== 'context'" class="shrink-0 bg-background flex items-end gap-0.5 px-4 pt-2 overflow-x-auto">

        <!-- Session tabs -->
        <button
          v-for="session in selected.sessions"
          :key="session.id"
          :class="[
            'group shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-t-lg transition-colors select-none',
            contentTab === session.id
              ? 'bg-card border border-border border-b-card -mb-px relative z-10 text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
          ]"
          @click="contentTab = session.id"
        >
          <Pencil class="w-3 h-3 shrink-0" />
          <span class="max-w-[120px] truncate">{{ session.label }}</span>
          <span
            class="ml-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted-foreground/20"
            @click.stop="removeSession(session.id)"
          >
            <X class="w-2.5 h-2.5" />
          </span>
        </button>

        <!-- Add tab -->
        <button
          class="shrink-0 mb-1 p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
          title="New session"
          @click="addSession"
        >
          <Plus class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- ── Tab content ──────────────────────────────────────────────────── -->
      <div class="flex-1 min-h-0 flex flex-col overflow-hidden">

        <!-- Profile view -->
        <div v-if="contentTab === 'profile'" class="flex-1 overflow-y-auto px-4 py-5">
          <div class="max-w-xl space-y-4">

            <!-- Patient card -->
            <div class="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold ring-4 ring-border/60 shrink-0', selected.avatarBg, selected.avatarText]">
                {{ selected.initials }}
              </div>
              <div>
                <p class="text-base font-bold text-foreground">{{ selected.patientName }}</p>
                <p class="text-xs text-muted-foreground mt-0.5">{{ selected.inputLanguage }} · {{ selected.tab === 'past' ? 'Inactive' : 'Active' }}</p>
              </div>
            </div>

            <!-- Personal info -->
            <div class="bg-card border border-border rounded-xl overflow-hidden">
              <div class="px-5 py-3 border-b border-border/50">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Personal information</p>
              </div>
              <div class="divide-y divide-border/50">
                <div class="flex items-center justify-between px-5 py-3">
                  <span class="text-xs text-muted-foreground">Date of birth</span>
                  <span class="text-xs font-medium text-foreground">—</span>
                </div>
                <div class="flex items-center justify-between px-5 py-3">
                  <span class="text-xs text-muted-foreground">Phone</span>
                  <span class="text-xs font-medium text-foreground">—</span>
                </div>
                <div class="flex items-center justify-between px-5 py-3">
                  <span class="text-xs text-muted-foreground">Email</span>
                  <span class="text-xs font-medium text-foreground">—</span>
                </div>
                <div class="flex items-center justify-between px-5 py-3">
                  <span class="text-xs text-muted-foreground">Address</span>
                  <span class="text-xs font-medium text-foreground">—</span>
                </div>
              </div>
            </div>

            <!-- Clinical info -->
            <div class="bg-card border border-border rounded-xl overflow-hidden">
              <div class="px-5 py-3 border-b border-border/50">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clinical</p>
              </div>
              <div class="divide-y divide-border/50">
                <div class="flex items-start justify-between px-5 py-3 gap-4">
                  <span class="text-xs text-muted-foreground shrink-0">Diagnosis</span>
                  <span class="text-xs font-medium text-foreground text-right">—</span>
                </div>
                <div class="flex items-center justify-between px-5 py-3">
                  <span class="text-xs text-muted-foreground">Referral</span>
                  <span class="text-xs font-medium text-foreground">—</span>
                </div>
                <div class="flex items-center justify-between px-5 py-3">
                  <span class="text-xs text-muted-foreground">Insurance</span>
                  <span class="text-xs font-medium text-foreground">—</span>
                </div>
                <div class="flex items-center justify-between px-5 py-3">
                  <span class="text-xs text-muted-foreground">Sessions total</span>
                  <span class="text-xs font-medium text-foreground">{{ timelineAppointments.length }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Unified editor for context + session tabs -->
        <div v-else class="flex-1 flex flex-col min-h-0 px-4 pb-4 pt-0">
          <div :class="['flex-1 flex flex-col bg-card border border-border shadow-sm overflow-hidden min-h-0', (contentTab === 'context') ? 'rounded-xl mt-2' : 'rounded-b-xl border-t-0']">

            <!-- Toolbar row -->
            <div class="shrink-0 flex items-center justify-between gap-2 px-4 py-2 border-b border-border/50">

              <!-- Left: Template + Customize style grouped -->
              <div class="flex items-center gap-2">
                <!-- Template button -->
                <button
                  class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg border border-border transition-colors"
                  @click="templateOpen = true"
                >
                  <LayoutTemplate class="w-3.5 h-3.5" />
                  Template
                </button>

              <!-- AI Configuration popover -->
              <Popover v-model:open="aiConfigOpen">
                <PopoverTrigger as-child>
                  <button class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg border border-border transition-colors">
                    <Sparkles class="w-3.5 h-3.5" />
                    Customize style
                    <ChevronDown class="w-3 h-3 opacity-60" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" class="w-72 p-0 overflow-hidden" :side-offset="8">
                  <!-- Header -->
                  <div class="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <span class="text-sm font-semibold text-foreground">Customize style</span>
                    <a href="#" class="flex items-center gap-1 text-xs text-primary hover:underline">
                      Learn more <ExternalLink class="w-3 h-3" />
                    </a>
                  </div>

                  <div class="px-4 py-3 space-y-4">
                    <!-- Scribe -->
                    <div>
                      <p class="text-xs font-semibold text-foreground mb-2">Scribe</p>
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          :class="[
                            'flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-colors text-left',
                            aiConfig.scribe === 'free'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-border/80 hover:bg-accent',
                          ]"
                          @click="aiConfig.scribe = 'free'"
                        >
                          <Pencil class="w-4 h-4 text-muted-foreground" />
                          <span class="text-xs font-semibold text-foreground leading-tight">Free</span>
                          <span class="text-[10px] text-muted-foreground leading-tight">Fast for simple sessions</span>
                        </button>
                        <button
                          :class="[
                            'flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-colors text-left relative',
                            aiConfig.scribe === 'pro'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-border/80 hover:bg-accent',
                          ]"
                          @click="aiConfig.scribe = 'pro'"
                        >
                          <div class="flex items-center gap-1">
                            <PenLine class="w-4 h-4 text-muted-foreground" />
                            <span class="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                              <Zap class="w-2.5 h-2.5" />PRO
                            </span>
                          </div>
                          <span class="text-xs font-semibold text-foreground leading-tight">Pro</span>
                          <span class="text-[10px] text-muted-foreground leading-tight">Best for complex sessions</span>
                        </button>
                      </div>
                    </div>

                    <!-- Voice -->
                    <div>
                      <p class="text-xs font-semibold text-foreground mb-1.5">Voice</p>
                      <div class="relative">
                        <select
                          v-model="aiConfig.voice"
                          class="w-full appearance-none pl-3 pr-8 py-2 border border-border rounded-lg text-xs text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors"
                        >
                          <option v-for="v in AI_VOICES" :key="v" :value="v">{{ v }}</option>
                        </select>
                        <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <!-- Detail -->
                    <div>
                      <p class="text-xs font-semibold text-foreground mb-2">Detail</p>
                      <Slider v-model="aiConfig.detail" :min="0" :max="100" :step="50" class="mb-1.5" />
                      <div class="flex justify-between text-[10px] text-muted-foreground">
                        <span>Low</span><span>Medium</span><span>High</span>
                      </div>
                    </div>

                    <!-- Toggles -->
                    <div class="space-y-2.5">
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-foreground">Bullet points</span>
                        <Switch v-model:checked="aiConfig.bulletPoints" class="scale-90" />
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-foreground">Quotes</span>
                        <Switch v-model:checked="aiConfig.quotes" class="scale-90" />
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-foreground">Abbreviations</span>
                        <Switch v-model:checked="aiConfig.abbreviations" class="scale-90" />
                      </div>
                    </div>

                    <!-- Reset -->
                    <button class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors" @click="resetAiConfig">
                      <RotateCcw class="w-3 h-3" />
                      Reset to default
                    </button>
                  </div>

                  <!-- Footer -->
                  <div class="px-4 py-2.5 border-t border-border/50 bg-muted/30 flex items-center justify-between gap-2">
                    <span class="text-[10px] text-muted-foreground leading-tight">Template instructions are prioritized</span>
                    <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input type="checkbox" class="w-3 h-3 rounded border-border accent-primary" />
                      <span class="text-[10px] text-foreground font-medium">Save as default</span>
                    </label>
                  </div>
                </PopoverContent>
              </Popover>
              </div><!-- end left group -->

              <div class="flex items-center gap-2">
              <!-- Mic group -->
              <div class="relative flex items-center border border-border rounded-lg overflow-visible" @click.stop>
                <button class="p-2 text-muted-foreground hover:bg-accent transition-colors" title="Voice input">
                  <Mic class="w-3.5 h-3.5" />
                </button>
                <div class="w-px h-4 bg-border" />
                <button class="px-1.5 py-2 text-muted-foreground hover:bg-accent transition-colors" @click.stop="micOpen = !micOpen">
                  <ChevronDown class="w-3 h-3" />
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <div v-if="micOpen" class="absolute right-0 top-full mt-1 z-30 w-36 bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                    <button class="w-full px-3 py-2 text-sm text-foreground hover:bg-accent text-left">Record note</button>
                    <button class="w-full px-3 py-2 text-sm text-foreground hover:bg-accent text-left">Dictate text</button>
                  </div>
                </Transition>
              </div>

              <!-- Undo / Redo group -->
              <div class="flex items-center border border-border rounded-lg overflow-hidden">
                <button class="p-2 text-muted-foreground hover:bg-accent transition-colors" title="Undo" @click="undoContext">
                  <Undo2 class="w-3.5 h-3.5" />
                </button>
                <div class="w-px h-4 bg-border" />
                <button class="p-2 text-muted-foreground hover:bg-accent transition-colors" title="Redo" @click="redoContext">
                  <Redo2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Copy group -->
              <div class="relative flex items-center border border-border rounded-lg overflow-visible" @click.stop>
                <button class="flex items-center gap-1.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors" @click="copyContext">
                  Copy
                </button>
                <div class="w-px h-4 bg-border" />
                <button class="px-1.5 py-2 text-muted-foreground hover:bg-accent transition-colors" @click.stop="copyOpen = !copyOpen">
                  <ChevronDown class="w-3 h-3" />
                </button>
                <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <div v-if="copyOpen" class="absolute right-0 top-full mt-1 z-30 w-40 bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                    <button class="w-full px-3 py-2 text-sm text-foreground hover:bg-accent text-left" @click="copyContext">Copy all</button>
                    <button class="w-full px-3 py-2 text-sm text-foreground hover:bg-accent text-left">Copy as Markdown</button>
                    <button class="w-full px-3 py-2 text-sm text-foreground hover:bg-accent text-left">Copy as SOAP</button>
                  </div>
                </Transition>
              </div>
              </div><!-- end right group -->
            </div>

            <!-- Formatting toolbar -->
            <div class="shrink-0 flex items-center gap-0.5 px-3 py-1 border-b border-border/40" @click.stop>
              <!-- Undo / Redo -->
              <button class="fmt-btn" title="Undo" @mousedown.prevent @click="undoContext"><Undo2 class="w-3.5 h-3.5" /></button>
              <button class="fmt-btn" title="Redo" @mousedown.prevent @click="redoContext"><Redo2 class="w-3.5 h-3.5" /></button>
              <div class="fmt-sep" />

              <!-- Text style dropdown -->
              <div class="relative" @click.stop>
                <button
                  class="flex items-center gap-1 px-2 py-1 h-7 text-xs rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors whitespace-nowrap"
                  @mousedown.prevent @click="textStyleOpen = !textStyleOpen; textColorOpen = false; bgColorOpen = false"
                >
                  {{ textStyleLabel }}<ChevronDown class="w-3 h-3 opacity-60 shrink-0" />
                </button>
                <div v-if="textStyleOpen" class="absolute top-full left-0 mt-1 z-30 bg-popover border border-border rounded-xl shadow-xl overflow-hidden w-44">
                  <button
                    v-for="s in textStyles" :key="s.tag"
                    class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-accent transition-colors border-b border-border/30 last:border-0"
                    @mousedown.prevent @click="applyTextStyle(s.tag)"
                  >
                    <span :style="s.style">{{ s.label }}</span>
                    <Check v-if="fmtBlock === s.tag" class="w-3.5 h-3.5 text-primary shrink-0" />
                  </button>
                </div>
              </div>
              <div class="fmt-sep" />

              <!-- Bold / Italic / Underline / Strike -->
              <button :class="['fmt-btn font-bold', fmtBold ? 'fmt-btn-active' : '']" title="Bold" @mousedown.prevent @click="execFormat('bold')">B</button>
              <button :class="['fmt-btn italic', fmtItalic ? 'fmt-btn-active' : '']" title="Italic" @mousedown.prevent @click="execFormat('italic')">I</button>
              <button :class="['fmt-btn underline', fmtUnderline ? 'fmt-btn-active' : '']" title="Underline" @mousedown.prevent @click="execFormat('underline')">U</button>
              <button :class="['fmt-btn', fmtStrike ? 'fmt-btn-active' : '']" title="Strikethrough" @mousedown.prevent @click="execFormat('strikeThrough')"><Strikethrough class="w-3.5 h-3.5" /></button>
              <div class="fmt-sep" />

              <!-- Text color -->
              <div class="relative" @click.stop>
                <button class="fmt-btn" title="Text color" @mousedown.prevent @click="textColorOpen = !textColorOpen; bgColorOpen = false; textStyleOpen = false">
                  <span class="fmt-color-a" style="--fmt-color: #EF4444">A</span>
                </button>
                <div v-if="textColorOpen" class="absolute top-full left-0 mt-1 z-30 bg-popover border border-border rounded-xl shadow-xl p-3">
                  <div v-for="(row, ri) in colorPalette" :key="ri" class="flex gap-1 mb-1 last:mb-0">
                    <button
                      v-for="c in row" :key="c"
                      class="w-5 h-5 rounded-full hover:scale-110 transition-transform shrink-0"
                      :style="{ backgroundColor: c, outline: c === '#ffffff' ? '1px solid #e5e7eb' : 'none' }"
                      @mousedown.prevent @click="applyTextColor(c)"
                    />
                  </div>
                </div>
              </div>

              <!-- Highlight -->
              <div class="relative" @click.stop>
                <button class="fmt-btn" title="Highlight color" @mousedown.prevent @click="bgColorOpen = !bgColorOpen; textColorOpen = false; textStyleOpen = false">
                  <span class="fmt-highlight-a">A</span>
                </button>
                <div v-if="bgColorOpen" class="absolute top-full left-0 mt-1 z-30 bg-popover border border-border rounded-xl shadow-xl p-3">
                  <div v-for="(row, ri) in colorPalette" :key="ri" class="flex gap-1 mb-1 last:mb-0">
                    <button
                      v-for="c in row" :key="c"
                      class="w-5 h-5 rounded-full hover:scale-110 transition-transform shrink-0"
                      :style="{ backgroundColor: c, outline: c === '#ffffff' ? '1px solid #e5e7eb' : 'none' }"
                      @mousedown.prevent @click="applyBgColor(c)"
                    />
                  </div>
                </div>
              </div>
              <div class="fmt-sep" />

              <!-- List -->
              <button class="fmt-btn" title="Bullet list" @mousedown.prevent @click="execFormat('insertUnorderedList')"><List class="w-3.5 h-3.5" /></button>
            </div>

            <!-- Rich text editor -->
            <div class="flex-1 min-h-0 overflow-y-auto">
              <div
                ref="contextAreaRef"
                contenteditable="true"
                :data-placeholder="contentTab === 'context' ? 'Add context about the patient, paste files or notes here…' : 'Write session notes here…'"
                class="noeia-editor w-full min-h-full px-5 py-4 text-sm text-foreground focus:outline-none leading-relaxed"
                @input="onEditorInput"
              />
            </div>

            <!-- Transcript section (sessions with existing transcript) -->
            <template v-if="currentSession && currentSession.transcript.length > 0">
              <button
                class="shrink-0 flex items-center justify-between w-full px-4 py-2.5 border-t border-border/50 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                @click="transcriptExpanded = !transcriptExpanded"
              >
                <div class="flex items-center gap-1.5">
                  <Mic class="w-3.5 h-3.5" />
                  Transcript · {{ currentSession.transcript.length }} lines
                </div>
                <ChevronDown :class="['w-3.5 h-3.5 transition-transform', transcriptExpanded ? 'rotate-180' : '']" />
              </button>
              <div v-if="transcriptExpanded" class="shrink-0 max-h-64 overflow-y-auto border-t border-border/30">
                <div v-if="currentSession.aiSummary" class="mx-4 mt-3 p-3 rounded-xl bg-primary/5 border border-primary/15 mb-3">
                  <div class="flex items-center gap-1.5 mb-1.5">
                    <Sparkles class="w-3 h-3 text-primary" />
                    <span class="text-[10px] font-semibold text-primary uppercase tracking-wider">Noe Summary</span>
                  </div>
                  <p class="text-xs text-foreground leading-relaxed">{{ currentSession.aiSummary }}</p>
                </div>
                <div class="px-4 pb-3 space-y-3">
                  <div
                    v-for="(line, i) in currentSession.transcript"
                    :key="i"
                    :class="['flex gap-2.5', line.speaker === 'patient' ? 'flex-row-reverse' : '']"
                  >
                    <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5', line.speaker === 'therapist' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground']">
                      {{ line.speaker === 'therapist' ? 'T' : 'P' }}
                    </div>
                    <div :class="['max-w-[75%] flex flex-col gap-0.5', line.speaker === 'patient' ? 'items-end' : 'items-start']">
                      <span class="text-[9px] text-muted-foreground">{{ line.speaker === 'therapist' ? 'Therapist' : 'Patient' }} · {{ line.time }}</span>
                      <div :class="['px-3 py-2 rounded-xl text-xs leading-relaxed', line.speaker === 'therapist' ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground']">
                        {{ line.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Bottom action row -->
            <div class="flex items-center gap-2 px-4 py-3 border-t border-border/50 shrink-0">
              <button class="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors" title="Link patient">
                <UserRound class="w-4 h-4" />
              </button>
              <button class="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors" title="Attach file">
                <Paperclip class="w-4 h-4" />
              </button>
              <!-- Tasks toggle -->
              <button
                :class="['ml-auto flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg transition-colors', tasksOpen ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground']"
                @click="tasksOpen = !tasksOpen"
              >
                <ListChecks class="w-3.5 h-3.5" />
                {{ selected.tasks.filter(t => t.done).length }}/{{ selected.tasks.length }} tasks
              </button>
            </div>
          </div>
        </div>
      </div>

      </div><!-- /left column -->

      <!-- ── Tasks panel ───────────────────────────────────────────────────── -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-x-2"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 translate-x-2"
      >
        <div v-if="tasksOpen" class="w-72 shrink-0 flex flex-col bg-background border-l border-border overflow-hidden">

          <!-- Tab-style header row -->
          <div class="shrink-0 flex items-end justify-between gap-0 px-3 pt-2 bg-background">
            <div class="flex items-center gap-1.5 px-3 py-2 bg-card border border-border border-b-card -mb-px rounded-t-lg text-sm font-medium text-foreground relative z-10 select-none">
              <ListChecks class="w-3.5 h-3.5 shrink-0" />
              Tasks
              <span v-if="selected.tasks.length" class="ml-1 text-[10px] text-muted-foreground font-normal">
                {{ selected.tasks.filter(t => t.done).length }}/{{ selected.tasks.length }}
              </span>
            </div>
            <button
              class="mb-1.5 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Close tasks"
              @click="tasksOpen = false"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Card body (mirrors editor card) -->
          <div class="flex-1 min-h-0 flex flex-col px-3 pb-3 pt-0">
            <div class="flex-1 flex flex-col bg-card rounded-b-xl border-x border-b border-border shadow-sm overflow-hidden min-h-0">

              <!-- Scrollable task list -->
              <div class="flex-1 overflow-y-auto px-3 py-3 space-y-2">

                <div
                  v-for="task in selected.tasks"
                  :key="task.id"
                  :class="[
                    'rounded-lg border px-3 py-2.5 transition-colors',
                    task.done ? 'bg-muted/30 border-border/40' : 'bg-background border-border',
                  ]"
                >
                  <!-- Category badge row -->
                  <div class="flex items-center gap-1 mb-2">
                    <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', categoryConfig[task.category].bg, categoryConfig[task.category].color]">
                      <component :is="categoryConfig[task.category].icon" class="w-2.5 h-2.5 shrink-0" />
                      {{ categoryConfig[task.category].label }}
                    </span>
                  </div>

                  <!-- Checkbox + text row -->
                  <div class="flex items-start gap-2">
                    <button class="shrink-0 mt-0.5" @click="task.done = !task.done">
                      <CheckCircle2 v-if="task.done" class="w-4 h-4 text-green-600 dark:text-green-500" />
                      <div v-else class="w-4 h-4 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors" />
                    </button>
                    <span :class="['text-xs leading-relaxed', task.done ? 'line-through text-muted-foreground' : 'text-foreground']">
                      {{ task.text }}
                    </span>
                  </div>
                </div>

                <!-- Empty state -->
                <div v-if="!selected.tasks.length" class="flex flex-col items-center gap-2.5 py-8 text-center">
                  <div class="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <ListChecks class="w-4 h-4 text-muted-foreground/40" />
                  </div>
                  <p class="text-xs text-muted-foreground max-w-[170px] leading-relaxed">
                    Tasks identified by Noe will appear here.
                  </p>
                </div>

                <!-- Add task inline form -->
                <div v-if="addingTask" class="rounded-lg border border-primary/50 bg-background px-3 py-2.5">
                  <div class="mb-2">
                    <select
                      v-model="newTaskCat"
                      class="text-[10px] font-semibold rounded-full px-2 py-0.5 border border-border bg-muted text-foreground outline-none cursor-pointer"
                    >
                      <option v-for="(cfg, key) in categoryConfig" :key="key" :value="key">{{ cfg.label }}</option>
                    </select>
                  </div>
                  <input
                    v-model="newTaskText"
                    autofocus
                    type="text"
                    placeholder="Describe the task…"
                    class="w-full text-xs bg-transparent text-foreground placeholder:text-muted-foreground/50 outline-none"
                    @keydown.enter="addTask"
                    @keydown.escape="addingTask = false; newTaskText = ''"
                  />
                  <div class="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    <button class="text-[11px] text-primary font-semibold hover:underline" @click="addTask">Add</button>
                    <button class="text-[11px] text-muted-foreground hover:text-foreground" @click="addingTask = false; newTaskText = ''">Cancel</button>
                  </div>
                </div>

              </div>

              <!-- Footer: + New task -->
              <div class="shrink-0 border-t border-border/50 px-3 py-2">
                <button
                  v-if="!addingTask"
                  class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  @click="addingTask = true"
                >
                  <Plus class="w-3.5 h-3.5" />
                  New task
                </button>
              </div>

            </div>
          </div>

        </div>
      </Transition>

      </div><!-- /content + tasks split -->

      <!-- ── Noe AI bar ───────────────────────────────────────────────────── -->
      <div class="shrink-0 bg-background border-t border-border px-4 py-3">

        <!-- Unified card: response/thinking + input bound together -->
        <div :class="['border border-border bg-card shadow-sm overflow-hidden', (noeActiveResponse || noeThinking) ? 'rounded-xl' : 'rounded-xl']">

          <!-- Thinking state -->
          <div v-if="noeThinking && !noeActiveResponse" class="px-3 py-2.5 border-b border-border/50 flex items-center gap-2">
            <div class="w-4 h-4 rounded-md bg-primary flex items-center justify-center shrink-0">
              <Sparkles class="w-2.5 h-2.5 text-primary-foreground" />
            </div>
            <div class="flex items-center gap-1">
              <span class="thinking-dot" />
              <span class="thinking-dot" style="animation-delay:0.2s" />
              <span class="thinking-dot" style="animation-delay:0.4s" />
            </div>
          </div>

          <!-- Active AI response -->
          <template v-if="noeActiveResponse">
            <!-- Card header -->
            <div class="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div class="flex items-center gap-1.5">
                <div class="w-4 h-4 rounded-md bg-primary flex items-center justify-center">
                  <Sparkles class="w-2.5 h-2.5 text-primary-foreground" />
                </div>
                <span class="text-xs font-semibold text-foreground">Noe</span>
              </div>
              <button class="w-5 h-5 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" @click="noeActiveResponse = null">
                <X class="w-3 h-3" />
              </button>
            </div>
            <!-- Response text -->
            <div class="px-3 py-2.5 text-xs text-foreground leading-relaxed max-h-44 overflow-y-auto whitespace-pre-line border-b border-border/50">{{ noeActiveResponse.text }}</div>
            <!-- Action buttons -->
            <div class="flex items-center gap-1 px-3 py-2 border-b border-border/50 flex-wrap">
              <button class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors" @click="copyNoeText">
                <Copy class="w-3 h-3" />Copy text
              </button>
              <button class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors" @click="addToNote">
                <FilePlus class="w-3 h-3" />Add to note
              </button>
              <button class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors" @click="replaceNote">
                <FileEdit class="w-3 h-3" />Replace note
              </button>
              <button class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-background border border-border text-foreground hover:bg-accent transition-colors" @click="addNoeTab">
                <Plus class="w-3 h-3" />New tab
              </button>
              <button class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-auto" @click="regenerateNoe">
                <RefreshCw class="w-3 h-3" />Regenerate
              </button>
            </div>
          </template>

          <!-- Input bar (always at bottom, flush to card) -->
          <div class="flex items-center gap-2 px-3 py-2">
          <div class="w-5 h-5 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles class="w-3 h-3 text-primary-foreground" />
          </div>
          <input
            v-model="noeInput"
            type="text"
            placeholder="Ask Noe to do anything…"
            class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            @keydown.enter="sendNoe"
          />
          <button class="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors" title="Voice input">
            <Mic class="w-3.5 h-3.5" />
          </button>
          <button
            :class="['w-7 h-7 flex items-center justify-center rounded-full transition-colors', noeInput.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground/40 cursor-default']"
            :disabled="!noeInput.trim()"
            @click="sendNoe"
          >
            <Send class="w-3.5 h-3.5" />
          </button>
        </div>
        </div><!-- end unified card -->
      </div>

    </main>
  </div><!-- /workspace screen -->

  <!-- ══ Edit Session Name Dialog ════════════════════════════════════════ -->
  <Dialog v-model:open="editNameOpen">
    <DialogContent class="sm:max-w-sm gap-0 p-0">
      <DialogTitle class="px-6 pt-6 pb-4 text-base font-semibold border-b border-border">Edit session name</DialogTitle>
      <DialogDescription class="sr-only">Rename this session</DialogDescription>
      <div class="px-6 py-5">
        <input
          v-model="editNameDraft"
          type="text"
          class="w-full px-4 py-2.5 border border-border rounded-xl text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-colors"
          placeholder="Session name"
          @keydown.enter="saveEditName"
          @keydown.escape="editNameOpen = false"
          autofocus
        />
      </div>
      <div class="flex justify-end gap-2 px-6 pb-6">
        <button class="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-accent transition-colors" @click="editNameOpen = false">Cancel</button>
        <button class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" @click="saveEditName">Save</button>
      </div>
    </DialogContent>
  </Dialog>

  <!-- ══ Templates Dialog ══════════════════════════════════════════════════ -->
  <Dialog v-model:open="templateOpen">
    <DialogContent class="flex flex-col gap-0 p-0 max-h-[80vh] sm:max-w-xl overflow-hidden">
      <DialogTitle class="sr-only">Templates</DialogTitle>
      <DialogDescription class="sr-only">Select or create a session template</DialogDescription>

      <!-- Search bar -->
      <div class="flex items-center gap-3 px-5 py-4 border-b border-border">
        <Search class="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          v-model="templateSearch"
          type="text"
          placeholder="Search or generate anything"
          class="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          autofocus
        />
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-2 px-5 py-3 border-b border-border">
        <button class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground border border-dashed border-border rounded-lg hover:bg-accent transition-colors">
          <ArrowUpDown class="w-3.5 h-3.5 text-muted-foreground" />
          Sort
        </button>
        <button class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground border border-dashed border-border rounded-lg hover:bg-accent transition-colors">
          <FileText class="w-3.5 h-3.5 text-muted-foreground" />
          Type
        </button>
        <button class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground border border-dashed border-border rounded-lg hover:bg-accent transition-colors">
          <User class="w-3.5 h-3.5 text-muted-foreground" />
          Creator
        </button>
        <div class="flex-1" />
        <label class="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
          Hide Pro
          <button
            role="switch"
            :aria-checked="hidePro"
            :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors', hidePro ? 'bg-primary' : 'bg-muted-foreground/30']"
            @click="hidePro = !hidePro"
          >
            <span :class="['inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform', hidePro ? 'translate-x-[18px]' : 'translate-x-[3px]']" />
          </button>
        </label>
      </div>

      <!-- Template list (scrollable) -->
      <div class="flex-1 overflow-y-auto min-h-0">

        <!-- Favourites section -->
        <template v-if="filteredTemplates(TEMPLATES_FAVOURITES).length > 0">
          <p class="px-5 pt-4 pb-1.5 text-xs font-semibold text-muted-foreground">Favourites</p>
          <button
            v-for="t in filteredTemplates(TEMPLATES_FAVOURITES)"
            :key="t.id"
            class="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/60 transition-colors text-left"
            @click="templateOpen = false"
          >
            <Pencil class="w-4 h-4 text-muted-foreground shrink-0" />
            <span class="flex-1 text-sm text-foreground">{{ t.name }}</span>
            <span v-if="t.pro" class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white shrink-0">
              <Zap class="w-3.5 h-3.5" />
            </span>
          </button>
        </template>

        <!-- Note templates section -->
        <template v-if="filteredTemplates(TEMPLATES_NOTES).length > 0">
          <p class="px-5 pt-4 pb-1.5 text-xs font-semibold text-muted-foreground">Note templates</p>
          <button
            v-for="t in filteredTemplates(TEMPLATES_NOTES)"
            :key="t.id"
            class="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/60 transition-colors text-left"
            @click="templateOpen = false"
          >
            <Pencil class="w-4 h-4 text-muted-foreground shrink-0" />
            <span class="flex-1 text-sm text-foreground">{{ t.name }}</span>
            <span v-if="t.pro" class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white shrink-0">
              <Zap class="w-3.5 h-3.5" />
            </span>
          </button>
        </template>

        <div v-if="filteredTemplates(TEMPLATES_FAVOURITES).length === 0 && filteredTemplates(TEMPLATES_NOTES).length === 0" class="py-12 text-center">
          <p class="text-sm text-muted-foreground">No templates found</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="shrink-0 border-t border-border px-5 py-3 flex items-center justify-between">
        <button class="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors">
          <Plus class="w-4 h-4" />
          Create new template
        </button>
        <label class="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
          Set as default
          <button
            role="switch"
            :aria-checked="false"
            class="relative inline-flex h-5 w-9 items-center rounded-full bg-muted-foreground/30 transition-colors"
          >
            <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow translate-x-[3px] transition-transform" />
          </button>
        </label>
      </div>

      <!-- Trial banner -->
      <div class="shrink-0 bg-indigo-50 dark:bg-indigo-950/40 px-5 py-3 flex items-center justify-between gap-4">
        <p class="text-sm text-indigo-900 dark:text-indigo-200">
          You've got <strong>12 days</strong> left in your trial of the Clinician plan
        </p>
        <button class="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shrink-0 transition-colors">
          <Zap class="w-3.5 h-3.5" />
          Upgrade
        </button>
      </div>
    </DialogContent>
  </Dialog>

</template>

<style scoped>
.fmt-btn {
  width: 1.75rem;
  height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  flex-shrink: 0;
  transition: background-color 150ms, color 150ms;
}
.fmt-btn:hover {
  background-color: var(--accent);
  color: var(--accent-foreground);
}
.fmt-btn-active {
  background-color: var(--accent);
  color: var(--accent-foreground);
}
.fmt-sep {
  width: 1px;
  height: 1rem;
  background-color: color-mix(in srgb, var(--border) 60%, transparent);
  margin-inline: 0.25rem;
  flex-shrink: 0;
}
.fmt-color-a {
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1;
  padding-bottom: 1px;
  border-bottom: 2.5px solid var(--fmt-color, #EF4444);
}
.fmt-highlight-a {
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1;
  padding: 0 2px;
  border-radius: 2px;
  background: #FEF08A;
  color: #000;
}

.thinking-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--muted-foreground);
  animation: thinking-bounce 1.2s ease-in-out infinite;
}
@keyframes thinking-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.noeia-editor:empty::before {
  content: attr(data-placeholder);
  color: color-mix(in srgb, var(--muted-foreground) 50%, transparent);
  pointer-events: none;
}
.noeia-editor:focus {
  outline: none;
}
.noeia-editor :deep(h1) {
  font-size: 1.5em;
  font-weight: 700;
  margin-bottom: 0.5em;
}
.noeia-editor :deep(h2) {
  font-size: 1.2em;
  font-weight: 700;
  margin-bottom: 0.4em;
}
.noeia-editor :deep(h3) {
  font-size: 1em;
  font-weight: 600;
  margin-bottom: 0.3em;
}
.noeia-editor :deep(ul) {
  list-style: disc;
  padding-left: 1.5em;
}
.noeia-editor :deep(p) {
  margin-bottom: 0.5em;
}
.noeia-editor :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
