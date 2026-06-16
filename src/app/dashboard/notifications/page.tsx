import type { Metadata } from "next";
import { BackButton } from "@/components/shared/back-button";
import { NotificationsPage } from "@/components/dashboard/notifications-page";

export const metadata: Metadata = {
  title: "Notifications — UniEvent",
};

export default function Notifications() {
  return <NotificationsPage />;
}
