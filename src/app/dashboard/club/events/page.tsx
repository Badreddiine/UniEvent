"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { motion } from "framer-motion";
import { Plus, Calendar, Users, Edit, Trash2, Eye, Send, XCircle } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { eventService } from "@/services/event.service";
import type { StatutEvenementEnum, CategorieEnum, CreateEventRequest } from "@/types/api";
import Link from "next/link";
import { useForm } from "react-hook-form";

const STATUT_LABEL: Record<StatutEvenementEnum, string> = {
  BROUILLON: "Brouillon", SOUMIS: "Soumis", VERIFIE: "Vérifié",
  RESERVATION_EN_ATTENTE: "Rés. en attente", APPROUVE: "Approuvé",
  REJETE: "Rejeté", ANNULE: "Annulé", TERMINE: "Terminé",
};

const CATEGORIES: CategorieEnum[] = ["CONFERENCE", "ATELIER", "COMPETITION", "CULTUREL", "SPORTIF", "SORTIE", "AUTRE"];

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function ClubEventsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateEventRequest>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-events"],
    queryFn: () => eventService.list({ size: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEventRequest) => eventService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-events"] }); setShowForm(false); reset(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateEventRequest> }) => eventService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-events"] }); setShowForm(false); setEditId(null); reset(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => eventService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-events"] }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => eventService.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-events"] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => eventService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-events"] }),
  });

  function onSubmit(values: CreateEventRequest) {
    if (editId) {
      updateMutation.mutate({ id: editId, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  const events = data?.content ?? [];

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader title="Mes événements" description="Gérez vos événements de club.">
        <button
          onClick={() => { setShowForm(true); setEditId(null); reset(); }}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} /> Nouvel événement
        </button>
      </PageHeader>

      {/* Create/Edit Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {editId ? "Modifier l'événement" : "Créer un événement"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Titre *</label>
              <input {...register("titre", { required: true })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
              {errors.titre && <p className="text-xs text-red-500 mt-1">Requis</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Catégorie *</label>
              <select {...register("categorie", { required: true })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Capacité</label>
              <input {...register("capacite", { valueAsNumber: true })} type="number" min={1}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date début *</label>
              <input {...register("dateDebut", { required: true })} type="datetime-local"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date fin *</label>
              <input {...register("dateFin", { required: true })} type="datetime-local"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea {...register("description")} rows={3}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none resize-none" />
            </div>
            {(createMutation.error || updateMutation.error) && (
              <p className="sm:col-span-2 text-xs text-red-500">Erreur lors de la sauvegarde.</p>
            )}
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); reset(); }}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
                {editId ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : error ? (
        <p className="text-sm text-red-500">Erreur lors du chargement des événements.</p>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Calendar size={40} className="mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucun événement. Créez votre premier événement.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev, i) => (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{ev.titre}</p>
                  <div className="flex flex-wrap gap-x-4 mt-1 text-xs text-muted-foreground">
                    {ev.dateDebut && <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(ev.dateDebut)}</span>}
                    <span className="flex items-center gap-1"><Users size={11} />{ev.registrationCount}{ev.capacite ? `/${ev.capacite}` : ""}</span>
                  </div>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium flex-shrink-0",
                  ev.statut === "APPROUVE" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : ev.statut === "REJETE" || ev.statut === "ANNULE" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  : ev.statut === "SOUMIS" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400")}>
                  {STATUT_LABEL[ev.statut ?? "BROUILLON"]}
                </span>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Link href={`/events/${ev.id}`}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                  <Eye size={12} /> Voir
                </Link>
                {ev.statut === "BROUILLON" && (
                  <>
                    <button onClick={() => publishMutation.mutate(ev.id)} disabled={publishMutation.isPending}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
                      <Send size={12} /> Soumettre
                    </button>
                    <button onClick={() => deleteMutation.mutate(ev.id)} disabled={deleteMutation.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors dark:border-red-800 dark:hover:bg-red-900/20 disabled:opacity-50">
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </>
                )}
                {(ev.statut === "APPROUVE" || ev.statut === "SOUMIS") && (
                  <button onClick={() => cancelMutation.mutate(ev.id)} disabled={cancelMutation.isPending}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors dark:border-red-800 dark:hover:bg-red-900/20 disabled:opacity-50">
                    <XCircle size={12} /> Annuler
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
