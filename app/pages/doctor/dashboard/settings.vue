<script setup lang="ts">
import {
  Search, UserCircle2, Database, SlidersHorizontal, Bell,
  Upload, ChevronDown, MapPin, Trash2, Shield,
} from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

definePageMeta({ layout: 'dashboard' })

const { persona } = usePersona()

// ── Nav ─────────────────────────────────────────────────────────────────────

type Section = 'account' | 'data-management' | 'defaults' | 'notifications'

const sections = [
  { id: 'account'         as Section, label: 'Account',         icon: UserCircle2 },
  { id: 'data-management' as Section, label: 'Data management',  icon: Database },
  { id: 'defaults'        as Section, label: 'Defaults',         icon: SlidersHorizontal },
  { id: 'notifications'   as Section, label: 'Notifications',    icon: Bell },
]

const active  = ref<Section>('account')
const search  = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return sections
  return sections.filter(s => s.label.toLowerCase().includes(q))
})

// ── Account form ─────────────────────────────────────────────────────────────

const login = reactive({
  email: 'danifdezalonso@gmail.com',
  mfaEnabled: false,
  displayLanguage: 'English',
  dateFormat: 'DD/MM/YYYY',
})

const form = reactive({
  firstName: 'Alex',
  lastName: 'Torres',
  title: '',
  specialty: 'Clinical Psychology',
  orgName: 'MindCare',
  companySize: 'Just me',
  role: 'Individual clinician',
  country: 'Spain',
  state: '',
})

// ── Data management ──────────────────────────────────────────────────────────

const dataSettings = reactive({
  autoDeleteSessions: false,
  deleteAfterDays: 90,
  dictationPlayback: false,
})

// ── Notifications ────────────────────────────────────────────────────────────

const notifs = reactive({
  sessionReminders: true,
  newMessages: true,
  taskDue: true,
  weeklyDigest: false,
  productUpdates: true,
})

// ── Defaults ────────────────────────────────────────────────────────────────

const defaults = reactive({
  inputLanguage: 'English',
  outputLanguage: 'English',
  noteStyle: 'SOAP',
  autoSave: true,
})
</script>

