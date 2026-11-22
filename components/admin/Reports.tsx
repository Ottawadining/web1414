"use client";

import { sb } from "@/lib/supabase/client";
import { AdminTitle, Flash, Pill, must, useAsync, useFlash, when } from "./ui";

const LABEL: Record<string, string> = {
  threat: "Threat", doxxing: "Doxxing", discrimination: "Discrimination", invented_allegation: "Unsupported allegation",
  private_life: "Private life", spam: "Spam", other: "Other",
};

export function Reports() {
  const flash = useFlash();
  const { data, reload } = useAsync(async () =>
    must(await sb().from("comment_reports").select("id, reason, details, created_at, comment_id, comments(body, status, critics(name))").eq("status", "open").order("created_at")) ?? []);

  const remove = (commentId: string) => flash.run(async () => {
    must(await sb().from("comments").update({ status: "removed", moderation_note: "Removed after report" }).eq("id", commentId));
    must(await sb().from("comment_reports").update({ status: "actioned" }).eq("comment_id", commentId).eq("status", "open"));
    await reload();
  }, "Comment removed.");
  const dismiss = (id: string) => flash.run(async () => { must(await sb().from("comment_reports").update({ status: "dismissed" }).eq("id", id)); await reload(); }, "Report dismissed.");

  return (
    <>
      <AdminTitle sub="Reporter identities are never shown publicly.">Open reports</AdminTitle>
      <Flash msg={flash.msg} />
      {data && data.length === 0 && <p className="text-muted">No open reports.</p>}
      <ul className="space-y-5">
        {(data ?? []).map((r) => {
          const c = r.comments as unknown as { body: string; status: string; critics: { name: string } } | null;
          return (
            <li key={r.id} className="border border-rule bg-sheet p-5">
              <div className="flex gap-3 items-center text-sm"><Pill tone="red">{LABEL[r.reason]}</Pill><span className="text-muted">{c?.critics?.name} · {when(r.created_at)}</span><Pill>{c?.status}</Pill></div>
              <blockquote className="mt-3 border-l-2 border-rule pl-4 whitespace-pre-line">{c?.body}</blockquote>
              {r.details && <p className="mt-2 text-sm text-muted">Reporter says: {r.details}</p>}
              <div className="mt-4 flex gap-2">
                <button className="btn btn-sm" onClick={() => remove(r.comment_id)}>Remove comment</button>
                <button className="btn btn-sm btn-ghost" onClick={() => dismiss(r.id)}>Dismiss report</button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
