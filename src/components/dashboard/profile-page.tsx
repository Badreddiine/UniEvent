"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User, Mail, BookOpen, Building2, Shield,
  Camera, Save, GraduationCap, CheckCircle2,
  Edit3, Lock, Phone, Ticket, X, Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/utils";
import { userService } from "@/services/user.service";
import { registrationService } from "@/services/registration.service";
import { badgeService } from "@/services/badge.service";
import type { RegistrationDTO, BadgeDto } from "@/types/api";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

function BadgeModal({ reg, onClose }: { reg: RegistrationDTO; onClose: () => void }) {
  const [badge, setBadge] = useState<BadgeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useState(() => {
    badgeService
      .generate(reg.id)
      .then((b) => setBadge(b))
      .catch(() => setHasError(true))
      .finally(() => setLoading(false));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground text-sm">{"Badge d'accès"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X size={16} /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-4 text-center">{reg.evenementTitre}</p>
        <div className="flex items-center justify-center my-4">
          {loading ? (
            <div className="h-40 w-40 rounded-xl bg-muted/40 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : badge?.qrImage ? (
            <img src={`data:image/png;base64,${badge.qrImage}`} alt="QR Code badge" className="h-40 w-40 rounded-xl object-contain" />
          ) : (
            <div className="h-40 w-40 rounded-xl bg-foreground/5 border-2 border-dashed border-border flex items-center justify-center">
              <p className="text-xs text-muted-foreground text-center px-4">
                {hasError ? "Erreur lors du chargement" : "Badge non disponible"}
              </p>
            </div>
          )}
        </div>
        {badge?.token && (
          <div className="rounded-lg bg-muted px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">Token</p>
            <p className="font-mono text-xs font-bold text-foreground tracking-wider mt-0.5 break-all">{badge.token}</p>
          </div>
        )}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={13} /> Inscription confirmée
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
          Fermer
        </button>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [badgeReg, setBadgeReg] = useState<RegistrationDTO | null>(null);
  const [formSynced, setFormSynced] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", telephone: "" });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["me"],
    queryFn: userService.getMe,
  });

  const { data: registrations, isLoading: regsLoading } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: registrationService.getMyRegistrations,
  });

  if (profile && !formSynced) {
    setForm({ nom: profile.nom, prenom: profile.prenom, telephone: profile.telephone ?? "" });
    setFormSynced(true);
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      userService.updateMe({
        nom: form.nom || undefined,
        prenom: form.prenom || undefined,
        telephone: form.telephone || undefined,
        ...(avatarPreview ? { photo: avatarPreview } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
      setAvatarPreview(null);
    },
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setAvatarError("Fichier invalide. Choisissez une image."); return; }
    if (file.size > 2 * 1024 * 1024) { setAvatarError("Image trop lourde. Maximum 2 Mo."); return; }
    setAvatarError(null);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const confirmed = registrations?.filter((r) => r.statut === "CONFIRMEE") ?? [];
  const displayPhoto = avatarPreview ?? profile?.photo ?? authUser?.avatarUrl ?? null;
  const displayName = profile
    ? `${profile.prenom} ${profile.nom}`
    : authUser ? `${authUser.firstName} ${authUser.lastName}` : "Utilisateur";
  const initials = profile
    ? `${profile.prenom[0] ?? ""}${profile.nom[0] ?? ""}`
    : authUser ? `${authUser.firstName[0] ?? ""}${authUser.lastName[0] ?? ""}` : "U";

  if (profileLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <BackButton />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-36" /></div>
          <div className="lg:col-span-2 space-y-5"><Skeleton className="h-48" /><Skeleton className="h-32" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <BackButton />
      <PageHeader title="Mon Profil" description="Gérez vos informations personnelles">
        {editing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={updateMutation.isPending}
              onClick={() => { setEditing(false); setAvatarPreview(null); setAvatarError(null); }}>
              Annuler
            </Button>
            <Button size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="gap-1.5">
              {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Sauvegarder
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1.5">
            <Edit3 size={14} /> Modifier
          </Button>
        )}
      </PageHeader>

      {updateMutation.isSuccess && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={15} /> Profil mis à jour avec succès
        </motion.div>
      )}
      {updateMutation.isError && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-4 py-2.5 text-sm text-rose-700 dark:text-rose-400">
          Erreur lors de la mise à jour. Veuillez réessayer.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card text-center">
            <div className="relative inline-block">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Photo de profil"
                  className="h-24 w-24 mx-auto rounded-full object-cover shadow-lg ring-4 ring-brand-500/30" />
              ) : (
                <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white text-3xl font-bold shadow-lg">
                  {initials}
                </div>
              )}
              {editing && (
                <label htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-500 text-white shadow-md hover:bg-brand-600 transition-colors">
                  <Camera size={13} />
                  <input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                </label>
              )}
            </div>
            {editing && avatarError && <p className="mt-2 text-xs text-rose-500">{avatarError}</p>}
            {editing && !avatarError && <p className="mt-2 text-[10px] text-muted-foreground">JPG, PNG, WEBP · max 2 Mo</p>}
            <h2 className="mt-4 text-base font-display font-bold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{profile?.email ?? authUser?.email}</p>
            {authUser?.role && (
              <span className={cn("inline-flex mt-2 items-center rounded-full px-2.5 py-1 text-xs font-medium", ROLE_COLORS[authUser.role])}>
                {ROLE_LABELS[authUser.role]}
              </span>
            )}
            {authUser?.clubName && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <GraduationCap size={12} />{authUser.clubName}
              </p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="rounded-xl border border-border bg-card p-4 shadow-card">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Statistiques</h3>
            {regsLoading ? (
              <div className="grid grid-cols-2 gap-3">{[0, 1].map((i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/40 p-3 text-center">
                  <CheckCircle2 size={16} className="mx-auto mb-1 text-brand-500" />
                  <p className="text-lg font-display font-bold text-foreground">{confirmed.length}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Confirmées</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 text-center">
                  <Ticket size={16} className="mx-auto mb-1 text-brand-500" />
                  <p className="text-lg font-display font-bold text-foreground">{registrations?.length ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Total</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="rounded-xl border border-border bg-card p-4 shadow-card">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Sécurité du compte</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-foreground"><Shield size={13} className="text-muted-foreground" />Rôle vérifié</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Oui</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-foreground"><Lock size={13} className="text-muted-foreground" />Compte actif</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                  profile?.actif
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400")}>
                  {profile?.actif ? "Actif" : "Inactif"}
                </span>
              </div>
              {profile?.dateCreation && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  Membre depuis{" "}
                  {new Date(profile.dateCreation).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <User size={15} className="text-brand-500" />Informations personnelles
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Prénom</label>
                {editing ? (
                  <Input value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} className="h-9 text-sm" />
                ) : (
                  <p className="text-sm text-foreground py-2">{profile?.prenom ?? "—"}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nom</label>
                {editing ? (
                  <Input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} className="h-9 text-sm" />
                ) : (
                  <p className="text-sm text-foreground py-2">{profile?.nom ?? "—"}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <p className="text-sm text-foreground py-2 flex items-center gap-2">
                  <Mail size={13} className="text-muted-foreground" />
                  {profile?.email ?? authUser?.email ?? "—"}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Téléphone</label>
                {editing ? (
                  <Input value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                    className="h-9 text-sm" placeholder="+212 6 00 00 00 00" />
                ) : (
                  <p className="text-sm text-foreground py-2 flex items-center gap-2">
                    <Phone size={13} className="text-muted-foreground" />
                    {profile?.telephone ?? "Non renseigné"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen size={15} className="text-brand-500" />Informations du compte
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Établissement</label>
                <p className="text-sm text-foreground py-2 flex items-center gap-2">
                  <Building2 size={13} className="text-muted-foreground" />FST Settat
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Rôle</label>
                <p className="text-sm text-foreground py-2">{authUser?.role ? ROLE_LABELS[authUser.role] : "—"}</p>
              </div>
            </div>
          </div>

          {confirmed.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Ticket size={15} className="text-brand-500" />Billets confirmés
              </h3>
              <div className="space-y-3">
                {confirmed.map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{reg.evenementTitre}</p>
                      {reg.dateInscription && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(reg.dateInscription).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 flex-shrink-0" onClick={() => setBadgeReg(reg)}>
                      <Ticket size={13} />Badge
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {badgeReg && <BadgeModal reg={badgeReg} onClose={() => setBadgeReg(null)} />}
    </div>
  );
}
