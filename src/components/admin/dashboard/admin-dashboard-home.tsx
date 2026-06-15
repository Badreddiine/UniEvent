"use client";

import { motion } from "framer-motion";
import {
  Users, Calendar, GraduationCap, Building2,
  Clock, CheckCircle2, AlertTriangle, Zap,
  TrendingUp, Activity, ArrowRight, Shield,
  BarChart2, RefreshCw, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { AdminStatCard } from "./admin-stat-card";
import { cn } from "@/lib/utils";
import { analyticsService } from "@/services/analytics.service";
import { eventService } from "@/services/event.service";
import { reservationService } from "@/services/reservation.service";
import { userService } from "@/services/user.service";
import type { AdminActivityType } from "@/lib/admin-fake-data";

// ── Real-data hook: feeds the admin dashboard from the API ─────

function useAdminDashboardData() {
  const today = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 270 * 86400000).toISOString().slice(0, 10);

  const { data: overview } = useQuery({ queryKey: ["analytics-overview"], queryFn: analyticsService.getOverview });
  const { data: trend } = useQuery({ queryKey: ["analytics-trend", start, today], queryFn: () => analyticsService.getRegistrationTrend(start, today) });
  const { data: rooms } = useQuery({ queryKey: ["analytics-rooms-utilization"], queryFn: analyticsService.getRoomsUtilization });
  const { data: eventsPage } = useQuery({ queryKey: ["admin-events"], queryFn: () => eventService.list({ size: 300 }) });
  const { data: users } = useQuery({ queryKey: ["admin-users"], queryFn: userService.list });
  const { data: roomList } = useQuery({ queryKey: ["admin-rooms"], queryFn: () => reservationService.listRooms() });
  const { data: reservations } = useQuery({ queryKey: ["all-reservations"], queryFn: reservationService.listAllReservations });

  const events = eventsPage?.content ?? [];
  const allUsers = users ?? [];
  const allRooms = roomList ?? [];
  const allRes = reservations ?? [];

  const countByStatut = (s: string) => events.filter((e) => e.statut === s).length;
  const pendingRes = allRes.filter((r) => r.statut === "EN_ATTENTE").length;
  const pendingEvents = countByStatut("SOUMIS") + countByStatut("RESERVATION_EN_ATTENTE");

  const ADMIN_STATS = {
    totalUsers: overview?.totalUsers ?? allUsers.length,
    usersGrowthPct: 0,
    totalEvents: overview?.totalEvents ?? events.length,
    eventsGrowthPct: 0,
    totalClubs: new Set(events.map((e) => e.clubId).filter((c) => c != null)).size,
    clubsGrowthPct: 0,
    pendingApprovals: pendingRes + pendingEvents,
    approvalsUrgent: pendingRes,
    totalRooms: allRooms.length,
    roomsAvailable: allRooms.filter((r) => r.statut === "DISPONIBLE").length,
    systemHealth: Math.round(overview?.occupancyRate ?? 0),
    totalRevenue: 0,
  };

  const ADMIN_USER_GROWTH = (trend ?? []).map((d) => ({
    month: d.date.slice(5),
    students: d.count,
    staff: 0,
    clubs: 0,
  }));

  const APPROVAL_PIPELINE = [
    { stage: "Brouillons", count: countByStatut("BROUILLON"), color: "hsl(220 9% 60%)" },
    { stage: "Soumis", count: countByStatut("SOUMIS"), color: "hsl(43 96% 56%)" },
    { stage: "Vérifiés", count: countByStatut("VERIFIE"), color: "hsl(199 89% 48%)" },
    { stage: "En attente", count: countByStatut("RESERVATION_EN_ATTENTE"), color: "hsl(258 90% 66%)" },
    { stage: "Approuvés", count: countByStatut("APPROUVE"), color: "hsl(142 71% 45%)" },
    { stage: "Rejetés", count: countByStatut("REJETE"), color: "hsl(0 84% 60%)" },
  ];

  const roleCount = (r: string) => allUsers.filter((u) => u.role === r).length;
  const withRole = allUsers.filter((u) => u.role).length;
  const ROLE_DISTRIBUTION = [
    { name: "Étudiants", value: allUsers.length - withRole, color: "hsl(232 84% 55%)" },
    { name: "Resp. événements", value: roleCount("RESPONSABLE_EVENEMENTS"), color: "hsl(43 96% 56%)" },
    { name: "Doyens", value: roleCount("DOYEN"), color: "hsl(142 71% 45%)" },
    { name: "Admins", value: roleCount("ADMIN"), color: "hsl(258 90% 66%)" },
  ].filter((r) => r.value > 0);

  const ROOM_OCCUPANCY = (rooms ?? []).slice(0, 8).map((r) => ({
    room: r.roomName,
    occupancy: Math.round(r.utilizationPercent),
  }));

  // Recent events as an activity stream
  const ADMIN_ACTIVITY = events.slice(0, 8).map((e) => {
    const map: Record<string, { type: AdminActivityType; severity: "info" | "warning" | "error" | "success" }> = {
      APPROUVE: { type: "event_approved", severity: "success" },
      REJETE: { type: "event_rejected", severity: "error" },
      SOUMIS: { type: "event_approved", severity: "info" },
    };
    const m = map[e.statut ?? ""] ?? { type: "event_approved" as AdminActivityType, severity: "info" as const };
    return {
      id: String(e.id),
      type: m.type,
      actor: e.organisateurNom ?? "Organisateur",
      target: e.titre,
      timestamp: e.dateDebut ?? new Date().toISOString(),
      severity: m.severity,
    };
  });

  // Pending items: submitted events + pending reservations
  const PENDING_ITEMS = [
    ...events.filter((e) => e.statut === "SOUMIS" || e.statut === "RESERVATION_EN_ATTENTE").slice(0, 4).map((e) => ({
      id: `e-${e.id}`,
      title: e.titre,
      type: "event" as const,
      submittedBy: e.organisateurNom ?? e.clubNom ?? "—",
      submittedAt: e.dateDebut ?? new Date().toISOString(),
      isUrgent: e.statut === "RESERVATION_EN_ATTENTE",
      category: e.categorie?.toLowerCase(),
    })),
    ...allRes.filter((r) => r.statut === "EN_ATTENTE").slice(0, 3).map((r) => ({
      id: `r-${r.id}`,
      title: `Réservation ${r.salleNom ?? ""} — ${r.evenementTitre ?? ""}`.trim(),
      type: "reservation" as const,
      submittedBy: r.demandeurNom ?? "—",
      submittedAt: r.dateCreation ?? new Date().toISOString(),
      isUrgent: false,
      category: undefined as string | undefined,
    })),
  ];

  // Top organizers by number of events
  const organizerCounts = new Map<string, number>();
  events.forEach((e) => {
    const name = e.organisateurNom ?? e.clubNom;
    if (name) organizerCounts.set(name, (organizerCounts.get(name) ?? 0) + 1);
  });
  const TOP_USERS = [...organizerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, role: "responsable_evenements", events: count, club: "—" }));

  const SYSTEM_METRICS = [
    { label: "Utilisateurs", value: String(ADMIN_STATS.totalUsers), status: "good" as const },
    { label: "Événements", value: String(ADMIN_STATS.totalEvents), status: "good" as const },
    { label: "Salles dispo.", value: `${ADMIN_STATS.roomsAvailable}/${ADMIN_STATS.totalRooms}`, status: "good" as const },
    { label: "Taux occupation", value: `${ADMIN_STATS.systemHealth}%`, status: ADMIN_STATS.systemHealth > 80 ? ("warning" as const) : ("good" as const) },
  ];

  return { ADMIN_STATS, ADMIN_USER_GROWTH, APPROVAL_PIPELINE, ROLE_DISTRIBUTION, ROOM_OCCUPANCY, ADMIN_ACTIVITY, PENDING_ITEMS, TOP_USERS, SYSTEM_METRICS };
}

