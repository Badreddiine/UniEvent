// ============================================================
// UNIEVENT — Phase 5B2: Events CRUD Data & Store
// ============================================================

import type { EventCategory, EventStatus, EventVisibility } from "@/types";

// ── Types ─────────────────────────────────────────────────────

export interface ManagedEvent {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: EventCategory;
  status: EventStatus;
  visibility: EventVisibility;
  startDate: string;
  endDate: string;
  isMultiDay: boolean;
  location: string;
  building: string;
  capacity: number;
  registeredCount: number;
  isFree: boolean;
  price: number;
  coverUrl: string;
  tags: string[];
  speakers: { name: string; role: string }[];
  organizerId: string;
  organizerName: string;
  clubId?: string;
  clubName?: string;
  isHighlight: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  title: string;
  description: string;
  longDescription: string;
  category: EventCategory;
  visibility: EventVisibility;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  building: string;
  capacity: number;
  isFree: boolean;
  price: number;
  coverUrl: string;
  tags: string;
  isHighlight: boolean;
  speakers: { name: string; role: string }[];
}

export interface UserRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventCategory: EventCategory;
  eventStartDate: string;
  eventLocation: string;
  eventCoverUrl: string;
  status: "confirmed" | "waitlist" | "cancelled";
  registeredAt: string;
  qrCode: string;
}

// ── Fake managed events (for president_club / responsable_evenements) ──

const COVERS = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
];

export const MANAGED_EVENTS: ManagedEvent[] = [
  {
    id: "mevt-001",
    title: "Hackathon IA & Machine Learning 2026",
    description: "48h pour créer des solutions innovantes basées sur l'IA et le Machine Learning.",
    longDescription:
      "Un marathon d'innovation intense où les équipes disposent de 48h pour concevoir et implémenter des solutions IA révolutionnaires. Accès aux APIs OpenAI, datasets exclusifs et mentors experts.",
    category: "competition",
    status: "approved",
    visibility: "universite",
    startDate: "2026-06-10T09:00:00",
    endDate: "2026-06-12T09:00:00",
    isMultiDay: true,
    location: "Innovation Lab",
    building: "Bâtiment Tech — Aile Est",
    capacity: 150,
    registeredCount: 112,
    isFree: true,
    price: 0,
    coverUrl: COVERS[0],
    tags: ["IA", "Hackathon", "Machine Learning", "Data"],
    speakers: [
      { name: "Prof. Karim Mansouri", role: "Expert en IA" },
      { name: "Leila Hamdani", role: "CTO TechStartup" },
    ],
    organizerId: "user-current",
    organizerName: "Club Dev & Innovation",
    clubId: "club-1",
    clubName: "Club Dev & Innovation",
    isHighlight: true,
    createdAt: "2026-04-15T10:00:00",
    updatedAt: "2026-05-01T14:30:00",
  },
  {
    id: "mevt-002",
    title: "Atelier React & Next.js",
    description: "Maîtrisez le développement frontend moderne avec React 19 et Next.js 15.",
    longDescription:
      "Atelier pratique sur les fondamentaux de React et Next.js. Construction d'une application complète avec routing, API routes, et déploiement. Niveau intermédiaire requis.",
    category: "atelier",
    status: "submitted",
    visibility: "universite",
    startDate: "2026-06-20T14:00:00",
    endDate: "2026-06-20T18:00:00",
    isMultiDay: false,
    location: "Salle Informatique I-201",
    building: "Bâtiment Informatique",
    capacity: 30,
    registeredCount: 8,
    isFree: true,
    price: 0,
    coverUrl: COVERS[2],
    tags: ["React", "Next.js", "Frontend", "JavaScript"],
    speakers: [{ name: "Sami Benali", role: "Développeur Senior" }],
    organizerId: "user-current",
    organizerName: "Club Dev & Innovation",
    clubId: "club-1",
    clubName: "Club Dev & Innovation",
    isHighlight: false,
    createdAt: "2026-05-10T09:00:00",
    updatedAt: "2026-05-10T09:00:00",
  },
  {
    id: "mevt-003",
    title: "Conférence Blockchain & Web3",
    description: "Explorez les opportunités et défis de la blockchain dans le secteur académique.",
    longDescription:
      "Table ronde avec des experts blockchain, suivie de démonstrations pratiques sur Ethereum et Solidity. Discussions sur les applications académiques de la blockchain.",
    category: "conference",
    status: "draft",
    visibility: "public",
    startDate: "2026-07-05T10:00:00",
    endDate: "2026-07-05T16:00:00",
    isMultiDay: false,
    location: "Amphithéâtre B",
    building: "Bâtiment Principal",
    capacity: 200,
    registeredCount: 0,
    isFree: false,
    price: 300,
    coverUrl: COVERS[1],
    tags: ["Blockchain", "Web3", "Crypto", "Finance"],
    speakers: [],
    organizerId: "user-current",
    organizerName: "Club Dev & Innovation",
    clubId: "club-1",
    clubName: "Club Dev & Innovation",
    isHighlight: false,
    createdAt: "2026-05-05T11:00:00",
    updatedAt: "2026-05-05T11:00:00",
  },
  {
    id: "mevt-004",
    title: "Journée Open Source",
    description: "Contribuez à des projets open source et rencontrez la communauté locale.",
    longDescription:
      "Une journée dédiée à la contribution open source. Projets proposés : bibliothèques universitaires, outils pédagogiques, applications d'accessibilité.",
    category: "atelier",
    status: "rejected",
    visibility: "universite",
    startDate: "2026-06-01T09:00:00",
    endDate: "2026-06-01T17:00:00",
    isMultiDay: false,
    location: "Salle Co-working",
    building: "Incubateur Universitaire",
    capacity: 50,
    registeredCount: 0,
    isFree: true,
    price: 0,
    coverUrl: COVERS[3],
    tags: ["Open Source", "GitHub", "Collaboration"],
    speakers: [],
    organizerId: "user-current",
    organizerName: "Club Dev & Innovation",
    clubId: "club-1",
    clubName: "Club Dev & Innovation",
    isHighlight: false,
    createdAt: "2026-04-20T08:00:00",
    updatedAt: "2026-04-25T16:00:00",
  },
];

