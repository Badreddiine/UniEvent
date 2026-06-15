"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle, QrCode, Loader2, ShieldCheck } from "lucide-react";
import { badgeService } from "@/services/badge.service";
import type { BadgeDto } from "@/types/api";

function BadgeVerifyInner() {
  const params = useSearchParams();
  const [token, setToken] = useState("");
  const [badge, setBadge] = useState<BadgeDto | null>(null);
  const [invalid, setInvalid] = useState(false);

  const verifyMutation = useMutation({
    mutationFn: (t: string) => badgeService.verify(t),
    onSuccess: (b) => { setBadge(b); setInvalid(false); },
    onError: () => { setBadge(null); setInvalid(true); },
  });

  // Auto-verify when a ?token= is present (QR codes link here directly)
  useEffect(() => {
    const t = params.get("token");
    if (t) {
      setToken(t);
      verifyMutation.mutate(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (token.trim()) verifyMutation.mutate(token.trim());
  }

  return (
    <main className="min-h-screen bg-[#0c0c0f] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <ShieldCheck className="text-violet-400" size={24} />
          </div>
          <h1 className="text-xl font-bold">Vérification de badge</h1>
          <p className="text-sm text-white/50">Scannez ou saisissez le token du badge pour vérifier son authenticité.</p>
        </div>

        <form onSubmit={submit} className="flex gap-2">
          <div className="relative flex-1">
            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token du badge…"
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>
          <button type="submit" disabled={verifyMutation.isPending || !token.trim()}
            className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-50">
            {verifyMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Vérifier"}
          </button>
        </form>

        {invalid && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 flex items-center gap-3">
            <XCircle className="text-red-400 flex-shrink-0" size={24} />
            <div>
              <p className="font-semibold text-red-300">Badge invalide</p>
              <p className="text-xs text-red-300/70">Ce token ne correspond à aucun badge valide.</p>
            </div>
          </div>
        )}

        {badge && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={24} />
              <p className="font-semibold text-emerald-300">Badge valide</p>
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-sm pl-9">
              {badge.utilisateurNom && <Row label="Titulaire" value={badge.utilisateurNom} />}
              {badge.evenementTitre && <Row label="Événement" value={badge.evenementTitre} />}
              {badge.genereLe && <Row label="Généré le" value={new Date(badge.genereLe).toLocaleString("fr-FR")} />}
              <Row label="Token" value={badge.token} mono />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-white/40">{label}</span>
      <span className={mono ? "font-mono text-white/70 truncate max-w-[200px]" : "text-white/80"}>{value}</span>
    </div>
  );
}

export default function BadgeVerifyPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0c0c0f] flex items-center justify-center"><Loader2 className="text-violet-400 animate-spin" /></main>}>
      <BadgeVerifyInner />
    </Suspense>
  );
}
