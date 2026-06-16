import type { Metadata } from "next";
import { BackButton } from "@/components/shared/back-button";
import AdminClubsHome from "@/components/admin/clubs/admin-clubs-home";

export const metadata: Metadata = { title: "Clubs — Administration" };

export default function AdminClubsPage() {
  return <AdminClubsHome />;
}
