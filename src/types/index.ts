// ============================================================
// UNIEVENT — Core Type Definitions
// ============================================================

// ── User & Auth ──────────────────────────────────────────────

export type UserRole =
  | "admin"
  | "doyen"
  | "responsable_evenements"
  | "president_club"
  | "etudiant";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  clubId?: string;
  clubName?: string;
  filiere?: string;
  anneeEtude?: number;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Events ───────────────────────────────────────────────────

export type EventStatus =
  | "draft"
  | "submitted"
  | "verified"
  | "pending_reservation"
  | "approved"
  | "rejected"
  | "cancelled"
  | "done";

export type EventCategory =
  | "conference"
  | "atelier"
  | "competition"
  | "sortie"
  | "culturel"
  | "sportif"
  | "autre";

export type EventVisibility = "club" | "universite" | "public";

export interface Speaker {
  id: string;
  name: string;
  institution: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  visibility: EventVisibility;
  startDate: string;
  endDate: string;
  isMultiDay: boolean;
  roomId?: string;
  roomName?: string;
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  posterUrl?: string;
  documents: EventDocument[];
  videoConferenceLink?: string;
  budget?: number;
  equipment: string[];
  speakers: Speaker[];
  organizerId: string;
  organizerName: string;
  clubId?: string;
  clubName?: string;
  isInstitutional: boolean;
  isMandatory: boolean;
  rejectionReason?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventDocument {
  id: string;
  name: string;
  url: string;
  type: "programme" | "reglement" | "formulaire" | "autre";
}

// ── Rooms ────────────────────────────────────────────────────

export type RoomType =
  | "amphitheatre"
  | "salle_conference"
  | "salle_informatique"
  | "espace_exterieur"
  | "aula";

export type RoomStatus = "disponible" | "maintenance" | "hors_service";

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  roomNumber: string;
  capacity: number;
  standingCapacity?: number;
  type: RoomType;
  equipment: string[];
  isPMRAccessible: boolean;
  photos: string[];
  status: RoomStatus;
  openingHours: WeeklySchedule;
}

export interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  open: string;
  close: string;
}

// ── Reservations ─────────────────────────────────────────────

export type ReservationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface Reservation {
  id: string;
  eventId: string;
  eventTitle: string;
  roomId: string;
  roomName: string;
  requesterId: string;
  requesterName: string;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  doyenComment?: string;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Registration ──────────────────────────────────────────────

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  status: "confirmed" | "waitlist" | "cancelled";
  qrCode: string;
  attended: boolean;
  rating?: number;
  comment?: string;
  registeredAt: string;
}

// ── Notifications ─────────────────────────────────────────────

export type NotificationType =
  | "event_approved"
  | "event_rejected"
  | "event_cancelled"
  | "reservation_approved"
  | "reservation_rejected"
  | "event_reminder"
  | "new_registration"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEventId?: string;
  createdAt: string;
}

// ── Clubs ─────────────────────────────────────────────────────

export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logoUrl?: string;
  presidentId: string;
  presidentName: string;
  memberCount: number;
  activeEvents: number;
  createdAt: string;
}

// ── Analytics ─────────────────────────────────────────────────

export interface DashboardStats {
  totalEvents: number;
  eventsThisMonth: number;
  totalRegistrations: number;
  activeClubs: number;
  pendingReservations: number;
  avgFillRate: number;
  avgRating: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

// ── Pagination ────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ── Navigation ────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  roles?: UserRole[];
  children?: NavItem[];
}
