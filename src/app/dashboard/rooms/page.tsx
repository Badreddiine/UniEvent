"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BackButton } from "@/components/shared/back-button";
import { motion } from "framer-motion";
import { Building2, Users, Search, CheckCircle2, AlertCircle, CalendarPlus, X, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { reservationService } from "@/services/reservation.service";
import { eventService } from "@/services/event.service";
import { useAuthStore } from "@/store/auth.store";
import type { RoomDTO, TypeSalleEnum } from "@/types/api";

const TYPE_LABELS: Record<TypeSalleEnum, string> = {
  AMPHI: "Amphithéâtre",
  SALLE_CONFERENCE: "Salle de conf.",
  SALLE_INFORMATIQUE: "Salle info.",
  ESPACE_EXTERIEUR: "Espace extérieur",
  AULA: "Aula",
};

// ── Modal de réservation ──────────────────────────────────────
function ReserveRoomModal({ room, onClose }: { room: RoomDTO; onClose: () => void }) {
  const qc = useQueryClient();
  const [evenementId, setEvenementId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [motif, setMotif] = useState("");

  // Événements de l'organisateur pour rattacher la réservation
  const { data: events } = useQuery({
    queryKey: ["my-events-for-reservation"],
    queryFn: () => eventService.list({ size: 100 }),
  });

  const mutation = useMutation({
    mutationFn: () =>
      reservationService.create({
        salleId: room.id,
        evenementId: Number(evenementId),
        dateDebut,
        dateFin,
        commentaire: motif || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-reservations"] });
      onClose();
    },
  });

  const canSubmit = evenementId !== "" && dateDebut !== "" && dateFin !== "" && !mutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Réserver une salle</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{room.nom}{room.batiment ? ` · ${room.batiment}` : ""}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground" title="Fermer">
            <X size={16} />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mutation.mutate();
          }}
        >
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Événement</label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              value={evenementId}
              onChange={(e) => setEvenementId(e.target.value)}
              required
            >
              <option value="">Sélectionner un événement…</option>
              {(events?.content ?? []).map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.titre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Début</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Fin</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Motif</label>
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              rows={3}
              placeholder="Précisez l'objet de la réservation…"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            />
          </div>

          {mutation.isError && (
            <p className="text-xs text-red-500">
              Échec de la réservation. Vérifiez la disponibilité du créneau et la capacité de la salle.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Réserver
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function RoomsPage() {
  const [search, setSearch] = useState("");
  const [reserveRoom, setReserveRoom] = useState<RoomDTO | null>(null);
  const isPresident = useAuthStore((s) => s.user?.role === "president_club");

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => reservationService.listRooms(),
  });

  const filtered = (rooms ?? []).filter((r) =>
    r.nom.toLowerCase().includes(search.toLowerCase()) ||
    (r.batiment ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader
        title="Salles disponibles"
        description="Consultez les espaces disponibles sur le campus de la FST Settat."
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          placeholder="Rechercher une salle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room, i) => {
            const available = room.statut === "DISPONIBLE" || room.statut == null;
            return (
              <motion.div key={room.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                    <Building2 size={20} className="text-brand-600" />
                  </div>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    available
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  )}>
                    {available ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                    {available ? "Disponible" : "Indisponible"}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-foreground">{room.nom}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {room.batiment ?? "—"}{room.type ? ` · ${TYPE_LABELS[room.type]}` : ""}
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                  <Users size={13} />
                  <span>{room.capacite ?? "?"} places</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(room.equipements ?? []).slice(0, 3).map((eq) => (
                    <span key={eq} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{eq}</span>
                  ))}
                  {(room.equipements?.length ?? 0) > 3 && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">+{room.equipements!.length - 3}</span>
                  )}
                </div>

                {isPresident && (
                  <button
                    onClick={() => setReserveRoom(room)}
                    disabled={!available}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                  >
                    <CalendarPlus size={15} /> Réserver une salle
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {reserveRoom && (
        <ReserveRoomModal room={reserveRoom} onClose={() => setReserveRoom(null)} />
      )}
    </div>
  );
}
