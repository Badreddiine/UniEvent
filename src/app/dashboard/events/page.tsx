import type { Metadata } from "next";
import { EventsHome } from "@/components/events";

export const metadata: Metadata = {
  title: "Catalogue des événements",
};

export default function DashboardEventsPage() {
  return <EventsHome />;
}
