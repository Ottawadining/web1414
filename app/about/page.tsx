import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = {
  title: "About",
  description: "Why Rotten Critics exists: a satirical Canadian publication that reviews the people who review restaurants.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <ProsePage
      kicker="About"
      title={<>The critics are <span className="italic text-tomato">on the menu</span></>}
      intro="For decades, critics have reviewed restaurants, judged chefs, handed out stars and moved reservations books. Nobody reviewed them back. Until now."
    >
      <h2>The premise</h2>
      <p>
        A restaurant review is a public act with real consequences. One column can fill a dining room for a year or empty it
        by the weekend. Line cooks lose shifts over adjectives. Owners refresh a newspaper site at 6 a.m. the way other people
        check biopsy results.
      </p>
      <p>
        Critics will tell you that&rsquo;s the job, and they&rsquo;re right. Judging public work in public is fair game. So is
        judging the judges. Rotten Critics applies the critic&rsquo;s own method to the critic: read the published work, form
        an opinion, and say it with style.
      </p>

      <h2>What this is</h2>
      <ul>
        <li><strong>Satire and opinion</strong> about published professional work: reviews, columns, rankings, public statements.</li>
        <li><strong>An editorial Top 10</strong> that is openly subjective, and a <strong>community ranking</strong> that replaces it once enough people have voted.</li>
        <li><strong>Receipts</strong>: sourced, dated links to the published originals our opinions are about.</li>
        <li><strong>A right of reply</strong> for every critic we feature, published in full on their own page.</li>
      </ul>

      <h2>What this isn&rsquo;t</h2>
      <p>
        It isn&rsquo;t a finding of fact about anyone&rsquo;s competence, character or private life. We don&rsquo;t publish
        rumours, home addresses, family details, or anything that didn&rsquo;t appear in print or on air under the
        critic&rsquo;s own byline. If a joke needs an invented fact to land, it doesn&rsquo;t run.
      </p>
      <p>
        It also isn&rsquo;t a grudge list. Some of the people here are very good at their jobs, and being good at a job has never
        protected anyone from a roast. Ask any chef.
      </p>

      <h2>Join in</h2>
      <p>
        <Link href="/">Vote</Link> on the critics. <Link href="/nominate/">Nominate</Link> one we missed.
        Argue in the comments. And if you think we&rsquo;ve got something wrong, <Link href="/contact/">tell the corrections desk</Link>.
        It&rsquo;s the only kitchen in the country that actually wants the complaint.
      </p>
    </ProsePage>
  );
}
