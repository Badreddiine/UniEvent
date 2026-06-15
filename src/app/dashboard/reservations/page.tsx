"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, AlertCircle, Building2, Calendar, Search, Plus, X, Loader2 } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { reservationService } from "@/services/reservation.service";
import { eventService } from "@/services/event.service";
import type { StatutReservationEnum, CreateReservationRequest } from "@/types/api";

const STATUS_CONFIG: Record<StatutReservationEnum, { label: string; icon: React.ElementType; cls: string }> = {
  EN_ATTENTE:  { label: "En attente", icon: Clock,         cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  APPROUVEE:   { label: "Approuvé",   icon: CheckCircle2,  cls: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  REJETEE:     { label: "Rejeté",     icon: XCircle,       cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  ANNULEE:     { label: "Annulé",     icon: AlertCircle,   cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

// ── Modal: nouvelle demande de réservation ────────────────────
function NewReservationModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ evenementId: "", salleId: "", dateDebut: "", dateFin: "", commentaire: "" });
  const [err, setErr] = useState<string | null>(null);

  const { data: eventsPage } = useQuery({
    queryKey: ["my-events"],
    queryFn: () => eventService.list({ size: 100 }),
  });
  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => reservationService.listRooms(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateReservationRequest) => reservationService.create(data),
    onSuccess: () => { onCreated(); onClose(); },
    onError: () => setErr("Création impossible. Vérifiez la disponibilité de la salle et le créneau."),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.evenementId || !form.salleId || !form.dateDebut || !form.dateFin) {
      setErr("Tous les champs (sauf commentaire) sont obligatoires.");
      return;
    }
    createMutation.mutate({
      evenementId: Number(form.evenementId),
      salleId: Number(form.salleId),
      dateDebut: form.dateDebut,
      dateFin: form.dateFin,
      commentaire: form.commentaire || undefined,
    });
  }

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Nouvelle demande de réservation</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Événement *</label>
            <select value={form.evenementId} onChange={(e) => set("evenementId", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30">
              <option value="">Sélectionner un événement…</option>
              {(eventsPage?.content ?? []).map((e) => (
                <option key={e.id} value={e.id}>{e.titre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Salle *</label>
            <select value={form.salleId} onChange={(e) => set("salleId", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30">
              <option value="">Sélectionner une salle…</option>
              {(rooms ?? []).map((r) => (
                <option key={r.id} value={r.id}>{r.nom}{r.capacite ? ` (${r.capacite} places)` : ""}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Début *</label>
              <input type="datetime-local" value={form.dateDebut} onChange={(e) => set("dateDebut", e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Fin *</label>
              <input type="datetime-local" value={form.dateFin} onChange={(e) => set("dateFin", e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Commentaire</label>
            <textarea value={form.commentaire} onChange={(e) => set("commentaire", e.target.value)} rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none resize-none" />
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors">Annuler</button>
            <button type="submit" disabled={createMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Soumettre la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatutReservationEnum | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { data: reservations, isLoading, error } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: reservationService.listMyReservations,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => reservationService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-reservations"] }),
  });

  const filtered = (reservations ?? []).filter((r) => {
    const matchSearch =
      (r.evenementTitre ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.salleNom ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.statut === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader title="Mes demandes de réservation" description="Suivez l'état de vos demandes de réservation de salles.">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} /> Nouvelle demande
        </button>
      </PageHeader>

      {showModal && (
        <NewReservationModal
          onClose={() => setShowModal(false)}
          onCreated={() => qc.invalidateQueries({ queryKey: ["my-reservations"] })}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value as StatutReservationEnum | "all")}
        >
          <option value="all">Tous</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="APPROUVEE">Approuvé</option>
          <option value="REJETEE">Rejeté</option>
          <option value="ANNULEE">Annulé</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">Erreur lors du chargement des réservations.</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Clock size={40} className="mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucune réservation trouvée.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => {
            const cfg = STATUS_CONFIG[r.statut];
            const Icon = cfg.icon;
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                  <Building2 size={20} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-medium text-sm text-foreground">{r.evenementTitre ?? "—"}</p>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium", cfg.cls)}>
                      <Icon size={11} />{cfg.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 size={12} />{r.salleNom ?? "—"}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(r.dateDebut)}</span>
                  </div>
                  {r.commentaire && (
                    <p className="mt-2 text-xs text-muted-foreground italic border-l-2 border-border pl-2">"{r.commentaire}"</p>
                  )}
                  {r.statut === "EN_ATTENTE" && (
                    <button
                      onClick={() => cancelMutation.mutate(r.id)}
                      disabled={cancelMutation.isPending}
                      className="mt-2 text-xs text-red-500 hover:underline disabled:opacity-50"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
