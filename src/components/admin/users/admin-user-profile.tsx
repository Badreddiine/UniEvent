"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Crown, Shield, CheckCircle2, XCircle,
  Clock, Mail, Phone, Building2, Calendar, Star,
  Users, TrendingUp, UserCheck, UserX, UserCog,
  AlertTriangle, Edit2, X, Hash,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { userService } from "@/services/user.service";
import type { RoleEnum, UtilisateurResponseDTO } from "@/types/api";
import {
  ROLE_LABELS,
  ROLE_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from "@/lib/admin-users-data";

// ── Map backend user -> rich AdminUser shape ──────────────────

const API_ROLE_TO_UI: Record<string, UserRole> = {
  ADMIN: "admin",
  DOYEN: "doyen",
  RESPONSABLE_EVENEMENTS: "responsable_evenements",
};
const UI_ROLE_TO_API: Partial<Record<UserRole, RoleEnum>> = {
  admin: "ADMIN",
  doyen: "DOYEN",
  responsable_evenements: "RESPONSABLE_EVENEMENTS",
};

function mapToAdminUser(u: UtilisateurResponseDTO): AdminUser {
  return {
    id: String(u.id),
    name: `${u.prenom} ${u.nom}`.trim(),
    email: u.email,
    role: u.role ? API_ROLE_TO_UI[u.role] ?? "etudiant" : "etudiant",
    status: u.actif ? "active" : "inactive",
    isPremium: false,
    department: "—",
    joinedAt: u.dateCreation,
    lastSeen: u.dateCreation,
    eventsCreated: 0,
    eventsAttended: 0,
    clubsJoined: [],
    phone: u.telephone,
    verified: u.actif,
  };
}

// ── Types / helpers ───────────────────────────────────────────

interface Props {
  userId: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function formatRelative(iso: string) {
  const now = new Date("2026-05-06T12:00:00Z");
  const d = new Date(iso);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `Il y a ${mins} minutes`;
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  if (days < 30) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  return formatDate(iso);
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
];
function avatarColor(id: string) {
  return AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];
}

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: "etudiant", label: "Étudiant", description: "Accès de base, participation aux événements" },
  { value: "president_club", label: "Président Club", description: "Gestion d'un club et ses événements" },
  { value: "responsable_evenements", label: "Resp. Événements", description: "Coordination des événements universitaires" },
  { value: "doyen", label: "Doyen", description: "Approbation des événements et clubs" },
  { value: "admin", label: "Administrateur", description: "Accès total à la plateforme" },
];

// ── Main Component ────────────────────────────────────────────