// ── Helpers ───────────────────────────────────────────────────

function formatRelative(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  return `il y a ${Math.floor(hrs / 24)}j`;
}

const ACTIVITY_CONFIG: Record<AdminActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  user_created: { icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  event_approved: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  event_rejected: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  club_created: { icon: GraduationCap, color: "text-violet-400", bg: "bg-violet-500/10" },
  room_updated: { icon: Building2, color: "text-amber-400", bg: "bg-amber-500/10" },
  system_alert: { icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10" },
  user_banned: { icon: Shield, color: "text-red-500", bg: "bg-red-500/15" },
  reservation_approved: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

const SEVERITY_DOT: Record<string, string> = {
  success: "bg-emerald-400",
  info: "bg-blue-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
};

const PENDING_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  event: { label: "Événement", color: "text-violet-400", bg: "bg-violet-500/10" },
  reservation: { label: "Réservation", color: "text-amber-400", bg: "bg-amber-500/10" },
  club: { label: "Club", color: "text-cyan-400", bg: "bg-cyan-500/10" },
};

// ── Custom Tooltip ─────────────────────────────────────────────
function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.10] bg-admin-sidebar px-3 py-2 shadow-2xl text-xs">
      <p className="font-semibold text-white/80 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-1.5 text-white/60">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-bold text-white/80">{p.value?.toLocaleString("fr-FR")}</span>
        </p>
      ))}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, subtitle, action, children, delay = 0 }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl border border-white/[0.08] bg-admin-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
        <div>
          <p className="text-sm font-bold text-white/90">{title}</p>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export function AdminDashboardHome() {
  const { user } = useAuthStore();
  const {
    ADMIN_STATS,
    ADMIN_USER_GROWTH,
    APPROVAL_PIPELINE,
    ROLE_DISTRIBUTION,
    ROOM_OCCUPANCY,
    ADMIN_ACTIVITY,
    PENDING_ITEMS,
    TOP_USERS,
    SYSTEM_METRICS,
  } = useAdminDashboardData();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-admin-accent to-violet-600">
              <Shield size={12} className="text-white" />
            </span>
            <p className="text-xs font-bold uppercase tracking-widest text-admin-accent/80">
              Console d'administration
            </p>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {greeting()}, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            Voici un aperçu de la plateforme UniEvent en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.10] transition-all">
            <RefreshCw size={13} />
            Actualiser
          </button>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 rounded-xl bg-admin-accent px-4 py-2 text-xs font-semibold text-white hover:bg-admin-accent/90 transition-all shadow-lg shadow-admin-accent/25"
          >
            <BarChart2 size={13} />
            Analytique complète
          </Link>
        </div>
      </motion.div>

      {/* ── KPI Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Utilisateurs"
          value={ADMIN_STATS.totalUsers}
          trend={ADMIN_STATS.usersGrowthPct}
          trendLabel="vs mois dernier"
          icon={<Users size={18} />}
          accent="blue"
          index={0}
        />
        <AdminStatCard
          title="Événements"
          value={ADMIN_STATS.totalEvents}
          trend={ADMIN_STATS.eventsGrowthPct}
          trendLabel="vs mois dernier"
          icon={<Calendar size={18} />}
          accent="violet"
          index={1}
        />
        <AdminStatCard
          title="Clubs actifs"
          value={ADMIN_STATS.totalClubs}
          trend={ADMIN_STATS.clubsGrowthPct}
          trendLabel="vs mois dernier"
          icon={<GraduationCap size={18} />}
          accent="emerald"
          index={2}
        />
        <AdminStatCard
          title="En attente"
          value={ADMIN_STATS.pendingApprovals}
          subtitle={`${ADMIN_STATS.approvalsUrgent} urgents`}
          icon={<Clock size={18} />}
          accent="amber"
          index={3}
        />
      </div>

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Salles disponibles"
          value={`${ADMIN_STATS.roomsAvailable}/${ADMIN_STATS.totalRooms}`}
          subtitle="salles opérationnelles"
          icon={<Building2 size={18} />}
          accent="cyan"
          index={4}
        />
        <AdminStatCard
          title="Santé système"
          value={`${ADMIN_STATS.systemHealth}%`}
          subtitle="Tous services opérationnels"
          icon={<Activity size={18} />}
          accent="emerald"
          index={5}
        />
        <AdminStatCard
          title="Sessions actives"
          value={147}
          subtitle="utilisateurs connectés"
          icon={<Zap size={18} />}
          accent="blue"
          index={6}
        />
        <AdminStatCard
          title="Latence API"
          value="42ms"
          subtitle="Performance optimale"
          icon={<TrendingUp size={18} />}
          accent="violet"
          index={7}
        />
      </div>

      {/* ── Row 1: User Growth + Role Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User growth chart — large */}
        <Section
          title="Croissance des utilisateurs"
          subtitle="Inscriptions par mois"
          delay={0.15}
          action={
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
              <TrendingUp size={12} />
              +12.4% ce mois
            </span>
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ADMIN_USER_GROWTH} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(232 84% 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(232 84% 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradStaff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Area type="monotone" dataKey="students" name="Étudiants" stroke="hsl(232 84% 55%)" strokeWidth={2} fill="url(#gradStudents)" dot={false} />
                <Area type="monotone" dataKey="staff" name="Personnel" stroke="hsl(142 71% 45%)" strokeWidth={2} fill="url(#gradStaff)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Role distribution — small */}
        <Section
          title="Répartition des rôles"
          subtitle="Distribution des comptes"
          delay={0.2}
        >
          <div className="flex flex-col gap-3">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ROLE_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ROLE_DISTRIBUTION.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {ROLE_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-xs text-white/50">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-white/80">{item.value.toLocaleString("fr-FR")}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* ── Row 2: Approval Pipeline + Room Occupancy ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline funnel */}
        <Section
          title="Pipeline d'approbation"
          subtitle="Événements par statut"
          delay={0.25}
          action={
            <Link href="/admin/events/approvals" className="flex items-center gap-1 text-xs text-admin-accent hover:underline">
              Voir tout <ArrowRight size={12} />
            </Link>
          }
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={APPROVAL_PIPELINE} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                <XAxis dataKey="stage" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="count" name="Événements" radius={[6, 6, 0, 0]}>
                  {APPROVAL_PIPELINE.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Room occupancy */}
        <Section
          title="Occupation des salles"
          subtitle="Taux d'utilisation moyen"
          delay={0.3}
        >
          <div className="space-y-3">
            {ROOM_OCCUPANCY.map((room) => (
              <div key={room.room} className="flex items-center gap-3">
                <span className="w-20 text-xs text-white/50 text-right flex-shrink-0">{room.room}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.07] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${room.occupancy}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + ROOM_OCCUPANCY.indexOf(room) * 0.05 }}
                    className={cn(
                      "h-full rounded-full",
                      room.occupancy >= 85
                        ? "bg-gradient-to-r from-amber-500 to-red-500"
                        : room.occupancy >= 65
                        ? "bg-gradient-to-r from-admin-accent to-violet-500"
                        : "bg-gradient-to-r from-emerald-500 to-cyan-500"
                    )}
                  />
                </div>
                <span className={cn(
                  "w-10 text-xs font-bold text-right flex-shrink-0",
                  room.occupancy >= 85 ? "text-amber-400" : room.occupancy >= 65 ? "text-admin-accent" : "text-emerald-400"
                )}>
                  {room.occupancy}%
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Row 3: Pending Items + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending approvals */}
        <Section
          title="Approbations en attente"
          subtitle={`${ADMIN_STATS.pendingApprovals} éléments • ${ADMIN_STATS.approvalsUrgent} urgents`}
          delay={0.35}
          action={
            <Link href="/admin/events/approvals" className="flex items-center gap-1 text-xs text-admin-accent hover:underline">
              Tout traiter <ArrowRight size={12} />
            </Link>
          }
        >
          <div className="space-y-3">
            {PENDING_ITEMS.map((item) => {
              const typeConf = PENDING_TYPE_CONFIG[item.type];
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 hover:bg-white/[0.06] hover:border-white/[0.10] transition-all cursor-pointer group"
                >
                  {item.isUrgent && (
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertTriangle size={13} className="text-red-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white/85 truncate leading-none mb-1">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide", typeConf.bg, typeConf.color)}>
                        {typeConf.label}
                      </span>
                      <span className="text-[10px] text-white/30">par {item.submittedBy}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="rounded-lg bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/25 transition-all">
                      ✓
                    </button>
                    <button className="rounded-lg bg-red-500/15 border border-red-500/20 px-2.5 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-500/25 transition-all">
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Recent activity feed */}
        <Section
          title="Activité récente"
          subtitle="Dernières actions sur la plateforme"
          delay={0.4}
        >
          <div className="space-y-3">
            {ADMIN_ACTIVITY.map((activity) => {
              const conf = ACTIVITY_CONFIG[activity.type];
              const Icon = conf.icon;
              const dot = SEVERITY_DOT[activity.severity ?? "info"];
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08]",
                    conf.bg
                  )}>
                    <Icon size={13} className={conf.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/75 leading-snug">
                      <span className="font-semibold text-white/90">{activity.actor}</span>
                      {" → "}
                      <span className="text-white/60">{activity.target}</span>
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5">{formatRelative(activity.timestamp)}</p>
                  </div>
                  <span className={cn("flex h-2 w-2 rounded-full mt-1.5 flex-shrink-0", dot)} />
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* ── Row 4: Top Users + System Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top users */}
        <div className="lg:col-span-2">
          <Section
            title="Utilisateurs les plus actifs"
            subtitle="Par nombre d'événements organisés"
            delay={0.45}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="text-left pb-2.5 text-white/30 font-semibold pr-3">#</th>
                    <th className="text-left pb-2.5 text-white/30 font-semibold">Utilisateur</th>
                    <th className="text-left pb-2.5 text-white/30 font-semibold">Rôle</th>
                    <th className="text-left pb-2.5 text-white/30 font-semibold">Club</th>
                    <th className="text-right pb-2.5 text-white/30 font-semibold">Événements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {TOP_USERS.map((u, i) => (
                    <tr key={u.name} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="py-2.5 pr-3 text-white/30 font-bold">{i + 1}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-admin-accent/80 to-violet-600/80 text-white text-[9px] font-bold flex-shrink-0">
                            {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <span className="font-semibold text-white/80 truncate max-w-[130px]">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className="rounded-md bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 text-[9px] text-white/50 font-medium">
                          {u.role === "president_club" ? "Prés. Club" : "Resp. Évén."}
                        </span>
                      </td>
                      <td className="py-2.5 text-white/40 truncate max-w-[100px]">{u.club}</td>
                      <td className="py-2.5 text-right">
                        <span className="font-bold text-admin-accent">{u.events}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* System metrics */}
        <Section
          title="État du système"
          subtitle="Métriques en temps réel"
          delay={0.5}
        >
          <div className="space-y-4">
            {SYSTEM_METRICS.map((metric) => (
              <div key={metric.label} className="flex items-center justify-between">
                <span className="text-xs text-white/50">{metric.label}</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    metric.status === "good" ? "bg-emerald-400 shadow-sm shadow-emerald-400/60" : "bg-amber-400 shadow-sm shadow-amber-400/60"
                  )} />
                  <span className={cn(
                    "text-sm font-bold",
                    metric.status === "good" ? "text-white/85" : "text-amber-400"
                  )}>
                    {metric.value}
                  </span>
                </div>
              </div>
            ))}

            {/* Uptime visual */}
            <div className="pt-3 border-t border-white/[0.07]">
              <p className="text-[11px] text-white/30 mb-2">Disponibilité — 90 derniers jours</p>
              <div className="flex gap-0.5">
                {Array.from({ length: 90 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 h-4 rounded-[2px]",
                      i === 47 ? "bg-amber-500/80" : i === 23 ? "bg-red-500/70" : "bg-emerald-500/70"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-white/25">90j</span>
                <span className="text-[10px] font-semibold text-emerald-400">99.2% uptime</span>
                <span className="text-[10px] text-white/25">auj.</span>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
