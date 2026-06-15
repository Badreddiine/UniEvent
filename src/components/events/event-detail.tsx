"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar, Users, ArrowLeft, Info, GraduationCap,
  CheckCircle2, Ticket, AlertCircle, Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { eventService } from "@/services/event.service";
import { registrationService } from "@/services/registration.service";
import { partnerService } from "@/services/partner.service";
import { useAuthStore } from "@/store/auth.store";

// ── Sponsors (lecture seule) ──────────────────────────────────
function EventSponsors({ eventId }: { eventId: number }) {
  const { data: sponsors } = useQuery({
    queryKey: ["event-sponsors", eventId],
    queryFn: () => partnerService.getEventSponsors(eventId),
    enabled: !Number.isNaN(eventId),
  });
  const confirmed = (sponsors ?? []).filter((s) => s.confirme);
  if (confirmed.length === 0) return null;
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4">Sponsors</h2>
      <div className="flex flex-wrap gap-3">
        {confirmed.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            {s.partenaire?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.partenaire.logoUrl} alt={s.partenaire?.nom ?? ""} className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-brand-500/15 flex items-center justify-center text-brand-600 text-sm font-bold">
                {(s.partenaire?.nom ?? "?")[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">{s.partenaire?.nom ?? "Partenaire"}</p>
              {s.niveau && <p className="text-[11px] text-muted-foreground">{s.niveau}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-sm text-foreground shadow-sm">
      <span className="text-primary">{icon}</span>
      {label}
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export function EventDetail({ eventId }: { eventId: string }) {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventService.get(Number(eventId)),
  });

  const { data: myRegistrations } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: registrationService.getMyRegistrations,
    enabled: isAuthenticated,
  });

  const myReg = myRegistrations?.find((r) => r.evenementId === Number(eventId));

  const registerMutation = useMutation({
    mutationFn: () => registrationService.register(Number(eventId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-registrations"] });
      qc.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => registrationService.cancel(Number(eventId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-registrations"] });
      qc.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-80 w-full rounded-none" />
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-40" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Événement introuvable</p>
          <Link href="/events" className="text-primary hover:underline text-sm">
            Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  const fillRate = event.capacite
    ? Math.round((event.registrationCount / event.capacite) * 100)
    : 0;
  const isFull = event.capacite ? event.registrationCount >= event.capacite : false;
  const remaining = event.capacite ? event.capacite - event.registrationCount : null;
  const isRegistered = myReg?.statut === "CONFIRMEE";
  const isWaitlisted = myReg?.statut === "LISTE_ATTENTE";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800">
        {event.affiche && (
          <img src={event.affiche} alt={event.titre} className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute top-4 left-4">
          <Link href="/events"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 text-white text-sm hover:bg-black/50 transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Retour</span>
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            {event.categorie && (
              <span className="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                {event.categorie}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{event.titre}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-wrap gap-3">
              {event.dateDebut && (
                <InfoChip icon={<Calendar className="w-4 h-4" />} label={formatDate(event.dateDebut)} />
              )}
              {event.dateDebut && event.dateFin && (
                <InfoChip icon={<Calendar className="w-4 h-4" />}
                  label={`${formatTime(event.dateDebut)} — ${formatTime(event.dateFin)}`} />
              )}
              <InfoChip icon={<Users className="w-4 h-4" />}
                label={`${event.registrationCount}${event.capacite ? `/${event.capacite}` : ""} participants`} />
            </div>

            {event.description && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  À propos de l'événement
                </h2>
                <div className="bg-card border border-border rounded-2xl p-6">
                  {event.description.split("\n\n").map((para, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed text-[15px] mb-4 last:mb-0">{para}</p>
                  ))}
                </div>
              </section>
            )}

            {event.organisateurNom && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Organisateur
                </h2>
                <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {event.organisateurNom[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{event.organisateurNom}</p>
                    {event.clubNom && <p className="text-primary text-sm">{event.clubNom}</p>}
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                </div>
              </section>
            )}

            <EventSponsors eventId={Number(eventId)} />

            {event.lienVisio && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Lien de visioconférence</h2>
                <a href={event.lienVisio} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                  {event.lienVisio}
                </a>
              </section>
            )}
          </div>

          {/* Right sidebar — registration */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
              {event.capacite && (
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{event.registrationCount}</span> inscrits
                    </span>
                    <span className="text-muted-foreground">
                      Capacité : <span className="font-semibold text-foreground">{event.capacite}</span>
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(fillRate, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn("h-full rounded-full",
                        isFull ? "bg-rose-500" : fillRate > 80 ? "bg-amber-400" : "bg-emerald-500")}
                    />
                  </div>
                  {remaining !== null && remaining <= 10 && !isFull && (
                    <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Plus que {remaining} place{remaining !== 1 ? "s" : ""} !
                    </p>
                  )}
                </div>
              )}

              {!isAuthenticated ? (
                <Link href="/auth/login"
                  className="block w-full py-3 text-center rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all">
                  Se connecter pour s'inscrire
                </Link>
              ) : isRegistered ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    Inscription confirmée !
                  </div>
                  <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}
                    className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-900/20">
                    {cancelMutation.isPending ? "Annulation…" : "Annuler mon inscription"}
                  </button>
                </div>
              ) : isWaitlisted ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                    <Ticket className="w-5 h-5" />
                    Sur liste d'attente
                  </div>
                  <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}
                    className="w-full py-2.5 rounded-xl border border-border text-muted-foreground text-sm hover:bg-muted transition-colors disabled:opacity-50">
                    {cancelMutation.isPending ? "Annulation…" : "Quitter la liste d'attente"}
                  </button>
                </div>
              ) : isFull ? (
                <button onClick={() => registerMutation.mutate()} disabled={registerMutation.isPending}
                  className="w-full py-3.5 rounded-xl bg-amber-100 text-amber-700 font-semibold text-sm hover:bg-amber-200 transition-all disabled:opacity-50 dark:bg-amber-900/20 dark:text-amber-400">
                  {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Rejoindre la liste d'attente"}
                </button>
              ) : (
                <button onClick={() => registerMutation.mutate()} disabled={registerMutation.isPending}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all">
                  {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "S'inscrire maintenant"}
                </button>
              )}

              {registerMutation.error && (
                <p className="text-xs text-red-500 mt-2 text-center">Erreur lors de l'inscription.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
