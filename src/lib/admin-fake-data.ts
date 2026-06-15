// ============================================================
// UNIEVENT — Phase 4A Admin Fake Data
// ============================================================

// ── Admin KPI Stats ───────────────────────────────────────────

export const ADMIN_STATS = {
  totalUsers: 1_284,
  usersGrowthPct: 12.4,
  totalEvents: 312,
  eventsGrowthPct: 8.7,
  totalClubs: 34,
  clubsGrowthPct: 5.9,
  pendingApprovals: 14,
  approvalsUrgent: 3,
  totalRooms: 28,
  roomsAvailable: 21,
  systemHealth: 99.2,
  totalRevenue: 0, // free university events
};

// ── User Growth by Month ──────────────────────────────────────

export const ADMIN_USER_GROWTH = [
  { month: "Sep", students: 180, staff: 12, clubs: 2 },
  { month: "Oct", students: 320, staff: 18, clubs: 4 },
  { month: "Nov", students: 280, staff: 15, clubs: 3 },
  { month: "Déc", students: 120, staff: 8, clubs: 1 },
  { month: "Jan", students: 390, staff: 22, clubs: 5 },
  { month: "Fév", students: 450, staff: 25, clubs: 6 },
  { month: "Mar", students: 520, staff: 30, clubs: 7 },
  { month: "Avr", students: 480, staff: 28, clubs: 6 },
  { month: "Mai", students: 410, staff: 24, clubs: 5 },
];

// ── Event Approval Pipeline ───────────────────────────────────

export const APPROVAL_PIPELINE = [
  { stage: "Brouillons", count: 24, color: "hsl(220 9% 60%)" },
  { stage: "Soumis", count: 14, color: "hsl(43 96% 56%)" },
  { stage: "Vérifiés", count: 9, color: "hsl(199 89% 48%)" },
  { stage: "En attente", count: 6, color: "hsl(258 90% 66%)" },
  { stage: "Approuvés", count: 52, color: "hsl(142 71% 45%)" },
  { stage: "Rejetés", count: 8, color: "hsl(0 84% 60%)" },
];

// ── Platform Usage by Role ────────────────────────────────────

export const ROLE_DISTRIBUTION = [
  { name: "Étudiants", value: 1124, color: "hsl(232 84% 55%)" },
  { name: "Présidents club", value: 68, color: "hsl(199 89% 48%)" },
  { name: "Resp. événements", value: 52, color: "hsl(43 96% 56%)" },
  { name: "Doyens", value: 28, color: "hsl(142 71% 45%)" },
  { name: "Admins", value: 12, color: "hsl(258 90% 66%)" },
];

// ── Room Occupancy ────────────────────────────────────────────

export const ROOM_OCCUPANCY = [
  { room: "Amphi A", occupancy: 89 },
  { room: "Amphi B", occupancy: 74 },
  { room: "Salle 101", occupancy: 61 },
  { room: "Salle 202", occupancy: 55 },
  { room: "Aula", occupancy: 92 },
  { room: "Ext. Nord", occupancy: 38 },
  { room: "Salle Info", occupancy: 77 },
];

// ── Recent Admin Activity ─────────────────────────────────────

export type AdminActivityType =
  | "user_created"
  | "event_approved"
  | "event_rejected"
  | "club_created"
  | "room_updated"
  | "system_alert"
  | "user_banned"
  | "reservation_approved";

export interface AdminActivity {
  id: string;
  type: AdminActivityType;
  actor: string;
  target: string;
  timestamp: string;
  severity?: "info" | "warning" | "error" | "success";
}

