"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sb } from "@/lib/supabase/client";
import { AdminTitle, Flash, Pill, must, useAsync, useFlash, when } from "./ui";

const slugify = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Nom = { id: string; critic_name: string; publication: string; city: string; review_url: string; reason: string; extra_links: string[]; status: string; admin_notes: string | null; created_critic_id: string | null; created_at: string };

export function Nominations() {
  const router = useRouter();
  const [status, setStatus] = useState("pending");
  const flash = useFlash();
  const { data, reload } = useAsync(async () => (must(await sb().from("nominations").select("*").eq("status", status).order("created_at").limit(100)) ?? []) as Nom[], [status]);

  async function decide(n: Nom, decision: "approve" | "reject" | "duplicate", notes: string, confirmed: boolean) {
    await flash.run(async () => {
      if (decision === "approve") {
        if (!confirmed) throw new Error("Confirm you've verified a genuine public record of restaurant criticism.");
        let slug = slugify(n.critic_name);
        const { data: clash } = await sb().from("critics").select("id").eq("slug", slug).maybeSingle();
        if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        const critic = must(await sb().from("critics").insert({ name: n.critic_name, slug, status: "draft" }).select("id").single())!;
        must(await sb().from("nominations").update({ status: "approved", admin_notes: notes || null, created_critic_id: critic.id }).eq("id", n.id));
        router.push(`/admin/critic/?id=${critic.id}&fromNomination=1`);
        return;
      }
      must(await sb().from("nominations").update({ status: decision === "reject" ? "rejected" : "duplicate", admin_notes: notes || null }).eq("id", n.id));
      await reload();
    }, decision === "approve" ? "Approved." : "Updated.");
  }

  return (
    <>
      <AdminTitle sub="Private queue. Approving creates a hidden draft profile; nothing is published automatically.">Nominations</AdminTitle>
      <Flash msg={flash.msg} />
      <div className="flex gap-4 mb-6 text-sm">
        {["pending", "approved", "rejected", "duplicate"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={s === status ? "font-semibold text-tomato" : "hover:text-tomato"}>{s}</button>
        ))}
      </div>
      {data && data.length === 0 && <p className="text-muted">Nothing here.</p>}
      <ul className="space-y-5">
        {(data ?? []).map((n) => (
          <li key={n.id} className="border border-rule bg-sheet p-5">
            <div className="flex flex-wrap gap-3 items-baseline">
              <strong className="text-xl font-serif">{n.critic_name}</strong>
              <span className="text-sm text-muted">{n.publication} · {n.city} · {when(n.created_at)}</span>
              {n.status !== "pending" && <Pill>{n.status}</Pill>}
            </div>
            <p className="mt-2 text-sm"><a href={n.review_url} target="_blank" rel="noopener noreferrer nofollow" className="underline break-all">{n.review_url}</a></p>
            <p className="mt-3 whitespace-pre-line text-ink-soft">{n.reason}</p>
            {n.extra_links?.length > 0 && <ul className="mt-2 text-sm">{n.extra_links.map((l) => <li key={l}><a href={l} target="_blank" rel="noopener noreferrer nofollow" className="underline break-all">{l}</a></li>)}</ul>}
            {n.admin_notes && <p className="mt-2 text-xs text-muted">Notes: {n.admin_notes}</p>}
            {n.created_critic_id && <Link href={`/admin/critic/?id=${n.created_critic_id}`} className="mt-2 inline-block text-sm underline">Open draft profile</Link>}
            {n.status === "pending" && (
              <form className="mt-4 space-y-3" onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const d = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") as "approve" | "reject" | "duplicate";
                decide(n, d, String(f.get("notes") || ""), f.get("confirmed") === "on");
              }}>
                <input name="notes" placeholder="Private notes" className="field text-sm" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="confirmed" /> I&rsquo;ve confirmed a genuine public record of restaurant criticism</label>
                <div className="flex gap-2">
                  <button value="approve" className="btn btn-sm">Approve → draft</button>
                  <button value="duplicate" className="btn btn-sm btn-ghost">Duplicate</button>
                  <button value="reject" className="btn btn-sm btn-ghost">Reject</button>
                </div>
              </form>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
