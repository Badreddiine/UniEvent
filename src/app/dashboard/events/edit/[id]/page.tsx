// ============================================================
// UNIEVENT — /dashboard/events/edit/[id]
// Données chargées dynamiquement via l'API (event.service).
// ============================================================

import type { Metadata } from "next";
import { EditEventHome } from "@/components/events-crud";

export const metadata: Metadata = {
  title: "Modifier l'événement — UniEvent",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  return <EditEventHome eventId={id} />;
}
