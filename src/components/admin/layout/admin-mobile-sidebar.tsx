"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-constants";
import { APP_NAME, UNIVERSITY_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

function MobileNavLink({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <div>
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
          isActive
            ? "bg-admin-accent/15 text-admin-accent border border-admin-accent/20"
            : "text-white/60 hover:text-white hover:bg-white/[0.06]"
        )}
      >
        <span className="text-current">{item.label}</span>
      </Link>
      {item.children && (
        <div className="ml-4 mt-1 border-l border-white/10 pl-3 space-y-0.5">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all",
                pathname === child.href
                  ? "text-admin-accent"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminMobileSidebar() {
  // Sélecteurs : les actions zustand ont une référence STABLE
  // (évite les re-renders sur tout le store + la boucle infinie #185).
  const mobileSidebarOpen = useUIStore((s) => s.sidebarMobileOpen);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);
  const setMobileSidebarOpen = (v: boolean) => { if (!v) closeMobileSidebar(); else toggleMobileSidebar(); };
  const { user } = useAuthStore();
  const pathname = usePathname();

  // Fermer au changement de route — dépend uniquement de `pathname`
  // (closeMobileSidebar est une action stable, pas recréée à chaque render).
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  // Lock body scroll
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileSidebarOpen]);

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-admin-sidebar border-r border-white/[0.07] flex flex-col lg:hidden overflow-hidden"
          >
            {/* Gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-admin-accent/5 via-transparent to-transparent" />

            {/* Header */}
            <div className="relative flex h-16 items-center justify-between border-b border-white/[0.07] px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-violet-600 shadow-lg">
                  <Shield size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {APP_NAME} <span className="text-admin-accent">Admin</span>
                  </p>
                  <p className="text-[10px] text-white/30">{UNIVERSITY_NAME}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Admin badge */}
            <div className="relative px-4 py-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 w-fit">
                <AlertTriangle size={11} className="text-red-400" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-red-400">Mode Admin Actif</span>
              </div>
            </div>

            {/* Nav */}
            <nav className="relative flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-none">
              {ADMIN_NAV_ITEMS.map((item) => (
                <MobileNavLink
                  key={item.href}
                  item={item}
                  onClose={() => setMobileSidebarOpen(false)}
                />
              ))}
            </nav>

            {/* User */}
            {user && (
              <div className="relative border-t border-white/[0.07] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-violet-600 text-white text-xs font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
                    <p className="truncate text-[11px] text-white/30">Administrateur</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
