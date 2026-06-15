"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Award, Plus, Trash2, Loader2, CheckCircle2, Clock } from "lucide-react";
import { analyticsService } from "@/services/analytics.service";
import { partnerService } from "@/services/partner.service";
import type { NiveauSponsorEnum } from "@/types/api";
import { cn } from "@/lib/utils";

const NIVEAUX: NiveauSponsorEnum[] = ["PLATINE", "OR", "ARGENT", "BRONZE"];
const NIVEAU_CLS: Record<NiveauSponsorEnum, string> = {
  PLATINE: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
  OR: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ARGENT: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  BRONZE: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

// ── Per-event analytics ───────────────────────────────────────
function EventStats({ eventId }: { eventId: number }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["event-stats", eventId],
    queryFn: () => analyticsService.getEventStats(eventId),
    enabled: !Number.isNaN(eventId),
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-brand-600" />
        <h2 className="text-sm font-semibold text-foreground">Statistiques de l'événement</h2>
      </div>
      {isLoading ? (
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      ) : !stats ? (
        <p className="text-sm text-muted-foreground">Statistiques indisponibles.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Metric label="Confirmés" value={stats.confirmedRegistrations} cls="text-green-600 dark:text-green-400" />
          <Metric label="Liste d'attente" value={stats.waitlistSize} cls="text-amber-600 dark:text-amber-400" />
          <Metric label="Annulés" value={stats.cancelledRegistrations} cls="text-red-600 dark:text-red-400" />
          <Metric label="Taux de présence" value={`${Math.round(stats.attendanceRate ?? 0)}%`} cls="text-brand-600" />
        </div>
      )}
    </section>
  );
}

function Metric({ label, value, cls }: { label: string; value: number | string; cls: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <p className={cn("text-xl font-bold", cls)}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// ── Sponsors management ───────────────────────────────────────
function SponsorsManager({ eventId }: { eventId: number }) {
  const qc = useQueryClient();
  const [partenaireId, setPartenaireId] = useState("");
  const [niveau, setNiveau] = useState<NiveauSponsorEnum>("OR");
  const [montant, setMontant] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const { data: sponsors } = useQuery({
    queryKey: ["event-sponsors", eventId],
    queryFn: () => partnerService.getEventSponsors(eventId),
    enabled: !Number.isNaN(eventId),
  });
  const { data: partners } = useQuery({
    queryKey: ["partners"],
    queryFn: partnerService.list,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["event-sponsors", eventId] });

  const addMutation = useMutation({
    mutationFn: () =>
      partnerService.addSponsor(eventId, {
        partenaireId,
        niveau,
        montant: montant ? Number(montant) : undefined,
      }),
    onSuccess: () => { invalidate(); setPartenaireId(""); setMontant(""); setErr(null); },
    onError: () => setErr("Ajout impossible (partenaire déjà sponsor ?)."),
  });

  const removeMutation = useMutation({
    mutationFn: (sponsorId: string) => partnerService.removeSponsor(eventId, sponsorId),
    onSuccess: invalidate,
  });

  function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!partenaireId) { setErr("Sélectionnez un partenaire."); return; }
    addMutation.mutate();
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Award size={16} className="text-brand-600" />
        <h2 className="text-sm font-semibold text-foreground">Sponsors de l'événement</h2>
      </div>

      {/* Existing sponsors */}
      <div className="space-y-2 mb-4">
        {(sponsors ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun sponsor pour cet événement.</p>
        )}
        {(sponsors ?? []).map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">{s.partenaire?.nom ?? "Partenaire"}</span>
              {s.niveau && (
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", NIVEAU_CLS[s.niveau])}>{s.niveau}</span>
              )}
              <span className={cn("inline-flex items-center gap-1 text-[10px]", s.confirme ? "text-green-600" : "text-amber-600")}>
                {s.confirme ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                {s.confirme ? "Confirmé" : "En attente"}
              </span>
              {s.montant != null && <span className="text-[10px] text-muted-foreground">{s.montant} MAD</span>}
            </div>
            <button
              onClick={() => removeMutation.mutate(s.id)}
              disabled={removeMutation.isPending}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              title="Retirer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add sponsor */}
      <form onSubmit={add} className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
        <div className="flex-1 min-w-[140px]">
          <label className="text-[11px] font-medium text-muted-foreground">Partenaire</label>
          <select value={partenaireId} onChange={(e) => setPartenaireId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none">
            <option value="">Sélectionner…</option>
            {(partners ?? []).map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-muted-foreground">Niveau</label>
          <select value={niveau} onChange={(e) => setNiveau(e.target.value as NiveauSponsorEnum)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none">
            {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="w-24">
          <label className="text-[11px] font-medium text-muted-foreground">Montant</label>
          <input type="number" min={0} value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="MAD"
            className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none" />
        </div>
        <button type="submit" disabled={addMutation.isPending}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
          {addMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Ajouter
        </button>
      </form>
      {err && <p className="mt-2 text-xs text-red-500">{err}</p>}
    </section>
  );
}

export function EventManagementPanels({ eventId }: { eventId: number }) {
  return (
    <div className="space-y-6">
      <EventStats eventId={eventId} />
      <SponsorsManager eventId={eventId} />
    </div>
  );
}
