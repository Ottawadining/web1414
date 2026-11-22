"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useViewer } from "@/lib/viewer";
import { configured } from "@/lib/supabase/client";

export function AdminTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="mb-8 border-b border-ink pb-4">
      <h1 className="text-4xl">{children}</h1>
      {sub && <p className="mt-2 text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function Flash({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <p className={`mb-6 border-l-2 pl-4 py-2 text-sm ${msg.ok ? "border-ink" : "border-tomato text-tomato"}`} role="status">{msg.text}</p>
  );
}

export const when = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" }) : "—";

export function Pill({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "red" | "ink" }) {
  const c = { muted: "border border-rule text-muted", red: "bg-tomato text-sheet", ink: "bg-ink text-sheet" }[tone];
  return <span className={`inline-block px-2 py-0.5 text-[0.625rem] tracking-[0.16em] uppercase font-semibold ${c}`}>{children}</span>;
}

/** Load-on-mount data with manual reload. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try { setData(await fn()); setError(null); } catch (e) { setError((e as Error).message); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, reload };
}

/** Throws on Supabase errors so useAsync / handlers can surface them. */
export function must<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}

export function useFlash() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const run = useCallback(async (fn: () => Promise<unknown>, success = "Saved.") => {
    try { await fn(); setMsg({ ok: true, text: success }); return true; }
    catch (e) { setMsg({ ok: false, text: (e as Error).message }); return false; }
  }, []);
  return { msg, setMsg, run };
}

const NAV = [
  ["/admin/", "Overview"],
  ["/admin/critics/", "Critics"],
  ["/admin/comments/", "Comments"],
  ["/admin/reports/", "Reports"],
  ["/admin/nominations/", "Nominations"],
  ["/admin/messages/", "Messages"],
  ["/admin/votes/", "Votes & users"],
  ["/admin/settings/", "Settings"],
  ["/admin/audit/", "Audit log"],
];

/**
 * UI gate only. The real protection is in the database: every admin read and
 * write goes through RLS policies that call is_admin().
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const v = useViewer();
  const path = usePathname();
  if (!configured) return <div className="wrap py-24 placeholder-note text-xl">The Desk needs the database connected. See README.</div>;
  if (v.loading) return <div className="wrap py-24 placeholder-note text-xl">Checking your credentials…</div>;
  if (!v.user) return (
    <div className="wrap py-24"><p className="text-xl">Editors only.</p><Link href={`/login/?next=${path}`} className="mt-6 btn">Sign in</Link></div>
  );
  if (!v.isAdmin) return <div className="wrap py-24 text-xl">This kitchen is staff only.</div>;
  return (
    <div className="wrap pt-10 grid md:grid-cols-[12rem_1fr] gap-10">
      <aside>
        <p className="kicker !text-tomato">The Desk</p>
        <nav className="mt-4 flex md:flex-col gap-1 overflow-x-auto text-sm">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className={`py-1.5 pr-3 whitespace-nowrap hover:text-tomato ${path === href ? "text-tomato font-semibold" : ""}`}>{label}</Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Display names for user ids (admins can read all profiles via RLS). */
export async function namesFor(ids: string[]) {
  const { sb } = await import("@/lib/supabase/client");
  const map = new Map<string, { display_name: string | null; is_restricted: boolean }>();
  const uniq = [...new Set(ids.filter(Boolean))];
  if (!uniq.length) return map;
  const { data } = await sb().from("profiles").select("id, display_name, is_restricted").in("id", uniq);
  for (const p of data ?? []) map.set(p.id, p);
  return map;
}
