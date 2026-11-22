"use client";

import Link from "next/link";
import { Portrait } from "./Portrait";
import { VoteControls } from "./VoteControls";
import { computeRanking } from "@/lib/ranking";
import { useCritics, useMyVotes, useScores, useSettings } from "@/lib/live";
import { participation, useViewer } from "@/lib/viewer";
import { pct } from "@/lib/scoring";
import type { Critic, Settings } from "@/lib/types";

/** The Ten. Renders the build-time order instantly, then goes live. */
export function HomeRanking({ initialCritics, initialSettings }: { initialCritics: Critic[]; initialSettings: Settings }) {
  const viewer = useViewer();
  const p = participation(viewer);
  const critics = useCritics(initialCritics);
  const scores = useScores();
  const settingsQ = useSettings(initialSettings);
  const myVotes = useMyVotes(viewer.user?.id);
  const { mode, entries, settings } = computeRanking(critics.data, scores.data, settingsQ.data);

  return (
    <>
      {/* ---------------------------------------------------------------- ranking */}
      <section id="ranking" className="wrap pt-20 md:pt-28 scroll-mt-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            {mode === "community" && <p className="kicker">The community verdict</p>}
            <h2 className="mt-3 text-5xl md:text-7xl" style={{ fontVariationSettings: '"opsz" 96' }}>The Ten</h2>
          </div>
          {mode === "community" && (
            <div className="md:max-w-sm md:text-right text-sm text-muted leading-relaxed">
              <span className="inline-block mb-2 px-2 py-1 bg-tomato text-sheet text-[0.625rem] tracking-[0.2em] uppercase font-semibold">Community · Live</span>
              <p>
                Ranked by the lower bound of the Wilson score interval on each critic&rsquo;s Rotten share, among critics with at
                least {settings.min_votes} votes. <Link href="/editorial-policy/#scoring" className="underline">How scoring works</Link>.
              </p>
            </div>
          )}
        </div>

        <ol className="mt-12 border-t border-ink">
          {entries.map((c, i) => {
            const top = c.position === 1;
            return (
              <li key={c.id} className="group border-b border-rule animate-rise" style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}>
                <article className={`grid gap-x-6 md:gap-x-10 gap-y-5 py-10 md:py-14 grid-cols-[auto_1fr] md:grid-cols-[9rem_auto_1fr_15rem] items-start`}>
                  <div className={`numeral ${top ? "text-tomato" : "text-ink"} text-[5.5rem] md:text-[9rem] w-[4.2rem] md:w-auto`} aria-label={`Rank ${c.position}`}>
                    {c.position}
                  </div>
                  <div className="hidden md:block">
                    <Link href={`/critics/${c.slug}/`} tabIndex={-1} aria-hidden="true">
                      <Portrait critic={c} size="md" />
                    </Link>
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif italic text-tomato text-lg md:text-xl leading-snug">{c.nickname}</p>
                    <h3 className={`mt-1 leading-[1.02] ${top ? "text-4xl md:text-6xl" : "text-3xl md:text-5xl"}`}>
                      <Link href={`/critics/${c.slug}/`} className="link-under hover:text-ink">{c.name}</Link>
                    </h3>
                    {(c.publication || c.city) && (
                      <p className="mt-2 kicker">{[c.publication, c.city].filter(Boolean).join(" · ")}</p>
                    )}
                    <p className="mt-4 max-w-xl text-ink-soft leading-relaxed">
                      {c.excerpt ?? <span className="placeholder-note">The roast is still resting. Copy to come.</span>}
                    </p>
                    <Link href={`/critics/${c.slug}/`} className="mt-5 inline-block text-[0.75rem] font-semibold tracking-[0.18em] uppercase hover:text-tomato">
                      Read the file →
                    </Link>
                  </div>
                  <div className="col-span-2 md:col-span-1 md:pt-2">
                    <div className="flex items-baseline justify-between border-b border-rule pb-2 mb-3">
                      <span className="kicker">Community</span>
                      <span className="font-serif text-xl tabular-nums">
                        {c.score.total > 0 ? <>{pct(c.score.rotten_pct)} <span className="text-sm text-muted font-sans">Rotten</span></> : <span className="text-muted text-base italic">Unscored</span>}
                      </span>
                    </div>
                    <VoteControls
                      criticId={c.id}
                      slug={c.slug}
                      initial={myVotes.data.get(c.id) ?? null}
                      counts={{ rotten: c.score.rotten, not_rotten: c.score.not_rotten }}
                      canVote={p.canVote}
                      reason={p.reason}
                      compact
                      onVoted={scores.reload}
                    />
                    {mode === "community" && c.editorial_rank && (
                      <p className="mt-1 text-xs text-muted">Editorial rank: {c.editorial_rank}</p>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <p className="text-muted text-sm">The list holds ten. The directory holds everyone we&rsquo;ve approved.</p>
          <Link href="/critics/" className="btn btn-ghost">All critics</Link>
        </div>
      </section>

    </>
  );
}
