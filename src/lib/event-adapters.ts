// ============================================================
// UNIEVENT — Adapters: backend EventDTO <-> UI shapes
// Bridges the real API (EventDTO / CreateEventRequest) to the
// rich UI models (ManagedEvent / PublicEvent / EventFormData)
// so existing screens render real data instead of fake arrays.
// ============================================================

import type { EventCategory, EventStatus, EventVisibility } from "@/types";
import type {
  EventDTO,
  CategorieEnum,
  StatutEvenementEnum,
  VisibiliteEnum,
  CreateEventRequest,
} from "@/types/api";
import type { ManagedEvent, EventFormData } from "@/lib/events-crud-data";
import type { PublicEvent } from "@/lib/public-events-data";

// ── Enum maps ──────────────────────────────────────────────────

const CATEGORIE_TO_CATEGORY: Record<CategorieEnum, EventCategory> = {
  CONFERENCE: "conference",
  ATELIER: "atelier",
  COMPETITION: "competition",
  CULTUREL: "culturel",
  SPORTIF: "sportif",
  SORTIE: "sortie",
  AUTRE: "autre",
};

const CATEGORY_TO_CATEGORIE: Record<EventCategory, CategorieEnum> = {
  conference: "CONFERENCE",
  atelier: "ATELIER",
  competition: "COMPETITION",
  culturel: "CULTUREL",
  sportif: "SPORTIF",
  sortie: "SORTIE",
  autre: "AUTRE",
};

const STATUT_TO_STATUS: Record<StatutEvenementEnum, EventStatus> = {
  BROUILLON: "draft",
  SOUMIS: "submitted",
  VERIFIE: "verified",
  RESERVATION_EN_ATTENTE: "pending_reservation",
  APPROUVE: "approved",
  REJETE: "rejected",
  ANNULE: "cancelled",
  TERMINE: "done",
};

const VISIBILITE_TO_VISIBILITY: Record<VisibiliteEnum, EventVisibility> = {
  INTERNE_CLUB: "club",
  UNIVERSITE: "universite",
  PUBLIC: "public",
};

const VISIBILITY_TO_VISIBILITE: Record<EventVisibility, VisibiliteEnum> = {
  club: "INTERNE_CLUB",
  universite: "UNIVERSITE",
  public: "PUBLIC",
};

export const categoryFromApi = (c?: CategorieEnum): EventCategory =>
  c ? CATEGORIE_TO_CATEGORY[c] : "autre";
export const categoryToApi = (c: EventCategory): CategorieEnum =>
  CATEGORY_TO_CATEGORIE[c];
export const statusFromApi = (s?: StatutEvenementEnum): EventStatus =>
  s ? STATUT_TO_STATUS[s] : "draft";
export const visibilityFromApi = (v?: VisibiliteEnum): EventVisibility =>
  v ? VISIBILITE_TO_VISIBILITY[v] : "universite";

// ── EventDTO -> ManagedEvent ───────────────────────────────────

export function eventDtoToManaged(dto: EventDTO): ManagedEvent {
  const start = dto.dateDebut ?? "";
  const end = dto.dateFin ?? start;
  return {
    id: String(dto.id),
    title: dto.titre,
    description: dto.description ?? "",
    longDescription: dto.description ?? "",
    category: categoryFromApi(dto.categorie),
    status: statusFromApi(dto.statut),
    visibility: visibilityFromApi(dto.visibilite),
    startDate: start,
    endDate: end,
    isMultiDay: start.slice(0, 10) !== end.slice(0, 10),
    location: dto.lienVisio ?? dto.clubNom ?? "",
    building: "",
    capacity: dto.capacite ?? 0,
    registeredCount: dto.registrationCount ?? 0,
    isFree: true,
    price: 0,
    coverUrl: dto.affiche ?? "",
    tags: [],
    speakers: [],
    organizerId: dto.organisateurId != null ? String(dto.organisateurId) : "",
    organizerName: dto.organisateurNom ?? "",
    clubId: dto.clubId != null ? String(dto.clubId) : undefined,
    clubName: dto.clubNom,
    isHighlight: false,
    createdAt: start,
    updatedAt: start,
  };
}

// ── EventDTO -> PublicEvent ────────────────────────────────────

export function eventDtoToPublic(dto: EventDTO): PublicEvent {
  const start = dto.dateDebut ?? "";
  const end = dto.dateFin ?? start;
  const now = Date.now();
  const startMs = start ? new Date(start).getTime() : now;
  const endMs = end ? new Date(end).getTime() : startMs;
  const status: PublicEvent["status"] =
    now < startMs ? "upcoming" : now > endMs ? "done" : "ongoing";

  return {
    id: String(dto.id),
    title: dto.titre,
    description: dto.description ?? "",
    longDescription: dto.description ?? "",
    category: categoryFromApi(dto.categorie),
    startDate: start,
    endDate: end,
    isMultiDay: start.slice(0, 10) !== end.slice(0, 10),
    location: dto.lienVisio ?? dto.clubNom ?? "",
    building: "",
    coverUrl: dto.affiche ?? "",
    gallery: [],
    capacity: dto.capacite ?? 0,
    registeredCount: dto.registrationCount ?? 0,
    isFree: true,
    price: 0,
    organizerId: dto.organisateurId != null ? String(dto.organisateurId) : "",
    organizerName: dto.organisateurNom ?? dto.clubNom ?? "",
    clubName: dto.clubNom,
    tags: [],
    speakers: [],
    isHighlight: false,
    status,
  };
}

// ── EventFormData -> CreateEventRequest ────────────────────────

export function formDataToCreateRequest(form: EventFormData): CreateEventRequest {
  return {
    titre: form.title,
    description: form.longDescription || form.description,
    categorie: categoryToApi(form.category),
    dateDebut: `${form.startDate}T${form.startTime}`,
    dateFin: `${form.endDate}T${form.endTime}`,
    capacite: form.capacity,
    affiche: form.coverUrl || undefined,
    visibilite: VISIBILITY_TO_VISIBILITE[form.visibility],
    lienVisio: form.location || undefined,
  };
}

// ── EventDTO -> EventFormData (for the edit form) ──────────────

export function eventDtoToFormData(dto: EventDTO): EventFormData {
  const start = dto.dateDebut ? new Date(dto.dateDebut) : new Date();
  const end = dto.dateFin ? new Date(dto.dateFin) : start;
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateOnly = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const timeOnly = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return {
    title: dto.titre,
    description: dto.description ?? "",
    longDescription: dto.description ?? "",
    category: categoryFromApi(dto.categorie),
    visibility: visibilityFromApi(dto.visibilite),
    startDate: dateOnly(start),
    startTime: timeOnly(start),
    endDate: dateOnly(end),
    endTime: timeOnly(end),
    location: dto.lienVisio ?? "",
    building: "",
    capacity: dto.capacite ?? 50,
    isFree: true,
    price: 0,
    coverUrl: dto.affiche ?? "",
    tags: "",
    isHighlight: false,
    speakers: [],
  };
}
