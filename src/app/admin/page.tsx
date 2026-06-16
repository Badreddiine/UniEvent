import type { Metadata } from "next";
import { AdminDashboardHome } from "@/components/admin/dashboard/admin-dashboard-home";

export const metadata: Metadata = {
  title: "Vue d'ensemble",
};

export default function AdminPage() {
  return <AdminDashboardHome />;
}
