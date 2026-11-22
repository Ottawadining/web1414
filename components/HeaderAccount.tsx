"use client";
import Link from "next/link";
import { useViewer } from "@/lib/viewer";

export function HeaderAccount() {
  const v = useViewer();
  if (v.loading) return <span className="opacity-0">Sign in</span>;
  if (!v.user) return <Link href="/login/" className="hover:text-ink">Sign in</Link>;
  return (
    <span className="flex gap-4">
      {v.isAdmin && <Link href="/admin/" className="text-tomato hover:underline">Desk</Link>}
      <Link href="/account/" className="hover:text-ink normal-case tracking-normal">{v.profile?.display_name ?? "Account"}</Link>
    </span>
  );
}
