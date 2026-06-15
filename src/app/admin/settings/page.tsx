"use client";

import { useState } from "react";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { Save, SlidersHorizontal } from "lucide-react";

export default function AdminSettingsPage() {
  const [appName, setAppName] = useState("UniEvent");
  const [university, setUniversity] = useState("FST Settat");
  const [reservationDelay, setReservationDelay] = useState("72");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader title="Paramètres système" description="Configurez les paramètres globaux de la plateforme." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          <h3 className="font-semibold text-sm text-foreground">Informations générales</h3>
          <div className="space-y-4">
            {[
              { label: "Nom de l'application", value: appName, onChange: setAppName },
              { label: "Nom de l'université", value: university, onChange: setUniversity },
              { label: "Délai minimum réservation (h)", value: reservationDelay, onChange: setReservationDelay, type: "number" },
            ].map(({ label, value, onChange, type }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                <input
                  type={type || "text"}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          <h3 className="font-semibold text-sm text-foreground">Notifications & email</h3>
          <div className="space-y-3">
            {[
              "Envoyer un email à chaque soumission d'événement",
              "Alerter le doyen pour les demandes urgentes",
              "Rappel 24h avant chaque événement",
              "Rapport hebdomadaire par email",
            ].map((label) => (
              <label key={label} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{label}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500" />
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
          <Save size={16} />
          {saved ? "Enregistré ✓" : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