// ── Fake user registrations (for etudiant) ────────────────────

export const USER_REGISTRATIONS: UserRegistration[] = [
  {
    id: "reg-001",
    eventId: "evt-001",
    eventTitle: "Summit Tech & IA 2026",
    eventCategory: "conference",
    eventStartDate: "2026-06-15T09:00:00",
    eventLocation: "Amphithéâtre Principal",
    eventCoverUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
    status: "confirmed",
    registeredAt: "2026-05-01T10:23:00",
    qrCode: "QR-EVT001-REG001-XK92",
  },
  {
    id: "reg-002",
    eventId: "evt-005",
    eventTitle: "Nuit Culturelle des Nations",
    eventCategory: "culturel",
    eventStartDate: "2026-06-20T19:00:00",
    eventLocation: "Aula Magna",
    eventCoverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80",
    status: "confirmed",
    registeredAt: "2026-05-03T15:45:00",
    qrCode: "QR-EVT005-REG002-PL37",
  },
  {
    id: "reg-003",
    eventId: "evt-009",
    eventTitle: "Forum Emploi & Stage 2026",
    eventCategory: "conference",
    eventStartDate: "2026-06-25T09:00:00",
    eventLocation: "Espace Expositions",
    eventCoverUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80",
    status: "waitlist",
    registeredAt: "2026-05-04T09:12:00",
    qrCode: "QR-EVT009-REG003-MN54",
  },
  {
    id: "reg-004",
    eventId: "evt-008",
    eventTitle: "Workshop : Photographie & Storytelling",
    eventCategory: "atelier",
    eventStartDate: "2026-05-30T10:00:00",
    eventLocation: "Studio Photo — Local 15",
    eventCoverUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&q=80",
    status: "cancelled",
    registeredAt: "2026-04-28T11:00:00",
    qrCode: "QR-EVT008-REG004-VB21",
  },
];

// ── Status helpers ─────────────────────────────────────────────

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  verified: "Vérifié",
  pending_reservation: "En attente salle",
  approved: "Approuvé",
  rejected: "Rejeté",
  cancelled: "Annulé",
  done: "Terminé",
};

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  draft: "bg-slate-500/15 text-slate-500",
  submitted: "bg-blue-500/15 text-blue-500",
  verified: "bg-cyan-500/15 text-cyan-500",
  pending_reservation: "bg-amber-500/15 text-amber-500",
  approved: "bg-emerald-500/15 text-emerald-500",
  rejected: "bg-red-500/15 text-red-500",
  cancelled: "bg-orange-500/15 text-orange-500",
  done: "bg-purple-500/15 text-purple-500",
};

export const REGISTRATION_STATUS_LABELS: Record<UserRegistration["status"], string> = {
  confirmed: "Confirmé",
  waitlist: "Liste d'attente",
  cancelled: "Annulé",
};

export const REGISTRATION_STATUS_COLORS: Record<UserRegistration["status"], string> = {
  confirmed: "bg-emerald-500/15 text-emerald-500",
  waitlist: "bg-amber-500/15 text-amber-500",
  cancelled: "bg-red-500/15 text-red-500",
};

// ── Default form values ────────────────────────────────────────

export function getDefaultFormData(): EventFormData {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  const dateStr = tomorrow.toISOString().split("T")[0];

  return {
    title: "",
    description: "",
    longDescription: "",
    category: "conference",
    visibility: "universite",
    startDate: dateStr,
    startTime: "09:00",
    endDate: dateStr,
    endTime: "17:00",
    location: "",
    building: "",
    capacity: 50,
    isFree: true,
    price: 0,
    coverUrl: "",
    tags: "",
    isHighlight: false,
    speakers: [],
  };
}

export function eventToFormData(event: ManagedEvent): EventFormData {
  const startDt = new Date(event.startDate);
  const endDt = new Date(event.endDate);

  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    title: event.title,
    description: event.description,
    longDescription: event.longDescription,
    category: event.category,
    visibility: event.visibility,
    startDate: event.startDate.split("T")[0],
    startTime: `${pad(startDt.getHours())}:${pad(startDt.getMinutes())}`,
    endDate: event.endDate.split("T")[0],
    endTime: `${pad(endDt.getHours())}:${pad(endDt.getMinutes())}`,
    location: event.location,
    building: event.building,
    capacity: event.capacity,
    isFree: event.isFree,
    price: event.price,
    coverUrl: event.coverUrl,
    tags: event.tags.join(", "),
    isHighlight: event.isHighlight,
    speakers: event.speakers,
  };
}
