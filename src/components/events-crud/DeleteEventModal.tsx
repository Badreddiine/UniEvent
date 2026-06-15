// ============================================================
// UNIEVENT — Phase 5B2: DeleteEventModal
// ============================================================

"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ManagedEvent } from "@/lib/events-crud-data";

interface DeleteEventModalProps {
  event: ManagedEvent;
  onConfirm: (eventId: string) => Promise<void>;
  onCancel: () => void;
}

export function DeleteEventModal({ event, onConfirm, onCancel }: DeleteEventModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isConfirmed = confirmText === event.title;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    await onConfirm(event.id);
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.10] bg-[#15151f] shadow-2xl">
        {/* Close */}
        {!isDeleting && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        <div className="p-6 space-y-5">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">Supprimer l'événement</h2>
            <p className="text-sm text-white/50 mt-1">
              Cette action est <span className="text-red-400 font-medium">irréversible</span>.
              Toutes les inscriptions seront annulées.
            </p>
          </div>

          {/* Event info */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 flex gap-3">
            {event.coverUrl && (
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                <img src={event.coverUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{event.title}</p>
              <p className="text-xs text-white/40 mt-0.5">
                {event.registeredCount} inscrit{event.registeredCount > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                {new Date(event.startDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Confirmation input */}
          {event.registeredCount > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-white/50">
                Pour confirmer, tapez le titre de l'événement :
              </label>
              <p className="text-xs font-mono text-white/40 bg-white/[0.04] rounded px-2 py-1 select-all">
                {event.title}
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Tapez le titre ici..."
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-sm text-white",
                  "bg-white/[0.05] placeholder:text-white/20",
                  "focus:outline-none focus:ring-2 focus:ring-red-500/40",
                  "transition-colors",
                  confirmText && !isConfirmed
                    ? "border-red-500/40"
                    : confirmText && isConfirmed
                    ? "border-emerald-500/40"
                    : "border-white/[0.10]"
                )}
                disabled={isDeleting}
              />
            </div>
          )}

          {/* Warning */}
          {event.registeredCount > 0 && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex gap-2">
              <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400">
                {event.registeredCount} participant{event.registeredCount > 1 ? "s" : ""} seront
                automatiquement notifié{event.registeredCount > 1 ? "s" : ""} de l'annulation.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-lg border border-white/[0.10] text-white/60 hover:text-white hover:border-white/20 text-sm font-medium transition-colors disabled:opacity-40"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || (event.registeredCount > 0 && !isConfirmed)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Supprimer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
