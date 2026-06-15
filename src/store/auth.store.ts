import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;

  // Helpers
  hasRole: (role: UserRole | UserRole[]) => boolean;
  canApproveReservations: () => boolean;
  canCreateEvents: () => boolean;
  canManageUsers: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,

        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setToken: (token) => set({ token }),

        login: (user, token) =>
          set({ user, token, isAuthenticated: true, isLoading: false }),

        logout: () =>
          set({ user: null, token: null, isAuthenticated: false }),

        setLoading: (isLoading) => set({ isLoading }),

        hasRole: (role) => {
          const { user } = get();
          if (!user) return false;
          const roles = Array.isArray(role) ? role : [role];
          return roles.includes(user.role);
        },

        canApproveReservations: () => {
          const { user } = get();
          return user?.role === "admin" || user?.role === "doyen";
        },

        canCreateEvents: () => {
          const { user } = get();
          return (
            user?.role === "admin" ||
            user?.role === "responsable_evenements" ||
            user?.role === "president_club"
          );
        },

        canManageUsers: () => {
          const { user } = get();
          return user?.role === "admin";
        },
      }),
      {
        name: "unievent-auth",
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: "AuthStore" }
  )
);
