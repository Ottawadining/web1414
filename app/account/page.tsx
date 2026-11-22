import type { Metadata } from "next";
import { AccountView } from "@/components/AccountView";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function Account() {
  return <div className="wrap narrow"><AccountView /></div>;
}
