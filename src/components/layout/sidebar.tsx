"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, CalendarDays, CalendarCheck,
  BookOpen, Building2, BarChart3, Settings2, Users,
  GraduationCap, SlidersHorizontal, Plus, FolderOpen,
  Clock, CheckSquare, Ticket, List, UserPlus, ChevronDown,
  ChevronRight, PanelLeftClose, PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { NAV_ITEMS, APP_NAME, UNIVERSITY_NAME } from "@/lib/constants";
import type { NavItem, UserRole } from "@/types";

// ── Icon map ─────────────────────────────────────────────────
const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, Calendar, CalendarDays, CalendarCheck,
  BookOpen, Building2, BarChart3, Settings2, Users,
  GraduationCap, SlidersHorizontal, Plus, FolderOpen,
  Clock, CheckSquare, Ticket, List, UserPlus,
};

// ── Sidebar width constants ───────────────────────────────────
const SIDEBAR_W = 260;
const SIDEBAR_W_COLLAPSED = 72;

function getIcon(name: string) {
  const Icon = ICONS[name];
  return Icon ? <Icon size={18} /> : null;
}

function hasAccess(item: NavItem, role?: UserRole) {
  if (!item.roles || item.roles.length === 0) return true;
  if (!role) return false;
  return item.roles.includes(role);
}

// ── NavLink ───────────────────────────────────────────────────
function NavLink({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
}) {
  const pathname = usePathname();
  const { user } = useAuthStore();
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
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            isParentActive && "text-sidebar-foreground bg-sidebar-accent/40"
          )}
        >
          <span className="flex-shrink-0 text-sidebar-foreground/60">
            {getIcon(item.icon)}
          </span>
          <span className="flex-1 text-left">{item.label}</span>
          <span
            className={cn(
              "transition-transform duration-200",
              open ? "rotate-180" : "rotate-0"
            )}
          >
            <ChevronDown size={14} />
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
              <div className="ml-3 mt-1 border-l border-sidebar-border pl-3 space-y-0.5">
                {item.children!.filter((child) => hasAccess(child, user?.role)).map((child) => (
                  <NavLink key={child.href} item={child} collapsed={false} depth={depth + 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // For parent items: navigate to first accessible child
  const effectiveHref = (item.children && item.children.length > 0)
    ? (item.children.find((c) => hasAccess(c, user?.role))?.href ?? item.href)
    : item.href;

  return (
    <Link
      href={effectiveHref}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
        collapsed && "justify-center px-0"
      )}
    >
      <span
        className={cn(
          "flex-shrink-0 transition-colors",
          isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
        )}
      >
        {getIcon(item.icon)}
      </span>

      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}

      {!collapsed && item.badge && item.badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-semibold text-white">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}

// ── Sidebar ───────────────────────────────────────────────────
export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!hasAccess(item, user?.role)) return false;
    // If item has children, only show it if at least one child is accessible
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => hasAccess(child, user?.role));
    }
    return true;
  });

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "hidden lg:flex flex-col h-screen flex-shrink-0",
        "bg-sidebar border-r border-sidebar-border overflow-hidden"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 shadow-md">
            <GraduationCap size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-display font-bold text-sidebar-foreground leading-none">
                  {APP_NAME}
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 mt-0.5 leading-none whitespace-nowrap">
                  {UNIVERSITY_NAME}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-none">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* User card at bottom */}
      {user && (
        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg p-2",
              sidebarCollapsed && "justify-center"
            )}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-semibold overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                `${user?.firstName?.[0]}${user?.lastName?.[0]}`
              )}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-xs font-medium text-sidebar-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-[10px] text-sidebar-foreground/50">
                    {user.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          {sidebarCollapsed ? (
            <PanelLeft size={16} />
          ) : (
            <>
              <PanelLeftClose size={16} />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
