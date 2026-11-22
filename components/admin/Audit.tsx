"use client";

import { sb } from "@/lib/supabase/client";
import { AdminTitle, must, namesFor, useAsync, when } from "./ui";

export function Audit() {
  const { data } = useAsync(async () => {
    const rows = must(await sb().from("moderation_log").select("*").order("created_at", { ascending: false }).limit(200)) ?? [];
    return { rows, names: await namesFor(rows.map((r) => r.actor_id).filter(Boolean)) };
  });
  return (
    <>
      <AdminTitle sub="Every change to critics, receipts, replies, comments, reports, nominations, messages, settings and user roles. Append-only.">Audit log</AdminTitle>
      <div className="overflow-x-auto"><table className="tbl">
        <thead><tr><th>When</th><th>Who</th><th>Action</th><th>What</th><th>Changes</th></tr></thead>
        <tbody>
          {(data?.rows ?? []).map((r) => (
            <tr key={r.id}>
              <td className="whitespace-nowrap text-xs">{when(r.created_at)}</td>
              <td className="text-xs">{r.actor_id ? data!.names.get(r.actor_id)?.display_name ?? r.actor_id.slice(0, 8) : "system"}</td>
              <td className="text-xs">{r.action}</td>
              <td className="text-xs">{r.entity}<div className="text-muted font-mono">{String(r.entity_id ?? "").slice(0, 8)}</div></td>
              <td><pre className="text-[0.7rem] whitespace-pre-wrap max-w-md max-h-32 overflow-auto">{r.changes ? JSON.stringify(r.changes, null, 1) : ""}</pre></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </>
  );
}
