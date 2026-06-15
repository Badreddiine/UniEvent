"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Search, Menu, Sun, Moon, LogOut,
  User, Settings, ChevronDown, X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { eventService } from "@/services/event.service";
import { notificationService } from "@/services/notification.service";
import { eventDtoToPublic } from "@/lib/event-adapters";
import { useUIStore } from "@/store/ui.store";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

// ── Breadcrumb ────────────────────────────────────────────────
function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const labels: Record<string, string> = {
    dashboard: "Tableau de bord",
    events: "Événements",
    calendar: "Calendrier",
    create: "Créer",
    mine: "Mes événements",
    reservations: "Réservations",
    approval: "Approbation",
    rooms: "Salles",
    analytics: "Analytique",
    "my-agenda": "Mon Agenda",
    registrations: "Inscriptions",
    admin: "Administration",
    users: "Utilisateurs",
    clubs: "Clubs",
    settings: "Paramètres",
  };

  return (
    <nav className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
      {segments.map((seg, i) => (
        <span key={seg} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-border">/</span>}
          <span
            className={cn(
              i === segments.length - 1
                ? "text-foreground font-medium"
                : "hover:text-foreground transition-colors cursor-pointer"
            )}
          >
            {labels[seg] ?? seg}
          </span>
        </span>
      ))}
    </nav>
  );
}

// ── Notification dropdown ─────────────────────────────────────
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { data } = useQuery({
    queryKey: ["notifications", "navbar"],
    queryFn: () => notificationService.list({ size: 8 }),
  });
  const notifications = (data?.content ?? []).map((n) => ({
    id: String(n.id),
    title: n.titre,
    message: n.message,
    isRead: n.lu,
    createdAt: n.dateEnvoi,
  }));
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl border border-border bg-popover shadow-card-hover overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {notifications.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">Aucune notification.</p>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50",
              !n.isRead && "bg-brand-50/50 dark:bg-brand-900/10"
            )}
          >
            <div className="flex items-start gap-3">
              {!n.isRead && (
                <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
              )}
              <div className={cn("min-w-0", n.isRead && "ml-4")}>
                <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  {formatRelativeTime(n.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-border">
        <Link
          href="/dashboard/notifications"
          className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
          onClick={onClose}
        >
          Voir toutes les notifications →
        </Link>
      </div>
    </motion.div>
  );
}

// ── User menu ─────────────────────────────────────────────────
function UserMenu({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute right-0 top-full mt-2 w-56 z-50 rounded-xl border border-border bg-popover shadow-card-hover overflow-hidden"
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground truncate">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
        {user?.role && (
          <span
            className={cn(
              "inline-flex mt-2 items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
              ROLE_COLORS[user.role]
            )}
          >
            {ROLE_LABELS[user.role]}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="p-1">
        {[
          { href: "/dashboard/profile", icon: User, label: "Mon profil" },
          { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Icon size={15} className="text-muted-foreground" />
            {label}
          </Link>
        ))}
      </div>

      <div className="p-1 border-t border-border">
        <button
          onClick={() => { logout(); onClose(); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </motion.div>
  );
}

// ── Navbar ────────────────────────────────────────────────────
export function Navbar() {
  const { user } = useAuthStore();
  const { toggleMobileSidebar, unreadNotifications } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { data: eventsPage } = useQuery({
    queryKey: ["events-search"],
    queryFn: () => eventService.list({ size: 100 }),
  });
  const allEvents = (eventsPage?.content ?? []).map(eventDtoToPublic);
  const searchResults = searchQuery.trim().length >= 2
    ? allEvents.filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data: notifPage } = useQuery({
    queryKey: ["notifications", "navbar"],
    queryFn: () => notificationService.list({ size: 20 }),
  });
  const unread = (notifPage?.content ?? []).filter((n) => !n.lu).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/80 backdrop-blur-xl px-4 gap-4">
      {/* Mobile menu trigger */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Rechercher"
        >
          <Search size={18} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Changer le thème"
        >
          <Sun size={18} className="rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon size={18} className="absolute rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((o) => !o); setUserMenuOpen(false); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative ml-1">
          <button
            onClick={() => { setUserMenuOpen((o) => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted transition-colors"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-semibold overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                user ? `${user?.firstName?.[0]}${user?.lastName?.[0]}` : "U"
              )}
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground max-w-24 truncate">
              {user?.firstName}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                "text-muted-foreground transition-transform",
                userMenuOpen && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence>
            {userMenuOpen && <UserMenu onClose={() => setUserMenuOpen(false)} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Global search modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search size={18} className="text-muted-foreground flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
                    if (e.key === "Enter" && searchResults.length > 0) {
                      router.push(`/events/${searchResults[0].id}`);
                      setSearchOpen(false); setSearchQuery("");
                    }
                  }}
                  placeholder="Rechercher un événement, une salle, un club…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={16} />
                </button>
              </div>
              {searchQuery.trim().length < 2 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Tapez au moins 2 caractères pour rechercher…
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Aucun résultat pour "<strong>{searchQuery}</strong>"
                </div>
              ) : (
                <ul className="py-2 max-h-80 overflow-y-auto">
                  {searchResults.map((ev) => (
                    <li key={ev.id}>
                      <button
                        onClick={() => { router.push(`/events/${ev.id}`); setSearchOpen(false); setSearchQuery(""); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-muted transition-colors text-left"
                      >
                        <div className="h-9 w-12 flex-shrink-0 overflow-hidden rounded-md">
                          <img src={ev.coverUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">{ev.location} · {ev.category}</p>
                        </div>
                        <Search size={13} className="text-muted-foreground flex-shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
