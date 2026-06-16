import type { Metadata } from "next";
import { BackButton } from "@/components/shared/back-button";
import { AdminUsersHome } from "@/components/admin/users/admin-users-home";

export const metadata: Metadata = {
  title: "Utilisateurs",
};

export default function AdminUsersPage() {
  return <AdminUsersHome />;
}
