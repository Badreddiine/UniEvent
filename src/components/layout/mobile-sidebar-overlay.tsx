"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GraduationCap, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { NAV_ITEMS, APP_NAME, UNIVERSITY_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import type { NavItem, UserRole } from "@/types";

function hasAccess(item: NavItem, role?: UserRole) {
  if (!item.roles || item.roles.length === 0) return true;
  if (!role) return false;
  return item.roles.includes(role);
}

function MobileNavItem({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const accessibleChildren =
    item.children?.filter((c) => hasAccess(c, user?.role)) ?? [];
  const hasChildren = accessibleChildren.length > 0;
  const isParentActive = accessibleChildren.some((c) =>
    pathname.startsWith(c.href)
  );
  const [open, setOpen] = useState(() => isParentActive);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            isParentActive && "text-sidebar-foreground bg-sidebar-accent/40"
          )}
        >
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            size={14}
            className={cn(
              "transition-transform duration-200",
              open ? "rotate-180" : "rotate-0"
            )}
          />
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
                {accessibleChildren.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                      pathname === child.href &&
                        "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    {child.label}
                  </Link>
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
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        pathname === item.href &&
          "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
    >
      {item.label}
    </Link>
  );
}

export function MobileSidebarOverlay() {
  const { sidebarMobileOpen, closeMobileSidebar } = useUIStore();
  const { user } = useAuthStore();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!hasAccess(item, user?.role)) return false;
    // Show parent only if at least one child is accessible
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => hasAccess(child, user?.role));
    }
    return true;
  });

  return (
    <AnimatePresence>
      {sidebarMobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={closeMobileSidebar}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-sidebar border-r border-sidebar-border lg:hidden"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
              <Link
                href="/dashboard"
                className="flex items-center gap-3"
                onClick={closeMobileSidebar}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-sidebar-foreground">
                    {APP_NAME}
                  </p>
                  <p className="text-[10px] text-sidebar-foreground/50">
                    {UNIVERSITY_NAME}
                  </p>
                </div>
              </Link>
              <button
                onClick={closeMobileSidebar}
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              {visibleItems.map((item) => (
                <MobileNavItem
                  key={item.href}
                  item={item}
                  onClose={closeMobileSidebar}
                />
              ))}
            </nav>

            {/* User */}
            {user && (
              <div className="border-t border-sidebar-border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-sidebar-foreground/50 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
