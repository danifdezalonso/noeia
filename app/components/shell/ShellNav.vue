<script setup lang="ts">
import {
  LayoutDashboard, Calendar, ClipboardList, Users,
  MessageSquare, Receipt, Sparkles, Settings,
  Sun, Moon, Stethoscope, Building2, ChevronDown,
  User, LogOut, LayoutTemplate, Globe, CalendarClock, FlaskConical,
  PanelLeft, PanelLeftClose, ListTodo, Check, Plus, ArrowRight, Mail,
  ChevronsUpDown, CheckCircle2, XCircle, Loader2,
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
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '~/components/ui/command'
import { TEAM_SIZES, SPECIALTIES, ROLES } from '~/composables/useOnboardingForm'

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
  { id: 1, name: 'MindCare Clinics', active: true, role: 'Owner' },
])

const activeOrg = computed(() => orgs.value.find(o => o.active) ?? orgs.value[0])

function switchOrg(id: number) {
  orgs.value.forEach(o => { o.active = o.id === id })
}

// ── Pending invitations (TODO: wire to backend) ───────────────────────────────

const pendingInvitations = ref([
  { id: 1, org: 'Centro Neuro Madrid',    role: 'Psychologist', invitedBy: 'Admin Office',  date: 'Apr 15, 2026', status: 'pending'  as 'pending' | 'accepted' | 'declined' },
  { id: 2, org: 'Salud Mental Barcelona', role: 'Doctor',       invitedBy: 'Dr. Marc Puig', date: 'Apr 10, 2026', status: 'pending'  as 'pending' | 'accepted' | 'declined' },
])

const visibleInvitations = computed(() =>
  pendingInvitations.value.filter(i => i.status !== 'declined'),
)
const pendingCount = computed(() =>
  pendingInvitations.value.filter(i => i.status === 'pending').length,
)

function acceptInvitation(id: number) {
  const inv = pendingInvitations.value.find(i => i.id === id)!
  inv.status = 'accepted'
  const newId = Math.max(...orgs.value.map(o => o.id)) + 1
  orgs.value.forEach(o => { o.active = false })
  orgs.value.push({ id: newId, name: inv.org, active: true, role: inv.role })
  showAddOrg.value = false
  // TODO: create Membership record, invalidate org cache, toast
}

function declineInvitation(id: number) {
  pendingInvitations.value.find(i => i.id === id)!.status = 'declined'
  // TODO: call decline endpoint
}

// ── Add organization modal ────────────────────────────────────────────────────

const showAddOrg = ref(false)
const modalMode  = ref<'invitations' | 'create'>('create')

const orgForm   = reactive({ name: '', specialty: [] as string[], teamSize: '', role: '' })
const orgErrors = reactive({ name: '', specialty: '', teamSize: '', role: '' })

