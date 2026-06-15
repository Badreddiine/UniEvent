"use client";

import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// ── AuthCard ──────────────────────────────────────────────────
interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md overflow-hidden",
        "rounded-2xl border border-border/60",
        "bg-card/90 backdrop-blur-2xl",
        "shadow-[0_8px_40px_hsl(var(--primary)/0.12),0_2px_12px_hsl(0_0%_0%/0.08)]",
        className
      )}
    >
      {/* Top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      {children}
    </div>
  );
}

// ── AuthHeader ────────────────────────────────────────────────
interface AuthHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}
export function AuthHeader({ icon, title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
          {icon}
        </div>
      )}
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

// ── FormField ────────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}
export function FormField({
  label,
  error,
  required,
  children,
  hint,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-destructive animate-fade-in">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

// ── PasswordInput ─────────────────────────────────────────────
interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ error, className, ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        error={error}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        tabIndex={-1}
        aria-label={show ? "Masquer" : "Afficher"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

// ── PasswordStrength ──────────────────────────────────────────
interface PasswordStrengthProps {
  password: string;
}
export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = [
    { label: "8 caractères minimum", pass: password.length >= 8 },
    { label: "Une majuscule", pass: /[A-Z]/.test(password) },
    { label: "Un chiffre", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["", "bg-destructive", "bg-yellow-500", "bg-green-500"];
  const labels = ["", "Faible", "Moyen", "Fort"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= score ? colors[score] : "bg-border"
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map((c) => (
            <span
              key={c.label}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                c.pass ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              )}
            >
              <CheckCircle2 className="h-3 w-3" />
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span
            className={cn(
              "text-xs font-medium",
              score === 1 && "text-destructive",
              score === 2 && "text-yellow-600 dark:text-yellow-400",
              score === 3 && "text-green-600 dark:text-green-400"
            )}
          >
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

// ── AuthDivider ───────────────────────────────────────────────
export function AuthDivider({ label = "ou" }: { label?: string }) {
  return (
    <div className="relative my-6 flex items-center">
      <div className="flex-1 border-t border-border" />
      <span className="mx-3 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

// ── AuthBackground ────────────────────────────────────────────
export function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Mesh gradient */}
      <div className="absolute inset-0 bg-gradient-mesh" />
      {/* Soft orbs */}
      <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[100px]" />
      <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-gold/6 blur-[120px]" />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[80px]" />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}

// ── UniEvent Logo ─────────────────────────────────────────────
export function UniEventLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand-400 shadow-glow">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4 text-white"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
          <circle cx="12" cy="16" r="2" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        Uni<span className="text-gradient">Event</span>
      </span>
    </div>
  );
}
