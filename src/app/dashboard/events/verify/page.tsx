import type { Metadata } from "next";
import { EventsVerifyHome } from "@/components/events-crud/EventsVerifyHome";

export const metadata: Metadata = {
  title: "Vérification des événements — UniEvent",
  description: "Vérifiez et validez les événements soumis par les présidents de clubs.",
};

export default function EventsVerifyPage() {
  return <EventsVerifyHome />;
}
