import type { NavItem, UserRole } from "@/types";

// ── Sidebar navigation by role ────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  // ─ Common
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["admin", "doyen", "responsable_evenements", "president_club", "etudiant"],
  },
  // ─ Events
  {
    label: "Événements",
    href: "/dashboard/events",
    icon: "Calendar",
    roles: ["admin", "doyen", "responsable_evenements", "president_club", "etudiant"],
    children: [
      {
        label: "Catalogue",
        href: "/dashboard/events",
        icon: "List",
        roles: ["admin", "doyen", "responsable_evenements", "president_club", "etudiant"],
      },
      {
        label: "Calendrier",
        href: "/dashboard/events/calendar",
        icon: "CalendarDays",
        roles: ["admin", "doyen", "responsable_evenements", "president_club", "etudiant"],
      },
      {
        label: "Créer un événement",
        href: "/dashboard/events/create",
        icon: "Plus",
        roles: ["admin", "responsable_evenements", "president_club"],
      },
      {
        label: "Mes événements",
        href: "/dashboard/events/mine",
        icon: "FolderOpen",
        roles: ["president_club", "responsable_evenements"],
      },
      {
        label: "Vérification événements",
        href: "/dashboard/events/verify",
        icon: "CheckSquare",
        roles: ["responsable_evenements", "doyen"],
      },
      {
        label: "Scanner QR",
        href: "/dashboard/events/check-in",
        icon: "QrCode",
        roles: ["responsable_evenements", "president_club", "admin", "doyen"],
      },
    ],
  },
  // ─ Reservations
  {
    label: "Réservations",
    href: "/dashboard/reservations/approval", // default for admin/doyen; president gets redirected by child
    icon: "BookOpen",
    roles: ["admin", "doyen", "responsable_evenements", "president_club"],
    children: [
      {
        label: "Mes demandes",
        href: "/dashboard/reservations",
        icon: "Clock",
        roles: ["president_club", "responsable_evenements"],
      },
      {
        label: "File d'approbation",
        href: "/dashboard/reservations/approval",
        icon: "CheckSquare",
        roles: ["admin", "doyen"],
      },
      {
        label: "Salles disponibles",
        href: "/dashboard/rooms",
        icon: "Building2",
        roles: ["admin", "doyen", "responsable_evenements", "president_club"],
      },
    ],
  },
  // ─ Analytics
  {
    label: "Analytique",
    href: "/dashboard/analytics",
    icon: "BarChart3",
    roles: ["admin", "doyen", "responsable_evenements"],
  },
  // ─ Registrations (students)
  {
    label: "Mon Agenda",
    href: "/dashboard/my-agenda",
    icon: "CalendarCheck",
    roles: ["etudiant"],
  },
  {
    label: "Mes Inscriptions",
    href: "/dashboard/registrations",
    icon: "Ticket",
    roles: ["etudiant"],
  },
  // ─ Club management (responsable_evenements acts as organizer)
  {
    label: "Gestion Club",
    href: "/dashboard/club/events",
    icon: "FolderOpen",
    roles: ["responsable_evenements", "president_club"],
    children: [
      {
        label: "Mes événements",
        href: "/dashboard/club/events",
        icon: "List",
        roles: ["responsable_evenements", "president_club"],
      },
      {
        label: "Participants",
        href: "/dashboard/club/attendees",
        icon: "Users",
        roles: ["responsable_evenements", "president_club"],
      },
      {
        label: "Rapports",
        href: "/dashboard/club/reports",
        icon: "BookOpen",
        roles: ["responsable_evenements", "president_club"],
      },
    ],
  },
  // ─ Doyen account creation
  {
    label: "Créer un compte",
    href: "/dashboard/doyen/create-account",
    icon: "UserPlus",
    roles: ["doyen"],
  },
  // ─ Admin
  {
    label: "Administration",
    href: "/admin",
    icon: "Settings2",
    roles: ["admin"],
    children: [
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
        label: "Salles",
        href: "/admin/rooms",
        icon: "Building2",
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
    ],
  },
];

// ── App constants ─────────────────────────────────────────────

export const APP_NAME = "UniEvent";
export const APP_TAGLINE = "Gestion des événements universitaires";
export const UNIVERSITY_NAME = "FST Settat";

export const EVENT_CATEGORIES = [
  { value: "conference", label: "Conférence" },
  { value: "atelier", label: "Atelier" },
  { value: "competition", label: "Compétition" },
  { value: "sortie", label: "Sortie" },
  { value: "culturel", label: "Culturel" },
  { value: "sportif", label: "Sportif" },
  { value: "autre", label: "Autre" },
] as const;

export const ROOM_TYPES = [
  { value: "amphitheatre", label: "Amphithéâtre" },
  { value: "salle_conference", label: "Salle de conférence" },
  { value: "salle_informatique", label: "Salle informatique" },
  { value: "espace_exterieur", label: "Espace extérieur" },
  { value: "aula", label: "Aula" },
] as const;

export const RESERVATION_MIN_HOURS = 72; // 3 days minimum
export const MAX_FILE_SIZE_MB = 5;

export const PAGINATION_SIZES = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;
