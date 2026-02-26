<script setup lang="ts">
import {
  Menu, Building2, ChevronDown, Search, Plus,
  Bell, MessageCircle, HelpCircle, Check, LogOut,
  Settings, User, CreditCard,
  CalendarPlus, UserPlus, ReceiptText, Stethoscope,
} from 'lucide-vue-next'
import { SHELL_KEY } from '~/composables/useDashboard'
import { Button } from '~/components/ui/button'

const shell = inject(SHELL_KEY)!
const { persona } = usePersona()

const ctaOpen = ref(false)
const { sessionModalOpen, patientModalOpen, billModalOpen, doctorModalOpen } = useGlobalModals()

function handleSidebarToggle() {
  if (process.client && window.innerWidth < 768) {
    shell.mobileNavOpen.value = !shell.mobileNavOpen.value
  } else {
    shell.sidebarOpen.value = !shell.sidebarOpen.value
  }
}

function closeAll() {
  shell.orgSelectorOpen.value = false
  shell.notificationsOpen.value = false
  shell.profileOpen.value = false
  ctaOpen.value = false
}

function toggleCta() {
  shell.orgSelectorOpen.value = false
  shell.notificationsOpen.value = false
  shell.profileOpen.value = false
  ctaOpen.value = !ctaOpen.value
}

function toggleOrg() {
  ctaOpen.value = false
  shell.notificationsOpen.value = false
  shell.profileOpen.value = false
  shell.orgSelectorOpen.value = !shell.orgSelectorOpen.value
}

function toggleNotifications() {
  ctaOpen.value = false
  shell.orgSelectorOpen.value = false
  shell.profileOpen.value = false
  shell.notificationsOpen.value = !shell.notificationsOpen.value
}

function toggleProfile() {
  ctaOpen.value = false
  shell.orgSelectorOpen.value = false
  shell.notificationsOpen.value = false
  shell.profileOpen.value = !shell.profileOpen.value
}

const orgs = [
  { id: 1, name: 'MindCare Clinics', active: true },
  { id: 2, name: 'Personal Practice', active: false },
]

const notifications = [
  { id: 1, type: 'session',  text: 'Session with M. García starts in 30 min', time: '28m', unread: true },
  { id: 2, type: 'bill',     text: 'Invoice #0042 was paid by R. López',       time: '2h',  unread: true },
  { id: 3, type: 'message',  text: 'A. Martín sent you a new message',          time: '3h',  unread: true },
]
</script>

