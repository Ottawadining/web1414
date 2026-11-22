"use client";

import Link from "next/link";
import { sb } from "@/lib/supabase/client";
import { computeRanking, toScoreMap, DEFAULT_SETTINGS } from "@/lib/ranking";
import type { Critic } from "@/lib/types";
import { AdminTitle, useAsync } from "./ui";

export function Overview() {
  const { data } = useAsync(async () => {
    const s = sb();
    const since7 = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const since30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    const c = (q: PromiseLike<{ count: number | null }>) => Promise.resolve(q).then((r) => r.count ?? 0);
    const [pc, or, pn, nm, v7, c7, views, critics, scores, settings] = await Promise.all([
      c(s.from("comments").select("*", { count: "exact", head: true }).eq("status", "pending")),
      c(s.from("comment_reports").select("*", { count: "exact", head: true }).eq("status", "open")),
      c(s.from("nominations").select("*", { count: "exact", head: true }).eq("status", "pending")),
      c(s.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new")),
      c(s.from("vote_events").select("*", { count: "exact", head: true }).gte("created_at", weekAgo)),
      c(s.from("comments").select("*", { count: "exact", head: true }).gte("created_at", weekAgo)),
      s.from("page_views").select("day, path, views").gte("day", since30),
      s.from("critics").select("*").eq("status", "published"),
      s.rpc("critic_scores"),
      s.from("settings").select("min_votes, community_size, force_editorial").eq("id", 1).maybeSingle(),
    ]);
    const rows = views.data ?? [];
    const sum = (from: string) => rows.filter((r) => r.day >= from).reduce((a, r) => a + r.views, 0);
    const top = Object.entries(rows.filter((r) => r.day >= since7).reduce<Record<string, number>>((a, r) => ((a[r.path] = (a[r.path] ?? 0) + r.views), a), {}))
      .sort((a, b) => b[1] - a[1]).slice(0, 10);
    const ranking = computeRanking((critics.data ?? []) as Critic[], toScoreMap(scores.data), settings.data ?? DEFAULT_SETTINGS);
    return { pc, or, pn, nm, v7, c7, views7: sum(since7), views30: sum(since30), top, ranking };
  });

  if (!data) return <AdminTitle>Overview</AdminTitle>;
  const queue = [
    ["Comments awaiting approval", data.pc, "/admin/comments/"],
    ["Open reports", data.or, "/admin/reports/"],
    ["Nominations to review", data.pn, "/admin/nominations/"],
    ["New messages", data.nm, "/admin/messages/"],
  ] as const;
  const r = data.ranking;
  return (
    <>
      <AdminTitle sub={`Ranking mode: ${r.mode} · ${r.eligibleCount} of ${r.settings.community_size} critics eligible (≥ ${r.settings.min_votes} votes)`}>Overview</AdminTitle>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
        {queue.map(([label, n, href]) => (
          <Link key={href} href={href} className="bg-paper p-5 hover:bg-sheet">
            <p className="kicker">{label}</p>
            <p className={`mt-2 numeral text-5xl ${n > 0 ? "text-tomato" : ""}`}>{n}</p>
          </Link>
        ))}
      </div>
      <div className="mt-10 grid md:grid-cols-2 gap-10">
        <section>
          <h2 className="text-2xl mb-4">Traffic</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="kicker">Page views, 7 days</dt><dd className="font-serif text-3xl">{data.views7}</dd></div>
            <div><dt className="kicker">Page views, 30 days</dt><dd className="font-serif text-3xl">{data.views30}</dd></div>
            <div><dt className="kicker">Vote actions, 7 days</dt><dd className="font-serif text-3xl">{data.v7}</dd></div>
            <div><dt className="kicker">Comments, 7 days</dt><dd className="font-serif text-3xl">{data.c7}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted">Counts page loads by path and day only. No cookies, no IPs.</p>
        </section>
        <section>
          <h2 className="text-2xl mb-4">Top pages, 7 days</h2>
          {data.top.length === 0 ? <p className="text-sm text-muted">No views recorded yet.</p> : (
            <table className="tbl"><tbody>{data.top.map(([p, n]) => <tr key={p}><td className="font-mono text-xs">{p}</td><td className="text-right">{n}</td></tr>)}</tbody></table>
          )}
        </section>
      </div>
      <p className="mt-12 text-sm text-muted border-t border-rule pt-6">
        Edits to critics appear on the site immediately (pages refresh from the database). The static copy search engines see is rebuilt by GitHub Actions every 6 hours, or straight away with <strong>Actions → Deploy → Run workflow</strong>.
      </p>
    </>
  );
}
