"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode, CheckCircle2, XCircle, RotateCcw, Loader2, ShieldX } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { badgeService } from "@/services/badge.service";
import { PageHeader } from "@/components/shared/page-header";
import type { UserRole } from "@/types";
import type { BadgeDto } from "@/types/api";

const ALLOWED_ROLES: UserRole[] = [
  "responsable_evenements",
  "president_club",
  "admin",
  "doyen",
];

const READER_ID = "qr-reader";

type Status = "scanning" | "checking" | "success" | "error";

/** Extracts the badge token from the scanned content (JSON payload or raw UUID). */
function extractToken(decoded: string): string | null {
  try {
    const obj = JSON.parse(decoded) as { token?: unknown };
    if (obj?.token) return String(obj.token);
  } catch {
    // not JSON — fall through
  }
  const m = decoded.match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  );
  return m ? m[0] : null;
}

export default function CheckInScanPage() {
  const { user } = useAuthStore();
  const allowed = !!user && ALLOWED_ROLES.includes(user.role);

  const [status, setStatus] = useState<Status>("scanning");
  const [badge, setBadge] = useState<BadgeDto | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // html5-qrcode instance + a guard so a scan is processed only once
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const processingRef = useRef(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    processingRef.current = false;

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
      const scanner = new Html5Qrcode(READER_ID);
      scannerRef.current = scanner;

      const onScanSuccess = async (decodedText: string) => {
        if (processingRef.current) return;
        processingRef.current = true;

        const token = extractToken(decodedText);
        try {
          await scanner.stop();
        } catch {
          // already stopped
        }

        if (!token) {
          setErrorMsg("QR code non reconnu.");
          setStatus("error");
          return;
        }

        setStatus("checking");
        try {
          const dto = await badgeService.checkIn(token);
          setBadge(dto);
          setStatus("success");
        } catch {
          setErrorMsg("Badge invalide ou introuvable.");
          setStatus("error");
        }
      };

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          onScanSuccess,
          undefined
        );
      } catch {
        if (!cancelled) {
          setErrorMsg("Impossible d'accéder à la caméra.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        s.stop().then(() => s.clear()).catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [allowed, restartKey]);

  const rescan = () => {
    setBadge(null);
    setErrorMsg("");
    setStatus("scanning");
    setRestartKey((k) => k + 1);
  };

  if (!user) return null;

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md text-center py-16">
        <ShieldX className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 font-display text-lg font-bold text-foreground">Accès refusé</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page est réservée aux organisateurs.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="Scanner QR"
        description="Scannez le badge d'un participant pour confirmer sa présence."
      />

      {/* Scanner viewport — kept mounted while scanning */}
      <div className={status === "scanning" ? "block" : "hidden"}>
        <div
          id={READER_ID}
          className="overflow-hidden rounded-2xl border border-border bg-black/5"
        />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Placez le QR code du badge devant la caméra.
        </p>
      </div>

      {status === "checking" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Vérification du badge…</p>
        </div>
      )}

      {status === "success" && badge && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-3 font-display text-lg font-bold text-foreground">
            Présence confirmée ✅
          </h3>
          <div className="mt-4 space-y-1 text-sm">
            <p className="font-semibold text-foreground">{badge.utilisateurNom ?? "—"}</p>
            <p className="text-muted-foreground">{badge.evenementTitre ?? "—"}</p>
          </div>
          <button
            onClick={rescan}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-brand-400 px-4 py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110"
          >
            <RotateCcw className="h-4 w-4" /> Scanner un autre
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-3 font-display text-lg font-bold text-foreground">
            Badge invalide ❌
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{errorMsg}</p>
          <button
            onClick={rescan}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" /> Réessayer
          </button>
        </div>
      )}

      {status === "scanning" && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <QrCode className="h-3.5 w-3.5" /> En attente d'un QR code…
        </div>
      )}
    </div>
  );
}
