"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Calendar, Tag, ChevronDown, Sparkles,
  Filter, LayoutGrid, List, ChevronLeft, ChevronRight, LogIn,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { eventService } from "@/services/event.service";
import { CATEGORY_LABELS, EventCard } from "./event-card";
import type { CategorieEnum } from "@/types/api";

// ── Types ─────────────────────────────────────────────────────

type DateRange = "all" | "this_week" | "this_month";

interface Filters {
  search: string;
  categorie: CategorieEnum | "all";
  dateRange: DateRange;
}

const INITIAL_FILTERS: Filters = { search: "", categorie: "all", dateRange: "all" };
const PAGE_SIZE = 12;

// ── Helpers ───────────────────────────────────────────────────

function getDateParams(range: DateRange) {
  if (range === "all") return {};
  const now = new Date();
  const dateFrom = now.toISOString().slice(0, 10);
  if (range === "this_week") {
    const end = new Date(now.getTime() + 7 * 86400000);
    return { dateFrom, dateTo: end.toISOString().slice(0, 10) };
  }
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { dateFrom, dateTo: end.toISOString().slice(0, 10) };
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className ?? ""}`} />;
}

function FilterSelect({
  label, icon, value, onChange, options,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer transition-all">
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export function EventsHome() {
  const { isAuthenticated } = useAuthStore();
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(0);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };
  const resetFilters = () => { setFilters(INITIAL_FILTERS); setPage(0); };

  const dateParams = getDateParams(filters.dateRange);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["events-public", filters.categorie, filters.dateRange, page],
    queryFn: () =>
      eventService.list({
        statut: "APPROUVE",
        ...(filters.categorie !== "all" ? { categorie: filters.categorie } : {}),
        ...dateParams,
        page,
        size: PAGE_SIZE,
      }),
    staleTime: 60000,
  });

  const events = useMemo(() => {
    const list = data?.content ?? [];
    if (!filters.search) return list;
    const q = filters.search.toLowerCase();
    return list.filter(
      (ev) =>
        ev.titre.toLowerCase().includes(q) ||
        (ev.description ?? "").toLowerCase().includes(q) ||
        (ev.clubNom ?? "").toLowerCase().includes(q) ||
        (ev.organisateurNom ?? "").toLowerCase().includes(q)
    );
  }, [data, filters.search]);

  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;
  const filtersActive = (filters.categorie !== "all" ? 1 : 0) + (filters.dateRange !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 dark:from-[hsl(232_84%_10%)] dark:via-[hsl(232_84%_16%)] dark:to-[hsl(232_84%_28%)]">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-gold" />
              {isLoading ? "Chargement…" : `${totalElements} événement${totalElements !== 1 ? "s" : ""} à découvrir`}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-4 tracking-tight">
              Événements<span className="block text-gold/90">Universitaires</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
              Conférences, ateliers, compétitions, sorties... Explorez et réservez votre place.
            </p>

            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Rechercher un événement, un club, un organisateur..."
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 text-base focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
              />
              {filters.search && (
                <button onClick={() => setFilter("search", "")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Login prompt for unauthenticated users */}
      {!isAuthenticated && (
        <div className="bg-brand-50 dark:bg-brand-950/30 border-b border-brand-200 dark:border-brand-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-brand-700 dark:text-brand-300">
              Connectez-vous pour vous inscrire aux événements.
            </p>
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex-shrink-0">
              <LogIn className="w-4 h-4" />
              Se connecter
            </Link>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                showFilters || filtersActive > 0
                  ? "bg-primary text-primary-foreground border-primary shadow-glow"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              )}
            >
              <Filter className="w-4 h-4" />
              Filtres
              {filtersActive > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">{filtersActive}</span>
              )}
            </button>
            {filtersActive > 0 && (
              <button onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
                <X className="w-3.5 h-3.5" />Réinitialiser
              </button>
            )}
            <p className="text-sm text-muted-foreground ml-auto sm:ml-0">
              <span className="font-semibold text-foreground">{events.length}</span>{" "}
              événement{events.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border border-border self-end sm:self-auto">
            {(["grid", "list"] as const).map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={cn("p-1.5 rounded-md transition-all", viewMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {mode === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="bg-card border border-border rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FilterSelect
                  label="Catégorie" icon={<Tag className="w-4 h-4" />}
                  value={filters.categorie}
                  onChange={(v) => setFilter("categorie", v as CategorieEnum | "all")}
                  options={[
                    { value: "all", label: "Toutes les catégories" },
                    ...Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l })),
                  ]}
                />
                <FilterSelect
                  label="Date" icon={<Calendar className="w-4 h-4" />}
                  value={filters.dateRange}
                  onChange={(v) => setFilter("dateRange", v as DateRange)}
                  options={[
                    { value: "all", label: "Toutes les dates" },
                    { value: "this_week", label: "Cette semaine" },
                    { value: "this_month", label: "Ce mois" },
                  ]}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events */}
        {isLoading ? (
          <div className={cn(viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-4")}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Skeleton key={i} className={viewMode === "grid" ? "h-80" : "h-28"} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground mb-4">Erreur lors du chargement des événements.</p>
            <button onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              Réessayer
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xl font-display font-semibold text-foreground mb-2">Aucun événement trouvé</p>
            <p className="text-muted-foreground mb-6">Essayez de modifier vos filtres ou votre recherche</p>
            <button onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              <X className="w-4 h-4" />Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <motion.div key={`${page}-${filters.categorie}`}
                className={cn(viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-4")}>
                {events.map((ev, i) => (
                  <motion.div key={ev.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
                    <EventCard event={ev} listMode={viewMode === "list"} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors">
                  <ChevronLeft className="w-4 h-4" />Précédent
                </button>
                <span className="text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{page + 1}</span> / {totalPages}
                </span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors">
                  Suivant<ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
