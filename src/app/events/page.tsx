// ============================================================
// UNIEVENT — Phase 5A: /events page
// ============================================================

import type { Metadata } from "next";
import { EventsHome } from "@/components/events";

export const metadata: Metadata = {
  title: "Événements — UniEvent",
  description:
    "Découvrez tous les événements universitaires : conférences, ateliers, compétitions, sorties culturelles et sportives.",
};

export default function EventsPage() {
  return <EventsHome />;
}
