import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  notificationsOpen: boolean;
  unreadNotifications: number;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleNotifications: () => void;
  setUnreadNotifications: (count: number) => void;
  decrementUnread: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      notificationsOpen: false,
      unreadNotifications: 0,

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      toggleMobileSidebar: () =>
        set((s) => ({ sidebarMobileOpen: !s.sidebarMobileOpen })),

      closeMobileSidebar: () => set({ sidebarMobileOpen: false }),

      toggleNotifications: () =>
        set((s) => ({ notificationsOpen: !s.notificationsOpen })),

      setUnreadNotifications: (unreadNotifications) =>
        set({ unreadNotifications }),

      decrementUnread: () =>
        set((s) => ({
          unreadNotifications: Math.max(0, s.unreadNotifications - 1),
        })),
    }),
    { name: "UIStore" }
  )
);
