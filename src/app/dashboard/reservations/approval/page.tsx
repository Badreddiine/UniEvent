"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import {
  ShieldOff, Building2, Calendar, CheckCircle2,
  XCircle, ArrowLeft, Loader2, Clock,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { reservationService } from "@/services/reservation.service";
import type { StatutReservationEnum } from "@/types/api";

// ── Status config ─────────────────────────────────────────────

const STATUS_CONFIG: Record<StatutReservationEnum, { label: string; icon: React.ElementType; cls: string }> = {
  EN_ATTENTE: { label: "En attente",  icon: Clock,         cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  APPROUVEE:  { label: "Approuvée",   icon: CheckCircle2,  cls: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  REJETEE:    { label: "Rejetée",     icon: XCircle,       cls: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" },
  ANNULEE:    { label: "Annulée",     icon: XCircle,       cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

type FilterStatus = StatutReservationEnum | "all";

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function ReservationApprovalPage() {
  const { canApproveReservations } = useAuthStore();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [pendingId, setPendingId] = useState<number | null>(null);

  const { data: reservations, isLoading, error, refetch } = useQuery({
    queryKey: ["reservations-all"],
    queryFn: reservationService.listAllReservations,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["reservations-all"] });
    qc.invalidateQueries({ queryKey: ["all-reservations"] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: number) => reservationService.approve(id),
    onMutate: (id) => setPendingId(id),
    onSettled: () => setPendingId(null),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => reservationService.reject(id),
    onMutate: (id) => setPendingId(id),
    onSettled: () => setPendingId(null),
    onSuccess: invalidate,
  });

  if (!canApproveReservations()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600">
          <ShieldOff size={28} />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">Accès refusé</p>
          <p className="text-sm text-muted-foreground mt-1">
            Seuls le Doyen et l&apos;administrateur peuvent accéder à cette page.
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors">
          ← Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const filtered = (reservations ?? []).filter(
    (r) => statusFilter === "all" || r.statut === statusFilter
  );

  const counts: Record<FilterStatus, number> = {
    all: reservations?.length ?? 0,
    EN_ATTENTE: reservations?.filter((r) => r.statut === "EN_ATTENTE").length ?? 0,
    APPROUVEE:  reservations?.filter((r) => r.statut === "APPROUVEE").length ?? 0,
    REJETEE:    reservations?.filter((r) => r.statut === "REJETEE").length ?? 0,
    ANNULEE:    reservations?.filter((r) => r.statut === "ANNULEE").length ?? 0,
  };

  const tabs: { key: FilterStatus; label: string }[] = [
    { key: "all",        label: "Toutes" },
    { key: "EN_ATTENTE", label: "En attente" },
    { key: "APPROUVEE",  label: "Approuvées" },
    { key: "REJETEE",    label: "Rejetées" },
    { key: "ANNULEE",    label: "Annulées" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/reservations"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Retour
        </Link>
      </div>

      <PageHeader
        title="Réservations de salles"
        description={`${counts.EN_ATTENTE} demande${counts.EN_ATTENTE !== 1 ? "s" : ""} en attente`}
      />

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
              statusFilter === key
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-muted text-xs font-semibold">
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground mb-4">Erreur lors du chargement des réservations.</p>
          <button onClick={() => refetch()}
            className="text-sm text-brand-500 hover:underline">
            Réessayer
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
          <CheckCircle2 size={40} className="mb-4 text-green-500/50" />
          <p className="text-sm text-muted-foreground">Aucune réservation dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => {
            const cfg = STATUS_CONFIG[r.statut] ?? STATUS_CONFIG.EN_ATTENTE;
            const Icon = cfg.icon;
            const canDecide = r.statut === "EN_ATTENTE";
            const busy = pendingId === r.id;

            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950 flex-shrink-0">
                      <Building2 size={18} className="text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {r.evenementTitre ?? `Réservation #${r.id}`}
                      </p>
                      {r.salleNom && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Building2 size={11} />{r.salleNom}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 mt-1.5 text-xs text-muted-foreground">
                        {r.dateDebut && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {formatDate(r.dateDebut)}
                            {r.dateFin && r.dateFin !== r.dateDebut ? ` → ${formatDate(r.dateFin)}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", cfg.cls)}>
                      <Icon size={12} />{cfg.label}
                    </span>
                    {canDecide && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveMutation.mutate(r.id)}
                          disabled={busy}
                          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {busy && approveMutation.isPending ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={12} />
                          )}
                          Approuver
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(r.id)}
                          disabled={busy}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
                        >
                          {busy && rejectMutation.isPending ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <XCircle size={12} />
                          )}
                          Rejeter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
