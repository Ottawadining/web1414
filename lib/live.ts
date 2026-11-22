"use client";

import { useCallback, useEffect, useState } from "react";
import { configured, sb } from "./supabase/client";
import { toScoreMap, DEFAULT_SETTINGS } from "./ranking";
import type { Score } from "./scoring";
import type { Critic, PublicComment, Receipt, Settings } from "./types";

/** Fetch-on-mount helper that keeps the build-time value until fresh data arrives. */
function useLive<T>(initial: T, fetcher: () => Promise<T | null>, deps: unknown[] = []) {
  const [data, setData] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const reload = useCallback(async () => {
    if (!configured) return;
    const fresh = await fetcher();
    if (fresh !== null) setData(fresh);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { reload(); }, [reload]);
  return { data, loaded, reload, setData };
}

export function useCritics(initial: Critic[]) {
  return useLive(initial, async () => {
    const { data, error } = await sb().from("critics").select("*").eq("status", "published").order("name");
    return error ? null : (data as Critic[]);
  });
}

export function useCritic(slug: string, initial: Critic | null) {
  return useLive<Critic | null>(initial, async () => {
    const { data } = await sb().from("critics").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
    return (data as Critic) ?? null;
  }, [slug]);
}

export function useScores() {
  return useLive<Map<string, Score>>(new Map(), async () => {
    const { data, error } = await sb().rpc("critic_scores");
    return error ? null : toScoreMap(data);
  });
}

export function useSettings(initial: Settings = DEFAULT_SETTINGS) {
  return useLive(initial, async () => {
    const { data } = await sb().from("settings").select("min_votes, community_size, force_editorial").eq("id", 1).maybeSingle();
    return data ?? null;
  });
}

export function useMyVotes(userId: string | undefined) {
  return useLive<Map<string, "rotten" | "not_rotten">>(new Map(), async () => {
    const map = new Map<string, "rotten" | "not_rotten">();
    if (!userId) return map;
    const { data } = await sb().from("votes").select("critic_id, value").eq("user_id", userId);
    for (const v of data ?? []) map.set(v.critic_id, v.value);
    return map;
  }, [userId]);
}

export function useReceipts(criticId: string | undefined, initial: Receipt[]) {
  return useLive(initial, async () => {
    if (!criticId) return null;
    const { data } = await sb().from("receipts").select("*").eq("critic_id", criticId).eq("status", "published").order("sort_order");
    return (data ?? []) as Receipt[];
  }, [criticId]);
}

export type Reply = { id: string; author_name: string; author_title: string | null; body: string; published_at: string | null };
export function useReplies(criticId: string | undefined, initial: Reply[]) {
  return useLive(initial, async () => {
    if (!criticId) return null;
    const { data } = await sb().from("critic_responses").select("id, author_name, author_title, body, published_at")
      .eq("critic_id", criticId).eq("status", "published").order("published_at", { ascending: false });
    return (data ?? []) as Reply[];
  }, [criticId]);
}

export function useComments(criticId: string | undefined, userId: string | undefined) {
  return useLive<{ published: PublicComment[]; pending: { id: string; body: string; created_at: string }[] }>(
    { published: [], pending: [] },
    async () => {
      if (!criticId || criticId.startsWith("preview-")) return null;
      const [pub, mine] = await Promise.all([
        sb().rpc("public_comments", { p_critic: criticId }),
        userId
          ? sb().from("comments").select("id, body, created_at").eq("critic_id", criticId).eq("user_id", userId).eq("status", "pending").order("created_at")
          : Promise.resolve({ data: [] }),
      ]);
      return { published: (pub.data ?? []) as PublicComment[], pending: (mine.data ?? []) as { id: string; body: string; created_at: string }[] };
    },
    [criticId, userId],
  );
}
