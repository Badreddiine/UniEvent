import type { Metadata } from "next";
import { SettingsPage } from "@/components/dashboard/settings-page";

export const metadata: Metadata = {
  title: "Paramètres — UniEvent",
};

export default function Settings() {
  return <SettingsPage />;
}
