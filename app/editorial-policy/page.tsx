import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";
import { getSettings } from "@/lib/data";
import { wilsonLower } from "@/lib/scoring";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: "How Rotten Critics separates satire from fact, sources its receipts, scores community votes and handles corrections.",
  alternates: { canonical: "/editorial-policy" },
};

export default async function EditorialPolicy() {
  const s = await getSettings();
  const ex1 = wilsonLower(2, 2);
  const ex2 = wilsonLower(180, 200);
  return (
    <ProsePage kicker="Standards" title="Editorial Policy" updated="November 2026"
      intro="Satire gets a long leash. Facts get a short one. Here's where we draw the line between them.">
      <h2>1. The inaugural order is opinion</h2>
      <p>
        The first Top 10 is a provisional editorial ranking: our subjective view of published work, in our order. It is not a
        statistical result, a survey, or a determination of anyone&rsquo;s professional competence. We label it as editorial
        wherever it appears, and we keep the original editorial rank on file separately from the community rank.
      </p>

      <h2>2. Satire versus fact</h2>
      <p>Everything on a critic&rsquo;s page falls into one of three categories, and we keep them visibly apart:</p>
      <ul>
        <li><strong>The Roast</strong> is satire and opinion. Exaggeration is the point. It must be about published professional work and must not imply undisclosed facts.</li>
        <li><strong>The Receipts</strong> are factual. Each one names a specific published review, column or public statement, links to it, and gives a date where known. Context, including the critic&rsquo;s own response, is included where relevant.</li>
        <li><strong>Profile facts</strong> (city, publication, background) are shown only after an editor has verified them against the public record. Until then the page says &ldquo;to be verified&rdquo;.</li>
      </ul>

      <h2>3. What we won&rsquo;t publish</h2>
      <ul>
        <li>Invented quotations, controversies, biographical details or allegations.</li>
        <li>Anything about private life: health, family, relationships, home, finances, appearance or protected characteristics.</li>
        <li>Fabricated votes, comments, engagement figures, testimonials or star ratings, in the page or in structured data.</li>
      </ul>

      <h2>4. Sourcing</h2>
      <p>
        A receipt can&rsquo;t be published without a working link to the original and an editor&rsquo;s verification stamp.
        The database enforces this; it isn&rsquo;t just a promise. Paywalled sources are allowed if they&rsquo;re the original.
        Unverified items stay unpublished.
      </p>

      <h2 id="scoring">5. How community scoring works</h2>
      <p>
        Verified account holders can cast one active vote per critic: <strong>Rotten</strong> or <strong>Not Rotten</strong>.
        Votes can be changed or withdrawn. Totals are public; individual votes never are.
      </p>
      <p>
        A raw percentage rewards tiny samples: two Rotten votes would make 100%. So we rank by the lower bound of the
        <strong> Wilson score interval</strong> (95% confidence) on each critic&rsquo;s Rotten share. It asks: given these votes,
        what&rsquo;s the lowest Rotten share we can be reasonably confident in? Small samples get pulled toward caution.
      </p>
      <p>
        Example: 2 of 2 votes Rotten scores <strong>{ex1.toFixed(3)}</strong>. 180 of 200 scores <strong>{ex2.toFixed(3)}</strong>.
        The second critic ranks higher, as they should.
      </p>
      <p>
        A critic needs at least <strong>{s.min_votes} votes</strong> to be eligible for the community ranking. The community
        Top {s.community_size} replaces the editorial order automatically once {s.community_size} critics are eligible. Until
        then the editorial order is shown, clearly labelled. Votes from accounts restricted for abuse are excluded from all totals.
      </p>

      <h2>6. Corrections</h2>
      <p>
        Report errors through the <Link href="/contact/?kind=correction">corrections desk</Link>. We correct factual errors
        promptly and note the change on the page. Opinion isn&rsquo;t an error, but a correction to a fact the opinion rests on
        may change the opinion, and we&rsquo;ll rewrite accordingly.
      </p>

      <h2>7. Right of reply</h2>
      <p>
        Any featured critic may submit a response. After we confirm identity, it runs in full on their page, visually distinct
        from reader comments. We don&rsquo;t edit replies for substance.
      </p>

      <h2>8. Nominations</h2>
      <p>
        Nominated critics are never published automatically. An editor must confirm a genuine public record of restaurant
        criticism before a profile is created. Nominators stay private.
      </p>

    </ProsePage>
  );
}
