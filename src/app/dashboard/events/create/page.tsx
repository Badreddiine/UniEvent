// ============================================================
// UNIEVENT — /dashboard/events/create
// Fix #3 — La garde de rôle est appliquée dans CreateEventHome
// (canCreateEvents → admin | responsable_evenements | president_club)
// Les étudiants et le doyen voient un écran d'accès refusé.
// ============================================================

import type { Metadata } from "next";
import { CreateEventHome } from "@/components/events-crud";

export const metadata: Metadata = {
  title: "Créer un événement — UniEvent",
  description: "Créez et soumettez un nouvel événement universitaire.",
};

export default function CreateEventPage() {
  // Role guard is enforced inside CreateEventHome via useAuthStore().canCreateEvents()
  return <CreateEventHome />;
}
