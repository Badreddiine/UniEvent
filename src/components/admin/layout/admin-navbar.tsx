"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, Search, Shield, Menu, ChevronRight,
  LogOut, User, Settings, Sun, Moon, AlertTriangle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { ADMIN_BREADCRUMB_LABELS } from "@/lib/admin-constants";
import { APP_NAME } from "@/lib/constants";

// ── Breadcrumb ────────────────────────────────────────────────
function AdminBreadcrumb() {
  const pathname = usePathname();

  // Build crumbs from path segments
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = ADMIN_BREADCRUMB_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-sm">
      {crumbs.map((crumb, idx) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {idx > 0 && (
            <ChevronRight size={13} className="text-white/20 flex-shrink-0" />
          )}
          {crumb.isLast ? (
            <span className="font-semibold text-white/80 truncate max-w-[160px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-white/30 hover:text-white/60 transition-colors truncate max-w-[120px]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

// ── Notification bell ─────────────────────────────────────────
function NotifBell() {
  return (
    <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.10] transition-all">
      <Bell size={16} />
      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-admin-navbar shadow-sm shadow-red-500/60" />
    </button>
  );
}

// ── Admin Navbar ──────────────────────────────────────────────
export function AdminNavbar() {
  const { user, logout } = useAuthStore();
  const { toggleMobileSidebar } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-white/[0.07] bg-admin-navbar/90 backdrop-blur-xl px-4 lg:px-6">
      {/* Mobile menu */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white transition-all"
      >
        <Menu size={18} />
      </button>

      {/* Mobile brand */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-admin-accent to-violet-600">
          <Shield size={13} className="text-white" />
        </div>
        <span className="text-sm font-bold text-white">
          {APP_NAME} <span className="text-admin-accent">Admin</span>
        </span>
      </div>

      {/* Breadcrumb (desktop) */}
      <div className="hidden lg:block">
        <AdminBreadcrumb />
      </div>

      {/* Admin badge */}
      <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1">
        <AlertTriangle size={11} className="text-red-400" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-red-400">
          Mode Admin
        </span>
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              key="search-input"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <input
                autoFocus
                onBlur={() => setSearchOpen(false)}
                type="text"
                placeholder="Rechercher..."
                className="h-9 w-full rounded-xl bg-white/[0.06] border border-white/[0.10] px-3 text-sm text-white placeholder-white/30 outline-none focus:border-admin-accent/50 transition-all"
              />
            </motion.div>
          ) : (
            <button
              key="search-btn"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.10] transition-all"
            >
              <Search size={16} />
            </button>
          )}
        </AnimatePresence>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.10] transition-all"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <NotifBell />

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] px-3 py-1.5 hover:bg-white/[0.10] transition-all"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-admin-accent to-violet-600 text-white text-[10px] font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-white/80">
              {user?.firstName}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-admin-sidebar border border-white/[0.10] shadow-2xl overflow-hidden z-50"
                onMouseLeave={() => setProfileOpen(false)}
              >
                <div className="p-3 border-b border-white/[0.07]">
                  <p className="text-xs font-bold text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{user?.email}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold text-red-400 border border-red-500/20">
                    <Shield size={9} />
                    Administrateur
                  </span>
                </div>
                <div className="p-2 space-y-0.5">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <User size={13} />
                    Mon profil
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <Settings size={13} />
                    Paramètres admin
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={13} />
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
