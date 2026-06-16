"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { BackButton } from "@/components/shared/back-button";
import { StatCard } from "@/components/shared/stat-card";
import { Calendar, Users, TrendingUp, BarChart2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { analyticsService } from "@/services/analytics.service";
import { format, subDays } from "date-fns";

const COLORS = ["#4F6FE8", "#8B5CF6", "#EF4444", "#F59E0B", "#10B981", "#6B7280"];

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function AnalyticsPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const { data: overview, isLoading: loadingOverview, error: errOverview } =
    useQuery({ queryKey: ["analytics-overview"], queryFn: analyticsService.getOverview });

  const { data: trend, isLoading: loadingTrend } = useQuery({
    queryKey: ["analytics-trend", thirtyDaysAgo, today],
    queryFn: () => analyticsService.getRegistrationTrend(thirtyDaysAgo, today),
  });

  const { data: rooms, isLoading: loadingRooms } = useQuery({
    queryKey: ["analytics-rooms"],
    queryFn: analyticsService.getRoomsUtilization,
  });

  if (errOverview) {
    return (
      <div className="space-y-6">
        <BackButton />
        <PageHeader title="Tableau de bord analytique" description="" />
        <p className="text-sm text-red-500">Erreur lors du chargement des données analytiques.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader title="Tableau de bord analytique" description="Vue d'ensemble des activités de la plateforme UniEvent." />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingOverview ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard title="Total événements" value={String(overview?.totalEvents ?? 0)} icon={<Calendar size={20} />} />
            <StatCard title="Total utilisateurs" value={String(overview?.totalUsers ?? 0)} icon={<Users size={20} />} />
            <StatCard title="Total inscriptions" value={String(overview?.totalRegistrations ?? 0)} icon={<BarChart2 size={20} />} />
            <StatCard title="Taux de remplissage" value={`${((overview?.occupancyRate ?? 0) * 100).toFixed(1)}%`} icon={<TrendingUp size={20} />} />
          </>
        )}
      </div>

      {/* Trend chart */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">Inscriptions — 30 derniers jours</h3>
        {loadingTrend ? (
          <Skeleton className="h-52 w-full" />
        ) : !trend || trend.length === 0 ? (
          <p className="text-sm text-muted-foreground py-16 text-center">Aucune donnée disponible.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F6FE8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F6FE8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" name="Inscriptions" stroke="#4F6FE8" fill="url(#gReg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Rooms utilization */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">Utilisation des salles</h3>
        {loadingRooms ? (
          <Skeleton className="h-52 w-full" />
        ) : !rooms || rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground py-16 text-center">Aucune donnée disponible.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rooms} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="roomName" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="approvedHours" name="Heures approuvées" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
              <Bar dataKey="totalReservations" name="Réservations" fill={COLORS[1]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
