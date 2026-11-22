import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Rotten Critics collects, uses and protects personal information.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <ProsePage kicker="Legal" title="Privacy Policy" updated="November 2026"
      intro="We collect as little as we can, keep it as briefly as we can, and never sell it. Here's exactly what that means.">
      <h2>What we collect</h2>
      <ul>
        <li><strong>Your Google sign-in details.</strong> When you sign in with Google, we receive your email address, name and profile picture from Google. We use them only to identify your account and never display them.</li>
        <li><strong>Display name</strong>, which you choose. Shown publicly next to your comments.</li>
        <li><strong>Votes</strong>. Stored against your account so you can change them, used only in aggregate. Nobody else can see how you voted, and we never publish voting identities.</li>
        <li><strong>A vote activity log</strong> (which critic, when, what changed), visible only to administrators, used to detect abuse.</li>
        <li><strong>Comments, reports and nominations</strong> you submit.</li>
        <li><strong>Contact messages</strong>, including your name and email, so we can reply and verify identity for right-of-reply submissions.</li>
        <li><strong>A one-way hash of your IP address</strong>, salted, used only to rate-limit forms. We don&rsquo;t store raw IP addresses in our database.</li>
        <li><strong>Aggregate page counts</strong>: page path and date only. No cookies, no profiles, no third-party trackers.</li>
      </ul>

      <h2>Cookies</h2>
      <p>If you sign in, your browser stores a session token so you stay signed in. We use no advertising or analytics cookies.</p>

      <h2>Who processes it</h2>
      <p>
        Data is stored with Supabase (database and authentication). The site's pages are served by GitHub Pages. Both may
        process data outside Canada, including in the United States. We use them only to run the site.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Account data: until you ask us to delete your account.</li>
        <li>Rate-limit counters: about two days.</li>
        <li>Contact messages and moderation records: as long as needed to handle the matter and keep an accurate record of corrections and moderation.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        Under Canadian privacy law (including PIPEDA) you can ask to access, correct or delete your personal information, or
        withdraw consent. Write to {SITE.email} or use the <Link href="/contact/?kind=general">contact form</Link>. Deleting your
        account removes your votes and comments.
      </p>

      <h2>People we write about</h2>
      <p>
        Critic profiles contain only information drawn from their published professional work and verified public record. Featured
        critics can request corrections or submit a reply at any time through the <Link href="/contact/?kind=reply">corrections desk</Link>.
      </p>
    </ProsePage>
  );
}
