"use client";

import { useEffect, useState } from "react";
import { ClientForm } from "./Form";
import { submitContact } from "@/lib/api";
import { configured } from "@/lib/supabase/client";
import { SITE } from "@/lib/site";

const KINDS = [
  ["correction", "Correction: a fact is wrong"],
  ["evidence", "Evidence: a receipt for or against"],
  ["reply", "Right of reply: I'm a featured critic"],
  ["general", "General / account / privacy request"],
  ["legal", "Legal notice"],
] as const;

export function ContactForm({ critics }: { critics: { id: string; slug: string; name: string }[] }) {
  const [defaultKind, setKind] = useState("correction");
  const [selected, setSelected] = useState("");
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const k = sp.get("kind");
    if (k && KINDS.some(([x]) => x === k)) setKind(k);
    const c = critics.find((x) => x.slug === sp.get("critic"));
    if (c) setSelected(c.id);
  }, [critics]);
  return (
    <>
          {!configured ? (
            <p className="placeholder-note text-lg">The form opens once the database is connected. Meanwhile: {SITE.email}</p>
          ) : (
            <ClientForm key={`${defaultKind}-${selected}`} onSubmit={submitContact} submit="Send to the desk" successHides>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="kind">What is this about?</label>
                  <select id="kind" name="kind" defaultValue={defaultKind} className="field">
                    {KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="name">Your name</label>
                  <input id="name" name="name" required maxLength={120} className="field" autoComplete="name" />
                </div>
                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" required className="field" autoComplete="email" />
                </div>
                <div>
                  <label className="label" htmlFor="organization">Publication / organization <span className="font-normal text-muted">(optional)</span></label>
                  <input id="organization" name="organization" maxLength={160} className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="critic_id">Which critic? <span className="font-normal text-muted">(if any)</span></label>
                  <select id="critic_id" name="critic_id" defaultValue={selected} className="field">
                    <option value="">Not about a specific critic</option>
                    {critics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="url">Relevant link <span className="font-normal text-muted">(optional)</span></label>
                  <input id="url" name="url" type="url" className="field" placeholder="https://" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="body">Message</label>
                  <textarea id="body" name="body" required minLength={10} maxLength={6000} rows={8} className="field" placeholder="For corrections: quote what we published and what the record shows. For a reply: write it as you'd like it to appear." />
                </div>
              </div>
            </ClientForm>
          )}
    </>
  );
}
