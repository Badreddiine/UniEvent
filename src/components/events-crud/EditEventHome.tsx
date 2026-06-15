// ============================================================
// UNIEVENT — Phase 5B2: EditEventHome
// ============================================================

"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit3, AlertTriangle, Loader2 } from "lucide-react";
import { EventForm } from "@/components/events-crud/EventForm";
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS } from "@/lib/events-crud-data";
import { eventService } from "@/services/event.service";
import { eventDtoToFormData, statusFromApi } from "@/lib/event-adapters";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

interface EditEventHomeProps {
  eventId: string;
}

export function EditEventHome({ eventId }: EditEventHomeProps) {
  const { canCreateEvents } = useAuthStore();

  const { data: dto, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventService.get(Number(eventId)),
    enabled: !Number.isNaN(Number(eventId)),
  });

  const event = dto
    ? { status: statusFromApi(dto.statut), title: dto.titre }
    : null;

  if (!canCreateEvents()) {
    return (
      <div className="min-h-screen bg-[#0c0c0f] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-white/50">Accès non autorisé.</p>
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0c0f] flex items-center justify-center">
        <Loader2 size={28} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!event || !dto) {
    return (
      <div className="min-h-screen bg-[#0c0c0f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Événement introuvable</p>
            <p className="text-white/40 text-sm mt-1">L'événement demandé n'existe pas ou a été supprimé.</p>
          </div>
          <Link
            href="/dashboard/events/mine"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Mes événements
          </Link>
        </div>
      </div>
    );
  }

  // Warn if event is approved or rejected (can still edit draft/pending)
  const isLocked = event.status === "done" || event.status === "cancelled";
  const isApproved = event.status === "approved";

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/dashboard/events/mine"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft size={14} />
            Mes événements
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Edit3 size={20} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">Modifier l'événement</h1>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium",
                  EVENT_STATUS_COLORS[event.status]
                )}>
                  {EVENT_STATUS_LABELS[event.status]}
                </span>
              </div>
              <p className="text-white/50 text-sm mt-1 truncate">{event.title}</p>
            </div>
          </div>

          {/* Warnings */}
          {isLocked && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 flex items-start gap-3">
              <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300/80">
                Cet événement est <strong className="text-red-300">{EVENT_STATUS_LABELS[event.status]}</strong>.
                La modification n'est plus possible.
              </p>
            </div>
          )}

          {isApproved && !isLocked && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-4 flex items-start gap-3">
              <AlertTriangle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300/80">
                Cet événement est <strong className="text-amber-300">approuvé</strong>.
                Toute modification le remettra en attente d'approbation.
              </p>
            </div>
          )}

          {event.status === "rejected" && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 flex items-start gap-3">
              <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300/80">
                Votre événement a été <strong className="text-red-300">rejeté</strong>.
                Vous pouvez le modifier et le soumettre à nouveau.
              </p>
            </div>
          )}
        </div>

        {/* Form — locked if terminal status */}
        {isLocked ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-8 text-center">
            <p className="text-white/40">Aucune modification possible pour un événement terminé ou annulé.</p>
          </div>
        ) : (
          <EventForm
            mode="edit"
            initialData={eventDtoToFormData(dto)}
            eventId={String(dto.id)}
          />
        )}
      </div>
    </div>
  );
}
