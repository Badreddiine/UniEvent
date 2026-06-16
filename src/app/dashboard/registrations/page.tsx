"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BackButton } from "@/components/shared/back-button";
import {
  Ticket, Calendar, CheckCircle2, Clock, XCircle, QrCode, Loader2,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { registrationService } from "@/services/registration.service";
import { badgeService } from "@/services/badge.service";
import type { RegistrationDTO, BadgeDto } from "@/types/api";

// ── Status config ─────────────────────────────────────────────

const STATUS_CONFIG = {
  CONFIRMEE:     { label: "Confirmé",        icon: CheckCircle2, cls: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  LISTE_ATTENTE: { label: "Liste d'attente", icon: Clock,         cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  ANNULEE:       { label: "Annulé",          icon: XCircle,       cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

// ── Ticket Modal ──────────────────────────────────────────────

function TicketModal({
  reg,
  onClose,
}: {
  reg: RegistrationDTO;
  onClose: () => void;
}) {
  const [badge, setBadge] = useState<BadgeDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  // Prevent the double badge generation triggered by React StrictMode's
  // double-invoked effect (and any re-render of this modal).
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    let active = true;
    setLoading(true);
    setError(false);
    badgeService
      .generate(reg.id)
      .then((b) => { if (active) setBadge(b); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reg.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950 mb-3">
            <Ticket size={24} className="text-brand-600" />
          </div>
          <h3 className="font-bold text-foreground">{reg.evenementTitre}</h3>
          {reg.dateInscription && (
            <p className="text-xs text-muted-foreground mt-1">
              Inscrit le {formatDate(reg.dateInscription)}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center my-4">
          {loading ? (
            <div className="h-32 w-32 rounded-xl bg-muted/40 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-muted-foreground" />
            </div>
          ) : badge?.qrImage ? (
            <img
              src={`data:image/png;base64,${badge.qrImage}`}
              alt="QR Code"
              className="h-32 w-32 rounded-xl object-contain"
            />
          ) : error ? (
            <div className="h-32 w-32 rounded-xl bg-foreground/5 border-2 border-dashed border-border flex items-center justify-center">
              <QrCode size={48} className="text-foreground/30" />
            </div>
          ) : null}
        </div>
        {badge?.token && (
          <div className="rounded-lg bg-muted px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">Token</p>
            <p className="font-mono text-xs font-bold text-foreground tracking-wider mt-0.5 break-all">
              {badge.token}
            </p>
          </div>
        )}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <CheckCircle2 size={13} /> Inscription confirmée
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// ── Registration Card ─────────────────────────────────────────

function RegCard({
  reg,
  index,
  onTicket,
  onCancel,
  cancelling,
}: {
  reg: RegistrationDTO;
  index: number;
  onTicket: (r: RegistrationDTO) => void;
  onCancel: (r: RegistrationDTO) => void;
  cancelling: boolean;
}) {
  const cfg = STATUS_CONFIG[reg.statut] ?? STATUS_CONFIG.ANNULEE;
  const Icon = cfg.icon;
  const canCancel = reg.statut === "CONFIRMEE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <Link
            href={`/events/${reg.evenementId}`}
            className="font-medium text-sm text-foreground hover:text-brand-600 transition-colors line-clamp-1"
          >
            {reg.evenementTitre}
          </Link>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium flex-shrink-0", cfg.cls)}>
            <Icon size={11} />{cfg.label}
          </span>
        </div>
        {reg.dateInscription && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Calendar size={11} />
            Inscrit le {formatDate(reg.dateInscription)}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {reg.statut === "CONFIRMEE" && (
            <button
              onClick={() => onTicket(reg)}
              className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:underline"
            >
              <QrCode size={12} /> Voir mon billet
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(reg)}
              disabled={cancelling}
              className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:underline disabled:opacity-50"
            >
              {cancelling ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              {cancelling ? "Annulation…" : "Annuler l'inscription"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────

type Tab = "CONFIRMEE" | "LISTE_ATTENTE" | "ANNULEE";

export default function RegistrationsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("CONFIRMEE");
  const [ticketReg, setTicketReg] = useState<RegistrationDTO | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const { data: registrations, isLoading, error } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: registrationService.getMyRegistrations,
  });

  const cancelMutation = useMutation({
    mutationFn: (evenementId: number) => registrationService.cancel(evenementId),
    onMutate: (evenementId) => setCancellingId(evenementId),
    onSettled: () => setCancellingId(null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-registrations"] }),
  });

  const confirmed = registrations?.filter((r) => r.statut === "CONFIRMEE") ?? [];
  const waitlist = registrations?.filter((r) => r.statut === "LISTE_ATTENTE") ?? [];
  const cancelled = registrations?.filter((r) => r.statut === "ANNULEE") ?? [];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "CONFIRMEE",     label: "Confirmées",     count: confirmed.length },
    { key: "LISTE_ATTENTE", label: "Liste d'attente", count: waitlist.length },
    { key: "ANNULEE",       label: "Annulées",        count: cancelled.length },
  ];

  const visible =
    activeTab === "CONFIRMEE"
      ? confirmed
      : activeTab === "LISTE_ATTENTE"
      ? waitlist
      : cancelled;

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader
        title="Mes inscriptions"
        description="Toutes vos inscriptions aux événements universitaires."
      />

      {/* Summary counts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tabs.map(({ key, label, count }) => {
          const cfg = STATUS_CONFIG[key];
          return (
            <div key={key} className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
              activeTab === key
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-muted text-xs font-semibold">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : error ? (
        <p className="text-sm text-rose-500">Erreur lors du chargement de vos inscriptions.</p>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Ticket size={36} className="mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucune inscription dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((reg, i) => (
            <RegCard
              key={reg.id}
              reg={reg}
              index={i}
              onTicket={setTicketReg}
              onCancel={(r) => cancelMutation.mutate(r.evenementId)}
              cancelling={cancellingId === reg.evenementId}
            />
          ))}
        </div>
      )}

      {/* Ticket Modal */}
      {ticketReg && (
        <TicketModal reg={ticketReg} onClose={() => setTicketReg(null)} />
      )}
    </div>
  );
}
