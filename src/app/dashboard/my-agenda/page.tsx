"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BackButton } from "@/components/shared/back-button";
import { Calendar, Ticket } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { cn, formatDate } from "@/lib/utils";
import { registrationService } from "@/services/registration.service";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function MyAgendaPage() {
  const { data: registrations, isLoading, error } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: registrationService.getMyRegistrations,
  });

  const confirmed = (registrations ?? []).filter((r) => r.statut === "CONFIRMEE");

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader title="Mon Agenda" description="Vos événements auxquels vous êtes inscrit(e)." />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">Erreur lors du chargement de vos inscriptions.</p>
      ) : confirmed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
          <Calendar size={40} className="mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Vous n'êtes inscrit(e) à aucun événement.</p>
          <Link href="/dashboard/events" className="mt-4 text-sm text-brand-600 hover:underline">
            Parcourir les événements →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {confirmed.map((reg, i) => (
            <motion.div key={reg.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <Link href={`/events/${reg.evenementId}`} className="font-semibold text-sm text-foreground hover:text-brand-600 transition-colors">
                    {reg.evenementTitre ?? `Événement #${reg.evenementId}`}
                  </Link>
                </div>
                <div className="flex flex-wrap gap-x-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />{formatDate(reg.dateInscription)}
                  </span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <Ticket size={11} /> Inscrit(e) · Confirmé
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
