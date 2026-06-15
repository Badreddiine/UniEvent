"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, Clock, Download } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { eventService } from "@/services/event.service";
import { registrationService } from "@/services/registration.service";
import { EventManagementPanels } from "@/components/events/event-management-panels";
import { cn } from "@/lib/utils";

export default function EventRegistrantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const eventId = Number(id);

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventService.get(eventId),
    enabled: !Number.isNaN(eventId),
  });

  const { data: attendees, isLoading } = useQuery({
    queryKey: ["event-attendees", id],
    queryFn: () => registrationService.getAttendees(eventId),
    enabled: !Number.isNaN(eventId),
  });

  const registrants = attendees ?? [];
  const confirmed = registrants.filter((r) => r.statut === "CONFIRMEE");
  const waitlist = registrants.filter((r) => r.statut === "LISTE_ATTENTE");
  const capacity = event?.capacite ?? 0;

  if (!isLoading && !event) {
    return (
      <div className="space-y-4">
        <BackButton href="/dashboard/events/mine" />
        <p className="text-muted-foreground">Événement introuvable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard/events/mine" />
      <PageHeader
        title={`Inscrits — ${event?.titre ?? ""}`}
        description={`${confirmed.length} confirmé(s) · ${waitlist.length} en liste d'attente · ${capacity} places au total`}
      >
        <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
          <Download size={15} /> Exporter CSV
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{confirmed.length}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Confirmés</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{waitlist.length}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Liste d'attente</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{Math.max(0, capacity - confirmed.length)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Places libres</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Étudiant</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Inscrit le</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Statut</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : registrants.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Aucun inscrit pour le moment.</td></tr>
            ) : registrants.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-foreground">{r.etudiantName ?? `Étudiant #${r.etudiantId ?? ""}`}</p>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                  {r.dateInscription ? new Date(r.dateInscription).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    r.statut === "CONFIRMEE"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  )}>
                    {r.statut === "CONFIRMEE" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                    {r.statut === "CONFIRMEE" ? "Confirmé" : "Liste d'attente"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Envoyer un email">
                    <Mail size={14} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-event analytics + sponsors management */}
      {!Number.isNaN(eventId) && <EventManagementPanels eventId={eventId} />}
    </div>
  );
}
