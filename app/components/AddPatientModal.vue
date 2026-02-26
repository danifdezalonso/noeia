<script setup lang="ts">
import { X, Plus, Search } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'

export interface NewPatient {
  name: string
  initials: string
  email: string
  phone: string
  pronouns: string
  dob: string
  address: string
  gender: string
  hasInsurance: boolean
  insurer: string
  policyNumber: string
  emergencyContactName: string
  emergencyContactPhone: string
  referralSource: string
  chiefComplaint: string
  related: { id: string; name: string; relationship: string }[]
  tags: string[]
  internalNotes: string
}

const props = defineProps<{ existingPatients: { id: string; name: string }[] }>()
const emit  = defineEmits<{ close: []; save: [p: NewPatient] }>()

const PRONOUNS       = ['She/Her', 'He/Him', 'They/Them', 'Ze/Zir', 'Prefer not to say']
const REFERRAL_SOURCES = ['Self-referral', 'GP / Primary care', 'Psychiatrist', 'Insurance', 'Family or friend', 'Online search', 'Other']
const RELATIONSHIPS  = ['Partner', 'Spouse', 'Parent', 'Child', 'Sibling', 'Cousin', 'Friend', 'Guardian', 'Other']
const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'Genderfluid', 'Transgender', 'Prefer not to say', 'Other']

// ── Form ───────────────────────────────────────────────────────────────────
const form = reactive({
  name:                 '',
  email:                '',
  phone:                '',
  pronouns:             '',
  gender:               '',
  dob:                  '',
  address:              '',
  hasInsurance:         false,
  insurer:              '',
  policyNumber:         '',
  emergencyContactName: '',
  emergencyContactPhone:'',
  referralSource:       '',
  chiefComplaint:       '',
  internalNotes:        '',
})

// ── Related patients ───────────────────────────────────────────────────────
const related  = ref<{ id: string; name: string; relationship: string }[]>([])
const relQuery = ref('')
const relDropOpen = ref(false)
const relWrapRef  = ref<HTMLElement>()
const pendingRel  = ref<{ id: string; name: string } | null>(null)
const pendingRelType = ref('Partner')

const filteredPatients = computed(() => {
  const q = relQuery.value.trim().toLowerCase()
  const existingIds = new Set(related.value.map(r => r.id))
  return props.existingPatients.filter(
    p => !existingIds.has(p.id) && (!q || p.name.toLowerCase().includes(q))
  )
})

function selectRelated(p: { id: string; name: string }) {
  pendingRel.value  = p
  relQuery.value    = p.name
  relDropOpen.value = false
}

function addRelated() {
  if (!pendingRel.value) return
  related.value.push({ id: pendingRel.value.id, name: pendingRel.value.name, relationship: pendingRelType.value })
  pendingRel.value     = null
  relQuery.value       = ''
  pendingRelType.value = 'Partner'
}

function removeRelated(idx: number) { related.value.splice(idx, 1) }

function onDocClickRel(e: MouseEvent) {
  if (!relWrapRef.value?.contains(e.target as Node)) relDropOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClickRel))
onBeforeUnmount(() => document.removeEventListener('click', onDocClickRel))

// ── Tags ───────────────────────────────────────────────────────────────────
const tags    = ref<string[]>([])
const tagInput = ref('')

function addTag() {
  const t = tagInput.value.trim()
  if (t && !tags.value.includes(t)) tags.value.push(t)
  tagInput.value = ''
}

function removeTag(t: string) { tags.value = tags.value.filter(x => x !== t) }

function onTagKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
  if (e.key === 'Backspace' && !tagInput.value && tags.value.length)
    tags.value.pop()
}

// ── Validation & save ──────────────────────────────────────────────────────
const errName  = ref(false)
const errEmail = ref(false)

