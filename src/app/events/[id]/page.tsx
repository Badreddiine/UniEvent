import type { Metadata } from "next";
import { EventDetail } from "@/components/events";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Événement #${id} — UniEvent`,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <EventDetail eventId={id} />;
}
