"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { FileText, Download, Sheet } from "lucide-react";
import { eventService } from "@/services/event.service";
import { reportService } from "@/services/report.service";
import { toast } from "sonner";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function ClubReportsPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["my-events-list"],
    queryFn: () => eventService.list({ size: 100 }),
  });

  async function download(type: "pdf" | "xlsx") {
    if (!selectedEventId) return;
    setDownloading(type);
    try {
      if (type === "pdf") {
        await reportService.downloadAttendancePdf(selectedEventId);
      } else {
        await reportService.downloadSummaryExcel(selectedEventId);
      }
    } catch {
      toast.error("Erreur lors du téléchargement.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader title="Rapports" description="Téléchargez les rapports de vos événements." />

      {isLoading ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <FileText size={20} className="text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Rapport de présence (PDF)</p>
                <p className="text-xs text-muted-foreground">Liste complète des inscrits avec QR codes</p>
              </div>
            </div>
            <button
              onClick={() => download("pdf")}
              disabled={downloading === "pdf"}
              className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Download size={14} />
              {downloading === "pdf" ? "Téléchargement…" : "Télécharger PDF"}
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <Sheet size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Résumé événement (Excel)</p>
                <p className="text-xs text-muted-foreground">Inscriptions, salles et sponsors</p>
              </div>
            </div>
            <button
              onClick={() => download("xlsx")}
              disabled={downloading === "xlsx"}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download size={14} />
              {downloading === "xlsx" ? "Téléchargement…" : "Télécharger Excel"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
