"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCheck, Clock, Users, Zap, Calendar, CheckCircle2, XCircle,
} from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notificationService } from "@/services/notification.service";
import type { TypeNotifEnum } from "@/types/api";

const TYPE_CONFIG: Record<TypeNotifEnum, { icon: React.ElementType; color: string; bg: string }> = {
  EMAIL: { icon: Bell, color: "text-brand-500", bg: "bg-brand-100 dark:bg-brand-900/30" },
  PUSH:  { icon: Zap, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  SMS:   { icon: Users, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-900/30" },
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.list({ size: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.content ?? [];
  const unreadCount = notifications.filter((n) => !n.lu).length;

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Toutes lues"}
      >
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck size={14} />
            Tout marquer comme lu
          </Button>
        )}
      </PageHeader>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">Erreur lors du chargement des notifications.</p>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Bell size={40} className="mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucune notification.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notif, i) => {
              const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.PUSH;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "flex items-start gap-4 rounded-xl border p-4 transition-all cursor-pointer",
                    notif.lu
                      ? "border-border bg-card"
                      : "border-brand-200 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-950/20"
                  )}
                  onClick={() => !notif.lu && markReadMutation.mutate(notif.id)}
                >
                  <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full", cfg.bg)}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm font-medium", notif.lu ? "text-foreground" : "text-foreground font-semibold")}>
                        {notif.titre}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatRelative(notif.dateEnvoi)}
                        </span>
                        {!notif.lu && (
                          <span className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
