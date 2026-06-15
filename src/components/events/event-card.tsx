"use client";

import { Calendar, Users, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { EventDTO, CategorieEnum } from "@/types/api";

// ── Constants ─────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<CategorieEnum, string> = {
  CONFERENCE: "Conférence",
  ATELIER: "Atelier",
  COMPETITION: "Compétition",
  CULTUREL: "Culturel",
  SPORTIF: "Sportif",
  SORTIE: "Sortie",
  AUTRE: "Autre",
};

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FillRateBadge({ registered, capacity }: { registered: number; capacity: number }) {
  const rate = Math.round((registered / capacity) * 100);
  const isFull = registered >= capacity;
  const isAlmostFull = rate >= 80;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {registered}/{capacity} inscrits
        </span>
        <span
          className={cn(
            "font-semibold",
            isFull ? "text-rose-500" : isAlmostFull ? "text-amber-500" : "text-emerald-500"
          )}
        >
          {isFull ? "Complet" : isAlmostFull ? "Presque complet" : `${rate}%`}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isFull ? "bg-rose-500" : isAlmostFull ? "bg-amber-400" : "bg-emerald-500"
          )}
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ── Grid Card ─────────────────────────────────────────────────

function GridCard({ event }: { event: EventDTO }) {
  const isFull = event.capacite ? event.registrationCount >= event.capacite : false;

  return (
    <Link href={`/events/${event.id}`} className="block group h-full">
      <div className="h-full bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 flex flex-col">
        {/* Cover image */}
        <div className="relative h-48 overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-400 to-brand-700">
          {event.affiche && (
            <img
              src={event.affiche}
              alt={event.titre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Category */}
          {event.categorie && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-black/30 border border-white/10 text-white">
                {CATEGORY_LABELS[event.categorie]}
              </span>
            </div>
          )}

          {/* Fill status badge */}
          {isFull && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm bg-rose-500/90 text-white">
                Complet
              </span>
            </div>
          )}

          {/* Date overlay */}
          {event.dateDebut && (
            <div className="absolute bottom-3 left-3 text-white text-xs font-medium">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(event.dateDebut).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <div>
            <h3 className="font-display font-semibold text-foreground text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-1.5">
              {event.titre}
            </h3>
            {event.description && (
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          <div className="space-y-1.5 text-sm">
            {event.dateDebut && event.dateFin && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 flex-shrink-0 text-primary/60" />
                <span>{formatTime(event.dateDebut)} — {formatTime(event.dateFin)}</span>
              </div>
            )}
          </div>

          {event.clubNom && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                {event.clubNom[0]}
              </div>
              {event.clubNom}
            </div>
          )}

          {event.capacite ? (
            <div className="mt-auto pt-2 border-t border-border/60">
              <FillRateBadge
                registered={event.registrationCount}
                capacity={event.capacite}
              />
            </div>
          ) : (
            <div className="mt-auto pt-2 border-t border-border/60 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              {event.registrationCount} inscrit{event.registrationCount !== 1 ? "s" : ""}
            </div>
          )}

          <div className="flex items-center justify-end">
            <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              Voir
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── List Card ─────────────────────────────────────────────────

function ListCard({ event }: { event: EventDTO }) {
  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 flex gap-0">
        {/* Cover */}
        <div className="relative w-40 sm:w-56 flex-shrink-0 overflow-hidden bg-gradient-to-br from-brand-400 to-brand-700">
          {event.affiche && (
            <img
              src={event.affiche}
              alt={event.titre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
          {event.categorie && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/40 backdrop-blur-sm text-white border border-white/10">
                {CATEGORY_LABELS[event.categorie]}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col gap-2 min-w-0">
          <h3 className="font-display font-semibold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
            {event.titre}
          </h3>
          {event.description && (
            <p className="text-muted-foreground text-sm line-clamp-1 sm:line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {event.dateDebut && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary/60" />
                {new Date(event.dateDebut).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-primary/60" />
              {event.registrationCount}{event.capacite ? `/${event.capacite}` : ""}
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4">
            {event.capacite ? (
              <div className="flex-1">
                <FillRateBadge
                  registered={event.registrationCount}
                  capacity={event.capacite}
                />
              </div>
            ) : <div className="flex-1" />}
            <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all flex-shrink-0">
              Voir le détail
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Exported Component ────────────────────────────────────────

export function EventCard({
  event,
  listMode = false,
}: {
  event: EventDTO;
  listMode?: boolean;
}) {
  return listMode ? <ListCard event={event} /> : <GridCard event={event} />;
}
