// ============================================================
// UNIEVENT — Phase 5B2: EventForm (shared Create/Edit)
// ============================================================

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Mic,
  Plus,
  Trash2,
  Image as ImageIcon,
  ChevronRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/public-events-data";
import { useAuthStore } from "@/store/auth.store";
import { eventService } from "@/services/event.service";
import { formDataToCreateRequest } from "@/lib/event-adapters";
import type { EventFormData } from "@/lib/events-crud-data";

// ── Types ─────────────────────────────────────────────────────

interface ValidationErrors {
  [key: string]: string;
}

interface EventFormProps {
  mode: "create" | "edit";
  initialData: EventFormData;
  eventId?: string;
  onSuccess?: (data: EventFormData) => void;
}

// ── Constants ─────────────────────────────────────────────────

const VISIBILITY_OPTIONS = [
  { value: "club", label: "Club uniquement", icon: "🔒", desc: "Visible aux membres du club" },
  { value: "universite", label: "Université", icon: "🏫", desc: "Visible aux étudiants de l'université" },
  { value: "public", label: "Public", icon: "🌐", desc: "Visible à tous" },
] as const;

const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
];

// ── Validation ────────────────────────────────────────────────

function validate(data: EventFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.title.trim()) errors.title = "Le titre est requis";
  else if (data.title.length < 5) errors.title = "Minimum 5 caractères";
  else if (data.title.length > 100) errors.title = "Maximum 100 caractères";

  if (!data.description.trim()) errors.description = "La description courte est requise";
  else if (data.description.length < 20) errors.description = "Minimum 20 caractères";

  if (!data.startDate) errors.startDate = "La date de début est requise";
  if (!data.startTime) errors.startTime = "L'heure de début est requise";
  if (!data.endDate) errors.endDate = "La date de fin est requise";
  if (!data.endTime) errors.endTime = "L'heure de fin est requise";

  if (data.startDate && data.endDate && data.startTime && data.endTime) {
    const start = new Date(`${data.startDate}T${data.startTime}`);
    const end = new Date(`${data.endDate}T${data.endTime}`);
    if (end <= start) errors.endDate = "La fin doit être après le début";
  }

  if (!data.location.trim()) errors.location = "Le lieu est requis";
  if (!data.building.trim()) errors.building = "Le bâtiment est requis";

  if (!data.capacity || data.capacity < 1) errors.capacity = "Capacité minimale : 1";
  if (data.capacity > 5000) errors.capacity = "Capacité maximale : 5000";

  if (!data.isFree && (!data.price || data.price < 1))
    errors.price = "Prix requis pour un événement payant";

  return errors;
}

// ── Section wrapper ────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
  optional,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          {optional && <p className="text-xs text-white/40 mt-0.5">Optionnel</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/60 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-white/30">{hint}</p>}
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Input styles ──────────────────────────────────────────────

const inputCls = cn(
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.05] px-3 py-2.5",
  "text-sm text-white placeholder:text-white/25",
  "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50",
  "transition-colors duration-150"
);

const textareaCls = cn(inputCls, "resize-none min-h-[80px]");

// ── Main Form Component ───────────────────────────────────────


const ROOM_OPTIONS = [
  { name: "Amphithéâtre Principal",   building: "Bâtiment Central",       type: "Amphithéâtre",     capacity: 500  },
  { name: "Salle de Conférence A201", building: "Bâtiment A",             type: "Salle de conf.",   capacity: 80   },
  { name: "Salle Informatique B104",  building: "Bâtiment B",             type: "Salle info.",      capacity: 30   },
  { name: "Aula Magna",               building: "Bât. Administratif",     type: "Aula",             capacity: 200  },
  { name: "Espace Extérieur Campus",  building: "Campus",                 type: "Espace extérieur", capacity: 1000 },
  { name: "Salle de Réunion R10",     building: "Bâtiment A",             type: "Salle de réunion", capacity: 20   },
  { name: "Salle B201",               building: "Bâtiment B",             type: "Salle de cours",   capacity: 45   },
  { name: "Laboratoire Tech",         building: "Bâtiment Technologique", type: "Laboratoire",      capacity: 25   },
];

