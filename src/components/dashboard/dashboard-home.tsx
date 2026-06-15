"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Users, TrendingUp, Award,
  Clock, CheckCircle2, Zap,
  ArrowRight, FileText, Star,
  Building2, BookOpen, BarChart2,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { StatCard } from "@/components/shared/stat-card";
import { analyticsService } from "@/services/analytics.service";
import { reservationService } from "@/services/reservation.service";
import { eventService } from "@/services/event.service";
import { registrationService } from "@/services/registration.service";
import { notificationService } from "@/services/notification.service";
import { statusFromApi } from "@/lib/event-adapters";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  conference: "Conférence",
  atelier: "Atelier",
  competition: "Compétition",
  culturel: "Culturel",
  sportif: "Sportif",
  autre: "Autre",
};

// Fix #5 — STATUS_CONFIG unifié, couvrant tous les statuts de types/index.ts
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft:               { label: "Brouillon",         className: "status-draft" },
  submitted:           { label: "Soumis",            className: "status-submitted" },
  verified:            { label: "Vérifié",           className: "status-verified" },
  pending_reservation: { label: "En attente salle",  className: "status-pending" },
  approved:            { label: "Approuvé",          className: "status-approved" },
  rejected:            { label: "Refusé",            className: "status-rejected" },
  cancelled:           { label: "Annulé",            className: "status-cancelled" },
  done:                { label: "Terminé",           className: "status-done" },
  // ReservationStatus aliases
  pending:             { label: "En attente",        className: "status-pending" },
};

