import type { InjectionKey, ComputedRef } from 'vue'

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
  navItems: ComputedRef<NavItem[]>
}

export const SHELL_KEY: InjectionKey<DashboardShell> = Symbol('dashboardShell')

export function createDashboardShell(): DashboardShell {
  const sidebarOpen = ref(true)
  const mobileNavOpen = ref(false)
  const addModalOpen = ref(false)
  const orgSelectorOpen = ref(false)
  const notificationsOpen = ref(false)
  const profileOpen = ref(false)

  const route = useRoute()

  const doctorNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard',  path: '/doctor/dashboard',          icon: 'LayoutDashboard' },
    { id: 'calendar',  label: 'Calendar',   path: '/doctor/dashboard/calendar', icon: 'Calendar' },
    { id: 'sessions',  label: 'Sessions',   path: '/doctor/dashboard/sessions', icon: 'ClipboardList', badge: 3 },
    { id: 'patients',  label: 'Patients',   path: '/doctor/dashboard/patients', icon: 'Users' },
    { id: 'messages',  label: 'Messages',   path: '/doctor/dashboard/messages', icon: 'MessageSquare', badge: 5 },
    { id: 'billing',   label: 'Billing',    path: '/doctor/dashboard/billing',  icon: 'Receipt' },
    { id: 'noeia',     label: 'NoeIA',      path: '/doctor/dashboard/noeia',    icon: 'Sparkles' },
  ]

  const orgNavItems: NavItem[] = [
    { id: 'org-dashboard', label: 'Dashboard',   path: '/organization/dashboard',          icon: 'LayoutDashboard' },
    { id: 'org-doctors',   label: 'Doctors',     path: '/organization/dashboard/doctors',  icon: 'Stethoscope' },
    { id: 'org-patients',  label: 'Patients',    path: '/organization/dashboard/patients', icon: 'Users' },
    { id: 'org-calendar',  label: 'Calendar',    path: '/organization/dashboard/calendar', icon: 'Calendar' },
    { id: 'org-messages',  label: 'Messages',    path: '/organization/dashboard/messages', icon: 'MessageSquare' },
    { id: 'org-office',    label: 'Office Mgmt', path: '/organization/dashboard/office',   icon: 'Building2' },
    { id: 'org-billing',   label: 'Billing',     path: '/organization/dashboard/billing',  icon: 'Receipt' },
  ]

  const navItems = computed<NavItem[]>(() =>
    route.path.startsWith('/organization/') ? orgNavItems : doctorNavItems,
  )

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
