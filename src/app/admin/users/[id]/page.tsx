import type { Metadata } from "next";
import { AdminUserProfile } from "@/components/admin/users/admin-user-profile";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Profil utilisateur — UniEvent",
};

export default async function AdminUserProfilePage({ params }: Props) {
  const { id } = await params;
  return <AdminUserProfile userId={id} />;
}
