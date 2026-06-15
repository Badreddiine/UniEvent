// ============================================================
// UNIEVENT — /dashboard/events/mine
// ============================================================

import type { Metadata } from "next";
import { MyEventsHome } from "@/components/events-crud";

export const metadata: Metadata = {
  title: "Mes Événements — UniEvent",
  description: "Gérez vos événements créés et consultez vos inscriptions.",
};

export default function MyEventsPage() {
  return <MyEventsHome />;
}
