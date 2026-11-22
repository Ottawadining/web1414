import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/Prose";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms for using Rotten Critics and posting content.", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <ProsePage kicker="Legal" title="Terms of Use" updated="November 2026"
      intro="The short version: it's satire, play nicely, and what you post is your responsibility.">
      <h2>1. Satire and opinion</h2>
      <p>
        Rotten Critics publishes satire and opinion about the published professional work of public restaurant critics. Rankings,
        nicknames and roasts are expressions of opinion, not statements of fact. Factual claims are limited to sourced receipts
        and verified profile details, as described in our <Link href="/editorial-policy/">editorial policy</Link>.
      </p>

      <h2>2. Accounts</h2>
      <p>You need to sign in with a Google account to vote, comment, report or nominate. One person, one account. Using multiple accounts, scripts or coordinated campaigns to influence votes is prohibited and may lead to restriction, with affected votes excluded.</p>

      <h2>3. Your content</h2>
      <p>
        You keep ownership of what you post. You grant Rotten Critics a non-exclusive, royalty-free, worldwide licence to host,
        display, moderate and remove it on this site. You confirm you have the right to post it and that it follows our{" "}
        <Link href="/community-guidelines/">community guidelines</Link>. You are responsible for your own comments.
      </p>

      <h2>4. Moderation</h2>
      <p>We may approve, decline, edit for legal reasons, or remove any user content, and restrict any account, at our discretion. Moderation actions are logged.</p>

      <h2>5. Corrections and complaints</h2>
      <p>If you believe something on the site is factually inaccurate or unlawful, contact the <Link href="/contact/">corrections desk</Link>. We review every notice.</p>

      <h2>6. No warranty</h2>
      <p>The site is provided as is. Community scores reflect the votes of site users only and are not a scientific measure of anything.</p>

      <h2>7. Governing law</h2>
      <p>These terms are governed by the laws of Ontario and the federal laws of Canada applicable there.</p>
    </ProsePage>
  );
}
