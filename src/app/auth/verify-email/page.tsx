"use client";

import Link from "next/link";
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  AuthCard,
  AuthHeader,
  UniEventLogo,
} from "@/components/auth/auth-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start resend cooldown on mount
  useEffect(() => {
    startCooldown();
  }, []);

  const startCooldown = () => {
    setResendCooldown(60);
    const id = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(id);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(""));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Veuillez saisir les 6 chiffres du code");
      return;
    }
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1500));
    // Mock: code 123456 = success, anything else = error
    if (code === "123456") {
      setVerified(true);
    } else {
      setError("Code incorrect. Veuillez réessayer.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
    setIsVerifying(false);
  };

  const handleResend = () => {
    startCooldown();
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    inputRefs.current[0]?.focus();
  };

  if (verified) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <UniEventLogo className="mb-8" />
        <AuthCard>
          <div className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400/20 to-green-500/5 ring-4 ring-green-500/10">
              <ShieldCheck className="h-9 w-9 text-green-500" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Email vérifié !
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre compte est maintenant actif. Vous pouvez vous connecter.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 w-full bg-gradient-to-r from-primary to-brand-400 font-semibold shadow-glow hover:brightness-110"
            >
              <Link href="/auth/login">Accéder à mon compte</Link>
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
            icon={<ShieldCheck className="h-6 w-6 text-primary" />}
            title="Vérifiez votre email"
            subtitle="Saisissez le code à 6 chiffres envoyé à votre adresse email"
          />

          {/* OTP inputs */}
          <div className="flex justify-center gap-2.5 mb-6">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={otp[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                autoFocus={i === 0}
                className={cn(
                  "h-12 w-10 rounded-xl border-2 text-center text-lg font-bold tracking-widest transition-all",
                  "bg-background focus:outline-none",
                  "focus:border-primary focus:ring-4 focus:ring-primary/15",
                  otp[i]
                    ? "border-primary/60 bg-accent/30 text-foreground"
                    : "border-border text-foreground",
                  error && "border-destructive/60 focus:border-destructive focus:ring-destructive/15"
                )}
              />
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-5">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 w-5 rounded-full transition-all duration-300",
                  otp[i] ? "bg-primary" : "bg-border"
                )}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-center text-sm text-destructive animate-fade-in">
              {error}
            </div>
          )}

          <Button
            onClick={handleVerify}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-brand-400 font-semibold shadow-glow hover:brightness-110"
            disabled={isVerifying || otp.join("").length < OTP_LENGTH}
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Vérification…
              </span>
            ) : (
              "Vérifier le code"
            )}
          </Button>

          {/* Hint */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Pour tester, utilisez le code{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
              123456
            </code>
          </p>

          {/* Resend */}
          <div className="mt-5 text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Renvoyer dans{" "}
                <span className="tabular-nums font-medium text-foreground">
                  {resendCooldown}s
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Renvoyer le code
              </button>
            )}
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
