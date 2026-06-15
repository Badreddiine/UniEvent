"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Search, Users, Calendar, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const CLUBS = [
  { id: "c1", name: "Club Informatique", category: "Scientifique", president: "Ahmed Benali", members: 48, activeEvents: 3, logoColor: "bg-blue-500" },
  { id: "c2", name: "Club Robotique", category: "Scientifique", president: "Sara Idrissi", members: 32, activeEvents: 2, logoColor: "bg-purple-500" },
  { id: "c3", name: "Club Culturel", category: "Culturel", president: "Youssef Tahir", members: 65, activeEvents: 4, logoColor: "bg-amber-500" },
  { id: "c4", name: "Club Économie", category: "Académique", president: "Nora Alami", members: 41, activeEvents: 1, logoColor: "bg-green-500" },
  { id: "c5", name: "Club Sport", category: "Sportif", president: "Karim Boussi", members: 78, activeEvents: 5, logoColor: "bg-red-500" },
  { id: "c6", name: "Club Photo", category: "Artistique", president: "Leila Mansouri", members: 27, activeEvents: 2, logoColor: "bg-pink-500" },
];

export default function AdminClubsHome() {
  const [search, setSearch] = useState("");
  const filtered = CLUBS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion des clubs" description={`${CLUBS.length} clubs enregistrés sur la plateforme.`}>
        <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Nouveau club
        </button>
      </PageHeader>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          placeholder="Rechercher un club…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((club, i) => (
          <motion.div key={club.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-white text-sm font-bold", club.logoColor)}>
                  {club.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{club.name}</p>
                  <p className="text-xs text-muted-foreground">{club.category}</p>
                </div>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal size={16} /></button>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users size={12} />{club.members} membres</span>
              <span className="flex items-center gap-1"><Calendar size={12} />{club.activeEvents} actifs</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Président : {club.president}</p>
            <div className="mt-4 flex gap-2">
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                <Edit size={12} /> Modifier
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                <Trash2 size={12} /> Supprimer
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