export const ADMIN_ACTIVITY: AdminActivity[] = [
  {
    id: "1",
    type: "event_approved",
    actor: "Admin Système",
    target: "Hackathon IA 2025",
    timestamp: "2025-05-06T09:42:00Z",
    severity: "success",
  },
  {
    id: "2",
    type: "user_created",
    actor: "Inscription automatique",
    target: "Yasmine Benali (etudiant)",
    timestamp: "2025-05-06T09:15:00Z",
    severity: "info",
  },
  {
    id: "3",
    type: "club_created",
    actor: "Admin Mohammed Fassi",
    target: "Club Robotique FST",
    timestamp: "2025-05-06T08:58:00Z",
    severity: "info",
  },
  {
    id: "4",
    type: "event_rejected",
    actor: "Doyen Alaoui",
    target: "Sortie culturelle Marrakech",
    timestamp: "2025-05-05T17:30:00Z",
    severity: "error",
  },
  {
    id: "5",
    type: "system_alert",
    actor: "Système",
    target: "Backup base de données réussi",
    timestamp: "2025-05-05T03:00:00Z",
    severity: "info",
  },
  {
    id: "6",
    type: "reservation_approved",
    actor: "Resp. Salles Rachidi",
    target: "Amphithéâtre A — 15 Mai",
    timestamp: "2025-05-05T16:10:00Z",
    severity: "success",
  },
  {
    id: "7",
    type: "room_updated",
    actor: "Admin Système",
    target: "Salle 202 → Maintenance",
    timestamp: "2025-05-05T14:00:00Z",
    severity: "warning",
  },
  {
    id: "8",
    type: "user_banned",
    actor: "Admin Mohammed Fassi",
    target: "Compte suspect #1047",
    timestamp: "2025-05-04T11:25:00Z",
    severity: "error",
  },
];

// ── Pending Approval Items ────────────────────────────────────

export interface PendingItem {
  id: string;
  title: string;
  type: "event" | "reservation" | "club";
  submittedBy: string;
  submittedAt: string;
  isUrgent: boolean;
  category?: string;
}

export const PENDING_ITEMS: PendingItem[] = [
  {
    id: "p1",
    title: "Conférence Intelligence Artificielle & Éducation",
    type: "event",
    submittedBy: "Club Tech FST",
    submittedAt: "2025-05-06T07:00:00Z",
    isUrgent: true,
    category: "conference",
  },
  {
    id: "p2",
    title: "Réservation Amphi B — 20 Mai 2025",
    type: "reservation",
    submittedBy: "Club Informatique",
    submittedAt: "2025-05-05T15:30:00Z",
    isUrgent: true,
    category: undefined,
  },
  {
    id: "p3",
    title: "Atelier Développement Web React",
    type: "event",
    submittedBy: "Club Dev FST",
    submittedAt: "2025-05-05T11:00:00Z",
    isUrgent: false,
    category: "atelier",
  },
  {
    id: "p4",
    title: "Nouveau club — Club FinTech Settat",
    type: "club",
    submittedBy: "Karim Mansouri",
    submittedAt: "2025-05-04T14:20:00Z",
    isUrgent: false,
  },
  {
    id: "p5",
    title: "Compétition de Programmation Nationale",
    type: "event",
    submittedBy: "Club Informatique",
    submittedAt: "2025-05-04T09:45:00Z",
    isUrgent: true,
    category: "competition",
  },
];

// ── Top Active Users ──────────────────────────────────────────

export const TOP_USERS = [
  { name: "Amina Tazi", role: "president_club", events: 12, club: "Club Tech FST" },
  { name: "Omar Benkirane", role: "president_club", events: 9, club: "Club Informatique" },
  { name: "Fatima Zahra El Idrissi", role: "responsable_evenements", events: 7, club: "—" },
  { name: "Youssef Alami", role: "president_club", events: 6, club: "Club Robotique" },
  { name: "Nour El Houda", role: "president_club", events: 5, club: "Club FinTech" },
];

// ── System Stats ──────────────────────────────────────────────

export const SYSTEM_METRICS = [
  { label: "Uptime", value: "99.2%", status: "good" as const },
  { label: "Latence API", value: "42ms", status: "good" as const },
  { label: "Stockage", value: "68%", status: "warning" as const },
  { label: "Sessions actives", value: "147", status: "good" as const },
];
