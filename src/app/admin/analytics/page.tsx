"use client";

import { PageHeader } from "@/components/shared/page-header";
import { BackButton } from "@/components/shared/back-button";
import { AdminStatCard } from "@/components/admin/dashboard/admin-stat-card";
import { Calendar, Users, GraduationCap, BookOpen } from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const MONTHLY = [
  { month: "Jan", événements: 4, inscriptions: 120 },
  { month: "Fév", événements: 6, inscriptions: 190 },
  { month: "Mar", événements: 8, inscriptions: 245 },
  { month: "Avr", événements: 5, inscriptions: 160 },
  { month: "Mai", événements: 11, inscriptions: 370 },
  { month: "Jun", événements: 9, inscriptions: 295 },
];

const PIE_DATA = [
  { name: "Conférence", value: 12 }, { name: "Atelier", value: 8 },
  { name: "Compétition", value: 5 }, { name: "Culturel", value: 6 },
  { name: "Sportif", value: 4 }, { name: "Autre", value: 3 },
];

const COLORS = ["#4F6FE8", "#8B5CF6", "#EF4444", "#F59E0B", "#10B981", "#6B7280"];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader title="Analytique globale" description="Vue d'ensemble de l'activité sur toute la plateforme." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Événements ce mois" value="11" icon={<Calendar size={20} />} trend={22} trendLabel="vs mois dernier" accent="blue" index={0} />
        <AdminStatCard title="Inscriptions totales" value="1 580" icon={<Users size={20} />} trend={15} trendLabel="vs mois dernier" accent="violet" index={1} />
        <AdminStatCard title="Clubs actifs" value="24" icon={<GraduationCap size={20} />} trend={8} trendLabel="vs mois dernier" accent="emerald" index={2} />
        <AdminStatCard title="Réservations" value="76" icon={<BookOpen size={20} />} trend={8} trendLabel="vs mois dernier" accent="amber" index={3} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-admin-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Évolution mensuelle</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="ga1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F6FE8" stopOpacity={0.3} /><stop offset="95%" stopColor="#4F6FE8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ga2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} />
              <Tooltip /><Legend />
              <Area type="monotone" dataKey="événements" stroke="#4F6FE8" fill="url(#ga1)" strokeWidth={2} />
              <Area type="monotone" dataKey="inscriptions" stroke="#8B5CF6" fill="url(#ga2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-border bg-admin-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Catégories</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {PIE_DATA.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />{c.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
