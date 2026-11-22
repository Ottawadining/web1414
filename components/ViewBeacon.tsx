"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { configured, sb } from "@/lib/supabase/client";

/** Counts a page view (path + day only; no IP, no cookie, no user id). */
export function ViewBeacon() {
  const path = usePathname();
  useEffect(() => {
    if (!configured || !path || path.startsWith("/admin") || path.startsWith("/auth")) return;
    if (/bot|crawl|spider|headless/i.test(navigator.userAgent)) return;
    const p = path.length > 1 ? path.replace(/\/$/, "") : path;
    sb().rpc("record_view", { p_path: p.slice(0, 200) }).then(() => {}, () => {});
  }, [path]);
  return null;
}
