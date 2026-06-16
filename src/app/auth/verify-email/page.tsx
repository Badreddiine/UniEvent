"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ShieldX, MailWarning, ArrowLeft } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  AuthCard,
  AuthHeader,
  UniEventLogo,
} from "@/components/auth/auth-ui";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

type Status = "verifying" | "success" | "error" | "info";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const info = searchParams.get("info");
  const userEmail = useAuthStore((s) => s.user?.email);

  const [status, setStatus] = useState<Status>("verifying");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  // Prevent the verification request from firing twice (React strict mode / re-renders)
  const hasVerified = useRef(false);

  const handleResend = async () => {
    if (!userEmail) return;
    setResendState("sending");
    try {
      await authService.resendVerification(userEmail);
      setResendState("sent");
    } catch {
      setResendState("idle");
    }
  };

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    // Arriving without a token (e.g. redirected from a guard) → just show the info notice
    if (!token) {
      setStatus(info ? "info" : "error");
      return;
    }

    apiClient
      .get("/api/auth/verify-email", { params: { token } })
      .then(() => {
        setStatus("success");
        router.replace(
          "/auth/login?message=" +
            encodeURIComponent("Email vérifié, vous pouvez vous connecter")
        );
      })
      .catch(() => {
        setStatus("error");
      });
  }, [token, info, router]);

  if (status === "info") {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <UniEventLogo className="mb-8" />
        <AuthCard>
          <div className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400/20 to-orange-500/5 ring-4 ring-orange-500/10">
              <MailWarning className="h-9 w-9 text-orange-500" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Vérification requise
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{info}</p>

            {resendState === "sent" ? (
              <p className="mt-6 text-sm font-medium text-green-600 dark:text-green-400">
                Email renvoyé, vérifiez votre boîte.
              </p>
            ) : (
              <Button
                onClick={handleResend}
                disabled={resendState === "sending" || !userEmail}
                size="lg"
                className="mt-6 w-full bg-gradient-to-r from-primary to-brand-400 font-semibold shadow-glow hover:brightness-110"
              >
                {resendState === "sending" ? "Envoi…" : "Renvoyer l'email"}
              </Button>
            )}

            <div className="mt-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <UniEventLogo className="mb-8" />
        <AuthCard>
          <div className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-destructive/20 to-destructive/5 ring-4 ring-destructive/10">
              <ShieldX className="h-9 w-9 text-destructive" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Lien invalide ou expiré
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Le lien de vérification est invalide ou a expiré. Veuillez vous
              inscrire à nouveau ou demander un nouveau lien.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 w-full bg-gradient-to-r from-primary to-brand-400 font-semibold shadow-glow hover:brightness-110"
            >
              <Link href="/auth/login">Retour à la connexion</Link>
            </Button>
          </div>
        </AuthCard>
      </div>
    );
  }

  // "verifying" and brief "success" state before the redirect kicks in
  return (
    <div className="w-full max-w-md animate-fade-in">
      <UniEventLogo className="mb-8" />
      <AuthCard>
        <div className="p-8 text-center">
          <AuthHeader
            icon={<ShieldCheck className="h-6 w-6 text-primary" />}
            title="Vérification de votre email"
            subtitle="Veuillez patienter pendant que nous validons votre lien…"
          />
          <div className="mt-6 flex justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        </div>

        <div className="border-t border-border/60 bg-muted/30 px-8 py-4 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à la connexion
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
