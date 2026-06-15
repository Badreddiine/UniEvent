// ============================================================
// UNIEVENT — Phase 4A Admin Constants
// ============================================================

import type { NavItem } from "@/types";

// ── Admin Navigation ──────────────────────────────────────────

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
    children: [
      {
        label: "Tous les utilisateurs",
        href: "/admin/users",
        icon: "List",
        roles: ["admin"],
      },
      {
        label: "Rôles & permissions",
        href: "/admin/users/roles",
        icon: "ShieldCheck",
        roles: ["admin"],
      },
      {
        label: "Invitations",
        href: "/admin/users/invitations",
        icon: "UserPlus",
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Clubs",
    href: "/admin/clubs",
    icon: "GraduationCap",
    roles: ["admin"],
    children: [
      {
        label: "Tous les clubs",
        href: "/admin/clubs",
        icon: "List",
        roles: ["admin"],
      },
      {
        label: "Demandes création",
        href: "/admin/clubs/requests",
        icon: "Clock",
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Événements",
    href: "/admin/events",
    icon: "Calendar",
    roles: ["admin"],
    children: [
      {
        label: "Tous les événements",
        href: "/admin/events",
        icon: "List",
        roles: ["admin"],
      },
      {
        label: "File d'approbation",
        href: "/admin/events/approvals",
        icon: "CheckSquare",
        roles: ["admin"],
      },
      {
        label: "Calendrier global",
        href: "/admin/events/calendar",
        icon: "CalendarDays",
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Salles",
    href: "/admin/rooms",
    icon: "Building2",
    roles: ["admin"],
    children: [
      {
        label: "Gestion des salles",
        href: "/admin/rooms",
        icon: "List",
        roles: ["admin"],
      },
      {
        label: "Réservations",
        href: "/admin/rooms/reservations",
        icon: "BookOpen",
        roles: ["admin"],
      },
      {
        label: "Planning",
        href: "/admin/rooms/planning",
        icon: "CalendarDays",
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Analytique",
    href: "/admin/analytics",
    icon: "BarChart3",
    roles: ["admin"],
  },
  {
    label: "Paramètres",
    href: "/admin/settings",
    icon: "SlidersHorizontal",
    roles: ["admin"],
    children: [
      {
        label: "Général",
        href: "/admin/settings",
        icon: "Settings",
        roles: ["admin"],
      },
      {
        label: "Notifications",
        href: "/admin/settings/notifications",
        icon: "Bell",
        roles: ["admin"],
      },
      {
        label: "Sécurité",
        href: "/admin/settings/security",
        icon: "ShieldCheck",
        roles: ["admin"],
      },
      {
        label: "Intégrations",
        href: "/admin/settings/integrations",
        icon: "Zap",
        roles: ["admin"],
      },
    ],
  },
];

// ── Breadcrumb label map ──────────────────────────────────────

export const ADMIN_BREADCRUMB_LABELS: Record<string, string> = {
  admin: "Administration",
  users: "Utilisateurs",
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
