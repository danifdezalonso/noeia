<script setup lang="ts">
import {
  LayoutDashboard, Calendar, ClipboardList, Users,
  MessageSquare, Receipt, Sparkles, Settings,
  Sun, Moon, Stethoscope, Building2, ChevronUp,
  User, CreditCard, LogOut,
} from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'
import { SHELL_KEY } from '~/composables/useDashboard'
import {
  Sidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarMenuBadge, SidebarSeparator, useSidebar,
} from '~/components/ui/sidebar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '~/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

const shell = inject(SHELL_KEY)!
const route = useRoute()
const { persona } = usePersona()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const { mobileOpen, state, isMobile } = useSidebar()
const iconOnly = computed(() => state.value === 'collapsed' && !isMobile.value)

const iconMap: Record<string, Component> = {
  LayoutDashboard, Calendar, ClipboardList, Users,
  MessageSquare, Receipt, Sparkles, Stethoscope, Building2,
}

function isActive(path: string) {
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
  <Sidebar>
    <!-- ── Header: Logo ── -->
    <SidebarHeader>
      <div class="flex items-center gap-2.5 px-1 py-1 h-10">
        <div class="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <img src="/Noeia_logo_mini.svg" alt="Noeia" class="w-4 h-4 brightness-0 invert" />
        </div>
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="opacity-0"
        >
          <div v-if="!iconOnly" class="overflow-hidden flex-shrink-0">
            <img src="/Noeia_logo.svg" alt="Noeia" class="h-5 dark:hidden" />
            <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-5 hidden dark:block" />
          </div>
        </Transition>
      </div>
    </SidebarHeader>

    <!-- ── Content: Nav items ── -->
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in shell.navItems.value" :key="item.id">
              <SidebarMenuButton
                as-child
                :is-active="isActive(item.path)"
                :tooltip="item.label"
                @click="mobileOpen = false"
              >
                <NuxtLink :to="item.path">
                  <component :is="iconMap[item.icon]" />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </SidebarMenuButton>
              <SidebarMenuBadge v-if="item.badge">{{ item.badge }}</SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <!-- ── Footer: Dark mode + Settings + User ── -->
    <SidebarFooter>
      <SidebarMenu>
        <!-- Dark mode toggle -->
        <SidebarMenuItem>
          <SidebarMenuButton :tooltip="isDark ? 'Light mode' : 'Dark mode'" @click="toggleDark()">
            <component :is="isDark ? Sun : Moon" />
            <span>{{ isDark ? 'Light mode' : 'Dark mode' }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <!-- Settings -->
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Settings">
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarSeparator />

        <!-- User profile -->
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton :tooltip="persona.name">
                <Avatar class="size-6 ring-1 ring-sidebar-border flex-shrink-0">
                  <AvatarImage :src="avatarUrl(persona.name)" :alt="persona.name" />
                  <AvatarFallback class="bg-sidebar-primary text-white text-[9px] font-bold">{{ persona.avatarInitials }}</AvatarFallback>
                </Avatar>
                <template v-if="!iconOnly">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-sidebar-foreground truncate leading-tight">{{ persona.name }}</p>
                    <p class="text-[10px] text-sidebar-foreground/60 truncate leading-tight">{{ profileSubLabel }}</p>
                  </div>
                  <ChevronUp class="ml-auto w-3.5 h-3.5 text-sidebar-foreground/40 flex-shrink-0" />
                </template>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" class="w-56 mb-1">
              <DropdownMenuLabel class="font-normal py-2">
                <div class="flex flex-col gap-0.5">
                  <p class="text-sm font-semibold">{{ persona.name }}</p>
                  <p class="text-xs text-muted-foreground">torres@mindcare.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User class="w-4 h-4" />
                Profile settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings class="w-4 h-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard class="w-4 h-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-destructive focus:text-destructive" @click="navigateTo('/')">
                <LogOut class="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
