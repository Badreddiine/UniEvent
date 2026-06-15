"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  AuthCard,
  AuthHeader,
  FormField,
  PasswordInput,
  UniEventLogo,
} from "@/components/auth/auth-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import type { UserRole } from "@/types";

function mapRole(
  backendRole: string | undefined,
  presidentDeClub?: boolean,
): UserRole {
  switch ((backendRole ?? "").toUpperCase()) {
    case "ADMIN": return "admin";
    case "DOYEN": return "doyen";
    case "RESPONSABLE_EVENEMENTS": return "responsable_evenements";
    case "PRESIDENT_CLUB": return "president_club";
    // ETUDIANT (ou rôle absent/null) : un président de club (FK Club.president)
    // obtient la vue president_club, sinon vue étudiant.
    case "ETUDIANT":
    default: return presidentDeClub ? "president_club" : "etudiant";
  }
}

export default function LoginPage() {
  const { login, setLoading, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    setLoading(true);
    try {
      const res = await authService.login({ email, motDePasse: password });
      // Store token first so subsequent request includes Authorization header
      login(
        {
          id: String(res.userId),
          email: res.email,
          firstName: "",
          lastName: "",
          role: mapRole(res.role),
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        res.accessToken
      );
      // Fetch full profile to populate firstName/lastName
      try {
        const me = await userService.getMe();
        login(
          {
            id: String(me.id),
            email: me.email,
            firstName: me.prenom ?? "",
            lastName: me.nom ?? "",
            role: mapRole(me.role, me.presidentDeClub),
            twoFactorEnabled: false,
            createdAt: me.dateCreation,
            updatedAt: me.dateCreation,
          },
          res.accessToken
        );
      } catch {
        // If profile fetch fails, keep minimal user data
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <UniEventLogo className="mb-8" />

      <AuthCard>
        <div className="p-8">
          <AuthHeader
            icon={<LogIn className="h-6 w-6 text-primary" />}
            title="Bon retour !"
            subtitle="Connectez-vous à votre espace UniEvent"
          />

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <FormField label="Adresse email" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="vous@fst-settat.ac.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </FormField>

            <FormField label="Mot de passe" required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
            </FormField>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-brand-400 font-semibold shadow-glow transition-all hover:shadow-glow-lg hover:brightness-110"
              size="lg"
              disabled={submitting || isLoading}
            >
              {submitting || isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Connexion…
                </span>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </div>

        <div className="border-t border-border/60 bg-muted/30 px-8 py-4 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="font-medium text-primary transition-colors hover:underline">
            Créer un compte
          </Link>
        </div>
      </AuthCard>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        FST Settat — Plateforme de gestion des événements universitaires
      </p>
    </div>
  );
}
