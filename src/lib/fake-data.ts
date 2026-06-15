// ============================================================
// UNIEVENT — Phase 3 Fake Data
// ============================================================

import type { Notification, NotificationType } from "@/types";

// ── Dashboard Stats ───────────────────────────────────────────

export const FAKE_STATS = {
  totalEvents: 142,
  eventsThisMonth: 18,
  totalRegistrations: 3_847,
  activeClubs: 24,
  pendingReservations: 7,
  avgFillRate: 73,
  avgRating: 4.3,
};

// ── Monthly Events Chart ──────────────────────────────────────

export const MONTHLY_EVENTS_DATA = [
  { month: "Sep", events: 8, registrations: 312 },
  { month: "Oct", events: 14, registrations: 589 },
  { month: "Nov", events: 11, registrations: 421 },
  { month: "Déc", events: 6, registrations: 198 },
  { month: "Jan", events: 9, registrations: 356 },
  { month: "Fév", events: 16, registrations: 674 },
  { month: "Mar", events: 21, registrations: 892 },
  { month: "Avr", events: 18, registrations: 745 },
  { month: "Mai", events: 13, registrations: 501 },
];

// ── Events by Category ────────────────────────────────────────

export const CATEGORY_DATA = [
  { name: "Conférence", value: 38, color: "hsl(232 84% 55%)" },
  { name: "Atelier", value: 27, color: "hsl(199 89% 48%)" },
  { name: "Compétition", value: 21, color: "hsl(43 96% 56%)" },
  { name: "Culturel", value: 18, color: "hsl(142 71% 45%)" },
  { name: "Sportif", value: 15, color: "hsl(258 90% 66%)" },
  { name: "Autre", value: 9, color: "hsl(0 84% 60%)" },
];

// ── Fill Rate Trend ───────────────────────────────────────────

export const FILL_RATE_DATA = [
  { month: "Sep", taux: 58 },
  { month: "Oct", taux: 64 },
  { month: "Nov", taux: 61 },
  { month: "Déc", taux: 55 },
  { month: "Jan", taux: 67 },
  { month: "Fév", taux: 72 },
  { month: "Mar", taux: 79 },
  { month: "Avr", taux: 76 },
  { month: "Mai", taux: 73 },
];

// ── Recent Events ─────────────────────────────────────────────

export const RECENT_EVENTS = [
  {
    id: "1",
    title: "Hackathon IA & Machine Learning 2025",
    category: "competition" as const,
    status: "approved" as const,
    date: "2025-05-28",
    registrations: 120,
    capacity: 150,
    club: "Club Tech FST",
  },
  {
    id: "2",
    title: "Conférence Web3 & Blockchain",
    category: "conference" as const,
    status: "pending" as const,
    date: "2025-06-03",
    registrations: 68,
    capacity: 200,
    club: "Club Informatique",
  },
  {
    id: "3",
    title: "Atelier Python pour débutants",
    category: "atelier" as const,
    status: "approved" as const,
    date: "2025-06-10",
    registrations: 30,
    capacity: 30,
    club: "Club Développement",
  },
  {
    id: "4",
    title: "Tournoi Football Inter-Filières",
    category: "sportif" as const,
    status: "approved" as const,
    date: "2025-06-15",
    registrations: 88,
    capacity: 100,
    club: "Club Sportif FST",
  },
  {
    id: "5",
    title: "Soirée Théâtre & Arts de Scène",
    category: "culturel" as const,
    status: "draft" as const,
    date: "2025-06-20",
    registrations: 0,
    capacity: 180,
    club: "Club Culturel",
  },
];

// ── Activity Feed ─────────────────────────────────────────────

export const ACTIVITY_FEED = [
  {
    id: "a1",
    type: "event_approved" as NotificationType,
    message: "« Hackathon IA 2025 » a été approuvé par le Doyen",
    time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    actor: "Doyen Khalid Benali",
  },
  {
    id: "a2",
    type: "new_registration" as NotificationType,
    message: "12 nouvelles inscriptions pour « Conférence Web3 »",
    time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actor: null,
  },
  {
    id: "a3",
    type: "reservation_approved" as NotificationType,
    message: "Réservation salle Amphi A validée pour le 28 mai",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actor: "Responsable Salles",
  },
  {
    id: "a4",
    type: "event_reminder" as NotificationType,
    message: "Rappel : Atelier Python dans 3 jours — Salle B201",
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actor: null,
  },
  {
    id: "a5",
    type: "event_rejected" as NotificationType,
    message: "« Festival Musique » refusé — budget insuffisant",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    actor: "Doyen Khalid Benali",
  },
];

// ── Top Clubs ─────────────────────────────────────────────────

export const TOP_CLUBS = [
  { id: "1", name: "Club Tech FST", events: 28, members: 145, rating: 4.7, color: "from-brand-400 to-brand-600" },
  { id: "2", name: "Club Informatique", events: 22, members: 98, rating: 4.5, color: "from-cyan-400 to-cyan-600" },
  { id: "3", name: "Club Culturel", events: 19, members: 210, rating: 4.4, color: "from-amber-400 to-amber-600" },
  { id: "4", name: "Club Sportif FST", events: 17, members: 189, rating: 4.2, color: "from-emerald-400 to-emerald-600" },
  { id: "5", name: "Club Développement", events: 14, members: 76, rating: 4.6, color: "from-purple-400 to-purple-600" },
];

// ── Notifications (full list) ─────────────────────────────────

export const ALL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "event_approved",
    title: "Événement approuvé",
    message: "Votre événement « Hackathon IA & Machine Learning 2025 » a été approuvé par le Doyen Khalid Benali. Il sera visible dans le catalogue.",
    isRead: false,
    relatedEventId: "1",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "n2",
    type: "new_registration",
    title: "Nouvelles inscriptions",
    message: "12 nouveaux participants se sont inscrits à votre conférence « Web3 & Blockchain ». Capacité actuelle : 68/200.",
    isRead: false,
    relatedEventId: "2",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "n3",
    type: "reservation_approved",
    title: "Réservation validée",
    message: "La réservation de l'Amphithéâtre A pour le Hackathon IA le 28 mai a été approuvée.",
    isRead: false,
    relatedEventId: "1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "n4",
    type: "event_reminder",
    title: "Rappel événement",
    message: "L'Atelier Python pour débutants a lieu dans 3 jours — Salle B201. 30 participants inscrits.",
    isRead: true,
    relatedEventId: "3",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "n5",
    type: "event_rejected",
    title: "Événement refusé",
    message: "Votre événement « Festival de Musique » a été refusé. Motif : budget insuffisant. Vous pouvez soumettre une nouvelle version.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "n6",
    type: "system",
    title: "Mise à jour système",
    message: "UniEvent v2.1 est disponible. Nouvelles fonctionnalités : calendrier interactif, exports PDF, notifications push.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "n7",
    type: "new_registration",
    title: "Inscription confirmée",
    message: "Vous êtes bien inscrit au Tournoi Football Inter-Filières du 15 juin. Votre QR code est disponible.",
    isRead: true,
    relatedEventId: "4",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];