// ── Custom Tooltip ─────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Shared: Activity Feed (real notifications) ─────────────────
function ActivityFeed({ maxItems = 5 }: { maxItems?: number }) {
  const { data } = useQuery({
    queryKey: ["notifications", "feed", maxItems],
    queryFn: () => notificationService.list({ size: maxItems }),
  });
  const items = (data?.content ?? []).slice(0, maxItems);

  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">Aucune activité récente.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }} className="flex items-start gap-3">
          <div className={cn("mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted", item.lu ? "text-muted-foreground" : "text-brand-500")}>
            <Zap size={13} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground leading-relaxed">{item.titre}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
            <span className="text-[10px] text-muted-foreground/70">{formatRelativeTime(item.dateEnvoi)}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Shared: Recent Events Table (real events) ─────────────────
function RecentEventsTable() {
  const { data } = useQuery({
    queryKey: ["events-recent"],
    queryFn: () => eventService.list({ size: 6 }),
  });
  const events = (data?.content ?? []).map((e) => ({
    id: e.id,
    title: e.titre,
    club: e.clubNom ?? e.organisateurNom ?? "—",
    category: (e.categorie ?? "AUTRE").toLowerCase(),
    date: e.dateDebut ?? "",
    registrations: e.registrationCount ?? 0,
    capacity: e.capacite ?? 0,
    status: statusFromApi(e.statut),
  }));
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Événements récents</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Prochains événements planifiés</p>
        </div>
        <Link href="/dashboard/events" className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition-colors">
          Voir tout <ArrowRight size={12} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Titre</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Club</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Date</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Inscriptions</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Statut</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, i) => {
              const status = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.draft;
              const fillPercent = event.capacity > 0 ? Math.round((event.registrations / event.capacity) * 100) : 0;
              return (
                <motion.tr key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 + i * 0.04 }} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[220px]">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{CATEGORY_LABELS[event.category]}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><p className="text-xs text-muted-foreground truncate max-w-[120px]">{event.club}</p></td>
                  <td className="px-4 py-3"><p className="text-xs text-foreground">{new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-foreground font-medium">{event.registrations}/{event.capacity}</p>
                      <div className="h-1 w-20 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", fillPercent >= 90 ? "bg-emerald-500" : fillPercent >= 60 ? "bg-brand-500" : "bg-amber-400")} style={{ width: `${fillPercent}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", status.className)}>{status.label}</span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ── Shared: Top Clubs (derived from real events) ──────────────
const CLUB_COLORS = [
  "from-brand-500 to-brand-700",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-purple-500 to-violet-600",
];
function TopClubs({ linkHref }: { linkHref: string }) {
  const { data } = useQuery({
    queryKey: ["events-topclubs"],
    queryFn: () => eventService.list({ size: 300 }),
  });
  const counts = new Map<string, { events: number; registrations: number }>();
  (data?.content ?? []).forEach((e) => {
    const name = e.clubNom ?? e.organisateurNom;
    if (!name) return;
    const c = counts.get(name) ?? { events: 0, registrations: 0 };
    c.events += 1;
    c.registrations += e.registrationCount ?? 0;
    counts.set(name, c);
  });
  const clubs = [...counts.entries()]
    .sort((a, b) => b[1].events - a[1].events)
    .slice(0, 5)
    .map(([name, c], i) => ({
      id: name,
      name,
      color: CLUB_COLORS[i % CLUB_COLORS.length],
      events: c.events,
      members: c.registrations,
      rating: "—",
    }));

  if (clubs.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Top Clubs</h2>
        {/* Fix #4 — le href est passé par le parent selon le rôle */}
        <Link href={linkHref} className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition-colors">
          Voir tout <ArrowRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {clubs.map((club, i) => (
          <motion.div key={club.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.47 + i * 0.05 }} className="rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow">
            <div className={cn("h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3 text-white text-xs font-bold", club.color)}>{club.name.charAt(0)}</div>
            <p className="text-xs font-semibold text-foreground leading-tight mb-2">{club.name}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Événements</span><span className="font-medium text-foreground">{club.events}</span></div>
              <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Inscriptions</span><span className="font-medium text-foreground">{club.members}</span></div>
              <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Note</span><span className="font-medium text-amber-500">★ {club.rating}</span></div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
// ROLE VIEWS
// ════════════════════════════════════════════════════════════════

function EtudiantDashboard() {
  const { data: regs } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: registrationService.getMyRegistrations,
  });
  const { data: eventsPage } = useQuery({
    queryKey: ["events-recommended"],
    queryFn: () => eventService.list({ size: 50 }),
  });
  const now = Date.now();
  const myRegs = regs ?? [];
  const eventsById = new Map((eventsPage?.content ?? []).map((e) => [e.id, e]));
  const upcoming = myRegs.filter((r) => {
    const ev = eventsById.get(r.evenementId);
    return ev?.dateDebut ? new Date(ev.dateDebut).getTime() >= now : false;
  }).length;
  const past = myRegs.length - upcoming;
  const recommended = (eventsPage?.content ?? [])
    .filter((e) => e.statut === "APPROUVE")
    .slice(0, 3)
    .map((e) => ({
      id: e.id,
      title: e.titre,
      club: e.clubNom ?? e.organisateurNom ?? "—",
      category: (e.categorie ?? "AUTRE").toLowerCase(),
      date: e.dateDebut ?? "",
      registrations: e.registrationCount ?? 0,
      capacity: e.capacite ?? 0,
    }));
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Mes inscriptions" value={myRegs.length} icon={<Calendar size={18} />} delay={0} />
        <StatCard title="Événements à venir" value={upcoming} icon={<Clock size={18} />} delay={0.07} />
        <StatCard title="Événements passés" value={past} icon={<CheckCircle2 size={18} />} delay={0.14} />
        <StatCard title="Inscriptions confirmées" value={myRegs.filter((r) => r.statut === "CONFIRMEE").length} icon={<Star size={18} />} delay={0.21} />
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { href: "/dashboard/events", icon: <BookOpen size={20} />, color: "bg-brand-50 dark:bg-brand-950 text-brand-600", label: "Catalogue des événements", desc: "Découvrez et inscrivez-vous aux prochains événements" },
          { href: "/dashboard/my-agenda", icon: <Calendar size={20} />, color: "bg-cyan-50 dark:bg-cyan-950 text-cyan-600", label: "Mon agenda", desc: "Consultez vos événements à venir" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg group-hover:scale-110 transition-transform", a.color)}>{a.icon}</div>
            <div><p className="text-sm font-semibold text-foreground">{a.label}</p><p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p></div>
            <ArrowRight size={16} className="ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ))}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-sm font-semibold text-foreground">Événements recommandés</h2><p className="text-xs text-muted-foreground mt-0.5">Sélectionnés selon vos centres d'intérêt</p></div>
          <Link href="/dashboard/events" className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition-colors">Voir tout <ArrowRight size={12} /></Link>
        </div>
        <div className="space-y-3">
          {recommended.length === 0 && <p className="text-xs text-muted-foreground">Aucun événement à recommander pour le moment.</p>}
          {recommended.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 + i * 0.05 }} className="flex items-center gap-3 rounded-lg border border-border/50 p-3 hover:bg-muted/20 transition-colors">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 text-xs font-bold">{event.date ? new Date(event.date).getDate() : "—"}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground">{event.club} · {CATEGORY_LABELS[event.category]}</p>
              </div>
              <div className="text-right flex-shrink-0"><p className="text-xs text-muted-foreground">{event.registrations}/{event.capacity}</p><p className="text-[10px] text-muted-foreground/60">places</p></div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Activité récente</h2>
          <Link href="/dashboard/notifications" className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition-colors">Tout voir <ArrowRight size={12} /></Link>
        </div>
        <ActivityFeed maxItems={3} />
      </motion.div>
    </div>
  );
}

function PresidentDashboard() {
  const { user } = useAuthStore();
  const { data: eventsPage } = useQuery({
    queryKey: ["my-events"],
    queryFn: () => eventService.list({ size: 100 }),
  });
  const mine = (eventsPage?.content ?? []).filter(
    (e) => String(e.organisateurId ?? "") === user?.id
  );
  const totalRegs = mine.reduce((s, e) => s + (e.registrationCount ?? 0), 0);
  const pending = mine.filter((e) => ["SOUMIS", "VERIFIE", "RESERVATION_EN_ATTENTE"].includes(e.statut ?? "")).length;
  const approved = mine.filter((e) => e.statut === "APPROUVE").length;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Mes événements" value={mine.length} icon={<Calendar size={18} />} delay={0} />
        <StatCard title="Total inscriptions" value={totalRegs} icon={<Users size={18} />} delay={0.07} />
        <StatCard title="En attente approbation" value={pending} icon={<Clock size={18} />} delay={0.14} />
        <StatCard title="Approuvés" value={approved} icon={<Star size={18} />} delay={0.21} />
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { href: "/dashboard/events/create", icon: <BarChart2 size={20} />, color: "bg-brand-50 dark:bg-brand-950 text-brand-600", label: "Créer un événement", desc: "Soumettre un nouvel événement" },
          { href: "/dashboard/events/mine", icon: <FileText size={20} />, color: "bg-amber-50 dark:bg-amber-950 text-amber-600", label: "Mes événements", desc: "Gérer vos événements soumis" },
          { href: "/dashboard/reservations", icon: <Building2 size={20} />, color: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600", label: "Réservations salles", desc: "Suivi de vos demandes de salles" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
            <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg group-hover:scale-110 transition-transform", a.color)}>{a.icon}</div>
            <div className="min-w-0"><p className="text-sm font-semibold text-foreground">{a.label}</p><p className="text-xs text-muted-foreground mt-0.5 leading-tight">{a.desc}</p></div>
          </Link>
        ))}
      </motion.div>
      <RecentEventsTable />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Activité récente</h2>
          <Link href="/dashboard/notifications" className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition-colors">Tout voir <ArrowRight size={12} /></Link>
        </div>
        <ActivityFeed />
      </motion.div>
    </div>
  );
}

function ResponsableDashboard() {
  const { data: overview } = useQuery({ queryKey: ["analytics-overview"], queryFn: analyticsService.getOverview });
  const { data: eventsPage } = useQuery({ queryKey: ["admin-events"], queryFn: () => eventService.list({ size: 300 }) });
  const today = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 270 * 86400000).toISOString().slice(0, 10);
  const { data: trend } = useQuery({ queryKey: ["analytics-trend", start, today], queryFn: () => analyticsService.getRegistrationTrend(start, today) });

  const events = eventsPage?.content ?? [];
  const toVerify = events.filter((e) => ["SOUMIS", "VERIFIE"].includes(e.statut ?? ""));
  const monthlyData = (trend ?? []).map((d) => ({ month: d.date.slice(5), events: d.count }));
  const catCounts = new Map<string, number>();
  events.forEach((e) => {
    const c = (e.categorie ?? "AUTRE").toLowerCase();
    catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
  });
  const CAT_COLORS: Record<string, string> = {
    conference: "hsl(232 84% 55%)", atelier: "hsl(258 90% 66%)", competition: "hsl(0 84% 60%)",
    culturel: "hsl(43 96% 56%)", sportif: "hsl(199 89% 48%)", sortie: "hsl(142 71% 45%)", autre: "hsl(220 9% 60%)",
  };
  const categoryData = [...catCounts.entries()].map(([name, value]) => ({
    name: CATEGORY_LABELS[name] ?? name, value, color: CAT_COLORS[name] ?? "hsl(220 9% 60%)",
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total événements" value={overview?.totalEvents ?? events.length} icon={<Calendar size={18} />} delay={0} />
        <StatCard title="À vérifier" value={toVerify.length} icon={<Clock size={18} />} delay={0.07} />
        <StatCard title="Inscriptions totales" value={(overview?.totalRegistrations ?? 0).toLocaleString("fr-FR")} icon={<Users size={18} />} delay={0.14} />
        <StatCard title="Taux de remplissage" value={`${Math.round(overview?.occupancyRate ?? 0)}%`} icon={<TrendingUp size={18} />} delay={0.21} />
      </div>
      {/* Fix #6 — File de vérification visible pour le responsable_evenements */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">File de vérification</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Événements soumis par les présidents de clubs — en attente de votre vérification avant transmission au Doyen</p>
          </div>
          <Link href="/dashboard/events/verify" className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors">
            Traiter <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {toVerify.length === 0 && <p className="text-xs text-muted-foreground">Aucun événement à vérifier.</p>}
          {toVerify.slice(0, 3).map((event) => {
            const st = statusFromApi(event.statut);
            return (
              <div key={event.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{event.titre}</p>
                  <p className="text-xs text-muted-foreground">{event.clubNom ?? event.organisateurNom ?? "—"}</p>
                </div>
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_CONFIG[st]?.className ?? "status-draft")}>
                  {STATUS_CONFIG[st]?.label ?? st}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-5"><h2 className="text-sm font-semibold text-foreground">Événements & Inscriptions</h2><p className="text-xs text-muted-foreground mt-0.5">Évolution sur 9 mois</p></div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(232 84% 55%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(232 84% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91% / 0.5)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="events" name="Événements" stroke="hsl(232 84% 55%)" strokeWidth={2} fill="url(#gradR)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4"><h2 className="text-sm font-semibold text-foreground">Répartition par catégorie</h2><p className="text-xs text-muted-foreground mt-0.5">Cette année académique</p></div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
              </Pie>
              <Tooltip content={({ active, payload }) => active && payload?.length ? (
                <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md">
                  <p className="font-semibold text-foreground">{payload[0].name}</p>
                  <p className="text-muted-foreground">{payload[0].value} événements</p>
                </div>
              ) : null} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {categoryData.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />{cat.name}</span>
                <span className="font-medium text-foreground">{cat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <RecentEventsTable />
    </div>
  );
}

function DoyenDashboard() {
  const { data: overview } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: analyticsService.getOverview,
  });

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .slice(0, 10);
  const { data: trend } = useQuery({
    queryKey: ["analytics-trend", thirtyDaysAgo, today],
    queryFn: () => analyticsService.getRegistrationTrend(thirtyDaysAgo, today),
  });

  const { data: reservations } = useQuery({
    queryKey: ["all-reservations"],
    queryFn: reservationService.listAllReservations,
  });

  const { data: roomUtilData = [] } = useQuery({
    queryKey: ["analytics-rooms-utilization"],
    queryFn: analyticsService.getRoomsUtilization,
  });

  const pendingCount =
    reservations?.filter((r) => r.statut === "EN_ATTENTE").length ?? 0;
  const trendData =
    trend?.map((d) => ({ date: d.date.slice(5), registrations: d.count })) ?? [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total événements" value={overview?.totalEvents ?? 0} icon={<Calendar size={18} />} delay={0} />
        <StatCard title="Réservations en attente" value={pendingCount} icon={<Building2 size={18} />} delay={0.07} />
        <StatCard title="Utilisateurs" value={overview?.totalUsers ?? 0} icon={<Users size={18} />} delay={0.14} />
        <StatCard title="Taux d'occupation" value={`${Math.round(overview?.occupancyRate ?? 0)}%`} icon={<Award size={18} />} delay={0.21} />
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="rounded-xl border border-red-200 bg-red-50/40 dark:border-red-900 dark:bg-red-900/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-sm font-semibold text-foreground">Réservations en attente</h2><p className="text-xs text-muted-foreground mt-0.5">Demandes de salles nécessitant votre approbation</p></div>
          <Link href="/dashboard/reservations/approval" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors">
            Traiter les demandes <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600"><Building2 size={18} /></div>
          <div>
            <p className="text-sm font-medium text-foreground">{pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente</p>
            <p className="text-xs text-muted-foreground">Cliquez sur « Traiter les demandes » pour les approuver ou rejeter</p>
          </div>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-5"><h2 className="text-sm font-semibold text-foreground">Inscriptions</h2><p className="text-xs text-muted-foreground mt-0.5">Vue institutionnelle — 30 derniers jours</p></div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradDR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91% / 0.5)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="registrations" name="Inscriptions" stroke="hsl(199 89% 48%)" strokeWidth={2} fill="url(#gradDR)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4"><h2 className="text-sm font-semibold text-foreground">Taux d'utilisation des salles</h2><p className="text-xs text-muted-foreground mt-0.5">Heures approuvées / demandées (%)</p></div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={roomUtilData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91% / 0.5)" vertical={false} />
              <XAxis dataKey="roomName" tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="utilizationPercent" name="Taux %" stroke="hsl(43 96% 56%)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "hsl(43 96% 56%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: overview } = useQuery({ queryKey: ["analytics-overview"], queryFn: analyticsService.getOverview });
  const { data: eventsPage } = useQuery({ queryKey: ["admin-events"], queryFn: () => eventService.list({ size: 300 }) });
  const today = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 270 * 86400000).toISOString().slice(0, 10);
  const { data: trend } = useQuery({ queryKey: ["analytics-trend", start, today], queryFn: () => analyticsService.getRegistrationTrend(start, today) });
  const { data: rooms = [] } = useQuery({ queryKey: ["analytics-rooms-utilization"], queryFn: analyticsService.getRoomsUtilization });

  const events = eventsPage?.content ?? [];
  const monthlyData = (trend ?? []).map((d) => ({ month: d.date.slice(5), registrations: d.count, events: 0 }));
  const fillData = rooms.map((r) => ({ month: r.roomName, taux: Math.round(r.utilizationPercent) }));
  const catCounts = new Map<string, number>();
  events.forEach((e) => { const c = (e.categorie ?? "AUTRE").toLowerCase(); catCounts.set(c, (catCounts.get(c) ?? 0) + 1); });
  const CAT_COLORS: Record<string, string> = {
    conference: "hsl(232 84% 55%)", atelier: "hsl(258 90% 66%)", competition: "hsl(0 84% 60%)",
    culturel: "hsl(43 96% 56%)", sportif: "hsl(199 89% 48%)", sortie: "hsl(142 71% 45%)", autre: "hsl(220 9% 60%)",
  };
  const categoryData = [...catCounts.entries()].map(([name, value]) => ({ name: CATEGORY_LABELS[name] ?? name, value, color: CAT_COLORS[name] ?? "hsl(220 9% 60%)" }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total événements" value={overview?.totalEvents ?? events.length} icon={<Calendar size={18} />} delay={0} />
        <StatCard title="Inscriptions totales" value={(overview?.totalRegistrations ?? 0).toLocaleString("fr-FR")} icon={<Users size={18} />} delay={0.07} />
        <StatCard title="Taux d'occupation" value={`${Math.round(overview?.occupancyRate ?? 0)}%`} icon={<TrendingUp size={18} />} delay={0.14} />
        <StatCard title="Utilisateurs" value={overview?.totalUsers ?? 0} icon={<Award size={18} />} delay={0.21} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div><h2 className="text-sm font-semibold text-foreground">Inscriptions</h2><p className="text-xs text-muted-foreground mt-0.5">9 derniers mois</p></div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91% / 0.5)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="registrations" name="Inscriptions" stroke="hsl(199 89% 48%)" strokeWidth={2} fill="url(#gradAR)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.27 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4"><h2 className="text-sm font-semibold text-foreground">Répartition par catégorie</h2><p className="text-xs text-muted-foreground mt-0.5">Cette année académique</p></div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
              </Pie>
              <Tooltip content={({ active, payload }) => active && payload?.length ? (
                <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md">
                  <p className="font-semibold text-foreground">{payload[0].name}</p>
                  <p className="text-muted-foreground">{payload[0].value} événements</p>
                </div>
              ) : null} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {categoryData.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />{cat.name}</span>
                <span className="font-medium text-foreground">{cat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4"><h2 className="text-sm font-semibold text-foreground">Taux d'utilisation des salles</h2><p className="text-xs text-muted-foreground mt-0.5">Heures approuvées / demandées (%)</p></div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={fillData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91% / 0.5)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="taux" name="Taux %" stroke="hsl(43 96% 56%)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "hsl(43 96% 56%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="text-sm font-semibold text-foreground">Activité récente</h2><p className="text-xs text-muted-foreground mt-0.5">Dernières actions sur la plateforme</p></div>
            <Link href="/dashboard/notifications" className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition-colors">Tout voir <ArrowRight size={12} /></Link>
          </div>
          <ActivityFeed />
        </motion.div>
      </div>
      <RecentEventsTable />
      {/* Fix #4 — lien corrigé /admin/clubs pour l'admin */}
      <TopClubs linkHref="/admin/clubs" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN — dispatch par rôle
// ════════════════════════════════════════════════════════════════

export function DashboardHome() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const firstName = mounted ? (user?.firstName ?? "Utilisateur") : "";

  const subtitles: Record<string, string> = {
    etudiant: "Découvrez et rejoignez les événements de votre campus.",
    president_club: "Gérez les événements de votre club et suivez vos inscriptions.",
    responsable_evenements: "Vérifiez les événements soumis et suivez l'activité de la plateforme.",
    doyen: "Vue institutionnelle — approbation des réservations et suivi global.",
    admin: "Vue d'ensemble complète de la plateforme UniEvent.",
  };

  const subtitle = user ? (subtitles[user.role] ?? "Voici un aperçu de l'activité aujourd'hui.") : "";

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👋</span>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {greeting()},{" "}
            <span className="text-gradient">{firstName}</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </motion.div>

      {/* Dispatch par rôle — Fix #1 */}
      {!user || user.role === "etudiant" ? (
        <EtudiantDashboard />
      ) : user.role === "president_club" ? (
        <PresidentDashboard />
      ) : user.role === "responsable_evenements" ? (
        <ResponsableDashboard />
      ) : user.role === "doyen" ? (
        <DoyenDashboard />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
}
