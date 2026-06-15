"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Calendar, Users, Search, Eye, Edit, Send, ShieldCheck } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { eventService } from "@/services/event.service";
import type { StatutEvenementEnum } from "@/types/api";
import Link from "next/link";

const STATUT_LABEL: Record<StatutEvenementEnum, string> = {
  BROUILLON: "Brouillon",
  SOUMIS: "Soumis",
  VERIFIE: "Vérifié",
  RESERVATION_EN_ATTENTE: "Rés. en attente",
  APPROUVE: "Approuvé",
  REJETE: "Rejeté",
  ANNULE: "Annulé",
  TERMINE: "Terminé",
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatutEvenementEnum | "all">("all");
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-events", statusFilter],
    queryFn: () => eventService.list({ statut: statusFilter !== "all" ? statusFilter : undefined, size: 100 }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => eventService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-events"] }),
  });

  // /publish gère deux transitions selon le rôle de l'appelant :
  //   organisateur : BROUILLON → SOUMIS ("Soumettre")
  //   admin        : VERIFIE  → APPROUVE ("Approuver")
  const publishMutation = useMutation({
    mutationFn: (id: number) => eventService.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-events"] }),
  });

  // SOUMIS → VERIFIE via PATCH /evenements/{id}/verifier ("Vérifier")
  const verifyMutation = useMutation({
    mutationFn: (id: number) => eventService.verify(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-events"] }),
  });

  // VERIFIE → APPROUVE via PATCH /evenements/{id}/approuver ("Approuver")
  const approveMutation = useMutation({
    mutationFn: (id: number) => eventService.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-events"] }),
  });

  const events = (data?.content ?? []).filter((e) =>
    e.titre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader title="Gestion des événements" description={`${data?.page?.totalElements ?? 0} événement(s) au total.`} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatutEvenementEnum | "all")}
        >
          <option value="all">Tous les statuts</option>
          {(Object.keys(STATUT_LABEL) as StatutEvenementEnum[]).map((s) => (
            <option key={s} value={s}>{STATUT_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : error ? (
        <p className="text-sm text-red-500">Erreur lors du chargement des événements.</p>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Calendar size={40} className="mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucun événement trouvé.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Titre</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Inscrits</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Statut</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => (
                <motion.tr key={ev.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-foreground max-w-[200px] truncate">{ev.titre}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">
                    {ev.dateDebut ? formatDate(ev.dateDebut) : "—"}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users size={13} />{ev.registrationCount}{ev.capacite ? `/${ev.capacite}` : ""}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                      ev.statut === "APPROUVE" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : ev.statut === "REJETE" || ev.statut === "ANNULE" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : ev.statut === "SOUMIS" || ev.statut === "VERIFIE" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400")}>
                      {STATUT_LABEL[ev.statut ?? "BROUILLON"]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Modifier (réutilise la route d'édition existante) */}
                      <Link href={`/dashboard/events/edit/${ev.id}`}
                        title="Modifier"
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Edit size={14} />
                      </Link>

                      {/* Action de transition selon le statut courant */}
                      {ev.statut === "BROUILLON" && (
                        <button
                          onClick={() => publishMutation.mutate(ev.id)}
                          disabled={publishMutation.isPending}
                          title="Soumettre"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors dark:hover:bg-blue-900/20 disabled:opacity-50">
                          <Send size={14} />
                        </button>
                      )}

                      {ev.statut === "SOUMIS" && (
                        <button
                          onClick={() => verifyMutation.mutate(ev.id)}
                          disabled={verifyMutation.isPending}
                          title="Vérifier"
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors dark:hover:bg-amber-900/20 disabled:opacity-50">
                          <ShieldCheck size={14} />
                        </button>
                      )}

                      {(ev.statut === "VERIFIE" || ev.statut === "RESERVATION_EN_ATTENTE") && (
                        <button
                          onClick={() => approveMutation.mutate(ev.id)}
                          disabled={approveMutation.isPending}
                          title="Approuver"
                          className="p-1.5 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors dark:hover:bg-green-900/20 disabled:opacity-50">
                          <CheckCircle2 size={14} />
                        </button>
                      )}

                      {/* Voir */}
                      <Link href={`/events/${ev.id}`}
                        title="Voir"
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Eye size={14} />
                      </Link>

                      {/* Annuler */}
                      {ev.statut !== "ANNULE" && ev.statut !== "TERMINE" && (
                        <button
                          onClick={() => cancelMutation.mutate(ev.id)}
                          disabled={cancelMutation.isPending}
                          title="Annuler"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors dark:hover:bg-red-900/20 disabled:opacity-50">
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
