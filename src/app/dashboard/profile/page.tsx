import type { Metadata } from "next";
import { ProfilePage } from "@/components/dashboard/profile-page";

export const metadata: Metadata = {
  title: "Mon Profil — UniEvent",
};

export default function Profile() {
  return <ProfilePage />;
}
