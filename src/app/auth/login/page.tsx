"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { LogIn, Mail, Lock, CheckCircle2, MailWarning } from "lucide-react";
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

function LoginContent() {
  const { login, setLoading, isLoading } = useAuthStore();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setResendState("idle");
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
          emailVerified: res.emailVerified,
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
            emailVerified: res.emailVerified,
            createdAt: me.dateCreation,
            updatedAt: me.dateCreation,
          },
          res.accessToken
        );
      } catch {
        // If profile fetch fails, keep minimal user data
      }
      window.location.href = "/dashboard";
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        const data = err.response.data as { message?: string } | string | undefined;
        const backendMsg =
          typeof data === "string" ? data : data?.message ?? "";
        if (/disabled|activé|active|vérif|verif|email|Veuillez/i.test(backendMsg)) {
          setNeedsVerification(true);
        } else {
          setError("Email ou mot de passe incorrect.");
        }
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendState("sending");
    try {
      await authService.resendVerification(email);
      setResendState("sent");
    } catch {
      setResendState("idle");
      setError("Impossible de renvoyer l'email. Réessayez plus tard.");
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

          {message && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2.5 text-sm text-green-600 dark:text-green-400 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {needsVerification && (
            <div className="mb-5 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2.5 text-sm text-orange-600 dark:text-orange-400 animate-fade-in">
              <div className="flex items-start gap-2">
                <MailWarning className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Veuillez vérifier votre adresse email pour accéder à votre
                  compte.
                </span>
              </div>
              {resendState === "sent" ? (
                <p className="mt-2 pl-6 font-medium">
                  Email renvoyé, vérifiez votre boîte.
                </p>
              ) : (
                <div className="mt-2 pl-6">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendState === "sending" || !email}
                    className="font-medium text-orange-700 underline transition-colors hover:text-orange-800 disabled:opacity-60 dark:text-orange-300 dark:hover:text-orange-200"
                  >
                    {resendState === "sending"
                      ? "Envoi…"
                      : "Renvoyer l'email"}
                  </button>
                </div>
              )}
            </div>
          )}

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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
