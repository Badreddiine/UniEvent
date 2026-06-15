// ============================================================
// UNIEVENT — Phase 5B2: MyEventsHome
// Événements créés + réservations de l'utilisateur
// ============================================================

"use client";
import * as React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Search,
  Ticket,
  FolderOpen,
  QrCode,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { eventService } from "@/services/event.service";
import { registrationService } from "@/services/registration.service";
import { eventDtoToManaged } from "@/lib/event-adapters";
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_COLORS,
  REGISTRATION_STATUS_LABELS,
  REGISTRATION_STATUS_COLORS,
  type ManagedEvent,
  type UserRegistration,
} from "@/lib/events-crud-data";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/public-events-data";
import { DeleteEventModal } from "@/components/events-crud/DeleteEventModal";

// ── Helpers ───────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// ── Created Event Card ─────────────────────────────────────────

function ManagedEventCard({
  event,
  onDelete,
}: {
  event: ManagedEvent;
  onDelete: (event: ManagedEvent) => void;
}) {
  const router = useRouter();
  const fillPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  return (
    <div className="group rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] overflow-hidden transition-all duration-200">
      {/* Cover */}
      <div className="relative h-36 overflow-hidden">
        {event.coverUrl ? (
          <img
            src={event.coverUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 to-purple-900/40 flex items-center justify-center">
            <Calendar size={32} className="text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm",
            EVENT_STATUS_COLORS[event.status]
          )}>
            {EVENT_STATUS_LABELS[event.status]}
          </span>
        </div>

        {/* Category */}
        <div className="absolute top-3 right-3">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm",
            CATEGORY_COLORS[event.category]
          )}>
            {CATEGORY_LABELS[event.category]}
          </span>
        </div>

        {/* Actions overlay */}
        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/events/${event.id}`}
            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
            title="Voir"
          >
            <Eye size={13} />
          </Link>
          <Link
            href={`/dashboard/events/edit/${event.id}`}
            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
            title="Modifier"
          >
            <Edit3 size={13} />
          </Link>
          <button
            onClick={() => onDelete(event)}
            className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-black/80 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Calendar size={11} className="flex-shrink-0" />
            <span>{formatDate(event.startDate)} à {formatTime(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={11} className="flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Fill bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Inscriptions</span>
            <span className={cn(
              "font-medium",
              fillPercent >= 90 ? "text-red-400" : fillPercent >= 70 ? "text-amber-400" : "text-emerald-400"
            )}>
              {event.registeredCount}/{event.capacity}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                fillPercent >= 90 ? "bg-red-500" : fillPercent >= 70 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 pt-1">
          <Link
            href={`/dashboard/events/registrants/${event.id}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-white/70 hover:text-white text-xs font-medium transition-colors"
            title="Voir les inscrits"
          >
            <Users size={12} />
            Inscrits
          </Link>
          <Link
            href={`/dashboard/events/edit/${event.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-white/70 hover:text-white text-xs font-medium transition-colors"
          >
            <Edit3 size={12} />
            Modifier
          </Link>
          <button
            onClick={() => onDelete(event)}
            className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-red-500/15 text-white/40 hover:text-red-400 text-xs transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Registration Card ──────────────────────────────────────────

function RegistrationCard({ reg }: { reg: UserRegistration }) {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] overflow-hidden transition-all duration-200">
      <div className="flex gap-0">
        {/* Cover */}
        <div className="w-20 flex-shrink-0 relative overflow-hidden">
          <img
            src={reg.eventCoverUrl}
            alt={reg.eventTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        </div>

        {/* Content */}
        <div className="flex-1 p-3 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 flex-1">
              {reg.eventTitle}
            </h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
              REGISTRATION_STATUS_COLORS[reg.status]
            )}>
              {REGISTRATION_STATUS_LABELS[reg.status]}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(reg.eventStartDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {reg.eventLocation}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-0.5">
            <Link
              href={`/events/${reg.eventId}`}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Eye size={11} />
              Voir l'événement
            </Link>

            {reg.status === "confirmed" && (
              <>
                <span className="text-white/20">•</span>
                <button
                  onClick={() => setShowQR(true)}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <QrCode size={11} />
                  Mon billet
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowQR(false)} />
          <div className="relative rounded-2xl border border-white/[0.10] bg-[#15151f] p-6 text-center space-y-4 max-w-xs w-full">
            <h3 className="font-bold text-white">Mon billet</h3>
            <p className="text-sm text-white/70 font-medium">{reg.eventTitle}</p>

            {/* Fake QR visualization */}
            <div className="mx-auto w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center">
              <div className="grid grid-cols-8 gap-0.5 w-full h-full">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-[1px]",
                      (i * 7 + i * 3) % 3 === 0 ? "bg-black" : "bg-white"
                    )}
                  />
                ))}
              </div>
            </div>

            <p className="font-mono text-xs text-white/50 bg-white/[0.06] rounded px-3 py-1.5">
              {reg.qrCode}
            </p>
            <p className="text-xs text-white/30">
              Inscrit le {new Date(reg.registeredAt).toLocaleDateString("fr-FR")}
            </p>
            <button
              onClick={() => setShowQR(false)}
              className="w-full py-2.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────

function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="py-16 flex flex-col items-center gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center">
        <FolderOpen size={24} className="text-white/20" />
      </div>
      <p className="text-white/40 text-sm">{message}</p>
      {action}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

export function MyEventsHome() {
  const { user, canCreateEvents } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"created" | "registered">("created");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<ManagedEvent | null>(null);

  // Real data — events created by this organizer
  const { data: eventsPage } = useQuery({
    queryKey: ["my-events"],
    queryFn: () => eventService.list({ size: 100 }),
  });
  const allEvents: ManagedEvent[] = (eventsPage?.content ?? []).map(eventDtoToManaged);

  // Real data — this user's registrations
  const { data: registrationsData } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: registrationService.getMyRegistrations,
  });
  const registrations: UserRegistration[] = (registrationsData ?? []).map((r) => ({
    id: String(r.id),
    eventId: String(r.evenementId),
    eventTitle: r.evenementTitre ?? "Événement",
    eventCategory: "autre",
    eventStartDate: r.dateInscription,
    eventLocation: "",
    eventCoverUrl: "",
    status:
      r.statut === "CONFIRMEE" ? "confirmed" : r.statut === "LISTE_ATTENTE" ? "waitlist" : "cancelled",
    registeredAt: r.dateInscription,
    qrCode: r.qrCode ?? "",
  }));

  // Only show this user's events
  const myEvents = allEvents.filter((e) => e.organizerId === user?.id);

  // Filter created events
  const createdEvents = myEvents.filter((e) => {
    if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => eventService.delete(Number(eventId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-events"] }),
  });

  const handleDelete = async (eventId: string) => {
    await deleteMutation.mutateAsync(eventId);
    setDeleteTarget(null);
  };

  const isOrganizer = canCreateEvents();

  // Stats
  const approvedCount = myEvents.filter((e) => e.status === "approved").length;
  const pendingCount = myEvents.filter((e) => ["pending", "submitted", "verified"].includes(e.status)).length;
  const totalRegistrations = myEvents.reduce((s, e) => s + e.registeredCount, 0);

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Mes Événements</h1>
            <p className="text-white/50 text-sm mt-1">
              {isOrganizer
                ? "Gérez vos événements créés et suivez vos inscriptions"
                : "Suivez vos inscriptions aux événements"}
            </p>
          </div>
          {isOrganizer && (
            <Link
              href="/dashboard/events/create"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Plus size={16} />
              Nouvel événement
            </Link>
          )}
        </div>

        {/* ── Stats (organizer only) ── */}
        {isOrganizer && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Événements approuvés", value: approvedCount, icon: <CheckCircle2 size={16} />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { label: "En attente d'approbation", value: pendingCount, icon: <Clock size={16} />, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
              { label: "Total inscrits", value: totalRegistrations, icon: <Users size={16} />, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
            ].map((stat) => (
              <div key={stat.label}
                className={cn("rounded-xl border p-4 flex items-center gap-3", stat.color)}>
                <div className="opacity-70">{stat.icon}</div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs opacity-60 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.05] border border-white/[0.06] w-fit">
          {[
            { key: "created" as const, label: "Événements créés", icon: <Calendar size={14} />, show: isOrganizer },
            { key: "registered" as const, label: "Mes inscriptions", icon: <Ticket size={14} />, show: true },
          ]
            .filter((t) => t.show)
            .map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.key === "created" && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    activeTab === "created"
                      ? "bg-white/20 text-white"
                      : "bg-white/[0.08] text-white/50"
                  )}>
                    {myEvents.length}
                  </span>
                )}
                {tab.key === "registered" && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    activeTab === "registered"
                      ? "bg-white/20 text-white"
                      : "bg-white/[0.08] text-white/50"
                  )}>
                    {registrations.length}
                  </span>
                )}
              </button>
            ))}
        </div>

        {/* ── Created Events Tab ── */}
        {activeTab === "created" && isOrganizer && (
          <div className="space-y-5">
            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="all" className="bg-[#15151f]">Tous les statuts</option>
                <option value="draft" className="bg-[#15151f]">Brouillon</option>
                <option value="pending" className="bg-[#15151f]">En attente</option>
                <option value="approved" className="bg-[#15151f]">Approuvé</option>
                <option value="rejected" className="bg-[#15151f]">Rejeté</option>
              </select>
            </div>

            {/* Events grid */}
            {createdEvents.length === 0 ? (
              <EmptyState
                message="Aucun événement trouvé"
                action={
                  <Link
                    href="/dashboard/events/create"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                  >
                    <Plus size={14} />
                    Créer un événement
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {createdEvents.map((event) => (
                  <ManagedEventCard
                    key={event.id}
                    event={event}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Registrations Tab ── */}
        {activeTab === "registered" && (
          <div className="space-y-4">
            {registrations.length === 0 ? (
              <EmptyState
                message="Vous n'êtes inscrit à aucun événement"
                action={
                  <Link
                    href="/events"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                  >
                    <Eye size={14} />
                    Explorer les événements
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {registrations.map((reg) => (
                  <RegistrationCard key={reg.id} reg={reg} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteEventModal
          event={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
