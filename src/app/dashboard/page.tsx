import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export const metadata: Metadata = {
  title: "Tableau de bord — UniEvent",
};

export default function DashboardPage() {
  return <DashboardHome />;
}
