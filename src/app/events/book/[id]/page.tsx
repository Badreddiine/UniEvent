// ============================================================
// UNIEVENT — /events/book/[id]
// Page de réservation / inscription à un événement (API réelle)
// ============================================================

"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { eventService } from "@/services/event.service";
import { eventDtoToPublic } from "@/lib/event-adapters";
import { BookingModal } from "@/components/events/BookingModal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventBookingPage({ params }: PageProps) {
  const { id } = use(params);
  const eventId = Number(id);

  const { data: dto, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventService.get(eventId),
    enabled: !Number.isNaN(eventId),
  });

  return (
    <main className="min-h-screen bg-[#0c0c0f] flex items-center justify-center p-4 sm:p-8">
      {isLoading ? (
        <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
      ) : error || !dto ? (
        <p className="text-white/50">Événement introuvable.</p>
      ) : (
        (() => {
          const event = eventDtoToPublic(dto);
          const isFull = event.registeredCount >= event.capacity && event.capacity > 0;
          const spotsLeft = Math.max(0, event.capacity - event.registeredCount);
          return <BookingModal event={event} isFull={isFull} spotsLeft={spotsLeft} />;
        })()
      )}
    </main>
  );
}
