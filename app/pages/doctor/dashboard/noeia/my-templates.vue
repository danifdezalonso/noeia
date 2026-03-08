<script setup lang="ts">
import {
  Globe, Plus, Search, Star, Pencil, Share2, MoreHorizontal,
  FileText, File, ClipboardList, ChevronDown, ArrowLeft,
  Settings, Send, Mic, Undo2, Redo2, Copy, CalendarDays, User,
  Eye,
} from 'lucide-vue-next'
import {
  Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'

definePageMeta({ layout: 'dashboard' })

// ── Types ─────────────────────────────────────────────────────────────────

type TemplateType = 'note' | 'document' | 'form'
type TabFilter    = 'all' | 'note' | 'document' | 'form'

interface Template {
  id: string
  name: string
  type: TemplateType
  lastEdited: Date | null
  lastUsed: Date | null
  creator: string
  visibility: string
  favourite: boolean
  content: string
}

// ── Seed data ─────────────────────────────────────────────────────────────

const templates = ref<Template[]>([
  {
    id: 't1', name: 'Meeting Minutes', type: 'note',
    lastEdited: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), lastUsed: null,
    creator: 'Community', visibility: 'Just me', favourite: false,
    content: `Meeting Minutes:

Date: [date of meeting] (only include if explicitly mentioned in the transcript, contextual notes or clinical note, otherwise leave blank.)

Time: [time of meeting] (only include if explicitly mentioned in the transcript, contextual notes or clinical note, otherwise leave blank.)

Location: [location of meeting] (only include if explicitly mentioned in the transcript, contextual notes or clinical note, otherwise leave blank.)

Attendees:
- [list of attendees] (only include if explicitly mentioned in the transcript, contextual notes or clinical note, otherwise leave blank.)

Agenda Items:
- [list of agenda items] (only include if explicitly mentioned in the transcript, contextual notes or clinical note, otherwise leave blank.)

Discussion Points:
- [detailed discussion points] (only include if explicitly mentioned in the transcript, contextual notes or clinical note, otherwise leave blank.)

Decisions Made:
- [decisions made during meeting]

Action Items:
- [action items with assigned owners and deadlines]`,
  },
  {
    id: 't2', name: 'Patient Explainer Letter', type: 'note',
    lastEdited: null, lastUsed: null,
    creator: 'Heidi', visibility: 'Just me', favourite: true,
    content: `Dear [Patient Name],

I am writing to summarise the key points discussed during your appointment on [date].

Diagnosis:
[Include diagnosis or working diagnosis]

Treatment Plan:
[Include recommended treatment, medication, referrals]

Next Steps:
- [Next appointment or follow-up actions]
- [Any tests or investigations ordered]

Please do not hesitate to contact us if you have any questions.

Kind regards,
[Doctor Name]`,
  },
  {
    id: 't3', name: 'Letter Back to Referring Clinician', type: 'document',
    lastEdited: null, lastUsed: null,
    creator: 'Heidi', visibility: 'Just me', favourite: false,
    content: `Dear Dr. [Referring Clinician],

Thank you for referring [Patient Name], DOB [date], whom I reviewed on [date].

Presenting complaint:
[Summary of presenting complaint]

Assessment findings:
[Key clinical findings]

Impression:
[Diagnosis or differential]

Management plan:
[Treatment plan, medications, follow-up]

I will continue to keep you updated on [Patient Name]'s progress.

Yours sincerely,
[Your Name]`,
  },
  {
    id: 't4', name: 'ADOS-2', type: 'note',
    lastEdited: null, lastUsed: null,
    creator: 'Heidi', visibility: 'Just me', favourite: false,
    content: `ADOS-2 Assessment Summary

Patient: [Name], DOB: [Date]
Date of assessment: [Date]
Module administered: [Module 1/2/3/4]
Examiner: [Name]

Social Affect (SA) Score: [Score]
Restricted and Repetitive Behaviours (RRB) Score: [Score]
Total Score: [Total]
Classification: [Non-spectrum / Autism Spectrum / Autism]

Clinical observations:
[Key behavioural observations during assessment]

Recommendations:
[Follow-up actions, referrals, support services]`,
  },
  {
    id: 't5', name: 'Audit C', type: 'note',
    lastEdited: null, lastUsed: null,
    creator: 'Heidi', visibility: 'Just me', favourite: false,
    content: `AUDIT-C Screening

Patient: [Name]
Date: [Date]

Q1 - How often do you have a drink containing alcohol?
Answer: [Never / Monthly or less / 2-4 times per month / 2-3 times per week / 4+ times per week]

Q2 - How many units of alcohol do you drink on a typical day when you are drinking?
Answer: [1-2 / 3-4 / 5-6 / 7-9 / 10+]

Q3 - How often have you had 6 or more units on a single occasion in the past year?
Answer: [Never / Less than monthly / Monthly / Weekly / Daily or almost daily]

AUDIT-C Score: [Score /12]
Interpretation: [Low risk / Increasing risk / Higher risk / Possible dependence]

Clinical notes:
[Additional observations and recommendations]`,
  },
  {
    id: 't6', name: 'Case Formulation [4Ps]', type: 'note',
    lastEdited: null, lastUsed: null,
    creator: 'Heidi', visibility: 'Just me', favourite: false,
    content: `Case Formulation — 4Ps Framework

Patient: [Name]
Date: [Date]

Predisposing factors:
[Biological, psychological, and social factors that increase vulnerability]

Precipitating factors:
[Triggers or events that initiated the current presentation]

Perpetuating factors:
[Factors that maintain the problem]

Protective factors:
[Strengths, supports, and resilience factors]

Formulation summary:
[Integrated narrative linking the 4Ps to the current presentation and treatment implications]`,
  },
])

