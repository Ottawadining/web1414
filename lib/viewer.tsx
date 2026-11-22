"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { configured, sb } from "./supabase/client";

export type Viewer = {
  loading: boolean;
  user: { id: string; email: string | null; verified: boolean } | null;
  profile: { display_name: string | null; role: string; is_restricted: boolean } | null;
  isAdmin: boolean;
  refresh: () => Promise<void>;
};

const Ctx = createContext<Viewer>({ loading: true, user: null, profile: null, isAdmin: false, refresh: async () => {} });

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<Viewer, "refresh">>({ loading: configured, user: null, profile: null, isAdmin: false });

  const load = useCallback(async () => {
    if (!configured) return setState({ loading: false, user: null, profile: null, isAdmin: false });
    const { data } = await sb().auth.getSession();
    const u = data.session?.user;
    if (!u) return setState({ loading: false, user: null, profile: null, isAdmin: false });
    const { data: profile } = await sb().from("profiles").select("display_name, role, is_restricted").eq("id", u.id).maybeSingle();
    setState({
      loading: false,
      user: { id: u.id, email: u.email ?? null, verified: Boolean(u.email_confirmed_at) },
      profile: profile ?? null,
      isAdmin: profile?.role === "admin",
    });
  }, []);

  useEffect(() => {
    load();
    if (!configured) return;
    const { data } = sb().auth.onAuthStateChange((evt) => {
      if (evt === "SIGNED_IN" || evt === "SIGNED_OUT" || evt === "USER_UPDATED") load();
    });
    return () => data.subscription.unsubscribe();
  }, [load]);

  return <Ctx.Provider value={{ ...state, refresh: load }}>{children}</Ctx.Provider>;
}

export const useViewer = () => useContext(Ctx);

export type Reason = "signin" | "verify" | "name" | "restricted" | "offline" | "loading";

export function participation(v: Viewer): { canVote: boolean; reason?: Reason } {
  if (!configured) return { canVote: false, reason: "offline" };
  if (v.loading) return { canVote: false, reason: "loading" };
  if (!v.user) return { canVote: false, reason: "signin" };
  if (!v.user.verified) return { canVote: false, reason: "verify" };
  if (!v.profile?.display_name) return { canVote: false, reason: "name" };
  if (v.profile.is_restricted) return { canVote: false, reason: "restricted" };
  return { canVote: true };
}
