"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BackButton } from "@/components/shared/back-button";
import { PageHeader } from "@/components/shared/page-header";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Search, Globe, Mail, Handshake } from "lucide-react";
import { partnerService } from "@/services/partner.service";
import type { CreatePartnerRequest, TypePartenaireEnum } from "@/types/api";
import { useForm } from "react-hook-form";

const TYPES: TypePartenaireEnum[] = ["ACADEMIQUE", "ENTREPRISE", "INSTITUTION", "ASSOCIATION", "MEDIA_PARTNER", "AUTRE"];

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function AdminPartnersPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { register, handleSubmit, reset, setValue } = useForm<CreatePartnerRequest>();

  const { data: partners, isLoading, error } = useQuery({
    queryKey: ["partners"],
    queryFn: partnerService.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePartnerRequest) => partnerService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partners"] }); setShowForm(false); reset(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreatePartnerRequest }) => partnerService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partners"] }); setShowForm(false); setEditId(null); reset(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => partnerService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partners"] }),
  });

  function startEdit(p: { id: string; nom: string; description?: string; logoUrl?: string; siteWeb?: string; emailContact?: string; nomContact?: string; type?: TypePartenaireEnum }) {
    setEditId(p.id);
    setValue("nom", p.nom);
    setValue("description", p.description);
    setValue("logoUrl", p.logoUrl);
    setValue("siteWeb", p.siteWeb);
    setValue("emailContact", p.emailContact);
    setValue("nomContact", p.nomContact);
    setValue("type", p.type);
    setShowForm(true);
  }

  function onSubmit(values: CreatePartnerRequest) {
    if (editId) {
      updateMutation.mutate({ id: editId, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  const filtered = (partners ?? []).filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader title="Partenaires" description="Gérez les partenaires institutionnels.">
        <button
          onClick={() => { setShowForm(true); setEditId(null); reset(); }}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} /> Nouveau partenaire
        </button>
      </PageHeader>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {editId ? "Modifier le partenaire" : "Nouveau partenaire"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nom *</label>
              <input {...register("nom", { required: true })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select {...register("type")}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none">
                <option value="">—</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email contact</label>
              <input {...register("emailContact")} type="email"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nom contact</label>
              <input {...register("nomContact")}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Site web</label>
              <input {...register("siteWeb")} type="url"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Logo URL</label>
              <input {...register("logoUrl")} type="url"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea {...register("description")} rows={2}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none resize-none" />
            </div>
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); reset(); }}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
                {editId ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none"
          placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : error ? (
        <p className="text-sm text-red-500">Erreur lors du chargement des partenaires.</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Handshake size={40} className="mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucun partenaire trouvé.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
              {p.logoUrl ? (
                <img src={p.logoUrl} alt={p.nom} className="h-10 w-10 rounded-lg object-contain flex-shrink-0" />
              ) : (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Handshake size={18} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{p.nom}</p>
                <div className="flex flex-wrap gap-x-3 mt-0.5 text-xs text-muted-foreground">
                  {p.type && <span>{p.type}</span>}
                  {p.emailContact && (
                    <span className="flex items-center gap-1"><Mail size={10} />{p.emailContact}</span>
                  )}
                  {p.siteWeb && (
                    <a href={p.siteWeb} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                      <Globe size={10} />Site web
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => startEdit(p)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Edit size={14} />
                </button>
                <button onClick={() => deleteMutation.mutate(p.id)} disabled={deleteMutation.isPending}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors dark:hover:bg-red-900/20 disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
