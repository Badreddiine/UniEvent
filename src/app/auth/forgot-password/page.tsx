"use client";

import Link from "next/link";
import { KeyRound, Mail, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { useAuthForm } from "@/hooks/use-auth-form";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/lib/validations/auth";
import {
  AuthCard,
  AuthHeader,
  FormField,
  UniEventLogo,
} from "@/components/auth/auth-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const form = useAuthForm<ForgotPasswordSchema>(forgotPasswordSchema, {
    email: "",
  });

  const handleSubmit = async (data: ForgotPasswordSchema) => {
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <UniEventLogo className="mb-8" />

      <AuthCard>
        {!sent ? (
          <div className="p-8">
            <AuthHeader
              icon={<KeyRound className="h-6 w-6 text-primary" />}
              title="Mot de passe oublié ?"
              subtitle="Saisissez votre email pour recevoir un lien de réinitialisation"
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(handleSubmit);
              }}
              noValidate
              className="space-y-5"
            >
              <FormField
                label="Adresse email"
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
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </FormField>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 bg-gradient-to-r from-primary to-brand-400 font-semibold shadow-glow hover:brightness-110"
                disabled={form.isSubmitting}
              >
                {form.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Envoi en cours…
                  </span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer le lien
                  </>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div className="p-8 text-center animate-fade-in">
            {/* Success illustration */}
            <div className="mx-auto mb-6 relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-4 ring-primary/10 mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-sm text-white shadow-md">
                ✓
              </div>
            </div>

            <h2 className="font-display text-xl font-bold text-foreground">
              Email envoyé !
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Un lien de réinitialisation a été envoyé à{" "}
              <strong className="text-foreground">
                {form.values.email as string}
              </strong>
              . Consultez votre boîte mail et vos spams.
            </p>

            <div className="mt-6 rounded-xl bg-muted/50 border border-border/60 p-4 text-left space-y-2">
              <p className="text-xs font-medium text-foreground">À savoir :</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  Le lien est valable <strong>30 minutes</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  Vérifiez vos <strong>spams</strong> si vous ne le trouvez pas
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  Vous ne pouvez faire qu'une demande toutes les <strong>5 minutes</strong>
                </li>
              </ul>
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-6 w-full gap-2"
              onClick={() => setSent(false)}
            >
              <Mail className="h-4 w-4" />
              Renvoyer l'email
            </Button>
          </div>
        )}

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
