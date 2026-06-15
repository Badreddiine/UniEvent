"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { Users, Search, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { eventService } from "@/services/event.service";
import { registrationService } from "@/services/registration.service";
import type { StatutInscriptionEnum } from "@/types/api";

const STATUT_CFG: Record<StatutInscriptionEnum, { label: string; cls: string; icon: React.ElementType }> = {
  CONFIRMEE:    { label: "Confirmé",      cls: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",  icon: CheckCircle2 },
  LISTE_ATTENTE:{ label: "Liste d'attente", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400", icon: Clock },
  ANNULEE:      { label: "Annulé",         cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",        icon: XCircle },
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function ClubAttendeesPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ["my-events-list"],
    queryFn: () => eventService.list({ size: 100 }),
  });

  const { data: attendees, isLoading: loadingAttendees } = useQuery({
    queryKey: ["attendees", selectedEventId],
    queryFn: () => registrationService.getAttendees(selectedEventId!),
    enabled: selectedEventId !== null,
  });

  const filtered = (attendees ?? []).filter((a) =>
    (a.etudiantName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader title="Participants" description="Consultez les inscrits à vos événements." />

      {/* Event selector */}
      {loadingEvents ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <select
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none"
          value={selectedEventId ?? ""}
          onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Sélectionner un événement…</option>
          {(events?.content ?? []).map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.titre}</option>
          ))}
        </select>
      )}

      {selectedEventId && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none"
              placeholder="Rechercher un participant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loadingAttendees ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
              <Users size={40} className="mb-4 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aucun participant trouvé.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Participant</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Date d'inscription</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Statut</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Présent</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => {
                    const statut = (a.statut ?? "CONFIRMEE") as StatutInscriptionEnum;
                    const cfg = STATUT_CFG[statut];
                    const Icon = cfg.icon;
                    return (
                      <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-foreground">{a.etudiantName ?? `#${a.etudiantId}`}</td>
                        <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">
                          {a.dateInscription ? formatDate(a.dateInscription) : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium", cfg.cls)}>
                            <Icon size={11} />{cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className={cn("text-[11px] font-medium", a.present ? "text-green-600" : "text-muted-foreground")}>
                            {a.present ? "Oui" : "Non"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
