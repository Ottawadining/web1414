import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { HomeRanking } from "@/components/HomeRanking";
import { getPublishedCritics, getScores, getSettings } from "@/lib/data";
import { computeRanking } from "@/lib/ranking";
import { SITE, absoluteUrl } from "@/lib/site";

export default async function Home() {
  const [critics, scores, settings] = await Promise.all([getPublishedCritics(), getScores(), getSettings()]);
  const { mode, entries } = computeRanking(critics, scores, settings);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: SITE.headline,
    description: mode === "editorial" ? "A provisional, subjective editorial ranking." : "A community ranking based on public votes.",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: entries.map((c) => ({
      "@type": "ListItem",
      position: c.position,
      url: absoluteUrl(`/critics/${c.slug}`),
      name: c.name,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ---------------------------------------------------------------- hero */}
      <section className="wrap pt-14 md:pt-24 pb-16 md:pb-24">
        <p className="kicker animate-rise">Vol. 01 · The Inaugural List</p>
        <div className="mt-6 md:mt-8 animate-rise [animation-delay:80ms] overflow-hidden">
          <Wordmark size="xl" asLink={false} />
        </div>
        <div className="rule-double mt-8 md:mt-12" />
        <div className="mt-8 md:mt-12 grid gap-10 md:grid-cols-[1.3fr_1fr] md:gap-16 items-end">
          <div className="animate-rise [animation-delay:160ms]">
            <h1 className="text-[2.4rem] leading-[1.02] sm:text-6xl md:text-[5.2rem] md:leading-[0.98]" style={{ fontVariationSettings: '"opsz" 96' }}>
              Canada&rsquo;s <span className="italic text-tomato">10 Worst</span> Food Critics
            </h1>
            <p className="mt-6 font-serif italic text-2xl md:text-3xl text-ink-soft">&ldquo;For once, the critics are on the menu.&rdquo;</p>
          </div>
          <div className="animate-rise [animation-delay:240ms] md:pb-3">
            <p className="text-lg md:text-xl leading-relaxed text-ink-soft">
              They&rsquo;ve spent years judging restaurants. Now it&rsquo;s their turn. Welcome to Rotten Critics, where
              Canada&rsquo;s food critics get a taste of their own medicine.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#ranking" className="btn">Read the list</a>
              <Link href="/nominate/" className="btn btn-ghost">Nominate a critic</Link>
            </div>
          </div>
        </div>
      </section>

      <HomeRanking initialCritics={critics} initialSettings={settings} />

      {/* ---------------------------------------------------------------- closers */}
      <section className="wrap mt-28"><div className="grid md:grid-cols-2 gap-px bg-rule border border-rule">
        <div className="bg-paper p-8 md:p-12">
          <p className="kicker">Nominations</p>
          <h2 className="mt-3 text-3xl md:text-4xl leading-tight">Someone missing from the pass?</h2>
          <p className="mt-4 text-ink-soft leading-relaxed">
            Nominate a Canadian restaurant critic with a public body of work. Send us a published review, not a grudge. Every
            nomination is checked before anyone gets a table.
          </p>
          <Link href="/nominate/" className="mt-8 btn">Nominate a critic</Link>
        </div>
        <div className="bg-ink text-sheet p-8 md:p-12">
          <p className="kicker !text-sheet/60">Right of reply</p>
          <h2 className="mt-3 text-3xl md:text-4xl leading-tight">Are you on this list?</h2>
          <p className="mt-4 text-sheet/75 leading-relaxed">
            Critics get the last word on their own page. Send a response, and once we&rsquo;ve confirmed it&rsquo;s you, it runs
            in full, unedited for substance, set apart from the comments.
          </p>
          <Link href="/contact/?kind=reply" className="mt-8 btn !bg-sheet !text-ink !border-sheet hover:!bg-tomato hover:!text-sheet hover:!border-tomato">
            Submit a response
          </Link>
        </div>
      </div></section>
    </>
  );
}
