"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number; // positive = up, negative = down, 0 = neutral
  trendLabel?: string;
  accent?: "blue" | "violet" | "emerald" | "amber" | "red" | "cyan";
  index?: number;
}

const ACCENT_STYLES = {
  blue: {
    icon: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    badge: "text-blue-400",
    glow: "shadow-blue-500/10",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    badge: "text-violet-400",
    glow: "shadow-violet-500/10",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    badge: "text-emerald-400",
    glow: "shadow-emerald-500/10",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    badge: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
  red: {
    icon: "bg-red-500/10 text-red-400 border-red-500/20",
    badge: "text-red-400",
    glow: "shadow-red-500/10",
  },
  cyan: {
    icon: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    badge: "text-cyan-400",
    glow: "shadow-cyan-500/10",
  },
};

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  accent = "blue",
  index = 0,
}: AdminStatCardProps) {
  const styles = ACCENT_STYLES[accent];

  const TrendIcon = trend === undefined || trend === 0
    ? Minus
    : trend > 0
    ? TrendingUp
    : TrendingDown;

  const trendColor =
    trend === undefined || trend === 0
      ? "text-white/30"
      : trend > 0
      ? "text-emerald-400"
      : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative rounded-2xl border border-white/[0.08] bg-admin-card p-5 overflow-hidden",
        "shadow-xl", styles.glow,
        "hover:border-white/[0.14] transition-all duration-300 group"
      )}
    >
      {/* Background shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.02] to-transparent" />

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border text-lg flex-shrink-0",
          styles.icon
        )}>
          {icon}
        </div>

        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-semibold", trendColor)}>
            <TrendIcon size={13} />
            <span>
              {trend > 0 ? "+" : ""}{trend !== 0 ? `${Math.abs(trend)}%` : "—"}
            </span>
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-white leading-none tracking-tight mb-1">
        {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
      </p>

      {/* Title */}
      <p className="text-xs font-medium text-white/50 leading-none mb-1">{title}</p>

      {/* Subtitle / trend label */}
      {(subtitle || trendLabel) && (
        <p className="text-[11px] text-white/30 mt-1.5 leading-tight">
          {trendLabel || subtitle}
        </p>
      )}
    </motion.div>
  );
}
