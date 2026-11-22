"use client";

import { useEffect, useState } from "react";
import { configured, sb } from "@/lib/supabase/client";

/** Lands from Google, finishes the PKCE exchange, then routes on. */
export function AuthCallback() {
  const [msg, setMsg] = useState("Seating you…");
  useEffect(() => {
    if (!configured) return setMsg("Sign-in isn't connected yet.");
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get("next") ?? "/";
    const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
    (async () => {
      const code = sp.get("code");
      let { data } = await sb().auth.getSession();
      if (!data.session && code) {
        const r = await sb().auth.exchangeCodeForSession(code);
        if (r.error) { window.location.replace("/login/?error=link"); return; }
        data = (await sb().auth.getSession()).data;
      }
      const user = data.session?.user;
      if (!user) { window.location.replace("/login/?error=link"); return; }
      const { data: profile } = await sb().from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      window.location.replace(profile?.display_name ? next : `/account/?welcome=1&next=${encodeURIComponent(next)}`);
    })();
  }, []);
  return <div className="wrap py-28 text-center placeholder-note text-2xl">{msg}</div>;
}
