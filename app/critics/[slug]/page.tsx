import type { Metadata } from "next";
import { CriticView } from "@/components/CriticView";
import { getCritic, getPublishedCritics, getReceipts, getResponses, getSettings } from "@/lib/data";
import { SITE, absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// Every published critic at build time. Critics added later work immediately
// through the 404 fallback, and get their own static page on the next build.
export const dynamicParams = false;
export async function generateStaticParams() {
  const critics = await getPublishedCritics();
  return critics.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCritic(slug);
  if (!c) return { title: "Critic not found", robots: { index: false } };
  const title = `${c.name}${c.nickname ? ` — “${c.nickname}”` : ""}`;
  const description =
    c.excerpt ??
    `${c.name}${c.nickname ? `, “${c.nickname}”` : ""}, on Rotten Critics: a satirical file on a Canadian food critic's published work, with sourced receipts, community votes and a right of reply.`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/critics/${c.slug}`) },
    openGraph: { type: "profile", title: `${title} · ${SITE.name}`, description, url: absoluteUrl(`/critics/${c.slug}`), images: [{ url: `/og/${c.slug}.png`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description, images: [`/og/${c.slug}.png`] },
  };
}

export default async function CriticPage({ params }: Props) {
  const { slug } = await params;
  const critic = await getCritic(slug);
  const [receipts, replies, settings] = critic
    ? await Promise.all([getReceipts(critic.id), getResponses(critic.id), getSettings()])
    : [[], [], undefined];
  const jsonLd = critic && {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(`/critics/${critic.slug}`),
    name: `${critic.name} · ${SITE.name}`,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    about: { "@type": "Person", name: critic.name, ...(critic.publication && critic.bio_verified ? { worksFor: { "@type": "Organization", name: critic.publication } } : {}) },
    genre: "Satire",
  };
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <CriticView slug={slug} initial={critic} initialReceipts={receipts} initialReplies={replies} initialSettings={settings} />
    </>
  );
}
