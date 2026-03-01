import type { InjectionKey, Ref, ComputedRef } from 'vue'
import { inject } from 'vue'

export { default as SidebarProvider } from './SidebarProvider.vue'
export { default as Sidebar } from './Sidebar.vue'
export { default as SidebarHeader } from './SidebarHeader.vue'
export { default as SidebarContent } from './SidebarContent.vue'
export { default as SidebarFooter } from './SidebarFooter.vue'
export { default as SidebarGroup } from './SidebarGroup.vue'
export { default as SidebarGroupLabel } from './SidebarGroupLabel.vue'
export { default as SidebarGroupContent } from './SidebarGroupContent.vue'
export { default as SidebarMenu } from './SidebarMenu.vue'
export { default as SidebarMenuItem } from './SidebarMenuItem.vue'
export { default as SidebarMenuButton } from './SidebarMenuButton.vue'
export { default as SidebarMenuBadge } from './SidebarMenuBadge.vue'
export { default as SidebarSeparator } from './SidebarSeparator.vue'
export { default as SidebarTrigger } from './SidebarTrigger.vue'
export { default as SidebarInset } from './SidebarInset.vue'

export interface SidebarContext {
  open: Ref<boolean>
  mobileOpen: Ref<boolean>
  isMobile: Ref<boolean>
  toggleSidebar: () => void
  state: ComputedRef<'expanded' | 'collapsed'>
}

export const SIDEBAR_KEY: InjectionKey<SidebarContext> = Symbol('sidebar')

export function useSidebar(): SidebarContext {
  const ctx = inject(SIDEBAR_KEY)
  if (!ctx) throw new Error('useSidebar() must be used within SidebarProvider')
  return ctx
}