// ── State ─────────────────────────────────────────────────────────────────

type View = 'list' | 'editor'
const view          = ref<View>('list')
const activeTab     = ref<TabFilter>('all')
const search        = ref('')
const editingId     = ref<string | null>(null)
const editorTab     = ref<'example' | 'structure'>('example')
const aiPrompt      = ref('')
const editingTitle  = ref('')

const tabConfig = [
  { id: 'all'      as TabFilter, label: 'All',   icon: null },
  { id: 'note'     as TabFilter, label: 'Notes',  icon: FileText },
  { id: 'document' as TabFilter, label: 'Docs',   icon: File },
  { id: 'form'     as TabFilter, label: 'Forms',  icon: ClipboardList },
]

const typeConfig: Record<TemplateType, { label: string; color: string }> = {
  note:     { label: 'Note',     color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  document: { label: 'Document', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  form:     { label: 'Form',     color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
}

// ── Computed ──────────────────────────────────────────────────────────────

const favourites = computed(() => templates.value.filter(t => t.favourite))

const filtered = computed(() => {
  let list = templates.value
  if (activeTab.value !== 'all') list = list.filter(t => t.type === activeTab.value)
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter(t => t.name.toLowerCase().includes(q))
  return list
})

const editingTemplate = computed(() => templates.value.find(t => t.id === editingId.value) ?? null)

// ── Actions ───────────────────────────────────────────────────────────────

function openEditor(id: string) {
  editingId.value = id
  editingTitle.value = templates.value.find(t => t.id === id)?.name ?? ''
  editorTab.value = 'example'
  view.value = 'editor'
}

function createTemplate() {
  const id = `t${Date.now()}`
  templates.value.unshift({
    id, name: 'Untitled template', type: 'note',
    lastEdited: new Date(), lastUsed: null,
    creator: 'Me', visibility: 'Just me', favourite: false,
    content: '',
  })
  openEditor(id)
}

function saveTemplate() {
  const t = templates.value.find(t => t.id === editingId.value)
  if (t) { t.name = editingTitle.value; t.lastEdited = new Date() }
  view.value = 'list'
}

function toggleFav(id: string) {
  const t = templates.value.find(t => t.id === id)
  if (t) t.favourite = !t.favourite
}

function fmtDate(d: Date | null) {
  if (!d) return '-'
  return formatDistanceToNow(d, { addSuffix: true })
}

function sendAiPrompt() {
  aiPrompt.value = ''
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">

    <!-- ══════════════════════════════════════════════════════════════════════
         LIST VIEW
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-if="view === 'list'">

      <!-- Header -->
      <div class="shrink-0 flex items-center justify-between px-8 pt-7 pb-4">
        <h1 class="text-3xl font-bold text-foreground">My Templates</h1>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-1.5 px-3.5 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-accent transition-colors">
            <Globe class="w-4 h-4" />
            Browse community
          </button>
          <button
            class="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            @click="createTemplate"
          >
            <Plus class="w-4 h-4" />
            Create template
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="shrink-0 flex items-center gap-0 px-8 border-b border-border">
        <button
          v-for="tab in tabConfig"
          :key="tab.id"
          :class="[
            'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === tab.id
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          ]"
          @click="activeTab = tab.id"
        >
          <component v-if="tab.icon" :is="tab.icon" class="w-3.5 h-3.5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Scrollable content -->
      <div class="flex-1 overflow-y-auto px-8 py-6 space-y-8">

        <!-- Favourites section -->
        <section>
          <h2 class="text-base font-semibold text-foreground mb-3">Favourites</h2>
          <div class="flex flex-wrap gap-3">
            <!-- Favourite cards -->
            <div
              v-for="t in favourites"
              :key="t.id"
              class="w-44 border border-border rounded-xl bg-card p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow cursor-pointer"
              @click="openEditor(t.id)"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-foreground leading-snug line-clamp-2">{{ t.name }}</p>
                <p class="text-xs text-muted-foreground mt-1">{{ t.lastEdited ? fmtDate(t.lastEdited) : 'Never edited' }}</p>
              </div>
              <div class="flex items-center gap-1.5">
                <button class="px-2.5 py-1 text-xs border border-border rounded-md text-foreground hover:bg-accent transition-colors" @click.stop>
                  Share
                </button>
                <button class="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" @click.stop>
                  <MoreHorizontal class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Add favourite slot -->
            <button
              class="w-44 h-[116px] border-2 border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
              @click="createTemplate"
            >
              <Plus class="w-6 h-6" />
            </button>
          </div>
        </section>

        <!-- Library section -->
        <section>
          <h2 class="text-base font-semibold text-foreground mb-3">Library</h2>

          <!-- Filters row -->
          <div class="flex items-center gap-2 mb-4">
            <div class="relative flex-1 max-w-xs">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                v-model="search"
                type="text"
                placeholder="Search for a template"
                class="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button class="flex items-center gap-1.5 h-9 px-3 text-sm text-foreground border border-border rounded-lg hover:bg-accent transition-colors">
              <CalendarDays class="w-3.5 h-3.5 text-muted-foreground" />
              Date
            </button>
            <button class="flex items-center gap-1.5 h-9 px-3 text-sm text-foreground border border-border rounded-lg hover:bg-accent transition-colors">
              <User class="w-3.5 h-3.5 text-muted-foreground" />
              Created by
            </button>
          </div>

          <!-- Table -->
          <div class="border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow class="bg-muted/40 hover:bg-muted/40">
                  <TableHead class="text-xs font-semibold text-muted-foreground">Template name</TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground">
                    <button class="flex items-center gap-1 hover:text-foreground transition-colors">
                      Last edited <ChevronDown class="w-3 h-3" />
                    </button>
                  </TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground">Last used</TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground">Creator</TableHead>
                  <TableHead class="text-xs font-semibold text-muted-foreground">Visibility</TableHead>
                  <TableHead class="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableEmpty v-if="!filtered.length">
                  <div class="py-8 text-center space-y-2">
                    <p class="text-sm text-muted-foreground">No templates found.</p>
                    <button v-if="search" class="text-sm text-primary hover:underline" @click="search = ''">Clear search</button>
                    <button v-else class="text-sm text-primary hover:underline" @click="createTemplate">Create your first template</button>
                  </div>
                </TableEmpty>
                <TableRow
                  v-for="t in filtered"
                  :key="t.id"
                  class="group cursor-pointer hover:bg-accent/40 transition-colors"
                  @click="openEditor(t.id)"
                >
                  <!-- Name + type badge -->
                  <TableCell>
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="text-sm text-foreground font-medium truncate">{{ t.name }}</span>
                      <span :class="['shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded', typeConfig[t.type].color]">
                        {{ typeConfig[t.type].label }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell class="text-sm text-muted-foreground">{{ fmtDate(t.lastEdited) }}</TableCell>
                  <TableCell class="text-sm text-muted-foreground">{{ fmtDate(t.lastUsed) }}</TableCell>
                  <TableCell class="text-sm text-muted-foreground">{{ t.creator }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1.5">
                      <Eye class="w-3.5 h-3.5 text-muted-foreground/60" />
                      <span class="text-sm text-muted-foreground">{{ t.visibility }}</span>
                    </div>
                  </TableCell>
                  <!-- Row actions -->
                  <TableCell class="w-24" @click.stop>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button class="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Edit" @click="openEditor(t.id)">
                        <Pencil class="w-3.5 h-3.5" />
                      </button>
                      <button
                        :class="['p-1.5 rounded transition-colors', t.favourite ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground hover:bg-accent']"
                        title="Favourite"
                        @click="toggleFav(t.id)"
                      >
                        <Star class="w-3.5 h-3.5" :fill="t.favourite ? 'currentColor' : 'none'" />
                      </button>
                      <button class="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Share">
                        <Share2 class="w-3.5 h-3.5" />
                      </button>
                      <button class="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="More">
                        <MoreHorizontal class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════
         EDITOR VIEW
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-else-if="view === 'editor' && editingTemplate">

      <!-- Editor header -->
      <div class="shrink-0 flex items-center gap-3 px-6 py-3 border-b border-border bg-background">
        <button
          class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          @click="view = 'list'"
        >
          <ArrowLeft class="w-4 h-4" />
          Back to library
        </button>

        <span class="text-muted-foreground/40">|</span>
        <span class="text-xs text-muted-foreground flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
          Editing template
        </span>

        <div class="flex-1" />

        <!-- Version -->
        <button class="flex items-center gap-1.5 text-sm text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors">
          Version 1
          <ChevronDown class="w-3.5 h-3.5" />
        </button>

        <button class="flex items-center gap-1.5 text-sm text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors">
          <Settings class="w-3.5 h-3.5" />
          Settings
        </button>

        <button class="flex items-center gap-1.5 text-sm text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors">
          <Share2 class="w-3.5 h-3.5" />
          Share
        </button>

        <button
          class="px-4 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          @click="saveTemplate"
        >
          Save
        </button>
      </div>

      <!-- Editor body -->
      <div class="flex-1 overflow-y-auto">
        <div class="max-w-3xl mx-auto px-8 py-8">

          <!-- Editable title -->
          <input
            v-model="editingTitle"
            class="w-full text-3xl font-bold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/40 mb-6"
            placeholder="Template name"
          />

          <!-- Content card -->
          <div class="border border-border rounded-xl overflow-hidden bg-card">

            <!-- Card header: Example | Structure tabs + actions -->
            <div class="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
              <div class="flex items-center gap-1">
                <button
                  :class="['flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors', editorTab === 'example' ? 'bg-background border border-border text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
                  @click="editorTab = 'example'"
                >
                  <FileText class="w-3.5 h-3.5" />
                  Example
                </button>
                <button
                  :class="['flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors', editorTab === 'structure' ? 'bg-background border border-border text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
                  @click="editorTab = 'structure'"
                >
                  <ClipboardList class="w-3.5 h-3.5" />
                  Structure
                </button>
              </div>
              <div class="flex items-center gap-1">
                <button class="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Undo2 class="w-3.5 h-3.5" />
                </button>
                <button class="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Redo2 class="w-3.5 h-3.5" />
                </button>
                <button class="flex items-center gap-1 px-2.5 py-1.5 text-xs text-foreground border border-border rounded-lg hover:bg-accent transition-colors">
                  <Copy class="w-3 h-3" />
                  Copy
                </button>
              </div>
            </div>

            <!-- Editable content -->
            <textarea
              v-model="editingTemplate.content"
              class="w-full min-h-[480px] p-6 text-sm text-foreground bg-transparent outline-none resize-none leading-relaxed placeholder:text-muted-foreground/50"
              :placeholder="editorTab === 'example' ? 'Write an example output for this template…' : 'Define the structure of this template…'"
            />
          </div>

          <!-- AI prompt bar -->
          <div class="mt-4 border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <div class="px-4 py-3">
              <textarea
                v-model="aiPrompt"
                rows="2"
                placeholder="What would you like to change?"
                class="w-full text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground/50 leading-relaxed"
                @keydown.enter.meta="sendAiPrompt"
              />
            </div>
            <div class="flex items-center justify-end gap-2 px-3 pb-3">
              <button class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Mic class="w-4 h-4" />
              </button>
              <button
                :class="['w-7 h-7 rounded-full flex items-center justify-center transition-colors', aiPrompt.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed']"
                :disabled="!aiPrompt.trim()"
                @click="sendAiPrompt"
              >
                <Send class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </template>

  </div>
</template>
