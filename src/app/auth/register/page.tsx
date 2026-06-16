"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useAuthForm } from "@/hooks/use-auth-form";
import { registerSchema, type RegisterSchema } from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import {
  AuthCard,
  AuthHeader,
  FormField,
  PasswordInput,
  PasswordStrength,
  UniEventLogo,
} from "@/components/auth/auth-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Identité", "Sécurité"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const form = useAuthForm<RegisterSchema>(registerSchema, {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const nextStep = () => {
    // Validate current step fields
    if (step === 1) {
      form.touchField("firstName");
      form.touchField("lastName");
      form.touchField("email");
      if (form.errors.firstName || form.errors.lastName || form.errors.email) return;
      if (!form.values.firstName || !form.values.lastName || !form.values.email) return;
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const handleRegister = async (data: RegisterSchema) => {
    const res = await authService.register({
      nom: data.lastName as string,
      prenom: data.firstName as string,
      email: data.email as string,
      motDePasse: data.password as string,
    });
    // No auto-login: the account stays disabled until the email is verified.
    setServerMessage(res.message);
    setSubmitted(true);
    router.replace(
      "/auth/login?message=" +
        encodeURIComponent("Vérifiez votre email pour activer votre compte")
    );
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <UniEventLogo className="mb-8" />
        <AuthCard>
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Vérifiez votre email
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {serverMessage ||
                "Un email de confirmation a été envoyé. Cliquez sur le lien pour activer votre compte."}
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href="/auth/login">Aller à la connexion</Link>
            </Button>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <UniEventLogo className="mb-8" />

      <AuthCard>
        <div className="p-8">
          <AuthHeader
            icon={<UserPlus className="h-6 w-6 text-primary" />}
            title="Créer un compte"
            subtitle="Rejoignez la communauté UniEvent FST Settat"
          />

          {/* Step indicator */}
          <div className="mb-7 flex items-center gap-2">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const active = n === step;
              const done = n < step;
              return (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all",
                        done && "bg-primary text-primary-foreground",
                        active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                        !done && !active && "bg-muted text-muted-foreground"
                      )}
                    >
                      {done ? "✓" : n}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className={cn(
                        "mb-4 h-[1px] flex-1 transition-colors",
                        done ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 2) nextStep();
              else form.handleSubmit(handleRegister);
            }}
            noValidate
            className="space-y-4"
          >
            {/* ── Step 1: Identity ── */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="Prénom"
                    error={form.touched.firstName ? form.errors.firstName : undefined}
                    required
                  >
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Ahmed"
                        value={(form.values.firstName as string) ?? ""}
                        onChange={(e) => form.setValue("firstName", e.target.value)}
                        onBlur={() => form.touchField("firstName")}
                        error={!!(form.touched.firstName && form.errors.firstName)}
                        className="pl-9"
                        autoFocus
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Nom"
                    error={form.touched.lastName ? form.errors.lastName : undefined}
                    required
                  >
                    <Input
                      placeholder="Benali"
                      value={(form.values.lastName as string) ?? ""}
                      onChange={(e) => form.setValue("lastName", e.target.value)}
                      onBlur={() => form.touchField("lastName")}
                      error={!!(form.touched.lastName && form.errors.lastName)}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Email universitaire"
                  error={form.touched.email ? form.errors.email : undefined}
                  required
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="vous@fst-settat.ac.ma"
                      value={(form.values.email as string) ?? ""}
                      onChange={(e) => form.setValue("email", e.target.value)}
                      onBlur={() => form.touchField("email")}
                      error={!!(form.touched.email && form.errors.email)}
                      className="pl-9"
                    />
                  </div>
                </FormField>
              </div>
            )}

            {/* ── Step 2: Security ── */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <FormField
                  label="Mot de passe"
                  error={form.touched.password ? form.errors.password : undefined}
                  required
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <PasswordInput
                      value={(form.values.password as string) ?? ""}
                      onChange={(e) => form.setValue("password", e.target.value)}
                      onBlur={() => form.touchField("password")}
                      error={!!(form.touched.password && form.errors.password)}
                      className="pl-9"
                      placeholder="••••••••"
                      autoFocus
                    />
                  </div>
                  <PasswordStrength password={(form.values.password as string) ?? ""} />
                </FormField>

                <FormField
                  label="Confirmer le mot de passe"
                  error={form.touched.confirmPassword ? form.errors.confirmPassword : undefined}
                  required
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <PasswordInput
                      value={(form.values.confirmPassword as string) ?? ""}
                      onChange={(e) => form.setValue("confirmPassword", e.target.value)}
                      onBlur={() => form.touchField("confirmPassword")}
                      error={!!(form.touched.confirmPassword && form.errors.confirmPassword)}
                      className="pl-9"
                      placeholder="••••••••"
                    />
                  </div>
                </FormField>

                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={(form.values.acceptTerms as boolean) ?? false}
                    onChange={(e) => form.setValue("acceptTerms", e.target.checked as any)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                  />
                  <span>
                    J'accepte les{" "}
                    <a href="#" className="text-primary hover:underline">
                      conditions d'utilisation
                    </a>{" "}
                    et la{" "}
                    <a href="#" className="text-primary hover:underline">
                      politique de confidentialité
                    </a>
                  </span>
                </label>
                {form.touched.acceptTerms && form.errors.acceptTerms && (
                  <p className="text-xs text-destructive">{form.errors.acceptTerms}</p>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className={cn("flex gap-3 pt-2", step > 1 ? "justify-between" : "justify-end")}>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Retour
                </Button>
              )}

              <Button
                type="submit"
                className={cn(
                  "gap-1 font-semibold",
                  step === 2
                    ? "flex-1 bg-gradient-to-r from-primary to-brand-400 shadow-glow hover:brightness-110"
                    : ""
                )}
                disabled={form.isSubmitting}
              >
                {form.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Création…
                  </span>
                ) : step === 2 ? (
                  "Créer mon compte"
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="border-t border-border/60 bg-muted/30 px-8 py-4 text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary transition-colors hover:underline"
          >
            Se connecter
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
