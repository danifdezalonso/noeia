<script setup lang="ts">
import {
  LayoutDashboard, Calendar, ClipboardList, Users,
  MessageSquare, Receipt, Sparkles, Settings,
  Sun, Moon, Stethoscope, Building2, ChevronUp, ChevronDown,
  User, CreditCard, LogOut, LayoutTemplate, Globe, CalendarClock, FlaskConical,
} from 'lucide-vue-next'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '~/components/ui/collapsible'
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

// NoeIA collapsible — expand whenever on any noeia sub-route
const noeiaOpen = ref(route.path.includes('/noeia'))
watch(() => route.path, p => { if (p.includes('/noeia')) noeiaOpen.value = true })

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
            <SidebarMenuItem v-for="item in shell.navItems.value.filter(i => i.section !== 'organization')" :key="item.id">

              <!-- NoeIA: collapsible with My Templates + Community sub-items -->
              <template v-if="item.icon === 'Sparkles'">
                <Collapsible v-model:open="noeiaOpen" class="w-full">
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton
                      :is-active="isActive(item.path)"
                      :tooltip="item.label"
                      @click="mobileOpen = false; navigateTo(item.path)"
                    >
                      <Sparkles />
                      <span>{{ item.label }}</span>
                      <ChevronDown
                        v-if="!iconOnly"
                        :class="['ml-auto w-3.5 h-3.5 shrink-0 transition-transform duration-200', noeiaOpen ? 'rotate-180' : '']"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent v-if="!iconOnly">
                    <div class="mt-0.5 ml-2 border-l border-sidebar-border pl-3 py-0.5 space-y-0.5">
                      <NuxtLink
                        v-for="sub in [
                          { label: 'Sessions',     path: item.path,                          icon: CalendarClock  },
                          { label: 'Evidence',     path: item.path + '/evidence',            icon: FlaskConical   },
                          { label: 'My templates', path: item.path + '/my-templates',        icon: LayoutTemplate },
                          { label: 'Community',    path: item.path + '/community',           icon: Globe          },
                        ]"
                        :key="sub.label"
                        :to="sub.path"
                        class="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors"
                        :class="[
                          route.path === sub.path || (sub.label === 'Sessions' && route.path === item.path)
                            ? 'text-sidebar-foreground bg-sidebar-accent font-medium'
                            : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        ]"
                        @click="mobileOpen = false"
                      >
                        <component :is="sub.icon" class="w-3.5 h-3.5 shrink-0" />
                        {{ sub.label }}
                      </NuxtLink>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </template>

              <!-- Regular nav items -->
              <template v-else>
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
              </template>

            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Organization</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <!-- Org-section items from navItems (e.g. Office for org persona) -->
            <SidebarMenuItem v-for="item in shell.navItems.value.filter(i => i.section === 'organization')" :key="item.id">
              <SidebarMenuButton as-child :is-active="isActive(item.path)" :tooltip="item.label" @click="mobileOpen = false">
                <NuxtLink :to="item.path">
                  <component :is="iconMap[item.icon]" />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <!-- Team (doctor persona) -->
            <SidebarMenuItem v-if="persona.role === 'doctor'">
              <SidebarMenuButton as-child :is-active="isActive('/doctor/dashboard/team')" tooltip="Team" @click="mobileOpen = false">
                <NuxtLink to="/doctor/dashboard/team">
                  <Users />
                  <span>Team</span>
                </NuxtLink>
              </SidebarMenuButton>
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
