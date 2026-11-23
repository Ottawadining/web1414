"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { computeRanking } from "@/lib/ranking";
import { useCritics, useScores, useSettings } from "@/lib/live";
import { pct } from "@/lib/scoring";
import type { Critic, Settings } from "@/lib/types";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function Directory({ initialCritics, initialSettings }: { initialCritics: Critic[]; initialSettings: Settings }) {
  const critics = useCritics(initialCritics);
  const scores = useScores();
  const settings = useSettings(initialSettings);
  const [q, setQ] = useState("");
  useEffect(() => { setQ(new URLSearchParams(window.location.search).get("q") ?? ""); }, []);

  const ranking = computeRanking(critics.data, scores.data, settings.data);
  const rankMode = ranking.mode;
  const inTen = new Map(ranking.entries.map((e) => [e.id, e.position]));
  const needle = norm(q.trim());
  const list = critics.data
    .filter((c) => !needle || norm([c.name, c.nickname, c.city, c.publication].filter(Boolean).join(" ")).includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name, "en-CA"));

  return (
    <>
      <form role="search" className="mt-10 flex gap-2 max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="q" className="sr-only">Search critics</label>
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, nickname, city or publication" className="field" />
      </form>
      <div className="mt-12 border-t border-ink">
        {list.length === 0 ? (
          <p className="py-12 placeholder-note text-xl">Nobody by that description. <Link href="/nominate/" className="underline not-italic">Nominate them?</Link></p>
        ) : (
          <ul>
            {list.map((c) => {
              const s = scores.data.get(c.id);
              const pos = inTen.get(c.id);
              return (
                <li key={c.id} className="border-b border-rule">
                  <Link href={`/critics/${c.slug}/`} className="group grid grid-cols-[1fr_auto] md:grid-cols-[3.5rem_1.4fr_1fr_8rem] gap-x-6 gap-y-1 py-6 items-baseline hover:bg-sheet transition-colors px-1">
                    <span className="hidden md:block numeral text-3xl text-tomato">{pos ?? ""}</span>
                    <span>
                      <span className="block text-2xl md:text-3xl font-serif group-hover:text-tomato transition-colors">{c.name}</span>
                      {c.nickname && <span className="block mt-1 font-serif italic text-muted">{c.nickname}</span>}
                    </span>
                    <span className="hidden md:block text-sm text-muted">{[c.publication, c.city].filter(Boolean).join(" · ") || "—"}</span>
                    <span className="text-right font-serif text-xl tabular-nums">
                      {s && s.total > 0 ? <>{pct(s.rotten_pct)}<span className="block text-xs font-sans text-muted">{s.total} votes</span></> : <span className="text-sm italic text-muted">Unscored</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="mt-6 text-sm text-muted">{list.length} critic{list.length === 1 ? "" : "s"}. Numbers in red show the current Top 10 position{rankMode === "community" ? " (community vote)" : " (editorial ranking)"}.</p>
    </>
  );
}