export function EventForm({ mode, initialData, eventId, onSuccess }: EventFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [form, setForm] = useState<EventFormData>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [uploadedCover, setUploadedCover] = useState<string | null>(null);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);

  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCoverUploadError("Fichier invalide. Choisissez une image (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverUploadError("Image trop lourde. Maximum 5 Mo.");
      return;
    }
    setCoverUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedCover(dataUrl);
      update("coverUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  }
  const [newSpeaker, setNewSpeaker] = useState({ name: "", role: "" });

  // ── Handlers ────────────────────────────────────────────────

  const update = useCallback(<K extends keyof EventFormData>(key: K, value: EventFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    // Live validate on change if touched
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  const blur = useCallback(
    (key: string) => {
      setTouched((prev) => ({ ...prev, [key]: true }));
      const errs = validate(form);
      setErrors((prev) => ({
        ...prev,
        ...(errs[key] ? { [key]: errs[key] } : {}),
      }));
    },
    [form]
  );

  const addSpeaker = () => {
    if (!newSpeaker.name.trim()) return;
    update("speakers", [...form.speakers, { ...newSpeaker }]);
    setNewSpeaker({ name: "", role: "" });
  };

  const removeSpeaker = (idx: number) => {
    update("speakers", form.speakers.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    setErrors(errs);
    setTouched(
      Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );

    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    void user;
    try {
      const payload = formDataToCreateRequest(form);
      if (mode === "edit" && eventId) {
        await eventService.update(Number(eventId), payload);
      } else {
        await eventService.create(payload);
      }
      setSubmitted(true);
      if (onSuccess) {
        onSuccess(form);
      } else {
        setTimeout(() => router.push("/dashboard/events/mine"), 1200);
      }
    } catch {
      setSubmitError(
        "Erreur lors de l'enregistrement de l'événement. Vérifiez vos droits et réessayez."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success state ────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {mode === "create" ? "Événement créé !" : "Événement mis à jour !"}
          </h2>
          <p className="text-white/50 mt-2 text-sm">
            {mode === "create"
              ? "Votre événement a été soumis pour approbation."
              : "Les modifications ont été enregistrées."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard/events/mine")}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Voir mes événements
          </button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Informations de base ── */}
      <Section title="Informations générales" icon={<Info size={15} />}>
        <Field label="Titre de l'événement" error={errors.title} required>
          <input
            id="field-title"
            type="text"
            className={cn(inputCls, errors.title && "border-rose-500/50")}
            placeholder="Ex: Hackathon IA & Innovation 2026"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            onBlur={() => blur("title")}
            maxLength={100}
          />
          <div className="flex justify-end mt-1">
            <span className={cn("text-xs", form.title.length > 90 ? "text-amber-400" : "text-white/25")}>
              {form.title.length}/100
            </span>
          </div>
        </Field>

        <Field label="Description courte" error={errors.description} required
          hint="Résumé affiché dans les listes d'événements (20-300 caractères)">
          <textarea
            id="field-description"
            className={cn(textareaCls, errors.description && "border-rose-500/50")}
            placeholder="Une courte description accrocheure de votre événement..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            onBlur={() => blur("description")}
            rows={3}
            maxLength={300}
          />
        </Field>

        <Field label="Description complète" hint="Optionnel">
          <textarea
            className={textareaCls}
            placeholder="Description détaillée : programme, objectifs, prérequis..."
            value={form.longDescription}
            onChange={(e) => update("longDescription", e.target.value)}
            rows={5}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Catégorie" required>
            <select
              className={inputCls}
              value={form.category}
              onChange={(e) => update("category", e.target.value as EventFormData["category"])}
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#1a1a2e]">
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Visibilité" required>
            <select
              className={inputCls}
              value={form.visibility}
              onChange={(e) => update("visibility", e.target.value as EventFormData["visibility"])}
            >
              {VISIBILITY_OPTIONS.map((v) => (
                <option key={v.value} value={v.value} className="bg-[#1a1a2e]">
                  {v.icon} {v.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Category badge preview */}
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>Aperçu :</span>
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
            CATEGORY_COLORS[form.category] || "bg-slate-500/15 text-slate-400")}>
            {CATEGORY_LABELS[form.category] || form.category}
          </span>
          <span className="text-white/20">•</span>
          <span className="text-white/40">
            {VISIBILITY_OPTIONS.find(v => v.value === form.visibility)?.icon}{" "}
            {VISIBILITY_OPTIONS.find(v => v.value === form.visibility)?.desc}
          </span>
        </div>
      </Section>

      {/* ── Dates & Horaires ── */}
      <Section title="Dates & Horaires" icon={<Calendar size={15} />}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de début" error={errors.startDate} required>
            <input
              id="field-startDate"
              type="date"
              className={cn(inputCls, "[color-scheme:dark]", errors.startDate && "border-rose-500/50")}
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              onBlur={() => blur("startDate")}
            />
          </Field>
          <Field label="Heure de début" error={errors.startTime} required>
            <input
              type="time"
              className={cn(inputCls, "[color-scheme:dark]")}
              value={form.startTime}
              onChange={(e) => update("startTime", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de fin" error={errors.endDate} required>
            <input
              id="field-endDate"
              type="date"
              className={cn(inputCls, "[color-scheme:dark]", errors.endDate && "border-rose-500/50")}
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              onBlur={() => blur("endDate")}
              min={form.startDate}
            />
          </Field>
          <Field label="Heure de fin" error={errors.endTime} required>
            <input
              type="time"
              className={cn(inputCls, "[color-scheme:dark]")}
              value={form.endTime}
              onChange={(e) => update("endTime", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* ── Lieu ── */}
      <Section title="Lieu" icon={<MapPin size={15} />}>
        <Field label="Salle / Espace" error={errors.location} required>
          <select
            id="field-location"
            className={cn(inputCls, errors.location && "border-rose-500/50")}
            value={form.location}
            onChange={(e) => {
              const opt = ROOM_OPTIONS.find((r) => r.name === e.target.value);
              update("location", e.target.value);
              if (opt) update("building", opt.building);
            }}
            onBlur={() => blur("location")}
          >
            <option value="">Sélectionner une salle…</option>
            {ROOM_OPTIONS.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name} ({r.capacity} places) — {r.type}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Bâtiment" error={errors.building} required>
          <input
            id="field-building"
            type="text"
            className={cn(inputCls, "opacity-60 cursor-not-allowed")}
            placeholder="Auto-rempli selon la salle choisie"
            value={form.building}
            readOnly
          />
        </Field>
      </Section>

      {/* ── Capacité & Tarif ── */}
      <Section title="Capacité & Tarif" icon={<Users size={15} />}>
        <Field label="Capacité maximale" error={errors.capacity} required
          hint="Nombre maximum de participants">
          <div className="flex items-center gap-3">
            <input
              id="field-capacity"
              type="number"
              className={cn(inputCls, "w-40", errors.capacity && "border-rose-500/50")}
              value={form.capacity}
              onChange={(e) => update("capacity", parseInt(e.target.value) || 0)}
              onBlur={() => blur("capacity")}
              min={1}
              max={5000}
            />
            <div className="flex gap-2">
              {[30, 50, 100, 200, 500].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update("capacity", n)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    form.capacity === n
                      ? "bg-indigo-600 text-white"
                      : "bg-white/[0.06] text-white/50 hover:bg-white/[0.10]"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </Field>

        <div className="space-y-3">
          <label className="text-xs font-medium text-white/60">Tarification *</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => update("isFree", true)}
              className={cn(
                "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all",
                form.isFree
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/20"
              )}
            >
              🎟️ Gratuit
            </button>
            <button
              type="button"
              onClick={() => update("isFree", false)}
              className={cn(
                "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all",
                !form.isFree
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                  : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/20"
              )}
            >
              💰 Payant
            </button>
          </div>

          {!form.isFree && (
            <Field label="Prix (DA)" error={errors.price} required>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className={cn(inputCls, "w-40", errors.price && "border-rose-500/50")}
                  value={form.price}
                  onChange={(e) => update("price", parseInt(e.target.value) || 0)}
                  min={1}
                  placeholder="Ex: 500"
                />
                <span className="text-sm text-white/40">DA</span>
              </div>
            </Field>
          )}
        </div>
      </Section>

      {/* ── Image de couverture ── */}
      <Section title="Image de couverture" icon={<ImageIcon size={15} />} optional>
        {/* ── Upload depuis l'appareil ── */}
        <div>
          <label className="text-xs font-medium text-white/60 block mb-2">
            Uploader depuis votre appareil
          </label>
          <label
            htmlFor="cover-upload"
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all p-6",
              uploadedCover
                ? "border-indigo-500/60 bg-indigo-500/10"
                : "border-white/10 bg-white/[0.02] hover:border-indigo-500/40 hover:bg-indigo-500/5"
            )}
          >
            {uploadedCover ? (
              <div className="relative w-full aspect-video max-w-xs mx-auto rounded-lg overflow-hidden">
                <img src={uploadedCover} alt="Aperçu" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setUploadedCover(null); update("coverUrl", ""); setCoverUploadError(null); }}
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                  <ImageIcon size={18} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/70 font-medium">Cliquez pour choisir une image</p>
                  <p className="text-xs text-white/30 mt-0.5">JPG, PNG, WEBP · max 5 Mo</p>
                </div>
              </>
            )}
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleCoverUpload}
            />
          </label>
          {coverUploadError && (
            <p className="mt-1.5 text-xs text-rose-400">{coverUploadError}</p>
          )}
        </div>

        {/* ── OU URL manuelle ── */}
        {!uploadedCover && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-white/30">ou via URL</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <Field label="URL de l'image" hint="URL directe vers une image (Unsplash, etc.)">
              <input
                type="url"
                className={inputCls}
                placeholder="https://images.unsplash.com/..."
                value={form.coverUrl}
                onChange={(e) => update("coverUrl", e.target.value)}
              />
            </Field>

            <div>
              <button
                type="button"
                onClick={() => setShowPresets((v) => !v)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
              >
                <ImageIcon size={12} />
                {showPresets ? "Masquer" : "Choisir"} depuis les préréglages
              </button>

              {showPresets && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {COVER_PRESETS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { update("coverUrl", url); setShowPresets(false); }}
                      className={cn(
                        "relative rounded-lg overflow-hidden border-2 transition-all aspect-video",
                        form.coverUrl === url
                          ? "border-indigo-500"
                          : "border-transparent hover:border-white/30"
                      )}
                    >
                      <img src={url} alt={`preset-${i}`} className="w-full h-full object-cover" />
                      {form.coverUrl === url && (
                        <div className="absolute inset-0 bg-indigo-500/30 flex items-center justify-center">
                          <CheckCircle2 size={20} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {form.coverUrl && !uploadedCover && (
                <div className="mt-3 rounded-lg overflow-hidden border border-white/[0.08] aspect-video w-48">
                  <img
                    src={form.coverUrl}
                    alt="Aperçu couverture"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </Section>

      {/* ── Tags ── */}
      <Section title="Tags" icon={<Tag size={15} />} optional>
        <Field label="Mots-clés (séparés par des virgules)"
          hint="Ex: IA, Machine Learning, Innovation, Data Science">
          <input
            type="text"
            className={inputCls}
            placeholder="IA, Hackathon, Innovation..."
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
          />
        </Field>

        {form.tags && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* ── Intervenants ── */}
      <Section title="Intervenants / Speakers" icon={<Mic size={15} />} optional>
        {form.speakers.length > 0 && (
          <div className="space-y-2 mb-4">
            {form.speakers.map((sp, idx) => (
              <div key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm flex-shrink-0">
                  {sp.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{sp.name}</p>
                  <p className="text-xs text-white/40 truncate">{sp.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSpeaker(idx)}
                  className="text-white/30 hover:text-rose-400 transition-colors p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-5 gap-2">
          <input
            type="text"
            className={cn(inputCls, "col-span-2")}
            placeholder="Nom de l'intervenant"
            value={newSpeaker.name}
            onChange={(e) => setNewSpeaker((s) => ({ ...s, name: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && addSpeaker()}
          />
          <input
            type="text"
            className={cn(inputCls, "col-span-2")}
            placeholder="Rôle / Institution"
            value={newSpeaker.role}
            onChange={(e) => setNewSpeaker((s) => ({ ...s, role: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && addSpeaker()}
          />
          <button
            type="button"
            onClick={addSpeaker}
            disabled={!newSpeaker.name.trim()}
            className="flex items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            Ajouter
          </button>
        </div>
      </Section>

      {/* ── Options ── */}
      <Section title="Options" icon={<Eye size={15} />} optional>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative",
              form.isHighlight ? "bg-amber-500" : "bg-white/[0.12]"
            )}
            onClick={() => update("isHighlight", !form.isHighlight)}
          >
            <div
              className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow",
                form.isHighlight ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </div>
          <div>
            <p className="text-sm text-white font-medium">Événement à la une</p>
            <p className="text-xs text-white/40">Mis en avant sur la page d'accueil</p>
          </div>
        </label>
      </Section>

      {/* ── Error summary ── */}
      {hasErrors && Object.keys(touched).length > 0 && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-rose-400">Veuillez corriger les erreurs suivantes :</p>
            <ul className="mt-1 space-y-0.5">
              {Object.values(errors).map((err, i) => (
                <li key={i} className="text-xs text-rose-400/80">• {err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {submitError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.07] p-3 flex items-center gap-2">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300/90">{submitError}</p>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-white/[0.10] text-white/60 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {mode === "create" ? "Création en cours..." : "Enregistrement..."}
            </>
          ) : (
            <>
              {mode === "create" ? "Créer l'événement" : "Enregistrer les modifications"}
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
