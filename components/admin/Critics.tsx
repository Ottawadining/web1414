"use client";

import Link from "next/link";
import { sb } from "@/lib/supabase/client";
import { toScoreMap } from "@/lib/ranking";
import { pct } from "@/lib/scoring";
import { AdminTitle, Pill, must, useAsync } from "./ui";

export function Critics() {
  const { data } = useAsync(async () => {
    const [critics, scores, receipts] = await Promise.all([
      sb().from("critics").select("id, slug, name, nickname, status, editorial_rank, bio_verified, roast, portrait_url").order("editorial_rank", { nullsFirst: false }).order("name"),
      sb().rpc("critic_scores"),
      sb().from("receipts").select("critic_id, status"),
    ]);
    return { critics: must(critics) ?? [], scores: toScoreMap(scores.data), receipts: receipts.data ?? [] };
  });
  const rc = (id: string) => (data?.receipts ?? []).filter((r) => r.critic_id === id && r.status === "published").length;
  return (
    <>
      <AdminTitle sub="Placeholders show on the site until each field is filled and verified.">Critics</AdminTitle>
      <Link href="/admin/critic/" className="btn btn-sm mb-6">Add a critic</Link>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Ed.</th><th>Name</th><th>Status</th><th>Readiness</th><th>Votes</th><th>Comm.</th></tr></thead>
          <tbody>
            {(data?.critics ?? []).map((c) => {
              const s = data!.scores.get(c.id);
              return (
                <tr key={c.id}>
                  <td className="font-serif text-xl">{c.editorial_rank ?? "—"}</td>
                  <td><Link href={`/admin/critic/?id=${c.id}`} className="font-semibold hover:text-tomato">{c.name}</Link><div className="text-xs text-muted italic">{c.nickname}</div></td>
                  <td><Pill tone={c.status === "published" ? "ink" : "muted"}>{c.status}</Pill></td>
                  <td className="text-xs space-x-1">
                    <Pill tone={c.roast ? "ink" : "muted"}>Roast</Pill>
                    <Pill tone={c.bio_verified ? "ink" : "muted"}>Bio</Pill>
                    <Pill tone={c.portrait_url ? "ink" : "muted"}>Photo</Pill>
                    <Pill tone={rc(c.id) ? "ink" : "muted"}>Receipts {rc(c.id)}</Pill>
                  </td>
                  <td className="tabular-nums">{s ? `${s.rotten}/${s.total} · ${pct(s.rotten_pct)}` : "—"}</td>
                  <td>{s?.community_rank ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