<template>
  <!-- Backdrop to close dropdowns -->
  <div
    v-if="shell.orgSelectorOpen.value || shell.notificationsOpen.value || shell.profileOpen.value || ctaOpen"
    class="fixed inset-0 z-30"
    @click="closeAll"
  />

  <header class="relative h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center px-3 sm:px-4 gap-2 sm:gap-3 z-50 flex-shrink-0 w-full">

    <!-- ── Left ── -->
    <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">

      <!-- Sidebar / mobile nav toggle -->
      <button
        type="button"
        @click="handleSidebarToggle"
        class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        :title="shell.sidebarOpen.value ? 'Collapse sidebar' : 'Expand sidebar'"
      >
        <Menu class="w-4 h-4" />
      </button>

      <!-- Org selector — hidden on small mobile -->
      <div class="relative hidden sm:block">
        <button
          type="button"
          @click.stop="toggleOrg"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <Building2 class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span class="hidden md:inline">MindCare Clinics</span>
          <ChevronDown class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-150"
            :class="{ 'rotate-180': shell.orgSelectorOpen.value }" />
        </button>

        <!-- Org dropdown -->
        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          leave-active-class="transition duration-75 ease-in"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="shell.orgSelectorOpen.value"
            class="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden"
          >
            <p class="px-3 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Organizations
            </p>
            <button
              v-for="org in orgs"
              :key="org.id"
              type="button"
              class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              :class="org.active ? 'text-primary font-medium' : 'text-slate-700 dark:text-slate-300'"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                  :class="org.active ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
                >
                  {{ org.name[0] }}
                </div>
                {{ org.name }}
              </div>
              <Check v-if="org.active" class="w-3.5 h-3.5 text-primary" />
            </button>
            <div class="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
              <button type="button"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Plus class="w-3.5 h-3.5" />
                Add organization
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ── Center: Search ── -->
    <div class="flex-1 min-w-0">
      <div class="relative max-w-md mx-auto hidden sm:block">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search patients, sessions, bills…"
          class="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:focus:ring-primary/20 transition-all"
        />
        <kbd class="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </kbd>
      </div>
    </div>

    <!-- ── Right ── -->
    <div class="flex items-center gap-1 flex-shrink-0">

      <!-- + New dropdown CTA -->
      <div class="relative">
        <Button
          class="gap-1.5 px-3 sm:px-3.5 py-1.5 h-auto text-sm font-semibold rounded-lg"
          @click.stop="toggleCta"
        >
          <Plus class="w-4 h-4" />
          <span class="hidden sm:inline">New</span>
          <ChevronDown class="hidden sm:block w-3.5 h-3.5 opacity-70 transition-transform duration-150" :class="{ 'rotate-180': ctaOpen }" />
        </Button>

        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          leave-active-class="transition duration-75 ease-in"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="ctaOpen"
            class="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden"
          >
            <button type="button" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click="sessionModalOpen = true; ctaOpen = false">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CalendarPlus class="w-3.5 h-3.5 text-primary" />
              </div>
              <div class="text-left">
                <p class="font-medium leading-none">Session</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Schedule appointment</p>
              </div>
            </button>
            <button type="button" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click="patientModalOpen = true; ctaOpen = false">
              <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                <UserPlus class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div class="text-left">
                <p class="font-medium leading-none">Patient</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Add patient record</p>
              </div>
            </button>
            <button type="button" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click="billModalOpen = true; ctaOpen = false">
              <div class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                <ReceiptText class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div class="text-left">
                <p class="font-medium leading-none">Bill</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Create invoice</p>
              </div>
            </button>
            <button v-if="persona.role === 'organization'" type="button" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" @click="doctorModalOpen = true; ctaOpen = false">
              <div class="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center flex-shrink-0">
                <Stethoscope class="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <div class="text-left">
                <p class="font-medium leading-none">Doctor</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Add team member</p>
              </div>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Separator -->
      <div class="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

      <!-- Notifications -->
      <div class="relative">
        <button
          type="button"
          @click.stop="toggleNotifications"
          class="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell class="w-4 h-4" />
          <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        <!-- Notifications panel -->
        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-1"
          leave-active-class="transition duration-75 ease-in"
          leave-to-class="opacity-0 scale-95 translate-y-1"
        >
          <div
            v-if="shell.notificationsOpen.value"
            class="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</p>
              <button type="button" class="text-xs text-primary hover:text-primary/80 font-medium">
                Mark all read
              </button>
            </div>
            <div class="divide-y divide-slate-50 dark:divide-slate-700">
              <div
                v-for="n in notifications" :key="n.id"
                class="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <div class="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                  :class="n.unread ? 'bg-primary' : 'bg-transparent'" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-700 dark:text-slate-200 leading-snug">{{ n.text }}</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ n.time }} ago</p>
                </div>
              </div>
            </div>
            <div class="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 text-center">
              <button type="button" class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                View all notifications
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Feedback — hidden on mobile -->
      <button type="button"
        class="hidden md:flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Send feedback">
        <MessageCircle class="w-4 h-4" />
      </button>

      <!-- Help — hidden on mobile -->
      <button type="button"
        class="hidden md:flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Help & resources">
        <HelpCircle class="w-4 h-4" />
      </button>

      <!-- Avatar + Profile dropdown -->
      <div class="relative ml-0.5">
        <button
          type="button"
          @click.stop="toggleProfile"
          class="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1 sm:pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
            <span class="text-white text-xs font-bold">{{ persona.avatarInitials }}</span>
          </div>
          <ChevronDown class="hidden sm:block w-3 h-3 text-slate-400 dark:text-slate-500 transition-transform duration-150"
            :class="{ 'rotate-180': shell.profileOpen.value }" />
        </button>

        <!-- Profile dropdown -->
        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-1"
          leave-active-class="transition duration-75 ease-in"
          leave-to-class="opacity-0 scale-95 translate-y-1"
        >
          <div
            v-if="shell.profileOpen.value"
            class="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden"
          >
            <!-- User info -->
            <div class="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700">
              <div class="flex items-center gap-1.5 mb-0.5">
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ persona.name }}</p>
                <span v-if="persona.role === 'organization'" class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                  Org
                </span>
              </div>
              <p v-if="persona.orgName" class="text-xs text-slate-400 dark:text-slate-500">{{ persona.orgName }}</p>
              <p v-else class="text-xs text-slate-400 dark:text-slate-500">torres@mindcare.com</p>
            </div>

            <div class="py-1">
              <button type="button"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <User class="w-4 h-4 text-slate-400 dark:text-slate-500" /> Profile settings
              </button>
              <button type="button"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <Settings class="w-4 h-4 text-slate-400 dark:text-slate-500" /> Preferences
              </button>
              <button type="button"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <CreditCard class="w-4 h-4 text-slate-400 dark:text-slate-500" /> Billing
              </button>
            </div>

            <div class="border-t border-slate-100 dark:border-slate-700 pt-1">
              <button type="button"
                class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                @click="navigateTo('/')">
                <LogOut class="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </Transition>
      </div>

    </div>
  </header>
</template>
