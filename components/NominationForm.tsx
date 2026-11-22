"use client";

import Link from "next/link";
import { ClientForm } from "./Form";
import { submitNomination } from "@/lib/api";
import { configured } from "@/lib/supabase/client";
import { useViewer } from "@/lib/viewer";

export function NominationForm() {
  const v = useViewer();
  return (
    <>
          {!configured ? (
            <p className="placeholder-note text-lg">Nominations open once the database is connected.</p>
          ) : v.loading ? null : !v.user ? (
            <div className="border border-rule bg-sheet p-8">
              <p className="text-lg">You need a verified account to nominate.</p>
              <Link href="/login/?next=/nominate" className="mt-5 btn">Sign in with email</Link>
            </div>
          ) : (
            <ClientForm onSubmit={submitNomination} submit="Send nomination" successHides>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="critic_name">Critic&rsquo;s full name</label>
                  <input id="critic_name" name="critic_name" required maxLength={120} className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="publication">Publication or platform</label>
                  <input id="publication" name="publication" required maxLength={160} className="field" placeholder="Newspaper, magazine, site, broadcaster" />
                </div>
                <div>
                  <label className="label" htmlFor="city">City or region</label>
                  <input id="city" name="city" required maxLength={120} className="field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="review_url">Link to a published restaurant review</label>
                  <input id="review_url" name="review_url" type="url" required className="field" placeholder="https://" />
                  <p className="hint">Required. This is how we confirm a public record of restaurant criticism.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="reason">Why do they deserve consideration?</label>
                  <textarea id="reason" name="reason" required minLength={20} maxLength={2000} rows={6} className="field" placeholder="About the published work: their verdicts, their habits on the page, the review everyone in the industry still talks about." />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="extra_links">Supporting links <span className="font-normal text-muted">(optional, up to five, one per line)</span></label>
                  <textarea id="extra_links" name="extra_links" rows={3} className="field" />
                </div>
              </div>
            </ClientForm>
          )}
    </>
  );
}
