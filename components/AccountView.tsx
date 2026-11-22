"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientForm } from "./Form";
import { PageHeader } from "./PageHeader";
import { signOut, updateDisplayName } from "@/lib/api";
import { useViewer } from "@/lib/viewer";

export function AccountView() {
  const v = useViewer();
  const router = useRouter();
  const [qp, setQp] = useState<{ welcome: boolean; next: string | null }>({ welcome: false, next: null });
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQp({ welcome: sp.has("welcome"), next: sp.get("next") });
  }, []);
  useEffect(() => { if (!v.loading && !v.user) router.replace("/login/?next=/account/"); }, [v.loading, v.user, router]);
  if (v.loading || !v.user) return <div className="py-28 placeholder-note text-xl">One moment…</div>;
  const user = v.user;

  return (
    <>
      <PageHeader
        kicker={qp.welcome ? "You're in" : "Your account"}
        title={qp.welcome && !v.profile?.display_name ? "Choose a name for the dining room" : "Your table"}
        intro={v.profile?.display_name
          ? <>You appear as <strong className="text-ink">{v.profile.display_name}</strong>. Your email stays private.</>
          : "This is the name shown on your comments. Use your own or a pseudonym. Just don't pretend to be a critic, a chef you aren't, or us."}
      />
      <ClientForm onSubmit={async (f) => { const r = await updateDisplayName(user.id, f); if (r?.ok) await v.refresh(); return r; }} submit="Save name">
        <label htmlFor="display_name" className="label">Display name</label>
        <input id="display_name" name="display_name" defaultValue={v.profile?.display_name ?? ""} required minLength={2} maxLength={40} className="field" placeholder="e.g. Saucier on Saturdays" />
        <p className="hint">2–40 characters. Letters, numbers, spaces and . _ &rsquo; -</p>
      </ClientForm>
      {qp.next && v.profile?.display_name && <Link href={qp.next} className="mt-8 inline-block underline">Continue where you were →</Link>}
      <div className="rule mt-14 pt-8 flex flex-wrap gap-6 items-center text-sm text-muted">
        <span>Signed in as {user.email}{user.verified ? " · verified" : " · not verified"}</span>
        <button className="btn btn-ghost btn-sm" onClick={async () => { await signOut(); router.replace("/"); }}>Sign out</button>
      </div>
      <p className="mt-6 text-sm text-muted">Want your account and its data deleted? <Link href="/contact/?kind=general" className="underline">Ask us</Link>; see the <Link href="/privacy/" className="underline">privacy policy</Link>.</p>
    </>
  );
}
