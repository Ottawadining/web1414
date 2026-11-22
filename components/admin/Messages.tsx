"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sb } from "@/lib/supabase/client";
import { AdminTitle, Flash, Pill, must, useAsync, useFlash, when } from "./ui";

type Msg = { id: string; kind: string; name: string; email: string; organization: string | null; critic_id: string | null; url: string | null; body: string; status: string; admin_notes: string | null; created_at: string; critics: { name: string; slug: string } | null };

export function Messages() {
  const router = useRouter();
  const [status, setStatus] = useState("new");
  const flash = useFlash();
  const { data, reload } = useAsync(async () => (must(await sb().from("contact_messages").select("*, critics(name, slug)").eq("status", status).order("created_at").limit(100)) ?? []) as Msg[], [status]);

  const setMsgStatus = (m: Msg, next: string, notes: string) =>
    flash.run(async () => { must(await sb().from("contact_messages").update({ status: next, admin_notes: notes || null }).eq("id", m.id)); await reload(); }, "Updated.");

  const draftReply = (m: Msg) => flash.run(async () => {
    must(await sb().from("critic_responses").insert({ critic_id: m.critic_id, source_message_id: m.id, author_name: m.name, author_title: m.organization, body: m.body, status: "draft" }));
    must(await sb().from("contact_messages").update({ status: "in_progress" }).eq("id", m.id));
    router.push(`/admin/critic/?id=${m.critic_id}`);
  }, "Draft created.");

  return (
    <>
      <AdminTitle sub="Corrections, evidence, right of reply and general mail. Senders' emails are private.">Messages</AdminTitle>
      <Flash msg={flash.msg} />
      <div className="flex gap-4 mb-6 text-sm">
        {["new", "in_progress", "closed"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={s === status ? "font-semibold text-tomato" : "hover:text-tomato"}>{s.replace("_", " ")}</button>
        ))}
      </div>
      {data && data.length === 0 && <p className="text-muted">Nothing here.</p>}
      <ul className="space-y-5">
        {(data ?? []).map((m) => (
          <li key={m.id} className="border border-rule bg-sheet p-5">
            <div className="flex flex-wrap gap-3 items-center text-sm">
              <Pill tone={m.kind === "reply" || m.kind === "legal" ? "red" : "ink"}>{m.kind}</Pill>
              <strong>{m.name}</strong>
              <a href={`mailto:${m.email}`} className="underline">{m.email}</a>
              {m.organization && <span className="text-muted">{m.organization}</span>}
              <span className="text-muted">{when(m.created_at)}</span>
              {m.critics && <span>re: <Link href={`/critics/${m.critics.slug}/`} className="underline">{m.critics.name}</Link></span>}
            </div>
            {m.url && <p className="mt-2 text-sm"><a href={m.url} target="_blank" rel="noopener noreferrer nofollow" className="underline break-all">{m.url}</a></p>}
            <p className="mt-3 whitespace-pre-line">{m.body}</p>
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <input id={`n-${m.id}`} defaultValue={m.admin_notes ?? ""} placeholder="Private notes" className="field !w-72 !py-1.5 text-sm" />
              {["in_progress", "closed"].filter((s) => s !== status).map((s) => (
                <button key={s} className="btn btn-sm btn-ghost" onClick={() => setMsgStatus(m, s, (document.getElementById(`n-${m.id}`) as HTMLInputElement).value)}>
                  {s === "closed" ? "Close" : "In progress"}
                </button>
              ))}
              {m.kind === "reply" && m.critic_id && <button className="btn btn-sm" onClick={() => draftReply(m)}>Draft as right-of-reply →</button>}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
