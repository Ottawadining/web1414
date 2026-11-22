import type { Metadata } from "next";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: "What you can and can't say in the Rotten Critics comments.",
  alternates: { canonical: "/community-guidelines" },
};

export default function Guidelines() {
  return (
    <ProsePage kicker="House rules" title="Community Guidelines" updated="November 2026"
      intro="Be lively. Be funny. Be opinionated. Be the person at the bar after service, not the person who keys a car in the parking lot.">
      <h2>Fair game</h2>
      <ul>
        <li>Published reviews, columns, rankings and broadcasts.</li>
        <li>Editorial judgments: what they praised, what they panned, what they missed.</li>
        <li>Professional qualifications and expertise, as shown in the work.</li>
        <li>Public statements made in a professional capacity.</li>
        <li>Disagreeing with us. Defending the critic. Telling us our roast is lazy.</li>
      </ul>

      <h2>Off the menu</h2>
      <ul>
        <li><strong>Threats</strong>, intimidation, or wishing harm on anyone.</li>
        <li><strong>Doxxing</strong>: addresses, phone numbers, workplaces beyond the byline, family members, photos of private life.</li>
        <li><strong>Discriminatory abuse</strong> based on race, ethnicity, religion, gender, sexual orientation, disability, age or any protected characteristic.</li>
        <li><strong>Invented allegations</strong>: claims of misconduct you can&rsquo;t link to a public source.</li>
        <li><strong>Private life</strong>: health, relationships, appearance, personal finances.</li>
        <li>Impersonating a critic, a chef, a restaurant, or us.</li>
        <li>Spam, self-promotion and coordinated vote campaigns.</li>
      </ul>

      <h2>How moderation works</h2>
      <p>
        At launch, every comment is read by an editor before it appears. Anyone with a verified account can report a published
        comment. Reported comments are reviewed, and removed if they break these rules. Every moderation action is logged.
      </p>
      <p>
        Repeated or serious violations get an account restricted: no commenting, and its votes stop counting. We don&rsquo;t
        announce restrictions and we don&rsquo;t debate them in the comments.
      </p>

      <h2>A simple test</h2>
      <p>
        Would this comment still make sense if the critic had never published a word? If yes, it&rsquo;s about the person, not
        the work, and it doesn&rsquo;t belong here.
      </p>
    </ProsePage>
  );
}
