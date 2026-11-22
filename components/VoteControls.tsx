"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { castVote } from "@/lib/api";
import type { Reason } from "@/lib/viewer";

type V = "rotten" | "not_rotten" | null;

export function VoteControls({
  criticId, slug, initial, counts, canVote, reason, compact = false, onVoted,
}: {
  criticId: string;
  slug: string;
  initial: V;
  counts: { rotten: number; not_rotten: number };
  canVote: boolean;
  reason?: Reason;
  compact?: boolean;
  onVoted?: () => void;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [state, setState] = useState({ vote: initial, ...counts });

  // Server data (my vote, totals) arrives after mount; resync when it changes.
  useEffect(() => { setState({ vote: initial, rotten: counts.rotten, not_rotten: counts.not_rotten }); }, [initial, counts.rotten, counts.not_rotten]);

  function choose(v: Exclude<V, null>) {
    const next = state.vote === v ? null : v;
    const prev = state;
    const optimistic = { ...state };
    if (state.vote) optimistic[state.vote] -= 1;
    if (next) optimistic[next] += 1;
    setState({ ...optimistic, vote: next });
    start(async () => {
      const res = await castVote(criticId, next);
      if (res && !res.ok) { setState(prev); setMsg(res.message); } else { setMsg(null); onVoted?.(); }
    });
  }

  const total = state.rotten + state.not_rotten;
  const btn = (v: Exclude<V, null>, label: string) => {
    const active = state.vote === v;
    const tone = v === "rotten" ? "border-tomato text-tomato" : "border-ink text-ink";
    const on = v === "rotten" ? "bg-tomato text-sheet border-tomato" : "bg-ink text-sheet border-ink";
    return (
      <button
        type="button"
        onClick={() => choose(v)}
        disabled={pending || !canVote}
        aria-pressed={active}
        className={`flex-1 border px-3 ${compact ? "py-2" : "py-3"} text-[0.6875rem] font-semibold tracking-[0.18em] uppercase transition-colors disabled:cursor-not-allowed ${
          active ? on : `${tone} bg-transparent hover:bg-sheet`
        } ${!canVote ? "opacity-60" : ""}`}
      >
        <span className="block">{label}</span>
        <span className="block mt-1 normal-case tracking-normal text-sm font-medium tabular-nums">{state[v]}</span>
      </button>
    );
  };

  const hint: Record<Reason, React.ReactNode> = {
    signin: <><Link href={`/login/?next=/critics/${slug}/`} className="underline">Sign in</Link> to vote.</>,
    verify: <>Confirm your email to vote.</>,
    name: <><Link href="/account/" className="underline">Choose a display name</Link> to vote.</>,
    restricted: <>Voting is unavailable on this account.</>,
    offline: <>Voting opens when the database is connected.</>,
    loading: <>&nbsp;</>,
  };

  return (
    <div className="w-full">
      <div className="flex gap-2" role="group" aria-label="Your verdict">
        {btn("rotten", "Rotten")}
        {btn("not_rotten", "Not Rotten")}
      </div>
      <p className="mt-2 text-xs text-muted min-h-[1.2em]" aria-live="polite">
        {msg ? <span className="text-tomato">{msg}</span>
          : !canVote && reason ? hint[reason]
          : state.vote ? <>Your verdict is in. Tap it again to withdraw.</>
          : total === 0 ? <>No votes yet. Be the first to send it back.</>
          : null}
      </p>
    </div>
  );
}
