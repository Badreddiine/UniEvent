"use client";

import { useState } from "react";
import { BackButton } from "@/components/shared/back-button";
import { motion } from "framer-motion";
import { Building2, Users, Wifi, Projector, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const ROOMS = [
  { id: "r1", name: "Amphithéâtre Principal", building: "Bâtiment Central", capacity: 500, type: "amphitheatre", equipment: ["Projecteur", "Sonorisation", "WiFi", "Climatisation"], status: "disponible" as const, isPMRAccessible: true },
  { id: "r2", name: "Salle de Conférence A201", building: "Bâtiment A", capacity: 80, type: "salle_conference", equipment: ["Projecteur", "Tableau blanc", "WiFi"], status: "disponible" as const, isPMRAccessible: true },
  { id: "r3", name: "Salle Informatique B104", building: "Bâtiment B", capacity: 30, type: "salle_informatique", equipment: ["Ordinateurs (30)", "Projecteur", "WiFi"], status: "disponible" as const, isPMRAccessible: false },
  { id: "r4", name: "Aula Magna", building: "Bâtiment Administratif", capacity: 200, type: "aula", equipment: ["Scène", "Sono professionnelle", "Éclairage", "Projecteur"], status: "maintenance" as const, isPMRAccessible: true },
  { id: "r5", name: "Espace Extérieur Campus", building: "Extérieur", capacity: 1000, type: "espace_exterieur", equipment: ["Électricité", "Points d'eau"], status: "disponible" as const, isPMRAccessible: true },
  { id: "r6", name: "Salle de Réunion R10", building: "Bâtiment A", capacity: 20, type: "salle_conference", equipment: ["TV 75\"", "WiFi", "Tableau blanc"], status: "disponible" as const, isPMRAccessible: false },
];

const TYPE_LABELS: Record<string, string> = {
  amphitheatre: "Amphithéâtre",
  salle_conference: "Salle de conf.",
  salle_informatique: "Salle info.",
  espace_exterieur: "Espace extérieur",
  aula: "Aula",
};

export default function RoomsPage() {
  const [search, setSearch] = useState("");

  const filtered = ROOMS.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.building.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader
        title="Salles disponibles"
        description="Consultez les espaces disponibles sur le campus de la FST Settat."
       
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          placeholder="Rechercher une salle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((room, i) => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                <Building2 size={20} className="text-brand-600" />
              </div>
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                room.status === "disponible"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
              )}>
                {room.status === "disponible" ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {room.status === "disponible" ? "Disponible" : "Maintenance"}
              </span>
            </div>
            <h3 className="font-semibold text-sm text-foreground">{room.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{room.building} · {TYPE_LABELS[room.type]}</p>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <Users size={13} />
              <span>{room.capacity} places</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {room.equipment.slice(0, 3).map((eq) => (
                <span key={eq} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{eq}</span>
              ))}
              {room.equipment.length > 3 && (
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">+{room.equipment.length - 3}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
