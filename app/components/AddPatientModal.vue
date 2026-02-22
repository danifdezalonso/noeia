<script setup lang="ts">
import { X, Plus, Search, Tag } from 'lucide-vue-next'

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
          <button class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" @click="emit('close')">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Scrollable body -->
        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          <!-- ── Identity ──────────────────────────────────────────────────── -->
          <section class="space-y-4">
            <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Identity</p>

            <!-- Full name -->
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Full name <span class="text-red-500">*</span></label>
              <input
                v-model="form.name"
                type="text"
                placeholder="First and last name"
                :class="['w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors', errName ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/30 focus:border-indigo-400']"
                @input="errName = false"
              />
              <p v-if="errName" class="mt-1 text-xs text-red-500">Full name is required</p>
            </div>

            <!-- Gender + Pronouns -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Gender</label>
                <select v-model="form.gender" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors appearance-none">
                  <option value="">Select…</option>
                  <option v-for="g in GENDER_OPTIONS" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Pronouns</label>
                <select v-model="form.pronouns" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors appearance-none">
                  <option value="">Select…</option>
                  <option v-for="p in PRONOUNS" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
            </div>

            <!-- DOB -->
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Date of birth</label>
              <input v-model="form.dob" type="date" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors" />
            </div>
          </section>

          <div class="border-t border-slate-100 dark:border-slate-800" />

          <!-- ── Contact ───────────────────────────────────────────────────── -->
          <section class="space-y-4">
            <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Contact</p>

            <!-- Email -->
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Email <span class="text-red-500">*</span></label>
              <input
                v-model="form.email"
                type="email"
                placeholder="patient@email.com"
                :class="['w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors', errEmail ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/30 focus:border-indigo-400']"
                @input="errEmail = false"
              />
              <p v-if="errEmail" class="mt-1 text-xs text-red-500">Email is required</p>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Phone</label>
              <input v-model="form.phone" type="tel" placeholder="+1 555 000 0000" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors" />
            </div>

            <!-- Address -->
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Address</label>
              <input v-model="form.address" type="text" placeholder="Street, city, country" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors" />
            </div>

            <!-- Emergency contact -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Emergency contact name</label>
                <input v-model="form.emergencyContactName" type="text" placeholder="Full name" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Emergency contact phone</label>
                <input v-model="form.emergencyContactPhone" type="tel" placeholder="+1 555 000 0000" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors" />
              </div>
            </div>
          </section>

          <div class="border-t border-slate-100 dark:border-slate-800" />

          <!-- ── Insurance ──────────────────────────────────────────────────── -->
          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Insurance</p>
              <button
                role="switch"
                :aria-checked="form.hasInsurance"
                :class="['relative w-9 h-5 rounded-full transition-colors duration-200', form.hasInsurance ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600']"
                @click="form.hasInsurance = !form.hasInsurance"
              >
                <span :class="['absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200', form.hasInsurance ? 'translate-x-4' : 'translate-x-0']" />
              </button>
            </div>
            <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
              <div v-if="form.hasInsurance" class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Insurer</label>
                  <input v-model="form.insurer" type="text" placeholder="Insurance company" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Policy number</label>
                  <input v-model="form.policyNumber" type="text" placeholder="POL-000000" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors" />
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
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Referral source</label>
              <select v-model="form.referralSource" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors appearance-none">
                <option value="">Select…</option>
                <option v-for="s in REFERRAL_SOURCES" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <!-- Chief complaint -->
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Chief complaint / reason for consultation</label>
              <textarea v-model="form.chiefComplaint" rows="2" placeholder="Brief description of primary concern…" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors" />
            </div>
          </section>

          <div class="border-t border-slate-100 dark:border-slate-800" />

          <!-- ── Related patients ───────────────────────────────────────────── -->
          <section class="space-y-3">
            <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Related patients</p>

            <!-- Existing relations -->
            <div v-if="related.length > 0" class="space-y-1.5">
              <div v-for="(r, i) in related" :key="r.id" class="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
                  <span class="text-indigo-700 dark:text-indigo-300 text-[9px] font-bold">{{ r.name.split(' ').map(w=>w[0]).join('').slice(0,2) }}</span>
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
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  v-model="relQuery"
                  type="text"
                  placeholder="Search patient…"
                  class="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                  @focus="relDropOpen = true"
                  @input="relDropOpen = true"
                />
                <div v-if="relDropOpen && filteredPatients.length > 0" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1 max-h-32 overflow-y-auto">
                  <button v-for="p in filteredPatients" :key="p.id" class="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click="selectRelated(p)">{{ p.name }}</button>
                </div>
              </div>
              <select v-model="pendingRelType" class="px-2.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none">
                <option v-for="r in RELATIONSHIPS" :key="r" :value="r">{{ r }}</option>
              </select>
              <button
                :disabled="!pendingRel"
                :class="['flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors', pendingRel ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed']"
                @click="addRelated"
              >
                <Plus class="w-3 h-3" /> Add
              </button>
            </div>
          </section>

          <div class="border-t border-slate-100 dark:border-slate-800" />

          <!-- ── Tags ──────────────────────────────────────────────────────── -->
          <section class="space-y-2">
            <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tags</p>
            <div class="flex flex-wrap gap-1.5 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 min-h-[44px] cursor-text" @click="($el => ($el as HTMLElement)?.querySelector('input')?.focus())($event.currentTarget)">
              <span v-for="t in tags" :key="t" class="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
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
            <textarea v-model="form.internalNotes" rows="3" placeholder="Notes visible only to you and your team…" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors" />
          </section>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" @click="emit('close')">Cancel</button>
          <button class="px-5 py-2 text-sm font-semibold bg-slate-900 dark:bg-indigo-600 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors shadow-sm" @click="save">Add Patient</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>
