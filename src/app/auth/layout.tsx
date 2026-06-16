import type { Metadata } from "next";
import { AuthBackground } from "@/components/auth/auth-ui";

export const metadata: Metadata = {
  title: {
    template: "%s — UniEvent",
    default: "Authentification — UniEvent",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <AuthBackground />
      {children}
    </div>
  );
}
