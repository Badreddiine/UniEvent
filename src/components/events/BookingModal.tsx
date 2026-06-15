// ============================================================
// UNIEVENT — BookingModal
// Formulaire d'inscription à un événement (flow multi-étapes)
// ============================================================

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ticket,
  User,
  Mail,
  Phone,
  GraduationCap,
  ChevronRight,
  Sparkles,
  X,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, CATEGORY_COLORS, type PublicEvent } from "@/lib/public-events-data";
import { registrationService } from "@/services/registration.service";

// ── Types ─────────────────────────────────────────────────────

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  filiere: string;
  annee: string;
  specialNeeds: string;
  acceptTerms: boolean;
}

type Step = "info" | "form" | "confirm" | "success";

// ── Helpers ───────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(price: number) {
  if (price === 0) return "Gratuit";
  return `${price.toLocaleString("fr-FR")} DA`;
}

function getCapacityPercent(registered: number, capacity: number) {
  return Math.min(100, Math.round((registered / capacity) * 100));
}

// ── Sub-components ────────────────────────────────────────────

function StepIndicator({ current, steps }: { current: Step; steps: Step[] }) {
  const index = steps.indexOf(current);
  const labels: Record<Step, string> = {
    info: "Détails",
    form: "Inscription",
    confirm: "Confirmation",
    success: "Terminé",
  };

  return (
    <div className="flex items-center gap-0">
      {steps.filter((s) => s !== "success").map((step, i) => {
        const stepIndex = steps.indexOf(step);
        const isActive = stepIndex === index;
        const isDone = stepIndex < index;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-violet-500 text-white ring-4 ring-violet-500/20"
                    : "bg-white/5 text-white/30 border border-white/10"
                )}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide uppercase transition-colors",
                  isActive ? "text-violet-400" : isDone ? "text-emerald-400" : "text-white/20"
                )}
              >
                {labels[step]}
              </span>
            </div>
            {i < 2 && (
              <div
                className={cn(
                  "w-14 h-px mx-2 mb-5 transition-colors duration-500",
                  stepIndex < index ? "bg-emerald-500/60" : "bg-white/8"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function EventSummaryCard({ event }: { event: PublicEvent }) {
  const pct = getCapacityPercent(event.registeredCount, event.capacity);
  const categoryColor = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.autre;

  return (
    <div className="rounded-2xl bg-white/4 border border-white/8 overflow-hidden">
      <div className="relative h-32 overflow-hidden">
        <img
          src={event.coverUrl}
          alt={event.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <span
          className={cn(
            "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
            categoryColor
          )}
        >
          {CATEGORY_LABELS[event.category]}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">
          {event.title}
        </h3>
        <div className="space-y-2 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />
            <span>
              {formatTime(event.startDate)} – {formatTime(event.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" />
            <span>
              {event.registeredCount}/{event.capacity} inscrits
            </span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-white/30">
            <span>Remplissage</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/6">
          <span className="text-[10px] text-white/30">Tarif</span>
          <span
            className={cn(
              "text-sm font-bold",
              event.isFree ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {formatPrice(event.price ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Step: Info ────────────────────────────────────────────────

function StepInfo({
  event,
  isFull,
  spotsLeft,
  onNext,
}: {
  event: PublicEvent;
  isFull: boolean;
  spotsLeft: number;
  onNext: () => void;
}) {
  return (
    <motion.div
      key="info"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-1">À propos de cet événement</h2>
        <p className="text-sm text-white/40">Lisez les informations avant de vous inscrire.</p>
      </div>

      <div className="rounded-xl bg-white/3 border border-white/6 p-4 space-y-3">
        <p className="text-sm text-white/70 leading-relaxed">{event.description}</p>

        {event.speakers.length > 0 && (
          <div className="pt-3 border-t border-white/6">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">Intervenants</p>
            <div className="space-y-2">
              {event.speakers.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/80">{s.name}</p>
                    <p className="text-[10px] text-white/40">{s.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isFull ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-300">Événement complet</p>
            <p className="text-xs text-rose-400/70 mt-0.5">
              Toutes les places sont réservées. Vous pouvez vous inscrire sur liste d'attente.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Ticket className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              {spotsLeft} place{spotsLeft > 1 ? "s" : ""} disponible{spotsLeft > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-emerald-400/70 mt-0.5">
              Inscrivez-vous maintenant pour garantir votre place.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 group"
      >
        {isFull ? "Rejoindre la liste d'attente" : "Commencer l'inscription"}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}

// ── Step: Form ────────────────────────────────────────────────

const FILIERES = [
  "Informatique",
  "Génie Civil",
  "Génie Électrique",
  "Médecine",
  "Droit",
  "Économie",
  "Sciences",
  "Langues",
  "Architecture",
  "Management",
];

const ANNEES = ["1ère année", "2ème année", "3ème année", "4ème année", "5ème année", "Master 1", "Master 2", "Doctorat"];

function FormField({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
        {label}
        {required && <span className="text-violet-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all";

function StepForm({
  data,
  onChange,
  onNext,
  onBack,
  isFull,
}: {
  data: BookingFormData;
  onChange: (field: keyof BookingFormData, value: string | boolean) => void;
  onNext: () => void;
  onBack: () => void;
  isFull: boolean;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  const validate = () => {
    const e: Partial<Record<keyof BookingFormData, string>> = {};
    if (!data.firstName.trim()) e.firstName = "Prénom requis";
    if (!data.lastName.trim()) e.lastName = "Nom requis";
    if (!data.email.trim() || !data.email.includes("@")) e.email = "Email invalide";
    if (!data.filiere) e.filiere = "Filière requise";
    if (!data.annee) e.annee = "Année requise";
    if (!data.acceptTerms) e.acceptTerms = "Vous devez accepter les conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Vos informations</h2>
        <p className="text-sm text-white/40">
          {isFull ? "Inscription sur liste d'attente" : "Complétez le formulaire d'inscription."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Prénom" required error={errors.firstName}>
          <input
            className={inputCls}
            placeholder="Amine"
            value={data.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
          />
        </FormField>
        <FormField label="Nom" required error={errors.lastName}>
          <input
            className={inputCls}
            placeholder="Belkacem"
            value={data.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Email universitaire" required error={errors.email}>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            className={cn(inputCls, "pl-10")}
            type="email"
            placeholder="a.belkacem@univ.dz"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
      </FormField>

      <FormField label="Téléphone" error={errors.phone}>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            className={cn(inputCls, "pl-10")}
            type="tel"
            placeholder="05 XX XX XX XX"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Filière" required error={errors.filiere}>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
            <select
              className={cn(inputCls, "pl-10 appearance-none")}
              value={data.filiere}
              onChange={(e) => onChange("filiere", e.target.value)}
            >
              <option value="">Choisir</option>
              {FILIERES.map((f) => (
                <option key={f} value={f} className="bg-[#1a1a2e]">
                  {f}
                </option>
              ))}
            </select>
          </div>
        </FormField>

        <FormField label="Année" required error={errors.annee}>
          <select
            className={cn(inputCls, "appearance-none")}
            value={data.annee}
            onChange={(e) => onChange("annee", e.target.value)}
          >
            <option value="">Choisir</option>
            {ANNEES.map((a) => (
              <option key={a} value={a} className="bg-[#1a1a2e]">
                {a}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Besoins spéciaux (optionnel)">
        <textarea
          className={cn(inputCls, "resize-none h-20")}
          placeholder="Accessibilité PMR, allergies alimentaires…"
          value={data.specialNeeds}
          onChange={(e) => onChange("specialNeeds", e.target.value)}
        />
      </FormField>

      <div className="space-y-1.5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => onChange("acceptTerms", !data.acceptTerms)}
            className={cn(
              "mt-0.5 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all",
              data.acceptTerms
                ? "bg-violet-600 border-violet-600"
                : "border-white/20 bg-white/5 group-hover:border-violet-500/50"
            )}
          >
            {data.acceptTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
          <span className="text-xs text-white/50 leading-relaxed">
            J'accepte les{" "}
            <span className="text-violet-400 cursor-pointer hover:underline">
              conditions d'inscription
            </span>{" "}
            et autorise UniEvent à utiliser mes coordonnées pour cet événement.
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-[11px] text-rose-400 pl-8">{errors.acceptTerms}</p>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/8 text-white/60 hover:text-white text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 group"
        >
          Vérifier ma demande
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Step: Confirm ─────────────────────────────────────────────

function StepConfirm({
  event,
  data,
  isFull,
  onConfirm,
  onBack,
  loading,
}: {
  event: PublicEvent;
  data: BookingFormData;
  isFull: boolean;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      key="confirm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Confirmation</h2>
        <p className="text-sm text-white/40">Vérifiez vos informations avant de valider.</p>
      </div>

      {/* Recap card */}
      <div className="rounded-xl border border-white/8 bg-white/3 divide-y divide-white/6 overflow-hidden">
        <div className="p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Événement</p>
          <p className="text-sm font-semibold text-white">{event.title}</p>
          <p className="text-xs text-white/40 mt-1">
            {formatDate(event.startDate)} · {formatTime(event.startDate)} – {formatTime(event.endDate)}
          </p>
        </div>

        <div className="p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Participant</p>
          <p className="text-sm font-semibold text-white">
            {data.firstName} {data.lastName}
          </p>
          <p className="text-xs text-white/40 mt-0.5">{data.email}</p>
          {data.phone && <p className="text-xs text-white/40">{data.phone}</p>}
        </div>

        <div className="p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Cursus</p>
          <p className="text-sm text-white">
            {data.filiere} · {data.annee}
          </p>
        </div>

        <div className="p-4 flex items-center justify-between">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Tarif</p>
          <span
            className={cn(
              "text-sm font-bold",
              event.isFree ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {formatPrice(event.price ?? 0)}
          </span>
        </div>

        {isFull && (
          <div className="px-4 py-3 bg-amber-500/8">
            <p className="text-xs text-amber-300/80 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Vous serez inscrit sur la liste d'attente.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/8 text-white/60 hover:text-white text-sm font-medium transition-all disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Traitement…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {isFull ? "Rejoindre la liste d'attente" : "Confirmer l'inscription"}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ── Step: Success ─────────────────────────────────────────────

function StepSuccess({
  event,
  data,
  isFull,
}: {
  event: PublicEvent;
  data: BookingFormData;
  isFull: boolean;
}) {
  const bookingRef = `UE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 text-center"
    >
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center"
          >
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {isFull ? "Sur liste d'attente !" : "Inscription confirmée !"}
        </h2>
        <p className="text-sm text-white/50 max-w-xs mx-auto leading-relaxed">
          {isFull
            ? "Vous serez notifié par email si une place se libère."
            : `Un email de confirmation avec votre QR code a été envoyé à ${data.email}.`}
        </p>
      </div>

      {/* Booking reference */}
      <div className="rounded-2xl bg-white/4 border border-white/8 p-5 space-y-4">
        <div className="flex flex-col items-center gap-3">
          {!isFull && (
            <div className="w-24 h-24 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center">
              <QrCode className="w-12 h-12 text-white/20" />
            </div>
          )}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
              Référence de réservation
            </p>
            <p className="text-lg font-mono font-bold text-violet-300 tracking-widest">
              {bookingRef}
            </p>
          </div>
        </div>

        <div className="border-t border-white/6 pt-4 text-left space-y-2">
          <div className="flex items-center gap-2.5 text-xs text-white/50">
            <Calendar className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
            <span>{formatDate(event.startDate)} · {formatTime(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-white/50">
            <MapPin className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Link
          href={`/events/${event.id}`}
          className="w-full py-3 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 text-sm font-medium transition-all"
        >
          Voir les détails de l'événement
        </Link>
        <Link
          href="/events"
          className="w-full py-3 rounded-xl bg-white/4 hover:bg-white/7 text-white/50 hover:text-white/80 text-sm font-medium transition-all"
        >
          Retour au catalogue
        </Link>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────

interface BookingModalProps {
  event: PublicEvent;
  isFull: boolean;
  spotsLeft: number;
}

const STEPS: Step[] = ["info", "form", "confirm", "success"];

const DEFAULT_FORM: BookingFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  filiere: "",
  annee: "",
  specialNeeds: "",
  acceptTerms: false,
};

export function BookingModal({ event, isFull, spotsLeft }: BookingModalProps) {
  const [step, setStep] = useState<Step>("info");
  const [form, setForm] = useState<BookingFormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    (field: keyof BookingFormData, value: string | boolean) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await registrationService.register(Number(event.id));
      setStep("success");
    } catch {
      setError("Inscription impossible. Vous êtes peut-être déjà inscrit ou non authentifié.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/70 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Retour à l'événement
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main panel */}
        <div className="rounded-2xl bg-[#111116] border border-white/8 p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-sm font-medium text-white/60">Inscription UniEvent</span>
            </div>

            {step !== "success" && (
              <StepIndicator
                current={step}
                steps={["info", "form", "confirm", "success"]}
              />
            )}
          </div>

          <AnimatePresence mode="wait">
            {step === "info" && (
              <StepInfo
                event={event}
                isFull={isFull}
                spotsLeft={spotsLeft}
                onNext={() => setStep("form")}
              />
            )}
            {step === "form" && (
              <StepForm
                data={form}
                onChange={handleChange}
                onNext={() => setStep("confirm")}
                onBack={() => setStep("info")}
                isFull={isFull}
              />
            )}
            {step === "confirm" && (
              <>
                <StepConfirm
                  event={event}
                  data={form}
                  isFull={isFull}
                  onConfirm={handleConfirm}
                  onBack={() => setStep("form")}
                  loading={loading}
                />
                {error && (
                  <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
                )}
              </>
            )}
            {step === "success" && (
              <StepSuccess event={event} data={form} isFull={isFull} />
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar — event summary */}
        <div className="space-y-4">
          <EventSummaryCard event={event} />

          <div className="rounded-xl bg-white/3 border border-white/6 p-4 space-y-3">
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Organisateur</p>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">{event.organizerName}</p>
                {event.clubName && (
                  <p className="text-xs text-white/40">{event.clubName}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-amber-500/8 border border-amber-500/15 p-4">
            <div className="flex gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/70 leading-relaxed">
                Votre inscription est soumise à validation. Vous recevrez une confirmation sous 24h.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
