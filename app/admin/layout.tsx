import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/ui";

export const metadata: Metadata = { title: "The Desk", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
