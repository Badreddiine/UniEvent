// ============================================================
// UNIEVENT — EventsVerifyHome
// Fix #6 — Interface dédiée au responsable_evenements pour
// vérifier/valider les événements soumis par les présidents
// de clubs, avant transmission au Doyen pour approbation finale.
// ============================================================

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Eye, Clock, FileText,
  Calendar, Users, Building2, ArrowLeft, ShieldOff,
  AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

// ── Fake data — événements soumis en attente de vérification ──

const PENDING_EVENTS = [
  {
    id: "v1",
    title: "Hackathon IA & Machine Learning 2025",
    club: "Club Tech FST",
    category: "competition",
    submittedBy: "Ahmed Benali",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    date: "2025-06-28",
    capacity: 150,
    description: "Un hackathon de 24h autour de l'intelligence artificielle et du machine learning. Les équipes de 3 à 5 personnes devront développer une solution innovante.",
    roomRequested: "Amphithéâtre Principal",
    budget: 12000,
    isUrgent: true,
  },
  {
    id: "v2",
    title: "Conférence sur les énergies renouvelables",
    club: "Club Environnement",
    category: "conference",
    submittedBy: "Sara El Idrissi",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    date: "2025-07-05",
    capacity: 200,
    description: "Conférence avec des experts en énergies renouvelables et développement durable. Intervenants de 3 universités partenaires.",
    roomRequested: "Salle de Conférence B",
    budget: 5000,
    isUrgent: false,
  },
  {
    id: "v3",
    title: "Atelier Entrepreneuriat & Startup",
    club: "Club Business",
    category: "atelier",
    submittedBy: "Youssef Tahir",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    date: "2025-07-12",
    capacity: 50,
    description: "Atelier pratique pour apprendre les bases de la création d'entreprise, du business plan et du pitch.",
    roomRequested: "Salle Informatique C203",
    budget: 2500,
    isUrgent: false,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  conference: "Conférence",
  atelier: "Atelier",
  competition: "Compétition",
  culturel: "Culturel",
  sportif: "Sportif",
  autre: "Autre",
};

type VerifyStatus = "pending" | "verified" | "rejected";

export function EventsVerifyHome() {
  const { user } = useAuthStore();

  // Fix #6 — Garde de rôle : seuls responsable_evenements et admin
  if (!user || (user.role !== "responsable_evenements" && user.role !== "admin")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600">
          <ShieldOff size={28} />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">Accès refusé</p>
          <p className="text-sm text-muted-foreground mt-1">
            Seul le Responsable Événements peut accéder à cette interface.
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors">
          ← Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const [statuses, setStatuses] = useState<Record<string, VerifyStatus>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const getStatus = (id: string): VerifyStatus => statuses[id] ?? "pending";
  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const pending = PENDING_EVENTS.filter(e => getStatus(e.id) === "pending");
  const done    = PENDING_EVENTS.filter(e => getStatus(e.id) !== "pending");

  const handleDecision = (id: string, decision: "verified" | "rejected") => {
    setStatuses(prev => ({ ...prev, [id]: decision }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Tableau de bord
        </Link>
      </div>

      <PageHeader
        title="File de vérification"
        description={`${pending.length} événement(s) soumis en attente de votre vérification avant transmission au Doyen.`}
      />

      {/* Workflow info */}
      <div className="rounded-xl border border-brand-200 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-900/10 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20 text-brand-600 flex-shrink-0">
            <span className="text-xs font-bold">i</span>
          </div>
          <div className="text-sm text-brand-700 dark:text-brand-300">
            <strong>Workflow :</strong> Soumis par le club → <strong>Votre vérification</strong> → Approbation Doyen → Publication
            <br />
            <span className="text-xs text-brand-600/70 dark:text-brand-400/70 mt-0.5 block">
              Après votre vérification, l'événement sera automatiquement transmis au Doyen pour approbation finale.
            </span>
          </div>
        </div>
      </div>

      {/* Pending */}
      {pending.length === 0 && done.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
          <CheckCircle2 size={40} className="mb-4 text-green-500/50" />
          <p className="text-sm text-muted-foreground">Aucun événement en attente de vérification.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            En attente — {pending.length}
          </h3>
          {pending.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950 flex-shrink-0">
                      <FileText size={18} className="text-brand-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-foreground">{event.title}</p>
                        {event.isUrgent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            <AlertTriangle size={10} /> URGENT
                          </span>
                        )}
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {CATEGORY_LABELS[event.category] ?? event.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Soumis par <strong>{event.submittedBy}</strong> · {event.club}
                      </p>
                      <div className="flex flex-wrap gap-x-4 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={11} />{new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
                        <span className="flex items-center gap-1"><Users size={11} />{event.capacity} places</span>
                        <span className="flex items-center gap-1"><Building2 size={11} />{event.roomRequested}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleExpand(event.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Eye size={13} />
                      {expanded[event.id] ? "Masquer" : "Détails"}
                      {expanded[event.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded[event.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-border/50 space-y-3"
                  >
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                      <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Budget demandé</p>
                        <p className="text-sm font-semibold text-foreground">{event.budget?.toLocaleString("fr-FR")} MAD</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Salle souhaitée</p>
                        <p className="text-sm text-foreground">{event.roomRequested}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                        Commentaire (optionnel)
                      </label>
                      <textarea
                        value={comments[event.id] ?? ""}
                        onChange={(e) => setComments(prev => ({ ...prev, [event.id]: e.target.value }))}
                        placeholder="Ajoutez une note pour le Doyen ou pour le club..."
                        rows={2}
                        className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-border/30">
                  <button
                    onClick={() => handleDecision(event.id, "rejected")}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <XCircle size={13} /> Rejeter
                  </button>
                  <button
                    onClick={() => handleDecision(event.id, "verified")}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors"
                  >
                    <CheckCircle2 size={13} /> Vérifier & transmettre au Doyen
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Traités — {done.length}</h3>
          {done.map((event) => (
            <div
              key={event.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
                getStatus(event.id) === "verified"
                  ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10"
                  : "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10"
              )}
            >
              {getStatus(event.id) === "verified"
                ? <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                : <XCircle size={16} className="text-red-500 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground">{event.title}</span>
                <span className="text-muted-foreground text-xs ml-2">— {event.club}</span>
              </div>
              <span className={cn(
                "text-xs font-semibold flex-shrink-0",
                getStatus(event.id) === "verified" ? "text-green-600 dark:text-green-400" : "text-red-500"
              )}>
                {getStatus(event.id) === "verified" ? "Vérifié — transmis au Doyen" : "Rejeté"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
