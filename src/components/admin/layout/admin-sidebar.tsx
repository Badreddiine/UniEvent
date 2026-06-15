"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, CalendarDays, BookOpen,
  Building2, BarChart3, Settings2, Users, GraduationCap,
  SlidersHorizontal, List, Clock, CheckSquare,
  ChevronDown, PanelLeftClose, PanelLeft,
  Bell, Settings, ShieldCheck, UserPlus, Zap,
  Shield, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { ADMIN_NAV_ITEMS, ADMIN_BREADCRUMB_LABELS } from "@/lib/admin-constants";
import { APP_NAME, UNIVERSITY_NAME } from "@/lib/constants";
import type { NavItem } from "@/types";

// ── Icon map ──────────────────────────────────────────────────
const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, Calendar, CalendarDays, BookOpen,
  Building2, BarChart3, Settings2, Users, GraduationCap,
  SlidersHorizontal, List, Clock, CheckSquare,
  Bell, Settings, ShieldCheck, UserPlus, Zap, Shield,
};

const SIDEBAR_W = 268;
const SIDEBAR_W_COLLAPSED = 72;

function getIcon(name: string) {
  const Icon = ICONS[name];
  return Icon ? <Icon size={17} /> : null;
}

// ── NavLink ───────────────────────────────────────────────────
function AdminNavLink({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(
    () => item.children?.some((c) => pathname.startsWith(c.href)) ?? false
  );

  const isActive = pathname === item.href;
  const isParentActive =
    item.children?.some((c) => pathname.startsWith(c.href)) ?? false;
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren && !collapsed) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-admin-sidebar-foreground/60 hover:text-admin-sidebar-foreground hover:bg-white/[0.06]",
            isParentActive && "text-admin-sidebar-foreground bg-white/[0.08]"
          )}
        >
          <span className={cn(
            "flex-shrink-0 transition-colors",
            isParentActive ? "text-admin-accent" : "text-admin-sidebar-foreground/40 group-hover:text-admin-sidebar-foreground/70"
          )}>
            {getIcon(item.icon)}
          </span>
          <span className="flex-1 text-left leading-none">{item.label}</span>
          <span className={cn("transition-transform duration-200 text-admin-sidebar-foreground/30", open ? "rotate-180" : "rotate-0")}>
            <ChevronDown size={13} />
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-0.5 border-l border-white/10 pl-3 space-y-0.5 pb-1">
                {item.children!.map((child) => (
                  <AdminNavLink key={child.href} item={child} collapsed={false} depth={depth + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "text-admin-sidebar-foreground/60 hover:text-admin-sidebar-foreground hover:bg-white/[0.06]",
        isActive && "bg-admin-accent/15 text-admin-accent shadow-sm border border-admin-accent/20",
        collapsed && "justify-center px-0"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-admin-accent" />
      )}
      <span className={cn(
        "flex-shrink-0 transition-colors",
        isActive
          ? "text-admin-accent"
          : "text-admin-sidebar-foreground/40 group-hover:text-admin-sidebar-foreground/70"
      )}>
        {getIcon(item.icon)}
      </span>
      {!collapsed && (
        <span className="flex-1 truncate leading-none">{item.label}</span>
      )}
      {!collapsed && item.badge && item.badge > 0 && (
        <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}

// ── Admin Sidebar ─────────────────────────────────────────────
export function AdminSidebar() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "hidden lg:flex flex-col h-screen flex-shrink-0 relative",
        "bg-admin-sidebar border-r border-white/[0.07] overflow-hidden"
      )}
    >
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-admin-accent/5 via-transparent to-red-500/3" />

      {/* Logo */}
      <div className="relative flex h-16 items-center border-b border-white/[0.07] px-4 gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-violet-600 shadow-lg shadow-admin-accent/30">
          <Shield size={15} className="text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden flex-1 min-w-0"
            >
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-bold text-white leading-none tracking-tight">
                    {APP_NAME} <span className="text-admin-accent">Admin</span>
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5 leading-none whitespace-nowrap">
                    {UNIVERSITY_NAME}
                  </p>
                </div>
                <span className="ml-auto flex items-center gap-1 rounded-md bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold text-red-400 border border-red-500/20 whitespace-nowrap">
                  <AlertTriangle size={9} />
                  ADMIN
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-none">
        {ADMIN_NAV_ITEMS.map((item) => (
          <AdminNavLink
            key={item.href}
            item={item}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* System status widget */}
      {!sidebarCollapsed && (
        <div className="relative mx-3 mb-3 rounded-xl bg-white/[0.04] border border-white/[0.07] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
            Système
          </p>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-xs text-white/60">Tous les services opérationnels</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[99%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
          </div>
          <p className="mt-1 text-[10px] text-white/30">Uptime 99.2%</p>
        </div>
      )}

      {/* User card */}
      {user && (
        <div className="relative border-t border-white/[0.07] p-3">
          <div className={cn(
            "flex items-center gap-3 rounded-xl p-2",
            sidebarCollapsed && "justify-center"
          )}>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-violet-600 text-white text-xs font-bold shadow-lg">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-xs font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-[10px] text-white/30">Administrateur système</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="border-t border-white/[0.07] p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
        >
          {sidebarCollapsed ? (
            <PanelLeft size={15} />
          ) : (
            <>
              <PanelLeftClose size={15} />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
