import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/ContactForm";
import { getPublishedCritics } from "@/lib/data";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact, Corrections & Right of Reply",
  description: "Report a factual error, submit evidence, or respond to criticism published on Rotten Critics.",
  alternates: { canonical: "/contact" },
};


export default async function Contact() {
  const critics = await getPublishedCritics();

  return (
    <div className="wrap">
      <PageHeader
        kicker="The corrections desk"
        title={<>Contact, corrections &amp; <span className="italic">right of reply</span></>}
        intro="We'd rather be funny and right than funny and wrong. If we got a fact wrong, we'll fix it and say so. If you're a critic on this site, you get the last word on your own page."
      />
      <div className="grid md:grid-cols-[1fr_20rem] gap-14">
        <div className="max-w-2xl">
          <ContactForm critics={critics.map((c) => ({ id: c.id, slug: c.slug, name: c.name }))} />
        </div>
        <aside className="text-sm text-ink-soft leading-relaxed md:border-l md:border-rule md:pl-8 space-y-6">
          <div>
            <p className="kicker mb-2">Corrections</p>
            <p>Factual errors are corrected promptly, and the page notes what changed and when. Opinions are not errors, but we&rsquo;ll hear the argument.</p>
          </div>
          <div>
            <p className="kicker mb-2">Right of reply</p>
            <p>We confirm identity by email before publishing. Approved replies run in full on the critic&rsquo;s page, set apart from comments. We only edit for length beyond 1,000 words or for legal reasons, and we&rsquo;ll tell you if we do.</p>
          </div>
          <div>
            <p className="kicker mb-2">Email</p>
            <p>{SITE.email}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