export function AdminUserProfile({ userId }: Props) {
  const qc = useQueryClient();
  const [override, setOverride] = useState<Partial<AdminUser>>({});
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: userService.list,
  });
  const apiUser = users?.find((u) => String(u.id) === userId);

  const roleMutation = useMutation({
    mutationFn: ({ role }: { role: RoleEnum }) =>
      userService.updateRole(Number(userId), { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  const deactivateMutation = useMutation({
    mutationFn: () => userService.deactivate(Number(userId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  if (isLoading) {
    return <div className="py-24 text-center text-white/40">Chargement…</div>;
  }

  if (!apiUser) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white/30">
        <AlertTriangle size={40} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">Utilisateur introuvable</p>
        <Link href="/admin/users" className="mt-4 text-sm text-admin-accent hover:underline flex items-center gap-1">
          <ArrowLeft size={13} /> Retour à la liste
        </Link>
      </div>
    );
  }

  const user: AdminUser = { ...mapToAdminUser(apiUser), ...override };

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function toggleStatus() {
    // Backend only supports deactivation via this endpoint.
    deactivateMutation.mutate(undefined, {
      onSuccess: () => {
        setOverride((o) => ({ ...o, status: "inactive" }));
        showToast("Compte désactivé");
      },
      onError: () => showToast("Action impossible", "error"),
    });
  }

  function toggleSuspend() {
    const next: UserStatus = user.status === "suspended" ? "active" : "suspended";
    setOverride((o) => ({ ...o, status: next }));
    showToast(next === "suspended" ? "Compte suspendu" : "Suspension levée", next === "suspended" ? "error" : "success");
  }

  function changeRole(role: UserRole) {
    const apiRole = UI_ROLE_TO_API[role];
    setShowRoleModal(false);
    if (!apiRole) {
      showToast("Ce rôle ne peut pas être assigné via l'API.", "error");
      return;
    }
    roleMutation.mutate(
      { role: apiRole },
      {
        onSuccess: () => {
          setOverride((o) => ({ ...o, role }));
          showToast(`Rôle mis à jour : ${ROLE_LABELS[role]}`);
        },
        onError: () => showToast("Mise à jour du rôle impossible", "error"),
      }
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb back */}
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors">
        <ArrowLeft size={14} />Retour aux utilisateurs
      </Link>

      {/* Profile Header Card */}
      <div className="bg-admin-card border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Gradient banner */}
        <div className={cn("h-24 bg-gradient-to-r opacity-60", avatarColor(user.id))} />

        <div className="px-6 pb-6">
          {/* Avatar + actions row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className={cn(
                "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl font-bold text-white border-4 border-admin-card shadow-xl",
                avatarColor(user.id)
              )}>
                {getInitials(user.name)}
              </div>
              {user.isPremium && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
                  <Crown size={11} className="text-amber-900" />
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pb-2">
              <button
                onClick={() => setShowRoleModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white/70 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <UserCog size={13} />Modifier rôle
              </button>
              <button
                onClick={toggleStatus}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all",
                  user.status === "active"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                )}
              >
                {user.status === "active" ? <><UserX size={13} />Désactiver</> : <><UserCheck size={13} />Activer</>}
              </button>
              <button
                onClick={toggleSuspend}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all",
                  user.status === "suspended"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                )}
              >
                {user.status === "suspended" ? <><CheckCircle2 size={13} />Lever suspension</> : <><XCircle size={13} />Suspendre</>}
              </button>
            </div>
          </div>

          {/* Name + badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            {user.isPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400/15 text-amber-400 border border-amber-400/30">
                <Crown size={9} />Premium
              </span>
            )}
            {!user.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Non vérifié
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border", ROLE_COLORS[user.role])}>
              {ROLE_LABELS[user.role]}
            </span>
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border", STATUS_COLORS[user.status])}>
              {STATUS_LABELS[user.status]}
            </span>
          </div>

          {user.bio && (
            <p className="text-sm text-white/50 max-w-lg">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Two-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact info */}
        <InfoCard title="Informations de contact">
          <InfoRow icon={<Mail size={13} />} label="Email" value={user.email} mono />
          {user.phone && <InfoRow icon={<Phone size={13} />} label="Téléphone" value={user.phone} />}
          {user.studentId && <InfoRow icon={<Hash size={13} />} label="N° étudiant" value={user.studentId} mono />}
          <InfoRow icon={<Building2 size={13} />} label="Département" value={user.department} />
        </InfoCard>

        {/* Activity */}
        <InfoCard title="Activité">
          <InfoRow icon={<Calendar size={13} />} label="Inscrit le" value={formatDate(user.joinedAt)} />
          <InfoRow icon={<Clock size={13} />} label="Dernière connexion" value={formatRelative(user.lastSeen)} />
          <InfoRow icon={<TrendingUp size={13} />} label="Événements participés" value={String(user.eventsAttended)} />
          {user.eventsCreated > 0 && (
            <InfoRow icon={<Star size={13} />} label="Événements créés" value={String(user.eventsCreated)} />
          )}
        </InfoCard>
      </div>

      {/* Clubs */}
      {user.clubsJoined.length > 0 && (
        <div className="bg-admin-card border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest text-[11px] mb-3">
            Clubs ({user.clubsJoined.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.clubsJoined.map((club) => (
              <span key={club} className="px-3 py-1.5 rounded-lg bg-admin-accent/10 border border-admin-accent/20 text-sm text-admin-accent/80">
                {club}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats mini grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Événements participés", value: user.eventsAttended, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Clubs rejoints", value: user.clubsJoined.length, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Événements créés", value: user.eventsCreated, icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-admin-card border border-white/[0.06] rounded-xl p-4 text-center">
            <div className={cn("w-8 h-8 rounded-lg mx-auto flex items-center justify-center mb-2", bg)}>
              <Icon size={14} className={color} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-[11px] text-white/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
            className={cn(
              "fixed bottom-6 left-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl border",
              toast.type === "success"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-red-500/20 border-red-500/40 text-red-300"
            )}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRoleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[hsl(226_38%_10%)] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">Modifier le rôle</h2>
                  <p className="text-xs text-white/40 mt-0.5">{user.name}</p>
                </div>
                <button onClick={() => setShowRoleModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                  <X size={14} />
                </button>
              </div>
              <div className="px-6 py-4 space-y-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => changeRole(opt.value)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                      user.role === opt.value
                        ? "border-admin-accent/50 bg-admin-accent/10"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                      user.role === opt.value ? "border-admin-accent" : "border-white/20"
                    )}>
                      {user.role === opt.value && <div className="w-2 h-2 rounded-full bg-admin-accent" />}
                    </div>
                    <div>
                      <div className={cn("text-sm font-medium", user.role === opt.value ? "text-white" : "text-white/70")}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{opt.description}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-white/[0.06]">
                <button onClick={() => setShowRoleModal(false)} className="w-full py-2 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all">
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Info Card / Row ───────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-admin-card border border-white/[0.06] rounded-xl p-5">
      <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/30 flex-shrink-0">{icon}</span>
      <span className="text-xs text-white/40 w-28 flex-shrink-0">{label}</span>
      <span className={cn("text-sm text-white/80 truncate", mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}
