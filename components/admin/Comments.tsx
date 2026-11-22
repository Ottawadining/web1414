"use client";

import Link from "next/link";
import { useState } from "react";
import { sb } from "@/lib/supabase/client";
import { AdminTitle, Flash, Pill, must, namesFor, useAsync, useFlash, when } from "./ui";

export function Comments() {
  const [status, setStatus] = useState("pending");
  const flash = useFlash();
  const { data, reload } = useAsync(async () => {
    const rows = must(await sb().from("comments")
      .select("id, body, status, created_at, user_id, parent_id, moderation_note, critics(name, slug)")
      .eq("status", status).order("created_at", { ascending: status === "pending" }).limit(100)) ?? [];
    return { rows, names: await namesFor(rows.map((r) => r.user_id)) };
  }, [status]);

  const act = (id: string, next: string, note: string) =>
    flash.run(async () => { must(await sb().from("comments").update({ status: next, moderation_note: note || null }).eq("id", id)); await reload(); }, `Comment ${next}.`);

  return (
    <>
      <AdminTitle sub="Nothing appears publicly until approved. Every action is logged.">Comments</AdminTitle>
      <Flash msg={flash.msg} />
      <div className="flex gap-4 mb-6 text-sm">
        {["pending", "approved", "rejected", "removed"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={s === status ? "font-semibold text-tomato" : "hover:text-tomato"}>{s}</button>
        ))}
      </div>
      {data && data.rows.length === 0 && <p className="text-muted">Nothing here.</p>}
      <ul className="space-y-5">
        {(data?.rows ?? []).map((c) => {
          const critic = c.critics as unknown as { name: string; slug: string } | null;
          const who = data!.names.get(c.user_id);
          return (
            <li key={c.id} className="border border-rule bg-sheet p-5">
              <div className="flex flex-wrap gap-3 items-baseline text-sm">
                <strong>{who?.display_name ?? "—"}</strong>
                {who?.is_restricted && <Pill tone="red">restricted</Pill>}
                <span className="text-muted">on <Link href={`/critics/${critic?.slug}/`} className="underline">{critic?.name}</Link> · {when(c.created_at)}</span>
                {c.parent_id && <Pill>reply</Pill>}
              </div>
              <p className="mt-3 whitespace-pre-line">{c.body}</p>
              {c.moderation_note && <p className="mt-2 text-xs text-muted">Note: {c.moderation_note}</p>}
              <form className="mt-4 flex flex-wrap gap-2 items-center" onSubmit={(e) => e.preventDefault()}>
                <input name="note" placeholder="Moderation note (optional, private)" className="field !w-64 !py-1.5 text-sm" id={`note-${c.id}`} />
                {(["approved", "rejected", "removed"] as const)
                  .filter((n) => (status === "pending" ? n !== "removed" : status === "approved" ? n === "removed" : n === "approved"))
                  .map((n) => (
                    <button key={n} type="button" className={`btn btn-sm ${n === "approved" ? "" : "btn-ghost"}`}
                      onClick={() => act(c.id, n, (document.getElementById(`note-${c.id}`) as HTMLInputElement).value)}>
                      {{ approved: "Approve", rejected: "Reject", removed: "Remove" }[n]}
                    </button>
                  ))}
              </form>
            </li>
          );
        })}
      </ul>
    </>
  );
}
