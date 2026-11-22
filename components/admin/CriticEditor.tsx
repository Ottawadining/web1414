"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase/client";
import { useViewer } from "@/lib/viewer";
import type { Critic, Receipt } from "@/lib/types";
import { AdminTitle, Flash, Pill, must, useAsync, useFlash, when } from "./ui";

const s = (v: FormDataEntryValue | null) => { const t = typeof v === "string" ? v.trim() : ""; return t.length ? t : null; };
const bool = (v: FormDataEntryValue | null) => v === "on";
const slugify = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Resp = { id: string; author_name: string; author_title: string | null; body: string; identity_verified: boolean; status: string; source_message_id: string | null };

const F = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div><label className="label">{label}</label>{children}{hint && <p className="hint">{hint}</p>}</div>
);

export function CriticEditor() {
  const router = useRouter();
  const viewer = useViewer();
  const [id, setId] = useState<string | null | undefined>(undefined);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setId(sp.get("id"));
    if (sp.has("fromNomination")) setNotice("Created from an approved nomination as a draft. Add verified details, then publish.");
  }, []);
  const flash = useFlash();

  const { data, reload } = useAsync(async () => {
    if (!id) return null;
    const [c, r, resp] = await Promise.all([
      sb().from("critics").select("*").eq("id", id).maybeSingle(),
      sb().from("receipts").select("*").eq("critic_id", id).order("sort_order"),
      sb().from("critic_responses").select("*").eq("critic_id", id).order("created_at", { ascending: false }),
    ]);
    return { critic: must(c) as Critic | null, receipts: (r.data ?? []) as Receipt[], responses: (resp.data ?? []) as Resp[] };
  }, [id]);

  if (id === undefined) return null;
  const c = data?.critic ?? undefined;
  if (id && data && !c) return <AdminTitle>Critic not found</AdminTitle>;
  if (id && !data) return <AdminTitle>Loading…</AdminTitle>;

  async function saveCritic(f: FormData) {
    const name = s(f.get("name"));
    if (!name) throw new Error("Name is required.");
    const rank = s(f.get("editorial_rank"));
    const row = {
      name, slug: s(f.get("slug")) ?? slugify(name), nickname: s(f.get("nickname")), city: s(f.get("city")),
      publication: s(f.get("publication")), background: s(f.get("background")), bio_verified: bool(f.get("bio_verified")),
      roast: s(f.get("roast")), excerpt: s(f.get("excerpt")), portrait_url: s(f.get("portrait_url")),
      portrait_credit: s(f.get("portrait_credit")),
      editorial_rank: rank ? Number(rank) : null,
      status: s(f.get("status")) ?? "draft",
    };
    const res = id
      ? await sb().from("critics").update(row).eq("id", id).select("id").single()
      : await sb().from("critics").insert(row).select("id").single();
    if (res.error) throw new Error(res.error.code === "23505" ? "That slug or editorial rank is already taken. Free the rank on the other critic first." : res.error.message);
    if (!id) { router.replace(`/admin/critic/?id=${res.data.id}`); setId(res.data.id); }
    else await reload();
  }

  async function upload(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("JPEG, PNG or WebP only.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Five megabytes at most.");
    const path = `${id}/${Date.now()}.${file.type.split("/")[1].replace("jpeg", "jpg")}`;
    const up = await sb().storage.from("portraits").upload(path, file, { contentType: file.type });
    if (up.error) throw new Error(up.error.message);
    const url = sb().storage.from("portraits").getPublicUrl(path).data.publicUrl;
    must(await sb().from("critics").update({ portrait_url: url }).eq("id", id!));
    await reload();
  }

  async function saveReceipt(f: FormData, r?: Receipt) {
    const publish = s(f.get("status")) === "published";
    const verified = bool(f.get("verified"));
    if (publish && !verified && !r?.verified_at) throw new Error("Tick “I have checked the source” before publishing a receipt.");
    const row = {
      critic_id: id, headline: s(f.get("headline")) ?? "", explanation: s(f.get("explanation")) ?? "",
      source_url: s(f.get("source_url")), source_title: s(f.get("source_title")), published_on: s(f.get("published_on")),
      context: s(f.get("context")), sort_order: Number(s(f.get("sort_order")) ?? 0), status: publish ? "published" : "draft",
      ...(publish && verified ? { verified_by: viewer.user!.id, verified_at: new Date().toISOString() } : publish ? {} : { verified_by: null, verified_at: null }),
    };
    const res = r ? await sb().from("receipts").update(row).eq("id", r.id) : await sb().from("receipts").insert(row);
    if (res.error) throw new Error(res.error.message.includes("receipts_publish_requires_source") ? "A published receipt needs a source URL and verification." : res.error.message);
    await reload();
  }

  async function saveResponse(f: FormData, r?: Resp) {
    const status = s(f.get("status")) ?? "draft";
    const row = {
      critic_id: id, author_name: s(f.get("author_name")) ?? "", author_title: s(f.get("author_title")), body: s(f.get("body")) ?? "",
      identity_verified: bool(f.get("identity_verified")), status, published_at: status === "published" ? new Date().toISOString() : null,
    };
    const res = r ? await sb().from("critic_responses").update(row).eq("id", r.id) : await sb().from("critic_responses").insert(row);
    if (res.error) throw new Error(res.error.message.includes("verification") ? "Confirm the critic's identity before publishing." : res.error.message);
    await reload();
  }

  const submit = (fn: (f: FormData) => Promise<void>, ok = "Saved.") => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    flash.run(() => fn(fd), ok).then((done) => { if (done && form.dataset.reset) form.reset(); window.scrollTo({ top: 0, behavior: "smooth" }); });
  };

  const words = c?.roast ? c.roast.trim().split(/\s+/).length : 0;

  return (
    <>
      <AdminTitle sub={c ? (c.status === "published" ? <Link href={`/critics/${c.slug}/`} className="underline">View public page ↗</Link> : "Draft: not public") : "Starts as a draft. Publish once the facts are verified."}>
        {c ? c.name : "Add a critic"}
      </AdminTitle>
      <Flash msg={flash.msg} />
      {notice && <p className="mb-6 text-sm border-l-2 border-tomato pl-4">{notice}</p>}

      <form key={c?.updated_at ?? "new"} onSubmit={submit(saveCritic)} className="grid sm:grid-cols-2 gap-5">
        <F label="Name"><input name="name" defaultValue={c?.name} required className="field" /></F>
        <F label="Slug" hint="URL: /critics/slug. Leave blank to generate."><input name="slug" defaultValue={c?.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" className="field" /></F>
        <F label="Editorial nickname"><input name="nickname" defaultValue={c?.nickname ?? ""} className="field" /></F>
        <F label="Editorial rank" hint="1–10 for the inaugural order; blank for none. Must be unique."><input name="editorial_rank" type="number" min={1} defaultValue={c?.editorial_rank ?? ""} className="field" /></F>
        <F label="City"><input name="city" defaultValue={c?.city ?? ""} className="field" /></F>
        <F label="Publication / platform"><input name="publication" defaultValue={c?.publication ?? ""} className="field" /></F>
        <div className="sm:col-span-2">
          <F label="Professional background" hint="Only shown when ‘verified’ is ticked. Public record only."><textarea name="background" rows={3} defaultValue={c?.background ?? ""} className="field" /></F>
          <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="bio_verified" defaultChecked={c?.bio_verified} /> I&rsquo;ve verified city, publication and background against the public record</label>
        </div>
        <div className="sm:col-span-2"><F label={`The Roast${words ? ` (${words} words)` : ""}`} hint="100–150 words. Satire about published work only. Blank lines separate paragraphs.">
          <textarea name="roast" rows={8} defaultValue={c?.roast ?? ""} className="field font-serif" /></F></div>
        <div className="sm:col-span-2"><F label="Homepage excerpt" hint="One cutting line, max 280 characters.">
          <textarea name="excerpt" rows={2} maxLength={280} defaultValue={c?.excerpt ?? ""} className="field" /></F></div>
        <F label="Portrait URL" hint="Or upload below once saved."><input name="portrait_url" defaultValue={c?.portrait_url ?? ""} className="field" /></F>
        <F label="Photo credit" hint="Optional. Shown under the portrait on the profile."><input name="portrait_credit" defaultValue={c?.portrait_credit ?? ""} className="field" /></F>
        <F label="Status">
          <select name="status" defaultValue={c?.status ?? "draft"} className="field">
            <option value="draft">Draft (hidden)</option><option value="published">Published</option><option value="archived">Archived (hidden)</option>
          </select>
        </F>
        <div className="sm:col-span-2"><button className="btn">Save critic</button></div>
      </form>

      {c && (
        <>
          <section className="mt-14">
            <h2 className="text-2xl mb-3">Upload portrait</h2>
            <form onSubmit={(e) => { e.preventDefault(); const file = (e.currentTarget.elements.namedItem("file") as HTMLInputElement).files?.[0]; if (file) flash.run(() => upload(file), "Portrait uploaded. It's live."); }} className="flex flex-wrap gap-3 items-center">
              <input type="file" name="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
              <button className="btn btn-sm">Upload</button>
            </form>
            <p className="hint">JPEG, PNG or WebP, up to 5 MB. Shows on the site immediately.</p>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl mb-1">Receipts</h2>
            <p className="text-sm text-muted mb-5">Published receipts need a source URL and your verification. The database rejects anything else.</p>
            <div className="space-y-6">
              {[...(data?.receipts ?? []), undefined].map((r) => (
                <div key={r?.id ?? "new"}>
                  {r ? (
                    <div className="flex items-center gap-3 mb-2"><Pill tone={r.status === "published" ? "ink" : "muted"}>{r.status}</Pill>
                      <button type="button" className="text-xs text-tomato underline" onClick={() => confirm("Delete this receipt?") && flash.run(async () => { must(await sb().from("receipts").delete().eq("id", r.id)); await reload(); }, "Deleted.")}>Delete</button>
                    </div>
                  ) : <p className="kicker mb-2">New receipt</p>}
                  <form key={r ? `${r.id}-${r.status}-${r.verified_at}` : `new-${data?.receipts.length}`} data-reset={r ? undefined : "1"} onSubmit={submit((f) => saveReceipt(f, r))} className="grid sm:grid-cols-2 gap-4 p-5 border border-rule bg-sheet">
                    <div className="sm:col-span-2"><label className="label">Headline</label><input name="headline" required defaultValue={r?.headline} className="field" /></div>
                    <div className="sm:col-span-2"><label className="label">Explanation of the criticism</label><textarea name="explanation" required rows={3} defaultValue={r?.explanation} className="field" /></div>
                    <div><label className="label">Source URL</label><input name="source_url" type="url" defaultValue={r?.source_url ?? ""} className="field" placeholder="https://" /></div>
                    <div><label className="label">Source title / outlet</label><input name="source_title" defaultValue={r?.source_title ?? ""} className="field" /></div>
                    <div><label className="label">Publication date</label><input name="published_on" type="date" defaultValue={r?.published_on ?? ""} className="field" /></div>
                    <div><label className="label">Order</label><input name="sort_order" type="number" defaultValue={r?.sort_order ?? 0} className="field" /></div>
                    <div className="sm:col-span-2"><label className="label">Context or response</label><textarea name="context" rows={2} defaultValue={r?.context ?? ""} className="field" /></div>
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-5 text-sm">
                      <select name="status" defaultValue={r?.status ?? "draft"} className="field !w-auto"><option value="draft">Draft</option><option value="published">Published</option></select>
                      <label className="flex items-center gap-2"><input type="checkbox" name="verified" /> I have opened the source and it says what we say it says</label>
                      {r?.verified_at && <span className="text-xs text-muted">Verified {when(r.verified_at)}</span>}
                      <button className="btn btn-sm">{r ? "Update" : "Add receipt"}</button>
                    </div>
                  </form>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl mb-1">Right of reply</h2>
            <p className="text-sm text-muted mb-5">Confirm identity (a reply from a known publication address, or another reliable check) before publishing.</p>
            <div className="space-y-6">
              {[...(data?.responses ?? []), undefined].map((r) => (
                <form key={r ? `${r.id}-${r.status}` : `new-${data?.responses.length}`} data-reset={r ? undefined : "1"} onSubmit={submit((f) => saveResponse(f, r))} className="grid sm:grid-cols-2 gap-4 p-5 border border-rule bg-sheet">
                  {!r && <p className="sm:col-span-2 kicker">New response</p>}
                  <div><label className="label">Author name</label><input name="author_name" required defaultValue={r?.author_name ?? c.name} className="field" /></div>
                  <div><label className="label">Title / affiliation</label><input name="author_title" defaultValue={r?.author_title ?? ""} className="field" /></div>
                  <div className="sm:col-span-2"><label className="label">Response (published as written)</label><textarea name="body" required rows={6} defaultValue={r?.body ?? ""} className="field" /></div>
                  <div className="sm:col-span-2 flex flex-wrap items-center gap-5 text-sm">
                    <select name="status" defaultValue={r?.status ?? "draft"} className="field !w-auto"><option value="draft">Draft</option><option value="published">Published</option><option value="withdrawn">Withdrawn</option></select>
                    <label className="flex items-center gap-2"><input type="checkbox" name="identity_verified" defaultChecked={r?.identity_verified} /> Identity verified</label>
                    <button className="btn btn-sm">Save</button>
                  </div>
                </form>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
