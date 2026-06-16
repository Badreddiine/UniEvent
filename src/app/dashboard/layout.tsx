"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MailWarning } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { MobileSidebarOverlay } from "@/components/layout/mobile-sidebar-overlay";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";

function EmailVerificationBanner({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const handleResend = async () => {
    if (!email) return;
    setState("sending");
    try {
      await authService.resendVerification(email);
      setState("sent");
    } catch {
      setState("idle");
    }
  };

  return (
    <div className="border-b border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-700 dark:text-orange-300">
      <div className="container mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <MailWarning className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Veuillez vérifier votre adresse email. Consultez votre boîte mail et
            cliquez sur le lien de vérification.
          </span>
        </div>
        {state === "sent" ? (
          <span className="font-medium sm:whitespace-nowrap">
            Email renvoyé, vérifiez votre boîte.
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={state === "sending"}
            className="self-start font-medium underline transition-colors hover:text-orange-800 disabled:opacity-60 dark:hover:text-orange-200 sm:self-auto sm:whitespace-nowrap"
          >
            {state === "sending" ? "Envoi…" : "Renvoyer l'email"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  // Attendre la réhydratation du store Zustand (localStorage)
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [hydrated, isAuthenticated, router]);

  // Spinner pendant la réhydratation
  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <MobileSidebarOverlay />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        {user?.emailVerified === false && (
          <EmailVerificationBanner email={user.email} />
        )}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
