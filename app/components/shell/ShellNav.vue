<script setup lang="ts">
import {
  LayoutDashboard, Calendar, ClipboardList, Users,
  MessageSquare, Receipt, Sparkles, Settings, ChevronRight,
  Sun, Moon, Stethoscope, Building2,
} from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'
import { SHELL_KEY } from '~/composables/useDashboard'

const shell = inject(SHELL_KEY)!
const route = useRoute()
const { persona } = usePersona()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const iconMap: Record<string, Component> = {
  LayoutDashboard, Calendar, ClipboardList, Users,
  MessageSquare, Receipt, Sparkles, Stethoscope, Building2,
}

function isActive(path: string) {
  // Root items match exactly so Dashboard doesn't stay lit on sub-pages
  if (path === '/organization/dashboard' || path === '/doctor/dashboard') {
    return route.path === path
  }
  return route.path.startsWith(path)
}

const profileSubLabel = computed(() =>
  persona.value.role === 'organization' ? persona.value.orgName : 'Clinical Psychology',
)
</script>

<template>
  <aside
    class="flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-shrink-0 overflow-hidden
           fixed top-14 bottom-0 left-0 z-40 w-64
           md:relative md:top-auto md:bottom-auto md:left-auto md:z-auto md:self-stretch
           transition-[transform,width] duration-200 ease-in-out"
    :class="[
      shell.mobileNavOpen.value ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      shell.sidebarOpen.value ? 'md:w-60' : 'md:w-14',
    ]"
  >
    <!-- ── Logo ── -->
    <div class="flex items-center h-14 px-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
      <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
        <img src="/Noeia_logo_mini.svg" alt="Noeia" class="w-4 h-4 brightness-0 invert" />
      </div>
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-100 ease-in"
        leave-to-class="opacity-0"
      >
        <span v-if="shell.sidebarOpen.value" class="ml-2.5 overflow-hidden flex-shrink-0">
          <img src="/Noeia_logo.svg" alt="Noeia" class="h-5 dark:hidden" />
          <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-5 hidden dark:block" />
        </span>
      </Transition>
    </div>

    <!-- ── Nav items ── -->
    <nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
      <NuxtLink
        v-for="item in shell.navItems.value"
        :key="item.id"
        :to="item.path"
        class="relative flex items-center gap-3 py-2 rounded-lg transition-colors group"
        @click="shell.mobileNavOpen.value = false"
        :class="[
          isActive(item.path)
            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
          shell.sidebarOpen.value ? 'px-2.5' : 'justify-center px-2',
        ]"
        :title="!shell.sidebarOpen.value ? item.label : undefined"
      >
        <!-- Active accent bar -->
        <div
          v-if="isActive(item.path)"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-600 rounded-r-full"
        />

        <!-- Icon -->
        <component
          :is="iconMap[item.icon]"
          class="w-4 h-4 flex-shrink-0 transition-colors"
          :class="isActive(item.path) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'"
        />

        <!-- Label + badge (only when expanded) -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="opacity-0"
        >
          <div v-if="shell.sidebarOpen.value" class="flex items-center justify-between flex-1 min-w-0">
            <span class="text-sm font-medium truncate">{{ item.label }}</span>
            <span
              v-if="item.badge"
              class="ml-2 flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums"
              :class="isActive(item.path)
                ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'"
            >
              {{ item.badge }}
            </span>
          </div>
        </Transition>

        <!-- Collapsed badge dot -->
        <span
          v-if="!shell.sidebarOpen.value && item.badge"
          class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500"
        />
      </NuxtLink>
    </nav>

    <!-- ── Bottom: settings + user ── -->
    <div class="px-2 py-3 border-t border-slate-100 dark:border-slate-800 space-y-0.5 flex-shrink-0">
      <!-- Dark mode toggle -->
      <button
        type="button"
        class="relative w-full flex items-center gap-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors group"
        :class="shell.sidebarOpen.value ? 'px-2.5' : 'justify-center px-2'"
        :title="!shell.sidebarOpen.value ? (isDark ? 'Light mode' : 'Dark mode') : undefined"
        @click="toggleDark()"
      >
        <component
          :is="isDark ? Sun : Moon"
          class="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors"
        />
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="opacity-0"
        >
          <span v-if="shell.sidebarOpen.value" class="text-sm font-medium">{{ isDark ? 'Light mode' : 'Dark mode' }}</span>
        </Transition>
      </button>

      <!-- Settings -->
      <button
        type="button"
        class="relative w-full flex items-center gap-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors group"
        :class="shell.sidebarOpen.value ? 'px-2.5' : 'justify-center px-2'"
        :title="!shell.sidebarOpen.value ? 'Settings' : undefined"
      >
        <Settings class="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="opacity-0"
        >
          <span v-if="shell.sidebarOpen.value" class="text-sm font-medium">Settings</span>
        </Transition>
      </button>

      <!-- User profile -->
      <div
        class="flex items-center gap-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
        :class="shell.sidebarOpen.value ? 'px-2.5' : 'justify-center px-2'"
        :title="!shell.sidebarOpen.value ? persona.name : undefined"
      >
        <div class="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 ring-2 ring-white dark:ring-slate-900">
          <span class="text-white text-[10px] font-bold">{{ persona.avatarInitials }}</span>
        </div>
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="opacity-0"
        >
          <div v-if="shell.sidebarOpen.value" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate leading-tight">{{ persona.name }}</p>
            <p class="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">{{ profileSubLabel }}</p>
          </div>
        </Transition>
        <ChevronRight
          v-if="shell.sidebarOpen.value"
          class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 flex-shrink-0 transition-colors"
        />
      </div>
    </div>
  </aside>
</template>
