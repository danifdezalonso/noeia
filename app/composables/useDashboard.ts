import type { InjectionKey } from 'vue'

export interface NavItem {
  id: string
  label: string
  path: string
  icon: string
  badge?: number
}

export interface DashboardShell {
  sidebarOpen: Ref<boolean>
  mobileNavOpen: Ref<boolean>
  addModalOpen: Ref<boolean>
  orgSelectorOpen: Ref<boolean>
  notificationsOpen: Ref<boolean>
  profileOpen: Ref<boolean>
  navItems: NavItem[]
}

export const SHELL_KEY: InjectionKey<DashboardShell> = Symbol('dashboardShell')

export function createDashboardShell(): DashboardShell {
  const sidebarOpen = ref(true)
  const mobileNavOpen = ref(false)
  const addModalOpen = ref(false)
  const orgSelectorOpen = ref(false)
  const notificationsOpen = ref(false)
  const profileOpen = ref(false)

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard',  path: '/dashboard',          icon: 'LayoutDashboard' },
    { id: 'calendar',  label: 'Calendar',   path: '/dashboard/calendar', icon: 'Calendar' },
    { id: 'sessions',  label: 'Sessions',   path: '/dashboard/sessions', icon: 'ClipboardList', badge: 3 },
    { id: 'patients',  label: 'Patients',   path: '/dashboard/patients', icon: 'Users' },
    { id: 'messages',  label: 'Messages',   path: '/dashboard/messages', icon: 'MessageSquare', badge: 5 },
    { id: 'billing',   label: 'Billing',    path: '/dashboard/billing',  icon: 'Receipt' },
    { id: 'noeia',     label: 'NoeIA',      path: '/dashboard/noeia',    icon: 'Sparkles' },
  ]

  return {
    sidebarOpen,
    mobileNavOpen,
    addModalOpen,
    orgSelectorOpen,
    notificationsOpen,
    profileOpen,
    navItems,
  }
}
