import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { EventStatus, EventCategory, UserRole } from "@/types";

// ── Tailwind class merger ─────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date utils ────────────────────────────────────────────────
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHr < 24) return `Il y a ${diffHr}h`;
  if (diffDay < 7) return `Il y a ${diffDay}j`;
  return formatDate(date);
}

// ── Event status helpers ──────────────────────────────────────
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  verified: "Vérifié",
  pending_reservation: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
  cancelled: "Annulé",
  done: "Terminé",
};

export const EVENT_STATUS_CLASSES: Record<EventStatus, string> = {
  draft: "status-draft",
  submitted: "status-submitted",
  verified: "status-verified",
  pending_reservation: "status-pending",
  approved: "status-approved",
  rejected: "status-rejected",
  cancelled: "status-cancelled",
  done: "status-done",
};

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  conference: "Conférence",
  atelier: "Atelier",
  competition: "Compétition",
  sortie: "Sortie",
  culturel: "Culturel",
  sportif: "Sportif",
  autre: "Autre",
};

// ── Role helpers ──────────────────────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  doyen: "Doyen",
  responsable_evenements: "Resp. Événements",
  president_club: "Président de Club",
  etudiant: "Étudiant",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  doyen: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  responsable_evenements: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  president_club: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  etudiant: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

// ── Number utils ──────────────────────────────────────────────
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

// ── Misc ──────────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "…";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
