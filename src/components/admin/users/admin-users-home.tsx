"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronLeft, ChevronRight, UserCog, UserX, UserCheck,
  MoreHorizontal, Eye, X, Users, Shield,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { userService } from "@/services/user.service";
import type { RoleEnum, UtilisateurResponseDTO } from "@/types/api";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  DOYEN: "Doyen",
  RESPONSABLE_EVENEMENTS: "Resp. Événements",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DOYEN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  RESPONSABLE_EVENEMENTS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const PAGE_SIZE = 10;

function getInitials(nom: string, prenom: string) {
  return `${(prenom[0] ?? "").toUpperCase()}${(nom[0] ?? "").toUpperCase()}`;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className ?? ""}`} />;
}

export function AdminUsersHome() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionMenu, setActionMenu] = useState<number | null>(null);
  const [editRoleModal, setEditRoleModal] = useState<UtilisateurResponseDTO | null>(null);
  const qc = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: userService.list,
  });

  const roleUpdateMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: RoleEnum }) =>
      userService.updateRole(id, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setEditRoleModal(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => userService.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setActionMenu(null);
    },
  });

  const filtered = (users ?? []).filter(
    (u) =>
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.prenom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-white/50 mt-0.5">{(users ?? []).length} comptes enregistrés</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-admin-card border border-white/[0.06] rounded-xl p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-admin-accent/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X size={13} />
            </button>
          )}
        </div>
        <div className="mt-3 text-xs text-white/40">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-white/[0.06] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-red-400">Erreur lors du chargement des utilisateurs.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40">Rôle</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40 hidden sm:table-cell">Statut</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-white/30 text-sm">
                      <Users size={32} className="mx-auto mb-3 opacity-30" />
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  paginated.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {getInitials(user.nom, user.prenom)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {user.prenom} {user.nom}
                            </div>
                            <div className="text-xs text-white/40 truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {user.role ? (
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
                            ROLE_COLORS[user.role] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20")}>
                            <Shield size={10} />
                            {ROLE_LABELS[user.role] ?? user.role}
                          </span>
                        ) : (
                          <span className="text-xs text-white/30">Étudiant</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
                          user.actif
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20")}>
                          {user.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        <AnimatePresence>
                          {actionMenu === user.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-2 top-10 z-20 bg-[hsl(226_40%_11%)] border border-white/10 rounded-xl shadow-2xl py-1.5 min-w-[180px]"
                              >
                                <button
                                  onClick={() => { setEditRoleModal(user); setActionMenu(null); }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                                >
                                  <UserCog size={13} />Modifier le rôle
                                </button>
                                <div className="border-t border-white/[0.06] my-1" />
                                <button
                                  onClick={() => deactivateMutation.mutate(user.id)}
                                  disabled={deactivateMutation.isPending}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors disabled:opacity-50"
                                >
                                  <UserX size={13} />Désactiver
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-white/40">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/[0.06] disabled:text-white/20 disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn("w-7 h-7 rounded-lg text-xs font-medium transition-all",
                    p === page ? "bg-admin-accent text-white" : "text-white/40 hover:text-white/70 hover:bg-white/[0.06]")}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/[0.06] disabled:text-white/20 disabled:cursor-not-allowed transition-all">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {editRoleModal && (
          <EditRoleModal
            user={editRoleModal}
            onClose={() => setEditRoleModal(null)}
            onSave={(role) => roleUpdateMutation.mutate({ id: editRoleModal.id, role })}
            saving={roleUpdateMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const ROLE_OPTIONS: { value: RoleEnum; label: string; description: string }[] = [
  { value: "RESPONSABLE_EVENEMENTS", label: "Resp. Événements", description: "Coordination des événements universitaires" },
  { value: "DOYEN", label: "Doyen", description: "Approbation des événements" },
  { value: "ADMIN", label: "Administrateur", description: "Accès total à la plateforme" },
];

function EditRoleModal({ user, onClose, onSave, saving }: {
  user: UtilisateurResponseDTO;
  onClose: () => void;
  onSave: (role: RoleEnum) => void;
  saving: boolean;
}) {
  const [selected, setSelected] = useState<RoleEnum | null>(user.role ?? null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[hsl(226_38%_10%)] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{user.prenom} {user.nom}</div>
              <div className="text-xs text-white/40">{user.email}</div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
              <X size={14} />
            </button>
          </div>
          <h2 className="text-base font-semibold text-white mt-4">Modifier le rôle</h2>
        </div>
        <div className="px-6 py-4 space-y-2">
          {ROLE_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setSelected(opt.value)}
              className={cn("w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                selected === opt.value ? "border-admin-accent/50 bg-admin-accent/10" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]")}>
              <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                selected === opt.value ? "border-admin-accent" : "border-white/20")}>
                {selected === opt.value && <div className="w-2 h-2 rounded-full bg-admin-accent" />}
              </div>
              <div>
                <div className={cn("text-sm font-medium transition-colors", selected === opt.value ? "text-white" : "text-white/70")}>
                  {opt.label}
                </div>
                <div className="text-xs text-white/40 mt-0.5">{opt.description}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all">
            Annuler
          </button>
          <button onClick={() => selected && onSave(selected)} disabled={!selected || saving}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
              selected ? "bg-admin-accent text-white hover:bg-admin-accent/90 disabled:opacity-50" : "bg-white/[0.06] text-white/30 cursor-not-allowed")}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
