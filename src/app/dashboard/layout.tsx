"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { MobileSidebarOverlay } from "@/components/layout/mobile-sidebar-overlay";
import { useAuthStore } from "@/store/auth.store";

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
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/auth/login");
    } else if (user?.emailVerified === false) {
      router.replace(
        "/auth/verify-email?info=" +
          encodeURIComponent(
            "Veuillez vérifier votre email avant d'accéder au tableau de bord"
          )
      );
    }
  }, [hydrated, isAuthenticated, user?.emailVerified, router]);

  // Spinner pendant la réhydratation
  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  // Bloquer le rendu pendant les redirections (non authentifié / email non vérifié)
  if (!isAuthenticated || user?.emailVerified === false) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <MobileSidebarOverlay />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