<template>
  <div class="flex-1 flex overflow-hidden min-h-0 bg-muted/30">

    <!-- ══ Secondary sidebar ════════════════════════════════════════════════ -->
    <aside class="w-56 shrink-0 flex flex-col bg-background border-r border-border">

      <!-- Title -->
      <div class="px-4 pt-5 pb-3">
        <h1 class="text-base font-semibold text-foreground">Settings</h1>
      </div>

      <!-- Search -->
      <div class="px-3 pb-3">
        <div class="relative">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            v-model="search"
            placeholder="Search"
            class="pl-8 h-8 text-sm bg-muted/50 border-border/60"
          />
        </div>
      </div>

      <!-- Personal group -->
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

    <!-- ══ Content area ══════════════════════════════════════════════════════ -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-2xl mx-auto px-8 py-8">

        <!-- ── Account ──────────────────────────────────────────────────────── -->
        <template v-if="active === 'account'">
          <p class="text-xs text-muted-foreground mb-1">Personal</p>
          <h2 class="text-3xl font-bold text-foreground mb-6">Account</h2>

          <p class="text-sm text-muted-foreground mb-6">
            By using Noeia you acknowledge and agree to abide by the
            <a href="#" class="text-primary hover:underline">Usage Policy</a>
            and
            <a href="#" class="text-primary hover:underline">Terms of Use</a>.
          </p>

          <!-- About you -->
          <div class="bg-card border border-border rounded-xl p-6 space-y-6">
            <h3 class="text-base font-semibold text-foreground">About you</h3>

            <!-- Profile image -->
            <div>
              <p class="text-sm font-medium text-foreground mb-3">Profile image</p>
              <div class="flex items-center gap-4">
                <Avatar class="w-16 h-16 ring-2 ring-border text-xl">
                  <AvatarImage :src="avatarUrl(persona.name)" :alt="persona.name" />
                  <AvatarFallback class="bg-muted text-foreground font-bold text-lg">
                    {{ persona.avatarInitials }}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p class="text-xs text-muted-foreground mb-2">Upload a JPG or PNG image up to 5MB.</p>
                  <Button variant="outline" size="sm" class="gap-1.5">
                    <Upload class="w-3.5 h-3.5" />
                    Upload image
                  </Button>
                </div>
              </div>
            </div>

            <div class="border-t border-border/50" />

            <!-- Title + Name -->
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="text-sm font-medium text-foreground block mb-1.5">Title</label>
                <div class="relative">
                  <select
                    v-model="form.title"
                    class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8"
                  >
                    <option value="">Select a title</option>
                    <option>Dr.</option>
                    <option>Prof.</option>
                    <option>Mr.</option>
                    <option>Ms.</option>
                    <option>Mrs.</option>
                  </select>
                  <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-foreground block mb-1.5">First name</label>
                <Input v-model="form.firstName" />
              </div>
              <div>
                <label class="text-sm font-medium text-foreground block mb-1.5">Last name</label>
                <Input v-model="form.lastName" />
              </div>
            </div>

            <!-- Specialty -->
            <div>
              <label class="text-sm font-medium text-foreground block mb-1.5">Specialty</label>
              <div class="relative">
                <select
                  v-model="form.specialty"
                  class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8"
                >
                  <option>Clinical Psychology</option>
                  <option>Psychiatry</option>
                  <option>General Practice</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Oncology</option>
                  <option>Pediatrics</option>
                </select>
                <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <!-- Org + Company size + Role -->
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="text-sm font-medium text-foreground block mb-1.5">Organisation name</label>
                <Input v-model="form.orgName" />
              </div>
              <div>
                <label class="text-sm font-medium text-foreground block mb-1.5">Company size</label>
                <div class="relative">
                  <select
                    v-model="form.companySize"
                    class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8"
                  >
                    <option>Just me</option>
                    <option>2–10</option>
                    <option>11–50</option>
                    <option>51–200</option>
                    <option>200+</option>
                  </select>
                  <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-foreground block mb-1.5">Your role</label>
                <div class="relative">
                  <select
                    v-model="form.role"
                    class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8"
                  >
                    <option>Individual clinician</option>
                    <option>Practice manager</option>
                    <option>Administrator</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <!-- Country + State -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-sm font-medium text-foreground">Country</label>
                  <span class="text-xs text-muted-foreground hover:underline cursor-pointer">Why can't I change this?</span>
                </div>
                <Input :model-value="form.country" disabled class="bg-muted/50 text-muted-foreground cursor-not-allowed" />
              </div>
              <div>
                <label class="text-sm font-medium text-foreground block mb-1.5">State/Region</label>
                <div class="relative">
                  <MapPin class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <select
                    v-model="form.state"
                    class="w-full h-9 rounded-md border border-border bg-background pl-8 pr-8 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select state/region</option>
                    <option>Catalonia</option>
                    <option>Madrid</option>
                    <option>Andalusia</option>
                  </select>
                  <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <p class="text-xs text-primary hover:underline cursor-pointer">Privacy Policy for my country ↗</p>
          </div>

          <!-- Save -->
          <div class="flex justify-end mt-4 mb-10">
            <Button>Save changes</Button>
          </div>

          <!-- Login details -->
          <h3 class="text-2xl font-bold text-foreground mb-5">Login details</h3>
          <div class="bg-card border border-border rounded-xl p-6 space-y-4 mb-10">

            <!-- Email row -->
            <div class="flex items-center gap-3">
              <Input
                :model-value="login.email"
                disabled
                class="flex-1 bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
              <Button variant="outline" class="shrink-0">Change Email</Button>
            </div>

            <!-- MFA row -->
            <div class="flex items-center justify-between gap-4 border border-border rounded-xl px-4 py-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-foreground">Multi-Factor Authentication (MFA)</span>
                  <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', login.mfaEnabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-destructive/10 text-destructive']">
                    {{ login.mfaEnabled ? 'Enabled' : 'Not enabled' }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">Add an extra layer of security when signing in to your account.</p>
              </div>
              <Button variant="outline" class="shrink-0" @click="login.mfaEnabled = !login.mfaEnabled">
                <Shield class="w-3.5 h-3.5 mr-1.5" />
                {{ login.mfaEnabled ? 'Disable MFA' : 'Enable MFA' }}
              </Button>
            </div>
          </div>

          <!-- Language & time -->
          <h3 class="text-2xl font-bold text-foreground mb-5">Language &amp; time</h3>
          <div class="bg-card border border-border rounded-xl p-6 mb-10">
            <div>
              <p class="text-sm font-semibold text-foreground mb-1">Display language</p>
              <p class="text-sm text-muted-foreground mb-4">Change the language used in the Noeia interface.</p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <div class="relative">
                    <select
                      v-model="login.displayLanguage"
                      class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Portuguese</option>
                    </select>
                    <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <p class="text-sm font-medium text-foreground mb-1.5">Date format</p>
                  <div class="relative">
                    <select
                      v-model="login.dateFormat"
                      class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8"
                    >
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                    <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Delete account -->
          <h3 class="text-2xl font-bold text-destructive mb-5">Delete account</h3>
          <div class="bg-card border border-border rounded-xl p-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-destructive mb-1">Danger zone</p>
                <p class="text-sm text-muted-foreground">Permanently delete your account, and all the resources within it.</p>
              </div>
              <Button variant="outline" class="shrink-0 text-destructive border-destructive/40 hover:bg-destructive/5 hover:border-destructive gap-1.5">
                <Trash2 class="w-3.5 h-3.5" />
                Delete my account
              </Button>
            </div>
          </div>

        </template>

        <!-- ── Data management ──────────────────────────────────────────────── -->
        <template v-else-if="active === 'data-management'">
          <p class="text-xs text-muted-foreground mb-1">Personal</p>
          <h2 class="text-3xl font-bold text-foreground mb-6">Data management</h2>

          <!-- Session settings card -->
          <div class="bg-card border border-border rounded-xl p-6 space-y-6 mb-10">

            <!-- Auto-delete sessions -->
            <div class="flex items-start justify-between gap-6">
              <div class="flex-1">
                <p class="text-sm font-semibold text-foreground mb-1">Automatically delete sessions</p>
                <p class="text-sm text-muted-foreground mb-3">Schedule sessions to delete on a recurring basis (between 1 to 90 days).</p>
                <!-- Delete after input row -->
                <div class="flex items-center gap-2">
                  <span class="text-sm text-muted-foreground">Delete after</span>
                  <input
                    v-model.number="dataSettings.deleteAfterDays"
                    type="number"
                    min="1"
                    max="90"
                    :disabled="!dataSettings.autoDeleteSessions"
                    class="w-20 h-9 rounded-md border border-border bg-muted/50 px-3 text-sm text-foreground text-center outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span class="text-sm text-muted-foreground">days</span>
                </div>
              </div>
              <button
                :class="['relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors mt-0.5', dataSettings.autoDeleteSessions ? 'bg-primary' : 'bg-muted-foreground/30']"
                @click="dataSettings.autoDeleteSessions = !dataSettings.autoDeleteSessions"
              >
                <span :class="['pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', dataSettings.autoDeleteSessions ? 'translate-x-5' : 'translate-x-0']" />
              </button>
            </div>

            <div class="border-t border-border/50" />

            <!-- Dictation playback -->
            <div class="flex items-start justify-between gap-6">
              <div class="flex-1">
                <p class="text-sm font-semibold text-foreground mb-1">Enable dictation playback</p>
                <p class="text-sm text-muted-foreground leading-relaxed">
                  Opting in will store recordings of your dictations. This allows you or your staff to play back and verify the accuracy of dictations. You must get consent to record patients speaking.
                </p>
              </div>
              <button
                :class="['relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors mt-0.5', dataSettings.dictationPlayback ? 'bg-primary' : 'bg-muted-foreground/30']"
                @click="dataSettings.dictationPlayback = !dataSettings.dictationPlayback"
              >
                <span :class="['pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', dataSettings.dictationPlayback ? 'translate-x-5' : 'translate-x-0']" />
              </button>
            </div>

          </div>

          <!-- Delete all sessions -->
          <h3 class="text-2xl font-bold text-destructive mb-5">Delete all sessions</h3>
          <div class="bg-card border border-border rounded-xl p-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-destructive mb-1">Danger zone</p>
                <p class="text-sm text-muted-foreground leading-relaxed">
                  Permanently delete all sessions on your account, and all transcripts, notes and documents associated with these sessions.
                </p>
              </div>
              <Button variant="outline" class="shrink-0 text-destructive border-destructive/40 hover:bg-destructive/5 hover:border-destructive gap-1.5">
                <Trash2 class="w-3.5 h-3.5" />
                Delete all sessions
              </Button>
            </div>
          </div>

        </template>

        <!-- ── Defaults ─────────────────────────────────────────────────────── -->
        <template v-else-if="active === 'defaults'">
          <p class="text-xs text-muted-foreground mb-1">Personal</p>
          <h2 class="text-3xl font-bold text-foreground mb-6">Defaults</h2>
          <div class="bg-card border border-border rounded-xl p-6 space-y-5">
            <h3 class="text-base font-semibold text-foreground">Session defaults</h3>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-foreground block mb-1.5">Input language</label>
                <div class="relative">
                  <select
                    v-model="defaults.inputLanguage"
                    class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Portuguese</option>
                  </select>
                  <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-foreground block mb-1.5">Output language</label>
                <div class="relative">
                  <select
                    v-model="defaults.outputLanguage"
                    class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Portuguese</option>
                  </select>
                  <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-foreground block mb-1.5">Default note style</label>
              <div class="relative">
                <select
                  v-model="defaults.noteStyle"
                  class="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground appearance-none outline-none focus:ring-1 focus:ring-ring pr-8"
                >
                  <option>SOAP</option>
                  <option>DAP</option>
                  <option>Free text</option>
                  <option>Structured</option>
                </select>
                <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div class="flex items-center justify-between py-1">
              <div>
                <p class="text-sm font-medium text-foreground">Auto-save notes</p>
                <p class="text-xs text-muted-foreground">Automatically save notes after each session ends.</p>
              </div>
              <button
                :class="['relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', defaults.autoSave ? 'bg-primary' : 'bg-muted-foreground/30']"
                @click="defaults.autoSave = !defaults.autoSave"
              >
                <span :class="['pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', defaults.autoSave ? 'translate-x-4' : 'translate-x-0']" />
              </button>
            </div>
          </div>
          <div class="flex justify-end mt-4">
            <Button>Save changes</Button>
          </div>
        </template>

        <!-- ── Notifications ────────────────────────────────────────────────── -->
        <template v-else-if="active === 'notifications'">
          <p class="text-xs text-muted-foreground mb-1">Personal</p>
          <h2 class="text-3xl font-bold text-foreground mb-6">Notifications</h2>
          <div class="bg-card border border-border rounded-xl divide-y divide-border">
            <div
              v-for="(item, key) in [
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
              <button
                :class="['relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', notifs[item.key as keyof typeof notifs] ? 'bg-primary' : 'bg-muted-foreground/30']"
                @click="notifs[item.key as keyof typeof notifs] = !notifs[item.key as keyof typeof notifs]"
              >
                <span :class="['pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', notifs[item.key as keyof typeof notifs] ? 'translate-x-4' : 'translate-x-0']" />
              </button>
            </div>
          </div>
        </template>

      </div>
    </div>

  </div>
</template>
