"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Palette, Shield, Globe, Save,
  CheckCircle2, Moon, Sun, Monitor,
  Volume2, Mail, Smartphone, Eye, EyeOff,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/auth.store";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ── Tabs ─────────────────────────────────────────────────────

const TABS = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "language", label: "Langue & Région", icon: Globe },
] as const;

type TabId = typeof TABS[number]["id"];

// ── Toggle Switch ──────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-brand-500" : "bg-muted-foreground/30"
      )}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

// ── Settings Row ───────────────────────────────────────────────

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/60 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────

function NotificationsTab() {
  const [settings, setSettings] = useState({
    emailEvents: true,
    emailReservations: true,
    emailReminders: true,
    emailWeekly: false,
    pushEvents: true,
    pushReservations: false,
    pushReminders: true,
    pushSystem: true,
    soundEnabled: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
          <Mail size={14} className="text-brand-500" />
          Notifications par email
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Gérez les emails que vous recevez de UniEvent</p>
        <div>
          <SettingRow title="Approbations d'événements" description="Notification quand votre événement est approuvé ou refusé">
            <Toggle checked={settings.emailEvents} onChange={() => toggle("emailEvents")} />
          </SettingRow>
          <SettingRow title="Statut des réservations" description="Mises à jour sur vos demandes de réservation de salles">
            <Toggle checked={settings.emailReservations} onChange={() => toggle("emailReservations")} />
          </SettingRow>
          <SettingRow title="Rappels d'événements" description="Rappels 24h avant les événements auxquels vous êtes inscrit">
            <Toggle checked={settings.emailReminders} onChange={() => toggle("emailReminders")} />
          </SettingRow>
          <SettingRow title="Résumé hebdomadaire" description="Récapitulatif des événements de la semaine">
            <Toggle checked={settings.emailWeekly} onChange={() => toggle("emailWeekly")} />
          </SettingRow>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
          <Smartphone size={14} className="text-brand-500" />
          Notifications push
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Notifications sur votre appareil mobile</p>
        <div>
          <SettingRow title="Nouveaux événements" description="Quand de nouveaux événements sont publiés">
            <Toggle checked={settings.pushEvents} onChange={() => toggle("pushEvents")} />
          </SettingRow>
          <SettingRow title="Réservations" description="Mises à jour instantanées sur vos réservations">
            <Toggle checked={settings.pushReservations} onChange={() => toggle("pushReservations")} />
          </SettingRow>
          <SettingRow title="Rappels" description="Rappels avant les événements">
            <Toggle checked={settings.pushReminders} onChange={() => toggle("pushReminders")} />
          </SettingRow>
          <SettingRow title="Système" description="Mises à jour de la plateforme UniEvent">
            <Toggle checked={settings.pushSystem} onChange={() => toggle("pushSystem")} />
          </SettingRow>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Volume2 size={14} className="text-brand-500" />
          Sons
        </h3>
        <SettingRow title="Sons de notification" description="Jouer un son lors des nouvelles notifications">
          <Toggle checked={settings.soundEnabled} onChange={() => toggle("soundEnabled")} />
        </SettingRow>
      </div>
    </div>
  );
}

// ── Appearance Tab ─────────────────────────────────────────────
// FIX : tous les hooks sont déclarés EN PREMIER, avant tout return conditionnel.

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable"); // ✅ déplacé ici
  const [animations, setAnimations] = useState(true);                               // ✅ déplacé ici

  React.useEffect(() => setMounted(true), []);

  // Le return conditionnel vient APRÈS tous les hooks
  if (!mounted) return <div className="h-40 animate-pulse rounded-xl bg-muted" />;

  const themes = [
    { id: "light", label: "Clair", icon: Sun },
    { id: "dark", label: "Sombre", icon: Moon },
    { id: "system", label: "Système", icon: Monitor },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Thème</h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                theme === id
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-border hover:border-brand-300 bg-background"
              )}
            >
              <Icon size={20} className={theme === id ? "text-brand-500" : "text-muted-foreground"} />
              <span className={cn("text-xs font-medium", theme === id ? "text-brand-600 dark:text-brand-400" : "text-foreground")}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Densité d'affichage</h3>
        <div className="grid grid-cols-2 gap-3">
          {(["comfortable", "compact"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={cn(
                "rounded-xl border-2 p-3 text-left transition-all",
                density === d
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-border hover:border-brand-300 bg-background"
              )}
            >
              <p className={cn("text-sm font-medium", density === d ? "text-brand-600 dark:text-brand-400" : "text-foreground")}>
                {d === "comfortable" ? "Confortable" : "Compact"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {d === "comfortable" ? "Plus d'espace entre les éléments" : "Affichage dense, plus de contenu"}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Accessibilité</h3>
        <SettingRow title="Animations réduites" description="Désactiver les animations pour de meilleures performances">
          <Toggle checked={!animations} onChange={() => setAnimations((a) => !a)} />
        </SettingRow>
      </div>
    </div>
  );
}

// ── Security Tab ───────────────────────────────────────────────

function SecurityTab() {
  const { user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [twoFA, setTwoFA] = useState(user?.twoFactorEnabled ?? false);
  const [sessionHistory] = useState([
    { device: "Chrome sur macOS", location: "Casablanca, MA", time: "Maintenant", current: true },
    { device: "Safari sur iPhone", location: "Settat, MA", time: "Il y a 2h", current: false },
    { device: "Firefox sur Windows", location: "Rabat, MA", time: "Il y a 3j", current: false },
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Changer le mot de passe</h3>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Mot de passe actuel</label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-9 pr-9 text-sm" />
              <button
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nouveau mot de passe</label>
            <Input type="password" placeholder="••••••••" className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Confirmer le nouveau mot de passe</label>
            <Input type="password" placeholder="••••••••" className="h-9 text-sm" />
          </div>
          <Button size="sm" className="mt-1">Mettre à jour le mot de passe</Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield size={14} className="text-brand-500" />
              Authentification à deux facteurs
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Ajoutez une couche de sécurité supplémentaire à votre compte avec une application d'authentification.
            </p>
          </div>
          <Toggle checked={twoFA} onChange={() => setTwoFA((s) => !s)} />
        </div>
        {twoFA && (
          <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={13} />
            La 2FA est active sur votre compte
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Sessions actives</h3>
        <div className="space-y-3">
          {sessionHistory.map((session, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground flex items-center gap-2">
                  {session.device}
                  {session.current && (
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[9px] font-medium">
                      Actuel
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {session.location} · {session.time}
                </p>
              </div>
              {!session.current && (
                <button className="text-xs text-destructive hover:text-destructive/80 transition-colors">
                  Révoquer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Language Tab ───────────────────────────────────────────────

function LanguageTab() {
  const [lang, setLang] = useState("fr");
  const [timezone, setTimezone] = useState("Africa/Casablanca");
  const [dateFormat, setDateFormat] = useState("dd/MM/yyyy");

  const languages = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "ar", label: "العربية", flag: "🇲🇦" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Langue de l'interface</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {languages.map(({ code, label, flag }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all text-left",
                lang === code
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-border hover:border-brand-300 bg-background"
              )}
            >
              <span className="text-xl">{flag}</span>
              <span className={cn("text-sm font-medium", lang === code ? "text-brand-600 dark:text-brand-400" : "text-foreground")}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Fuseau horaire & Format</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Fuseau horaire</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="Africa/Casablanca">Casablanca (UTC+1)</option>
              <option value="Europe/Paris">Paris (UTC+2)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Format de date</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="dd/MM/yyyy">JJ/MM/AAAA</option>
              <option value="MM/dd/yyyy">MM/JJ/AAAA</option>
              <option value="yyyy-MM-dd">AAAA-MM-JJ</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("notifications");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <BackButton />
      <PageHeader
        title="Paramètres"
        description="Personnalisez votre expérience UniEvent"
      >
        <Button size="sm" onClick={handleSave} className="gap-1.5">
          <Save size={14} />
          Sauvegarder
        </Button>
      </PageHeader>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2 size={15} />
          Paramètres sauvegardés
        </motion.div>
      )}

      <div className="flex gap-6 flex-col sm:flex-row">
        <nav className="flex sm:flex-col gap-1 sm:w-48 flex-shrink-0 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
                activeTab === id
                  ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "notifications" && <NotificationsTab />}
              {activeTab === "appearance" && <AppearanceTab />}
              {activeTab === "security" && <SecurityTab />}
              {activeTab === "language" && <LanguageTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}