"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@/components/shared/back-button";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { CATEGORY_COLORS } from "@/lib/public-events-data";
import { eventService } from "@/services/event.service";
import { eventDtoToPublic } from "@/lib/event-adapters";

import { cn } from "@/lib/utils";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export default function EventsCalendarPage() {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const { data: eventsPage } = useQuery({
    queryKey: ["events-calendar"],
    queryFn: () => eventService.list({ size: 200 }),
  });
  const events = (eventsPage?.content ?? []).map(eventDtoToPublic);

  const firstDay = new Date(current.year, current.month, 1);
  const lastDay = new Date(current.year, current.month + 1, 0);
  // Monday-based
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const totalCells = startDow + lastDay.getDate();
  const rows = Math.ceil(totalCells / 7);

  function eventsOnDay(day: number) {
    const dateStr = `${current.year}-${String(current.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.startDate.startsWith(dateStr));
  }

  function prev() {
    setCurrent((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
  }
  function next() {
    setCurrent((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <PageHeader
        title="Calendrier des événements"
        description="Vue mensuelle de tous les événements universitaires."
       
      >
        <Link
          href="/dashboard/events"
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <List size={16} />
          Vue liste
        </Link>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <button onClick={prev} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-semibold text-foreground">
            {MONTHS[current.month]} {current.year}
          </h2>
          <button onClick={next} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map((d) => (
            <div key={d} className="py-2.5 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: rows * 7 }).map((_, i) => {
            const dayNum = i - startDow + 1;
            const isValid = dayNum >= 1 && dayNum <= lastDay.getDate();
            const isToday = isValid && dayNum === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();
            const events = isValid ? eventsOnDay(dayNum) : [];

            return (
              <div
                key={i}
                className={cn(
                  "min-h-[96px] p-1.5 border-b border-r border-border",
                  !isValid && "bg-muted/30",
                  "last:border-r-0"
                )}
              >
                {isValid && (
                  <>
                    <span className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium mb-1",
                      isToday ? "bg-brand-600 text-white" : "text-muted-foreground hover:bg-muted"
                    )}>
                      {dayNum}
                    </span>
                    <div className="space-y-0.5">
                      {events.slice(0, 2).map((ev) => (
                        <Link key={ev.id} href={`/events/${ev.id}`}>
                          <div className={cn(
                            "truncate rounded px-1.5 py-0.5 text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity",
                            CATEGORY_COLORS[ev.category]
                          )}>
                            {ev.title}
                          </div>
                        </Link>
                      ))}
                      {events.length > 2 && (
                        <span className="text-[10px] text-muted-foreground pl-1">+{events.length - 2} autres</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