// Slug preview
const TAKEN_SLUGS = ['mindcare-clinics', 'salud-mental-bcn', 'noeia', 'demo']
function toSlug(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
const orgSlug   = ref('')
const slugState = ref<'idle' | 'checking' | 'available' | 'taken'>('idle')
let slugTimer: ReturnType<typeof setTimeout> | null = null
watch(() => orgForm.name, name => { orgSlug.value = toSlug(name) })
watch(orgSlug, (slug) => {
  if (slugTimer) clearTimeout(slugTimer)
  if (!slug) { slugState.value = 'idle'; return }
  slugState.value = 'checking'
  slugTimer = setTimeout(() => {
    slugState.value = TAKEN_SLUGS.includes(slug) ? 'taken' : 'available'
  }, 600)
})

// Specialty combobox
const specialtyOpen = ref(false)
function toggleOrgSpecialty(s: string) {
  const idx = orgForm.specialty.indexOf(s)
  if (idx === -1) orgForm.specialty.push(s)
  else orgForm.specialty.splice(idx, 1)
  orgErrors.specialty = ''
}

function openInvitations() {
  showAddOrg.value = true
  modalMode.value  = 'invitations'
}

function openAddOrg() {
  Object.assign(orgForm, { name: '', specialty: [], teamSize: '', role: '' })
  Object.assign(orgErrors, { name: '', specialty: '', teamSize: '', role: '' })
  orgSlug.value   = ''
  slugState.value = 'idle'
  specialtyOpen.value = false
  showAddOrg.value = true
  modalMode.value  = 'create'
}

// ── Add account modal ─────────────────────────────────────────────────────────

const showAddAccount = ref(false)

function submitCreateOrg() {
  orgErrors.name      = orgForm.name.trim().length >= 2 ? '' : 'Name must be at least 2 characters'
  orgErrors.specialty = orgForm.specialty.length ? '' : 'Required'
  orgErrors.teamSize  = orgForm.teamSize ? '' : 'Please select a size'
  orgErrors.role      = orgForm.role ? '' : 'Please select a role'
  if (orgErrors.name || orgErrors.specialty || orgErrors.teamSize || orgErrors.role) return

  const newId = Math.max(...orgs.value.map(o => o.id)) + 1
  orgs.value.forEach(o => { o.active = false })
  orgs.value.push({ id: newId, name: orgForm.name.trim(), active: true, role: 'Owner' })
  showAddOrg.value = false
  const welcomeCenter = useState<string>('welcome-center', () => '')
  welcomeCenter.value = orgForm.name.trim()
  // TODO: create Organization + Membership(OWNER) + start trial, toast "[Org name] is ready. Welcome!"
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

      <!-- ── Organization switcher ── -->
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
          <DropdownMenuContent side="bottom" align="start" class="w-60">

            <!-- Account header -->
            <div class="flex items-center gap-2 px-2 py-1.5">
              <Avatar class="w-5 h-5 shrink-0">
                <AvatarFallback class="text-[9px] font-bold bg-primary/10 text-primary">
                  {{ persona.name?.charAt(0) ?? '?' }}
                </AvatarFallback>
              </Avatar>
              <p class="text-[11px] text-muted-foreground truncate">{{ persona.email ?? 'torres@mindcare.com' }}</p>
            </div>

            <DropdownMenuSeparator />

            <!-- Organizations list -->
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

            <!-- Pending invitations (only if any) -->
            <DropdownMenuItem v-if="pendingCount" class="gap-2.5 cursor-pointer" @click="openInvitations">
              <Mail class="w-3.5 h-3.5" />
              <span class="text-sm flex-1">Pending invitations</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground leading-none">
                {{ pendingCount }}
              </span>
            </DropdownMenuItem>

            <!-- Create organization -->
            <DropdownMenuItem class="gap-2.5 cursor-pointer" @click="openAddOrg">
              <Plus class="w-3.5 h-3.5" />
              <span class="text-sm">Create organization</span>
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

  <!-- ── Modals ────────────────────────────────────────────────────────────── -->
  <Dialog v-model:open="showAddOrg">
    <DialogContent class="max-w-md">

      <!-- ── Invitations mode ── -->
      <template v-if="modalMode === 'invitations'">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold">You've been invited</DialogTitle>
          <p class="text-sm text-muted-foreground mt-1">
            {{ visibleInvitations.length }} organization{{ visibleInvitations.length !== 1 ? 's have' : ' has' }} invited you to join their workspace.
          </p>
        </DialogHeader>

        <div class="space-y-3 pt-1">
          <div
            v-for="inv in visibleInvitations"
            :key="inv.id"
            class="rounded-xl border p-4 transition-all"
            :class="inv.status === 'accepted'
              ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-900/10'
              : 'border-border bg-background'"
          >
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 text-sm font-bold text-muted-foreground">
                {{ inv.org[0] }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <p class="text-sm font-semibold text-foreground truncate">{{ inv.org }}</p>
                  <span v-if="inv.status === 'accepted'" class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 shrink-0">Joined</span>
                </div>
                <p class="text-xs text-muted-foreground mb-0.5">{{ inv.role }}</p>
                <p class="text-[11px] text-muted-foreground/70">Invited by {{ inv.invitedBy }} · {{ inv.date }}</p>
              </div>
            </div>

            <div v-if="inv.status === 'pending'" class="flex gap-2 mt-3">
              <Button size="sm" class="flex-1 h-8 text-xs" @click="acceptInvitation(inv.id)">
                Accept &amp; join
              </Button>
              <Button size="sm" variant="outline" class="h-8 text-xs px-3" @click="declineInvitation(inv.id)">
                Decline
              </Button>
            </div>
            <Button v-else size="sm" variant="ghost" class="w-full h-8 text-xs mt-3 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" @click="showAddOrg = false; navigateTo('/doctor/dashboard')">
              Go to workspace →
            </Button>
          </div>
        </div>

        <DialogFooter class="mt-2">
          <Button variant="outline" size="sm" @click="showAddOrg = false">Close</Button>
        </DialogFooter>
      </template>

      <!-- ── Create organization mode ── -->
      <template v-else>
        <DialogHeader>
          <DialogTitle class="text-xl font-bold">Create an organization</DialogTitle>
          <p class="text-sm text-muted-foreground mt-1">Set up a new workspace for your practice or clinic.</p>
        </DialogHeader>

        <div class="space-y-4 py-1">

          <!-- Organization name + slug preview -->
          <div>
            <Label class="mb-1.5 block text-xs font-medium text-foreground">
              Organization name <span class="text-destructive">*</span>
            </Label>
            <Input
              v-model="orgForm.name"
              placeholder="e.g. MindCare Clinics"
              :class="orgErrors.name ? 'border-destructive focus-visible:ring-destructive/30' : ''"
              @input="orgErrors.name = ''"
            />
            <p v-if="orgErrors.name" class="text-xs text-destructive mt-1">{{ orgErrors.name }}</p>
            <p v-else class="text-xs text-muted-foreground mt-1">Working solo? Your professional name works too.</p>
          </div>

          <!-- Workspace URL -->
          <div>
            <Label class="mb-1.5 block text-xs font-medium text-foreground">Workspace URL</Label>
            <div
              class="flex items-center overflow-hidden rounded-lg border h-9 transition-colors"
              :class="slugState === 'taken'
                ? 'border-destructive/50'
                : slugState === 'available'
                  ? 'border-emerald-400/50'
                  : 'border-input'"
            >
              <span class="flex items-center px-2.5 h-full text-xs text-muted-foreground bg-muted border-r border-input whitespace-nowrap shrink-0">noeia.app/</span>
              <input
                v-model="orgSlug"
                placeholder="your-org"
                class="flex-1 h-full px-2.5 text-sm outline-none bg-transparent font-[inherit]"
              />
              <span class="flex items-center gap-1 pr-2 shrink-0">
                <Loader2 v-if="slugState === 'checking'" class="w-3 h-3 animate-spin text-muted-foreground" />
                <CheckCircle2 v-else-if="slugState === 'available'" class="w-3 h-3 text-emerald-500" />
                <XCircle v-else-if="slugState === 'taken'" class="w-3 h-3 text-destructive" />
              </span>
            </div>
            <p
              v-if="slugState === 'available' || slugState === 'taken'"
              class="text-[11px] mt-1"
              :class="slugState === 'taken' ? 'text-destructive' : 'text-emerald-600'"
            >{{ slugState === 'available' ? 'Available' : 'Already taken — try a different URL' }}</p>
          </div>

          <!-- Specialty multi-select combobox -->
          <div>
            <Label class="mb-1.5 block text-xs font-medium text-foreground">
              Specialty <span class="text-destructive">*</span>
            </Label>
            <Popover v-model:open="specialtyOpen">
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  role="combobox"
                  :aria-expanded="specialtyOpen"
                  class="w-full min-h-9 h-auto justify-between font-normal text-sm"
                  :class="orgErrors.specialty ? 'border-destructive' : ''"
                >
                  <div class="flex flex-wrap gap-1 flex-1 text-left">
                    <span
                      v-for="s in orgForm.specialty"
                      :key="s"
                      class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary"
                      @click.stop="toggleOrgSpecialty(s)"
                    >
                      {{ s }}<span class="opacity-50 hover:opacity-100">×</span>
                    </span>
                    <span v-if="!orgForm.specialty.length" class="text-muted-foreground text-xs">Please select</span>
                  </div>
                  <ChevronsUpDown class="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-full p-0" align="start" style="width: var(--radix-popover-trigger-width);">
                <Command>
                  <CommandInput placeholder="Search specialties…" />
                  <CommandEmpty>No specialties found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        v-for="s in SPECIALTIES"
                        :key="s"
                        :value="s"
                        @select="toggleOrgSpecialty(s)"
                      >
                        <Check class="mr-2 h-4 w-4" :class="orgForm.specialty.includes(s) ? 'opacity-100' : 'opacity-0'" />
                        {{ s }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p v-if="orgErrors.specialty" class="text-xs text-destructive mt-1">{{ orgErrors.specialty }}</p>
          </div>

          <!-- Team size -->
          <div>
            <Label class="mb-2 block text-xs font-medium text-foreground">
              How many clinicians do you work with? <span class="text-destructive">*</span>
            </Label>
            <div role="radiogroup" class="flex gap-1.5 flex-wrap">
              <button
                v-for="size in TEAM_SIZES"
                :key="size"
                type="button"
                role="radio"
                :aria-checked="orgForm.teamSize === size"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                :class="orgForm.teamSize === size
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30'"
                @click="orgForm.teamSize = size; orgErrors.teamSize = ''"
              >
                {{ size }}
              </button>
            </div>
            <p v-if="orgErrors.teamSize" class="text-xs text-destructive mt-1.5">{{ orgErrors.teamSize }}</p>
          </div>

          <!-- Role -->
          <div>
            <Label class="mb-1.5 block text-xs font-medium text-foreground">
              Your role <span class="text-destructive">*</span>
            </Label>
            <Select v-model="orgForm.role" @update:model-value="orgErrors.role = ''">
              <SelectTrigger :class="orgErrors.role ? 'border-destructive' : ''">
                <SelectValue placeholder="Please select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in ROLES" :key="r" :value="r">{{ r }}</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="orgErrors.role" class="text-xs text-destructive mt-1">{{ orgErrors.role }}</p>
          </div>

        </div>

        <DialogFooter class="mt-2">
          <Button variant="outline" size="sm" @click="showAddOrg = false">Cancel</Button>
          <Button size="sm" class="gap-1.5" @click="submitCreateOrg">
            Create organization <ArrowRight class="w-3.5 h-3.5" />
          </Button>
        </DialogFooter>
      </template>

    </DialogContent>
  </Dialog>

  <!-- ── Add account modal ────────────────────────────────────────────────── -->
  <Dialog v-model:open="showAddAccount">
    <DialogContent class="max-w-sm">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold">Add another account</DialogTitle>
        <p class="text-sm text-muted-foreground mt-1">Sign in with a different Google account to switch between profiles.</p>
      </DialogHeader>
      <div class="py-2">
        <button
          class="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-background hover:bg-accent transition-colors"
          style="height: 44px; font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer;"
          @click="showAddAccount = false"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.38 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.88-13.45-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </DialogContent>
  </Dialog>

</template>
