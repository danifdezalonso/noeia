<script setup lang="ts">
import {
  LayoutDashboard, Calendar, ClipboardList, Users,
  MessageSquare, Receipt, Sparkles, Settings,
  Sun, Moon, Stethoscope, Building2, ChevronUp, ChevronDown,
  User, CreditCard, LogOut, LayoutTemplate, Globe, CalendarClock, FlaskConical,
  PanelLeft, PanelLeftClose, ListTodo, Check, Plus, ArrowRight,
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '~/components/ui/dialog'
import { Input }  from '~/components/ui/input'
import { Label }  from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '~/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { SPECIALTIES, ROLES, TEAM_SIZES } from '~/composables/useOnboardingForm'

const shell = inject(SHELL_KEY)!
const route = useRoute()
const { persona } = usePersona()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const { mobileOpen, state, isMobile, toggleSidebar } = useSidebar()
const iconOnly = computed(() => state.value === 'collapsed' && !isMobile.value)

const iconMap: Record<string, Component> = {
  LayoutDashboard, Calendar, ClipboardList, Users,
  MessageSquare, Receipt, Sparkles, Stethoscope, Building2, ListTodo,
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

const orgs = ref([
  { id: 1, name: 'MindCare Clinics',  active: true,  role: 'Owner' },
  { id: 2, name: 'Personal Practice', active: false, role: 'Admin' },
])

const activeOrg = computed(() => orgs.value.find(o => o.active) ?? orgs.value[0])

function switchOrg(id: number) {
  orgs.value.forEach(o => { o.active = o.id === id })
}

// ── Add a center ──────────────────────────────────────────────────────────────

const showAddCenter = ref(false)

const centerForm = reactive({
  name:     '',
  specialty:'',
  teamSize: '',
  role:     '',
})

const centerErrors = reactive({
  name:     '',
  specialty:'',
  teamSize: '',
  role:     '',
})

function openAddCenter() {
  Object.assign(centerForm, { name: '', specialty: '', teamSize: '', role: '' })
  Object.assign(centerErrors, { name: '', specialty: '', teamSize: '', role: '' })
  showAddCenter.value = true
}

function submitAddCenter() {
  centerErrors.name     = centerForm.name.trim()     ? '' : 'Required'
  centerErrors.specialty= centerForm.specialty       ? '' : 'Required'
  centerErrors.teamSize = centerForm.teamSize        ? '' : 'Please select a team size'
  centerErrors.role     = centerForm.role            ? '' : 'Please select a role'

  if (centerErrors.name || centerErrors.specialty || centerErrors.teamSize || centerErrors.role) return

  const newId = Math.max(...orgs.value.map(o => o.id)) + 1
  orgs.value.forEach(o => { o.active = false })
  orgs.value.push({ id: newId, name: centerForm.name.trim(), active: true, role: 'Owner' })
  showAddCenter.value = false
  const welcomeCenter = useState<string>('welcome-center', () => '')
  welcomeCenter.value = centerForm.name.trim()
  navigateTo('/organization/dashboard')
}
</script>

<template>
  <Sidebar>
    <!-- ── Header: Logo + collapse toggle ── -->
    <SidebarHeader>
      <!-- Collapsed: just the expand button -->
      <div v-if="iconOnly" class="flex items-center justify-center h-10 px-1 py-1">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          title="Expand sidebar"
          @click="toggleSidebar()"
        >
          <PanelLeft class="w-4 h-4" />
        </button>
      </div>

      <!-- Expanded: logo + wordmark + collapse button -->
      <div v-else class="flex items-center gap-2.5 px-1 py-1 h-10">
        <div class="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <img src="/Noeia_logo_mini.svg" alt="Noeia" class="w-4 h-4 brightness-0 invert" />
        </div>
        <div class="overflow-hidden flex-shrink-0 flex-1 min-w-0">
          <img src="/Noeia_logo.svg" alt="Noeia" class="h-5 dark:hidden" />
          <img src="/Noeia_logo_white.svg" alt="Noeia" class="h-5 hidden dark:block" />
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0"
          title="Collapse sidebar"
          @click="toggleSidebar()"
        >
          <PanelLeftClose class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- ── Workspace / org selector ── -->
      <div class="px-1 pb-1">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuButton :tooltip="activeOrg.name" class="h-9 gap-2.5">
              <div class="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 bg-sidebar-primary/20 text-sidebar-primary">
                {{ activeOrg.name[0] }}
              </div>
              <template v-if="!iconOnly">
                <span class="flex-1 text-sm font-medium text-sidebar-foreground truncate">{{ activeOrg.name }}</span>
                <ChevronDown class="w-3.5 h-3.5 text-sidebar-foreground/40 shrink-0" />
              </template>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" class="w-56">
            <DropdownMenuLabel class="text-xs font-normal text-muted-foreground pb-1">Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              v-for="org in orgs"
              :key="org.id"
              class="gap-2.5 cursor-pointer"
              @click="switchOrg(org.id)"
            >
              <div class="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0"
                :class="org.active ? 'bg-primary/10 text-primary' : 'bg-accent text-muted-foreground'">
                {{ org.name[0] }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate">{{ org.name }}</p>
                <p class="text-[10px] text-muted-foreground/70 leading-tight">{{ org.role }}</p>
              </div>
              <Check v-if="org.active" class="w-3.5 h-3.5 text-primary shrink-0" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="gap-2.5 cursor-pointer text-muted-foreground" @click="openAddCenter">
              <Plus class="w-3.5 h-3.5" />
              <span class="text-sm">Add a center</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
          <SidebarMenuButton as-child :is-active="isActive('/doctor/dashboard/settings')" tooltip="Settings" @click="mobileOpen = false">
            <NuxtLink to="/doctor/dashboard/settings">
              <Settings />
              <span>Settings</span>
            </NuxtLink>
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
              <DropdownMenuItem @click="navigateTo('/doctor/dashboard/profile')">
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
              <DropdownMenuItem class="text-destructive focus:text-destructive" @click="navigateTo('/login')">
                <LogOut class="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>

  <!-- ── Add a center dialog ──────────────────────────────────────────────── -->
  <Dialog v-model:open="showAddCenter">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold">Add a center</DialogTitle>
        <p class="text-sm text-muted-foreground mt-1">Set up a new clinical center in your workspace.</p>
      </DialogHeader>

      <div class="space-y-5 py-2">

        <!-- Center name -->
        <div>
          <Label class="mb-1.5 block text-xs font-medium text-foreground">
            Centre name <span class="text-rose-500">*</span>
          </Label>
          <Input
            v-model="centerForm.name"
            placeholder="e.g. MindCare Clinics"
            :class="centerErrors.name ? 'border-destructive focus-visible:ring-destructive/30' : ''"
            @input="centerErrors.name = ''"
          />
          <p v-if="centerErrors.name" class="text-xs text-destructive mt-1">{{ centerErrors.name }}</p>
        </div>

        <!-- Specialty -->
        <div>
          <Label class="mb-1.5 block text-xs font-medium text-foreground">
            Specialty <span class="text-rose-500">*</span>
          </Label>
          <Select v-model="centerForm.specialty" @update:model-value="centerErrors.specialty = ''">
            <SelectTrigger :class="centerErrors.specialty ? 'border-destructive' : ''">
              <SelectValue placeholder="Please select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="s in SPECIALTIES" :key="s" :value="s">{{ s }}</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="centerErrors.specialty" class="text-xs text-destructive mt-1">{{ centerErrors.specialty }}</p>
        </div>

        <!-- Team size -->
        <div>
          <Label class="mb-2 block text-xs font-medium text-foreground">
            How many clinicians do you work with? <span class="text-rose-500">*</span>
          </Label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="size in TEAM_SIZES"
              :key="size"
              type="button"
              class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95"
              :class="centerForm.teamSize === size
                ? 'bg-primary text-primary-foreground border border-primary shadow-sm'
                : 'border border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30'"
              @click="centerForm.teamSize = size; centerErrors.teamSize = ''"
            >
              {{ size }}
            </button>
          </div>
          <p v-if="centerErrors.teamSize" class="text-xs text-destructive mt-1">{{ centerErrors.teamSize }}</p>
        </div>

        <!-- Role -->
        <div>
          <Label class="mb-1.5 block text-xs font-medium text-foreground">
            What is your role within this centre? <span class="text-rose-500">*</span>
          </Label>
          <Select v-model="centerForm.role" @update:model-value="centerErrors.role = ''">
            <SelectTrigger :class="centerErrors.role ? 'border-destructive' : ''">
              <SelectValue placeholder="Please select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="r in ROLES" :key="r" :value="r">{{ r }}</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="centerErrors.role" class="text-xs text-destructive mt-1">{{ centerErrors.role }}</p>
        </div>

      </div>

      <DialogFooter class="mt-2">
        <Button variant="outline" size="sm" @click="showAddCenter = false">Cancel</Button>
        <Button size="sm" class="gap-1.5" @click="submitAddCenter">
          Create center <ArrowRight class="w-3.5 h-3.5" />
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

</template>
