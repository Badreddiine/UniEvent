"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { motion } from "framer-motion";
import { Building2, Search, Users, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { reservationService } from "@/services/reservation.service";
import type { StatutSalleEnum } from "@/types/api";

const STATUT_CFG: Record<StatutSalleEnum, { label: string; cls: string; icon: React.ElementType }> = {
  DISPONIBLE:   { label: "Disponible",    cls: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",  icon: CheckCircle2 },
  MAINTENANCE:  { label: "Maintenance",   cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400", icon: AlertCircle },
  HORS_SERVICE: { label: "Hors service",  cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",         icon: XCircle },
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function AdminRoomsPage() {
  const [search, setSearch] = useState("");

  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => reservationService.listRooms(),
  });

  const filtered = (rooms ?? []).filter((r) =>
    r.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader title="Gestion des salles" description="Consultez les espaces disponibles sur le campus." />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : error ? (
        <p className="text-sm text-red-500">Erreur lors du chargement des salles.</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Building2 size={40} className="mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucune salle trouvée.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Salle</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Bâtiment</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Capacité</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const statut = r.statut ?? "DISPONIBLE";
                const cfg = STATUT_CFG[statut];
                const Icon = cfg.icon;
                return (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{r.nom}</td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{r.batiment ?? "—"}</td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{r.type ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users size={13} />{r.capacite ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium", cfg.cls)}>
                        <Icon size={11} />{cfg.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
