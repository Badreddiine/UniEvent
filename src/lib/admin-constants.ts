// ============================================================
// UNIEVENT — Phase 4A Admin Constants
// ============================================================

import type { NavItem } from "@/types";

// ── Admin Navigation ──────────────────────────────────────────

// Menu réduit aux pages réellement existantes (sous-liens cassés retirés :
// /admin/users/roles, /admin/users/invitations, /admin/clubs/requests,
// /admin/events/approvals, /admin/events/calendar, /admin/rooms/reservations,
// /admin/rooms/planning, /admin/settings/notifications, /security, /integrations).
export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Vue d'ensemble",
    href: "/admin",
    icon: "LayoutDashboard",
    roles: ["admin"],
  },
  {
    label: "Utilisateurs",
    href: "/admin/users",
    icon: "Users",
    roles: ["admin"],
  },
  {
    label: "Événements",
    href: "/admin/events",
    icon: "Calendar",
    roles: ["admin"],
  },
  {
    label: "Clubs",
    href: "/admin/clubs",
    icon: "BookOpen",
    roles: ["admin"],
  },
  {
    label: "Salles",
    href: "/admin/rooms",
    icon: "Building2",
    roles: ["admin"],
  },
  {
    label: "Analytique",
    href: "/admin/analytics",
    icon: "BarChart3",
    roles: ["admin"],
  },
  {
    label: "Partenaires",
    href: "/admin/partners",
    icon: "GraduationCap",
    roles: ["admin"],
  },
  {
    label: "Paramètres",
    href: "/admin/settings",
    icon: "SlidersHorizontal",
    roles: ["admin"],
  },
];

// ── Breadcrumb label map ──────────────────────────────────────

export const ADMIN_BREADCRUMB_LABELS: Record<string, string> = {
  admin: "Administration",
  users: "Utilisateurs",
  partners: "Partenaires",
  roles: "Rôles & permissions",
  invitations: "Invitations",
  clubs: "Clubs",
  requests: "Demandes",
  events: "Événements",
  approvals: "File d'approbation",
  calendar: "Calendrier",
  rooms: "Salles",
  reservations: "Réservations",
  planning: "Planning",
  analytics: "Analytique",
  settings: "Paramètres",
  notifications: "Notifications",
  security: "Sécurité",
  integrations: "Intégrations",
};