function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function save() {
  errName.value  = !form.name.trim()
  errEmail.value = !form.email.trim()
  if (errName.value || errEmail.value) return

  emit('save', {
    name:                 form.name.trim(),
    initials:             initials(form.name),
    email:                form.email.trim(),
    phone:                form.phone,
    pronouns:             form.pronouns,
    gender:               form.gender,
    dob:                  form.dob,
    address:              form.address,
    hasInsurance:         form.hasInsurance,
    insurer:              form.insurer,
    policyNumber:         form.policyNumber,
    emergencyContactName: form.emergencyContactName,
    emergencyContactPhone:form.emergencyContactPhone,
    referralSource:       form.referralSource,
    chiefComplaint:       form.chiefComplaint,
    related:              related.value,
    tags:                 tags.value,
    internalNotes:        form.internalNotes,
  })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="emit('close')">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[560px] flex flex-col max-h-[92vh]">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">New Patient</h2>
          <Button variant="ghost" size="icon" class="rounded-full" @click="emit('close')">
            <X class="w-4 h-4" />
          </Button>
        </div>

        <!-- Scrollable body -->
        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          <!-- ── Identity ──────────────────────────────────────────────────── -->
          <section class="space-y-4">
            <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Identity</p>

            <!-- Full name -->
            <div>
              <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Full name <span class="text-red-500">*</span></Label>
              <Input
                v-model="form.name"
                placeholder="First and last name"
                :class="errName ? 'border-red-400 focus-visible:ring-red-200' : ''"
                @input="errName = false"
              />
              <p v-if="errName" class="mt-1 text-xs text-red-500">Full name is required</p>
            </div>

            <!-- Gender + Pronouns -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Gender</Label>
                <Select v-model="form.gender">
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="g in GENDER_OPTIONS" :key="g" :value="g">{{ g }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Pronouns</Label>
                <Select v-model="form.pronouns">
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="p in PRONOUNS" :key="p" :value="p">{{ p }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- DOB -->
            <div>
              <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Date of birth</Label>
              <Input v-model="form.dob" type="date" />
            </div>
          </section>

          <div class="border-t border-slate-100 dark:border-slate-800" />

          <!-- ── Contact ───────────────────────────────────────────────────── -->
          <section class="space-y-4">
            <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Contact</p>

            <!-- Email -->
            <div>
              <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Email <span class="text-red-500">*</span></Label>
              <Input
                v-model="form.email"
                type="email"
                placeholder="patient@email.com"
                :class="errEmail ? 'border-red-400 focus-visible:ring-red-200' : ''"
                @input="errEmail = false"
              />
              <p v-if="errEmail" class="mt-1 text-xs text-red-500">Email is required</p>
            </div>

            <!-- Phone -->
            <div>
              <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Phone</Label>
              <Input v-model="form.phone" type="tel" placeholder="+1 555 000 0000" />
            </div>

            <!-- Address -->
            <div>
              <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Address</Label>
              <Input v-model="form.address" placeholder="Street, city, country" />
            </div>

            <!-- Emergency contact -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Emergency contact name</Label>
                <Input v-model="form.emergencyContactName" placeholder="Full name" />
              </div>
              <div>
                <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Emergency contact phone</Label>
                <Input v-model="form.emergencyContactPhone" type="tel" placeholder="+1 555 000 0000" />
              </div>
            </div>
          </section>

          <div class="border-t border-slate-100 dark:border-slate-800" />

          <!-- ── Insurance ──────────────────────────────────────────────────── -->
          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Insurance</p>
              <Switch v-model:checked="form.hasInsurance" />
            </div>
            <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
              <div v-if="form.hasInsurance" class="grid grid-cols-2 gap-3">
                <div>
                  <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Insurer</Label>
                  <Input v-model="form.insurer" placeholder="Insurance company" />
                </div>
                <div>
                  <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Policy number</Label>
                  <Input v-model="form.policyNumber" placeholder="POL-000000" />
                </div>
              </div>
            </Transition>
          </section>

          <div class="border-t border-slate-100 dark:border-slate-800" />

          <!-- ── Clinical context ───────────────────────────────────────────── -->
          <section class="space-y-4">
            <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Clinical context</p>

            <!-- Referral source -->
            <div>
              <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Referral source</Label>
              <Select v-model="form.referralSource">
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in REFERRAL_SOURCES" :key="s" :value="s">{{ s }}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Chief complaint -->
            <div>
              <Label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Chief complaint / reason for consultation</Label>
              <Textarea v-model="form.chiefComplaint" :rows="2" placeholder="Brief description of primary concern…" class="resize-none" />
            </div>
          </section>

          <div class="border-t border-slate-100 dark:border-slate-800" />

          <!-- ── Related patients ───────────────────────────────────────────── -->
          <section class="space-y-3">
            <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Related patients</p>

            <!-- Existing relations -->
            <div v-if="related.length > 0" class="space-y-1.5">
              <div v-for="(r, i) in related" :key="r.id" class="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span class="text-primary text-[9px] font-bold">{{ r.name.split(' ').map(w=>w[0]).join('').slice(0,2) }}</span>
                </div>
                <span class="flex-1 text-xs text-slate-700 dark:text-slate-200 font-medium truncate">{{ r.name }}</span>
                <span class="text-xs text-slate-400 dark:text-slate-500">{{ r.relationship }}</span>
                <button class="ml-1 text-slate-300 hover:text-red-400 transition-colors" @click="removeRelated(i)">
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Add relation row -->
            <div ref="relWrapRef" class="flex gap-2 items-start">
              <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                <Input
                  v-model="relQuery"
                  placeholder="Search patient…"
                  class="pl-9 text-xs h-8"
                  @focus="relDropOpen = true"
                  @input="relDropOpen = true"
                />
                <div v-if="relDropOpen && filteredPatients.length > 0" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1 max-h-32 overflow-y-auto">
                  <button v-for="p in filteredPatients" :key="p.id" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click="selectRelated(p)">{{ p.name }}</button>
                </div>
              </div>
              <Select v-model="pendingRelType">
                <SelectTrigger class="h-8 text-xs w-32 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="r in RELATIONSHIPS" :key="r" :value="r">{{ r }}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                :disabled="!pendingRel"
                class="h-8 text-xs"
                @click="addRelated"
              >
                <Plus class="w-3 h-3" /> Add
              </Button>
            </div>
          </section>

          <div class="border-t border-slate-100 dark:border-slate-800" />

          <!-- ── Tags ──────────────────────────────────────────────────────── -->
          <section class="space-y-2">
            <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tags</p>
            <div class="flex flex-wrap gap-1.5 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 min-h-[44px] cursor-text" @click="($el => ($el as HTMLElement)?.querySelector('input')?.focus())($event.currentTarget)">
              <span v-for="t in tags" :key="t" class="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {{ t }}
                <button class="hover:text-red-500 transition-colors" @click.stop="removeTag(t)"><X class="w-3 h-3" /></button>
              </span>
              <input
                v-model="tagInput"
                type="text"
                placeholder="Add tag…"
                class="flex-1 min-w-[100px] text-xs bg-transparent text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                @keydown="onTagKey"
                @blur="addTag"
              />
            </div>
            <p class="text-[10px] text-slate-400">Press Enter or comma to add a tag. E.g. anxiety, CBT, couples</p>
          </section>

          <div class="border-t border-slate-100 dark:border-slate-800" />

          <!-- ── Internal notes ─────────────────────────────────────────────── -->
          <section class="space-y-2">
            <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Internal notes</p>
            <Textarea v-model="form.internalNotes" :rows="3" placeholder="Notes visible only to you and your team…" class="resize-none" />
          </section>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <Button variant="ghost" @click="emit('close')">Cancel</Button>
          <Button @click="save">Add Patient</Button>
        </div>

      </div>
    </div>
  </Teleport>
</template>
