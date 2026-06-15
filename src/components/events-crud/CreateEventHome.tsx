// ============================================================
// UNIEVENT — Phase 5B2: CreateEventHome
// ============================================================

"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { EventForm } from "@/components/events-crud/EventForm";
import { getDefaultFormData } from "@/lib/events-crud-data";
import { useAuthStore } from "@/store/auth.store";
import { redirect } from "next/navigation";

export function CreateEventHome() {
  const { canCreateEvents, user } = useAuthStore();

  if (!canCreateEvents()) {
    return (
      <div className="min-h-screen bg-[#0c0c0f] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-white/50">Vous n'avez pas les droits pour créer un événement.</p>
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/dashboard/events/mine"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft size={14} />
            Mes événements
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Créer un événement</h1>
              <p className="text-white/50 text-sm mt-1">
                Remplissez le formulaire ci-dessous. Votre événement sera soumis pour approbation.
              </p>
            </div>
          </div>

          {/* Info banner */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.07] p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-indigo-400 text-xs font-bold">i</span>
            </div>
            <p className="text-sm text-indigo-300/80">
              Après création, votre événement passera par un processus d'approbation (
              <strong className="text-indigo-300">Vérification → Responsable → Doyen</strong>)
              avant d'être publié.
            </p>
          </div>
        </div>

        {/* Form */}
        <EventForm mode="create" initialData={getDefaultFormData()} />
      </div>
    </div>
  );
}
