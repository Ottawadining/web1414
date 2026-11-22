"use client";

import Link from "next/link";
import { Portrait } from "./Portrait";
import { VoteControls } from "./VoteControls";
import { Comments } from "./Comments";
import { useCritic, useMyVotes, useReceipts, useReplies, useScores, useSettings, type Reply } from "@/lib/live";
import { participation, useViewer } from "@/lib/viewer";
import { computeRanking } from "@/lib/ranking";
import { emptyScore, pct } from "@/lib/scoring";
import { configured, sb } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Critic, Receipt, Settings } from "@/lib/types";

function Section({ id, letter, title, children, dark = false }: { id: string; letter: string; title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <section id={id} className={`scroll-mt-6 ${dark ? "bg-ink text-sheet" : ""}`}>
      <div className="wrap py-16 md:py-20 grid md:grid-cols-[14rem_1fr] gap-6 md:gap-12">
        <div>
          <span className={`font-serif italic text-2xl ${dark ? "text-sheet/50" : "text-tomato"}`}>{letter}</span>
          <h2 className="mt-1 text-3xl md:text-4xl leading-tight">{title}</h2>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

/**
 * A critic's file. Rendered at build time with `initial` for SEO, then
 * refreshed live. With no `initial` (a critic added since the last build,
 * served via the 404 fallback) it loads entirely in the browser.
 */
export function CriticView({ slug, initial, initialReceipts = [], initialReplies = [], initialSettings }: {
  slug: string; initial: Critic | null; initialReceipts?: Receipt[]; initialReplies?: Reply[]; initialSettings?: Settings;
}) {
  const viewer = useViewer();
  const p = participation(viewer);
  const criticQ = useCritic(slug, initial);
  const critic = criticQ.data;
  const receiptsQ = useReceipts(critic?.id, initialReceipts);
  const repliesQ = useReplies(critic?.id, initialReplies);
  const scoresQ = useScores();
  const settingsQ = useSettings(initialSettings);
  const myVotes = useMyVotes(viewer.user?.id);
  const [allCritics, setAllCritics] = useState<Critic[]>([]);
  useEffect(() => {
    if (!configured) return;
    sb().from("critics").select("*").eq("status", "published").then(({ data }) => setAllCritics((data ?? []) as Critic[]));
  }, []);

  if (!critic) {
    if (!configured || criticQ.loaded) {
      return (
        <div className="wrap py-28 text-center">
          <p className="numeral text-[9rem] text-tomato">86</p>
          <h1 className="mt-6 text-4xl md:text-5xl">No critic by that name.</h1>
          <p className="mt-4 text-muted">They may have been removed, or never had a table here.</p>
          <Link href="/critics/" className="mt-10 btn">All critics</Link>
        </div>
      );
    }
    return <div className="wrap py-28 text-center placeholder-note text-2xl">Fetching the file…</div>;
  }

  const receipts = receiptsQ.data;
  const responses = repliesQ.data;
  const settings = settingsQ.data;
  const score = scoresQ.data.get(critic.id) ?? emptyScore(critic.id);
  const myVote = myVotes.data.get(critic.id) ?? null;
  const ranking = computeRanking(allCritics, scoresQ.data, settings);
  const inTen = ranking.entries.find((e) => e.id === critic.id);
  const toGo = Math.max(0, settings.min_votes - score.total);

  return (
    <article>

      {/* ------------------------------------------------ A. profile */}
      <header className="wrap pt-10 md:pt-16 pb-16">
        <nav aria-label="Breadcrumb" className="kicker flex gap-2">
          <Link href="/" className="hover:text-ink">Rotten Critics</Link><span>/</span>
          <Link href="/critics/" className="hover:text-ink">Critics</Link><span>/</span>
          <span className="text-ink truncate">{critic.name}</span>
        </nav>
        <div className="mt-10 grid md:grid-cols-[minmax(0,22rem)_1fr] gap-10 md:gap-16 items-end">
          <div className="max-w-[16rem] md:max-w-none animate-rise">
            <Portrait critic={critic} size="lg" caption />
          </div>
          <div className="animate-rise [animation-delay:100ms]">
            {critic.nickname && <p className="font-serif italic text-tomato text-2xl md:text-3xl leading-snug">&ldquo;{critic.nickname}&rdquo;</p>}
            <h1 className="mt-2 text-5xl sm:text-6xl md:text-[5.5rem] leading-[0.95]" style={{ fontVariationSettings: '"opsz" 96' }}>{critic.name}</h1>
            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 max-w-lg border-t border-rule pt-5 text-sm">
              <div><dt className="kicker">City</dt><dd className="mt-1">{critic.city ?? <span className="placeholder-note">To be verified</span>}</dd></div>
              <div><dt className="kicker">Publication</dt><dd className="mt-1">{critic.publication ?? <span className="placeholder-note">To be verified</span>}</dd></div>
            </dl>
            <div className="mt-6 max-w-xl text-ink-soft leading-relaxed">
              {critic.bio_verified && critic.background ? (
                <p>{critic.background}</p>
              ) : (
                <p className="placeholder-note">Professional background pending verification. We publish only what can be confirmed from the public record.</p>
              )}
            </div>
            <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.6875rem] font-semibold tracking-[0.16em] uppercase">
              <a href="#roast" className="hover:text-tomato">The Roast</a>
              <a href="#receipts" className="hover:text-tomato">Receipts</a>
              <a href="#verdict" className="hover:text-tomato">Verdict</a>
              <a href="#reply" className="hover:text-tomato">Right of Reply</a>
              <a href="#comments" className="hover:text-tomato">Dining Room</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="rule-double" />

      {/* ------------------------------------------------ B. roast */}
      <Section id="roast" letter="B." title="The Roast">
        {critic.roast ? (
          <div className="max-w-2xl">
            {critic.roast.split(/\n{2,}/).map((para, i) => (
              <p key={i} className={`font-serif text-2xl md:text-[1.75rem] leading-[1.45] text-ink ${i === 0 ? "first-letter:float-left first-letter:text-[4.6rem] first-letter:leading-[0.8] first-letter:mr-2 first-letter:mt-1 first-letter:text-tomato" : "mt-6"}`}>
                {para}
              </p>
            ))}
            <p className="mt-8 text-xs text-muted tracking-wide">Satire and opinion about published professional work. See our <Link href="/editorial-policy/" className="underline">editorial policy</Link>.</p>
          </div>
        ) : (
          <div className="max-w-2xl border border-dashed border-rule p-8 md:p-10">
            <p className="font-serif italic text-2xl md:text-3xl text-ink-soft leading-snug">The roast is resting.</p>
            <p className="mt-4 text-muted leading-relaxed">
              This critique is being written and fact-checked. It will run here: 100 to 150 words on the published work, nothing
              about the private person.
            </p>
          </div>
        )}
      </Section>

      <div className="wrap"><div className="rule" /></div>

      {/* ------------------------------------------------ C. receipts */}
      <Section id="receipts" letter="C." title="The Receipts">
        {receipts.length === 0 ? (
          <div className="max-w-2xl">
            <p className="placeholder-note text-xl">No receipts published yet.</p>
            <p className="mt-3 text-muted leading-relaxed">
              Every receipt links to a published original, with a date and context. Anything we can&rsquo;t source stays in the drawer.
              Know of a review, column or public statement that belongs here, for or against?{" "}
              <Link href={`/contact/?kind=evidence&critic=${critic.slug}`} className="underline text-ink">Send it to us</Link>.
            </p>
          </div>
        ) : (
          <ol className="max-w-3xl border-t border-ink">
            {receipts.map((r, i) => (
              <li key={r.id} className="py-8 border-b border-rule grid grid-cols-[2.5rem_1fr] gap-4">
                <span className="font-serif italic text-tomato text-xl">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-2xl leading-snug">{r.headline}</h3>
                  {r.published_on && (
                    <p className="mt-1 kicker">
                      {new Date(r.published_on + "T12:00:00").toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                      {r.source_title && <> · {r.source_title}</>}
                    </p>
                  )}
                  <p className="mt-3 text-ink-soft leading-relaxed whitespace-pre-line">{r.explanation}</p>
                  {r.context && (
                    <p className="mt-3 text-sm text-muted leading-relaxed border-l-2 border-rule pl-4"><span className="font-semibold text-ink">Context: </span>{r.context}</p>
                  )}
                  {r.source_url && (
                    <a href={r.source_url} target="_blank" rel="noopener noreferrer nofollow" className="mt-4 inline-block text-[0.75rem] font-semibold tracking-[0.16em] uppercase text-tomato hover:underline">
                      Read the original ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* ------------------------------------------------ D. verdict */}
      <section id="verdict" className="bg-sheet border-y border-rule scroll-mt-6">
        <div className="wrap py-16 md:py-20 grid md:grid-cols-[14rem_1fr] gap-6 md:gap-12">
          <div>
            <span className="font-serif italic text-2xl text-tomato">D.</span>
            <h2 className="mt-1 text-3xl md:text-4xl leading-tight">The Verdict</h2>
            <p className="mt-3 text-sm text-muted">One active vote per verified account. Change it or withdraw it any time. Votes are never shown with names.</p>
          </div>
          <div className="grid lg:grid-cols-[1fr_20rem] gap-10 items-start">
            <div>
              <div className="flex items-end gap-4">
                {score.total > 0 ? (<><span className="numeral text-[6rem] md:text-[8rem] text-tomato">{pct(score.rotten_pct)}</span><span className="pb-3 kicker">Rotten</span></>) : (<span className="font-serif italic text-5xl md:text-6xl text-muted">Unscored</span>)}
              </div>
              <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule border border-rule text-sm">
                {[
                  ["Rotten", score.rotten],
                  ["Not Rotten", score.not_rotten],
                  ["Total votes", score.total],
                  ["Wilson score", score.total > 0 ? score.wilson.toFixed(3) : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-paper p-4">
                    <dt className="kicker">{k}</dt>
                    <dd className="mt-1 font-serif text-2xl tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm text-muted leading-relaxed">
                {score.eligible
                  ? <>Eligible for the community ranking{score.community_rank ? <> (currently No. {score.community_rank})</> : null}.</>
                  : <>{toGo} more vote{toGo === 1 ? "" : "s"} needed before this critic is eligible for the community ranking (threshold: {settings.min_votes}).</>}{" "}
                <Link href="/editorial-policy/#scoring" className="underline">How the score works</Link>.
              </p>
            </div>
            <div className="lg:pt-6">
              <p className="kicker mb-3">Your verdict</p>
              <VoteControls
                criticId={critic.id}
                slug={critic.slug}
                initial={myVote}
                counts={{ rotten: score.rotten, not_rotten: score.not_rotten }}
                canVote={p.canVote}
                reason={p.reason}
                onVoted={scoresQ.reload}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ F. right of reply */}
      <Section id="reply" letter="E." title="Right of Reply" dark>
        {responses.length === 0 ? (
          <div className="max-w-2xl">
            <p className="font-serif italic text-2xl text-sheet/85">{critic.name.split(" ")[0]} hasn&rsquo;t replied. Yet.</p>
            <p className="mt-4 text-sheet/65 leading-relaxed">
              If you are {critic.name}, this space is yours. Send a response through our corrections desk. Once we&rsquo;ve
              confirmed it&rsquo;s you, it runs here in full, set apart from the comments.
            </p>
            <Link href={`/contact/?kind=reply&critic=${critic.slug}`} className="mt-6 btn !bg-sheet !text-ink !border-sheet hover:!bg-tomato hover:!text-sheet hover:!border-tomato">Submit a response</Link>
          </div>
        ) : (
          <div className="max-w-2xl space-y-12">
            {responses.map((r) => (
              <blockquote key={r.id} className="m-0">
                <p className="kicker !text-tomato-wash">Verified response from the critic</p>
                <div className="mt-4 font-serif text-xl md:text-2xl leading-relaxed text-sheet whitespace-pre-line">{r.body}</div>
                <footer className="mt-5 text-sm text-sheet/70">
                  — {r.author_name}{r.author_title ? `, ${r.author_title}` : ""}
                  {r.published_at && <> · {new Date(r.published_at).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</>}
                </footer>
              </blockquote>
            ))}
          </div>
        )}
      </Section>

      {/* ------------------------------------------------ G. comments */}
      <Section id="comments" letter="F." title="The Dining Room">
        <div className="max-w-2xl">
          <p className="text-muted mb-8 leading-relaxed">
            Argue with the reviews, defend them, or tell us we&rsquo;ve got it wrong. Keep it to the published work.
            Every comment is read by an editor before it appears.
          </p>
          <Comments criticId={critic.id} slug={critic.slug} />
        </div>
      </Section>
    </article>
  );
}
