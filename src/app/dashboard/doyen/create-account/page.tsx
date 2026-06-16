"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User, CheckCircle, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type RoleOption = {
  value: string;
  label: string;
  description: string;
  icon: string;
};

const PRIVILEGED_ROLES: RoleOption[] = [
  {
    value: "DOYEN",
    label: "Doyen",
    description: "Approbation des réservations et supervision générale",
    icon: "👨‍💼",
  },
  {
    value: "RESPONSABLE_EVENEMENTS",
    label: "Responsable Événements",
    description: "Supervision et gestion de tous les événements",
    icon: "📋",
  },
  {
    value: "PRESIDENT_CLUB",
    label: "Président de Club",
    description: "Gestion des événements d'un club spécifique",
    icon: "🏛️",
  },
];

interface FormState {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  role: string;
}

interface FieldErrors {
  prenom?: string;
  nom?: string;
  email?: string;
  motDePasse?: string;
  role?: string;
}

export default function DoyenCreateAccountPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [form, setForm] = useState<FormState>({
    prenom: "",
    nom: "",
    email: "",
    motDePasse: "",
    role: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  if (user?.role !== "doyen") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Accès refusé</h2>
        <p className="text-muted-foreground">Cette page est réservée au Doyen.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setApiError(null);
  }

  function validate(): boolean {
    const newErrors: FieldErrors = {};
    if (!form.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";
    if (!form.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    if (!form.email.trim()) newErrors.email = "L'email est obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Email invalide";
    if (!form.motDePasse) newErrors.motDePasse = "Le mot de passe est obligatoire";
    else if (form.motDePasse.length < 8)
      newErrors.motDePasse = "Minimum 8 caractères";
    if (!form.role) newErrors.role = "Veuillez sélectionner un rôle";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    try {
      await apiClient.post("/utilisateurs", {
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        email: form.email.trim().toLowerCase(),
        motDePasse: form.motDePasse,
        role: form.role,
      });
      setSuccess(`Compte créé avec succès pour ${form.prenom} ${form.nom} (${form.role})`);
      setForm({ prenom: "", nom: "", email: "", motDePasse: "", role: "" });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data ?? "Erreur lors de la création du compte";
      setApiError(typeof msg === "string" ? msg : "Erreur lors de la création du compte");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
          <p className="text-sm text-muted-foreground">
            Créez des comptes avec des rôles privilégiés
          </p>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Error banner */}
      {apiError && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
          <p className="text-sm text-destructive">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Identity */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Identité
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Prénom <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Ahmed"
                  value={form.prenom}
                  onChange={(e) => set("prenom", e.target.value)}
                  className={cn("pl-9", errors.prenom && "border-destructive")}
                  autoFocus
                />
              </div>
              {errors.prenom && (
                <p className="text-xs text-destructive">{errors.prenom}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Nom <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Benali"
                value={form.nom}
                onChange={(e) => set("nom", e.target.value)}
                className={cn(errors.nom && "border-destructive")}
              />
              {errors.nom && (
                <p className="text-xs text-destructive">{errors.nom}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Email <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="ahmed.benali@fst-settat.ac.ma"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={cn("pl-9", errors.email && "border-destructive")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Mot de passe <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={form.motDePasse}
                onChange={(e) => set("motDePasse", e.target.value)}
                className={cn("pl-9", errors.motDePasse && "border-destructive")}
              />
            </div>
            {errors.motDePasse && (
              <p className="text-xs text-destructive">{errors.motDePasse}</p>
            )}
          </div>
        </div>

        {/* Role selection */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Rôle
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PRIVILEGED_ROLES.map((role) => {
              const selected = form.role === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => set("role", role.value)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-background hover:border-primary/40 hover:bg-accent/40"
                  )}
                >
                  <span className="text-2xl">{role.icon}</span>
                  <span className="text-sm font-semibold text-foreground">{role.label}</span>
                  <span className="text-xs text-muted-foreground leading-snug">
                    {role.description}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.role && (
            <p className="text-xs text-destructive">{errors.role}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={submitting} className="gap-2 min-w-36">
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Création…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Créer le compte
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
